"use strict";

/* =========================================================
   GOMOKU V0.1
   ========================================================= */

const BOARD_SIZE = 15;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

const STORAGE_DB = "gomoku-db";
const STORAGE_VERSION = 1;

const AI_CONFIG = {
  easy: {
    depth: 1,
    radius: 2,
    randomTop: 3,
    thinkMin: 180,
    thinkMax: 420
  },

  normal: {
    depth: 2,
    radius: 2,
    randomTop: 1,
    thinkMin: 350,
    thinkMax: 850
  },

  hard: {
    depth: 3,
    radius: 2,
    randomTop: 0,
    thinkMin: 600,
    thinkMax: 1400
  }
};


/* =========================================================
   I18N
   ========================================================= */

const I18N = {
  "zh-TW": {
    "app.title": "五子棋",
    "home.subtitle": "簡單的規則，沒有簡單的棋局。",
    "home.start": "開始遊戲",
    "home.records": "棋局記錄",
    "home.settings": "設定",
    "home.resumeLabel": "未完成棋局",
    "home.resume": "繼續",

    "setup.title": "開始遊戲",
    "setup.mode": "對戰方式",
    "setup.ai": "人機",
    "setup.local": "雙人",
    "setup.difficulty": "難度",
    "setup.side": "你的棋子",
    "setup.begin": "開始",

    "difficulty.easy": "初級",
    "difficulty.easyDescription": "適合第一次玩",
    "difficulty.normal": "中級",
    "difficulty.normalDescription": "開始認真下棋",
    "difficulty.hard": "高級",
    "difficulty.hardDescription": "需要真正思考",

    "side.black": "黑棋",
    "side.white": "白棋",
    "side.first": "先手",
    "side.second": "後手",

    "game.thinking": "思考中",
    "game.undo": "悔棋",
    "game.restart": "重新開始",
    "game.menu": "選單",

    "result.winKicker": "對局結束",
    "result.win": "你贏了",
    "result.winDescription": "五連達成。",
    "result.loseKicker": "對局結束",
    "result.lose": "你輸了",
    "result.loseDescription": "這局棋到此結束。",
    "result.drawKicker": "對局結束",
    "result.draw": "平局",
    "result.drawDescription": "棋盤已經沒有空位。",
    "result.again": "再來一局",
    "result.home": "返回首頁",

    "records.title": "棋局記錄",
    "records.games": "對局",
    "records.wins": "勝利",
    "records.losses": "失敗",
    "records.draws": "平局",
    "records.clear": "清除記錄",
    "records.empty": "還沒有棋局記錄",

    "settings.title": "設定",
    "settings.language": "語言",
    "settings.languageDescription": "選擇介面語言",
    "settings.sound": "音效",
    "settings.soundDescription": "落子與遊戲音效",
    "settings.motion": "動畫",
    "settings.motionDescription": "啟用遊戲動畫",
    "settings.theme": "外觀",
    "settings.themeDescription": "使用系統外觀",

    "toast.undo": "已悔棋",
    "toast.noUndo": "目前沒有可以悔棋的步驟",
    "toast.restart": "重新開始這局棋？",
    "toast.recordsCleared": "棋局記錄已清除",
    "toast.saved": "棋局已保存",
    "toast.aiUnavailable": "AI 暫時無法使用",
    "toast.aiThinking": "AI 正在思考"
  },

  "zh-CN": {
    "app.title": "五子棋",
    "home.subtitle": "简单的规则，没有简单的棋局。",
    "home.start": "开始游戏",
    "home.records": "棋局记录",
    "home.settings": "设置",
    "home.resumeLabel": "未完成棋局",
    "home.resume": "继续",

    "setup.title": "开始游戏",
    "setup.mode": "对战方式",
    "setup.ai": "人机",
    "setup.local": "双人",
    "setup.difficulty": "难度",
    "setup.side": "你的棋子",
    "setup.begin": "开始",

    "difficulty.easy": "初级",
    "difficulty.easyDescription": "适合第一次玩",
    "difficulty.normal": "中级",
    "difficulty.normalDescription": "开始认真下棋",
    "difficulty.hard": "高级",
    "difficulty.hardDescription": "需要真正思考",

    "side.black": "黑棋",
    "side.white": "白棋",
    "side.first": "先手",
    "side.second": "后手",

    "game.thinking": "思考中",
    "game.undo": "悔棋",
    "game.restart": "重新开始",
    "game.menu": "菜单",

    "result.winKicker": "对局结束",
    "result.win": "你赢了",
    "result.winDescription": "五连达成。",
    "result.loseKicker": "对局结束",
    "result.lose": "你输了",
    "result.loseDescription": "这局棋到此结束。",
    "result.drawKicker": "对局结束",
    "result.draw": "平局",
    "result.drawDescription": "棋盘已经没有空位。",
    "result.again": "再来一局",
    "result.home": "返回首页",

    "records.title": "棋局记录",
    "records.games": "对局",
    "records.wins": "胜利",
    "records.losses": "失败",
    "records.draws": "平局",
    "records.clear": "清除记录",
    "records.empty": "还没有棋局记录",

    "settings.title": "设置",
    "settings.language": "语言",
    "settings.languageDescription": "选择界面语言",
    "settings.sound": "音效",
    "settings.soundDescription": "落子与游戏音效",
    "settings.motion": "动画",
    "settings.motionDescription": "启用游戏动画",
    "settings.theme": "外观",
    "settings.themeDescription": "使用系统外观",

    "toast.undo": "已悔棋",
    "toast.noUndo": "目前没有可以悔棋的步骤",
    "toast.restart": "重新开始这局棋？",
    "toast.recordsCleared": "棋局记录已清除",
    "toast.saved": "棋局已保存",
    "toast.aiUnavailable": "AI 暂时无法使用",
    "toast.aiThinking": "AI 正在思考"
  },

  en: {
    "app.title": "Gomoku",
    "home.subtitle": "Simple rules. Never simple games.",
    "home.start": "Start Game",
    "home.records": "Game Records",
    "home.settings": "Settings",
    "home.resumeLabel": "Unfinished Game",
    "home.resume": "Resume",

    "setup.title": "Start Game",
    "setup.mode": "Game Mode",
    "setup.ai": "vs AI",
    "setup.local": "Two Players",
    "setup.difficulty": "Difficulty",
    "setup.side": "Your Stone",
    "setup.begin": "Begin",

    "difficulty.easy": "Easy",
    "difficulty.easyDescription": "Good for beginners",
    "difficulty.normal": "Normal",
    "difficulty.normalDescription": "A real challenge",
    "difficulty.hard": "Hard",
    "difficulty.hardDescription": "Think carefully",

    "side.black": "Black",
    "side.white": "White",
    "side.first": "First",
    "side.second": "Second",

    "game.thinking": "Thinking",
    "game.undo": "Undo",
    "game.restart": "Restart",
    "game.menu": "Menu",

    "result.winKicker": "Game Over",
    "result.win": "You Win",
    "result.winDescription": "Five in a row.",
    "result.loseKicker": "Game Over",
    "result.lose": "You Lose",
    "result.loseDescription": "This game has ended.",
    "result.drawKicker": "Game Over",
    "result.draw": "Draw",
    "result.drawDescription": "The board is full.",
    "result.again": "Play Again",
    "result.home": "Home",

    "records.title": "Game Records",
    "records.games": "Games",
    "records.wins": "Wins",
    "records.losses": "Losses",
    "records.draws": "Draws",
    "records.clear": "Clear Records",
    "records.empty": "No games yet",

    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.languageDescription": "Choose interface language",
    "settings.sound": "Sound",
    "settings.soundDescription": "Stone and game sounds",
    "settings.motion": "Animation",
    "settings.motionDescription": "Enable game animations",
    "settings.theme": "Appearance",
    "settings.themeDescription": "Use system appearance",

    "toast.undo": "Move undone",
    "toast.noUndo": "Nothing to undo",
    "toast.restart": "Restart this game?",
    "toast.recordsCleared": "Records cleared",
    "toast.saved": "Game saved",
    "toast.aiUnavailable": "AI is temporarily unavailable",
    "toast.aiThinking": "AI is thinking"
  },

  ja: {
    "app.title": "五目並べ",
    "home.subtitle": "ルールは簡単。でも、対局は簡単じゃない。",
    "home.start": "ゲーム開始",
    "home.records": "対局記録",
    "home.settings": "設定",
    "home.resumeLabel": "未完了の対局",
    "home.resume": "続ける",

    "setup.title": "ゲーム開始",
    "setup.mode": "対戦方式",
    "setup.ai": "AI対戦",
    "setup.local": "二人対戦",
    "setup.difficulty": "難易度",
    "setup.side": "あなたの石",
    "setup.begin": "開始",

    "difficulty.easy": "初級",
    "difficulty.easyDescription": "初心者向け",
    "difficulty.normal": "中級",
    "difficulty.normalDescription": "しっかり考える対戦",
    "difficulty.hard": "上級",
    "difficulty.hardDescription": "本気で考えよう",

    "side.black": "黒",
    "side.white": "白",
    "side.first": "先手",
    "side.second": "後手",

    "game.thinking": "考え中",
    "game.undo": "待った",
    "game.restart": "最初から",
    "game.menu": "メニュー",

    "result.winKicker": "対局終了",
    "result.win": "あなたの勝ち",
    "result.winDescription": "五つ並びました。",
    "result.loseKicker": "対局終了",
    "result.lose": "あなたの負け",
    "result.loseDescription": "この対局は終了しました。",
    "result.drawKicker": "対局終了",
    "result.draw": "引き分け",
    "result.drawDescription": "盤面がいっぱいです。",
    "result.again": "もう一局",
    "result.home": "ホームへ",

    "records.title": "対局記録",
    "records.games": "対局",
    "records.wins": "勝ち",
    "records.losses": "負け",
    "records.draws": "引き分け",
    "records.clear": "記録を削除",
    "records.empty": "まだ対局記録がありません",

    "settings.title": "設定",
    "settings.language": "言語",
    "settings.languageDescription": "表示言語を選択",
    "settings.sound": "サウンド",
    "settings.soundDescription": "石を置く音など",
    "settings.motion": "アニメーション",
    "settings.motionDescription": "ゲームのアニメーション",
    "settings.theme": "外観",
    "settings.themeDescription": "システム設定を使用",

    "toast.undo": "一手戻しました",
    "toast.noUndo": "戻せる手がありません",
    "toast.restart": "この対局を最初からやり直しますか？",
    "toast.recordsCleared": "記録を削除しました",
    "toast.saved": "対局を保存しました",
    "toast.aiUnavailable": "AIを使用できません",
    "toast.aiThinking": "AIが考えています"
  },

  ko: {
    "app.title": "오목",
    "home.subtitle": "규칙은 간단하지만, 바둑판은 간단하지 않습니다.",
    "home.start": "게임 시작",
    "home.records": "대국 기록",
    "home.settings": "설정",
    "home.resumeLabel": "진행 중인 게임",
    "home.resume": "계속",

    "setup.title": "게임 시작",
    "setup.mode": "게임 방식",
    "setup.ai": "AI 대전",
    "setup.local": "2인 대전",
    "setup.difficulty": "난이도",
    "setup.side": "내 돌",
    "setup.begin": "시작",

    "difficulty.easy": "초급",
    "difficulty.easyDescription": "처음 하는 사람에게",
    "difficulty.normal": "중급",
    "difficulty.normalDescription": "제대로 생각하는 AI",
    "difficulty.hard": "고급",
    "difficulty.hardDescription": "신중하게 두세요",

    "side.black": "흑돌",
    "side.white": "백돌",
    "side.first": "선공",
    "side.second": "후공",

    "game.thinking": "생각 중",
    "game.undo": "무르기",
    "game.restart": "다시 시작",
    "game.menu": "메뉴",

    "result.winKicker": "대국 종료",
    "result.win": "승리",
    "result.winDescription": "5개가 연결되었습니다.",
    "result.loseKicker": "대국 종료",
    "result.lose": "패배",
    "result.loseDescription": "게임이 끝났습니다.",
    "result.drawKicker": "대국 종료",
    "result.draw": "무승부",
    "result.drawDescription": "바둑판이 가득 찼습니다.",
    "result.again": "다시 하기",
    "result.home": "홈으로",

    "records.title": "대국 기록",
    "records.games": "대국",
    "records.wins": "승",
    "records.losses": "패",
    "records.draws": "무승부",
    "records.clear": "기록 삭제",
    "records.empty": "아직 대국 기록이 없습니다",

    "settings.title": "설정",
    "settings.language": "언어",
    "settings.languageDescription": "인터페이스 언어",
    "settings.sound": "효과음",
    "settings.soundDescription": "돌 놓기 및 게임 효과음",
    "settings.motion": "애니메이션",
    "settings.motionDescription": "게임 애니메이션",
    "settings.theme": "화면",
    "settings.themeDescription": "시스템 설정 사용",

    "toast.undo": "한 수 되돌렸습니다",
    "toast.noUndo": "되돌릴 수가 없습니다",
    "toast.restart": "이 게임을 다시 시작할까요?",
    "toast.recordsCleared": "기록을 삭제했습니다",
    "toast.saved": "게임을 저장했습니다",
    "toast.aiUnavailable": "AI를 사용할 수 없습니다",
    "toast.aiThinking": "AI가 생각하고 있습니다"
  }
};


