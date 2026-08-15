(() => {
  "use strict";

  const Timer = {

    init(state, dom) {

      this.state = state;
      this.dom = dom;

      return this;
    },


    resetTimer() {

      this.stopTimer();

      this.state.gameStartedAt = 0;
      this.state.gameEndedAt = 0;

      this.updateTimerUI(0);
    },


    startTimer(startAt) {

      this.stopTimer();

      this.state.gameStartedAt =
        startAt || Date.now();

      this.state.gameEndedAt = 0;

      this.updateTimerUI();

      this.state.timerInterval =
        window.setInterval(
          () => {
            this.updateTimerUI();
          },
          500
        );
    },


    stopTimer() {

      if (this.state.timerInterval) {

        window.clearInterval(
          this.state.timerInterval
        );

      }

      this.state.timerInterval = null;


      if (
        this.state.gameStartedAt &&
        !this.state.gameEndedAt
      ) {

        this.state.gameEndedAt =
          Date.now();

      }
    },


    elapsedSeconds() {

      if (
        !this.state.gameStartedAt
      ) {

        return 0;
      }


      const end =
        this.state.gameEndedAt ||
        Date.now();


      return Math.max(
        0,
        Math.floor(
          (
            end -
            this.state.gameStartedAt
          ) / 1000
        )
      );
    },


    formatDuration(seconds) {

      const safeSeconds =
        Math.max(
          0,
          Math.floor(
            Number(seconds) || 0
          )
        );


      const minutes =
        Math.floor(
          safeSeconds / 60
        );


      const remainingSeconds =
        safeSeconds % 60;


      return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(
          remainingSeconds
        ).padStart(2, "0")
      );
    },


    updateTimerUI(seconds) {

      const element =
        this.dom?.timer ||
        document.querySelector(
          "#gomokuTimer"
        );


      if (!element) {
        return;
      }


      const value =
        typeof seconds === "number"
          ? seconds
          : this.elapsedSeconds();


      element.textContent =
        this.formatDuration(
          value
        );
    }

  };


  window.GomokuTimer =
    Timer;

})();
