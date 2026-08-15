(() => {
  "use strict";

  /*
   * =========================================================
   * GOMOKU REVIEW ENGINE v1.1
   * =========================================================
   *
   * Zero-intrusion review system.
   *
   * Does NOT modify:
   * - app.js
   * - ai-worker.js
   * - existing game logic
   * - existing game state
   *
   * It automatically reads the existing Gomoku game
   * LocalStorage data and creates a replayable review.
   *
   * Features:
   * - Automatic game-state detection
   * - Completed game review
   * - Move-by-move reconstruction
   * - First / previous / play / next / last
   * - Timeline slider
   * - Move list
   * - Coordinate display
   * - Winning move detection
   * - Winning line highlight
   * - Keyboard controls
   * - Light / dark compatible
   * - Responsive layout
   * - Up to 50 saved reviews
   * =========================================================
   */

  const CONFIG = {
    SIZE: 15,
    WIN: 5,

    EMPTY: 0,
    BLACK: 1,
    WHITE: 2,

    GAME_STORAGE_KEYS: [
      "gomoku-active-game-v5",
      "gomoku-active-game-v4",
      "gomoku-active-game-v3",
      "gomoku-active-game-v2",
      "gomoku-active-game"
    ],

    REVIEW_STORAGE:
      "gomoku-game-reviews-v1",

    MAX_REVIEWS:
      50,

    PLAY_INTERVAL:
      520
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

    timer: null,

    initialized: false

  };


  /*
   * =========================================================
   * SAFE STORAGE
   * =========================================================
   */

  function readStorage(key) {

    try {

      const raw =
        localStorage.getItem(key);

      if (!raw) {
        return null;
      }

      return JSON.parse(raw);

    } catch (error) {

      console.warn(
        "[Gomoku Review] Storage read failed:",
        key,
        error
      );

      return null;
    }
  }


  function writeStorage(
    key,
    value
  ) {

    try {

      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

      return true;

    } catch (error) {

      console.warn(
        "[Gomoku Review] Storage write failed:",
        key,
        error
      );

      return false;
    }
  }


  /*
   * =========================================================
   * REVIEW STORAGE
   * =========================================================
   */

  function loadReviews() {

    const data =
      readStorage(
        CONFIG.REVIEW_STORAGE
      );

    if (
      !Array.isArray(data)
    ) {
      return [];
    }

    return data
      .map(normalizeGame)
      .filter(Boolean)
      .slice(
        0,
        CONFIG.MAX_REVIEWS
      );
  }


  function saveReviews() {

    writeStorage(
      CONFIG.REVIEW_STORAGE,
      reviewState.games.slice(
        0,
        CONFIG.MAX_REVIEWS
      )
    );
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


  function boardAtMove(
    moves,
    moveCount
  ) {

    const board =
      createBoard();

    const limit =
      Math.max(
        0,
        Math.min(
          Number(moveCount) || 0,
          moves.length
        )
      );

    for (
      let i = 0;
      i < limit;
      i += 1
    ) {

      const move =
        moves[i];

      if (!isValidMove(move)) {
        continue;
      }

      board[move.row][move.col] =
        move.player;
    }

    return board;
  }


  function isValidMove(
    move
  ) {

    return Boolean(
      move &&
      Number.isInteger(
        move.row
      ) &&
      Number.isInteger(
        move.col
      ) &&
      isInside(
        move.row,
        move.col
      ) &&
      (
        move.player ===
          CONFIG.BLACK ||
        move.player ===
          CONFIG.WHITE
      )
    );
  }


  /*
   * =========================================================
   * WIN DETECTION
   * =========================================================
   */

  const DIRECTIONS = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1]
  ];


  function getWinningLine(
    board,
    row,
    col,
    player
  ) {

    if (
      !isInside(
        row,
        col
      ) ||
      board[row][col] !== player
    ) {
      return [];
    }

    for (
      const [dr, dc]
      of DIRECTIONS
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


  function findWinningLineAtMove(
    moves,
    moveIndex
  ) {

    if (
      moveIndex < 0 ||
      moveIndex >= moves.length
    ) {
      return [];
    }

    const move =
      moves[moveIndex];

    if (!isValidMove(move)) {
      return [];
    }

    const board =
      boardAtMove(
        moves,
        moveIndex + 1
      );

    return getWinningLine(
      board,
      move.row,
      move.col,
      move.player
    );
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

    if (
      !isInside(
        row,
        col
      )
    ) {
      return "?";
    }

    return (
      columns[col] +
      String(row + 1)
    );
  }


  /*
   * =========================================================
   * MOVE NORMALIZATION
   * =========================================================
   */

  function normalizeMoves(
    moves
  ) {

    if (
      !Array.isArray(moves)
    ) {
      return [];
    }


    const board =
      createBoard();

    const result = [];


    for (
      const move of moves
    ) {

      if (
        !isValidMove(move)
      ) {
        continue;
      }


      /*
       * Do not allow impossible duplicate
       * occupation to corrupt the replay.
       */

      if (
        board[move.row][move.col] !==
        CONFIG.EMPTY
      ) {
        continue;
      }


      board[move.row][move.col] =
        move.player;


      result.push({
        row:
          move.row,

        col:
          move.col,

        player:
          move.player
      });
    }


    return result;
  }


  /*
   * =========================================================
   * GAME NORMALIZATION
   * =========================================================
   */

  function normalizeGame(
    game
  ) {

    if (
      !game ||
      typeof game !==
        "object"
    ) {
      return null;
    }


    const moves =
      normalizeMoves(
        game.moves
      );


    if (
      !moves.length
    ) {
      return null;
    }


    let winner =
      CONFIG.EMPTY;

    let winningLine = [];


    /*
     * Recalculate the actual result
     * from the move history instead of
     * trusting possibly stale storage.
     */

    for (
      let i = 0;
      i < moves.length;
      i += 1
    ) {

      const line =
        findWinningLineAtMove(
          moves,
          i
        );


      if (
        line.length >=
        CONFIG.WIN
      ) {

        winner =
          moves[i].player;

        winningLine =
          line;

        /*
         * Ignore moves after the
         * actual winning move.
         */

        break;
      }
    }


    if (
      !winner &&
      moves.length >=
        CONFIG.SIZE *
        CONFIG.SIZE
    ) {

      winner =
        CONFIG.EMPTY;
    }


    let result =
      "draw";


    if (
      winner ===
      CONFIG.BLACK
    ) {

      result =
        "black";

    } else if (
      winner ===
      CONFIG.WHITE
    ) {

      result =
        "white";
    }


    const id =
      typeof game.id ===
      "string" &&
      game.id.length
        ? game.id
        : createGameId();


    return {

      id,

      date:
        game.date ||
        game.createdAt ||
        new Date().toISOString(),

      mode:
        game.mode ===
        "local"
          ? "local"
          : "ai",

      result,

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

      winner,

      winningLine

    };
  }


  function createGameId() {

    return (
      "review-" +
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .slice(2, 9)
    );
  }


  /*
   * =========================================================
   * AUTOMATIC GAME DETECTION
   * =========================================================
   */

  function findGameStorage() {

    for (
      const key
      of CONFIG.GAME_STORAGE_KEYS
    ) {

      const data =
        readStorage(key);

      if (
        data &&
        typeof data ===
          "object"
      ) {

        return {
          key,
          data
        };
      }
    }


    return null;
  }


  function extractGameData(
    data
  ) {

    if (!data) {
      return null;
    }


    /*
     * Most common shape:
     *
     * {
     *   moves: [...]
     * }
     */

    if (
      Array.isArray(
        data.moves
      )
    ) {
      return data;
    }


    /*
     * Some versions may store
     * the actual game under a nested
     * property.
     */

    const candidates = [
      data.game,
      data.state,
      data.currentGame,
      data.activeGame
    ];


    for (
      const candidate
      of candidates
    ) {

      if (
        candidate &&
        Array.isArray(
          candidate.moves
        )
      ) {
        return candidate;
      }
    }


    return null;
  }


  function detectCurrentGame() {

    const storage =
      findGameStorage();

    if (!storage) {
      return null;
    }


    const data =
      extractGameData(
        storage.data
      );

    if (!data) {
      return null;
    }


    const normalized =
      normalizeGame(
        data
      );

    if (!normalized) {
      return null;
    }


    /*
     * Preserve existing metadata
     * whenever possible.
     */

    normalized.sourceStorage =
      storage.key;


    return normalized;
  }


  /*
   * =========================================================
   * AUTOMATIC REVIEW CREATION
   * =========================================================
   */

  function registerDetectedGame() {

    const game =
      detectCurrentGame();

    if (!game) {
      return null;
    }


    /*
     * A game is considered reviewable
     * if it has a winner or is completely
     * filled.
     */

    const finished =
      Boolean(
        game.winner ||
        game.moves.length >=
          CONFIG.SIZE *
          CONFIG.SIZE
      );


    if (!finished) {
      return null;
    }


    return addGame(
      game
    );
  }


  function addGame(
    game
  ) {

    const normalized =
      normalizeGame(
        game
      );

    if (
      !normalized
    ) {
      return null;
    }


    const existingIndex =
      reviewState.games.findIndex(
        item =>
          item.id ===
          normalized.id
      );


    if (
      existingIndex >=
      0
    ) {

      reviewState.games.splice(
        existingIndex,
        1
      );
    }


    reviewState.games.unshift(
      normalized
    );


    reviewState.games =
      reviewState.games.slice(
        0,
        CONFIG.MAX_REVIEWS
      );


    saveReviews();


    return normalized;
  }


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
        z-index: 10000;

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

        pointer-events:
          none;

        transition:
          opacity 180ms ease;
      }


      .gomoku-review-overlay.open {
        opacity: 1;
        pointer-events: auto;
      }


      .gomoku-review-panel {
        width:
          min(980px, 100%);

        max-height:
          calc(100dvh - 48px);

        overflow:
          auto;

        background:
          var(--surface-solid,
          var(--surface));

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
          var(--surface-solid,
          var(--surface));

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
          var(--background,
          var(--surface));
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
          repeat(15, 1fr);

        grid-template-rows:
          repeat(15, 1fr);

        padding:
          3%;

        border-radius:
          14px;

        background:
          var(--board,
          #e8d5ad);

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

        left: 0;
        right: 0;
        top: 50%;

        height:
          1px;

        background:
          var(--board-line,
          #765f43);
      }


      .gomoku-review-cell::after {
        content:
          "";

        position:
          absolute;

        top: 0;
        bottom: 0;
        left: 50%;

        width:
          1px;

        background:
          var(--board-line,
          #765f43);
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
            var(--accent, #4f8f88)
            68%,
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
          repeat(2, 1fr);

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
          38px 1fr auto;

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
            var(--accent, #4f8f88)
            35%,
            transparent
          );

        background:
          color-mix(
            in srgb,
            var(--accent, #4f8f88)
            12%,
            transparent
          );
      }


      .gomoku-review-controls {
        display:
          grid;

        grid-template-columns:
          repeat(5, 1fr);

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
          var(--accent, #4f8f88);
      }


      .gomoku-review-empty {
        padding:
          28px 18px;

        text-align:
          center;

        color:
          var(--muted);
      }


      @media (max-width: 760px) {

        .gomoku-review-overlay {
          padding:
            10px;
        }

        .gomoku-review-panel {
          max-height:
            calc(100dvh - 20px);

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
            repeat(4, 1fr);
        }

        .gomoku-review-control.play {
          grid-column:
            span 4;
        }

      }


      @media (prefers-reduced-motion: reduce) {

        .gomoku-review-overlay {
          transition:
            none;
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

                  <span>
                    總手數
                  </span>

                  <strong
                    id="gomokuReviewTotal"
                  >
                    0
                  </strong>

                </div>


                <div
                  class="gomoku-review-stat"
                >

                  <span>
                    目前
                  </span>

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


    overlay
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

              handleReviewAction(
                button.dataset.reviewAction
              );

            }
          );

        }
      );


    overlay
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

    const game =
      reviewState.activeGame;


    if (
      !boardElement ||
      !game
    ) {
      return;
    }


    const board =
      boardAtMove(
        game.moves,
        reviewState.currentMove
      );


    boardElement.innerHTML =
      "";


    let currentMovePosition =
      null;


    if (
      reviewState.currentMove >
      0
    ) {

      currentMovePosition =
        game.moves[
          reviewState.currentMove - 1
        ];
    }


    const winningSet =
      new Set();


    /*
     * Only show winning line once
     * the actual winning move has
     * already been reached.
     */

    const winningMoveIndex =
      findWinningMoveIndex(
        game.moves
      );


    if (
      winningMoveIndex >= 0 &&
      reviewState.currentMove >
        winningMoveIndex
    ) {

      const line =
        findWinningLineAtMove(
          game.moves,
          winningMoveIndex
        );


      line.forEach(
        point => {

          winningSet.add(
            `${point[0]},${point[1]}`
          );

        }
      );
    }


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


          const isCurrent =
            currentMovePosition &&
            currentMovePosition.row ===
              row &&
            currentMovePosition.col ===
              col;


          if (isCurrent) {

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


  /*
   * =========================================================
   * WINNING MOVE
   * =========================================================
   */

  function findWinningMoveIndex(
    moves
  ) {

    for (
      let i = 0;
      i < moves.length;
      i += 1
    ) {

      const line =
        findWinningLineAtMove(
          moves,
          i
        );


      if (
        line.length >=
        CONFIG.WIN
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


    const index =
      reviewState.currentMove - 1;


    const move =
      game.moves[index];


    if (!move) {
      return;
    }


    const player =
      move.player ===
      CONFIG.BLACK
        ? "黑棋"
        : "白棋";


    const winningIndex =
      findWinningMoveIndex(
        game.moves
      );


    if (
      index ===
      winningIndex
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


        const winningIndex =
          findWinningMoveIndex(
            game.moves
          );


        const label =
          index ===
          winningIndex
            ? "勝負手"
            : "";


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
            ${label}
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

    const game =
      reviewState.activeGame;


    if (!game) {
      return;
    }


    switch (action) {

      case "first":

        stopPlayback();

        setReviewMove(0);

        break;


      case "prev":

        stopPlayback();

        setReviewMove(
          reviewState.currentMove - 1
        );

        break;


      case "next":

        stopPlayback();

        setReviewMove(
          reviewState.currentMove + 1
        );

        break;


      case "last":

        stopPlayback();

        setReviewMove(
          game.moves.length
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

    const game =
      reviewState.activeGame;


    if (!game) {
      return;
    }


    reviewState.currentMove =
      Math.max(
        0,
        Math.min(
          game.moves.length,
          Number(count) || 0
        )
      );


    renderReviewBoard();
  }


  /*
   * =========================================================
   * PLAYBACK
   * =========================================================
   */

  function togglePlayback() {

    if (
      reviewState.playing
    ) {

      stopPlayback();

      return;
    }


    const game =
      reviewState.activeGame;


    if (!game) {
      return;
    }


    if (
      reviewState.currentMove >=
      game.moves.length
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
            !reviewState.activeGame ||
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
        CONFIG.PLAY_INTERVAL
      );
  }


  function stopPlayback() {

    reviewState.playing =
      false;


    if (
      reviewState.timer !==
      null
    ) {

      clearInterval(
        reviewState.timer
      );

      reviewState.timer =
        null;
    }


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

  function openReview(
    game
  ) {

    const normalized =
      normalizeGame(
        game
      );


    if (!normalized) {
      return false;
    }


    ensureReviewUI();


    reviewState.activeGame =
      normalized;


    reviewState.currentMove =
      normalized.moves.length;


    stopPlayback();


    const overlay =
      document.querySelector(
        "#gomokuReviewOverlay"
      );


    if (!overlay) {
      return false;
    }


    overlay.classList.add(
      "open"
    );


    document.body.style.overflow =
      "hidden";


    renderReviewBoard();


    return true;
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
   * RESULT SCREEN INTEGRATION
   * =========================================================
   *
   * We do not modify app.js.
   * Instead, we observe the result screen
   * and inject the review button when
   * it becomes visible.
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
      !actions
    ) {
      return;
    }


    if (
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

          const detected =
            registerDetectedGame();


          if (detected) {

            openReview(
              detected
            );

          }

          return;
        }


        openReview(
          game
        );
      }
    );


    actions.appendChild(
      button
    );
  }


  /*
   * =========================================================
   * RESULT SCREEN OBSERVER
   * =========================================================
   */

  function observeResultScreen() {

    const resultScreen =
      document.querySelector(
        "#resultScreen"
      );


    if (!resultScreen) {
      return;
    }


    const observer =
      new MutationObserver(
        () => {

          ensureResultButton();

          /*
           * When the result screen changes,
           * attempt to capture the latest
           * completed game automatically.
           */

          registerDetectedGame();

        }
      );


    observer.observe(
      resultScreen,
      {
        childList:
          true,

        subtree:
          true,

        attributes:
          true
      }
    );


    ensureResultButton();
  }


  /*
   * =========================================================
   * KEYBOARD
   * =========================================================
   */

  function setupKeyboard() {

    document.addEventListener(
      "keydown",
      event => {

        const overlay =
          document.querySelector(
            "#gomokuReviewOverlay"
          );


        if (
          !overlay?.classList.contains(
            "open"
          )
        ) {
          return;
        }


        switch (
          event.key
        ) {

          case "Escape":

            closeReview();

            break;


          case "ArrowLeft":

            event.preventDefault();

            stopPlayback();

            setReviewMove(
              reviewState.currentMove - 1
            );

            break;


          case "ArrowRight":

            event.preventDefault();

            stopPlayback();

            setReviewMove(
              reviewState.currentMove + 1
            );

            break;


          case " ":

            event.preventDefault();

            togglePlayback();

            break;


          case "Home":

            event.preventDefault();

            stopPlayback();

            setReviewMove(0);

            break;


          case "End":

            event.preventDefault();

            stopPlayback();

            setReviewMove(
              reviewState.activeGame?.moves.length ||
              0
            );

            break;


          default:
            break;
        }
      }
    );
  }


  /*
   * =========================================================
   * PUBLIC API
   * =========================================================
   */

  window.GomokuReview = {

    addGame,

    open:
      openReview,

    close:
      closeReview,

    getGames() {

      return reviewState.games.slice();

    },

    getLatest() {

      return (
        reviewState.games[0] ||
        null
      );

    },

    refresh() {

      const game =
        registerDetectedGame();

      ensureResultButton();

      return game;
    }

  };


  /*
   * =========================================================
   * BOOT
   * =========================================================
   */

  function init() {

    if (
      reviewState.initialized
    ) {
      return;
    }


    reviewState.initialized =
      true;


    reviewState.games =
      loadReviews();


    ensureReviewUI();

    observeResultScreen();

    setupKeyboard();


    /*
     * Result screen may be created or
     * changed after app initialization.
     */

    window.setTimeout(
      () => {

        ensureResultButton();

        registerDetectedGame();

      },
      0
    );


    /*
     * A few delayed checks cover game
     * engines that update LocalStorage
     * immediately before switching
     * screens.
     */

    window.setTimeout(
      registerDetectedGame,
      250
    );


    window.setTimeout(
      registerDetectedGame,
      800
    );


    window.setTimeout(
      ensureResultButton,
      800
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
        once:
          true
      }
    );

  } else {

    init();
  }

})();
