/* =========================================================
   GOMOKU
   Canvas Game + AI Characters + AI OS + Statistics
   No backend
   ========================================================= */

(() => {
  "use strict";

  /* =========================================================
     CONFIG
     ========================================================= */

  const CONFIG = {
    BOARD_SIZE: 15,
    WIN_LENGTH: 5,

    EMPTY: 0,
    PLAYER: 1,
    AI: 2,

    STORAGE_KEY: "gomoku-game-data-v2",
    SETTINGS_KEY: "gomoku-settings-v2",

    AI_WORKER: "./ai-worker.js",

    THINKING_MIN: 420,
    THINKING_MAX: 1200,

    BOARD_PADDING: 0.075,

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

  /* =========================================================
     AI CHARACTERS
     ========================================================= */

  const AI_CHARACTERS = {
    mio: {
      id: "mio",

      name: {
        "zh-TW": "Mio",
        "zh-CN": "Mio",
        en: "Mio",
        ja: "ミオ",
        ko: "미오"
      },

      description: {
        "zh-TW": "溫和、防守型",
        "zh-CN": "温和、防守型",
        en: "Gentle defender",
        ja: "やさしい守備型",
        ko: "차분한 수비형"
      },

      worker: {
        depth: 1,
        radius: 2,
        randomTop: 3
      },

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
      id: "rin",

      name: {
        "zh-TW": "Rin",
        "zh-CN": "Rin",
        en: "Rin",
        ja: "リン",
        ko: "린"
      },

      description: {
        "zh-TW": "積極、進攻型",
        "zh-CN": "积极、进攻型",
        en: "Aggressive attacker",
        ja: "積極的な攻撃型",
        ko: "공격적인 타입"
      },

      worker: {
        depth: 2,
        radius: 2,
        randomTop: 2
      },

      os: {
        thinking: [
          "嘿嘿，這裡可以進攻。",
          "等等……我看到一個機會。",
          "這次我要主動出擊。"
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
      id: "sora",

      name: {
        "zh-TW": "Sora",
        "zh-CN": "Sora",
        en: "Sora",
        ja: "ソラ",
        ko: "소라"
      },

      description: {
        "zh-TW": "冷靜、平衡型",
        "zh-CN": "冷静、平衡型",
        en: "Calm balanced AI",
        ja: "冷静なバランス型",
        ko: "차분한 밸런스형"
      },

      worker: {
        depth: 2,
        radius: 2,
        randomTop: 1
      },

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
      id: "kuro",

      name: {
        "zh-TW": "Kuro",
        "zh-CN": "Kuro",
        en: "Kuro",
        ja: "クロ",
        ko: "쿠로"
      },

      description: {
        "zh-TW": "神秘、陷阱型",
        "zh-CN": "神秘、陷阱型",
        en: "Tricky strategist",
        ja: "謎めいたトリッキー型",
        ko: "신비로운 전략형"
      },

      worker: {
        depth: 2,
        radius: 2,
        randomTop: 2
      },

      os: {
        thinking: [
          "……再等等。",
          "你注意到那裡了嗎？",
          "……有趣。"
        ],
        attack: [
          "……現在。",
          "我想看看你會怎麼回應。",
          "這一步，會改變局面。"
        ],
        defend: [
          "……不能讓你繼續。",
          "先封住。",
          "你的路，到這裡。"
        ],
        danger: [
          "……你看到了。",
          "麻煩了。",
          "這一步，比預想中更危險。"
        ],
        winning: [
          "……結束了。",
          "你已經沒有太多選擇。",
          "最後一步。"
        ],
        losing: [
          "……還沒結束。",
          "我還有路。",
          "不要太早下結論。"
        ],
        surprise: [
          "……哦？",
          "沒想到。",
          "你比我想像中更快。"
        ]
      }
    },

    nagi: {
      id: "nagi",

      name: {
        "zh-TW": "Nagi",
        "zh-CN": "Nagi",
        en: "Nagi",
        ja: "ナギ",
        ko: "나기"
      },

      description: {
        "zh-TW": "精準、反擊型",
        "zh-CN": "精准、反击型",
        en: "Precise counter player",
        ja: "正確なカウンター型",
        ko: "정밀한 반격형"
      },

      worker: {
        depth: 3,
        radius: 2,
        randomTop: 1
      },

      os: {
        thinking: [
          "先處理你的威脅。",
          "我在找最穩定的解。",
          "這一步需要精確一點。"
        ],
        attack: [
          "現在可以反擊。",
          "你的防線出現空隙了。",
          "這裡可以建立威脅。"
        ],
        defend: [
          "這一步需要先防守。",
          "不能忽略這個威脅。",
          "先把你的攻勢拆掉。"
        ],
        danger: [
          "你的威脅已經很明顯。",
          "這裡不能犯錯。",
          "局面正在失衡。"
        ],
        winning: [
          "優勢已經形成。",
          "這裡可以結束。",
          "勝負接近確定。"
        ],
        losing: [
          "仍然存在反擊路線。",
          "我還有選擇。",
          "局面尚未確定。"
        ],
        surprise: [
          "這一步值得重新計算。",
          "你的選擇改變了局面。",
          "需要重新評估。"
        ]
      }
    },

    rei: {
      id: "rei",

      name: {
        "zh-TW": "Rei",
        "zh-CN": "Rei",
        en: "Rei",
        ja: "レイ",
        ko: "레이"
      },

      description: {
        "zh-TW": "沉默、高手型",
        "zh-CN": "沉默、高手型",
        en: "Silent master",
        ja: "静かな達人型",
        ko: "조용한 고수형"
      },

      worker: {
        depth: 3,
        radius: 2,
        randomTop: 0
      },

      os: {
        thinking: [
          "……",
          "分析中。",
          "……等等。"
        ],
        attack: [
          "……現在。",
          "這裡。",
          "可以了。"
        ],
        defend: [
          "……防守。",
          "不能放。",
          "封鎖。"
        ],
        danger: [
          "……危險。",
          "你找到機會了。",
          "這一步不能錯。"
        ],
        winning: [
          "……結束。",
          "最後一步。",
          "勝負已定。"
        ],
        losing: [
          "……還有機會。",
          "重新計算。",
          "還沒結束。"
        ],
        surprise: [
          "……。",
          "意外。",
          "重新計算。"
        ]
      }
    }
  };

  /* =========================================================
     STATE
     ========================================================= */

  let board = createBoard();

  let currentPlayer = CONFIG.PLAYER;
  let gameOver = false;
  let aiThinking = false;

  let selectedAI = "sora";
  let selectedDifficulty = "normal";
  let selectedMode = "ai";
  let playerSide = "black";

  let moveHistory = [];
  let winningLine = [];

  let lastMove = null;

  let canvas = null;
  let ctx = null;

  let boardRect = null;
  let cellSize = 0;
  let boardOrigin = 0;

  let worker = null;
  let workerRequestId = 0;

  let stats = loadStats();
  let settings = loadSettings();

  let audioContext = null;

  /* =========================================================
     DOM
     ========================================================= */

  const DOM = {};

  function cacheDOM() {
    DOM.homeScreen = document.querySelector("#homeScreen");
    DOM.setupScreen = document.querySelector("#setupScreen");
    DOM.gameScreen = document.querySelector("#gameScreen");
    DOM.resultScreen = document.querySelector("#resultScreen");
    DOM.recordsScreen = document.querySelector("#recordsScreen");
    DOM.settingsScreen = document.querySelector("#settingsScreen");

    DOM.startButton = document.querySelector("#startButton");
    DOM.recordsButton = document.querySelector("#recordsButton");
    DOM.settingsButton = document.querySelector("#settingsButton");

    DOM.beginGameButton = document.querySelector("#beginGameButton");

    DOM.modeControl = document.querySelector("#modeControl");
    DOM.difficultyGroup = document.querySelector("#difficultyGroup");

    DOM.undoButton = document.querySelector("#undoButton");
    DOM.restartButton = document.querySelector("#restartButton");
    DOM.gameMenuButton = document.querySelector("#gameMenuButton");

    DOM.playAgainButton = document.querySelector("#playAgainButton");
    DOM.resultHomeButton = document.querySelector("#resultHomeButton");

    DOM.clearRecordsButton =
      document.querySelector("#clearRecordsButton");

    DOM.languageSelect =
      document.querySelector("#languageSelect");

    DOM.soundToggle =
      document.querySelector("#soundToggle");

    DOM.motionToggle =
      document.querySelector("#motionToggle");

    DOM.themeSelect =
      document.querySelector("#themeSelect");

    DOM.turnStone =
      document.querySelector("#turnStone");

    DOM.turnLabel =
      document.querySelector("#turnLabel");

    DOM.turnPlayer =
      document.querySelector("#turnPlayer");

    DOM.thinkingIndicator =
      document.querySelector("#thinkingIndicator");

    DOM.resultMark =
      document.querySelector("#resultMark");

    DOM.resultKicker =
      document.querySelector("#resultKicker");

    DOM.resultTitle =
      document.querySelector("#resultTitle");

    DOM.resultDescription =
      document.querySelector("#resultDescription");

    DOM.statGames =
      document.querySelector("#statGames");

    DOM.statWins =
      document.querySelector("#statWins");

    DOM.statLosses =
      document.querySelector("#statLosses");

    DOM.statDraws =
      document.querySelector("#statDraws");

    DOM.recordList =
      document.querySelector("#recordList");

    DOM.resumeCard =
      document.querySelector("#resumeCard");

    DOM.resumeText =
      document.querySelector("#resumeText");

    DOM.resumeButton =
      document.querySelector("#resumeButton");

    DOM.toast =
      document.querySelector("#toast");

    canvas =
      document.querySelector("#boardCanvas");

    ctx =
      canvas?.getContext("2d");

    createGamePanel();
  }

  /* =========================================================
     AI PANEL
     ========================================================= */

  function createGamePanel() {
    if (!DOM.gameScreen) return;

    const existing =
      document.querySelector("#aiGamePanel");

    if (existing) {
      existing.remove();
    }

    const panel =
      document.createElement("aside");

    panel.id = "aiGamePanel";
    panel.className = "ai-game-panel";

    panel.innerHTML = `
      <div class="ai-panel-header">
        <div>
          <span class="ai-panel-kicker">AI</span>
          <strong id="aiName">Sora</strong>
        </div>

        <select id="aiSelect" aria-label="AI">
          ${Object.values(AI_CHARACTERS)
            .map(
              ai =>
                `<option value="${ai.id}">
                  ${ai.name["zh-TW"]}
                </option>`
            )
            .join("")}
        </select>
      </div>

      <div class="ai-panel-description" id="aiDescription"></div>

      <div class="ai-os">
        <span class="ai-os-label">OS</span>
        <p id="aiOS" aria-live="polite"></p>
      </div>

      <div class="ai-stats">
        <div>
          <span>勝</span>
          <strong id="aiWins">0</strong>
        </div>
        <div>
          <span>負</span>
          <strong id="aiLosses">0</strong>
        </div>
      </div>
    `;

    const layout =
      DOM.gameScreen.querySelector(".game-layout");

    if (layout) {
      layout.appendChild(panel);
    }

    DOM.aiPanel = panel;
    DOM.aiName =
      panel.querySelector("#aiName");
    DOM.aiSelect =
      panel.querySelector("#aiSelect");
    DOM.aiDescription =
      panel.querySelector("#aiDescription");
    DOM.aiOS =
      panel.querySelector("#aiOS");
    DOM.aiWins =
      panel.querySelector("#aiWins");
    DOM.aiLosses =
      panel.querySelector("#aiLosses");

    injectPanelStyles();
  }

  function injectPanelStyles() {
    if (document.querySelector("#gomoku-app-runtime-style")) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "gomoku-app-runtime-style";

    style.textContent = `
      .ai-game-panel {
        width: min(100%, 430px);
        margin: 0 auto;
        padding: 16px 18px;
        border: 1px solid rgba(80, 60, 40, .12);
        border-radius: 18px;
        background: rgba(255,255,255,.42);
        box-sizing: border-box;
        backdrop-filter: blur(12px);
      }

      .ai-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .ai-panel-kicker {
        display: block;
        font-size: 10px;
        letter-spacing: .18em;
        opacity: .55;
        margin-bottom: 2px;
      }

      .ai-panel-header strong {
        font-size: 20px;
      }

      .ai-panel-header select {
        border: 1px solid rgba(80,60,40,.15);
        border-radius: 10px;
        padding: 7px 10px;
        background: rgba(255,255,255,.65);
        font: inherit;
      }

      .ai-panel-description {
        margin-top: 4px;
        font-size: 12px;
        opacity: .58;
      }

      .ai-os {
        margin-top: 14px;
        padding: 11px 13px;
        border-radius: 13px;
        background: rgba(60,45,30,.055);
      }

      .ai-os-label {
        display: block;
        font-size: 9px;
        letter-spacing: .18em;
        opacity: .45;
        margin-bottom: 3px;
      }

      .ai-os p {
        min-height: 20px;
        margin: 0;
        font-size: 13px;
        line-height: 1.5;
        opacity: .78;
        transition: opacity .18s ease, transform .18s ease;
      }

      .ai-os p.is-changing {
        opacity: 0;
        transform: translateY(3px);
      }

      .ai-stats {
        display: flex;
        gap: 22px;
        margin-top: 12px;
      }

      .ai-stats div {
        display: flex;
        align-items: baseline;
        gap: 6px;
      }

      .ai-stats span {
        font-size: 11px;
        opacity: .5;
      }

      .ai-stats strong {
        font-size: 15px;
      }

      .board-wrapper {
        position: relative;
      }

      #boardCanvas {
        display: block;
        width: 100%;
        max-width: 680px;
        aspect-ratio: 1;
        touch-action: none;
        cursor: pointer;
        outline: none;
      }

      #boardCanvas:focus-visible {
        outline: 2px solid rgba(90,120,130,.7);
        outline-offset: 4px;
        border-radius: 8px;
      }

      .game-screen .game-layout {
        gap: 16px;
      }

      @media (min-width: 900px) {
        .game-screen .game-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(270px, 360px);
          align-items: start;
        }

        .game-screen .game-status,
        .game-screen .board-wrapper,
        .game-screen .game-actions {
          grid-column: 1;
        }

        .game-screen .ai-game-panel {
          grid-column: 2;
          grid-row: 1 / span 3;
          position: sticky;
          top: 20px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* =========================================================
     INIT
     ========================================================= */

  function init() {
    cacheDOM();

    applySettings();

    setupNavigation();
    setupSetupControls();
    setupGameControls();
    setupSettingsControls();
    setupCanvas();

    createWorker();

    renderStats();
    updateAIUI();
    updateTurnUI();

    checkResumeGame();

    window.addEventListener(
      "resize",
      resizeCanvas,
      { passive: true }
    );

    document.addEventListener(
      "visibilitychange",
      () => {
        if (!document.hidden && DOM.gameScreen?.classList.contains("active")) {
          resizeCanvas();
          drawBoard();
        }
      }
    );

    showScreen("home");

    resizeCanvas();
    drawBoard();
  }

  /* =========================================================
     NAVIGATION
     ========================================================= */

  function setupNavigation() {
    DOM.startButton?.addEventListener(
      "click",
      () => showScreen("setup")
    );

    DOM.recordsButton?.addEventListener(
      "click",
      () => {
        renderStats();
        showScreen("records");
      }
    );

    DOM.settingsButton?.addEventListener(
      "click",
      () => showScreen("settings")
    );

    DOM.beginGameButton?.addEventListener(
      "click",
      beginGame
    );

    DOM.resultHomeButton?.addEventListener(
      "click",
      () => showScreen("home")
    );

    DOM.playAgainButton?.addEventListener(
      "click",
      () => {
        resetGame();
        showScreen("game");
      }
    );

    DOM.gameMenuButton?.addEventListener(
      "click",
      () => showScreen("setup")
    );

    DOM.resumeButton?.addEventListener(
      "click",
      resumeGame
    );

    const back =
      document.querySelector("#backButton");

    back?.addEventListener(
      "click",
      () => {
        const active =
          document.querySelector(".screen.active");

        if (active === DOM.homeScreen) {
          return;
        }

        if (active === DOM.setupScreen ||
            active === DOM.recordsScreen ||
            active === DOM.settingsScreen) {
          showScreen("home");
          return;
        }

        if (active === DOM.gameScreen) {
          showScreen("home");
          return;
        }

        if (active === DOM.resultScreen) {
          showScreen("home");
        }
      }
    );

    const menu =
      document.querySelector("#menuButton");

    menu?.addEventListener(
      "click",
      () => showScreen("settings")
    );
  }

  function showScreen(name) {
    const map = {
      home: DOM.homeScreen,
      setup: DOM.setupScreen,
      game: DOM.gameScreen,
      result: DOM.resultScreen,
      records: DOM.recordsScreen,
      settings: DOM.settingsScreen
    };

    Object.values(map).forEach(
      screen => {
        screen?.classList.remove("active");
      }
    );

    map[name]?.classList.add("active");

    if (name === "game") {
      requestAnimationFrame(() => {
        resizeCanvas();
        drawBoard();
      });
    }

    if (name === "records") {
      renderStats();
    }
  }

  /* =========================================================
     SETUP
     ========================================================= */

  function setupSetupControls() {
    DOM.modeControl
      ?.querySelectorAll("[data-mode]")
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            selectedMode =
              button.dataset.mode;

            DOM.modeControl
              .querySelectorAll("[data-mode]")
              .forEach(
                b =>
                  b.classList.toggle(
                    "selected",
                    b === button
                  )
              );

            if (DOM.difficultyGroup) {
              DOM.difficultyGroup.hidden =
                selectedMode !== "ai";
            }
          }
        );
      });

    document
      .querySelectorAll("[data-difficulty]")
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            selectedDifficulty =
              button.dataset.difficulty;

            document
              .querySelectorAll("[data-difficulty]")
              .forEach(
                b =>
                  b.classList.toggle(
                    "selected",
                    b === button
                  )
              );
          }
        );
      });

    document
      .querySelectorAll("[data-side]")
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            playerSide =
              button.dataset.side;

            document
              .querySelectorAll("[data-side]")
              .forEach(
                b =>
                  b.classList.toggle(
                    "selected",
                    b === button
                  )
              );
          }
        );
      });
  }

  function beginGame() {
    saveSettings();

    resetGame();

    showScreen("game");

    if (
      selectedMode === "ai" &&
      playerSide === "white"
    ) {
      currentPlayer = CONFIG.AI;

      updateTurnUI();

      runAITurn();
    }
  }

  /* =========================================================
     GAME CONTROLS
     ========================================================= */

  function setupGameControls() {
    DOM.restartButton?.addEventListener(
      "click",
      () => {
        resetGame();
        showToast("棋局已重新開始");
      }
    );

    DOM.undoButton?.addEventListener(
      "click",
      undoMove
    );
  }

  /* =========================================================
     CANVAS
     ========================================================= */

  function setupCanvas() {
    if (!canvas) return;

    canvas.addEventListener(
      "pointerdown",
      event => {
        if (
          gameOver ||
          aiThinking
        ) {
          return;
        }

        if (
          selectedMode === "ai" &&
          currentPlayer !== CONFIG.PLAYER
        ) {
          return;
        }

        const point =
          canvasToBoard(event);

        if (!point) return;

        placePlayerMove(
          point.row,
          point.col
        );
      }
    );

    canvas.addEventListener(
      "keydown",
      event => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
        }
      }
    );
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return;

    const rect =
      canvas.getBoundingClientRect();

    const size =
      Math.max(
        280,
        Math.floor(rect.width || 600)
      );

    const dpr =
      Math.min(
        window.devicePixelRatio || 1,
        2
      );

    canvas.width =
      Math.floor(size * dpr);

    canvas.height =
      Math.floor(size * dpr);

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    boardRect = {
      width: size,
      height: size
    };

    boardOrigin =
      size * CONFIG.BOARD_PADDING;

    cellSize =
      (size - boardOrigin * 2) /
      (CONFIG.BOARD_SIZE - 1);

    drawBoard();
  }

  function drawBoard() {
    if (
      !canvas ||
      !ctx ||
      !boardRect
    ) {
      return;
    }

    const size =
      boardRect.width;

    ctx.clearRect(
      0,
      0,
      size,
      size
    );

    drawBoardBackground(
      size
    );

    drawGrid();

    drawStars();

    drawStones();

    drawLastMove();

    drawWinningLine();
  }

  function drawBoardBackground(size) {
    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        size,
        size
      );

    gradient.addColorStop(
      0,
      "#f0dfb9"
    );

    gradient.addColorStop(
      1,
      CONFIG.COLORS.board
    );

    ctx.fillStyle =
      gradient;

    ctx.fillRect(
      0,
      0,
      size,
      size
    );
  }

  function drawGrid() {
    ctx.save();

    ctx.strokeStyle =
      CONFIG.COLORS.grid;

    ctx.globalAlpha = 0.72;

    ctx.lineWidth = 1;

    for (
      let i = 0;
      i < CONFIG.BOARD_SIZE;
      i++
    ) {
      const p =
        boardOrigin +
        i * cellSize;

      ctx.beginPath();
      ctx.moveTo(
        boardOrigin,
        p
      );
      ctx.lineTo(
        boardOrigin +
          (CONFIG.BOARD_SIZE - 1) *
            cellSize,
        p
      );
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(
        p,
        boardOrigin
      );
      ctx.lineTo(
        p,
        boardOrigin +
          (CONFIG.BOARD_SIZE - 1) *
            cellSize
      );
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawStars() {
    const stars = [
      [3, 3],
      [3, 11],
      [7, 7],
      [11, 3],
      [11, 11]
    ];

    ctx.save();

    ctx.fillStyle =
      CONFIG.COLORS.star;

    for (const [row, col] of stars) {
      const {
        x,
        y
      } =
        boardToCanvas(
          row,
          col
        );

      ctx.beginPath();

      ctx.arc(
        x,
        y,
        Math.max(
          2.5,
          cellSize * 0.08
        ),
        0,
        Math.PI * 2
      );

      ctx.fill();
    }

    ctx.restore();
  }

  function drawStones() {
    for (
      let row = 0;
      row < CONFIG.BOARD_SIZE;
      row++
    ) {
      for (
        let col = 0;
        col < CONFIG.BOARD_SIZE;
        col++
      ) {
        const value =
          board[row][col];

        if (
          value === CONFIG.EMPTY
        ) {
          continue;
        }

        drawStone(
          row,
          col,
          value
        );
      }
    }
  }

  function drawStone(
    row,
    col,
    player
  ) {
    const {
      x,
      y
    } =
      boardToCanvas(
        row,
        col
      );

    const radius =
      cellSize * 0.43;

    ctx.save();

    ctx.shadowBlur =
      radius * 0.18;

    ctx.shadowOffsetY =
      radius * 0.08;

    if (
      player === CONFIG.PLAYER
    ) {
      ctx.shadowColor =
        "rgba(0,0,0,.32)";

      const gradient =
        ctx.createRadialGradient(
          x - radius * 0.35,
          y - radius * 0.4,
          radius * 0.05,
          x,
          y,
          radius
        );

      gradient.addColorStop(
        0,
        CONFIG.COLORS.blackHighlight
      );

      gradient.addColorStop(
        1,
        CONFIG.COLORS.black
      );

      ctx.fillStyle =
        gradient;
    } else {
      ctx.shadowColor =
        "rgba(0,0,0,.2)";

      const gradient =
        ctx.createRadialGradient(
          x - radius * 0.32,
          y - radius * 0.35,
          radius * 0.05,
          x,
          y,
          radius
        );

      gradient.addColorStop(
        0,
        "#ffffff"
      );

      gradient.addColorStop(
        0.72,
        CONFIG.COLORS.white
      );

      gradient.addColorStop(
        1,
        CONFIG.COLORS.whiteShadow
      );

      ctx.fillStyle =
        gradient;
    }

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }

  function drawLastMove() {
    if (!lastMove) return;

    const {
      x,
      y
    } =
      boardToCanvas(
        lastMove.row,
        lastMove.col
      );

    ctx.save();

    ctx.strokeStyle =
      CONFIG.COLORS.lastMove;

    ctx.lineWidth =
      Math.max(
        1.5,
        cellSize * 0.06
      );

    const size =
      cellSize * 0.18;

    ctx.beginPath();

    ctx.moveTo(
      x - size,
      y
    );

    ctx.lineTo(
      x + size,
      y
    );

    ctx.moveTo(
      x,
      y - size
    );

    ctx.lineTo(
      x,
      y + size
    );

    ctx.stroke();

    ctx.restore();
  }

  function drawWinningLine() {
    if (
      winningLine.length <
      CONFIG.WIN_LENGTH
    ) {
      return;
    }

    const first =
      boardToCanvas(
        winningLine[0].row,
        winningLine[0].col
      );

    const last =
      boardToCanvas(
        winningLine[
          winningLine.length - 1
        ].row,
        winningLine[
          winningLine.length - 1
        ].col
      );

    ctx.save();

    ctx.strokeStyle =
      CONFIG.COLORS.winning;

    ctx.lineWidth =
      Math.max(
        3,
        cellSize * 0.13
      );

    ctx.lineCap =
      "round";

    ctx.globalAlpha =
      0.88;

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

  function boardToCanvas(
    row,
    col
  ) {
    return {
      x:
        boardOrigin +
        col * cellSize,

      y:
        boardOrigin +
        row * cellSize
    };
  }

  function canvasToBoard(event) {
    if (
      !canvas ||
      !boardRect
    ) {
      return null;
    }

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
        (x - boardOrigin) /
          cellSize
      );

    const row =
      Math.round(
        (y - boardOrigin) /
          cellSize
      );

    if (
      !isInside(row, col)
    ) {
      return null;
    }

    const target =
      boardToCanvas(
        row,
        col
      );

    const distance =
      Math.hypot(
        x - target.x,
        y - target.y
      );

    if (
      distance >
      cellSize * 0.48
    ) {
      return null;
    }

    return {
      row,
      col
    };
  }

  /* =========================================================
     PLAYER MOVE
     ========================================================= */

  function placePlayerMove(
    row,
    col
  ) {
    if (
      board[row][col] !==
      CONFIG.EMPTY
    ) {
      return;
    }

    if (
      !makeMove(
        row,
        col,
        CONFIG.PLAYER
      )
    ) {
      return;
    }

    playStoneSound();

    drawBoard();

    saveCurrentGame();

    if (
      checkWin(
        board,
        row,
        col,
        CONFIG.PLAYER
      )
    ) {
      finishGame("win");
      return;
    }

    if (isBoardFull()) {
      finishGame("draw");
      return;
    }

    currentPlayer =
      selectedMode === "local"
        ? CONFIG.AI
        : CONFIG.AI;

    updateTurnUI();

    if (
      selectedMode === "ai"
    ) {
      runAITurn();
    } else {
      aiThinking = false;
      updateTurnUI();
    }
  }

  /* =========================================================
     AI TURN
     ========================================================= */

  async function runAITurn() {
    if (
      gameOver ||
      currentPlayer !== CONFIG.AI
    ) {
      return;
    }

    aiThinking = true;

    updateTurnUI();

    const ai =
      getSelectedAI();

    showOS(
      "thinking",
      ai
    );

    const threatBefore =
      getThreatState();

    const thinkingTime =
      getThinkingTime(ai);

    await delay(
      thinkingTime
    );

    if (
      gameOver ||
      currentPlayer !== CONFIG.AI
    ) {
      return;
    }

    let move =
      await askWorker(ai);

    if (
      !move ||
      !isInside(
        move.row,
        move.col
      ) ||
      board[move.row][move.col] !==
        CONFIG.EMPTY
    ) {
      move =
        fallbackAIMove(ai);
    }

    if (!move) {
      finishGame("draw");
      return;
    }

    const threatAfter =
      classifyAIMove(
        move,
        threatBefore
      );

    showOS(
      threatAfter,
      ai
    );

    await delay(
      settings.motion
        ? 180
        : 0
    );

    if (gameOver) return;

    makeMove(
      move.row,
      move.col,
      CONFIG.AI
    );

    playStoneSound();

    drawBoard();

    saveCurrentGame();

    if (
      checkWin(
        board,
        move.row,
        move.col,
        CONFIG.AI
      )
    ) {
      finishGame("loss");
      return;
    }

    if (isBoardFull()) {
      finishGame("draw");
      return;
    }

    currentPlayer =
      CONFIG.PLAYER;

    aiThinking = false;

    updateTurnUI();

    showOS(
      "thinking",
      ai
    );
  }

  function getThinkingTime(ai) {
    const difficulty =
      getDifficultyConfig();

    const base =
      CONFIG.THINKING_MIN +
      difficulty.delay;

    const depth =
      ai.worker.depth * 90;

    const random =
      Math.random() *
      280;

    return Math.min(
      CONFIG.THINKING_MAX,
      base + depth + random
    );
  }

  /* =========================================================
     WORKER
     ========================================================= */

  function createWorker() {
    if (
      typeof Worker ===
      "undefined"
    ) {
      return;
    }

    try {
      worker =
        new Worker(
          CONFIG.AI_WORKER
        );
    } catch {
      worker = null;
    }
  }

  function askWorker(ai) {
    return new Promise(
      resolve => {
        if (!worker) {
          resolve(
            fallbackAIMove(ai)
          );
          return;
        }

        const request =
          ++workerRequestId;

        const timeout =
          setTimeout(
            () => {
              resolve(
                fallbackAIMove(ai)
              );
            },
            5000
          );

        const handler =
          event => {
            clearTimeout(
              timeout
            );

            worker.removeEventListener(
              "message",
              handler
            );

            if (
              request !==
              workerRequestId
            ) {
              resolve(
                fallbackAIMove(ai)
              );
              return;
            }

            const data =
              event.data;

            if (
              Number.isInteger(
                data?.row
              ) &&
              Number.isInteger(
                data?.col
              )
            ) {
              resolve({
                row: data.row,
                col: data.col
              });
            } else {
              resolve(
                fallbackAIMove(ai)
              );
            }
          };

        worker.addEventListener(
          "message",
          handler
        );

        const difficulty =
          getDifficultyConfig();

        worker.postMessage({
          board: cloneBoard(board),
          player: CONFIG.AI,

          config: {
            depth:
              Math.max(
                1,
                Math.min(
                  4,
                  ai.worker.depth +
                    difficulty.depthBonus
                )
              ),

            radius:
              difficulty.radius,

            randomTop:
              Math.max(
                0,
                ai.worker.randomTop +
                  difficulty.randomTop
              )
          },

          thinkTime:
            Date.now()
        });
      }
    );
  }

  function fallbackAIMove(ai) {
    const candidates =
      getCandidateMoves(
        difficultyRadius()
      );

    if (!candidates.length) {
      return null;
    }

    const immediateWin =
      findImmediateMove(
        CONFIG.AI,
        candidates
      );

    if (immediateWin) {
      return immediateWin;
    }

    const block =
      findImmediateMove(
        CONFIG.PLAYER,
        candidates
      );

    if (block) {
      return block;
    }

    let bestScore =
      -Infinity;

    let best = [];

    for (const move of candidates) {
      board[move.row][move.col] =
        CONFIG.AI;

      const own =
        localScore(
          move.row,
          move.col,
          CONFIG.AI
        );

      const enemy =
        localScore(
          move.row,
          move.col,
          CONFIG.PLAYER
        );

      const center =
        centerValue(
          move.row,
          move.col
        );

      const score =
        own * 1.1 +
        enemy * 0.95 +
        center * 1.2 +
        Math.random() * 10;

      board[move.row][move.col] =
        CONFIG.EMPTY;

      if (
        score >
        bestScore
      ) {
        bestScore =
          score;

        best = [
          move
        ];
      } else if (
        score ===
        bestScore
      ) {
        best.push(
          move
        );
      }
    }

    return (
      best[
        Math.floor(
          Math.random() *
            best.length
        )
      ] ||
      candidates[0]
    );
  }

  function getDifficultyConfig() {
    const configs = {
      easy: {
        depthBonus: -1,
        radius: 2,
        randomTop: 3,
        delay: 0
      },

      normal: {
        depthBonus: 0,
        radius: 2,
        randomTop: 1,
        delay: 120
      },

      hard: {
        depthBonus: 1,
        radius: 2,
        randomTop: 0,
        delay: 260
      }
    };

    return (
      configs[
        selectedDifficulty
      ] ||
      configs.normal
    );
  }

  function difficultyRadius() {
    return getDifficultyConfig()
      .radius;
  }

  /* =========================================================
     AI MOVE ANALYSIS
     ========================================================= */

  function classifyAIMove(
    move,
    before
  ) {
    board[move.row][move.col] =
      CONFIG.AI;

    const aiThreat =
      countImmediateWins(
        CONFIG.AI
      );

    const playerThreat =
      countImmediateWins(
        CONFIG.PLAYER
      );

    board[move.row][move.col] =
      CONFIG.EMPTY;

    if (
      aiThreat >= 2
    ) {
      return "winning";
    }

    if (
      before.playerThreat >= 1 &&
      playerThreat === 0
    ) {
      return "defend";
    }

    if (
      before.aiThreat <
        aiThreat
    ) {
      return "attack";
    }

    if (
      playerThreat >= 1
    ) {
      return "danger";
    }

    if (
      Math.random() <
      0.08
    ) {
      return "surprise";
    }

    return "thinking";
  }

  function getThreatState() {
    return {
      playerThreat:
        countImmediateWins(
          CONFIG.PLAYER
        ),

      aiThreat:
        countImmediateWins(
          CONFIG.AI
        )
    };
  }

  function countImmediateWins(
    player
  ) {
    const candidates =
      getCandidateMoves(2);

    let count = 0;

    for (
      const move of candidates
    ) {
      board[
        move.row
      ][
        move.col
      ] = player;

      if (
        checkWin(
          board,
          move.row,
          move.col,
          player
        )
      ) {
        count++;
      }

      board[
        move.row
      ][
        move.col
      ] = CONFIG.EMPTY;

      if (
        count >= 2
      ) {
        break;
      }
    }

    return count;
  }

  /* =========================================================
     CANDIDATES
     ========================================================= */

  function getCandidateMoves(
    radius = 2
  ) {
    const occupied = [];

    for (
      let row = 0;
      row < CONFIG.BOARD_SIZE;
      row++
    ) {
      for (
        let col = 0;
        col < CONFIG.BOARD_SIZE;
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

    if (!occupied.length) {
      const center =
        Math.floor(
          CONFIG.BOARD_SIZE / 2
        );

      return [
        {
          row: center,
          col: center
        }
      ];
    }

    const set =
      new Map();

    for (
      const stone of occupied
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
            stone.row + dr;

          const col =
            stone.col + dc;

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

          set.set(
            `${row},${col}`,
            {
              row,
              col
            }
          );
        }
      }
    }

    const moves =
      [...set.values()];

    moves.sort(
      (a, b) =>
        localMovePotential(
          b.row,
          b.col
        ) -
        localMovePotential(
          a.row,
          a.col
        )
    );

    return moves;
  }

  function findImmediateMove(
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
      ] = player;

      const win =
        checkWin(
          board,
          move.row,
          move.col,
          player
        );

      board[
        move.row
      ][
        move.col
      ] = CONFIG.EMPTY;

      if (win) {
        return move;
      }
    }

    return null;
  }

  /* =========================================================
     SIMPLE EVALUATION
     ========================================================= */

  function localMovePotential(
    row,
    col
  ) {
    return (
      localScore(
        row,
        col,
        CONFIG.AI
      ) +
      localScore(
        row,
        col,
        CONFIG.PLAYER
      ) *
        0.92 +
      centerValue(
        row,
        col
      )
    );
  }

  function localScore(
    row,
    col,
    player
  ) {
    const directions = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1]
    ];

    let score = 0;

    for (
      const [
        dr,
        dc
      ] of directions
    ) {
      score += linePotential(
        row,
        col,
        dr,
        dc,
        player
      );
    }

    return score;
  }

  function linePotential(
    row,
    col,
    dr,
    dc,
    player
  ) {
    let count = 1;

    let open = 0;

    for (
      const sign of [
        1,
        -1
      ]
    ) {
      let r =
        row +
        dr *
          sign;

      let c =
        col +
        dc *
          sign;

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
          dr *
          sign;

        c +=
          dc *
          sign;
      }

      if (
        isInside(
          r,
          c
        ) &&
        board[r][c] ===
          CONFIG.EMPTY
      ) {
        open++;
      }
    }

    if (
      count >= 5
    ) {
      return 1000000;
    }

    if (
      count === 4
    ) {
      return open === 2
        ? 100000
        : open === 1
          ? 12000
          : 0;
    }

    if (
      count === 3
    ) {
      return open === 2
        ? 6000
        : open === 1
          ? 700
          : 0;
    }

    if (
      count === 2
    ) {
      return open === 2
        ? 350
        : open === 1
          ? 60
          : 0;
    }

    return open === 2
      ? 8
      : 2;
  }

  function centerValue(
    row,
    col
  ) {
    const center =
      (CONFIG.BOARD_SIZE - 1) /
      2;

    const distance =
      Math.abs(
        row - center
      ) +
      Math.abs(
        col - center
      );

    return Math.max(
      0,
      30 -
        distance * 3
    );
  }

  /* =========================================================
     MOVE / UNDO
     ========================================================= */

  function makeMove(
    row,
    col,
    player
  ) {
    if (
      !isInside(
        row,
        col
      )
    ) {
      return false;
    }

    if (
      board[row][col] !==
      CONFIG.EMPTY
    ) {
      return false;
    }

    board[row][col] =
      player;

    moveHistory.push({
      row,
      col,
      player
    });

    lastMove = {
      row,
      col,
      player
    };

    winningLine = [];

    return true;
  }

  function undoMove() {
    if (
      gameOver ||
      !moveHistory.length
    ) {
      return;
    }

    if (
      selectedMode === "ai"
    ) {
      while (
        moveHistory.length &&
        moveHistory[
          moveHistory.length - 1
        ].player ===
          CONFIG.AI
      ) {
        const move =
          moveHistory.pop();

        board[
          move.row
        ][
          move.col
        ] = CONFIG.EMPTY;
      }

      if (
        moveHistory.length
      ) {
        const move =
          moveHistory.pop();

        board[
          move.row
        ][
          move.col
        ] = CONFIG.EMPTY;
      }
    } else {
      const move =
        moveHistory.pop();

      board[
        move.row
      ][
        move.col
      ] = CONFIG.EMPTY;
    }

    lastMove =
      moveHistory[
        moveHistory.length - 1
      ] || null;

    currentPlayer =
      CONFIG.PLAYER;

    aiThinking = false;

    winningLine = [];

    updateTurnUI();

    drawBoard();

    saveCurrentGame();

    showOS(
      "surprise",
      getSelectedAI()
    );
  }

  /* =========================================================
     WIN
     ========================================================= */

  function checkWin(
    currentBoard,
    row,
    col,
    player
  ) {
    const line =
      findWinningLine(
        currentBoard,
        row,
        col,
        player
      );

    return Boolean(line);
  }

  function findWinningLine(
    currentBoard,
    row,
    col,
    player
  ) {
    const directions = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1]
    ];

    for (
      const [
        dr,
        dc
      ] of directions
    ) {
      const line = [
        {
          row,
          col
        }
      ];

      for (
        let sign of [
          1,
          -1
        ]
      ) {
        let distance = 1;

        while (
          true
        ) {
          const r =
            row +
            dr *
              distance *
              sign;

          const c =
            col +
            dc *
              distance *
              sign;

          if (
            !isInside(
              r,
              c
            ) ||
            currentBoard[r][c] !==
              player
          ) {
            break;
          }

          line.push({
            row: r,
            col: c
          });

          distance++;
        }
      }

      if (
        line.length >=
        CONFIG.WIN_LENGTH
      ) {
        line.sort(
          (a, b) =>
            a.row - b.row ||
            a.col - b.col
        );

        return line;
      }
    }

    return null;
  }

  function isBoardFull() {
    for (
      const row of board
    ) {
      if (
        row.includes(
          CONFIG.EMPTY
        )
      ) {
        return false;
      }
    }

    return true;
  }

  /* =========================================================
     FINISH GAME
     ========================================================= */

  function finishGame(
    result
  ) {
    gameOver = true;
    aiThinking = false;

    winningLine = [];

    if (
      result === "win"
    ) {
      stats.wins++;
      stats.total++;

      ensureAIStats();

      stats.ai[
        selectedAI
      ].losses++;

      showOS(
        "losing",
        getSelectedAI()
      );
    }

    if (
      result === "loss"
    ) {
      stats.losses++;
      stats.total++;

      ensureAIStats();

      stats.ai[
        selectedAI
      ].wins++;

      showOS(
        "winning",
        getSelectedAI()
      );
    }

    if (
      result === "draw"
    ) {
      stats.draws++;
      stats.total++;

      showOS(
        "thinking",
        getSelectedAI()
      );
    }

    saveStats();

    const last =
      moveHistory[
        moveHistory.length - 1
      ];

    if (last) {
      winningLine =
        findWinningLine(
          board,
          last.row,
          last.col,
          last.player
        ) || [];
    }

    drawBoard();

    updateTurnUI();

    clearSavedGame();

    setTimeout(
      () =>
        showResult(
          result
        ),
      settings.motion
        ? 280
        : 0
    );
  }

  function showResult(
    result
  ) {
    const text = {
      win: {
        kicker: "GAME COMPLETE",
        title: "你贏了！",
        description:
          `你成功擊敗了 ${getSelectedAI().name["zh-TW"]}。`
      },

      loss: {
        kicker: "GAME COMPLETE",
        title: "這局輸了",
        description:
          `${getSelectedAI().name["zh-TW"]} 找到了五連。`
      },

      draw: {
        kicker: "GAME COMPLETE",
        title: "和局",
        description:
          "棋盤已經沒有可以落子的地方。"
      }
    };

    const data =
      text[result];

    if (!data) return;

    if (DOM.resultKicker) {
      DOM.resultKicker.textContent =
        data.kicker;
    }

    if (DOM.resultTitle) {
      DOM.resultTitle.textContent =
        data.title;
    }

    if (DOM.resultDescription) {
      DOM.resultDescription.textContent =
        data.description;
    }

    if (DOM.resultMark) {
      DOM.resultMark.dataset.result =
        result;
    }

    showScreen("result");
  }

  /* =========================================================
     TURN UI
     ========================================================= */

  function updateTurnUI() {
    if (!DOM.turnPlayer) {
      return;
    }

    const isAI =
      currentPlayer ===
      CONFIG.AI;

    if (
      aiThinking ||
      isAI
    ) {
      DOM.turnLabel.textContent =
        getSelectedAI()
          .name["zh-TW"];

      DOM.turnPlayer.textContent =
        "思考中";

      DOM.thinkingIndicator.hidden =
        false;
    } else {
      DOM.turnLabel.textContent =
        "你的回合";

      DOM.turnPlayer.textContent =
        playerSide === "black"
          ? "黑棋"
          : "白棋";

      DOM.thinkingIndicator.hidden =
        true;
    }

    if (DOM.turnStone) {
      DOM.turnStone.classList.toggle(
        "white-stone",
        playerSide === "white" &&
          !isAI
      );

      DOM.turnStone.classList.toggle(
        "black-stone",
        playerSide === "black" ||
          isAI
      );
    }
  }

  /* =========================================================
     AI OS
     ========================================================= */

  function showOS(
    type,
    ai
  ) {
    if (!DOM.aiOS) return;

    const character =
      ai ||
      getSelectedAI();

    const pool =
      character.os[type] ||
      character.os.thinking;

    if (
      !pool ||
      !pool.length
    ) {
      return;
    }

    const text =
      pool[
        Math.floor(
          Math.random() *
            pool.length
        )
      ];

    DOM.aiOS.classList.add(
      "is-changing"
    );

    setTimeout(
      () => {
        DOM.aiOS.textContent =
          text;

        DOM.aiOS.classList.remove(
          "is-changing"
        );
      },
      settings.motion
        ? 120
        : 0
    );
  }

  /* =========================================================
     AI UI
     ========================================================= */

  function updateAIUI() {
    const ai =
      getSelectedAI();

    if (DOM.aiName) {
      DOM.aiName.textContent =
        getLocalized(
          ai.name
        );
    }

    if (
      DOM.aiDescription
    ) {
      DOM.aiDescription.textContent =
        getLocalized(
          ai.description
        );
    }

    if (DOM.aiSelect) {
      DOM.aiSelect.value =
        selectedAI;
    }

    ensureAIStats();

    if (DOM.aiWins) {
      DOM.aiWins.textContent =
        stats.ai[
          selectedAI
        ].wins;
    }

    if (DOM.aiLosses) {
      DOM.aiLosses.textContent =
        stats.ai[
          selectedAI
        ].losses;
    }
  }

  function setupAISelector() {
    DOM.aiSelect?.addEventListener(
      "change",
      event => {
        selectedAI =
          event.target.value;

        updateAIUI();

        if (
          DOM.gameScreen?.classList.contains(
            "active"
          )
        ) {
          resetGame();
        }
      }
    );
  }

  /* =========================================================
     STATS
     ========================================================= */

  function createDefaultStats() {
    const ai = {};

    Object.keys(
      AI_CHARACTERS
    ).forEach(
      id => {
        ai[id] = {
          wins: 0,
          losses: 0
        };
      }
    );

    return {
      wins: 0,
      losses: 0,
      draws: 0,
      total: 0,
      ai,
      records: []
    };
  }

  function loadStats() {
    try {
      const raw =
        localStorage.getItem(
          CONFIG.STORAGE_KEY
        );

      if (!raw) {
        return createDefaultStats();
      }

      const parsed =
        JSON.parse(raw);

      const defaults =
        createDefaultStats();

      return {
        ...defaults,
        ...parsed,

        ai: {
          ...defaults.ai,
          ...(parsed.ai || {})
        },

        records:
          Array.isArray(
            parsed.records
          )
            ? parsed.records
            : []
      };
    } catch {
      return createDefaultStats();
    }
  }

  function ensureAIStats() {
    if (
      !stats.ai[
        selectedAI
      ]
    ) {
      stats.ai[
        selectedAI
      ] = {
        wins: 0,
        losses: 0
      };
    }
  }

  function saveStats() {
    try {
      localStorage.setItem(
        CONFIG.STORAGE_KEY,
        JSON.stringify(stats)
      );
    } catch {}
  }

  function renderStats() {
    if (DOM.statGames) {
      DOM.statGames.textContent =
        stats.total;
    }

    if (DOM.statWins) {
      DOM.statWins.textContent =
        stats.wins;
    }

    if (DOM.statLosses) {
      DOM.statLosses.textContent =
        stats.losses;
    }

    if (DOM.statDraws) {
      DOM.statDraws.textContent =
        stats.draws;
    }

    renderRecordList();

    updateAIUI();
  }

  function renderRecordList() {
    if (!DOM.recordList) {
      return;
    }

    DOM.recordList.innerHTML = "";

    if (
      !stats.records ||
      !stats.records.length
    ) {
      const empty =
        document.createElement(
          "p"
        );

      empty.textContent =
        "目前還沒有棋局記錄。";

      empty.style.opacity =
        "0.55";

      DOM.recordList.appendChild(
        empty
      );

      return;
    }

    stats.records
      .slice(
        -20
      )
      .reverse()
      .forEach(
        record => {
          const item =
            document.createElement(
              "div"
            );

          item.className =
            "record-item";

          item.style.cssText =
            `
              display:flex;
              justify-content:space-between;
              align-items:center;
              gap:12px;
              padding:12px 0;
              border-bottom:1px solid rgba(80,60,40,.1);
            `;

          const left =
            document.createElement(
              "div"
            );

          const ai =
            AI_CHARACTERS[
              record.ai
            ] ||
            AI_CHARACTERS.sora;

          left.innerHTML =
            `
              <strong>
                ${escapeHTML(
                  ai.name[
                    "zh-TW"
                  ]
                )}
              </strong>
              <div style="font-size:11px;opacity:.5;margin-top:2px;">
                ${escapeHTML(
                  record.date
                )}
              </div>
            `;

          const result =
            document.createElement(
              "strong"
            );

          result.textContent =
            resultLabel(
              record.result
            );

          item.append(
            left,
            result
          );

          DOM.recordList.appendChild(
            item
          );
        }
      );
  }

  function resultLabel(
    result
  ) {
    if (
      result === "win"
    ) {
      return "勝利";
    }

    if (
      result === "loss"
    ) {
      return "失敗";
    }

    return "和局";
  }

  DOM.clearRecordsButton?.addEventListener(
    "click",
    () => {
      if (
        !confirm(
          "確定要清除所有棋局記錄嗎？"
        )
      ) {
        return;
      }

      stats =
        createDefaultStats();

      saveStats();

      renderStats();

      showToast(
        "棋局記錄已清除"
      );
    }
  );

  /* =========================================================
     SETTINGS
     ========================================================= */

  function loadSettings() {
    const defaults = {
      language: "zh-TW",
      sound: true,
      motion: true,
      theme: "system"
    };

    try {
      const raw =
        localStorage.getItem(
          CONFIG.SETTINGS_KEY
        );

      if (!raw) {
        return defaults;
      }

      return {
        ...defaults,
        ...JSON.parse(raw)
      };
    } catch {
      return defaults;
    }
  }

  function saveSettings() {
    settings = {
      language:
        DOM.languageSelect?.value ||
        "zh-TW",

      sound:
        DOM.soundToggle?.checked ??
        true,

      motion:
        DOM.motionToggle?.checked ??
        true,

      theme:
        DOM.themeSelect?.value ||
        "system"
    };

    try {
      localStorage.setItem(
        CONFIG.SETTINGS_KEY,
        JSON.stringify(
          settings
        )
      );
    } catch {}

    applySettings();
  }

  function applySettings() {
    if (
      DOM.languageSelect
    ) {
      DOM.languageSelect.value =
        settings.language;
    }

    if (
      DOM.soundToggle
    ) {
      DOM.soundToggle.checked =
        settings.sound;
    }

    if (
      DOM.motionToggle
    ) {
      DOM.motionToggle.checked =
        settings.motion;
    }

    if (
      DOM.themeSelect
    ) {
      DOM.themeSelect.value =
        settings.theme;
    }

    applyTheme();
  }

  function setupSettingsControls() {
    DOM.languageSelect?.addEventListener(
      "change",
      saveSettings
    );

    DOM.soundToggle?.addEventListener(
      "change",
      saveSettings
    );

    DOM.motionToggle?.addEventListener(
      "change",
      saveSettings
    );

    DOM.themeSelect?.addEventListener(
      "change",
      saveSettings
    );

    setupAISelector();
  }

  function applyTheme() {
    const theme =
      settings.theme;

    if (
      theme === "system"
    ) {
      document.documentElement
        .removeAttribute(
          "data-theme"
        );

      return;
    }

    document.documentElement
      .setAttribute(
        "data-theme",
        theme
      );
  }

  /* =========================================================
     SAVE / RESUME
     ========================================================= */

  const GAME_SAVE_KEY =
    "gomoku-current-game-v1";

  function saveCurrentGame() {
    if (gameOver) {
      return;
    }

    try {
      localStorage.setItem(
        GAME_SAVE_KEY,
        JSON.stringify({
          board,
          currentPlayer,
          selectedAI,
          selectedDifficulty,
          selectedMode,
          playerSide,
          moveHistory,
          lastMove,
          timestamp:
            Date.now()
        })
      );

      checkResumeGame();
    } catch {}
  }

  function clearSavedGame() {
    try {
      localStorage.removeItem(
        GAME_SAVE_KEY
      );
    } catch {}
  }

  function checkResumeGame() {
    if (
      !DOM.resumeCard ||
      !DOM.resumeText
    ) {
      return;
    }

    try {
      const raw =
        localStorage.getItem(
          GAME_SAVE_KEY
        );

      if (!raw) {
        DOM.resumeCard.hidden =
          true;

        return;
      }

      const saved =
        JSON.parse(raw);

      if (
        !Array.isArray(
          saved.board
        ) ||
        !saved.moveHistory
      ) {
        DOM.resumeCard.hidden =
          true;

        return;
      }

      const ai =
        AI_CHARACTERS[
          saved.selectedAI
        ] ||
        AI_CHARACTERS.sora;

      DOM.resumeText.textContent =
        `對戰 ${ai.name["zh-TW"]}`;

      DOM.resumeCard.hidden =
        false;
    } catch {
      DOM.resumeCard.hidden =
        true;
    }
  }

  function resumeGame() {
    try {
      const raw =
        localStorage.getItem(
          GAME_SAVE_KEY
        );

      if (!raw) {
        return;
      }

      const saved =
        JSON.parse(raw);

      if (
        !Array.isArray(
          saved.board
        )
      ) {
        return;
      }

      board =
        saved.board;

      currentPlayer =
        saved.currentPlayer ??
        CONFIG.PLAYER;

      selectedAI =
        saved.selectedAI ||
        "sora";

      selectedDifficulty =
        saved.selectedDifficulty ||
        "normal";

      selectedMode =
        saved.selectedMode ||
        "ai";

      playerSide =
        saved.playerSide ||
        "black";

      moveHistory =
        Array.isArray(
          saved.moveHistory
        )
          ? saved.moveHistory
          : [];

      lastMove =
        saved.lastMove ||
        null;

      gameOver = false;
      aiThinking = false;
      winningLine = [];

      updateAIUI();
      updateTurnUI();

      showScreen("game");

      if (
        selectedMode === "ai" &&
        currentPlayer ===
          CONFIG.AI
      ) {
        runAITurn();
      }

      drawBoard();
    } catch {
      clearSavedGame();
    }
  }

  /* =========================================================
     RESET
     ========================================================= */

  function resetGame() {
    board =
      createBoard();

    currentPlayer =
      CONFIG.PLAYER;

    gameOver = false;
    aiThinking = false;

    moveHistory = [];
    winningLine = [];
    lastMove = null;

    workerRequestId++;

    if (DOM.aiOS) {
      DOM.aiOS.textContent = "";
      DOM.aiOS.classList.remove(
        "is-changing"
      );
    }

    updateAIUI();
    updateTurnUI();

    clearSavedGame();

    drawBoard();

    if (
      selectedMode === "ai" &&
      playerSide === "white"
    ) {
      currentPlayer =
        CONFIG.AI;

      updateTurnUI();

      runAITurn();
    }
  }

  /* =========================================================
     AUDIO
     ========================================================= */

  function playStoneSound() {
    if (!settings.sound) {
      return;
    }

    try {
      if (!audioContext) {
        audioContext =
          new (
            window.AudioContext ||
            window.webkitAudioContext
          )();
      }

      if (
        audioContext.state ===
        "suspended"
      ) {
        audioContext.resume();
      }

      const oscillator =
        audioContext.createOscillator();

      const gain =
        audioContext.createGain();

      oscillator.type =
        "sine";

      oscillator.frequency.value =
        180;

      gain.gain.setValueAtTime(
        0.0001,
        audioContext.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.055,
        audioContext.currentTime +
          0.008
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime +
          0.075
      );

      oscillator.connect(
        gain
      );

      gain.connect(
        audioContext.destination
      );

      oscillator.start();

      oscillator.stop(
        audioContext.currentTime +
          0.08
      );
    } catch {}
  }

  /* =========================================================
     TOAST
     ========================================================= */

  function showToast(
    message
  ) {
    if (!DOM.toast) {
      return;
    }

    DOM.toast.textContent =
      message;

    DOM.toast.classList.add(
      "visible"
    );

    clearTimeout(
      showToast.timer
    );

    showToast.timer =
      setTimeout(
        () => {
          DOM.toast.classList.remove(
            "visible"
          );
        },
        1800
      );
  }

  /* =========================================================
     HELPERS
     ========================================================= */

  function createBoard() {
    return Array.from(
      {
        length:
          CONFIG.BOARD_SIZE
      },
      () =>
        Array(
          CONFIG.BOARD_SIZE
        ).fill(
          CONFIG.EMPTY
        )
    );
  }

  function cloneBoard(
    source
  ) {
    return source.map(
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
      row <
        CONFIG.BOARD_SIZE &&
      col >= 0 &&
      col <
        CONFIG.BOARD_SIZE
    );
  }

  function delay(ms) {
    return new Promise(
      resolve =>
        setTimeout(
          resolve,
          ms
        )
    );
  }

  function getSelectedAI() {
    return (
      AI_CHARACTERS[
        selectedAI
      ] ||
      AI_CHARACTERS.sora
    );
  }

  function getLocalized(
    object
  ) {
    return (
      object[
        settings.language
      ] ||
      object["zh-TW"] ||
      object.en ||
      ""
    );
  }

  function escapeHTML(
    value
  ) {
    return String(
      value
    )
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );
  }

  /* =========================================================
     INITIAL BOOT
     ========================================================= */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );
  } else {
    init();
  }
})();
