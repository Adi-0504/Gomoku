/* =========================================================
   GOMOKU
   Complete client-side game controller
   No backend
   Compatible with:
   - index.html
   - style.css
   - ai-worker.js
   - manifest.webmanifest

   Modes:
   - AI
   - Local 2 Player

   Features:
   - Responsive Canvas
   - AI characters
   - AI OS
   - Statistics
   - Undo
   - Resume
   - i18n
   - Settings
   - Sound
   - Motion
   ========================================================= */

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

    STORAGE_KEY: "gomoku-game-data-v3",
    SETTINGS_KEY: "gomoku-settings-v3",
    SAVE_KEY: "gomoku-current-game-v3",

    AI_WORKER: "./ai-worker.js",

    THINKING_MIN: 420,
    THINKING_MAX: 1200,

    BOARD_PADDING: 0.075,

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

      worker: {
        depth: 1,
        radius: 2,
        randomTop: 3
      },

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

      worker: {
        depth: 2,
        radius: 2,
        randomTop: 2
      },

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

      worker: {
        depth: 2,
        radius: 2,
        randomTop: 1
      },

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

      worker: {
        depth: 2,
        radius: 2,
        randomTop: 2
      },

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

      worker: {
        depth: 3,
        radius: 2,
        randomTop: 1
      },

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

      worker: {
        depth: 3,
        radius: 2,
        randomTop: 0
      },

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

      "result.again": "再來一局",
      "result.home": "返回首頁",

      "records.title": "棋局記錄",
      "records.games": "對局",
      "records.wins": "勝利",
      "records.losses": "失敗",
      "records.draws": "和局",
      "records.clear": "清除記錄",

      "settings.title": "設定",
      "settings.language": "語言",
      "settings.languageDescription": "選擇介面語言",
      "settings.sound": "音效",
      "settings.soundDescription": "落子與遊戲音效",
      "settings.motion": "動畫",
      "settings.motionDescription": "啟用遊戲動畫",
      "settings.theme": "外觀",
      "settings.themeDescription": "使用系統外觀"
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
      "game.menu": "选单",

      "result.again": "再来一局",
      "result.home": "返回首页",

      "records.title": "棋局记录",
      "records.games": "对局",
      "records.wins": "胜利",
      "records.losses": "失败",
      "records.draws": "和局",
      "records.clear": "清除记录",

      "settings.title": "设置",
      "settings.language": "语言",
      "settings.languageDescription": "选择界面语言",
      "settings.sound": "音效",
      "settings.soundDescription": "落子与游戏音效",
      "settings.motion": "动画",
      "settings.motionDescription": "启用游戏动画",
      "settings.theme": "外观",
      "settings.themeDescription": "使用系统外观"
    },


    en: {
      "app.title": "Gomoku",
      "home.subtitle": "Simple rules. Never simple games.",
      "home.start": "Start Game",
      "home.records": "Records",
      "home.settings": "Settings",
      "home.resumeLabel": "Unfinished Game",
      "home.resume": "Resume",

      "setup.title": "Start Game",
      "setup.mode": "Game Mode",
      "setup.ai": "vs AI",
      "setup.local": "2 Players",
      "setup.difficulty": "Difficulty",
      "setup.side": "Your Stone",
      "setup.begin": "Begin",

      "difficulty.easy": "Easy",
      "difficulty.easyDescription": "Good for beginners",
      "difficulty.normal": "Normal",
      "difficulty.normalDescription": "A serious game",
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

      "result.again": "Play Again",
      "result.home": "Home",

      "records.title": "Records",
      "records.games": "Games",
      "records.wins": "Wins",
      "records.losses": "Losses",
      "records.draws": "Draws",
      "records.clear": "Clear Records",

      "settings.title": "Settings",
      "settings.language": "Language",
      "settings.languageDescription": "Interface language",
      "settings.sound": "Sound",
      "settings.soundDescription": "Game sounds",
      "settings.motion": "Motion",
      "settings.motionDescription": "Enable animations",
      "settings.theme": "Appearance",
      "settings.themeDescription": "Use system appearance"
    },


    ja: {
      "app.title": "五目並べ",
      "home.subtitle": "簡単なルール。でも、簡単な勝負じゃない。",
      "home.start": "ゲーム開始",
      "home.records": "対戦記録",
      "home.settings": "設定",
      "home.resumeLabel": "途中のゲーム",
      "home.resume": "続ける",

      "setup.title": "ゲーム開始",
      "setup.mode": "対戦モード",
      "setup.ai": "AI対戦",
      "setup.local": "2人対戦",
      "setup.difficulty": "難易度",
      "setup.side": "あなたの石",
      "setup.begin": "開始",

      "difficulty.easy": "初級",
      "difficulty.easyDescription": "初めてでも安心",
      "difficulty.normal": "中級",
      "difficulty.normalDescription": "しっかり対戦",
      "difficulty.hard": "上級",
      "difficulty.hardDescription": "よく考えて",

      "side.black": "黒",
      "side.white": "白",
      "side.first": "先手",
      "side.second": "後手",

      "game.thinking": "考え中",
      "game.undo": "待った",
      "game.restart": "再スタート",
      "game.menu": "メニュー",

      "result.again": "もう一度",
      "result.home": "ホーム",

      "records.title": "対戦記録",
      "records.games": "対局",
      "records.wins": "勝ち",
      "records.losses": "負け",
      "records.draws": "引き分け",
      "records.clear": "記録を消去",

      "settings.title": "設定",
      "settings.language": "言語",
      "settings.languageDescription": "表示言語",
      "settings.sound": "サウンド",
      "settings.soundDescription": "ゲームサウンド",
      "settings.motion": "アニメーション",
      "settings.motionDescription": "アニメーションを有効にする",
      "settings.theme": "外観",
      "settings.themeDescription": "システム設定を使用"
    },


    ko: {
      "app.title": "오목",
      "home.subtitle": "간단한 규칙. 하지만 간단하지 않은 승부.",
      "home.start": "게임 시작",
      "home.records": "전적",
      "home.settings": "설정",
      "home.resumeLabel": "진행 중인 게임",
      "home.resume": "계속",

      "setup.title": "게임 시작",
      "setup.mode": "게임 모드",
      "setup.ai": "AI 대전",
      "setup.local": "2인 대전",
      "setup.difficulty": "난이도",
      "setup.side": "내 돌",
      "setup.begin": "시작",

      "difficulty.easy": "초급",
      "difficulty.easyDescription": "처음이라면 추천",
      "difficulty.normal": "중급",
      "difficulty.normalDescription": "진지한 대국",
      "difficulty.hard": "고급",
      "difficulty.hardDescription": "신중하게 생각하세요",

      "side.black": "흑",
      "side.white": "백",
      "side.first": "선공",
      "side.second": "후공",

      "game.thinking": "생각 중",
      "game.undo": "무르기",
      "game.restart": "다시 시작",
      "game.menu": "메뉴",

      "result.again": "다시 플레이",
      "result.home": "홈",

      "records.title": "전적",
      "records.games": "대국",
      "records.wins": "승리",
      "records.losses": "패배",
      "records.draws": "무승부",
      "records.clear": "기록 삭제",

      "settings.title": "설정",
      "settings.language": "언어",
      "settings.languageDescription": "인터페이스 언어",
      "settings.sound": "효과음",
      "settings.soundDescription": "게임 효과음",
      "settings.motion": "애니메이션",
      "settings.motionDescription": "애니메이션 사용",
      "settings.theme": "테마",
      "settings.themeDescription": "시스템 설정 사용"
    }

  };


  /* =========================================================
     STATE
     ========================================================= */

  let board = createBoard();

  let currentPlayer = CONFIG.BLACK;

  let gameOver = false;
  let aiThinking = false;

  let selectedMode = "ai";
  let selectedAI = "sora";
  let selectedDifficulty = "normal";

  let playerSide = CONFIG.BLACK;

  let moveHistory = [];
  let lastMove = null;
  let winningLine = [];

  let worker = null;
  let workerRequestId = 0;

  let stats = loadStats();
  let settings = loadSettings();

  let audioContext = null;

  let canvas = null;
  let ctx = null;

  let boardMetrics = {
    size: 0,
    padding: 0,
    cell: 0
  };

  let aiPanel = null;


  /* =========================================================
     DOM
     ========================================================= */

  const DOM = {};

  function cacheDOM() {
    DOM.homeScreen =
      document.querySelector("#homeScreen");

    DOM.setupScreen =
      document.querySelector("#setupScreen");

    DOM.gameScreen =
      document.querySelector("#gameScreen");

    DOM.resultScreen =
      document.querySelector("#resultScreen");

    DOM.recordsScreen =
      document.querySelector("#recordsScreen");

    DOM.settingsScreen =
      document.querySelector("#settingsScreen");

    DOM.startButton =
      document.querySelector("#startButton");

    DOM.recordsButton =
      document.querySelector("#recordsButton");

    DOM.settingsButton =
      document.querySelector("#settingsButton");

    DOM.beginGameButton =
      document.querySelector("#beginGameButton");

    DOM.modeControl =
      document.querySelector("#modeControl");

    DOM.difficultyGroup =
      document.querySelector("#difficultyGroup");

    DOM.undoButton =
      document.querySelector("#undoButton");

    DOM.restartButton =
      document.querySelector("#restartButton");

    DOM.gameMenuButton =
      document.querySelector("#gameMenuButton");

    DOM.playAgainButton =
      document.querySelector("#playAgainButton");

    DOM.resultHomeButton =
      document.querySelector("#resultHomeButton");

    DOM.clearRecordsButton =
      document.querySelector("#clearRecordsButton");

    DOM.languageSelect =
      document.querySelector("#languageSelect");

    DOM.soundToggle =
      document.querySelector("#soundToggle");

    DOM.motionToggle =
      document.querySelector("#motionToggle");

    DOM.themeSelect =
      document.querySelector("#themeSelect");

    DOM.turnStone =
      document.querySelector("#turnStone");

    DOM.turnLabel =
      document.querySelector("#turnLabel");

    DOM.turnPlayer =
      document.querySelector("#turnPlayer");

    DOM.thinkingIndicator =
      document.querySelector("#thinkingIndicator");

    DOM.resultMark =
      document.querySelector("#resultMark");

    DOM.resultKicker =
      document.querySelector("#resultKicker");

    DOM.resultTitle =
      document.querySelector("#resultTitle");

    DOM.resultDescription =
      document.querySelector("#resultDescription");

    DOM.statGames =
      document.querySelector("#statGames");

    DOM.statWins =
      document.querySelector("#statWins");

    DOM.statLosses =
      document.querySelector("#statLosses");

    DOM.statDraws =
      document.querySelector("#statDraws");

    DOM.recordList =
      document.querySelector("#recordList");

    DOM.resumeCard =
      document.querySelector("#resumeCard");

    DOM.resumeText =
      document.querySelector("#resumeText");

    DOM.resumeButton =
      document.querySelector("#resumeButton");

    DOM.toast =
      document.querySelector("#toast");

    canvas =
      document.querySelector("#boardCanvas");

    ctx =
      canvas?.getContext("2d");

    createGamePanel();
  }


  /* =========================================================
     BOARD
     ========================================================= */

  function createBoard() {
    return Array.from(
      {
        length: CONFIG.BOARD_SIZE
      },
      () =>
        Array(CONFIG.BOARD_SIZE)
          .fill(CONFIG.EMPTY)
    );
  }


  function cloneBoard(source) {
    return source.map(row => row.slice());
  }


  function isInside(row, col) {
    return (
      row >= 0 &&
      row < CONFIG.BOARD_SIZE &&
      col >= 0 &&
      col < CONFIG.BOARD_SIZE
    );
  }


  function opponent(player) {
    return player === CONFIG.BLACK
      ? CONFIG.WHITE
      : CONFIG.BLACK;
  }


  /* =========================================================
     CANVAS
     ========================================================= */

  function setupCanvas() {
    if (!canvas || !ctx) return;

    resizeCanvas();

    window.addEventListener(
      "resize",
      debounce(resizeCanvas, 80),
      {
        passive: true
      }
    );

    window.addEventListener(
      "orientationchange",
      () => {
        setTimeout(resizeCanvas, 120);
      },
      {
        passive: true
      }
    );

    canvas.addEventListener(
      "pointerdown",
      handleCanvasPointer,
      {
        passive: false
      }
    );

    canvas.addEventListener(
      "keydown",
      handleCanvasKeyboard
    );
  }


  function resizeCanvas() {
    if (!canvas || !ctx) return;

    const wrapper =
      canvas.parentElement;

    if (!wrapper) return;

    const rect =
      wrapper.getBoundingClientRect();

    const viewportWidth =
      Math.max(
        240,
        window.innerWidth ||
          document.documentElement.clientWidth ||
          360
      );

    const viewportHeight =
      Math.max(
        300,
        window.innerHeight ||
          document.documentElement.clientHeight ||
          640
      );

    const widthLimit =
      Math.min(
        rect.width || viewportWidth,
        viewportWidth - 24
      );

    const heightLimit =
      Math.max(
        240,
        viewportHeight -
          190
      );

    const size =
      Math.max(
        240,
        Math.floor(
          Math.min(
            widthLimit,
            heightLimit
          )
        )
      );

    const dpr =
      Math.min(
        window.devicePixelRatio || 1,
        2
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

    boardMetrics = {
      size,
      padding:
        size * CONFIG.BOARD_PADDING,
      cell:
        (size -
          size *
            CONFIG.BOARD_PADDING *
            2) /
        (CONFIG.BOARD_SIZE - 1)
    };

    drawBoard();
  }


  function getBoardPoint(row, col) {
    return {
      x:
        boardMetrics.padding +
        col *
          boardMetrics.cell,

      y:
        boardMetrics.padding +
        row *
          boardMetrics.cell
    };
  }


  function pointerToCell(event) {
    if (!canvas) return null;

    const rect =
      canvas.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return null;
    }

    const x =
      event.clientX -
      rect.left;

    const y =
      event.clientY -
      rect.top;

    const col =
      Math.round(
        (x -
          boardMetrics.padding) /
          boardMetrics.cell
      );

    const row =
      Math.round(
        (y -
          boardMetrics.padding) /
          boardMetrics.cell
      );

    if (
      !isInside(
        row,
        col
      )
    ) {
      return null;
    }

    const point =
      getBoardPoint(
        row,
        col
      );

    const distance =
      Math.hypot(
        point.x - x,
        point.y - y
      );

    if (
      distance >
      boardMetrics.cell *
        0.48
    ) {
      return null;
    }

    return {
      row,
      col
    };
  }


  function handleCanvasPointer(event) {
    event.preventDefault();

    if (
      gameOver ||
      aiThinking
    ) {
      return;
    }

    if (
      selectedMode === "ai" &&
      currentPlayer !== playerSide
    ) {
      return;
    }

    const cell =
      pointerToCell(event);

    if (!cell) return;

    playMove(
      cell.row,
      cell.col,
      currentPlayer
    );
  }


  function handleCanvasKeyboard(event) {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
    }
  }


  function drawBoard() {
    if (
      !canvas ||
      !ctx ||
      !boardMetrics.size
    ) {
      return;
    }

    const size =
      boardMetrics.size;

    ctx.clearRect(
      0,
      0,
      size,
      size
    );

    drawBoardBackground(
      size
    );

    drawGrid(
      size
    );

    drawStars();

    drawStones();

    drawWinningLine();
  }


  function drawBoardBackground(size) {
    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        size,
        size
      );

    gradient.addColorStop(
      0,
      "#f0dfb9"
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
      size,
      size
    );

    ctx.save();

    ctx.globalAlpha =
      0.07;

    for (
      let y = 0;
      y < size;
      y += 4
    ) {
      ctx.fillStyle =
        "#5d4a35";

      ctx.fillRect(
        0,
        y,
        size,
        1
      );
    }

    ctx.restore();
  }


  function drawGrid(size) {
    ctx.save();

    ctx.strokeStyle =
      CONFIG.COLORS.grid;

    ctx.lineWidth = 1;

    const start =
      boardMetrics.padding;

    const end =
      size -
      boardMetrics.padding;

    for (
      let i = 0;
      i < CONFIG.BOARD_SIZE;
      i++
    ) {
      const p =
        start +
        i *
          boardMetrics.cell;

      ctx.beginPath();

      ctx.moveTo(
        start,
        p
      );

      ctx.lineTo(
        end,
        p
      );

      ctx.stroke();

      ctx.beginPath();

      ctx.moveTo(
        p,
        start
      );

      ctx.lineTo(
        p,
        end
      );

      ctx.stroke();
    }

    ctx.restore();
  }


  function drawStars() {
    const points = [
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
      of points
    ) {
      const p =
        getBoardPoint(
          row,
          col
        );

      ctx.beginPath();

      ctx.arc(
        p.x,
        p.y,
        Math.max(
          2,
          boardMetrics.cell *
            0.08
        ),
        0,
        Math.PI * 2
      );

      ctx.fill();
    }

    ctx.restore();
  }


  function drawStones() {
    for (
      let row = 0;
      row < CONFIG.BOARD_SIZE;
      row++
    ) {
      for (
        let col = 0;
        col < CONFIG.BOARD_SIZE;
        col++
      ) {
        const player =
          board[row][col];

        if (
          player ===
          CONFIG.EMPTY
        ) {
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


  function drawStone(
    row,
    col,
    player
  ) {
    const p =
      getBoardPoint(
        row,
        col
      );

    const radius =
      boardMetrics.cell *
      0.42;

    ctx.save();

    if (
      player ===
      CONFIG.BLACK
    ) {
      const gradient =
        ctx.createRadialGradient(
          p.x -
            radius *
              0.35,
          p.y -
            radius *
              0.4,
          radius *
            0.08,
          p.x,
          p.y,
          radius
        );

      gradient.addColorStop(
        0,
        "#555"
      );

      gradient.addColorStop(
        0.35,
        CONFIG.COLORS.black
      );

      gradient.addColorStop(
        1,
        "#050505"
      );

      ctx.fillStyle =
        gradient;
    } else {
      const gradient =
        ctx.createRadialGradient(
          p.x -
            radius *
              0.35,
          p.y -
            radius *
              0.4,
          radius *
            0.08,
          p.x,
          p.y,
          radius
        );

      gradient.addColorStop(
        0,
        "#ffffff"
      );

      gradient.addColorStop(
        0.65,
        CONFIG.COLORS.white
      );

      gradient.addColorStop(
        1,
        CONFIG.COLORS.whiteShadow
      );

      ctx.fillStyle =
        gradient;
    }

    ctx.shadowColor =
      "rgba(0,0,0,.22)";

    ctx.shadowBlur =
      radius *
      0.28;

    ctx.shadowOffsetY =
      radius *
      0.12;

    ctx.beginPath();

    ctx.arc(
      p.x,
      p.y,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.shadowColor =
      "transparent";

    if (
      lastMove &&
      lastMove.row === row &&
      lastMove.col === col
    ) {
      ctx.strokeStyle =
        CONFIG.COLORS.lastMove;

      ctx.lineWidth =
        Math.max(
          2,
          radius * 0.12
        );

      ctx.beginPath();

      ctx.arc(
        p.x,
        p.y,
        radius *
          0.78,
        0,
        Math.PI * 2
      );

      ctx.stroke();
    }

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
      winningLine[0];

    const last =
      winningLine[
        winningLine.length - 1
      ];

    const p1 =
      getBoardPoint(
        first.row,
        first.col
      );

    const p2 =
      getBoardPoint(
        last.row,
        last.col
      );

    ctx.save();

    ctx.strokeStyle =
      CONFIG.COLORS.winning;

    ctx.lineWidth =
      Math.max(
        4,
        boardMetrics.cell *
          0.12
      );

    ctx.lineCap =
      "round";

    ctx.globalAlpha =
      0.9;

    ctx.beginPath();

    ctx.moveTo(
      p1.x,
      p1.y
    );

    ctx.lineTo(
      p2.x,
      p2.y
    );

    ctx.stroke();

    ctx.restore();
  }


  /* =========================================================
     GAME LOGIC
     ========================================================= */

  function playMove(
    row,
    col,
    player
  ) {
    if (
      gameOver ||
      board[row][col] !==
        CONFIG.EMPTY
    ) {
      return false;
    }

    board[row][col] =
      player;

    moveHistory.push({
      row,
      col,
      player
    });

    lastMove = {
      row,
      col,
      player
    };

    winningLine = [];

    playStoneSound();

    drawBoard();

    const line =
      findWinningLine(
        board,
        row,
        col,
        player
      );

    if (line) {
      winningLine =
        line;

      drawBoard();

      finishGame(
        getResultForWinner(
          player
        )
      );

      return true;
    }

    if (
      isBoardFull()
    ) {
      finishGame(
        "draw"
      );

      return true;
    }

    currentPlayer =
      opponent(player);

    saveCurrentGame();

    updateTurnUI();

    if (
      selectedMode === "ai" &&
      currentPlayer !==
        playerSide
    ) {
      requestAIMove();
    }

    return true;
  }


  function getResultForWinner(
    winner
  ) {
    if (
      selectedMode ===
      "local"
    ) {
      return winner ===
        CONFIG.BLACK
        ? "black"
        : "white";
    }

    return winner ===
      playerSide
      ? "win"
      : "loss";
  }


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
        const sign of
        [1, -1]
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
            !isInside(
              r,
              c
            ) ||
            currentBoard[r][c] !==
              player
          ) {
            break;
          }

          line.push({
            row: r,
            col: c
          });

          distance++;
        }
      }

      if (
        line.length >=
        CONFIG.WIN_LENGTH
      ) {
        line.sort(
          (a, b) =>
            a.row - b.row ||
            a.col - b.col
        );

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
     AI
     ========================================================= */

  function createWorker() {
    if (
      typeof Worker ===
      "undefined"
    ) {
      return null;
    }

    try {
      const instance =
        new Worker(
          CONFIG.AI_WORKER
        );

      instance.addEventListener(
        "message",
        handleAIMessage
      );

      instance.addEventListener(
        "error",
        handleAIError
      );

      return instance;
    } catch {
      return null;
    }
  }


  function requestAIMove() {
    if (
      gameOver ||
      aiThinking ||
      selectedMode !== "ai"
    ) {
      return;
    }

    const aiPlayer =
      opponent(
        playerSide
      );

    if (
      currentPlayer !==
      aiPlayer
    ) {
      return;
    }

    aiThinking = true;

    updateTurnUI();

    const ai =
      getSelectedAI();

    showOS(
      "thinking",
      ai
    );

    const requestId =
      ++workerRequestId;

    const thinkTime =
      randomInt(
        CONFIG.THINKING_MIN,
        CONFIG.THINKING_MAX
      );

    const workerConfig =
      getWorkerConfig();

    if (!worker) {
      worker =
        createWorker();
    }

    if (!worker) {
      fallbackAIMove(
        aiPlayer,
        thinkTime
      );

      return;
    }

    const payload = {
      board:
        cloneBoard(
          board
        ),

      player:
        aiPlayer,

      config:
        workerConfig,

      thinkTime,

      requestId
    };

    try {
      worker.postMessage(
        payload
      );
    } catch {
      fallbackAIMove(
        aiPlayer,
        thinkTime
      );
    }
  }


  function getWorkerConfig() {
    const ai =
      getSelectedAI();

    const difficulty =
      selectedDifficulty;

    const base =
      ai.worker;

    if (
      difficulty ===
      "easy"
    ) {
      return {
        depth: Math.min(
          1,
          base.depth
        ),
        radius: 2,
        randomTop:
          Math.max(
            2,
            base.randomTop
          )
      };
    }

    if (
      difficulty ===
      "hard"
    ) {
      return {
        depth: Math.min(
          3,
          Math.max(
            2,
            base.depth
          )
        ),
        radius: 2,
        randomTop:
          Math.min(
            1,
            base.randomTop
          )
      };
    }

    return {
      depth: base.depth,
      radius: base.radius,
      randomTop:
        base.randomTop
    };
  }


  function handleAIMessage(
    event
  ) {
    if (
      !aiThinking ||
      gameOver
    ) {
      return;
    }

    const data =
      event.data || {};

    const row =
      Number.isInteger(
        data.row
      )
        ? data.row
        : null;

    const col =
      Number.isInteger(
        data.col
      )
        ? data.col
        : null;

    const aiPlayer =
      opponent(
        playerSide
      );

    if (
      row === null ||
      col === null ||
      !isInside(
        row,
        col
      ) ||
      board[row][col] !==
        CONFIG.EMPTY
    ) {
      fallbackAIMove(
        aiPlayer,
        data.thinkTime ||
          CONFIG.THINKING_MIN
      );

      return;
    }

    const delay =
      Math.max(
        180,
        Number(
          data.thinkTime
        ) || 500
      );

    setTimeout(
      () => {
        if (
          gameOver ||
          !aiThinking
        ) {
          return;
        }

        aiThinking = false;

        const move =
          playMove(
            row,
            col,
            aiPlayer
          );

        if (!move) {
          fallbackAIMove(
            aiPlayer,
            180
          );

          return;
        }

        updateAIMessageAfterMove();

      },
      Math.min(
        delay,
        1400
      )
    );
  }


  function handleAIError() {
    if (
      gameOver ||
      !aiThinking
    ) {
      return;
    }

    fallbackAIMove(
      opponent(
        playerSide
      ),
      300
    );
  }


  function fallbackAIMove(
    player,
    delay
  ) {
    const candidates =
      getFallbackCandidates();

    if (
      !candidates.length
    ) {
      aiThinking = false;
      return;
    }

    const move =
      chooseFallbackMove(
        candidates,
        player
      );

    setTimeout(
      () => {
        if (
          gameOver ||
          !aiThinking
        ) {
          return;
        }

        aiThinking = false;

        playMove(
          move.row,
          move.col,
          player
        );

        updateAIMessageAfterMove();
      },
      Math.max(
        180,
        Math.min(
          900,
          delay || 350
        )
      )
    );
  }


  function getFallbackCandidates() {
    const occupied = [];

    for (
      let row = 0;
      row < CONFIG.BOARD_SIZE;
      row++
    ) {
      for (
        let col = 0;
        col < CONFIG.BOARD_SIZE;
        col++
      ) {
        if (
          board[row][col] !==
          CONFIG.EMPTY
        ) {
          occupied.push([
            row,
            col
          ]);
        }
      }
    }

    if (
      occupied.length ===
      0
    ) {
      return [
        {
          row: 7,
          col: 7
        }
      ];
    }

    const set =
      new Set();

    for (
      const [
        row,
        col
      ] of occupied
    ) {
      for (
        let dr = -2;
        dr <= 2;
        dr++
      ) {
        for (
          let dc = -2;
          dc <= 2;
          dc++
        ) {
          const r =
            row + dr;

          const c =
            col + dc;

          if (
            isInside(
              r,
              c
            ) &&
            board[r][c] ===
              CONFIG.EMPTY
          ) {
            set.add(
              `${r},${c}`
            );
          }
        }
      }
    }

    return [
      ...set
    ].map(
      key => {
        const [
          row,
          col
        ] =
          key
            .split(",")
            .map(Number);

        return {
          row,
          col
        };
      }
    );
  }


  function chooseFallbackMove(
    candidates,
    player
  ) {
    const enemy =
      opponent(player);

    /* Immediate win */
    for (
      const move of
      candidates
    ) {
      board[
        move.row
      ][
        move.col
      ] = player;

      const win =
        Boolean(
          findWinningLine(
            board,
            move.row,
            move.col,
            player
          )
        );

      board[
        move.row
      ][
        move.col
      ] =
        CONFIG.EMPTY;

      if (win) {
        return move;
      }
    }

    /* Immediate block */
    for (
      const move of
      candidates
    ) {
      board[
        move.row
      ][
        move.col
      ] = enemy;

      const win =
        Boolean(
          findWinningLine(
            board,
            move.row,
            move.col,
            enemy
          )
        );

      board[
        move.row
      ][
        move.col
      ] =
        CONFIG.EMPTY;

      if (win) {
        return move;
      }
    }

    /* Position score */
    let bestScore =
      -Infinity;

    let bestMoves = [];

    const center =
      (CONFIG.BOARD_SIZE - 1) /
      2;

    for (
      const move of
      candidates
    ) {
      const distance =
        Math.abs(
          move.row -
            center
        ) +
        Math.abs(
          move.col -
            center
        );

      const score =
        100 -
        distance * 5 +
        Math.random() *
          15;

      if (
        score >
        bestScore
      ) {
        bestScore =
          score;

        bestMoves = [
          move
        ];
      } else if (
        score ===
        bestScore
      ) {
        bestMoves.push(
          move
        );
      }
    }

    return (
      bestMoves[
        Math.floor(
          Math.random() *
            bestMoves.length
        )
      ] ||
      candidates[0]
    );
  }


  function updateAIMessageAfterMove() {
    if (gameOver) {
      return;
    }

    const ai =
      getSelectedAI();

    const category =
      analyzeLastAIMove();

    showOS(
      category,
      ai
    );
  }


  function analyzeLastAIMove() {
    if (!lastMove) {
      return "thinking";
    }

    const aiPlayer =
      opponent(
        playerSide
      );

    if (
      lastMove.player !==
      aiPlayer
    ) {
      return "thinking";
    }

    const danger =
      hasImmediateThreat(
        board,
        playerSide
      );

    if (danger) {
      return "defend";
    }

    return Math.random() >
      0.55
      ? "attack"
      : "thinking";
  }


  function hasImmediateThreat(
    currentBoard,
    player
  ) {
    for (
      let row = 0;
      row < CONFIG.BOARD_SIZE;
      row++
    ) {
      for (
        let col = 0;
        col < CONFIG.BOARD_SIZE;
        col++
      ) {
        if (
          currentBoard[row][col] !==
          CONFIG.EMPTY
        ) {
          continue;
        }

        currentBoard[row][col] =
          player;

        const win =
          Boolean(
            findWinningLine(
              currentBoard,
              row,
              col,
              player
            )
          );

        currentBoard[row][col] =
          CONFIG.EMPTY;

        if (win) {
          return true;
        }
      }
    }

    return false;
  }


  /* =========================================================
     AI PANEL
     ========================================================= */

  function createGamePanel() {
    if (
      !DOM.gameScreen
    ) {
      return;
    }

    const existing =
      document.querySelector(
        "#aiGamePanel"
      );

    if (existing) {
      existing.remove();
    }

    aiPanel =
      document.createElement(
        "aside"
      );

    aiPanel.id =
      "aiGamePanel";

    aiPanel.className =
      "ai-game-panel";

    aiPanel.innerHTML = `
      <div class="ai-panel-header">
        <span class="ai-panel-label">
          AI
        </span>

        <strong
          class="ai-panel-name"
          id="aiPanelName"
        >
          Sora
        </strong>
      </div>

      <div
        class="ai-panel-description"
        id="aiPanelDescription"
      >
        冷靜、平衡型
      </div>

      <div class="ai-os">
        <div class="ai-os-title">
          OS
        </div>

        <p
          class="ai-os-message"
          id="aiOSMessage"
        >
          等待你的第一步。
        </p>
      </div>

      <div class="ai-panel-stats">

        <div>
          <span>勝</span>
          <strong id="aiPanelWins">0</strong>
        </div>

        <div>
          <span>負</span>
          <strong id="aiPanelLosses">0</strong>
        </div>

      </div>
    `;

    const layout =
      DOM.gameScreen.querySelector(
        ".game-layout"
      );

    if (layout) {
      layout.appendChild(
        aiPanel
      );
    }

    updateAIPanel();
  }


  function updateAIPanel() {
    if (!aiPanel) {
      return;
    }

    if (
      selectedMode !==
      "ai"
    ) {
      aiPanel.hidden =
        true;

      return;
    }

    aiPanel.hidden =
      false;

    const ai =
      getSelectedAI();

    const language =
      settings.language;

    const name =
      ai.name[
        language
      ] ||
      ai.name["en"];

    const description =
      ai.description[
        language
      ] ||
      ai.description["en"];

    const wins =
      stats.ai[
        ai.id
      ]?.wins || 0;

    const losses =
      stats.ai[
        ai.id
      ]?.losses || 0;

    const nameElement =
      aiPanel.querySelector(
        "#aiPanelName"
      );

    const descriptionElement =
      aiPanel.querySelector(
        "#aiPanelDescription"
      );

    const winsElement =
      aiPanel.querySelector(
        "#aiPanelWins"
      );

    const lossesElement =
      aiPanel.querySelector(
        "#aiPanelLosses"
      );

    if (nameElement) {
      nameElement.textContent =
        name;
    }

    if (
      descriptionElement
    ) {
      descriptionElement.textContent =
        description;
    }

    if (winsElement) {
      winsElement.textContent =
        wins;
    }

    if (lossesElement) {
      lossesElement.textContent =
        losses;
    }
  }


  function showOS(
    category,
    ai
  ) {
    if (
      !aiPanel ||
      selectedMode !==
        "ai"
    ) {
      return;
    }

    const element =
      aiPanel.querySelector(
        "#aiOSMessage"
      );

    if (!element) {
      return;
    }

    const language =
      settings.language;

    const messages =
      ai.os[
        category
      ] ||
      ai.os.thinking;

    const message =
      messages[
        Math.floor(
          Math.random() *
            messages.length
        )
      ];

    element.textContent =
      message;

    if (
      settings.motion
    ) {
      element.animate(
        [
          {
            opacity: 0.35,
            transform:
              "translateY(3px)"
          },
          {
            opacity: 1,
            transform:
              "translateY(0)"
          }
        ],
        {
          duration: 220,
          easing:
            "ease-out"
        }
      );
    }
  }


  function getSelectedAI() {
    return (
      AI_CHARACTERS[
        selectedAI
      ] ||
      AI_CHARACTERS.sora
    );
  }


  /* =========================================================
     UNDO
     ========================================================= */

  function undoMove() {
    if (
      gameOver ||
      aiThinking ||
      !moveHistory.length
    ) {
      return;
    }

    if (
      selectedMode ===
      "local"
    ) {
      undoLocal();
    } else {
      undoAI();
    }

    winningLine = [];

    lastMove =
      moveHistory[
        moveHistory.length - 1
      ] || null;

    gameOver = false;

    aiThinking = false;

    drawBoard();

    updateTurnUI();

    saveCurrentGame();

    showToast(
      getText(
        "game.undo"
      )
    );
  }


  function undoLocal() {
    const move =
      moveHistory.pop();

    if (!move) return;

    board[
      move.row
    ][
      move.col
    ] =
      CONFIG.EMPTY;

    currentPlayer =
      move.player;
  }


  function undoAI() {
    /* Remove AI move first */
    const last =
      moveHistory[
        moveHistory.length - 1
      ];

    if (
      last &&
      last.player !==
        playerSide
    ) {
      board[
        last.row
      ][
        last.col
      ] =
        CONFIG.EMPTY;

      moveHistory.pop();
    }

    /* Remove player's move */
    const playerMove =
      moveHistory[
        moveHistory.length - 1
      ];

    if (
      playerMove &&
      playerMove.player ===
        playerSide
    ) {
      board[
        playerMove.row
      ][
        playerMove.col
      ] =
        CONFIG.EMPTY;

      moveHistory.pop();
    }

    currentPlayer =
      playerSide;
  }


  /* =========================================================
     GAME START
     ========================================================= */

  function startNewGame() {
    board =
      createBoard();

    moveHistory = [];

    winningLine = [];

    lastMove = null;

    gameOver = false;

    aiThinking = false;

    currentPlayer =
      CONFIG.BLACK;

    clearSavedGame();

    updateAIPanel();

    showScreen(
      "game"
    );

    resizeCanvas();

    updateTurnUI();

    drawBoard();

    saveCurrentGame();

    if (
      selectedMode ===
        "ai" &&
      playerSide ===
        CONFIG.WHITE
    ) {
      requestAIMove();
    }
  }


  /* =========================================================
     RESULT
     ========================================================= */

  function finishGame(
    result
  ) {
    gameOver = true;

    aiThinking = false;

    clearSavedGame();

    recordResult(
      result
    );

    updateStatsUI();

    updateAIPanel();

    renderResult(
      result
    );

    showScreen(
      "result"
    );
  }


  function recordResult(
    result
  ) {
    stats.total++;

    const record = {
      mode:
        selectedMode,

      ai:
        selectedAI,

      result,

      playerSide,

      date:
        new Date()
          .toLocaleString(
            settings.language ||
              "zh-TW"
          )
    };

    if (
      result ===
      "win"
    ) {
      stats.wins++;

      ensureAIStats();

      stats.ai[
        selectedAI
      ].losses++;
    }

    if (
      result ===
      "loss"
    ) {
      stats.losses++;

      ensureAIStats();

      stats.ai[
        selectedAI
      ].wins++;
    }

    if (
      result ===
      "draw"
    ) {
      stats.draws++;
    }

    stats.records.unshift(
      record
    );

    stats.records =
      stats.records.slice(
        0,
        50
      );

    saveStats();
  }


  function renderResult(
    result
  ) {
    if (!DOM.resultTitle) {
      return;
    }

    DOM.resultMark.className =
      "result-mark";

    if (
      result === "win"
    ) {
      DOM.resultMark.classList.add(
        "win"
      );

      DOM.resultKicker.textContent =
        "GOMOKU";

      DOM.resultTitle.textContent =
        getText(
          "records.wins"
        );

      DOM.resultDescription.textContent =
        getText(
          "result.again"
        );
    } else if (
      result === "loss"
    ) {
      DOM.resultMark.classList.add(
        "lose"
      );

      DOM.resultKicker.textContent =
        "GOMOKU";

      DOM.resultTitle.textContent =
        getText(
          "records.losses"
        );

      DOM.resultDescription.textContent =
        getText(
          "result.again"
        );
    } else if (
      result === "draw"
    ) {
      DOM.resultMark.classList.add(
        "draw"
      );

      DOM.resultKicker.textContent =
        "GOMOKU";

      DOM.resultTitle.textContent =
        getText(
          "records.draws"
        );

      DOM.resultDescription.textContent =
        getText(
          "result.again"
        );
    } else if (
      result === "black"
    ) {
      DOM.resultMark.classList.add(
        "win"
      );

      DOM.resultKicker.textContent =
        "GOMOKU";

      DOM.resultTitle.textContent =
        getText(
          "side.black"
        );
    } else {
      DOM.resultMark.classList.add(
        "win"
      );

      DOM.resultKicker.textContent =
        "GOMOKU";

      DOM.resultTitle.textContent =
        getText(
          "side.white"
        );
    }
  }


  /* =========================================================
     TURN UI
     ========================================================= */

  function updateTurnUI() {
    if (
      !DOM.turnPlayer
    ) {
      return;
    }

    const player =
      currentPlayer;

    DOM.turnPlayer.textContent =
      player ===
      CONFIG.BLACK
        ? getText(
            "side.black"
          )
        : getText(
            "side.white"
          );

    if (
      selectedMode ===
      "local"
    ) {
      DOM.turnLabel.textContent =
        player ===
        CONFIG.BLACK
          ? getLocalTurnText(
              "black"
            )
          : getLocalTurnText(
              "white"
            );
    } else {
      if (
        player ===
        playerSide
      ) {
        DOM.turnLabel.textContent =
          "你的回合";
      } else {
        DOM.turnLabel.textContent =
          getText(
            "game.thinking"
          );
      }
    }

    if (
      DOM.turnStone
    ) {
      DOM.turnStone.classList.toggle(
        "black-stone",
        player ===
          CONFIG.BLACK
      );

      DOM.turnStone.classList.toggle(
        "white-stone",
        player ===
          CONFIG.WHITE
      );
    }

    if (
      DOM.thinkingIndicator
    ) {
      DOM.thinkingIndicator.hidden =
        !aiThinking;
    }

    if (canvas) {
      canvas.style.cursor =
        gameOver ||
        aiThinking ||
        (
          selectedMode ===
            "ai" &&
          currentPlayer !==
            playerSide
        )
          ? "default"
          : "pointer";
    }
  }


  function getLocalTurnText(
    side
  ) {
    const language =
      settings.language;

    const map = {
      "zh-TW": {
        black: "黑棋回合",
        white: "白棋回合"
      },
      "zh-CN": {
        black: "黑棋回合",
        white: "白棋回合"
      },
      en: {
        black: "Black's turn",
        white: "White's turn"
      },
      ja: {
        black: "黒の番",
        white: "白の番"
      },
      ko: {
        black: "흑 차례",
        white: "백 차례"
      }
    };

    return (
      map[
        language
      ]?.[side] ||
      map.en[side]
    );
  }


  /* =========================================================
     SETUP
     ========================================================= */

  function setupGameControls() {

    DOM.modeControl?.addEventListener(
      "click",
      event => {
        const button =
          event.target.closest(
            "[data-mode]"
          );

        if (!button) {
          return;
        }

        selectedMode =
          button.dataset.mode ||
          "ai";

        document
          .querySelectorAll(
            "[data-mode]"
          )
          .forEach(
            item => {
              const active =
                item.dataset.mode ===
                selectedMode;

              item.classList.toggle(
                "selected",
                active
              );

              item.setAttribute(
                "aria-pressed",
                String(
                  active
                )
              );
            }
          );

        if (
          DOM.difficultyGroup
        ) {
          DOM.difficultyGroup.hidden =
            selectedMode !==
            "ai";
        }

        updateAIPanel();
      }
    );


    document
      .querySelectorAll(
        "[data-difficulty]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              selectedDifficulty =
                button.dataset
                  .difficulty ||
                "normal";

              document
                .querySelectorAll(
                  "[data-difficulty]"
                )
                .forEach(
                  item => {
                    item.classList.toggle(
                      "selected",
                      item ===
                        button
                    );

                    item.setAttribute(
                      "aria-pressed",
                      String(
                        item ===
                          button
                      )
                    );
                  }
                );
            }
          );
        }
      );


    document
      .querySelectorAll(
        "[data-side]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              playerSide =
                button.dataset
                  .side ===
                "white"
                  ? CONFIG.WHITE
                  : CONFIG.BLACK;

              document
                .querySelectorAll(
                  "[data-side]"
                )
                .forEach(
                  item => {
                    item.classList.toggle(
                      "selected",
                      item ===
                        button
                    );

                    item.setAttribute(
                      "aria-pressed",
                      String(
                        item ===
                          button
                      )
                    );
                  }
                );
            }
          );
        }
      );


    DOM.beginGameButton?.addEventListener(
      "click",
      startNewGame
    );
  }


  /* =========================================================
     NAVIGATION
     ========================================================= */

  function showScreen(
    name
  ) {
    const screens = {
      home:
        DOM.homeScreen,

      setup:
        DOM.setupScreen,

      game:
        DOM.gameScreen,

      result:
        DOM.resultScreen,

      records:
        DOM.recordsScreen,

      settings:
        DOM.settingsScreen
    };

    Object.entries(
      screens
    ).forEach(
      ([
        key,
        screen
      ]) => {
        if (!screen) {
          return;
        }

        screen.classList.toggle(
          "active",
          key === name
        );
      }
    );

    if (
      name ===
      "game"
    ) {
      requestAnimationFrame(
        resizeCanvas
      );
    }

    if (
      name ===
      "records"
    ) {
      renderStats();
    }
  }


  function setupNavigation() {
    DOM.startButton?.addEventListener(
      "click",
      () => {
        showScreen(
          "setup"
        );
      }
    );


    DOM.recordsButton?.addEventListener(
      "click",
      () => {
        renderStats();

        showScreen(
          "records"
        );
      }
    );


    DOM.settingsButton?.addEventListener(
      "click",
      () => {
        showScreen(
          "settings"
        );
      }
    );


    DOM.resumeButton?.addEventListener(
      "click",
      resumeGame
    );


    DOM.playAgainButton?.addEventListener(
      "click",
      startNewGame
    );


    DOM.resultHomeButton?.addEventListener(
      "click",
      () => {
        showScreen(
          "home"
        );

        checkResumeGame();
      }
    );


    DOM.gameMenuButton?.addEventListener(
      "click",
      () => {
        showScreen(
          "home"
        );

        checkResumeGame();
      }
    );


    DOM.restartButton?.addEventListener(
      "click",
      () => {
        startNewGame();
      }
    );


    DOM.undoButton?.addEventListener(
      "click",
      undoMove
    );


    const backButton =
      document.querySelector(
        "#backButton"
      );

    backButton?.addEventListener(
      "click",
      () => {
        if (
          DOM.gameScreen?.classList.contains(
            "active"
          )
        ) {
          showScreen(
            "home"
          );

          return;
        }

        if (
          DOM.setupScreen?.classList.contains(
            "active"
          )
        ) {
          showScreen(
            "home"
          );

          return;
        }

        showScreen(
          "home"
        );
      }
    );


    const menuButton =
      document.querySelector(
        "#menuButton"
      );

    menuButton?.addEventListener(
      "click",
      () => {
        showScreen(
          "settings"
        );
      }
    );
  }


  /* =========================================================
     STATS
     ========================================================= */

  function createDefaultStats() {
    const aiStats = {};

    Object.keys(
      AI_CHARACTERS
    ).forEach(
      id => {
        aiStats[id] = {
          wins: 0,
          losses: 0
        };
      }
    );

    return {
      total: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      ai: aiStats,
      records: []
    };
  }


  function loadStats() {
    const defaults =
      createDefaultStats();

    try {
      const raw =
        localStorage.getItem(
          CONFIG.STORAGE_KEY
        );

      if (!raw) {
        return defaults;
      }

      const parsed =
        JSON.parse(raw);

      return normalizeStats(
        parsed
      );
    } catch {
      return defaults;
    }
  }


  function normalizeStats(
    data
  ) {
    const defaults =
      createDefaultStats();

    const result = {
      ...defaults,
      ...data
    };

    result.ai =
      {
        ...defaults.ai,
        ...(data.ai || {})
      };

    Object.keys(
      AI_CHARACTERS
    ).forEach(
      id => {
        result.ai[id] = {
          wins:
            Number(
              result.ai[id]
                ?.wins
            ) || 0,

          losses:
            Number(
              result.ai[id]
                ?.losses
            ) || 0
        };
      }
    );

    result.records =
      Array.isArray(
        data.records
      )
        ? data.records.slice(
            0,
            50
          )
        : [];

    result.total =
      Number(
        result.total
      ) || 0;

    result.wins =
      Number(
        result.wins
      ) || 0;

    result.losses =
      Number(
        result.losses
      ) || 0;

    result.draws =
      Number(
        result.draws
      ) || 0;

    return result;
  }


  function ensureAIStats() {
    if (
      !stats.ai
    ) {
      stats.ai = {};
    }

    Object.keys(
      AI_CHARACTERS
    ).forEach(
      id => {
        if (
          !stats.ai[id]
        ) {
          stats.ai[id] = {
            wins: 0,
            losses: 0
          };
        }
      }
    );
  }


  function saveStats() {
    try {
      localStorage.setItem(
        CONFIG.STORAGE_KEY,
        JSON.stringify(
          stats
        )
      );
    } catch {}
  }


  function updateStatsUI() {
    if (
      DOM.statGames
    ) {
      DOM.statGames.textContent =
        stats.total;
    }

    if (
      DOM.statWins
    ) {
      DOM.statWins.textContent =
        stats.wins;
    }

    if (
      DOM.statLosses
    ) {
      DOM.statLosses.textContent =
        stats.losses;
    }

    if (
      DOM.statDraws
    ) {
      DOM.statDraws.textContent =
        stats.draws;
    }
  }


  function renderStats() {
    updateStatsUI();

    if (
      !DOM.recordList
    ) {
      return;
    }

    DOM.recordList.innerHTML =
      "";

    if (
      !stats.records.length
    ) {
      const empty =
        document.createElement(
          "div"
        );

      empty.style.opacity =
        "0.5";

      empty.style.padding =
        "20px 0";

      empty.textContent =
        "目前還沒有棋局記錄。";

      DOM.recordList.appendChild(
        empty
      );

      return;
    }

    stats.records.forEach(
      record => {
        const item =
          document.createElement(
            "div"
          );

        item.style.cssText =
          `
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          padding:12px 0;
          border-bottom:1px solid rgba(80,60,40,.1);
          `;

        const left =
          document.createElement(
            "div"
          );

        const title =
          document.createElement(
            "strong"
          );

        if (
          record.mode ===
          "local"
        ) {
          title.textContent =
            "雙人對戰";
        } else {
          const ai =
            AI_CHARACTERS[
              record.ai
            ] ||
            AI_CHARACTERS.sora;

          title.textContent =
            ai.name[
              settings.language
            ] ||
            ai.name.en;
        }

        const date =
          document.createElement(
            "div"
          );

        date.style.cssText =
          `
          font-size:11px;
          opacity:.5;
          margin-top:2px;
          `;

        date.textContent =
          record.date ||
          "";

        left.append(
          title,
          date
        );

        const result =
          document.createElement(
            "strong"
          );

        result.textContent =
          resultLabel(
            record.result
          );

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


  function resultLabel(
    result
  ) {
    const language =
      settings.language;

    const labels = {
      "zh-TW": {
        win: "勝利",
        loss: "失敗",
        draw: "和局",
        black: "黑棋勝",
        white: "白棋勝"
      },

      "zh-CN": {
        win: "胜利",
        loss: "失败",
        draw: "和局",
        black: "黑棋胜",
        white: "白棋胜"
      },

      en: {
        win: "Win",
        loss: "Loss",
        draw: "Draw",
        black: "Black wins",
        white: "White wins"
      },

      ja: {
        win: "勝ち",
        loss: "負け",
        draw: "引き分け",
        black: "黒の勝ち",
        white: "白の勝ち"
      },

      ko: {
        win: "승리",
        loss: "패배",
        draw: "무승부",
        black: "흑 승리",
        white: "백 승리"
      }
    };

    return (
      labels[
        language
      ]?.[result] ||
      labels.en[
        result
      ] ||
      result
    );
  }


  /* =========================================================
     RECORD CLEAR
     ========================================================= */

  function setupRecordControls() {
    DOM.clearRecordsButton?.addEventListener(
      "click",
      () => {
        const confirmed =
          window.confirm(
            "確定要清除所有棋局記錄嗎？"
          );

        if (!confirmed) {
          return;
        }

        stats =
          createDefaultStats();

        saveStats();

        renderStats();

        updateAIPanel();

        showToast(
          "棋局記錄已清除"
        );
      }
    );
  }


  /* =========================================================
     SETTINGS
     ========================================================= */

  function loadSettings() {
    const defaults = {
      language: "zh-TW",
      sound: true,
      motion: true,
      theme: "system"
    };

    try {
      const raw =
        localStorage.getItem(
          CONFIG.SETTINGS_KEY
        );

      if (!raw) {
        return defaults;
      }

      return {
        ...defaults,
        ...JSON.parse(raw)
      };
    } catch {
      return defaults;
    }
  }


  function saveSettings() {
    settings = {
      language:
        DOM.languageSelect
          ?.value ||
        "zh-TW",

      sound:
        DOM.soundToggle
          ?.checked ??
        true,

      motion:
        DOM.motionToggle
          ?.checked ??
        true,

      theme:
        DOM.themeSelect
          ?.value ||
        "system"
    };

    try {
      localStorage.setItem(
        CONFIG.SETTINGS_KEY,
        JSON.stringify(
          settings
        )
      );
    } catch {}

    applySettings();

    applyTranslations();

    updateAIPanel();

    updateTurnUI();

    renderStats();

    checkResumeGame();
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

    applyTheme();
  }


  function applyTheme() {
    if (
      settings.theme ===
      "system"
    ) {
      document.documentElement.removeAttribute(
        "data-theme"
      );

      return;
    }

    document.documentElement.setAttribute(
      "data-theme",
      settings.theme
    );
  }


  function applyTranslations() {
    const language =
      settings.language;

    document.documentElement.lang =
      language;

    const dictionary =
      I18N[
        language
      ] ||
      I18N["zh-TW"];

    document
      .querySelectorAll(
        "[data-i18n]"
      )
      .forEach(
        element => {
          const key =
            element.dataset
              .i18n;

          if (
            dictionary[key] !==
            undefined
          ) {
            element.textContent =
              dictionary[key];
          }
        }
      );
  }


  function getText(
    key
  ) {
    const dictionary =
      I18N[
        settings.language
      ] ||
      I18N["zh-TW"];

    return (
      dictionary[key] ||
      I18N["zh-TW"][key] ||
      key
    );
  }


  function setupSettingsControls() {
    DOM.languageSelect?.addEventListener(
      "change",
      saveSettings
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

    const data = {
      board,
      currentPlayer,
      selectedMode,
      selectedAI,
      selectedDifficulty,
      playerSide,
      moveHistory,
      lastMove,
      timestamp:
        Date.now()
    };

    try {
      localStorage.setItem(
        CONFIG.SAVE_KEY,
        JSON.stringify(
          data
        )
      );
    } catch {}

    checkResumeGame();
  }


  function clearSavedGame() {
    try {
      localStorage.removeItem(
        CONFIG.SAVE_KEY
      );
    } catch {}

    checkResumeGame();
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
          CONFIG.SAVE_KEY
        );

      if (!raw) {
        DOM.resumeCard.hidden =
          true;

        return;
      }

      const saved =
        JSON.parse(raw);

      if (
        !Array.isArray(
          saved.board
        ) ||
        !Array.isArray(
          saved.moveHistory
        ) ||
        !saved.moveHistory
          .length
      ) {
        DOM.resumeCard.hidden =
          true;

        return;
      }

      if (
        saved.mode ===
        "local"
      ) {
        DOM.resumeText.textContent =
          "雙人對戰";
      } else {
        const ai =
          AI_CHARACTERS[
            saved.selectedAI
          ] ||
          AI_CHARACTERS.sora;

        DOM.resumeText.textContent =
          `對戰 ${
            ai.name[
              settings.language
            ] ||
            ai.name.en
          }`;
      }

      DOM.resumeCard.hidden =
        false;

    } catch {
      DOM.resumeCard.hidden =
        true;
    }
  }


  function resumeGame() {
    try {
      const raw =
        localStorage.getItem(
          CONFIG.SAVE_KEY
        );

      if (!raw) {
        return;
      }

      const saved =
        JSON.parse(raw);

      if (
        !Array.isArray(
          saved.board
        ) ||
        saved.board.length !==
          CONFIG.BOARD_SIZE
      ) {
        return;
      }

      board =
        saved.board;

      currentPlayer =
        saved.currentPlayer ===
        CONFIG.WHITE
          ? CONFIG.WHITE
          : CONFIG.BLACK;

      selectedMode =
        saved.selectedMode ===
        "local"
          ? "local"
          : "ai";

      selectedAI =
        AI_CHARACTERS[
          saved.selectedAI
        ]
          ? saved.selectedAI
          : "sora";

      selectedDifficulty =
        [
          "easy",
          "normal",
          "hard"
        ].includes(
          saved.selectedDifficulty
        )
          ? saved.selectedDifficulty
          : "normal";

      playerSide =
        saved.playerSide ===
        CONFIG.WHITE
          ? CONFIG.WHITE
          : CONFIG.BLACK;

      moveHistory =
        Array.isArray(
          saved.moveHistory
        )
          ? saved.moveHistory
          : [];

      lastMove =
        saved.lastMove ||
        null;

      winningLine = [];

      gameOver = false;

      aiThinking = false;

      syncSetupUI();

      showScreen(
        "game"
      );

      requestAnimationFrame(
        () => {
          resizeCanvas();
          drawBoard();
          updateTurnUI();

          if (
            selectedMode ===
              "ai" &&
            currentPlayer !==
              playerSide
          ) {
            requestAIMove();
          }
        }
      );

    } catch {
      showToast(
        "無法恢復棋局"
      );
    }
  }


  function syncSetupUI() {
    document
      .querySelectorAll(
        "[data-mode]"
      )
      .forEach(
        button => {
          const active =
            button.dataset.mode ===
            selectedMode;

          button.classList.toggle(
            "selected",
            active
          );

          button.setAttribute(
            "aria-pressed",
            String(
              active
            )
          );
        }
      );

    document
      .querySelectorAll(
        "[data-difficulty]"
      )
      .forEach(
        button => {
          const active =
            button.dataset
              .difficulty ===
            selectedDifficulty;

          button.classList.toggle(
            "selected",
            active
          );

          button.setAttribute(
            "aria-pressed",
            String(
              active
            )
          );
        }
      );

    document
      .querySelectorAll(
        "[data-side]"
      )
      .forEach(
        button => {
          const side =
            button.dataset
              .side ===
            "white"
              ? CONFIG.WHITE
              : CONFIG.BLACK;

          const active =
            side ===
            playerSide;

          button.classList.toggle(
            "selected",
            active
          );

          button.setAttribute(
            "aria-pressed",
            String(
              active
            )
          );
        }
      );

    if (
      DOM.difficultyGroup
    ) {
      DOM.difficultyGroup.hidden =
        selectedMode !==
        "ai";
    }
  }


  /* =========================================================
     SOUND
     ========================================================= */

  function ensureAudio() {
    if (
      !settings.sound
    ) {
      return null;
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

      if (
        audioContext.state ===
        "suspended"
      ) {
        audioContext.resume();
      }

      return audioContext;
    } catch {
      return null;
    }
  }


  function playStoneSound() {
    const audio =
      ensureAudio();

    if (!audio) {
      return;
    }

    try {
      const oscillator =
        audio.createOscillator();

      const gain =
        audio.createGain();

      oscillator.type =
        "sine";

      oscillator.frequency.value =
        180;

      gain.gain.setValueAtTime(
        0.0001,
        audio.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.06,
        audio.currentTime +
          0.008
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audio.currentTime +
          0.09
      );

      oscillator.connect(
        gain
      );

      gain.connect(
        audio.destination
      );

      oscillator.start();

      oscillator.stop(
        audio.currentTime +
          0.1
      );

    } catch {}
  }


  /* =========================================================
     TOAST
     ========================================================= */

  function showToast(
    message
  ) {
    if (!DOM.toast) {
      return;
    }

    DOM.toast.textContent =
      message;

    DOM.toast.classList.add(
      "show"
    );

    clearTimeout(
      showToast.timer
    );

    showToast.timer =
      setTimeout(
        () => {
          DOM.toast.classList.remove(
            "show"
          );
        },
        1800
      );
  }


  /* =========================================================
     UTILITIES
     ========================================================= */

  function randomInt(
    min,
    max
  ) {
    return Math.floor(
      Math.random() *
        (
          max -
          min +
          1
        )
    ) + min;
  }


  function debounce(
    callback,
    delay
  ) {
    let timer = null;

    return (...args) => {
      clearTimeout(
        timer
      );

      timer =
        setTimeout(
          () => {
            callback(
              ...args
            );
          },
          delay
        );
    };
  }


  /* =========================================================
     INITIALIZATION
     ========================================================= */

  function initialize() {
    cacheDOM();

    applySettings();

    applyTranslations();

    setupCanvas();

    setupGameControls();

    setupNavigation();

    setupSettingsControls();

    setupRecordControls();

    updateStatsUI();

    renderStats();

    syncSetupUI();

    updateTurnUI();

    checkResumeGame();

    updateAIPanel();

    if (
      "serviceWorker" in
      navigator
    ) {
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

    window.addEventListener(
      "pageshow",
      () => {
        requestAnimationFrame(
          resizeCanvas
        );
      }
    );
  }


  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      {
        once: true
      }
    );
  } else {
    initialize();
  }

})();
