(() => {
  "use strict";

  /*
   * =========================================================
   * GOMOKU EXPORT
   * =========================================================
   *
   * 完全獨立於 app.js
   *
   * 讀取：
   * - gomoku-active-game-v5
   * - gomoku-stats-v5
   * - gomoku-settings-v5
   *
   * 支援：
   * - JSON
   * - CSV
   * - Clipboard
   * - PWA / Safari
   *
   * 不使用任何第三方套件。
   * =========================================================
   */

  const STORAGE_KEYS = {
    activeGame: "gomoku-active-game-v5",
    stats: "gomoku-stats-v5",
    settings: "gomoku-settings-v5"
  };

  const APP_NAME = "Gomoku";


  /*
   * =========================================================
   * SAFE STORAGE
   * =========================================================
   */

  function readStorage(key) {
    try {
      const value = localStorage.getItem(key);

      if (!value) {
        return null;
      }

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch {
      return null;
    }
  }


  function getExportData() {
    return {
      app: APP_NAME,

      exportedAt: new Date().toISOString(),

      version: 1,

      data: {
        activeGame:
          readStorage(
            STORAGE_KEYS.activeGame
          ),

        stats:
          readStorage(
            STORAGE_KEYS.stats
          ),

        settings:
          readStorage(
            STORAGE_KEYS.settings
          )
      }
    };
  }


  /*
   * =========================================================
   * FILE DOWNLOAD
   * =========================================================
   */

  function downloadFile(
    content,
    filename,
    mimeType
  ) {

    const blob =
      new Blob(
        [content],
        {
          type:
            mimeType +
            ";charset=utf-8"
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      filename;

    link.style.display =
      "none";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(
        url
      );
    }, 1000);
  }


  /*
   * =========================================================
   * JSON EXPORT
   * =========================================================
   */

  function exportJSON() {

    const data =
      getExportData();

    const json =
      JSON.stringify(
        data,
        null,
        2
      );

    const date =
      createDateString();

    downloadFile(
      json,
      `gomoku-export-${date}.json`,
      "application/json"
    );

    return data;
  }


  /*
   * =========================================================
   * CSV
   * =========================================================
   */

  function csvEscape(value) {

    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    const string =
      typeof value === "object"
        ? JSON.stringify(value)
        : String(value);

    if (
      /[",\n\r]/.test(
        string
      )
    ) {
      return `"${string.replace(
        /"/g,
        '""'
      )}"`;
    }

    return string;
  }


  function createCSVRows(
    object,
    prefix = "",
    rows = []
  ) {

    if (
      object === null ||
      object === undefined
    ) {

      rows.push([
        prefix,
        ""
      ]);

      return rows;
    }


    if (
      typeof object !== "object"
    ) {

      rows.push([
        prefix,
        object
      ]);

      return rows;
    }


    if (
      Array.isArray(object)
    ) {

      if (
        object.length === 0
      ) {

        rows.push([
          prefix,
          "[]"
        ]);

        return rows;
      }


      object.forEach(
        (
          value,
          index
        ) => {

          const nextPrefix =
            prefix
              ? `${prefix}.${index}`
              : String(index);

          createCSVRows(
            value,
            nextPrefix,
            rows
          );

        }
      );

      return rows;
    }


    const keys =
      Object.keys(
        object
      );


    if (
      keys.length === 0
    ) {

      rows.push([
        prefix,
        "{}"
      ]);

      return rows;
    }


    keys.forEach(
      key => {

        const nextPrefix =
          prefix
            ? `${prefix}.${key}`
            : key;

        createCSVRows(
          object[key],
          nextPrefix,
          rows
        );

      }
    );


    return rows;
  }


  function exportCSV() {

    const data =
      getExportData();

    const rows = [
      [
        "field",
        "value"
      ]
    ];


    createCSVRows(
      data,
      "",
      rows
    );


    const csv =
      rows
        .map(
          row =>
            row
              .map(
                csvEscape
              )
              .join(",")
        )
        .join("\r\n");


    const date =
      createDateString();


    downloadFile(
      "\uFEFF" + csv,
      `gomoku-export-${date}.csv`,
      "text/csv"
    );

    return data;
  }


  /*
   * =========================================================
   * CLIPBOARD
   * =========================================================
   */

  async function copyJSON() {

    const data =
      getExportData();

    const json =
      JSON.stringify(
        data,
        null,
        2
      );


    try {

      if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText ===
          "function"
      ) {

        await navigator.clipboard.writeText(
          json
        );

        return true;
      }

    } catch {}


    /*
     * Safari / fallback
     */

    try {

      const textarea =
        document.createElement(
          "textarea"
        );

      textarea.value =
        json;

      textarea.style.position =
        "fixed";

      textarea.style.opacity =
        "0";

      textarea.style.pointerEvents =
        "none";

      document.body.appendChild(
        textarea
      );

      textarea.focus();

      textarea.select();

      const success =
        document.execCommand(
          "copy"
        );

      textarea.remove();

      return success;

    } catch {

      return false;

    }
  }


  /*
   * =========================================================
   * IMPORT
   * =========================================================
   *
   * 預留給未來。
   * 目前不會自動覆蓋使用者資料。
   * =========================================================
   */

  function validateExportData(
    data
  ) {

    if (
      !data ||
      typeof data !== "object"
    ) {
      return false;
    }

    if (
      data.app !== APP_NAME
    ) {
      return false;
    }

    if (
      !data.data ||
      typeof data.data !== "object"
    ) {
      return false;
    }

    return true;
  }


  /*
   * =========================================================
   * DATE
   * =========================================================
   */

  function createDateString() {

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
   * PUBLIC API
   * =========================================================
   */

  window.GomokuExport = {

    exportJSON,

    exportCSV,

    copyJSON,

    getData:
      getExportData,

    validate:
      validateExportData

  };


  /*
   * =========================================================
   * AUTO BIND
   * =========================================================
   *
   * 如果 HTML 裡存在以下 ID：
   *
   * #exportJSONButton
   * #exportCSVButton
   * #copyExportButton
   *
   * 就自動綁定。
   * =========================================================
   */

  function bindButtons() {

    const jsonButton =
      document.querySelector(
        "#exportJSONButton"
      );

    const csvButton =
      document.querySelector(
        "#exportCSVButton"
      );

    const copyButton =
      document.querySelector(
        "#copyExportButton"
      );


    if (jsonButton) {

      jsonButton.addEventListener(
        "click",
        () => {

          exportJSON();

        }
      );

    }


    if (csvButton) {

      csvButton.addEventListener(
        "click",
        () => {

          exportCSV();

        }
      );

    }


    if (copyButton) {

      copyButton.addEventListener(
        "click",
        async () => {

          const success =
            await copyJSON();


          if (success) {

            showExportToast(
              "已複製匯出資料"
            );

          } else {

            showExportToast(
              "複製失敗"
            );

          }

        }
      );

    }

  }


  /*
   * =========================================================
   * TOAST
   * =========================================================
   */

  function showExportToast(
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
      showExportToast.timer
    );


    showExportToast.timer =
      setTimeout(
        () => {

          toast.classList.remove(
            "show"
          );

        },
        1800
      );

  }


  /*
   * =========================================================
   * BOOT
   * =========================================================
   */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      bindButtons,
      {
        once: true
      }
    );

  } else {

    bindButtons();

  }

})();
