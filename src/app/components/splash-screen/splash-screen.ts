import {
  AfterViewInit,
  Component,
  inject,
  output,
  signal,
} from "@angular/core";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { typewriter } from "../../utils/typewriter";
import { FormsModule } from "@angular/forms";
import { SettingsService } from "../../services/settings-service";
import { GameService } from "../../services/game-service";
import { ListItem } from "../../models/game.model";

@Component({
  selector: "app-splash-screen",
  imports: [FormsModule, TranslatePipe],
  templateUrl: "./splash-screen.html",
  styleUrl: "./splash-screen.css",
  host: {
    "(window:keydown)": "handleKeydown($event)",
  },
})
export class SplashScreen implements AfterViewInit {
  #translateService = inject(TranslateService);
  #settingsService = inject(SettingsService);
  #gameService = inject(GameService);

  protected displayMessages = signal<ListItem[]>([]);
  protected showButton = signal(false);

  #textLoaded = signal(false);

  protected isGameDataLoading = this.#gameService.gameData.isLoading;

  hideSplashScreen = output<boolean>();

  ngAfterViewInit() {
    const speed = this.#settingsService.typewriterSpeed();
    typewriter(
      this.displayMessages,
      this.#translateService.instant("splashScreen.welcome1"),
      { speed },
      () => {
        typewriter(
          this.displayMessages,
          this.#translateService.instant("splashScreen.welcome2"),
          {
            speed,
          },
          () => {
            this.showButton.set(true);
            this.#textLoaded.set(true);
          },
        );
      },
    );
  }

  protected onSubmit() {
    if (this.#textLoaded()) this.hideSplashScreen.emit(true);
  }

  protected handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      this.onSubmit();
    }
  }
}
