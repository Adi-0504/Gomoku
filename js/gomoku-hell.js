"use strict";

/*
 * =========================================================
 * GOMOKU HELL MODE
 * External DOM Module
 * =========================================================
 *
 * This module intentionally does NOT modify app.js.
 *
 * Responsibilities:
 * - Hell Mode UI
 * - Input Guard
 * - AI thinking lock
 * - Canvas protection
 * - DOM observation
 * - Safe state management
 *
 * It communicates with the existing app only through DOM.
 * =========================================================
 */

const CONFIG = {
  boardSelector: "#boardCanvas",
  gameScreenSelector: "#gameScreen",
  thinkingSelector: "#thinkingIndicator",
  difficultySelector: "#difficultyGroup",

  hellButtonId: "hellModeButton",
  hellBadgeId: "hellModeBadge",
  guardId: "gomokuInputGuard",

  /*
   * Small delay prevents a pointer event from reaching
   * the original canvas handler immediately after the
   * game becomes locked.
   */
  lockDelay: 0
};

const state = {
  initialized: false,
  hellEnabled: false,
  inputLocked: false,
  thinking: false,
  gameActive: false,

  board: null,
  guard: null,

  observers: [],

  originalCanvasPointerEvents: null
};


/*
 * =========================================================
 * DOM
 * =========================================================
 */

function getBoard() {
  return document.querySelector(
    CONFIG.boardSelector
  );
}

function getGameScreen() {
  return document.querySelector(
    CONFIG.gameScreenSelector
  );
}

function getThinkingIndicator() {
  return document.querySelector(
    CONFIG.thinkingSelector
  );
}

function getDifficultyGroup() {
  return document.querySelector(
    CONFIG.difficultySelector
  );
}


/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function isVisible(element) {
  if (!element) {
    return false;
  }

  if (
    element.hidden
  ) {
    return false;
  }

  const style =
    window.getComputedStyle(
      element
    );

  return (
    style.display !== "none" &&
    style.visibility !== "hidden"
  );
}

function isGameScreenActive() {
  const screen =
    getGameScreen();

  if (!screen) {
    return false;
  }

  return screen.classList.contains(
    "active"
  );
}


/*
 * =========================================================
 * HELL UI
 * =========================================================
 */

function createHellButton() {
  if (
    document.getElementById(
      CONFIG.hellButtonId
    )
  ) {
    return;
  }

  const group =
    getDifficultyGroup();

  if (!group) {
    return;
  }

  const grid =
    group.querySelector(
      ".difficulty-grid"
    );

  if (!grid) {
    return;
  }

  const button =
    document.createElement(
      "button"
    );

  button.id =
    CONFIG.hellButtonId;

  button.type =
    "button";

  button.className =
    "difficulty-card";

  button.dataset.difficulty =
    "hell";

  button.innerHTML = `
    <strong>地獄</strong>
    <span>真正的極限對手</span>
  `;

  button.addEventListener(
    "click",
    () => {
      setHellMode(
        !state.hellEnabled
      );
    }
  );

  grid.appendChild(
    button
  );

  createHellBadge();
}

function createHellBadge() {
  if (
    document.getElementById(
      CONFIG.hellBadgeId
    )
  ) {
    return;
  }

  const gameScreen =
    getGameScreen();

  if (!gameScreen) {
    return;
  }

  const status =
    gameScreen.querySelector(
      ".game-status"
    );

  if (!status) {
    return;
  }

  const badge =
    document.createElement(
      "div"
    );

  badge.id =
    CONFIG.hellBadgeId;

  badge.textContent =
    "HELL";

  badge.hidden = true;

  badge.setAttribute(
    "aria-hidden",
    "true"
  );

  status.appendChild(
    badge
  );
}

function updateHellButton() {
  const button =
    document.getElementById(
      CONFIG.hellButtonId
    );

  if (!button) {
    return;
  }

  button.classList.toggle(
    "selected",
    state.hellEnabled
  );

  button.setAttribute(
    "aria-pressed",
    String(
      state.hellEnabled
    )
  );
}

function updateHellBadge() {
  const badge =
    document.getElementById(
      CONFIG.hellBadgeId
    );

  if (!badge) {
    return;
  }

  badge.hidden =
    !state.hellEnabled;
}


/*
 * =========================================================
 * HELL MODE STATE
 * =========================================================
 */

function setHellMode(enabled) {
  state.hellEnabled =
    Boolean(enabled);

  updateHellButton();
  updateHellBadge();

  if (
    state.hellEnabled
  ) {
    lockIfThinking();
  } else {
    unlockInput();
  }

  window.dispatchEvent(
    new CustomEvent(
      "gomoku:hell-change",
      {
        detail: {
          enabled:
            state.hellEnabled
        }
      }
    )
  );
}


/*
 * =========================================================
 * INPUT GUARD
 * =========================================================
 */

function createInputGuard() {
  if (
    state.guard
  ) {
    return;
  }

  const board =
    getBoard();

  if (!board) {
    return;
  }

  const parent =
    board.parentElement;

  if (!parent) {
    return;
  }

  if (
    getComputedStyle(
      parent
    ).position ===
    "static"
  ) {
    parent.style.position =
      "relative";
  }

  const guard =
    document.createElement(
      "div"
    );

  guard.id =
    CONFIG.guardId;

  guard.setAttribute(
    "aria-hidden",
    "true"
  );

  guard.style.position =
    "absolute";

  guard.style.inset =
    "0";

  guard.style.display =
    "none";

  guard.style.zIndex =
    "20";

  guard.style.background =
    "transparent";

  guard.style.touchAction =
    "none";

  guard.style.userSelect =
    "none";

  /*
   * Prevent accidental interaction.
   */

  const stopEvent =
    event => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

  [
    "pointerdown",
    "pointerup",
    "pointermove",
    "pointercancel",
    "click",
    "dblclick",
    "touchstart",
    "touchmove",
    "touchend"
  ].forEach(
    type => {
      guard.addEventListener(
        type,
        stopEvent,
        {
          capture: true,
          passive: false
        }
      );
    }
  );

  parent.appendChild(
    guard
  );

  state.guard =
    guard;
}

