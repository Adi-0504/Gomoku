"use strict";

import {
  CONFIG,
  DIRECTIONS
} from "./config.js";


/*
 * =========================================================
 * GOMOKU BOARD
 * =========================================================
 *
 * Pure board utilities.
 *
 * This module intentionally does not know about:
 * - DOM
 * - Canvas
 * - AI
 * - timers
 * - screens
 * - LocalStorage
 *
 * It only handles board data and rule-level board queries.
 *
 * =========================================================
 */


/*
 * =========================================================
 * CREATE BOARD
 * =========================================================
 */

export function createBoard() {

  return Array.from(
    {
      length: CONFIG.SIZE
    },
    () =>
      Array(
        CONFIG.SIZE
      ).fill(
        CONFIG.EMPTY
      )
  );

}


/*
 * =========================================================
 * CLONE BOARD
 * =========================================================
 */

export function cloneBoard(
  board
) {

  if (
    !Array.isArray(board)
  ) {

    return createBoard();

  }


  return board.map(
    row =>
      Array.isArray(row)
        ? row.slice()
        : Array(
            CONFIG.SIZE
          ).fill(
            CONFIG.EMPTY
          )
  );

}


/*
 * =========================================================
 * CELL CHECK
 * =========================================================
 */

export function isInside(
  row,
  col
) {

  return (
    Number.isInteger(row) &&
    Number.isInteger(col) &&
    row >= 0 &&
    row < CONFIG.SIZE &&
    col >= 0 &&
    col < CONFIG.SIZE
  );

}


/*
 * =========================================================
 * EMPTY CELL
 * =========================================================
 */

export function isEmpty(
  board,
  row,
  col
) {

  return (
    isInside(
      row,
      col
    ) &&
    board[row][col] ===
    CONFIG.EMPTY
  );

}


/*
 * =========================================================
 * BOARD FULL
 * =========================================================
 */

export function isBoardFull(
  board
) {

  if (
    !Array.isArray(board)
  ) {

    return false;

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

      if (
        board[row]?.[col] ===
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
 * OPPONENT
 * =========================================================
 */

export function opponent(
  player
) {

  return player ===
    CONFIG.BLACK
    ? CONFIG.WHITE
    : CONFIG.BLACK;

}


/*
 * =========================================================
 * WINNING LINE
 * =========================================================
 *
 * Returns every connected stone belonging to `player`
 * along the first direction that reaches CONFIG.WIN.
 *
 * Example:
 *
 *      X X X X X
 *
 * returns:
 *
 * [
 *   [row, col],
 *   ...
 * ]
 *
 * Five-or-more is considered a win, matching the current
 * Gomoku implementation.
 *
 * =========================================================
 */

export function getWinningLine(
  board,
  row,
  col,
  player
) {

  if (
    !Array.isArray(board) ||
    !isInside(
      row,
      col
    ) ||
    player ===
    CONFIG.EMPTY ||
    board[row]?.[col] !==
    player
  ) {

    return [];

  }


  for (
    const [dr, dc]
    of DIRECTIONS
  ) {

    const line = [
      [row, col]
    ];


    /*
     * Search forward.
     */

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

      line.push([
        r,
        c
      ]);


      r += dr;
      c += dc;

    }


    /*
     * Search backward.
     */

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

      line.unshift([
        r,
        c
      ]);


      r -= dr;
      c -= dc;

    }


    /*
     * Five or more connected stones wins.
     */

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
 * WIN CHECK
 * =========================================================
 */

export function hasWon(
  board,
  row,
  col,
  player
) {

  return (
    getWinningLine(
      board,
      row,
      col,
      player
    ).length >=
    CONFIG.WIN
  );

}


/*
 * =========================================================
 * COUNT STONES
 * =========================================================
 */

export function countStones(
  board,
  player
) {

  let count = 0;


  if (
    !Array.isArray(board)
  ) {

    return count;

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

      if (
        board[row]?.[col] ===
        player
      ) {

        count++;

      }

    }

  }


  return count;

}


/*
 * =========================================================
 * VALID MOVE
 * =========================================================
 */

export function isValidMove(
  board,
  row,
  col
) {

  return isEmpty(
    board,
    row,
    col
  );

}


/*
 * =========================================================
 * APPLY MOVE
 * =========================================================
 *
 * Returns a cloned board instead of mutating the original.
 *
 * This is useful for:
 * - AI simulation
 * - minimax/search
 * - preview
 * - replay
 *
 * The actual game state can still mutate its own board
 * inside game.js.
 *
 * =========================================================
 */

export function applyMove(
  board,
  row,
  col,
  player
) {

  if (
    !isValidMove(
      board,
      row,
      col
    ) ||
    player ===
    CONFIG.EMPTY
  ) {

    return null;

  }


  const nextBoard =
    cloneBoard(
      board
    );


  nextBoard[row][col] =
    player;


  return nextBoard;

}


/*
 * =========================================================
 * FIND LAST MOVE RESULT
 * =========================================================
 *
 * Convenience helper for game/replay code.
 *
 * =========================================================
 */

export function evaluateMove(
  board,
  row,
  col,
  player
) {

  const winningLine =
    getWinningLine(
      board,
      row,
      col,
      player
    );


  if (
    winningLine.length >=
    CONFIG.WIN
  ) {

    return {
      win: true,
      draw: false,
      winningLine
    };

  }


  return {
    win: false,
    draw: isBoardFull(board),
    winningLine: []
  };

}
