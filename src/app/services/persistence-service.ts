import { Injectable } from "@angular/core";
import { SavedPlayerData } from "../models/game-state";

export interface PersistedSettings {
  typewriterSpeed: number;
  sfxEnabled: boolean;
  terminalBeepEnabled: boolean;
  scrollbarEnabled: boolean;
  theme: string;
}

@Injectable({
  providedIn: "root",
})
export class PersistenceService {
  static readonly SETTINGS_KEY = "settings";

  save(key: string, data: unknown) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  load(key: string) {
    const result = localStorage.getItem(key);
    if (!result) return;
    return JSON.parse(result);
  }

  loadSettings(): PersistedSettings | undefined {
    const value = this.load(PersistenceService.SETTINGS_KEY);
    if (!value || typeof value !== "object") return;
    return value as PersistedSettings;
  }

  saveSettings(settings: PersistedSettings) {
    this.save(PersistenceService.SETTINGS_KEY, settings);
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

  saveChoiceHistory(history: string[]) {
    this.save("choiceHistory", history);
  }

  loadChoiceHistory(): string[] {
    return this.load("choiceHistory") ?? [];
  }

  clearAllDataAndRefresh() {
    localStorage.removeItem("player");
    localStorage.removeItem("visitedNodes");
    localStorage.removeItem("currentNode");
    localStorage.removeItem("freeInputsHistory");
    localStorage.removeItem("choiceHistory");
    localStorage.removeItem(PersistenceService.SETTINGS_KEY);
    location.reload();
  }
}
