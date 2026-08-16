"use strict";

/*
 * Gomoku Polish Layer
 *
 * 不修改 app.js。
 * 只做安全的外部 UX 強化。
 */

(() => {

  const TOUCH_MOVE_LIMIT = 14;

  let pointer = null;

  function isTouchLike(event) {
    return (
      event.pointerType === "touch" ||
      event.pointerType === "pen"
    );
  }

  /*
   * 防止棋盤滑動時誤觸。
   *
   * 注意：
   * 不直接呼叫 app.js 的 playMove。
   * 只在事件層阻止瀏覽器把觸控
   * 當成頁面捲動。
   */
  function setupBoardTouch() {

    const canvas =
      document.querySelector(
        "#boardCanvas"
      );

    if (!canvas) {
      return;
    }

    canvas.addEventListener(
      "pointerdown",
      event => {

        if (
          !isTouchLike(event)
        ) {
          return;
        }

        pointer = {
          id:
            event.pointerId,

          x:
            event.clientX,

          y:
            event.clientY,

          moved: false
        };

      },
      {
        passive: true
      }
    );

    canvas.addEventListener(
      "pointermove",
      event => {

        if (
          !pointer ||
          pointer.id !==
            event.pointerId
        ) {
          return;
        }

        const distance =
          Math.hypot(
            event.clientX -
              pointer.x,

            event.clientY -
              pointer.y
          );

        if (
          distance >
          TOUCH_MOVE_LIMIT
        ) {
          pointer.moved =
            true;
        }

      },
      {
        passive: true
      }
    );

    canvas.addEventListener(
      "pointerup",
      event => {

        if (
          !pointer ||
          pointer.id !==
            event.pointerId
        ) {
          return;
        }

        /*
         * 讓棋盤本身的原始事件
         * 正常處理。
         *
         * 這裡只清除狀態。
         */
        pointer = null;

      },
      {
        passive: true
      }
    );

    canvas.addEventListener(
      "pointercancel",
      () => {
        pointer = null;
      },
      {
        passive: true
      }
    );

  }

  /*
   * 所有按鈕增加「按下」的視覺回饋。
   * 不改 app.js。
   */
  function setupButtonFeedback() {

    document.addEventListener(
      "pointerdown",
      event => {

        const button =
          event.target.closest(
            "button"
          );

        if (!button) {
          return;
        }

        if (
          button.disabled
        ) {
          return;
        }

        button.classList.add(
          "gomoku-pressed"
        );

      },
      {
        passive: true
      }
    );

    const clear =
      event => {

        const button =
          event.target.closest(
            "button"
          );

        if (!button) {
          return;
        }

        button.classList.remove(
          "gomoku-pressed"
        );

      };

    document.addEventListener(
      "pointerup",
      clear,
      {
        passive: true
      }
    );

    document.addEventListener(
      "pointercancel",
      clear,
      {
        passive: true
      }
    );

  }

  /*
   * 修復已損壞的 JSON storage。
   *
   * 不碰正常資料。
   */
  function validateLocalStorage() {

    const keys = [];

    for (
      let i = 0;
      i < localStorage.length;
      i++
    ) {

      const key =
        localStorage.key(i);

      if (
        key &&
        key.toLowerCase()
          .includes("gomoku")
      ) {
        keys.push(key);
      }

    }

    for (const key of keys) {

      try {

        const value =
          localStorage.getItem(
            key
          );

        if (
          value === null
        ) {
          continue;
        }

        JSON.parse(value);

      } catch {

        try {
          localStorage.removeItem(
            key
          );
        } catch {}

        console.warn(
          "[Gomoku] Removed corrupted storage:",
          key
        );
      }

    }

  }

  /*
   * 防止雙擊放大頁面。
   */
  function setupDoubleTapProtection() {

    let lastTap = 0;

    document.addEventListener(
      "touchend",
      event => {

        const now =
          performance.now();

        if (
          now - lastTap <
          280
        ) {

          const button =
            event.target.closest(
              "button"
            );

          if (!button) {
            return;
          }

          event.preventDefault();
        }

        lastTap = now;

      },
      {
        passive: false
      }
    );

  }

  function boot() {

    validateLocalStorage();

    setupBoardTouch();

    setupButtonFeedback();

    setupDoubleTapProtection();

    document.documentElement
      .classList.add(
        "gomoku-polish-ready"
      );

  }

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      boot,
      {
        once: true
      }
    );

  } else {

    boot();

  }

})();
