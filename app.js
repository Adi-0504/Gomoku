(() => {
  "use strict";

  /*
   * =========================================================
   * GOMOKU 1.2
   * =========================================================
   *
   * Human vs Human
   * Human vs AI
   * AI Worker
   * AI OS
   * Statistics
   * Resume game
   * LocalStorage
   * Responsive Canvas
   *
   * Official UI SFX
   * Organic 06
   *
   * Official:
   * https://uisfx.com/
   *
   * npm:
   * https://www.npmjs.com/package/uisfx
   * =========================================================
   */

  const CONFIG = {
    SIZE: 15,
    WIN: 5,

    EMPTY: 0,
    BLACK: 1,
    WHITE: 2,

    STORAGE_GAME: "gomoku-active-game-v4",
    STORAGE_STATS: "gomoku-stats-v4",
    STORAGE_SETTINGS: "gomoku-settings-v4",

    WORKER: "./ai-worker.js",

    /*
     * 官方 UI SFX ESM CDN
     *
     * UI SFX 本身負責即時合成音效，
     * 不需要在專案裡放 MP3 / WAV。
     */
    SFX_MODULE:
      "https://esm.unpkg.com/uisfx",

    SFX_PACK: "organic",

    SFX_VOLUME: 0.38,

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
      randomTop: 4
    },

    normal: {
      depth: 2,
      radius: 2,
      randomTop: 2
    },

    hard: {
      depth: 3,
      radius: 2,
      randomTop: 1
    }
  };


  /*
   * =========================================================
   * DOM
   * =========================================================
   */

  const DOM = {
    homeScreen: document.querySelector("#homeScreen"),
    setupScreen: document.querySelector("#setupScreen"),
    gameScreen: document.querySelector("#gameScreen"),
    resultScreen: document.querySelector("#resultScreen"),
    recordsScreen: document.querySelector("#recordsScreen"),
    settingsScreen: document.querySelector("#settingsScreen"),

    startButton: document.querySelector("#startButton"),
    recordsButton: document.querySelector("#recordsButton"),
    settingsButton: document.querySelector("#settingsButton"),

    resumeCard: document.querySelector("#resumeCard"),
    resumeText: document.querySelector("#resumeText"),
    resumeButton: document.querySelector("#resumeButton"),

    modeControl: document.querySelector("#modeControl"),
    difficultyGroup: document.querySelector("#difficultyGroup"),
    characterGroup: document.querySelector("#characterGroup"),
    characterControl: document.querySelector("#characterControl"),

    beginGameButton: document.querySelector("#beginGameButton"),

    turnStone: document.querySelector("#turnStone"),
    turnLabel: document.querySelector("#turnLabel"),
    turnPlayer: document.querySelector("#turnPlayer"),

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

    board: createBoard(),

    currentPlayer: CONFIG.BLACK,

    moves: [],

    gameOver: false,

    winner: CONFIG.EMPTY,

    winningLine: [],

    lastMove: null,

    aiThinking: false,

    worker: null,

    workerRequest: 0,

    boardSize: 0,

    boardPadding: 0,

    cellSize: 0,

    dpr: 1,

    stats: loadStats(),

    settings: loadSettings()
  };


  /*
   * =========================================================
   * AUDIO
   * =========================================================
   */

  let uiSFX = null;

  let sfxModulePromise = null;

  let sfxLoading = false;

  let audioUnlocked = false;

  let audioUnlockPromise = null;


  /*
   * 官方 UI SFX semantic cues。
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
    redo: "redo",

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
    complete: "complete"
  };


  /*
   * ---------------------------------------------------------
   * AUDIO HELPERS
   * ---------------------------------------------------------
   */

  function loadUISFXModule() {

    if (!sfxModulePromise) {

      sfxModulePromise =
        import(CONFIG.SFX_MODULE);

    }

    return sfxModulePromise;

  }


  async function loadUISFX() {

    if (uiSFX) {
      return uiSFX;
    }

    if (
      sfxLoading ||
      !state.settings.sound
    ) {

      return uiSFX;

    }

    sfxLoading = true;

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
          "createUISFX() was not found."
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
        "[Gomoku] UI SFX failed to load:",
        error
      );

      uiSFX = null;

      return null;

    } finally {

      sfxLoading = false;

    }

  }


  /*
   * Native browser audio unlock.
   *
   * This does NOT generate the sound itself.
   * It simply creates/resumes a tiny AudioContext
   * from a real user gesture so Safari allows audio.
   */
  async function unlockBrowserAudio() {

    if (audioUnlocked) {
      return true;
    }

    if (audioUnlockPromise) {
      return audioUnlockPromise;
    }

    audioUnlockPromise =
      (async () => {

        try {

          const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;

          if (!AudioContextClass) {

            /*
             * Browser has no Web Audio API.
             * UI SFX may still be able to handle
             * its own audio implementation.
             */
            return true;

          }

          const context =
            new AudioContextClass();

          if (
            context.state ===
            "suspended"
          ) {

            await context.resume();

          }

          /*
           * Create a zero-gain oscillator only to
           * establish a trusted audio graph.
           */
          const gain =
            context.createGain();

          gain.gain.value = 0;

          const oscillator =
            context.createOscillator();

          oscillator.connect(gain);

          gain.connect(
            context.destination
          );

          oscillator.start();

          oscillator.stop(
            context.currentTime + 0.01
          );

          await new Promise(
            resolve => {

              oscillator.addEventListener(
                "ended",
                resolve,
                {
                  once: true
                }
              );

            }
          );

          await context.close();

          audioUnlocked = true;

          return true;

        } catch (error) {

          console.warn(
            "[Gomoku] Browser audio unlock failed:",
            error
          );

          return false;

        } finally {

          audioUnlockPromise =
            null;

        }

      })();

    return audioUnlockPromise;

  }


  /*
   * Unlock + load UI SFX.
   *
   * This function is always called from user
   * interaction handlers before playing a cue.
   */
  async function unlockAudio() {

    if (
      !state.settings.sound
    ) {

      return null;

    }

    await unlockBrowserAudio();

    const ui =
      await loadUISFX();

    return ui;

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

    const ui =
      uiSFX ||
      await unlockAudio();

    if (!ui) {
      return;
    }

    try {

      ui.play(
        cue,
        options
      );

    } catch (error) {

      console.warn(
        `[Gomoku] Failed to play "${cue}":`,
        error
      );

    }

  }


  function setSoundEnabled(
    enabled
  ) {

    state.settings.sound =
      Boolean(enabled);

    saveSettings();

    if (!uiSFX) {
      return;
    }

    try {

      if (
        typeof uiSFX.setEnabled ===
        "function"
      ) {

        uiSFX.setEnabled(
          state.settings.sound
        );

      }

      if (
        !state.settings.sound &&
        typeof uiSFX.stopAll ===
        "function"
      ) {

        uiSFX.stopAll();

      }

    } catch {}

  }


  /*
   * =========================================================
   * BOARD
   * =========================================================
   */

  function createBoard() {

    return Array.from(
      { length: CONFIG.SIZE },
      () =>
        Array(CONFIG.SIZE).fill(
          CONFIG.EMPTY
        )
    );

  }


  function cloneBoard(board) {

    return board.map(
      row => row.slice()
    );

  }


  function isInside(row, col) {

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
      const [dr, dc]
      of DIRECTIONS
    ) {

      const line = [
        [row, col]
      ];

      let r =
        row + dr;

      let c =
        col + dc;

      while (
        isInside(r, c) &&
        board[r][c] === player
      ) {

        line.push([r, c]);

        r += dr;
        c += dc;

      }

      r =
        row - dr;

      c =
        col - dc;

      while (
        isInside(r, c) &&
        board[r][c] === player
      ) {

        line.unshift([r, c]);

        r -= dr;
        c -= dc;

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
   * GAME
   * =========================================================
   */

  function resetBoard() {

    state.board =
      createBoard();

    state.currentPlayer =
      CONFIG.BLACK;

    state.moves = [];

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

    stopWorker();

    clearActiveGame();

    renderBoard();

    updateTurnUI();

  }


  function startNewGame() {

    unlockAudio();

    resetBoard();

    showScreen("game");

    updateAIOS("thinking");

    playSFX(SFX.start);

    saveActiveGame();

    if (
      state.mode === "ai" &&
      state.currentPlayer === state.aiSide
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
      !isInside(row, col) ||
      state.board[row][col] !==
        CONFIG.EMPTY
    ) {

      playSFX(SFX.error);

      return false;

    }

    if (
      state.mode === "ai" &&
      state.currentPlayer === state.aiSide
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

    state.moves.push(move);

    state.lastMove =
      move;

    playSFX(SFX.select);

    const winningLine =
      getWinningLine(
        state.board,
        row,
        col,
        player
      );

    if (winningLine.length) {

      finishGame(
        player,
        winningLine
      );

      return true;

    }

    if (isBoardFull()) {

      finishDraw();

      return true;

    }

    state.currentPlayer =
      opponent(player);

    saveActiveGame();

    renderBoard();

    updateTurnUI();

    if (
      state.mode === "ai" &&
      state.currentPlayer === state.aiSide
    ) {

      scheduleAI();

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
      !isInside(row, col) ||
      state.board[row][col] !==
        CONFIG.EMPTY
    ) {

      state.aiThinking = false;

      updateTurnUI();

      scheduleAI();

      return false;

    }

    const player =
      state.currentPlayer;

    if (
      player !== state.aiSide
    ) {

      state.aiThinking = false;

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

    state.moves.push(move);

    state.lastMove =
      move;

    state.aiThinking =
      false;

    playSFX(SFX.select);

    const winningLine =
      getWinningLine(
        state.board,
        row,
        col,
        player
      );

    if (winningLine.length) {

      finishGame(
        player,
        winningLine
      );

      return true;

    }

    if (isBoardFull()) {

      finishDraw();

      return true;

    }

    state.currentPlayer =
      opponent(player);

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
      state.mode === "local"
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

      state.lastMove =
        state.moves[
          state.moves.length - 1
        ] || null;

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

        state.lastMove =
          state.moves[
            state.moves.length - 1
          ] || null;

      } else {

        state.currentPlayer =
          state.playerSide;

        state.lastMove =
          null;

      }

    }

    state.gameOver =
      false;

    state.winner =
      CONFIG.EMPTY;

    state.winningLine =
      [];

    clearActiveGame();

    saveActiveGame();

    renderBoard();

    updateTurnUI();

    updateAIOS("thinking");

    playSFX(SFX.undo);

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
      winningLine || [];

    state.aiThinking =
      false;

    stopWorker();

    clearActiveGame();

    renderBoard();

    const result =
      winner === state.playerSide
        ? "win"
        : "loss";

    recordResult(result);

    playSFX(
      result === "win"
        ? SFX.success
        : SFX.error
    );

    showResult(result);

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

    clearActiveGame();

    renderBoard();

    recordResult("draw");

    playSFX(SFX.complete);

    showResult("draw");

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

    } catch {

      return null;

    }

  }


  function stopWorker() {

    if (state.worker) {

      state.worker.terminate();

      state.worker =
        null;

    }

  }


  function scheduleAI() {

    if (
      state.mode !== "ai" ||
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

    updateAIOS("thinking");

    const delay =
      state.difficulty === "easy"
        ? 300
        : state.difficulty === "normal"
          ? 450
          : 600;

    window.setTimeout(
      () => {

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

    if (!worker) {

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

          worker.terminate();

          return;

        }

        const {
          row,
          col
        } =
          event.data || {};

        worker.terminate();

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

        worker.terminate();

        if (
          state.worker ===
          worker
        ) {

          state.worker =
            null;

        }

        fallbackAIMove();

      };


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

    window.setTimeout(
      () => {

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
      250
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

    if (win) {
      return win;
    }

    const block =
      findImmediateWin(
        state.board,
        state.playerSide,
        candidates
      );

    if (block) {
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
        ) * 0.9;

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

    return best;

  }


  function getCandidateMoves(
    board,
    radius
  ) {

    const occupied = [];

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
            point.row + dr;

          const col =
            point.col + dc;

          if (
            !isInside(row, col)
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
        ).length > 0;

      board[
        move.row
      ][
        move.col
      ] =
        CONFIG.EMPTY;

      if (win) {
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

    let score = 0;

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

      const total =
        before +
        after +
        1;

      score +=
        lineValue(total);

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

    let count = 0;

    let r =
      row + dr;

    let c =
      col + dc;

    while (
      isInside(r, c) &&
      board[r][c] === player
    ) {

      count++;

      r += dr;
      c += dc;

    }

    return count;

  }


  function lineValue(
    count
  ) {

    if (count >= 5)
      return 100000;

    if (count === 4)
      return 10000;

    if (count === 3)
      return 1000;

    if (count === 2)
      return 100;

    return 10;

  }


  function centerScore(
    row,
    col
  ) {

    const center =
      (CONFIG.SIZE - 1) / 2;

    return (
      20 -
      Math.abs(row - center) -
      Math.abs(col - center)
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
      state.mode !== "ai"
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

    DOM.aiOSText.textContent =
      randomFrom(pool);

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
      playerThreat > aiThreat
    ) {
      return "defend";
    }

    if (
      aiThreat > playerThreat
    ) {
      return "attack";
    }

    return "thinking";

  }


  function strongestLocalThreat(
    player
  ) {

    let best = 0;

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
              a + b + 1
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
          window.innerHeight * 0.64
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
        window.devicePixelRatio || 1,
        3
      );

    canvas.width =
      Math.floor(
        size * state.dpr
      );

    canvas.height =
      Math.floor(
        size * state.dpr
      );

    canvas.style.width =
      `${size}px`;

    canvas.style.height =
      `${size}px`;

    state.boardPadding =
      size * 0.075;

    state.cellSize =
      (
        size -
        state.boardPadding * 2
      ) /
      (CONFIG.SIZE - 1);

    const ctx =
      canvas.getContext("2d");

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
        col * state.cellSize,

      y:
        state.boardPadding +
        row * state.cellSize
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
      !isInside(row, col)
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
        point.x - x,
        point.y - y
      );

    if (
      distance >
      state.cellSize * 0.48
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
      canvas.getContext("2d");

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
      size - 1.5,
      size - 1.5
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
        index * state.cellSize;

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
          state.cellSize * 0.07
        ),
        0,
        Math.PI * 2
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
          state.cellSize * 0.13
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

      const last =
        boardPoint(
          state.winningLine[
            state.winningLine.length - 1
          ][0],
          state.winningLine[
            state.winningLine.length - 1
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
          player
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
          state.cellSize * 0.16
        ),
        0,
        Math.PI * 2
      );

      ctx.stroke();

      ctx.restore();

    }

  }


  function drawStone(
    ctx,
    row,
    col,
    player
  ) {

    const point =
      boardPoint(
        row,
        col
      );

    const radius =
      state.cellSize * 0.43;

    ctx.save();

    ctx.beginPath();

    ctx.arc(
      point.x + radius * 0.10,
      point.y + radius * 0.13,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "rgba(50, 34, 20, 0.22)";

    ctx.fill();

    const gradient =
      ctx.createRadialGradient(
        point.x - radius * 0.3,
        point.y - radius * 0.35,
        radius * 0.05,
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
      Math.PI * 2
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

    canvas.addEventListener(
      "pointerdown",
      event => {

        event.preventDefault();

        /*
         * This pointerdown is a genuine user gesture.
         * Unlock browser audio here before any game sound.
         */
        unlockAudio();

        canvas.setPointerCapture?.(
          event.pointerId
        );

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
          event.key !== "Enter" &&
          event.key !== " "
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
   * UI
   * =========================================================
   */

  function updateTurnUI() {

    const current =
      state.currentPlayer;

    const isAI =
      state.mode === "ai" &&
      current === state.aiSide;

    DOM.turnStone.classList.toggle(
      "black-stone",
      current === CONFIG.BLACK
    );

    DOM.turnStone.classList.toggle(
      "white-stone",
      current === CONFIG.WHITE
    );

    if (
      state.gameOver
    ) {

      DOM.turnLabel.textContent =
        "棋局結束";

    } else if (
      state.mode === "local"
    ) {

      DOM.turnLabel.textContent =
        current === CONFIG.BLACK
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
      current === CONFIG.BLACK
        ? "黑棋"
        : "白棋";

    DOM.thinkingIndicator.hidden =
      !state.aiThinking;

    DOM.undoButton.disabled =
      state.moves.length === 0 ||
      state.aiThinking ||
      state.gameOver;

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

        screen.classList.toggle(
          "active",
          key === name
        );

      }
    );

    state.screen =
      name;

    if (
      name === "game"
    ) {

      requestAnimationFrame(
        resizeCanvas
      );

    }

    if (
      name === "records"
    ) {

      renderStats();

    }

    if (
      name === "home"
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
          SFX.press
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
          SFX.press
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
          SFX.press
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
          state.screen === "home"
        ) {
          return;
        }

        if (
          state.screen === "game"
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
          SFX.press
        );

        showScreen(
          "settings"
        );

      }
    );

  }


  /*
   * =========================================================
   * SETUP
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
                      item === button
                    );

                  }
                );

              const aiMode =
                state.mode === "ai";

              DOM.difficultyGroup.hidden =
                !aiMode;

              DOM.characterGroup.hidden =
                !aiMode;

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
                      item === button
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
                      item === button
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
                      item === button
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
          state.mode === "local"
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
      "draw"
    );

    DOM.resultMark.classList.add(
      result
    );

    if (
      result === "win"
    ) {

      DOM.resultKicker.textContent =
        "VICTORY";

      DOM.resultTitle.textContent =
        state.mode === "local"
          ? "黑白棋局結束"
          : "你贏了";

      DOM.resultDescription.textContent =
        state.mode === "local"
          ? "這一局已經分出勝負。"
          : `${character.name} 輸掉了這一局。`;

    } else if (
      result === "loss"
    ) {

      DOM.resultKicker.textContent =
        "DEFEAT";

      DOM.resultTitle.textContent =
        state.mode === "local"
          ? "棋局結束"
          : "你輸了";

      DOM.resultDescription.textContent =
        state.mode === "local"
          ? "這一局已經分出勝負。"
          : `${character.name} 拿下了這一局。`;

    } else {

      DOM.resultKicker.textContent =
        "DRAW";

      DOM.resultTitle.textContent =
        "平局";

      DOM.resultDescription.textContent =
        "棋盤已經沒有空位了。";

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

      total: 0,
      wins: 0,
      losses: 0,
      draws: 0,

      localWins: 0,
      localLosses: 0,
      localDraws: 0,

      ai,

      records: []

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
        JSON.parse(raw);

      return {

        ...defaults,
        ...data,

        ai: {
          ...defaults.ai,
          ...(data.ai || {})
        },

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

    state.stats.total++;

    if (
      result === "draw"
    ) {

      state.stats.draws++;

      if (
        state.mode === "local"
      ) {

        state.stats.localDraws++;

      }

    }

    if (
      result === "win"
    ) {

      state.stats.wins++;

      if (
        state.mode === "local"
      ) {

        state.stats.localWins++;

      } else {

        state.stats.ai[
          state.character
        ].losses++;

      }

    }

    if (
      result === "loss"
    ) {

      state.stats.losses++;

      if (
        state.mode === "local"
      ) {

        state.stats.localLosses++;

      } else {

        state.stats.ai[
          state.character
        ].wins++;

      }

    }

    state.stats.records.unshift({

      date:
        new Date().toISOString(),

      mode:
        state.mode,

      result,

      character:
        state.mode === "ai"
          ? state.character
          : null,

      moves:
        state.moves.length

    });

    state.stats.records =
      state.stats.records.slice(
        0,
        50
      );

    saveStats();

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

      return;

    }

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

      const title =
        document.createElement(
          "strong"
        );

      const description =
        document.createElement(
          "span"
        );

      const date =
        document.createElement(
          "time"
        );

      if (
        record.mode === "ai"
      ) {

        const character =
          AI_CHARACTERS[
            record.character
          ];

        title.textContent =
          record.result === "win"
            ? "勝利"
            : record.result === "loss"
              ? "失敗"
              : "平局";

        description.textContent =
          `vs ${
            character?.name ||
            "AI"
          } · ${
            record.moves
          } 手`;

      } else {

        title.textContent =
          "雙人對戰";

        description.textContent =
          `${
            record.result === "draw"
              ? "平局"
              : "棋局完成"
          } · ${
            record.moves
          } 手`;

      }

      date.textContent =
        formatDate(
          record.date
        );

      item.appendChild(
        title
      );

      item.appendChild(
        description
      );

      item.appendChild(
        date
      );

      DOM.recordList.appendChild(
        item
      );

    }

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
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
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

      return;

    }

    state.stats =
      createDefaultStats();

    saveStats();

    renderStats();

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
      state.moves.length === 0
    ) {
      return;
    }

    const data = {

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
        state.lastMove

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
        JSON.parse(raw);

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
        data.mode === "ai"
          ? "人機"
          : "雙人";

      DOM.resumeText.textContent =
        `${modeText} · ${
          data.moves.length
        } 手`;

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
          CONFIG.STORAGE_GAME
        );

      if (!raw) {
        return;
      }

      const data =
        JSON.parse(raw);

      if (
        !Array.isArray(
          data.board
        )
      ) {
        return;
      }

      state.mode =
        data.mode === "local"
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
          state.moves.length - 1
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

      syncSetupUI();

      showScreen(
        "game"
      );

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

    } catch {

      clearActiveGame();

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
      state.mode !== "ai";

    DOM.characterGroup.hidden =
      state.mode !== "ai";

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
        ...JSON.parse(raw)
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

          audioUnlocked =
            false;

          await unlockAudio();

          await playSFX(
            SFX.toggleOn
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

    if (
      theme === "dark"
    ) {

      document.documentElement.dataset.theme =
        "dark";

      return;

    }

    if (
      theme === "light"
    ) {

      document.documentElement.dataset.theme =
        "light";

      return;

    }

    document.documentElement.dataset.theme =
      "system";

  }


  /*
   * =========================================================
   * TOAST
   * =========================================================
   */

  let toastTimer =
    null;


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
   * RESIZE
   * =========================================================
   */

  let resizeTimer =
    null;


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
        150
      );

    }
  );


  /*
   * =========================================================
   * SERVICE WORKER
   * =========================================================
   */

  function registerServiceWorker() {

    if (
      !("serviceWorker" in navigator)
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
              scope: "./"
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


  /*
   * =========================================================
   * INITIALIZE
   * =========================================================
   */

  function init() {

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
     * First real user interaction.
     *
     * This is especially important on iPad/iPhone Safari.
     */
    const unlockEvents = [
      "pointerdown",
      "keydown"
    ];

    const unlockOnce =
      async () => {

        await unlockAudio();

        if (
          audioUnlocked ||
          !state.settings.sound
        ) {

          unlockEvents.forEach(
            eventName => {

              document.removeEventListener(
                eventName,
                unlockOnce
              );

            }
          );

        }

      };

    unlockEvents.forEach(
      eventName => {

        document.addEventListener(
          eventName,
          unlockOnce,
          {
            passive: true
          }
        );

      }
    );

    syncSetupUI();

    renderBoard();

    checkResumeGame();

    updateTurnUI();

    registerServiceWorker();

  }


  init();

})();
