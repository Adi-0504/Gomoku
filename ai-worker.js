"use strict";

/*
 * =========================================================
 * GOMOKU AI WORKER 2.0
 * Threat-Space Search + Alpha-Beta + Transposition Table
 * =========================================================
 *
 * Compatible with the existing app.js Worker API.
 *
 * Input:
 * {
 *   board,
 *   player,
 *   config
 * }
 *
 * Output:
 * {
 *   row,
 *   col
 * }
 *
 * Board:
 * 0 = EMPTY
 * 1 = BLACK
 * 2 = WHITE
 *
 * Current game rule:
 * five or more connected stones = win
 *
 * This engine is designed for freestyle Gomoku.
 * It does not apply Renju forbidden-move rules.
 * =========================================================
 */

const SIZE = 15;
const CELL_COUNT = SIZE * SIZE;

const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

const DIRECTIONS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1]
];

const WIN_SCORE = 1000000000;
const MATE_SCORE = 100000000;

const INF = 1e15;

/*
 * =========================================================
 * CONFIG
 * =========================================================
 */

const DEFAULT_CONFIG = {
  depth: 3,
  radius: 2,
  randomTop: 0,
  style: "balanced"
};

const DIFFICULTY = {
  easy: {
    depth: 2,
    radius: 2,
    candidates: 14,
    tacticalDepth: 4,
    randomTop: 3
  },

  normal: {
    depth: 3,
    radius: 2,
    candidates: 20,
    tacticalDepth: 6,
    randomTop: 1
  },

  hard: {
    depth: 4,
    radius: 2,
    candidates: 24,
    tacticalDepth: 8,
    randomTop: 0
  },

  master: {
    depth: 5,
    radius: 2,
    candidates: 28,
    tacticalDepth: 10,
    randomTop: 0
  }
};

/*
 * =========================================================
 * BASIC
 * =========================================================
 */

function opponent(player) {
  return player === BLACK
    ? WHITE
    : BLACK;
}

function isInside(row, col) {
  return (
    row >= 0 &&
    row < SIZE &&
    col >= 0 &&
    col < SIZE
  );
}

function indexOf(row, col) {
  return row * SIZE + col;
}

function cloneBoard(board) {
  return board.map(row => row.slice());
}

function isFull(board) {
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (board[row][col] === EMPTY) {
        return false;
      }
    }
  }

  return true;
}

function countStones(board) {
  let count = 0;

  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (board[row][col] !== EMPTY) {
        count += 1;
      }
    }
  }

  return count;
}

/*
 * =========================================================
 * WIN DETECTION
 * =========================================================
 */

function countLine(
  board,
  row,
  col,
  dr,
  dc,
  player
) {
  let count = 0;

  for (let distance = 1; distance <= 5; distance += 1) {
    const r = row + dr * distance;
    const c = col + dc * distance;

    if (
      !isInside(r, c) ||
      board[r][c] !== player
    ) {
      break;
    }

    count += 1;
  }

  return count;
}

function hasWin(
  board,
  row,
  col,
  player
) {
  for (const [dr, dc] of DIRECTIONS) {
    const total =
      1 +
      countLine(
        board,
        row,
        col,
        dr,
        dc,
        player
      ) +
      countLine(
        board,
        row,
        col,
        -dr,
        -dc,
        player
      );

    if (total >= 5) {
      return true;
    }
  }

  return false;
}

function wouldWin(
  board,
  row,
  col,
  player
) {
  if (
    !isInside(row, col) ||
    board[row][col] !== EMPTY
  ) {
    return false;
  }

  board[row][col] = player;

  const result = hasWin(
    board,
    row,
    col,
    player
  );

  board[row][col] = EMPTY;

  return result;
}

/*
 * =========================================================
 * LINE ANALYSIS
 * =========================================================
 */

