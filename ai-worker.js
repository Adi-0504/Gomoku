"use strict";

/*
 * =========================================================
 * GOMOKU AI WORKER
 * Offline minimax AI
 * =========================================================
 */

const SIZE = 15;

const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

const DIRECTIONS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1]
];

/* =========================================================
   BASIC
   ========================================================= */

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

function cloneBoard(board) {
  return board.map(
    row => row.slice()
  );
}

function isFull(board) {
  for (
    let row = 0;
    row < SIZE;
    row += 1
  ) {
    for (
      let col = 0;
      col < SIZE;
      col += 1
    ) {
      if (
        board[row][col] ===
        EMPTY
      ) {
        return false;
      }
    }
  }

  return true;
}

/* =========================================================
   WIN
   ========================================================= */

function hasWin(
  board,
  row,
  col,
  player
) {
  for (
    const [dr, dc]
    of DIRECTIONS
  ) {
    let count = 1;

    for (
      const sign of [1, -1]
    ) {
      for (
        let distance = 1;
        distance < 5;
        distance += 1
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
          !isInside(r, c) ||
          board[r][c] !==
            player
        ) {
          break;
        }

        count += 1;
      }
    }

    if (
      count >= 5
    ) {
      return true;
    }
  }

  return false;
}

/* =========================================================
   CANDIDATES
   ========================================================= */

function candidateMoves(
  board,
  radius
) {
  const occupied = [];

  for (
    let row = 0;
    row < SIZE;
    row += 1
  ) {
    for (
      let col = 0;
      col < SIZE;
      col += 1
    ) {
      if (
        board[row][col] !==
        EMPTY
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

  const map =
    new Map();

  for (
    const stone of occupied
  ) {
    for (
      let dr = -radius;
      dr <= radius;
      dr += 1
    ) {
      for (
        let dc = -radius;
        dc <= radius;
        dc += 1
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
          EMPTY
        ) {
          continue;
        }

        map.set(
          `${row},${col}`,
          {
            row,
            col
          }
        );
      }
    }
  }

  return [
    ...map.values()
  ];
}

/* =========================================================
   PATTERN SCORE
   ========================================================= */

function countDirection(
  board,
  row,
  col,
  dr,
  dc,
  player
) {
  let count = 0;

  for (
    let distance = 1;
    distance <= 4;
    distance += 1
  ) {
    const r =
      row +
      dr *
        distance;

    const c =
      col +
      dc *
        distance;

    if (
      !isInside(r, c) ||
      board[r][c] !==
        player
    ) {
      break;
    }

    count += 1;
  }

  return count;
}

function openEnds(
  board,
  row,
  col,
  dr,
  dc,
  player
) {
  let open = 0;

  const forward =
    countDirection(
      board,
      row,
      col,
      dr,
      dc,
      player
    );

  const backward =
    countDirection(
      board,
      row,
      col,
      -dr,
      -dc,
      player
    );

  const frontRow =
    row +
    dr *
      (forward + 1);

  const frontCol =
    col +
    dc *
      (forward + 1);

  if (
    isInside(
      frontRow,
      frontCol
    ) &&
    board[
      frontRow
    ][
      frontCol
    ] === EMPTY
  ) {
    open += 1;
  }

  const backRow =
    row -
    dr *
      (backward + 1);

  const backCol =
    col -
    dc *
      (backward + 1);

  if (
    isInside(
      backRow,
      backCol
    ) &&
    board[
      backRow
    ][
      backCol
    ] === EMPTY
  ) {
    open += 1;
  }

  return open;
}

function patternValue(
  count,
  open
) {
  if (count >= 5) {
    return 1000000;
  }

  if (
    count === 4 &&
    open === 2
  ) {
    return 100000;
  }

  if (
    count === 4 &&
    open === 1
  ) {
    return 12000;
  }

  if (
    count === 3 &&
    open === 2
  ) {
    return 4000;
  }

  if (
    count === 3 &&
    open === 1
  ) {
    return 500;
  }

  if (
    count === 2 &&
    open === 2
  ) {
    return 300;
  }

  if (
    count === 2 &&
    open === 1
  ) {
    return 60;
  }

  return 5;
}

function evaluatePoint(
  board,
  row,
  col,
  player
) {
  if (
    board[row][col] !==
    EMPTY
  ) {
    return -Infinity;
  }

  let score = 0;

  for (
    const [dr, dc]
    of DIRECTIONS
  ) {
    const count =
      1 +
      countDirection(
        board,
        row,
        col,
        dr,
        dc,
        player
      ) +
      countDirection(
        board,
        row,
        col,
        -dr,
        -dc,
        player
      );

    const open =
      openEnds(
        board,
        row,
        col,
        dr,
        dc,
        player
      );

    score +=
      patternValue(
        count,
        open
      );
  }

  return score;
}

/* =========================================================
   POSITION EVALUATION
   ========================================================= */

function evaluateBoard(
  board,
  player
) {
  const enemy =
    opponent(player);

  let score = 0;

  for (
    let row = 0;
    row < SIZE;
    row += 1
  ) {
    for (
      let col = 0;
      col < SIZE;
      col += 1
    ) {
      if (
        board[row][col] ===
        player
      ) {
        score +=
          evaluateOccupied(
            board,
            row,
            col,
            player
          );
      } else if (
        board[row][col] ===
        enemy
      ) {
        score -=
          evaluateOccupied(
            board,
            row,
            col,
            enemy
          ) *
          0.94;
      }
    }
  }

  return score;
}

function evaluateOccupied(
  board,
  row,
  col,
  player
) {
  let score = 0;

  for (
    const [dr, dc]
    of DIRECTIONS
  ) {
    let count = 1;

    count +=
      countDirection(
        board,
        row,
        col,
        dr,
        dc,
        player
      );

    count +=
      countDirection(
        board,
        row,
        col,
        -dr,
        -dc,
        player
      );

    const open =
      openEnds(
        board,
        row,
        col,
        dr,
        dc,
        player
      );

    score +=
      patternValue(
        count,
        open
      );
  }

  return score;
}

/* =========================================================
   MOVE ORDER
   ========================================================= */

function centerScore(
  row,
  col
) {
  return (
    20 -
    Math.abs(
      row - 7
    ) -
    Math.abs(
      col - 7
    )
  );
}

function moveScore(
  board,
  move,
  player,
  style
) {
  const enemy =
    opponent(player);

  const attack =
    evaluatePoint(
      board,
      move.row,
      move.col,
      player
    );

  const defense =
    evaluatePoint(
      board,
      move.row,
      move.col,
      enemy
    );

  let score =
    attack +
    defense * 0.95 +
    centerScore(
      move.row,
      move.col
    );

  if (
    style ===
    "attack"
  ) {
    score +=
      attack * 0.18;
  }

  if (
    style ===
    "defense"
  ) {
    score +=
      defense * 0.18;
  }

  if (
    style ===
    "counter"
  ) {
    score +=
      defense * 0.12;
  }

  if (
    style ===
    "tricky"
  ) {
    score +=
      centerScore(
        move.row,
        move.col
      ) *
      0.8;
  }

  if (
    style ===
    "master"
  ) {
    score +=
      attack * 0.08 +
      defense * 0.08;
  }

  return score;
}

function orderMoves(
  board,
  moves,
  player,
  style
) {
  return moves
    .map(
      move => ({
        ...move,
        score:
          moveScore(
            board,
            move,
            player,
            style
          )
      })
    )
    .sort(
      (a, b) =>
        b.score -
        a.score
    );
}

/* =========================================================
   IMMEDIATE THREATS
   ========================================================= */

function immediateWinningMove(
  board,
  player,
  moves
) {
  for (
    const move of moves
  ) {
    board[
      move.row
    ][
      move.col
    ] = player;

    const win =
      hasWin(
        board,
        move.row,
        move.col,
        player
      );

    board[
      move.row
    ][
      move.col
    ] = EMPTY;

    if (win) {
      return move;
    }
  }

  return null;
}

/* =========================================================
   MINIMAX
   ========================================================= */

function minimax(
  board,
  depth,
  alpha,
  beta,
  turn,
  root,
  style,
  radius
) {
  if (
    depth <= 0
  ) {
    return evaluateBoard(
      board,
      root
    );
  }

  const moves =
    orderMoves(
      board,
      candidateMoves(
        board,
        radius
      ),
      turn,
      style
    ).slice(
      0,
      depth >= 3
        ? 18
        : depth === 2
          ? 14
          : 10
    );

  if (!moves.length) {
    return 0;
  }

  const maximizing =
    turn === root;

  let best =
    maximizing
      ? -Infinity
      : Infinity;

  for (
    const move of moves
  ) {
    board[
      move.row
    ][
      move.col
    ] = turn;

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
          ? 10000000 +
            depth
          : -10000000 -
            depth;
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
          radius
        );
    }

    board[
      move.row
    ][
      move.col
    ] = EMPTY;

    if (maximizing) {
      best =
        Math.max(
          best,
          score
        );

      alpha =
        Math.max(
          alpha,
          best
        );
    } else {
      best =
        Math.min(
          best,
          score
        );

      beta =
        Math.min(
          beta,
          best
        );
    }

    if (
      beta <= alpha
    ) {
      break;
    }
  }

  return best;
}

