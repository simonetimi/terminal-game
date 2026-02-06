import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { DisplayArea } from "./components/display-area/display-area";
import { InputArea } from "./components/input-area/input-area";
import { PlayerStatus } from "./components/player-status/player-status";
import { SplashScreen } from "./components/splash-screen/splash-screen";
import { TranslateService } from "@ngx-translate/core";
import { Title } from "@angular/platform-browser";
import { Settings } from "./components/settings/settings";
import { PersistenceService } from "./services/persistence-service";

@Component({
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.css",
  imports: [DisplayArea, InputArea, PlayerStatus, SplashScreen, Settings],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  #translateService = inject(TranslateService);
  #persistenceService = inject(PersistenceService);
  #titleService = inject(Title);
  protected hideSplashScreen = signal(false);
  protected showSettingsModal = signal(false);

  ngOnInit() {
    this.#titleService.setTitle(this.#translateService.instant("app.title"));
    const theme = this.#persistenceService.loadSettings().theme;
    if (theme) document.documentElement.setAttribute("data-theme", theme);
  }

  toggleSplashScreen($event: boolean) {
    this.hideSplashScreen.set($event);
  }

  toggleSettingsModal($event: boolean) {
    this.showSettingsModal.set($event);
  }
}
