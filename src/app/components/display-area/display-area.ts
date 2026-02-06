import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  viewChild,
} from "@angular/core";
import { GameService } from "../../services/game-service";
import { GAME_CHOICE_CLASS } from "../../models/game-state";
import { NavigationService } from "../../services/navigation-service";
import { SettingsService } from "../../services/settings-service";

@Component({
  selector: "app-display-area",
  imports: [],
  templateUrl: "./display-area.html",
  styleUrl: "./display-area.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.hide-scrollbar]": "!scrollbarEnabled()",
  },
})
export class DisplayArea {
  #gameService = inject(GameService);
  #navigationService = inject(NavigationService);
  #settingsService = inject(SettingsService);

  protected scrollContainer = viewChild<ElementRef>("scrollContainer");

  protected displayItems = this.#gameService.displayItems;
  protected scrollbarEnabled = this.#settingsService.scrollbarEnabled;

  constructor() {
    this.#gameService.initStory();

    effect(() => {
      this.displayItems();
      const container = this.scrollContainer()?.nativeElement;
      if (container) {
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight;
        });
      }
    });
  }

  protected handleChoiceClick(event: MouseEvent) {
    this.#handleChoiceInteraction(event);
  }

  protected handleChoiceKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;

    // handle arrow key navigation between choices
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      if (target.classList.contains(GAME_CHOICE_CLASS)) {
        this.#navigationService.navigateBetweenChoices(event, target);
        return;
      }
    }

    // Handle choice selection
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation(); // prevent the global keydown listener from firing
      this.#handleChoiceInteraction(event);
    }
  }

  #handleChoiceInteraction(event: MouseEvent | KeyboardEvent) {
    if (this.#gameService.isSystemWriting()) return;

    const target = event.target as HTMLElement;

    if (target.classList.contains(GAME_CHOICE_CLASS)) {
      const li = target.closest("li");
      const choiceNum = li?.getAttribute("data-choice-num");

      if (choiceNum) {
        (document.activeElement as HTMLElement | null)?.blur();
        target.blur();
        this.#gameService.sendUserInput(choiceNum);
      }
    }
  }
}
