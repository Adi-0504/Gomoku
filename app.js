(() => {
  "use strict";

  /*
   * =========================================================
   * GOMOKU 1.0
   * =========================================================
   *
   * No backend.
   * Responsive Canvas.
   * Human vs Human.
   * Human vs AI.
   * AI Worker.
   * AI OS.
   * Statistics.
   * Resume game.
   * LocalStorage.
   *
   * =========================================================
   */

  const CONFIG = {
    SIZE: 15,
    WIN: 5,

    EMPTY: 0,
    BLACK: 1,
    WHITE: 2,

    STORAGE_GAME: "gomoku-active-game-v3",
    STORAGE_STATS: "gomoku-stats-v3",
    STORAGE_SETTINGS: "gomoku-settings-v3",

    WORKER: "./ai-worker.js",

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
   * BOARD
   * =========================================================
   */

  function createBoard() {

    return Array.from(
      { length: CONFIG.SIZE },
      () => Array(CONFIG.SIZE).fill(CONFIG.EMPTY)
    );

  }


  function cloneBoard(board) {

    return board.map(row => row.slice());

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

    for (let row = 0; row < CONFIG.SIZE; row++) {

      for (let col = 0; col < CONFIG.SIZE; col++) {

        if (
          state.board[row][col] === CONFIG.EMPTY
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

    for (const [dr, dc] of DIRECTIONS) {

      const line = [
        [row, col]
      ];


      let r = row + dr;
      let c = col + dc;

      while (
        isInside(r, c) &&
        board[r][c] === player
      ) {

        line.push([r, c]);

        r += dr;
        c += dc;

      }


      r = row - dr;
      c = col - dc;

      while (
        isInside(r, c) &&
        board[r][c] === player
      ) {

        line.unshift([r, c]);

        r -= dr;
        c -= dc;

      }


      if (line.length >= CONFIG.WIN) {

        return line;

      }

    }

    return [];

  }


  /*
   * =========================================================
   * GAME START
   * =========================================================
   */

  function resetBoard() {

    state.board = createBoard();

    state.currentPlayer = CONFIG.BLACK;

    state.moves = [];

    state.gameOver = false;

    state.winner = CONFIG.EMPTY;

    state.winningLine = [];

    state.lastMove = null;

    state.aiThinking = false;

    state.workerRequest++;

    stopWorker();

    clearActiveGame();

    renderBoard();

    updateTurnUI();

  }


  function startNewGame() {

    resetBoard();

    showScreen("game");

    updateAIOS("thinking");

    saveActiveGame();

    if (
      state.mode === "ai" &&
      state.currentPlayer === state.aiSide
    ) {

      scheduleAI();

    }

  }


  /*
   * =========================================================
   * MOVE
   * =========================================================
   */

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
      state.board[row][col] !== CONFIG.EMPTY
    ) {

      return false;

    }


    if (
      state.mode === "ai" &&
      state.currentPlayer === state.aiSide
    ) {

      return false;

    }


    const player = state.currentPlayer;

    state.board[row][col] = player;

    const move = {
      row,
      col,
      player
    };

    state.moves.push(move);

    state.lastMove = move;

    playStoneSound();

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
      state.board[row][col] !== CONFIG.EMPTY
    ) {

      state.aiThinking = false;

      updateTurnUI();

      scheduleAI();

      return false;

    }


    const player = state.currentPlayer;

    if (player !== state.aiSide) {

      state.aiThinking = false;

      updateTurnUI();

      return false;

    }


    state.board[row][col] = player;

    const move = {
      row,
      col,
      player
    };

    state.moves.push(move);

    state.lastMove = move;

    state.aiThinking = false;

    playStoneSound();


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


    if (state.mode === "local") {

      const move =
        state.moves.pop();

      state.board[move.row][move.col] =
        CONFIG.EMPTY;

      state.currentPlayer =
        move.player;

      state.lastMove =
        state.moves[state.moves.length - 1] || null;

    } else {

      /*
       * 人機模式：
       *
       * AI 已經走了一步時，
       * 一次悔掉玩家＋AI。
       *
       * 如果只有玩家第一步，
       * 就只悔玩家。
       */

      const aiMove =
        state.moves.pop();

      state.board[aiMove.row][aiMove.col] =
        CONFIG.EMPTY;


      if (state.moves.length) {

        const playerMove =
          state.moves.pop();

        state.board[
          playerMove.row
        ][
          playerMove.col
        ] = CONFIG.EMPTY;

        state.currentPlayer =
          playerMove.player;

        state.lastMove =
          state.moves[state.moves.length - 1] ||
          null;

      } else {

        state.currentPlayer =
          state.playerSide;

        state.lastMove = null;

      }

    }


    state.gameOver = false;

    state.winner = CONFIG.EMPTY;

    state.winningLine = [];

    clearActiveGame();

    saveActiveGame();

    renderBoard();

    updateTurnUI();

    updateAIOS("thinking");

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

    state.gameOver = true;

    state.winner = winner;

    state.winningLine =
      winningLine || [];

    state.aiThinking = false;

    stopWorker();

    clearActiveGame();

    renderBoard();

    recordResult(
      winner === state.playerSide
        ? "win"
        : "loss"
    );

    showResult(
      winner === state.playerSide
        ? "win"
        : "loss"
    );

  }


  function finishDraw() {

    state.gameOver = true;

    state.winner = CONFIG.EMPTY;

    state.winningLine = [];

    state.aiThinking = false;

    stopWorker();

    clearActiveGame();

    renderBoard();

    recordResult("draw");

    showResult("draw");

  }


  /*
   * =========================================================
   * AI WORKER
   * =========================================================
   */

  function createWorker() {

    if (
      typeof Worker === "undefined"
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

      state.worker = null;

    }

  }


  function scheduleAI() {

    if (
      state.mode !== "ai" ||
      state.gameOver ||
      state.currentPlayer !== state.aiSide ||
      state.aiThinking
    ) {

      return;

    }


    state.aiThinking = true;

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
          state.currentPlayer !== state.aiSide ||
          !state.aiThinking ||
          requestId !== state.workerRequest
        ) {

          return;

        }


        requestAIMove(requestId);

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


    state.worker = worker;


    worker.onmessage =
      event => {

        if (
          requestId !== state.workerRequest
        ) {

          worker.terminate();

          return;

        }


        const {
          row,
          col
        } = event.data || {};


        worker.terminate();

        if (
          state.worker === worker
        ) {

          state.worker = null;

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
          state.worker === worker
        ) {

          state.worker = null;

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
      state.currentPlayer !== state.aiSide
    ) {

      state.aiThinking = false;

      updateTurnUI();

      return;

    }


    const move =
      findFallbackMove();


    window.setTimeout(
      () => {

        if (
          state.gameOver ||
          state.currentPlayer !== state.aiSide
        ) {

          state.aiThinking = false;

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


  /*
   * =========================================================
   * FALLBACK AI
   * =========================================================
   *
   * This is NOT the main AI.
   * It exists only if Worker creation fails.
   *
   * Priority:
   * 1. Win
   * 2. Block
   * 3. Best local position
   */

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


    let best = candidates[0];

    let bestScore = -Infinity;


    for (const move of candidates) {

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
        score > bestScore
      ) {

        bestScore = score;

        best = move;

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
          board[row][col] !== CONFIG.EMPTY
        ) {

          occupied.push({
            row,
            col
          });

        }

      }

    }


    if (!occupied.length) {

      return [
        {
          row: 7,
          col: 7
        }
      ];

    }


    const set = new Set();


    for (const point of occupied) {

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
            board[row][col] !== CONFIG.EMPTY
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

    for (const move of candidates) {

      board[
        move.row
      ][
        move.col
      ] = player;


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
      ] = CONFIG.EMPTY;


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
      board[row][col] !== CONFIG.EMPTY
    ) {

      return -Infinity;

    }


    let score = 0;


    for (
      const [
        dr,
        dc
      ] of DIRECTIONS
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
        before + after + 1;


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

    let r = row + dr;

    let c = col + dc;


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

    if (count >= 5) return 100000;

    if (count === 4) return 10000;

    if (count === 3) return 1000;

    if (count === 2) return 100;

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

      DOM.aiOS.hidden = true;

      return;

    }


    const character =
      AI_CHARACTERS[
        state.character
      ];


    DOM.aiOS.hidden = false;

    DOM.aiOSAvatar.textContent =
      character.initial;

    DOM.aiOSName.textContent =
      character.name;


    const pool =
      character.os[
        type
      ] ||
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
          const [
            dr,
            dc
          ] of DIRECTIONS
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


    state.boardSize = size;

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


    /*
     * 不讓玩家點到棋盤線很遠的位置
     * 還被強行吸到某一格。
     */

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


    /*
     * BOARD
     */

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


    /*
     * BOARD EDGE
     */

    ctx.strokeStyle =
      "rgba(74, 54, 32, 0.28)";

    ctx.lineWidth = 1.5;

    ctx.strokeRect(
      0.75,
      0.75,
      size - 1.5,
      size - 1.5
    );


    /*
     * GRID
     */

    ctx.beginPath();

    ctx.strokeStyle =
      CONFIG.COLORS.grid;

    ctx.lineWidth = 1;


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


    /*
     * STAR POINTS
     */

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


    for (const [
      row,
      col
    ] of stars) {

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


    /*
     * WINNING LINE
     */

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


    /*
     * STONES
     */

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
          player === CONFIG.EMPTY
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


    /*
     * LAST MOVE MARKER
     */

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

      ctx.lineWidth = 2;

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


    /*
     * SHADOW
     */

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


    /*
     * STONE
     */

    const gradient =
      player === CONFIG.BLACK
        ? ctx.createRadialGradient(
            point.x - radius * 0.3,
            point.y - radius * 0.35,
            radius * 0.05,
            point.x,
            point.y,
            radius
          )
        : ctx.createRadialGradient(
            point.x - radius * 0.3,
            point.y - radius * 0.35,
            radius * 0.05,
            point.x,
            point.y,
            radius
          );


    if (
      player === CONFIG.BLACK
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


    /*
     * EDGE
     */

    ctx.strokeStyle =
      player === CONFIG.BLACK
        ? "rgba(255,255,255,0.08)"
        : "rgba(75,60,45,0.28)";

    ctx.lineWidth = 1;

    ctx.stroke();


    ctx.restore();

  }


  /*
   * =========================================================
   * POINTER EVENTS
   * =========================================================
   */

  function setupBoardInput() {

    const canvas =
      DOM.boardCanvas;


    canvas.addEventListener(
      "pointerdown",
      event => {

        event.preventDefault();

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
          state.currentPlayer === state.aiSide
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


    if (state.gameOver) {

      DOM.turnLabel.textContent =
        "棋局結束";

    } else if (state.mode === "local") {

      DOM.turnLabel.textContent =
        current === CONFIG.BLACK
          ? "黑棋回合"
          : "白棋回合";

    } else if (isAI) {

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

        if (!screen) return;

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
      () => {

        showScreen(
          "setup"
        );

      }
    );


    DOM.recordsButton.addEventListener(
      "click",
      () => {

        renderStats();

        showScreen(
          "records"
        );

      }
    );


    DOM.settingsButton.addEventListener(
      "click",
      () => {

        showScreen(
          "settings"
        );

      }
    );


    DOM.resumeButton.addEventListener(
      "click",
      resumeGame
    );


    DOM.playAgainButton.addEventListener(
      "click",
      startNewGame
    );


    DOM.resultHomeButton.addEventListener(
      "click",
      () => {

        showScreen(
          "home"
        );

      }
    );


    DOM.gameMenuButton.addEventListener(
      "click",
      () => {

        saveActiveGame();

        showScreen(
          "home"
        );

      }
    );


    DOM.restartButton.addEventListener(
      "click",
      () => {

        startNewGame();

      }
    );


    DOM.undoButton.addEventListener(
      "click",
      undoMove
    );


    DOM.backButton.addEventListener(
      "click",
      () => {

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
      () => {

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
      () => {

        if (
          state.mode === "local"
        ) {

          /*
           * 雙人模式永遠從黑棋開始。
           */

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


    DOM.recordList.innerHTML = "";


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
      const record of state.stats.records
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
          `vs ${character?.name || "AI"} · ${record.moves} 手`;

      } else {

        title.textContent =
          "雙人對戰";


        description.textContent =
          `${record.result === "draw" ? "平局" : "棋局完成"} · ${record.moves} 手`;

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
        `${modeText} · ${data.moves.length} 手`;


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
        state.currentPlayer === state.aiSide
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

      language: "zh-TW",

      sound: true,

      motion: true,

      theme: "system"

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
      () => {

        state.settings.sound =
          DOM.soundToggle.checked;

        saveSettings();

      }
    );


    DOM.motionToggle.addEventListener(
      "change",
      () => {

        state.settings.motion =
          DOM.motionToggle.checked;

        saveSettings();

      }
    );


    DOM.themeSelect.addEventListener(
      "change",
      () => {

        state.settings.theme =
          DOM.themeSelect.value;

        applyTheme();

        saveSettings();

      }
    );


    DOM.languageSelect.addEventListener(
      "change",
      () => {

        state.settings.language =
          DOM.languageSelect.value;

        saveSettings();

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
   * AUDIO
   * =========================================================
   */

  let audioContext = null;


  function playStoneSound() {

    if (
      !state.settings.sound
    ) {

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
        160;


      gain.gain.setValueAtTime(
        0.0001,
        audioContext.currentTime
      );


      gain.gain.exponentialRampToValueAtTime(
        0.045,
        audioContext.currentTime +
        0.008
      );


      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime +
        0.08
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
        0.09
      );

    } catch {}

  }


  /*
   * =========================================================
   * TOAST
   * =========================================================
   */

  let toastTimer = null;


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

  let resizeTimer = null;


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

    return player === CONFIG.BLACK
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

    syncSetupUI();

    renderBoard();

    checkResumeGame();

    updateTurnUI();

    registerServiceWorker();

  }


  init();

})();
