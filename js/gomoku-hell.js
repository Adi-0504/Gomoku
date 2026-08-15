"use strict";

/*
 * =========================================================
 * GOMOKU HELL MODE
 * External DOM Module
 * =========================================================
 *
 * IMPORTANT
 * ---------------------------------------------------------
 * This module intentionally does NOT modify app.js.
 *
 * Responsibilities:
 * - Hell Mode UI
 * - AI thinking lock
 * - Input protection
 * - Accidental move protection
 * - Two-step move confirmation
 * - Canvas / DOM observation
 * - Safe external state
 *
 * Communication with the original game happens through DOM
 * and browser events only.
 * =========================================================
 */

const CONFIG = {

  boardSelector:
    "#boardCanvas",

  gameScreenSelector:
    "#gameScreen",

  thinkingSelector:
    "#thinkingIndicator",

  difficultySelector:
    "#difficultyGroup",

  hellButtonId:
    "hellModeButton",

  hellBadgeId:
    "hellModeBadge",

  guardId:
    "gomokuInputGuard",

  previewId:
    "gomokuMovePreview",

  previewClass:
    "gomoku-move-preview",

  confirmationEnabled:
    true,

  /*
   * Number of milliseconds after a confirmed move during
   * which accidental additional pointer input is ignored.
   */
  postMoveLock:
    180,

  /*
   * How long a preview remains active before automatically
   * disappearing.
   *
   * 0 = never automatically disappear.
   */
  previewTimeout:
    0

};


