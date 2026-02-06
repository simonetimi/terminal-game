import { inject, Injectable, signal } from "@angular/core";
import { CONFIG } from "../lib/config";
import { environment } from "@environments/environment";

import { PersistenceService } from "./persistence-service";

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  #persistenceService = inject(PersistenceService);

  typewriterSpeed = signal<number>(CONFIG.TYPEWRITER_SPEED);
  soundsEnabled = signal(true);
  scrollbarEnabled = signal(false);
  appVersion = environment.appVersion;

  constructor() {
    const settings = this.#persistenceService.loadSettings();

    if (settings.typewriterSpeed)
      this.typewriterSpeed.set(settings.typewriterSpeed);

    if (settings.soundsEnabled) this.soundsEnabled.set(settings.soundsEnabled);

    if (settings.scrollbarEnabled)
      this.scrollbarEnabled.set(settings.scrollbarEnabled);
  }

  setTypewriterSpeed(speed: number) {
    this.typewriterSpeed.set(speed);
    this.#persistenceService.updateSettings({ typewriterSpeed: speed });
  }

  setSoundsEnabled(enabled: boolean) {
    this.soundsEnabled.set(enabled);
    this.#persistenceService.updateSettings({ soundsEnabled: enabled });
  }

  setScrollbarEnabled(enabled: boolean) {
    this.scrollbarEnabled.set(enabled);
    this.#persistenceService.updateSettings({ scrollbarEnabled: enabled });
  }
}
