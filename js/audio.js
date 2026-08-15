"use strict";

/*
 * =========================================================
 * GOMOKU AUDIO SYSTEM
 * =========================================================
 *
 * Includes:
 * - UI SFX module
 * - Native Web Audio fallback
 * - Wabi-Sabi background music
 * - Music loop
 * - iOS / iPadOS audio unlock
 * - Sound setting integration
 * - Button micro-interactions
 *
 * No dependency on app.js.
 * =========================================================
 */

import {
  CONFIG,
  SFX
} from "./config.js";

import {
  state
} from "./state.js";

import {
  saveSettings
} from "./storage.js";


/*
 * =========================================================
 * UI SFX
 * =========================================================
 */

let uiSFX = null;

let sfxModulePromise = null;

let sfxLoading = false;


/*
 * =========================================================
 * NATIVE AUDIO
 * =========================================================
 */

let audioUnlocked = false;

let nativeAudioContext = null;

let nativeMasterGain = null;


/*
 * =========================================================
 * BACKGROUND MUSIC
 * =========================================================
 */

const BGM_PATH =
  "./music/WabiSabiLoops_1loop_01.mp3";

let bgm = null;

let bgmReady = false;

let bgmStarted = false;

let bgmLoading = false;

const BGM_VOLUME = 0.24;


/*
 * =========================================================
 * SFX COOLDOWN
 * =========================================================
 */

const lastSfxAt =
  new Map();


/*
 * =========================================================
 * UI SFX MODULE
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
    !state.settings.sound ||
    sfxLoading
  ) {

    return uiSFX;

  }


  sfxLoading =
    true;


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


    uiSFX =
      null;


    return null;

  } finally {

    sfxLoading =
      false;

  }

}


/*
 * =========================================================
 * NATIVE AUDIO CONTEXT
 * =========================================================
 */

