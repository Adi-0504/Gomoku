(() => {
  "use strict";

  /*
   * =========================================================
   * GOMOKU EXPORT
   * =========================================================
   *
   * 功能：
   * - 不依賴 app.js
   * - 不依賴 i18n.js
   * - 直接讀取 localStorage
   * - 匯出目前棋局
   * - 匯出棋局記錄
   * - 產生 PDF
   *
   * PDF 內容：
   * - Gomoku 標題
   * - 棋局資訊
   * - 棋盤
   * - 完整棋譜（如果資料中存在 moves）
   *
   * PDF 使用瀏覽器原生列印功能。
   * 不需要任何第三方套件。
   * =========================================================
   */

  const CONFIG = {
    ACTIVE_GAME_KEYS: [
      "gomoku-active-game-v5",
      "gomoku-active-game-v4",
      "gomoku-active-game-v3"
    ],

    STATS_KEYS: [
      "gomoku-stats-v5",
      "gomoku-stats-v4",
      "gomoku-stats-v3"
    ],

    EXPORT_EVENT: "gomoku:export"
  };


  /*
   * =========================================================
   * STORAGE
   * =========================================================
   */

  function readJSON(keys) {
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);

        if (!raw) {
          continue;
        }

        const parsed = JSON.parse(raw);

        if (parsed) {
          return {
            key,
            data: parsed
          };
        }

      } catch {
        // 繼續嘗試下一個 key
      }
    }

    return null;
  }


  function getActiveGame() {
    const result =
      readJSON(
        CONFIG.ACTIVE_GAME_KEYS
      );

    return result
      ? result.data
      : null;
  }


  function getStats() {
    const result =
      readJSON(
        CONFIG.STATS_KEYS
      );

    return result
      ? result.data
      : null;
  }


  /*
   * =========================================================
   * BOARD
   * =========================================================
   */

  function normalizeBoard(board) {
    if (!Array.isArray(board)) {
      return null;
    }

    return board;
  }


  function getBoardFromGame(game) {
    if (!game) {
      return null;
    }

    return normalizeBoard(
      game.board
    );
  }


  /*
   * =========================================================
   * MOVES
   * =========================================================
   */

  function normalizeMoves(moves) {
    if (!Array.isArray(moves)) {
      return [];
    }

    return moves;
  }


  function getMovesFromGame(game) {
    if (!game) {
      return [];
    }

    return normalizeMoves(
      game.moves
    );
  }


  /*
   * =========================================================
   * BOARD DRAWING
   * =========================================================
   */

  function getBoardSize(board) {
    if (
      !Array.isArray(board) ||
      !board.length
    ) {
      return 15;
    }

    return board.length;
  }


  function getCellValue(board, row, col) {
    if (
      !Array.isArray(board) ||
      !Array.isArray(board[row])
    ) {
      return 0;
    }

    return board[row][col] || 0;
  }


  function drawBoard(
    board,
    moves
  ) {

    const size =
      getBoardSize(board);

    const canvas =
      document.createElement(
        "canvas"
      );

    const padding = 70;
    const cell = 48;

    const width =
      padding * 2 +
      cell * (size - 1);

    const height =
      padding * 2 +
      cell * (size - 1);

    canvas.width = width * 2;
    canvas.height = height * 2;

    canvas.style.width =
      `${width}px`;

    canvas.style.height =
      `${height}px`;

    const ctx =
      canvas.getContext("2d");

    ctx.scale(2, 2);

    /*
     * 背景
     */

    ctx.fillStyle =
      "#f4ead6";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );

    /*
     * 棋盤
     */

    ctx.strokeStyle =
      "#5f513e";

    ctx.lineWidth = 1;

    for (
      let i = 0;
      i < size;
      i++
    ) {

      const p =
        padding +
        i * cell;

      ctx.beginPath();

      ctx.moveTo(
        padding,
        p
      );

      ctx.lineTo(
        width - padding,
        p
      );

      ctx.stroke();

      ctx.beginPath();

      ctx.moveTo(
        p,
        padding
      );

      ctx.lineTo(
        p,
        height - padding
      );

      ctx.stroke();
    }


    /*
     * 星位
     */

    const starPoints =
      getStarPoints(size);

    ctx.fillStyle =
      "#5f513e";

    for (
      const [row, col]
      of starPoints
    ) {

      const x =
        padding +
        col * cell;

      const y =
        padding +
        row * cell;

      ctx.beginPath();

      ctx.arc(
        x,
        y,
        4,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }


    /*
     * 棋子
     */

    for (
      let row = 0;
      row < size;
      row++
    ) {

      for (
        let col = 0;
        col < size;
        col++
      ) {

        const value =
          getCellValue(
            board,
            row,
            col
          );

        if (!value) {
          continue;
        }

        const x =
          padding +
          col * cell;

        const y =
          padding +
          row * cell;

        drawStone(
          ctx,
          x,
          y,
          value
        );
      }
    }


    /*
     * 最後一手
     */

    const lastMove =
      moves.length
        ? moves[moves.length - 1]
        : null;

    if (lastMove) {

      const position =
        normalizeMove(
          lastMove
        );

      if (position) {

        const x =
          padding +
          position.col * cell;

        const y =
          padding +
          position.row * cell;

        ctx.strokeStyle =
          "#b44b3e";

        ctx.lineWidth = 2;

        ctx.strokeRect(
          x - 8,
          y - 8,
          16,
          16
        );
      }
    }


    return canvas;
  }


  function drawStone(
    ctx,
    x,
    y,
    value
  ) {

    const radius = 18;

    const gradient =
      ctx.createRadialGradient(
        x - 6,
        y - 7,
        2,
        x,
        y,
        radius
      );

    if (
      value === 1 ||
      value === "black"
    ) {

      gradient.addColorStop(
        0,
        "#555"
      );

      gradient.addColorStop(
        1,
        "#111"
      );

    } else {

      gradient.addColorStop(
        0,
        "#fff"
      );

      gradient.addColorStop(
        1,
        "#d7d7d7"
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
      "#777";

    ctx.lineWidth = 0.8;

    ctx.stroke();
  }


  function getStarPoints(size) {

    if (size === 15) {
      return [
        [3, 3],
        [3, 11],
        [7, 7],
        [11, 3],
        [11, 11]
      ];
    }

    if (size === 19) {
      return [
        [3, 3],
        [3, 9],
        [3, 15],
        [9, 3],
        [9, 9],
        [9, 15],
        [15, 3],
        [15, 9],
        [15, 15]
      ];
    }

    return [];
  }


  /*
   * =========================================================
   * MOVE NORMALIZATION
   * =========================================================
   */

  function normalizeMove(move) {

    if (!move) {
      return null;
    }

    /*
     * 常見格式：
     *
     * { row, col }
     * { x, y }
     * { r, c }
     */

    let row =
      Number.isFinite(move.row)
        ? move.row
        : Number.isFinite(move.r)
          ? move.r
          : Number.isFinite(move.y)
            ? move.y
            : null;

    let col =
      Number.isFinite(move.col)
        ? move.col
        : Number.isFinite(move.c)
          ? move.c
          : Number.isFinite(move.x)
            ? move.x
            : null;

    if (
      row === null ||
      col === null
    ) {
      return null;
    }

    return {
      row,
      col
    };
  }


  /*
   * =========================================================
   * GAME INFORMATION
   * =========================================================
   */

  function formatDuration(seconds) {

    const total =
      Math.max(
        0,
        Number(seconds) || 0
      );

    const minutes =
      Math.floor(
        total / 60
      );

    const secs =
      total % 60;

    return `${minutes} 分 ${secs} 秒`;
  }


  function formatDate(value) {

    if (!value) {
      return "—";
    }

    try {

      return new Date(
        value
      ).toLocaleString();

    } catch {

      return "—";
    }
  }


  function resultText(result) {

    switch (result) {

      case "win":
        return "勝利";

      case "loss":
        return "失敗";

      case "draw":
        return "平局";

      default:
        return "進行中";
    }
  }


  function modeText(mode) {

    if (mode === "local") {
      return "雙人對戰";
    }

    return "人機對戰";
  }


  /*
   * =========================================================
   * MOVE DESCRIPTION
   * =========================================================
   */

  function coordinateFromMove(move) {

    const position =
      normalizeMove(
        move
      );

    if (!position) {
      return "—";
    }

    const letters =
      "ABCDEFGHIJKLMNOPQRS";

    const letter =
      letters[
        position.col
      ] ||
      "?";

    return `${letter}${position.row + 1}`;
  }


  function playerFromMove(move) {

    if (!move) {
      return "—";
    }

    const value =
      move.player ??
      move.value ??
      move.color ??
      move.side;

    if (
      value === 1 ||
      value === "black" ||
      value === "Black"
    ) {
      return "黑棋";
    }

    if (
      value === 2 ||
      value === "white" ||
      value === "White"
    ) {
      return "白棋";
    }

    return "棋子";
  }


  /*
   * =========================================================
   * PDF HTML
   * =========================================================
   */

  function createExportDocument(
    game,
    title = "Gomoku 棋局"
  ) {

    const board =
      getBoardFromGame(
        game
      );

    const moves =
      getMovesFromGame(
        game
      );

    const mode =
      modeText(
        game?.mode
      );

    const result =
      resultText(
        game?.result
      );

    const character =
      game?.character ||
      "—";

    const duration =
      formatDuration(
        game?.elapsedSeconds ||
        game?.duration ||
        0
      );

    const date =
      formatDate(
        game?.date ||
        game?.gameStartedAt
      );

    const boardCanvas =
      board
        ? drawBoard(
            board,
            moves
          )
        : null;

    const boardImage =
      boardCanvas
        ? boardCanvas.toDataURL(
            "image/png"
          )
        : "";


    let movesHTML =
      "";

    if (!moves.length) {

      movesHTML = `
        <div class="empty">
          此棋局沒有可用的逐手棋譜。
        </div>
      `;

    } else {

      movesHTML =
        moves
          .map(
            (
              move,
              index
            ) => {

              return `
                <div class="move-row">
                  <span class="move-number">
                    ${index + 1}
                  </span>

                  <span class="move-player">
                    ${escapeHTML(
                      playerFromMove(
                        move
                      )
                    )}
                  </span>

                  <span class="move-coordinate">
                    ${escapeHTML(
                      coordinateFromMove(
                        move
                      )
                    )}
                  </span>
                </div>
              `;
            }
          )
          .join("");
    }


    return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>

<meta charset="UTF-8">

<title>${escapeHTML(title)}</title>

<style>

@page {
  size: A4;
  margin: 16mm;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  color: #29251f;
  background: #fff;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "SF Pro Display",
    "Noto Sans TC",
    "PingFang TC",
    sans-serif;
}

.page {
  width: 100%;
}

.header {
  border-bottom: 1px solid #d8ccb8;
  padding-bottom: 18px;
  margin-bottom: 24px;
}

.brand {
  font-size: 13px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #8b7a62;
}

h1 {
  margin: 8px 0 4px;
  font-size: 30px;
  font-weight: 650;
}

.date {
  color: #887d70;
  font-size: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns:
    repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 28px;
}

.info {
  border: 1px solid #e1d8ca;
  border-radius: 10px;
  padding: 12px;
}

.info-label {
  display: block;
  font-size: 10px;
  color: #938676;
  margin-bottom: 5px;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
}

.board-section {
  text-align: center;
  margin: 20px 0 30px;
}

.board {
  width: 100%;
  max-width: 520px;
  height: auto;
  display: block;
  margin: 0 auto;
}

.section-title {
  font-size: 18px;
  font-weight: 650;
  margin: 0 0 12px;
}

.moves {
  border-top: 1px solid #ded5c8;
}

.move-row {
  display: grid;
  grid-template-columns:
    50px 1fr 1fr;
  padding: 8px 0;
  border-bottom: 1px solid #eee8df;
  font-size: 13px;
}

.move-number {
  color: #918573;
}

.move-player {
  font-weight: 600;
}

.move-coordinate {
  text-align: right;
  font-family: monospace;
}

.empty {
  padding: 20px;
  background: #f7f3ed;
  border-radius: 8px;
  color: #887d70;
}

.footer {
  margin-top: 30px;
  padding-top: 12px;
  border-top: 1px solid #ded5c8;
  color: #9a8e80;
  font-size: 10px;
  text-align: center;
}

@media print {

  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

}

</style>

</head>

<body>

<div class="page">

  <header class="header">

    <div class="brand">
      GOMOKU
    </div>

    <h1>
      ${escapeHTML(title)}
    </h1>

    <div class="date">
      ${escapeHTML(date)}
    </div>

  </header>


  <section class="info-grid">

    <div class="info">
      <span class="info-label">
        結果
      </span>

      <span class="info-value">
        ${escapeHTML(result)}
      </span>
    </div>

    <div class="info">
      <span class="info-label">
        模式
      </span>

      <span class="info-value">
        ${escapeHTML(mode)}
      </span>
    </div>

    <div class="info">
      <span class="info-label">
        對手
      </span>

      <span class="info-value">
        ${escapeHTML(character)}
      </span>
    </div>

    <div class="info">
      <span class="info-label">
        手數
      </span>

      <span class="info-value">
        ${moves.length}
      </span>
    </div>

  </section>


  ${
    boardImage
      ? `
        <section class="board-section">

          <h2 class="section-title">
            棋局
          </h2>

          <img
            class="board"
            src="${boardImage}"
            alt="Gomoku board"
          >

        </section>
      `
      : ""
  }


  <section>

    <h2 class="section-title">
      棋譜
    </h2>

    <div class="moves">

      ${movesHTML}

    </div>

  </section>


  <footer class="footer">
    Gomoku · Offline Game
  </footer>

</div>

</body>
</html>
    `;
  }


  /*
   * =========================================================
   * ESCAPE
   * =========================================================
   */

  function escapeHTML(value) {

    return String(
      value ?? ""
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


  /*
   * =========================================================
   * PRINT
   * =========================================================
   */

  function printHTML(
    html
  ) {

    const printWindow =
      window.open(
        "",
        "_blank"
      );

    if (!printWindow) {

      alert(
        "無法開啟列印視窗。請允許此網站開啟新視窗。"
      );

      return false;
    }


    printWindow.document.open();

    printWindow.document.write(
      html
    );

    printWindow.document.close();


    setTimeout(
      () => {

        printWindow.focus();

        printWindow.print();

      },
      500
    );

    return true;
  }


  /*
   * =========================================================
   * EXPORT CURRENT GAME
   * =========================================================
   */

  function exportCurrentGame() {

    const game =
      getActiveGame();

    if (!game) {

      alert(
        "目前沒有可以匯出的棋局。"
      );

      return false;
    }


    const html =
      createExportDocument(
        game,
        "Gomoku 棋局"
      );

    return printHTML(
      html
    );
  }


  /*
   * =========================================================
   * EXPORT RECORD
   * =========================================================
   */

  function exportRecord(
    record
  ) {

    if (!record) {

      alert(
        "找不到這局棋。"
      );

      return false;
    }


    /*
     * 如果 record 本身沒有棋盤，
     * 嘗試尋找目前棋局。
     */

    const active =
      getActiveGame();

    const game = {
      ...record,
      board:
        record.board ||
        active?.board ||
        null,
      moves:
        record.moves &&
        Array.isArray(
          record.moves
        )
          ? record.moves
          : active?.moves || []
    };


    const html =
      createExportDocument(
        game,
        "Gomoku 棋局記錄"
      );

    return printHTML(
      html
    );
  }


  /*
   * =========================================================
   * EXPORT ALL RECORDS
   * =========================================================
   */

  function exportAllRecords() {

    const stats =
      getStats();

    if (
      !stats ||
      !Array.isArray(
        stats.records
      ) ||
      !stats.records.length
    ) {

      alert(
        "目前沒有棋局記錄。"
      );

      return false;
    }


    const records =
      stats.records;


    const sections =
      records
        .map(
          (
            record,
            index
          ) => {

            return `
              <div class="record-page">

                <h2>
                  第 ${index + 1} 局
                </h2>

                <p>
                  結果：
                  ${escapeHTML(
                    resultText(
                      record.result
                    )
                  )}
                </p>

                <p>
                  模式：
                  ${escapeHTML(
                    modeText(
                      record.mode
                    )
                  )}
                </p>

                <p>
                  手數：
                  ${record.moves || 0}
                </p>

                <p>
                  用時：
                  ${escapeHTML(
                    formatDuration(
                      record.duration || 0
                    )
                  )}
                </p>

              </div>
            `;
          }
        )
        .join("");


    const html = `
<!DOCTYPE html>
<html lang="zh-TW">

<head>

<meta charset="UTF-8">

<title>Gomoku 棋局記錄</title>

<style>

@page {
  size: A4;
  margin: 16mm;
}

body {
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "PingFang TC",
    sans-serif;

  color: #29251f;
}

h1 {
  margin-bottom: 24px;
}

.record-page {
  border: 1px solid #ddd3c5;
  border-radius: 10px;
  padding: 18px;
  margin-bottom: 14px;
}

.record-page h2 {
  margin-top: 0;
}

.record-page p {
  margin: 6px 0;
}

</style>

</head>

<body>

<h1>
  Gomoku 棋局記錄
</h1>

${sections}

</body>

</html>
    `;


    return printHTML(
      html
    );
  }


  /*
   * =========================================================
   * BUTTON BINDING
   * =========================================================
   */

  function bindButtons() {

    const currentButton =
      document.querySelector(
        "#exportGameButton"
      );

    if (
      currentButton &&
      currentButton.dataset.exportBound !== "1"
    ) {

      currentButton.dataset.exportBound =
        "1";

      currentButton.addEventListener(
        "click",
        exportCurrentGame
      );
    }


    const recordsButton =
      document.querySelector(
        "#exportRecordsButton"
      );

    if (
      recordsButton &&
      recordsButton.dataset.exportBound !== "1"
    ) {

      recordsButton.dataset.exportBound =
        "1";

      recordsButton.addEventListener(
        "click",
        exportAllRecords
      );
    }
  }


  /*
   * =========================================================
   * PUBLIC API
   * ========================================================= */

  window.GomokuExport = {

    exportCurrentGame,

    exportRecord,

    exportAllRecords,

    getActiveGame,

    getStats,

    createExportDocument

  };


  /*
   * =========================================================
   * INIT
   * ========================================================= */

  function init() {

    bindButtons();


    /*
     * app.js 如果之後動態建立按鈕，
     * 也能接上。
     */

    const observer =
      new MutationObserver(
        () => {
          bindButtons();
        }
      );

    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true
      }
    );


    window.dispatchEvent(
      new CustomEvent(
        CONFIG.EXPORT_EVENT
      )
    );
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
