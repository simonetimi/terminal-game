import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { GameService } from '../../services/game-service';

@Component({
  selector: 'app-player-status',
  templateUrl: './player-status.html',
  styleUrl: './player-status.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerStatus {
  #gameService = inject(GameService);

  protected playerHearts = computed(() => {
    const hearts = this.#gameService.playerState().health;
    return Array.from({ length: hearts }, (_, i) => i + 1);
  });
}