const state = {

  initialized:
    false,

  hellEnabled:
    false,

  inputLocked:
    false,

  thinking:
    false,

  gameActive:
    false,

  confirmingMove:
    false,

  previewRow:
    null,

  previewCol:
    null,

  previewElement:
    null,

  previewTimer:
    null,

  postMoveLockUntil:
    0,

  board:
    null,

  guard:
    null,

  observers:
    [],

  originalCanvasPointerEvents:
    null,

  canvasPointerHandler:
    null

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

  if (element.hidden) {
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


function clamp(value, min, max) {

  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );

}


function now() {

  return performance.now();

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

  button.setAttribute(
    "aria-pressed",
    "false"
  );

  button.innerHTML = `
    <strong>地獄</strong>
    <span>真正的極限對手</span>
  `;

  button.addEventListener(
    "click",
    event => {

      event.preventDefault();
      event.stopPropagation();

      setHellMode(
        !state.hellEnabled
      );

    }
  );

  grid.appendChild(
    button
  );

  createHellBadge();

  updateHellButton();

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

  badge.hidden =
    true;

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

  clearPreview();

  updateHellButton();
  updateHellBadge();

  if (
    state.hellEnabled
  ) {

    updateThinkingState();

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

  if (state.guard) {
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
          capture:
            true,

          passive:
            false
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

  if (!state.guard) {
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

    clearPreview();
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

          clearPreview();
          unlockInput();

        } else {

          updateThinkingState();

        }

      }
    );

  observer.observe(
    screen,
    {
      attributes:
        true,

      attributeFilter:
        [
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
 * GLOBAL THINKING GUARD
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
      capture:
        true,

      passive:
        false
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
      capture:
        true,

      passive:
        false
    }
  );

}


/*
 * =========================================================
 * BOARD GEOMETRY
 * =========================================================
 *
 * The original canvas is 15 × 15.
 *
 * We do not need to know the internal app.js board state.
 * We only need the visual board geometry.
 * =========================================================
 */

function getBoardGeometry() {

  const board =
    getBoard();

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
   * Gomoku uses a 15 × 15 intersection grid.
   */

  const cells =
    15;

  const stepX =
    rect.width /
    (cells - 1);

  const stepY =
    rect.height /
    (cells - 1);

  return {
    rect,
    cells,
    stepX,
    stepY
  };

}


/*
 * =========================================================
 * POINTER → BOARD CELL
 * =========================================================
 */

function pointerToCell(
  event
) {

  const geometry =
    getBoardGeometry();

  if (!geometry) {
    return null;
  }

  const {
    rect,
    cells,
    stepX,
    stepY
  } = geometry;

  const x =
    event.clientX -
    rect.left;

  const y =
    event.clientY -
    rect.top;

  const col =
    Math.round(
      x / stepX
    );

  const row =
    Math.round(
      y / stepY
    );

  if (
    row < 0 ||
    row >= cells ||
    col < 0 ||
    col >= cells
  ) {
    return null;
  }

  const centerX =
    col * stepX;

  const centerY =
    row * stepY;

  /*
   * Do not accept touches too far from an
   * actual intersection.
   */

  const distance =
    Math.hypot(
      x - centerX,
      y - centerY
    );

  const tolerance =
    Math.min(
      stepX,
      stepY
    ) * 0.42;

  if (
    distance >
    tolerance
  ) {
    return null;
  }

  return {
    row,
    col
  };

}


/*
 * =========================================================
 * PREVIEW ELEMENT
 * =========================================================
 */

function ensurePreviewElement() {

  if (
    state.previewElement
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

  const preview =
    document.createElement(
      "div"
    );

  preview.id =
    CONFIG.previewId;

  preview.className =
    CONFIG.previewClass;

  preview.setAttribute(
    "aria-hidden",
    "true"
  );

  preview.style.position =
    "absolute";

  preview.style.display =
    "none";

  preview.style.pointerEvents =
    "none";

  preview.style.zIndex =
    "15";

  preview.style.borderRadius =
    "50%";

  preview.style.boxSizing =
    "border-box";

  preview.style.opacity =
    "0.38";

  preview.style.transform =
    "translate(-50%, -50%)";

  preview.style.transition =
    "opacity 90ms ease, transform 90ms ease";

  /*
   * The preview deliberately does not use an
   * application-specific color.
   */

  preview.style.background =
    "rgba(70,70,70,0.22)";

  preview.style.border =
    "2px solid rgba(70,70,70,0.45)";

  parent.appendChild(
    preview
  );

  state.previewElement =
    preview;

}


function positionPreview(
  row,
  col
) {

  const board =
    getBoard();

  if (!board) {
    return;
  }

  const geometry =
    getBoardGeometry();

  if (!geometry) {
    return;
  }

  ensurePreviewElement();

  if (
    !state.previewElement
  ) {
    return;
  }

  const boardRect =
    board.getBoundingClientRect();

  const parentRect =
    board.parentElement.getBoundingClientRect();

  const x =
    boardRect.left -
    parentRect.left +
    col *
    geometry.stepX;

  const y =
    boardRect.top -
    parentRect.top +
    row *
    geometry.stepY;

  const size =
    Math.min(
      geometry.stepX,
      geometry.stepY
    ) *
    0.62;

  state.previewElement.style.width =
    `${size}px`;

  state.previewElement.style.height =
    `${size}px`;

  state.previewElement.style.left =
    `${x}px`;

  state.previewElement.style.top =
    `${y}px`;

  state.previewElement.style.display =
    "block";

  requestAnimationFrame(
    () => {

      if (
        state.previewElement
      ) {

        state.previewElement.style.opacity =
          "0.38";

      }

    }
  );

}


/*
 * =========================================================
 * PREVIEW STATE
 * =========================================================
 */

function showPreview(
  row,
  col
) {

  ensurePreviewElement();

  if (
    !state.previewElement
  ) {
    return;
  }

  state.previewRow =
    row;

  state.previewCol =
    col;

  state.confirmingMove =
    true;

  positionPreview(
    row,
    col
  );

  if (
    state.previewTimer
  ) {

    clearTimeout(
      state.previewTimer
    );

  }

  if (
    CONFIG.previewTimeout >
    0
  ) {

    state.previewTimer =
      window.setTimeout(
        () => {
          clearPreview();
        },
        CONFIG.previewTimeout
      );

  }

}


function clearPreview() {

  state.confirmingMove =
    false;

  state.previewRow =
    null;

  state.previewCol =
    null;

  if (
    state.previewTimer
  ) {

    clearTimeout(
      state.previewTimer
    );

    state.previewTimer =
      null;

  }

  if (
    state.previewElement
  ) {

    state.previewElement.style.display =
      "none";

  }

}


/*
 * =========================================================
 * MOVE CONFIRMATION
 * =========================================================
 *
 * IMPORTANT:
 *
 * This module cannot safely call the original canvas handler
 * directly because app.js owns its internal board state.
 *
 * Therefore:
 *
 * First tap:
 *   show preview
 *
 * Second tap on the SAME intersection:
 *   allow the original canvas handler to receive the event.
 *
 * A different intersection simply moves the preview.
 *
 * This prevents most accidental single-tap moves without
 * touching app.js.
 * =========================================================
 */

function handleBoardPointerDown(
  event
) {

  if (
    !state.gameActive
  ) {
    return;
  }

  if (
    state.inputLocked
  ) {
    return;
  }

  if (
    state.thinking
  ) {
    return;
  }

  if (
    now() <
    state.postMoveLockUntil
  ) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    return;
  }

  if (
    event.pointerType ===
    "mouse" &&
    event.button !== 0
  ) {
    return;
  }

  const board =
    getBoard();

  if (!board) {
    return;
  }

  const cell =
    pointerToCell(
      event
    );

  if (!cell) {
    return;
  }

  /*
   * Hell mode:
   * two-step confirmation.
   */

  if (
    state.hellEnabled &&
    CONFIG.confirmationEnabled
  ) {

    const sameCell =
      state.previewRow ===
        cell.row &&
      state.previewCol ===
        cell.col;

    if (!sameCell) {

      /*
       * First touch, or changed target.
       *
       * Block the original game event.
       */

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      showPreview(
        cell.row,
        cell.col
      );

      return;
    }

    /*
     * Same cell:
     * confirmed.
     *
     * Hide preview and allow the original
     * canvas listener to handle the move.
     */

    clearPreview();

    state.postMoveLockUntil =
      now() +
      CONFIG.postMoveLock;

    return;
  }

}


/*
 * =========================================================
 * BOARD LISTENER
 * =========================================================
 */

function installBoardListener() {

  const board =
    getBoard();

  if (!board) {
    return;
  }

  if (
    state.canvasPointerHandler
  ) {
    return;
  }

  state.canvasPointerHandler =
    handleBoardPointerDown;

  /*
   * Capture phase is intentionally used.
   *
   * The first tap can therefore be stopped before
   * app.js receives it.
   */

  board.addEventListener(
    "pointerdown",
    state.canvasPointerHandler,
    {
      capture:
        true,

      passive:
        false
    }
  );

}


/*
 * =========================================================
 * RESIZE / SCROLL
 * =========================================================
 */

function refreshPreviewPosition() {

  if (
    state.previewRow ===
      null ||
    state.previewCol ===
      null
  ) {
    return;
  }

  if (
    !state.previewElement ||
    state.previewElement.style.display ===
      "none"
  ) {
    return;
  }

  positionPreview(
    state.previewRow,
    state.previewCol
  );

}


function installViewportListeners() {

  window.addEventListener(
    "resize",
    refreshPreviewPosition,
    {
      passive:
        true
    }
  );

  window.addEventListener(
    "scroll",
    refreshPreviewPosition,
    {
      passive:
        true
    }
  );

}


/*
 * =========================================================
 * MUTATION OBSERVER
 * =========================================================
 */

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
      attributes:
        true,

      attributeFilter:
        [
          "hidden",
          "class",
          "style"
        ],

      childList:
        true,

      subtree:
        true
    }
  );

  state.observers.push(
    observer
  );

  updateThinkingState();

}


