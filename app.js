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
(() => {
  "use strict";

  /*
   * =========================================================
   * GOMOKU GAME REVIEW
   * =========================================================
   *
   * App.js-only integration.
   *
   * No index.html changes required.
   * No additional JS file required.
   *
   * Features:
   * - Automatically captures completed games
   * - Keeps up to 50 completed games
   * - Result screen "這局回顧"
   * - Records screen review buttons
   * - Move-by-move replay
   * - First / previous / play / next / last
   * - Timeline slider
   * - Move list
   * - Coordinate display
   * - Current move highlight
   * - Winning line highlight
   * - Light / dark compatible
   * - Mobile responsive
   * - Keyboard shortcuts
   *
   * Important:
   * The existing game engine remains untouched.
   *
   * =========================================================
   */

  const REVIEW = {
    SIZE: 15,
    WIN: 5,

    EMPTY: 0,
    BLACK: 1,
    WHITE: 2,

    STORAGE:
      "gomoku-game-reviews-v2",

    MAX_GAMES:
      50,

    PLAY_INTERVAL:
      520
  };


  /*
   * =========================================================
   * STATE
   * =========================================================
   */

  const state = {
    games: [],

    activeGame:
      null,

    currentMove:
      0,

    playing:
      false,

    timer:
      null,

    pendingCapture:
      null,

    captureTimer:
      null
  };


  /*
   * =========================================================
   * STORAGE
   * =========================================================
   */

  function loadGames() {

    try {

      const raw =
        localStorage.getItem(
          REVIEW.STORAGE
        );

      if (!raw) {
        return [];
      }

      const data =
        JSON.parse(
          raw
        );

      if (!Array.isArray(data)) {
        return [];
      }

      return data
        .filter(Boolean)
        .slice(
          0,
          REVIEW.MAX_GAMES
        );

    } catch {

      return [];

    }

  }


  function saveGames() {

    try {

      localStorage.setItem(
        REVIEW.STORAGE,
        JSON.stringify(
          state.games.slice(
            0,
            REVIEW.MAX_GAMES
          )
        )
      );

    } catch {}

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
          REVIEW.SIZE
      },
      () =>
        Array(
          REVIEW.SIZE
        ).fill(
          REVIEW.EMPTY
        )
    );

  }


  function isInside(
    row,
    col
  ) {

    return (
      row >= 0 &&
      row < REVIEW.SIZE &&
      col >= 0 &&
      col < REVIEW.SIZE
    );

  }


  function boardAtMove(
    moves,
    count
  ) {

    const board =
      createBoard();

    const limit =
      Math.max(
        0,
        Math.min(
          Number(count) || 0,
          moves.length
        )
      );


    for (
      let i = 0;
      i < limit;
      i += 1
    ) {

      const move =
        moves[i];

      if (!move) {
        continue;
      }

      if (
        !Number.isInteger(
          move.row
        ) ||
        !Number.isInteger(
          move.col
        )
      ) {
        continue;
      }

      if (
        !isInside(
          move.row,
          move.col
        )
      ) {
        continue;
      }

      if (
        move.player !==
          REVIEW.BLACK &&
        move.player !==
          REVIEW.WHITE
      ) {
        continue;
      }

      board[
        move.row
      ][
        move.col
      ] =
        move.player;

    }

    return board;

  }


  function isBoardFull(
    board
  ) {

    for (
      let row = 0;
      row < REVIEW.SIZE;
      row += 1
    ) {

      for (
        let col = 0;
        col < REVIEW.SIZE;
        col += 1
      ) {

        if (
          board[row][col] ===
          REVIEW.EMPTY
        ) {

          return false;

        }

      }

    }

    return true;

  }


  /*
   * =========================================================
   * WINNING LINE
   * =========================================================
   */

  const DIRECTIONS = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1]
  ];


  function getWinningLine(
    board,
    row,
    col,
    player
  ) {

    for (
      const [
        dr,
        dc
      ]
      of DIRECTIONS
    ) {

      const line = [
        [
          row,
          col
        ]
      ];


      let r =
        row + dr;

      let c =
        col + dc;


      while (
        isInside(
          r,
          c
        ) &&
        board[r][c] ===
        player
      ) {

        line.push([
          r,
          c
        ]);

        r += dr;
        c += dc;

      }


      r =
        row - dr;

      c =
        col - dc;


      while (
        isInside(
          r,
          c
        ) &&
        board[r][c] ===
        player
      ) {

        line.unshift([
          r,
          c
        ]);

        r -= dr;
        c -= dc;

      }


      if (
        line.length >=
        REVIEW.WIN
      ) {

        return line;

      }

    }


    return [];

  }


  /*
   * =========================================================
   * COORDINATES
   * =========================================================
   */

  function coordinate(
    row,
    col
  ) {

    const columns =
      "ABCDEFGHIJKLMNO";

    return (
      (
        columns[col] ||
        "?"
      ) +
      String(
        row + 1
      )
    );

  }


  /*
   * =========================================================
   * CAPTURE COMPLETED GAME
   * =========================================================
   *
   * Existing app.js does:
   *
   * finishGame()
   *   -> clearActiveGame()
   *   -> recordResult()
   *   -> showResult()
   *
   * We cannot access its private state directly.
   *
   * Instead we temporarily intercept the existing
   * localStorage.removeItem() call.
   *
   * The unfinished game is NOT immediately saved.
   *
   * We wait for #resultScreen to become active.
   * Therefore:
   *
   * - finishGame -> captured
   * - finishDraw -> captured
   * - undo -> ignored
   * - menu -> ignored
   * - invalid resume cleanup -> ignored
   *
   * =========================================================
   */

  function captureActiveGameBeforeDelete(
    key
  ) {

    if (
      key !==
      "gomoku-active-game-v5"
    ) {

      return;

    }


    try {

      const raw =
        localStorage.getItem(
          key
        );

      if (!raw) {
        return;
      }


      const data =
        JSON.parse(
          raw
        );


      if (
        !data ||
        !Array.isArray(
          data.moves
        ) ||
        !data.moves.length
      ) {

        return;

      }


      const moves =
        normalizeMoves(
          data.moves
        );


      if (!moves.length) {
        return;
      }


      const board =
        boardAtMove(
          moves,
          moves.length
        );


      const lastMove =
        moves[
          moves.length - 1
        ];


      let winner =
        REVIEW.EMPTY;

      let winningLine =
        [];


      if (
        lastMove
      ) {

        winningLine =
          getWinningLine(
            board,
            lastMove.row,
            lastMove.col,
            lastMove.player
          );


        if (
          winningLine.length >=
          REVIEW.WIN
        ) {

          winner =
            lastMove.player;

        }

      }


      const draw =
        !winner &&
        isBoardFull(
          board
        );


      state.pendingCapture = {
        id:
          createId(),

        date:
          new Date().toISOString(),

        mode:
          data.mode ===
          "local"
            ? "local"
            : "ai",

        difficulty:
          data.difficulty ||
          "easy",

        character:
          data.character ||
          null,

        playerSide:
          data.playerSide ===
          REVIEW.WHITE
            ? REVIEW.WHITE
            : REVIEW.BLACK,

        aiSide:
          data.aiSide ===
          REVIEW.BLACK
            ? REVIEW.BLACK
            : REVIEW.WHITE,

        moves,

        winner,

        draw,

        winningLine,

        duration:
          Number(
            data.elapsedSeconds
          ) || 0

      };


      clearTimeout(
        state.captureTimer
      );


      state.captureTimer =
        window.setTimeout(
          () => {

            state.pendingCapture =
              null;

          },
          3000
        );

    } catch {}

  }


  function normalizeMoves(
    moves
  ) {

    if (
      !Array.isArray(
        moves
      )
    ) {

      return [];

    }


    return moves
      .filter(
        move =>
          move &&
          Number.isInteger(
            move.row
          ) &&
          Number.isInteger(
            move.col
          ) &&
          (
            move.player ===
            REVIEW.BLACK ||
            move.player ===
            REVIEW.WHITE
          ) &&
          isInside(
            move.row,
            move.col
          )
      )
      .map(
        move => ({
          row:
            move.row,

          col:
            move.col,

          player:
            move.player
        })
      );

  }


  function createId() {

    return (
      Date.now().toString(
        36
      ) +
      "-" +
      Math.random()
        .toString(36)
        .slice(2, 10)
    );

  }


  function commitPendingCapture() {

    const game =
      state.pendingCapture;

    if (!game) {
      return;
    }


    clearTimeout(
      state.captureTimer
    );


    state.captureTimer =
      null;


    state.pendingCapture =
      null;


    state.games =
      state.games.filter(
        item =>
          item.id !==
          game.id
      );


    state.games.unshift(
      game
    );


    state.games =
      state.games.slice(
        0,
        REVIEW.MAX_GAMES
      );


    saveGames();


    refreshRecordsReviewButtons();

  }


  /*
   * =========================================================
   * INTERCEPT STORAGE DELETE
   * =========================================================
   */

  function installStorageHook() {

    const originalRemoveItem =
      Storage.prototype.removeItem;


    if (
      originalRemoveItem.__gomokuReviewHook
    ) {

      return;

    }


    function wrappedRemoveItem(
      key
    ) {

      if (
        key ===
        "gomoku-active-game-v5"
      ) {

        captureActiveGameBeforeDelete(
          key
        );

      }


      return originalRemoveItem.call(
        this,
        key
      );

    }


    wrappedRemoveItem.__gomokuReviewHook =
      true;


    Storage.prototype.removeItem =
      wrappedRemoveItem;

  }


  /*
   * =========================================================
   * RESULT SCREEN OBSERVER
   * =========================================================
   */

  function installResultObserver() {

    const resultScreen =
      document.querySelector(
        "#resultScreen"
      );


    if (!resultScreen) {
      return;
    }


    const observer =
      new MutationObserver(
        () => {

          if (
            resultScreen.classList.contains(
              "active"
            )
          ) {

            commitPendingCapture();

            updateResultButton();

          }

        }
      );


    observer.observe(
      resultScreen,
      {
        attributes:
          true,

        attributeFilter:
          [
            "class"
          ]
      }
    );

  }


  /*
   * =========================================================
   * STYLES
   * =========================================================
   */

  function injectStyles() {

    if (
      document.querySelector(
        "#gomoku-review-v2-styles"
      )
    ) {

      return;

    }


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "gomoku-review-v2-styles";


    style.textContent = `
      .gomoku-review-overlay-v2 {
        position: fixed;
        inset: 0;
        z-index: 9999;

        display: grid;
        place-items: center;

        padding: 18px;

        background:
          rgba(0, 0, 0, .44);

        backdrop-filter:
          blur(18px);

        -webkit-backdrop-filter:
          blur(18px);

        opacity: 0;
        pointer-events: none;

        transition:
          opacity 180ms ease;
      }


      .gomoku-review-overlay-v2.open {
        opacity: 1;
        pointer-events: auto;
      }


      .gomoku-review-panel-v2 {
        width:
          min(
            1080px,
            100%
          );

        max-height:
          calc(
            100dvh - 36px
          );

        overflow:
          auto;

        border:
          1px solid
          var(--line, rgba(0,0,0,.12));

        border-radius:
          24px;

        background:
          var(
            --surface-solid,
            #f7f7f5
          );

        color:
          var(
            --text,
            #171717
          );

        box-shadow:
          0 30px 90px
          rgba(0,0,0,.28);
      }


      .gomoku-review-header-v2 {
        position:
          sticky;

        top: 0;

        z-index: 4;

        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          14px;

        padding:
          18px 20px;

        border-bottom:
          1px solid
          var(--line, rgba(0,0,0,.12));

        background:
          var(
            --surface-solid,
            #f7f7f5
          );

        backdrop-filter:
          blur(16px);

        -webkit-backdrop-filter:
          blur(16px);
      }


      .gomoku-review-kicker-v2 {
        margin-bottom:
          4px;

        color:
          var(
            --muted,
            #777
          );

        font-size:
          10px;

        font-weight:
          800;

        letter-spacing:
          .12em;
      }


      .gomoku-review-title-v2 {
        margin:
          0;

        font-size:
          22px;

        line-height:
          1.15;

        letter-spacing:
          -.025em;
      }


      .gomoku-review-close-v2 {
        width:
          40px;

        height:
          40px;

        flex:
          0 0 40px;

        border:
          0;

        border-radius:
          50%;

        background:
          var(
            --line,
            #ddd
          );

        color:
          var(
            --text,
            #171717
          );

        cursor:
          pointer;

        font-size:
          23px;
      }


      .gomoku-review-body-v2 {
        padding:
          18px;
      }


      .gomoku-review-layout-v2 {
        display:
          grid;

        grid-template-columns:
          minmax(0, 1fr)
          300px;

        gap:
          18px;
      }


      .gomoku-review-board-card-v2 {
        padding:
          12px;

        border:
          1px solid
          var(--line, rgba(0,0,0,.12));

        border-radius:
          20px;

        background:
          color-mix(
            in srgb,
            var(--background, #eee) 78%,
            var(--surface-solid, #fff)
          );
      }


      .gomoku-review-board-v2 {
        position:
          relative;

        width:
          min(
            100%,
            700px
          );

        aspect-ratio:
          1;

        margin:
          auto;

        display:
          grid;

        grid-template-columns:
          repeat(15, 1fr);

        grid-template-rows:
          repeat(15, 1fr);

        padding:
          3.8%;

        border-radius:
          15px;

        background:
          #e8d5ad;

        overflow:
          hidden;
      }


      .gomoku-review-cell-v2 {
        position:
          relative;

        display:
          grid;

        place-items:
          center;
      }


      .gomoku-review-cell-v2::before {
        content:
          "";

        position:
          absolute;

        left:
          0;

        right:
          0;

        top:
          50%;

        height:
          1px;

        background:
          rgba(91, 69, 45, .52);
      }


      .gomoku-review-cell-v2::after {
        content:
          "";

        position:
          absolute;

        top:
          0;

        bottom:
          0;

        left:
          50%;

        width:
          1px;

        background:
          rgba(91, 69, 45, .52);
      }


      .gomoku-review-stone-v2 {
        position:
          relative;

        z-index:
          2;

        width:
          76%;

        aspect-ratio:
          1;

        border-radius:
          50%;

        box-shadow:
          0 2px 5px
          rgba(0,0,0,.23);

        transition:
          box-shadow 140ms ease,
          transform 140ms ease;
      }


      .gomoku-review-stone-v2.black {
        background:
          radial-gradient(
            circle at 30% 23%,
            #555 0%,
            #282828 30%,
            #101010 100%
          );
      }


      .gomoku-review-stone-v2.white {
        background:
          radial-gradient(
            circle at 30% 23%,
            #fff 0%,
            #f6f1e8 55%,
            #c9c0b0 100%
          );

        border:
          1px solid
          rgba(0,0,0,.14);
      }


      .gomoku-review-stone-v2.current {
        transform:
          scale(1.04);

        box-shadow:
          0 0 0 3px
          rgba(184,111,82,.75),
          0 4px 10px
          rgba(0,0,0,.25);
      }


      .gomoku-review-stone-v2.winning {
        box-shadow:
          0 0 0 3px
          rgba(212,109,82,.9),
          0 0 18px
          rgba(212,109,82,.28);
      }


      .gomoku-review-side-v2 {
        display:
          grid;

        align-content:
          start;

        gap:
          10px;
      }


      .gomoku-review-info-v2 {
        display:
          grid;

        grid-template-columns:
          1fr 1fr;

        gap:
          8px;
      }


      .gomoku-review-stat-v2 {
        padding:
          12px;

        border:
          1px solid
          var(--line, rgba(0,0,0,.12));

        border-radius:
          14px;

        background:
          var(
            --surface,
            rgba(255,255,255,.45)
          );
      }


      .gomoku-review-stat-v2 span {
        display:
          block;

        margin-bottom:
          3px;

        color:
          var(
            --muted,
            #777
          );

        font-size:
          11px;
      }


      .gomoku-review-stat-v2 strong {
        display:
          block;

        font-size:
          18px;

        font-variant-numeric:
          tabular-nums;
      }


      .gomoku-review-moment-v2 {
        padding:
          13px 14px;

        border:
          1px solid
          var(--line, rgba(0,0,0,.12));

        border-radius:
          14px;

        background:
          var(
            --surface,
            rgba(255,255,255,.45)
          );

        line-height:
          1.45;
      }


      .gomoku-review-moment-v2 small {
        display:
          block;

        margin-bottom:
          4px;

        color:
          var(
            --muted,
            #777
          );

        font-size:
          11px;
      }


      .gomoku-review-moment-v2 strong {
        display:
          block;
      }


      .gomoku-review-moves-v2 {
        display:
          grid;

        gap:
          4px;

        max-height:
          360px;

        overflow:
          auto;

        padding:
          2px;
      }


      .gomoku-review-move-v2 {
        display:
          grid;

        grid-template-columns:
          34px
          1fr
          auto;

        align-items:
          center;

        gap:
          7px;

        min-height:
          38px;

        padding:
          0 9px;

        border:
          1px solid
          transparent;

        border-radius:
          9px;

        background:
          transparent;

        color:
          var(
            --text,
            #171717
          );

        cursor:
          pointer;

        text-align:
          left;
      }


      .gomoku-review-move-v2:hover {
        background:
          var(
            --line,
            rgba(0,0,0,.08)
          );
      }


      .gomoku-review-move-v2.selected {
        border-color:
          rgba(184,111,82,.32);

        background:
          rgba(184,111,82,.10);
      }


      .gomoku-review-move-number-v2 {
        color:
          var(
            --muted,
            #777
          );

        font-variant-numeric:
          tabular-nums;
      }


      .gomoku-review-move-player-v2 {
        font-weight:
          700;
      }


      .gomoku-review-move-coordinate-v2 {
        color:
          var(
            --muted,
            #777
          );

        font-family:
          ui-monospace,
          SFMono-Regular,
          Menlo,
          monospace;

        font-size:
          11px;
      }


      .gomoku-review-controls-v2 {
        display:
          grid;

        grid-template-columns:
          repeat(5, 1fr);

        gap:
          6px;

        margin-top:
          10px;
      }


      .gomoku-review-control-v2 {
        min-height:
          42px;

        border:
          1px solid
          var(--line, rgba(0,0,0,.12));

        border-radius:
          11px;

        background:
          var(
            --surface,
            rgba(255,255,255,.45)
          );

        color:
          var(
            --text,
            #171717
          );

        cursor:
          pointer;

        font-weight:
          700;
      }


      .gomoku-review-control-v2:hover {
        background:
          var(
            --line,
            rgba(0,0,0,.08)
          );
      }


      .gomoku-review-slider-v2 {
        width:
          100%;

        margin:
          10px 0 0;

        accent-color:
          #b86f52;
      }


      .gomoku-review-result-v2 {
        margin-top:
          8px;

        padding:
          12px 14px;

        border:
          1px solid
          var(--line, rgba(0,0,0,.12));

        border-radius:
          14px;

        background:
          var(
            --surface,
            rgba(255,255,255,.45)
          );
      }


      .gomoku-review-result-v2 strong {
        display:
          block;

        margin-bottom:
          2px;
      }


      .gomoku-review-result-v2 span {
        color:
          var(
            --muted,
            #777
          );

        font-size:
          12px;
      }


      .gomoku-review-button-v2 {
        width:
          100%;

        min-height:
          44px;

        margin-top:
          8px;

        border:
          1px solid
          var(--line, rgba(0,0,0,.12));

        border-radius:
          12px;

        background:
          var(
            --surface,
            rgba(255,255,255,.45)
          );

        color:
          var(
            --text,
            #171717
          );

        cursor:
          pointer;

        font-weight:
          700;
      }


      .gomoku-review-button-v2:hover {
        background:
          var(
            --line,
            rgba(0,0,0,.08)
          );
      }


      .gomoku-review-record-button-v2 {
        margin-top:
          8px;

        min-height:
          34px;

        padding:
          0 12px;

        border:
          1px solid
          var(--line, rgba(0,0,0,.12));

        border-radius:
          9px;

        background:
          transparent;

        color:
          var(
            --text,
            #171717
          );

        cursor:
          pointer;

        font-size:
          12px;

        font-weight:
          700;
      }


      .gomoku-review-record-button-v2:hover {
        background:
          var(
            --line,
            rgba(0,0,0,.08)
          );
      }


      @media (
        max-width: 760px
      ) {

        .gomoku-review-overlay-v2 {
          padding:
            8px;
        }


        .gomoku-review-panel-v2 {
          max-height:
            calc(
              100dvh - 16px
            );

          border-radius:
            19px;
        }


        .gomoku-review-body-v2 {
          padding:
            10px;
        }


        .gomoku-review-layout-v2 {
          grid-template-columns:
            1fr;
        }


        .gomoku-review-controls-v2 {
          grid-template-columns:
            repeat(4, 1fr);
        }


        .gomoku-review-control-v2.play {
          grid-column:
            span 4;
        }


        .gomoku-review-moves-v2 {
          max-height:
            260px;
        }

      }
    `;


    document.head.appendChild(
      style
    );

  }


  /*
   * =========================================================
   * UI
   * =========================================================
   */

  function ensureUI() {

    if (
      document.querySelector(
        "#gomokuReviewOverlayV2"
      )
    ) {

      return;

    }


    injectStyles();


    const overlay =
      document.createElement(
        "div"
      );


    overlay.id =
      "gomokuReviewOverlayV2";


    overlay.className =
      "gomoku-review-overlay-v2";


    overlay.innerHTML = `
      <section
        class="gomoku-review-panel-v2"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gomokuReviewTitleV2"
      >

        <header
          class="gomoku-review-header-v2"
        >

          <div>

            <div
              class="gomoku-review-kicker-v2"
            >
              GAME REVIEW
            </div>

            <h2
              class="gomoku-review-title-v2"
              id="gomokuReviewTitleV2"
            >
              這局回顧
            </h2>

          </div>

          <button
            type="button"
            class="gomoku-review-close-v2"
            id="gomokuReviewCloseV2"
            aria-label="關閉"
          >
            ×
          </button>

        </header>


        <div
          class="gomoku-review-body-v2"
        >

          <div
            class="gomoku-review-layout-v2"
          >

            <div>

              <div
                class="gomoku-review-board-card-v2"
              >

                <div
                  class="gomoku-review-board-v2"
                  id="gomokuReviewBoardV2"
                ></div>

              </div>


              <div
                class="gomoku-review-controls-v2"
              >

                <button
                  type="button"
                  class="gomoku-review-control-v2"
                  data-review-v2="first"
                >
                  最前
                </button>

                <button
                  type="button"
                  class="gomoku-review-control-v2"
                  data-review-v2="prev"
                >
                  上一步
                </button>

                <button
                  type="button"
                  class="gomoku-review-control-v2 play"
                  data-review-v2="play"
                >
                  播放
                </button>

                <button
                  type="button"
                  class="gomoku-review-control-v2"
                  data-review-v2="next"
                >
                  下一步
                </button>

                <button
                  type="button"
                  class="gomoku-review-control-v2"
                  data-review-v2="last"
                >
                  最後
                </button>

              </div>


              <input
                id="gomokuReviewSliderV2"
                class="gomoku-review-slider-v2"
                type="range"
                min="0"
                max="0"
                value="0"
                step="1"
              >

            </div>


            <aside
              class="gomoku-review-side-v2"
            >

              <div
                class="gomoku-review-info-v2"
              >

                <div
                  class="gomoku-review-stat-v2"
                >

                  <span>
                    總手數
                  </span>

                  <strong
                    id="gomokuReviewTotalV2"
                  >
                    0
                  </strong>

                </div>


                <div
                  class="gomoku-review-stat-v2"
                >

                  <span>
                    目前
                  </span>

                  <strong
                    id="gomokuReviewCurrentV2"
                  >
                    0
                  </strong>

                </div>

              </div>


              <div
                class="gomoku-review-moment-v2"
              >

                <small>
                  局面
                </small>

                <strong
                  id="gomokuReviewMomentV2"
                >
                  開局
                </strong>

              </div>


              <div
                class="gomoku-review-result-v2"
                id="gomokuReviewResultV2"
              ></div>


              <div
                class="gomoku-review-moves-v2"
                id="gomokuReviewMovesV2"
              ></div>

            </aside>

          </div>

        </div>

      </section>
    `;


    document.body.appendChild(
      overlay
    );


    overlay.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          overlay
        ) {

          close();

        }

      }
    );


    document
      .querySelector(
        "#gomokuReviewCloseV2"
      )
      .addEventListener(
        "click",
        close
      );


    overlay
      .querySelectorAll(
        "[data-review-v2]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              handleAction(
                button.dataset.reviewV2
              );

            }
          );

        }
      );


    document
      .querySelector(
        "#gomokuReviewSliderV2"
      )
      .addEventListener(
        "input",
        event => {

          stop();

          setMove(
            Number(
              event.target.value
            )
          );

        }
      );

  }


  /*
   * =========================================================
   * RENDER BOARD
   * =========================================================
   */

  function renderBoard() {

    const boardElement =
      document.querySelector(
        "#gomokuReviewBoardV2"
      );


    const game =
      state.activeGame;


    if (
      !boardElement ||
      !game
    ) {

      return;

    }


    const board =
      boardAtMove(
        game.moves,
        state.currentMove
      );


    boardElement.innerHTML =
      "";


    const winningSet =
      new Set(
        (
          game.winningLine ||
          []
        )
        .map(
          point =>
            `${point[0]},${point[1]}`
        )
      );


    for (
      let row = 0;
      row < REVIEW.SIZE;
      row += 1
    ) {

      for (
        let col = 0;
        col < REVIEW.SIZE;
        col += 1
      ) {

        const cell =
          document.createElement(
            "div"
          );


        cell.className =
          "gomoku-review-cell-v2";


        const player =
          board[row][col];


        if (
          player !==
          REVIEW.EMPTY
        ) {

          const stone =
            document.createElement(
              "div"
            );


          stone.className =
            "gomoku-review-stone-v2 " +
            (
              player ===
              REVIEW.BLACK
                ? "black"
                : "white"
            );


          const moveIndex =
            findMoveIndex(
              game.moves,
              row,
              col
            );


          if (
            moveIndex ===
            state.currentMove - 1
          ) {

            stone.classList.add(
              "current"
            );

          }


          if (
            winningSet.has(
              `${row},${col}`
            )
          ) {

            stone.classList.add(
              "winning"
            );

          }


          cell.appendChild(
            stone
          );

        }


        boardElement.appendChild(
          cell
        );

      }

    }


    updateMeta();

    renderMoves();

  }


  function findMoveIndex(
    moves,
    row,
    col
  ) {

    for (
      let i = 0;
      i < moves.length;
      i += 1
    ) {

      if (
        moves[i].row ===
          row &&
        moves[i].col ===
          col
      ) {

        return i;

      }

    }


    return -1;

  }


  /*
   * =========================================================
   * META
   * =========================================================
   */

  function updateMeta() {

    const game =
      state.activeGame;


    if (!game) {
      return;
    }


    const total =
      document.querySelector(
        "#gomokuReviewTotalV2"
      );


    const current =
      document.querySelector(
        "#gomokuReviewCurrentV2"
      );


    const moment =
      document.querySelector(
        "#gomokuReviewMomentV2"
      );


    const result =
      document.querySelector(
        "#gomokuReviewResultV2"
      );


    const slider =
      document.querySelector(
        "#gomokuReviewSliderV2"
      );


    if (total) {

      total.textContent =
        String(
          game.moves.length
        );

    }


    if (current) {

      current.textContent =
        String(
          state.currentMove
        );

    }


    if (slider) {

      slider.max =
        String(
          game.moves.length
        );

      slider.value =
        String(
          state.currentMove
        );

    }


    if (moment) {

      if (
        state.currentMove ===
        0
      ) {

        moment.textContent =
          "開局，棋盤還沒有落子。";

      } else {

        const move =
          game.moves[
            state.currentMove - 1
          ];


        if (move) {

          const player =
            move.player ===
            REVIEW.BLACK
              ? "黑棋"
              : "白棋";


          const board =
            boardAtMove(
              game.moves,
              state.currentMove
            );


          const line =
            getWinningLine(
              board,
              move.row,
              move.col,
              move.player
            );


          if (
            line.length >=
            REVIEW.WIN
          ) {

            moment.textContent =
              `第 ${state.currentMove} 手，${player} 在 ${coordinate(
                move.row,
                move.col
              )} 完成五連，這就是勝負手。`;

          } else {

            moment.textContent =
              `第 ${state.currentMove} 手，${player} 落在 ${coordinate(
                move.row,
                move.col
              )}。`;

          }

        }

      }

    }


    if (result) {

      result.innerHTML =
        "";


      if (
        game.winner ===
        REVIEW.BLACK
      ) {

        result.innerHTML = `
          <strong>
            黑棋勝利
          </strong>

          <span>
            第 ${findWinningMoveNumber(game)} 手完成五連
          </span>
        `;

      } else if (
        game.winner ===
        REVIEW.WHITE
      ) {

        result.innerHTML = `
          <strong>
            白棋勝利
          </strong>

          <span>
            第 ${findWinningMoveNumber(game)} 手完成五連
          </span>
        `;

      } else if (
        game.draw
      ) {

        result.innerHTML = `
          <strong>
            平局
          </strong>

          <span>
            棋盤已沒有空位
          </span>
        `;

      } else {

        result.innerHTML = `
          <strong>
            棋局資料
          </strong>

          <span>
            尚未判定勝負
          </span>
        `;

      }

    }

  }


  function findWinningMoveNumber(
    game
  ) {

    if (
      !game.winner
    ) {

      return "-";

    }


    for (
      let i = 0;
      i < game.moves.length;
      i += 1
    ) {

      const board =
        boardAtMove(
          game.moves,
          i + 1
        );


      const move =
        game.moves[i];


      const line =
        getWinningLine(
          board,
          move.row,
          move.col,
          move.player
        );


      if (
        line.length >=
        REVIEW.WIN
      ) {

        return i + 1;

      }

    }


    return game.moves.length;

  }


  /*
   * =========================================================
   * MOVE LIST
   * =========================================================
   */

  function renderMoves() {

    const list =
      document.querySelector(
        "#gomokuReviewMovesV2"
      );


    const game =
      state.activeGame;


    if (
      !list ||
      !game
    ) {

      return;

    }


    list.innerHTML =
      "";


    game.moves.forEach(
      (
        move,
        index
      ) => {

        const button =
          document.createElement(
            "button"
          );


        button.type =
          "button";


        button.className =
          "gomoku-review-move-v2";


        if (
          index + 1 ===
          state.currentMove
        ) {

          button.classList.add(
            "selected"
          );

        }


        const player =
          move.player ===
          REVIEW.BLACK
            ? "黑棋"
            : "白棋";


        button.innerHTML = `
          <span
            class="gomoku-review-move-number-v2"
          >
            ${index + 1}
          </span>

          <strong
            class="gomoku-review-move-player-v2"
          >
            ${player}
          </strong>

          <span
            class="gomoku-review-move-coordinate-v2"
          >
            ${coordinate(
              move.row,
              move.col
            )}
          </span>
        `;


        button.addEventListener(
          "click",
          () => {

            stop();

            setMove(
              index + 1
            );

          }
        );


        list.appendChild(
          button
        );

      }
    );


    list
      .querySelector(
        ".selected"
      )
      ?.scrollIntoView({
        block:
          "nearest"
      });

  }


  /*
   * =========================================================
   * CONTROLS
   * =========================================================
   */

  function handleAction(
    action
  ) {

    const game =
      state.activeGame;


    if (!game) {
      return;
    }


    switch (action) {

      case "first":

        stop();

        setMove(
          0
        );

        break;


      case "prev":

        stop();

        setMove(
          Math.max(
            0,
            state.currentMove - 1
          )
        );

        break;


      case "play":

        togglePlayback();

        break;


      case "next":

        stop();

        setMove(
          Math.min(
            game.moves.length,
            state.currentMove + 1
          )
        );

        break;


      case "last":

        stop();

        setMove(
          game.moves.length
        );

        break;

    }

  }


  function setMove(
    count
  ) {

    const game =
      state.activeGame;


    if (!game) {
      return;
    }


    state.currentMove =
      Math.max(
        0,
        Math.min(
          game.moves.length,
          Number(count) || 0
        )
      );


    renderBoard();

  }


  /*
   * =========================================================
   * PLAYBACK
   * =========================================================
   */

  function togglePlayback() {

    if (
      state.playing
    ) {

      stop();

      return;

    }


    const game =
      state.activeGame;


    if (!game) {
      return;
    }


    if (
      state.currentMove >=
      game.moves.length
    ) {

      setMove(
        0
      );

    }


    state.playing =
      true;


    updatePlayButton();


    state.timer =
      window.setInterval(
        () => {

          if (
            !state.activeGame
          ) {

            stop();

            return;

          }


          if (
            state.currentMove >=
            state.activeGame.moves.length
          ) {

            stop();

            return;

          }


          setMove(
            state.currentMove + 1
          );

        },
        REVIEW.PLAY_INTERVAL
      );

  }


  function stop() {

    state.playing =
      false;


    clearInterval(
      state.timer
    );


    state.timer =
      null;


    updatePlayButton();

  }


  function updatePlayButton() {

    const button =
      document.querySelector(
        '[data-review-v2="play"]'
      );


    if (!button) {
      return;
    }


    button.textContent =
      state.playing
        ? "暫停"
        : "播放";

  }


  /*
   * =========================================================
   * OPEN / CLOSE
   * =========================================================
   */

  function open(
    game
  ) {

    if (!game) {
      return;
    }


    ensureUI();


    state.activeGame =
      game;


    state.currentMove =
      game.moves.length;


    state.playing =
      false;


    clearInterval(
      state.timer
    );


    state.timer =
      null;


    const overlay =
      document.querySelector(
        "#gomokuReviewOverlayV2"
      );


    if (!overlay) {
      return;
    }


    overlay.classList.add(
      "open"
    );


    document.body.style.overflow =
      "hidden";


    renderBoard();

    updatePlayButton();

  }


  function close() {

    stop();


    const overlay =
      document.querySelector(
        "#gomokuReviewOverlayV2"
      );


    overlay?.classList.remove(
      "open"
    );


    document.body.style.overflow =
      "";

  }


  /*
   * =========================================================
   * RESULT BUTTON
   * =========================================================
   */

  function ensureResultButton() {

    const resultScreen =
      document.querySelector(
        "#resultScreen"
      );


    const actions =
      resultScreen?.querySelector(
        ".result-actions"
      );


    if (
      !actions
    ) {

      return;

    }


    let button =
      document.querySelector(
        "#gomokuOpenReviewV2"
      );


    if (button) {
      return;
    }


    button =
      document.createElement(
        "button"
      );


    button.type =
      "button";


    button.id =
      "gomokuOpenReviewV2";


    button.className =
      "secondary-button full-button";


    button.textContent =
      "這局回顧";


    button.addEventListener(
      "click",
      () => {

        const game =
          getLatestGame();


        if (!game) {

          return;

        }


        open(
          game
        );

      }
    );


    actions.appendChild(
      button
    );

  }


  function updateResultButton() {

    ensureResultButton();

  }


  /*
   * =========================================================
   * RECORDS INTEGRATION
   * =========================================================
   */

  function refreshRecordsReviewButtons() {

    const recordList =
      document.querySelector(
        "#recordList"
      );


    if (!recordList) {
      return;
    }


    const items =
      Array.from(
        recordList.children
      );


    if (!items.length) {
      return;
    }


    /*
     * Existing records are rendered by the original app.
     *
     * We attach review buttons by record order.
     * state.games is also newest-first.
     */

    items.forEach(
      (
        item,
        index
      ) => {

        if (
          item.querySelector(
            ".gomoku-review-record-button-v2"
          )
        ) {

          return;

        }


        const game =
          state.games[index];


        if (!game) {
          return;
        }


        const button =
          document.createElement(
            "button"
          );


        button.type =
          "button";


        button.className =
          "gomoku-review-record-button-v2";


        button.textContent =
          "回顧這局";


        button.addEventListener(
          "click",
          event => {

            event.preventDefault();

            event.stopPropagation();

            open(
              game
            );

          }
        );


        item.appendChild(
          button
        );

      }
    );

  }


  /*
   * =========================================================
   * GETTERS
   * =========================================================
   */

  function getLatestGame() {

    return (
      state.games[0] ||
      null
    );

  }


  /*
   * =========================================================
   * CLEAR RECORDS SYNC
   * =========================================================
   */

  function installClearRecordsHook() {

    const button =
      document.querySelector(
        "#clearRecordsButton"
      );


    if (!button) {
      return;
    }


    button.addEventListener(
      "click",
      () => {

        window.setTimeout(
          () => {

            /*
             * The original app resets its statistics.
             * Keep review storage consistent with it.
             */

            state.games =
              [];

            saveGames();

            refreshRecordsReviewButtons();

          },
          0
        );

      }
    );

  }


  /*
   * =========================================================
   * KEYBOARD
   * =========================================================
   */

  function installKeyboard() {

    document.addEventListener(
      "keydown",
      event => {

        const overlay =
          document.querySelector(
            "#gomokuReviewOverlayV2"
          );


        if (
          !overlay ||
          !overlay.classList.contains(
            "open"
          )
        ) {

          return;

        }


        if (
          event.key ===
          "Escape"
        ) {

          event.preventDefault();

          close();

          return;

        }


        if (
          event.key ===
          "ArrowLeft"
        ) {

          event.preventDefault();

          stop();

          setMove(
            state.currentMove - 1
          );

          return;

        }


        if (
          event.key ===
          "ArrowRight"
        ) {

          event.preventDefault();

          stop();

          setMove(
            state.currentMove + 1
          );

          return;

        }


        if (
          event.key ===
          " "
        ) {

          event.preventDefault();

          togglePlayback();

        }

      }
    );

  }


  /*
   * =========================================================
   * PUBLIC API
   * =========================================================
   */

  window.GomokuReviewV2 = {

    open,

    close,

    getGames() {
      return state.games.slice();
    },

    getLatest() {
      return getLatestGame();
    }

  };


  /*
   * =========================================================
   * BOOT
   * =========================================================
   */

  function init() {

    state.games =
      loadGames();


    installStorageHook();

    installResultObserver();

    installKeyboard();

    installClearRecordsHook();


    /*
     * The original app creates some UI during init.
     * Give it one frame before attaching our controls.
     */

    window.requestAnimationFrame(
      () => {

        ensureUI();

        ensureResultButton();

        refreshRecordsReviewButtons();

      }
    );


    /*
     * Records screen can be rendered later by the
     * original app, so keep checking only when needed.
     */

    const recordsScreen =
      document.querySelector(
        "#recordsScreen"
      );


    if (recordsScreen) {

      const observer =
        new MutationObserver(
          () => {

            if (
              recordsScreen.classList.contains(
                "active"
              )
            ) {

              refreshRecordsReviewButtons();

            }

          }
        );


      observer.observe(
        recordsScreen,
        {
          attributes:
            true,

          attributeFilter:
            [
              "class"
            ]
        }
      );

    }


    /*
     * Also retry the result button once after boot.
     */

    window.setTimeout(
      () => {

        ensureResultButton();

      },
      300
    );

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once:
          true
      }
    );

  } else {

    init();

  }

})();
