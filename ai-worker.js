"use strict";

const SIZE = 15;

const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

const DIRS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1]
];

const INF = 1e15;
const WIN_SCORE = 1e12;

const STYLES = {
  defense: {
    attack: 0.95,
    defense: 1.35,
    center: 0.75,
    threat: 1.05
  },

  attack: {
    attack: 1.40,
    defense: 1.00,
    center: 1.05,
    threat: 1.35
  },

  balanced: {
    attack: 1.10,
    defense: 1.15,
    center: 1.00,
    threat: 1.18
  },

  counter: {
    attack: 1.20,
    defense: 1.30,
    center: 0.85,
    threat: 1.25
  }
};

function other(player) {
  return player === BLACK
    ? WHITE
    : BLACK;
}

function inside(r, c) {
  return (
    r >= 0 &&
    r < SIZE &&
    c >= 0 &&
    c < SIZE
  );
}

function cloneBoard(board) {
  return board.map(row => row.slice());
}

function count(board, r, c, dr, dc, player) {
  let n = 0;

  for (let i = 1; i <= 6; i++) {
    const rr = r + dr * i;
    const cc = c + dc * i;

    if (
      !inside(rr, cc) ||
      board[rr][cc] !== player
    ) {
      break;
    }

    n++;
  }

  return n;
}

function lineInfo(
  board,
  r,
  c,
  dr,
  dc,
  player
) {
  const a =
    count(
      board,
      r,
      c,
      dr,
      dc,
      player
    );

  const b =
    count(
      board,
      r,
      c,
      -dr,
      -dc,
      player
    );

  const frontR =
    r + dr * (a + 1);

  const frontC =
    c + dc * (a + 1);

  const backR =
    r - dr * (b + 1);

  const backC =
    c - dc * (b + 1);

  const frontOpen =
    inside(frontR, frontC) &&
    board[frontR][frontC] === EMPTY;

  const backOpen =
    inside(backR, backC) &&
    board[backR][backC] === EMPTY;

  return {
    length: 1 + a + b,
    open:
      Number(frontOpen) +
      Number(backOpen)
  };
}

function isWinningMove(
  board,
  r,
  c,
  player
) {
  if (
    !inside(r, c) ||
    board[r][c] !== EMPTY
  ) {
    return false;
  }

  board[r][c] = player;

  let win = false;

  for (const [dr, dc] of DIRS) {
    const total =
      1 +
      count(
        board,
        r,
        c,
        dr,
        dc,
        player
      ) +
      count(
        board,
        r,
        c,
        -dr,
        -dc,
        player
      );

    if (total >= 5) {
      win = true;
      break;
    }
  }

  board[r][c] = EMPTY;

  return win;
}

function patternScore(length, open) {
  if (length >= 5) {
    return WIN_SCORE;
  }

  if (length === 4 && open === 2) {
    return 120000000;
  }

  if (length === 4 && open === 1) {
    return 1500000;
  }

  if (length === 3 && open === 2) {
    return 140000;
  }

  if (length === 3 && open === 1) {
    return 7000;
  }

  if (length === 2 && open === 2) {
    return 1800;
  }

  if (length === 2 && open === 1) {
    return 120;
  }

  return 0;
}

function centerScore(r, c) {
  const distance =
    Math.abs(r - 7) +
    Math.abs(c - 7);

  return Math.max(
    0,
    18 - distance
  );
}

function placementScore(
  board,
  r,
  c,
  player,
  style
) {
  if (board[r][c] !== EMPTY) {
    return -INF;
  }

  let score = 0;

  let openFour = 0;
  let openThree = 0;

  for (const [dr, dc] of DIRS) {
    const info =
      lineInfo(
        board,
        r,
        c,
        dr,
        dc,
        player
      );

    score +=
      patternScore(
        info.length,
        info.open
      );

    if (
      info.length === 4 &&
      info.open === 2
    ) {
      openFour++;
    }

    if (
      info.length === 3 &&
      info.open === 2
    ) {
      openThree++;
    }
  }

  if (openFour >= 1) {
    score +=
      150000000 *
      style.threat;
  }

  if (openThree >= 2) {
    score +=
      8000000 *
      style.threat;
  }

  score +=
    centerScore(r, c) *
    style.center *
    20;

  return score;
}

