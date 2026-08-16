(() => {
  "use strict";

  /*
   * =========================================================
   * GOMOKU — WINNING LINE
   * Storage-driven visual feedback layer
   * =========================================================
   *
   * IMPORTANT
   * ---------------------------------------------------------
   * app.js is NOT modified.
   *
   * This module:
   * - reads the existing game state from localStorage
   * - uses winningLine as the source of truth
   * - never intercepts Canvas drawing
   * - never recalculates Gomoku rules
   * - never modifies the board state
   *
   * Storage:
   *   gomoku-active-game-v5
   *
   * The board remains owned by app.js.
   * This module only draws a transparent visual overlay.
   * =========================================================
   */

  const STORAGE_KEY = "gomoku-active-game-v5";

  const BOARD_ID = "boardCanvas";

  const OVERLAY_ID = "gomoku-winning-line-overlay";

  const SIZE = 15;

  const WIN = 5;

  const COLORS = {
    line: "#d46d52",
    glow: "rgba(212,109,82,0.48)",
    highlight: "rgba(255,255,255,0.34)"
  };

  const POLL_MS = 120;

  const ANIMATION_MS = 520;

  const EXTENSION_RATIO = 0.035;

  const LINE_RATIO = 0.009;

  let board = null;

  let overlay = null;

  let context = null;

  let pollTimer = 0;

  let resizeObserver = null;

  let mutationObserver = null;

  let animationFrame = 0;

  let animationStart = 0;

  let destroyed = false;

  let lastSignature = "";

  let currentWinningLine = null;

  let currentWinner = 0;


  /* ========================================================
     MOTION
     ======================================================== */

  function motionEnabled() {
    const root = document.documentElement;

    if (
      root &&
      root.dataset.motion === "off"
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


  /* ========================================================
     FIND BOARD
     ======================================================== */

  function findBoard() {
    board =
      document.getElementById(
        BOARD_ID
      );

    return !!board;
  }


  /* ========================================================
     CREATE OVERLAY
     ======================================================== */

  function createOverlay() {
    if (
      !board ||
      overlay
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
        pointerEvents: "none",
        display: "block",
        zIndex: "20",
        left: "0",
        top: "0",
        width: "0",
        height: "0"
      }
    );

    parent.appendChild(
      overlay
    );

    context =
      overlay.getContext(
        "2d"
      );

    resizeOverlay();
  }


  /* ========================================================
     RESIZE
     ======================================================== */

  function resizeOverlay() {
    if (
      !board ||
      !overlay ||
      !context
    ) {
      return;
    }

    const boardRect =
      board.getBoundingClientRect();

    const parent =
      board.parentElement;

    if (!parent) {
      return;
    }

    const parentRect =
      parent.getBoundingClientRect();

    if (
      boardRect.width <= 0 ||
      boardRect.height <= 0
    ) {
      overlay.style.display =
        "none";

      return;
    }

    overlay.style.display =
      "block";

    overlay.style.left =
      `${boardRect.left - parentRect.left}px`;

    overlay.style.top =
      `${boardRect.top - parentRect.top}px`;

    overlay.style.width =
      `${boardRect.width}px`;

    overlay.style.height =
      `${boardRect.height}px`;

    const dpr =
      Math.min(
        Math.max(
          window.devicePixelRatio || 1,
          1
        ),
        3
      );

    overlay.width =
      Math.round(
        boardRect.width * dpr
      );

    overlay.height =
      Math.round(
        boardRect.height * dpr
      );

    context.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    redraw();
  }


  /* ========================================================
     CLEAR
     ======================================================== */

  function clear() {
    if (
      !context ||
      !overlay
    ) {
      return;
    }

    const rect =
      overlay.getBoundingClientRect();

    context.clearRect(
      0,
      0,
      rect.width,
      rect.height
    );
  }


  /* ========================================================
     READ STORAGE
     ======================================================== */

  function readGameState() {
    let raw = null;

    try {
      raw =
        localStorage.getItem(
          STORAGE_KEY
        );
    } catch {
      return null;
    }

    if (!raw) {
      return null;
    }

    try {
      const state =
        JSON.parse(raw);

      if (
        !state ||
        typeof state !== "object"
      ) {
        return null;
      }

      return state;

    } catch {
      return null;
    }
  }


  /* ========================================================
     NORMALIZE WINNING LINE
     ========================================================
     
     We intentionally support several possible shapes.

     Examples:

       [{ row: 7, col: 3 }, ... ]

       [{ r: 7, c: 3 }, ... ]

       [[7, 3], [7, 4], ...]

       {
         start: { row: 7, col: 3 },
         end:   { row: 7, col: 7 }
       }

     This makes the visual layer tolerant without
     changing app.js.
     ======================================================== */

  function normalizePoint(point) {
    if (
      Array.isArray(point) &&
      point.length >= 2
    ) {
      const row =
        Number(point[0]);

      const col =
        Number(point[1]);

      if (
        Number.isFinite(row) &&
        Number.isFinite(col)
      ) {
        return {
          row,
          col
        };
      }
    }

    if (
      point &&
      typeof point === "object"
    ) {
      const row =
        Number(
          point.row ??
          point.r ??
          point.y
        );

      const col =
        Number(
          point.col ??
          point.c ??
          point.x
        );

      if (
        Number.isFinite(row) &&
        Number.isFinite(col)
      ) {
        return {
          row,
          col
        };
      }
    }

    return null;
  }


  function normalizeWinningLine(value) {
    if (!value) {
      return null;
    }

    /*
     * Array of points
     */

    if (
      Array.isArray(value)
    ) {
      const points =
        value
          .map(
            normalizePoint
          )
          .filter(Boolean);

      if (
        points.length >= 2
      ) {
        return points;
      }

      return null;
    }


    /*
     * Object containing points
     */

    if (
      typeof value ===
      "object"
    ) {
      if (
        Array.isArray(
          value.points
        )
      ) {
        const points =
          value.points
            .map(
              normalizePoint
            )
            .filter(Boolean);

        if (
          points.length >= 2
        ) {
          return points;
        }
      }


      /*
       * start / end
       */

      const start =
        normalizePoint(
          value.start
        );

      const end =
        normalizePoint(
          value.end
        );

      if (
        start &&
        end
      ) {
        return [
          start,
          end
        ];
      }
    }

    return null;
  }


  /* ========================================================
     GAME STATE EXTRACTION
     ======================================================== */

  function extractWinningLine(state) {
    if (!state) {
      return null;
    }

    /*
     * Primary source.
     */

    const direct =
      normalizeWinningLine(
        state.winningLine
      );

    if (direct) {
      return direct;
    }


    /*
     * A few harmless fallbacks for old saved games.
     */

    const result =
      state.result;

    if (
      result &&
      typeof result === "object"
    ) {
      const resultLine =
        normalizeWinningLine(
          result.winningLine
        );

      if (resultLine) {
        return resultLine;
      }
    }

    return null;
  }


  /* ========================================================
     SIGNATURE
     ======================================================== */

  function createSignature(state) {
    if (!state) {
      return "empty";
    }

    const line =
      extractWinningLine(
        state
      );

    let lineSignature =
      "none";

    if (line) {
      lineSignature =
        line
          .map(
            point =>
              `${point.row},${point.col}`
          )
          .join("|");
    }

    return [
      state.winner ?? "",
      state.status ?? "",
      state.gameOver ?? "",
      lineSignature
    ].join("::");
  }


  /* ========================================================
     CHECK STORAGE
     ======================================================== */

  function checkStorage() {
    if (destroyed) {
      return;
    }

    const state =
      readGameState();

    const signature =
      createSignature(
        state
      );

    if (
      signature ===
      lastSignature
    ) {
      return;
    }

    lastSignature =
      signature;

    const line =
      extractWinningLine(
        state
      );

    const winner =
      Number(
        state?.winner ?? 0
      );

    currentWinner =
      Number.isFinite(winner)
        ? winner
        : 0;

    if (
      !line ||
      line.length < 2
    ) {
      currentWinningLine =
        null;

      cancelAnimationFrame(
        animationFrame
      );

      clear();

      return;
    }

    currentWinningLine =
      line;

    drawWinningLine(
      motionEnabled()
    );
  }


  /* ========================================================
     BOARD COORDINATES
     ======================================================== */

  function boardGeometry() {
    if (!board) {
      return null;
    }

    const rect =
      board.getBoundingClientRect();

    if (
      rect.width <= 0 ||
      rect.height <= 0
    ) {
      return null;
    }

    /*
     * The game board uses a square 15x15 grid.
     *
     * Grid intersections span:
     *   0 ... SIZE - 1
     *
     * We therefore map:
     *
     *   col → x
     *   row → y
     */

    const padding =
      rect.width *
      0.055;

    const usableWidth =
      rect.width -
      padding * 2;

    const usableHeight =
      rect.height -
      padding * 2;

    return {
      width: rect.width,
      height: rect.height,
      padding,
      cellX:
        usableWidth /
        (SIZE - 1),
      cellY:
        usableHeight /
        (SIZE - 1)
    };
  }


  function pointToCanvas(
    point
  ) {
    const geometry =
      boardGeometry();

    if (
      !geometry ||
      !point
    ) {
      return null;
    }

    return {
      x:
        geometry.padding +
        point.col *
          geometry.cellX,

      y:
        geometry.padding +
        point.row *
          geometry.cellY
    };
  }


  /* ========================================================
     GET ENDPOINTS
     ======================================================== */

  function getEndpoints(line) {
    if (
      !Array.isArray(line) ||
      line.length < 2
    ) {
      return null;
    }

    const first =
      pointToCanvas(
        line[0]
      );

    const last =
      pointToCanvas(
        line[line.length - 1]
      );

    if (
      !first ||
      !last
    ) {
      return null;
    }

    return {
      start: first,
      end: last
    };
  }


  /* ========================================================
     DRAW
     ======================================================== */

  function drawWinningLine(
    animate
  ) {
    if (
      !currentWinningLine ||
      !context ||
      !overlay
    ) {
      return;
    }

    cancelAnimationFrame(
      animationFrame
    );

    const endpoints =
      getEndpoints(
        currentWinningLine
      );

    if (!endpoints) {
      return;
    }

    const rect =
      overlay.getBoundingClientRect();

    const dx =
      endpoints.end.x -
      endpoints.start.x;

    const dy =
      endpoints.end.y -
      endpoints.start.y;

    const distance =
      Math.hypot(
        dx,
        dy
      );

    if (
      distance <= 0
    ) {
      return;
    }

    const ux =
      dx / distance;

    const uy =
      dy / distance;

    const extension =
      Math.min(
        rect.width,
        rect.height
      ) *
      EXTENSION_RATIO;

    const x1 =
      endpoints.start.x -
      ux * extension;

    const y1 =
      endpoints.start.y -
      uy * extension;

    const x2 =
      endpoints.end.x +
      ux * extension;

    const y2 =
      endpoints.end.y +
      uy * extension;

    if (!animate) {
      render(
        x1,
        y1,
        x2,
        y2,
        1
      );

      return;
    }

    animationStart =
      performance.now();

    function frame(now) {
      if (
        destroyed ||
        !currentWinningLine
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
          ANIMATION_MS
        );

      /*
       * Smooth deceleration.
       */

      const eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );

      const currentX =
        x1 +
        (x2 - x1) *
          eased;

      const currentY =
        y1 +
        (y2 - y1) *
          eased;

      render(
        x1,
        y1,
        currentX,
        currentY,
        progress
      );

      if (
        progress < 1
      ) {
        animationFrame =
          requestAnimationFrame(
            frame
          );
      }
    }

    animationFrame =
      requestAnimationFrame(
        frame
      );
  }


  /* ========================================================
     RENDER LINE
     ======================================================== */

  function render(
    x1,
    y1,
    x2,
    y2,
    progress
  ) {
    if (
      !context ||
      !overlay
    ) {
      return;
    }

    const rect =
      overlay.getBoundingClientRect();

    context.clearRect(
      0,
      0,
      rect.width,
      rect.height
    );

    const width =
      Math.max(
        3,
        rect.width *
          LINE_RATIO
      );


    /*
     * -----------------------------------------------
     * Outer glow
     * -----------------------------------------------
     */

    context.save();

    context.lineCap =
      "round";

    context.lineJoin =
      "round";

    context.globalAlpha =
      0.75;

    context.strokeStyle =
      COLORS.glow;

    context.lineWidth =
      width * 3.2;

    context.shadowColor =
      COLORS.glow;

    context.shadowBlur =
      width * 4;

    context.beginPath();

    context.moveTo(
      x1,
      y1
    );

    context.lineTo(
      x2,
      y2
    );

    context.stroke();

    context.restore();


    /*
     * -----------------------------------------------
     * Main line
     * -----------------------------------------------
     */

    context.save();

    context.lineCap =
      "round";

    context.lineJoin =
      "round";

    context.globalAlpha =
      0.96;

    context.strokeStyle =
      COLORS.line;

    context.lineWidth =
      width;

    context.beginPath();

    context.moveTo(
      x1,
      y1
    );

    context.lineTo(
      x2,
      y2
    );

    context.stroke();

    context.restore();


    /*
     * -----------------------------------------------
     * Subtle highlight
     * -----------------------------------------------
     */

    if (
      progress > 0.15
    ) {
      context.save();

      context.lineCap =
        "round";

      context.globalAlpha =
        0.34 *
        Math.min(
          1,
          progress * 1.5
        );

      context.strokeStyle =
        COLORS.highlight;

      context.lineWidth =
        Math.max(
          1,
          width * 0.26
        );

      context.beginPath();

      context.moveTo(
        x1,
        y1
      );

      context.lineTo(
        x2,
        y2
      );

      context.stroke();

      context.restore();
    }
  }


  /* ========================================================
     REDRAW
     ======================================================== */

  function redraw() {
    if (
      !currentWinningLine
    ) {
      clear();
      return;
    }

    drawWinningLine(
      false
    );
  }


  /* ========================================================
     OBSERVE BOARD
     ======================================================== */

  function observeBoard() {
    if (!board) {
      return;
    }

    if (
      "ResizeObserver" in window
    ) {
      resizeObserver =
        new ResizeObserver(
          () => {
            resizeOverlay();
          }
        );

      resizeObserver.observe(
        board
      );

      if (
        board.parentElement
      ) {
        resizeObserver.observe(
          board.parentElement
        );
      }
    }

    window.addEventListener(
      "resize",
      resizeOverlay,
      {
        passive: true
      }
    );

    window.addEventListener(
      "orientationchange",
      resizeOverlay,
      {
        passive: true
      }
    );
  }


  /* ========================================================
     OBSERVE UI CHANGES
     ======================================================== */

  function observeDOM() {
    mutationObserver =
      new MutationObserver(
        () => {
          if (
            !board
          ) {
            findBoard();
          }

          if (
            board &&
            !overlay
          ) {
            createOverlay();
          }
        }
      );

    mutationObserver.observe(
      document.body,
      {
        childList: true,
        subtree: true
      }
    );
  }


  /* ========================================================
     STORAGE EVENT
     ======================================================== */

  function observeStorage() {
    window.addEventListener(
      "storage",
      event => {
        if (
          event.key ===
          STORAGE_KEY
        ) {
          checkStorage();
        }
      }
    );
  }


  /* ========================================================
     POLLING
     ======================================================== */

  function startPolling() {
    stopPolling();

    pollTimer =
      window.setInterval(
        checkStorage,
        POLL_MS
      );
  }


  function stopPolling() {
    if (
      pollTimer
    ) {
      window.clearInterval(
        pollTimer
      );

      pollTimer = 0;
    }
  }


  /* ========================================================
     INITIALIZE
     ======================================================== */

  function init() {
    if (destroyed) {
      return;
    }

    findBoard();

    if (!board) {
      window.setTimeout(
        init,
        100
      );

      return;
    }

    createOverlay();

    observeBoard();

    observeDOM();

    observeStorage();

    startPolling();

    checkStorage();
  }


  /* ========================================================
     CLEANUP
     ======================================================== */

  function destroy() {
    destroyed = true;

    stopPolling();

    cancelAnimationFrame(
      animationFrame
    );

    if (
      resizeObserver
    ) {
      resizeObserver.disconnect();

      resizeObserver = null;
    }

    if (
      mutationObserver
    ) {
      mutationObserver.disconnect();

      mutationObserver = null;
    }

    window.removeEventListener(
      "resize",
      resizeOverlay
    );

    window.removeEventListener(
      "orientationchange",
      resizeOverlay
    );

    if (
      overlay
    ) {
      overlay.remove();

      overlay = null;
      context = null;
    }
  }


  /* ========================================================
     PUBLIC DEBUG API
     ======================================================== */

  window.GomokuWinningLine = {
    refresh() {
      checkStorage();
    },

    clear() {
      currentWinningLine =
        null;

      currentWinner = 0;

      lastSignature = "";

      clear();
    },

    destroy
  };


  /* ========================================================
     START
     ======================================================== */

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
