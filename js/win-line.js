(() => {
  "use strict";

  /*
   * =========================================================
   * Gomoku — Winning Line Enhancement
   * =========================================================
   *
   * app.js is intentionally untouched.
   *
   * app.js remains responsible for:
   * - win detection
   * - winningLine
   * - drawing the actual winning line
   *
   * This file ONLY enhances the already-rendered winning line.
   *
   * =========================================================
   */

  const board = document.getElementById("boardCanvas");

  if (!board) {
    return;
  }


  /* =========================================================
     CONFIG
     ========================================================= */

  const LINE = {
    r: 212,
    g: 109,
    b: 82,

    tolerance: 34,

    minSamples: 10,

    glow: "rgba(212, 109, 82, 0.30)",

    highlight:
      "rgba(255, 255, 255, 0.72)",

    color:
      "#d46d52"
  };


  /* =========================================================
     STATE
     ========================================================= */

  let overlay = null;

  let ctx = null;

  let raf = 0;

  let resizeObserver = null;

  let lastSignature = "";

  let line = null;

  let destroyed = false;


  /* =========================================================
     MOTION
     ========================================================= */

  function motionEnabled() {

    if (
      document.documentElement.dataset.motion ===
      "off"
    ) {
      return false;
    }


    if (
      window.matchMedia &&
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      return false;
    }


    const toggle =
      document.getElementById(
        "motionToggle"
      );


    if (
      toggle instanceof HTMLInputElement
    ) {
      return toggle.checked;
    }


    return true;
  }


  /* =========================================================
     CREATE OVERLAY
     ========================================================= */

  function ensureOverlay() {

    if (overlay) {
      return true;
    }


    const parent =
      board.parentElement;


    if (!parent) {
      return false;
    }


    const style =
      getComputedStyle(parent);


    if (
      style.position ===
      "static"
    ) {
      parent.style.position =
        "relative";
    }


    overlay =
      document.createElement(
        "canvas"
      );


    overlay.id =
      "gomokuWinningLineOverlay";


    overlay.setAttribute(
      "aria-hidden",
      "true"
    );


    Object.assign(
      overlay.style,
      {
        position: "absolute",

        inset: "0",

        width: "100%",

        height: "100%",

        display: "block",

        pointerEvents: "none",

        zIndex: "30"
      }
    );


    parent.appendChild(
      overlay
    );


    ctx =
      overlay.getContext(
        "2d"
      );


    if (!ctx) {

      overlay.remove();

      overlay = null;

      return false;
    }


    resize();


    return true;
  }


  /* =========================================================
     RESIZE
     ========================================================= */

  function resize() {

    if (
      !overlay ||
      !ctx ||
      destroyed
    ) {
      return;
    }


    const rect =
      board.getBoundingClientRect();


    if (
      rect.width <= 0 ||
      rect.height <= 0
    ) {
      return;
    }


    const dpr =
      Math.min(
        Math.max(
          window.devicePixelRatio ||
          1,
          1
        ),
        3
      );


    overlay.width =
      Math.round(
        rect.width * dpr
      );


    overlay.height =
      Math.round(
        rect.height * dpr
      );


    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );


    ctx.clearRect(
      0,
      0,
      rect.width,
      rect.height
    );
  }


  /* =========================================================
     CLEAR
     ========================================================= */

  function clear() {

    if (
      !ctx ||
      !overlay
    ) {
      return;
    }


    const rect =
      board.getBoundingClientRect();


    ctx.clearRect(
      0,
      0,
      rect.width,
      rect.height
    );
  }


  /* =========================================================
     COLOR DISTANCE
     ========================================================= */

  function colorDistance(
    r,
    g,
    b
  ) {

    return Math.sqrt(
      (r - LINE.r) ** 2 +
      (g - LINE.g) ** 2 +
      (b - LINE.b) ** 2
    );
  }


  /* =========================================================
     FIND THE EXISTING WINNING LINE
     =========================================================

     IMPORTANT:

     We do NOT inspect black stones.

     We do NOT inspect white stones.

     We do NOT calculate five-in-a-row.

     We ONLY search for the winning line that
     app.js has already rendered using:

       #d46d52

     ========================================================= */

  function findRenderedLine() {

    if (
      !board.width ||
      !board.height
    ) {
      return null;
    }


    const source =
      document.createElement(
        "canvas"
      );


    source.width =
      board.width;


    source.height =
      board.height;


    const sourceCtx =
      source.getContext(
        "2d",
        {
          willReadFrequently:
            true
        }
      );


    if (!sourceCtx) {
      return null;
    }


    try {

      sourceCtx.drawImage(
        board,
        0,
        0
      );

    } catch {

      return null;
    }


    const width =
      board.width;


    const height =
      board.height;


    let data;

    try {

      data =
        sourceCtx
          .getImageData(
            0,
            0,
            width,
            height
          )
          .data;

    } catch {

      return null;
    }


    let minX = width;

    let minY = height;

    let maxX = -1;

    let maxY = -1;

    let count = 0;


    /*
     * 每兩個像素取一次。
     *
     * 這樣在 iPad 上不會一直把整張
     * 高 DPR canvas 全部掃一遍。
     */

    for (
      let y = 0;
      y < height;
      y += 2
    ) {

      for (
        let x = 0;
        x < width;
        x += 2
      ) {

        const index =
          (
            y * width +
            x
          ) * 4;


        const r =
          data[index];


        const g =
          data[index + 1];


        const b =
          data[index + 2];


        const a =
          data[index + 3];


        if (
          a > 180 &&
          colorDistance(
            r,
            g,
            b
          ) <=
            LINE.tolerance
        ) {

          minX =
            Math.min(
              minX,
              x
            );


          minY =
            Math.min(
              minY,
              y
            );


          maxX =
            Math.max(
              maxX,
              x
            );


          maxY =
            Math.max(
              maxY,
              y
            );


          count++;
        }
      }
    }


    if (
      count <
        LINE.minSamples ||
      maxX < minX ||
      maxY < minY
    ) {
      return null;
    }


    const rect =
      board.getBoundingClientRect();


    const scaleX =
      rect.width /
      width;


    const scaleY =
      rect.height /
      height;


    const x1 =
      minX *
      scaleX;


    const y1 =
      minY *
      scaleY;


    const x2 =
      maxX *
      scaleX;


    const y2 =
      maxY *
      scaleY;


    const dx =
      x2 - x1;


    const dy =
      y2 - y1;


    const length =
      Math.hypot(
        dx,
        dy
      );


    /*
     * 一個小色塊不能被當成勝利線。
     */

    if (
      length <
      rect.width * 0.12
    ) {
      return null;
    }


    return {

      x1,

      y1,

      x2,

      y2,

      length,

      signature: [
        Math.round(x1),
        Math.round(y1),
        Math.round(x2),
        Math.round(y2)
      ].join(":")
    };
  }


  /* =========================================================
     DRAW
     ========================================================= */

  function draw(
    progress = 1,
    glowPhase = 0
  ) {

    if (
      !ctx ||
      !overlay ||
      !line
    ) {
      return;
    }


    const rect =
      board.getBoundingClientRect();


    clear();


    const dx =
      line.x2 -
      line.x1;


    const dy =
      line.y2 -
      line.y1;


    const length =
      Math.hypot(
        dx,
        dy
      );


    if (!length) {
      return;
    }


    const ux =
      dx /
      length;


    const uy =
      dy /
      length;


    /*
     * 讓線稍微超出兩端。
     */

    const extend =
      Math.min(
        rect.width,
        rect.height
      ) * 0.018;


    const startX =
      line.x1 -
      ux *
        extend;


    const startY =
      line.y1 -
      uy *
        extend;


    const endX =
      line.x1 +
      dx *
        progress +
      ux *
        extend;


    const endY =
      line.y1 +
      dy *
        progress +
      uy *
        extend;


    const pulse =
      0.82 +
      Math.sin(
        glowPhase
      ) *
        0.18;


    ctx.save();


    ctx.lineCap =
      "round";


    ctx.lineJoin =
      "round";


    /* =====================================================
       OUTER GLOW
       ===================================================== */

    ctx.globalAlpha =
      0.72 *
      pulse;


    ctx.strokeStyle =
      LINE.glow;


    ctx.lineWidth =
      Math.max(
        10,
        rect.width *
          0.025
      );


    ctx.shadowColor =
      LINE.glow;


    ctx.shadowBlur =
      Math.max(
        10,
        rect.width *
          0.035
      );


    ctx.beginPath();


    ctx.moveTo(
      startX,
      startY
    );


    ctx.lineTo(
      endX,
      endY
    );


    ctx.stroke();


    /* =====================================================
       CRISP CORE
       ===================================================== */

    ctx.globalAlpha =
      0.78;


    ctx.shadowBlur =
      0;


    ctx.strokeStyle =
      LINE.color;


    ctx.lineWidth =
      Math.max(
        3,
        rect.width *
          0.008
      );


    ctx.beginPath();


    ctx.moveTo(
      startX,
      startY
    );


    ctx.lineTo(
      endX,
      endY
    );


    ctx.stroke();


    /* =====================================================
       WHITE HIGHLIGHT
       ===================================================== */

    ctx.globalAlpha =
      0.38 *
      pulse;


    ctx.strokeStyle =
      LINE.highlight;


    ctx.lineWidth =
      Math.max(
        1.5,
        rect.width *
          0.0028
      );


    ctx.beginPath();


    ctx.moveTo(
      startX,
      startY
    );


    ctx.lineTo(
      endX,
      endY
    );


    ctx.stroke();


    ctx.restore();
  }


  /* =========================================================
     ANIMATION CONTROL
     ========================================================= */

  function stopAnimation() {

    if (raf) {

      cancelAnimationFrame(
        raf
      );

      raf = 0;
    }
  }


  function pulse(
    now
  ) {

    if (
      destroyed ||
      !line
    ) {
      return;
    }


    draw(
      1,
      now / 700
    );


    raf =
      requestAnimationFrame(
        pulse
      );
  }


  function animateReveal() {

    stopAnimation();


    if (!line) {
      return;
    }


    if (
      !motionEnabled()
    ) {

      draw(
        1,
        0
      );

      return;
    }


    const started =
      performance.now();


    const duration =
      520;


    function frame(
      now
    ) {

      if (
        destroyed ||
        !line
      ) {
        return;
      }


      const t =
        Math.min(
          1,
          (
            now -
            started
          ) /
            duration
        );


      /*
       * cubic ease-out
       */

      const eased =
        1 -
        Math.pow(
          1 - t,
          3
        );


      draw(
        eased,
        t *
          Math.PI *
          4
      );


      if (
        t < 1
      ) {

        raf =
          requestAnimationFrame(
            frame
          );

      } else {

        raf =
          requestAnimationFrame(
            pulse
          );
      }
    }


    raf =
      requestAnimationFrame(
        frame
      );
  }


  /* =========================================================
     REFRESH
     ========================================================= */

  function refresh() {

    if (
      destroyed ||
      !ensureOverlay()
    ) {
      return;
    }


    const detected =
      findRenderedLine();


    const signature =
      detected
        ? detected.signature
        : "";


    /*
     * 勝利線消失。
     *
     * 通常代表：
     * - 重新開始
     * - 返回首頁
     * - 開始新棋局
     */

    if (!detected) {

      if (
        lastSignature
      ) {

        lastSignature =
          "";

        line =
          null;

        stopAnimation();

        clear();
      }

      return;
    }


    line =
      detected;


    /*
     * 只有新的勝利線出現時才重新播放。
     */

    if (
      signature !==
      lastSignature
    ) {

      lastSignature =
        signature;

      animateReveal();
    }
  }


  /* =========================================================
     RESIZE OBSERVER
     ========================================================= */

  function observeCanvas() {

    if (
      typeof ResizeObserver ===
      "undefined"
    ) {
      return;
    }


    if (
      resizeObserver
    ) {

      resizeObserver.disconnect();
    }


    resizeObserver =
      new ResizeObserver(
        () => {

          resize();

          requestAnimationFrame(
            refresh
          );
        }
      );


    resizeObserver.observe(
      board
    );
  }


  /* =========================================================
     MOTION SETTING
     ========================================================= */

  function observeSettings() {

    const toggle =
      document.getElementById(
        "motionToggle"
      );


    if (!toggle) {
      return;
    }


    toggle.addEventListener(
      "change",
      () => {

        if (!line) {
          return;
        }


        if (
          motionEnabled()
        ) {

          animateReveal();

        } else {

          stopAnimation();

          draw(
            1,
            0
          );
        }
      }
    );
  }


  /* =========================================================
     START
     ========================================================= */

  function start() {

    if (
      !ensureOverlay()
    ) {
      return;
    }


    observeCanvas();

    observeSettings();


    /*
     * app.js 是直接畫 Canvas。
     *
     * Canvas 內部變化不會觸發
     * MutationObserver。
     *
     * 所以這裡使用低頻 polling。
     *
     * 180ms：
     * - 足夠抓到勝利狀態
     * - 不會每 frame 掃整張 canvas
     * - 對 iPad 比較友善
     */

    const poll =
      () => {

        if (
          destroyed
        ) {
          return;
        }


        refresh();


        window.setTimeout(
          poll,
          180
        );
      };


    poll();


    window.addEventListener(
      "resize",
      () => {

        requestAnimationFrame(
          refresh
        );

      },
      {
        passive: true
      }
    );


    window.addEventListener(
      "orientationchange",
      () => {

        window.setTimeout(
          () => {

            resize();

            refresh();

          },
          120
        );

      },
      {
        passive: true
      }
    );
  }


  /* =========================================================
     DESTROY
     ========================================================= */

  function destroy() {

    destroyed =
      true;


    stopAnimation();


    if (
      resizeObserver
    ) {

      resizeObserver.disconnect();

      resizeObserver =
        null;
    }


    if (overlay) {

      overlay.remove();

      overlay =
        null;
    }


    ctx =
      null;


    line =
      null;


    lastSignature =
      "";
  }


  /* =========================================================
     PUBLIC API
     ========================================================= */

  window.GomokuWinningLine = {

    refresh,

    destroy

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
      start,
      {
        once: true
      }
    );

  } else {

    start();
  }

})();
