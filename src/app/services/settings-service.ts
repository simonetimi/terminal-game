import { inject, Injectable, signal } from "@angular/core";
import { CONFIG } from "../lib/config";

import { version } from "../../../package.json";

import { PersistenceService } from "./persistence-service";

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  #persistenceService = inject(PersistenceService);

  typewriterSpeed = signal<number>(CONFIG.TYPEWRITER_SPEED);
  soundsEnabled = signal(true);
  appVersion = version;

  constructor() {
    const savedSpeed = this.#persistenceService.loadTypewriterSpeed();
    if (savedSpeed) this.typewriterSpeed.set(savedSpeed);

    const soundsEnabledSaved = this.#persistenceService.loadSoundsEnabled();
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