/* =========================================================
   APP STATE
   ========================================================= */

const state = {
  screen: "home",

  mode: "ai",
  difficulty: "easy",
  humanSide: BLACK,

  board: createBoard(),
  currentPlayer: BLACK,

  moves: [],
  winningLine: [],

  gameOver: false,
  aiThinking: false,

  preview: null,
  lastMove: null,

  settings: {
    language: "zh-TW",
    sound: true,
    motion: true,
    theme: "system"
  },

  records: {
    games: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    history: []
  }
};


/* =========================================================
   DOM
   ========================================================= */

const $ = (selector) => document.querySelector(selector);

const screens = {
  home: $("#homeScreen"),
  setup: $("#setupScreen"),
  game: $("#gameScreen"),
  result: $("#resultScreen"),
  records: $("#recordsScreen"),
  settings: $("#settingsScreen")
};

const canvas = $("#boardCanvas");
const ctx = canvas.getContext("2d");

let canvasSize = 0;
let cellSize = 0;
let boardPadding = 0;

let aiWorker = null;
let audioContext = null;
let toastTimer = null;


/* =========================================================
   UTILITIES
   ========================================================= */

function createBoard() {
  return Array.from(
    { length: BOARD_SIZE },
    () => Array(BOARD_SIZE).fill(EMPTY)
  );
}

