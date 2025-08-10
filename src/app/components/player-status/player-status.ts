import { Component, computed, inject } from '@angular/core';
import { GameService } from '../../services/game-service';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-player-status',
  imports: [NgOptimizedImage],
  templateUrl: './player-status.html',
  styleUrl: './player-status.css',
})
export class PlayerStatus {
  #gameService = inject(GameService);

  protected playerHearts = computed(() => {
    const hearts = this.#gameService.playerHealth();
    return Array.from({ length: hearts }, (_, i) => i + 1);
  });
}
