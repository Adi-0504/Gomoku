"use strict";

/*
 * =========================================================
 * GOMOKU AUDIO SYSTEM
 * =========================================================
 *
 * Includes:
 *
 * - UI SFX
 * - Native Web Audio fallback
 * - Wabi-Sabi background music
 * - Independent music toggle
 * - In-game music button
 * - Settings music toggle
 * - Music pause / resume
 * - Music position preservation
 * - iOS / iPadOS audio unlock
 * - Sound setting integration
 * - Button micro-interactions
 *
 * Music and SFX are independent:
 *
 * sound = master switch for all audio
 * music = background music only
 *
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
 * BACKGROUND MUSIC
 * =========================================================
 */

const BGM_PATH =
  "./music/WabiSabiLoops_1loop_01.mp3";

const BGM_VOLUME =
  0.24;

let bgm =
  null;

let bgmStarted =
  false;

let bgmErrorShown =
  false;


/*
 * =========================================================
 * NATIVE AUDIO
 * =========================================================
 */

let audioUnlocked =
  false;

let nativeAudioContext =
  null;

let nativeMasterGain =
  null;


/*
 * =========================================================
 * UI SFX
 * =========================================================
 */

let uiSFX =
  null;

let sfxModulePromise =
  null;

let sfxLoading =
  false;


/*
 * =========================================================
 * SFX COOLDOWN
 * =========================================================
 */

const lastSfxAt =
  new Map();


/*
 * =========================================================
 * MUSIC SETTING
 * =========================================================
 */

function isMusicEnabled() {

  /*
   * Compatibility with older save data.
   *
   * Older versions may not have
   * state.settings.music.
   *
   * In that case music is enabled.
   */

  return (
    state.settings.music !== false
  );

}


/*
 * =========================================================
 * UPDATE MUSIC BUTTON UI
 * =========================================================
 */

function updateMusicButton() {

  const button =
    document.getElementById(
      "musicButton"
    );


  const icon =
    document.getElementById(
      "musicButtonIcon"
    );


  const label =
    document.getElementById(
      "musicButtonLabel"
    );


  if (!button) {

    return;

  }


  const enabled =
    isMusicEnabled();


  /*
   * Accessibility state.
   */

  button.setAttribute(
    "aria-pressed",
    String(enabled)
  );


  button.setAttribute(
    "aria-label",
    enabled
      ? "關閉背景音樂"
      : "開啟背景音樂"
  );


  /*
   * Visual state.
   */

  button.classList.toggle(
    "music-off",
    !enabled
  );


  /*
   * Icon.
   */

  if (icon) {

    icon.textContent =
      enabled
        ? "♫"
        : "♫̸";

  }


  /*
   * Label.
   */

  if (label) {

    label.textContent =
      enabled
        ? "音樂"
        : "音樂關閉";

  }

}


/*
 * =========================================================
 * UPDATE SETTINGS MUSIC TOGGLE
 * =========================================================
 */

function updateMusicSettingToggle() {

  const toggle =
    document.getElementById(
      "musicToggle"
    );


  if (!toggle) {

    return;

  }


  toggle.checked =
    isMusicEnabled();

}


/*
 * =========================================================
 * SYNC ALL MUSIC UI
 * =========================================================
 */

function syncMusicUI() {

  updateMusicButton();

  updateMusicSettingToggle();

}


/*
 * =========================================================
 * CREATE BGM
 * =========================================================
 */