function cloneBoard(board) {
  return board.map(row => row.slice());
}

function opponent(player) {
  return player === BLACK ? WHITE : BLACK;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomBetween(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function playerName(player) {
  const lang = state.settings.language;

  const names = {
    "zh-TW": {
      [BLACK]: "黑棋",
      [WHITE]: "白棋"
    },
    "zh-CN": {
      [BLACK]: "黑棋",
      [WHITE]: "白棋"
    },
    en: {
      [BLACK]: "Black",
      [WHITE]: "White"
    },
    ja: {
      [BLACK]: "黒",
      [WHITE]: "白"
    },
    ko: {
      [BLACK]: "흑돌",
      [WHITE]: "백돌"
    }
  };

  return names[lang][player];
}


/* =========================================================
   I18N ENGINE
   ========================================================= */

function t(key) {
  return I18N[state.settings.language]?.[key]
    ?? I18N["en"][key]
    ?? key;
}

function applyTranslations() {
  document.documentElement.lang = state.settings.language;

  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.dataset.i18n;
    element.textContent = t(key);
  });

  updateTurnUI();
  updateRecordsUI();
  updateResumeUI();
}

function setLanguage(language) {
  if (!I18N[language]) {
    return;
  }

  state.settings.language = language;
  $("#languageSelect").value = language;

  saveSettings();
  applyTranslations();
}


/* =========================================================
   INDEXED DB
   ========================================================= */

let dbPromise = null;

function openDB() {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(
      STORAGE_DB,
      STORAGE_VERSION
    );

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings");
      }

      if (!db.objectStoreNames.contains("game")) {
        db.createObjectStore("game");
      }

      if (!db.objectStoreNames.contains("records")) {
        db.createObjectStore("records");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

async function dbPut(storeName, key, value) {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      tx.objectStore(storeName).put(value, key);

      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    return false;
  }
}

async function dbGet(storeName, key) {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const request = tx.objectStore(storeName).get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return undefined;
  }
}

async function dbDelete(storeName, key) {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      tx.objectStore(storeName).delete(key);

      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    return false;
  }
}


