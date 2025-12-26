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

@Component({
  selector: "app-display-area",
  imports: [],
  templateUrl: "./display-area.html",
  styleUrl: "./display-area.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayArea {
  #gameService = inject(GameService);

  protected scrollContainer = viewChild<ElementRef>("scrollContainer");

  protected displayItems = this.#gameService.displayItems;

  constructor() {
    this.#gameService.initStory();

    effect(() => {
      this.displayItems();
      const container = this.scrollContainer()?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }

  protected handleChoiceClick(event: MouseEvent) {
    this.#handleChoiceInteraction(event);
  }

  protected handleChoiceKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation(); // revent the global keydown listener from firing
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
        this.#gameService.sendUserInput(choiceNum);
      }
    }
  }
}
