import { Injectable } from "@angular/core";
import { SavedPlayerData } from "../models/game-state";
import { STORAGE_KEYS } from "../lib/constants";

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
  static readonly SETTINGS_KEY = STORAGE_KEYS.settings;

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
    this.save(STORAGE_KEYS.player, data);
  }

  loadPlayerData(): SavedPlayerData {
    return this.load(STORAGE_KEYS.player);
  }

  saveVisitedNodes(nodeIds: string[]) {
    this.save(STORAGE_KEYS.visitedNodes, nodeIds);
  }

  loadVisitedNodes(): string[] {
    return this.load(STORAGE_KEYS.visitedNodes);
  }

  saveCurrentNodeId(nodeId: string) {
    this.save(STORAGE_KEYS.currentNode, nodeId);
  }

  loadCurrentNodeId(): string {
    return this.load(STORAGE_KEYS.currentNode);
  }

  saveFreeInputsHistory(freeInputsHistory: string[]) {
    this.save(STORAGE_KEYS.freeInputsHistory, freeInputsHistory);
  }

  loadFreeInputsHistory(): string[] {
    return this.load(STORAGE_KEYS.freeInputsHistory);
  }

  saveChoiceHistory(history: string[]) {
    this.save(STORAGE_KEYS.choiceHistory, history);
  }

  loadChoiceHistory(): string[] {
    return this.load(STORAGE_KEYS.choiceHistory) ?? [];
  }

  clearAllDataAndRefresh() {
    localStorage.removeItem(STORAGE_KEYS.player);
    localStorage.removeItem(STORAGE_KEYS.visitedNodes);
    localStorage.removeItem(STORAGE_KEYS.currentNode);
    localStorage.removeItem(STORAGE_KEYS.freeInputsHistory);
    localStorage.removeItem(STORAGE_KEYS.choiceHistory);
    location.reload();
  }

  clearSettings() {
    localStorage.removeItem(PersistenceService.SETTINGS_KEY);
  }
}
