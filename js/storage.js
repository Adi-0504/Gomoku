"use strict";

import {
  CONFIG,
  AI_CHARACTERS
} from "./config.js";


/*
 * =========================================================
 * STORAGE
 * =========================================================
 */


function createDefaultAIStats() {

  const ai = {};

  Object.keys(
    AI_CHARACTERS
  ).forEach(
    id => {

      ai[id] = {
        wins: 0,
        losses: 0,
        games: 0,
        totalTime: 0,
        totalMoves: 0
      };

    }
  );

  return ai;

}


/*
 * =========================================================
 * STATS
 * =========================================================
 */

export function createDefaultStats() {

  return {

    total: 0,

    wins: 0,

    losses: 0,

    draws: 0,


    localWins: 0,

    localLosses: 0,

    localDraws: 0,


    ai:
      createDefaultAIStats(),


    records: []

  };

}


export function loadStats() {

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
      JSON.parse(
        raw
      );


    const mergedAI = {
      ...defaults.ai
    };


    Object.keys(
      AI_CHARACTERS
    ).forEach(
      id => {

        mergedAI[id] = {

          ...defaults.ai[id],

          ...(data.ai?.[id] || {})

        };

      }
    );


    return {

      ...defaults,

      ...data,

      ai:
        mergedAI,

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


export function saveStats(
  stats
) {

  try {

    localStorage.setItem(
      CONFIG.STORAGE_STATS,
      JSON.stringify(
        stats
      )
    );

    return true;

  } catch {

    return false;

  }

}


/*
 * =========================================================
 * SETTINGS
 * =========================================================
 *
 * music:
 *   true  = background music enabled
 *   false = background music disabled
 *
 * Existing users who do not have the new
 * property automatically receive true.
 * =========================================================
 */

export function loadSettings() {

  const defaults = {

    language:
      "zh-TW",

    sound:
      true,

    music:
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


    const data =
      JSON.parse(
        raw
      );


    if (
      !data ||
      typeof data !== "object"
    ) {

      return defaults;

    }


    return {

      ...defaults,

      ...data,

      /*
       * Make sure old settings files
       * still receive the new music flag.
       */

      music:
        data.music !== undefined
          ? Boolean(data.music)
          : true,

      sound:
        data.sound !== undefined
          ? Boolean(data.sound)
          : true,

      motion:
        data.motion !== undefined
          ? Boolean(data.motion)
          : true

    };

  } catch {

    return defaults;

  }

}


export function saveSettings(
  settings
) {

  try {

    localStorage.setItem(
      CONFIG.STORAGE_SETTINGS,
      JSON.stringify(
        settings
      )
    );

    return true;

  } catch {

    return false;

  }

}


/*
 * =========================================================
 * ACTIVE GAME
 * =========================================================
 */

export function loadActiveGame() {

  try {

    const raw =
      localStorage.getItem(
        CONFIG.STORAGE_GAME
      );


    if (!raw) {

      return null;

    }


    return JSON.parse(
      raw
    );

  } catch {

    return null;

  }

}


export function saveActiveGameData(
  data
) {

  try {

    localStorage.setItem(
      CONFIG.STORAGE_GAME,
      JSON.stringify(
        data
      )
    );

    return true;

  } catch {

    return false;

  }

}


export function clearActiveGame() {

  try {

    localStorage.removeItem(
      CONFIG.STORAGE_GAME
    );

    return true;

  } catch {

    return false;

  }

}
