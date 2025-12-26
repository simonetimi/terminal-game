import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  output,
  viewChild,
} from "@angular/core";
import { GameService } from "../../services/game-service";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SvgIcon } from "../../ui/svg-icon/svg-icon";
import { GAME_CHOICE_CLASS } from "../../models/game-state";

@Component({
  selector: "app-input-area",
  imports: [ReactiveFormsModule, FormsModule, SvgIcon],
  templateUrl: "./input-area.html",
  styleUrl: "./input-area.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputArea {
  #gameService = inject(GameService);
  inputRef = viewChild<ElementRef>("commandInput");

  toggleSettings = output<boolean>();

  constructor() {
    effect(() => {
      if (this.isSystemWriting()) {
        this.inputRef()?.nativeElement.blur();
      } else {
        // Only auto-focus if no other element has focus
        if (
          !document.activeElement ||
          document.activeElement === document.body
        ) {
          this.inputRef()?.nativeElement.focus();
        }
      }
    });
  }

  protected inputCommand = new FormControl("");
  protected isSystemWriting = this.#gameService.isSystemWriting;
  protected playerState = this.#gameService.playerState;

  openSettings($event: MouseEvent | TouchEvent) {
    $event.stopPropagation();
    this.toggleSettings.emit(true);
  }

  handleKeydown(event: KeyboardEvent) {
    if (this.#gameService.isSystemWriting()) return;

    // Handle arrow key navigation to choices
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const choices = document.querySelectorAll(`.${GAME_CHOICE_CLASS}`);
      if (choices.length > 0) {
        const firstChoice = choices[0] as HTMLElement;
        firstChoice.focus();
      }
    }
  }

  onSubmit() {
    this.#gameService.sendUserInput(this.inputCommand.value ?? "");
    this.inputCommand.reset();
  }
}
