(() => {
  "use strict";

  /*
   * =========================================================
   * GOMOKU EXPORT SYSTEM
   * =========================================================
   *
   * 完全獨立於 app.js
   *
   * 支援：
   * - JSON Export
   * - JSON Import
   * - PDF Export
   * - 棋局棋盤
   * - 棋譜
   * - 統計
   * - 設定
   * - 未完成棋局
   *
   * 不使用第三方套件
   * 不呼叫 app.js
   * 不依賴 app.js 的函式
   *
   * =========================================================
   */

  const APP_NAME = "Gomoku";

  const BACKUP_FORMAT = "gomoku-backup";

  const BACKUP_VERSION = 3;

  const LANGUAGE_KEY = "gomoku-language";

  const KNOWN_KEYS = [
    "gomoku-active-game-v5",
    "gomoku-stats-v5",
    "gomoku-settings-v5",
    "gomoku-language"
  ];


  /*
   * =========================================================
   * UTILITIES
   * =========================================================
   */

  function safeJSONParse(value) {

    if (typeof value !== "string") {
      return value;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }


  function clone(value) {

    try {
      return JSON.parse(
        JSON.stringify(value)
      );
    } catch {
      return value;
    }

  }


  function getAllGomokuStorage() {

    const result = {};

    try {

      for (
        let i = 0;
        i < localStorage.length;
        i++
      ) {

        const key =
          localStorage.key(i);

        if (!key) {
          continue;
        }

        if (
          key.startsWith("gomoku-")
        ) {

          result[key] =
            safeJSONParse(
              localStorage.getItem(key)
            );

        }

      }

    } catch (error) {

      console.error(
        "[Gomoku Export]",
        error
      );

    }

    /*
     * 保證幾個重要 key 即使目前不存在，
     * 也能被辨識。
     */

    for (const key of KNOWN_KEYS) {

      if (
        !Object.prototype.hasOwnProperty.call(
          result,
          key
        )
      ) {

        try {

          const value =
            localStorage.getItem(key);

          if (value !== null) {

            result[key] =
              safeJSONParse(value);

          }

        } catch {}

      }

    }

    return result;
  }


  function formatDate(
    date = new Date()
  ) {

    return new Intl.DateTimeFormat(
      undefined,
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }
    ).format(date);

  }


  function escapeHTML(
    value
  ) {

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


  function showToast(
    message
  ) {

    const toast =
      document.querySelector(
        "#toast"
      );

    if (!toast) {
      return;
    }

    toast.textContent =
      message;

    toast.classList.add(
      "show"
    );

    clearTimeout(
      showToast.timer
    );

    showToast.timer =
      setTimeout(
        () => {

          toast.classList.remove(
            "show"
          );

        },
        2200
      );

  }


  /*
   * =========================================================
   * JSON EXPORT
   * =========================================================
   */

  function createBackup() {

    return {

      format:
        BACKUP_FORMAT,

      app:
        APP_NAME,

      version:
        BACKUP_VERSION,

      exportedAt:
        new Date().toISOString(),

      storage:
        clone(
          getAllGomokuStorage()
        )

    };

  }


  function downloadText(
    text,
    filename,
    type
  ) {

    const blob =
      new Blob(
        [text],
        {
          type:
            `${type};charset=utf-8`
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const anchor =
      document.createElement(
        "a"
      );

    anchor.href =
      url;

    anchor.download =
      filename;

    anchor.style.display =
      "none";

    document.body.appendChild(
      anchor
    );

    anchor.click();

    anchor.remove();

    setTimeout(
      () => {
        URL.revokeObjectURL(
          url
        );
      },
      1000
    );

  }


  function exportJSON() {

    const backup =
      createBackup();

    const json =
      JSON.stringify(
        backup,
        null,
        2
      );

    const stamp =
      createFileStamp();

    downloadText(
      json,
      `gomoku-backup-${stamp}.json`,
      "application/json"
    );

    showToast(
      "資料已匯出"
    );

    return backup;

  }


  function createFileStamp() {

    const now =
      new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1
      ).padStart(
        2,
        "0"
      );

    const day =
      String(
        now.getDate()
      ).padStart(
        2,
        "0"
      );

    const hour =
      String(
        now.getHours()
      ).padStart(
        2,
        "0"
      );

    const minute =
      String(
        now.getMinutes()
      ).padStart(
        2,
        "0"
      );

    return (
      `${year}-${month}-${day}` +
      `-${hour}${minute}`
    );

  }


  /*
   * =========================================================
   * JSON IMPORT
   * =========================================================
   */

  function validateBackup(
    data
  ) {

    if (
      !data ||
      typeof data !== "object"
    ) {

      return false;

    }

    if (
      data.format === BACKUP_FORMAT &&
      data.app === APP_NAME &&
      data.storage &&
      typeof data.storage === "object"
    ) {

      return true;

    }

    /*
     * 舊版格式相容
     */

    if (
      data.app === APP_NAME &&
      data.data &&
      typeof data.data === "object"
    ) {

      return true;

    }

    return false;

  }


  function normalizeBackup(
    data
  ) {

    if (
      data.format === BACKUP_FORMAT &&
      data.storage
    ) {

      return data.storage;

    }

    /*
     * 舊版：
     *
     * {
     *   data: {
     *     activeGame,
     *     stats,
     *     settings
     *   }
     * }
     */

    const storage = {};

    if (
      Object.prototype.hasOwnProperty.call(
        data.data,
        "activeGame"
      )
    ) {

      storage[
        "gomoku-active-game-v5"
      ] =
        data.data.activeGame;

    }

    if (
      Object.prototype.hasOwnProperty.call(
        data.data,
        "stats"
      )
    ) {

      storage[
        "gomoku-stats-v5"
      ] =
        data.data.stats;

    }

    if (
      Object.prototype.hasOwnProperty.call(
        data.data,
        "settings"
      )
    ) {

      storage[
        "gomoku-settings-v5"
      ] =
        data.data.settings;

    }

    return storage;

  }


  async function importJSONFile(
    file
  ) {

    if (!file) {
      return;
    }

    let data;

    try {

      data =
        JSON.parse(
          await file.text()
        );

    } catch {

      throw new Error(
        "JSON 檔案格式錯誤"
      );

    }


    if (
      !validateBackup(data)
    ) {

      throw new Error(
        "這不是有效的 Gomoku 備份檔"
      );

    }


    const storage =
      normalizeBackup(
        data
      );


    const keys =
      Object.keys(
        storage
      );


    if (!keys.length) {

      throw new Error(
        "備份檔沒有資料"
      );

    }


    /*
     * 先備份目前資料。
     */

    const previous =
      getAllGomokuStorage();


    try {

      for (const key of keys) {

        if (
          !key.startsWith(
            "gomoku-"
          )
        ) {

          continue;

        }

        const value =
          storage[key];


        localStorage.setItem(
          key,
          JSON.stringify(value)
        );

      }

    } catch (error) {

      /*
       * 失敗時恢復。
       */

      try {

        for (
          const key of Object.keys(
            previous
          )
        ) {

          localStorage.setItem(
            key,
            JSON.stringify(
              previous[key]
            )
          );

        }

      } catch {}

      throw new Error(
        "匯入失敗，原本的資料沒有被取代"
      );

    }


    showToast(
      "匯入成功，正在重新載入"
    );


    setTimeout(
      () => {

        location.reload();

      },
      700
    );

  }


  function openImportPicker() {

    const input =
      document.querySelector(
        "#importFileInput"
      );

    if (!input) {

      showToast(
        "找不到匯入檔案選擇器"
      );

      return;

    }

    input.value =
      "";

    input.click();

  }


  /*
   * =========================================================
   * DATA DISCOVERY
   * =========================================================
   *
   * 因為不能依賴 app.js，
   * 這裡會遞迴尋找可能的棋譜。
   *
   * 支援常見：
   *
   * moves
   * history
   * moveHistory
   * gameHistory
   * records
   * games
   * board
   *
   * 不會自行創造不存在的棋步。
   * =========================================================
   */

  const MOVE_KEYS = [
    "moves",
    "history",
    "moveHistory",
    "gameHistory",
    "moveList",
    "records",
    "games"
  ];


  const BOARD_KEYS = [
    "board",
    "grid",
    "position",
    "state"
  ];


  function isObject(
    value
  ) {

    return (
      value !== null &&
      typeof value === "object"
    );

  }


  function looksLikeMove(
    value
  ) {

    if (!isObject(value)) {
      return false;
    }

    const hasX =
      Number.isFinite(
        Number(value.x)
      );

    const hasY =
      Number.isFinite(
        Number(value.y)
      );

    const hasRow =
      Number.isFinite(
        Number(value.row)
      );

    const hasCol =
      Number.isFinite(
        Number(value.col)
      );

    const hasR =
      Number.isFinite(
        Number(value.r)
      );

    const hasC =
      Number.isFinite(
        Number(value.c)
      );

    return (
      (hasX && hasY) ||
      (hasRow && hasCol) ||
      (hasR && hasC)
    );

  }


  function normalizeMove(
    move,
    index
  ) {

    if (!isObject(move)) {
      return null;
    }


    let row = null;
    let col = null;


    if (
      Number.isFinite(
        Number(move.row)
      ) &&
      Number.isFinite(
        Number(move.col)
      )
    ) {

      row =
        Number(move.row);

      col =
        Number(move.col);

    } else if (
      Number.isFinite(
        Number(move.r)
      ) &&
      Number.isFinite(
        Number(move.c)
      )
    ) {

      row =
        Number(move.r);

      col =
        Number(move.c);

    } else if (
      Number.isFinite(
        Number(move.y)
      ) &&
      Number.isFinite(
        Number(move.x)
      )
    ) {

      row =
        Number(move.y);

      col =
        Number(move.x);

    }


    if (
      row === null ||
      col === null
    ) {

      return null;

    }


    let player =
      move.player ??
      move.color ??
      move.side ??
      move.stone ??
      move.piece ??
      move.turn;


    if (
      typeof player === "string"
    ) {

      const lower =
        player.toLowerCase();

      if (
        lower.includes("black") ||
        lower === "b" ||
        lower === "黑"
      ) {

        player =
          "black";

      } else if (
        lower.includes("white") ||
        lower === "w" ||
        lower === "白"
      ) {

        player =
          "white";

      }

    }


    if (
      player !== "black" &&
      player !== "white"
    ) {

      if (
        Number(player) === 1
      ) {

        player =
          "black";

      } else if (
        Number(player) === 2
      ) {

        player =
          "white";

      }

    }


    return {

      move:
        Number(
          move.move ??
          move.number ??
          move.index ??
          index + 1
        ),

      row,

      col,

      player:
        player === "white"
          ? "white"
          : "black"

    };

  }


  function findMoves(
    root
  ) {

    const found = [];

    const visited =
      new WeakSet();


    function walk(
      value,
      path
    ) {

      if (
        !isObject(value)
      ) {

        return;

      }


      if (
        visited.has(value)
      ) {

        return;

      }


      visited.add(value);


      /*
       * 限制遞迴深度，
       * 避免碰到奇怪的資料結構。
       */

      if (
        path.length > 8
      ) {

        return;

      }


      if (
        Array.isArray(value)
      ) {

        const normalized =
          value
            .filter(
              looksLikeMove
            )
            .map(
              (item, index) =>
                normalizeMove(
                  item,
                  index
                )
            )
            .filter(
              Boolean
            );


        if (
          normalized.length >= 2
        ) {

          found.push(
            normalized
          );

        }


        for (
          let i = 0;
          i < value.length;
          i++
        ) {

          walk(
            value[i],
            path.concat(i)
          );

        }

        return;

      }


      for (
        const [key, child]
        of Object.entries(value)
      ) {

        const lower =
          key.toLowerCase();


        if (
          MOVE_KEYS.some(
            item =>
              lower ===
              item.toLowerCase()
          )
        ) {

          if (
            Array.isArray(child)
          ) {

            const normalized =
              child
                .map(
                  (item, index) =>
                    normalizeMove(
                      item,
                      index
                    )
                )
                .filter(
                  Boolean
                );


            if (
              normalized.length >= 2
            ) {

              found.push(
                normalized
              );

            }

          }

        }


        walk(
          child,
          path.concat(key)
        );

      }

    }


    walk(
      root,
      []
    );


    /*
     * 選擇最長的有效棋譜。
     */

    found.sort(
      (a, b) =>
        b.length - a.length
    );


    return found[0] || [];

  }


  /*
   * =========================================================
   * BOARD DISCOVERY
   * =========================================================
   */

  function findBoard(
    root
  ) {

    let best =
      null;

    const visited =
      new WeakSet();


    function walk(
      value,
      depth
    ) {

      if (
        !isObject(value) ||
        depth > 7
      ) {

        return;

      }


      if (
        visited.has(value)
      ) {

        return;

      }


      visited.add(value);


      if (
        Array.isArray(value)
      ) {

        /*
         * 典型 15x15 棋盤。
         */

        if (
          value.length >= 10 &&
          value.length <= 20 &&
          value.every(
            row =>
              Array.isArray(row) &&
              row.length >= 10 &&
              row.length <= 20
          )
        ) {

          best =
            value;

          return;

        }


        for (
          const item of value
        ) {

          walk(
            item,
            depth + 1
          );

        }

        return;

      }


      for (
        const [key, child]
        of Object.entries(value)
      ) {

        const lower =
          key.toLowerCase();


        if (
          BOARD_KEYS.includes(
            lower
          )
        ) {

          if (
            Array.isArray(child)
          ) {

            walk(
              child,
              depth + 1
            );

          }

        }


        walk(
          child,
          depth + 1
        );

      }

    }


    walk(
      root,
      0
    );


    return best;

  }


  /*
   * =========================================================
   * GAME DISCOVERY
   * =========================================================
   */

  function discoverGames() {

    const storage =
      getAllGomokuStorage();


    const games = [];


    /*
     * 先搜尋 active game。
     */

    for (
      const [key, value]
      of Object.entries(storage)
    ) {

      if (
        key.includes(
          "active-game"
        )
      ) {

        const moves =
          findMoves(value);


        const board =
          findBoard(value);


        if (
          moves.length ||
          board
        ) {

          games.push({

            source:
              key,

            type:
              "active",

            data:
              value,

            moves,

            board

          });

        }

      }

    }


    /*
     * 再搜尋 stats / records / games。
     */

    for (
      const [key, value]
      of Object.entries(storage)
    ) {

      if (
        key.includes(
          "stats"
        ) ||
        key.includes(
          "record"
        ) ||
        key.includes(
          "history"
        )
      ) {

        const moves =
          findMoves(value);


        if (
          moves.length
        ) {

          games.push({

            source:
              key,

            type:
              "record",

            data:
              value,

            moves,

            board:
              findBoard(value)

          });

        }

      }

    }


    return games;

  }


  /*
   * =========================================================
   * GAME RESULT / METADATA
   * ========================================================= */

  function getValue(
    root,
    keys
  ) {

    if (!isObject(root)) {
      return null;
    }


    for (
      const key of keys
    ) {

      if (
        Object.prototype.hasOwnProperty.call(
          root,
          key
        )
      ) {

        return root[key];

      }

    }


    return null;

  }


  function getGameResult(
    data
  ) {

    const result =
      getValue(
        data,
        [
          "result",
          "winner",
          "outcome",
          "status"
        ]
      );


    if (
      typeof result === "string"
    ) {

      return result;

    }


    if (
      Number(result) === 1
    ) {

      return "black";

    }


    if (
      Number(result) === 2
    ) {

      return "white";

    }


    return null;

  }


  function getGameMode(
    data
  ) {

    const mode =
      getValue(
        data,
        [
          "mode",
          "gameMode",
          "playMode"
        ]
      );


    if (
      mode === "local"
    ) {

      return "雙人";

    }


    if (
      mode === "ai"
    ) {

      return "人機";

    }


    return (
      mode ??
      "—"
    );

  }


  function getDifficulty(
    data
  ) {

    return (
      getValue(
        data,
        [
          "difficulty",
          "level"
        ]
      ) ??
      "—"
    );

  }


  function getCharacter(
    data
  ) {

    return (
      getValue(
        data,
        [
          "character",
          "aiCharacter",
          "opponent"
        ]
      ) ??
      "—"
    );

  }


  /*
   * =========================================================
   * BOARD RENDERING
   * ========================================================= */

  function normalizeBoardValue(
    value
  ) {

    if (
      value === null ||
      value === undefined ||
      value === 0 ||
      value === ""
    ) {

      return 0;

    }


    if (
      typeof value === "string"
    ) {

      const lower =
        value.toLowerCase();


      if (
        lower === "black" ||
        lower === "b" ||
        value === "黑"
      ) {

        return 1;

      }


      if (
        lower === "white" ||
        lower === "w" ||
        value === "白"
      ) {

        return 2;

      }

    }


    if (
      Number(value) === 1
    ) {

      return 1;

    }


    if (
      Number(value) === 2
    ) {

      return 2;

    }


    return 0;

  }


  function createBoardFromMoves(
    moves
  ) {

    const size =
      15;

    const board =
      Array.from(
        {
          length:
            size
        },
        () =>
          Array(size).fill(0)
      );


    for (
      const move of moves
    ) {

      const row =
        Number(move.row);

      const col =
        Number(move.col);


      if (
        row < 0 ||
        row >= size ||
        col < 0 ||
        col >= size
      ) {

        continue;

      }


      board[row][col] =
        move.player === "white"
          ? 2
          : 1;

    }


    return board;

  }


  function prepareBoard(
    board,
    moves
  ) {

    if (
      Array.isArray(board) &&
      board.length >= 10
    ) {

      return board.map(
        row =>
          Array.isArray(row)
            ? row.map(
                normalizeBoardValue
              )
            : []
      );

    }


    if (
      moves.length
    ) {

      return createBoardFromMoves(
        moves
      );

    }


    return null;

  }


  function createBoardSVG(
    rawBoard,
    moves
  ) {

    const board =
      prepareBoard(
        rawBoard,
        moves
      );


    if (!board) {

      return `
        <div class="no-board">
          找不到這局的棋盤資料。
        </div>
      `;

    }


    const size =
      Math.max(
        board.length,
        15
      );


    const cell =
      36;

    const padding =
      30;

    const width =
      padding * 2 +
      cell * (size - 1);


    const height =
      width;


    let svg = `

      <svg
        class="gomoku-board"
        viewBox="0 0 ${width} ${height}"
        role="img"
        aria-label="Gomoku board"
      >

        <rect
          x="0"
          y="0"
          width="${width}"
          height="${height}"
          rx="14"
          class="board-bg"
        />

    `;


    /*
     * 格線
     */

    for (
      let i = 0;
      i < size;
      i++
    ) {

      const pos =
        padding +
        i * cell;


      svg += `

        <line
          x1="${padding}"
          y1="${pos}"
          x2="${width - padding}"
          y2="${pos}"
          class="board-line"
        />

        <line
          x1="${pos}"
          y1="${padding}"
          x2="${pos}"
          y2="${height - padding}"
          class="board-line"
        />

      `;

    }


    /*
     * 星位
     */

    const stars =
      size === 15
        ? [
            [3, 3],
            [3, 11],
            [7, 7],
            [11, 3],
            [11, 11]
          ]
        : [];


    for (
      const [row, col]
      of stars
    ) {

      const x =
        padding +
        col * cell;

      const y =
        padding +
        row * cell;


      svg += `

        <circle
          cx="${x}"
          cy="${y}"
          r="3"
          class="star"
        />

      `;

    }


    /*
     * 棋子。
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
          normalizeBoardValue(
            board[row]?.[col]
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


        const moveIndex =
          moves.findIndex(
            move =>
              Number(move.row) === row &&
              Number(move.col) === col
          );


        const number =
          moveIndex >= 0
            ? moveIndex + 1
            : null;


        svg += `

          <circle
            cx="${x}"
            cy="${y}"
            r="14"
            class="${
              value === 1
                ? "stone-black"
                : "stone-white"
            }"
          />

        `;


        if (number !== null) {

          svg += `

            <text
              x="${x}"
              y="${y + 4}"
              text-anchor="middle"
              class="${
                value === 1
                  ? "stone-number-black"
                  : "stone-number-white"
              }"
            >
              ${number}
            </text>

          `;

        }

      }

    }


    svg += `
      </svg>
    `;


    return svg;

  }


  /*
   * =========================================================
   * MOVE LIST
   * ========================================================= */

  function coordinate(
    row,
    col
  ) {

    const letters =
      "ABCDEFGHJKLMNOPQRSTUVWXYZ";


    const letter =
      letters[col] ??
      String(
        col + 1
      );


    return (
      `${letter}${row + 1}`
    );

  }


  function playerName(
    player
  ) {

    return player === "white"
      ? "白棋"
      : "黑棋";

  }


  function createMoveTable(
    moves
  ) {

    if (!moves.length) {

      return `
        <p class="muted">
          找不到這局的完整棋譜。
        </p>
      `;

    }


    let html = `

      <table class="moves">

        <thead>

          <tr>
            <th>手數</th>
            <th>棋子</th>
            <th>位置</th>
          </tr>

        </thead>

        <tbody>

    `;


    for (
      let i = 0;
      i < moves.length;
      i++
    ) {

      const move =
        moves[i];


      html += `

        <tr>

          <td>
            ${i + 1}
          </td>

          <td>
            <span
              class="mini-stone ${
                move.player === "white"
                  ? "white"
                  : "black"
              }"
            ></span>

            ${playerName(
              move.player
            )}
          </td>

          <td>
            ${coordinate(
              Number(move.row),
              Number(move.col)
            )}
          </td>

        </tr>

      `;

    }


    html += `

        </tbody>

      </table>

    `;


    return html;

  }


  /*
   * =========================================================
   * STATISTICS
   * ========================================================= */

  function findStats() {

    const storage =
      getAllGomokuStorage();


    const stats =
      storage[
        "gomoku-stats-v5"
      ];


    if (
      !isObject(stats)
    ) {

      return null;

    }


    return stats;

  }


  function statValue(
    stats,
    keys
  ) {

    if (!stats) {
      return 0;
    }


    const value =
      getValue(
        stats,
        keys
      );


    return (
      Number.isFinite(
        Number(value)
      )
        ? Number(value)
        : 0
    );

  }


  /*
   * =========================================================
   * SETTINGS
   * ========================================================= */

  function findSettings() {

    const storage =
      getAllGomokuStorage();


    return (
      storage[
        "gomoku-settings-v5"
      ] ?? null
    );

  }


  function getCurrentLanguage() {

    try {

      return (
        localStorage.getItem(
          LANGUAGE_KEY
        ) ||
        document.documentElement.lang ||
        "zh-TW"
      );

    } catch {

      return (
        document.documentElement.lang ||
        "zh-TW"
      );

    }

  }


  /*
   * =========================================================
   * PDF DOCUMENT
   * =========================================================
   *
   * 不產生假的 binary PDF。
   *
   * 使用瀏覽器原生列印引擎：
   *
   * HTML
   *   ↓
   * print()
   *   ↓
   * Save as PDF
   *
   * 這樣：
   *
   * - 中文正常
   * - 日文正常
   * - 韓文正常
   * - SVG 棋盤正常
   * - PWA 不需要 CDN
   *
   * =========================================================
   */

  function buildPDFDocument() {

    const storage =
      getAllGomokuStorage();


    const stats =
      findStats();


    const settings =
      findSettings();


    const games =
      discoverGames();


    const active =
      games.filter(
        game =>
          game.type === "active"
      );


    const records =
      games.filter(
        game =>
          game.type === "record"
      );


    const totalGames =
      statValue(
        stats,
        [
          "games",
          "totalGames",
          "played"
        ]
      );


    const wins =
      statValue(
        stats,
        [
          "wins",
          "win"
        ]
      );


    const losses =
      statValue(
        stats,
        [
          "losses",
          "loss"
        ]
      );


    const draws =
      statValue(
        stats,
        [
          "draws",
          "draw"
        ]
      );


    let gameSections =
      "";


    /*
     * 優先輸出真正找到的棋局。
     */

    const allGames =
      [
        ...active,
        ...records
      ];


    if (!allGames.length) {

      gameSections = `

        <section class="empty">

          <h2>
            棋局
          </h2>

          <p>
            目前找不到可以還原的完整棋局資料。
          </p>

          <p class="muted">
            Export 不會自行建立不存在的棋譜。
          </p>

        </section>

      `;

    } else {

      allGames.forEach(
        (game, index) => {

          const moves =
            game.moves || [];


          const board =
            game.board;


          const data =
            game.data || {};


          const typeLabel =
            game.type === "active"
              ? "未完成棋局"
              : "棋局記錄";


          gameSections += `

            <section class="game-section">

              <div class="game-header">

                <div>

                  <div class="eyebrow">
                    GAME ${index + 1}
                  </div>

                  <h2>
                    ${typeLabel}
                  </h2>

                </div>

                <div class="move-count">
                  ${moves.length} 手
                </div>

              </div>


              <div class="metadata">

                <div>
                  <span>
                    對戰方式
                  </span>
                  <strong>
                    ${escapeHTML(
                      getGameMode(data)
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    難度
                  </span>
                  <strong>
                    ${escapeHTML(
                      getDifficulty(data)
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    AI 對手
                  </span>
                  <strong>
                    ${escapeHTML(
                      getCharacter(data)
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    資料來源
                  </span>
                  <strong>
                    ${escapeHTML(
                      game.source
                    )}
                  </strong>
                </div>

              </div>


              <div class="board-and-moves">

                <div class="board-container">

                  ${createBoardSVG(
                    board,
                    moves
                  )}

                </div>

                <div class="move-container">

                  <h3>
                    棋譜
                  </h3>

                  ${createMoveTable(
                    moves
                  )}

                </div>

              </div>

            </section>

          `;

        }
      );

    }


    const language =
      getCurrentLanguage();


    const exportedAt =
      formatDate();


    return `

<!DOCTYPE html>

<html
  lang="zh-TW"
>

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1"
>

<title>
Gomoku Game Report
</title>


<style>

@page {

  size: A4;

  margin: 16mm;

}


* {

  box-sizing:
    border-box;

}


html,
body {

  margin:
    0;

  padding:
    0;

}


body {

  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "SF Pro Display",
    "SF Pro Text",
    "Noto Sans TC",
    "Noto Sans JP",
    "Noto Sans KR",
    "PingFang TC",
    "Hiragino Sans GB",
    "Malgun Gothic",
    sans-serif;

  color:
    #25231f;

  background:
    #f8f5ef;

  line-height:
    1.6;

}


.report {

  max-width:
    900px;

  margin:
    0 auto;

}


.cover {

  min-height:
    245mm;

  display:
    flex;

  flex-direction:
    column;

  justify-content:
    center;

}


.logo {

  width:
    62px;

  height:
    62px;

  border-radius:
    50%;

  background:
    #25231f;

  position:
    relative;

  margin-bottom:
    26px;

}


.logo::after {

  content:
    "";

  position:
    absolute;

  width:
    38px;

  height:
    38px;

  border-radius:
    50%;

  background:
    #f8f5ef;

  left:
    30px;

  top:
    30px;

}


.eyebrow {

  font-size:
    11px;

  letter-spacing:
    .18em;

  text-transform:
    uppercase;

  opacity:
    .55;

}


h1 {

  font-size:
    48px;

  line-height:
    1.05;

  margin:
    0 0 12px;

  letter-spacing:
    -.04em;

}


h2 {

  font-size:
    26px;

  line-height:
    1.2;

  margin:
    0 0 16px;

}


h3 {

  font-size:
    16px;

  margin:
    0 0 10px;

}


.subtitle {

  font-size:
    17px;

  opacity:
    .65;

}


.divider {

  height:
    1px;

  background:
    #d8d0c3;

  margin:
    32px 0;

}


.meta-cover {

  display:
    grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap:
    14px;

  max-width:
    500px;

}


.meta-item {

  padding:
    12px 14px;

  border:
    1px solid #ded7ca;

  border-radius:
    12px;

  background:
    rgba(255,255,255,.45);

}


.meta-item span {

  display:
    block;

  font-size:
    11px;

  opacity:
    .55;

  margin-bottom:
    3px;

}


.meta-item strong {

  display:
    block;

  font-size:
    14px;

}


.stats {

  display:
    grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap:
    12px;

  margin:
    20px 0 32px;

}


.stat {

  border:
    1px solid #ded7ca;

  border-radius:
    14px;

  padding:
    18px;

  background:
    white;

}


.stat span {

  display:
    block;

  font-size:
    12px;

  opacity:
    .55;

}


.stat strong {

  display:
    block;

  font-size:
    27px;

  margin-top:
    2px;

}


.game-section {

  break-before:
    page;

  page-break-before:
    always;

}


.game-section:first-of-type {

  break-before:
    auto;

  page-break-before:
    auto;

}


.game-header {

  display:
    flex;

  justify-content:
    space-between;

  align-items:
    flex-end;

  margin-bottom:
    18px;

}


.move-count {

  font-size:
    13px;

  opacity:
    .55;

}


.metadata {

  display:
    grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap:
    10px;

  margin-bottom:
    24px;

}


.metadata > div {

  border:
    1px solid #ded7ca;

  border-radius:
    10px;

  padding:
    10px 12px;

  background:
    white;

}


.metadata span {

  display:
    block;

  font-size:
    10px;

  opacity:
    .55;

}


.metadata strong {

  display:
    block;

  font-size:
    12px;

  margin-top:
    2px;

  word-break:
    break-word;

}


.board-and-moves {

  display:
    grid;

  grid-template-columns:
    minmax(0, 1fr)
    250px;

  gap:
    24px;

  align-items:
    start;

}


.board-container {

  background:
    #e8d5ad;

  border-radius:
    16px;

  padding:
    12px;

  border:
    1px solid #d5c095;

}


.gomoku-board {

  display:
    block;

  width:
    100%;

  height:
    auto;

}


.board-bg {

  fill:
    #e8d5ad;

}


.board-line {

  stroke:
    #7b6748;

  stroke-width:
    1;

  opacity:
    .65;

}


.star {

  fill:
    #6a5537;

}


.stone-black {

  fill:
    #242321;

  stroke:
    #111;

  stroke-width:
    1.5;

}


.stone-white {

  fill:
    #f7f4ee;

  stroke:
    #6d6559;

  stroke-width:
    1.5;

}


.stone-number-black {

  fill:
    white;

  font-size:
    8px;

  font-weight:
    700;

}


.stone-number-white {

  fill:
    #292722;

  font-size:
    8px;

  font-weight:
    700;

}


.no-board {

  min-height:
    300px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  text-align:
    center;

  opacity:
    .55;

  padding:
    30px;

}


.moves {

  width:
    100%;

  border-collapse:
    collapse;

  background:
    white;

  border:
    1px solid #ded7ca;

  border-radius:
    12px;

  overflow:
    hidden;

}


.moves th,
.moves td {

  padding:
    7px 9px;

  text-align:
    left;

  border-bottom:
    1px solid #eee9e0;

  font-size:
    11px;

}


.moves th {

  font-size:
    10px;

  opacity:
    .55;

  font-weight:
    600;

}


.moves tr:last-child td {

  border-bottom:
    none;

}


.mini-stone {

  width:
    12px;

  height:
    12px;

  display:
    inline-block;

  vertical-align:
    -2px;

  border-radius:
    50%;

  margin-right:
    4px;

}


.mini-stone.black {

  background:
    #242321;

}


.mini-stone.white {

  background:
    #f7f4ee;

  border:
    1px solid #777;

}


.empty {

  padding:
    80px 0;

  text-align:
    center;

}


.muted {

  opacity:
    .55;

}


.footer {

  margin-top:
    40px;

  padding-top:
    14px;

  border-top:
    1px solid #ded7ca;

  font-size:
    10px;

  opacity:
    .45;

}


@media print {

  body {

    background:
      white;

  }


  .report {

    max-width:
      none;

  }


  .board-container {

    break-inside:
      avoid;

  }


  .moves {

    break-inside:
      auto;

  }

}


</style>

</head>


<body>

<div class="report">


  <section class="cover">

    <div class="logo"></div>

    <div class="eyebrow">
      GOMOKU
    </div>

    <h1>
      Game Report
    </h1>

    <p class="subtitle">
      棋局與遊戲資料
    </p>


    <div class="divider"></div>


    <div class="meta-cover">

      <div class="meta-item">

        <span>
          匯出時間
        </span>

        <strong>
          ${escapeHTML(
            exportedAt
          )}
        </strong>

      </div>


      <div class="meta-item">

        <span>
          語言
        </span>

        <strong>
          ${escapeHTML(
            language
          )}
        </strong>

      </div>


      <div class="meta-item">

        <span>
          備份版本
        </span>

        <strong>
          v${BACKUP_VERSION}
        </strong>

      </div>


      <div class="meta-item">

        <span>
          資料來源
        </span>

        <strong>
          Gomoku PWA
        </strong>

      </div>

    </div>


  </section>


  <section>

    <div class="eyebrow">
      OVERVIEW
    </div>

    <h2>
      遊戲統計
    </h2>


    <div class="stats">

      <div class="stat">

        <span>
          對局
        </span>

        <strong>
          ${totalGames}
        </strong>

      </div>


      <div class="stat">

        <span>
          勝利
        </span>

        <strong>
          ${wins}
        </strong>

      </div>


      <div class="stat">

        <span>
          失敗
        </span>

        <strong>
          ${losses}
        </strong>

      </div>


      <div class="stat">

        <span>
          平局
        </span>

        <strong>
          ${draws}
        </strong>

      </div>

    </div>


    <div class="footer">

      Gomoku · Offline Game

    </div>

  </section>


  ${gameSections}


  <section class="footer">

    <p>
      本報告由 Gomoku PWA 產生。
    </p>

    <p>
      PDF 使用瀏覽器原生列印引擎產生。
    </p>

  </section>


</div>

</body>

</html>

    `;

  }


  /*
   * =========================================================
   * PDF EXPORT
   * ========================================================= */

  function exportPDF() {

    const html =
      buildPDFDocument();


    const printWindow =
      window.open(
        "",
        "_blank",
        "noopener,noreferrer"
      );


    if (!printWindow) {

      showToast(
        "無法開啟 PDF 預覽，請允許彈出視窗"
      );

      return;

    }


    printWindow.document.open();

    printWindow.document.write(
      html
    );

    printWindow.document.close();


    /*
     * 等待 SVG / CSS 完成。
     */

    setTimeout(
      () => {

        printWindow.focus();

        printWindow.print();

      },
      450
    );


    showToast(
      "正在開啟 PDF"
    );

  }


  /*
   * =========================================================
   * BUTTON BINDING
   * ========================================================= */

  function bindOnce(
    element,
    event,
    handler,
    marker
  ) {

    if (!element) {
      return;
    }


    if (
      element.dataset[marker] ===
      "1"
    ) {

      return;

    }


    element.dataset[marker] =
      "1";


    element.addEventListener(
      event,
      handler
    );

  }


  function bindButtons() {

    /*
     * JSON Export
     */

    bindOnce(
      document.querySelector(
        "#exportButton"
      ),
      "click",
      exportJSON,
      "exportBound"
    );


    /*
     * PDF Export
     */

    bindOnce(
      document.querySelector(
        "#exportPDFButton"
      ),
      "click",
      exportPDF,
      "pdfBound"
    );


    /*
     * Import
     */

    bindOnce(
      document.querySelector(
        "#importButton"
      ),
      "click",
      openImportPicker,
      "importBound"
    );


    /*
     * File input
     */

    bindOnce(
      document.querySelector(
        "#importFileInput"
      ),
      "change",
      async event => {

        const file =
          event.target.files?.[0];


        if (!file) {
          return;
        }


        try {

          await importJSONFile(
            file
          );

        } catch (error) {

          console.error(
            "[Gomoku Export]",
            error
          );


          showToast(
            error.message ||
            "匯入失敗"
          );

        }

      },
      "importInputBound"
    );


    /*
     * 舊 ID 相容
     */

    bindOnce(
      document.querySelector(
        "#exportJSONButton"
      ),
      "click",
      exportJSON,
      "legacyExportBound"
    );

  }


  /*
   * =========================================================
   * PUBLIC API
   * ========================================================= */

  window.GomokuExport = {

    exportJSON,

    exportPDF,

    importFile:
      importJSONFile,

    createBackup,

    discoverGames,

    getStorage:
      getAllGomokuStorage

  };


  /*
   * =========================================================
   * BOOT
   * ========================================================= */

  function init() {

    bindButtons();

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once:
          true
      }
    );

  } else {

    init();

  }

})();