function createBGM() {

  if (bgm) {

    return bgm;

  }


  bgm =
    new Audio();


  bgm.src =
    BGM_PATH;


  bgm.loop =
    true;


  bgm.autoplay =
    false;


  bgm.preload =
    "auto";


  bgm.volume =
    BGM_VOLUME;


  bgm.setAttribute(
    "playsinline",
    ""
  );


  bgm.setAttribute(
    "webkit-playsinline",
    ""
  );


  bgm.addEventListener(
    "error",
    () => {

      if (
        bgmErrorShown
      ) {

        return;

      }


      bgmErrorShown =
        true;


      console.warn(
        "[Gomoku] BGM failed to load:",
        BGM_PATH,
        bgm.error
      );

    }
  );


  bgm.addEventListener(
    "play",
    () => {

      bgmStarted =
        true;

    }
  );


  bgm.addEventListener(
    "pause",
    () => {

      bgmStarted =
        false;

    }
  );


  return bgm;

}


/*
 * =========================================================
 * START BGM
 * =========================================================
 *
 * IMPORTANT:
 *
 * currentTime is NEVER reset here.
 *
 * Therefore:
 *
 * play at 00:37
 *     ↓
 * pause
 *     ↓
 * play
 *     ↓
 * resume around 00:37
 *
 * =========================================================
 */

function startBGM() {

  if (
    !state.settings.sound ||
    !isMusicEnabled()
  ) {

    return false;

  }


  const music =
    createBGM();


  if (!music) {

    return false;

  }


  music.volume =
    BGM_VOLUME;


  music.loop =
    true;


  /*
   * Already playing.
   */

  if (
    !music.paused
  ) {

    bgmStarted =
      true;

    return true;

  }


  /*
   * DO NOT reset currentTime.
   */

  const promise =
    music.play();


  if (
    promise &&
    typeof promise.catch ===
    "function"
  ) {

    promise.catch(
      error => {

        bgmStarted =
          false;


        console.warn(
          "[Gomoku] BGM playback was blocked:",
          error
        );

      }
    );

  }


  return true;

}


/*
 * =========================================================
 * PAUSE BGM
 * =========================================================
 *
 * This is intentionally NOT:
 *
 * music.currentTime = 0
 *
 * The current position is preserved.
 *
 * =========================================================
 */

