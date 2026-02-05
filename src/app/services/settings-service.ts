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
  appVersion = environment.appVersion;

  constructor() {
    const savedSpeed = this.#persistenceService.loadTypewriterSpeed();
    if (savedSpeed) this.typewriterSpeed.set(savedSpeed);

    const soundsEnabledSaved = this.#persistenceService.loadSoundsEnabled();
    if (soundsEnabledSaved !== undefined)
      this.soundsEnabled.set(soundsEnabledSaved);
  }

  setTypewriterSpeed(speed: number) {
    this.typewriterSpeed.set(speed);
    this.#persistenceService.saveTypewriterSpeed(speed);
  }

  setSoundsEnabled(enabled: boolean) {
    this.soundsEnabled.set(enabled);
    this.#persistenceService.saveSoundsEnabled(enabled);
  }
}
