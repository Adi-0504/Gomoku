(() => {
  "use strict";

  /*
   * =========================================================
   * GOMOKU REVIEW ENGINE
   * =========================================================
   *
   * This module provides:
   * - Completed game replay
   * - Move-by-move board reconstruction
   * - First / previous / play / next / last
   * - Timeline slider
   * - Move list
   * - Coordinate display
   * - Winning move highlight
   * - Light / dark compatible UI
   *
   * It is intentionally isolated from the existing
   * Gomoku game engine so the current AI / Worker /
   * audio / animation systems stay untouched.
   * =========================================================
   */

  const CONFIG = {
    SIZE: 15,
    WIN: 5,

    EMPTY: 0,
    BLACK: 1,
    WHITE: 2,

    STORAGE:
      "gomoku-game-reviews-v1"
  };


  /*
   * =========================================================
   * STATE
   * =========================================================
   */

  const reviewState = {
    games: [],
    activeGame: null,
    currentMove: 0,
    playing: false,
    timer: null
  };


  /*
   * =========================================================
   * STORAGE
   * =========================================================
   */

  function loadReviews() {
    try {
      const raw =
        localStorage.getItem(
          CONFIG.STORAGE
        );

      if (!raw) {
        return [];
      }

      const data =
        JSON.parse(raw);

      if (!Array.isArray(data)) {
        return [];
      }

      return data.slice(0, 50);

    } catch {
      return [];
    }
  }


  function saveReviews() {
    try {
      localStorage.setItem(
        CONFIG.STORAGE,
        JSON.stringify(
          reviewState.games.slice(
            0,
            50
          )
        )
      );
    } catch {}
  }


  /*
   * =========================================================
   * BOARD
   * =========================================================
   */

  function createBoard() {
    return Array.from(
      {
        length:
          CONFIG.SIZE
      },
      () =>
        Array(
          CONFIG.SIZE
        ).fill(
          CONFIG.EMPTY
        )
    );
  }


  function boardAtMove(
    moves,
    moveCount
  ) {
    const board =
      createBoard();

    const limit =
      Math.min(
        moveCount,
        moves.length
      );

    for (
      let i = 0;
      i < limit;
      i += 1
    ) {
      const move =
        moves[i];

      if (
        !move ||
        !Number.isInteger(move.row) ||
        !Number.isInteger(move.col)
      ) {
        continue;
      }

      board[move.row][move.col] =
        move.player;
    }

    return board;
  }


  /*
   * =========================================================
   * WIN LINE
   * =========================================================
   */

  function isInside(
    row,
    col
  ) {
    return (
      row >= 0 &&
      row < CONFIG.SIZE &&
      col >= 0 &&
      col < CONFIG.SIZE
    );
  }


  function getWinningLine(
    board,
    row,
    col,
    player
  ) {
    const directions = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1]
    ];

    for (
      const [dr, dc]
      of directions
    ) {
      const line = [
        [row, col]
      ];

      let r =
        row + dr;

      let c =
        col + dc;

      while (
        isInside(r, c) &&
        board[r][c] === player
      ) {
        line.push([
          r,
          c
        ]);

        r += dr;
        c += dc;
      }

      r =
        row - dr;

      c =
        col - dc;

      while (
        isInside(r, c) &&
        board[r][c] === player
      ) {
        line.unshift([
          r,
          c
        ]);

        r -= dr;
        c -= dc;
      }

      if (
        line.length >=
        CONFIG.WIN
      ) {
        return line;
      }
    }

    return [];
  }


  /*
   * =========================================================
   * COORDINATES
   * =========================================================
   */

  function coordinate(
    row,
    col
  ) {
    const columns =
      "ABCDEFGHIJKLMNO";

    return (
      columns[col] +
      String(row + 1)
    );
  }


  /*
   * =========================================================
   * REVIEW RECORD
   * =========================================================
   */

  function normalizeGame(
    game
  ) {
    if (!game) {
      return null;
    }

    const moves =
      Array.isArray(
        game.moves
      )
        ? game.moves
            .filter(
              move =>
                move &&
                Number.isInteger(
                  move.row
                ) &&
                Number.isInteger(
                  move.col
                ) &&
                (
                  move.player ===
                    CONFIG.BLACK ||
                  move.player ===
                    CONFIG.WHITE
                )
            )
            .map(
              move => ({
                row: move.row,
                col: move.col,
                player:
                  move.player
              })
            )
        : [];

    return {
      id:
        game.id ||
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

      date:
        game.date ||
        new Date().toISOString(),

      mode:
        game.mode ===
        "local"
          ? "local"
          : "ai",

      result:
        game.result ||
        "draw",

      character:
        game.character ||
        null,

      playerSide:
        game.playerSide ===
        CONFIG.WHITE
          ? CONFIG.WHITE
          : CONFIG.BLACK,

      moves,

      duration:
        Number(
          game.duration
        ) || 0,

      winner:
        game.winner ===
        CONFIG.BLACK ||
        game.winner ===
        CONFIG.WHITE
          ? game.winner
          : CONFIG.EMPTY,

      winningLine:
        Array.isArray(
          game.winningLine
        )
          ? game.winningLine
          : []
    };
  }


  /*
   * =========================================================
   * ADD GAME
   * =========================================================
   */

  function addGame(
    game
  ) {
    const normalized =
      normalizeGame(game);

    if (
      !normalized ||
      !normalized.moves.length
    ) {
      return null;
    }

    reviewState.games =
      reviewState.games.filter(
        item =>
          item.id !==
          normalized.id
      );

    reviewState.games.unshift(
      normalized
    );

    reviewState.games =
      reviewState.games.slice(
        0,
        50
      );

    saveReviews();

    return normalized;
  }


  /*
   * =========================================================
   * PUBLIC BRIDGE
   * =========================================================
   */

  window.GomokuReview = {

    addGame,

    open(game) {
      const normalized =
        normalizeGame(game);

      if (!normalized) {
        return;
      }

      reviewState.activeGame =
        normalized;

      reviewState.currentMove =
        normalized.moves.length;

      openReview();
    },

    getGames() {
      return reviewState.games.slice();
    }

  };


  /*
   * =========================================================
   * STYLES
   * =========================================================
   */

  function injectStyles() {
    if (
      document.querySelector(
        "#gomoku-review-styles"
      )
    ) {
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.id =
      "gomoku-review-styles";

    style.textContent = `
      .gomoku-review-overlay {
        position: fixed;
        inset: 0;
        z-index: 1000;

        display: grid;
        place-items: center;

        padding: 24px;

        background:
          rgba(0, 0, 0, .42);

        backdrop-filter:
          blur(18px);

        -webkit-backdrop-filter:
          blur(18px);

        opacity: 0;
        pointer-events: none;

        transition:
          opacity 180ms ease;
      }


      .gomoku-review-overlay.open {
        opacity: 1;
        pointer-events: auto;
      }


      .gomoku-review-panel {
        width:
          min(
            980px,
            100%
          );

        max-height:
          calc(
            100dvh - 48px
          );

        overflow:
          auto;

        background:
          var(--surface-solid);

        color:
          var(--text);

        border:
          1px solid var(--line);

        border-radius:
          26px;

        box-shadow:
          0 30px 90px
          rgba(0,0,0,.28);
      }


      .gomoku-review-header {
        position:
          sticky;

        top: 0;

        z-index: 3;

        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          16px;

        padding:
          18px 22px;

        background:
          color-mix(
            in srgb,
            var(--surface-solid) 90%,
            transparent
          );

        backdrop-filter:
          blur(18px);

        border-bottom:
          1px solid var(--line);
      }


      .gomoku-review-kicker {
        margin-bottom:
          4px;

        color:
          var(--muted);

        font-size:
          11px;

        letter-spacing:
          .08em;

        font-weight:
          750;
      }


      .gomoku-review-title {
        margin: 0;

        font-size:
          22px;

        letter-spacing:
          -.025em;
      }


      .gomoku-review-close {
        width:
          40px;

        height:
          40px;

        border:
          0;

        border-radius:
          50%;

        background:
          var(--line);

        color:
          var(--text);

        cursor:
          pointer;

        font-size:
          23px;
      }


      .gomoku-review-body {
        padding:
          22px;
      }


      .gomoku-review-grid {
        display:
          grid;

        grid-template-columns:
          minmax(0, 1fr)
          280px;

        gap:
          20px;
      }


      .gomoku-review-board-wrap {
        padding:
          12px;

        border:
          1px solid var(--line);

        border-radius:
          20px;

        background:
          color-mix(
            in srgb,
            var(--background) 78%,
            var(--surface-solid)
          );
      }


      .gomoku-review-board {
        width:
          100%;

        max-width:
          620px;

        margin:
          auto;

        aspect-ratio:
          1;

        display:
          grid;

        grid-template-columns:
          repeat(
            15,
            1fr
          );

        grid-template-rows:
          repeat(
            15,
            1fr
          );

        padding:
          3%;

        border-radius:
          14px;

        background:
          var(--board);

        overflow:
          hidden;
      }


      .gomoku-review-cell {
        position:
          relative;

        display:
          grid;

        place-items:
          center;
      }


      .gomoku-review-cell::before {
        content:
          "";

        position:
          absolute;

        inset:
          50% 0 auto;

        height:
          1px;

        background:
          var(--board-line);
      }


      .gomoku-review-cell::after {
        content:
          "";

        position:
          absolute;

        inset:
          0 auto 0 50%;

        width:
          1px;

        background:
          var(--board-line);
      }


      .gomoku-review-stone {
        position:
          relative;

        z-index:
          2;

        width:
          73%;

        aspect-ratio:
          1;

        border-radius:
          50%;

        box-shadow:
          0 2px 5px
          rgba(0,0,0,.22);
      }


      .gomoku-review-stone.black {
        background:
          radial-gradient(
            circle at 31% 24%,
            #555 0%,
            #292929 28%,
            #131313 100%
          );
      }


      .gomoku-review-stone.white {
        background:
          radial-gradient(
            circle at 30% 24%,
            #fff 0%,
            #f4f0e7 58%,
            #d1cabb 100%
          );

        border:
          1px solid
          rgba(0,0,0,.13);
      }


      .gomoku-review-stone.current {
        box-shadow:
          0 0 0 3px
          color-mix(
            in srgb,
            var(--accent) 68%,
            transparent
          ),
          0 3px 7px
          rgba(0,0,0,.24);
      }


      .gomoku-review-stone.winning {
        box-shadow:
          0 0 0 3px
          rgba(212,109,82,.85),
          0 0 20px
          rgba(212,109,82,.24);
      }


      .gomoku-review-side {
        display:
          grid;

        gap:
          12px;

        align-content:
          start;
      }


      .gomoku-review-stats {
        display:
          grid;

        grid-template-columns:
          repeat(
            2,
            1fr
          );

        gap:
          8px;
      }


      .gomoku-review-stat {
        padding:
          12px;

        border:
          1px solid var(--line);

        border-radius:
          14px;

        background:
          var(--surface);
      }


      .gomoku-review-stat span {
        display:
          block;

        margin-bottom:
          4px;

        color:
          var(--muted);

        font-size:
          11px;
      }


      .gomoku-review-stat strong {
        display:
          block;

        font-size:
          18px;

        font-variant-numeric:
          tabular-nums;
      }


      .gomoku-review-moment {
        padding:
          14px;

        border:
          1px solid var(--line);

        border-radius:
          14px;

        background:
          var(--surface);

        line-height:
          1.5;
      }


      .gomoku-review-moment small {
        display:
          block;

        margin-bottom:
          4px;

        color:
          var(--muted);
      }


      .gomoku-review-moment strong {
        display:
          block;
      }


      .gomoku-review-moves {
        display:
          grid;

        gap:
          5px;

        max-height:
          330px;

        overflow:
          auto;
      }


      .gomoku-review-move {
        display:
          grid;

        grid-template-columns:
          38px
          1fr
          auto;

        align-items:
          center;

        gap:
          8px;

        min-height:
          38px;

        padding:
          0 9px;

        border:
          1px solid transparent;

        border-radius:
          10px;

        background:
          transparent;

        color:
          var(--text);

        cursor:
          pointer;

        text-align:
          left;
      }


      .gomoku-review-move:hover {
        background:
          var(--line);
      }


      .gomoku-review-move.selected {
        border-color:
          color-mix(
            in srgb,
            var(--accent) 35%,
            transparent
          );

        background:
          color-mix(
            in srgb,
            var(--accent) 12%,
            transparent
          );
      }


      .gomoku-review-controls {
        display:
          grid;

        grid-template-columns:
          repeat(
            5,
            1fr
          );

        gap:
          7px;

        margin-top:
          12px;
      }


      .gomoku-review-control {
        min-height:
          42px;

        border:
          1px solid var(--line);

        border-radius:
          12px;

        background:
          var(--surface);

        color:
          var(--text);

        cursor:
          pointer;

        font-weight:
          650;
      }


      .gomoku-review-control:hover {
        background:
          var(--line);
      }


      .gomoku-review-slider {
        width:
          100%;

        margin-top:
          10px;

        accent-color:
          var(--accent);
      }


      .gomoku-review-result-button {
        width:
          100%;

        min-height:
          52px;

        margin-top:
          12px;

        border:
          1px solid var(--line);

        border-radius:
          16px;

        background:
          var(--surface);

        color:
          var(--text);

        cursor:
          pointer;

        font-weight:
          700;
      }


      @media (
        max-width: 760px
      ) {

        .gomoku-review-overlay {
          padding:
            10px;
        }

        .gomoku-review-panel {
          max-height:
            calc(
              100dvh - 20px
            );

          border-radius:
            20px;
        }

        .gomoku-review-body {
          padding:
            12px;
        }

        .gomoku-review-grid {
          grid-template-columns:
            1fr;
        }

        .gomoku-review-controls {
          grid-template-columns:
            repeat(
              4,
              1fr
            );
        }

        .gomoku-review-control.play {
          grid-column:
            span 4;
        }

      }
    `;

    document.head.appendChild(
      style
    );
  }


  /*
   * =========================================================
   * UI
   * =========================================================
   */

  function ensureReviewUI() {
    injectStyles();

    if (
      document.querySelector(
        "#gomokuReviewOverlay"
      )
    ) {
      return;
    }

    const overlay =
      document.createElement(
        "div"
      );

    overlay.id =
      "gomokuReviewOverlay";

    overlay.className =
      "gomoku-review-overlay";

    overlay.innerHTML = `
      <section
        class="gomoku-review-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gomokuReviewTitle"
      >

        <header
          class="gomoku-review-header"
        >

          <div>
            <div
              class="gomoku-review-kicker"
            >
              GAME REVIEW
            </div>

            <h2
              class="gomoku-review-title"
              id="gomokuReviewTitle"
            >
              這局回顧
            </h2>
          </div>

          <button
            type="button"
            class="gomoku-review-close"
            id="gomokuReviewClose"
            aria-label="關閉"
          >
            ×
          </button>

        </header>


        <div
          class="gomoku-review-body"
        >

          <div
            class="gomoku-review-grid"
          >

            <div>

              <div
                class="gomoku-review-board-wrap"
              >

                <div
                  class="gomoku-review-board"
                  id="gomokuReviewBoard"
                ></div>

              </div>


              <div
                class="gomoku-review-controls"
              >

                <button
                  type="button"
                  class="gomoku-review-control"
                  data-review-action="first"
                >
                  最前
                </button>

                <button
                  type="button"
                  class="gomoku-review-control"
                  data-review-action="prev"
                >
                  上一步
                </button>

                <button
                  type="button"
                  class="gomoku-review-control play"
                  data-review-action="play"
                >
                  播放
                </button>

                <button
                  type="button"
                  class="gomoku-review-control"
                  data-review-action="next"
                >
                  下一步
                </button>

                <button
                  type="button"
                  class="gomoku-review-control"
                  data-review-action="last"
                >
                  最後
                </button>

              </div>


              <input
                class="gomoku-review-slider"
                id="gomokuReviewSlider"
                type="range"
                min="0"
                max="0"
                value="0"
                step="1"
              >

            </div>


            <aside
              class="gomoku-review-side"
            >

              <div
                class="gomoku-review-stats"
              >

                <div
                  class="gomoku-review-stat"
                >
                  <span>總手數</span>
                  <strong
                    id="gomokuReviewTotal"
                  >
                    0
                  </strong>
                </div>

                <div
                  class="gomoku-review-stat"
                >
                  <span>目前</span>
                  <strong
                    id="gomokuReviewCurrent"
                  >
                    0
                  </strong>
                </div>

              </div>


              <div
                class="gomoku-review-moment"
              >

                <small>
                  局面
                </small>

                <strong
                  id="gomokuReviewMoment"
                >
                  開局
                </strong>

              </div>


              <div
                class="gomoku-review-moves"
                id="gomokuReviewMoves"
              ></div>

            </aside>

          </div>

        </div>

      </section>
    `;

    document.body.appendChild(
      overlay
    );


    overlay.addEventListener(
      "click",
      event => {
        if (
          event.target ===
          overlay
        ) {
          closeReview();
        }
      }
    );


    document
      .querySelector(
        "#gomokuReviewClose"
      )
      .addEventListener(
        "click",
        closeReview
      );


    overlay
      .querySelectorAll(
        "[data-review-action]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const action =
                button.dataset.reviewAction;

              handleReviewAction(
                action
              );
            }
          );
        }
      );


    document
      .querySelector(
        "#gomokuReviewSlider"
      )
      .addEventListener(
        "input",
        event => {

          stopPlayback();

          setReviewMove(
            Number(
              event.target.value
            )
          );
        }
      );
  }


  /*
   * =========================================================
   * BOARD RENDER
   * =========================================================
   */

  function renderReviewBoard() {
    const boardElement =
      document.querySelector(
        "#gomokuReviewBoard"
      );

    if (!boardElement) {
      return;
    }

    const game =
      reviewState.activeGame;

    if (!game) {
      return;
    }

    const board =
      boardAtMove(
        game.moves,
        reviewState.currentMove
      );

    boardElement.innerHTML =
      "";


    const winningSet =
      new Set(
        (game.winningLine || [])
          .map(
            point =>
              `${point[0]},${point[1]}`
          )
      );


    for (
      let row = 0;
      row < CONFIG.SIZE;
      row += 1
    ) {

      for (
        let col = 0;
        col < CONFIG.SIZE;
        col += 1
      ) {

        const cell =
          document.createElement(
            "div"
          );

        cell.className =
          "gomoku-review-cell";


        const player =
          board[row][col];


        if (
          player !==
          CONFIG.EMPTY
        ) {

          const stone =
            document.createElement(
              "div"
            );

          stone.className =
            "gomoku-review-stone " +
            (
              player ===
              CONFIG.BLACK
                ? "black"
                : "white"
            );


          const moveIndex =
            findMoveIndex(
              game.moves,
              row,
              col,
              reviewState.currentMove
            );


          if (
            moveIndex ===
            reviewState.currentMove - 1
          ) {
            stone.classList.add(
              "current"
            );
          }


          if (
            winningSet.has(
              `${row},${col}`
            )
          ) {
            stone.classList.add(
              "winning"
            );
          }


          cell.appendChild(
            stone
          );
        }


        boardElement.appendChild(
          cell
        );
      }
    }


    updateReviewMeta();

    renderMoveList();
  }


  function findMoveIndex(
    moves,
    row,
    col,
    limit
  ) {
    for (
      let i = 0;
      i < limit;
      i += 1
    ) {

      if (
        moves[i].row === row &&
        moves[i].col === col
      ) {
        return i;
      }
    }

    return -1;
  }


  /*
   * =========================================================
   * META
   * =========================================================
   */

  function updateReviewMeta() {
    const game =
      reviewState.activeGame;

    if (!game) {
      return;
    }


    const total =
      document.querySelector(
        "#gomokuReviewTotal"
      );

    const current =
      document.querySelector(
        "#gomokuReviewCurrent"
      );

    const moment =
      document.querySelector(
        "#gomokuReviewMoment"
      );

    const slider =
      document.querySelector(
        "#gomokuReviewSlider"
      );


    if (total) {
      total.textContent =
        String(
          game.moves.length
        );
    }


    if (current) {
      current.textContent =
        String(
          reviewState.currentMove
        );
    }


    if (slider) {
      slider.max =
        String(
          game.moves.length
        );

      slider.value =
        String(
          reviewState.currentMove
        );
    }


    if (!moment) {
      return;
    }


    if (
      reviewState.currentMove ===
      0
    ) {
      moment.textContent =
        "開局，棋盤還沒有落子。";

      return;
    }


    const move =
      game.moves[
        reviewState.currentMove - 1
      ];

    if (!move) {
      return;
    }


    const player =
      move.player ===
      CONFIG.BLACK
        ? "黑棋"
        : "白棋";


    const board =
      boardAtMove(
        game.moves,
        reviewState.currentMove
      );


    const winningLine =
      getWinningLine(
        board,
        move.row,
        move.col,
        move.player
      );


    if (
      winningLine.length >=
      CONFIG.WIN
    ) {

      moment.textContent =
        `第 ${reviewState.currentMove} 手，${player} 在 ${coordinate(
          move.row,
          move.col
        )} 完成五連，這就是勝負手。`;

      return;
    }


    moment.textContent =
      `第 ${reviewState.currentMove} 手，${player} 落在 ${coordinate(
        move.row,
        move.col
      )}。`;
  }


  /*
   * =========================================================
   * MOVE LIST
   * =========================================================
   */

  function renderMoveList() {
    const list =
      document.querySelector(
        "#gomokuReviewMoves"
      );

    const game =
      reviewState.activeGame;

    if (
      !list ||
      !game
    ) {
      return;
    }


    list.innerHTML =
      "";


    game.moves.forEach(
      (move, index) => {

        const button =
          document.createElement(
            "button"
          );

        button.type =
          "button";

        button.className =
          "gomoku-review-move";


        if (
          index + 1 ===
          reviewState.currentMove
        ) {
          button.classList.add(
            "selected"
          );
        }


        const player =
          move.player ===
          CONFIG.BLACK
            ? "黑棋"
            : "白棋";


        button.innerHTML = `
          <span>
            ${index + 1}
          </span>

          <strong>
            ${player}
          </strong>

          <span>
            ${coordinate(
              move.row,
              move.col
            )}
          </span>
        `;


        button.addEventListener(
          "click",
          () => {

            stopPlayback();

            setReviewMove(
              index + 1
            );
          }
        );


        list.appendChild(
          button
        );
      }
    );


    const selected =
      list.querySelector(
        ".selected"
      );

    selected?.scrollIntoView({
      block:
        "nearest"
    });
  }


  /*
   * =========================================================
   * CONTROLS
   * =========================================================
   */

  function handleReviewAction(
    action
  ) {

    switch (action) {

      case "first":
        stopPlayback();
        setReviewMove(0);
        break;

      case "prev":
        stopPlayback();
        setReviewMove(
          Math.max(
            0,
            reviewState.currentMove - 1
          )
        );
        break;

      case "next":
        stopPlayback();
        setReviewMove(
          Math.min(
            reviewState.activeGame.moves.length,
            reviewState.currentMove + 1
          )
        );
        break;

      case "last":
        stopPlayback();
        setReviewMove(
          reviewState.activeGame.moves.length
        );
        break;

      case "play":
        togglePlayback();
        break;

      default:
        break;
    }
  }


  function setReviewMove(
    count
  ) {

    if (
      !reviewState.activeGame
    ) {
      return;
    }

    reviewState.currentMove =
      Math.max(
        0,
        Math.min(
          reviewState.activeGame.moves.length,
          Number(count) || 0
        )
      );

    renderReviewBoard();
  }


  function togglePlayback() {
    if (
      reviewState.playing
    ) {

      stopPlayback();

      return;
    }


    if (
      !reviewState.activeGame
    ) {
      return;
    }


    if (
      reviewState.currentMove >=
      reviewState.activeGame.moves.length
    ) {

      setReviewMove(0);
    }


    reviewState.playing =
      true;


    updatePlayButton();


    reviewState.timer =
      window.setInterval(
        () => {

          if (
            reviewState.currentMove >=
            reviewState.activeGame.moves.length
          ) {

            stopPlayback();

            return;
          }


          setReviewMove(
            reviewState.currentMove + 1
          );

        },
        500
      );
  }


  function stopPlayback() {

    reviewState.playing =
      false;

    clearInterval(
      reviewState.timer
    );

    reviewState.timer =
      null;

    updatePlayButton();
  }


  function updatePlayButton() {
    const button =
      document.querySelector(
        '[data-review-action="play"]'
      );

    if (!button) {
      return;
    }

    button.textContent =
      reviewState.playing
        ? "暫停"
        : "播放";
  }


  /*
   * =========================================================
   * OPEN / CLOSE
   * =========================================================
   */

  function openReview() {

    ensureReviewUI();

    const overlay =
      document.querySelector(
        "#gomokuReviewOverlay"
      );

    if (!overlay) {
      return;
    }

    reviewState.playing =
      false;

    clearInterval(
      reviewState.timer
    );

    overlay.classList.add(
      "open"
    );

    document.body.style.overflow =
      "hidden";

    renderReviewBoard();
  }


  function closeReview() {

    stopPlayback();

    const overlay =
      document.querySelector(
        "#gomokuReviewOverlay"
      );

    overlay?.classList.remove(
      "open"
    );

    document.body.style.overflow =
      "";
  }


  /*
   * =========================================================
   * RESULT BUTTON
   * =========================================================
   */

  function ensureResultButton() {

    const resultScreen =
      document.querySelector(
        "#resultScreen"
      );

    const actions =
      resultScreen?.querySelector(
        ".result-actions"
      );

    if (
      !actions ||
      document.querySelector(
        "#gomokuOpenReview"
      )
    ) {
      return;
    }


    const button =
      document.createElement(
        "button"
      );

    button.type =
      "button";

    button.id =
      "gomokuOpenReview";

    button.className =
      "secondary-button full-button";

    button.textContent =
      "這局回顧";


    button.addEventListener(
      "click",
      () => {

        const game =
          getLatestReview();

        if (!game) {
          return;
        }

        window.GomokuReview.open(
          game
        );
      }
    );


    actions.appendChild(
      button
    );
  }


  function getLatestReview() {
    return (
      reviewState.games[0] ||
      null
    );
  }


  /*
   * =========================================================
   * BOOT
   * =========================================================
   */

  function init() {

    reviewState.games =
      loadReviews();

    ensureReviewUI();

    ensureResultButton();


    /*
     * Re-scan after dynamically created
     * result UI becomes available.
     */

    window.setTimeout(
      ensureResultButton,
      0
    );
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
