"use strict";

/* =========================================================
   GOMOKU AI WORKER
   ========================================================= */

const BOARD_SIZE = 15;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

function opponent(player) {
  return player === BLACK
    ? WHITE
    : BLACK;
}

function isInside(row, col) {
  return (
    row >= 0 &&
    row < BOARD_SIZE &&
    col >= 0 &&
    col < BOARD_SIZE
  );
}

function cloneBoard(board) {
  return board.map(row => row.slice());
}

function isFull(board) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === EMPTY) {
        return false;
      }
    }
  }

  return true;
}

function hasWin(board, row, col, player) {
  const directions = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1]
  ];

  for (const [dr, dc] of directions) {
    let count = 1;

    for (const sign of [1, -1]) {
      for (let distance = 1; distance < 5; distance++) {
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
          board[r][c] !== player
        ) {
          break;
        }

        count++;
      }
    }

    if (count >= 5) {
      return true;
    }
  }

  return false;
}

function candidateMoves(
  board,
  radius = 2
) {
  const occupied = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== EMPTY) {
        occupied.push([r, c]);
      }
    }
  }

  if (!occupied.length) {
    return [
      {
        row: 7,
        col: 7,
        score: 100000
      }
    ];
  }

  const set = new Set();

  for (const [r, c] of occupied) {
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
        const row = r + dr;
        const col = c + dc;

        if (
          !isInside(row, col) ||
          board[row][col] !== EMPTY
        ) {
          continue;
        }

        set.add(
          `${row},${col}`
        );
      }
    }
  }

  return [...set].map(key => {
    const [row, col] =
      key.split(",").map(Number);

    return {
      row,
      col,
      score: 0
    };
  });
}

function lineScore(
  count,
  openEnds
) {
  if (count >= 5) {
    return 1000000;
  }

  if (count === 4) {
    if (openEnds === 2) {
      return 100000;
    }

    if (openEnds === 1) {
      return 12000;
    }

    return 0;
  }

  if (count === 3) {
    if (openEnds === 2) {
      return 6000;
    }

    if (openEnds === 1) {
      return 700;
    }

    return 0;
  }

  if (count === 2) {
    if (openEnds === 2) {
      return 350;
    }

    if (openEnds === 1) {
      return 60;
    }

    return 0;
  }

  if (count === 1) {
    return openEnds === 2
      ? 8
      : 2;
  }

  return 0;
}

function evaluateLine(
  board,
  row,
  col,
  player,
  dr,
  dc
) {
  if (
    board[row][col] !== player
  ) {
    return 0;
  }

  let count = 1;
  let openEnds = 0;

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

  if (
    isInside(r, c) &&
    board[r][c] === EMPTY
  ) {
    openEnds++;
  }

  r = row - dr;
  c = col - dc;

  while (
    isInside(r, c) &&
    board[r][c] === player
  ) {
    count++;
    r -= dr;
    c -= dc;
  }

  if (
    isInside(r, c) &&
    board[r][c] === EMPTY
  ) {
    openEnds++;
  }

  return lineScore(
    count,
    openEnds
  );
}

function evaluatePosition(
  board,
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

  for (const [dr, dc] of directions) {
    score += evaluateLine(
      board,
      row,
      col,
      player,
      dr,
      dc
    );
  }

  const center =
    (BOARD_SIZE - 1) / 2;

  const distance =
    Math.abs(row - center) +
    Math.abs(col - center);

  score +=
    Math.max(
      0,
      30 - distance * 3
    );

  return score;
}

function evaluateBoard(
  board,
  player
) {
  const enemy =
    opponent(player);

  let score = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === player) {
        score += evaluatePosition(
          board,
          r,
          c,
          player
        );
      }

      if (board[r][c] === enemy) {
        score -=
          evaluatePosition(
            board,
            r,
            c,
            enemy
          ) * 1.05;
      }
    }
  }

  return score;
}

