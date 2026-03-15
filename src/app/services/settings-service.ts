import { computed, inject, Injectable, signal } from "@angular/core";
import { DEFAULT_SETTINGS, DEFAULT_THEME } from "../lib/config";
import { environment } from "@environments/environment";
import { DOM_ATTRIBUTES } from "../lib/constants";

import { PersistenceService } from "./persistence-service";

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  #persistenceService = inject(PersistenceService);

  #settings = signal<{
    typewriterSpeed: number;
    sfxEnabled: boolean;
    terminalBeepEnabled: boolean;
    scrollbarEnabled: boolean;
    theme: string;
  }>(DEFAULT_SETTINGS);

  readonly typewriterSpeed = computed(() => this.#settings().typewriterSpeed);
  readonly sfxEnabled = computed(() => this.#settings().sfxEnabled);
  readonly terminalBeepEnabled = computed(
    () => this.#settings().terminalBeepEnabled,
  );
  readonly scrollbarEnabled = computed(() => this.#settings().scrollbarEnabled);
  readonly theme = computed(() => this.#settings().theme);

  appVersion = environment.appVersion;

  constructor() {
    const saved = this.#persistenceService.loadSettings();
    if (saved) {
      this.#settings.set(saved);
    }

    document.documentElement.setAttribute(
      DOM_ATTRIBUTES.theme,
      this.#settings().theme,
    );
  }

  setTypewriterSpeed(speed: number) {
    this.#settings.update((current) => ({
      ...current,
      typewriterSpeed: speed,
    }));
    this.#persistenceService.saveSettings(this.#settings());
  }

  setSfx(enabled: boolean) {
    this.#settings.update((current) => ({ ...current, sfxEnabled: enabled }));
    this.#persistenceService.saveSettings(this.#settings());
  }

  setTerminalBeep(enabled: boolean) {
    this.#settings.update((current) => ({
      ...current,
      terminalBeepEnabled: enabled,
    }));
    this.#persistenceService.saveSettings(this.#settings());
  }

  setScrollbar(enabled: boolean) {
    this.#settings.update((current) => ({
      ...current,
      scrollbarEnabled: enabled,
    }));
    this.#persistenceService.saveSettings(this.#settings());
  }

  setTheme(theme: string) {
    this.#settings.update((current) => ({
      ...current,
      theme,
    }));
    document.documentElement.setAttribute(DOM_ATTRIBUTES.theme, theme);
    this.#persistenceService.saveSettings(this.#settings());
  }

  restoreDefaults() {
    this.#settings.set(DEFAULT_SETTINGS);
    document.documentElement.setAttribute(DOM_ATTRIBUTES.theme, DEFAULT_THEME);
    this.#persistenceService.clearSettings();
  }

  restartGame() {
    this.#persistenceService.clearAllDataAndRefresh();
  }
}