function analyzeLine(
  board,
  row,
  col,
  dr,
  dc,
  player
) {
  let forward = 0;
  let backward = 0;

  for (let distance = 1; distance <= 5; distance += 1) {
    const r = row + dr * distance;
    const c = col + dc * distance;

    if (
      !isInside(r, c) ||
      board[r][c] !== player
    ) {
      break;
    }

    forward += 1;
  }

  for (let distance = 1; distance <= 5; distance += 1) {
    const r = row - dr * distance;
    const c = col - dc * distance;

    if (
      !isInside(r, c) ||
      board[r][c] !== player
    ) {
      break;
    }

    backward += 1;
  }

  const total =
    1 +
    forward +
    backward;

  const frontRow =
    row + dr * (forward + 1);

  const frontCol =
    col + dc * (forward + 1);

  const backRow =
    row - dr * (backward + 1);

  const backCol =
    col - dc * (backward + 1);

  const frontOpen =
    isInside(frontRow, frontCol) &&
    board[frontRow][frontCol] === EMPTY;

  const backOpen =
    isInside(backRow, backCol) &&
    board[backRow][backCol] === EMPTY;

  return {
    count: total,
    openEnds:
      Number(frontOpen) +
      Number(backOpen),
    frontOpen,
    backOpen,
    frontRow,
    frontCol,
    backRow,
    backCol
  };
}

/*
 * =========================================================
 * PATTERN CLASSIFICATION
 * =========================================================
 */

const PATTERN = {
  FIVE: 0,
  OPEN_FOUR: 1,
  CLOSED_FOUR: 2,
  OPEN_THREE: 3,
  CLOSED_THREE: 4,
  OPEN_TWO: 5,
  CLOSED_TWO: 6,
  OTHER: 7
};

function classifyPattern(
  count,
  openEnds
) {
  if (count >= 5) {
    return PATTERN.FIVE;
  }

  if (count === 4 && openEnds === 2) {
    return PATTERN.OPEN_FOUR;
  }

  if (count === 4 && openEnds === 1) {
    return PATTERN.CLOSED_FOUR;
  }

  if (count === 3 && openEnds === 2) {
    return PATTERN.OPEN_THREE;
  }

  if (count === 3 && openEnds === 1) {
    return PATTERN.CLOSED_THREE;
  }

  if (count === 2 && openEnds === 2) {
    return PATTERN.OPEN_TWO;
  }

  if (count === 2 && openEnds === 1) {
    return PATTERN.CLOSED_TWO;
  }

  return PATTERN.OTHER;
}

function patternScore(
  count,
  openEnds
) {
  switch (
    classifyPattern(
      count,
      openEnds
    )
  ) {
    case PATTERN.FIVE:
      return 100000000;

    case PATTERN.OPEN_FOUR:
      return 10000000;

    case PATTERN.CLOSED_FOUR:
      return 500000;

    case PATTERN.OPEN_THREE:
      return 100000;

    case PATTERN.CLOSED_THREE:
      return 6000;

    case PATTERN.OPEN_TWO:
      return 2500;

    case PATTERN.CLOSED_TWO:
      return 180;

    default:
      return 5;
  }
}

/*
 * =========================================================
 * MOVE PATTERN
 * =========================================================
 */

function evaluateMovePattern(
  board,
  row,
  col,
  player
) {
  if (board[row][col] !== EMPTY) {
    return {
      score: -INF,
      openFours: 0,
      closedFours: 0,
      openThrees: 0,
      closedThrees: 0,
      openTwos: 0
    };
  }

  let score = 0;

  let openFours = 0;
  let closedFours = 0;
  let openThrees = 0;
  let closedThrees = 0;
  let openTwos = 0;

  for (const [dr, dc] of DIRECTIONS) {
    const line = analyzeLine(
      board,
      row,
      col,
      dr,
      dc,
      player
    );

    const pattern =
      classifyPattern(
        line.count,
        line.openEnds
      );

    score += patternScore(
      line.count,
      line.openEnds
    );

    if (pattern === PATTERN.OPEN_FOUR) {
      openFours += 1;
    }

    if (pattern === PATTERN.CLOSED_FOUR) {
      closedFours += 1;
    }

    if (pattern === PATTERN.OPEN_THREE) {
      openThrees += 1;
    }

    if (pattern === PATTERN.CLOSED_THREE) {
      closedThrees += 1;
    }

    if (pattern === PATTERN.OPEN_TWO) {
      openTwos += 1;
    }
  }

  /*
   * Double threats are much more important
   * than raw heuristic score.
   */

  if (openFours >= 1) {
    score += 20000000;
  }

  if (openFours + closedFours >= 2) {
    score += 15000000;
  }

  if (openThrees >= 2) {
    score += 5000000;
  }

  if (
    openThrees >= 1 &&
    openFours + closedFours >= 1
  ) {
    score += 8000000;
  }

  return {
    score,
    openFours,
    closedFours,
    openThrees,
    closedThrees,
    openTwos
  };
}

