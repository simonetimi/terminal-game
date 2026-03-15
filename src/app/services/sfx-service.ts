import { inject, Injectable } from "@angular/core";
import { SettingsService } from "./settings-service";
import { Sfx } from "../models/game-state";
import { ASSET_PATHS, AUDIO_CONFIG, SFX_KEYS } from "../lib/constants";

@Injectable({
  providedIn: "root",
})
export class SfxService {
  #settingsService = inject(SettingsService);
  #sounds: Sfx[] = Object.values(SFX_KEYS);

  public readonly AUDIO_MAP = {} as Record<Sfx, HTMLAudioElement>;

  constructor() {
    for (const sound of this.#sounds) {
      const audioElement = new Audio(
        ASSET_PATHS.soundsBase + sound + AUDIO_CONFIG.sfxExtension,
      );
      audioElement.load();
      audioElement.volume = AUDIO_CONFIG.defaultSfxVolume;
      this.AUDIO_MAP[sound] = audioElement;
    }
  }

  playAudio(key: Sfx) {
    if (key === SFX_KEYS.blip && !this.#settingsService.terminalBeepEnabled())
      return;
    if (!this.#settingsService.sfxEnabled()) return;

    const audio = this.AUDIO_MAP[key];
    audio.currentTime = 0;
    audio.play();
  }
}
