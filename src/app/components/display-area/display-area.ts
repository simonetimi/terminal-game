import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  viewChild,
} from "@angular/core";
import {
  CdkVirtualScrollViewport,
  ScrollingModule,
} from "@angular/cdk/scrolling";
import { ScrollingModule as ExperimentalScrollingModule } from "@angular/cdk-experimental/scrolling";
import { GameService } from "../../services/game-service";
import { GAME_CHOICE_CLASS } from "../../models/game-state";
import { NavigationService } from "../../services/navigation-service";
import { SettingsService } from "../../services/settings-service";
import { DOM_ATTRIBUTES, KEYBOARD_KEYS } from "../../lib/constants";

@Component({
  selector: "app-display-area",
  imports: [ScrollingModule, ExperimentalScrollingModule],
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

  protected scrollContainer =
    viewChild<CdkVirtualScrollViewport>("scrollContainer");
  protected readonly trackByIndex = (index: number) => index;

  protected displayItems = this.#gameService.displayItems;
  protected scrollbarEnabled = this.#settingsService.scrollbarEnabled;

  constructor() {
    this.#gameService.initStory();

    effect(() => {
      const items = this.displayItems();
      const viewport = this.scrollContainer();

      if (!viewport || !items.length) return;

      requestAnimationFrame(() => {
        viewport.scrollTo({ bottom: 0 });
      });
    });
  }

  protected handleChoiceClick(event: MouseEvent) {
    this.#handleChoiceInteraction(event);
  }

  protected handleChoiceKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;

    // handle arrow key navigation between choices
    if (
      event.key === KEYBOARD_KEYS.arrowUp ||
      event.key === KEYBOARD_KEYS.arrowDown
    ) {
      if (target.classList.contains(GAME_CHOICE_CLASS)) {
        this.#navigationService.navigateBetweenChoices(event, target);
        return;
      }
    }

    // Handle choice selection
    if (
      event.key === KEYBOARD_KEYS.enter ||
      event.key === KEYBOARD_KEYS.space
    ) {
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
      const choiceNum = li?.getAttribute(DOM_ATTRIBUTES.choiceNum);

      if (choiceNum) {
        (document.activeElement as HTMLElement | null)?.blur();
        target.blur();
        this.#gameService.sendUserInput(choiceNum);
      }
    }
  }
}
