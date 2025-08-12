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

  savePlayerData(data: PlayerData) {
    this.save('player', data);
  }

  loadPlayerData(): PlayerData {
    return this.load('player');
  }

  saveVisitedNodes(nodeIds: string[]) {
    this.save('visitedNodes', nodeIds);
  }

  loadVisitedNodes(): string[] {
    return this.load('visitedNodes');
  }

  saveCurrentNodeId(nodeId: string) {
    this.save('currentNode', nodeId);
  }

  loadCurrentNodeId(): string {
    return this.load('currentNode');
  }

  clearAllDataAndRefresh() {
    localStorage.clear();
    location.reload();
  }
}
