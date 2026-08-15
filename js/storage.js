"use strict";

import { CONFIG } from "./config.js";


/*
 * =========================================================
 * STORAGE
 * =========================================================
 */

function safeParse(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn(
      "[Gomoku] Failed to parse stored data.",
      error
    );

    return fallback;
  }
}


export function loadStats() {

  const fallback = {
    games: 0,
    wins: 0,
    losses: 0,
    draws: 0,

    ai: {
      mio: {
        wins: 0,
        losses: 0
      },

      rin: {
        wins: 0,
        losses: 0
      },

      sora: {
        wins: 0,
        losses: 0
      },

      kuro: {
        wins: 0,
        losses: 0
      }
    },

    records: []
  };


  const stored =
    localStorage.getItem(
      CONFIG.STORAGE_STATS
    );


  const parsed =
    safeParse(
      stored,
      fallback
    );


  return {
    ...fallback,
    ...parsed,

    ai: {
      ...fallback.ai,
      ...(parsed.ai || {})
    },

    records:
      Array.isArray(parsed.records)
        ? parsed.records
        : []
  };

}


export function saveStats(stats) {

  try {

    localStorage.setItem(
      CONFIG.STORAGE_STATS,
      JSON.stringify(stats)
    );

  } catch (error) {

    console.warn(
      "[Gomoku] Failed to save stats.",
      error
    );

  }

}


export function loadSettings() {

  const fallback = {
    language: "zh-TW",
    sound: true,
    motion: true,
    theme: "system"
  };


  const stored =
    localStorage.getItem(
      CONFIG.STORAGE_SETTINGS
    );


  const parsed =
    safeParse(
      stored,
      fallback
    );


  return {
    ...fallback,
    ...parsed
  };

}


export function saveSettings(settings) {

  try {

    localStorage.setItem(
      CONFIG.STORAGE_SETTINGS,
      JSON.stringify(settings)
    );

  } catch (error) {

    console.warn(
      "[Gomoku] Failed to save settings.",
      error
    );

  }

}


export function loadActiveGame() {

  const stored =
    localStorage.getItem(
      CONFIG.STORAGE_GAME
    );


  return safeParse(
    stored,
    null
  );

}


export function saveActiveGame(game) {

  try {

    localStorage.setItem(
      CONFIG.STORAGE_GAME,
      JSON.stringify(game)
    );

  } catch (error) {

    console.warn(
      "[Gomoku] Failed to save active game.",
      error
    );

  }

}


export function clearActiveGame() {

  try {

    localStorage.removeItem(
      CONFIG.STORAGE_GAME
    );

  } catch (error) {

    console.warn(
      "[Gomoku] Failed to clear active game.",
      error
    );

  }

}