/* =========================================================
   SETTINGS
   ========================================================= */

async function loadSettings() {
  const saved = await dbGet("settings", "settings");

  if (saved) {
    state.settings = {
      ...state.settings,
      ...saved
    };
  }

  $("#languageSelect").value = state.settings.language;
  $("#soundToggle").checked = state.settings.sound;
  $("#motionToggle").checked = state.settings.motion;
  $("#themeSelect").value = state.settings.theme;

  applyTheme();
  applyMotion();
  applyTranslations();
}

async function saveSettings() {
  await dbPut(
    "settings",
    "settings",
    state.settings
  );
}

function applyTheme() {
  if (state.settings.theme === "system") {
    delete document.documentElement.dataset.theme;
    return;
  }

  document.documentElement.dataset.theme =
    state.settings.theme;
}

function applyMotion() {
  if (state.settings.motion) {
    delete document.documentElement.dataset.motion;
  } else {
    document.documentElement.dataset.motion = "off";
  }
}


/* =========================================================
   GAME SAVE / RESTORE
   ========================================================= */

async function saveCurrentGame() {
  if (state.gameOver || state.moves.length === 0) {
    await dbDelete("game", "current");
    updateResumeUI();
    return;
  }

  await dbPut("game", "current", {
    mode: state.mode,
    difficulty: state.difficulty,
    humanSide: state.humanSide,
    board: state.board,
    currentPlayer: state.currentPlayer,
    moves: state.moves,
    lastMove: state.lastMove,
    savedAt: Date.now()
  });

  updateResumeUI();
}

async function loadSavedGame() {
  return dbGet("game", "current");
}

async function restoreSavedGame() {
  const saved = await loadSavedGame();

  if (!saved) {
    return false;
  }

  state.mode = saved.mode;
  state.difficulty = saved.difficulty;
  state.humanSide = saved.humanSide;

  state.board = saved.board;
  state.currentPlayer = saved.currentPlayer;
  state.moves = saved.moves || [];
  state.lastMove = saved.lastMove || null;

  state.gameOver = false;
  state.aiThinking = false;
  state.winningLine = [];

  showScreen("game");
  drawBoard();

  if (
    state.mode === "ai" &&
    state.currentPlayer !== state.humanSide
  ) {
    requestAI();
  }

  return true;
}

async function updateResumeUI() {
  const saved = await loadSavedGame();

  if (!saved || !saved.moves?.length) {
    $("#resumeCard").hidden = true;
    return;
  }

  $("#resumeCard").hidden = false;

  const moveCount = saved.moves.length;

  $("#resumeText").textContent =
    `${moveCount} ${state.settings.language === "en" ? "moves" : "手"}`;
}


/* =========================================================
   RECORDS
   ========================================================= */

async function loadRecords() {
  const saved = await dbGet("records", "records");

  if (saved) {
    state.records = {
      ...state.records,
      ...saved
    };
  }

  updateRecordsUI();
}

async function saveRecords() {
  await dbPut(
    "records",
    "records",
    state.records
  );
}

function addRecord(result) {
  state.records.games++;

  if (result === "win") {
    state.records.wins++;
  }

  if (result === "loss") {
    state.records.losses++;
  }

  if (result === "draw") {
    state.records.draws++;
  }

  state.records.history.unshift({
    result,
    mode: state.mode,
    difficulty: state.difficulty,
    moves: state.moves.length,
    timestamp: Date.now()
  });

  state.records.history =
    state.records.history.slice(0, 30);

  saveRecords();
  updateRecordsUI();
}

function updateRecordsUI() {
  $("#statGames").textContent = state.records.games;
  $("#statWins").textContent = state.records.wins;
  $("#statLosses").textContent = state.records.losses;
  $("#statDraws").textContent = state.records.draws;

  const list = $("#recordList");
  list.innerHTML = "";

  if (!state.records.history.length) {
    const empty = document.createElement("p");
    empty.className = "subtitle";
    empty.textContent = t("records.empty");
    list.appendChild(empty);
    return;
  }

  state.records.history.forEach(record => {
    const item = document.createElement("div");
    item.className = "record-item";

    const left = document.createElement("div");

    const title = document.createElement("strong");

    if (record.result === "win") {
      title.textContent = t("result.win");
    } else if (record.result === "loss") {
      title.textContent = t("result.lose");
    } else {
      title.textContent = t("result.draw");
    }

    const meta = document.createElement("small");

    const date = new Date(record.timestamp);

    meta.textContent =
      `${date.toLocaleDateString()} · ${record.moves}`;

    left.appendChild(title);
    left.appendChild(meta);

    const result = document.createElement("span");

    result.className =
      `record-result ${record.result}`;

    result.textContent =
      record.mode === "ai"
        ? playerName(state.humanSide)
        : t("setup.local");

    item.appendChild(left);
    item.appendChild(result);

    list.appendChild(item);
  });
}


/* =========================================================
   SCREEN NAVIGATION
   ========================================================= */

function showScreen(name) {
  Object.entries(screens).forEach(([key, element]) => {
    element.classList.toggle(
      "active",
      key === name
    );
  });

  state.screen = name;

  $("#backButton").hidden =
    name === "home";

  $("#menuButton").hidden =
    name !== "home";

  if (name === "game") {
    drawBoard();
  }

  if (name === "records") {
    updateRecordsUI();
  }
}

function goHome() {
  stopAIWorker();

  state.aiThinking = false;

  showScreen("home");
  updateResumeUI();
}

function showSetup() {
  showScreen("setup");
}


/* =========================================================
   GAME INITIALIZATION
   ========================================================= */

