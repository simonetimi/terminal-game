import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { GameService } from '../../services/game-service';

@Component({
  selector: 'app-display-area',
  imports: [],
  templateUrl: './display-area.html',
  styleUrl: './display-area.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayArea {
  #gameService = inject(GameService);

  protected scrollContainer = viewChild<ElementRef>('scrollContainer');

  protected displayItems = this.#gameService.displayItems;

  constructor() {
    effect(() => {
      this.displayItems();
      const container = this.scrollContainer()?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }
}
