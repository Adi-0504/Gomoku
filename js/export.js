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
   *
   * - 匯出棋局記錄
   * - JSON
   * - CSV
   * - 自動尋找 localStorage
   * - 支援 PWA
   * - 支援 Safari
   * - 不需要任何第三方套件
   * =========================================================
   */


  const EXPORT_BUTTON_ID =
    "exportRecordsButton";


  /*
   * =========================================================
   * STORAGE KEYS
   * =========================================================
   *
   * 優先使用這些常見 key。
   *
   * 這樣 export.js 不需要依賴 app.js。
   */

  const STORAGE_KEYS = [

    "gomoku-records",

    "gomokuRecords",

    "gomoku-record",

    "gomoku-game-records",

    "gomoku_games",

    "gomokuGames",

    "gameRecords",

    "game-records",

    "records"

  ];


  /*
   * =========================================================
   * SAFE LOCAL STORAGE
   * =========================================================
   */

  function getStorageValue(
    key
  ) {

    try {

      return localStorage.getItem(
        key
      );

    } catch {

      return null;

    }

  }


  /*
   * =========================================================
   * PARSE
   * =========================================================
   */

  function parseJSON(
    value
  ) {

    if (
      typeof value !==
      "string"
    ) {

      return null;

    }


    try {

      return JSON.parse(
        value
      );

    } catch {

      return null;

    }

  }


  /*
   * =========================================================
   * FIND RECORDS
   * =========================================================
   */

  function findRecords() {

    /*
     * 先找已知 key
     */

    for (
      const key of STORAGE_KEYS
    ) {

      const raw =
        getStorageValue(
          key
        );


      if (!raw) {
        continue;
      }


      const parsed =
        parseJSON(
          raw
        );


      if (
        Array.isArray(
          parsed
        )
      ) {

        return {
          key,
          records:
            parsed
        };

      }


      /*
       * 有些 app 會包在 object 裡
       */

      if (
        parsed &&
        typeof parsed ===
        "object"
      ) {

        const candidates = [
          parsed.records,
          parsed.games,
          parsed.history,
          parsed.items
        ];


        for (
          const candidate
          of candidates
        ) {

          if (
            Array.isArray(
              candidate
            )
          ) {

            return {
              key,
              records:
                candidate
            };

          }

        }

      }

    }


    /*
     * =======================================================
     * 第二層：
     * 掃描 localStorage
     * =======================================================
     *
     * 這是為了避免 app.js 使用了不同的 key。
     */

    try {

      for (
        let index = 0;
        index < localStorage.length;
        index++
      ) {

        const key =
          localStorage.key(
            index
          );


        if (!key) {
          continue;
        }


        const lower =
          key.toLowerCase();


        if (
          !(
            lower.includes(
              "gomoku"
            ) ||
            lower.includes(
              "record"
            ) ||
            lower.includes(
              "game"
            )
          )
        ) {

          continue;

        }


        const raw =
          localStorage.getItem(
            key
          );


        const parsed =
          parseJSON(
            raw
          );


        if (
          Array.isArray(
            parsed
          )
        ) {

          return {
            key,
            records:
              parsed
          };

        }


        if (
          parsed &&
          typeof parsed ===
          "object"
        ) {

          const candidates = [
            parsed.records,
            parsed.games,
            parsed.history,
            parsed.items
          ];


          for (
            const candidate
            of candidates
          ) {

            if (
              Array.isArray(
                candidate
              )
            ) {

              return {
                key,
                records:
                  candidate
              };

            }

          }

        }

      }

    } catch {}



    /*
     * 找不到
     */

    return {
      key:
        null,

      records:
        []

    };

  }


  /*
   * =========================================================
   * TOAST
   * =========================================================
   */

  function showToast(
    message
  ) {

    const toast =
      document.querySelector(
        "#toast"
      );


    if (!toast) {

      window.alert(
        message
      );

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
        2400
      );

  }


  /*
   * =========================================================
   * DOWNLOAD
   * =========================================================
   */

  function downloadFile(
    content,
    filename,
    mimeType
  ) {

    const blob =
      new Blob(
        [
          content
        ],
        {
          type:
            mimeType
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


  /*
   * =========================================================
   * DATE
   * =========================================================
   */

  function getDateString() {

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


    return (
      `${year}-${month}-${day}`
    );

  }


  /*
   * =========================================================
   * JSON EXPORT
   * =========================================================
   */

  function exportJSON(
    records
  ) {

    const data = {

      app:
        "Gomoku",

      exportedAt:
        new Date().toISOString(),

      totalGames:
        records.length,

      records

    };


    const json =
      JSON.stringify(
        data,
        null,
        2
      );


    downloadFile(
      json,
      `gomoku-records-${getDateString()}.json`,
      "application/json;charset=utf-8"
    );

  }


  /*
   * =========================================================
   * CSV ESCAPE
   * =========================================================
   */

  function escapeCSV(
    value
  ) {

    if (
      value ===
      null ||
      value ===
      undefined
    ) {

      return "";

    }


    const text =
      String(
        value
      );


    return (
      `"${text
        .replace(
          /"/g,
          '""'
        )
      }"`
    );

  }


  /*
   * =========================================================
   * FLATTEN RECORD
   * =========================================================
   */

  function flattenRecord(
    record,
    index
  ) {

    if (
      !record ||
      typeof record !==
      "object"
    ) {

      return {

        index:
          index + 1,

        date:
          "",

        result:
          "",

        mode:
          "",

        difficulty:
          "",

        character:
          "",

        side:
          "",

        moves:
          ""

      };

    }


    return {

      index:
        index + 1,

      date:
        record.date ??
        record.createdAt ??
        record.timestamp ??
        record.time ??
        "",

      result:
        record.result ??
        record.outcome ??
        record.winner ??
        "",

      mode:
        record.mode ??
        record.gameMode ??
        "",

      difficulty:
        record.difficulty ??
        "",

      character:
        record.character ??
        record.ai ??
        record.opponent ??
        "",

      side:
        record.side ??
        record.playerSide ??
        "",

      moves:
        Array.isArray(
          record.moves
        )
          ? record.moves.length
          : (
              record.moveCount ??
              ""
            )

    };

  }


  /*
   * =========================================================
   * CSV EXPORT
   * =========================================================
   */

  function exportCSV(
    records
  ) {

    const headers = [

      "Game",

      "Date",

      "Result",

      "Mode",

      "Difficulty",

      "Character",

      "Side",

      "Moves"

    ];


    const rows = [
      headers
    ];


    records.forEach(
      (
        record,
        index
      ) => {

        const item =
          flattenRecord(
            record,
            index
          );


        rows.push([

          item.index,

          item.date,

          item.result,

          item.mode,

          item.difficulty,

          item.character,

          item.side,

          item.moves

        ]);

      }
    );


    const csv =
      rows
        .map(
          row =>
            row
              .map(
                escapeCSV
              )
              .join(",")
        )
        .join("\r\n");


    /*
     * UTF-8 BOM
     *
     * 讓 Excel / Numbers
     * 正確讀取中文。
     */

    const content =
      "\uFEFF" +
      csv;


    downloadFile(
      content,
      `gomoku-records-${getDateString()}.csv`,
      "text/csv;charset=utf-8"
    );

  }


  /*
   * =========================================================
   * EXPORT MENU
   * =========================================================
   */

  function createExportMenu(
    records
  ) {

    /*
     * 如果已經存在選單，
     * 先移除。
     */

    const existing =
      document.querySelector(
        "#gomokuExportMenu"
      );


    if (existing) {

      existing.remove();

    }


    const overlay =
      document.createElement(
        "div"
      );


    overlay.id =
      "gomokuExportMenu";


    overlay.style.position =
      "fixed";


    overlay.style.inset =
      "0";


    overlay.style.zIndex =
      "9999";


    overlay.style.background =
      "rgba(0,0,0,.35)";


    overlay.style.display =
      "flex";


    overlay.style.alignItems =
      "center";


    overlay.style.justifyContent =
      "center";


    overlay.innerHTML = `

      <div
        role="dialog"
        aria-modal="true"
        style="
          width:min(90vw,360px);
          background:var(--surface,#fff);
          color:var(--text,#222);
          border-radius:20px;
          padding:24px;
          box-sizing:border-box;
          box-shadow:0 20px 60px rgba(0,0,0,.25);
        "
      >

        <h3
          style="
            margin:0 0 8px;
          "
        >
          匯出棋局
        </h3>


        <p
          style="
            margin:0 0 20px;
            opacity:.65;
          "
        >
          共 ${records.length} 局
        </p>


        <div
          style="
            display:grid;
            gap:10px;
          "
        >

          <button
            type="button"
            id="gomokuExportJSON"
            class="primary-button full-button"
          >
            JSON
          </button>


          <button
            type="button"
            id="gomokuExportCSV"
            class="secondary-button full-button"
          >
            CSV
          </button>


          <button
            type="button"
            id="gomokuExportCancel"
            class="secondary-button full-button"
          >
            取消
          </button>

        </div>

      </div>

    `;


    document.body.appendChild(
      overlay
    );


    const jsonButton =
      overlay.querySelector(
        "#gomokuExportJSON"
      );


    const csvButton =
      overlay.querySelector(
        "#gomokuExportCSV"
      );


    const cancelButton =
      overlay.querySelector(
        "#gomokuExportCancel"
      );


    jsonButton.addEventListener(
      "click",
      () => {

        exportJSON(
          records
        );


        overlay.remove();

      }
    );


    csvButton.addEventListener(
      "click",
      () => {

        exportCSV(
          records
        );


        overlay.remove();

      }
    );


    cancelButton.addEventListener(
      "click",
      () => {

        overlay.remove();

      }
    );


    overlay.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          overlay
        ) {

          overlay.remove();

        }

      }
    );

  }


  /*
   * =========================================================
   * MAIN EXPORT
   * =========================================================
   */

  function handleExport() {

    const result =
      findRecords();


    const records =
      result.records;


    if (
      !records.length
    ) {

      showToast(
        getMessage(
          "empty"
        )
      );

      return;

    }


    createExportMenu(
      records
    );

  }


  /*
   * =========================================================
   * I18N MESSAGE
   * =========================================================
   */

  function getMessage(
    type
  ) {

    try {

      if (
        window.GomokuI18n &&
        typeof window.GomokuI18n.t ===
        "function"
      ) {

        if (
          type ===
          "empty"
        ) {

          return window.GomokuI18n.t(
            "records.exportEmpty"
          );

        }

      }

    } catch {}


    return (
      type ===
      "empty"
        ? "目前沒有可以匯出的棋局。"
        : "Export failed."
    );

  }


  /*
   * =========================================================
   * BIND
   * =========================================================
   */

  function bind() {

    const button =
      document.querySelector(
        `#${EXPORT_BUTTON_ID}`
      );


    if (!button) {

      return;

    }


    /*
     * 避免 app.js / PWA
     * 重複初始化時綁定多次。
     */

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
      handleExport
    );

  }


  /*
   * =========================================================
   * PUBLIC API
   * =========================================================
   */

  window.GomokuExport = {

    exportJSON() {

      const {
        records
      } =
        findRecords();


      if (
        !records.length
      ) {

        showToast(
          getMessage(
            "empty"
          )
        );

        return;

      }


      exportJSON(
        records
      );

    },


    exportCSV() {

      const {
        records
      } =
        findRecords();


      if (
        !records.length
      ) {

        showToast(
          getMessage(
            "empty"
          )
        );

        return;

      }


      exportCSV(
        records
      );

    },


    getRecords() {

      return findRecords();

    }

  };


  /*
   * =========================================================
   * INIT
   * =========================================================
   */

  function init() {

    bind();

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
