import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { typewriter } from '../utils/typewriter';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  #translateService = inject(TranslateService);

  playerName = signal('anonymous');
  displayItems = signal<string[]>([]);

  isSystemWriting = signal(false);

  skipAnimation = () => {};

  constructor() {
    window.addEventListener('keydown', (event) => {
      if (
        (event.key === 'Enter' || event.key === ' ') &&
        this.isSystemWriting()
      ) {
        this.skipAnimation();
      }
    });
  }

  sendUserInput(input: string) {
    this.isSystemWriting.set(true);
    this.skipAnimation = typewriter(
      this.displayItems,
      input,
      { speed: 40 },
      () => {
        this.isSystemWriting.set(false);
      },
    );
  }
}
