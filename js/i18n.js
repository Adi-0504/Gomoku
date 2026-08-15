(() => {
  "use strict";

  /*
   * =========================================================
   * GOMOKU I18N
   * =========================================================
   *
   * Supported:
   * - zh-TW
   * - zh-CN
   * - en
   * - ja
   * - ko
   *
   * Features:
   * - Existing HTML supported
   * - No need to add data-i18n everywhere
   * - Language persisted in localStorage
   * - PWA compatible
   * - Dynamic DOM support
   * - Safe button translation
   * - No duplicated button text
   * - No MutationObserver loop
   * =========================================================
   */


  /*
   * =========================================================
   * CONFIG
   * =========================================================
   */

  const STORAGE_KEY = "gomoku-language";

  const DEFAULT_LANGUAGE = "zh-TW";

  const SUPPORTED_LANGUAGES = [
    "zh-TW",
    "zh-CN",
    "en",
    "ja",
    "ko"
  ];


  /*
   * =========================================================
   * TRANSLATIONS
   * =========================================================
   */

  const translations = {

    "zh-TW": {

      "app.title": "Gomoku",

      "nav.back": "返回",
      "nav.menu": "選單",

      "home.title": "五子棋",
      "home.subtitle": "簡單的規則，沒有簡單的棋局。",
      "home.start": "開始遊戲",
      "home.records": "棋局記錄",
      "home.settings": "設定",
      "home.unfinished": "未完成棋局",
      "home.resume": "繼續",

      "setup.title": "開始遊戲",
      "setup.mode": "對戰方式",

      "mode.ai": "人機",
      "mode.local": "雙人",

      "setup.difficulty": "難度",

      "difficulty.easy": "初級",
      "difficulty.normal": "中級",
      "difficulty.hard": "高級",

      "difficulty.easy.desc": "適合第一次玩",
      "difficulty.normal.desc": "開始認真下棋",
      "difficulty.hard.desc": "需要真正思考",

      "setup.character": "AI 對手",

      "character.mio": "Mio",
      "character.mio.desc": "溫和、防守型",

      "character.rin": "Rin",
      "character.rin.desc": "積極、進攻型",

      "character.sora": "Sora",
      "character.sora.desc": "冷靜、平衡型",

      "character.kuro": "Kuro",
      "character.kuro.desc": "狡猾、反擊型",

      "setup.side": "你的棋子",

      "side.black": "黑棋",
      "side.white": "白棋",
      "side.first": "先手",
      "side.second": "後手",

      "setup.begin": "開始",

      "game.yourTurn": "你的回合",
      "game.opponentTurn": "對手回合",
      "game.black": "黑棋",
      "game.white": "白棋",
      "game.thinking": "思考中",

      "game.undo": "悔棋",
      "game.restart": "重新開始",
      "game.menu": "選單",

      "result.playAgain": "再來一局",
      "result.home": "返回首頁",

      "records.title": "棋局記錄",
      "records.games": "對局",
      "records.wins": "勝利",
      "records.losses": "失敗",
      "records.draws": "平局",
      "records.clear": "清除記錄",

      "settings.title": "設定",
      "settings.language": "語言",
      "settings.language.desc": "選擇介面語言",

      "settings.sound": "音效",
      "settings.sound.desc": "落子與遊戲音效",

      "settings.motion": "動畫",
      "settings.motion.desc": "啟用遊戲動畫",

      "settings.theme": "外觀",
      "settings.theme.desc": "使用系統外觀",

      "theme.system": "系統",
      "theme.light": "淺色",
      "theme.dark": "深色",

      "review.title": "這局回顧",
      "review.kicker": "GAME REVIEW",
      "review.first": "最前",
      "review.previous": "上一步",
      "review.play": "播放",
      "review.pause": "暫停",
      "review.next": "下一步",
      "review.last": "最後",
      "review.total": "總手數",
      "review.current": "目前",
      "review.moment": "局面",
      "review.open": "這局回顧",

      "review.start": "開局，棋盤還沒有落子。",
      "review.black": "黑棋",
      "review.white": "白棋",

      "review.move":
        "第 {move} 手，{player} 落在 {coordinate}。",

      "review.win":
        "第 {move} 手，{player} 在 {coordinate} 完成五連，這就是勝負手。"
    },


    "zh-CN": {

      "app.title": "Gomoku",

      "nav.back": "返回",
      "nav.menu": "菜单",

      "home.title": "五子棋",
      "home.subtitle": "简单的规则，没有简单的棋局。",
      "home.start": "开始游戏",
      "home.records": "棋局记录",
      "home.settings": "设置",
      "home.unfinished": "未完成棋局",
      "home.resume": "继续",

      "setup.title": "开始游戏",
      "setup.mode": "对战方式",

      "mode.ai": "人机",
      "mode.local": "双人",

      "setup.difficulty": "难度",

      "difficulty.easy": "初级",
      "difficulty.normal": "中级",
      "difficulty.hard": "高级",

      "difficulty.easy.desc": "适合第一次玩",
      "difficulty.normal.desc": "开始认真下棋",
      "difficulty.hard.desc": "需要真正思考",

      "setup.character": "AI 对手",

      "character.mio": "Mio",
      "character.mio.desc": "温和、防守型",

      "character.rin": "Rin",
      "character.rin.desc": "积极、进攻型",

      "character.sora": "Sora",
      "character.sora.desc": "冷静、平衡型",

      "character.kuro": "Kuro",
      "character.kuro.desc": "狡猾、反击型",

      "setup.side": "你的棋子",

      "side.black": "黑棋",
      "side.white": "白棋",
      "side.first": "先手",
      "side.second": "后手",

      "setup.begin": "开始",

      "game.yourTurn": "你的回合",
      "game.opponentTurn": "对手回合",
      "game.black": "黑棋",
      "game.white": "白棋",
      "game.thinking": "思考中",

      "game.undo": "悔棋",
      "game.restart": "重新开始",
      "game.menu": "菜单",

      "result.playAgain": "再来一局",
      "result.home": "返回首页",

      "records.title": "棋局记录",
      "records.games": "对局",
      "records.wins": "胜利",
      "records.losses": "失败",
      "records.draws": "平局",
      "records.clear": "清除记录",

      "settings.title": "设置",
      "settings.language": "语言",
      "settings.language.desc": "选择界面语言",

      "settings.sound": "音效",
      "settings.sound.desc": "落子与游戏音效",

      "settings.motion": "动画",
      "settings.motion.desc": "启用游戏动画",

      "settings.theme": "外观",
      "settings.theme.desc": "使用系统外观",

      "theme.system": "系统",
      "theme.light": "浅色",
      "theme.dark": "深色",

      "review.title": "这局回顾",
      "review.kicker": "GAME REVIEW",
      "review.first": "最前",
      "review.previous": "上一步",
      "review.play": "播放",
      "review.pause": "暂停",
      "review.next": "下一步",
      "review.last": "最后",
      "review.total": "总手数",
      "review.current": "目前",
      "review.moment": "局面",
      "review.open": "这局回顾",

      "review.start": "开局，棋盘还没有落子。",
      "review.black": "黑棋",
      "review.white": "白棋",

      "review.move":
        "第 {move} 手，{player} 落在 {coordinate}。",

      "review.win":
        "第 {move} 手，{player} 在 {coordinate} 完成五连，这就是胜负手。"
    },


    "en": {

      "app.title": "Gomoku",

      "nav.back": "Back",
      "nav.menu": "Menu",

      "home.title": "Gomoku",
      "home.subtitle": "Simple rules. Never simple games.",
      "home.start": "Start Game",
      "home.records": "Game Records",
      "home.settings": "Settings",
      "home.unfinished": "Unfinished Game",
      "home.resume": "Resume",

      "setup.title": "Start Game",
      "setup.mode": "Game Mode",

      "mode.ai": "AI",
      "mode.local": "Two Players",

      "setup.difficulty": "Difficulty",

      "difficulty.easy": "Easy",
      "difficulty.normal": "Normal",
      "difficulty.hard": "Hard",

      "difficulty.easy.desc": "Good for your first game",
      "difficulty.normal.desc": "Time to play seriously",
      "difficulty.hard.desc": "You will need to think ahead",

      "setup.character": "AI Opponent",

      "character.mio": "Mio",
      "character.mio.desc": "Gentle, defensive",

      "character.rin": "Rin",
      "character.rin.desc": "Aggressive, offensive",

      "character.sora": "Sora",
      "character.sora.desc": "Calm, balanced",

      "character.kuro": "Kuro",
      "character.kuro.desc": "Cunning, counter-attacking",

      "setup.side": "Your Stones",

      "side.black": "Black",
      "side.white": "White",
      "side.first": "First",
      "side.second": "Second",

      "setup.begin": "Start",

      "game.yourTurn": "Your Turn",
      "game.opponentTurn": "Opponent's Turn",
      "game.black": "Black",
      "game.white": "White",
      "game.thinking": "Thinking",

      "game.undo": "Undo",
      "game.restart": "Restart",
      "game.menu": "Menu",

      "result.playAgain": "Play Again",
      "result.home": "Home",

      "records.title": "Game Records",
      "records.games": "Games",
      "records.wins": "Wins",
      "records.losses": "Losses",
      "records.draws": "Draws",
      "records.clear": "Clear Records",

      "settings.title": "Settings",
      "settings.language": "Language",
      "settings.language.desc": "Choose interface language",

      "settings.sound": "Sound",
      "settings.sound.desc": "Stones and game sounds",

      "settings.motion": "Animation",
      "settings.motion.desc": "Enable game animations",

      "settings.theme": "Appearance",
      "settings.theme.desc": "Use system appearance",

      "theme.system": "System",
      "theme.light": "Light",
      "theme.dark": "Dark",

      "review.title": "Game Review",
      "review.kicker": "GAME REVIEW",
      "review.first": "First",
      "review.previous": "Previous",
      "review.play": "Play",
      "review.pause": "Pause",
      "review.next": "Next",
      "review.last": "Last",
      "review.total": "Total Moves",
      "review.current": "Current",
      "review.moment": "Position",
      "review.open": "Review Game",

      "review.start": "The game begins with an empty board.",
      "review.black": "Black",
      "review.white": "White",

      "review.move":
        "Move {move}: {player} at {coordinate}.",

      "review.win":
        "Move {move}: {player} completed five in a row at {coordinate}. This was the winning move."
    },


    "ja": {

      "app.title": "Gomoku",

      "nav.back": "戻る",
      "nav.menu": "メニュー",

      "home.title": "五目並べ",
      "home.subtitle": "ルールは簡単。でも、対局は簡単じゃない。",
      "home.start": "ゲーム開始",
      "home.records": "対局記録",
      "home.settings": "設定",
      "home.unfinished": "途中の対局",
      "home.resume": "続ける",

      "setup.title": "ゲーム開始",
      "setup.mode": "対戦モード",

      "mode.ai": "AI",
      "mode.local": "2人対戦",

      "setup.difficulty": "難易度",

      "difficulty.easy": "初級",
      "difficulty.normal": "中級",
      "difficulty.hard": "上級",

      "difficulty.easy.desc": "初めて遊ぶ人におすすめ",
      "difficulty.normal.desc": "本気で対局しよう",
      "difficulty.hard.desc": "先を読んで考える必要があります",

      "setup.character": "AIの相手",

      "character.mio": "Mio",
      "character.mio.desc": "穏やか・守備型",

      "character.rin": "Rin",
      "character.rin.desc": "積極的・攻撃型",

      "character.sora": "Sora",
      "character.sora.desc": "冷静・バランス型",

      "character.kuro": "Kuro",
      "character.kuro.desc": "狡猾・カウンター型",

      "setup.side": "あなたの石",

      "side.black": "黒",
      "side.white": "白",
      "side.first": "先手",
      "side.second": "後手",

      "setup.begin": "開始",

      "game.yourTurn": "あなたの番",
      "game.opponentTurn": "相手の番",
      "game.black": "黒",
      "game.white": "白",
      "game.thinking": "考え中",

      "game.undo": "待った",
      "game.restart": "もう一度",
      "game.menu": "メニュー",

      "result.playAgain": "もう一度遊ぶ",
      "result.home": "ホームへ",

      "records.title": "対局記録",
      "records.games": "対局",
      "records.wins": "勝利",
      "records.losses": "敗北",
      "records.draws": "引き分け",
      "records.clear": "記録を削除",

      "settings.title": "設定",
      "settings.language": "言語",
      "settings.language.desc": "表示言語を選択",

      "settings.sound": "サウンド",
      "settings.sound.desc": "石を置く音とゲーム音",

      "settings.motion": "アニメーション",
      "settings.motion.desc": "ゲームアニメーションを有効にする",

      "settings.theme": "外観",
      "settings.theme.desc": "システムの外観を使用",

      "theme.system": "システム",
      "theme.light": "ライト",
      "theme.dark": "ダーク",

      "review.title": "対局レビュー",
      "review.kicker": "GAME REVIEW",
      "review.first": "最初",
      "review.previous": "前へ",
      "review.play": "再生",
      "review.pause": "一時停止",
      "review.next": "次へ",
      "review.last": "最後",
      "review.total": "総手数",
      "review.current": "現在",
      "review.moment": "局面",
      "review.open": "この対局を振り返る",

      "review.start": "開始時点。まだ石は置かれていません。",
      "review.black": "黒",
      "review.white": "白",

      "review.move":
        "{move}手目、{player}が{coordinate}に置きました。",

      "review.win":
        "{move}手目、{player}が{coordinate}で五連を完成。勝負を決めた一手です。"
    },


    "ko": {

      "app.title": "Gomoku",

      "nav.back": "뒤로",
      "nav.menu": "메뉴",

      "home.title": "오목",
      "home.subtitle": "규칙은 간단하지만, 승부는 간단하지 않습니다.",
      "home.start": "게임 시작",
      "home.records": "대국 기록",
      "home.settings": "설정",
      "home.unfinished": "진행 중인 게임",
      "home.resume": "계속하기",

      "setup.title": "게임 시작",
      "setup.mode": "게임 모드",

      "mode.ai": "AI",
      "mode.local": "2인 플레이",

      "setup.difficulty": "난이도",

      "difficulty.easy": "초급",
      "difficulty.normal": "중급",
      "difficulty.hard": "고급",

      "difficulty.easy.desc": "처음 플레이하기 좋아요",
      "difficulty.normal.desc": "이제 진지하게 시작해요",
      "difficulty.hard.desc": "앞을 생각하며 두어야 해요",

      "setup.character": "AI 상대",

      "character.mio": "Mio",
      "character.mio.desc": "차분하고 수비적인 스타일",

      "character.rin": "Rin",
      "character.rin.desc": "공격적이고 적극적인 스타일",

      "character.sora": "Sora",
      "character.sora.desc": "침착하고 균형 잡힌 스타일",

      "character.kuro": "Kuro",
      "character.kuro.desc": "영리하고 반격 중심의 스타일",

      "setup.side": "내 돌",

      "side.black": "흑",
      "side.white": "백",
      "side.first": "선공",
      "side.second": "후공",

      "setup.begin": "시작",

      "game.yourTurn": "당신의 차례",
      "game.opponentTurn": "상대의 차례",
      "game.black": "흑",
      "game.white": "백",
      "game.thinking": "생각 중",

      "game.undo": "무르기",
      "game.restart": "다시 시작",
      "game.menu": "메뉴",

      "result.playAgain": "다시 하기",
      "result.home": "홈으로",

      "records.title": "대국 기록",
      "records.games": "대국",
      "records.wins": "승리",
      "records.losses": "패배",
      "records.draws": "무승부",
      "records.clear": "기록 삭제",

      "settings.title": "설정",
      "settings.language": "언어",
      "settings.language.desc": "인터페이스 언어 선택",

      "settings.sound": "사운드",
      "settings.sound.desc": "착수 및 게임 효과음",

      "settings.motion": "애니메이션",
      "settings.motion.desc": "게임 애니메이션 사용",

      "settings.theme": "화면",
      "settings.theme.desc": "시스템 화면 설정 사용",

      "theme.system": "시스템",
      "theme.light": "라이트",
      "theme.dark": "다크",

      "review.title": "대국 리뷰",
      "review.kicker": "GAME REVIEW",
      "review.first": "처음",
      "review.previous": "이전",
      "review.play": "재생",
      "review.pause": "일시정지",
      "review.next": "다음",
      "review.last": "마지막",
      "review.total": "총 수",
      "review.current": "현재",
      "review.moment": "현재 국면",
      "review.open": "이 대국 돌아보기",

      "review.start": "게임 시작. 아직 돌이 놓이지 않았습니다.",
      "review.black": "흑",
      "review.white": "백",

      "review.move":
        "{move}번째 수, {player}이(가) {coordinate}에 놓았습니다.",

      "review.win":
        "{move}번째 수, {player}이(가) {coordinate}에서 오목을 완성했습니다. 승부를 결정한 수입니다."
    }

  };


  /*
   * =========================================================
   * STATE
   * =========================================================
   */

  let currentLanguage = DEFAULT_LANGUAGE;

  let observer = null;

  let observerScheduled = false;


  /*
   * =========================================================
   * LANGUAGE HELPERS
   * =========================================================
   */

  function normalizeLanguage(language) {

    if (
      SUPPORTED_LANGUAGES.includes(language)
    ) {
      return language;
    }

    if (
      typeof language !== "string"
    ) {
      return DEFAULT_LANGUAGE;
    }

    const lower =
      language.toLowerCase();

    if (lower.startsWith("zh-cn")) {
      return "zh-CN";
    }

    if (lower.startsWith("zh")) {
      return "zh-TW";
    }

    if (lower.startsWith("ja")) {
      return "ja";
    }

    if (lower.startsWith("ko")) {
      return "ko";
    }

    if (lower.startsWith("en")) {
      return "en";
    }

    return DEFAULT_LANGUAGE;
  }


  function detectLanguage() {

    const keys = [
      STORAGE_KEY,
      "gomoku-language-v1",
      "gomoku-lang",
      "language"
    ];

    for (const key of keys) {

      try {

        const value =
          localStorage.getItem(key);

        if (value) {
          return normalizeLanguage(value);
        }

      } catch (error) {
        /*
         * localStorage unavailable.
         */
      }
    }

    return normalizeLanguage(
      navigator.language
    );
  }


  function saveLanguage(language) {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        language
      );

    } catch (error) {
      /*
       * PWA private mode / storage unavailable.
       */
    }
  }


  /*
   * =========================================================
   * TRANSLATION
   * =========================================================
   */

  function translate(
    key,
    variables = {}
  ) {

    const language =
      translations[currentLanguage] ||
      translations[DEFAULT_LANGUAGE];

    let value =
      language[key];

    if (
      value === undefined
    ) {

      value =
        translations[DEFAULT_LANGUAGE][key];

    }

    if (
      value === undefined
    ) {

      return key;

    }

    return String(value).replace(
      /\{(\w+)\}/g,
      (match, variable) => {

        if (
          Object.prototype.hasOwnProperty.call(
            variables,
            variable
          )
        ) {

          return String(
            variables[variable]
          );

        }

        return match;
      }
    );
  }


  /*
   * =========================================================
   * BASIC DOM HELPERS
   * =========================================================
   */

  function setText(
    selectorOrElement,
    key
  ) {

    const element =
      typeof selectorOrElement === "string"
        ? document.querySelector(
            selectorOrElement
          )
        : selectorOrElement;

    if (!element) {
      return;
    }

    element.textContent =
      translate(key);
  }


  function setAttributeText(
    selectorOrElement,
    attribute,
    key
  ) {

    const element =
      typeof selectorOrElement === "string"
        ? document.querySelector(
            selectorOrElement
          )
        : selectorOrElement;

    if (!element) {
      return;
    }

    element.setAttribute(
      attribute,
      translate(key)
    );
  }


  /*
   * =========================================================
   * DATA-I18N SUPPORT
   * =========================================================
   */

  function translateElement(
    element
  ) {

    if (!element) {
      return;
    }

    const key =
      element.dataset.i18n;

    if (key) {

      element.textContent =
        translate(key);

    }


    const placeholder =
      element.dataset.i18nPlaceholder;

    if (placeholder) {

      element.placeholder =
        translate(placeholder);

    }


    const aria =
      element.dataset.i18nAria;

    if (aria) {

      element.setAttribute(
        "aria-label",
        translate(aria)
      );

    }


    const title =
      element.dataset.i18nTitle;

    if (title) {

      element.setAttribute(
        "title",
        translate(title)
      );

    }


    const value =
      element.dataset.i18nValue;

    if (
      value &&
      (
        element.tagName === "INPUT" ||
        element.tagName === "BUTTON"
      )
    ) {

      element.value =
        translate(value);

    }

  }


  function translateDataAttributes(
    root = document
  ) {

    const selector =
      [
        "[data-i18n]",
        "[data-i18n-placeholder]",
        "[data-i18n-aria]",
        "[data-i18n-title]",
        "[data-i18n-value]"
      ].join(",");


    if (
      root.nodeType === Node.ELEMENT_NODE &&
      root.matches(selector)
    ) {

      translateElement(root);

    }


    root
      .querySelectorAll?.(selector)
      .forEach(translateElement);

  }


  /*
   * =========================================================
   * SAFE BUTTON TRANSLATION
   * =========================================================
   */

  const BUTTON_MAP = {

    "#backButton":
      "nav.back",

    "#menuButton":
      "nav.menu",

    "#startButton":
      "home.start",

    "#recordsButton":
      "home.records",

    "#settingsButton":
      "home.settings",

    "#resumeButton":
      "home.resume",

    "#beginGameButton":
      "setup.begin",

    "#undoButton":
      "game.undo",

    "#restartButton":
      "game.restart",

    "#gameMenuButton":
      "game.menu",

    "#playAgainButton":
      "result.playAgain",

    "#resultHomeButton":
      "result.home",

    "#clearRecordsButton":
      "records.clear"

  };


  /*
   * 只改「文字 span」。
   *
   * 不直接修改 button.textContent，
   * 因此：
   *
   * ↶ 悔棋
   *
   * 不會變成：
   *
   * 悔棋悔棋
   */
  function translateButton(
    element,
    key
  ) {

    if (!element) {
      return;
    }


    /*
     * 優先找：
     *
     * <span>悔棋</span>
     *
     * 而且排除：
     *
     * <span aria-hidden="true">↶</span>
     */
    const textSpan =
      Array.from(
        element.children
      ).find(child => {

        return (
          child.tagName === "SPAN" &&
          child.getAttribute(
            "aria-hidden"
          ) !== "true"
        );

      });


    if (textSpan) {

      textSpan.textContent =
        translate(key);

      return;

    }


    /*
     * 沒有 icon / text span 的普通 button。
     */
    element.textContent =
      translate(key);

  }


  /*
   * =========================================================
   * EXISTING HTML UI
   * =========================================================
   */

  function translateExistingUI() {

    /*
     * -------------------------------------------------------
     * Main buttons
     * -------------------------------------------------------
     */

    Object.entries(
      BUTTON_MAP
    ).forEach(
      ([selector, key]) => {

        const element =
          document.querySelector(
            selector
          );

        if (!element) {
          return;
        }

        translateButton(
          element,
          key
        );

      }
    );


    /*
     * -------------------------------------------------------
     * HOME
     * -------------------------------------------------------
     */

    setText(
      "#homeScreen h1",
      "home.title"
    );

    setText(
      "#homeScreen .subtitle",
      "home.subtitle"
    );

    setText(
      "#resumeCard .status-label",
      "home.unfinished"
    );


    /*
     * -------------------------------------------------------
     * SETUP
     * -------------------------------------------------------
     */

    setText(
      "#setupScreen h2",
      "setup.title"
    );


    const setupGroups =
      document.querySelectorAll(
        "#setupScreen .settings-group"
      );


    if (setupGroups[0]) {

      const heading =
        setupGroups[0].querySelector(
          "h3"
        );

      if (heading) {

        heading.textContent =
          translate("setup.mode");

      }

    }


    setText(
      "#difficultyGroup h3",
      "setup.difficulty"
    );


    setText(
      "#characterGroup h3",
      "setup.character"
    );


    const sidePicker =
      document.querySelector(
        ".side-picker"
      );


    if (sidePicker) {

      const group =
        sidePicker.closest(
          ".settings-group"
        );

      const heading =
        group?.querySelector("h3");

      if (heading) {

        heading.textContent =
          translate("setup.side");

      }

    }


    /*
     * -------------------------------------------------------
     * GAME MODE
     * -------------------------------------------------------
     */

    document
      .querySelectorAll(
        "[data-mode]"
      )
      .forEach(
        button => {

          const key =
            button.dataset.mode === "local"
              ? "mode.local"
              : "mode.ai";

          button.textContent =
            translate(key);

        }
      );


    /*
     * -------------------------------------------------------
     * DIFFICULTY
     * -------------------------------------------------------
     */

    document
      .querySelectorAll(
        "[data-difficulty]"
      )
      .forEach(
        button => {

          const difficulty =
            button.dataset.difficulty;

          const title =
            button.querySelector(
              "strong"
            );

          const description =
            button.querySelector(
              "span"
            );


          if (title) {

            title.textContent =
              translate(
                `difficulty.${difficulty}`
              );

          }


          if (description) {

            description.textContent =
              translate(
                `difficulty.${difficulty}.desc`
              );

          }

        }
      );


    /*
     * -------------------------------------------------------
     * AI CHARACTERS
     * -------------------------------------------------------
     */

    document
      .querySelectorAll(
        "[data-character]"
      )
      .forEach(
        button => {

          const character =
            button.dataset.character;

          const title =
            button.querySelector(
              "strong"
            );

          const description =
            button.querySelector(
              "span"
            );


          if (title) {

            title.textContent =
              translate(
                `character.${character}`
              );

          }


          if (description) {

            description.textContent =
              translate(
                `character.${character}.desc`
              );

          }

        }
      );


    /*
     * -------------------------------------------------------
     * SIDE PICKER
     * -------------------------------------------------------
     */

    document
      .querySelectorAll(
        "[data-side]"
      )
      .forEach(
        button => {

          const side =
            button.dataset.side;

          const strong =
            button.querySelector(
              "strong"
            );


          if (strong) {

            strong.textContent =
              translate(
                `side.${side}`
              );

          }


          const spans =
            button.querySelectorAll(
              "span"
            );


          /*
           * 第一個 span 是棋子預覽。
           * 最後一個 span 是先手 / 後手。
           */
          if (
            spans.length >= 2
          ) {

            spans[
              spans.length - 1
            ].textContent =
              translate(
                side === "black"
                  ? "side.first"
                  : "side.second"
              );

          }

        }
      );


    /*
     * -------------------------------------------------------
     * GAME STATUS
     * -------------------------------------------------------
     */

    setText(
      "#thinkingIndicator span:last-child",
      "game.thinking"
    );


    /*
     * turnLabel / turnPlayer
     *
     * turnPlayer 是遊戲狀態，
     * 不在這裡硬寫。
     */


    /*
     * -------------------------------------------------------
     * RECORDS
     * -------------------------------------------------------
     */

    setText(
      "#recordsScreen h2",
      "records.title"
    );


    const statCards =
      document.querySelectorAll(
        "#recordsScreen .stat-card"
      );


    if (statCards.length >= 4) {

      setText(
        statCards[0].querySelector("span"),
        "records.games"
      );

      setText(
        statCards[1].querySelector("span"),
        "records.wins"
      );

      setText(
        statCards[2].querySelector("span"),
        "records.losses"
      );

      setText(
        statCards[3].querySelector("span"),
        "records.draws"
      );

    }


    /*
     * -------------------------------------------------------
     * SETTINGS
     * -------------------------------------------------------
     */

    setText(
      "#settingsScreen h2",
      "settings.title"
    );


    translateSetting(
      "#languageSelect",
      "settings.language",
      "settings.language.desc"
    );


    translateSetting(
      "#soundToggle",
      "settings.sound",
      "settings.sound.desc"
    );


    translateSetting(
      "#motionToggle",
      "settings.motion",
      "settings.motion.desc"
    );


    translateSetting(
      "#themeSelect",
      "settings.theme",
      "settings.theme.desc"
    );


    /*
     * -------------------------------------------------------
     * SELECT OPTIONS
     * -------------------------------------------------------
     */

    translateSelectOptions(
      "#languageSelect",
      {
        "zh-TW": "繁體中文",
        "zh-CN": "简体中文",
        "en": "English",
        "ja": "日本語",
        "ko": "한국어"
      }
    );


    translateSelectOptions(
      "#themeSelect",
      {
        system: "theme.system",
        light: "theme.light",
        dark: "theme.dark"
      },
      true
    );


    /*
     * -------------------------------------------------------
     * ARIA
     * -------------------------------------------------------
     */

    setAttributeText(
      "#backButton",
      "aria-label",
      "nav.back"
    );


    setAttributeText(
      "#menuButton",
      "aria-label",
      "nav.menu"
    );


    setAttributeText(
      "#boardCanvas",
      "aria-label",
      "app.title"
    );

  }


  /*
   * =========================================================
   * SETTINGS
   * =========================================================
   */

  function translateSetting(
    selector,
    titleKey,
    descriptionKey
  ) {

    const input =
      document.querySelector(
        selector
      );

    if (!input) {
      return;
    }


    const row =
      input.closest(
        ".setting-row"
      );

    if (!row) {
      return;
    }


    const strong =
      row.querySelector(
        "strong"
      );

    const small =
      row.querySelector(
        "small"
      );


    if (strong) {

      strong.textContent =
        translate(titleKey);

    }


    if (small) {

      small.textContent =
        translate(descriptionKey);

    }

  }


  /*
   * =========================================================
   * SELECT OPTIONS
   * =========================================================
   */

  function translateSelectOptions(
    selector,
    map,
    valuesAreKeys = false
  ) {

    const select =
      document.querySelector(
        selector
      );

    if (!select) {
      return;
    }


    Array.from(
      select.options
    ).forEach(
      option => {

        const value =
          option.value;

        const mapped =
          map[value];

        if (!mapped) {
          return;
        }


        option.textContent =
          valuesAreKeys
            ? translate(mapped)
            : mapped;

      }
    );

  }


  /*
   * =========================================================
   * FULL PAGE TRANSLATION
   * =========================================================
   */

  function translatePage() {

    /*
     * First:
     * data-i18n elements.
     */

    translateDataAttributes(
      document
    );


    /*
     * Then:
     * existing Gomoku HTML.
     */

    translateExistingUI();


    /*
     * HTML language.
     */

    document.documentElement.lang =
      currentLanguage;


    /*
     * Browser title.
     */

    document.title =
      translate(
        "app.title"
      );


    /*
     * Notify app.js / other modules.
     */

    window.dispatchEvent(
      new CustomEvent(
        "gomoku:languagechange",
        {
          detail: {
            language:
              currentLanguage
          }
        }
      )
    );

  }


  /*
   * =========================================================
   * LANGUAGE SELECT
   * =========================================================
   */

  function bindLanguageSelect() {

    const select =
      document.querySelector(
        "#languageSelect"
      );

    if (!select) {
      return;
    }


    /*
     * Sync current value.
     */

    select.value =
      currentLanguage;


    /*
     * Avoid duplicate listener.
     */

    if (
      select.dataset.i18nBound === "1"
    ) {

      return;

    }


    select.dataset.i18nBound =
      "1";


    select.addEventListener(
      "change",
      event => {

        setLanguage(
          event.target.value
        );

      }
    );

  }


  /*
   * =========================================================
   * SET LANGUAGE
   * =========================================================
   */

  function setLanguage(
    language
  ) {

    const normalized =
      normalizeLanguage(
        language
      );


    if (
      currentLanguage === normalized
    ) {

      /*
       * Even if the same language was selected,
       * refresh UI in case app.js changed something.
       */

      saveLanguage(
        normalized
      );

      translatePage();

      return;

    }


    currentLanguage =
      normalized;


    saveLanguage(
      normalized
    );


    translatePage();


    /*
     * Keep select synchronized.
     */

    const select =
      document.querySelector(
        "#languageSelect"
      );

    if (select) {

      select.value =
        currentLanguage;

    }

  }


  /*
   * =========================================================
   * DYNAMIC DOM
   * =========================================================
   *
   * Only translate newly added nodes.
   *
   * We DO NOT call translatePage() from MutationObserver.
   *
   * This prevents:
   *
   * DOM change
   * -> observer
   * -> translation
   * -> DOM change
   * -> observer
   * -> loop
   *
   * =========================================================
   */

  function scheduleDynamicTranslation() {

    if (observerScheduled) {
      return;
    }


    observerScheduled =
      true;


    requestAnimationFrame(
      () => {

        observerScheduled =
          false;


        /*
         * Dynamic elements may contain
         * data-i18n attributes.
         *
         * Existing app.js generated UI
         * can also be handled here.
         */
        translateDataAttributes(
          document
        );

      }
    );

  }


  function observeDOM() {

    if (observer) {
      return;
    }


    if (!document.body) {
      return;
    }


    observer =
      new MutationObserver(
        mutations => {

          let hasAddedNodes =
            false;


          for (
            const mutation
            of mutations
          ) {

            if (
              mutation.type !==
              "childList"
            ) {

              continue;

            }


            if (
              mutation.addedNodes.length > 0
            ) {

              hasAddedNodes =
                true;

              break;

            }

          }


          if (
            hasAddedNodes
          ) {

            scheduleDynamicTranslation();

          }

        }
      );


    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true
      }
    );

  }


  /*
   * =========================================================
   * PUBLIC API
   * =========================================================
   */

  function getLanguage() {

    return currentLanguage;

  }


  function getSupportedLanguages() {

    return [
      ...SUPPORTED_LANGUAGES
    ];

  }


  /*
   * =========================================================
   * INIT
   * =========================================================
   */

  function init() {

    /*
     * Detect language.
     */

    currentLanguage =
      detectLanguage();


    /*
     * Initial translation.
     */

    translatePage();


    /*
     * Bind select AFTER initial translation.
     */

    bindLanguageSelect();


    /*
     * Observe dynamic DOM.
     */

    observeDOM();


    /*
     * Public API.
     */

    window.GomokuI18n = {

      t: translate,

      setLanguage,

      getLanguage,

      getSupportedLanguages,

      refresh() {

        translatePage();

        bindLanguageSelect();

      },

      translations

    };

  }


  /*
   * =========================================================
   * START
   * =========================================================
   */

  if (
    document.readyState === "loading"
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