/*
 * =========================================================
 * BODY OBSERVER
 * =========================================================
 */

function observeBody() {

  const observer =
    new MutationObserver(
      () => {

        createHellButton();
        createHellBadge();

        if (
          !state.guard
        ) {
          createInputGuard();
        }

        if (
          !state.previewElement
        ) {
          ensurePreviewElement();
        }

        installBoardListener();

        updateThinkingState();

        refreshPreviewPosition();

      }
    );

  observer.observe(
    document.body,
    {
      childList:
        true,

      subtree:
        true
    }
  );

  state.observers.push(
    observer
  );

}


/*
 * =========================================================
 * WAIT FOR APP DOM
 * ========================================================= */

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
 * ========================================================= */

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


  isConfirming() {

    return state.confirmingMove;

  },


  getPreview() {

    if (
      state.previewRow ===
        null ||
      state.previewCol ===
        null
    ) {

      return null;

    }

    return {
      row:
        state.previewRow,

      col:
        state.previewCol
    };

  },


  lock() {

    lockInput();

  },


  unlock() {

    unlockInput();

  },


  clearPreview() {

    clearPreview();

  }

};


/*
 * =========================================================
 * INIT
 * =========================================================
 */

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
  ensurePreviewElement();

  observeThinking();
  observeGameScreen();
  observeBody();

  installGlobalGuard();
  installBoardListener();
  installViewportListeners();

  state.gameActive =
    isGameScreenActive();

}


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
    waitForDOM,
    {
      once:
        true
    }
  );

} else {

  waitForDOM();

}
