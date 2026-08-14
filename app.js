/* =========================================================
   GOMOKU
   Core Game + AI Characters + AI OS + Statistics
   ========================================================= */

(() => {
  "use strict";

  /* =========================================================
     CONFIG
     ========================================================= */

  const CONFIG = {
    BOARD_SIZE: 15,
    WIN_LENGTH: 5,

    PLAYER: 1,
    AI: 2,
    EMPTY: 0,

    AI_SEARCH_DEPTH: 3,
    AI_CANDIDATE_LIMIT: 12,

    OS_MIN_INTERVAL: 2600,

    STORAGE_KEY: "gomoku-game-data-v1"
  };

  /* =========================================================
     AI CHARACTERS
     ========================================================= */

  const AI_CHARACTERS = {
    mio: {
      id: "mio",
      name: {
        zhTW: "Mio",
        zhCN: "Mio",
        en: "Mio",
        ja: "ミオ",
        ko: "미오"
      },

      personality: "gentle",
      style: "defensive",

      attack: 0.85,
      defense: 1.35,
      center: 1.0,
      threat: 1.35,
      aggression: 0.55,

      depth: 2,

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
        zhTW: "Rin",
        zhCN: "Rin",
        en: "Rin",
        ja: "リン",
        ko: "린"
      },

      personality: "energetic",
      style: "aggressive",

      attack: 1.45,
      defense: 0.75,
      center: 1.15,
      threat: 1.5,
      aggression: 1.45,

      depth: 3,

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
        zhTW: "Sora",
        zhCN: "Sora",
        en: "Sora",
        ja: "ソラ",
        ko: "소라"
      },

      personality: "calm",
      style: "balanced",

      attack: 1.1,
      defense: 1.1,
      center: 1.15,
      threat: 1.2,
      aggression: 0.95,

      depth: 3,

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
        zhTW: "Kuro",
        zhCN: "Kuro",
        en: "Kuro",
        ja: "クロ",
        ko: "쿠로"
      },

      personality: "mysterious",
      style: "trap",

      attack: 1.25,
      defense: 1.05,
      center: 0.95,
      threat: 1.6,
      aggression: 1.2,

      depth: 3,

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
        zhTW: "Nagi",
        zhCN: "Nagi",
        en: "Nagi",
        ja: "ナギ",
        ko: "나기"
      },

      personality: "precise",
      style: "counter",

      attack: 1.05,
      defense: 1.45,
      center: 1.05,
      threat: 1.55,
      aggression: 0.8,

      depth: 4,

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
        zhTW: "Rei",
        zhCN: "Rei",
        en: "Rei",
        ja: "レイ",
        ko: "레이"
      },

      personality: "silent",
      style: "master",

      attack: 1.35,
      defense: 1.35,
      center: 1.1,
      threat: 1.7,
      aggression: 1.0,

      depth: 4,

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

  let board = [];
  let currentPlayer = CONFIG.PLAYER;
  let gameOver = false;
  let aiThinking = false;

  let selectedAI = "sora";

  let gameStats = loadStats();

  let lastOSAt = 0;

  /* =========================================================
     DOM
     ========================================================= */

  const DOM = {
    board:
      document.querySelector("#board") ||
      document.querySelector(".board") ||
      document.querySelector("[data-board]"),

    aiName:
      document.querySelector("#ai-name") ||
      document.querySelector("[data-ai-name]"),

    aiOS:
      document.querySelector("#ai-os") ||
      document.querySelector("[data-ai-os]"),

    playerWins:
      document.querySelector("#player-wins") ||
      document.querySelector("[data-player-wins]"),

    playerLosses:
      document.querySelector("#player-losses") ||
      document.querySelector("[data-player-losses]"),

    draws:
      document.querySelector("#draws") ||
      document.querySelector("[data-draws]"),

    winRate:
      document.querySelector("#win-rate") ||
      document.querySelector("[data-win-rate]"),

    status:
      document.querySelector("#game-status") ||
      document.querySelector("[data-game-status]"),

    restart:
      document.querySelector("#restart") ||
      document.querySelector("[data-restart]"),

    aiSelect:
      document.querySelector("#ai-select") ||
      document.querySelector("[data-ai-select]")
  };

  /* =========================================================
     INITIALIZATION
     ========================================================= */

  function init() {
    createEmptyBoard();
    setupAISelector();
    setupRestartButton();
    renderStats();
    updateAIName();
    renderBoard();
  }

  /* =========================================================
     BOARD
     ========================================================= */

  function createEmptyBoard() {
    board = Array.from(
      { length: CONFIG.BOARD_SIZE },
      () => Array(CONFIG.BOARD_SIZE).fill(CONFIG.EMPTY)
    );
  }

  function renderBoard() {
    if (!DOM.board) return;

    DOM.board.innerHTML = "";

    DOM.board.style.setProperty(
      "--board-size",
      CONFIG.BOARD_SIZE
    );

    for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
      for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
        const cell = document.createElement("button");

        cell.type = "button";
        cell.className = "gomoku-cell";

        cell.dataset.row = row;
        cell.dataset.col = col;

        if (board[row][col] === CONFIG.PLAYER) {
          cell.classList.add("player");
        }

        if (board[row][col] === CONFIG.AI) {
          cell.classList.add("ai");
        }

        if (board[row][col] !== CONFIG.EMPTY) {
          const stone = document.createElement("span");

          stone.className = "gomoku-stone";

          cell.appendChild(stone);
        }

        cell.addEventListener("click", handleCellClick);

        DOM.board.appendChild(cell);
      }
    }
  }

  /* =========================================================
     PLAYER MOVE
     ========================================================= */

  function handleCellClick(event) {
    if (gameOver || aiThinking) return;

    const row = Number(event.currentTarget.dataset.row);
    const col = Number(event.currentTarget.dataset.col);

    if (!isInside(row, col)) return;

    if (board[row][col] !== CONFIG.EMPTY) return;

    makeMove(row, col, CONFIG.PLAYER);

    renderBoard();

    if (checkWin(board, row, col, CONFIG.PLAYER)) {
      finishGame("win");
      return;
    }

    if (isBoardFull()) {
      finishGame("draw");
      return;
    }

    currentPlayer = CONFIG.AI;

    runAITurn();
  }

  /* =========================================================
     AI TURN
     ========================================================= */

  async function runAITurn() {
    if (gameOver) return;

    aiThinking = true;

    const character = getSelectedAI();

    showOS("thinking");

    await delay(getThinkingDelay(character));

    if (gameOver) return;

    const move = findBestMove(character);

    if (!move) {
      aiThinking = false;
      finishGame("draw");
      return;
    }

    const osType = determineOS(move);

    maybeShowOS(osType, character);

    await delay(180);

    makeMove(move.row, move.col, CONFIG.AI);

    renderBoard();

    if (checkWin(board, move.row, move.col, CONFIG.AI)) {
      finishGame("loss");
      return;
    }

    if (isBoardFull()) {
      finishGame("draw");
      return;
    }

    currentPlayer = CONFIG.PLAYER;
    aiThinking = false;

    updateStatus("player");
  }

  /* =========================================================
     AI MOVE
     ========================================================= */

  function findBestMove(character) {
    const candidates = getCandidateMoves();

    if (candidates.length === 0) {
      return {
        row: Math.floor(CONFIG.BOARD_SIZE / 2),
        col: Math.floor(CONFIG.BOARD_SIZE / 2)
      };
    }

    let bestScore = -Infinity;
    let bestMoves = [];

    for (const move of candidates) {
      board[move.row][move.col] = CONFIG.AI;

      let score;

      if (
        checkWin(
          board,
          move.row,
          move.col,
          CONFIG.AI
        )
      ) {
        score = 100000000;
      } else {
        score =
          evaluatePosition(
            board,
            CONFIG.AI,
            character
          ) -
          evaluatePosition(
            board,
            CONFIG.PLAYER,
            character
          ) *
            0.95;

        score +=
          centerValue(move.row, move.col) *
          character.center;
      }

      board[move.row][move.col] = CONFIG.EMPTY;

      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }

    if (bestMoves.length === 1) {
      return bestMoves[0];
    }

    return bestMoves[
      Math.floor(Math.random() * bestMoves.length)
    ];
  }

  /* =========================================================
     CANDIDATE MOVES
     ========================================================= */

  function getCandidateMoves() {
    const occupied = [];

    for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
      for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
        if (board[row][col] !== CONFIG.EMPTY) {
          occupied.push({ row, col });
        }
      }
    }

    if (occupied.length === 0) {
      const center = Math.floor(CONFIG.BOARD_SIZE / 2);

      return [
        {
          row: center,
          col: center
        }
      ];
    }

    const candidates = new Map();

    for (const stone of occupied) {
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const row = stone.row + dr;
          const col = stone.col + dc;

          if (!isInside(row, col)) continue;

          if (board[row][col] !== CONFIG.EMPTY) continue;

          const key = `${row},${col}`;

          if (!candidates.has(key)) {
            candidates.set(key, {
              row,
              col
            });
          }
        }
      }
    }

    const moves = [...candidates.values()];

    moves.sort((a, b) => {
      const scoreA =
        localMovePotential(a.row, a.col);

      const scoreB =
        localMovePotential(b.row, b.col);

      return scoreB - scoreA;
    });

    return moves.slice(
      0,
      CONFIG.AI_CANDIDATE_LIMIT
    );
  }

  /* =========================================================
     EVALUATION
     ========================================================= */

  function evaluatePosition(
    currentBoard,
    player,
    character
  ) {
    let score = 0;

    const opponent =
      player === CONFIG.AI
        ? CONFIG.PLAYER
        : CONFIG.AI;

    for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
      for (
        let col = 0;
        col < CONFIG.BOARD_SIZE;
        col++
      ) {
        if (currentBoard[row][col] !== player) {
          continue;
        }

        score +=
          character.center *
          centerValue(row, col);

        score +=
          evaluateDirection(
            currentBoard,
            row,
            col,
            1,
            0,
            player,
            opponent,
            character
          );

        score +=
          evaluateDirection(
            currentBoard,
            row,
            col,
            0,
            1,
            player,
            opponent,
            character
          );

        score +=
          evaluateDirection(
            currentBoard,
            row,
            col,
            1,
            1,
            player,
            opponent,
            character
          );

        score +=
          evaluateDirection(
            currentBoard,
            row,
            col,
            1,
            -1,
            player,
            opponent,
            character
          );
      }
    }

    return score;
  }

  function evaluateDirection(
    currentBoard,
    row,
    col,
    dr,
    dc,
    player,
    opponent,
    character
  ) {
    let own = 0;
    let empty = 0;
    let blocked = 0;

    for (let i = 0; i < 5; i++) {
      const r = row + dr * i;
      const c = col + dc * i;

      if (!isInside(r, c)) {
        blocked++;
        continue;
      }

      const value = currentBoard[r][c];

      if (value === player) {
        own++;
      } else if (value === CONFIG.EMPTY) {
        empty++;
      } else if (value === opponent) {
        blocked++;
      }
    }

    if (blocked >= 2) return 0;

    let value = patternScore(
      own,
      empty,
      blocked
    );

    if (own >= 3) {
      value *= character.threat;
    }

    return value;
  }

  function patternScore(
    own,
    empty,
    blocked
  ) {
    if (own >= 5) return 10000000;

    if (own === 4 && empty >= 1) {
      return 1000000;
    }

    if (own === 3 && empty >= 2) {
      return 100000;
    }

    if (own === 3 && empty >= 1) {
      return 15000;
    }

    if (own === 2 && empty >= 3) {
      return 2500;
    }

    if (own === 2 && empty >= 2) {
      return 700;
    }

    if (own === 1 && empty >= 4) {
      return 80;
    }

    return 5;
  }

  function localMovePotential(row, col) {
    let score = 0;

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;

        const r = row + dr;
        const c = col + dc;

        if (!isInside(r, c)) continue;

        if (board[r][c] !== CONFIG.EMPTY) {
          score += 10;
        }
      }
    }

    return (
      score +
      centerValue(row, col)
    );
  }

  function centerValue(row, col) {
    const center =
      Math.floor(CONFIG.BOARD_SIZE / 2);

    const distance =
      Math.abs(row - center) +
      Math.abs(col - center);

    return Math.max(
      0,
      CONFIG.BOARD_SIZE - distance
    );
  }

  /* =========================================================
     WIN CHECK
     ========================================================= */

  function checkWin(
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

    for (const [dr, dc] of directions) {
      let count = 1;

      count += countDirection(
        currentBoard,
        row,
        col,
        dr,
        dc,
        player
      );

      count += countDirection(
        currentBoard,
        row,
        col,
        -dr,
        -dc,
        player
      );

      if (count >= CONFIG.WIN_LENGTH) {
        return true;
      }
    }

    return false;
  }

  function countDirection(
    currentBoard,
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
      currentBoard[r][c] === player
    ) {
      count++;

      r += dr;
      c += dc;
    }

    return count;
  }

  /* =========================================================
     GAME END
     ========================================================= */

  function finishGame(result) {
    gameOver = true;
    aiThinking = false;

    if (result === "win") {
      gameStats.wins++;
      gameStats.total++;

      const ai =
        gameStats.ai[selectedAI];

      ai.wins++;

      saveStats();
      renderStats();

      showOS("losing");

      updateStatus("win");
      highlightWinningLine(CONFIG.PLAYER);
    }

    if (result === "loss") {
      gameStats.losses++;
      gameStats.total++;

      const ai =
        gameStats.ai[selectedAI];

      ai.wins++;

      saveStats();
      renderStats();

      showOS("winning");

      updateStatus("loss");
      highlightWinningLine(CONFIG.AI);
    }

    if (result === "draw") {
      gameStats.draws++;
      gameStats.total++;

      saveStats();
      renderStats();

      showOS("thinking");

      updateStatus("draw");
    }
  }

  /* =========================================================
     WINNING LINE
     ========================================================= */

  function highlightWinningLine(player) {
    const line = findWinningLine(player);

    if (!line || !DOM.board) return;

    for (const point of line) {
      const cell = DOM.board.querySelector(
        `[data-row="${point.row}"][data-col="${point.col}"]`
      );

      if (cell) {
        cell.classList.add("winning");
      }
    }
  }

  function findWinningLine(player) {
    const directions = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1]
    ];

    for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
      for (
        let col = 0;
        col < CONFIG.BOARD_SIZE;
        col++
      ) {
        if (board[row][col] !== player) continue;

        for (const [dr, dc] of directions) {
          const line = [
            { row, col }
          ];

          for (let i = 1; i < CONFIG.WIN_LENGTH; i++) {
            const r = row + dr * i;
            const c = col + dc * i;

            if (
              isInside(r, c) &&
              board[r][c] === player
            ) {
              line.push({
                row: r,
                col: c
              });
            } else {
              break;
            }
          }

          if (line.length >= CONFIG.WIN_LENGTH) {
            return line;
          }
        }
      }
    }

    return null;
  }

  /* =========================================================
     AI OS
     ========================================================= */

  function maybeShowOS(type, character) {
    const now = Date.now();

    if (
      now - lastOSAt <
      CONFIG.OS_MIN_INTERVAL
    ) {
      return;
    }

    let probability = 0.3;

    if (type === "danger") {
      probability = 0.8;
    }

    if (type === "winning") {
      probability = 0.9;
    }

    if (type === "surprise") {
      probability = 1;
    }

    if (Math.random() > probability) {
      return;
    }

    lastOSAt = now;

    showOS(type, character);
  }

  function showOS(
    type = "thinking",
    character = getSelectedAI()
  ) {
    if (!DOM.aiOS) return;

    const pool =
      character.os[type] ||
      character.os.thinking;

    if (!pool || pool.length === 0) return;

    const text =
      pool[
        Math.floor(
          Math.random() * pool.length
        )
      ];

    DOM.aiOS.classList.remove(
      "is-visible"
    );

    requestAnimationFrame(() => {
      DOM.aiOS.textContent = text;
      DOM.aiOS.classList.add(
        "is-visible"
      );
    });
  }

  function determineOS(move) {
    const opponentThreat =
      countPotentialThreats(
        CONFIG.PLAYER
      );

    const aiThreat =
      countPotentialThreats(
        CONFIG.AI
      );

    if (aiThreat >= 2) {
      return "winning";
    }

    if (opponentThreat >= 2) {
      return "danger";
    }

    if (aiThreat > 0) {
      return "attack";
    }

    if (opponentThreat > 0) {
      return "defend";
    }

    if (Math.random() < 0.08) {
      return "surprise";
    }

    return "thinking";
  }

  function countPotentialThreats(player) {
    let threats = 0;

    const candidates = getCandidateMoves();

    for (const move of candidates) {
      board[move.row][move.col] = player;

      if (
        checkWin(
          board,
          move.row,
          move.col,
          player
        )
      ) {
        threats++;
      }

      board[move.row][move.col] =
        CONFIG.EMPTY;

      if (threats >= 2) break;
    }

    return threats;
  }

  /* =========================================================
     AI SELECTOR
     ========================================================= */

  function setupAISelector() {
    if (!DOM.aiSelect) return;

    DOM.aiSelect.innerHTML = "";

    Object.values(AI_CHARACTERS).forEach(
      character => {
        const option =
          document.createElement("option");

        option.value = character.id;
        option.textContent =
          character.name.zhTW;

        DOM.aiSelect.appendChild(option);
      }
    );

    DOM.aiSelect.value = selectedAI;

    DOM.aiSelect.addEventListener(
      "change",
      event => {
        selectedAI = event.target.value;

        updateAIName();
        resetGame();
      }
    );
  }

  function updateAIName() {
    if (!DOM.aiName) return;

    const character =
      getSelectedAI();

    DOM.aiName.textContent =
      character.name.zhTW;
  }

  function getSelectedAI() {
    return (
      AI_CHARACTERS[selectedAI] ||
      AI_CHARACTERS.sora
    );
  }

  /* =========================================================
     STATUS
     ========================================================= */

  function updateStatus(type) {
    if (!DOM.status) return;

    const messages = {
      player: "你的回合",
      win: "你贏了！",
      loss: "你輸了",
      draw: "和局"
    };

    DOM.status.textContent =
      messages[type] || "";
  }

  /* =========================================================
     RESTART
     ========================================================= */

  function setupRestartButton() {
    if (!DOM.restart) return;

    DOM.restart.addEventListener(
      "click",
      resetGame
    );
  }

  function resetGame() {
    board = [];
    createEmptyBoard();

    currentPlayer =
      CONFIG.PLAYER;

    gameOver = false;
    aiThinking = false;

    lastOSAt = 0;

    updateAIName();
    updateStatus("player");

    if (DOM.aiOS) {
      DOM.aiOS.textContent = "";
      DOM.aiOS.classList.remove(
        "is-visible"
      );
    }

    renderBoard();
  }

  /* =========================================================
     STATS
     ========================================================= */

  function createDefaultStats() {
    const ai = {};

    Object.keys(AI_CHARACTERS).forEach(
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
      ai
    };
  }

  function loadStats() {
    try {
      const saved =
        localStorage.getItem(
          CONFIG.STORAGE_KEY
        );

      if (!saved) {
        return createDefaultStats();
      }

      const parsed =
        JSON.parse(saved);

      const defaults =
        createDefaultStats();

      return {
        ...defaults,
        ...parsed,
        ai: {
          ...defaults.ai,
          ...(parsed.ai || {})
        }
      };
    } catch {
      return createDefaultStats();
    }
  }

  function saveStats() {
    try {
      localStorage.setItem(
        CONFIG.STORAGE_KEY,
        JSON.stringify(gameStats)
      );
    } catch {
      // localStorage unavailable
    }
  }

  function renderStats() {
    if (DOM.playerWins) {
      DOM.playerWins.textContent =
        gameStats.wins;
    }

    if (DOM.playerLosses) {
      DOM.playerLosses.textContent =
        gameStats.losses;
    }

    if (DOM.draws) {
      DOM.draws.textContent =
        gameStats.draws;
    }

    if (DOM.winRate) {
      const completed =
        gameStats.total;

      const rate =
        completed === 0
          ? 0
          : (
              (gameStats.wins /
                completed) *
              100
            );

      DOM.winRate.textContent =
        `${rate.toFixed(1)}%`;
    }
  }

  /* =========================================================
     UTILITIES
     ========================================================= */

  function makeMove(row, col, player) {
    if (!isInside(row, col)) {
      return false;
    }

    if (board[row][col] !== CONFIG.EMPTY) {
      return false;
    }

    board[row][col] = player;

    return true;
  }

  function isBoardFull() {
    for (const row of board) {
      if (row.includes(CONFIG.EMPTY)) {
        return false;
      }
    }

    return true;
  }

  function isInside(row, col) {
    return (
      row >= 0 &&
      row < CONFIG.BOARD_SIZE &&
      col >= 0 &&
      col < CONFIG.BOARD_SIZE
    );
  }

  function getThinkingDelay(character) {
    const base = 420;

    const depthBonus =
      character.depth * 120;

    const random =
      Math.random() * 500;

    return (
      base +
      depthBonus +
      random
    );
  }

  function delay(ms) {
    return new Promise(resolve =>
      setTimeout(resolve, ms)
    );
  }

  /* =========================================================
     PUBLIC API
     ========================================================= */

  window.GomokuGame = {
    reset: resetGame,

    getStats() {
      return structuredClone(
        gameStats
      );
    },

    getAICharacters() {
      return AI_CHARACTERS;
    },

    selectAI(id) {
      if (!AI_CHARACTERS[id]) {
        return;
      }

      selectedAI = id;

      if (DOM.aiSelect) {
        DOM.aiSelect.value = id;
      }

      updateAIName();
      resetGame();
    }
  };

  /* =========================================================
     START
     ========================================================= */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }
})();
