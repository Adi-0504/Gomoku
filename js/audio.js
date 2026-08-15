"use strict";

import {
  CONFIG,
  SFX
} from "./config.js";


let uiSFX = null;
let sfxModulePromise = null;
let sfxLoading = false;

let audioUnlocked = false;

let nativeAudioContext = null;
let nativeMasterGain = null;

const lastSfxAt = new Map();


/*
 * =========================================================
 * UI SFX
 * =========================================================
 */

function loadUISFXModule() {

  if (!sfxModulePromise) {

    sfxModulePromise =
      import(
        CONFIG.SFX_MODULE
      );

  }

  return sfxModulePromise;
}


async function loadUISFX() {

  if (
    uiSFX ||
    sfxLoading
  ) {
    return uiSFX;
  }


  sfxLoading = true;


  try {

    const module =
      await loadUISFXModule();


    const createUISFX =
      module.createUISFX ||
      module.default?.createUISFX;


    if (
      typeof createUISFX !==
      "function"
    ) {

      throw new Error(
        "UI SFX createUISFX unavailable."
      );

    }


    uiSFX =
      createUISFX({
        pack:
          CONFIG.SFX_PACK,

        volume:
          CONFIG.SFX_VOLUME
      });


    return uiSFX;

  } catch (error) {

    console.warn(
      "[Gomoku] UI SFX unavailable; native fallback enabled.",
      error
    );

    uiSFX = null;

    return null;

  } finally {

    sfxLoading = false;

  }

}


/*
 * =========================================================
 * NATIVE AUDIO
 * =========================================================
 */

function ensureNativeAudio() {

  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext;


  if (!AudioContextClass) {
    return null;
  }


  if (!nativeAudioContext) {

    nativeAudioContext =
      new AudioContextClass();


    nativeMasterGain =
      nativeAudioContext.createGain();


    nativeMasterGain.gain.value =
      CONFIG.SFX_VOLUME;


    nativeMasterGain.connect(
      nativeAudioContext.destination
    );

  }


  return nativeAudioContext;
}


async function unlockBrowserAudio() {

  const context =
    ensureNativeAudio();


  if (!context) {

    audioUnlocked = true;

    return true;

  }


  try {

    if (
      context.state ===
      "suspended"
    ) {

      await context.resume();

    }


    const gain =
      context.createGain();


    gain.gain.value = 0;


    const oscillator =
      context.createOscillator();


    oscillator.frequency.value =
      180;


    oscillator.connect(gain);

    gain.connect(
      context.destination
    );


    oscillator.start();

    oscillator.stop(
      context.currentTime +
      0.008
    );


    audioUnlocked = true;

    return true;

  } catch (error) {

    console.warn(
      "[Gomoku] Audio unlock failed.",
      error
    );

    return false;

  }

}


/*
 * =========================================================
 * PUBLIC UNLOCK
 * =========================================================
 */

export async function unlockAudio(
  enabled = true
) {

  if (!enabled) {
    return null;
  }


  await unlockBrowserAudio();

  return loadUISFX();

}


/*
 * =========================================================
 * NATIVE CUES
 * =========================================================
 */

