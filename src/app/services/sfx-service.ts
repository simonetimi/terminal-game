import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SfxService {
  #path = "assets/sounds/";
  #ext = ".wav";

  isSoundOn = signal(true);

  #sounds = ["blip", "win", "lose"];

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
    if (!this.isSoundOn()) return;
    const audio = this.AUDIO_MAP[key];
    audio.currentTime = 0;
    audio.play();
  }
}