function lockInput() {
  if (
    state.inputLocked
  ) {
    return;
  }

  createInputGuard();

  if (
    !state.guard
  ) {
    return;
  }

  state.inputLocked =
    true;

  state.guard.style.display =
    "block";

  const board =
    getBoard();

  if (board) {
    state.originalCanvasPointerEvents =
      board.style.pointerEvents;

    board.style.pointerEvents =
      "none";
  }
}

function unlockInput() {
  if (
    !state.inputLocked
  ) {
    return;
  }

  state.inputLocked =
    false;

  if (state.guard) {
    state.guard.style.display =
      "none";
  }

  const board =
    getBoard();

  if (board) {
    board.style.pointerEvents =
      state.originalCanvasPointerEvents ||
      "";
  }
}


/*
 * =========================================================
 * THINKING DETECTION
 * =========================================================
 */

function updateThinkingState() {
  const indicator =
    getThinkingIndicator();

  if (!indicator) {
    return;
  }

  const thinking =
    isVisible(
      indicator
    );

  if (
    thinking ===
    state.thinking
  ) {
    return;
  }

  state.thinking =
    thinking;

  if (
    state.thinking
  ) {
    lockInput();
  } else {
    unlockInput();
  }

  window.dispatchEvent(
    new CustomEvent(
      "gomoku:thinking-change",
      {
        detail: {
          thinking:
            state.thinking
        }
      }
    )
  );
}

function observeThinking() {
  const indicator =
    getThinkingIndicator();

  if (!indicator) {
    return;
  }

  const observer =
    new MutationObserver(
      () => {
        updateThinkingState();
      }
    );

  observer.observe(
    indicator,
    {
      attributes: true,
      attributeFilter: [
        "hidden",
        "class",
        "style"
      ],
      childList: true,
      subtree: true
    }
  );

  state.observers.push(
    observer
  );

  updateThinkingState();
}


/*
 * =========================================================
 * SCREEN DETECTION
 * =========================================================
 */

function observeGameScreen() {
  const screen =
    getGameScreen();

  if (!screen) {
    return;
  }

  const observer =
    new MutationObserver(
      () => {
        state.gameActive =
          isGameScreenActive();

        if (
          !state.gameActive
        ) {
          unlockInput();
        } else {
          updateThinkingState();
        }
      }
    );

  observer.observe(
    screen,
    {
      attributes: true,
      attributeFilter: [
        "class"
      ]
    }
  );

  state.observers.push(
    observer
  );

  state.gameActive =
    isGameScreenActive();
}


/*
 * =========================================================
 * FALLBACK POINTER GUARD
 * =========================================================
 *
 * This is intentionally conservative.
 *
 * It only blocks input while the AI thinking
 * indicator is visible.
 *
 * Normal gameplay is untouched.
 * =========================================================
 */

function installGlobalGuard() {
  document.addEventListener(
    "pointerdown",
    event => {
      if (
        !state.inputLocked
      ) {
        return;
      }

      const board =
        getBoard();

      if (
        !board ||
        !board.contains(
          event.target
        )
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    },
    {
      capture: true,
      passive: false
    }
  );

  document.addEventListener(
    "click",
    event => {
      if (
        !state.inputLocked
      ) {
        return;
      }

      const board =
        getBoard();

      if (
        !board ||
        !board.contains(
          event.target
        )
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    },
    {
      capture: true,
      passive: false
    }
  );
}


/*
 * =========================================================
 * DOM RETRY
 * =========================================================
 *
 * app.js is a module and may initialize asynchronously.
 * We therefore wait for its DOM to exist.
 * =========================================================
 */

function waitForDOM() {
  const board =
    getBoard();

  const group =
    getDifficultyGroup();

  if (
    !board ||
    !group
  ) {
    window.requestAnimationFrame(
      waitForDOM
    );

    return;
  }

  initialize();
}


/*
 * =========================================================
 * PUBLIC API
 * =========================================================
 */

window.GomokuHell = {

  enable() {
    setHellMode(
      true
    );
  },

  disable() {
    setHellMode(
      false
    );
  },

  toggle() {
    setHellMode(
      !state.hellEnabled
    );
  },

  isEnabled() {
    return state.hellEnabled;
  },

  isLocked() {
    return state.inputLocked;
  },

  isThinking() {
    return state.thinking;
  },

  lock() {
    lockInput();
  },

  unlock() {
    unlockInput();
  }

};


/*
 * =========================================================
 * INIT
 * ========================================================= */

function initialize() {
  if (
    state.initialized
  ) {
    return;
  }

  state.initialized =
    true;

  createHellButton();
  createHellBadge();
  createInputGuard();

  observeThinking();
  observeGameScreen();

  installGlobalGuard();

  /*
   * Keep trying to create UI because app.js may
   * re-render parts of the setup screen.
   */

  const bodyObserver =
    new MutationObserver(
      () => {
        createHellButton();
        createHellBadge();

        if (
          !state.guard
        ) {
          createInputGuard();
        }

        updateThinkingState();
      }
    );

  bodyObserver.observe(
    document.body,
    {
      childList: true,
      subtree: true
    }
  );

  state.observers.push(
    bodyObserver
  );
}

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    waitForDOM,
    {
      once: true
    }
  );
} else {
  waitForDOM();
}
