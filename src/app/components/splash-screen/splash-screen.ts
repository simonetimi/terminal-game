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

@Component({
  selector: "app-splash-screen",
  imports: [FormsModule, TranslatePipe],
  templateUrl: "./splash-screen.html",
  styleUrl: "./splash-screen.css",
})
export class SplashScreen implements AfterViewInit {
  #translateService = inject(TranslateService);

  protected displayMessages = signal<string[]>([]);
  protected showButton = signal(false);

  hideSplashScreen = output<boolean>();

  ngAfterViewInit() {
    const speed = 40;
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
          },
        );
      },
    );
  }

  protected onSubmit() {
    this.hideSplashScreen.emit(true);
  }
}
