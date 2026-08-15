(() => {
  "use strict";

  /*
   * =========================================================
   * GOMOKU EXPORT / IMPORT
   * =========================================================
   *
   * 完全獨立於 app.js
   *
   * 不：
   * - 呼叫 app.js
   * - 讀取 app.js 變數
   * - 依賴 app.js API
   * - 依賴第三方套件
   *
   * 只使用：
   * - localStorage
   * - File API
   * - Blob
   * - DOM
   *
   * =========================================================
   */

  const APP_NAME = "Gomoku";

  const BACKUP_FORMAT = "gomoku-backup";

  const BACKUP_VERSION = 2;


  /*
   * =========================================================
   * STORAGE
   * =========================================================
   *
   * app.js 目前使用：
   *
   * gomoku-active-game-v5
   * gomoku-stats-v5
   * gomoku-settings-v5
   *
   * i18n.js 使用：
   *
   * gomoku-language
   *
   * 另外也會自動捕捉其他 gomoku-* key，
   * 避免未來新增資料時忘記加入備份。
   * =========================================================
   */

  const REQUIRED_KEYS = [
    "gomoku-active-game-v5",
    "gomoku-stats-v5",
    "gomoku-settings-v5"
  ];

  const KEY_PREFIX = "gomoku-";


  /*
   * =========================================================
   * SAFE STORAGE
   * =========================================================
   */

  function getStorageKeys() {

    const keys = new Set();

    for (const key of REQUIRED_KEYS) {
      keys.add(key);
    }


    try {

      for (let i = 0; i < localStorage.length; i++) {

        const key =
          localStorage.key(i);

        if (
          typeof key === "string" &&
          key.startsWith(KEY_PREFIX)
        ) {
          keys.add(key);
        }

      }

    } catch {}

    return [...keys];
  }


  function readStorageValue(key) {

    try {

      const raw =
        localStorage.getItem(key);

      if (raw === null) {
        return null;
      }


      try {

        return JSON.parse(raw);

      } catch {

        return raw;

      }

    } catch {

      return null;

    }
  }


  function writeStorageValue(
    key,
    value
  ) {

    try {

      if (value === null) {

        localStorage.removeItem(
          key
        );

        return true;

      }


      if (
        typeof value === "string"
      ) {

        /*
         * 這裡仍然使用 JSON.stringify，
         * 讓匯出格式永遠一致。
         */

        localStorage.setItem(
          key,
          JSON.stringify(value)
        );

      } else {

        localStorage.setItem(
          key,
          JSON.stringify(value)
        );

      }

      return true;

    } catch {

      return false;

    }

  }


  /*
   * =========================================================
   * CREATE BACKUP
   * =========================================================
   */

  function collectStorage() {

    const storage = {};

    const keys =
      getStorageKeys();


    for (const key of keys) {

      const value =
        readStorageValue(key);


      /*
       * 不存在的 key 不需要寫進備份。
       */

      if (value !== null) {

        storage[key] =
          value;

      }

    }


    return storage;

  }


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
        collectStorage()

    };

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
        [content],
        {
          type:
            `${mimeType};charset=utf-8`
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


    link.download =
      filename;


    link.style.display =
      "none";


    document.body.appendChild(
      link
    );


    link.click();


    link.remove();


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
   * EXPORT JSON
   * =========================================================
   */

  function exportJSON() {

    const backup =
      createBackup();


    const json =
      JSON.stringify(
        backup,
        null,
        2
      );


    const filename =
      `gomoku-backup-${createDateString()}.json`;


    downloadFile(
      json,
      filename,
      "application/json"
    );


    showToast(
      "資料已匯出"
    );


    return backup;

  }


  /*
   * =========================================================
   * VALIDATION
   * =========================================================
   */

  function validateBackup(
    data
  ) {

    if (
      !data ||
      typeof data !== "object"
    ) {

      return {
        valid: false,
        reason: "檔案格式錯誤"
      };

    }


    /*
     * 新格式
     */

    if (
      data.format === BACKUP_FORMAT &&
      data.app === APP_NAME &&
      data.storage &&
      typeof data.storage === "object" &&
      !Array.isArray(data.storage)
    ) {

      return {
        valid: true,
        version:
          data.version || 1
      };

    }


    /*
     * 相容舊版 export.js：
     *
     * {
     *   app: "Gomoku",
     *   version: 1,
     *   data: {
     *     activeGame,
     *     stats,
     *     settings
     *   }
     * }
     */

    if (
      data.app === APP_NAME &&
      data.data &&
      typeof data.data === "object"
    ) {

      return {
        valid: true,
        legacy: true,
        version:
          data.version || 1
      };

    }


    return {
      valid: false,
      reason: "這不是有效的 Gomoku 備份檔"
    };

  }


  /*
   * =========================================================
   * NORMALIZE BACKUP
   * =========================================================
   */

  function normalizeBackup(
    data
  ) {

    const validation =
      validateBackup(data);


    if (!validation.valid) {

      throw new Error(
        validation.reason
      );

    }


    /*
     * 新版格式
     */

    if (!validation.legacy) {

      return {
        ...data.storage
      };

    }


    /*
     * 舊版格式轉換
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


  /*
   * =========================================================
   * IMPORT
   * =========================================================
   */

  async function importFile(
    file
  ) {

    if (!file) {

      throw new Error(
        "沒有選擇檔案"
      );

    }


    if (
      !file.name
        .toLowerCase()
        .endsWith(".json")
    ) {

      throw new Error(
        "只能匯入 JSON 備份檔"
      );

    }


    const text =
      await file.text();


    let data;


    try {

      data =
        JSON.parse(text);

    } catch {

      throw new Error(
        "JSON 檔案格式錯誤"
      );

    }


    const storage =
      normalizeBackup(
        data
      );


    const keys =
      Object.keys(storage);


    if (!keys.length) {

      throw new Error(
        "備份檔沒有可恢復的資料"
      );

    }


    /*
     * 先建立目前資料的安全快照。
     *
     * 如果中途失敗，可以盡量恢復。
     */

    const previous =
      collectStorage();


    try {

      /*
       * 只處理 Gomoku key。
       */

      for (const key of keys) {

        if (
          !key.startsWith(
            KEY_PREFIX
          )
        ) {

          continue;

        }


        const success =
          writeStorageValue(
            key,
            storage[key]
          );


        if (!success) {

          throw new Error(
            `無法寫入資料：${key}`
          );

        }

      }


      /*
       * 對新版備份而言：
       *
       * 如果備份裡有某個 Gomoku key，
       * 就以備份為準。
       *
       * 備份沒有的舊 key 不會亂刪，
       * 避免舊版本資料被意外破壞。
       */

    } catch (error) {

      /*
       * 還原原本資料。
       */

      for (
        const key of Object.keys(previous)
      ) {

        try {

          localStorage.setItem(
            key,
            JSON.stringify(
              previous[key]
            )
          );

        } catch {}

      }


      throw error;

    }


    /*
     * 匯入成功。
     *
     * reload 是為了讓：
     *
     * app.js
     * i18n.js
     * UI
     *
     * 全部重新讀取 storage。
     *
     * 這不是依賴 app.js。
     */

    showToast(
      "匯入成功，正在重新載入"
    );


    setTimeout(
      () => {

        window.location.reload();

      },
      650
    );


    return true;

  }


  /*
   * =========================================================
   * FILE PICKER
   * =========================================================
   */

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


    /*
     * 清空 value。
     *
     * 這樣同一個 JSON
     * 匯入兩次也會觸發 change。
     */

    input.value =
      "";


    input.click();

  }


  /*
   * =========================================================
   * BUTTON BINDING
   * =========================================================
   */

  function bindButtonOnce(
    element,
    event,
    handler,
    marker
  ) {

    if (!element) {
      return;
    }


    if (
      element.dataset[
        marker
      ] === "1"
    ) {

      return;

    }


    element.dataset[
      marker
    ] = "1";


    element.addEventListener(
      event,
      handler
    );

  }


  function bindButtons() {

    /*
     * 新 HTML
     */

    const exportButton =
      document.querySelector(
        "#exportButton"
      );


    const importButton =
      document.querySelector(
        "#importButton"
      );


    const importFileInput =
      document.querySelector(
        "#importFileInput"
      );


    /*
     * 相容之前可能使用的 ID。
     */

    const legacyJSONButton =
      document.querySelector(
        "#exportJSONButton"
      );


    const legacyCopyButton =
      document.querySelector(
        "#copyExportButton"
      );


    /*
     * Export
     */

    bindButtonOnce(
      exportButton,
      "click",
      () => {

        exportJSON();

      },
      "gomokuExportBound"
    );


    bindButtonOnce(
      legacyJSONButton,
      "click",
      () => {

        exportJSON();

      },
      "gomokuExportBound"
    );


    /*
     * Import button
     */

    bindButtonOnce(
      importButton,
      "click",
      () => {

        openImportPicker();

      },
      "gomokuImportBound"
    );


    /*
     * File input
     */

    bindButtonOnce(
      importFileInput,
      "change",
      async event => {

        const file =
          event.target.files?.[0];


        if (!file) {
          return;
        }


        try {

          await importFile(
            file
          );

        } catch (error) {

          console.error(
            "[Gomoku Export]",
            error
          );


          showToast(
            error?.message ||
            "匯入失敗"
          );

        }

      },
      "gomokuImportInputBound"
    );


    /*
     * 舊版 Clipboard button
     */

    bindButtonOnce(
      legacyCopyButton,
      "click",
      async () => {

        const success =
          await copyJSON();


        showToast(
          success
            ? "已複製匯出資料"
            : "複製失敗"
        );

      },
      "gomokuCopyBound"
    );

  }


  /*
   * =========================================================
   * CLIPBOARD
   * =========================================================
   */

  async function copyJSON() {

    const backup =
      createBackup();


    const json =
      JSON.stringify(
        backup,
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


      textarea.style.left =
        "-9999px";


      textarea.style.top =
        "0";


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
   * TOAST
   * =========================================================
   */

  let toastTimer =
    null;


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


  /*
   * =========================================================
   * PUBLIC API
   * =========================================================
   *
   * 注意：
   *
   * 這只是 export.js 自己的 API。
   *
   * app.js 完全不需要呼叫它。
   * =========================================================
   */

  window.GomokuExport = {

    exportJSON,

    importFile,

    copyJSON,

    getData:
      createBackup,

    validate:
      validateBackup

  };


  /*
   * =========================================================
   * BOOT
   * =========================================================
   */

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
        once: true
      }
    );

  } else {

    init();

  }

})();