/*
 * =========================================================
 * POSITION EVALUATION
 * =========================================================
 */

function evaluateBoard(
  board,
  rootPlayer
) {
  const enemy =
    opponent(rootPlayer);

  let attack = 0;
  let defense = 0;

  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const stone = board[row][col];

      if (stone === EMPTY) {
        continue;
      }

      const local =
        evaluateOccupied(
          board,
          row,
          col,
          stone
        );

      if (stone === rootPlayer) {
        attack += local;
      } else if (stone === enemy) {
        defense += local;
      }
    }
  }

  /*
   * Stronger than the previous 0.94 factor.
   * Defense must matter almost as much as attack.
   */

  return attack - defense * 1.02;
}

function evaluateOccupied(
  board,
  row,
  col,
  player
) {
  let score = 0;

  for (const [dr, dc] of DIRECTIONS) {
    const line =
      analyzeLine(
        board,
        row,
        col,
        dr,
        dc,
        player
      );

    score += patternScore(
      line.count,
      line.openEnds
    );
  }

  /*
   * Mild central preference.
   * Tactical patterns dominate this.
   */

  const center =
    (SIZE - 1) / 2;

  const distance =
    Math.abs(row - center) +
    Math.abs(col - center);

  score +=
    Math.max(
      0,
      20 - distance
    );

  return score;
}

/*
 * =========================================================
 * CANDIDATE GENERATION
 * =========================================================
 */

