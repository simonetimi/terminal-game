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

  #encode(data: unknown) {
    const json = JSON.stringify(data);
    return btoa(json);
  }

  #decode(encoded: string) {
    const json = atob(encoded);
    return JSON.parse(json);
  }

  save(key: string, data: unknown) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  load(key: string) {
    const result = localStorage.getItem(key);
    if (!result) return;
    return JSON.parse(result);
  }

  saveEncoded(key: string, data: unknown) {
    localStorage.setItem(key, this.#encode(data));
  }

  loadEncoded(key: string) {
    const result = localStorage.getItem(key);
    if (!result) return;
    return this.#decode(result);
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
    this.saveEncoded(STORAGE_KEYS.player, data);
  }

  loadPlayerData(): SavedPlayerData {
    return this.loadEncoded(STORAGE_KEYS.player);
  }

  saveVisitedNodes(nodeIds: string[]) {
    this.saveEncoded(STORAGE_KEYS.visitedNodes, nodeIds);
  }

  loadVisitedNodes(): string[] {
    return this.loadEncoded(STORAGE_KEYS.visitedNodes);
  }

  saveCurrentNodeId(nodeId: string) {
    this.saveEncoded(STORAGE_KEYS.currentNode, nodeId);
  }

  loadCurrentNodeId(): string {
    return this.loadEncoded(STORAGE_KEYS.currentNode);
  }

  saveFreeInputsHistory(freeInputsHistory: string[]) {
    this.saveEncoded(STORAGE_KEYS.freeInputsHistory, freeInputsHistory);
  }

  loadFreeInputsHistory(): string[] {
    return this.loadEncoded(STORAGE_KEYS.freeInputsHistory);
  }

  saveChoiceHistory(history: string[]) {
    this.saveEncoded(STORAGE_KEYS.choiceHistory, history);
  }

  loadChoiceHistory(): string[] {
    return this.loadEncoded(STORAGE_KEYS.choiceHistory) ?? [];
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
