(() => {
  "use strict";

  /*
   * =========================================================
   * GOMOKU — WINNING LINE POLISH
   * =========================================================
   *
   * IMPORTANT:
   * - app.js is NOT modified.
   * - We hook the board Canvas drawing API.
   * - We detect the winning-line stroke directly.
   * - No pixel recognition.
   * - No game-state duplication.
   *
   * app.js remains the source of truth.
   * =========================================================
   */

  const WINNING_COLOR = "#d46d52";

  const BOARD_ID = "boardCanvas";

  const OVERLAY_ID =
    "gomoku-winning-line-overlay";

  let board = null;

  let overlay = null;

  let overlayContext = null;

  let hookedContext = null;

  let currentPath = [];

  let lastWinningPath = null;

  let animationFrame = 0;

  let animationStart = 0;

  let resizeObserver = null;

  let destroyed = false;


  /*
   * =========================================================
   * MOTION
   * =========================================================
   */

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


  /*
   * =========================================================
   * FIND BOARD
   * =========================================================
   */

  function findBoard() {

    board =
      document.getElementById(
        BOARD_ID
      );

    return !!board;
  }


  /*
   * =========================================================
   * OVERLAY
   * =========================================================
   */

  function createOverlay() {

    if (
      overlay ||
      !board
    ) {
      return;
    }

    const parent =
      board.parentElement;

    if (!parent) {
      return;
    }

    const parentStyle =
      getComputedStyle(parent);

    if (
      parentStyle.position ===
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
      OVERLAY_ID;

    overlay.setAttribute(
      "aria-hidden",
      "true"
    );

    Object.assign(
      overlay.style,
      {
        position: "absolute",

        left: "0",

        top: "0",

        width: "100%",

        height: "100%",

        pointerEvents: "none",

        zIndex: "100",

        display: "block"
      }
    );

    parent.appendChild(
      overlay
    );

    overlayContext =
      overlay.getContext(
        "2d"
      );

    resizeOverlay();
  }


  /*
   * =========================================================
   * RESIZE
   * =========================================================
   */

  function resizeOverlay() {

    if (
      !overlay ||
      !overlayContext ||
      !board
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

    const parentRect =
      board.parentElement.getBoundingClientRect();

    const left =
      rect.left -
      parentRect.left;

    const top =
      rect.top -
      parentRect.top;

    overlay.style.left =
      `${left}px`;

    overlay.style.top =
      `${top}px`;

    overlay.style.width =
      `${rect.width}px`;

    overlay.style.height =
      `${rect.height}px`;

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
        rect.width *
        dpr
      );

    overlay.height =
      Math.round(
        rect.height *
        dpr
      );

    overlayContext.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    clearOverlay();
  }


  /*
   * =========================================================
   * CLEAR
   * =========================================================
   */

  function clearOverlay() {

    if (
      !overlayContext ||
      !overlay
    ) {
      return;
    }

    const rect =
      overlay.getBoundingClientRect();

    overlayContext.clearRect(
      0,
      0,
      rect.width,
      rect.height
    );
  }


  /*
   * =========================================================
   * COLOR NORMALIZATION
   * =========================================================
   */

  function normalizeColor(
    color
  ) {

    if (
      typeof color !==
      "string"
    ) {
      return "";
    }

    return color
      .replace(
        /\s+/g,
        ""
      )
      .toLowerCase();
  }


  function isWinningColor(
    color
  ) {

    const normalized =
      normalizeColor(
        color
      );

    return (
      normalized ===
      WINNING_COLOR
    );
  }


  /*
   * =========================================================
   * PATH TRACKING
   * =========================================================
   *
   * We intercept:
   *
   *   beginPath()
   *   moveTo()
   *   lineTo()
   *   stroke()
   *
   * This lets us know exactly where app.js drew
   * the winning line.
   *
   * No screenshot analysis.
   * No board-state duplication.
   * =========================================================
   */

  function installCanvasHook() {

    if (
      hookedContext ||
      !board
    ) {
      return;
    }

    const context =
      board.getContext(
        "2d"
      );

    if (!context) {
      return;
    }

    hookedContext =
      context;

    const originalBeginPath =
      context.beginPath.bind(
        context
      );

    const originalMoveTo =
      context.moveTo.bind(
        context
      );

    const originalLineTo =
      context.lineTo.bind(
        context
      );

    const originalStroke =
      context.stroke.bind(
        context
      );

    context.beginPath =
      function () {

        currentPath = [];

        return originalBeginPath();
      };


    context.moveTo =
      function (
        x,
        y
      ) {

        currentPath.push({
          type: "move",

          x,

          y
        });

        return originalMoveTo(
          x,
          y
        );
      };


    context.lineTo =
      function (
        x,
        y
      ) {

        currentPath.push({
          type: "line",

          x,

          y
        });

        return originalLineTo(
          x,
          y
        );
      };


    context.stroke =
      function (...args) {

        const color =
          context.strokeStyle;

        const path =
          currentPath.slice();

        const result =
          originalStroke(
            ...args
          );

        if (
          isWinningColor(
            color
          ) &&
          path.length >= 2
        ) {

          captureWinningPath(
            path
          );
        }

        return result;
      };
  }


  /*
   * =========================================================
   * CAPTURE WINNING PATH
   * =========================================================
   */

  function captureWinningPath(
    path
  ) {

    if (
      destroyed
    ) {
      return;
    }

    const points =
      path.filter(
        item =>
          item &&
          (
            item.type ===
              "move" ||
            item.type ===
              "line"
          )
      );

    if (
      points.length <
      2
    ) {
      return;
    }

    const start =
      points[0];

    const end =
      points[
        points.length - 1
      ];

    const dx =
      end.x -
      start.x;

    const dy =
      end.y -
      start.y;

    const length =
      Math.hypot(
        dx,
        dy
      );

    if (
      length <
      10
    ) {
      return;
    }

    lastWinningPath = {

      x1: start.x,

      y1: start.y,

      x2: end.x,

      y2: end.y,

      length
    };

    drawWinningLine(
      true
    );
  }


  /*
   * =========================================================
   * COORDINATE CONVERSION
   * =========================================================
   *
   * app.js Canvas coordinates can differ from CSS pixels
   * on Retina displays.
   * =========================================================
   */

  function getScale() {

    if (
      !board
    ) {
      return {
        x: 1,
        y: 1
      };
    }

    const rect =
      board.getBoundingClientRect();

    return {

      x:
        rect.width /
        board.width,

      y:
        rect.height /
        board.height
    };
  }


  /*
   * =========================================================
   * DRAW WINNING LINE
   * =========================================================
   */

  function drawWinningLine(
    animate
  ) {

    if (
      !overlayContext ||
      !overlay ||
      !lastWinningPath
    ) {
      return;
    }

    cancelAnimationFrame(
      animationFrame
    );

    const scale =
      getScale();

    const x1 =
      lastWinningPath.x1 *
      scale.x;

    const y1 =
      lastWinningPath.y1 *
      scale.y;

    const x2 =
      lastWinningPath.x2 *
      scale.x;

    const y2 =
      lastWinningPath.y2 *
      scale.y;

    const dx =
      x2 -
      x1;

    const dy =
      y2 -
      y1;

    const length =
      Math.hypot(
        dx,
        dy
      );

    if (
      length <= 0
    ) {
      return;
    }

    const ux =
      dx /
      length;

    const uy =
      dy /
      length;

    const rect =
      board.getBoundingClientRect();

    const extend =
      Math.min(
        rect.width,
        rect.height
      ) * 0.018;

    const sx =
      x1 -
      ux *
        extend;

    const sy =
      y1 -
      uy *
        extend;

    const ex =
      x2 +
      ux *
        extend;

    const ey =
      y2 +
      uy *
        extend;


    /*
     * -------------------------------------------------------
     * REDUCED MOTION
     * -------------------------------------------------------
     */

    if (
      !animate ||
      !motionEnabled()
    ) {

      renderLine(
        sx,
        sy,
        ex,
        ey,
        1
      );

      return;
    }


    /*
     * -------------------------------------------------------
     * REVEAL ANIMATION
     * -------------------------------------------------------
     */

    animationStart =
      performance.now();

    const duration =
      480;


    function frame(
      now
    ) {

      if (
        destroyed ||
        !lastWinningPath
      ) {
        return;
      }

      const progress =
        Math.min(
          1,
          (
            now -
            animationStart
          ) /
            duration
        );

      const eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );

      renderLine(
        sx,
        sy,
        sx +
          (
            ex -
            sx
          ) *
            eased,
        sy +
          (
            ey -
            sy
          ) *
            eased,
        progress
      );

      if (
        progress <
        1
      ) {

        animationFrame =
          requestAnimationFrame(
            frame
          );

      } else {

        startPulse();
      }
    }


    animationFrame =
      requestAnimationFrame(
        frame
      );
  }


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  function renderLine(
    x1,
    y1,
    x2,
    y2,
    progress
  ) {

    if (
      !overlayContext ||
      !overlay
    ) {
      return;
    }

    const rect =
      board.getBoundingClientRect();

    overlayContext.clearRect(
      0,
      0,
      rect.width,
      rect.height
    );

    const dx =
      x2 -
      x1;

    const dy =
      y2 -
      y1;

    const length =
      Math.hypot(
        dx,
        dy
      );

    if (
      length <= 0
    ) {
      return;
    }


    /*
     * -------------------------------------------------------
     * GLOW
     * -------------------------------------------------------
     */

    overlayContext.save();

    overlayContext.lineCap =
      "round";

    overlayContext.lineJoin =
      "round";

    overlayContext.globalAlpha =
      0.48;

    overlayContext.strokeStyle =
      "rgba(212,109,82,0.55)";

    overlayContext.lineWidth =
      Math.max(
        9,
        rect.width *
          0.022
      );

    overlayContext.shadowColor =
      "rgba(212,109,82,0.52)";

    overlayContext.shadowBlur =
      Math.max(
        10,
        rect.width *
          0.035
      );

    overlayContext.beginPath();

    overlayContext.moveTo(
      x1,
      y1
    );

    overlayContext.lineTo(
      x2,
      y2
    );

    overlayContext.stroke();


    /*
     * -------------------------------------------------------
     * CORE
     * -------------------------------------------------------
     */

    overlayContext.globalAlpha =
      0.95;

    overlayContext.shadowBlur =
      0;

    overlayContext.strokeStyle =
      "#d46d52";

    overlayContext.lineWidth =
      Math.max(
        3,
        rect.width *
          0.007
      );

    overlayContext.beginPath();

    overlayContext.moveTo(
      x1,
      y1
    );

    overlayContext.lineTo(
      x2,
      y2
    );

    overlayContext.stroke();


    /*
     * -------------------------------------------------------
     * HIGHLIGHT
     * -------------------------------------------------------
     */

    overlayContext.globalAlpha =
      0.48 *
      Math.max(
        0.6,
        progress
      );

    overlayContext.strokeStyle =
      "rgba(255,255,255,0.78)";

    overlayContext.lineWidth =
      Math.max(
        1.3,
        rect.width *
          0.0025
      );

    overlayContext.beginPath();

    overlayContext.moveTo(
      x1,
      y1
    );

    overlayContext.lineTo(
      x2,
      y2
    );

    overlayContext.stroke();

    overlayContext.restore();
  }


  /*
   * =========================================================
   * SOFT PULSE
   * =========================================================
   */

  function startPulse() {

    if (
      !motionEnabled()
    ) {
      return;
    }

    const pulseStart =
      performance.now();


    function frame(
      now
    ) {

      if (
        destroyed ||
        !lastWinningPath
      ) {
        return;
      }

      const elapsed =
        now -
        pulseStart;

      const phase =
        (
          elapsed %
          1400
        ) /
        1400;

      const alpha =
        0.78 +
        Math.sin(
          phase *
            Math.PI *
            2
        ) *
          0.14;

      renderPulse(
        alpha
      );

      animationFrame =
        requestAnimationFrame(
          frame
        );
    }


    animationFrame =
      requestAnimationFrame(
        frame
      );
  }


  /*
   * =========================================================
   * PULSE RENDER
   * =========================================================
   */

  function renderPulse(
    alpha
  ) {

    if (
      !lastWinningPath ||
      !overlayContext ||
      !overlay
    ) {
      return;
    }

    const scale =
      getScale();

    const x1 =
      lastWinningPath.x1 *
      scale.x;

    const y1 =
      lastWinningPath.y1 *
      scale.y;

    const x2 =
      lastWinningPath.x2 *
      scale.x;

    const y2 =
      lastWinningPath.y2 *
      scale.y;

    const rect =
      board.getBoundingClientRect();

    const dx =
      x2 -
      x1;

    const dy =
      y2 -
      y1;

    const length =
      Math.hypot(
        dx,
        dy
      );

    if (
      !length
    ) {
      return;
    }

    const ux =
      dx /
      length;

    const uy =
      dy /
      length;

    const extend =
      Math.min(
        rect.width,
        rect.height
      ) *
      0.018;

    const sx =
      x1 -
      ux *
        extend;

    const sy =
      y1 -
      uy *
        extend;

    const ex =
      x2 +
      ux *
        extend;

    const ey =
      y2 +
      uy *
        extend;

    overlayContext.clearRect(
      0,
      0,
      rect.width,
      rect.height
    );

    overlayContext.save();

    overlayContext.lineCap =
      "round";

    overlayContext.globalAlpha =
      alpha;

    overlayContext.strokeStyle =
      "#d46d52";

    overlayContext.lineWidth =
      Math.max(
        3,
        rect.width *
          0.007
      );

    overlayContext.shadowColor =
      "rgba(212,109,82,0.55)";

    overlayContext.shadowBlur =
      Math.max(
        7,
        rect.width *
          0.025
      );

    overlayContext.beginPath();

    overlayContext.moveTo(
      sx,
      sy
    );

    overlayContext.lineTo(
      ex,
      ey
    );

    overlayContext.stroke();

    overlayContext.restore();
  }


  /*
   * =========================================================
   * CLEAR WHEN GAME RESTARTS
   * =========================================================
   */

  function watchBoard() {

    if (!board) {
      return;
    }

    /*
     * app.js redraws the canvas frequently.
     *
     * If the board has been cleared after a new game,
     * remove our previous winning line as well.
     */

    let previousHash = "";

    function check() {

      if (
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
        requestAnimationFrame(
          check
        );

        return;
      }

      /*
       * Detect a new game by checking the
       * canvas dimensions/state changes.
       *
       * We deliberately do NOT inspect pixels.
       */

      const hash =
        [
          board.width,
          board.height,
          Math.round(
            rect.width
          ),
          Math.round(
            rect.height
          )
        ].join("|");

      if (
        hash !==
        previousHash
      ) {

        previousHash =
          hash;

        resizeOverlay();
      }

      requestAnimationFrame(
        check
      );
    }

    check();
  }


  /*
   * =========================================================
   * MOTION TOGGLE
   * =========================================================
   */

  function setupMotionToggle() {

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

        if (
          !motionEnabled()
        ) {

          cancelAnimationFrame(
            animationFrame
          );

          animationFrame =
            0;

          if (
            lastWinningPath
          ) {
            drawWinningLine(
              false
            );
          }

        } else if (
          lastWinningPath
        ) {

          drawWinningLine(
            true
          );
        }
      }
    );
  }


  /*
   * =========================================================
   * RESIZE OBSERVER
   * =========================================================
   */

  function setupResizeObserver() {

    if (
      typeof ResizeObserver ===
      "undefined" ||
      !board
    ) {
      return;
    }

    resizeObserver =
      new ResizeObserver(
        () => {

          resizeOverlay();

          if (
            lastWinningPath
          ) {
            drawWinningLine(
              false
            );
          }
        }
      );

    resizeObserver.observe(
      board
    );
  }


  /*
   * =========================================================
   * RESET DETECTION
   * =========================================================
   *
   * When app.js starts a new game, it will redraw the
   * board without a winning stroke.
   *
   * We keep the previous line only until the board is
   * visibly redrawn. A lightweight canvas fingerprint
   * is used only for reset detection, not for finding
   * the winning line.
   * =========================================================
   */

  function setupResetObserver() {

    let lastDrawTime =
      performance.now();

    if (
      !hookedContext
    ) {
      return;
    }

    const originalClearRect =
      hookedContext.clearRect.bind(
        hookedContext
      );

    hookedContext.clearRect =
      function (...args) {

        const result =
          originalClearRect(
            ...args
          );

        /*
         * app.js uses clearRect when resetting/redrawing
         * the board. Clearing the full canvas means the
         * previous winning line is no longer valid.
         */

        if (
          args.length >= 4 &&
          args[0] <= 1 &&
          args[1] <= 1 &&
          args[2] >= board.width - 2 &&
          args[3] >= board.height - 2
        ) {

          lastWinningPath =
            null;

          cancelAnimationFrame(
            animationFrame
          );

          animationFrame =
            0;

          clearOverlay();
        }

        lastDrawTime =
          performance.now();

        return result;
      };
  }


  /*
   * =========================================================
   * START
   * =========================================================
   */

  function start() {

    if (
      destroyed
    ) {
      return;
    }

    if (
      !findBoard()
    ) {

      window.setTimeout(
        start,
        100
      );

      return;
    }

    createOverlay();

    installCanvasHook();

    setupResetObserver();

    setupMotionToggle();

    setupResizeObserver();

    watchBoard();
  }


  /*
   * =========================================================
   * PUBLIC API
   * =========================================================
   */

  window.GomokuWinningLine = {

    refresh() {

      if (
        lastWinningPath
      ) {
        drawWinningLine(
          false
        );
      }
    },

    clear() {

      lastWinningPath =
        null;

      cancelAnimationFrame(
        animationFrame
      );

      animationFrame =
        0;

      clearOverlay();
    },

    destroy() {

      destroyed =
        true;

      cancelAnimationFrame(
        animationFrame
      );

      animationFrame =
        0;

      if (
        resizeObserver
      ) {

        resizeObserver.disconnect();

        resizeObserver =
          null;
      }

      if (
        overlay
      ) {

        overlay.remove();

        overlay =
          null;
      }

      overlayContext =
        null;

      hookedContext =
        null;

      lastWinningPath =
        null;
    }
  };


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
      start,
      {
        once: true
      }
    );

  } else {

    start();
  }

})();