function newGame() {
  stopAIWorker();

  state.board = createBoard();
  state.currentPlayer = BLACK;
  state.moves = [];
  state.winningLine = [];
  state.gameOver = false;
  state.aiThinking = false;
  state.preview = null;
  state.lastMove = null;

  showScreen("game");
  drawBoard();

  if (
    state.mode === "ai" &&
    state.humanSide !== BLACK
  ) {
    requestAI();
  }

  saveCurrentGame();
}

function restartGame() {
  const confirmed = window.confirm(t("toast.restart"));

  if (!confirmed) {
    return;
  }

  newGame();
}

function setupGameFromSelection() {
  newGame();
}


/* =========================================================
   MOVE / GAME ENGINE
   ========================================================= */

function isInside(row, col) {
  return (
    row >= 0 &&
    row < BOARD_SIZE &&
    col >= 0 &&
    col < BOARD_SIZE
  );
}

function isBoardFull(board) {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === EMPTY) {
        return false;
      }
    }
  }

  return true;
}

function getWinningLine(board, row, col, player) {
  const directions = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1]
  ];

  for (const [dr, dc] of directions) {
    const line = [{ row, col }];

    for (let distance = 1; distance < BOARD_SIZE; distance++) {
      const r = row + dr * distance;
      const c = col + dc * distance;

      if (
        !isInside(r, c) ||
        board[r][c] !== player
      ) {
        break;
      }

      line.push({ row: r, col: c });
    }

    for (let distance = 1; distance < BOARD_SIZE; distance++) {
      const r = row - dr * distance;
      const c = col - dc * distance;

      if (
        !isInside(r, c) ||
        board[r][c] !== player
      ) {
        break;
      }

      line.unshift({ row: r, col: c });
    }

    if (line.length >= 5) {
      return line;
    }
  }

  return [];
}

async function playMove(row, col, player) {
  if (state.gameOver) {
    return false;
  }

  if (
    !isInside(row, col) ||
    state.board[row][col] !== EMPTY
  ) {
    return false;
  }

  if (state.aiThinking) {
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
  state.preview = null;

  playStoneSound(player);
  drawBoard();

  const winningLine =
    getWinningLine(
      state.board,
      row,
      col,
      player
    );

  if (winningLine.length >= 5) {
    await finishGame(player, winningLine);
    return true;
  }

  if (isBoardFull(state.board)) {
    await finishGame(null, []);
    return true;
  }

  state.currentPlayer = opponent(player);

  updateTurnUI();
  await saveCurrentGame();

  if (
    state.mode === "ai" &&
    state.currentPlayer !== state.humanSide
  ) {
    requestAI();
  }

  return true;
}


/* =========================================================
   UNDO
   ========================================================= */

async function undoMove() {
  if (state.aiThinking || state.gameOver) {
    return;
  }

  if (!state.moves.length) {
    showToast(t("toast.noUndo"));
    return;
  }

  if (state.mode === "local") {
    const move = state.moves.pop();

    state.board[move.row][move.col] = EMPTY;
    state.lastMove =
      state.moves[state.moves.length - 1] || null;
    state.currentPlayer = move.player;

    drawBoard();
    updateTurnUI();
    await saveCurrentGame();

    showToast(t("toast.undo"));
    return;
  }

  if (state.mode === "ai") {
    const humanMoveIndex =
      [...state.moves]
        .reverse()
        .findIndex(move =>
          move.player === state.humanSide
        );

    if (humanMoveIndex === -1) {
      showToast(t("toast.noUndo"));
      return;
    }

    const targetIndex =
      state.moves.length - 1 - humanMoveIndex;

    while (
      state.moves.length > Math.max(0, targetIndex)
    ) {
      const move = state.moves.pop();

      state.board[move.row][move.col] = EMPTY;
    }

    state.currentPlayer = state.humanSide;
    state.lastMove =
      state.moves[state.moves.length - 1] || null;

    drawBoard();
    updateTurnUI();
    await saveCurrentGame();

    showToast(t("toast.undo"));
  }
}


/* =========================================================
   GAME RESULT
   ========================================================= */

async function finishGame(winner, winningLine) {
  state.gameOver = true;
  state.aiThinking = false;
  state.winningLine = winningLine;

  stopAIWorker();

  drawBoard();

  let result;

  if (winner === null) {
    result = "draw";
  } else if (
    state.mode === "local"
  ) {
    result = "win";
  } else {
    result =
      winner === state.humanSide
        ? "win"
        : "loss";
  }

  addRecord(result);

  await dbDelete("game", "current");
  updateResumeUI();

  await sleep(
    state.settings.motion ? 450 : 0
  );

  showResult(result);
}

function showResult(result) {
  const mark = $("#resultMark");

  mark.className = "result-mark";

  if (result === "win") {
    mark.classList.add("win");

    $("#resultKicker").textContent =
      t("result.winKicker");

    $("#resultTitle").textContent =
      t("result.win");

    $("#resultDescription").textContent =
      t("result.winDescription");
  }

  if (result === "loss") {
    mark.classList.add("lose");

    $("#resultKicker").textContent =
      t("result.loseKicker");

    $("#resultTitle").textContent =
      t("result.lose");

    $("#resultDescription").textContent =
      t("result.loseDescription");
  }

  if (result === "draw") {
    mark.classList.add("draw");

    $("#resultKicker").textContent =
      t("result.drawKicker");

    $("#resultTitle").textContent =
      t("result.draw");

    $("#resultDescription").textContent =
      t("result.drawDescription");
  }

  showScreen("result");

  playResultSound(result);
}


/* =========================================================
   AI
   ========================================================= */

function createAIWorker() {
  if (aiWorker) {
    return;
  }

  aiWorker = new Worker("./ai-worker.js");

  aiWorker.addEventListener(
    "message",
    handleAIMessage
  );

  aiWorker.addEventListener(
    "error",
    () => {
      state.aiThinking = false;
      updateTurnUI();
      showToast(t("toast.aiUnavailable"));
    }
  );
}

function stopAIWorker() {
  if (!aiWorker) {
    return;
  }

  aiWorker.terminate();
  aiWorker = null;
}

async function requestAI() {
  if (
    state.gameOver ||
    state.mode !== "ai" ||
    state.currentPlayer === state.humanSide
  ) {
    return;
  }

  createAIWorker();

  state.aiThinking = true;
  updateTurnUI();

  const config =
    AI_CONFIG[state.difficulty];

  const thinkTime = randomBetween(
    config.thinkMin,
    config.thinkMax
  );

  aiWorker.postMessage({
    board: cloneBoard(state.board),
    player: state.currentPlayer,
    config,
    thinkTime
  });
}

async function handleAIMessage(event) {
  if (!state.aiThinking) {
    return;
  }

  const {
    row,
    col,
    thinkTime
  } = event.data;

  await sleep(
    state.settings.motion
      ? thinkTime
      : Math.min(thinkTime, 150)
  );

  if (
    state.gameOver ||
    state.currentPlayer === state.humanSide
  ) {
    state.aiThinking = false;
    updateTurnUI();
    return;
  }

  state.aiThinking = false;

  if (
    Number.isInteger(row) &&
    Number.isInteger(col)
  ) {
    await playMove(
      row,
      col,
      state.currentPlayer
    );
  } else {
    showToast(t("toast.aiUnavailable"));
    updateTurnUI();
  }
}


/* =========================================================
   BOARD CANVAS
   ========================================================= */

function resizeCanvas() {
  const rect =
    canvas.getBoundingClientRect();

  const dpr =
    Math.min(window.devicePixelRatio || 1, 2);

  canvasSize =
    Math.max(1, rect.width);

  canvas.width =
    Math.round(canvasSize * dpr);

  canvas.height =
    Math.round(canvasSize * dpr);

  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );

  boardPadding =
    canvasSize * 0.065;

  cellSize =
    (canvasSize - boardPadding * 2) /
    (BOARD_SIZE - 1);

  drawBoard();
}

