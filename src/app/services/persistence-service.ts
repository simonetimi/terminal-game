import { Injectable } from "@angular/core";
import { SavedPlayerData } from "../models/game-state";

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

  saveChoiceHistory(history: string[]) {
    this.save("choiceHistory", history);
  }

  loadChoiceHistory(): string[] {
    return this.load("choiceHistory") ?? [];
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

  saveScrollbarEnabled(enabled: boolean) {
    this.save("scrollbarEnabled", enabled);
  }

  loadScrollbarEnabled(): boolean {
    return this.load("scrollbarEnabled");
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
    localStorage.removeItem("choiceHistory");
    location.reload();
  }
}
