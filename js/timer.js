(() => {
  "use strict";

  const timer = {

    resetTimer() {

      if (timer.interval) {
        clearInterval(timer.interval);
      }

      timer.interval = null;

      window.gomokuTimerState.gameStartedAt = 0;
      window.gomokuTimerState.gameEndedAt = 0;

      timer.updateTimerUI(0);
    },


    startTimer(startAt) {

      timer.stopTimer();

      window.gomokuTimerState.gameStartedAt =
        startAt || Date.now();

      window.gomokuTimerState.gameEndedAt = 0;

      timer.updateTimerUI();

      timer.interval = setInterval(() => {
        timer.updateTimerUI();
      }, 500);
    },


    stopTimer() {

      if (timer.interval) {
        clearInterval(timer.interval);
      }

      timer.interval = null;

      if (
        window.gomokuTimerState.gameStartedAt &&
        !window.gomokuTimerState.gameEndedAt
      ) {
        window.gomokuTimerState.gameEndedAt =
          Date.now();
      }
    },


    elapsedSeconds() {

      const started =
        window.gomokuTimerState.gameStartedAt;

      if (!started) {
        return 0;
      }

      const ended =
        window.gomokuTimerState.gameEndedAt ||
        Date.now();

      return Math.max(
        0,
        Math.floor(
          (ended - started) / 1000
        )
      );
    },


    formatDuration(seconds) {

      const safe =
        Math.max(
          0,
          Math.floor(
            Number(seconds) || 0
          )
        );

      const minutes =
        Math.floor(
          safe / 60
        );

      const remaining =
        safe % 60;

      return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remaining).padStart(2, "0")
      );
    },


    updateTimerUI(seconds) {

      const element =
        document.querySelector(
          "#gomokuTimer"
        );

      if (!element) {
        return;
      }

      const value =
        typeof seconds === "number"
          ? seconds
          : timer.elapsedSeconds();

      element.textContent =
        timer.formatDuration(value);
    },

    interval: null
  };


  window.gomokuTimerState = {
    gameStartedAt: 0,
    gameEndedAt: 0
  };


  window.GomokuTimer = timer;

})();
