import { Injectable } from '@angular/core';
import { GameNode, PlayerData } from '../models/game-state';

@Injectable({
  providedIn: 'root',
})
export class PersistenceService {
  save(key: string, data: unknown) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  load(key: string) {
    const result = localStorage.getItem(key);
    if (result) return JSON.parse(result);
  }

  // TODO to expand with more player data (inventory, health, name, etc).
  savePlayerData(data: PlayerData) {
    this.save('player', data);
  }

  loadPlayerData(): PlayerData {
    return this.load('player');
  }

  saveDisplayState(data: string[]) {
    this.save('terminalDisplay', data);
  }

  loadDisplayState(): string[] {
    return this.load('terminalDisplay');
  }

  saveCurrentNode(node: GameNode) {
    this.save('currentNode', node);
  }

  loadCurrentNode(): GameNode {
    return this.load('currentNode');
  }

  clearAllDataAndRefresh() {
    localStorage.clear();
    location.reload();
  }
}
