import { Component, inject, output, signal } from "@angular/core";
import { SettingsService } from "../../services/settings-service";
import { TranslatePipe } from "@ngx-translate/core";
import { UpperCasePipe } from "@angular/common";
import { THEME_OPTIONS } from "../../lib/config";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-settings",
  imports: [TranslatePipe, UpperCasePipe, FormsModule],
  templateUrl: "./settings.html",
  styleUrl: "./settings.css",
  host: {
    "(window:keydown)": "handleKeydown($event)",
  },
})
export class Settings {
  #settingsService = inject(SettingsService);
  toggleSettings = output<boolean>();

  protected appVersion = this.#settingsService.appVersion;
  protected typewriterSpeed = this.#settingsService.typewriterSpeed;
  protected sfxEnabled = this.#settingsService.sfxEnabled;
  protected terminalBeepEnabled = this.#settingsService.terminalBeepEnabled;
  protected scrollbarEnabled = this.#settingsService.scrollbarEnabled;
  protected isRestarting = signal(false);

  protected themeOptions = THEME_OPTIONS;
  protected theme = this.#settingsService.theme;

  protected closeSettings() {
    this.toggleSettings.emit(false);
  }

  protected onTypewriterSpeedChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.#settingsService.setTypewriterSpeed(parseInt(target.value));
  }

  protected onSfxToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    this.#settingsService.setSfx(target.checked);
  }

  protected onTerminalBeepToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    this.#settingsService.setTerminalBeep(target.checked);
  }

  protected onScrollbarToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    this.#settingsService.setScrollbar(target.checked);
  }

  protected onRestartGame() {
    if (!this.isRestarting()) return this.isRestarting.set(true);
    this.#settingsService.restartGame();
  }

  protected onResetSettings() {
    this.#settingsService.restoreDefaults();
  }

  protected onThemeChange(theme: string) {
    this.#settingsService.setTheme(theme);
  }

  protected handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      this.closeSettings();
    }
  }
}