function immediateWinningMove(
  board,
  player,
  moves
) {
  for (const move of moves) {
    board[move.row][move.col] =
      player;

    const win =
      hasWin(
        board,
        move.row,
        move.col,
        player
      );

    board[move.row][move.col] =
      EMPTY;

    if (win) {
      return move;
    }
  }

  return null;
}

function orderMoves(
  board,
  player,
  moves
) {
  const enemy =
    opponent(player);

  return moves
    .map(move => {
      board[move.row][move.col] =
        player;

      const attack =
        evaluatePosition(
          board,
          move.row,
          move.col,
          player
        );

      board[move.row][move.col] =
        enemy;

      const defense =
        evaluatePosition(
          board,
          move.row,
          move.col,
          enemy
        );

      board[move.row][move.col] =
        EMPTY;

      return {
        ...move,
        score:
          attack +
          defense * 0.95
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score
    );
}

function minimax(
  board,
  depth,
  alpha,
  beta,
  maximizingPlayer,
  rootPlayer
) {
  if (depth <= 0) {
    return evaluateBoard(
      board,
      rootPlayer
    );
  }

  if (isFull(board)) {
    return 0;
  }

  const moves =
    orderMoves(
      board,
      maximizingPlayer,
      candidateMoves(
        board,
        2
      )
    ).slice(0, 14);

  if (!moves.length) {
    return 0;
  }

  const isMax =
    maximizingPlayer === rootPlayer;

  if (isMax) {
    let best =
      -Infinity;

    for (const move of moves) {
      board[move.row][move.col] =
        maximizingPlayer;

      let score;

      if (
        hasWin(
          board,
          move.row,
          move.col,
          maximizingPlayer
        )
      ) {
        score =
          9000000 +
          depth * 1000;
      } else {
        score =
          minimax(
            board,
            depth - 1,
            alpha,
            beta,
            opponent(
              maximizingPlayer
            ),
            rootPlayer
          );
      }

      board[move.row][move.col] =
        EMPTY;

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

      if (beta <= alpha) {
        break;
      }
    }

    return best;
  }

  let best =
    Infinity;

  for (const move of moves) {
    board[move.row][move.col] =
      maximizingPlayer;

    let score;

    if (
      hasWin(
        board,
        move.row,
        move.col,
        maximizingPlayer
      )
    ) {
      score =
        -9000000 -
        depth * 1000;
    } else {
      score =
        minimax(
          board,
          depth - 1,
          alpha,
          beta,
          opponent(
            maximizingPlayer
          ),
          rootPlayer
        );
    }

    board[move.row][move.col] =
      EMPTY;

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

    if (beta <= alpha) {
      break;
    }
  }

  return best;
}

function chooseMove(
  board,
  player,
  config
) {
  let moves =
    candidateMoves(
      board,
      config.radius
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
      player,
      moves
    ).slice(
      0,
      config.depth === 1
        ? 12
        : config.depth === 2
          ? 16
          : 20
    );

  const evaluated =
    moves.map(move => {
      board[move.row][move.col] =
        player;

      let score =
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
            player
          );
      }

      board[move.row][move.col] =
        EMPTY;

      return {
        ...move,
        score
      };
    });

  evaluated.sort(
    (a, b) =>
      b.score - a.score
  );

  const topCount =
    Math.min(
      config.randomTop + 1,
      evaluated.length
    );

  const selectedIndex =
    Math.floor(
      Math.random() *
      topCount
    );

  return evaluated[
    selectedIndex
  ];
}

self.addEventListener(
  "message",
  event => {
    const {
      board,
      player,
      config,
      thinkTime
    } = event.data;

    const workingBoard =
      cloneBoard(board);

    const move =
      chooseMove(
        workingBoard,
        player,
        config
      );

    self.postMessage({
      row: move?.row ?? null,
      col: move?.col ?? null,
      thinkTime
    });
  }
);
