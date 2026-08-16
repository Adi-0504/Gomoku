(() => {
  "use strict";

  /*
   * =========================================================
   * GOMOKU — WIN LINE VISUAL LAYER
   * =========================================================
   *
   * app.js 不修改。
   *
   * 這個模組不負責判斷勝負。
   * app.js 已經負責真正的五連判定與繪製。
   *
   * 本模組只負責：
   * - 建立獨立視覺層
   * - 偵測遊戲進入結果畫面
   * - 從棋盤畫面推算最後五子
   * - 播放精緻勝利線動畫
   * - 不攔截棋盤操作
   *
   * =========================================================
   */

  const BOARD_SIZE = 15;
  const WIN_LENGTH = 5;

  const CONFIG = {
    duration: 520,
    lineWidthRatio: 0.105,
    glowWidthRatio: 0.30,
    extensionRatio: 0.10,
    scanInterval: 120,

    colors: {
      line: "#c96f52",
      glow: "rgba(201, 111, 82, 0.32)",
      highlight: "rgba(255, 255, 255, 0.78)"
    }
  };

  const board = document.getElementById("boardCanvas");

  if (!board) {
    return;
  }

  /*
   * =========================================================
   * OVERLAY
   * =========================================================
   */

  const wrapper = board.parentElement || board;

  if (wrapper !== board) {
    const computed = getComputedStyle(wrapper);

    if (computed.position === "static") {
      wrapper.style.position = "relative";
    }
  }

  const overlay = document.createElement("canvas");

  overlay.id = "gomokuWinningLineOverlay";
  overlay.setAttribute("aria-hidden", "true");

  Object.assign(overlay.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    display: "block",
    pointerEvents: "none",
    zIndex: "20"
  });

  if (wrapper === board) {
    overlay.style.position = "fixed";
    overlay.style.left = "0";
    overlay.style.top = "0";
  }

  wrapper.appendChild(overlay);

  const ctx = overlay.getContext("2d");

  if (!ctx) {
    return;
  }

  /*
   * =========================================================
   * STATE
   * =========================================================
   */

  let lastBoardHash = "";
  let lastWinningHash = "";
  let scanTimer = 0;
  let animationFrame = 0;
  let currentLine = null;

  /*
   * =========================================================
   * GEOMETRY
   * =========================================================
   */

  function getGeometry() {
    const rect = board.getBoundingClientRect();

    const size = Math.min(
      rect.width,
      rect.height
    );

    /*
     * 和 app.js 的棋盤內距保持一致。
     *
     * app.js：
     * boardPadding = size * 0.075
     */

    const padding = size * 0.075;

    const usable = size - padding * 2;

    const cell = usable / (BOARD_SIZE - 1);

    return {
      rect,
      size,
      padding,
      cell
    };
  }

  function boardPoint(row, col) {
    const geometry = getGeometry();

    return {
      x:
        geometry.padding +
        col * geometry.cell,

      y:
        geometry.padding +
        row * geometry.cell
    };
  }

  /*
   * =========================================================
   * RESIZE
   * =========================================================
   */

  function resize() {
    const rect = board.getBoundingClientRect();

    if (
      rect.width <= 0 ||
      rect.height <= 0
    ) {
      return;
    }

    const dpr = Math.min(
      Math.max(
        window.devicePixelRatio || 1,
        1
      ),
      3
    );

    overlay.width =
      Math.round(rect.width * dpr);

    overlay.height =
      Math.round(rect.height * dpr);

    overlay.style.width =
      `${rect.width}px`;

    overlay.style.height =
      `${rect.height}px`;

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
    const rect = board.getBoundingClientRect();

    ctx.clearRect(
      0,
      0,
      rect.width,
      rect.height
    );
  }

  if ("ResizeObserver" in window) {
    const observer =
      new ResizeObserver(resize);

    observer.observe(board);
  }

  window.addEventListener(
    "resize",
    resize,
    { passive: true }
  );

  resize();

  /*
   * =========================================================
   * CANVAS SNAPSHOT
   * =========================================================
   */

  function snapshot() {
    try {
      const source =
        document.createElement("canvas");

      source.width = board.width;
      source.height = board.height;

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
   * =========================================================
   * SAMPLE STONE
   * =========================================================
   *
   * 這裡只用來找「最後五顆」。
   *
   * 不是拿來判斷遊戲規則。
   */

  function sampleCell(
    source,
    row,
    col
  ) {
    const geometry = getGeometry();

    const point =
      boardPoint(row, col);

    const rect = geometry.rect;

    const scaleX =
      source.canvas.width /
      rect.width;

    const scaleY =
      source.canvas.height /
      rect.height;

    const x = Math.round(
      point.x * scaleX
    );

    const y = Math.round(
      point.y * scaleY
    );

    /*
     * 只取中心附近。
     *
     * 避免把棋盤線本身算進去。
     */

    const radius =
      Math.max(
        3,
        Math.round(
          source.canvas.width *
          0.009
        )
      );

    const left =
      Math.max(
        0,
        x - radius
      );

    const top =
      Math.max(
        0,
        y - radius
      );

    const width =
      Math.min(
        source.canvas.width - left,
        radius * 2 + 1
      );

    const height =
      Math.min(
        source.canvas.height - top,
        radius * 2 + 1
      );

    if (
      width <= 0 ||
      height <= 0
    ) {
      return 0;
    }

    const data =
      source.getImageData(
        left,
        top,
        width,
        height
      ).data;

    let dark = 0;
    let light = 0;
    let count = 0;

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

      if (brightness < 90) {
        dark++;
      }

      if (brightness > 210) {
        light++;
      }

      count++;
    }

    if (!count) {
      return 0;
    }

    if (
      dark / count >
      0.32
    ) {
      return 1;
    }

    if (
      light / count >
      0.55
    ) {
      return 2;
    }

    return 0;
  }

  /*
   * =========================================================
   * READ BOARD
   * =========================================================
   */

  function readBoard() {
    const source = snapshot();

    if (!source) {
      return null;
    }

    const state =
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
        state[row][col] =
          sampleCell(
            source,
            row,
            col
          );
      }
    }

    return state;
  }

  /*
   * =========================================================
   * HASH
   * =========================================================
   */

  function hash(state) {
    return state
      .map(row => row.join(""))
      .join("|");
  }

  /*
   * =========================================================
   * FIND WINNING LINE
   * =========================================================
   */

  function findLine(state) {
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
          const [dr, dc]
          of directions
        ) {
          const cells = [];

          let r = row;
          let c = col;

          while (
            r >= 0 &&
            r < BOARD_SIZE &&
            c >= 0 &&
            c < BOARD_SIZE &&
            state[r][c] === player
          ) {
            cells.push([
              r,
              c
            ]);

            r += dr;
            c += dc;
          }

          if (
            cells.length >=
            WIN_LENGTH
          ) {
            return cells;
          }
        }
      }
    }

    return null;
  }

  /*
   * =========================================================
   * DRAW
   * =========================================================
   */

  function draw(line, progress) {
    clear();

    if (
      !line ||
      line.length < WIN_LENGTH
    ) {
      return;
    }

    const geometry =
      getGeometry();

    const first =
      boardPoint(
        line[0][0],
        line[0][1]
      );

    const last =
      boardPoint(
        line[line.length - 1][0],
        line[line.length - 1][1]
      );

    const dx =
      last.x - first.x;

    const dy =
      last.y - first.y;

    const startX =
      first.x -
      dx * CONFIG.extensionRatio;

    const startY =
      first.y -
      dy * CONFIG.extensionRatio;

    const endX =
      first.x +
      dx *
      (
        CONFIG.extensionRatio +
        (1 -
          CONFIG.extensionRatio * 2) *
        progress
      );

    const endY =
      first.y +
      dy *
      (
        CONFIG.extensionRatio +
        (1 -
          CONFIG.extensionRatio * 2) *
        progress
      );

    /*
     * GLOW
     */

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
        9,
        geometry.cell *
        CONFIG.glowWidthRatio
      );

    ctx.strokeStyle =
      CONFIG.colors.glow;

    ctx.shadowColor =
      CONFIG.colors.glow;

    ctx.shadowBlur =
      geometry.cell * 0.35;

    ctx.stroke();

    /*
     * MAIN LINE
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

    ctx.lineCap =
      "round";

    ctx.lineWidth =
      Math.max(
        3,
        geometry.cell *
        CONFIG.lineWidthRatio
      );

    ctx.strokeStyle =
      CONFIG.colors.line;

    ctx.shadowColor =
      "rgba(0,0,0,0.16)";

    ctx.shadowBlur =
      geometry.cell * 0.08;

    ctx.stroke();

    /*
     * HIGHLIGHT
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
        geometry.cell * 0.025
      );

    ctx.strokeStyle =
      CONFIG.colors.highlight;

    ctx.shadowBlur = 0;

    ctx.globalAlpha = 0.65;

    ctx.stroke();

    ctx.restore();
  }

  /*
   * =========================================================
   * ANIMATE
   * =========================================================
   */

  function animate(line) {
    cancelAnimationFrame(
      animationFrame
    );

    currentLine = line;

    const started =
      performance.now();

    function frame(now) {
      const elapsed =
        now - started;

      const raw =
        Math.min(
          1,
          elapsed /
          CONFIG.duration
        );

      const progress =
        1 -
        Math.pow(
          1 - raw,
          3
        );

      draw(
        line,
        progress
      );

      if (raw < 1) {
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
   * =========================================================
   * RESULT DETECTION
   * =========================================================
   *
   * 不依賴 app.js 的 DOM 結構。
   *
   * 只要棋盤上真的出現五連，
   * 就播放一次。
   */

  function inspect() {
    const state =
      readBoard();

    if (!state) {
      return;
    }

    const currentHash =
      hash(state);

    if (
      currentHash ===
      lastBoardHash
    ) {
      return;
    }

    lastBoardHash =
      currentHash;

    const line =
      findLine(state);

    if (!line) {
      return;
    }

    const lineHash =
      line
        .map(
          ([r, c]) =>
            `${r},${c}`
        )
        .join("|");

    if (
      lineHash ===
      lastWinningHash
    ) {
      return;
    }

    lastWinningHash =
      lineHash;

    animate(line);
  }

  /*
   * =========================================================
   * CLEAR WHEN GAME RESTARTS
   * =========================================================
   */

  function monitor() {
    inspect();

    scanTimer =
      window.setTimeout(
        monitor,
        CONFIG.scanInterval
      );
  }

  /*
   * 當使用者重新開始 / 離開棋局，
   * 棋盤會變化。
   *
   * 新棋局沒有五連時自動清除 overlay。
   */

  function clearIfNoWin() {
    const state =
      readBoard();

    if (!state) {
      return;
    }

    const line =
      findLine(state);

    if (!line) {
      lastWinningHash = "";
      currentLine = null;
      cancelAnimationFrame(
        animationFrame
      );
      clear();
    }
  }

  window.addEventListener(
    "pageshow",
    clearIfNoWin
  );

  /*
   * =========================================================
   * START
   * =========================================================
   */

  monitor();

})();