function candidates(board, radius = 2) {
  const occupied = [];

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] !== EMPTY) {
        occupied.push([r, c]);
      }
    }
  }

  if (!occupied.length) {
    return [
      {
        row: 7,
        col: 7
      }
    ];
  }

  const set = new Set();

  for (const [r, c] of occupied) {
    for (
      let dr = -radius;
      dr <= radius;
      dr++
    ) {
      for (
        let dc = -radius;
        dc <= radius;
        dc++
      ) {
        const rr = r + dr;
        const cc = c + dc;

        if (
          inside(rr, cc) &&
          board[rr][cc] === EMPTY
        ) {
          set.add(
            `${rr},${cc}`
          );
        }
      }
    }
  }

  return [...set].map(key => {
    const [
      row,
      col
    ] = key
      .split(",")
      .map(Number);

    return {
      row,
      col
    };
  });
}

function winningMoves(
  board,
  player,
  list
) {
  const result = [];

  for (const move of list) {
    if (
      isWinningMove(
        board,
        move.row,
        move.col,
        player
      )
    ) {
      result.push(move);
    }
  }

  return result;
}

function evaluateBoard(
  board,
  root,
  style
) {
  const enemy =
    other(root);

  let attack = 0;
  let defense = 0;

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const stone =
        board[r][c];

      if (stone === EMPTY) {
        continue;
      }

      let local = 0;

      for (const [dr, dc] of DIRS) {
        const info =
          lineInfo(
            board,
            r,
            c,
            dr,
            dc,
            stone
          );

        local +=
          patternScore(
            info.length,
            info.open
          );
      }

      local +=
        centerScore(r, c) *
        style.center;

      if (stone === root) {
        attack += local;
      } else {
        defense += local;
      }
    }
  }

  return (
    attack * style.attack -
    defense * style.defense
  );
}

function orderedMoves(
  board,
  list,
  player,
  enemy,
  style
) {
  return list
    .map(move => {

      const attack =
        placementScore(
          board,
          move.row,
          move.col,
          player,
          style
        );

      const defense =
        placementScore(
          board,
          move.row,
          move.col,
          enemy,
          style
        );

      return {
        ...move,

        score:
          attack +
          defense *
          style.defense
      };
    })
    .sort(
      (a, b) =>
        b.score -
        a.score
    );
}

function minimax(
  board,
  depth,
  alpha,
  beta,
  maximizing,
  root,
  style,
  radius
) {
  if (depth <= 0) {
    return evaluateBoard(
      board,
      root,
      style
    );
  }

  const list =
    candidates(
      board,
      radius
    );

  if (!list.length) {
    return 0;
  }

  const enemy =
    other(root);

  const player =
    maximizing
      ? root
      : enemy;

  const moves =
    orderedMoves(
      board,
      list,
      player,
      other(player),
      style
    ).slice(0, 16);

  if (maximizing) {
    let best = -INF;

    for (const move of moves) {
      board[move.row][move.col] =
        root;

      let score;

      if (
        isWinningMove(
          board,
          move.row,
          move.col,
          root
        )
      ) {
        score =
          WIN_SCORE +
          depth;
      } else {
        score =
          minimax(
            board,
            depth - 1,
            alpha,
            beta,
            false,
            root,
            style,
            radius
          );
      }

      board[move.row][move.col] =
        EMPTY;

      best =
        Math.max(
          best,
          score
        );

      alpha =
        Math.max(
          alpha,
          score
        );

      if (
        beta <= alpha
      ) {
        break;
      }
    }

    return best;
  }

  let best = INF;

  for (const move of moves) {
    board[move.row][move.col] =
      enemy;

    let score;

    if (
      isWinningMove(
        board,
        move.row,
        move.col,
        enemy
      )
    ) {
      score =
        -WIN_SCORE -
        depth;
    } else {
      score =
        minimax(
          board,
          depth - 1,
          alpha,
          beta,
          true,
          root,
          style,
          radius
        );
    }

    board[move.row][move.col] =
      EMPTY;

    best =
      Math.min(
        best,
        score
      );

    beta =
      Math.min(
        beta,
        score
      );

    if (
      beta <= alpha
    ) {
      break;
    }
  }

  return best;
}

