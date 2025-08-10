import { Injectable, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioService implements OnInit {
  #blipAudio = new Audio('assets/sounds/blip.wav');

  public AUDIO_MAP: Record<string, HTMLAudioElement> = {
    blip: this.#blipAudio,
  };

  ngOnInit() {
    for (const audio in this.AUDIO_MAP) {
      const audioElement = this.AUDIO_MAP[audio];
      audioElement.load();
      audioElement.volume = 0.5;
    }
  }

  playAudio(key: string) {
    const audio = this.AUDIO_MAP[key];
    audio.currentTime = 0;
    audio.play();
  }
}
