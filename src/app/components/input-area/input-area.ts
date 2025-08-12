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
import { TranslatePipe } from "@ngx-translate/core";
import { AudioService } from "../../services/audio-service";

@Component({
  selector: "app-input-area",
  imports: [ReactiveFormsModule, FormsModule, TranslatePipe],
  templateUrl: "./input-area.html",
  styleUrl: "./input-area.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputArea {
  #gameService = inject(GameService);
  #audioService = inject(AudioService);
  inputRef = viewChild<ElementRef>("commandInput");

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
  protected isSoundOn = this.#audioService.isSoundOn;

  onToggleSound() {
    this.isSoundOn.update((prev) => !prev);
  }

  onSubmit() {
    this.#gameService.sendUserInput(this.inputCommand.value ?? "");
    this.inputCommand.reset();
  }
}