/* =========================================================
   CHOOSE MOVE
   ========================================================= */

function chooseMove(
  board,
  player,
  config
) {
  const radius =
    Math.max(
      1,
      config.radius || 2
    );

  const style =
    config.style ||
    "balanced";

  let moves =
    candidateMoves(
      board,
      radius
    );

  if (!moves.length) {
    return null;
  }

  const winning =
    immediateWinningMove(
      board,
      player,
      moves
    );

  if (winning) {
    return winning;
  }

  const blocking =
    immediateWinningMove(
      board,
      opponent(player),
      moves
    );

  if (blocking) {
    return blocking;
  }

  moves =
    orderMoves(
      board,
      moves,
      player,
      style
    );

  const maxCandidates =
    config.depth === 1
      ? 12
      : config.depth === 2
        ? 16
        : 20;

  moves =
    moves.slice(
      0,
      maxCandidates
    );

  const evaluated =
    [];

  for (
    const move of moves
  ) {
    board[
      move.row
    ][
      move.col
    ] = player;

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
        10000000;
    } else {
      score =
        evaluateBoard(
          board,
          player
        );

      if (
        config.depth > 1
      ) {
        score +=
          minimax(
            board,
            config.depth - 1,
            -Infinity,
            Infinity,
            opponent(player),
            player,
            style,
            radius
          );
      }
    }

    board[
      move.row
    ][
      move.col
    ] = EMPTY;

    evaluated.push({
      ...move,
      score
    });
  }

  evaluated.sort(
    (a, b) =>
      b.score -
      a.score
  );

  const randomTop =
    Math.max(
      0,
      config.randomTop || 0
    );

  const topCount =
    Math.min(
      randomTop + 1,
      evaluated.length
    );

  const selected =
    evaluated[
      Math.floor(
        Math.random() *
          topCount
      )
    ];

  return (
    selected ||
    evaluated[0]
  );
}

/* =========================================================
   MESSAGE
   ========================================================= */

self.addEventListener(
  "message",
  event => {
    const {
      board,
      player,
      config
    } = event.data || {};

    if (
      !Array.isArray(board) ||
      !Number.isInteger(player)
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
        config || {}
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