function candidateMoves(
  board,
  radius
) {
  const occupied = [];

  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (board[row][col] !== EMPTY) {
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

  const map = new Map();

  for (const stone of occupied) {
    for (let dr = -radius; dr <= radius; dr += 1) {
      for (let dc = -radius; dc <= radius; dc += 1) {
        if (dr === 0 && dc === 0) {
          continue;
        }

        const row =
          stone.row + dr;

        const col =
          stone.col + dc;

        if (!isInside(row, col)) {
          continue;
        }

        if (board[row][col] !== EMPTY) {
          continue;
        }

        const key =
          `${row},${col}`;

        if (!map.has(key)) {
          map.set(key, {
            row,
            col
          });
        }
      }
    }
  }

  return [
    ...map.values()
  ];
}

/*
 * =========================================================
 * FORCED MOVES
 * =========================================================
 */

function winningMoves(
  board,
  player,
  moves
) {
  const result = [];

  for (const move of moves) {
    if (
      wouldWin(
        board,
        move.row,
        move.col,
        player
      )
    ) {
      result.push(move);
    }
  }

  return result;
}

function immediateWinningMove(
  board,
  player,
  moves
) {
  const wins =
    winningMoves(
      board,
      player,
      moves
    );

  return wins[0] || null;
}

/*
 * =========================================================
 * THREAT CREATION
 * =========================================================
 */

function countWinningReplies(
  board,
  player,
  moves
) {
  let count = 0;

  for (const move of moves) {
    if (
      wouldWin(
        board,
        move.row,
        move.col,
        player
      )
    ) {
      count += 1;
    }
  }

  return count;
}

function winningReplyMoves(
  board,
  player,
  moves
) {
  const result = [];

  for (const move of moves) {
    if (
      wouldWin(
        board,
        move.row,
        move.col,
        player
      )
    ) {
      result.push(move);
    }
  }

  return result;
}

function createsDoubleThreat(
  board,
  move,
  player,
  radius
) {
  board[move.row][move.col] =
    player;

  const replies =
    candidateMoves(
      board,
      radius
    );

  const wins =
    countWinningReplies(
      board,
      player,
      replies
    );

  board[move.row][move.col] =
    EMPTY;

  return wins >= 2;
}

function forcingMoves(
  board,
  player,
  moves,
  radius
) {
  const result = [];

  for (const move of moves) {
    const pattern =
      evaluateMovePattern(
        board,
        move.row,
        move.col,
        player
      );

    if (
      pattern.openFours > 0 ||
      pattern.closedFours > 0 ||
      pattern.openThrees >= 2 ||
      createsDoubleThreat(
        board,
        move,
        player,
        radius
      )
    ) {
      result.push({
        ...move,
        tacticalScore:
          pattern.score
      });
    }
  }

  result.sort(
    (a, b) =>
      b.tacticalScore -
      a.tacticalScore
  );

  return result;
}

/*
 * =========================================================
 * THREAT-SPACE SEARCH
 * =========================================================
 *
 * This is the major difference from the old engine.
 *
 * Instead of asking:
 *
 * "Which move has the highest heuristic?"
 *
 * it asks:
 *
 * "Can this move force the opponent to respond?"
 *
 * =========================================================
 */

function threatSearch(
  board,
  player,
  depth,
  radius
) {
  const moves =
    candidateMoves(
      board,
      radius
    );

  if (!moves.length) {
    return {
      win: false,
      move: null,
      score: 0
    };
  }

  const winning =
    winningMoves(
      board,
      player,
      moves
    );

  if (winning.length) {
    return {
      win: true,
      move: winning[0],
      score:
        WIN_SCORE + depth
    };
  }

  if (depth <= 0) {
    return {
      win: false,
      move: null,
      score: 0
    };
  }

  const tactical =
    forcingMoves(
      board,
      player,
      moves,
      radius
    );

  if (!tactical.length) {
    return {
      win: false,
      move: null,
      score: 0
    };
  }

  const enemy =
    opponent(player);

  let bestMove = null;
  let bestScore = -INF;

  for (const move of tactical) {
    board[move.row][move.col] =
      player;

    const replies =
      candidateMoves(
        board,
        radius
      );

    /*
     * If the opponent already has a direct win,
     * this is not a forcing success.
     */

    const enemyWins =
      winningMoves(
        board,
        enemy,
        replies
      );

    if (enemyWins.length) {
      board[move.row][move.col] =
        EMPTY;

      continue;
    }

    /*
     * The opponent must answer the
     * strongest forcing replies.
     */

    const enemyForcing =
      forcingMoves(
        board,
        enemy,
        replies,
        radius
      );

    let forcedLoss = false;

    if (!enemyForcing.length) {
      forcedLoss = true;
    } else {
      let allAnswered = true;

      for (const reply of enemyForcing.slice(0, 8)) {
        board[reply.row][reply.col] =
          enemy;

        const next =
          threatSearch(
            board,
            player,
            depth - 1,
            radius
          );

        board[reply.row][reply.col] =
          EMPTY;

        if (!next.win) {
          allAnswered = false;
          break;
        }
      }

      forcedLoss = allAnswered;
    }

    board[move.row][move.col] =
      EMPTY;

    if (forcedLoss) {
      const score =
        WIN_SCORE / 2 +
        depth * 100000 +
        move.tacticalScore;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }

  return {
    win: Boolean(bestMove),
    move: bestMove,
    score:
      bestMove
        ? bestScore
        : 0
  };
}

/*
 * =========================================================
 * MOVE ORDERING
 * =========================================================
 */

function centerScore(
  row,
  col
) {
  const center =
    (SIZE - 1) / 2;

  return (
    20 -
    Math.abs(row - center) -
    Math.abs(col - center)
  );
}

function scoreCandidate(
  board,
  move,
  player,
  style,
  radius
) {
  const enemy =
    opponent(player);

  const attack =
    evaluateMovePattern(
      board,
      move.row,
      move.col,
      player
    );

  const defense =
    evaluateMovePattern(
      board,
      move.row,
      move.col,
      enemy
    );

  let score =
    attack.score +
    defense.score * 1.04 +
    centerScore(
      move.row,
      move.col
    );

  /*
   * Immediate tactical priority.
   */

  if (
    attack.openFours > 0
  ) {
    score += 30000000;
  }

  if (
    attack.closedFours > 0
  ) {
    score += 5000000;
  }

  if (
    defense.openFours > 0
  ) {
    score += 28000000;
  }

  if (
    defense.closedFours > 0
  ) {
    score += 4500000;
  }

  if (
    attack.openThrees >= 2
  ) {
    score += 9000000;
  }

  if (
    defense.openThrees >= 2
  ) {
    score += 8500000;
  }

  if (
    createsDoubleThreat(
      board,
      move,
      player,
      radius
    )
  ) {
    score += 12000000;
  }

  /*
   * Style remains compatible with the
   * existing character system.
   */

  if (style === "attack") {
    score +=
      attack.score * 0.20;
  }

  if (style === "defense") {
    score +=
      defense.score * 0.20;
  }

  if (style === "counter") {
    score +=
      defense.score * 0.14;
  }

  if (style === "tricky") {
    score +=
      centerScore(
        move.row,
        move.col
      ) * 1.5;
  }

  if (style === "master") {
    score +=
      attack.score * 0.10 +
      defense.score * 0.10;
  }

  return score;
}

function orderMoves(
  board,
  moves,
  player,
  style,
  radius,
  ttMove
) {
  return moves
    .map(move => ({
      ...move,
      score:
        scoreCandidate(
          board,
          move,
          player,
          style,
          radius
        ) +
        (
          ttMove &&
          ttMove.row === move.row &&
          ttMove.col === move.col
            ? 1000000000
            : 0
        )
    }))
    .sort(
      (a, b) =>
        b.score -
        a.score
    );
}

/*
 * =========================================================
 * ZOBRIST HASH
 * =========================================================
 */

const ZOBRIST = [];

let randomState = 0x9e3779b9;

function nextRandom32() {
  randomState |= 0;
  randomState =
    randomState +
    0x6D2B79F5 |
    0;

  let t =
    Math.imul(
      randomState ^
        (randomState >>> 15),
      1 |
        randomState
    );

  t ^=
    t +
    Math.imul(
      t ^
        (t >>> 7),
      61 |
        t
    );

  return (
    (t ^
      (t >>> 14)) >>>
    0
  );
}

for (
  let i = 0;
  i < CELL_COUNT;
  i += 1
) {
  ZOBRIST[i] = [
    0,
    nextRandom32(),
    nextRandom32()
  ];
}

function hashBoard(board) {
  let hash = 0;

  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const value =
        board[row][col];

      if (value !== EMPTY) {
        hash ^=
          ZOBRIST[
            indexOf(row, col)
          ][value];
      }
    }
  }

  return hash >>> 0;
}

