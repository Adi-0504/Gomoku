(() => {
  "use strict";

  /*
   * =========================================================
   * GOMOKU — WINNING LINE VISUAL LAYER
   * =========================================================
   *
   * 目的：
   * - 不修改 app.js
   * - 不修改棋盤規則
   * - 不攔截玩家操作
   * - 只負責顯示五連線
   * - 玩家勝利 / AI 勝利皆可顯示
   * - 支援動畫開關
   * - 支援 iPad / Retina
   *
   * 檔案：
   * js/win-line.js
   *
   * =========================================================
   */

  const BOARD_SIZE = 15;
  const WIN_LENGTH = 5;

  const CONFIG = {
    animationDuration: 520,

    /*
     * 與 app.js 棋盤內距保持一致。
     * 你的棋盤目前使用約 7.5% padding。
     */
    boardPaddingRatio: 0.075,

    /*
     * 五連線會稍微超出第一顆與最後一顆，
     * 這樣視覺上不會像只畫在棋子中心。
     */
    extensionRatio: 0.13,

    /*
     * 主線粗細。
     */
    lineWidthRatio: 0.105,

    /*
     * 外圍光暈。
     */
    glowWidthRatio: 0.32,

    /*
     * 顏色。
     */
    lineColor: "#c96f52",
    glowColor: "rgba(201, 111, 82, 0.34)",
    highlightColor: "rgba(255, 255, 255, 0.78)",

    /*
     * 掃描棋子的取樣範圍。
     */
    sampleRadiusRatio: 0.035
  };

  const board = document.getElementById("boardCanvas");

  if (!board) {
    return;
  }


  /* =========================================================
     STATE
     ========================================================= */

  let overlay = null;
  let ctx = null;

  let resizeObserver = null;

  let lastStateHash = "";
  let lastLineHash = "";

  let animationFrame = 0;

  let resizeScheduled = false;

  let destroyed = false;


  /* =========================================================
     UTILITIES
     ========================================================= */

  function isMotionEnabled() {
    const root = document.documentElement;

    if (
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
      document.getElementById("motionToggle");

    if (
      toggle &&
      toggle instanceof HTMLInputElement
    ) {
      return toggle.checked;
    }

    return true;
  }


  function getBoardRect() {
    return board.getBoundingClientRect();
  }


  function getGeometry() {
    const rect = getBoardRect();

    const width = rect.width;
    const height = rect.height;

    const size = Math.min(
      width,
      height
    );

    const padding =
      size *
      CONFIG.boardPaddingRatio;

    const usable =
      size -
      padding * 2;

    const cell =
      usable /
      (BOARD_SIZE - 1);

    return {
      rect,
      size,
      padding,
      usable,
      cell
    };
  }


  function getPoint(
    row,
    col
  ) {
    const geometry =
      getGeometry();

    return {
      x:
        geometry.padding +
        col *
        geometry.cell,

      y:
        geometry.padding +
        row *
        geometry.cell
    };
  }


  /* =========================================================
     CREATE OVERLAY
     ========================================================= */

  function createOverlay() {
    if (overlay) {
      return;
    }

    const wrapper =
      board.parentElement;

    if (!wrapper) {
      return;
    }

    const wrapperStyle =
      getComputedStyle(wrapper);

    if (
      wrapperStyle.position ===
      "static"
    ) {
      wrapper.style.position =
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
        zIndex: "20"
      }
    );

    wrapper.appendChild(
      overlay
    );

    ctx =
      overlay.getContext(
        "2d"
      );

    if (!ctx) {
      overlay.remove();
      overlay = null;
      return;
    }

    resize();
  }


  /* =========================================================
     RESIZE
     ========================================================= */

  function resize() {
    if (
      destroyed ||
      !overlay ||
      !ctx
    ) {
      return;
    }

    const rect =
      getBoardRect();

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

    clear();
  }


  function scheduleResize() {
    if (
      resizeScheduled
    ) {
      return;
    }

    resizeScheduled = true;

    requestAnimationFrame(
      () => {
        resizeScheduled = false;
        resize();
      }
    );
  }


  function clear() {
    if (
      !ctx ||
      !overlay
    ) {
      return;
    }

    const rect =
      getBoardRect();

    ctx.clearRect(
      0,
      0,
      rect.width,
      rect.height
    );
  }


  /* =========================================================
     CANVAS SNAPSHOT
     ========================================================= */

  function createSnapshot() {
    if (
      !board.width ||
      !board.height
    ) {
      return null;
    }

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      board.width;

    canvas.height =
      board.height;

    const snapshotCtx =
      canvas.getContext(
        "2d",
        {
          willReadFrequently: true
        }
      );

    if (!snapshotCtx) {
      return null;
    }

    try {
      snapshotCtx.drawImage(
        board,
        0,
        0
      );
    } catch {
      return null;
    }

    return {
      canvas,
      ctx: snapshotCtx
    };
  }


  /* =========================================================
     SAMPLE STONE
     ========================================================= */

  function sampleStone(
    snapshot,
    row,
    col
  ) {
    const geometry =
      getGeometry();

    const point =
      getPoint(
        row,
        col
      );

    const rect =
      geometry.rect;

    const scaleX =
      board.width /
      rect.width;

    const scaleY =
      board.height /
      rect.height;

    const centerX =
      Math.round(
        point.x *
        scaleX
      );

    const centerY =
      Math.round(
        point.y *
        scaleY
      );

    const radius =
      Math.max(
        2,
        Math.round(
          geometry.cell *
          CONFIG.sampleRadiusRatio *
          scaleX
        )
      );

    const left =
      Math.max(
        0,
        centerX - radius
      );

    const top =
      Math.max(
        0,
        centerY - radius
      );

    const right =
      Math.min(
        board.width - 1,
        centerX + radius
      );

    const bottom =
      Math.min(
        board.height - 1,
        centerY + radius
      );

    const width =
      right - left + 1;

    const height =
      bottom - top + 1;

    if (
      width <= 0 ||
      height <= 0
    ) {
      return 0;
    }

    let pixels;

    try {
      pixels =
        snapshot.ctx.getImageData(
          left,
          top,
          width,
          height
        ).data;
    } catch {
      return 0;
    }

    let dark = 0;
    let white = 0;
    let total = 0;

    for (
      let i = 0;
      i < pixels.length;
      i += 4
    ) {
      const r =
        pixels[i];

      const g =
        pixels[i + 1];

      const b =
        pixels[i + 2];

      /*
       * 黑棋。
       *
       * 棋盤線雖然也是深色，
       * 但中心取樣範圍內通常不會佔
       * 足夠比例。
       */
      if (
        r < 85 &&
        g < 85 &&
        b < 85
      ) {
        dark++;
      }

      /*
       * 白棋。
       *
       * 使用「接近白色」而不是單純亮度，
       * 避免棋盤本身被判成白棋。
       */
      if (
        r > 220 &&
        g > 220 &&
        b > 215
      ) {
        white++;
      }

      total++;
    }

    if (!total) {
      return 0;
    }

    const darkRatio =
      dark / total;

    const whiteRatio =
      white / total;

    if (
      darkRatio >= 0.25
    ) {
      return 1;
    }

    if (
      whiteRatio >= 0.45
    ) {
      return 2;
    }

    return 0;
  }


  /* =========================================================
     READ BOARD
     ========================================================= */

  function readBoard() {
    const snapshot =
      createSnapshot();

    if (!snapshot) {
      return null;
    }

    const state =
      Array.from(
        {
          length:
            BOARD_SIZE
        },
        () =>
          Array(
            BOARD_SIZE
          ).fill(0)
      );

    for (
      let row = 0;
      row < BOARD_SIZE;
      row++
    ) {
      for (
        let col = 0;
        col < BOARD_SIZE;
        col++
      ) {
        state[row][col] =
          sampleStone(
            snapshot,
            row,
            col
          );
      }
    }

    return state;
  }


  /* =========================================================
     HASH
     ========================================================= */

  function stateHash(
    state
  ) {
    return state
      .map(
        row =>
          row.join("")
      )
      .join("|");
  }


  function lineHash(
    line
  ) {
    return line
      .map(
        ([row, col]) =>
          `${row},${col}`
      )
      .join("|");
  }


  /* =========================================================
     FIND FIVE
     ========================================================= */

  function findWinningLine(
    state
  ) {
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1]
    ];

    for (
      let row = 0;
      row < BOARD_SIZE;
      row++
    ) {
      for (
        let col = 0;
        col < BOARD_SIZE;
        col++
      ) {
        const player =
          state[row][col];

        if (!player) {
          continue;
        }

        for (
          const [
            dr,
            dc
          ]
          of directions
        ) {
          /*
           * 確認前一格是不是同色。
           *
           * 這樣同一串六連、七連時，
           * 不會從中間重複開始。
           */
          const beforeRow =
            row - dr;

          const beforeCol =
            col - dc;

          if (
            beforeRow >= 0 &&
            beforeRow < BOARD_SIZE &&
            beforeCol >= 0 &&
            beforeCol < BOARD_SIZE &&
            state[
              beforeRow
            ][
              beforeCol
            ] === player
          ) {
            continue;
          }

          const cells = [];

          let currentRow =
            row;

          let currentCol =
            col;

          while (
            currentRow >= 0 &&
            currentRow < BOARD_SIZE &&
            currentCol >= 0 &&
            currentCol < BOARD_SIZE &&
            state[
              currentRow
            ][
              currentCol
            ] === player
          ) {
            cells.push([
              currentRow,
              currentCol
            ]);

            currentRow += dr;
            currentCol += dc;
          }

          if (
            cells.length >=
            WIN_LENGTH
          ) {
            /*
             * 如果超過五顆，
             * 顯示中央最漂亮的五顆。
             */
            if (
              cells.length ===
              WIN_LENGTH
            ) {
              return cells;
            }

            const middle =
              Math.floor(
                cells.length / 2
              );

            const start =
              Math.max(
                0,
                middle -
                Math.floor(
                  WIN_LENGTH / 2
                )
              );

            return cells.slice(
              start,
              start +
                WIN_LENGTH
            );
          }
        }
      }
    }

    return null;
  }


  /* =========================================================
     DRAW WINNING LINE
     ========================================================= */

  function drawLine(
    line,
    progress
  ) {
    if (
      !ctx ||
      !line ||
      line.length <
        WIN_LENGTH
    ) {
      return;
    }

    clear();

    const geometry =
      getGeometry();

    const first =
      getPoint(
        line[0][0],
        line[0][1]
      );

    const last =
      getPoint(
        line[
          line.length - 1
        ][0],
        line[
          line.length - 1
        ][1]
      );

    const dx =
      last.x -
      first.x;

    const dy =
      last.y -
      first.y;

    const extension =
      Math.sqrt(
        dx * dx +
        dy * dy
      ) *
      CONFIG.extensionRatio;

    const length =
      Math.sqrt(
        dx * dx +
        dy * dy
      );

    if (
      length <= 0
    ) {
      return;
    }

    const nx =
      dx / length;

    const ny =
      dy / length;

    const startX =
      first.x -
      nx *
      extension;

    const startY =
      first.y -
      ny *
      extension;

    const fullEndX =
      last.x +
      nx *
      extension;

    const fullEndY =
      last.y +
      ny *
      extension;

    const endX =
      startX +
      (
        fullEndX -
        startX
      ) *
      progress;

    const endY =
      startY +
      (
        fullEndY -
        startY
      ) *
      progress;


    /* -------------------------------------------------------
       GLOW
       ------------------------------------------------------- */

    ctx.save();

    ctx.beginPath();

    ctx.moveTo(
      startX,
      startY
    );

    ctx.lineTo(
      endX,
      endY
    );

    ctx.lineCap =
      "round";

    ctx.lineWidth =
      Math.max(
        10,
        geometry.cell *
        CONFIG.glowWidthRatio
      );

    ctx.strokeStyle =
      CONFIG.glowColor;

    ctx.shadowColor =
      CONFIG.glowColor;

    ctx.shadowBlur =
      geometry.cell *
      0.38;

    ctx.stroke();

    ctx.restore();


    /* -------------------------------------------------------
       MAIN LINE
       ------------------------------------------------------- */

    ctx.save();

    ctx.beginPath();

    ctx.moveTo(
      startX,
      startY
    );

    ctx.lineTo(
      endX,
      endY
    );

    ctx.lineCap =
      "round";

    ctx.lineWidth =
      Math.max(
        3,
        geometry.cell *
        CONFIG.lineWidthRatio
      );

    ctx.strokeStyle =
      CONFIG.lineColor;

    ctx.shadowColor =
      "rgba(0,0,0,0.18)";

    ctx.shadowBlur =
      geometry.cell *
      0.08;

    ctx.stroke();

    ctx.restore();


    /* -------------------------------------------------------
       INNER HIGHLIGHT
       ------------------------------------------------------- */

    ctx.save();

    ctx.beginPath();

    ctx.moveTo(
      startX,
      startY
    );

    ctx.lineTo(
      endX,
      endY
    );

    ctx.lineCap =
      "round";

    ctx.lineWidth =
      Math.max(
        1,
        geometry.cell *
        0.025
      );

    ctx.strokeStyle =
      CONFIG.highlightColor;

    ctx.globalAlpha =
      0.65;

    ctx.stroke();

    ctx.restore();
  }


  /* =========================================================
     ANIMATION
     ========================================================= */

  function animate(
    line
  ) {
    cancelAnimationFrame(
      animationFrame
    );

    const start =
      performance.now();

    function frame(
      now
    ) {
      if (destroyed) {
        return;
      }

      const elapsed =
        now - start;

      const raw =
        Math.min(
          1,
          elapsed /
          CONFIG.animationDuration
        );

      /*
       * easeOutCubic
       */
      const progress =
        1 -
        Math.pow(
          1 - raw,
          3
        );

      drawLine(
        line,
        progress
      );

      if (
        raw < 1
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


  /* =========================================================
     RESULT SCREEN DETECTION
     ========================================================= */

  function isResultScreenVisible() {
    const result =
      document.getElementById(
        "resultScreen"
      );

    if (!result) {
      return false;
    }

    return (
      result.classList.contains(
        "active"
      ) &&
      !result.hidden
    );
  }


  /* =========================================================
     INSPECT
     ========================================================= */

  function inspect() {
    if (
      destroyed
    ) {
      return;
    }

    /*
     * 只在結果畫面顯示勝利線。
     *
     * 這點很重要：
     * 遊戲進行中不會一直掃棋盤。
     */
    if (
      !isResultScreenVisible()
    ) {
      clear();

      lastStateHash = "";
      lastLineHash = "";

      return;
    }

    const state =
      readBoard();

    if (!state) {
      return;
    }

    const hash =
      stateHash(state);

    if (
      hash ===
      lastStateHash &&
      lastLineHash
    ) {
      return;
    }

    lastStateHash =
      hash;

    const line =
      findWinningLine(
        state
      );

    if (!line) {
      clear();

      lastLineHash = "";

      return;
    }

    const currentLineHash =
      lineHash(line);

    if (
      currentLineHash ===
      lastLineHash
    ) {
      return;
    }

    lastLineHash =
      currentLineHash;

    if (
      isMotionEnabled()
    ) {
      animate(line);
    } else {
      drawLine(
        line,
        1
      );
    }
  }


  /* =========================================================
     RESULT OBSERVER
     ========================================================= */

  const resultScreen =
    document.getElementById(
      "resultScreen"
    );

  if (
    resultScreen &&
    "MutationObserver" in window
  ) {
    const observer =
      new MutationObserver(
        () => {
          /*
           * 等 app.js 完成畫面切換與
           * 最後一次 canvas 繪製。
           */
          requestAnimationFrame(
            () => {
              requestAnimationFrame(
                inspect
              );
            }
          );
        }
      );

    observer.observe(
      resultScreen,
      {
        attributes: true,
        attributeFilter: [
          "class",
          "hidden"
        ]
      }
    );
  }


  /* =========================================================
     GENERAL OBSERVER
     ========================================================= */

  /*
   * 有些情況 app.js 可能不透過
   * MutationObserver 能觀察到的方式切換畫面。
   *
   * 所以只做非常輕量的低頻檢查。
   *
   * 不掃棋盤。
   * 只有結果畫面才會真的讀 canvas。
   */

  let fallbackTimer =
    window.setInterval(
      () => {
        if (
          isResultScreenVisible()
        ) {
          inspect();
        }
      },
      300
    );


  /* =========================================================
     RESIZE
     ========================================================= */

  window.addEventListener(
    "resize",
    scheduleResize,
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
          inspect();
        },
        120
      );
    },
    {
      passive: true
    }
  );


  if (
    "ResizeObserver" in window
  ) {
    resizeObserver =
      new ResizeObserver(
        () => {
          resize();

          if (
            isResultScreenVisible()
          ) {
            inspect();
          }
        }
      );

    resizeObserver.observe(
      board
    );
  }


  /* =========================================================
     CLEAR WHEN STARTING A NEW GAME
     ========================================================= */

  const startButtons = [
    "startButton",
    "beginGameButton",
    "playAgainButton",
    "restartButton",
    "resumeButton"
  ];

  for (
    const id of startButtons
  ) {
    const button =
      document.getElementById(
        id
      );

    if (!button) {
      continue;
    }

    button.addEventListener(
      "click",
      () => {
        cancelAnimationFrame(
          animationFrame
        );

        clear();

        lastStateHash =
          "";

        lastLineHash =
          "";
      },
      {
        capture: false
      }
    );
  }


  /* =========================================================
     INITIALIZATION
     ========================================================= */

  createOverlay();

  /*
   * 初始狀態不要畫線。
   */
  clear();


  /* =========================================================
     CLEANUP
     ========================================================= */

  window.addEventListener(
    "pagehide",
    () => {
      destroyed = true;

      cancelAnimationFrame(
        animationFrame
      );

      if (
        fallbackTimer
      ) {
        clearInterval(
          fallbackTimer
        );

        fallbackTimer = 0;
      }

      if (
        resizeObserver
      ) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }

      if (overlay) {
        overlay.remove();
        overlay = null;
      }

      ctx = null;
    },
    {
      once: true
    }
  );

})();
