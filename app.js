(() => {
  "use strict";

  /*
   * =========================================================
   * GOMOKU 1.3
   * Production polish / audio / interaction / game lifecycle
   * =========================================================
   *
   * Existing index.html compatible.
   *
   * Features:
   * - Human vs Human
   * - Human vs AI
   * - AI Worker
   * - AI OS
   * - Statistics
   * - Resume game
   * - LocalStorage
   * - Responsive Canvas
   * - Game timer
   * - Resume preview
   * - AI statistics
   * - Move animation
   * - Screen transitions
   * - Audio fallback
   * - Safari/iOS audio unlock
   * - Reduced motion support
   * - Service Worker update compatibility
   *
   * UI SFX:
   * https://uisfx.com/
   *
   * =========================================================
   */

  const CONFIG = {
    SIZE: 15,
    WIN: 5,

    EMPTY: 0,
    BLACK: 1,
    WHITE: 2,

    STORAGE_GAME: "gomoku-active-game-v5",
    STORAGE_STATS: "gomoku-stats-v5",
    STORAGE_SETTINGS: "gomoku-settings-v5",

    WORKER: "./ai-worker.js",

    /*
     * UI SFX is the primary sound engine.
     * Native Web Audio below is the local fallback.
     */
    SFX_MODULE: "https://esm.sh/uisfx",
    SFX_PACK: "organic",
    SFX_VOLUME: 0.30,

    AUDIO_COOLDOWN_MS: 42,

    MOVE_ANIMATION_MS: 145,

    COLORS: {
      board: "#e8d5ad",
      grid: "#765f43",
      star: "#5e4934",

      black: "#171717",
      blackHighlight: "#444444",

      white: "#f7f3e9",
      whiteShadow: "#c9c1b3",

      lastMove: "#b86f52",
      winning: "#d46d52"
    }
  };


  /*
   * =========================================================
   * AI CHARACTERS
   * =========================================================
   */

  const AI_CHARACTERS = {

    mio: {
      name: "Mio",
      initial: "M",
      description: "溫和、防守型",
      style: "defense",

      os: {
        thinking: [
          "嗯……先看看這裡。",
          "這一步要小心一點。",
          "慢慢來就好。"
        ],

        attack: [
          "這裡好像可以試試看。",
          "嗯，輪到我進攻了。",
          "這個位置不錯。"
        ],

        defend: [
          "這裡先防守比較好。",
          "不能讓你繼續連下去。",
          "先把這裡補起來。"
        ],

        danger: [
          "欸……這裡有點危險。",
          "差一點就被你抓到了。",
          "這一步不能大意。"
        ],

        winning: [
          "好像快結束了。",
          "再一步看看。",
          "這局快要分出勝負了。"
        ],

        losing: [
          "還有機會。",
          "嗯……不能放棄。",
          "我再想一下。"
        ],

        surprise: [
          "欸？",
          "原來是這樣。",
          "沒想到你會下這裡。"
        ]
      }
    },


    rin: {
      name: "Rin",
      initial: "R",
      description: "積極、進攻型",
      style: "attack",

      os: {
        thinking: [
          "等等……我看到一個機會。",
          "這次我要主動出擊。",
          "先算一下。"
        ],

        attack: [
          "來了！",
          "這裡就是機會！",
          "看我的！"
        ],

        defend: [
          "嘖，這招得先擋掉。",
          "先擋住你再說。",
          "這裡不能讓你連。"
        ],

        danger: [
          "欸？！等等。",
          "這有點危險欸。",
          "你這一步很狠喔。"
        ],

        winning: [
          "看到啦！",
          "這局我要拿下！",
          "差一步！"
        ],

        losing: [
          "還沒完啦！",
          "我才不會這麼容易輸。",
          "再來！"
        ],

        surprise: [
          "欸？！",
          "真的假的？",
          "你居然下這裡！"
        ]
      }
    },


    sora: {
      name: "Sora",
      initial: "S",
      description: "冷靜、平衡型",
      style: "balanced",

      os: {
        thinking: [
          "先觀察局勢。",
          "這一步有幾種可能。",
          "我需要重新評估。"
        ],

        attack: [
          "這裡值得進攻。",
          "我找到一個突破口。",
          "現在可以開始施壓。"
        ],

        defend: [
          "這個位置不能放掉。",
          "先處理你的威脅。",
          "這一步需要防守。"
        ],

        danger: [
          "局面開始變得複雜了。",
          "你的威脅正在增加。",
          "這一步很關鍵。"
        ],

        winning: [
          "局面對我有利。",
          "勝負快要決定了。",
          "再一步。"
        ],

        losing: [
          "還有反擊的可能。",
          "局面還沒有結束。",
          "我還能找到機會。"
        ],

        surprise: [
          "這一步出乎我的預料。",
          "原來你選擇了這裡。",
          "有意思。"
        ]
      }
    },


    kuro: {
      name: "Kuro",
      initial: "K",
      description: "狡猾、反擊型",
      style: "counter",

      os: {
        thinking: [
          "你以為我沒看到嗎？",
          "這一步值得再算一次。",
          "有趣……"
        ],

        attack: [
          "現在輪到我了。",
          "抓到空隙了。",
          "這裡會很有趣。"
        ],

        defend: [
          "先拆掉你的計畫。",
          "這個威脅太明顯了。",
          "我不會讓你這麼順。"
        ],

        danger: [
          "嘖……被你逼到了。",
          "這一步有點麻煩。",
          "不能再讓你走下去。"
        ],

        winning: [
          "你已經沒有多少空間了。",
          "看起來結束了。",
          "最後一步。"
        ],

        losing: [
          "別急著慶祝。",
          "局還沒結束。",
          "我還留著一手。"
        ],

        surprise: [
          "哦？",
          "這一步有意思。",
          "你竟然看到了這裡。"
        ]
      }
    }

  };


  /*
   * =========================================================
   * DIFFICULTY
   * =========================================================
   */

  const DIFFICULTY = {

    easy: {
      depth: 1,
      radius: 2,
      randomTop: 4,
      label: "初級",
      description: "先熟悉棋盤"
    },

    normal: {
      depth: 2,
      radius: 2,
      randomTop: 2,
      label: "中級",
      description: "開始讀你的棋"
    },

    hard: {
      depth: 3,
      radius: 2,
      randomTop: 1,
      label: "高級",
      description: "每一步都可能是陷阱"
    }

  };


  /*
   * =========================================================
   * SFX
   * =========================================================
   */

  const SFX = {

    hover: "hover",

    press: "press",
    release: "release",

    select: "select",
    deselect: "deselect",

    toggleOn: "toggle-on",
    toggleOff: "toggle-off",

    delete: "delete",

    undo: "undo",

    open: "open",
    close: "close",
    back: "back",

    success: "success",
    error: "error",
    warning: "warning",
    info: "info",

    start: "start",
    stop: "stop",

    progress: "progress-step",
    complete: "complete",

    stone: "select"

  };


  /*
   * =========================================================
   * DIRECTIONS
   * =========================================================
   */

  const DIRECTIONS = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1]
  ];


  /*
   * =========================================================
   * DOM
   * =========================================================
   */

  const DOM = {

    homeScreen:
      document.querySelector("#homeScreen"),

    setupScreen:
      document.querySelector("#setupScreen"),

    gameScreen:
      document.querySelector("#gameScreen"),

    resultScreen:
      document.querySelector("#resultScreen"),

    recordsScreen:
      document.querySelector("#recordsScreen"),

    settingsScreen:
      document.querySelector("#settingsScreen"),


    startButton:
      document.querySelector("#startButton"),

    recordsButton:
      document.querySelector("#recordsButton"),

    settingsButton:
      document.querySelector("#settingsButton"),


    resumeCard:
      document.querySelector("#resumeCard"),

    resumeText:
      document.querySelector("#resumeText"),

    resumeButton:
      document.querySelector("#resumeButton"),


    modeControl:
      document.querySelector("#modeControl"),

    difficultyGroup:
      document.querySelector("#difficultyGroup"),

    characterGroup:
      document.querySelector("#characterGroup"),

    characterControl:
      document.querySelector("#characterControl"),


    beginGameButton:
      document.querySelector("#beginGameButton"),


    turnStone:
      document.querySelector("#turnStone"),

    turnLabel:
      document.querySelector("#turnLabel"),

    turnPlayer:
      document.querySelector("#turnPlayer"),

    thinkingIndicator:
      document.querySelector("#thinkingIndicator"),


    aiOS:
      document.querySelector("#aiOS"),

    aiOSAvatar:
      document.querySelector("#aiOSAvatar"),

    aiOSName:
      document.querySelector("#aiOSName"),

    aiOSText:
      document.querySelector("#aiOSText"),


    boardCanvas:
      document.querySelector("#boardCanvas"),


    undoButton:
      document.querySelector("#undoButton"),

    restartButton:
      document.querySelector("#restartButton"),

    gameMenuButton:
      document.querySelector("#gameMenuButton"),


    resultMark:
      document.querySelector("#resultMark"),

    resultKicker:
      document.querySelector("#resultKicker"),

    resultTitle:
      document.querySelector("#resultTitle"),

    resultDescription:
      document.querySelector("#resultDescription"),

    playAgainButton:
      document.querySelector("#playAgainButton"),

    resultHomeButton:
      document.querySelector("#resultHomeButton"),


    statGames:
      document.querySelector("#statGames"),

    statWins:
      document.querySelector("#statWins"),

    statLosses:
      document.querySelector("#statLosses"),

    statDraws:
      document.querySelector("#statDraws"),

    recordList:
      document.querySelector("#recordList"),

    clearRecordsButton:
      document.querySelector("#clearRecordsButton"),


    languageSelect:
      document.querySelector("#languageSelect"),

    soundToggle:
      document.querySelector("#soundToggle"),

    motionToggle:
      document.querySelector("#motionToggle"),

    themeSelect:
      document.querySelector("#themeSelect"),


    backButton:
      document.querySelector("#backButton"),

    menuButton:
      document.querySelector("#menuButton"),

    toast:
      document.querySelector("#toast")

  };


  /*
   * =========================================================
   * STATE
   * =========================================================
   */

  const state = {

    screen: "home",

    mode: "ai",

    difficulty: "easy",

    character: "mio",

    playerSide: CONFIG.BLACK,

    aiSide: CONFIG.WHITE,


    board:
      createBoard(),

    currentPlayer:
      CONFIG.BLACK,

    moves: [],

    gameOver:
      false,

    winner:
      CONFIG.EMPTY,

    winningLine: [],

    lastMove:
      null,


    aiThinking:
      false,

    worker:
      null,

    workerRequest:
      0,

    aiTimer:
      null,


    boardSize:
      0,

    boardPadding:
      0,

    cellSize:
      0,

    dpr:
      1,


    moveAnimation:
      null,

    moveAnimationStartedAt:
      0,

    moveAnimationFrame:
      0,


    gameStartedAt:
      0,

    gameEndedAt:
      0,

    timerInterval:
      null,


    stats:
      loadStats(),

    settings:
      loadSettings()

  };


  /*
   * =========================================================
   * AUDIO STATE
   * =========================================================
   */

  let uiSFX =
    null;

  let sfxModulePromise =
    null;

  let sfxLoading =
    false;

  let audioUnlocked =
    false;

  let nativeAudioContext =
    null;

  let nativeMasterGain =
    null;

  const lastSfxAt =
    new Map();


  /*
   * =========================================================
   * UI TIMERS
   * =========================================================
   */

  let toastTimer =
    null;

  let resizeTimer =
    null;


  /*
   * =========================================================
   * POLISH CSS
   * =========================================================
   */

  function injectPolishStyles() {

    if (
      document.querySelector(
        "#gomoku-polish-styles"
      )
    ) {
      return;
    }


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "gomoku-polish-styles";


    style.textContent = `

      .gomoku-screen-enter {
        animation:
          gomokuScreenIn
          180ms
          cubic-bezier(.22,.8,.28,1)
          both;
      }

      @keyframes gomokuScreenIn {
        from {
          opacity: .01;
          transform: translateY(5px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }


      .gomoku-ai-text {
        animation:
          gomokuTextIn
          180ms
          ease
          both;
      }

      @keyframes gomokuTextIn {
        from {
          opacity: 0;
          transform: translateY(3px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }


      .gomoku-game-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;

        margin:
          0 0 10px;

        color:
          var(--muted);

        font-size:
          12px;

        line-height:
          1.4;
      }


      .gomoku-game-meta strong {
        color:
          var(--text);

        font-variant-numeric:
          tabular-nums;

        font-weight:
          700;
      }


      .gomoku-result-meta {
        display:
          grid;

        grid-template-columns:
          repeat(
            2,
            minmax(
              0,
              1fr
            )
          );

        gap:
          8px;

        margin-top:
          18px;
      }


      .gomoku-result-stat,
      .gomoku-ai-stat {
        padding:
          12px 14px;

        border:
          1px solid var(--line);

        border-radius:
          12px;

        background:
          var(--surface);
      }


      .gomoku-result-stat span,
      .gomoku-ai-stat span {
        display:
          block;

        color:
          var(--muted);

        font-size:
          11px;

        margin-bottom:
          3px;
      }


      .gomoku-result-stat strong,
      .gomoku-ai-stat strong {
        display:
          block;

        font-size:
          16px;

        font-variant-numeric:
          tabular-nums;
      }


      .gomoku-resume-preview {
        display:
          flex;

        align-items:
          center;

        gap:
          10px;

        margin-top:
          6px;

        color:
          var(--muted);

        font-size:
          12px;
      }


      .gomoku-mini-board {
        width:
          34px;

        height:
          34px;

        flex:
          0 0 34px;

        border-radius:
          8px;

        border:
          1px solid var(--line);

        background:
          linear-gradient(
            90deg,
            transparent 31%,
            rgba(80,60,40,.25) 32%,
            rgba(80,60,40,.25) 34%,
            transparent 35%
          ),
          linear-gradient(
            transparent 31%,
            rgba(80,60,40,.25) 32%,
            rgba(80,60,40,.25) 34%,
            transparent 35%
          ),
          var(--board);

        position:
          relative;

        overflow:
          hidden;
      }


      .gomoku-mini-stone {
        position:
          absolute;

        width:
          7px;

        height:
          7px;

        margin:
          -3.5px 0 0 -3.5px;

        border-radius:
          50%;

        box-shadow:
          0 1px 2px rgba(0,0,0,.18);
      }


      .gomoku-mini-stone.black {
        background:
          #202020;
      }


      .gomoku-mini-stone.white {
        background:
          #f7f3e9;

        border:
          1px solid rgba(0,0,0,.14);
      }


      .gomoku-difficulty-note {
        display:
          block;

        margin-top:
          3px;

        color:
          var(--muted);

        font-size:
          11px;
      }


      .gomoku-ai-stat-list {
        display:
          grid;

        gap:
          8px;

        margin:
          0 0 18px;
      }


      .gomoku-ai-stat-row {
        display:
          grid;

        grid-template-columns:
          1fr auto;

        gap:
          10px;

        align-items:
          center;

        padding:
          12px 14px;

        border:
          1px solid var(--line);

        border-radius:
          12px;

        background:
          var(--surface);
      }


      .gomoku-ai-stat-row strong {
        display:
          block;
      }


      .gomoku-ai-stat-row small {
        color:
          var(--muted);
      }


      .gomoku-pressable {
        -webkit-user-select:
          none;

        user-select:
          none;

        touch-action:
          manipulation;
      }


      .gomoku-motion-reduced *,
      .gomoku-motion-reduced *::before,
      .gomoku-motion-reduced *::after {
        animation-duration:
          1ms !important;

        transition-duration:
          1ms !important;

        scroll-behavior:
          auto !important;
      }


      @media (max-width: 480px) {

        .gomoku-result-meta {
          grid-template-columns:
            1fr 1fr;
        }

        .gomoku-game-meta {
          margin-bottom:
            7px;
        }

      }


      @media (prefers-reduced-motion: reduce) {

        .gomoku-screen-enter,
        .gomoku-ai-text {
          animation:
            none !important;
        }

      }

    `;


    document.head.appendChild(
      style
    );

  }


  /*
   * =========================================================
   * DYNAMIC UI
   * =========================================================
   */

  function ensureGameMeta() {

    const gameLayout =
      DOM.gameScreen?.querySelector(
        ".game-layout"
      );


    if (!gameLayout) {
      return;
    }


    if (
      document.querySelector(
        "#gomokuGameMeta"
      )
    ) {
      return;
    }


    const meta =
      document.createElement(
        "div"
      );


    meta.id =
      "gomokuGameMeta";

    meta.className =
      "gomoku-game-meta";


    meta.innerHTML = `
      <span>
        <span id="gomokuGameMode">
          人機
        </span>

        ·

        <span id="gomokuGameOpponent">
          Mio
        </span>
      </span>

      <strong id="gomokuTimer">
        00:00
      </strong>
    `;


    const status =
      gameLayout.querySelector(
        ".game-status"
      );


    if (status) {

      status.insertAdjacentElement(
        "afterend",
        meta
      );

    } else {

      gameLayout.prepend(
        meta
      );

    }

  }


  function ensureResultMeta() {

    const content =
      DOM.resultScreen?.querySelector(
        ".result-content"
      );


    if (
      !content ||
      document.querySelector(
        "#gomokuResultMeta"
      )
    ) {
      return;
    }


    const meta =
      document.createElement(
        "div"
      );


    meta.id =
      "gomokuResultMeta";

    meta.className =
      "gomoku-result-meta";


    meta.innerHTML = `
      <div class="gomoku-result-stat">

        <span>
          手數
        </span>

        <strong id="gomokuResultMoves">
          0
        </strong>

      </div>

      <div class="gomoku-result-stat">

        <span>
          用時
        </span>

        <strong id="gomokuResultTime">
          00:00
        </strong>

      </div>
    `;


    const actions =
      content.querySelector(
        ".result-actions"
      );


    if (actions) {

      actions.before(
        meta
      );

    } else {

      content.appendChild(
        meta
      );

    }

  }


  function ensureAIStats() {

    const content =
      DOM.recordsScreen?.querySelector(
        ".screen-content"
      );


    if (
      !content ||
      document.querySelector(
        "#gomokuAIStats"
      )
    ) {
      return;
    }


    const section =
      document.createElement(
        "section"
      );


    section.id =
      "gomokuAIStats";

    section.className =
      "gomoku-ai-stat-list";


    section.innerHTML = `
      <h3
        style="
          margin:4px 0 2px;
        "
      >
        AI 對手
      </h3>

      <div
        id="gomokuAIStatsRows"
      ></div>
    `;


    const list =
      DOM.recordList;


    if (list) {

      list.before(
        section
      );

    } else {

      content.appendChild(
        section
      );

    }

  }


  function ensureDifficultyNotes() {

    document
      .querySelectorAll(
        "[data-difficulty]"
      )
      .forEach(
        button => {

          const difficulty =
            DIFFICULTY[
              button.dataset.difficulty
            ];


          if (!difficulty) {
            return;
          }


          let note =
            button.querySelector(
              ".gomoku-difficulty-note"
            );


          if (!note) {

            note =
              document.createElement(
                "small"
              );

            note.className =
              "gomoku-difficulty-note";

            button.appendChild(
              note
            );

          }


          note.textContent =
            difficulty.description;

        }
      );

  }


  function ensureCharacterStats() {

    document
      .querySelectorAll(
        "[data-character]"
      )
      .forEach(
        button => {

          const id =
            button.dataset.character;

          const character =
            AI_CHARACTERS[id];


          if (!character) {
            return;
          }


          let note =
            button.querySelector(
              ".gomoku-character-note"
            );


          if (!note) {

            note =
              document.createElement(
                "small"
              );

            note.className =
              "gomoku-difficulty-note gomoku-character-note";

            button.appendChild(
              note
            );

          }


          const data =
            state.stats.ai[id] || {
              wins: 0,
              losses: 0
            };


          const total =
            data.wins +
            data.losses;


          const rate =
            total
              ? Math.round(
                  (
                    data.wins /
                    total
                  ) * 100
                )
              : 0;


          note.textContent =
            total
              ? `勝率 ${rate}% · ${total} 局`
              : "尚未對戰";

        }
      );

  }


  /*
   * =========================================================
   * BUTTON MICRO INTERACTIONS
   * =========================================================
   */

  function decorateButtons() {

    document
      .querySelectorAll(
        "button"
      )
      .forEach(
        button => {

          button.classList.add(
            "gomoku-pressable"
          );


          if (
            button.dataset.gomokuDecorated ===
            "1"
          ) {
            return;
          }


          button.dataset.gomokuDecorated =
            "1";


          button.addEventListener(
            "pointerdown",
            () => {

              if (
                !button.disabled
              ) {

                playSFX(
                  SFX.press,
                  {
                    cooldownMs:
                      80
                  }
                );

              }

            },
            {
              passive: true
            }
          );


          button.addEventListener(
            "pointerup",
            () => {

              if (
                !button.disabled
              ) {

                playSFX(
                  SFX.release,
                  {
                    cooldownMs:
                      80
                  }
                );

              }

            },
            {
              passive: true
            }
          );


          button.addEventListener(
            "pointercancel",
            () => {

              if (
                !button.disabled
              ) {

                playSFX(
                  SFX.release,
                  {
                    cooldownMs:
                      80
                  }
                );

              }

            },
            {
              passive: true
            }
          );

        }
      );

  }


  /*
   * =========================================================
   * AUDIO ENGINE
   * =========================================================
   */

  function loadUISFXModule() {

    if (
      !sfxModulePromise
    ) {

      sfxModulePromise =
        import(
          CONFIG.SFX_MODULE
        );

    }


    return sfxModulePromise;

  }


  async function loadUISFX() {

    if (
      uiSFX ||
      !state.settings.sound ||
      sfxLoading
    ) {

      return uiSFX;

    }


    sfxLoading =
      true;


    try {

      const module =
        await loadUISFXModule();


      const createUISFX =
        module.createUISFX ||
        module.default?.createUISFX;


      if (
        typeof createUISFX !==
        "function"
      ) {

        throw new Error(
          "UI SFX createUISFX unavailable."
        );

      }


      uiSFX =
        createUISFX({

          pack:
            CONFIG.SFX_PACK,

          volume:
            CONFIG.SFX_VOLUME

        });


      return uiSFX;

    } catch (error) {

      console.warn(
        "[Gomoku] UI SFX unavailable; native fallback enabled.",
        error
      );


      uiSFX =
        null;


      return null;

    } finally {

      sfxLoading =
        false;

    }

  }


  function ensureNativeAudio() {

    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;


    if (!AudioContextClass) {
      return null;
    }


    if (
      !nativeAudioContext
    ) {

      nativeAudioContext =
        new AudioContextClass();


      nativeMasterGain =
        nativeAudioContext.createGain();


      nativeMasterGain.gain.value =
        CONFIG.SFX_VOLUME;


      nativeMasterGain.connect(
        nativeAudioContext.destination
      );

    }


    return nativeAudioContext;

  }


  async function unlockBrowserAudio() {

    const context =
      ensureNativeAudio();


    if (!context) {

      audioUnlocked =
        true;

      return true;

    }


    try {

      if (
        context.state ===
        "suspended"
      ) {

        await context.resume();

      }


      const gain =
        context.createGain();


      gain.gain.value =
        0;


      const oscillator =
        context.createOscillator();


      oscillator.frequency.value =
        180;


      oscillator.connect(
        gain
      );


      gain.connect(
        context.destination
      );


      oscillator.start();


      oscillator.stop(
        context.currentTime +
        0.008
      );


      audioUnlocked =
        true;


      return true;

    } catch (error) {

      console.warn(
        "[Gomoku] Audio unlock failed.",
        error
      );


      return false;

    }

  }


  async function unlockAudio() {

    if (
      !state.settings.sound
    ) {

      return null;

    }


    await unlockBrowserAudio();


    /*
     * Load UI SFX only after a real user gesture.
     * This is important on iPad/iPhone Safari.
     */

    return loadUISFX();

  }


  function nativeCue(
    cue
  ) {

    const context =
      ensureNativeAudio();


    if (
      !context ||
      !nativeMasterGain ||
      !audioUnlocked
    ) {

      return;

    }


    const now =
      context.currentTime;


    const oscillator =
      context.createOscillator();


    const gain =
      context.createGain();


    let duration =
      0.07;

    let f1 =
      220;

    let f2 =
      220;

    let type =
      "sine";


    switch (cue) {

      case SFX.press:

        duration =
          0.045;

        f1 =
          170;

        f2 =
          125;

        type =
          "sine";

        break;


      case SFX.release:

        duration =
          0.035;

        f1 =
          145;

        f2 =
          175;

        type =
          "sine";

        break;


      case SFX.select:

        duration =
          0.065;

        f1 =
          300;

        f2 =
          390;

        type =
          "sine";

        break;


      case SFX.undo:

        duration =
          0.11;

        f1 =
          430;

        f2 =
          260;

        type =
          "triangle";

        break;


      case SFX.error:

        duration =
          0.12;

        f1 =
          190;

        f2 =
          120;

        type =
          "triangle";

        break;


      case SFX.warning:

        duration =
          0.13;

        f1 =
          250;

        f2 =
          210;

        type =
          "triangle";

        break;


      case SFX.success:

        duration =
          0.22;

        f1 =
          360;

        f2 =
          720;

        type =
          "sine";

        break;


      case SFX.complete:

        duration =
          0.20;

        f1 =
          300;

        f2 =
          540;

        type =
          "sine";

        break;


      case SFX.start:

        duration =
          0.16;

        f1 =
          220;

        f2 =
          440;

        type =
          "sine";

        break;


      case SFX.back:

        duration =
          0.08;

        f1 =
          310;

        f2 =
          220;

        type =
          "sine";

        break;


      case SFX.delete:

        duration =
          0.10;

        f1 =
          260;

        f2 =
          140;

        type =
          "triangle";

        break;


      default:

        duration =
          0.055;

        f1 =
          240;

        f2 =
          280;

        type =
          "sine";

    }


    const peak =
      cue === SFX.success
        ? 0.26
        : 0.18;


    oscillator.type =
      type;


    oscillator.frequency.setValueAtTime(
      f1,
      now
    );


    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(
        50,
        f2
      ),
      now +
      duration
    );


    gain.gain.setValueAtTime(
      0.0001,
      now
    );


    gain.gain.exponentialRampToValueAtTime(
      peak,
      now +
      Math.min(
        0.018,
        duration *
        0.25
      )
    );


    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now +
      duration
    );


    oscillator.connect(
      gain
    );


    gain.connect(
      nativeMasterGain
    );


    oscillator.start(
      now
    );


    oscillator.stop(
      now +
      duration +
      0.01
    );

  }


  async function playSFX(
    cue,
    options = {}
  ) {

    if (
      !state.settings.sound
    ) {

      return;

    }


    const now =
      performance.now();


    const cooldown =
      options.cooldownMs ??
      CONFIG.AUDIO_COOLDOWN_MS;


    const last =
      lastSfxAt.get(
        cue
      ) ||
      -Infinity;


    if (
      now -
      last <
      cooldown
    ) {

      return;

    }


    lastSfxAt.set(
      cue,
      now
    );


    const ui =
      uiSFX ||
      await unlockAudio();


    if (
      ui &&
      typeof ui.play ===
      "function"
    ) {

      try {

        ui.play(
          cue,
          {
            retrigger:
              options.retrigger ||
              "restart",

            cooldownMs:
              cooldown
          }
        );


        return;

      } catch (error) {

        console.warn(
          `[Gomoku] UI SFX "${cue}" failed; using native fallback.`,
          error
        );

      }

    }


    nativeCue(
      cue
    );

  }


  function setSoundEnabled(
    enabled
  ) {

    state.settings.sound =
      Boolean(enabled);


    saveSettings();


    if (
      !state.settings.sound
    ) {

      if (
        uiSFX?.stopAll
      ) {

        try {

          uiSFX.stopAll();

        } catch {}

      }


      return;

    }


    audioUnlocked =
      false;

  }


  /*
   * =========================================================
   * BOARD
   * =========================================================
   */

  function createBoard() {

    return Array.from(
      {
        length:
          CONFIG.SIZE
      },

      () =>
        Array(
          CONFIG.SIZE
        ).fill(
          CONFIG.EMPTY
        )
    );

  }


  function cloneBoard(
    board
  ) {

    return board.map(
      row =>
        row.slice()
    );

  }


  function isInside(
    row,
    col
  ) {

    return (
      row >= 0 &&
      row < CONFIG.SIZE &&
      col >= 0 &&
      col < CONFIG.SIZE
    );

  }


  function isBoardFull() {

    for (
      let row = 0;
      row < CONFIG.SIZE;
      row++
    ) {

      for (
        let col = 0;
        col < CONFIG.SIZE;
        col++
      ) {

        if (
          state.board[row][col] ===
          CONFIG.EMPTY
        ) {

          return false;

        }

      }

    }

    return true;

  }


  /*
   * =========================================================
   * WIN DETECTION
   * =========================================================
   */

  function getWinningLine(
    board,
    row,
    col,
    player
  ) {

    for (
      const [dr, dc]
      of DIRECTIONS
    ) {

      const line = [
        [row, col]
      ];


      let r =
        row +
        dr;

      let c =
        col +
        dc;


      while (
        isInside(
          r,
          c
        ) &&
        board[r][c] ===
        player
      ) {

        line.push(
          [r, c]
        );

        r +=
          dr;

        c +=
          dc;

      }


      r =
        row -
        dr;

      c =
        col -
        dc;


      while (
        isInside(
          r,
          c
        ) &&
        board[r][c] ===
        player
      ) {

        line.unshift(
          [r, c]
        );

        r -=
          dr;

        c -=
          dc;

      }


      if (
        line.length >=
        CONFIG.WIN
      ) {

        return line;

      }

    }


    return [];

  }


  /*
   * =========================================================
   * GAME TIMER
   * =========================================================
   */

  function resetTimer() {

    clearInterval(
      state.timerInterval
    );


    state.timerInterval =
      null;


    state.gameStartedAt =
      0;


    state.gameEndedAt =
      0;


    updateTimerUI(
      0
    );

  }


  function startTimer(
    startAt = Date.now()
  ) {

    clearInterval(
      state.timerInterval
    );


    state.gameStartedAt =
      startAt;


    state.gameEndedAt =
      0;


    updateTimerUI(
      elapsedSeconds()
    );


    state.timerInterval =
      window.setInterval(
        () => {

          if (
            !state.gameOver &&
            state.gameStartedAt
          ) {

            updateTimerUI(
              elapsedSeconds()
            );

          }

        },
        500
      );

  }


  function stopTimer() {

    clearInterval(
      state.timerInterval
    );


    state.timerInterval =
      null;


    if (
      !state.gameEndedAt
    ) {

      state.gameEndedAt =
        Date.now();

    }


    updateTimerUI(
      elapsedSeconds()
    );

  }


  function elapsedSeconds() {

    if (
      !state.gameStartedAt
    ) {

      return 0;

    }


    const end =
      state.gameEndedAt ||
      Date.now();


    return Math.max(
      0,
      Math.floor(
        (
          end -
          state.gameStartedAt
        ) /
        1000
      )
    );

  }


  function formatDuration(
    seconds
  ) {

    const total =
      Math.max(
        0,
        Math.floor(
          seconds ||
          0
        )
      );


    const minutes =
      Math.floor(
        total /
        60
      );


    const secs =
      total %
      60;


    return (
      String(
        minutes
      ).padStart(
        2,
        "0"
      ) +
      ":" +
      String(
        secs
      ).padStart(
        2,
        "0"
      )
    );

  }


  function updateTimerUI(
    seconds = elapsedSeconds()
  ) {

    const timer =
      document.querySelector(
        "#gomokuTimer"
      );


    if (timer) {

      timer.textContent =
        formatDuration(
          seconds
        );

    }

  }


  /*
   * =========================================================
   * MOVE ANIMATION
   * =========================================================
   */

  function beginMoveAnimation(
    row,
    col
  ) {

    if (
      !state.settings.motion ||
      prefersReducedMotion()
    ) {

      state.moveAnimation =
        null;

      return;

    }


    cancelMoveAnimation();


    state.moveAnimation = {
      row,
      col
    };


    state.moveAnimationStartedAt =
      performance.now();


    const frame =
      () => {

        if (
          !state.moveAnimation
        ) {

          return;

        }


        const elapsed =
          performance.now() -
          state.moveAnimationStartedAt;


        if (
          elapsed >=
          CONFIG.MOVE_ANIMATION_MS
        ) {

          state.moveAnimation =
            null;

          renderBoard();

          return;

        }


        renderBoard();


        state.moveAnimationFrame =
          requestAnimationFrame(
            frame
          );

      };


    state.moveAnimationFrame =
      requestAnimationFrame(
        frame
      );

  }


  function cancelMoveAnimation() {

    if (
      state.moveAnimationFrame
    ) {

      cancelAnimationFrame(
        state.moveAnimationFrame
      );


      state.moveAnimationFrame =
        0;

    }


    state.moveAnimation =
      null;

  }


  function getMoveScale(
    row,
    col
  ) {

    if (
      !state.moveAnimation
    ) {

      return 1;

    }


    if (
      state.moveAnimation.row !==
      row ||
      state.moveAnimation.col !==
      col
    ) {

      return 1;

    }


    const elapsed =
      Math.min(
        1,
        (
          performance.now() -
          state.moveAnimationStartedAt
        ) /
        CONFIG.MOVE_ANIMATION_MS
      );


    const eased =
      1 -
      Math.pow(
        1 -
        elapsed,
        3
      );


    return (
      0.72 +
      eased *
      0.28
    );

  }


  /*
   * =========================================================
   * GAME LIFECYCLE
   * =========================================================
   */

  function resetBoard(
    {
      keepTimer = false
    } = {}
  ) {

    state.board =
      createBoard();


    state.currentPlayer =
      CONFIG.BLACK;


    state.moves =
      [];


    state.gameOver =
      false;


    state.winner =
      CONFIG.EMPTY;


    state.winningLine =
      [];


    state.lastMove =
      null;


    state.aiThinking =
      false;


    state.workerRequest++;


    clearAIWait();


    stopWorker();


    cancelMoveAnimation();


    if (!keepTimer) {

      resetTimer();

    }


    clearActiveGame();


    renderBoard();


    updateTurnUI();

  }


  function startNewGame() {

    unlockAudio();


    resetBoard();


    state.gameStartedAt =
      Date.now();


    startTimer(
      state.gameStartedAt
    );


    showScreen(
      "game"
    );


    updateAIOS(
      "thinking"
    );


    playSFX(
      SFX.start
    );


    saveActiveGame();


    if (
      state.mode === "ai" &&
      state.currentPlayer ===
      state.aiSide
    ) {

      scheduleAI();

    }

  }


  function playMove(
    row,
    col
  ) {

    if (
      state.gameOver ||
      state.aiThinking
    ) {

      return false;

    }


    if (
      !isInside(
        row,
        col
      ) ||
      state.board[row][col] !==
      CONFIG.EMPTY
    ) {

      playSFX(
        SFX.error
      );

      return false;

    }


    if (
      state.mode === "ai" &&
      state.currentPlayer ===
      state.aiSide
    ) {

      return false;

    }


    const player =
      state.currentPlayer;


    state.board[row][col] =
      player;


    const move = {
      row,
      col,
      player
    };


    state.moves.push(
      move
    );


    state.lastMove =
      move;


    playSFX(
      SFX.stone,
      {
        cooldownMs:
          28
      }
    );


    beginMoveAnimation(
      row,
      col
    );


    const winningLine =
      getWinningLine(
        state.board,
        row,
        col,
        player
      );


    if (
      winningLine.length
    ) {

      finishGame(
        player,
        winningLine
      );


      return true;

    }


    if (
      isBoardFull()
    ) {

      finishDraw();


      return true;

    }


    state.currentPlayer =
      opponent(
        player
      );


    saveActiveGame();


    renderBoard();


    updateTurnUI();


    if (
      state.mode === "ai" &&
      state.currentPlayer ===
      state.aiSide
    ) {

      scheduleAI();

    } else {

      updateAIOS(
        "thinking"
      );

    }


    return true;

  }


  function playAIMove(
    row,
    col
  ) {

    if (
      state.gameOver ||
      !state.aiThinking
    ) {

      return false;

    }


    if (
      !isInside(
        row,
        col
      ) ||
      state.board[row][col] !==
      CONFIG.EMPTY
    ) {

      state.aiThinking =
        false;


      updateTurnUI();


      return false;

    }


    const player =
      state.currentPlayer;


    if (
      player !==
      state.aiSide
    ) {

      state.aiThinking =
        false;


      updateTurnUI();


      return false;

    }


    state.board[row][col] =
      player;


    const move = {
      row,
      col,
      player
    };


    state.moves.push(
      move
    );


    state.lastMove =
      move;


    state.aiThinking =
      false;


    playSFX(
      SFX.stone,
      {
        cooldownMs:
          28
      }
    );


    beginMoveAnimation(
      row,
      col
    );


    const winningLine =
      getWinningLine(
        state.board,
        row,
        col,
        player
      );


    if (
      winningLine.length
    ) {

      finishGame(
        player,
        winningLine
      );


      return true;

    }


    if (
      isBoardFull()
    ) {

      finishDraw();


      return true;

    }


    state.currentPlayer =
      opponent(
        player
      );


    saveActiveGame();


    renderBoard();


    updateTurnUI();


    updateAIOS(
      classifyBoardForOS()
    );


    return true;

  }


  /*
   * =========================================================
   * UNDO
   * =========================================================
   */

  function undoMove() {

    if (
      state.gameOver ||
      state.aiThinking ||
      state.moves.length === 0
    ) {

      return;

    }


    unlockAudio();


    if (
      state.mode ===
      "local"
    ) {

      const move =
        state.moves.pop();


      state.board[
        move.row
      ][
        move.col
      ] =
        CONFIG.EMPTY;


      state.currentPlayer =
        move.player;

    } else {

      const aiMove =
        state.moves.pop();


      state.board[
        aiMove.row
      ][
        aiMove.col
      ] =
        CONFIG.EMPTY;


      if (
        state.moves.length
      ) {

        const playerMove =
          state.moves.pop();


        state.board[
          playerMove.row
        ][
          playerMove.col
        ] =
          CONFIG.EMPTY;


        state.currentPlayer =
          playerMove.player;

      } else {

        state.currentPlayer =
          state.playerSide;

      }

    }


    state.lastMove =
      state.moves[
        state.moves.length - 1
      ] ||
      null;


    state.gameOver =
      false;


    state.winner =
      CONFIG.EMPTY;


    state.winningLine =
      [];


    state.gameEndedAt =
      0;


    if (
      !state.gameStartedAt
    ) {

      startTimer(
        Date.now()
      );

    }


    clearActiveGame();


    saveActiveGame();


    renderBoard();


    updateTurnUI();


    updateAIOS(
      "thinking"
    );


    playSFX(
      SFX.undo
    );

  }


  /*
   * =========================================================
   * FINISH
   * =========================================================
   */

  function finishGame(
    winner,
    winningLine
  ) {

    state.gameOver =
      true;


    state.winner =
      winner;


    state.winningLine =
      winningLine ||
      [];


    state.aiThinking =
      false;


    stopWorker();


    clearAIWait();


    stopTimer();


    clearActiveGame();


    renderBoard();


    /*
     * For statistics, "win/loss" always means
     * the user's result.
     */
    const result =
      winner ===
      state.playerSide
        ? "win"
        : "loss";


    recordResult(
      result
    );


    playSFX(
      result === "win"
        ? SFX.success
        : SFX.error,
      {
        cooldownMs:
          250
      }
    );


    showResult(
      state.mode ===
      "local"
        ? "local"
        : result
    );

  }


  function finishDraw() {

    state.gameOver =
      true;


    state.winner =
      CONFIG.EMPTY;


    state.winningLine =
      [];


    state.aiThinking =
      false;


    stopWorker();


    clearAIWait();


    stopTimer();


    clearActiveGame();


    renderBoard();


    recordResult(
      "draw"
    );


    playSFX(
      SFX.complete,
      {
        cooldownMs:
          250
      }
    );


    showResult(
      "draw"
    );

  }


  /*
   * =========================================================
   * AI WORKER
   * =========================================================
   */

  function createWorker() {

    if (
      typeof Worker ===
      "undefined"
    ) {

      return null;

    }


    try {

      return new Worker(
        CONFIG.WORKER
      );

    } catch (error) {

      console.warn(
        "[Gomoku] Worker unavailable.",
        error
      );


      return null;

    }

  }


  function stopWorker() {

    if (
      state.worker
    ) {

      try {

        state.worker.terminate();

      } catch {}


      state.worker =
        null;

    }

  }


  function clearAIWait() {

    if (
      state.aiTimer
    ) {

      clearTimeout(
        state.aiTimer
      );


      state.aiTimer =
        null;

    }

  }


  function scheduleAI() {

    if (
      state.mode !==
      "ai" ||
      state.gameOver ||
      state.currentPlayer !==
      state.aiSide ||
      state.aiThinking
    ) {

      return;

    }


    state.aiThinking =
      true;


    state.workerRequest++;


    const requestId =
      state.workerRequest;


    updateTurnUI();


    updateAIOS(
      "thinking"
    );


    const delay =
      state.difficulty ===
      "easy"
        ? 340
        : state.difficulty ===
          "normal"
          ? 480
          : 620;


    clearAIWait();


    state.aiTimer =
      window.setTimeout(
        () => {

          state.aiTimer =
            null;


          if (
            state.gameOver ||
            state.currentPlayer !==
            state.aiSide ||
            !state.aiThinking ||
            requestId !==
            state.workerRequest
          ) {

            return;

          }


          requestAIMove(
            requestId
          );

        },
        delay
      );

  }


  function requestAIMove(
    requestId
  ) {

    const config =
      DIFFICULTY[
        state.difficulty
      ];


    const character =
      AI_CHARACTERS[
        state.character
      ];


    const worker =
      createWorker();


    if (
      !worker
    ) {

      fallbackAIMove();


      return;

    }


    state.worker =
      worker;


    worker.onmessage =
      event => {

        if (
          requestId !==
          state.workerRequest
        ) {

          try {

            worker.terminate();

          } catch {}


          return;

        }


        const {
          row,
          col
        } =
          event.data ||
          {};


        try {

          worker.terminate();

        } catch {}


        if (
          state.worker ===
          worker
        ) {

          state.worker =
            null;

        }


        if (
          row == null ||
          col == null
        ) {

          fallbackAIMove();


          return;

        }


        playAIMove(
          row,
          col
        );

      };


    worker.onerror =
      () => {

        try {

          worker.terminate();

        } catch {}


        if (
          state.worker ===
          worker
        ) {

          state.worker =
            null;

        }


        fallbackAIMove();

      };


    try {

      worker.postMessage({

        board:
          cloneBoard(
            state.board
          ),

        player:
          state.aiSide,

        config: {

          depth:
            config.depth,

          radius:
            config.radius,

          randomTop:
            config.randomTop,

          style:
            character.style

        },

        thinkTime:
          Date.now()

      });

    } catch {

      try {

        worker.terminate();

      } catch {}


      state.worker =
        null;


      fallbackAIMove();

    }

  }


  function fallbackAIMove() {

    if (
      state.gameOver ||
      state.currentPlayer !==
      state.aiSide
    ) {

      state.aiThinking =
        false;


      updateTurnUI();


      return;

    }


    const move =
      findFallbackMove();


    state.aiTimer =
      window.setTimeout(
        () => {

          state.aiTimer =
            null;


          if (
            state.gameOver ||
            state.currentPlayer !==
            state.aiSide
          ) {

            state.aiThinking =
              false;


            updateTurnUI();


            return;

          }


          playAIMove(
            move.row,
            move.col
          );

        },
        220
      );

  }


  function findFallbackMove() {

    const candidates =
      getCandidateMoves(
        state.board,
        2
      );


    const win =
      findImmediateWin(
        state.board,
        state.aiSide,
        candidates
      );


    if (
      win
    ) {

      return win;

    }


    const block =
      findImmediateWin(
        state.board,
        state.playerSide,
        candidates
      );


    if (
      block
    ) {

      return block;

    }


    let best =
      candidates[0];


    let bestScore =
      -Infinity;


    for (
      const move of candidates
    ) {

      let score =
        evaluateLocalMove(
          state.board,
          move.row,
          move.col,
          state.aiSide
        );


      score +=
        evaluateLocalMove(
          state.board,
          move.row,
          move.col,
          state.playerSide
        ) *
        0.9;


      score +=
        centerScore(
          move.row,
          move.col
        );


      if (
        score >
        bestScore
      ) {

        bestScore =
          score;


        best =
          move;

      }

    }


    return (
      best ||
      {
        row: 7,
        col: 7
      }
    );

  }


  function getCandidateMoves(
    board,
    radius
  ) {

    const occupied =
      [];


    for (
      let row = 0;
      row < CONFIG.SIZE;
      row++
    ) {

      for (
        let col = 0;
        col < CONFIG.SIZE;
        col++
      ) {

        if (
          board[row][col] !==
          CONFIG.EMPTY
        ) {

          occupied.push({
            row,
            col
          });

        }

      }

    }


    if (
      !occupied.length
    ) {

      return [
        {
          row: 7,
          col: 7
        }
      ];

    }


    const set =
      new Set();


    for (
      const point of occupied
    ) {

      for (
        let dr = -radius;
        dr <= radius;
        dr++
      ) {

        for (
          let dc = -radius;
          dc <= radius;
          dc++
        ) {

          const row =
            point.row +
            dr;


          const col =
            point.col +
            dc;


          if (
            !isInside(
              row,
              col
            )
          ) {

            continue;

          }


          if (
            board[row][col] !==
            CONFIG.EMPTY
          ) {

            continue;

          }


          set.add(
            `${row},${col}`
          );

        }

      }

    }


    return [
      ...set
    ].map(
      key => {

        const [
          row,
          col
        ] =
          key
            .split(",")
            .map(Number);


        return {
          row,
          col
        };

      }
    );

  }


  function findImmediateWin(
    board,
    player,
    candidates
  ) {

    for (
      const move of candidates
    ) {

      board[
        move.row
      ][
        move.col
      ] =
        player;


      const win =
        getWinningLine(
          board,
          move.row,
          move.col,
          player
        ).length >
        0;


      board[
        move.row
      ][
        move.col
      ] =
        CONFIG.EMPTY;


      if (
        win
      ) {

        return move;

      }

    }


    return null;

  }


  function evaluateLocalMove(
    board,
    row,
    col,
    player
  ) {

    if (
      board[row][col] !==
      CONFIG.EMPTY
    ) {

      return -Infinity;

    }


    let score =
      0;


    for (
      const [dr, dc]
      of DIRECTIONS
    ) {

      const before =
        countDirection(
          board,
          row,
          col,
          dr,
          dc,
          player
        );


      const after =
        countDirection(
          board,
          row,
          col,
          -dr,
          -dc,
          player
        );


      score +=
        lineValue(
          before +
          after +
          1
        );

    }


    return score;

  }


  function countDirection(
    board,
    row,
    col,
    dr,
    dc,
    player
  ) {

    let count =
      0;


    let r =
      row +
      dr;


    let c =
      col +
      dc;


    while (
      isInside(
        r,
        c
      ) &&
      board[r][c] ===
      player
    ) {

      count++;


      r +=
        dr;


      c +=
        dc;

    }


    return count;

  }


  function lineValue(
    count
  ) {

    if (
      count >= 5
    ) {

      return 100000;

    }


    if (
      count === 4
    ) {

      return 10000;

    }


    if (
      count === 3
    ) {

      return 1000;

    }


    if (
      count === 2
    ) {

      return 100;

    }


    return 10;

  }


  function centerScore(
    row,
    col
  ) {

    const center =
      (
        CONFIG.SIZE -
        1
      ) /
      2;


    return (
      20 -
      Math.abs(
        row -
        center
      ) -
      Math.abs(
        col -
        center
      )
    );

  }


  /*
   * =========================================================
   * AI OS
   * =========================================================
   */

  function updateAIOS(
    type
  ) {

    if (
      state.mode !==
      "ai"
    ) {

      DOM.aiOS.hidden =
        true;


      return;

    }


    const character =
      AI_CHARACTERS[
        state.character
      ];


    DOM.aiOS.hidden =
      false;


    DOM.aiOSAvatar.textContent =
      character.initial;


    DOM.aiOSName.textContent =
      character.name;


    const pool =
      character.os[type] ||
      character.os.thinking;


    const text =
      randomFrom(
        pool
      );


    if (
      DOM.aiOSText.textContent !==
      text
    ) {

      DOM.aiOSText.classList.remove(
        "gomoku-ai-text"
      );


      void DOM.aiOSText.offsetWidth;


      DOM.aiOSText.classList.add(
        "gomoku-ai-text"
      );

    }


    DOM.aiOSText.textContent =
      text;

  }


  function randomFrom(
    array
  ) {

    return array[
      Math.floor(
        Math.random() *
        array.length
      )
    ];

  }


  function classifyBoardForOS() {

    if (
      state.gameOver
    ) {

      return "winning";

    }


    const aiThreat =
      strongestLocalThreat(
        state.aiSide
      );


    const playerThreat =
      strongestLocalThreat(
        state.playerSide
      );


    if (
      playerThreat >= 4
    ) {

      return "danger";

    }


    if (
      aiThreat >= 4
    ) {

      return "winning";

    }


    if (
      playerThreat >
      aiThreat
    ) {

      return "defend";

    }


    if (
      aiThreat >
      playerThreat
    ) {

      return "attack";

    }


    return "thinking";

  }


  function strongestLocalThreat(
    player
  ) {

    let best =
      0;


    for (
      let row = 0;
      row < CONFIG.SIZE;
      row++
    ) {

      for (
        let col = 0;
        col < CONFIG.SIZE;
        col++
      ) {

        if (
          state.board[row][col] !==
          CONFIG.EMPTY
        ) {

          continue;

        }


        for (
          const [dr, dc]
          of DIRECTIONS
        ) {

          const a =
            countDirection(
              state.board,
              row,
              col,
              dr,
              dc,
              player
            );


          const b =
            countDirection(
              state.board,
              row,
              col,
              -dr,
              -dc,
              player
            );


          best =
            Math.max(
              best,
              a +
              b +
              1
            );

        }

      }

    }


    return best;

  }


  /*
   * =========================================================
   * CANVAS
   * =========================================================
   */

  function resizeCanvas() {

    const canvas =
      DOM.boardCanvas;


    const wrapper =
      canvas?.parentElement;


    if (
      !canvas ||
      !wrapper
    ) {

      return;

    }


    const rect =
      wrapper.getBoundingClientRect();


    const available =
      Math.min(
        rect.width,
        Math.max(
          280,
          window.innerHeight *
          0.64
        )
      );


    const size =
      Math.floor(
        Math.max(
          280,
          Math.min(
            available,
            760
          )
        )
      );


    state.boardSize =
      size;


    state.dpr =
      Math.min(
        window.devicePixelRatio ||
        1,
        3
      );


    canvas.width =
      Math.floor(
        size *
        state.dpr
      );


    canvas.height =
      Math.floor(
        size *
        state.dpr
      );


    canvas.style.width =
      `${size}px`;


    canvas.style.height =
      `${size}px`;


    state.boardPadding =
      size *
      0.075;


    state.cellSize =
      (
        size -
        state.boardPadding *
        2
      ) /
      (
        CONFIG.SIZE -
        1
      );


    const ctx =
      canvas.getContext(
        "2d"
      );


    ctx.setTransform(
      state.dpr,
      0,
      0,
      state.dpr,
      0,
      0
    );


    renderBoard();

  }


  function boardPoint(
    row,
    col
  ) {

    return {

      x:
        state.boardPadding +
        col *
        state.cellSize,

      y:
        state.boardPadding +
        row *
        state.cellSize

    };

  }


  function pointerToCell(
    event
  ) {

    const canvas =
      DOM.boardCanvas;


    const rect =
      canvas.getBoundingClientRect();


    const x =
      event.clientX -
      rect.left;


    const y =
      event.clientY -
      rect.top;


    const col =
      Math.round(
        (
          x -
          state.boardPadding
        ) /
        state.cellSize
      );


    const row =
      Math.round(
        (
          y -
          state.boardPadding
        ) /
        state.cellSize
      );


    if (
      !isInside(
        row,
        col
      )
    ) {

      return null;

    }


    const point =
      boardPoint(
        row,
        col
      );


    const distance =
      Math.hypot(
        point.x -
        x,
        point.y -
        y
      );


    if (
      distance >
      state.cellSize *
      0.48
    ) {

      return null;

    }


    return {
      row,
      col
    };

  }


  function renderBoard() {

    const canvas =
      DOM.boardCanvas;


    if (
      !canvas ||
      !state.boardSize
    ) {

      return;

    }


    const ctx =
      canvas.getContext(
        "2d"
      );


    const size =
      state.boardSize;


    ctx.clearRect(
      0,
      0,
      size,
      size
    );


    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        0,
        size
      );


    gradient.addColorStop(
      0,
      "#ecd9ae"
    );


    gradient.addColorStop(
      1,
      "#dfc38e"
    );


    ctx.fillStyle =
      gradient;


    ctx.fillRect(
      0,
      0,
      size,
      size
    );


    ctx.strokeStyle =
      "rgba(74, 54, 32, 0.28)";


    ctx.lineWidth =
      1.5;


    ctx.strokeRect(
      0.75,
      0.75,
      size -
      1.5,
      size -
      1.5
    );


    ctx.beginPath();


    ctx.strokeStyle =
      CONFIG.COLORS.grid;


    ctx.lineWidth =
      1;


    for (
      let index = 0;
      index < CONFIG.SIZE;
      index++
    ) {

      const p =
        state.boardPadding +
        index *
        state.cellSize;


      ctx.moveTo(
        state.boardPadding,
        p
      );


      ctx.lineTo(
        size -
        state.boardPadding,
        p
      );


      ctx.moveTo(
        p,
        state.boardPadding
      );


      ctx.lineTo(
        p,
        size -
        state.boardPadding
      );

    }


    ctx.stroke();


    const stars = [
      [3, 3],
      [3, 7],
      [3, 11],
      [7, 3],
      [7, 7],
      [7, 11],
      [11, 3],
      [11, 7],
      [11, 11]
    ];


    ctx.fillStyle =
      CONFIG.COLORS.star;


    for (
      const [row, col]
      of stars
    ) {

      const point =
        boardPoint(
          row,
          col
        );


      ctx.beginPath();


      ctx.arc(
        point.x,
        point.y,
        Math.max(
          2,
          state.cellSize *
          0.07
        ),
        0,
        Math.PI *
        2
      );


      ctx.fill();

    }


    if (
      state.winningLine.length >=
      CONFIG.WIN
    ) {

      ctx.save();


      ctx.strokeStyle =
        CONFIG.COLORS.winning;


      ctx.lineWidth =
        Math.max(
          4,
          state.cellSize *
          0.13
        );


      ctx.lineCap =
        "round";


      ctx.globalAlpha =
        0.78;


      const first =
        boardPoint(
          state.winningLine[0][0],
          state.winningLine[0][1]
        );


      const lastIndex =
        state.winningLine.length -
        1;


      const last =
        boardPoint(
          state.winningLine[
            lastIndex
          ][0],
          state.winningLine[
            lastIndex
          ][1]
        );


      ctx.beginPath();


      ctx.moveTo(
        first.x,
        first.y
      );


      ctx.lineTo(
        last.x,
        last.y
      );


      ctx.stroke();


      ctx.restore();

    }


    for (
      let row = 0;
      row < CONFIG.SIZE;
      row++
    ) {

      for (
        let col = 0;
        col < CONFIG.SIZE;
        col++
      ) {

        const player =
          state.board[row][col];


        if (
          player ===
          CONFIG.EMPTY
        ) {

          continue;

        }


        drawStone(
          ctx,
          row,
          col,
          player,
          getMoveScale(
            row,
            col
          )
        );

      }

    }


    if (
      state.lastMove
    ) {

      const point =
        boardPoint(
          state.lastMove.row,
          state.lastMove.col
        );


      ctx.save();


      ctx.strokeStyle =
        CONFIG.COLORS.lastMove;


      ctx.lineWidth =
        2;


      ctx.beginPath();


      ctx.arc(
        point.x,
        point.y,
        Math.max(
          4,
          state.cellSize *
          0.16
        ),
        0,
        Math.PI *
        2
      );


      ctx.stroke();


      ctx.restore();

    }

  }


  function drawStone(
    ctx,
    row,
    col,
    player,
    scale = 1
  ) {

    const point =
      boardPoint(
        row,
        col
      );


    const radius =
      state.cellSize *
      0.43 *
      scale;


    ctx.save();


    ctx.beginPath();


    ctx.arc(
      point.x +
        radius *
        0.10,
      point.y +
        radius *
        0.13,
      radius,
      0,
      Math.PI *
      2
    );


    ctx.fillStyle =
      "rgba(50, 34, 20, 0.22)";


    ctx.fill();


    const gradient =
      ctx.createRadialGradient(
        point.x -
          radius *
          0.3,
        point.y -
          radius *
          0.35,
        Math.max(
          1,
          radius *
          0.05
        ),
        point.x,
        point.y,
        radius
      );


    if (
      player ===
      CONFIG.BLACK
    ) {

      gradient.addColorStop(
        0,
        "#575757"
      );


      gradient.addColorStop(
        0.35,
        "#222222"
      );


      gradient.addColorStop(
        1,
        "#090909"
      );

    } else {

      gradient.addColorStop(
        0,
        "#ffffff"
      );


      gradient.addColorStop(
        0.45,
        "#f7f3e9"
      );


      gradient.addColorStop(
        1,
        "#c8c0b2"
      );

    }


    ctx.beginPath();


    ctx.arc(
      point.x,
      point.y,
      radius,
      0,
      Math.PI *
      2
    );


    ctx.fillStyle =
      gradient;


    ctx.fill();


    ctx.strokeStyle =
      player ===
      CONFIG.BLACK
        ? "rgba(255,255,255,0.08)"
        : "rgba(75,60,45,0.28)";


    ctx.lineWidth =
      1;


    ctx.stroke();


    ctx.restore();

  }


  /*
   * =========================================================
   * INPUT
   * =========================================================
   */

  function setupBoardInput() {

    const canvas =
      DOM.boardCanvas;


    if (
      !canvas
    ) {

      return;

    }


    canvas.addEventListener(
      "pointerdown",
      event => {

        event.preventDefault();


        unlockAudio();


        try {

          canvas.setPointerCapture?.(
            event.pointerId
          );

        } catch {}


        if (
          state.gameOver ||
          state.aiThinking
        ) {

          return;

        }


        if (
          state.mode === "ai" &&
          state.currentPlayer ===
          state.aiSide
        ) {

          return;

        }


        const cell =
          pointerToCell(
            event
          );


        if (!cell) {

          return;

        }


        playMove(
          cell.row,
          cell.col
        );

      },
      {
        passive: false
      }
    );


    canvas.addEventListener(
      "keydown",
      event => {

        if (
          event.key !==
          "Enter" &&
          event.key !==
          " "
        ) {

          return;

        }


        event.preventDefault();


        unlockAudio();

      }
    );

  }


  /*
   * =========================================================
   * TURN UI
   * =========================================================
   */

  function updateTurnUI() {

    const current =
      state.currentPlayer;


    const isAI =
      state.mode === "ai" &&
      current ===
      state.aiSide;


    DOM.turnStone.classList.toggle(
      "black-stone",
      current ===
      CONFIG.BLACK
    );


    DOM.turnStone.classList.toggle(
      "white-stone",
      current ===
      CONFIG.WHITE
    );


    if (
      state.gameOver
    ) {

      DOM.turnLabel.textContent =
        "棋局結束";

    } else if (
      state.mode ===
      "local"
    ) {

      DOM.turnLabel.textContent =
        current ===
        CONFIG.BLACK
          ? "黑棋回合"
          : "白棋回合";

    } else if (
      isAI
    ) {

      DOM.turnLabel.textContent =
        "AI 回合";

    } else {

      DOM.turnLabel.textContent =
        "你的回合";

    }


    DOM.turnPlayer.textContent =
      current ===
      CONFIG.BLACK
        ? "黑棋"
        : "白棋";


    DOM.thinkingIndicator.hidden =
      !state.aiThinking;


    DOM.undoButton.disabled =
      state.moves.length ===
      0 ||
      state.aiThinking ||
      state.gameOver;


    updateGameMeta();

  }


  function updateGameMeta() {

    const mode =
      document.querySelector(
        "#gomokuGameMode"
      );


    const opponentElement =
      document.querySelector(
        "#gomokuGameOpponent"
      );


    if (
      mode
    ) {

      mode.textContent =
        state.mode ===
        "ai"
          ? "人機"
          : "雙人";

    }


    if (
      opponentElement
    ) {

      opponentElement.textContent =
        state.mode ===
        "ai"
          ? AI_CHARACTERS[
              state.character
            ].name
          : "本地對戰";

    }


    updateTimerUI();

  }


  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  function showScreen(
    name
  ) {

    const screens = {

      home:
        DOM.homeScreen,

      setup:
        DOM.setupScreen,

      game:
        DOM.gameScreen,

      result:
        DOM.resultScreen,

      records:
        DOM.recordsScreen,

      settings:
        DOM.settingsScreen

    };


    Object.entries(
      screens
    ).forEach(
      ([key, screen]) => {

        if (!screen) {

          return;

        }


        const active =
          key ===
          name;


        screen.classList.toggle(
          "active",
          active
        );


        if (
          active &&
          state.settings.motion &&
          !prefersReducedMotion()
        ) {

          screen.classList.remove(
            "gomoku-screen-enter"
          );


          void screen.offsetWidth;


          screen.classList.add(
            "gomoku-screen-enter"
          );

        }

      }
    );


    state.screen =
      name;


    if (
      name ===
      "game"
    ) {

      requestAnimationFrame(
        resizeCanvas
      );

    }


    if (
      name ===
      "records"
    ) {

      renderStats();

    }


    if (
      name ===
      "home"
    ) {

      checkResumeGame();

    }

  }


  function setupNavigation() {

    DOM.startButton.addEventListener(
      "click",
      async () => {

        await unlockAudio();


        playSFX(
          SFX.open
        );


        showScreen(
          "setup"
        );

      }
    );


    DOM.recordsButton.addEventListener(
      "click",
      async () => {

        await unlockAudio();


        playSFX(
          SFX.open
        );


        renderStats();


        showScreen(
          "records"
        );

      }
    );


    DOM.settingsButton.addEventListener(
      "click",
      async () => {

        await unlockAudio();


        playSFX(
          SFX.open
        );


        showScreen(
          "settings"
        );

      }
    );


    DOM.resumeButton.addEventListener(
      "click",
      async () => {

        await unlockAudio();


        playSFX(
          SFX.start
        );


        resumeGame();

      }
    );


    DOM.playAgainButton.addEventListener(
      "click",
      async () => {

        await unlockAudio();


        startNewGame();

      }
    );


    DOM.resultHomeButton.addEventListener(
      "click",
      async () => {

        await unlockAudio();


        playSFX(
          SFX.back
        );


        showScreen(
          "home"
        );

      }
    );


    DOM.gameMenuButton.addEventListener(
      "click",
      async () => {

        await unlockAudio();


        playSFX(
          SFX.back
        );


        saveActiveGame();


        showScreen(
          "home"
        );

      }
    );


    DOM.restartButton.addEventListener(
      "click",
      async () => {

        await unlockAudio();


        playSFX(
          SFX.start
        );


        startNewGame();

      }
    );


    DOM.undoButton.addEventListener(
      "click",
      async () => {

        await unlockAudio();


        undoMove();

      }
    );


    DOM.backButton.addEventListener(
      "click",
      async () => {

        await unlockAudio();


        playSFX(
          SFX.back
        );


        if (
          state.screen ===
          "home"
        ) {

          return;

        }


        if (
          state.screen ===
          "game"
        ) {

          saveActiveGame();

        }


        showScreen(
          "home"
        );

      }
    );


    DOM.menuButton.addEventListener(
      "click",
      async () => {

        await unlockAudio();


        playSFX(
          SFX.open
        );


        showScreen(
          "settings"
        );

      }
    );

  }


  /*
   * =========================================================
   * GAME SETUP
   * =========================================================
   */

  function setupGameOptions() {

    DOM.modeControl
      .querySelectorAll(
        "[data-mode]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              unlockAudio();


              playSFX(
                SFX.select
              );


              state.mode =
                button.dataset.mode;


              DOM.modeControl
                .querySelectorAll(
                  "[data-mode]"
                )
                .forEach(
                  item => {

                    item.classList.toggle(
                      "selected",
                      item ===
                      button
                    );

                  }
                );


              const aiMode =
                state.mode ===
                "ai";


              DOM.difficultyGroup.hidden =
                !aiMode;


              DOM.characterGroup.hidden =
                !aiMode;


              updateGameMeta();

            }
          );

        }
      );


    document
      .querySelectorAll(
        "[data-difficulty]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              unlockAudio();


              playSFX(
                SFX.select
              );


              state.difficulty =
                button.dataset.difficulty;


              document
                .querySelectorAll(
                  "[data-difficulty]"
                )
                .forEach(
                  item => {

                    item.classList.toggle(
                      "selected",
                      item ===
                      button
                    );

                  }
                );

            }
          );

        }
      );


    DOM.characterControl
      .querySelectorAll(
        "[data-character]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              unlockAudio();


              playSFX(
                SFX.select
              );


              state.character =
                button.dataset.character;


              DOM.characterControl
                .querySelectorAll(
                  "[data-character]"
                )
                .forEach(
                  item => {

                    item.classList.toggle(
                      "selected",
                      item ===
                      button
                    );

                  }
                );

            }
          );

        }
      );


    document
      .querySelectorAll(
        "[data-side]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              unlockAudio();


              playSFX(
                SFX.select
              );


              state.playerSide =
                button.dataset.side ===
                "white"
                  ? CONFIG.WHITE
                  : CONFIG.BLACK;


              state.aiSide =
                opponent(
                  state.playerSide
                );


              document
                .querySelectorAll(
                  "[data-side]"
                )
                .forEach(
                  item => {

                    item.classList.toggle(
                      "selected",
                      item ===
                      button
                    );

                  }
                );

            }
          );

        }
      );


    DOM.beginGameButton.addEventListener(
      "click",
      async () => {

        await unlockAudio();


        if (
          state.mode ===
          "local"
        ) {

          state.playerSide =
            CONFIG.BLACK;


          state.aiSide =
            CONFIG.WHITE;

        }


        startNewGame();

      }
    );

  }


  /*
   * =========================================================
   * RESULT
   * =========================================================
   */

  function showResult(
    result
  ) {

    const character =
      AI_CHARACTERS[
        state.character
      ];


    DOM.resultMark.classList.remove(
      "win",
      "loss",
      "lose",
      "draw"
    );


    DOM.resultMark.classList.add(
      result ===
      "loss"
        ? "lose"
        : result
    );


    if (
      result ===
      "win"
    ) {

      DOM.resultKicker.textContent =
        "VICTORY";


      DOM.resultTitle.textContent =
        "你贏了";


      DOM.resultDescription.textContent =
        `${character.name} 輸掉了這一局。`;

    } else if (
      result ===
      "loss"
    ) {

      DOM.resultKicker.textContent =
        "DEFEAT";


      DOM.resultTitle.textContent =
        "你輸了";


      DOM.resultDescription.textContent =
        `${character.name} 拿下了這一局。`;

    } else if (
      result ===
      "draw"
    ) {

      DOM.resultKicker.textContent =
        "DRAW";


      DOM.resultTitle.textContent =
        "平局";


      DOM.resultDescription.textContent =
        "棋盤已經沒有空位了。";

    } else {

      DOM.resultKicker.textContent =
        "MATCH COMPLETE";


      if (
        state.winner ===
        CONFIG.BLACK
      ) {

        DOM.resultTitle.textContent =
          "黑棋勝利";


        DOM.resultDescription.textContent =
          "黑棋完成五子連線。";

      } else {

        DOM.resultTitle.textContent =
          "白棋勝利";


        DOM.resultDescription.textContent =
          "白棋完成五子連線。";

      }

    }


    const movesElement =
      document.querySelector(
        "#gomokuResultMoves"
      );


    const timeElement =
      document.querySelector(
        "#gomokuResultTime"
      );


    if (
      movesElement
    ) {

      movesElement.textContent =
        String(
          state.moves.length
        );

    }


    if (
      timeElement
    ) {

      timeElement.textContent =
        formatDuration(
          elapsedSeconds()
        );

    }


    showScreen(
      "result"
    );

  }


  /*
   * =========================================================
   * STATS
   * =========================================================
   */

  function createDefaultStats() {

    const ai =
      {};


    Object.keys(
      AI_CHARACTERS
    ).forEach(
      id => {

        ai[id] = {

          wins:
            0,

          losses:
            0,

          games:
            0,

          totalTime:
            0,

          totalMoves:
            0

        };

      }
    );


    return {

      total:
        0,

      wins:
        0,

      losses:
        0,

      draws:
        0,


      localWins:
        0,

      localLosses:
        0,

      localDraws:
        0,


      ai,


      records:
        []

    };

  }


  function loadStats() {

    const defaults =
      createDefaultStats();


    try {

      const raw =
        localStorage.getItem(
          CONFIG.STORAGE_STATS
        );


      if (!raw) {

        return defaults;

      }


      const data =
        JSON.parse(
          raw
        );


      const mergedAI =
        {
          ...defaults.ai
        };


      Object.keys(
        AI_CHARACTERS
      ).forEach(
        id => {

          mergedAI[id] = {

            ...defaults.ai[id],

            ...(data.ai?.[id] || {})

          };

        }
      );


      return {

        ...defaults,

        ...data,

        ai:
          mergedAI,

        records:
          Array.isArray(
            data.records
          )
            ? data.records.slice(
                0,
                50
              )
            : []

      };

    } catch {

      return defaults;

    }

  }


  function saveStats() {

    try {

      localStorage.setItem(
        CONFIG.STORAGE_STATS,
        JSON.stringify(
          state.stats
        )
      );

    } catch {}

  }


  function recordResult(
    result
  ) {

    const duration =
      elapsedSeconds();


    state.stats.total++;


    if (
      result ===
      "draw"
    ) {

      state.stats.draws++;


      if (
        state.mode ===
        "local"
      ) {

        state.stats.localDraws++;

      }

    } else if (
      result ===
      "win"
    ) {

      state.stats.wins++;


      if (
        state.mode ===
        "local"
      ) {

        state.stats.localWins++;

      } else {

        const ai =
          state.stats.ai[
            state.character
          ];


        ai.losses++;


        ai.games++;


        ai.totalTime +=
          duration;


        ai.totalMoves +=
          state.moves.length;

      }

    } else if (
      result ===
      "loss"
    ) {

      state.stats.losses++;


      if (
        state.mode ===
        "local"
      ) {

        state.stats.localLosses++;

      } else {

        const ai =
          state.stats.ai[
            state.character
          ];


        ai.wins++;


        ai.games++;


        ai.totalTime +=
          duration;


        ai.totalMoves +=
          state.moves.length;

      }

    }


    state.stats.records.unshift({

      date:
        new Date().toISOString(),

      mode:
        state.mode,

      result,

      character:
        state.mode ===
        "ai"
          ? state.character
          : null,

      moves:
        state.moves.length,

      duration

    });


    state.stats.records =
      state.stats.records.slice(
        0,
        50
      );


    saveStats();


    ensureCharacterStats();

  }


  function renderStats() {

    DOM.statGames.textContent =
      state.stats.total;


    DOM.statWins.textContent =
      state.stats.wins;


    DOM.statLosses.textContent =
      state.stats.losses;


    DOM.statDraws.textContent =
      state.stats.draws;


    DOM.recordList.innerHTML =
      "";


    if (
      !state.stats.records.length
    ) {

      const empty =
        document.createElement(
          "div"
        );


      empty.className =
        "record-empty";


      empty.textContent =
        "還沒有棋局記錄。";


      DOM.recordList.appendChild(
        empty
      );

    } else {

      for (
        const record of
        state.stats.records
      ) {

        const item =
          document.createElement(
            "div"
          );


        item.className =
          "record-item";


        const left =
          document.createElement(
            "div"
          );


        const title =
          document.createElement(
            "strong"
          );


        const description =
          document.createElement(
            "small"
          );


        const date =
          document.createElement(
            "time"
          );


        let titleText =
          "";


        let descriptionText =
          "";


        if (
          record.mode ===
          "ai"
        ) {

          const character =
            AI_CHARACTERS[
              record.character
            ];


          if (
            record.result ===
            "win"
          ) {

            titleText =
              "勝利";

          } else if (
            record.result ===
            "loss"
          ) {

            titleText =
              "失敗";

          } else {

            titleText =
              "平局";

          }


          descriptionText =
            `vs ${
              character?.name ||
              "AI"
            } · ${
              record.moves
            } 手 · ${
              formatDuration(
                record.duration ||
                0
              )
            }`;

        } else {

          titleText =
            record.result ===
            "draw"
              ? "平局"
              : "雙人對戰";


          descriptionText =
            `${
              record.moves
            } 手 · ${
              formatDuration(
                record.duration ||
                0
              )
            }`;

        }


        title.textContent =
          titleText;


        description.textContent =
          descriptionText;


        date.textContent =
          formatDate(
            record.date
          );


        left.appendChild(
          title
        );


        left.appendChild(
          description
        );


        item.appendChild(
          left
        );


        item.appendChild(
          date
        );


        DOM.recordList.appendChild(
          item
        );

      }

    }


    renderAIStats();


    ensureCharacterStats();

  }


  function renderAIStats() {

    const rows =
      document.querySelector(
        "#gomokuAIStatsRows"
      );


    if (!rows) {

      return;

    }


    rows.innerHTML =
      "";


    Object.entries(
      AI_CHARACTERS
    ).forEach(
      ([id, character]) => {

        const data =
          state.stats.ai[id] || {

            wins:
              0,

            losses:
              0,

            games:
              0,

            totalTime:
              0,

            totalMoves:
              0

          };


        const games =
          data.games ||
          (
            data.wins +
            data.losses
          );


        const winRate =
          games > 0
            ? Math.round(
                (
                  data.wins /
                  games
                ) *
                100
              )
            : 0;


        const row =
          document.createElement(
            "div"
          );


        row.className =
          "gomoku-ai-stat-row";


        const left =
          document.createElement(
            "div"
          );


        const name =
          document.createElement(
            "strong"
          );


        const desc =
          document.createElement(
            "small"
          );


        name.textContent =
          character.name;


        if (games) {

          const avgMoves =
            Math.round(
              (
                data.totalMoves ||
                0
              ) /
              games
            );


          desc.textContent =
            `${character.description} · ${games} 局 · 平均 ${avgMoves} 手`;

        } else {

          desc.textContent =
            `${character.description} · 尚未對戰`;

        }


        left.appendChild(
          name
        );


        left.appendChild(
          desc
        );


        const right =
          document.createElement(
            "div"
          );


        right.className =
          "gomoku-ai-stat";


        right.innerHTML = `

          <span>
            勝率
          </span>

          <strong>
            ${winRate}%
          </strong>

        `;


        row.appendChild(
          left
        );


        row.appendChild(
          right
        );


        rows.appendChild(
          row
        );

      }
    );

  }


  function formatDate(
    value
  ) {

    try {

      return new Date(
        value
      ).toLocaleString(
        undefined,
        {
          year:
            "numeric",

          month:
            "numeric",

          day:
            "numeric",

          hour:
            "2-digit",

          minute:
            "2-digit"

        }
      );

    } catch {

      return "";

    }

  }


  /*
   * =========================================================
   * CLEAR RECORDS
   * =========================================================
   */

  function clearRecords() {

    if (
      !state.stats.records.length
    ) {

      showToast(
        "目前沒有棋局記錄"
      );


      playSFX(
        SFX.info
      );


      return;

    }


    state.stats =
      createDefaultStats();


    saveStats();


    renderStats();


    ensureCharacterStats();


    playSFX(
      SFX.delete
    );


    showToast(
      "棋局記錄已清除"
    );

  }


  /*
   * =========================================================
   * ACTIVE GAME
   * =========================================================
   */

  function saveActiveGame() {

    if (
      state.gameOver ||
      state.moves.length ===
      0
    ) {

      return;

    }


    const data = {

      version:
        5,

      mode:
        state.mode,

      difficulty:
        state.difficulty,

      character:
        state.character,

      playerSide:
        state.playerSide,

      aiSide:
        state.aiSide,

      board:
        cloneBoard(
          state.board
        ),

      currentPlayer:
        state.currentPlayer,

      moves:
        state.moves,

      lastMove:
        state.lastMove,

      gameStartedAt:
        state.gameStartedAt,

      elapsedSeconds:
        elapsedSeconds()

    };


    try {

      localStorage.setItem(
        CONFIG.STORAGE_GAME,
        JSON.stringify(
          data
        )
      );

    } catch {}

  }


  function clearActiveGame() {

    try {

      localStorage.removeItem(
        CONFIG.STORAGE_GAME
      );

    } catch {}

  }


  function checkResumeGame() {

    try {

      const raw =
        localStorage.getItem(
          CONFIG.STORAGE_GAME
        );


      if (!raw) {

        DOM.resumeCard.hidden =
          true;


        return;

      }


      const data =
        JSON.parse(
          raw
        );


      if (
        !Array.isArray(
          data.board
        ) ||
        !Array.isArray(
          data.moves
        ) ||
        !data.moves.length
      ) {

        DOM.resumeCard.hidden =
          true;


        return;

      }


      const modeText =
        data.mode ===
        "ai"
          ? "人機"
          : "雙人";


      const opponentName =
        data.mode ===
        "ai"
          ? AI_CHARACTERS[
              data.character
            ]?.name ||
            "AI"
          : "本地對戰";


      DOM.resumeText.textContent =
        `${modeText} · ${opponentName} · ${data.moves.length} 手`;


      DOM.resumeCard.hidden =
        false;


      updateResumePreview(
        data
      );

    } catch {

      DOM.resumeCard.hidden =
        true;

    }

  }


  function updateResumePreview(
    data
  ) {

    if (
      !DOM.resumeCard
    ) {

      return;

    }


    let preview =
      DOM.resumeCard.querySelector(
        ".gomoku-resume-preview"
      );


    if (!preview) {

      preview =
        document.createElement(
          "div"
        );


      preview.className =
        "gomoku-resume-preview";


      DOM.resumeText.insertAdjacentElement(
        "afterend",
        preview
      );

    }


    preview.innerHTML =
      "";


    const mini =
      document.createElement(
        "div"
      );


    mini.className =
      "gomoku-mini-board";


    const board =
      data.board;


    if (
      Array.isArray(
        board
      )
    ) {

      for (
        let row = 0;
        row <
        Math.min(
          board.length,
          CONFIG.SIZE
        );
        row++
      ) {

        for (
          let col = 0;
          col <
          Math.min(
            board[row]?.length ||
            0,
            CONFIG.SIZE
          );
          col++
        ) {

          const value =
            board[row][col];


          if (
            value ===
            CONFIG.EMPTY
          ) {

            continue;

          }


          const stone =
            document.createElement(
              "span"
            );


          stone.className =
            `gomoku-mini-stone ${
              value ===
              CONFIG.BLACK
                ? "black"
                : "white"
            }`;


          stone.style.left =
            `${
              (
                col /
                (
                  CONFIG.SIZE -
                  1
                )
              ) *
              100
            }%`;


          stone.style.top =
            `${
              (
                row /
                (
                  CONFIG.SIZE -
                  1
                )
              ) *
              100
            }%`;


          mini.appendChild(
            stone
          );

        }

      }

    }


    const text =
      document.createElement(
        "span"
      );


    text.textContent =
      `繼續上次的棋局 · ${
        formatDuration(
          data.elapsedSeconds ||
          0
        )
      }`;


    preview.appendChild(
      mini
    );


    preview.appendChild(
      text
    );

  }


  function resumeGame() {

    try {

      const raw =
        localStorage.getItem(
          CONFIG.STORAGE_GAME
        );


      if (!raw) {

        return;

      }


      const data =
        JSON.parse(
          raw
        );


      if (
        !Array.isArray(
          data.board
        ) ||
        data.board.length !==
        CONFIG.SIZE
      ) {

        clearActiveGame();


        return;

      }


      state.mode =
        data.mode ===
        "local"
          ? "local"
          : "ai";


      state.difficulty =
        DIFFICULTY[
          data.difficulty
        ]
          ? data.difficulty
          : "easy";


      state.character =
        AI_CHARACTERS[
          data.character
        ]
          ? data.character
          : "mio";


      state.playerSide =
        data.playerSide ===
        CONFIG.WHITE
          ? CONFIG.WHITE
          : CONFIG.BLACK;


      state.aiSide =
        opponent(
          state.playerSide
        );


      state.board =
        cloneBoard(
          data.board
        );


      state.currentPlayer =
        data.currentPlayer ===
        CONFIG.WHITE
          ? CONFIG.WHITE
          : CONFIG.BLACK;


      state.moves =
        Array.isArray(
          data.moves
        )
          ? data.moves
          : [];


      state.lastMove =
        data.lastMove ||
        state.moves[
          state.moves.length -
          1
        ] ||
        null;


      state.gameOver =
        false;


      state.winner =
        CONFIG.EMPTY;


      state.winningLine =
        [];


      state.aiThinking =
        false;


      const savedElapsed =
        Number(
          data.elapsedSeconds
        ) ||
        0;


      state.gameStartedAt =
        Date.now() -
        savedElapsed *
        1000;


      state.gameEndedAt =
        0;


      syncSetupUI();


      showScreen(
        "game"
      );


      startTimer(
        state.gameStartedAt
      );


      renderBoard();


      updateTurnUI();


      if (
        state.mode ===
        "ai" &&
        state.currentPlayer ===
        state.aiSide
      ) {

        scheduleAI();

      } else {

        updateAIOS(
          "thinking"
        );

      }

    } catch {

      clearActiveGame();


      showToast(
        "棋局資料已失效"
      );

    }

  }


  /*
   * =========================================================
   * SETUP UI SYNC
   * =========================================================
   */

  function syncSetupUI() {

    DOM.modeControl
      .querySelectorAll(
        "[data-mode]"
      )
      .forEach(
        button => {

          button.classList.toggle(
            "selected",
            button.dataset.mode ===
            state.mode
          );

        }
      );


    DOM.difficultyGroup.hidden =
      state.mode !==
      "ai";


    DOM.characterGroup.hidden =
      state.mode !==
      "ai";


    document
      .querySelectorAll(
        "[data-difficulty]"
      )
      .forEach(
        button => {

          button.classList.toggle(
            "selected",
            button.dataset.difficulty ===
            state.difficulty
          );

        }
      );


    DOM.characterControl
      .querySelectorAll(
        "[data-character]"
      )
      .forEach(
        button => {

          button.classList.toggle(
            "selected",
            button.dataset.character ===
            state.character
          );

        }
      );


    document
      .querySelectorAll(
        "[data-side]"
      )
      .forEach(
        button => {

          button.classList.toggle(
            "selected",
            button.dataset.side ===
            (
              state.playerSide ===
              CONFIG.WHITE
                ? "white"
                : "black"
            )
          );

        }
      );

  }


  /*
   * =========================================================
   * SETTINGS
   * =========================================================
   */

  function loadSettings() {

    const defaults = {

      language:
        "zh-TW",

      sound:
        true,

      motion:
        true,

      theme:
        "system"

    };


    try {

      const raw =
        localStorage.getItem(
          CONFIG.STORAGE_SETTINGS
        );


      if (!raw) {

        return defaults;

      }


      return {

        ...defaults,

        ...JSON.parse(
          raw
        )

      };

    } catch {

      return defaults;

    }

  }


  function saveSettings() {

    try {

      localStorage.setItem(
        CONFIG.STORAGE_SETTINGS,
        JSON.stringify(
          state.settings
        )
      );

    } catch {}

  }


  function setupSettings() {

    DOM.soundToggle.checked =
      state.settings.sound;


    DOM.motionToggle.checked =
      state.settings.motion;


    DOM.themeSelect.value =
      state.settings.theme;


    DOM.languageSelect.value =
      state.settings.language;


    DOM.soundToggle.addEventListener(
      "change",
      async () => {

        const enabled =
          DOM.soundToggle.checked;


        setSoundEnabled(
          enabled
        );


        if (enabled) {

          await unlockAudio();


          await playSFX(
            SFX.toggleOn,
            {
              cooldownMs:
                100
            }
          );

        }

      }
    );


    DOM.motionToggle.addEventListener(
      "change",
      async () => {

        state.settings.motion =
          DOM.motionToggle.checked;


        saveSettings();


        document.documentElement.classList.toggle(
          "gomoku-motion-reduced",
          !state.settings.motion
        );


        await unlockAudio();


        playSFX(
          state.settings.motion
            ? SFX.select
            : SFX.press
        );

      }
    );


    DOM.themeSelect.addEventListener(
      "change",
      async () => {

        state.settings.theme =
          DOM.themeSelect.value;


        applyTheme();


        saveSettings();


        await unlockAudio();


        playSFX(
          SFX.select
        );

      }
    );


    DOM.languageSelect.addEventListener(
      "change",
      async () => {

        state.settings.language =
          DOM.languageSelect.value;


        saveSettings();


        await unlockAudio();


        playSFX(
          SFX.select
        );


        showToast(
          "語言設定已儲存"
        );

      }
    );


    applyTheme();

  }


  function applyTheme() {

    const theme =
      state.settings.theme;


    document.documentElement.dataset.theme =
      theme ===
      "dark"
        ? "dark"
        : theme ===
          "light"
          ? "light"
          : "system";


    document.documentElement.classList.toggle(
      "gomoku-motion-reduced",
      !state.settings.motion
    );

  }


  /*
   * =========================================================
   * TOAST
   * =========================================================
   */

  function showToast(
    message
  ) {

    DOM.toast.textContent =
      message;


    DOM.toast.classList.add(
      "visible"
    );


    clearTimeout(
      toastTimer
    );


    toastTimer =
      window.setTimeout(
        () => {

          DOM.toast.classList.remove(
            "visible"
          );

        },
        1800
      );

  }


  /*
   * =========================================================
   * RESIZE / VISIBILITY
   * =========================================================
   */

  window.addEventListener(
    "resize",
    () => {

      clearTimeout(
        resizeTimer
      );


      resizeTimer =
        window.setTimeout(
          () => {

            if (
              state.screen ===
              "game"
            ) {

              resizeCanvas();

            }

          },
          80
        );

    }
  );


  window.addEventListener(
    "orientationchange",
    () => {

      window.setTimeout(
        resizeCanvas,
        180
      );

    }
  );


  document.addEventListener(
    "visibilitychange",
    () => {

      if (
        document.hidden
      ) {

        if (
          state.screen ===
          "game" &&
          !state.gameOver
        ) {

          saveActiveGame();

        }

      } else if (
        state.screen ===
        "game" &&
        state.gameStartedAt
      ) {

        updateTimerUI();


        resizeCanvas();

      }

    }
  );


  window.addEventListener(
    "pagehide",
    () => {

      if (
        state.screen ===
        "game" &&
        !state.gameOver
      ) {

        saveActiveGame();

      }

    }
  );


  /*
   * =========================================================
   * SERVICE WORKER
   * =========================================================
   */

  function registerServiceWorker() {

    if (
      !(
        "serviceWorker" in
        navigator
      )
    ) {

      return;

    }


    window.addEventListener(
      "load",
      () => {

        navigator.serviceWorker
          .register(
            "./sw.js",
            {
              scope:
                "./"
            }
          )
          .then(
            registration => {

              registration.update()
                .catch(
                  () => {}
                );

            }
          )
          .catch(
            () => {}
          );

      }
    );

  }


  /*
   * =========================================================
   * HELPERS
   * =========================================================
   */

  function opponent(
    player
  ) {

    return player ===
      CONFIG.BLACK
      ? CONFIG.WHITE
      : CONFIG.BLACK;

  }


  function prefersReducedMotion() {

    return (
      window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      ).matches ===
      true
    );

  }


  /*
   * =========================================================
   * INITIALIZE
   * =========================================================
   */

  function init() {

    injectPolishStyles();


    ensureGameMeta();


    ensureResultMeta();


    ensureAIStats();


    ensureDifficultyNotes();


    ensureCharacterStats();


    setupNavigation();


    setupGameOptions();


    setupBoardInput();


    setupSettings();


    if (
      DOM.clearRecordsButton
    ) {

      DOM.clearRecordsButton
        .addEventListener(
          "click",
          async () => {

            await unlockAudio();


            clearRecords();

          }
        );

    }


    /*
     * Global first-gesture unlock.
     *
     * No autoplay.
     * Audio is only initialized after actual user intent.
     */

    const unlockEvents = [
      "pointerdown",
      "keydown"
    ];


    const unlockOnce =
      async () => {

        if (
          !state.settings.sound
        ) {

          return;

        }


        await unlockAudio();


        unlockEvents.forEach(
          eventName => {

            document.removeEventListener(
              eventName,
              unlockOnce
            );

          }
        );

      };


    unlockEvents.forEach(
      eventName => {

        document.addEventListener(
          eventName,
          unlockOnce,
          {
            passive:
              true
          }
        );

      }
    );


    syncSetupUI();


    renderBoard();


    checkResumeGame();


    updateTurnUI();


    registerServiceWorker();


    decorateButtons();

  }


  init();

})();