/*
 * =========================================================
 * TRANSPOSITION TABLE
 * =========================================================
 */

const transposition =
  new Map();

const TT_MAX =
  50000;

const TT_EXACT = 0;
const TT_LOWER = 1;
const TT_UPPER = 2;

function ttGet(
  key,
  depth,
  alpha,
  beta
) {
  const entry =
    transposition.get(key);

  if (!entry) {
    return null;
  }

  if (entry.depth < depth) {
    return null;
  }

  if (entry.flag === TT_EXACT) {
    return entry;
  }

  if (
    entry.flag === TT_LOWER &&
    entry.score >= beta
  ) {
    return entry;
  }

  if (
    entry.flag === TT_UPPER &&
    entry.score <= alpha
  ) {
    return entry;
  }

  return null;
}

function ttSet(
  key,
  depth,
  score,
  flag,
  move
) {
  if (
    transposition.size >=
    TT_MAX
  ) {
    const first =
      transposition.keys().next();

    if (!first.done) {
      transposition.delete(
        first.value
      );
    }
  }

  transposition.set(
    key,
    {
      depth,
      score,
      flag,
      move
    }
  );
}

/*
 * =========================================================
 * MINIMAX + ALPHA BETA
 * =========================================================
 */

function minimax(
  board,
  depth,
  alpha,
  beta,
  turn,
  root,
  style,
  radius,
  candidateLimit,
  lastMove,
  ply
) {
  /*
   * Previous move ended the game.
   */

  if (
    lastMove &&
    hasWin(
      board,
      lastMove.row,
      lastMove.col,
      opponent(turn)
    )
  ) {
    return (
      opponent(turn) === root
        ? MATE_SCORE - ply
        : -MATE_SCORE + ply
    );
  }

  if (depth <= 0) {
    return evaluateBoard(
      board,
      root
    );
  }

  if (isFull(board)) {
    return 0;
  }

  const hash =
    hashBoard(board) ^
    (
      turn === WHITE
        ? 0x5bd1e995
        : 0
    );

  const cached =
    ttGet(
      hash,
      depth,
      alpha,
      beta
    );

  if (cached) {
    return cached.score;
  }

  const maximizing =
    turn === root;

  const ttMove =
    transposition.get(hash)?.move ||
    null;

  let moves =
    candidateMoves(
      board,
      radius
    );

  /*
   * Forced winning moves first.
   */

  const wins =
    winningMoves(
      board,
      turn,
      moves
    );

  if (wins.length) {
    moves = wins;
  } else {
    moves =
      orderMoves(
        board,
        moves,
        turn,
        style,
        radius,
        ttMove
      ).slice(
        0,
        candidateLimit
      );
  }

  if (!moves.length) {
    return 0;
  }

  const originalAlpha =
    alpha;

  const originalBeta =
    beta;

  let best =
    maximizing
      ? -INF
      : INF;

  let bestMove =
    null;

  for (const move of moves) {
    board[move.row][move.col] =
      turn;

    let score;

    if (
      hasWin(
        board,
        move.row,
        move.col,
        turn
      )
    ) {
      score =
        turn === root
          ? MATE_SCORE - ply
          : -MATE_SCORE + ply;
    } else {
      score =
        minimax(
          board,
          depth - 1,
          alpha,
          beta,
          opponent(turn),
          root,
          style,
          radius,
          candidateLimit,
          move,
          ply + 1
        );
    }

    board[move.row][move.col] =
      EMPTY;

    if (maximizing) {
      if (score > best) {
        best = score;
        bestMove = move;
      }

      alpha =
        Math.max(
          alpha,
          best
        );
    } else {
      if (score < best) {
        best = score;
        bestMove = move;
      }

      beta =
        Math.min(
          beta,
          best
        );
    }

    if (beta <= alpha) {
      break;
    }
  }

  let flag =
    TT_EXACT;

  if (best <= originalAlpha) {
    flag = TT_UPPER;
  } else if (best >= originalBeta) {
    flag = TT_LOWER;
  }

  ttSet(
    hash,
    depth,
    best,
    flag,
    bestMove
  );

  return best;
}

