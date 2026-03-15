import { Injectable } from "@angular/core";
import { SavedPlayerData } from "../models/game-state";
import { STORAGE_KEYS } from "../lib/constants";

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

const MANAGED_STORAGE_KEYS = Object.values(STORAGE_KEYS) as StorageKey[];
const GAME_STORAGE_KEYS = MANAGED_STORAGE_KEYS.filter(
  (key) => key !== STORAGE_KEYS.settings,
) as Exclude<StorageKey, typeof STORAGE_KEYS.settings>[];

export interface PersistedSettings {
  typewriterSpeed: number;
  sfxEnabled: boolean;
  terminalBeepEnabled: boolean;
  scrollbarEnabled: boolean;
  theme: string;
}

export interface SaveFileData {
  version: number;
  exportedAt: string;
  data: Partial<Record<StorageKey, string>>;
}

@Injectable({
  providedIn: "root",
})
export class PersistenceService {
  static readonly SETTINGS_KEY = STORAGE_KEYS.settings;

  readonly #SAVE_FILE_SCHEMA_VERSION = 1; // change when making breaking changes to the save file format

  #encode(data: unknown) {
    const json = JSON.stringify(data);
    return btoa(json);
  }

  #decode(encoded: string) {
    const json = atob(encoded);
    return JSON.parse(json);
  }

  #safeParse(json: string) {
    try {
      return JSON.parse(json);
    } catch {
      return undefined;
    }
  }

  #safeDecode(encoded: string) {
    try {
      return this.#decode(encoded);
    } catch {
      return undefined;
    }
  }

  #isImportedValueValid(key: StorageKey, value: string) {
    if (key === STORAGE_KEYS.settings) {
      return this.#safeParse(value) !== undefined;
    }

    return this.#safeDecode(value) !== undefined;
  }

  #isSaveFileData(value: unknown): value is SaveFileData {
    if (!value || typeof value !== "object") return false;

    const candidate = value as Partial<SaveFileData>;

    if (candidate.version !== this.#SAVE_FILE_SCHEMA_VERSION) return false;
    if (typeof candidate.exportedAt !== "string") return false;
    if (!candidate.data || typeof candidate.data !== "object") return false;
    if (Array.isArray(candidate.data)) return false;

    return Object.entries(candidate.data).every(
      ([key, storedValue]) =>
        MANAGED_STORAGE_KEYS.includes(key as StorageKey) &&
        typeof storedValue === "string",
    );
  }

  clearGameData() {
    for (const key of GAME_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
  }

  save(key: string, data: unknown) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  load(key: string) {
    const result = localStorage.getItem(key);
    if (!result) return;

    const parsed = this.#safeParse(result);
    if (parsed === undefined) {
      localStorage.removeItem(key);
    }

    return parsed;
  }

  saveEncoded(key: string, data: unknown) {
    localStorage.setItem(key, this.#encode(data));
  }

  loadEncoded(key: string) {
    const result = localStorage.getItem(key);
    if (!result) return;

    const decoded = this.#safeDecode(result);
    if (decoded === undefined) {
      this.clearGameData();
    }

    return decoded;
  }

  loadSettings(): PersistedSettings | undefined {
    const value = this.load(PersistenceService.SETTINGS_KEY);
    if (!value || typeof value !== "object") return;
    return value as PersistedSettings;
  }

  exportSaveFile(): SaveFileData {
    const data = MANAGED_STORAGE_KEYS.reduce<
      Partial<Record<StorageKey, string>>
    >((accumulator, key) => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        accumulator[key] = value;
      }
      return accumulator;
    }, {});

    return {
      version: this.#SAVE_FILE_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      data,
    };
  }

  importSaveFile(saveFile: unknown) {
    if (!this.#isSaveFileData(saveFile)) return false;

    for (const key of MANAGED_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }

    const settingsValue = saveFile.data[STORAGE_KEYS.settings];
    if (
      typeof settingsValue === "string" &&
      this.#isImportedValueValid(STORAGE_KEYS.settings, settingsValue)
    ) {
      localStorage.setItem(STORAGE_KEYS.settings, settingsValue);
    }

    const hasCorruptedGameData = GAME_STORAGE_KEYS.some((key) => {
      const value = saveFile.data[key];

      return (
        typeof value === "string" && !this.#isImportedValueValid(key, value)
      );
    });

    if (hasCorruptedGameData) {
      this.clearGameData();
      return true;
    }

    for (const key of GAME_STORAGE_KEYS) {
      const value = saveFile.data[key];
      if (typeof value === "string") {
        localStorage.setItem(key, value);
      }
    }

    return true;
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
