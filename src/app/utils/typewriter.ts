import { WritableSignal } from "@angular/core";

export function typewriter(
  targetSignal: WritableSignal<string[]>,
  text: string,
  options: { speed?: number; wordMode?: boolean; lineBreakDelay?: number } = {},
  done?: () => void,
) {
  const { speed = 50, wordMode = false, lineBreakDelay = 1000 } = options;

  // split text by double backslashes instead of newlines
  const lines = text.split("\\");
  let currentLineIndex = 0;
  let currentCharIndex = 0;
  let finished = false;

  targetSignal.update((items) => ["", ...items]);
  const firstIndex = 0;

  const updateText = () => {
    // build the complete text up to current position
    let completeText = "";

    // add all completed lines (no <br> tags, just concatenate)
    for (let i = 0; i < currentLineIndex; i++) {
      completeText += lines[i];
    }

    // add current line up to current character
    if (currentLineIndex < lines.length) {
      const currentLine = lines[currentLineIndex];
      const parts = wordMode ? currentLine.split(" ") : currentLine.split("");
      const currentPart = parts
        .slice(0, currentCharIndex + 1)
        .join(wordMode ? " " : "");

      completeText += currentPart;
    }

    targetSignal.update((items) => {
      const arr = [...items];
      arr[firstIndex] = completeText;
      return arr;
    });
  };

  const processNextCharacter = () => {
    if (currentLineIndex >= lines.length) {
      finished = true;
      done?.();
      return;
    }

    const currentLine = lines[currentLineIndex];
    const parts = wordMode ? currentLine.split(" ") : currentLine.split("");

    updateText();
    currentCharIndex++;

    // check if current line is finished
    if (currentCharIndex >= parts.length) {
      currentLineIndex++;
      currentCharIndex = 0;

      // pause before continuing to next line
      if (currentLineIndex < lines.length) {
        setTimeout(() => {
          if (!finished) {
            processNextCharacter();
          }
        }, lineBreakDelay);
      } else {
        finished = true;
        done?.();
      }
    } else {
      // continue with next character in current line
      setTimeout(() => {
        if (!finished) {
          processNextCharacter();
        }
      }, speed);
    }
  };

  processNextCharacter();

  // skip function
  return () => {
    if (!finished) {
      // skip to the end
      currentLineIndex = lines.length - 1;
      currentCharIndex = wordMode
        ? lines[currentLineIndex].split(" ").length - 1
        : lines[currentLineIndex].split("").length - 1;
      updateText();
      finished = true;
      done?.();
    }
  };
}