function drawBoard() {
  if (!canvasSize) {
    return;
  }

  ctx.clearRect(
    0,
    0,
    canvasSize,
    canvasSize
  );

  drawBoardBackground();
  drawGrid();
  drawStarPoints();
  drawPreview();
  drawStones();
  drawWinningLine();
}

function drawBoardBackground() {
  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      canvasSize,
      canvasSize
    );

  gradient.addColorStop(0, "#e3c88f");
  gradient.addColorStop(0.48, "#d8b979");
  gradient.addColorStop(1, "#cda965");

  ctx.fillStyle = gradient;

  roundRect(
    ctx,
    0,
    0,
    canvasSize,
    canvasSize,
    Math.max(12, canvasSize * 0.025)
  );

  ctx.fill();

  const grainCount =
    Math.floor(canvasSize * 0.4);

  ctx.save();

  for (let i = 0; i < grainCount; i++) {
    const x = Math.random() * canvasSize;
    const y = Math.random() * canvasSize;

    ctx.fillStyle =
      Math.random() > 0.5
        ? "rgba(90,55,20,0.025)"
        : "rgba(255,255,255,0.025)";

    ctx.fillRect(
      x,
      y,
      1,
      1
    );
  }

  ctx.restore();
}

function drawGrid() {
  ctx.save();

  ctx.strokeStyle =
    "rgba(54, 38, 20, 0.68)";

  ctx.lineWidth =
    Math.max(0.8, canvasSize / 650);

  ctx.beginPath();

  for (let i = 0; i < BOARD_SIZE; i++) {
    const position =
      boardPadding + i * cellSize;

    ctx.moveTo(
      boardPadding,
      position
    );

    ctx.lineTo(
      canvasSize - boardPadding,
      position
    );

    ctx.moveTo(
      position,
      boardPadding
    );

    ctx.lineTo(
      position,
      canvasSize - boardPadding
    );
  }

  ctx.stroke();

  ctx.restore();
}

function drawStarPoints() {
  const points = [
    [3, 3],
    [3, 11],
    [7, 7],
    [11, 3],
    [11, 11]
  ];

  ctx.save();

  ctx.fillStyle =
    "rgba(54, 38, 20, 0.78)";

  for (const [row, col] of points) {
    const { x, y } =
      cellToPixel(row, col);

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      Math.max(2, cellSize * 0.075),
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  ctx.restore();
}

function drawStones() {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const player =
        state.board[row][col];

      if (player === EMPTY) {
        continue;
      }

      drawStone(
        row,
        col,
        player
      );
    }
  }
}

function drawStone(row, col, player) {
  const { x, y } =
    cellToPixel(row, col);

  const radius =
    cellSize * 0.43;

  ctx.save();

  ctx.shadowColor =
    "rgba(20, 15, 8, 0.28)";

  ctx.shadowBlur =
    radius * 0.18;

  ctx.shadowOffsetY =
    radius * 0.12;

  const gradient =
    ctx.createRadialGradient(
      x - radius * 0.3,
      y - radius * 0.35,
      radius * 0.05,
      x,
      y,
      radius
    );

  if (player === BLACK) {
    gradient.addColorStop(0, "#5c5c5c");
    gradient.addColorStop(0.28, "#343434");
    gradient.addColorStop(1, "#161616");
  } else {
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.56, "#f2eee4");
    gradient.addColorStop(1, "#cfc8ba");
  }

  ctx.fillStyle = gradient;

  ctx.beginPath();
  ctx.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.restore();

  if (
    state.lastMove &&
    state.lastMove.row === row &&
    state.lastMove.col === col
  ) {
    drawLastMoveMarker(x, y, radius);
  }
}

