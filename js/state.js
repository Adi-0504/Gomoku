"use strict";

import { CONFIG } from "./config.js";
import {
  loadStats,
  loadSettings
} from "./storage.js";


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


export function createInitialState() {

  return {

    screen: "home",

    mode: "ai",

    difficulty: "easy",

    character: "mio",

    playerSide:
      CONFIG.BLACK,

    aiSide:
      CONFIG.WHITE,


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

}


export const state =
  createInitialState();
