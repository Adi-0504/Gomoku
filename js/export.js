(() => {
  "use strict";

  /*
   * =========================================================
   * GOMOKU EXPORT
   * =========================================================
   *
   * 完全獨立於 app.js
   *
   * 功能：
   * - 匯出目前棋局
   * - 匯出未完成棋局
   * - 匯出棋局記錄
   * - 匯出統計資料
   * - 產生適合列印 / 儲存為 PDF 的報告
   *
   * 不使用任何第三方套件。
   * 不使用 CDN。
   * 不修改遊戲核心邏輯。
   * =========================================================
   */

  const STORAGE_KEYS = {
    activeGame: "gomoku-active-game-v5",
    stats: "gomoku-stats-v5",
    records: "gomoku-records-v5"
  };

  const BOARD_SIZE = 15;

  let exportWindow = null;


  /*
   * =========================================================
   * SAFE STORAGE
   * =========================================================
   */

  function readStorage(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);

      if (!raw) {
        return fallback;
      }

      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }


  /*
   * =========================================================
   * HELPERS
   * =========================================================
   */

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function formatDate(value) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat(
      undefined,
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    ).format(date);
  }


  function formatDuration(seconds) {
    const total = Math.max(
      0,
      Number(seconds) || 0
    );

    const minutes = Math.floor(
      total / 60
    );

    const secs = Math.floor(
      total % 60
    );

    if (minutes === 0) {
      return `${secs}s`;
    }

    return `${minutes}m ${String(secs).padStart(2, "0")}s`;
  }


  function normalizeArray(value) {
    return Array.isArray(value)
      ? value
      : [];
  }


  function getLanguage() {
    try {
      if (
        window.GomokuI18n &&
        typeof window.GomokuI18n.getLanguage === "function"
      ) {
        return window.GomokuI18n.getLanguage();
      }
    } catch {}

    try {
      return localStorage.getItem(
        "gomoku-language"
      ) || "zh-TW";
    } catch {}

    return "zh-TW";
  }


  /*
   * =========================================================
   * TRANSLATION
   * =========================================================
   */

  const LABELS = {
    "zh-TW": {
      title: "Gomoku 棋局報告",
      generated: "匯出時間",
      game: "棋局",
      currentGame: "目前棋局",
      records: "棋局記錄",
      statistics: "戰績",
      board: "棋盤",
      moves: "棋步",
      settings: "對戰設定",
      mode: "對戰方式",
      ai: "人機",
      local: "雙人",
      difficulty: "難度",
      easy: "初級",
      normal: "中級",
      hard: "高級",
      character: "AI 對手",
      side: "你的棋子",
      black: "黑棋",
      white: "白棋",
      first: "先手",
      second: "後手",
      moveCount: "手數",
      duration: "用時",
      turn: "目前回合",
      status: "狀態",
      unfinished: "未完成",
      finished: "已完成",
      date: "時間",
      result: "結果",
      win: "勝利",
      loss: "失敗",
      draw: "平局",
      total: "對局",
      noGame: "目前沒有可匯出的棋局。",
      noRecords: "目前沒有棋局記錄。",
      player: "玩家",
      opponent: "對手",
      move: "第",
      moveAt: "手",
      empty: "空白"
    },

    "zh-CN": {
      title: "Gomoku 棋局报告",
      generated: "导出时间",
      game: "棋局",
      currentGame: "当前棋局",
      records: "棋局记录",
      statistics: "战绩",
      board: "棋盘",
      moves: "棋步",
      settings: "对战设置",
      mode: "对战方式",
      ai: "人机",
      local: "双人",
      difficulty: "难度",
      easy: "初级",
      normal: "中级",
      hard: "高级",
      character: "AI 对手",
      side: "你的棋子",
      black: "黑棋",
      white: "白棋",
      first: "先手",
      second: "后手",
      moveCount: "手数",
      duration: "用时",
      turn: "当前回合",
      status: "状态",
      unfinished: "未完成",
      finished: "已完成",
      date: "时间",
      result: "结果",
      win: "胜利",
      loss: "失败",
      draw: "平局",
      total: "对局",
      noGame: "目前没有可导出的棋局。",
      noRecords: "目前没有棋局记录。",
      player: "玩家",
      opponent: "对手",
      move: "第",
      moveAt: "手",
      empty: "空白"
    },

    en: {
      title: "Gomoku Game Report",
      generated: "Exported",
      game: "Game",
      currentGame: "Current Game",
      records: "Game Records",
      statistics: "Statistics",
      board: "Board",
      moves: "Moves",
      settings: "Game Settings",
      mode: "Mode",
      ai: "AI",
      local: "Two Players",
      difficulty: "Difficulty",
      easy: "Easy",
      normal: "Normal",
      hard: "Hard",
      character: "AI Opponent",
      side: "Your Stones",
      black: "Black",
      white: "White",
      first: "First",
      second: "Second",
      moveCount: "Moves",
      duration: "Duration",
      turn: "Current Turn",
      status: "Status",
      unfinished: "Unfinished",
      finished: "Finished",
      date: "Date",
      result: "Result",
      win: "Win",
      loss: "Loss",
      draw: "Draw",
      total: "Games",
      noGame: "There is no game available to export.",
      noRecords: "There are no game records.",
      player: "Player",
      opponent: "Opponent",
      move: "Move",
      moveAt: "",
      empty: "Empty"
    },

    ja: {
      title: "Gomoku 対局レポート",
      generated: "出力日時",
      game: "対局",
      currentGame: "現在の対局",
      records: "対局記録",
      statistics: "戦績",
      board: "盤面",
      moves: "棋譜",
      settings: "対局設定",
      mode: "対戦方式",
      ai: "AI",
      local: "2人対戦",
      difficulty: "難易度",
      easy: "初級",
      normal: "中級",
      hard: "上級",
      character: "AIの相手",
      side: "あなたの石",
      black: "黒",
      white: "白",
      first: "先手",
      second: "後手",
      moveCount: "手数",
      duration: "時間",
      turn: "現在の手番",
      status: "状態",
      unfinished: "進行中",
      finished: "終了",
      date: "日時",
      result: "結果",
      win: "勝利",
      loss: "敗北",
      draw: "引き分け",
      total: "対局数",
      noGame: "出力できる対局がありません。",
      noRecords: "対局記録がありません。",
      player: "プレイヤー",
      opponent: "相手",
      move: "",
      moveAt: "手目",
      empty: "空"
    },

    ko: {
      title: "Gomoku 대국 보고서",
      generated: "내보낸 시간",
      game: "대국",
      currentGame: "현재 대국",
      records: "대국 기록",
      statistics: "전적",
      board: "바둑판",
      moves: "수순",
      settings: "대국 설정",
      mode: "대전 방식",
      ai: "AI",
      local: "2인 플레이",
      difficulty: "난이도",
      easy: "초급",
      normal: "중급",
      hard: "고급",
      character: "AI 상대",
      side: "내 돌",
      black: "흑",
      white: "백",
      first: "선공",
      second: "후공",
      moveCount: "수",
      duration: "시간",
      turn: "현재 차례",
      status: "상태",
      unfinished: "진행 중",
      finished: "완료",
      date: "시간",
      result: "결과",
      win: "승리",
      loss: "패배",
      draw: "무승부",
      total: "대국",
      noGame: "내보낼 수 있는 대국이 없습니다.",
      noRecords: "대국 기록이 없습니다.",
      player: "플레이어",
      opponent: "상대",
      move: "",
      moveAt: "번째 수",
      empty: "빈 칸"
    }
  };


  function t(key) {
    const language =
      LABELS[getLanguage()] ||
      LABELS["zh-TW"];

    return language[key] ||
      LABELS["zh-TW"][key] ||
      key;
  }


  /*
   * =========================================================
   * GAME DATA
   * =========================================================
   */

  function getActiveGame() {
    return readStorage(
      STORAGE_KEYS.activeGame,
      null
    );
  }


  function getStats() {
    return readStorage(
      STORAGE_KEYS.stats,
      {
        games: 0,
        wins: 0,
        losses: 0,
        draws: 0
      }
    );
  }


  function getRecords() {
    return readStorage(
      STORAGE_KEYS.records,
      []
    );
  }


  /*
   * =========================================================
   * BOARD NORMALIZATION
   * =========================================================
   */

  function getBoard(game) {
    if (!game) {
      return [];
    }

    if (
      Array.isArray(game.board)
    ) {
      return game.board;
    }

    if (
      Array.isArray(game.position)
    ) {
      return game.position;
    }

    return [];
  }


  function getMoves(game) {
    if (!game) {
      return [];
    }

    if (
      Array.isArray(game.moves)
    ) {
      return game.moves;
    }

    if (
      Array.isArray(game.history)
    ) {
      return game.history;
    }

    return [];
  }


  function getMode(game) {
    const mode =
      game?.mode ||
      game?.gameMode ||
      "ai";

    return mode === "local"
      ? t("local")
      : t("ai");
  }


  function getDifficulty(game) {
    const difficulty =
      game?.difficulty ||
      "easy";

    return t(difficulty);
  }


  function getCharacter(game) {
    return (
      game?.character ||
      game?.aiCharacter ||
      "Mio"
    );
  }


  function getSide(game) {
    const side =
      game?.playerSide ||
      game?.side ||
      "black";

    return side === "white"
      ? t("white")
      : t("black");
  }


  function getCurrentTurn(game) {
    const turn =
      game?.currentPlayer ||
      game?.turn ||
      game?.currentTurn;

    if (
      turn === "white" ||
      turn === 2
    ) {
      return t("white");
    }

    if (
      turn === "black" ||
      turn === 1
    ) {
      return t("black");
    }

    return "—";
  }


  function getDuration(game) {
    return formatDuration(
      game?.elapsedTime ||
      game?.duration ||
      game?.elapsed ||
      0
    );
  }


  function getGameStatus(game) {
    if (!game) {
      return t("empty");
    }

    if (
      game.gameOver ||
      game.finished ||
      game.status === "finished"
    ) {
      return t("finished");
    }

    return t("unfinished");
  }


  /*
   * =========================================================
   * BOARD HTML
   * =========================================================
   */

  function getCellValue(board, row, col) {
    if (
      !Array.isArray(board)
    ) {
      return 0;
    }

    const currentRow =
      board[row];

    if (
      Array.isArray(currentRow)
    ) {
      return currentRow[col] || 0;
    }

    return 0;
  }


  function stoneHTML(value) {
    if (
      value === 1 ||
      value === "black" ||
      value === "b"
    ) {
      return '<span class="pdf-stone black"></span>';
    }

    if (
      value === 2 ||
      value === "white" ||
      value === "w"
    ) {
      return '<span class="pdf-stone white"></span>';
    }

    return "";
  }


  function boardHTML(board) {
    let html =
      '<div class="pdf-board">';

    for (
      let row = 0;
      row < BOARD_SIZE;
      row++
    ) {

      html += '<div class="pdf-board-row">';

      for (
        let col = 0;
        col < BOARD_SIZE;
        col++
      ) {

        const value =
          getCellValue(
            board,
            row,
            col
          );

        html +=
          `<div class="pdf-cell">${stoneHTML(value)}</div>`;
      }

      html += "</div>";
    }

    html += "</div>";

    return html;
  }


  /*
   * =========================================================
   * MOVES
   * =========================================================
   */

  function coordinateFromMove(move) {
    if (!move) {
      return "—";
    }

    if (
      move.coordinate
    ) {
      return String(
        move.coordinate
      );
    }

    const row =
      Number(
        move.row ??
        move.y
      );

    const col =
      Number(
        move.col ??
        move.column ??
        move.x
      );

    if (
      Number.isFinite(row) &&
      Number.isFinite(col)
    ) {
      const letter =
        String.fromCharCode(
          65 + col
        );

      return `${letter}${row + 1}`;
    }

    return "—";
  }


  function playerFromMove(move) {
    const player =
      move?.player ??
      move?.color ??
      move?.side;

    if (
      player === "white" ||
      player === 2
    ) {
      return t("white");
    }

    if (
      player === "black" ||
      player === 1
    ) {
      return t("black");
    }

    return "—";
  }


  function movesHTML(moves) {
    if (!moves.length) {
      return `
        <p class="empty-message">
          ${escapeHTML(t("noGame"))}
        </p>
      `;
    }

    return `
      <div class="move-list">
        ${moves.map((move, index) => `
          <div class="move-row">
            <span class="move-number">
              ${index + 1}
            </span>

            <span class="move-player">
              ${escapeHTML(
                playerFromMove(move)
              )}
            </span>

            <span class="move-coordinate">
              ${escapeHTML(
                coordinateFromMove(move)
              )}
            </span>
          </div>
        `).join("")}
      </div>
    `;
  }


  /*
   * =========================================================
   * STATISTICS
   * =========================================================
   */

  function statisticsHTML() {
    const stats =
      getStats();

    return `
      <section class="pdf-section">
        <h2>${escapeHTML(t("statistics"))}</h2>

        <div class="stats">
          <div class="stat">
            <span>${escapeHTML(t("total"))}</span>
            <strong>${Number(stats.games) || 0}</strong>
          </div>

          <div class="stat">
            <span>${escapeHTML(t("win"))}</span>
            <strong>${Number(stats.wins) || 0}</strong>
          </div>

          <div class="stat">
            <span>${escapeHTML(t("loss"))}</span>
            <strong>${Number(stats.losses) || 0}</strong>
          </div>

          <div class="stat">
            <span>${escapeHTML(t("draw"))}</span>
            <strong>${Number(stats.draws) || 0}</strong>
          </div>
        </div>
      </section>
    `;
  }


  /*
   * =========================================================
   * RECORDS
   * =========================================================
   */

  function recordsHTML() {
    const records =
      getRecords();

    if (!records.length) {
      return `
        <section class="pdf-section">
          <h2>${escapeHTML(t("records"))}</h2>
          <p class="empty-message">
            ${escapeHTML(t("noRecords"))}
          </p>
        </section>
      `;
    }

    return `
      <section class="pdf-section">
        <h2>${escapeHTML(t("records"))}</h2>

        <div class="record-table">

          <div class="record-head">
            <span>${escapeHTML(t("date"))}</span>
            <span>${escapeHTML(t("result"))}</span>
            <span>${escapeHTML(t("moveCount"))}</span>
          </div>

          ${records.map(record => `
            <div class="record-row">

              <span>
                ${escapeHTML(
                  formatDate(
                    record.date ||
                    record.createdAt ||
                    record.timestamp
                  )
                )}
              </span>

              <span>
                ${escapeHTML(
                  normalizeResult(
                    record.result
                  )
                )}
              </span>

              <span>
                ${Number(
                  record.moves ||
                  record.moveCount ||
                  0
                )}
              </span>

            </div>
          `).join("")}

        </div>
      </section>
    `;
  }


  function normalizeResult(result) {
    if (
      result === "win" ||
      result === "won"
    ) {
      return t("win");
    }

    if (
      result === "loss" ||
      result === "lose" ||
      result === "lost"
    ) {
      return t("loss");
    }

    if (
      result === "draw" ||
      result === "tie"
    ) {
      return t("draw");
    }

    return String(
      result || "—"
    );
  }


  /*
   * =========================================================
   * CURRENT GAME
   * =========================================================
   */

  function currentGameHTML() {
    const game =
      getActiveGame();

    if (!game) {
      return `
        <section class="pdf-section">
          <h2>${escapeHTML(t("currentGame"))}</h2>
          <p class="empty-message">
            ${escapeHTML(t("noGame"))}
          </p>
        </section>
      `;
    }

    const board =
      getBoard(game);

    const moves =
      getMoves(game);

    return `
      <section class="pdf-section page-break">

        <h2>
          ${escapeHTML(t("currentGame"))}
        </h2>

        <div class="game-meta">

          <div>
            <span>${escapeHTML(t("mode"))}</span>
            <strong>${escapeHTML(getMode(game))}</strong>
          </div>

          <div>
            <span>${escapeHTML(t("difficulty"))}</span>
            <strong>${escapeHTML(getDifficulty(game))}</strong>
          </div>

          <div>
            <span>${escapeHTML(t("character"))}</span>
            <strong>${escapeHTML(getCharacter(game))}</strong>
          </div>

          <div>
            <span>${escapeHTML(t("side"))}</span>
            <strong>${escapeHTML(getSide(game))}</strong>
          </div>

          <div>
            <span>${escapeHTML(t("moveCount"))}</span>
            <strong>${moves.length}</strong>
          </div>

          <div>
            <span>${escapeHTML(t("duration"))}</span>
            <strong>${escapeHTML(getDuration(game))}</strong>
          </div>

          <div>
            <span>${escapeHTML(t("turn"))}</span>
            <strong>${escapeHTML(getCurrentTurn(game))}</strong>
          </div>

          <div>
            <span>${escapeHTML(t("status"))}</span>
            <strong>${escapeHTML(getGameStatus(game))}</strong>
          </div>

        </div>

        <h3>
          ${escapeHTML(t("board"))}
        </h3>

        ${boardHTML(board)}

        <h3>
          ${escapeHTML(t("moves"))}
        </h3>

        ${movesHTML(moves)}

      </section>
    `;
  }


  /*
   * =========================================================
   * DOCUMENT
   * =========================================================
   */

  function buildDocument() {
    const language =
      getLanguage();

    const now =
      formatDate(
        new Date()
      );

    return `
<!DOCTYPE html>
<html lang="${escapeHTML(language)}">
<head>
<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1"
>

<title>${escapeHTML(t("title"))}</title>

<style>

  @page {
    size: A4;
    margin: 14mm;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #25221d;
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      "SF Pro Display",
      "Helvetica Neue",
      Arial,
      sans-serif;
  }

  body {
    line-height: 1.5;
  }

  .report {
    width: 100%;
    max-width: 820px;
    margin: 0 auto;
  }

  .cover {
    padding: 20px 0 28px;
    border-bottom: 1px solid #d8d0c3;
    margin-bottom: 28px;
  }

  .cover-mark {
    display: flex;
    gap: 8px;
    margin-bottom: 18px;
  }

  .cover-stone {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: block;
  }

  .cover-stone.black {
    background: #181714;
  }

  .cover-stone.white {
    background: #f6f2e9;
    border: 1px solid #cfc7b8;
  }

  h1 {
    font-size: 32px;
    line-height: 1.15;
    margin: 0 0 10px;
    letter-spacing: -0.02em;
  }

  h2 {
    font-size: 21px;
    margin: 0 0 16px;
  }

  h3 {
    font-size: 15px;
    margin: 24px 0 12px;
  }

  .generated {
    color: #746d63;
    font-size: 12px;
  }

  .pdf-section {
    margin-bottom: 30px;
  }

  .page-break {
    break-before: page;
    page-break-before: always;
  }

  .stats {
    display: grid;
    grid-template-columns:
      repeat(4, 1fr);
    gap: 10px;
  }

  .stat {
    border: 1px solid #ded7ca;
    border-radius: 10px;
    padding: 14px;
    background: #faf8f4;
  }

  .stat span {
    display: block;
    color: #746d63;
    font-size: 11px;
    margin-bottom: 4px;
  }

  .stat strong {
    font-size: 23px;
  }

  .game-meta {
    display: grid;
    grid-template-columns:
      repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 24px;
  }

  .game-meta > div {
    border: 1px solid #ded7ca;
    border-radius: 8px;
    padding: 10px;
  }

  .game-meta span {
    display: block;
    color: #746d63;
    font-size: 10px;
    margin-bottom: 2px;
  }

  .game-meta strong {
    font-size: 12px;
  }

  .pdf-board {
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
    border: 1px solid #a99f8e;
    background:
      repeating-linear-gradient(
        to right,
        transparent 0,
        transparent calc(100% / 15 - 1px),
        #c9bda9 calc(100% / 15 - 1px),
        #c9bda9 calc(100% / 15)
      ),
      repeating-linear-gradient(
        to bottom,
        transparent 0,
        transparent calc(100% / 15 - 1px),
        #c9bda9 calc(100% / 15 - 1px),
        #c9bda9 calc(100% / 15)
      ),
      #e8d5ad;
  }

  .pdf-board-row {
    display: grid;
    grid-template-columns:
      repeat(15, 1fr);
  }

  .pdf-cell {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pdf-stone {
    width: 72%;
    height: 72%;
    border-radius: 50%;
    display: block;
  }

  .pdf-stone.black {
    background: #181714;
    box-shadow:
      inset 0 1px 2px rgba(255,255,255,.16),
      0 1px 2px rgba(0,0,0,.28);
  }

  .pdf-stone.white {
    background: #f6f2e9;
    border: 1px solid #bdb4a6;
    box-shadow:
      0 1px 2px rgba(0,0,0,.18);
  }

  .move-list {
    display: grid;
    grid-template-columns:
      repeat(3, 1fr);
    gap: 5px;
  }

  .move-row {
    display: grid;
    grid-template-columns:
      30px 1fr 60px;
    align-items: center;
    border: 1px solid #e4ddd2;
    border-radius: 6px;
    padding: 6px 8px;
    font-size: 11px;
  }

  .move-number {
    color: #8a8175;
  }

  .move-player {
    font-weight: 600;
  }

  .move-coordinate {
    text-align: right;
    color: #746d63;
  }

  .record-table {
    border: 1px solid #ded7ca;
    border-radius: 8px;
    overflow: hidden;
  }

  .record-head,
  .record-row {
    display: grid;
    grid-template-columns:
      2fr 1fr 1fr;
    gap: 10px;
    padding: 9px 12px;
    font-size: 11px;
  }

  .record-head {
    background: #f4f0e8;
    font-weight: 700;
  }

  .record-row {
    border-top: 1px solid #e6e0d7;
  }

  .empty-message {
    color: #746d63;
    padding: 16px;
    border: 1px dashed #d5cdbf;
    border-radius: 8px;
  }

  .footer {
    margin-top: 35px;
    padding-top: 12px;
    border-top: 1px solid #ded7ca;
    color: #8b8378;
    font-size: 9px;
    text-align: center;
  }

  @media print {
    .report {
      max-width: none;
    }

    .no-print {
      display: none !important;
    }
  }

  @media screen {
    body {
      background: #eeeae3;
      padding: 24px;
    }

    .report {
      background: white;
      padding: 30px;
      box-shadow:
        0 10px 40px rgba(0,0,0,.08);
    }
  }

</style>
</head>

<body>

<main class="report">

  <section class="cover">

    <div class="cover-mark">
      <span class="cover-stone black"></span>
      <span class="cover-stone white"></span>
    </div>

    <h1>
      ${escapeHTML(t("title"))}
    </h1>

    <div class="generated">
      ${escapeHTML(t("generated"))}：
      ${escapeHTML(now)}
    </div>

  </section>

  ${statisticsHTML()}

  ${currentGameHTML()}

  ${recordsHTML()}

  <footer class="footer">
    Gomoku
  </footer>

</main>

<script>
  window.addEventListener("load", function () {
    setTimeout(function () {
      window.print();
    }, 300);
  });
</script>

</body>
</html>
    `;
  }


  /*
   * =========================================================
   * EXPORT
   * =========================================================
   */

  function exportPDF() {

    if (
      exportWindow &&
      !exportWindow.closed
    ) {
      try {
        exportWindow.focus();
        return;
      } catch {}
    }

    exportWindow =
      window.open(
        "",
        "_blank"
      );

    if (!exportWindow) {

      /*
       * iOS / Safari 如果阻擋新視窗，
       * 改用 Blob URL 開啟。
       */

      const blob =
        new Blob(
          [
            buildDocument()
          ],
          {
            type:
              "text/html;charset=utf-8"
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href =
        url;

      link.target =
        "_blank";

      link.rel =
        "noopener";

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      setTimeout(
        () => URL.revokeObjectURL(url),
        10000
      );

      return;
    }

    exportWindow.document.open();

    exportWindow.document.write(
      buildDocument()
    );

    exportWindow.document.close();
  }


  /*
   * =========================================================
   * BUTTON
   * =========================================================
   */

  function bindExportButton() {

    const button =
      document.querySelector(
        "#exportButton"
      );

    if (!button) {
      return;
    }

    if (
      button.dataset.exportBound ===
      "1"
    ) {
      return;
    }

    button.dataset.exportBound =
      "1";

    button.addEventListener(
      "click",
      exportPDF
    );
  }


  /*
   * =========================================================
   * PUBLIC API
   * =========================================================
   */

  window.GomokuExport = {
    exportPDF,

    getActiveGame,

    getStats,

    getRecords
  };


  /*
   * =========================================================
   * INIT
   * =========================================================
   */

  function init() {
    bindExportButton();
  }


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
