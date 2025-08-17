import { Component, inject, output, signal } from "@angular/core";
import { SettingsService } from "../../services/settings-service";
import { PersistenceService } from "../../services/persistence-service";
import { TranslatePipe } from "@ngx-translate/core";
import { UpperCasePipe } from "@angular/common";
import { THEME_OPTIONS } from "../../lib/config";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-settings",
  imports: [TranslatePipe, UpperCasePipe, FormsModule],
  templateUrl: "./settings.html",
  styleUrl: "./settings.css",
})
export class Settings {
  #settingsService = inject(SettingsService);
  #persistenceService = inject(PersistenceService);
  toggleSettings = output<boolean>();

  protected appVersion = this.#settingsService.appVersion;
  protected typewriterSpeed = this.#settingsService.typewriterSpeed;
  protected soundsEnabled = this.#settingsService.soundsEnabled;
  protected isRestarting = signal(false);

  protected themeOptions = THEME_OPTIONS;
  protected currentTheme = signal<string>(
    document.documentElement.getAttribute("data-theme") || "terminalGreen",
  );

  constructor() {
    const theme = this.#persistenceService.loadTheme();
    if (theme) this.currentTheme.set(theme);
  }

  protected closeSettings() {
    this.toggleSettings.emit(false);
  }

  protected onTypewriterSpeedChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.#settingsService.setTypewriterSpeed(parseInt(target.value));
  }

  protected onSoundsToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    this.#settingsService.setSoundsEnabled(target.checked);
  }

  protected onRestartGame() {
    if (!this.isRestarting()) return this.isRestarting.set(true);
    this.#persistenceService.clearAllDataAndRefresh();
  }

  protected onThemeChange(theme: string) {
    document.documentElement.setAttribute("data-theme", theme);
    this.currentTheme.set(theme);
    this.#persistenceService.saveTheme(theme);
  }
}
