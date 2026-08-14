/* =========================================================
   GOMOKU
   Canvas Edition
   - Responsive Canvas Board
   - AI Characters
   - AI OS
   - Minimax / Alpha-Beta
   - Threat-aware evaluation
   - Records / Resume
   - i18n
   - Sound / Motion / Theme
   - Local multiplayer
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

    STORAGE_KEY: "gomoku-state-v2",
    SETTINGS_KEY: "gomoku-settings-v2",

    AI_THINK_MIN: 380,
    AI_THINK_MAX: 850,

    OS_MIN_INTERVAL: 2600,

    BOARD_PADDING_RATIO: 0.065,

    SEARCH: {
      easy: {
        depth: 1,
        candidates: 7
      },
      normal: {
        depth: 2,
        candidates: 10
      },
      hard: {
        depth: 3,
        candidates: 12
      }
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

      style: {
        "zh-TW": "防守型",
        "zh-CN": "防守型",
        en: "Defensive",
        ja: "守備型",
        ko: "수비형"
      },

      attack: 0.86,
      defense: 1.34,
      center: 1.00,
      threat: 1.22,
      randomness: 0.10,

      os: {
        thinking: [
          "嗯……先看看這裡。",
          "這一步要小心一點。",
          "慢慢來就好。"
        ],
        attack: [
          "這裡好像可以試試看。",
          "嗯，這個位置不錯。",
          "現在可以往前了。"
        ],
        defend: [
          "這裡先防守比較好。",
          "不能讓你繼續連下去。",
          "先把這裡補起來。"
        ],
        danger: [
          "欸……這裡有點危險。",
          "這一步不能大意。",
          "差一點就被你抓到了。"
        ],
        winning: [
          "好像快結束了。",
          "再一步看看。",
          "這局快要分出勝負了。"
        ],
        losing: [
          "還有機會。",
          "不能放棄。",
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

      style: {
        "zh-TW": "進攻型",
        "zh-CN": "进攻型",
        en: "Aggressive",
        ja: "攻撃型",
        ko: "공격형"
      },

      attack: 1.48,
      defense: 0.78,
      center: 1.15,
      threat: 1.48,
      randomness: 0.08,

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

      style: {
        "zh-TW": "均衡型",
        "zh-CN": "均衡型",
        en: "Balanced",
        ja: "バランス型",
        ko: "균형형"
      },

      attack: 1.10,
      defense: 1.10,
      center: 1.16,
      threat: 1.28,
      randomness: 0.04,

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

      style: {
        "zh-TW": "陷阱型",
        "zh-CN": "陷阱型",
        en: "Trap",
        ja: "罠型",
        ko: "함정형"
      },

      attack: 1.28,
      defense: 1.04,
      center: 0.96,
      threat: 1.62,
      randomness: 0.035,

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

      style: {
        "zh-TW": "反擊型",
        "zh-CN": "反击型",
        en: "Counter",
        ja: "反撃型",
        ko: "반격형"
      },

      attack: 1.08,
      defense: 1.42,
      center: 1.06,
      threat: 1.56,
      randomness: 0.018,

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

      style: {
        "zh-TW": "高手型",
        "zh-CN": "高手型",
        en: "Master",
        ja: "達人型",
        ko: "고수형"
      },

      attack: 1.34,
      defense: 1.34,
      center: 1.10,
      threat: 1.72,
      randomness: 0.005,

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
     TRANSLATIONS
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
      "records.draws": "平局",
      "records.clear": "清除記錄",

      "settings.title": "設定",
      "settings.language": "語言",
      "settings.languageDescription": "選擇介面語言",
      "settings.sound": "音效",
      "settings.soundDescription": "落子與遊戲音效",
      "settings.motion": "動畫",
      "settings.motionDescription": "啟用遊戲動畫",
      "settings.theme": "外觀",
      "settings.themeDescription": "使用系統外觀",

      "turn.your": "你的回合",
      "turn.ai": "AI 回合",
      "turn.black": "黑棋",
      "turn.white": "白棋",

      "result.win.kicker": "恭喜",
      "result.win.title": "你贏了",
      "result.win.description": "這一局下得很漂亮。",
      "result.loss.kicker": "這局結束了",
      "result.loss.title": "你輸了",
      "result.loss.description": "下一局再來。",
      "result.draw.kicker": "棋盤已滿",
      "result.draw.title": "平局",
      "result.draw.description": "沒有任何一方連成五子。",

      "record.win": "勝利",
      "record.loss": "失敗",
      "record.draw": "平局",

      "toast.cleared": "記錄已清除",
      "toast.noUndo": "目前沒有可以悔棋的步驟",
      "toast.gameStarted": "遊戲開始",
      "toast.resume": "已恢復上一局"
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
      "records.draws": "平局",
      "records.clear": "清除记录",

      "settings.title": "设置",
      "settings.language": "语言",
      "settings.languageDescription": "选择介面语言",
      "settings.sound": "音效",
      "settings.soundDescription": "落子与游戏音效",
      "settings.motion": "动画",
      "settings.motionDescription": "启用游戏动画",
      "settings.theme": "外观",
      "settings.themeDescription": "使用系统外观",

      "turn.your": "你的回合",
      "turn.ai": "AI 回合",
      "turn.black": "黑棋",
      "turn.white": "白棋",

      "result.win.kicker": "恭喜",
      "result.win.title": "你赢了",
      "result.win.description": "这一局下得很漂亮。",
      "result.loss.kicker": "这局结束了",
      "result.loss.title": "你输了",
      "result.loss.description": "下一局再来。",
      "result.draw.kicker": "棋盘已满",
      "result.draw.title": "平局",
      "result.draw.description": "没有任何一方连成五子。",

      "record.win": "胜利",
      "record.loss": "失败",
      "record.draw": "平局",

      "toast.cleared": "记录已清除",
      "toast.noUndo": "目前没有可以悔棋的步骤",
      "toast.gameStarted": "游戏开始",
      "toast.resume": "已恢复上一局"
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
      "setup.local": "Two Players",
      "setup.difficulty": "Difficulty",
      "setup.side": "Your Stone",
      "setup.begin": "Begin",

      "difficulty.easy": "Easy",
      "difficulty.easyDescription": "Good for a first game",
      "difficulty.normal": "Normal",
      "difficulty.normalDescription": "A serious opponent",
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
      "settings.languageDescription": "Choose interface language",
      "settings.sound": "Sound",
      "settings.soundDescription": "Game and stone sounds",
      "settings.motion": "Motion",
      "settings.motionDescription": "Enable game animations",
      "settings.theme": "Appearance",
      "settings.themeDescription": "Use system appearance",

      "turn.your": "Your Turn",
      "turn.ai": "AI Turn",
      "turn.black": "Black",
      "turn.white": "White",

      "result.win.kicker": "Congratulations",
      "result.win.title": "You Win",
      "result.win.description": "That was a beautiful game.",
      "result.loss.kicker": "Game Over",
      "result.loss.title": "You Lose",
      "result.loss.description": "Try again.",
      "result.draw.kicker": "Board Full",
      "result.draw.title": "Draw",
      "result.draw.description": "Nobody connected five stones.",

      "record.win": "Win",
      "record.loss": "Loss",
      "record.draw": "Draw",

      "toast.cleared": "Records cleared",
      "toast.noUndo": "There is nothing to undo",
      "toast.gameStarted": "Game started",
      "toast.resume": "Previous game restored"
    },

    ja: {
      "app.title": "五目並べ",
      "home.subtitle": "簡単なルール。でも、簡単な対局ではない。",
      "home.start": "ゲーム開始",
      "home.records": "記録",
      "home.settings": "設定",
      "home.resumeLabel": "未完了の対局",
      "home.resume": "続ける",

      "setup.title": "ゲーム開始",
      "setup.mode": "対戦方法",
      "setup.ai": "AI対戦",
      "setup.local": "二人対戦",
      "setup.difficulty": "難易度",
      "setup.side": "あなたの石",
      "setup.begin": "開始",

      "difficulty.easy": "初級",
      "difficulty.easyDescription": "初めて遊ぶ人向け",
      "difficulty.normal": "中級",
      "difficulty.normalDescription": "少し本気で",
      "difficulty.hard": "上級",
      "difficulty.hardDescription": "しっかり考えよう",

      "side.black": "黒",
      "side.white": "白",
      "side.first": "先手",
      "side.second": "後手",

      "game.thinking": "考え中",
      "game.undo": "待った",
      "game.restart": "最初から",
      "game.menu": "メニュー",

      "result.again": "もう一度",
      "result.home": "ホーム",

      "records.title": "対局記録",
      "records.games": "対局",
      "records.wins": "勝ち",
      "records.losses": "負け",
      "records.draws": "引き分け",
      "records.clear": "記録を消去",

      "settings.title": "設定",
      "settings.language": "言語",
      "settings.languageDescription": "表示言語を選択",
      "settings.sound": "サウンド",
      "settings.soundDescription": "ゲームと着手の音",
      "settings.motion": "アニメーション",
      "settings.motionDescription": "ゲームアニメーション",
      "settings.theme": "外観",
      "settings.themeDescription": "システム設定を使用",

      "turn.your": "あなたの番",
      "turn.ai": "AIの番",
      "turn.black": "黒",
      "turn.white": "白",

      "result.win.kicker": "おめでとう",
      "result.win.title": "あなたの勝ち",
      "result.win.description": "いい対局だったね。",
      "result.loss.kicker": "対局終了",
      "result.loss.title": "あなたの負け",
      "result.loss.description": "もう一局。",
      "result.draw.kicker": "盤面終了",
      "result.draw.title": "引き分け",
      "result.draw.description": "五連がありませんでした。",

      "record.win": "勝ち",
      "record.loss": "負け",
      "record.draw": "引き分け",

      "toast.cleared": "記録を消去しました",
      "toast.noUndo": "戻せる手がありません",
      "toast.gameStarted": "ゲーム開始",
      "toast.resume": "前の対局を復元しました"
    },

    ko: {
      "app.title": "오목",
      "home.subtitle": "간단한 규칙, 결코 간단하지 않은 게임.",
      "home.start": "게임 시작",
      "home.records": "기록",
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
      "difficulty.easyDescription": "처음 플레이하기 좋음",
      "difficulty.normal": "중급",
      "difficulty.normalDescription": "진지한 상대",
      "difficulty.hard": "고급",
      "difficulty.hardDescription": "신중하게 생각하기",

      "side.black": "흑",
      "side.white": "백",
      "side.first": "선공",
      "side.second": "후공",

      "game.thinking": "생각 중",
      "game.undo": "무르기",
      "game.restart": "다시 시작",
      "game.menu": "메뉴",

      "result.again": "다시 하기",
      "result.home": "홈",

      "records.title": "게임 기록",
      "records.games": "대국",
      "records.wins": "승리",
      "records.losses": "패배",
      "records.draws": "무승부",
      "records.clear": "기록 삭제",

      "settings.title": "설정",
      "settings.language": "언어",
      "settings.languageDescription": "표시 언어 선택",
      "settings.sound": "사운드",
      "settings.soundDescription": "게임 및 착수 소리",
      "settings.motion": "애니메이션",
      "settings.motionDescription": "게임 애니메이션 사용",
      "settings.theme": "화면",
      "settings.themeDescription": "시스템 설정 사용",

      "turn.your": "당신의 차례",
      "turn.ai": "AI 차례",
      "turn.black": "흑",
      "turn.white": "백",

      "result.win.kicker": "축하합니다",
      "result.win.title": "승리",
      "result.win.description": "멋진 대국이었어요.",
      "result.loss.kicker": "게임 종료",
      "result.loss.title": "패배",
      "result.loss.description": "다음 게임에서 다시 도전해요.",
      "result.draw.kicker": "판이 가득 찼어요",
      "result.draw.title": "무승부",
      "result.draw.description": "다섯 개를 연결한 사람이 없습니다.",

      "record.win": "승리",
      "record.loss": "패배",
      "record.draw": "무승부",

      "toast.cleared": "기록을 삭제했습니다",
      "toast.noUndo": "무를 수가 없습니다",
      "toast.gameStarted": "게임 시작",
      "toast.resume": "이전 게임을 복원했습니다"
    }
  };

  /* =========================================================
     STATE
     ========================================================= */

  let board = createBoard();
  let moves = [];

  let currentPlayer = CONFIG.BLACK;
  let gameOver = false;
  let aiThinking = false;

  let gameMode = "ai";
  let difficulty = "easy";

  let humanColor = CONFIG.BLACK;
  let aiColor = CONFIG.WHITE;

  let selectedAI = "sora";

  let winningLine = [];
  let lastMove = null;

  let language = "zh-TW";

  let settings = {
    sound: true,
    motion: true,
    theme: "system"
  };

  let records = loadRecords();

  let canvas;
  let ctx;

  let boardMetrics = {
    size: 0,
    padding: 0,
    cell: 0
  };

  let osElement = null;
  let aiBadgeElement = null;
  let aiPickerElement = null;

  let lastOSAt = 0;

  let audioContext = null;

  /* =========================================================
     DOM
     ========================================================= */

  const $ = selector =>
    document.querySelector(selector);

  const DOM = {
    screens: document.querySelectorAll(".screen"),

    homeScreen: $("#homeScreen"),
    setupScreen: $("#setupScreen"),
    gameScreen: $("#gameScreen"),
    resultScreen: $("#resultScreen"),
    recordsScreen: $("#recordsScreen"),
    settingsScreen: $("#settingsScreen"),

    startButton: $("#startButton"),
    recordsButton: $("#recordsButton"),
    settingsButton: $("#settingsButton"),

    resumeCard: $("#resumeCard"),
    resumeText: $("#resumeText"),
    resumeButton: $("#resumeButton"),

    beginGameButton: $("#beginGameButton"),

    modeControl: $("#modeControl"),
    difficultyGroup: $("#difficultyGroup"),

    boardCanvas: $("#boardCanvas"),

    turnStone: $("#turnStone"),
    turnLabel: $("#turnLabel"),
    turnPlayer: $("#turnPlayer"),
    thinkingIndicator: $("#thinkingIndicator"),

    undoButton: $("#undoButton"),
    restartButton: $("#restartButton"),
    gameMenuButton: $("#gameMenuButton"),

    resultMark: $("#resultMark"),
    resultKicker: $("#resultKicker"),
    resultTitle: $("#resultTitle"),
    resultDescription: $("#resultDescription"),

    playAgainButton: $("#playAgainButton"),
    resultHomeButton: $("#resultHomeButton"),

    statGames: $("#statGames"),
    statWins: $("#statWins"),
    statLosses: $("#statLosses"),
    statDraws: $("#statDraws"),
    recordList: $("#recordList"),
    clearRecordsButton: $("#clearRecordsButton"),

    languageSelect: $("#languageSelect"),
    soundToggle: $("#soundToggle"),
    motionToggle: $("#motionToggle"),
    themeSelect: $("#themeSelect"),

    backButton: $("#backButton"),
    menuButton: $("#menuButton"),

    toast: $("#toast")
  };

  /* =========================================================
     INIT
     ========================================================= */

  function init() {
    loadSettings();

    language =
      localStorage.getItem(
        "gomoku-language-v2"
      ) || "zh-TW";

    if (!I18N[language]) {
      language = "zh-TW";
    }

    setupCanvas();
    setupNavigation();
    setupSetupControls();
    setupGameControls();
    setupRecords();
    setupSettings();

    createAIUI();

    applySettings();
    applyLanguage();

    renderRecords();
    updateResumeCard();

    resetGameState(false);

    window.addEventListener(
      "resize",
      resizeCanvas,
      { passive: true }
    );

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener?.(
        "change",
        () => {
          if (settings.theme === "system") {
            applyTheme();
          }
        }
      );

    resizeCanvas();
  }

  /* =========================================================
     CANVAS
     ========================================================= */

  function setupCanvas() {
    canvas = DOM.boardCanvas;

    if (!canvas) {
      console.error(
        "Gomoku: #boardCanvas was not found."
      );
      return;
    }

    ctx = canvas.getContext("2d");

    canvas.addEventListener(
      "pointerdown",
      handleBoardPointer,
      { passive: false }
    );

    canvas.addEventListener(
      "keydown",
      handleBoardKeyboard
    );

    canvas.addEventListener(
      "pointermove",
      handleBoardHover,
      { passive: true }
    );

    canvas.addEventListener(
      "pointerleave",
      () => {
        canvas.dataset.hoverRow = "";
        canvas.dataset.hoverCol = "";
        drawBoard();
      },
      { passive: true }
    );
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return;

    const rect =
      canvas.getBoundingClientRect();

    const cssSize =
      Math.min(
        rect.width || 1,
        rect.height || rect.width || 1
      );

    const dpr =
      Math.min(
        window.devicePixelRatio || 1,
        3
      );

    canvas.width =
      Math.floor(cssSize * dpr);

    canvas.height =
      Math.floor(cssSize * dpr);

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    boardMetrics.size = cssSize;

    boardMetrics.padding =
      cssSize *
      CONFIG.BOARD_PADDING_RATIO;

    boardMetrics.cell =
      (
        cssSize -
        boardMetrics.padding * 2
      ) /
      (CONFIG.BOARD_SIZE - 1);

    drawBoard();
  }

  function drawBoard() {
    if (!ctx || !canvas) return;

    const size =
      boardMetrics.size;

    if (!size) return;

    ctx.clearRect(
      0,
      0,
      size,
      size
    );

    drawBoardSurface();
    drawGrid();
    drawStarPoints();
    drawWinningLine();
    drawStones();
    drawLastMove();
    drawHover();
  }

  function drawBoardSurface() {
    const size =
      boardMetrics.size;

    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        size,
        size
      );

    gradient.addColorStop(
      0,
      "#ead7b2"
    );

    gradient.addColorStop(
      0.5,
      "#e2c99a"
    );

    gradient.addColorStop(
      1,
      "#d5b77f"
    );

    ctx.fillStyle = gradient;

    roundedRect(
      ctx,
      0,
      0,
      size,
      size,
      Math.min(22, size * 0.04)
    );

    ctx.fill();

    ctx.save();

    ctx.globalAlpha = 0.07;

    for (
      let i = 0;
      i < 80;
      i++
    ) {
      const x =
        Math.random() * size;

      const y =
        Math.random() * size;

      const length =
        8 +
        Math.random() * 30;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + length,
        y +
          Math.sin(i) *
            1.5
      );

      ctx.strokeStyle =
        "#6d4d2f";

      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawGrid() {
    const p =
      boardMetrics.padding;

    const cell =
      boardMetrics.cell;

    const end =
      p +
      cell *
        (CONFIG.BOARD_SIZE - 1);

    ctx.save();

    ctx.strokeStyle =
      "rgba(68, 53, 38, 0.62)";

    ctx.lineWidth = 1;

    for (
      let i = 0;
      i < CONFIG.BOARD_SIZE;
      i++
    ) {
      const position =
        p + i * cell;

      ctx.beginPath();
      ctx.moveTo(
        position,
        p
      );
      ctx.lineTo(
        position,
        end
      );
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(
        p,
        position
      );
      ctx.lineTo(
        end,
        position
      );
      ctx.stroke();
    }

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
      "rgba(55, 43, 31, 0.72)";

    for (const [
      row,
      col
    ] of points) {
      const { x, y } =
        boardToCanvas(
          row,
          col
        );

      ctx.beginPath();

      ctx.arc(
        x,
        y,
        Math.max(
          2,
          boardMetrics.cell *
            0.075
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
          player === CONFIG.EMPTY
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
    const { x, y } =
      boardToCanvas(
        row,
        col
      );

    const radius =
      boardMetrics.cell *
      0.42;

    ctx.save();

    const shadowOffset =
      radius * 0.12;

    ctx.beginPath();

    ctx.arc(
      x + shadowOffset,
      y + shadowOffset,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "rgba(50, 37, 26, 0.22)";

    ctx.fill();

    const gradient =
      ctx.createRadialGradient(
        x -
          radius * 0.35,
        y -
          radius * 0.4,
        radius * 0.08,
        x,
        y,
        radius
      );

    if (
      player === CONFIG.BLACK
    ) {
      gradient.addColorStop(
        0,
        "#55565a"
      );

      gradient.addColorStop(
        0.42,
        "#222327"
      );

      gradient.addColorStop(
        1,
        "#090a0d"
      );
    } else {
      gradient.addColorStop(
        0,
        "#ffffff"
      );

      gradient.addColorStop(
        0.55,
        "#f0eee8"
      );

      gradient.addColorStop(
        1,
        "#c8c5bc"
      );
    }

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      gradient;

    ctx.fill();

    ctx.strokeStyle =
      player === CONFIG.BLACK
        ? "rgba(255,255,255,0.10)"
        : "rgba(50,45,38,0.14)";

    ctx.lineWidth =
      Math.max(
        0.7,
        boardMetrics.cell *
          0.015
      );

    ctx.stroke();

    ctx.restore();
  }

  function drawLastMove() {
    if (!lastMove) return;

    const { x, y } =
      boardToCanvas(
        lastMove.row,
        lastMove.col
      );

    const radius =
      boardMetrics.cell *
      0.48;

    ctx.save();

    ctx.strokeStyle =
      lastMove.player ===
      CONFIG.BLACK
        ? "rgba(255,255,255,0.82)"
        : "rgba(45,40,35,0.65)";

    ctx.lineWidth = 1.5;

    ctx.strokeRect(
      x - radius,
      y - radius,
      radius * 2,
      radius * 2
    );

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

    const start =
      boardToCanvas(
        first.row,
        first.col
      );

    const end =
      boardToCanvas(
        last.row,
        last.col
      );

    ctx.save();

    ctx.strokeStyle =
      "rgba(62, 122, 137, 0.92)";

    ctx.lineWidth =
      Math.max(
        3,
        boardMetrics.cell *
          0.12
      );

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

  function drawHover() {
    if (
      !canvas ||
      aiThinking ||
      gameOver
    ) {
      return;
    }

    const row =
      Number(
        canvas.dataset.hoverRow
      );

    const col =
      Number(
        canvas.dataset.hoverCol
      );

    if (
      !Number.isInteger(row) ||
      !Number.isInteger(col) ||
      !isInside(row, col) ||
      board[row][col] !== CONFIG.EMPTY
    ) {
      return;
    }

    const { x, y } =
      boardToCanvas(
        row,
        col
      );

    const radius =
      boardMetrics.cell *
      0.38;

    ctx.save();

    ctx.globalAlpha = 0.28;

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      currentPlayer ===
      CONFIG.BLACK
        ? "#17181c"
        : "#f7f5ee";

    ctx.fill();

    ctx.restore();
  }

  /* =========================================================
     BOARD INPUT
     ========================================================= */

  function handleBoardPointer(
    event
  ) {
    if (
      gameOver ||
      aiThinking
    ) {
      return;
    }

    event.preventDefault();

    const point =
      pointerToBoard(
        event
      );

    if (!point) return;

    playMove(
      point.row,
      point.col
    );
  }

  function handleBoardHover(
    event
  ) {
    if (!canvas) return;

    const point =
      pointerToBoard(
        event
      );

    if (!point) return;

    canvas.dataset.hoverRow =
      String(point.row);

    canvas.dataset.hoverCol =
      String(point.col);

    drawBoard();
  }

  function handleBoardKeyboard(
    event
  ) {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      const row =
        Number(
          canvas.dataset.hoverRow
        );

      const col =
        Number(
          canvas.dataset.hoverCol
        );

      if (
        Number.isInteger(row) &&
        Number.isInteger(col)
      ) {
        playMove(
          row,
          col
        );

        event.preventDefault();
      }
    }
  }

  function pointerToBoard(
    event
  ) {
    if (!canvas) return null;

    const rect =
      canvas.getBoundingClientRect();

    const x =
      event.clientX -
      rect.left;

    const y =
      event.clientY -
      rect.top;

    const p =
      boardMetrics.padding;

    const cell =
      boardMetrics.cell;

    const col =
      Math.round(
        (x - p) / cell
      );

    const row =
      Math.round(
        (y - p) / cell
      );

    if (
      !isInside(row, col)
    ) {
      return null;
    }

    return {
      row,
      col
    };
  }

  function boardToCanvas(
    row,
    col
  ) {
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

  /* =========================================================
     GAME FLOW
     ========================================================= */

  function startGame() {
    resetGameState(true);

    showScreen(
      "gameScreen"
    );

    saveResumeState();

    if (
      gameMode === "ai" &&
      currentPlayer === aiColor
    ) {
      runAITurn();
    } else {
      updateTurnUI();
    }
  }

  function resetGameState(
    clearResume = true
  ) {
    board = createBoard();
    moves = [];

    currentPlayer =
      CONFIG.BLACK;

    gameOver = false;
    aiThinking = false;

    winningLine = [];
    lastMove = null;

    if (clearResume) {
      clearResumeState();
    }

    updateTurnUI();
    drawBoard();
  }

  function playMove(
    row,
    col
  ) {
    if (
      gameOver ||
      aiThinking
    ) {
      return false;
    }

    if (
      !isInside(row, col) ||
      board[row][col] !==
        CONFIG.EMPTY
    ) {
      return false;
    }

    if (
      gameMode === "ai" &&
      currentPlayer !==
        humanColor
    ) {
      return false;
    }

    makeMove(
      row,
      col,
      currentPlayer
    );

    playStoneSound(
      currentPlayer
    );

    drawBoard();

    if (
      checkWin(
        row,
        col,
        currentPlayer
      )
    ) {
      finishGame(
        currentPlayer ===
          humanColor
          ? "win"
          : "loss"
      );

      return true;
    }

    if (isBoardFull()) {
      finishGame("draw");
      return true;
    }

    currentPlayer =
      otherColor(
        currentPlayer
      );

    saveResumeState();
    updateTurnUI();

    if (
      gameMode === "ai" &&
      currentPlayer === aiColor
    ) {
      runAITurn();
    }

    return true;
  }

  function makeMove(
    row,
    col,
    player
  ) {
    board[row][col] =
      player;

    const move = {
      row,
      col,
      player
    };

    moves.push(move);
    lastMove = move;
  }

  function undoMove() {
    if (
      gameOver ||
      aiThinking
    ) {
      return;
    }

    if (
      moves.length === 0
    ) {
      showToast(
        t("toast.noUndo")
      );

      return;
    }

    if (
      gameMode === "ai"
    ) {
      if (
        moves.length < 2
      ) {
        board[
          moves[0].row
        ][moves[0].col] =
          CONFIG.EMPTY;

        moves = [];
      } else {
        const aiMove =
          moves.pop();

        const playerMove =
          moves.pop();

        board[
          aiMove.row
        ][aiMove.col] =
          CONFIG.EMPTY;

        board[
          playerMove.row
        ][playerMove.col] =
          CONFIG.EMPTY;
      }

      currentPlayer =
        humanColor;
    } else {
      const move =
        moves.pop();

      board[
        move.row
      ][move.col] =
        CONFIG.EMPTY;

      currentPlayer =
        move.player;
    }

    lastMove =
      moves.length
        ? moves[
            moves.length - 1
          ]
        : null;

    winningLine = [];

    saveResumeState();
    updateTurnUI();
    drawBoard();
  }

  function restartGame() {
    resetGameState(true);
    showScreen(
      "gameScreen"
    );

    if (
      gameMode === "ai" &&
      currentPlayer === aiColor
    ) {
      runAITurn();
    }
  }

  /* =========================================================
     AI TURN
     ========================================================= */

  async function runAITurn() {
    if (
      gameOver ||
      gameMode !== "ai" ||
      currentPlayer !== aiColor
    ) {
      return;
    }

    aiThinking = true;

    updateTurnUI();

    const character =
      AI_CHARACTERS[
        selectedAI
      ];

    showAIOS(
      "thinking",
      false
    );

    const thinkDelay =
      randomBetween(
        CONFIG.AI_THINK_MIN,
        CONFIG.AI_THINK_MAX
      );

    await sleep(
      settings.motion
        ? thinkDelay
        : 120
    );

    if (gameOver) {
      aiThinking = false;
      return;
    }

    const move =
      findBestMove(
        aiColor,
        humanColor,
        character
      );

    if (!move) {
      aiThinking = false;
      finishGame("draw");
      return;
    }

    const osType =
      determineAIOS(
        move,
        character
      );

    showAIOS(
      osType,
      true
    );

    await sleep(
      settings.motion
        ? 180
        : 50
    );

    if (gameOver) {
      aiThinking = false;
      return;
    }

    makeMove(
      move.row,
      move.col,
      aiColor
    );

    playStoneSound(
      aiColor
    );

    drawBoard();

    if (
      checkWin(
        move.row,
        move.col,
        aiColor
      )
    ) {
      aiThinking = false;

      finishGame("loss");
      return;
    }

    if (isBoardFull()) {
      aiThinking = false;

      finishGame("draw");
      return;
    }

    currentPlayer =
      humanColor;

    aiThinking = false;

    saveResumeState();
    updateTurnUI();
    drawBoard();
  }

  /* =========================================================
     AI ENGINE
     ========================================================= */

  function findBestMove(
    ai,
    human,
    character
  ) {
    const searchConfig =
      CONFIG.SEARCH[
        difficulty
      ];

    const candidates =
      getCandidateMoves(
        ai,
        human,
        searchConfig.candidates
      );

    if (
      candidates.length === 0
    ) {
      return {
        row: 7,
        col: 7
      };
    }

    /* Immediate win */
    for (
      const move of candidates
    ) {
      board[
        move.row
      ][move.col] =
        ai;

      const win =
        checkWin(
          move.row,
          move.col,
          ai
        );

      board[
        move.row
      ][move.col] =
        CONFIG.EMPTY;

      if (win) {
        return move;
      }
    }

    /* Immediate block */
    for (
      const move of candidates
    ) {
      board[
        move.row
      ][move.col] =
        human;

      const win =
        checkWin(
          move.row,
          move.col,
          human
        );

      board[
        move.row
      ][move.col] =
        CONFIG.EMPTY;

      if (win) {
        return move;
      }
    }

    let bestScore =
      -Infinity;

    let bestMoves = [];

    for (
      const move of candidates
    ) {
      board[
        move.row
      ][move.col] =
        ai;

      const score =
        minimax(
          searchConfig.depth - 1,
          -Infinity,
          Infinity,
          false,
          ai,
          human,
          character
        );

      board[
        move.row
      ][move.col] =
        CONFIG.EMPTY;

      const noise =
        Math.random() *
        character.randomness *
        500;

      const finalScore =
        score + noise;

      if (
        finalScore >
        bestScore
      ) {
        bestScore =
          finalScore;

        bestMoves = [
          move
        ];
      } else if (
        Math.abs(
          finalScore -
            bestScore
        ) < 0.001
      ) {
        bestMoves.push(
          move
        );
      }
    }

    return bestMoves[
      Math.floor(
        Math.random() *
          bestMoves.length
      )
    ];
  }

  function minimax(
    depth,
    alpha,
    beta,
    maximizing,
    ai,
    human,
    character
  ) {
    if (
      depth <= 0
    ) {
      return evaluateBoard(
        ai,
        human,
        character
      );
    }

    const candidates =
      getCandidateMoves(
        maximizing
          ? ai
          : human,
        maximizing
          ? human
          : ai,
        Math.min(
          8,
          CONFIG.SEARCH[
            difficulty
          ].candidates
        )
      );

    if (
      candidates.length === 0
    ) {
      return 0;
    }

    if (maximizing) {
      let value =
        -Infinity;

      for (
        const move of candidates
      ) {
        board[
          move.row
        ][move.col] =
          ai;

        if (
          checkWin(
            move.row,
            move.col,
            ai
          )
        ) {
          board[
            move.row
          ][move.col] =
            CONFIG.EMPTY;

          return 9000000 +
            depth *
              100000;
        }

        value =
          Math.max(
            value,
            minimax(
              depth - 1,
              alpha,
              beta,
              false,
              ai,
              human,
              character
            )
          );

        board[
          move.row
        ][move.col] =
          CONFIG.EMPTY;

        alpha =
          Math.max(
            alpha,
            value
          );

        if (
          beta <= alpha
        ) {
          break;
        }
      }

      return value;
    }

    let value =
      Infinity;

    for (
      const move of candidates
    ) {
      board[
        move.row
      ][move.col] =
        human;

      if (
        checkWin(
          move.row,
          move.col,
          human
        )
      ) {
        board[
          move.row
        ][move.col] =
          CONFIG.EMPTY;

        return -9000000 -
          depth *
            100000;
      }

      value =
        Math.min(
          value,
          minimax(
            depth - 1,
            alpha,
            beta,
            true,
            ai,
            human,
            character
          )
        );

      board[
        move.row
      ][move.col] =
        CONFIG.EMPTY;

      beta =
        Math.min(
          beta,
          value
        );

      if (
        beta <= alpha
      ) {
        break;
      }
    }

    return value;
  }

  function getCandidateMoves(
    attacker,
    defender,
    limit
  ) {
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
          occupied.push({
            row,
            col
          });
        }
      }
    }

    if (
      occupied.length === 0
    ) {
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
        let dr = -2;
        dr <= 2;
        dr++
      ) {
        for (
          let dc = -2;
          dc <= 2;
          dc++
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
            CONFIG.EMPTY
          ) {
            continue;
          }

          const key =
            `${row},${col}`;

          if (
            !map.has(key)
          ) {
            map.set(
              key,
              {
                row,
                col
              }
            );
          }
        }
      }
    }

    const candidates =
      [...map.values()];

    candidates.sort(
      (a, b) => {
        const scoreA =
          quickMoveScore(
            a.row,
            a.col,
            attacker,
            defender
          );

        const scoreB =
          quickMoveScore(
            b.row,
            b.col,
            attacker,
            defender
          );

        return (
          scoreB -
          scoreA
        );
      }
    );

    return candidates.slice(
      0,
      limit
    );
  }

  function quickMoveScore(
    row,
    col,
    attacker,
    defender
  ) {
    let score = 0;

    score +=
      centerScore(
        row,
        col
      ) * 4;

    board[row][col] =
      attacker;

    score +=
      patternPotential(
        row,
        col,
        attacker
      ) * 1.2;

    board[row][col] =
      defender;

    score +=
      patternPotential(
        row,
        col,
        defender
      ) * 1.05;

    board[row][col] =
      CONFIG.EMPTY;

    return score;
  }

  function evaluateBoard(
    ai,
    human,
    character
  ) {
    let score = 0;

    score +=
      evaluatePlayer(
        ai,
        character
      ) *
      character.attack;

    score -=
      evaluatePlayer(
        human,
        character
      ) *
      character.defense;

    return score;
  }

  function evaluatePlayer(
    player,
    character
  ) {
    let score = 0;

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
          player
        ) {
          continue;
        }

        score +=
          centerScore(
            row,
            col
          ) *
          character.center;

        score +=
          evaluateLine(
            row,
            col,
            0,
            1,
            player
          );

        score +=
          evaluateLine(
            row,
            col,
            1,
            0,
            player
          );

        score +=
          evaluateLine(
            row,
            col,
            1,
            1,
            player
          );

        score +=
          evaluateLine(
            row,
            col,
            1,
            -1,
            player
          );
      }
    }

    return score;
  }

  function evaluateLine(
    row,
    col,
    dr,
    dc,
    player
  ) {
    let count = 0;
    let open = 0;

    for (
      let i = -4;
      i <= 4;
      i++
    ) {
      const r =
        row + dr * i;

      const c =
        col + dc * i;

      if (
        !isInside(r, c)
      ) {
        continue;
      }

      if (
        board[r][c] ===
        player
      ) {
        count++;
      }
    }

    const before =
      getCell(
        row - dr,
        col - dc
      );

    const after =
      getCell(
        row + dr * 5,
        col + dc * 5
      );

    if (
      before === CONFIG.EMPTY
    ) {
      open++;
    }

    if (
      after === CONFIG.EMPTY
    ) {
      open++;
    }

    if (
      count >= 5
    ) {
      return 1000000;
    }

    if (
      count === 4 &&
      open === 2
    ) {
      return 120000;
    }

    if (
      count === 4 &&
      open === 1
    ) {
      return 15000;
    }

    if (
      count === 3 &&
      open === 2
    ) {
      return 4200;
    }

    if (
      count === 3 &&
      open === 1
    ) {
      return 900;
    }

    if (
      count === 2 &&
      open === 2
    ) {
      return 220;
    }

    if (
      count === 2 &&
      open === 1
    ) {
      return 80;
    }

    if (
      count === 1 &&
      open === 2
    ) {
      return 12;
    }

    return 0;
  }

  function patternPotential(
    row,
    col,
    player
  ) {
    let total = 0;

    const directions = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1]
    ];

    for (
      const [
        dr,
        dc
      ] of directions
    ) {
      let count = 1;
      let open = 0;

      let r =
        row + dr;

      let c =
        col + dc;

      while (
        isInside(r, c) &&
        board[r][c] ===
          player
      ) {
        count++;

        r += dr;
        c += dc;
      }

      if (
        isInside(r, c) &&
        board[r][c] ===
          CONFIG.EMPTY
      ) {
        open++;
      }

      r =
        row - dr;

      c =
        col - dc;

      while (
        isInside(r, c) &&
        board[r][c] ===
          player
      ) {
        count++;

        r -= dr;
        c -= dc;
      }

      if (
        isInside(r, c) &&
        board[r][c] ===
          CONFIG.EMPTY
      ) {
        open++;
      }

      if (
        count >= 5
      ) {
        total += 1000000;
      } else if (
        count === 4 &&
        open === 2
      ) {
        total += 100000;
      } else if (
        count === 4 &&
        open === 1
      ) {
        total += 12000;
      } else if (
        count === 3 &&
        open === 2
      ) {
        total += 4000;
      } else if (
        count === 3 &&
        open === 1
      ) {
        total += 700;
      } else if (
        count === 2 &&
        open === 2
      ) {
        total += 180;
      }
    }

    return total;
  }

  /* =========================================================
     AI OS
     ========================================================= */

  function createAIUI() {
    const gameStatus =
      document.querySelector(
        ".game-status"
      );

    if (!gameStatus) {
      return;
    }

    if (!document.querySelector(
      "#aiCharacterPanel"
    )) {
      const panel =
        document.createElement(
          "div"
        );

      panel.id =
        "aiCharacterPanel";

      panel.className =
        "ai-character-panel";

      gameStatus.appendChild(
        panel
      );
    }

    aiBadgeElement =
      document.createElement(
        "div"
      );

    aiBadgeElement.id =
      "aiCharacterBadge";

    aiBadgeElement.className =
      "ai-character-badge";

    aiBadgeElement.innerHTML = `
      <span class="ai-character-name"></span>
      <span class="ai-character-style"></span>
    `;

    const panel =
      document.querySelector(
        "#aiCharacterPanel"
      );

    panel.appendChild(
      aiBadgeElement
    );

    osElement =
      document.createElement(
        "div"
      );

    osElement.id =
      "aiOS";

    osElement.className =
      "ai-os";

    panel.appendChild(
      osElement
    );

    injectDynamicStyles();

    updateAIUI();

    createAIPicker();
  }

  function createAIPicker() {
    const group =
      DOM.difficultyGroup;

    if (!group) return;

    if (
      document.querySelector(
        "#aiCharacterGroup"
      )
    ) {
      return;
    }

    const wrapper =
      document.createElement(
        "div"
      );

    wrapper.id =
      "aiCharacterGroup";

    wrapper.className =
      "settings-group ai-character-group";

    wrapper.innerHTML = `
      <h3>${escapeHTML(
        aiLabel()
      )}</h3>
      <div class="ai-picker-grid"></div>
    `;

    group.after(wrapper);

    aiPickerElement =
      wrapper.querySelector(
        ".ai-picker-grid"
      );

    renderAIPicker();
  }

  function renderAIPicker() {
    if (!aiPickerElement) {
      return;
    }

    aiPickerElement.innerHTML = "";

    Object.values(
      AI_CHARACTERS
    ).forEach(
      character => {
        const button =
          document.createElement(
            "button"
          );

        button.type = "button";

        button.className =
          "ai-picker-card";

        if (
          character.id ===
          selectedAI
        ) {
          button.classList.add(
            "selected"
          );
        }

        button.dataset.ai =
          character.id;

        button.innerHTML = `
          <strong>${escapeHTML(
            character.name[
              language
            ] ||
              character.name[
                "zh-TW"
              ]
          )}</strong>
          <span>${escapeHTML(
            character.style[
              language
            ] ||
              character.style[
                "zh-TW"
              ]
          )}</span>
        `;

        button.addEventListener(
          "click",
          () => {
            selectedAI =
              character.id;

            renderAIPicker();
            updateAIUI();
          }
        );

        aiPickerElement.appendChild(
          button
        );
      }
    );
  }

  function updateAIUI() {
    if (!aiBadgeElement) {
      return;
    }

    const character =
      AI_CHARACTERS[
        selectedAI
      ];

    if (!character) {
      return;
    }

    const name =
      character.name[
        language
      ] ||
      character.name[
        "zh-TW"
      ];

    const style =
      character.style[
        language
      ] ||
      character.style[
        "zh-TW"
      ];

    const nameElement =
      aiBadgeElement.querySelector(
        ".ai-character-name"
      );

    const styleElement =
      aiBadgeElement.querySelector(
        ".ai-character-style"
      );

    if (nameElement) {
      nameElement.textContent =
        name;
    }

    if (styleElement) {
      styleElement.textContent =
        style;
    }
  }

  function showAIOS(
    type,
    important
  ) {
    if (!osElement) return;

    const now =
      Date.now();

    if (
      !important &&
      now - lastOSAt <
        CONFIG.OS_MIN_INTERVAL
    ) {
      return;
    }

    const character =
      AI_CHARACTERS[
        selectedAI
      ];

    if (!character) return;

    let chance =
      important
        ? 0.85
        : 0.32;

    if (
      type === "danger"
    ) {
      chance = 0.82;
    }

    if (
      type === "surprise"
    ) {
      chance = 1;
    }

    if (
      Math.random() >
      chance
    ) {
      return;
    }

    const pool =
      character.os[
        type
      ] ||
      character.os.thinking;

    if (!pool?.length) {
      return;
    }

    const text =
      pool[
        Math.floor(
          Math.random() *
            pool.length
        )
      ];

    lastOSAt = now;

    osElement.classList.remove(
      "visible"
    );

    if (settings.motion) {
      requestAnimationFrame(
        () => {
          osElement.textContent =
            text;

          osElement.classList.add(
            "visible"
          );
        }
      );
    } else {
      osElement.textContent =
        text;

      osElement.classList.add(
        "visible"
      );
    }
  }

  function determineAIOS(
    move
  ) {
    const aiWinning =
      wouldWin(
        move.row,
        move.col,
        aiColor
      );

    if (aiWinning) {
      return "winning";
    }

    const opponentThreats =
      countWinningMoves(
        humanColor
      );

    if (
      opponentThreats >= 2
    ) {
      return "danger";
    }

    const aiThreats =
      countWinningMoves(
        aiColor
      );

    if (
      aiThreats > 0
    ) {
      return "attack";
    }

    if (
      opponentThreats > 0
    ) {
      return "defend";
    }

    if (
      Math.random() <
      0.08
    ) {
      return "surprise";
    }

    return "thinking";
  }

  /* =========================================================
     RESULT
     ========================================================= */

  function finishGame(
    result
  ) {
    gameOver = true;
    aiThinking = false;

    clearResumeState();

    let winner = null;

    if (result === "win") {
      winner = humanColor;
    }

    if (result === "loss") {
      winner = aiColor;
    }

    if (winner) {
      winningLine =
        findWinningLine(
          winner
        );
    }

    if (
      result === "win"
    ) {
      records.wins++;
    } else if (
      result === "loss"
    ) {
      records.losses++;
    } else {
      records.draws++;
    }

    records.games++;

    records.ai[
      selectedAI
    ] ??= {
      wins: 0,
      losses: 0,
      draws: 0
    };

    if (
      result === "win"
    ) {
      records.ai[
        selectedAI
      ].losses++;
    } else if (
      result === "loss"
    ) {
      records.ai[
        selectedAI
      ].wins++;
    } else {
      records.ai[
        selectedAI
      ].draws++;
    }

    addRecord(
      result
    );

    saveRecords();
    renderRecords();

    drawBoard();

    if (
      result === "win"
    ) {
      showAIOS(
        "losing",
        true
      );
    } else if (
      result === "loss"
    ) {
      showAIOS(
        "winning",
        true
      );
    }

    showResult(
      result
    );
  }

  function showResult(
    result
  ) {
    if (
      result === "win"
    ) {
      DOM.resultKicker.textContent =
        t(
          "result.win.kicker"
        );

      DOM.resultTitle.textContent =
        t(
          "result.win.title"
        );

      DOM.resultDescription.textContent =
        t(
          "result.win.description"
        );

      DOM.resultMark.className =
        "result-mark win";
    }

    if (
      result === "loss"
    ) {
      DOM.resultKicker.textContent =
        t(
          "result.loss.kicker"
        );

      DOM.resultTitle.textContent =
        t(
          "result.loss.title"
        );

      DOM.resultDescription.textContent =
        t(
          "result.loss.description"
        );

      DOM.resultMark.className =
        "result-mark loss";
    }

    if (
      result === "draw"
    ) {
      DOM.resultKicker.textContent =
        t(
          "result.draw.kicker"
        );

      DOM.resultTitle.textContent =
        t(
          "result.draw.title"
        );

      DOM.resultDescription.textContent =
        t(
          "result.draw.description"
        );

      DOM.resultMark.className =
        "result-mark draw";
    }

    showScreen(
      "resultScreen"
    );
  }

  /* =========================================================
     WIN CHECK
     ========================================================= */

  function checkWin(
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
      const [
        dr,
        dc
      ] of directions
    ) {
      let line = [
        {
          row,
          col
        }
      ];

      line =
        line.concat(
          collectDirection(
            row,
            col,
            dr,
            dc,
            player
          )
        );

      line =
        line.concat(
          collectDirection(
            row,
            col,
            -dr,
            -dc,
            player
          )
        );

      if (
        line.length >=
        CONFIG.WIN_LENGTH
      ) {
        winningLine =
          line;

        return true;
      }
    }

    return false;
  }

  function findWinningLine(
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
          board[row][col] !==
          player
        ) {
          continue;
        }

        const directions = [
          [1, 0],
          [0, 1],
          [1, 1],
          [1, -1]
        ];

        for (
          const [
            dr,
            dc
          ] of directions
        ) {
          const line = [
            {
              row,
              col
            }
          ];

          let r =
            row + dr;

          let c =
            col + dc;

          while (
            isInside(r, c) &&
            board[r][c] ===
              player
          ) {
            line.push({
              row: r,
              col: c
            });

            r += dr;
            c += dc;
          }

          if (
            line.length >=
            CONFIG.WIN_LENGTH
          ) {
            return line.slice(
              0,
              CONFIG.WIN_LENGTH
            );
          }
        }
      }
    }

    return [];
  }

  function collectDirection(
    row,
    col,
    dr,
    dc,
    player
  ) {
    const result = [];

    let r =
      row + dr;

    let c =
      col + dc;

    while (
      isInside(r, c) &&
      board[r][c] ===
        player
    ) {
      result.push({
        row: r,
        col: c
      });

      r += dr;
      c += dc;
    }

    return result;
  }

  function wouldWin(
    row,
    col,
    player
  ) {
    if (
      !isInside(row, col) ||
      board[row][col] !==
        CONFIG.EMPTY
    ) {
      return false;
    }

    board[row][col] =
      player;

    const result =
      checkWin(
        row,
        col,
        player
      );

    board[row][col] =
      CONFIG.EMPTY;

    winningLine = [];

    return result;
  }

  function countWinningMoves(
    player
  ) {
    let count = 0;

    const candidates =
      getCandidateMoves(
        player,
        otherColor(player),
        30
      );

    for (
      const move of candidates
    ) {
      if (
        wouldWin(
          move.row,
          move.col,
          player
        )
      ) {
        count++;
      }

      if (
        count >= 2
      ) {
        break;
      }
    }

    return count;
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
     TURN UI
     ========================================================= */

  function updateTurnUI() {
    if (
      !DOM.turnPlayer ||
      !DOM.turnLabel ||
      !DOM.turnStone
    ) {
      return;
    }

    const player =
      currentPlayer;

    DOM.turnPlayer.textContent =
      player === CONFIG.BLACK
        ? t("turn.black")
        : t("turn.white");

    if (
      gameMode === "ai"
    ) {
      DOM.turnLabel.textContent =
        player === humanColor
          ? t("turn.your")
          : t("turn.ai");
    } else {
      DOM.turnLabel.textContent =
        player === CONFIG.BLACK
          ? t("turn.black")
          : t("turn.white");
    }

    DOM.turnStone.className =
      "status-stone " +
      (
        player === CONFIG.BLACK
          ? "black-stone"
          : "white-stone"
      );

    if (
      DOM.thinkingIndicator
    ) {
      DOM.thinkingIndicator.hidden =
        !aiThinking;
    }

    updateAIUI();
  }

  /* =========================================================
     NAVIGATION
     ========================================================= */

  function setupNavigation() {
    DOM.startButton?.addEventListener(
      "click",
      () => {
        showScreen(
          "setupScreen"
        );
      }
    );

    DOM.recordsButton?.addEventListener(
      "click",
      () => {
        renderRecords();
        showScreen(
          "recordsScreen"
        );
      }
    );

    DOM.settingsButton?.addEventListener(
      "click",
      () => {
        showScreen(
          "settingsScreen"
        );
      }
    );

    DOM.resumeButton?.addEventListener(
      "click",
      resumeGame
    );

    DOM.backButton?.addEventListener(
      "click",
      () => {
        showScreen(
          "homeScreen"
        );
      }
    );

    DOM.menuButton?.addEventListener(
      "click",
      () => {
        showScreen(
          "homeScreen"
        );
      }
    );

    DOM.gameMenuButton?.addEventListener(
      "click",
      () => {
        showScreen(
          "homeScreen"
        );
      }
    );

    DOM.resultHomeButton?.addEventListener(
      "click",
      () => {
        showScreen(
          "homeScreen"
        );
      }
    );

    DOM.playAgainButton?.addEventListener(
      "click",
      () => {
        resetGameState(true);

        showScreen(
          "gameScreen"
        );

        if (
          gameMode === "ai" &&
          currentPlayer === aiColor
        ) {
          runAITurn();
        }
      }
    );
  }

  function showScreen(
    id
  ) {
    DOM.screens.forEach(
      screen => {
        screen.classList.toggle(
          "active",
          screen.id === id
        );
      }
    );

    if (
      id === "gameScreen"
    ) {
      requestAnimationFrame(
        () => {
          resizeCanvas();
          drawBoard();
        }
      );
    }

    if (
      id === "recordsScreen"
    ) {
      renderRecords();
    }

    if (
      id === "settingsScreen"
    ) {
      syncSettingsControls();
    }
  }

  /* =========================================================
     SETUP
     ========================================================= */

  function setupSetupControls() {
    DOM.modeControl?.querySelectorAll(
      "[data-mode]"
    ).forEach(
      button => {
        button.addEventListener(
          "click",
          () => {
            gameMode =
              button.dataset.mode;

            DOM.modeControl
              .querySelectorAll(
                "[data-mode]"
              )
              .forEach(
                item =>
                  item.classList.toggle(
                    "selected",
                    item ===
                      button
                  )
              );

            if (
              DOM.difficultyGroup
            ) {
              DOM.difficultyGroup.hidden =
                gameMode !==
                "ai";
            }

            if (
              document.querySelector(
                "#aiCharacterGroup"
              )
            ) {
              document.querySelector(
                "#aiCharacterGroup"
              ).hidden =
                gameMode !==
                "ai";
            }
          }
        );
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
              difficulty =
                button.dataset
                  .difficulty;

              document
                .querySelectorAll(
                  "[data-difficulty]"
                )
                .forEach(
                  item =>
                    item.classList.toggle(
                      "selected",
                      item ===
                        button
                    )
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
              const side =
                button.dataset
                  .side;

              humanColor =
                side === "black"
                  ? CONFIG.BLACK
                  : CONFIG.WHITE;

              aiColor =
                otherColor(
                  humanColor
                );

              document
                .querySelectorAll(
                  "[data-side]"
                )
                .forEach(
                  item =>
                    item.classList.toggle(
                      "selected",
                      item ===
                        button
                    )
                );
            }
          );
        }
      );

    DOM.beginGameButton?.addEventListener(
      "click",
      () => {
        if (
          gameMode === "ai" &&
          humanColor ===
            CONFIG.WHITE
        ) {
          currentPlayer =
            CONFIG.BLACK;
        }

        startGame();
      }
    );
  }

  /* =========================================================
     GAME CONTROLS
     ========================================================= */

  function setupGameControls() {
    DOM.undoButton?.addEventListener(
      "click",
      undoMove
    );

    DOM.restartButton?.addEventListener(
      "click",
      restartGame
    );
  }

  /* =========================================================
     RECORDS
     ========================================================= */

  function setupRecords() {
    DOM.clearRecordsButton?.addEventListener(
      "click",
      () => {
        records =
          createDefaultRecords();

        saveRecords();
        renderRecords();

        showToast(
          t("toast.cleared")
        );
      }
    );
  }

  function createDefaultRecords() {
    const ai = {};

    Object.keys(
      AI_CHARACTERS
    ).forEach(
      id => {
        ai[id] = {
          wins: 0,
          losses: 0,
          draws: 0
        };
      }
    );

    return {
      games: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      history: [],
      ai
    };
  }

  function loadRecords() {
    try {
      const saved =
        localStorage.getItem(
          CONFIG.STORAGE_KEY
        );

      if (!saved) {
        return createDefaultRecords();
      }

      const parsed =
        JSON.parse(saved);

      const defaults =
        createDefaultRecords();

      return {
        ...defaults,
        ...parsed,
        history:
          Array.isArray(
            parsed.history
          )
            ? parsed.history
            : [],
        ai: {
          ...defaults.ai,
          ...(parsed.ai || {})
        }
      };
    } catch {
      return createDefaultRecords();
    }
  }

  function saveRecords() {
    try {
      localStorage.setItem(
        CONFIG.STORAGE_KEY,
        JSON.stringify(records)
      );
    } catch {
      /* Storage unavailable */
    }
  }

  function addRecord(
    result
  ) {
    records.history.unshift({
      id:
        Date.now(),
      result,
      mode: gameMode,
      difficulty,
      ai:
        gameMode === "ai"
          ? selectedAI
          : null,
      moves:
        moves.length,
      date:
        new Date().toISOString()
    });

    records.history =
      records.history.slice(
        0,
        50
      );
  }

  function renderRecords() {
    if (
      DOM.statGames
    ) {
      DOM.statGames.textContent =
        records.games;
    }

    if (
      DOM.statWins
    ) {
      DOM.statWins.textContent =
        records.wins;
    }

    if (
      DOM.statLosses
    ) {
      DOM.statLosses.textContent =
        records.losses;
    }

    if (
      DOM.statDraws
    ) {
      DOM.statDraws.textContent =
        records.draws;
    }

    if (
      !DOM.recordList
    ) {
      return;
    }

    DOM.recordList.innerHTML = "";

    if (
      records.history.length ===
      0
    ) {
      return;
    }

    records.history.forEach(
      record => {
        const item =
          document.createElement(
            "div"
          );

        item.className =
          "record-item";

        const resultLabel =
          t(
            record.result ===
              "win"
              ? "record.win"
              : record.result ===
                "loss"
              ? "record.loss"
              : "record.draw"
          );

        const aiName =
          record.ai &&
          AI_CHARACTERS[
            record.ai
          ]
            ? AI_CHARACTERS[
                record.ai
              ].name[
                language
              ] ||
              AI_CHARACTERS[
                record.ai
              ].name[
                "zh-TW"
              ]
            : "";

        const date =
          new Date(
            record.date
          );

        item.innerHTML = `
          <div class="record-main">
            <strong>${escapeHTML(
              resultLabel
            )}</strong>
            <span>${escapeHTML(
              aiName
            )}</span>
          </div>
          <small>${escapeHTML(
            formatDate(date)
          )}</small>
        `;

        DOM.recordList.appendChild(
          item
        );
      }
    );
  }

  /* =========================================================
     RESUME
     ========================================================= */

  function saveResumeState() {
    if (gameOver) {
      return;
    }

    if (
      moves.length === 0
    ) {
      clearResumeState();
      return;
    }

    try {
      localStorage.setItem(
        "gomoku-resume-v2",
        JSON.stringify({
          board,
          moves,
          currentPlayer,
          gameMode,
          difficulty,
          humanColor,
          aiColor,
          selectedAI,
          lastMove,
          savedAt:
            Date.now()
        })
      );
    } catch {
      /* Ignore */
    }

    updateResumeCard();
  }

  function clearResumeState() {
    try {
      localStorage.removeItem(
        "gomoku-resume-v2"
      );
    } catch {
      /* Ignore */
    }

    updateResumeCard();
  }

  function updateResumeCard() {
    if (
      !DOM.resumeCard ||
      !DOM.resumeText
    ) {
      return;
    }

    try {
      const saved =
        localStorage.getItem(
          "gomoku-resume-v2"
        );

      if (!saved) {
        DOM.resumeCard.hidden =
          true;

        return;
      }

      const state =
        JSON.parse(saved);

      if (
        !state?.moves?.length
      ) {
        DOM.resumeCard.hidden =
          true;

        return;
      }

      DOM.resumeCard.hidden =
        false;

      DOM.resumeText.textContent =
        `${state.moves.length} moves`;
    } catch {
      DOM.resumeCard.hidden =
        true;
    }
  }

  function resumeGame() {
    try {
      const saved =
        localStorage.getItem(
          "gomoku-resume-v2"
        );

      if (!saved) {
        return;
      }

      const state =
        JSON.parse(saved);

      if (
        !Array.isArray(
          state.board
        )
      ) {
        return;
      }

      board =
        state.board;

      moves =
        state.moves || [];

      currentPlayer =
        state.currentPlayer ||
        CONFIG.BLACK;

      gameMode =
        state.gameMode ||
        "ai";

      difficulty =
        state.difficulty ||
        "easy";

      humanColor =
        state.humanColor ||
        CONFIG.BLACK;

      aiColor =
        state.aiColor ||
        CONFIG.WHITE;

      selectedAI =
        state.selectedAI ||
        "sora";

      lastMove =
        state.lastMove ||
        null;

      gameOver = false;
      aiThinking = false;
      winningLine = [];

      showScreen(
        "gameScreen"
      );

      updateTurnUI();
      updateAIUI();
      renderAIPicker();
      drawBoard();

      showToast(
        t("toast.resume")
      );

      if (
        gameMode === "ai" &&
        currentPlayer === aiColor
      ) {
        runAITurn();
      }
    } catch {
      clearResumeState();
    }
  }

  /* =========================================================
     SETTINGS
     ========================================================= */

  function setupSettings() {
    DOM.languageSelect?.addEventListener(
      "change",
      event => {
        language =
          event.target.value;

        localStorage.setItem(
          "gomoku-language-v2",
          language
        );

        applyLanguage();

        renderAIPicker();
        updateAIUI();
        updateTurnUI();
        renderRecords();
      }
    );

    DOM.soundToggle?.addEventListener(
      "change",
      event => {
        settings.sound =
          event.target.checked;

        saveSettings();
      }
    );

    DOM.motionToggle?.addEventListener(
      "change",
      event => {
        settings.motion =
          event.target.checked;

        saveSettings();
      }
    );

    DOM.themeSelect?.addEventListener(
      "change",
      event => {
        settings.theme =
          event.target.value;

        saveSettings();
        applyTheme();
      }
    );
  }

  function loadSettings() {
    try {
      const saved =
        localStorage.getItem(
          CONFIG.SETTINGS_KEY
        );

      if (!saved) {
        return;
      }

      settings = {
        ...settings,
        ...JSON.parse(saved)
      };
    } catch {
      /* Ignore */
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(
        CONFIG.SETTINGS_KEY,
        JSON.stringify(settings)
      );
    } catch {
      /* Ignore */
    }
  }

  function syncSettingsControls() {
    if (
      DOM.languageSelect
    ) {
      DOM.languageSelect.value =
        language;
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
  }

  function applySettings() {
    syncSettingsControls();
    applyTheme();
  }

  function applyTheme() {
    const root =
      document.documentElement;

    let theme =
      settings.theme;

    if (
      theme === "system"
    ) {
      theme =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches
          ? "dark"
          : "light";
    }

    root.dataset.theme =
      theme;
  }

  /* =========================================================
     I18N
     ========================================================= */

  function applyLanguage() {
    document.documentElement.lang =
      language;

    document
      .querySelectorAll(
        "[data-i18n]"
      )
      .forEach(
        element => {
          const key =
            element.dataset
              .i18n;

          const value =
            t(key);

          if (
            value === key
          ) {
            return;
          }

          element.textContent =
            value;
        }
      );

    if (
      DOM.languageSelect
    ) {
      DOM.languageSelect.value =
        language;
    }
  }

  function t(key) {
    return (
      I18N[language]?.[key] ??
      I18N["zh-TW"]?.[key] ??
      key
    );
  }

  function aiLabel() {
    const labels = {
      "zh-TW": "AI 對手",
      "zh-CN": "AI 对手",
      en: "AI Opponent",
      ja: "AI 対戦相手",
      ko: "AI 상대"
    };

    return (
      labels[language] ||
      labels["zh-TW"]
    );
  }

  /* =========================================================
     SOUND
     ========================================================= */

  function playStoneSound(
    player
  ) {
    if (!settings.sound) {
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

      if (
        audioContext.state ===
        "suspended"
      ) {
        audioContext.resume();
      }

      const oscillator =
        audioContext.createOscillator();

      const gain =
        audioContext.createGain();

      oscillator.type =
        "sine";

      oscillator.frequency.value =
        player === CONFIG.BLACK
          ? 190
          : 270;

      gain.gain.setValueAtTime(
        0.0001,
        audioContext.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.06,
        audioContext.currentTime +
          0.008
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime +
          0.075
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
          0.08
      );
    } catch {
      /* Audio unavailable */
    }
  }

  /* =========================================================
     TOAST
     ========================================================= */

  let toastTimer = null;

  function showToast(
    message
  ) {
    if (!DOM.toast) {
      return;
    }

    DOM.toast.textContent =
      message;

    DOM.toast.classList.add(
      "visible"
    );

    clearTimeout(
      toastTimer
    );

    toastTimer =
      setTimeout(
        () => {
          DOM.toast.classList.remove(
            "visible"
          );
        },
        2200
      );
  }

  /* =========================================================
     DYNAMIC CSS
     ========================================================= */

  function injectDynamicStyles() {
    if (
      document.querySelector(
        "#gomokuDynamicStyles"
      )
    ) {
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.id =
      "gomokuDynamicStyles";

    style.textContent = `
      .ai-character-panel {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
        min-width: 0;
      }

      .ai-character-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }

      .ai-character-name {
        font-weight: 700;
        white-space: nowrap;
      }

      .ai-character-style {
        opacity: .58;
        font-size: .78em;
        white-space: nowrap;
      }

      .ai-os {
        position: absolute;
        left: 50%;
        top: calc(100% + 10px);
        transform: translate(-50%, -4px);
        opacity: 0;
        pointer-events: none;
        z-index: 20;
        max-width: min(76vw, 360px);
        padding: 8px 13px;
        border: 1px solid rgba(60, 55, 48, .12);
        border-radius: 14px;
        background: rgba(255,255,255,.88);
        color: #475A61;
        box-shadow: 0 8px 25px rgba(50,40,30,.10);
        font-size: 13px;
        line-height: 1.4;
        white-space: nowrap;
        transition: opacity .22s ease, transform .22s ease;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }

      .ai-os.visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }

      .ai-character-group {
        position: relative;
      }

      .ai-picker-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }

      .ai-picker-card {
        appearance: none;
        border: 1px solid rgba(60,55,48,.12);
        border-radius: 14px;
        background: transparent;
        padding: 11px 9px;
        min-height: 64px;
        color: inherit;
        text-align: left;
        cursor: pointer;
        transition: transform .18s ease,
                    border-color .18s ease,
                    background .18s ease;
      }

      .ai-picker-card strong,
      .ai-picker-card span {
        display: block;
      }

      .ai-picker-card strong {
        font-size: .95rem;
      }

      .ai-picker-card span {
        margin-top: 3px;
        font-size: .72rem;
        opacity: .58;
      }

      .ai-picker-card.selected {
        border-color: #3E7A89;
        background: rgba(62,122,137,.08);
      }

      .ai-picker-card:active {
        transform: scale(.98);
      }

      @media (max-width: 560px) {
        .ai-picker-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .ai-character-panel {
          justify-content: flex-start;
          margin-top: 8px;
        }

        .ai-os {
          left: 0;
          transform: translate(0, -4px);
          white-space: normal;
        }

        .ai-os.visible {
          transform: translate(0, 0);
        }
      }

      [data-theme="dark"] .ai-os {
        background: rgba(35,35,35,.92);
        color: #eee;
        border-color: rgba(255,255,255,.10);
      }

      [data-theme="dark"] .ai-picker-card {
        border-color: rgba(255,255,255,.12);
      }

      [data-theme="dark"] .ai-picker-card.selected {
        background: rgba(62,122,137,.20);
      }
    `;

    document.head.appendChild(
      style
    );
  }

  /* =========================================================
     UTILITIES
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

  function getCell(
    row,
    col
  ) {
    if (
      !isInside(row, col)
    ) {
      return null;
    }

    return board[row][col];
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

  function otherColor(
    color
  ) {
    return color ===
      CONFIG.BLACK
      ? CONFIG.WHITE
      : CONFIG.BLACK;
  }

  function centerScore(
    row,
    col
  ) {
    const center =
      Math.floor(
        CONFIG.BOARD_SIZE /
          2
      );

    const distance =
      Math.abs(
        row - center
      ) +
      Math.abs(
        col - center
      );

    return Math.max(
      0,
      16 - distance
    );
  }

  function randomBetween(
    min,
    max
  ) {
    return (
      min +
      Math.random() *
        (max - min)
    );
  }

  function sleep(
    ms
  ) {
    return new Promise(
      resolve =>
        setTimeout(
          resolve,
          ms
        )
    );
  }

  function formatDate(
    date
  ) {
    try {
      return new Intl.DateTimeFormat(
        language,
        {
          year: "numeric",
          month: "short",
          day: "numeric"
        }
      ).format(date);
    } catch {
      return date.toLocaleDateString();
    }
  }

  function roundedRect(
    context,
    x,
    y,
    width,
    height,
    radius
  ) {
    const r =
      Math.min(
        radius,
        width / 2,
        height / 2
      );

    context.beginPath();

    context.moveTo(
      x + r,
      y
    );

    context.arcTo(
      x + width,
      y,
      x + width,
      y + height,
      r
    );

    context.arcTo(
      x + width,
      y + height,
      x,
      y + height,
      r
    );

    context.arcTo(
      x,
      y + height,
      x,
      y,
      r
    );

    context.arcTo(
      x,
      y,
      x + width,
      y,
      r
    );

    context.closePath();
  }

  function escapeHTML(
    value
  ) {
    return String(
      value
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }

  /* =========================================================
     GLOBAL API
     ========================================================= */

  window.GomokuGame = {
    reset() {
      restartGame();
    },

    getState() {
      return {
        board:
          board.map(
            row =>
              [...row]
          ),
        moves:
          [...moves],
        currentPlayer,
        gameMode,
        difficulty,
        humanColor,
        aiColor,
        selectedAI,
        gameOver
      };
    },

    getRecords() {
      return JSON.parse(
        JSON.stringify(
          records
        )
      );
    },

    getAICharacters() {
      return AI_CHARACTERS;
    },

    selectAI(id) {
      if (
        !AI_CHARACTERS[id]
      ) {
        return;
      }

      selectedAI = id;

      renderAIPicker();
      updateAIUI();
    }
  };

  /* =========================================================
     BOOT
     ========================================================= */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );
  } else {
    init();
  }
})();
