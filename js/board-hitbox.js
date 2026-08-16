(() => {

  "use strict";

  /*

   * =========================================================

   * GOMOKU BOARD HITBOX

   * =========================================================

   *

   * Purpose:

   * - Make touch input more forgiving

   * - Keep precise Apple Pencil / mouse input

   * - Expand the usable area around intersections

   * - Prevent accidental missed taps near the board edge

   *

   * IMPORTANT:

   * - Does NOT modify app.js

   * - Does NOT modify game state

   * - Does NOT modify AI

   * - Only adjusts pointer coordinates before app.js receives them

   * =========================================================

   */

  const CONFIG = {

    SIZE: 15,

    /*

     * The original app uses:

     *

     * boardPadding = size * 0.075

     * cellSize =

     *   (size - boardPadding * 2) / 14

     *

     * We reproduce that calculation here.

     */

    BOARD_PADDING_RATIO: 0.075,

    /*

     * Touch gets a more forgiving hit area.

     *

     * 0.62 means the touch can be noticeably away

     * from the exact intersection and still snap to it.

     *

     * The nearest intersection is always selected.

     */

    TOUCH_HIT_RADIUS: 0.62,

    /*

     * Pen and mouse remain more precise.

     */

    PEN_HIT_RADIUS: 0.50,

    MOUSE_HIT_RADIUS: 0.50,

    /*

     * Tiny movement after touch-down should not cause

     * another synthetic interaction.

     */

    SYNTHETIC_FLAG:

      "__gomokuHitboxAdjusted"

  };

  /*

   * =========================================================

   * HELPERS

   * =========================================================

   */

  function isBoardCanvas(target) {

    return (

      target instanceof HTMLCanvasElement &&

      target.id === "boardCanvas"

    );

  }

  function getBoardGeometry(canvas) {

    const rect =

      canvas.getBoundingClientRect();

    if (

      !rect.width ||

      !rect.height

    ) {

      return null;

    }

    /*

     * app.js uses a square canvas.

     * Use the actual rendered width so this continues

     * to work on iPad / iPhone / desktop.

     */

    const size =

      rect.width;

    const padding =

      size *

      CONFIG.BOARD_PADDING_RATIO;

    const cellSize =

      (

        size -

        padding * 2

      ) /

      (

        CONFIG.SIZE -

        1

      );

    return {

      rect,

      size,

      padding,

      cellSize

    };

  }

  function clamp(

    value,

    min,

    max

  ) {

    return Math.max(

      min,

      Math.min(

        max,

        value

      )

    );

  }

  /*

   * =========================================================

   * FIND NEAREST INTERSECTION

   * =========================================================

   */

  function getNearestIntersection(

    canvas,

    clientX,

    clientY,

    pointerType

  ) {

    const geometry =

      getBoardGeometry(

        canvas

      );

    if (!geometry) {

      return null;

    }

    const {

      rect,

      padding,

      cellSize

    } = geometry;

    const x =

      clientX -

      rect.left;

    const y =

      clientY -

      rect.top;

    /*

     * Convert physical touch position

     * into the nearest board coordinate.

     */

    const rawCol =

      (

        x -

        padding

      ) /

      cellSize;

    const rawRow =

      (

        y -

        padding

      ) /

      cellSize;

    const col =

      clamp(

        Math.round(

          rawCol

        ),

        0,

        CONFIG.SIZE - 1

      );

    const row =

      clamp(

        Math.round(

          rawRow

        ),

        0,

        CONFIG.SIZE - 1

      );

    const intersectionX =

      padding +

      col *

      cellSize;

    const intersectionY =

      padding +

      row *

      cellSize;

    const distance =

      Math.hypot(

        intersectionX - x,

        intersectionY - y

      );

    let hitRadius =

      CONFIG.MOUSE_HIT_RADIUS;

    if (

      pointerType ===

      "touch"

    ) {

      hitRadius =

        CONFIG.TOUCH_HIT_RADIUS;

    } else if (

      pointerType ===

      "pen"

    ) {

      hitRadius =

        CONFIG.PEN_HIT_RADIUS;

    }

    /*

     * Allow slightly more room around the

     * actual playable board edge for touch.

     */

    const boardMin =

      padding;

    const boardMax =

      padding +

      cellSize *

      (CONFIG.SIZE - 1);

    const outsideBoard =

      x <

        boardMin -

          cellSize *

          0.18 ||

      x >

        boardMax +

          cellSize *

          0.18 ||

      y <

        boardMin -

          cellSize *

          0.18 ||

      y >

        boardMax +

          cellSize *

          0.18;

    if (

      outsideBoard

    ) {

      return null;

    }

    /*

     * The important part:

     *

     * Touch users get a larger acceptance radius.

     *

     * This means Grandpa does NOT have to hit

     * the tiny exact intersection.

     */

    if (

      distance >

      cellSize *

      hitRadius

    ) {

      return null;

    }

    return {

      x:

        rect.left +

        intersectionX,

      y:

        rect.top +

        intersectionY,

      row,

      col

    };

  }

  /*

   * =========================================================

   * CREATE CORRECTED POINTER EVENT

   * =========================================================

   */

  function createCorrectedEvent(

    original,

    point

  ) {

    const options = {

      bubbles:

        true,

      cancelable:

        true,

      composed:

        true,

      clientX:

        point.x,

      clientY:

        point.y,

      screenX:

        original.screenX,

      screenY:

        original.screenY,

      button:

        original.button,

      buttons:

        original.buttons,

      ctrlKey:

        original.ctrlKey,

      shiftKey:

        original.shiftKey,

      altKey:

        original.altKey,

      metaKey:

        original.metaKey,

      pointerId:

        original.pointerId,

      pointerType:

        original.pointerType,

      isPrimary:

        original.isPrimary,

      width:

        original.width,

      height:

        original.height,

      pressure:

        original.pressure,

      tangentialPressure:

        original.tangentialPressure,

      tiltX:

        original.tiltX,

      tiltY:

        original.tiltY,

      twist:

        original.twist

    };

    const event =

      new PointerEvent(

        "pointerdown",

        options

      );

    /*

     * Mark this event so our capture listener

     * does not process it again.

     */

    try {

      Object.defineProperty(

        event,

        CONFIG.SYNTHETIC_FLAG,

        {

          value: true,

          configurable: false,

          enumerable: false

        }

      );

    } catch {

      /*

       * Extremely old browsers may reject

       * defineProperty on Event objects.

       *

       * In that case use a WeakSet below.

       */

    }

    return event;

  }

  /*

   * =========================================================

   * FALLBACK FLAG

   * =========================================================

   */

  const syntheticEvents =

    new WeakSet();

  /*

   * =========================================================

   * MAIN INTERCEPTOR

   * =========================================================

   */

  function install() {

    const canvas =

      document.querySelector(

        "#boardCanvas"

      );

    if (!canvas) {

      return;

    }

    if (

      canvas.dataset

        .gomokuHitboxInstalled ===

      "1"

    ) {

      return;

    }

    canvas.dataset

      .gomokuHitboxInstalled =

      "1";

    /*

     * CAPTURE PHASE

     *

     * app.js listens during the normal bubble phase.

     *

     * Therefore this listener can correct the event

     * BEFORE app.js receives it.

     */

    canvas.addEventListener(

      "pointerdown",

      event => {

        /*

         * Let our own corrected event through.

         */

        if (

          event[

            CONFIG.SYNTHETIC_FLAG

          ] ||

          syntheticEvents.has(

            event

          )

        ) {

          return;

        }

        /*

         * Only correct actual user interaction.

         */

        if (

          event.isTrusted === false

        ) {

          return;

        }

        const pointerType =

          event.pointerType ||

          "mouse";

        /*

         * Mouse and pen stay close to original

         * behaviour.

         *

         * Touch gets the expanded hitbox.

         */

        const point =

          getNearestIntersection(

            canvas,

            event.clientX,

            event.clientY,

            pointerType

          );

        if (!point) {

          /*

           * Let app.js handle it normally.

           * It will reject the move if appropriate.

           */

          return;

        }

        /*

         * Check whether the pointer is already

         * basically on the intersection.

         *

         * If yes, there is no reason to create

         * another event.

         */

        const dx =

          point.x -

          event.clientX;

        const dy =

          point.y -

          event.clientY;

        const distance =

          Math.hypot(

            dx,

            dy

          );

        const geometry =

          getBoardGeometry(

            canvas

          );

        if (

          !geometry

        ) {

          return;

        }

        /*

         * Very small correction:

         * let the original event through.

         *

         * This avoids unnecessary synthetic

         * events for already accurate taps.

         */

        if (

          distance <=

          geometry.cellSize *

          0.08

        ) {

          return;

        }

        /*

         * We need to stop app.js from seeing

         * the original coordinates.

         */

        event.preventDefault();

        event.stopImmediatePropagation();

        /*

         * Create corrected event.

         */

        const corrected =

          createCorrectedEvent(

            event,

            point

          );

        syntheticEvents.add(

          corrected

        );

        /*

         * Dispatch it normally.

         *

         * Because our capture listener has already

         * processed the original event, the corrected

         * event now reaches app.js.

         */

        canvas.dispatchEvent(

          corrected

        );

      },

      /*

       * TRUE = capture phase

       *

       * This is the key to doing this without

       * modifying app.js.

       */

      {

        capture: true,

        passive: false

      }

    );

  }

  /*

   * =========================================================

   * WAIT FOR CANVAS

   * =========================================================

   *

   * app.js creates the canvas reference immediately,

   * but this also makes the script robust if the DOM

   * structure changes later.

   */

  function boot() {

    install();

  }

  if (

    document.readyState ===

    "loading"

  ) {

    document.addEventListener(

      "DOMContentLoaded",

      boot,

      {

        once: true

      }

    );

  } else {

    boot();

  }

})();
