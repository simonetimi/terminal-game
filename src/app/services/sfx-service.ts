import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SfxService {
  #blipAudio = new Audio("assets/sounds/blip.wav");

  isSoundOn = signal(true);

  public AUDIO_MAP: Record<string, HTMLAudioElement> = {
    blip: this.#blipAudio,
  };

  constructor() {
    for (const audio in this.AUDIO_MAP) {
      const audioElement = this.AUDIO_MAP[audio];
      audioElement.load();
      audioElement.volume = 0.6;
    }
  }

  playAudio(key: string) {
    if (!this.isSoundOn()) return;
    const audio = this.AUDIO_MAP[key];
    audio.currentTime = 0;
    audio.play();
  }
}
