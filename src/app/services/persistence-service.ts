import { Injectable } from "@angular/core";
import { GameNode, PlayerData, SavedPlayerData } from "../models/game-state";

@Injectable({
  providedIn: "root",
})
export class PersistenceService {
  save(key: string, data: unknown) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  load(key: string) {
    const result = localStorage.getItem(key);
    if (result) return JSON.parse(result);
  }

  savePlayerData(data: SavedPlayerData) {
    this.save("player", data);
  }

  loadPlayerData(): SavedPlayerData {
    return this.load("player");
  }

  saveVisitedNodes(nodeIds: string[]) {
    this.save("visitedNodes", nodeIds);
  }

  loadVisitedNodes(): string[] {
    return this.load("visitedNodes");
  }

  saveCurrentNodeId(nodeId: string) {
    this.save("currentNode", nodeId);
  }

  loadCurrentNodeId(): string {
    return this.load("currentNode");
  }

  saveFreeInputsHistory(freeInputsHistory: string[]) {
    this.save("freeInputsHistory", freeInputsHistory);
  }

  loadFreeInputsHistory(): string[] {
    return this.load("freeInputsHistory");
  }

  saveTypewriterSpeed(speed: number) {
    this.save("typewriterSpeed", speed);
  }

  loadTypewriterSpeed(): number {
    return this.load("typewriterSpeed");
  }

  saveSoundsEnabled(enabled: boolean) {
    this.save("soundsEnabled", enabled);
  }

  loadSoundsEnabled(): boolean {
    return this.load("soundsEnabled");
  }

  saveTheme(theme: string) {
    this.save("theme", theme);
  }

  loadTheme(): string {
    return this.load("theme");
  }

  clearAllDataAndRefresh() {
    localStorage.removeItem("player");
    localStorage.removeItem("visitedNodes");
    localStorage.removeItem("currentNode");
    localStorage.removeItem("freeInputsHistory");
    location.reload();
  }
}
