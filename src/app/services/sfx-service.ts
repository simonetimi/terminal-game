import { inject, Injectable } from "@angular/core";
import { SettingsService } from "./settings-service";
import { Sfx } from "../models/game-state";

@Injectable({
  providedIn: "root",
})
export class SfxService {
  #settingsService = inject(SettingsService);
  #path = "assets/sounds/";
  #ext = ".wav";

  #sounds: Sfx[] = ["blip", "win", "lose", "hurt"];

  public AUDIO_MAP: Record<string, HTMLAudioElement> = {};

  constructor() {
    for (const sound of this.#sounds) {
      const audioElement = new Audio(this.#path + sound + this.#ext);
      audioElement.load();
      audioElement.volume = 0.6;
      this.AUDIO_MAP[sound] = audioElement;
    }
  }

  playAudio(key: string) {
    if (!this.#settingsService.soundsEnabled()) return;
    const audio = this.AUDIO_MAP[key];
    audio.currentTime = 0;
    audio.play();
  }
}