function drawLastMoveMarker(x, y, radius) {
  ctx.save();

  ctx.strokeStyle =
    state.board[
      state.lastMove.row
    ][state.lastMove.col] === BLACK
      ? "rgba(255,255,255,0.82)"
      : "rgba(40,35,28,0.78)";

  ctx.lineWidth =
    Math.max(1.5, radius * 0.075);

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    radius * 0.36,
    0,
    Math.PI * 2
  );

  ctx.stroke();

  ctx.restore();
}

function drawWinningLine() {
  if (
    state.winningLine.length < 5
  ) {
    return;
  }

  const first =
    state.winningLine[0];

  const last =
    state.winningLine[
      state.winningLine.length - 1
    ];

  const start =
    cellToPixel(
      first.row,
      first.col
    );

  const end =
    cellToPixel(
      last.row,
      last.col
    );

  ctx.save();

  ctx.strokeStyle =
    "rgba(255,255,255,0.86)";

  ctx.lineWidth =
    Math.max(2, cellSize * 0.1);

  ctx.lineCap = "round";

  ctx.beginPath();

  ctx.moveTo(
    start.x,
    start.y
  );

  ctx.lineTo(
    end.x,
    end.y
  );

  ctx.stroke();

  ctx.restore();
}

function drawPreview() {
  if (
    !state.preview ||
    state.gameOver ||
    state.aiThinking
  ) {
    return;
  }

  const {
    row,
    col
  } = state.preview;

  if (
    !isInside(row, col) ||
    state.board[row][col] !== EMPTY
  ) {
    return;
  }

  const { x, y } =
    cellToPixel(row, col);

  const radius =
    cellSize * 0.42;

  ctx.save();

  ctx.globalAlpha = 0.3;

  ctx.fillStyle =
    state.currentPlayer === BLACK
      ? "#222"
      : "#fff";

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.restore();
}

function cellToPixel(row, col) {
  return {
    x:
      boardPadding +
      col * cellSize,

    y:
      boardPadding +
      row * cellSize
  };
}

function pixelToCell(clientX, clientY) {
  const rect =
    canvas.getBoundingClientRect();

  const x =
    clientX - rect.left;

  const y =
    clientY - rect.top;

  const col =
    Math.round(
      (x - boardPadding) /
      cellSize
    );

  const row =
    Math.round(
      (y - boardPadding) /
      cellSize
    );

  if (!isInside(row, col)) {
    return null;
  }

  const { x: px, y: py } =
    cellToPixel(row, col);

  const distance =
    Math.hypot(
      x - px,
      y - py
    );

  if (
    distance >
    cellSize * 0.48
  ) {
    return null;
  }

  return {
    row,
    col
  };
}

function roundRect(
  context,
  x,
  y,
  width,
  height,
  radius
) {
  context.beginPath();

  context.roundRect(
    x,
    y,
    width,
    height,
    radius
  );
}


/* =========================================================
   TURN UI
   ========================================================= */

function updateTurnUI() {
  if (!$("#turnLabel")) {
    return;
  }

  const isHumanTurn =
    state.mode === "local" ||
    state.currentPlayer === state.humanSide;

  $("#turnLabel").textContent =
    isHumanTurn
      ? t("side.first")
      : t("game.thinking");

  if (state.mode === "local") {
    $("#turnLabel").textContent =
      state.currentPlayer === BLACK
        ? playerName(BLACK)
        : playerName(WHITE);
  }

  $("#turnPlayer").textContent =
    playerName(state.currentPlayer);

  $("#thinkingIndicator").hidden =
    !state.aiThinking;

  $("#turnStone").className =
    `status-stone ${
      state.currentPlayer === BLACK
        ? "black-stone"
        : "white-stone"
    }`;

  $("#undoButton").disabled =
    state.aiThinking ||
    state.moves.length === 0;

  $("#boardCanvas").style.cursor =
    state.aiThinking
      ? "default"
      : "crosshair";
}


/* =========================================================
   INPUT
   ========================================================= */

function handleBoardPointerMove(event) {
  if (
    state.gameOver ||
    state.aiThinking
  ) {
    return;
  }

  const cell =
    pixelToCell(
      event.clientX,
      event.clientY
    );

  state.preview = cell;

  drawBoard();
}

function handleBoardPointerLeave() {
  state.preview = null;
  drawBoard();
}

async function handleBoardPointerDown(event) {
  if (
    state.gameOver ||
    state.aiThinking
  ) {
    return;
  }

  const cell =
    pixelToCell(
      event.clientX,
      event.clientY
    );

  if (!cell) {
    return;
  }

  if (
    state.mode === "ai" &&
    state.currentPlayer !== state.humanSide
  ) {
    return;
  }

  await playMove(
    cell.row,
    cell.col,
    state.currentPlayer
  );
}


/* =========================================================
   AUDIO
   ========================================================= */

function ensureAudio() {
  if (!state.settings.sound) {
    return;
  }

  if (!audioContext) {
    audioContext =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();
  }

  if (
    audioContext.state === "suspended"
  ) {
    audioContext.resume();
  }
}

