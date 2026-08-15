"use strict";

/*
 * =========================================================
 * GOMOKU CONFIG
 * =========================================================
 */

export const CONFIG = {
  SIZE: 15,
  WIN: 5,

  EMPTY: 0,
  BLACK: 1,
  WHITE: 2,

  STORAGE_GAME: "gomoku-active-game-v5",
  STORAGE_STATS: "gomoku-stats-v5",
  STORAGE_SETTINGS: "gomoku-settings-v5",

  WORKER: "./ai-worker.js",

  SFX_MODULE: "https://esm.sh/uisfx",
  SFX_PACK: "organic",
  SFX_VOLUME: 0.30,

  AUDIO_COOLDOWN_MS: 42,

  MOVE_ANIMATION_MS: 145,

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

export const AI_CHARACTERS = {

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
        "等等……我看到一個機會。",
        "這次我要主動出擊。",
        "先算一下。"
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

export const DIFFICULTY = {

  easy: {
    depth: 1,
    radius: 2,
    randomTop: 4,
    label: "初級",
    description: "先熟悉棋盤"
  },

  normal: {
    depth: 2,
    radius: 2,
    randomTop: 2,
    label: "中級",
    description: "開始讀你的棋"
  },

  hard: {
    depth: 3,
    radius: 2,
    randomTop: 1,
    label: "高級",
    description: "每一步都可能是陷阱"
  }

};


/*
 * =========================================================
 * SFX
 * =========================================================
 */

export const SFX = {

  hover: "hover",

  press: "press",
  release: "release",

  select: "select",
  deselect: "deselect",

  toggleOn: "toggle-on",
  toggleOff: "toggle-off",

  delete: "delete",

  undo: "undo",

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
  complete: "complete",

  stone: "select"

};


/*
 * =========================================================
 * DIRECTIONS
 * =========================================================
 */

export const DIRECTIONS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1]
];
