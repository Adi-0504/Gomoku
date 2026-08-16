(() => {
  "use strict";

  /*
   * =========================================================
   * GOMOKU — WINNING LINE OVERLAY
   * =========================================================
   *
   * 不修改 app.js。
   *
   * 功能：
   * - 在原本 boardCanvas 上方建立透明 overlay
   * - 自動觀察棋盤畫面
   * - 偵測終局後找出最後形成的五子
   * - 畫出精緻勝利線
   * - 支援 iPad / touch / DPR / responsive board
   * - 不攔截任何棋盤操作
   * =========================================================
   */

  const BOARD_SIZE = 15;
  const WIN_LENGTH = 5;

  const COLORS = {
    line: "#d46d52",
    glow: "rgba(212, 109, 82, 0.28)",
    soft: "rgba(255, 255, 255, 0.82)"
  };

  const board = document.getElementById("boardCanvas");

  if (!board) {
    return;
  }

  /*
   * ---------------------------------------------------------
   * Overlay
   * ---------------------------------------------------------
   */

  const wrapper =
    board.parentElement || document.body;

  wrapper.style.position =
    wrapper.style.position || "relative";

  const overlay =
    document.createElement("canvas");

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
      pointerEvents: "none",
      zIndex: "10",
      display: "block"
    }
  );

  wrapper.appendChild(overlay);

  const ctx =
    overlay.getContext("2d");

  if (!ctx) {
    return;
  }

  /*
   * ---------------------------------------------------------
   * State
   * ---------------------------------------------------------
   */

  let lastBoardImage = null;

  let previousHash = "";

  let candidateFrames = 0;

  let visible = false;

  let animationFrame = 0;

  let resizeObserver = null;


  /*
   * ---------------------------------------------------------
   * Resize
   * ---------------------------------------------------------
   */

  function resizeOverlay() {

    const rect =
      board.getBoundingClientRect();

    if (
      rect.width <= 0 ||
      rect.height <= 0
    ) {
      return;
    }

    const dpr =
      Math.max(
        1,
        Math.min(
          window.devicePixelRatio || 1,
          3
        )
      );

    const width =
      Math.round(rect.width * dpr);

    const height =
      Math.round(rect.height * dpr);

    if (
      overlay.width !== width ||
      overlay.height !== height
    ) {
      overlay.width = width;
      overlay.height = height;
    }

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


  function clear() {

    const rect =
      board.getBoundingClientRect();

    ctx.clearRect(
      0,
      0,
      rect.width,
      rect.height
    );
  }


  if (
    "ResizeObserver" in window
  ) {

    resizeObserver =
      new ResizeObserver(
        resizeOverlay
      );

    resizeObserver.observe(board);

  } else {

    window.addEventListener(
      "resize",
      resizeOverlay
    );

  }


  resizeOverlay();


  /*
   * ---------------------------------------------------------
   * Board geometry
   * ---------------------------------------------------------
   */

  function getBoardGeometry() {

    const rect =
      board.getBoundingClientRect();

    const size =
      Math.min(
        rect.width,
        rect.height
      );

    /*
     * app.js 的棋盤本身會留出內距。
     * 這裡使用棋盤的內部安全區，
     * 避免線碰到圓角。
     */

    const padding =
      size * 0.066;

    const usable =
      size - padding * 2;

    const gap =
      usable / (BOARD_SIZE - 1);

    return {
      width: rect.width,
      height: rect.height,
      padding,
      gap
    };
  }


  function point(
    row,
    col
  ) {

    const g =
      getBoardGeometry();

    return {
      x:
        g.padding +
        col * g.gap,

      y:
        g.padding +
        row * g.gap
    };
  }


  /*
   * ---------------------------------------------------------
   * Pixel sampling
   *
   * 用畫面像素判斷棋子位置。
   *
   * 黑棋：
   * 深色
   *
   * 白棋：
   * 明亮
   *
   * 棋盤：
   * 木色
   * ---------------------------------------------------------
   */

  function sampleCell(
    source,
    row,
    col
  ) {

    const rect =
      board.getBoundingClientRect();

    const g =
      getBoardGeometry();

    const p =
      point(row, col);

    const sx =
      Math.max(
        0,
        Math.min(
          rect.width - 1,
          p.x
        )
      );

    const sy =
      Math.max(
        0,
        Math.min(
          rect.height - 1,
          p.y
        )
      );

    const scaleX =
      source.width /
      rect.width;

    const scaleY =
      source.height /
      rect.height;

    const x =
      Math.round(
        sx * scaleX
      );

    const y =
      Math.round(
        sy * scaleY
      );

    const size =
      Math.max(
        3,
        Math.round(
          source.width *
          0.012
        )
      );

    const half =
      Math.floor(
        size / 2
      );

    const data =
      source.getImageData(
        Math.max(0, x - half),
        Math.max(0, y - half),
        size,
        size
      ).data;

    let dark = 0;
    let light = 0;

    for (
      let i = 0;
      i < data.length;
      i += 4
    ) {

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const brightness =
        (r + g + b) / 3;

      if (
        brightness < 80
      ) {
        dark++;
      }

      if (
        brightness > 205
      ) {
        light++;
      }
    }

    const total =
      data.length / 4;

    if (
      dark / total > 0.35
    ) {
      return 1;
    }

    if (
      light / total > 0.55
    ) {
      return 2;
    }

    return 0;
  }


  /*
   * ---------------------------------------------------------
   * Capture board
   * ---------------------------------------------------------
   */

  function captureBoard() {

    try {

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
            willReadFrequently: true
          }
        );

      if (!sourceCtx) {
        return null;
      }

      sourceCtx.drawImage(
        board,
        0,
        0
      );

      return sourceCtx;

    } catch {
      return null;
    }
  }


  /*
   * ---------------------------------------------------------
   * Detect board
   * ---------------------------------------------------------
   */

  function readBoard() {

    const source =
      captureBoard();

    if (!source) {
      return null;
    }

    const boardState =
      Array.from(
        {
          length: BOARD_SIZE
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

        boardState[row][col] =
          sampleCell(
            source,
            row,
            col
          );

      }
    }

    return boardState;
  }


  /*
   * ---------------------------------------------------------
   * Find winning lines
   * ---------------------------------------------------------
   */

  function getLine(
    boardState,
    row,
    col,
    dr,
    dc,
    player
  ) {

    const cells = [];

    let r = row;
    let c = col;

    while (
      r >= 0 &&
      r < BOARD_SIZE &&
      c >= 0 &&
      c < BOARD_SIZE &&
      boardState[r][c] === player
    ) {

      cells.unshift([
        r,
        c
      ]);

      r -= dr;
      c -= dc;
    }

    r = row + dr;
    c = col + dc;

    while (
      r >= 0 &&
      r < BOARD_SIZE &&
      c >= 0 &&
      c < BOARD_SIZE &&
      boardState[r][c] === player
    ) {

      cells.push([
        r,
        c
      ]);

      r += dr;
      c += dc;
    }

    return cells;
  }


  function findWinningLine(
    boardState
  ) {

    const directions = [
      [1, 0],
      [0, 1],
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
          boardState[row][col];

        if (!player) {
          continue;
        }

        for (
          const [
            dr,
            dc
          ] of directions
        ) {

          const line =
            getLine(
              boardState,
              row,
              col,
              dr,
              dc,
              player
            );

          if (
            line.length >=
            WIN_LENGTH
          ) {

            return line;
          }
        }
      }
    }

    return null;
  }


  /*
   * ---------------------------------------------------------
   * Hash
   * ---------------------------------------------------------
   */

  function hashBoard(
    boardState
  ) {

    return boardState
      .map(row =>
        row.join("")
      )
      .join("|");
  }


  /*
   * ---------------------------------------------------------
   * Draw
   * ---------------------------------------------------------
   */

  function drawLine(
    line,
    progress = 1
  ) {

    if (
      !line ||
      line.length <
      WIN_LENGTH
    ) {
      return;
    }

    const g =
      getBoardGeometry();

    const first =
      point(
        line[0][0],
        line[0][1]
      );

    const lastIndex =
      line.length - 1;

    const last =
      point(
        line[lastIndex][0],
        line[lastIndex][1]
      );

    const dx =
      last.x - first.x;

    const dy =
      last.y - first.y;

    const startX =
      first.x -
      dx * 0.08;

    const startY =
      first.y -
      dy * 0.08;

    const endX =
      first.x +
      dx * (0.08 + 0.92 * progress);

    const endY =
      first.y +
      dy * (0.08 + 0.92 * progress);

    ctx.save();

    /*
     * 外層柔光
     */

    ctx.beginPath();

    ctx.moveTo(
      startX,
      startY
    );

    ctx.lineTo(
      endX,
      endY
    );

    ctx.lineCap = "round";

    ctx.lineWidth =
      Math.max(
        10,
        g.gap * 0.28
      );

    ctx.strokeStyle =
      COLORS.glow;

    ctx.shadowColor =
      COLORS.glow;

    ctx.shadowBlur =
      Math.max(
        8,
        g.gap * 0.3
      );

    ctx.stroke();


    /*
     * 主線
     */

    ctx.beginPath();

    ctx.moveTo(
      startX,
      startY
    );

    ctx.lineTo(
      endX,
      endY
    );

    ctx.lineCap = "round";

    ctx.lineWidth =
      Math.max(
        3,
        g.gap * 0.10
      );

    ctx.strokeStyle =
      COLORS.line;

    ctx.shadowColor =
      "rgba(0,0,0,0.14)";

    ctx.shadowBlur =
      Math.max(
        2,
        g.gap * 0.08
      );

    ctx.stroke();


    /*
     * 中心高光
     */

    ctx.beginPath();

    ctx.moveTo(
      startX,
      startY
    );

    ctx.lineTo(
      endX,
      endY
    );

    ctx.lineWidth =
      Math.max(
        1,
        g.gap * 0.025
      );

    ctx.strokeStyle =
      COLORS.soft;

    ctx.shadowBlur = 0;

    ctx.globalAlpha =
      0.62;

    ctx.stroke();

    ctx.restore();
  }


  /*
   * ---------------------------------------------------------
   * Animation
   * ---------------------------------------------------------
   */

  function animateLine(
    line
  ) {

    cancelAnimationFrame(
      animationFrame
    );

    visible = true;

    const start =
      performance.now();

    const duration =
      460;

    function frame(
      now
    ) {

      const elapsed =
        now - start;

      const raw =
        Math.min(
          1,
          elapsed /
          duration
        );

      /*
       * cubic ease-out
       */

      const progress =
        1 -
        Math.pow(
          1 - raw,
          3
        );

      clear();

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


  /*
   * ---------------------------------------------------------
   * Main watcher
   * ---------------------------------------------------------
   */

  function inspect() {

    if (
      !document.body.contains(board)
    ) {
      return;
    }

    const boardState =
      readBoard();

    if (!boardState) {
      return;
    }

    const hash =
      hashBoard(
        boardState
      );

    /*
     * 棋盤完全沒變，
     * 不需要重新處理。
     */

    if (
      hash === previousHash
    ) {
      return;
    }

    previousHash =
      hash;

    const line =
      findWinningLine(
        boardState
      );

    if (
      line &&
      line.length >=
      WIN_LENGTH
    ) {

      /*
       * 防止普通五子棋局中
       * 尚未結束時誤觸。
       *
       * 只有當棋盤出現五連，
       * 才顯示。
       */

      animateLine(
        line
      );

      return;
    }

    if (visible) {

      visible =
        false;

      cancelAnimationFrame(
        animationFrame
      );

      clear();
    }
  }


  /*
   * ---------------------------------------------------------
   * Mutation observer
   *
   * app.js 每次 redraw Canvas 時，
   * DOM 本身可能不變，所以再搭配
   * requestAnimationFrame polling。
   * ---------------------------------------------------------
   */

  let running = true;

  function loop() {

    if (!running) {
      return;
    }

    inspect();

    window.requestAnimationFrame(
      loop
    );
  }

  window.requestAnimationFrame(
    loop
  );


  /*
   * ---------------------------------------------------------
   * Screen changes
   * ---------------------------------------------------------
   */

  document.addEventListener(
    "visibilitychange",
    () => {

      if (
        document.hidden
      ) {

        cancelAnimationFrame(
          animationFrame
        );

      }

    }
  );


  /*
   * ---------------------------------------------------------
   * Reset overlay when game screen
   * disappears.
   * ---------------------------------------------------------
   */

  const observer =
    new MutationObserver(
      () => {

        const gameScreen =
          document.getElementById(
            "gameScreen"
          );

        if (
          gameScreen &&
          !gameScreen.classList.contains(
            "active"
          )
        ) {

          visible =
            false;

          previousHash =
            "";

          clear();

        }

      }
    );

  observer.observe(
    document.body,
    {
      attributes: true,
      subtree: true,
      attributeFilter: [
        "class",
        "hidden"
      ]
    }
  );


  /*
   * ---------------------------------------------------------
   * Public debug API
   *
   * 不影響 app.js。
   * ---------------------------------------------------------
   */

  window.GomokuWinLine = {
    clear() {

      visible =
        false;

      previousHash =
        "";

      cancelAnimationFrame(
        animationFrame
      );

      clear();

    },

    redraw() {

      previousHash =
        "";

      inspect();

    }
  };

})();