function ensureNativeAudio() {

  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext;


  if (
    !AudioContextClass
  ) {

    return null;

  }


  if (
    !nativeAudioContext
  ) {

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


/*
 * =========================================================
 * BGM CREATION
 * =========================================================
 */

function createBGM() {

  if (bgm) {

    return bgm;

  }


  bgm =
    new Audio(
      BGM_PATH
    );


  bgm.loop =
    true;


  bgm.preload =
    "auto";


  bgm.volume =
    BGM_VOLUME;


  bgm.setAttribute(
    "playsinline",
    ""
  );


  bgm.addEventListener(
    "canplaythrough",
    () => {

      bgmReady =
        true;

    },
    {
      once:
        false
    }
  );


  bgm.addEventListener(
    "error",
    () => {

      bgmReady =
        false;

      console.warn(
        "[Gomoku] Background music could not be loaded:",
        BGM_PATH
      );

    }
  );


  return bgm;

}


/*
 * =========================================================
 * START BGM
 * =========================================================
 */

async function startBGM() {

  if (
    !state.settings.sound
  ) {

    return false;

  }


  const music =
    createBGM();


  if (
    !music
  ) {

    return false;

  }


  if (
    bgmStarted &&
    !music.paused
  ) {

    return true;

  }


  if (
    bgmLoading
  ) {

    return false;

  }


  bgmLoading =
    true;


  try {

    music.volume =
      BGM_VOLUME;


    const promise =
      music.play();


    if (
      promise &&
      typeof promise.then ===
      "function"
    ) {

      await promise;

    }


    bgmStarted =
      true;


    return true;

  } catch (error) {

    /*
     * iOS / Safari may reject autoplay
     * until the user interacts with the page.
     */

    console.warn(
      "[Gomoku] BGM playback waiting for user interaction.",
      error
    );


    return false;

  } finally {

    bgmLoading =
      false;

  }

}


/*
 * =========================================================
 * STOP BGM
 * =========================================================
 */

function stopBGM() {

  if (
    !bgm
  ) {

    return;

  }


  try {

    bgm.pause();

  } catch {}


  bgmStarted =
    false;

}


/*
 * =========================================================
 * MUSIC VOLUME
 * =========================================================
 */

function setBGMVolume(
  volume
) {

  if (
    !bgm
  ) {

    return;

  }


  const normalized =
    Math.max(
      0,
      Math.min(
        1,
        Number(volume) || 0
      )
    );


  bgm.volume =
    normalized;

}


/*
 * =========================================================
 * BROWSER AUDIO UNLOCK
 * =========================================================
 */

async function unlockBrowserAudio() {

  const context =
    ensureNativeAudio();


  if (
    !context
  ) {

    audioUnlocked =
      true;

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


    gain.gain.value =
      0;


    const oscillator =
      context.createOscillator();


    oscillator.frequency.value =
      180;


    oscillator.connect(
      gain
    );


    gain.connect(
      context.destination
    );


    oscillator.start();


    oscillator.stop(
      context.currentTime +
      0.008
    );


    audioUnlocked =
      true;


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
 * PUBLIC AUDIO UNLOCK
 * =========================================================
 */

export async function unlockAudio() {

  if (
    !state.settings.sound
  ) {

    return null;

  }


  await unlockBrowserAudio();


  /*
   * Create the music element before attempting
   * playback. This is important for iOS.
   */

  createBGM();


  /*
   * Load UI SFX.
   */

  const ui =
    await loadUISFX();


  /*
   * Start background music.
   *
   * This may succeed immediately on desktop
   * or after the first user interaction on iOS.
   */

  await startBGM();


  return ui;

}


/*
 * =========================================================
 * NATIVE SFX CUE
 * =========================================================
 */

function nativeCue(
  cue
) {

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


  let duration =
    0.055;

  let f1 =
    240;

  let f2 =
    280;

  let type =
    "sine";


  switch (
    cue
  ) {

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


    case SFX.back:

      duration = 0.08;
      f1 = 310;
      f2 = 220;
      type = "sine";

      break;


    case SFX.delete:

      duration = 0.10;
      f1 = 260;
      f2 = 140;
      type = "triangle";

      break;


    default:

      duration = 0.055;
      f1 = 240;
      f2 = 280;
      type = "sine";

  }


  const peak =
    cue === SFX.success
      ? 0.26
      : 0.18;


  oscillator.type =
    type;


  oscillator.frequency.setValueAtTime(
    f1,
    now
  );


  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(
      50,
      f2
    ),
    now +
    duration
  );


  gain.gain.setValueAtTime(
    0.0001,
    now
  );


  gain.gain.exponentialRampToValueAtTime(
    peak,
    now +
    Math.min(
      0.018,
      duration *
      0.25
    )
  );


  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    now +
    duration
  );


  oscillator.connect(
    gain
  );


  gain.connect(
    nativeMasterGain
  );


  oscillator.start(
    now
  );


  oscillator.stop(
    now +
    duration +
    0.01
  );

}


/*
 * =========================================================
 * PUBLIC SFX PLAY
 * =========================================================
 */

export async function playSFX(
  cue,
  options = {}
) {

  if (
    !state.settings.sound
  ) {

    return;

  }


  const now =
    performance.now();


  const cooldown =
    options.cooldownMs ??
    CONFIG.AUDIO_COOLDOWN_MS;


  const last =
    lastSfxAt.get(
      cue
    ) ??
    -Infinity;


  if (
    now -
    last <
    cooldown
  ) {

    return;

  }


  lastSfxAt.set(
    cue,
    now
  );


  const ui =
    uiSFX ||
    await unlockAudio();


  if (
    ui &&
    typeof ui.play ===
    "function"
  ) {

    try {

      ui.play(
        cue,
        {

          retrigger:
            options.retrigger ||
            "restart",

          cooldownMs:
            cooldown

        }
      );


      return;

    } catch (error) {

      console.warn(
        `[Gomoku] UI SFX "${cue}" failed; using native fallback.`,
        error
      );

    }

  }


  nativeCue(
    cue
  );

}


/*
 * =========================================================
 * SOUND SETTING
 * =========================================================
 */

export function setSoundEnabled(
  enabled
) {

  state.settings.sound =
    Boolean(
      enabled
    );


  saveSettings(
    state.settings
  );


  if (
    !state.settings.sound
  ) {

    stopBGM();


    if (
      uiSFX?.stopAll
    ) {

      try {

        uiSFX.stopAll();

      } catch {}

    }


    return;

  }


  audioUnlocked =
    false;


  /*
   * Don't force autoplay here.
   * The next user interaction will unlock it.
   */

}


/*
 * =========================================================
 * BUTTON MICRO INTERACTIONS
 * =========================================================
 */

export function decorateButtons() {

  document
    .querySelectorAll(
      "button"
    )
    .forEach(
      button => {

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

              /*
               * First interaction unlocks
               * both SFX and BGM.
               */

              unlockAudio();


              playSFX(
                SFX.press,
                {
                  cooldownMs:
                    80
                }
              );

            }

          },
          {
            passive:
              true
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
                  cooldownMs:
                    80
                }
              );

            }

          },
          {
            passive:
              true
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
                  cooldownMs:
                    80
                }
              );

            }

          },
          {
            passive:
              true
          }
        );

      }
    );

}


/*
 * =========================================================
 * GLOBAL USER INTERACTION UNLOCK
 * =========================================================
 *
 * This is mainly for iOS / iPadOS.
 *
 * The first tap anywhere on the page attempts
 * to start the Wabi-Sabi loop.
 * =========================================================
 */

function installGlobalAudioUnlock() {

  const handler =
    () => {

      if (
        !state.settings.sound
      ) {

        return;

      }


      unlockAudio();

    };


  document.addEventListener(
    "pointerdown",
    handler,
    {
      passive:
        true
    }
  );


  document.addEventListener(
    "touchstart",
    handler,
    {
      passive:
        true
    }
  );


  document.addEventListener(
    "keydown",
    handler,
    {
      passive:
        true
    }
  );

}


/*
 * =========================================================
 * INITIALIZE AUDIO
 * =========================================================
 */

function initAudio() {

  createBGM();

  decorateButtons();

  installGlobalAudioUnlock();

}


/*
 * =========================================================
 * DOM READY
 * =========================================================
 */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initAudio,
    {
      once:
        true
    }
  );

} else {

  initAudio();

}


/*
 * =========================================================
 * PUBLIC GLOBAL HELPERS
 * =========================================================
 *
 * These are intentionally exposed so other modules
 * can start / stop music without depending on app.js.
 * =========================================================
 */

window.GomokuAudio = {

  startMusic() {

    return startBGM();

  },

  stopMusic() {

    stopBGM();

  },

  setMusicVolume(
    volume
  ) {

    setBGMVolume(
      volume
    );

  },

  getMusicElement() {

    return bgm;

  },

  isMusicPlaying() {

    return Boolean(
      bgm &&
      !bgm.paused
    );

  }

};
