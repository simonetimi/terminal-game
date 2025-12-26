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
        this.inputRef()?.nativeElement.focus();
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

  captureFocus() {
    this.inputRef()?.nativeElement.focus();
  }

  onSubmit() {
    this.#gameService.sendUserInput(this.inputCommand.value ?? "");
    this.inputCommand.reset();
  }
}
