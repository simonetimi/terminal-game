import { Injectable } from "@angular/core";
import { GAME_CHOICE_CLASS } from "../models/game-state";
import { DOM_SELECTORS, KEYBOARD_KEYS } from "../lib/constants";

@Injectable({
  providedIn: "root",
})
export class NavigationService {
  navigateFromInputToChoices(event: KeyboardEvent): boolean {
    if (
      event.key !== KEYBOARD_KEYS.arrowUp &&
      event.key !== KEYBOARD_KEYS.arrowDown
    ) {
      return false;
    }

    event.preventDefault();
    const choices = document.querySelectorAll(
      `.${GAME_CHOICE_CLASS}`,
    ) as NodeListOf<HTMLElement>;

    if (choices.length === 0) {
      return false;
    }

    // navigate to last choice on ArrowUp, first choice on ArrowDown
    const targetChoice =
      event.key === KEYBOARD_KEYS.arrowUp
        ? choices[choices.length - 1]
        : choices[0];
    targetChoice.focus();
    return true;
  }

  navigateBetweenChoices(
    event: KeyboardEvent,
    currentElement: HTMLElement,
  ): boolean {
    if (
      event.key !== KEYBOARD_KEYS.arrowUp &&
      event.key !== KEYBOARD_KEYS.arrowDown
    ) {
      return false;
    }

    event.preventDefault();
    const choices = Array.from(
      document.querySelectorAll(`.${GAME_CHOICE_CLASS}`),
    ) as HTMLElement[];

    if (choices.length === 0) {
      return false;
    }

    const currentIndex = choices.indexOf(currentElement);
    if (currentIndex === -1) {
      return false;
    }

    let nextIndex: number;
    if (event.key === KEYBOARD_KEYS.arrowDown) {
      nextIndex = currentIndex + 1;
      if (nextIndex >= choices.length) {
        // reached the end, cycle to input
        this.focusInput();
        return true;
      }
    } else {
      // arrowUp
      nextIndex = currentIndex - 1;
      if (nextIndex < 0) {
        // reached the beginning, cycle to input
        this.focusInput();
        return true;
      }
    }

    choices[nextIndex].focus();
    return true;
  }

  private focusInput(): void {
    const input = document.querySelector(
      DOM_SELECTORS.terminalInput,
    ) as HTMLElement | null;
    if (input) {
      input.focus();
    }
  }
}