/*
 * =========================================================
 * ROOT SEARCH
 * =========================================================
 */

function searchRoot(
  board,
  player,
  depth,
  config
) {
  const radius =
    config.radius;

  const style =
    config.style;

  const candidateLimit =
    config.candidates;

  let moves =
    candidateMoves(
      board,
      radius
    );

  /*
   * Immediate win.
   */

  const wins =
    winningMoves(
      board,
      player,
      moves
    );

  if (wins.length) {
    return {
      move: wins[0],
      score:
        MATE_SCORE
    };
  }

  /*
   * Immediate defense.
   */

  const enemy =
    opponent(player);

  const enemyWins =
    winningMoves(
      board,
      enemy,
      moves
    );

  if (enemyWins.length) {
    /*
     * If there are several winning points,
     * choose the defensive move that also
     * creates the strongest counterattack.
     */

    let bestDefense =
      null;

    let bestDefenseScore =
      -INF;

    for (const block of enemyWins) {
      const pattern =
        scoreCandidate(
          board,
          block,
          player,
          style,
          radius
        );

      if (
        pattern >
        bestDefenseScore
      ) {
        bestDefenseScore =
          pattern;

        bestDefense =
          block;
      }
    }

    return {
      move:
        bestDefense ||
        enemyWins[0],
      score:
        MATE_SCORE / 2
    };
  }

  /*
   * Threat-space search before normal
   * positional search.
   */

  const threat =
    threatSearch(
      board,
      player,
      config.tacticalDepth,
      radius
    );

  if (
    threat.win &&
    threat.move
  ) {
    return {
      move: threat.move,
      score:
        threat.score
    };
  }

  moves =
    orderMoves(
      board,
      moves,
      player,
      style,
      radius,
      null
    ).slice(
      0,
      candidateLimit
    );

  const evaluated = [];

  let alpha = -INF;
  const beta = INF;

  for (const move of moves) {
    board[move.row][move.col] =
      player;

    let score;

    if (
      hasWin(
        board,
        move.row,
        move.col,
        player
      )
    ) {
      score =
        MATE_SCORE;
    } else {
      score =
        minimax(
          board,
          depth - 1,
          alpha,
          beta,
          enemy,
          player,
          style,
          radius,
          candidateLimit,
          move,
          1
        );
    }

    board[move.row][move.col] =
      EMPTY;

    evaluated.push({
      ...move,
      score
    });

    alpha =
      Math.max(
        alpha,
        score
      );
  }

  evaluated.sort(
    (a, b) =>
      b.score -
      a.score
  );

  return {
    move:
      evaluated[0] ||
      null,
    score:
      evaluated[0]?.score ??
      0,
    evaluated
  };
}

/*
 * =========================================================
 * CHOOSE MOVE
 * =========================================================
 */

