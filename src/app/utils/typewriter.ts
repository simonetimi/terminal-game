import { WritableSignal } from "@angular/core";

export function typewriter(
  targetSignal: WritableSignal<string[]>,
  text: string,
  options: { speed?: number; wordMode?: boolean } = {},
  done?: () => void,
) {
  const { speed = 50, wordMode = false } = options;
  const parts = wordMode ? text.split(" ") : text.split("");
  let i = 0;
  let finished = false;

  targetSignal.update((items) => ["", ...items]);
  const firstIndex = 0;

  const updateText = () => {
    targetSignal.update((items) => {
      const arr = [...items];
      arr[firstIndex] = parts.slice(0, i + 1).join(wordMode ? " " : "");
      return arr;
    });
  };

  const interval = setInterval(() => {
    updateText();
    i++;
    if (i >= parts.length) {
      clearInterval(interval);
      finished = true;
      done?.();
    }
  }, speed);

  return () => {
    if (!finished) {
      clearInterval(interval);
      i = parts.length - 1;
      updateText();
      finished = true;
      done?.();
    }
  };
}