function playTone(
  frequency,
  duration,
  type = "sine",
  volume = 0.035
) {
  if (!state.settings.sound) {
    return;
  }

  ensureAudio();

  if (!audioContext) {
    return;
  }

  const oscillator =
    audioContext.createOscillator();

  const gain =
    audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.value =
    frequency;

  gain.gain.setValueAtTime(
    0.0001,
    audioContext.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    volume,
    audioContext.currentTime + 0.008
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audioContext.currentTime + duration
  );

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(
    audioContext.currentTime + duration
  );
}

function playStoneSound(player) {
  playTone(
    player === BLACK ? 115 : 155,
    0.09,
    "sine",
    0.035
  );
}

function playResultSound(result) {
  if (result === "win") {
    playTone(523.25, 0.12, "sine", 0.04);

    setTimeout(() => {
      playTone(659.25, 0.16, "sine", 0.04);
    }, 90);
  }

  if (result === "loss") {
    playTone(220, 0.2, "triangle", 0.035);
  }

  if (result === "draw") {
    playTone(330, 0.13, "sine", 0.035);
  }
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {
  const toast = $("#toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function setupEvents() {
  $("#startButton").addEventListener(
    "click",
    () => {
      ensureAudio();
      showSetup();
    }
  );

  $("#recordsButton").addEventListener(
    "click",
    () => showScreen("records")
  );

  $("#settingsButton").addEventListener(
    "click",
    () => showScreen("settings")
  );

  $("#resumeButton").addEventListener(
    "click",
    restoreSavedGame
  );

  $("#beginGameButton").addEventListener(
    "click",
    () => {
      ensureAudio();
      setupGameFromSelection();
    }
  );

  $("#playAgainButton").addEventListener(
    "click",
    () => {
      newGame();
    }
  );

  $("#resultHomeButton").addEventListener(
    "click",
    goHome
  );

  $("#undoButton").addEventListener(
    "click",
    undoMove
  );

  $("#restartButton").addEventListener(
    "click",
    restartGame
  );

  $("#gameMenuButton").addEventListener(
    "click",
    goHome
  );

  $("#backButton").addEventListener(
    "click",
    () => {
      if (state.screen === "home") {
        return;
      }

      if (
        state.screen === "game"
      ) {
        goHome();
        return;
      }

      showScreen("home");
    }
  );

  $("#menuButton").addEventListener(
    "click",
    () => showScreen("settings")
  );

  document
    .querySelectorAll("[data-mode]")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          document
            .querySelectorAll("[data-mode]")
            .forEach(item =>
              item.classList.remove(
                "selected"
              )
            );

          button.classList.add(
            "selected"
          );

          state.mode =
            button.dataset.mode;

          $("#difficultyGroup").hidden =
            state.mode !== "ai";
        }
      );
    });

  document
    .querySelectorAll("[data-difficulty]")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          document
            .querySelectorAll(
              "[data-difficulty]"
            )
            .forEach(item =>
              item.classList.remove(
                "selected"
              )
            );

          button.classList.add(
            "selected"
          );

          state.difficulty =
            button.dataset.difficulty;
        }
      );
    });

  document
    .querySelectorAll("[data-side]")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          document
            .querySelectorAll(
              "[data-side]"
            )
            .forEach(item =>
              item.classList.remove(
                "selected"
              )
            );

          button.classList.add(
            "selected"
          );

          state.humanSide =
            button.dataset.side === "black"
              ? BLACK
              : WHITE;
        }
      );
    });

  $("#languageSelect").addEventListener(
    "change",
    event => {
      setLanguage(event.target.value);
    }
  );

  $("#soundToggle").addEventListener(
    "change",
    event => {
      state.settings.sound =
        event.target.checked;

      saveSettings();

      if (state.settings.sound) {
        ensureAudio();
        playTone(440, 0.06);
      }
    }
  );

  $("#motionToggle").addEventListener(
    "change",
    event => {
      state.settings.motion =
        event.target.checked;

      applyMotion();
      saveSettings();
    }
  );

  $("#themeSelect").addEventListener(
    "change",
    event => {
      state.settings.theme =
        event.target.value;

      applyTheme();
      saveSettings();
    }
  );

  $("#clearRecordsButton").addEventListener(
    "click",
    async () => {
      state.records = {
        games: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        history: []
      };

      await saveRecords();
      updateRecordsUI();

      showToast(
        t("toast.recordsCleared")
      );
    }
  );

  canvas.addEventListener(
    "pointermove",
    handleBoardPointerMove
  );

  canvas.addEventListener(
    "pointerleave",
    handleBoardPointerLeave
  );

  canvas.addEventListener(
    "pointerdown",
    handleBoardPointerDown
  );

  canvas.addEventListener(
    "contextmenu",
    event => event.preventDefault()
  );

  window.addEventListener(
    "resize",
    resizeCanvas
  );

  window.addEventListener(
    "orientationchange",
    () => {
      setTimeout(
        resizeCanvas,
        100
      );
    }
  );

  document.addEventListener(
    "visibilitychange",
    () => {
      if (
        document.visibilityState === "hidden"
      ) {
        saveCurrentGame();
      }
    }
  );
}


/* =========================================================
   PWA
   ========================================================= */

function registerServiceWorker() {
  if (
    "serviceWorker" in navigator
  ) {
    window.addEventListener(
      "load",
      () => {
        navigator.serviceWorker
          .register("./sw.js")
          .catch(() => {
            // PWA is optional during local file testing.
          });
      }
    );
  }
}


/* =========================================================
   BOOTSTRAP
   ========================================================= */

async function init() {
  setupEvents();

  await loadSettings();
  await loadRecords();

  $("#difficultyGroup").hidden =
    state.mode !== "ai";

  showScreen("home");

  requestAnimationFrame(() => {
    resizeCanvas();
  });

  await updateResumeUI();

  registerServiceWorker();
}

init();