function chooseMove(
  board,
  player,
  config
) {
  const style =
    STYLES[
      config.style
    ] ||
    STYLES.balanced;

  const depth =
    Math.max(
      1,
      Math.min(
        5,
        Number(config.depth) || 3
      )
    );

  const radius =
    Math.max(
      1,
      Math.min(
        3,
        Number(config.radius) || 2
      )
    );

  const enemy =
    other(player);

  let list =
    candidates(
      board,
      radius
    );

  /*
   * 第一優先：
   * 自己直接贏。
   */
  const ownWins =
    winningMoves(
      board,
      player,
      list
    );

  if (ownWins.length) {
    return ownWins[0];
  }

  /*
   * 第二優先：
   * 對手下一手會贏就必須封。
   */
  const enemyWins =
    winningMoves(
      board,
      enemy,
      list
    );

  if (enemyWins.length) {
    /*
     * 多個威脅時，
     * 找最有價值的封鎖點。
     */
    const blocks =
      orderedMoves(
        board,
        enemyWins,
        player,
        enemy,
        style
      );

    return blocks[0];
  }

  /*
   * 第三優先：
   * 找雙重威脅。
   */
  let tacticalBest =
    null;

  let tacticalScore =
    -INF;

  for (const move of list) {
    const score =
      placementScore(
        board,
        move.row,
        move.col,
        player,
        style
      );

    board[move.row][move.col] =
      player;

    const next =
      candidates(
        board,
        radius
      );

    const threats =
      winningMoves(
        board,
        player,
        next
      ).length;

    board[move.row][move.col] =
      EMPTY;

    const total =
      score +
      threats *
      60000000 *
      style.threat;

    if (
      total >
      tacticalScore
    ) {
      tacticalScore =
        total;

      tacticalBest =
        move;
    }
  }

  /*
   * 第四優先：
   * Minimax 搜尋。
   */
  const ordered =
    orderedMoves(
      board,
      list,
      player,
      enemy,
      style
    ).slice(0, 20);

  let best =
    tacticalBest;

  let bestScore =
    tacticalScore;

  for (const move of ordered) {
    board[move.row][move.col] =
      player;

    let score;

    if (
      isWinningMove(
        board,
        move.row,
        move.col,
        player
      )
    ) {
      score =
        WIN_SCORE;
    } else {
      score =
        minimax(
          board,
          depth - 1,
          -INF,
          INF,
          false,
          player,
          style,
          radius
        );
    }

    board[move.row][move.col] =
      EMPTY;

    /*
     * 千萬不要選一個會讓對手
     * 馬上獲勝的點。
     */
    board[move.row][move.col] =
      player;

    const enemyReplies =
      winningMoves(
        board,
        enemy,
        candidates(
          board,
          radius
        )
      ).length;

    board[move.row][move.col] =
      EMPTY;

    if (enemyReplies > 0) {
      score -=
        WIN_SCORE / 2;
    }

    if (
      score >
      bestScore
    ) {
      bestScore =
        score;

      best =
        move;
    }
  }

  return (
    best ||
    {
      row: 7,
      col: 7
    }
  );
}

self.onmessage = event => {

  try {

    const data =
      event.data || {};

    const board =
      data.board;

    const player =
      data.player;

    if (
      !Array.isArray(board) ||
      board.length !== SIZE
    ) {
      throw new Error(
        "Invalid board"
      );
    }

    for (const row of board) {

      if (
        !Array.isArray(row) ||
        row.length !== SIZE
      ) {
        throw new Error(
          "Invalid board row"
        );
      }

      for (const value of row) {

        if (
          value !== EMPTY &&
          value !== BLACK &&
          value !== WHITE
        ) {
          throw new Error(
            "Invalid cell"
          );
        }
      }
    }

    if (
      player !== BLACK &&
      player !== WHITE
    ) {
      throw new Error(
        "Invalid player"
      );
    }

    const safeBoard =
      cloneBoard(board);

    const move =
      chooseMove(
        safeBoard,
        player,
        data.config || {}
      );

    self.postMessage({
      row: move.row,
      col: move.col
    });

  } catch (error) {

    /*
     * Worker 永遠不要因為壞資料直接死亡。
     */
    self.postMessage({
      error: true,
      row: 7,
      col: 7
    });
  }
};
