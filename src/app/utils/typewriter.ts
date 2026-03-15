import { WritableSignal } from "@angular/core";
import { ListItem } from "../models/game.model";
import { TEXT_DELIMITERS, VFX_EVENTS } from "../lib/constants";

export function typewriter(
  targetSignal: WritableSignal<ListItem[]>,
  text: string,
  options: {
    speed?: number;
    wordMode?: boolean;
    lineBreakDelay?: number;
    effectsSelector?: string;
  } = {},
  done?: () => void,
) {
  const {
    speed = 50,
    wordMode = false,
    lineBreakDelay = 1000,
    effectsSelector,
  } = options;

  // converts speed to delay
  const minDelay = 10;
  const maxDelay = 80;
  const delay = maxDelay - Math.round((speed / 100) * (maxDelay - minDelay));

  // split text by double backslashes
  const lines = text.split(TEXT_DELIMITERS.storyLineBreak);
  let currentLineIndex = 0;
  let currentCharIndex = 0;
  let finished = false;
  let isPaused = false;
  let currentTimeout: number | null = null;

  targetSignal.update((items) => [...items, { text: "" }]);
  const firstIndex = targetSignal().length - 1;

  // event helpers
  const eventTarget: Document = document;
  const getEffectsElement = (): HTMLElement | null =>
    effectsSelector
      ? (document.querySelector(effectsSelector) as HTMLElement | null)
      : null;

  const eventRelatesToTarget = (evt: Event): boolean => {
    if (!effectsSelector) return true; // no filter
    const el = getEffectsElement();
    if (!el) return false;
    const path = (
      evt as Event & { composedPath?: () => EventTarget[] }
    ).composedPath?.();
    if (Array.isArray(path)) return path.includes(el);
    const t = evt.target as Node | null;
    return !!t && (t === el || el.contains(t));
  };

  // listen for glitch events
  let glitchStartListener: ((event: Event) => void) | null = null;
  let glitchEndListener: ((event: Event) => void) | null = null;

  glitchStartListener = (e: Event) => {
    if (!eventRelatesToTarget(e)) return;
    isPaused = true;
    if (currentTimeout !== null) {
      clearTimeout(currentTimeout);
      currentTimeout = null;
    }
  };

  glitchEndListener = (e: Event) => {
    if (!eventRelatesToTarget(e)) return;
    isPaused = false;
    if (!finished) {
      // give the glitch a tick to clean up before resuming
      setTimeout(() => processNextCharacter(), 50);
    }
  };

  eventTarget.addEventListener(VFX_EVENTS.glitchStarting, glitchStartListener);
  eventTarget.addEventListener(VFX_EVENTS.glitchEnded, glitchEndListener);

  const updateText = () => {
    // build the complete text up to current position
    let completeText = "";

    // add all completed lines (no <br>, just concatenate)
    for (let i = 0; i < currentLineIndex; i++) {
      completeText += lines[i];
    }

    // add current line up to current character
    if (currentLineIndex < lines.length) {
      const currentLine = lines[currentLineIndex];
      const parts = wordMode ? currentLine.split(" ") : currentLine.split("");
      const currentPart = parts
        .slice(0, Math.min(currentCharIndex + 1, parts.length))
        .join(wordMode ? " " : "");
      completeText += currentPart;
    }

    targetSignal.update((items) => {
      const arr = [...items];
      arr[firstIndex].text = completeText;
      return arr;
    });
  };

  const processNextCharacter = () => {
    if (isPaused) return;

    if (currentLineIndex >= lines.length) {
      finished = true;
      cleanupListeners();
      done?.();
      return;
    }

    const currentLine = lines[currentLineIndex];
    const parts = wordMode ? currentLine.split(" ") : currentLine.split("");

    updateText();
    currentCharIndex++;

    // finished current line?
    if (currentCharIndex >= parts.length) {
      currentLineIndex++;
      currentCharIndex = 0;

      if (currentLineIndex < lines.length) {
        currentTimeout = window.setTimeout(() => {
          currentTimeout = null;
          if (!finished && !isPaused) {
            processNextCharacter();
          }
        }, lineBreakDelay);
      } else {
        finished = true;
        cleanupListeners();
        done?.();
      }
    } else {
      // next character
      currentTimeout = window.setTimeout(() => {
        currentTimeout = null;
        if (!finished && !isPaused) {
          processNextCharacter();
        }
      }, delay);
    }
  };

  const cleanupListeners = () => {
    if (glitchStartListener) {
      eventTarget.removeEventListener(
        VFX_EVENTS.glitchStarting,
        glitchStartListener,
      );
    }
    if (glitchEndListener) {
      eventTarget.removeEventListener(
        VFX_EVENTS.glitchEnded,
        glitchEndListener,
      );
    }
  };

  processNextCharacter();

  // skip function
  return () => {
    if (!finished) {
      if (currentTimeout !== null) {
        clearTimeout(currentTimeout);
        currentTimeout = null;
      }
      cleanupListeners();

      // fast-forward to end
      currentLineIndex = lines.length;
      currentCharIndex = 0;
      updateText();

      finished = true;
      done?.();
    }
  };
}