function normalizeConfig(
  config
) {
  const input =
    config || {};

  let difficulty =
    null;

  if (
    typeof input.difficulty ===
    "string"
  ) {
    difficulty =
      DIFFICULTY[
        input.difficulty
      ];
  }

  const base =
    difficulty ||
    DIFFICULTY.normal;

  const depth =
    Number.isInteger(
      input.depth
    )
      ? Math.max(
          1,
          Math.min(
            6,
            input.depth
          )
        )
      : base.depth;

  const radius =
    Number.isInteger(
      input.radius
    )
      ? Math.max(
          1,
          Math.min(
            3,
            input.radius
          )
        )
      : base.radius;

  const candidates =
    Number.isInteger(
      input.candidates
    )
      ? Math.max(
          8,
          Math.min(
            32,
            input.candidates
          )
        )
      : base.candidates;

  const tacticalDepth =
    Number.isInteger(
      input.tacticalDepth
    )
      ? Math.max(
          2,
          Math.min(
            12,
            input.tacticalDepth
          )
        )
      : base.tacticalDepth;

  const randomTop =
    Number.isInteger(
      input.randomTop
    )
      ? Math.max(
          0,
          Math.min(
            5,
            input.randomTop
          )
        )
      : base.randomTop;

  return {
    depth,
    radius,
    candidates,
    tacticalDepth,
    randomTop,
    style:
      typeof input.style ===
      "string"
        ? input.style
        : "balanced"
  };
}

function chooseMove(
  board,
  player,
  rawConfig
) {
  const config =
    normalizeConfig(
      rawConfig
    );

  transposition.clear();

  const stones =
    countStones(board);

  /*
   * First move:
   * center.
   */

  if (stones === 0) {
    return {
      row: 7,
      col: 7
    };
  }

  const moves =
    candidateMoves(
      board,
      config.radius
    );

  if (!moves.length) {
    return null;
  }

  /*
   * Absolute priority:
   * win now.
   */

  const win =
    immediateWinningMove(
      board,
      player,
      moves
    );

  if (win) {
    return win;
  }

  /*
   * Absolute priority:
   * stop opponent's win.
   */

  const block =
    immediateWinningMove(
      board,
      opponent(player),
      moves
    );

  if (block) {
    return block;
  }

  /*
   * Search from shallow to deep.
   *
   * This keeps the engine responsive and
   * improves move ordering for later depths.
   */

  let best =
    null;

  const maxDepth =
    config.depth;

  for (
    let depth = 1;
    depth <= maxDepth;
    depth += 1
  ) {
    const result =
      searchRoot(
        board,
        player,
        depth,
        config
      );

    if (result.move) {
      best = result.move;
    }
  }

  /*
   * Final tactical pass.
   */

  const finalMoves =
    candidateMoves(
      board,
      config.radius
    );

  const forcing =
    forcingMoves(
      board,
      player,
      finalMoves,
      config.radius
    );

  if (forcing.length) {
    const tactical =
      forcing[0];

    /*
     * Only replace the normal search result
     * when the tactical move is genuinely strong.
     */

    const tacticalPattern =
      evaluateMovePattern(
        board,
        tactical.row,
        tactical.col,
        player
      );

    if (
      tacticalPattern.openFours > 0 ||
      tacticalPattern.openThrees >= 2 ||
      createsDoubleThreat(
        board,
        tactical,
        player,
        config.radius
      )
    ) {
      best = tactical;
    }
  }

  if (!best) {
    best =
      moves[0];
  }

  /*
   * Keep existing randomTop compatibility.
   *
   * Only apply randomness when explicitly
   * configured / used by easy AI.
   */

  if (
    config.randomTop > 0
  ) {
    const ranked =
      searchRoot(
        board,
        player,
        Math.min(
          2,
          config.depth
        ),
        config
      ).evaluated || [];

    if (ranked.length) {
      const count =
        Math.min(
          ranked.length,
          config.randomTop + 1
        );

      best =
        ranked[
          Math.floor(
            Math.random() *
            count
          )
        ];
    }
  }

  return best;
}

/*
 * =========================================================
 * WORKER MESSAGE
 * =========================================================
 */

self.addEventListener(
  "message",
  event => {
    const data =
      event.data || {};

    const board =
      data.board;

    const player =
      data.player;

    if (
      !Array.isArray(board) ||
      board.length !== SIZE ||
      !Number.isInteger(player) ||
      (
        player !== BLACK &&
        player !== WHITE
      )
    ) {
      self.postMessage({
        row: null,
        col: null
      });

      return;
    }

    const workingBoard =
      cloneBoard(board);

    const move =
      chooseMove(
        workingBoard,
        player,
        data.config ||
          DEFAULT_CONFIG
      );

    self.postMessage({
      row:
        move?.row ??
        null,

      col:
        move?.col ??
        null
    });
  }
);