function pauseBGM() {

  if (!bgm) {

    return;

  }


  try {

    bgm.pause();

  } catch (
    error
  ) {

    console.warn(
      "[Gomoku] Failed to pause BGM:",
      error
    );

  }


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

  const normalized =
    Math.max(
      0,
      Math.min(
        1,
        Number(volume) || 0
      )
    );


  if (bgm) {

    bgm.volume =
      normalized;

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
 * UNLOCK NATIVE AUDIO
 * =========================================================
 */

function unlockNativeAudio() {

  const context =
    ensureNativeAudio();


  if (!context) {

    audioUnlocked =
      true;

    return true;

  }


  try {

    if (
      context.state ===
      "suspended"
    ) {

      const resumePromise =
        context.resume();


      if (
        resumePromise &&
        typeof resumePromise.catch ===
        "function"
      ) {

        resumePromise.catch(
          () => {}
        );

      }

    }


    audioUnlocked =
      true;


    return true;

  } catch (
    error
  ) {

    console.warn(
      "[Gomoku] Native audio unlock failed:",
      error
    );


    return false;

  }

}


/*
 * =========================================================
 * UI SFX MODULE
 * =========================================================
 */

function loadUISFXModule() {

  if (
    !sfxModulePromise
  ) {

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

  } catch (
    error
  ) {

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
 * PUBLIC AUDIO UNLOCK
 * =========================================================
 */

export function unlockAudio() {

  /*
   * Unlock native audio first.
   */

  unlockNativeAudio();


  /*
   * Start BGM only when both:
   *
   * sound = ON
   * music = ON
   */

  if (
    state.settings.sound &&
    isMusicEnabled()
  ) {

    startBGM();

  }


  /*
   * Load SFX asynchronously.
   */

  if (
    state.settings.sound
  ) {

    loadUISFX();

  }


  return uiSFX;

}


/*
 * =========================================================
 * NATIVE SFX
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
 * PUBLIC SFX
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


  /*
   * Unlock audio on interaction.
   */

  unlockNativeAudio();


  /*
   * BGM is independent from SFX.
   */

  if (
    isMusicEnabled()
  ) {

    startBGM();

  }


  const ui =
    uiSFX ||
    await loadUISFX();


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

    } catch (
      error
    ) {

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

    /*
     * Sound OFF:
     *
     * - pause BGM
     * - stop active SFX
     * - preserve music position
     */

    pauseBGM();


    if (
      uiSFX?.stopAll
    ) {

      try {

        uiSFX.stopAll();

      } catch {}

    }


    syncMusicUI();

    return;

  }


  /*
   * Sound ON does not automatically
   * force music ON.
   *
   * The previous music preference
   * remains untouched.
   */

  audioUnlocked =
    false;


  syncMusicUI();

}


/*
 * =========================================================
 * MUSIC SETTING
 * =========================================================
 *
 * Music is independent from SFX.
 *
 * OFF:
 *   pause only
 *
 * ON:
 *   resume current position
 *
 * =========================================================
 */

export function setMusicEnabled(
  enabled
) {

  state.settings.music =
    Boolean(
      enabled
    );


  saveSettings(
    state.settings
  );


  if (
    !state.settings.music
  ) {

    /*
     * Pause only.
     *
     * currentTime is preserved.
     */

    pauseBGM();


    syncMusicUI();

    return;

  }


  /*
   * User explicitly changed the music
   * setting, so this is a valid user
   * interaction for iOS / iPadOS.
   */

  unlockNativeAudio();


  if (
    state.settings.sound
  ) {

    startBGM();

  }


  syncMusicUI();

}


/*
 * =========================================================
 * GAME MUSIC BUTTON
 * =========================================================
 */

function installGameMusicButton() {

  const button =
    document.getElementById(
      "musicButton"
    );


  if (!button) {

    return;

  }


  /*
   * Avoid duplicate event listeners.
   */

  if (
    button.dataset.musicBound ===
    "1"
  ) {

    syncMusicUI();

    return;

  }


  button.dataset.musicBound =
    "1";


  /*
   * Initial state.
   */

  syncMusicUI();


  /*
   * Toggle music.
   */

  button.addEventListener(
    "click",
    () => {

      const nextState =
        !isMusicEnabled();


      setMusicEnabled(
        nextState
      );

    }
  );

}


/*
 * =========================================================
 * SETTINGS MUSIC TOGGLE
 * =========================================================
 */

function installMusicToggle() {

  const toggle =
    document.getElementById(
      "musicToggle"
    );


  if (!toggle) {

    return;

  }


  /*
   * Initial state.
   */

  toggle.checked =
    isMusicEnabled();


  if (
    toggle.dataset.musicBound ===
    "1"
  ) {

    syncMusicUI();

    return;

  }


  toggle.dataset.musicBound =
    "1";


  toggle.addEventListener(
    "change",
    () => {

      setMusicEnabled(
        toggle.checked
      );

    }
  );


  syncMusicUI();

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
 * GLOBAL AUDIO UNLOCK
 * =========================================================
 */

function installGlobalAudioUnlock() {

  const handler =
    () => {

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
 * INITIALIZE
 * =========================================================
 */

function initAudio() {

  createBGM();

  decorateButtons();

  installGlobalAudioUnlock();

  installMusicToggle();

  installGameMusicButton();

  syncMusicUI();

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
 * GLOBAL AUDIO API
 * =========================================================
 */

window.GomokuAudio = {

  startMusic() {

    return startBGM();

  },


  pauseMusic() {

    pauseBGM();

  },


  stopMusic() {

    /*
     * Compatibility.
     *
     * Behaves as pause so the
     * playback position is preserved.
     */

    pauseBGM();

  },


  setMusicEnabled(
    enabled
  ) {

    setMusicEnabled(
      enabled
    );

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

  },


  isMusicEnabled() {

    return isMusicEnabled();

  },


  syncMusicUI() {

    syncMusicUI();

  }

};
