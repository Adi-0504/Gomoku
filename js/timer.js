"use strict";

import { state } from "./state.js";


/*
 * =========================================================
 * GOMOKU TIMER
 * =========================================================
 *
 * Compatible with the original app.js timer API.
 *
 * Original API:
 *
 * resetTimer()
 * startTimer(startAt)
 * stopTimer()
 * elapsedSeconds()
 * formatDuration(seconds)
 * updateTimerUI(seconds)
 *
 * =========================================================
 */


/*
 * =========================================================
 * RESET
 * =========================================================
 */

export function resetTimer() {

  stopTimer();


  state.gameStartedAt =
    0;

  state.gameEndedAt =
    0;


  updateTimerUI(
    0
  );

}


/*
 * =========================================================
 * START
 * =========================================================
 *
 * IMPORTANT:
 * startAt is intentionally supported.
 *
 * Resume-game passes a calculated timestamp here.
 *
 * =========================================================
 */

export function startTimer(
  startAt
) {

  stopTimer();


  state.gameStartedAt =
    startAt ||
    Date.now();


  state.gameEndedAt =
    0;


  updateTimerUI();


  state.timerInterval =
    window.setInterval(
      () => {

        updateTimerUI();

      },
      500
    );

}


/*
 * =========================================================
 * STOP
 * =========================================================
 */

export function stopTimer() {

  if (
    state.timerInterval
  ) {

    window.clearInterval(
      state.timerInterval
    );

  }


  state.timerInterval =
    null;


  if (
    state.gameStartedAt &&
    !state.gameEndedAt
  ) {

    state.gameEndedAt =
      Date.now();

  }

}


/*
 * =========================================================
 * ELAPSED
 * =========================================================
 */

export function elapsedSeconds() {

  if (
    !state.gameStartedAt
  ) {

    return 0;

  }


  const end =
    state.gameEndedAt ||
    Date.now();


  return Math.max(
    0,
    Math.floor(
      (
        end -
        state.gameStartedAt
      ) /
      1000
    )
  );

}


/*
 * =========================================================
 * FORMAT
 * =========================================================
 */

export function formatDuration(
  seconds
) {

  const safeSeconds =
    Math.max(
      0,
      Math.floor(
        Number(
          seconds
        ) ||
        0
      )
    );


  const minutes =
    Math.floor(
      safeSeconds /
      60
    );


  const remainingSeconds =
    safeSeconds %
    60;


  return (
    String(
      minutes
    ).padStart(
      2,
      "0"
    ) +
    ":" +
    String(
      remainingSeconds
    ).padStart(
      2,
      "0"
    )
  );

}


/*
 * =========================================================
 * UI
 * =========================================================
 */

export function updateTimerUI(
  seconds
) {

  const element =
    document.querySelector(
      "#gomokuTimer"
    );


  if (
    !element
  ) {

    return;

  }


  const value =
    typeof seconds ===
    "number"

      ? seconds

      : elapsedSeconds();


  element.textContent =
    formatDuration(
      value
    );

}