function nativeCue(cue) {

  const context =
    ensureNativeAudio();


  if (
    !context ||
    !nativeMasterGain ||
    !audioUnlocked
  ) {
    return;
  }


  const now =
    context.currentTime;


  const oscillator =
    context.createOscillator();


  const gain =
    context.createGain();


  let duration = 0.07;
  let f1 = 220;
  let f2 = 220;
  let type = "sine";


  switch (cue) {

    case SFX.press:

      duration = 0.045;
      f1 = 170;
      f2 = 125;
      type = "sine";

      break;


    case SFX.release:

      duration = 0.035;
      f1 = 145;
      f2 = 175;
      type = "sine";

      break;


    case SFX.select:

      duration = 0.065;
      f1 = 300;
      f2 = 390;
      type = "sine";

      break;


    case SFX.undo:

      duration = 0.11;
      f1 = 430;
      f2 = 260;
      type = "triangle";

      break;


    case SFX.error:

      duration = 0.12;
      f1 = 190;
      f2 = 120;
      type = "triangle";

      break;


    case SFX.warning:

      duration = 0.13;
      f1 = 250;
      f2 = 210;
      type = "triangle";

      break;


    case SFX.success:

      duration = 0.22;
      f1 = 360;
      f2 = 720;
      type = "sine";

      break;


    case SFX.complete:

      duration = 0.20;
      f1 = 300;
      f2 = 540;
      type = "sine";

      break;


    case SFX.start:

      duration = 0.16;
      f1 = 220;
      f2 = 440;
      type = "sine";

      break;


    default:

      duration = 0.07;
      f1 = 220;
      f2 = 220;
      type = "sine";

  }


  oscillator.type = type;


  oscillator.frequency.setValueAtTime(
    f1,
    now
  );


  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(20, f2),
    now + duration
  );


  gain.gain.setValueAtTime(
    0.0001,
    now
  );


  gain.gain.exponentialRampToValueAtTime(
    0.22,
    now + 0.008
  );


  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + duration
  );


  oscillator.connect(gain);

  gain.connect(
    nativeMasterGain
  );


  oscillator.start(now);

  oscillator.stop(
    now + duration + 0.01
  );

}


/*
 * =========================================================
 * PUBLIC SFX
 * =========================================================
 */

export function playSFX(
  cue,
  options = {}
) {

  const cooldownMs =
    options.cooldownMs ??
    CONFIG.AUDIO_COOLDOWN_MS;


  const now =
    performance.now();


  const last =
    lastSfxAt.get(cue) ??
    0;


  if (
    now - last <
    cooldownMs
  ) {
    return;
  }


  lastSfxAt.set(
    cue,
    now
  );


  if (uiSFX) {

    try {

      const play =
        uiSFX.play ||
        uiSFX.trigger ||
        uiSFX;


      if (
        typeof play ===
        "function"
      ) {

        play(cue);

        return;

      }

    } catch (error) {

      console.warn(
        "[Gomoku] UI SFX playback failed.",
        error
      );

    }

  }


  nativeCue(cue);

}


/*
 * =========================================================
 * SETTINGS
 * =========================================================
 */

export function setAudioEnabled(
  enabled
) {

  if (!enabled) {

    if (
      nativeMasterGain &&
      nativeAudioContext
    ) {

      nativeMasterGain.gain.setTargetAtTime(
        0,
        nativeAudioContext.currentTime,
        0.01
      );

    }

    return;

  }


  if (
    nativeMasterGain &&
    nativeAudioContext
  ) {

    nativeMasterGain.gain.setTargetAtTime(
      CONFIG.SFX_VOLUME,
      nativeAudioContext.currentTime,
      0.01
    );

  }

}


/*
 * =========================================================
 * BUTTON DECORATION
 * =========================================================
 */

export function decorateButtons() {

  document
    .querySelectorAll("button")
    .forEach(button => {

      button.classList.add(
        "gomoku-pressable"
      );


      if (
        button.dataset.gomokuDecorated ===
        "1"
      ) {
        return;
      }


      button.dataset.gomokuDecorated =
        "1";


      button.addEventListener(
        "pointerdown",
        () => {

          if (
            !button.disabled
          ) {

            playSFX(
              SFX.press,
              {
                cooldownMs: 80
              }
            );

          }

        },
        {
          passive: true
        }
      );


      button.addEventListener(
        "pointerup",
        () => {

          if (
            !button.disabled
          ) {

            playSFX(
              SFX.release,
              {
                cooldownMs: 80
              }
            );

          }

        },
        {
          passive: true
        }
      );


      button.addEventListener(
        "pointercancel",
        () => {

          if (
            !button.disabled
          ) {

            playSFX(
              SFX.release,
              {
                cooldownMs: 80
              }
            );

          }

        },
        {
          passive: true
        }
      );

    });

}
