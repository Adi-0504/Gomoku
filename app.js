/*
 * =========================================================
 * GOMOKU 1.0
 * Canvas Gomoku + Local PvP + AI Worker + AI OS
 * Offline / PWA / i18n / Statistics / Resume
 * =========================================================
 */

(() => {
  "use strict";

  /* =========================================================
     CONFIG
     ========================================================= */

  const CONFIG = {
    BOARD_SIZE: 15,
    WIN_LENGTH: 5,

    EMPTY: 0,
    BLACK: 1,
    WHITE: 2,

    STORAGE_KEY: "gomoku-stats-v3",
    SETTINGS_KEY: "gomoku-settings-v3",
    GAME_SAVE_KEY: "gomoku-current-game-v3",

    AI_WORKER: "./ai-worker.js",

    LANGUAGES: ["zh-TW", "zh-CN", "en", "ja", "ko"],

    COLORS: {
      board: "#d7b77c",
      grid: "rgba(54, 38, 20, .68)",
      star: "#5e4934",
      black: "#171717",
      blackHighlight: "#505050",
      white: "#f7f3e9",
      whiteShadow: "#c9c1b3",
      lastMove: "#b86f52",
      winning: "#d46d52"
    }
  };

  const DIFFICULTIES = {
    easy: {
      depth: 1,
      radius: 2,
      randomTop: 4,
      delay: 360
    },

    normal: {
      depth: 2,
      radius: 2,
      randomTop: 2,
      delay: 560
    },

    hard: {
      depth: 3,
      radius: 2,
      randomTop: 0,
      delay: 760
    }
  };

  /* =========================================================
     AI CHARACTERS
     ========================================================= */

  const AI_CHARACTERS = {
    mio: {
      id: "mio",

      name: {
        "zh-TW": "Mio",
        "zh-CN": "Mio",
        en: "Mio",
        ja: "ミオ",
        ko: "미오"
      },

      description: {
        "zh-TW": "溫和、防守型",
        "zh-CN": "温和、防守型",
        en: "Gentle defender",
        ja: "やさしい守備型",
        ko: "차분한 수비형"
      },

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
      id: "rin",

      name: {
        "zh-TW": "Rin",
        "zh-CN": "Rin",
        en: "Rin",
        ja: "リン",
        ko: "린"
      },

      description: {
        "zh-TW": "積極、進攻型",
        "zh-CN": "积极、进攻型",
        en: "Aggressive attacker",
        ja: "積極的な攻撃型",
        ko: "공격적인 타입"
      },

      style: "attack",

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
        "zh-TW": "Sora",
        "zh-CN": "Sora",
        en: "Sora",
        ja: "ソラ",
        ko: "소라"
      },

      description: {
        "zh-TW": "冷靜、平衡型",
        "zh-CN": "冷静、平衡型",
        en: "Calm balanced AI",
        ja: "冷静なバランス型",
        ko: "차분한 밸런스형"
      },

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
      id: "kuro",

      name: {
        "zh-TW": "Kuro",
        "zh-CN": "Kuro",
        en: "Kuro",
        ja: "クロ",
        ko: "쿠로"
      },

      description: {
        "zh-TW": "神秘、陷阱型",
        "zh-CN": "神秘、陷阱型",
        en: "Tricky strategist",
        ja: "謎めいたトリッキー型",
        ko: "신비로운 전략형"
      },

      style: "tricky",

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
        "zh-TW": "Nagi",
        "zh-CN": "Nagi",
        en: "Nagi",
        ja: "ナギ",
        ko: "나기"
      },

      description: {
        "zh-TW": "精準、反擊型",
        "zh-CN": "精准、反击型",
        en: "Precise counter player",
        ja: "正確なカウンター型",
        ko: "정밀한 반격형"
      },

      style: "counter",

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
        "zh-TW": "Rei",
        "zh-CN": "Rei",
        en: "Rei",
        ja: "レイ",
        ko: "레이"
      },

      description: {
        "zh-TW": "沉默、高手型",
        "zh-CN": "沉默、高手型",
        en: "Silent master",
        ja: "静かな達人型",
        ko: "조용한 고수형"
      },

      style: "master",

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
     I18N
     ========================================================= */

  const I18N = {
    "zh-TW": {
      title: "五子棋",
      subtitle: "簡單的規則，沒有簡單的棋局。",
      start: "開始遊戲",
      records: "棋局記錄",
      settings: "設定",
      resume: "繼續",
      unfinished: "未完成棋局",

      setup: "開始遊戲",
      mode: "對戰方式",
      ai: "人機",
      local: "雙人",
      difficulty: "難度",
      easy: "初級",
      normal: "中級",
      hard: "高級",
      easyDesc: "適合第一次玩",
      normalDesc: "開始認真下棋",
      hardDesc: "需要真正思考",
      side: "你的棋子",
      black: "黑棋",
      white: "白棋",
      first: "先手",
      second: "後手",
      begin: "開始",

      thinking: "思考中",
      yourTurn: "你的回合",
      player1Turn: "玩家 1 的回合",
      player2Turn: "玩家 2 的回合",
      aiTurn: "回合",
      undo: "悔棋",
      restart: "重新開始",
      menu: "選單",

      again: "再來一局",
      home: "返回首頁",
      win: "你贏了",
      lose: "你輸了",
      draw: "平局",
      player1Win: "玩家 1 獲勝",
      player2Win: "玩家 2 獲勝",

      games: "對局",
      wins: "勝利",
      losses: "失敗",
      draws: "平局",
      clear: "清除記錄",
      noRecords: "目前還沒有棋局記錄。",

      language: "語言",
      languageDesc: "選擇介面語言",
      sound: "音效",
      soundDesc: "落子與遊戲音效",
      motion: "動畫",
      motionDesc: "啟用遊戲動畫",
      theme: "外觀",
      themeDesc: "使用系統外觀",

      playerWinDesc: "你成功擊敗了 {name}。",
      playerLoseDesc: "{name} 贏下了這一局。",
      localWinDesc: "{player} 完成了五連。",
      drawDesc: "棋盤已經沒有可以落子的地方。",
      resumedAI: "對戰 {name}",
      resumedLocal: "雙人對戰",

      os: "OS",
      recordWin: "勝利",
      recordLoss: "失敗",
      recordDraw: "平局",
      recordLocal: "雙人",

      restarted: "棋局已重新開始",
      cannotUndo: "現在不能悔棋",
      aiThinking: "AI 正在思考",
      saved: "棋局已保存",
      recordsCleared: "記錄已清除"
    },

    "zh-CN": {
      title: "五子棋",
      subtitle: "简单的规则，没有简单的棋局。",
      start: "开始游戏",
      records: "棋局记录",
      settings: "设置",
      resume: "继续",
      unfinished: "未完成棋局",
      setup: "开始游戏",
      mode: "对战方式",
      ai: "人机",
      local: "双人",
      difficulty: "难度",
      easy: "初级",
      normal: "中级",
      hard: "高级",
      easyDesc: "适合第一次玩",
      normalDesc: "开始认真下棋",
      hardDesc: "需要真正思考",
      side: "你的棋子",
      black: "黑棋",
      white: "白棋",
      first: "先手",
      second: "后手",
      begin: "开始",
      thinking: "思考中",
      yourTurn: "你的回合",
      player1Turn: "玩家 1 的回合",
      player2Turn: "玩家 2 的回合",
      aiTurn: "回合",
      undo: "悔棋",
      restart: "重新开始",
      menu: "菜单",
      again: "再来一局",
      home: "返回首页",
      win: "你赢了",
      lose: "你输了",
      draw: "平局",
      player1Win: "玩家 1 获胜",
      player2Win: "玩家 2 获胜",
      games: "对局",
      wins: "胜利",
      losses: "失败",
      draws: "平局",
      clear: "清除记录",
      noRecords: "目前还没有棋局记录。",
      language: "语言",
      languageDesc: "选择界面语言",
      sound: "音效",
      soundDesc: "落子与游戏音效",
      motion: "动画",
      motionDesc: "启用游戏动画",
      theme: "外观",
      themeDesc: "使用系统外观",
      playerWinDesc: "你成功击败了 {name}。",
      playerLoseDesc: "{name} 赢下了这一局。",
      localWinDesc: "{player} 完成了五连。",
      drawDesc: "棋盘已经没有可以落子的地方。",
      resumedAI: "对战 {name}",
      resumedLocal: "双人对战",
      os: "OS",
      recordWin: "胜利",
      recordLoss: "失败",
      recordDraw: "平局",
      recordLocal: "双人",
      restarted: "棋局已重新开始",
      cannotUndo: "现在不能悔棋",
      aiThinking: "AI 正在思考",
      saved: "棋局已保存",
      recordsCleared: "记录已清除"
    },

    en: {
      title: "Gomoku",
      subtitle: "Simple rules. Never simple games.",
      start: "Start Game",
      records: "Records",
      settings: "Settings",
      resume: "Resume",
      unfinished: "Unfinished game",
      setup: "New Game",
      mode: "Game Mode",
      ai: "VS AI",
      local: "Two Players",
      difficulty: "Difficulty",
      easy: "Easy",
      normal: "Normal",
      hard: "Hard",
      easyDesc: "Good for a first game",
      normalDesc: "Time to think",
      hardDesc: "A real challenge",
      side: "Your Stone",
      black: "Black",
      white: "White",
      first: "First",
      second: "Second",
      begin: "Begin",
      thinking: "Thinking",
      yourTurn: "Your turn",
      player1Turn: "Player 1's turn",
      player2Turn: "Player 2's turn",
      aiTurn: "Turn",
      undo: "Undo",
      restart: "Restart",
      menu: "Menu",
      again: "Play Again",
      home: "Home",
      win: "You Win",
      lose: "You Lose",
      draw: "Draw",
      player1Win: "Player 1 Wins",
      player2Win: "Player 2 Wins",
      games: "Games",
      wins: "Wins",
      losses: "Losses",
      draws: "Draws",
      clear: "Clear Records",
      noRecords: "No games recorded yet.",
      language: "Language",
      languageDesc: "Choose interface language",
      sound: "Sound",
      soundDesc: "Stone and game sounds",
      motion: "Motion",
      motionDesc: "Enable game animations",
      theme: "Appearance",
      themeDesc: "Use system appearance",
      playerWinDesc: "You defeated {name}.",
      playerLoseDesc: "{name} won this game.",
      localWinDesc: "{player} completed five in a row.",
      drawDesc: "There are no empty intersections left.",
      resumedAI: "VS {name}",
      resumedLocal: "Two-player game",
      os: "OS",
      recordWin: "Win",
      recordLoss: "Loss",
      recordDraw: "Draw",
      recordLocal: "Two Players",
      restarted: "Game restarted",
      cannotUndo: "Undo is not available now",
      aiThinking: "AI is thinking",
      saved: "Game saved",
      recordsCleared: "Records cleared"
    },

    ja: {
      title: "五目並べ",
      subtitle: "ルールは簡単。でも、対局は簡単じゃない。",
      start: "ゲーム開始",
      records: "対局記録",
      settings: "設定",
      resume: "続ける",
      unfinished: "途中の対局",
      setup: "ゲーム開始",
      mode: "対戦方式",
      ai: "AI対戦",
      local: "2人対戦",
      difficulty: "難易度",
      easy: "初級",
      normal: "中級",
      hard: "上級",
      easyDesc: "はじめての人向け",
      normalDesc: "少し本気で",
      hardDesc: "本気の対戦",
      side: "あなたの石",
      black: "黒",
      white: "白",
      first: "先手",
      second: "後手",
      begin: "開始",
      thinking: "考え中",
      yourTurn: "あなたの番",
      player1Turn: "プレイヤー1の番",
      player2Turn: "プレイヤー2の番",
      aiTurn: "番",
      undo: "待った",
      restart: "最初から",
      menu: "メニュー",
      again: "もう一度",
      home: "ホーム",
      win: "勝ち",
      lose: "負け",
      draw: "引き分け",
      player1Win: "プレイヤー1の勝ち",
      player2Win: "プレイヤー2の勝ち",
      games: "対局",
      wins: "勝ち",
      losses: "負け",
      draws: "引き分け",
      clear: "記録を消去",
      noRecords: "まだ対局記録がありません。",
      language: "言語",
      languageDesc: "表示言語を選択",
      sound: "サウンド",
      soundDesc: "石とゲームの音",
      motion: "アニメーション",
      motionDesc: "ゲームアニメーション",
      theme: "外観",
      themeDesc: "システム設定を使用",
      playerWinDesc: "{name}に勝ちました。",
      playerLoseDesc: "{name}の勝ちです。",
      localWinDesc: "{player}が五連を完成しました。",
      drawDesc: "置ける場所がなくなりました。",
      resumedAI: "{name}と対戦",
      resumedLocal: "2人対戦",
      os: "OS",
      recordWin: "勝ち",
      recordLoss: "負け",
      recordDraw: "引き分け",
      recordLocal: "2人対戦",
      restarted: "対局を再開しました",
      cannotUndo: "今は待ったできません",
      aiThinking: "AIが考えています",
      saved: "対局を保存しました",
      recordsCleared: "記録を消去しました"
    },

    ko: {
      title: "오목",
      subtitle: "규칙은 간단하지만, 승부는 간단하지 않습니다.",
      start: "게임 시작",
      records: "대국 기록",
      settings: "설정",
      resume: "계속하기",
      unfinished: "진행 중인 대국",
      setup: "게임 시작",
      mode: "대전 방식",
      ai: "AI 대전",
      local: "2인 대전",
      difficulty: "난이도",
      easy: "초급",
      normal: "중급",
      hard: "고급",
      easyDesc: "처음 플레이하기 좋음",
      normalDesc: "진지하게 시작",
      hardDesc: "진짜 도전",
      side: "내 돌",
      black: "흑",
      white: "백",
      first: "선공",
      second: "후공",
      begin: "시작",
      thinking: "생각 중",
      yourTurn: "내 차례",
      player1Turn: "플레이어 1 차례",
      player2Turn: "플레이어 2 차례",
      aiTurn: "차례",
      undo: "무르기",
      restart: "다시 시작",
      menu: "메뉴",
      again: "다시 하기",
      home: "홈",
      win: "승리",
      lose: "패배",
      draw: "무승부",
      player1Win: "플레이어 1 승리",
      player2Win: "플레이어 2 승리",
      games: "대국",
      wins: "승리",
      losses: "패배",
      draws: "무승부",
      clear: "기록 삭제",
      noRecords: "아직 대국 기록이 없습니다.",
      language: "언어",
      languageDesc: "표시 언어 선택",
      sound: "소리",
      soundDesc: "돌과 게임 효과음",
      motion: "애니메이션",
      motionDesc: "게임 애니메이션 사용",
      theme: "외관",
      themeDesc: "시스템 설정 사용",
      playerWinDesc: "{name}에게 승리했습니다.",
      playerLoseDesc: "{name}이 승리했습니다.",
      localWinDesc: "{player}가 오목을 완성했습니다.",
      drawDesc: "놓을 수 있는 곳이 없습니다.",
      resumedAI: "{name}와 대전",
      resumedLocal: "2인 대전",
      os: "OS",
      recordWin: "승리",
      recordLoss: "패배",
      recordDraw: "무승부",
      recordLocal: "2인 대전",
      restarted: "대국을 다시 시작했습니다",
      cannotUndo: "지금은 무를 수 없습니다",
      aiThinking: "AI가 생각하고 있습니다",
      saved: "대국을 저장했습니다",
      recordsCleared: "기록을 삭제했습니다"
    }
  };

  /* =========================================================
     STATE
     ========================================================= */

  let board = createBoard();

  let gameId = createId();
  let boardVersion = 0;

  let currentPlayer = CONFIG.BLACK;

  let gameOver = false;
  let aiThinking = false;

  let selectedMode = "ai";
  let selectedAI = "sora";
  let selectedDifficulty = "normal";
  let playerSide = "black";

  let moveHistory = [];
  let winningLine = [];
  let lastMove = null;

  let worker = null;
  let activeWorkerRequest = null;

  let canvas = null;
  let ctx = null;
  let boardSizePx = 0;
  let cellSize = 0;
  let boardOrigin = 0;
  let resizeFrame = 0;

  let toastTimer = null;
  let audioContext = null;

  let settings = loadSettings();
  let stats = loadStats();

  /* =========================================================
     DOM
     ========================================================= */

  const DOM = {};

  function cacheDOM() {
    DOM.homeScreen = $("#homeScreen");
    DOM.setupScreen = $("#setupScreen");
    DOM.gameScreen = $("#gameScreen");
    DOM.resultScreen = $("#resultScreen");
    DOM.recordsScreen = $("#recordsScreen");
    DOM.settingsScreen = $("#settingsScreen");

    DOM.startButton = $("#startButton");
    DOM.recordsButton = $("#recordsButton");
    DOM.settingsButton = $("#settingsButton");
    DOM.beginGameButton = $("#beginGameButton");

    DOM.modeControl = $("#modeControl");
    DOM.difficultyGroup = $("#difficultyGroup");

    DOM.undoButton = $("#undoButton");
    DOM.restartButton = $("#restartButton");
    DOM.gameMenuButton = $("#gameMenuButton");

    DOM.playAgainButton = $("#playAgainButton");
    DOM.resultHomeButton = $("#resultHomeButton");

    DOM.clearRecordsButton = $("#clearRecordsButton");

    DOM.languageSelect = $("#languageSelect");
    DOM.soundToggle = $("#soundToggle");
    DOM.motionToggle = $("#motionToggle");
    DOM.themeSelect = $("#themeSelect");

    DOM.turnStone = $("#turnStone");
    DOM.turnLabel = $("#turnLabel");
    DOM.turnPlayer = $("#turnPlayer");
    DOM.thinkingIndicator = $("#thinkingIndicator");

    DOM.resultMark = $("#resultMark");
    DOM.resultKicker = $("#resultKicker");
    DOM.resultTitle = $("#resultTitle");
    DOM.resultDescription = $("#resultDescription");

    DOM.statGames = $("#statGames");
    DOM.statWins = $("#statWins");
    DOM.statLosses = $("#statLosses");
    DOM.statDraws = $("#statDraws");
    DOM.recordList = $("#recordList");

    DOM.resumeCard = $("#resumeCard");
    DOM.resumeText = $("#resumeText");
    DOM.resumeButton = $("#resumeButton");

    DOM.backButton = $("#backButton");
    DOM.menuButton = $("#menuButton");

    canvas = $("#boardCanvas");

    if (canvas) {
      ctx = canvas.getContext("2d", {
        alpha: false
      });
    }
  }

  function $(selector) {
    return document.querySelector(selector);
  }

  /* =========================================================
     INIT
     ========================================================= */

  function init() {
    cacheDOM();

    injectRuntimeStyles();
    setupNavigation();
    setupSetupControls();
    setupGameControls();
    setupSettingsControls();
    setupCanvas();

    applySettings();
    createWorker();

    renderStats();
    updateSetupUI();
    updateTurnUI();
    checkResumeGame();

    registerServiceWorker();

    window.addEventListener(
      "resize",
      scheduleResize,
      { passive: true }
    );

    window.addEventListener(
      "orientationchange",
      scheduleResize,
      { passive: true }
    );

    document.addEventListener(
      "visibilitychange",
      () => {
        if (
          !document.hidden &&
          isScreenActive("game")
        ) {
          scheduleResize();
        }
      }
    );

    showScreen("home");

    scheduleResize();
  }

  /* =========================================================
     RUNTIME CSS
     ========================================================= */

  function injectRuntimeStyles() {
    const style = document.createElement("style");

    style.textContent = `
      .gomoku-ai-panel {
        width: min(100%, 340px);
        padding: 18px;
        border-radius: 20px;
        background: var(--surface);
        border: 1px solid var(--line);
        box-shadow: var(--shadow-soft);
      }

      .gomoku-ai-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .gomoku-ai-name {
        font-size: 18px;
        font-weight: 750;
      }

      .gomoku-ai-description {
        margin-top: 3px;
        color: var(--muted);
        font-size: 12px;
      }

      .gomoku-ai-status {
        margin-top: 16px;
        padding: 12px 13px;
        border-radius: 14px;
        background: color-mix(
          in srgb,
          var(--accent) 8%,
          var(--surface-solid)
        );
      }

      .gomoku-ai-status-label {
        color: var(--muted);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .gomoku-ai-os {
        min-height: 22px;
        margin-top: 5px;
        font-size: 13px;
        line-height: 1.55;
      }

      .gomoku-ai-select {
        width: 100%;
        margin-top: 14px;
        padding: 10px 12px;
        border: 1px solid var(--line);
        border-radius: 12px;
        background: var(--surface-solid);
        color: var(--text);
      }

      .gomoku-ai-stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        margin-top: 12px;
      }

      .gomoku-ai-stat {
        padding: 11px;
        border-radius: 12px;
        background: color-mix(
          in srgb,
          var(--text) 4%,
          transparent
        );
      }

      .gomoku-ai-stat span {
        display: block;
        color: var(--muted);
        font-size: 10px;
      }

      .gomoku-ai-stat strong {
        display: block;
        margin-top: 3px;
        font-size: 18px;
      }

      .gomoku-mode-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-top: 5px;
        color: var(--muted);
        font-size: 11px;
      }

      .gomoku-mode-badge::before {
        content: "";
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--accent);
      }

      .gomoku-local-info {
        width: min(100%, 340px);
        padding: 18px;
        border-radius: 20px;
        background: var(--surface);
        border: 1px solid var(--line);
        box-shadow: var(--shadow-soft);
      }

      .gomoku-local-title {
        font-weight: 750;
      }

      .gomoku-local-subtitle {
        margin-top: 4px;
        color: var(--muted);
        font-size: 12px;
      }

      .gomoku-local-turn {
        margin-top: 14px;
        padding: 12px;
        border-radius: 14px;
        background: color-mix(
          in srgb,
          var(--accent) 8%,
          var(--surface-solid)
        );
        font-size: 13px;
      }

      .gomoku-result-score {
        margin: 18px auto 0;
        color: var(--muted);
        font-size: 13px;
      }

      @media (max-width: 899px) {
        .gomoku-ai-panel,
        .gomoku-local-info {
          width: min(100%, 680px);
          margin: 0 auto;
        }
      }

      @media (max-height: 650px) and (orientation: landscape) {
        .game-screen {
          padding-top: calc(
            68px + env(safe-area-inset-top)
          );
        }

        .game-layout {
          min-height: calc(100dvh - 82px);
          grid-template-rows: auto 1fr auto;
          gap: 6px;
        }

        .game-status {
          min-height: 38px;
        }

        .game-actions {
          min-height: 42px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* =========================================================
     NAVIGATION
     ========================================================= */

  function setupNavigation() {
    DOM.startButton?.addEventListener(
      "click",
      () => showScreen("setup")
    );

    DOM.recordsButton?.addEventListener(
      "click",
      () => {
        renderStats();
        showScreen("records");
      }
    );

    DOM.settingsButton?.addEventListener(
      "click",
      () => showScreen("settings")
    );

    DOM.beginGameButton?.addEventListener(
      "click",
      beginGame
    );

    DOM.playAgainButton?.addEventListener(
      "click",
      () => {
        showScreen("setup");
      }
    );

    DOM.resultHomeButton?.addEventListener(
      "click",
      () => {
        clearSavedGame();
        showScreen("home");
      }
    );

    DOM.backButton?.addEventListener(
      "click",
      goBack
    );

    DOM.menuButton?.addEventListener(
      "click",
      () => showScreen("settings")
    );

    DOM.gameMenuButton?.addEventListener(
      "click",
      () => {
        if (!gameOver) {
          saveCurrentGame();
        }

        showScreen("home");
      }
    );

    DOM.resumeButton?.addEventListener(
      "click",
      resumeGame
    );

    window.addEventListener(
      "popstate",
      () => {}
    );
  }

  function showScreen(name) {
    const screens = {
      home: DOM.homeScreen,
      setup: DOM.setupScreen,
      game: DOM.gameScreen,
      result: DOM.resultScreen,
      records: DOM.recordsScreen,
      settings: DOM.settingsScreen
    };

    Object.entries(screens).forEach(
      ([key, element]) => {
        element?.classList.toggle(
          "active",
          key === name
        );
      }
    );

    if (name === "game") {
      requestAnimationFrame(() => {
        resizeCanvas();
        drawBoard();
      });
    }

    if (name === "home") {
      checkResumeGame();
    }

    if (name === "records") {
      renderStats();
    }

    updateTopbar(name);
  }

  function updateTopbar(screen) {
    const isHome = screen === "home";

    if (DOM.backButton) {
      DOM.backButton.style.visibility =
        isHome ? "hidden" : "visible";
    }
  }

  function isScreenActive(name) {
    const map = {
      home: DOM.homeScreen,
      setup: DOM.setupScreen,
      game: DOM.gameScreen,
      result: DOM.resultScreen,
      records: DOM.recordsScreen,
      settings: DOM.settingsScreen
    };

    return Boolean(
      map[name]?.classList.contains("active")
    );
  }

  function goBack() {
    if (isScreenActive("home")) {
      return;
    }

    if (isScreenActive("game")) {
      saveCurrentGame();
      showScreen("home");
      return;
    }

    if (isScreenActive("result")) {
      showScreen("home");
      return;
    }

    showScreen("home");
  }

  /* =========================================================
     SETUP
     ========================================================= */

  function setupSetupControls() {
    DOM.modeControl?.addEventListener(
      "click",
      event => {
        const button =
          event.target.closest("[data-mode]");

        if (!button) {
          return;
        }

        selectedMode =
          button.dataset.mode === "local"
            ? "local"
            : "ai";

        DOM.modeControl
          .querySelectorAll("[data-mode]")
          .forEach(
            item =>
              item.classList.toggle(
                "selected",
                item === button
              )
          );

        updateSetupUI();
      }
    );

    document
      .querySelectorAll("[data-difficulty]")
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            selectedDifficulty =
              button.dataset.difficulty;

            document
              .querySelectorAll("[data-difficulty]")
              .forEach(
                item =>
                  item.classList.toggle(
                    "selected",
                    item === button
                  )
              );
          }
        );
      });

    document
      .querySelectorAll("[data-side]")
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            playerSide =
              button.dataset.side === "white"
                ? "white"
                : "black";

            document
              .querySelectorAll("[data-side]")
              .forEach(
                item =>
                  item.classList.toggle(
                    "selected",
                    item === button
                  )
              );
          }
        );
      });
  }

  function updateSetupUI() {
    if (DOM.difficultyGroup) {
      DOM.difficultyGroup.hidden =
        selectedMode !== "ai";
    }

    const sideLabel =
      DOM.setupScreen?.querySelector(
        ".settings-group:nth-of-type(3) h3"
      );

    if (sideLabel) {
      sideLabel.textContent =
        selectedMode === "ai"
          ? text("side")
          : text("side");
    }
  }

  function beginGame() {
    if (selectedMode === "local") {
      startLocalGame();
    } else {
      startAIGame();
    }
  }

  /* =========================================================
     GAME START
     ========================================================= */

  function startLocalGame() {
    invalidateWorker();

    selectedMode = "local";
    currentPlayer = CONFIG.BLACK;

    resetGameState();

    showScreen("game");
    updateTurnUI();
    renderGameSidePanel();

    saveCurrentGame();
  }

  function startAIGame() {
    invalidateWorker();

    selectedMode = "ai";

    currentPlayer =
      playerSide === "white"
        ? CONFIG.WHITE
        : CONFIG.BLACK;

    resetGameState();

    showScreen("game");
    updateTurnUI();
    renderGameSidePanel();

    saveCurrentGame();

    if (isAITurn()) {
      runAITurn();
    }
  }

  function resetGameState() {
    board = createBoard();

    gameId = createId();
    boardVersion = 0;

    gameOver = false;
    aiThinking = false;

    moveHistory = [];
    winningLine = [];
    lastMove = null;

    invalidateWorker();

    updateTurnUI();
    renderGameSidePanel();

    scheduleResize();
  }

  function restartGame() {
    if (selectedMode === "local") {
      startLocalGame();
    } else {
      startAIGame();
    }

    showToast(text("restarted"));
  }

  /* =========================================================
     GAME CONTROLS
     ========================================================= */

  function setupGameControls() {
    DOM.restartButton?.addEventListener(
      "click",
      restartGame
    );

    DOM.undoButton?.addEventListener(
      "click",
      undoMove
    );
  }

  /* =========================================================
     CANVAS INPUT
     ========================================================= */

  function setupCanvas() {
    if (!canvas) {
      return;
    }

    canvas.addEventListener(
      "pointerdown",
      event => {
        event.preventDefault();

        if (gameOver || aiThinking) {
          return;
        }

        if (
          selectedMode === "ai" &&
          !isHumanTurn()
        ) {
          return;
        }

        const position =
          canvasToBoard(event);

        if (!position) {
          return;
        }

        if (
          board[position.row][position.col] !==
          CONFIG.EMPTY
        ) {
          return;
        }

        placeMove(
          position.row,
          position.col,
          currentPlayer
        );
      },
      { passive: false }
    );

    canvas.addEventListener(
      "keydown",
      event => {
        if (
          gameOver ||
          aiThinking ||
          event.key !== "Enter" &&
          event.key !== " "
        ) {
          return;
        }

        event.preventDefault();
      }
    );
  }

  /* =========================================================
     MOVE ENGINE
     ========================================================= */

  function placeMove(row, col, player) {
    if (gameOver) {
      return false;
    }

    if (!isInside(row, col)) {
      return false;
    }

    if (board[row][col] !== CONFIG.EMPTY) {
      return false;
    }

    board[row][col] = player;

    const move = {
      row,
      col,
      player,
      time: Date.now()
    };

    moveHistory.push(move);

    lastMove = {
      row,
      col,
      player
    };

    boardVersion += 1;

    playStoneSound(player);
    drawBoard();

    const line =
      findWinningLine(
        board,
        row,
        col,
        player
      );

    if (line) {
      winningLine = line;
      drawBoard();
      finishGame({
        type: "win",
        winner: player,
        line
      });

      return true;
    }

    if (isBoardFull()) {
      finishGame({
        type: "draw",
        winner: CONFIG.EMPTY,
        line: []
      });

      return true;
    }

    currentPlayer =
      opponent(player);

    updateTurnUI();
    renderGameSidePanel();
    saveCurrentGame();

    if (
      selectedMode === "ai" &&
      isAITurn()
    ) {
      runAITurn();
    }

    return true;
  }

  function opponent(player) {
    return player === CONFIG.BLACK
      ? CONFIG.WHITE
      : CONFIG.BLACK;
  }

  function isHumanTurn() {
    if (selectedMode === "local") {
      return true;
    }

    return currentPlayer === getHumanSide();
  }

  function isAITurn() {
    return (
      selectedMode === "ai" &&
      currentPlayer === getAISide()
    );
  }

  function getHumanSide() {
    return playerSide === "white"
      ? CONFIG.WHITE
      : CONFIG.BLACK;
  }

  function getAISide() {
    return opponent(
      getHumanSide()
    );
  }

  /* =========================================================
     AI TURN
     ========================================================= */

  async function runAITurn() {
    if (
      gameOver ||
      !isAITurn() ||
      aiThinking
    ) {
      return;
    }

    aiThinking = true;

    const request = {
      gameId,
      boardVersion,
      player: getAISide(),
      board: cloneBoard(board),
      config: {
        ...DIFFICULTIES[selectedDifficulty],
        style:
          AI_CHARACTERS[selectedAI]?.style ||
          "balanced"
      }
    };

    activeWorkerRequest = request;

    updateTurnUI();
    renderGameSidePanel();

    const ai =
      getSelectedAI();

    showAIOS(
      "thinking",
      ai
    );

    const startTime =
      performance.now();

    try {
      const result =
        await askWorker(request);

      const elapsed =
        performance.now() -
        startTime;

      const delay =
        Math.max(
          120,
          request.config.delay -
            elapsed
        );

      await wait(delay);

      if (
        !isCurrentWorkerRequest(
          request
        )
      ) {
        return;
      }

      if (
        !result ||
        !Number.isInteger(result.row) ||
        !Number.isInteger(result.col)
      ) {
        aiThinking = false;
        updateTurnUI();
        return;
      }

      const row = result.row;
      const col = result.col;

      if (
        !isInside(row, col) ||
        board[row][col] !== CONFIG.EMPTY
      ) {
        aiThinking = false;
        updateTurnUI();

        /*
         * Worker result is invalid.
         * Recalculate from the CURRENT board instead
         * of trusting the old prediction.
         */
        if (
          isAITurn() &&
          !gameOver
        ) {
          runAITurn();
        }

        return;
      }

      aiThinking = false;
      activeWorkerRequest = null;

      const category =
        classifyAIMove(
          row,
          col,
          request.board,
          getAISide()
        );

      showAIOS(
        category,
        ai
      );

      placeMove(
        row,
        col,
        getAISide()
      );
    } catch {
      if (
        !isCurrentWorkerRequest(
          request
        )
      ) {
        return;
      }

      aiThinking = false;
      activeWorkerRequest = null;

      const fallback =
        findFallbackMove();

      if (fallback) {
        placeMove(
          fallback.row,
          fallback.col,
          getAISide()
        );
      } else {
        updateTurnUI();
      }
    }
  }

  function askWorker(request) {
    return new Promise(
      (resolve, reject) => {
        if (!worker) {
          resolve(
            fallbackAIMove(
              request.board,
              request.player
            )
          );

          return;
        }

        const listener =
          event => {
            worker.removeEventListener(
              "message",
              listener
            );

            resolve(event.data);
          };

        const errorListener =
          () => {
            worker.removeEventListener(
              "message",
              listener
            );

            worker.removeEventListener(
              "error",
              errorListener
            );

            reject(
              new Error(
                "AI Worker failed"
              )
            );
          };

        worker.addEventListener(
          "message",
          listener
        );

        worker.addEventListener(
          "error",
          errorListener,
          { once: true }
        );

        worker.postMessage({
          board: request.board,
          player: request.player,
          config: request.config
        });
      }
    );
  }

  function createWorker() {
    if (
      typeof Worker ===
      "undefined"
    ) {
      return;
    }

    try {
      worker =
        new Worker(
          CONFIG.AI_WORKER
        );
    } catch {
      worker = null;
    }
  }

  function invalidateWorker() {
    boardVersion += 1;

    activeWorkerRequest = null;
    aiThinking = false;

    workerRequestToken();
  }

  function workerRequestToken() {
    return createId();
  }

  function isCurrentWorkerRequest(request) {
    return (
      activeWorkerRequest === request &&
      request.gameId === gameId &&
      request.boardVersion === boardVersion &&
      !gameOver &&
      isAITurn()
    );
  }

  /* =========================================================
     FALLBACK AI
     ========================================================= */

  function fallbackAIMove(
    currentBoard,
    player
  ) {
    const candidates =
      getCandidateMoves(
        currentBoard,
        2
      );

    if (!candidates.length) {
      return null;
    }

    const winning =
      findImmediateMove(
        currentBoard,
        player,
        candidates
      );

    if (winning) {
      return winning;
    }

    const blocking =
      findImmediateMove(
        currentBoard,
        opponent(player),
        candidates
      );

    if (blocking) {
      return blocking;
    }

    return candidates[0];
  }

  function findFallbackMove() {
    return fallbackAIMove(
      board,
      getAISide()
    );
  }

  function getCandidateMoves(
    currentBoard,
    radius
  ) {
    const occupied = [];

    for (
      let row = 0;
      row < CONFIG.BOARD_SIZE;
      row += 1
    ) {
      for (
        let col = 0;
        col < CONFIG.BOARD_SIZE;
        col += 1
      ) {
        if (
          currentBoard[row][col] !==
          CONFIG.EMPTY
        ) {
          occupied.push({
            row,
            col
          });
        }
      }
    }

    if (!occupied.length) {
      const center =
        Math.floor(
          CONFIG.BOARD_SIZE / 2
        );

      return [
        {
          row: center,
          col: center
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
            !isInside(row, col)
          ) {
            continue;
          }

          if (
            currentBoard[row][col] !==
            CONFIG.EMPTY
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
    ].sort(
      (a, b) =>
        localMovePotential(
          currentBoard,
          b.row,
          b.col
        ) -
        localMovePotential(
          currentBoard,
          a.row,
          a.col
        )
    );
  }

  function findImmediateMove(
    currentBoard,
    player,
    candidates
  ) {
    for (
      const move of candidates
    ) {
      currentBoard[
        move.row
      ][
        move.col
      ] = player;

      const win =
        Boolean(
          findWinningLine(
            currentBoard,
            move.row,
            move.col,
            player
          )
        );

      currentBoard[
        move.row
      ][
        move.col
      ] = CONFIG.EMPTY;

      if (win) {
        return move;
      }
    }

    return null;
  }

  function localMovePotential(
    currentBoard,
    row,
    col
  ) {
    return (
      localScore(
        currentBoard,
        row,
        col,
        CONFIG.BLACK
      ) +
      localScore(
        currentBoard,
        row,
        col,
        CONFIG.WHITE
      ) +
      centerValue(
        row,
        col
      )
    );
  }

  function localScore(
    currentBoard,
    row,
    col,
    player
  ) {
    let score = 0;

    const directions = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1]
    ];

    for (
      const [dr, dc]
      of directions
    ) {
      score += linePotential(
        currentBoard,
        row,
        col,
        dr,
        dc,
        player
      );
    }

    return score;
  }

  function linePotential(
    currentBoard,
    row,
    col,
    dr,
    dc,
    player
  ) {
    let count = 1;
    let open = 0;

    for (
      const direction of [1, -1]
    ) {
      for (
        let distance = 1;
        distance <= 4;
        distance += 1
      ) {
        const r =
          row +
          dr *
            distance *
            direction;

        const c =
          col +
          dc *
            distance *
            direction;

        if (
          !isInside(r, c)
        ) {
          break;
        }

        if (
          currentBoard[r][c] ===
          player
        ) {
          count += 1;
          continue;
        }

        if (
          currentBoard[r][c] ===
          CONFIG.EMPTY
        ) {
          open += 1;
        }

        break;
      }
    }

    if (count >= 5) {
      return 100000;
    }

    if (count === 4) {
      return open === 2
        ? 5000
        : open === 1
          ? 1200
          : 0;
    }

    if (count === 3) {
      return open === 2
        ? 700
        : open === 1
          ? 150
          : 0;
    }

    if (count === 2) {
      return open === 2
        ? 80
        : 20;
    }

    return open * 4;
  }

  function centerValue(
    row,
    col
  ) {
    const center =
      Math.floor(
        CONFIG.BOARD_SIZE / 2
      );

    return (
      14 -
      Math.abs(
        row - center
      ) -
      Math.abs(
        col - center
      )
    );
  }

  /* =========================================================
     AI OS
     ========================================================= */

  function renderGameSidePanel() {
    const layout =
      DOM.gameScreen?.querySelector(
        ".game-layout"
      );

    if (!layout) {
      return;
    }

    let panel =
      layout.querySelector(
        ".gomoku-side-panel"
      );

    if (!panel) {
      panel =
        document.createElement(
          "aside"
        );

      panel.className =
        "gomoku-side-panel";

      layout.appendChild(panel);
    }

    panel.innerHTML = "";

    if (
      selectedMode === "local"
    ) {
      panel.appendChild(
        createLocalPanel()
      );
    } else {
      panel.appendChild(
        createAIPanel()
      );
    }
  }

  function createAIPanel() {
    const ai =
      getSelectedAI();

    const panel =
      document.createElement(
        "div"
      );

    panel.className =
      "gomoku-ai-panel";

    const head =
      document.createElement(
        "div"
      );

    head.className =
      "gomoku-ai-head";

    const info =
      document.createElement(
        "div"
      );

    const name =
      document.createElement(
        "div"
      );

    name.className =
      "gomoku-ai-name";

    name.textContent =
      getLocalized(
        ai.name
      );

    const description =
      document.createElement(
        "div"
      );

    description.className =
      "gomoku-ai-description";

    description.textContent =
      getLocalized(
        ai.description
      );

    info.append(
      name,
      description
    );

    head.appendChild(
      info
    );

    const badge =
      document.createElement(
        "span"
      );

    badge.className =
      "gomoku-mode-badge";

    badge.textContent =
      text("ai");

    head.appendChild(
      badge
    );

    panel.appendChild(
      head
    );

    const status =
      document.createElement(
        "div"
      );

    status.className =
      "gomoku-ai-status";

    const label =
      document.createElement(
        "div"
      );

    label.className =
      "gomoku-ai-status-label";

    label.textContent =
      text("os");

    const os =
      document.createElement(
        "div"
      );

    os.className =
      "gomoku-ai-os";

    os.dataset.aiOs =
      "true";

    os.textContent =
      getLastAIOS(ai);

    status.append(
      label,
      os
    );

    panel.appendChild(
      status
    );

    const select =
      document.createElement(
        "select"
      );

    select.className =
      "gomoku-ai-select";

    select.setAttribute(
      "aria-label",
      "AI"
    );

    Object.values(
      AI_CHARACTERS
    ).forEach(
      character => {
        const option =
          document.createElement(
            "option"
          );

        option.value =
          character.id;

        option.textContent =
          getLocalized(
            character.name
          );

        option.selected =
          character.id ===
          selectedAI;

        select.appendChild(
          option
        );
      }
    );

    select.addEventListener(
      "change",
      () => {
        if (
          selectedAI ===
          select.value
        ) {
          return;
        }

        selectedAI =
          select.value;

        restartGame();
      }
    );

    panel.appendChild(
      select
    );

    const aiStats =
      ensureAIStats(
        selectedAI
      );

    const statsBox =
      document.createElement(
        "div"
      );

    statsBox.className =
      "gomoku-ai-stats";

    statsBox.append(
      createAIStat(
        text("wins"),
        aiStats.losses
      ),
      createAIStat(
        text("losses"),
        aiStats.wins
      )
    );

    panel.appendChild(
      statsBox
    );

    return panel;
  }

  function createAIStat(
    label,
    value
  ) {
    const box =
      document.createElement(
        "div"
      );

    box.className =
      "gomoku-ai-stat";

    const labelElement =
      document.createElement(
        "span"
      );

    labelElement.textContent =
      label;

    const valueElement =
      document.createElement(
        "strong"
      );

    valueElement.textContent =
      String(value);

    box.append(
      labelElement,
      valueElement
    );

    return box;
  }

  function createLocalPanel() {
    const panel =
      document.createElement(
        "div"
      );

    panel.className =
      "gomoku-local-info";

    const title =
      document.createElement(
        "div"
      );

    title.className =
      "gomoku-local-title";

    title.textContent =
      text("local");

    const subtitle =
      document.createElement(
        "div"
      );

    subtitle.className =
      "gomoku-local-subtitle";

    subtitle.textContent =
      "Player 1 · Player 2";

    const turn =
      document.createElement(
        "div"
      );

    turn.className =
      "gomoku-local-turn";

    turn.textContent =
      currentPlayer ===
      CONFIG.BLACK
        ? text("player1Turn")
        : text("player2Turn");

    panel.append(
      title,
      subtitle,
      turn
    );

    return panel;
  }

  function showAIOS(
    type,
    ai = getSelectedAI()
  ) {
    if (
      selectedMode !== "ai"
    ) {
      return;
    }

    const panel =
      DOM.gameScreen?.querySelector(
        ".gomoku-ai-panel"
      );

    const os =
      panel?.querySelector(
        "[data-ai-os]"
      );

    if (!os) {
      return;
    }

    const messages =
      ai.os[type] ||
      ai.os.thinking;

    const message =
      messages[
        Math.floor(
          Math.random() *
          messages.length
        )
      ];

    if (
      settings.motion
    ) {
      os.style.opacity = "0";

      setTimeout(
        () => {
          os.textContent =
            message;

          os.style.opacity = "1";
        },
        100
      );
    } else {
      os.textContent =
        message;
    }
  }

  function getLastAIOS(ai) {
    const messages =
      ai.os.thinking;

    return messages[0];
  }

  function classifyAIMove(
    row,
    col,
    beforeBoard,
    player
  ) {
    const opponentPlayer =
      opponent(player);

    const win =
      findImmediateMove(
        beforeBoard,
        player,
        [
          {
            row,
            col
          }
        ]
      );

    if (win) {
      return "winning";
    }

    const block =
      findImmediateMove(
        beforeBoard,
        opponentPlayer,
        [
          {
            row,
            col
          }
        ]
      );

    if (block) {
      return "defend";
    }

    const ownScore =
      localScore(
        beforeBoard,
        row,
        col,
        player
      );

    const enemyScore =
      localScore(
        beforeBoard,
        row,
        col,
        opponentPlayer
      );

    if (
      enemyScore >
      ownScore * 1.2
    ) {
      return "defend";
    }

    if (
      ownScore >
      250
    ) {
      return "attack";
    }

    return "thinking";
  }

  /* =========================================================
     TURN UI
     ========================================================= */

  function updateTurnUI() {
    if (!DOM.turnStone) {
      return;
    }

    const isBlack =
      currentPlayer ===
      CONFIG.BLACK;

    DOM.turnStone.className =
      `status-stone ${
        isBlack
          ? "black-stone"
          : "white-stone"
      }`;

    if (
      selectedMode === "local"
    ) {
      DOM.turnLabel.textContent =
        currentPlayer ===
        CONFIG.BLACK
          ? text("player1Turn")
          : text("player2Turn");

      DOM.turnPlayer.textContent =
        currentPlayer ===
        CONFIG.BLACK
          ? text("black")
          : text("white");

      DOM.thinkingIndicator.hidden =
        true;

      return;
    }

    const human =
      getHumanSide();

    if (
      currentPlayer ===
      human
    ) {
      DOM.turnLabel.textContent =
        text("yourTurn");

      DOM.turnPlayer.textContent =
        currentPlayer ===
        CONFIG.BLACK
          ? text("black")
          : text("white");

      DOM.thinkingIndicator.hidden =
        true;
    } else {
      const ai =
        getSelectedAI();

      DOM.turnLabel.textContent =
        getLocalized(
          ai.name
        );

      DOM.turnPlayer.textContent =
        currentPlayer ===
        CONFIG.BLACK
          ? text("black")
          : text("white");

      DOM.thinkingIndicator.hidden =
        !aiThinking;
    }
  }

  /* =========================================================
     UNDO
     ========================================================= */

  function undoMove() {
    if (
      gameOver ||
      aiThinking ||
      moveHistory.length === 0
    ) {
      showToast(
        text("cannotUndo")
      );

      return;
    }

    invalidateWorker();

    if (
      selectedMode === "local"
    ) {
      removeLastMove();

      currentPlayer =
        moveHistory.length %
          2 ===
        0
          ? CONFIG.BLACK
          : CONFIG.WHITE;
    } else {
      const human =
        getHumanSide();

      while (
        moveHistory.length
      ) {
        const last =
          moveHistory[
            moveHistory.length - 1
          ];

        removeLastMove();

        if (
          last.player ===
          human
        ) {
          break;
        }
      }

      currentPlayer =
        human;
    }

    winningLine = [];
    gameOver = false;
    aiThinking = false;

    boardVersion += 1;

    updateTurnUI();
    renderGameSidePanel();
    drawBoard();
    saveCurrentGame();
  }

  function removeLastMove() {
    const move =
      moveHistory.pop();

    if (!move) {
      return;
    }

    board[
      move.row
    ][
      move.col
    ] = CONFIG.EMPTY;

    lastMove =
      moveHistory[
        moveHistory.length - 1
      ] || null;

    boardVersion += 1;
  }

  /* =========================================================
     WIN DETECTION
     ========================================================= */

  function findWinningLine(
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

    for (
      const [dr, dc]
      of directions
    ) {
      const line = [
        {
          row,
          col
        }
      ];

      for (
        const sign of [1, -1]
      ) {
        let distance = 1;

        while (true) {
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
            currentBoard[r][c] !==
              player
          ) {
            break;
          }

          if (
            sign === 1
          ) {
            line.push({
              row: r,
              col: c
            });
          } else {
            line.unshift({
              row: r,
              col: c
            });
          }

          distance += 1;
        }
      }

      if (
        line.length >=
        CONFIG.WIN_LENGTH
      ) {
        return line;
      }
    }

    return null;
  }

  function isBoardFull() {
    for (
      const row of board
    ) {
      if (
        row.includes(
          CONFIG.EMPTY
        )
      ) {
        return false;
      }
    }

    return true;
  }

  /* =========================================================
     FINISH GAME
     ========================================================= */

  function finishGame(result) {
    if (gameOver) {
      return;
    }

    gameOver = true;
    aiThinking = false;

    invalidateWorker();

    winningLine =
      result.line || [];

    clearSavedGame();

    if (
      result.type === "draw"
    ) {
      stats.draws += 1;
      stats.total += 1;

      addRecord({
        mode: selectedMode,
        result: "draw",
        winner: CONFIG.EMPTY,
        ai:
          selectedMode === "ai"
            ? selectedAI
            : null
      });
    } else if (
      selectedMode === "local"
    ) {
      stats.total += 1;

      addRecord({
        mode: "local",
        result:
          result.winner ===
          CONFIG.BLACK
            ? "player1"
            : "player2",
        winner:
          result.winner,
        ai: null
      });
    } else {
      const human =
        getHumanSide();

      const won =
        result.winner ===
        human;

      if (won) {
        stats.wins += 1;
      } else {
        stats.losses += 1;
      }

      stats.total += 1;

      const aiStats =
        ensureAIStats(
          selectedAI
        );

      if (won) {
        aiStats.losses += 1;
      } else {
        aiStats.wins += 1;
      }

      addRecord({
        mode: "ai",
        result:
          won
            ? "win"
            : "loss",
        winner:
          result.winner,
        ai:
          selectedAI
      });
    }

    saveStats();
    renderStats();

    drawBoard();

    showResult(result);
  }

  function showResult(result) {
    if (
      result.type === "draw"
    ) {
      DOM.resultMark.className =
        "result-mark draw";

      DOM.resultKicker.textContent =
        text("draw");

      DOM.resultTitle.textContent =
        text("draw");

      DOM.resultDescription.textContent =
        text("drawDesc");
    } else if (
      selectedMode === "local"
    ) {
      const player1 =
        result.winner ===
        CONFIG.BLACK;

      DOM.resultMark.className =
        `result-mark ${
          player1
            ? "win"
            : "lose"
        }`;

      DOM.resultKicker.textContent =
        player1
          ? text("black")
          : text("white");

      DOM.resultTitle.textContent =
        player1
          ? text("player1Win")
          : text("player2Win");

      DOM.resultDescription.textContent =
        text(
          "localWinDesc",
          {
            player:
              player1
                ? text("player1Turn")
                    .replace(
                      " 的回合",
                      ""
                    )
                    .replace(
                      "'s turn",
                      ""
                    )
                : text("player2Turn")
                    .replace(
                      " 的回合",
                      ""
                    )
                    .replace(
                      "'s turn",
                      ""
                    )
          }
        );
    } else {
      const human =
        getHumanSide();

      const won =
        result.winner ===
        human;

      const ai =
        getSelectedAI();

      DOM.resultMark.className =
        `result-mark ${
          won
            ? "win"
            : "lose"
        }`;

      DOM.resultKicker.textContent =
        getLocalized(
          ai.name
        );

      DOM.resultTitle.textContent =
        won
          ? text("win")
          : text("lose");

      DOM.resultDescription.textContent =
        won
          ? text(
              "playerWinDesc",
              {
                name:
                  getLocalized(
                    ai.name
                  )
              }
            )
          : text(
              "playerLoseDesc",
              {
                name:
                  getLocalized(
                    ai.name
                  )
              }
            );
    }

    showScreen("result");
  }

  /* =========================================================
     STATISTICS
     ========================================================= */

  function createDefaultStats() {
    const ai = {};

    Object.keys(
      AI_CHARACTERS
    ).forEach(
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
      ai,
      records: []
    };
  }

  function loadStats() {
    try {
      const raw =
        localStorage.getItem(
          CONFIG.STORAGE_KEY
        );

      if (!raw) {
        return createDefaultStats();
      }

      const parsed =
        JSON.parse(raw);

      const base =
        createDefaultStats();

      return {
        ...base,
        ...parsed,
        ai: {
          ...base.ai,
          ...(parsed.ai || {})
        },
        records:
          Array.isArray(
            parsed.records
          )
            ? parsed.records
            : []
      };
    } catch {
      return createDefaultStats();
    }
  }

  function saveStats() {
    try {
      localStorage.setItem(
        CONFIG.STORAGE_KEY,
        JSON.stringify(stats)
      );
    } catch {}
  }

  function ensureAIStats(
    id
  ) {
    if (
      !stats.ai[id]
    ) {
      stats.ai[id] = {
        wins: 0,
        losses: 0
      };
    }

    return stats.ai[id];
  }

  function addRecord(record) {
    stats.records.push({
      ...record,
      date:
        new Date().toLocaleString(
          settings.language
        )
    });

    if (
      stats.records.length >
      100
    ) {
      stats.records =
        stats.records.slice(
          -100
        );
    }
  }

  function renderStats() {
    if (!DOM.statGames) {
      return;
    }

    DOM.statGames.textContent =
      String(stats.total);

    DOM.statWins.textContent =
      String(stats.wins);

    DOM.statLosses.textContent =
      String(stats.losses);

    DOM.statDraws.textContent =
      String(stats.draws);

    renderRecordList();
  }

  function renderRecordList() {
    if (!DOM.recordList) {
      return;
    }

    DOM.recordList.innerHTML = "";

    if (
      !stats.records.length
    ) {
      const empty =
        document.createElement(
          "p"
        );

      empty.textContent =
        text("noRecords");

      empty.style.opacity =
        ".55";

      DOM.recordList.appendChild(
        empty
      );

      return;
    }

    stats.records
      .slice(-30)
      .reverse()
      .forEach(
        record => {
          const item =
            document.createElement(
              "div"
            );

          item.className =
            "record-item";

          const left =
            document.createElement(
              "div"
            );

          const title =
            document.createElement(
              "strong"
            );

          if (
            record.mode === "local"
          ) {
            title.textContent =
              text("recordLocal");
          } else if (
            record.ai &&
            AI_CHARACTERS[
              record.ai
            ]
          ) {
            title.textContent =
              getLocalized(
                AI_CHARACTERS[
                  record.ai
                ].name
              );
          } else {
            title.textContent =
              "Gomoku";
          }

          const date =
            document.createElement(
              "small"
            );

          date.textContent =
            record.date || "";

          left.append(
            title,
            date
          );

          const result =
            document.createElement(
              "strong"
            );

          if (
            record.result ===
            "win" ||
            record.result ===
            "player1"
          ) {
            result.textContent =
              text("recordWin");

            result.className =
              "record-result win";
          } else if (
            record.result ===
            "loss" ||
            record.result ===
            "player2"
          ) {
            result.textContent =
              text("recordLoss");

            result.className =
              "record-result loss";
          } else {
            result.textContent =
              text("recordDraw");

            result.className =
              "record-result draw";
          }

          item.append(
            left,
            result
          );

          DOM.recordList.appendChild(
            item
          );
        }
      );
  }

  function setupRecordsControls() {
    DOM.clearRecordsButton?.addEventListener(
      "click",
      () => {
        stats =
          createDefaultStats();

        saveStats();
        renderStats();

        showToast(
          text("recordsCleared")
        );
      }
    );
  }

  /* =========================================================
     SETTINGS
     ========================================================= */

  function createDefaultSettings() {
    return {
      language: "zh-TW",
      sound: true,
      motion: true,
      theme: "system"
    };
  }

  function loadSettings() {
    try {
      const raw =
        localStorage.getItem(
          CONFIG.SETTINGS_KEY
        );

      if (!raw) {
        return createDefaultSettings();
      }

      return {
        ...createDefaultSettings(),
        ...JSON.parse(raw)
      };
    } catch {
      return createDefaultSettings();
    }
  }

  function saveSettings() {
    settings = {
      language:
        DOM.languageSelect?.value ||
        settings.language ||
        "zh-TW",

      sound:
        DOM.soundToggle?.checked ??
        settings.sound,

      motion:
        DOM.motionToggle?.checked ??
        settings.motion,

      theme:
        DOM.themeSelect?.value ||
        settings.theme ||
        "system"
    };

    try {
      localStorage.setItem(
        CONFIG.SETTINGS_KEY,
        JSON.stringify(settings)
      );
    } catch {}

    applySettings();
  }

  function setupSettingsControls() {
    DOM.languageSelect?.addEventListener(
      "change",
      () => {
        saveSettings();

        applyTranslations();
        renderStats();
        updateSetupUI();
        updateTurnUI();
        renderGameSidePanel();
        checkResumeGame();
      }
    );

    DOM.soundToggle?.addEventListener(
      "change",
      saveSettings
    );

    DOM.motionToggle?.addEventListener(
      "change",
      saveSettings
    );

    DOM.themeSelect?.addEventListener(
      "change",
      saveSettings
    );

    setupRecordsControls();
  }

  function applySettings() {
    if (
      DOM.languageSelect
    ) {
      DOM.languageSelect.value =
        settings.language;
    }

    if (
      DOM.soundToggle
    ) {
      DOM.soundToggle.checked =
        settings.sound;
    }

    if (
      DOM.motionToggle
    ) {
      DOM.motionToggle.checked =
        settings.motion;
    }

    if (
      DOM.themeSelect
    ) {
      DOM.themeSelect.value =
        settings.theme;
    }

    if (
      settings.theme ===
      "system"
    ) {
      document.documentElement.removeAttribute(
        "data-theme"
      );
    } else {
      document.documentElement.setAttribute(
        "data-theme",
        settings.theme
      );
    }

    applyTranslations();
  }

  function applyTranslations() {
    const dictionary =
      I18N[
        settings.language
      ] ||
      I18N["zh-TW"];

    document
      .querySelectorAll(
        "[data-i18n]"
      )
      .forEach(
        element => {
          const key =
            element.dataset.i18n;

          const value =
            dictionary[
              convertI18NKey(
                key
              )
            ];

          if (
            value !== undefined
          ) {
            element.textContent =
              value;
          }
        }
      );
  }

  function convertI18NKey(key) {
    const map = {
      "app.title": "title",
      "home.subtitle": "subtitle",
      "home.start": "start",
      "home.records": "records",
      "home.settings": "settings",
      "home.resumeLabel": "unfinished",
      "home.resume": "resume",

      "setup.title": "setup",
      "setup.mode": "mode",
      "setup.ai": "ai",
      "setup.local": "local",
      "setup.difficulty": "difficulty",
      "difficulty.easy": "easy",
      "difficulty.normal": "normal",
      "difficulty.hard": "hard",
      "difficulty.easyDescription": "easyDesc",
      "difficulty.normalDescription": "normalDesc",
      "difficulty.hardDescription": "hardDesc",
      "setup.side": "side",
      "side.black": "black",
      "side.white": "white",
      "side.first": "first",
      "side.second": "second",
      "setup.begin": "begin",

      "game.thinking": "thinking",
      "game.undo": "undo",
      "game.restart": "restart",
      "game.menu": "menu",

      "result.again": "again",
      "result.home": "home",

      "records.title": "records",
      "records.games": "games",
      "records.wins": "wins",
      "records.losses": "losses",
      "records.draws": "draws",
      "records.clear": "clear",

      "settings.title": "settings",
      "settings.language": "language",
      "settings.languageDescription": "languageDesc",
      "settings.sound": "sound",
      "settings.soundDescription": "soundDesc",
      "settings.motion": "motion",
      "settings.motionDescription": "motionDesc",
      "settings.theme": "theme",
      "settings.themeDescription": "themeDesc"
    };

    return (
      map[key] ||
      key
    );
  }

  function text(
    key,
    variables = {}
  ) {
    const dictionary =
      I18N[
        settings.language
      ] ||
      I18N["zh-TW"];

    let value =
      dictionary[key] ??
      I18N["zh-TW"][key] ??
      key;

    Object.entries(
      variables
    ).forEach(
      ([name, replacement]) => {
        value =
          value.replace(
            `{${name}}`,
            String(replacement)
          );
      }
    );

    return value;
  }

  function getLocalized(
    value
  ) {
    if (
      typeof value ===
      "string"
    ) {
      return value;
    }

    return (
      value[
        settings.language
      ] ??
      value["zh-TW"] ??
      value.en ??
      ""
    );
  }

  /* =========================================================
     SAVE / RESUME
     ========================================================= */

  function saveCurrentGame() {
    if (
      gameOver ||
      !moveHistory.length
    ) {
      return;
    }

    try {
      localStorage.setItem(
        CONFIG.GAME_SAVE_KEY,
        JSON.stringify({
          version: 3,
          gameId,
          board,
          boardVersion,
          currentPlayer,
          selectedMode,
          selectedAI,
          selectedDifficulty,
          playerSide,
          moveHistory,
          winningLine,
          lastMove,
          timestamp:
            Date.now()
        })
      );

      checkResumeGame();
    } catch {}
  }

  function clearSavedGame() {
    try {
      localStorage.removeItem(
        CONFIG.GAME_SAVE_KEY
      );

      checkResumeGame();
    } catch {}
  }

  function checkResumeGame() {
    if (
      !DOM.resumeCard ||
      !DOM.resumeText
    ) {
      return;
    }

    try {
      const raw =
        localStorage.getItem(
          CONFIG.GAME_SAVE_KEY
        );

      if (!raw) {
        DOM.resumeCard.hidden =
          true;

        return;
      }

      const saved =
        JSON.parse(raw);

      if (
        !isValidSavedGame(
          saved
        )
      ) {
        clearSavedGame();

        return;
      }

      if (
        saved.mode ===
        "local"
      ) {
        DOM.resumeText.textContent =
          text("resumedLocal");
      } else {
        const ai =
          AI_CHARACTERS[
            saved.selectedAI
          ] ||
          AI_CHARACTERS.sora;

        DOM.resumeText.textContent =
          text(
            "resumedAI",
            {
              name:
                getLocalized(
                  ai.name
                )
            }
          );
      }

      DOM.resumeCard.hidden =
        false;
    } catch {
      DOM.resumeCard.hidden =
        true;
    }
  }

  function isValidSavedGame(
    saved
  ) {
    if (
      !saved ||
      !Array.isArray(
        saved.board
      ) ||
      saved.board.length !==
        CONFIG.BOARD_SIZE
    ) {
      return false;
    }

    if (
      !Array.isArray(
        saved.moveHistory
      )
    ) {
      return false;
    }

    for (
      const row of saved.board
    ) {
      if (
        !Array.isArray(row) ||
        row.length !==
          CONFIG.BOARD_SIZE
      ) {
        return false;
      }

      if (
        row.some(
          value =>
            ![
              CONFIG.EMPTY,
              CONFIG.BLACK,
              CONFIG.WHITE
            ].includes(value)
        )
      ) {
        return false;
      }
    }

    return (
      saved.selectedMode ===
        "ai" ||
      saved.selectedMode ===
        "local"
    );
  }

  function resumeGame() {
    try {
      const raw =
        localStorage.getItem(
          CONFIG.GAME_SAVE_KEY
        );

      if (!raw) {
        return;
      }

      const saved =
        JSON.parse(raw);

      if (
        !isValidSavedGame(
          saved
        )
      ) {
        clearSavedGame();

        return;
      }

      invalidateWorker();

      board =
        cloneBoard(
          saved.board
        );

      gameId =
        saved.gameId ||
        createId();

      boardVersion =
        saved.boardVersion ||
        0;

      currentPlayer =
        saved.currentPlayer;

      selectedMode =
        saved.selectedMode;

      selectedAI =
        AI_CHARACTERS[
          saved.selectedAI
        ]
          ? saved.selectedAI
          : "sora";

      selectedDifficulty =
        DIFFICULTIES[
          saved.selectedDifficulty
        ]
          ? saved.selectedDifficulty
          : "normal";

      playerSide =
        saved.playerSide ===
        "white"
          ? "white"
          : "black";

      moveHistory =
        saved.moveHistory;

      winningLine =
        Array.isArray(
          saved.winningLine
        )
          ? saved.winningLine
          : [];

      lastMove =
        saved.lastMove ||
        moveHistory[
          moveHistory.length - 1
        ] ||
        null;

      gameOver = false;
      aiThinking = false;

      showScreen("game");

      updateSetupUI();
      updateTurnUI();
      renderGameSidePanel();
      drawBoard();

      if (
        selectedMode === "ai" &&
        isAITurn()
      ) {
        runAITurn();
      }
    } catch {
      clearSavedGame();
    }
  }

  /* =========================================================
     BOARD DRAWING
     ========================================================= */

  function createBoard() {
    return Array.from(
      {
        length:
          CONFIG.BOARD_SIZE
      },
      () =>
        Array(
          CONFIG.BOARD_SIZE
        ).fill(
          CONFIG.EMPTY
        )
    );
  }

  function cloneBoard(
    source
  ) {
    return source.map(
      row =>
        row.slice()
    );
  }

  function scheduleResize() {
    cancelAnimationFrame(
      resizeFrame
    );

    resizeFrame =
      requestAnimationFrame(
        () => {
          resizeCanvas();
          drawBoard();
        }
      );
  }

  function resizeCanvas() {
    if (
      !canvas ||
      !ctx
    ) {
      return;
    }

    const wrapper =
      canvas.parentElement;

    if (!wrapper) {
      return;
    }

    const rect =
      wrapper.getBoundingClientRect();

    const width =
      Math.max(
        1,
        rect.width
      );

    const height =
      Math.max(
        1,
        rect.height
      );

    let size =
      Math.min(
        width,
        height
      );

    if (
      !isScreenActive("game")
    ) {
      size =
        Math.min(
          width,
          760
        );
    }

    size =
      Math.max(
        220,
        Math.floor(size)
      );

    const dpr =
      Math.min(
        window.devicePixelRatio ||
          1,
        3
      );

    canvas.style.width =
      `${size}px`;

    canvas.style.height =
      `${size}px`;

    canvas.width =
      Math.round(
        size * dpr
      );

    canvas.height =
      Math.round(
        size * dpr
      );

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    boardSizePx =
      size;

    boardOrigin =
      size *
      0.075;

    cellSize =
      (
        size -
        boardOrigin * 2
      ) /
      (CONFIG.BOARD_SIZE - 1);

    boardRect =
      canvas.getBoundingClientRect();
  }

  function drawBoard() {
    if (
      !ctx ||
      !canvas ||
      boardSizePx <= 0
    ) {
      return;
    }

    boardRect =
      canvas.getBoundingClientRect();

    ctx.clearRect(
      0,
      0,
      boardSizePx,
      boardSizePx
    );

    drawBoardBackground();
    drawGrid();
    drawStars();
    drawStones();
    drawLastMove();
    drawWinningLine();
  }

  function drawBoardBackground() {
    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        boardSizePx,
        boardSizePx
      );

    gradient.addColorStop(
      0,
      "#e2c58e"
    );

    gradient.addColorStop(
      1,
      CONFIG.COLORS.board
    );

    ctx.fillStyle =
      gradient;

    ctx.fillRect(
      0,
      0,
      boardSizePx,
      boardSizePx
    );
  }

  function drawGrid() {
    ctx.save();

    ctx.strokeStyle =
      CONFIG.COLORS.grid;

    ctx.lineWidth =
      Math.max(
        0.8,
        cellSize * 0.025
      );

    for (
      let index = 0;
      index <
      CONFIG.BOARD_SIZE;
      index += 1
    ) {
      const position =
        boardOrigin +
        index *
          cellSize;

      ctx.beginPath();
      ctx.moveTo(
        boardOrigin,
        position
      );
      ctx.lineTo(
        boardOrigin +
          cellSize *
            (CONFIG.BOARD_SIZE - 1),
        position
      );
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(
        position,
        boardOrigin
      );
      ctx.lineTo(
        position,
        boardOrigin +
          cellSize *
            (CONFIG.BOARD_SIZE - 1)
      );
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawStars() {
    const stars = [
      [3, 3],
      [3, 11],
      [7, 7],
      [11, 3],
      [11, 11]
    ];

    ctx.save();

    ctx.fillStyle =
      CONFIG.COLORS.star;

    for (
      const [row, col]
      of stars
    ) {
      const point =
        boardToCanvas(
          row,
          col
        );

      ctx.beginPath();

      ctx.arc(
        point.x,
        point.y,
        Math.max(
          2,
          cellSize * 0.075
        ),
        0,
        Math.PI * 2
      );

      ctx.fill();
    }

    ctx.restore();
  }

  function drawStones() {
    const radius =
      cellSize *
      0.43;

    for (
      let row = 0;
      row <
      CONFIG.BOARD_SIZE;
      row += 1
    ) {
      for (
        let col = 0;
        col <
        CONFIG.BOARD_SIZE;
        col += 1
      ) {
        const player =
          board[row][col];

        if (
          player ===
          CONFIG.EMPTY
        ) {
          continue;
        }

        const point =
          boardToCanvas(
            row,
            col
          );

        drawStone(
          point.x,
          point.y,
          radius,
          player
        );
      }
    }
  }

  function drawStone(
    x,
    y,
    radius,
    player
  ) {
    ctx.save();

    ctx.shadowColor =
      "rgba(30, 20, 10, .25)";

    ctx.shadowBlur =
      radius * 0.18;

    ctx.shadowOffsetY =
      radius * 0.08;

    let gradient;

    if (
      player ===
      CONFIG.BLACK
    ) {
      gradient =
        ctx.createRadialGradient(
          x -
            radius *
              0.32,
          y -
            radius *
              0.35,
          radius *
            0.05,
          x,
          y,
          radius
        );

      gradient.addColorStop(
        0,
        CONFIG.COLORS.blackHighlight
      );

      gradient.addColorStop(
        0.35,
        "#292929"
      );

      gradient.addColorStop(
        1,
        CONFIG.COLORS.black
      );
    } else {
      gradient =
        ctx.createRadialGradient(
          x -
            radius *
              0.32,
          y -
            radius *
              0.35,
          radius *
            0.05,
          x,
          y,
          radius
        );

      gradient.addColorStop(
        0,
        "#ffffff"
      );

      gradient.addColorStop(
        0.7,
        CONFIG.COLORS.white
      );

      gradient.addColorStop(
        1,
        CONFIG.COLORS.whiteShadow
      );
    }

    ctx.fillStyle =
      gradient;

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fill();

    if (
      player ===
      CONFIG.WHITE
    ) {
      ctx.strokeStyle =
        "rgba(0,0,0,.08)";

      ctx.lineWidth =
        Math.max(
          0.7,
          radius * 0.025
        );

      ctx.stroke();
    }

    ctx.restore();
  }

  function drawLastMove() {
    if (!lastMove) {
      return;
    }

    const point =
      boardToCanvas(
        lastMove.row,
        lastMove.col
      );

    ctx.save();

    ctx.strokeStyle =
      CONFIG.COLORS.lastMove;

    ctx.lineWidth =
      Math.max(
        1.5,
        cellSize * 0.055
      );

    const size =
      cellSize *
      0.16;

    ctx.beginPath();

    ctx.moveTo(
      point.x - size,
      point.y
    );

    ctx.lineTo(
      point.x + size,
      point.y
    );

    ctx.moveTo(
      point.x,
      point.y - size
    );

    ctx.lineTo(
      point.x,
      point.y + size
    );

    ctx.stroke();

    ctx.restore();
  }

  function drawWinningLine() {
    if (
      winningLine.length <
      CONFIG.WIN_LENGTH
    ) {
      return;
    }

    const first =
      boardToCanvas(
        winningLine[0].row,
        winningLine[0].col
      );

    const last =
      boardToCanvas(
        winningLine[
          winningLine.length - 1
        ].row,
        winningLine[
          winningLine.length - 1
        ].col
      );

    ctx.save();

    ctx.strokeStyle =
      CONFIG.COLORS.winning;

    ctx.lineWidth =
      Math.max(
        3,
        cellSize * 0.12
      );

    ctx.lineCap =
      "round";

    ctx.globalAlpha =
      0.88;

    ctx.beginPath();

    ctx.moveTo(
      first.x,
      first.y
    );

    ctx.lineTo(
      last.x,
      last.y
    );

    ctx.stroke();

    ctx.restore();
  }

  function boardToCanvas(
    row,
    col
  ) {
    return {
      x:
        boardOrigin +
        col *
          cellSize,

      y:
        boardOrigin +
        row *
          cellSize
    };
  }

  function canvasToBoard(
    event
  ) {
    if (
      !canvas ||
      !boardRect
    ) {
      return null;
    }

    const x =
      event.clientX -
      boardRect.left;

    const y =
      event.clientY -
      boardRect.top;

    const col =
      Math.round(
        (x - boardOrigin) /
          cellSize
      );

    const row =
      Math.round(
        (y - boardOrigin) /
          cellSize
      );

    if (
      !isInside(row, col)
    ) {
      return null;
    }

    const point =
      boardToCanvas(
        row,
        col
      );

    const distance =
      Math.hypot(
        x - point.x,
        y - point.y
      );

    if (
      distance >
      cellSize * 0.5
    ) {
      return null;
    }

    return {
      row,
      col
    };
  }

  /* =========================================================
     AUDIO
     ========================================================= */

  function playStoneSound(
    player
  ) {
    if (
      !settings.sound
    ) {
      return;
    }

    try {
      if (
        !audioContext
      ) {
        audioContext =
          new (
            window.AudioContext ||
            window.webkitAudioContext
          )();
      }

      const oscillator =
        audioContext.createOscillator();

      const gain =
        audioContext.createGain();

      oscillator.type =
        "sine";

      oscillator.frequency.value =
        player ===
        CONFIG.BLACK
          ? 150
          : 210;

      gain.gain.setValueAtTime(
        0.0001,
        audioContext.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.045,
        audioContext.currentTime +
          0.008
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime +
          0.08
      );

      oscillator.connect(
        gain
      );

      gain.connect(
        audioContext.destination
      );

      oscillator.start();

      oscillator.stop(
        audioContext.currentTime +
          0.09
      );
    } catch {}
  }

  /* =========================================================
     TOAST
     ========================================================= */

  function showToast(
    message
  ) {
    const toast =
      $("#toast");

    if (!toast) {
      return;
    }

    toast.textContent =
      message;

    toast.classList.add(
      "show"
    );

    clearTimeout(
      toastTimer
    );

    toastTimer =
      setTimeout(
        () => {
          toast.classList.remove(
            "show"
          );
        },
        1800
      );
  }

  /* =========================================================
     SERVICE WORKER
     ========================================================= */

  function registerServiceWorker() {
    if (
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    window.addEventListener(
      "load",
      () => {
        navigator.serviceWorker
          .register(
            "./sw.js"
          )
          .catch(
            () => {}
          );
      }
    );
  }

  /* =========================================================
     HELPERS
     ========================================================= */

  function getSelectedAI() {
    return (
      AI_CHARACTERS[
        selectedAI
      ] ||
      AI_CHARACTERS.sora
    );
  }

  function isInside(
    row,
    col
  ) {
    return (
      row >= 0 &&
      row <
        CONFIG.BOARD_SIZE &&
      col >= 0 &&
      col <
        CONFIG.BOARD_SIZE
    );
  }

  function wait(ms) {
    return new Promise(
      resolve =>
        setTimeout(
          resolve,
          ms
        )
    );
  }

  function createId() {
    if (
      typeof crypto !==
        "undefined" &&
      typeof crypto.randomUUID ===
        "function"
    ) {
      return crypto.randomUUID();
    }

    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .slice(2)
    );
  }

  /* =========================================================
     START
     ========================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    init
  );
})();
