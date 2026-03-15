import { Component, inject, output, signal } from "@angular/core";
import { SettingsService } from "../../services/settings-service";
import { TranslatePipe } from "@ngx-translate/core";
import { UpperCasePipe } from "@angular/common";
import { THEME_OPTIONS } from "../../lib/config";
import { FormsModule } from "@angular/forms";
import { PersistenceService } from "../../services/persistence-service";
import { LucideAngularModule } from "lucide-angular";

@Component({
  selector: "app-settings",
  imports: [TranslatePipe, UpperCasePipe, FormsModule, LucideAngularModule],
  templateUrl: "./settings.html",
  styleUrl: "./settings.css",
  host: {
    "(window:keydown)": "handleKeydown($event)",
    "(window:click)": "handleHostClick()",
  },
})
export class Settings {
  #settingsService = inject(SettingsService);
  #persistenceService = inject(PersistenceService);
  toggleSettings = output<boolean>();

  protected appVersion = this.#settingsService.appVersion;
  protected typewriterSpeed = this.#settingsService.typewriterSpeed;
  protected sfxEnabled = this.#settingsService.sfxEnabled;
  protected terminalBeepEnabled = this.#settingsService.terminalBeepEnabled;
  protected scrollbarEnabled = this.#settingsService.scrollbarEnabled;
  protected isRestarting = signal(false);
  protected saveFileImportFailed = signal(false);

  protected themeOptions = THEME_OPTIONS;
  protected theme = this.#settingsService.theme;

  protected onDownloadSaveFile() {
    this.saveFileImportFailed.set(false);

    const saveFile = this.#persistenceService.exportSaveFile();
    const saveFileJson = JSON.stringify(saveFile, null, 2);
    const blob = new Blob([saveFileJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `terminal-save-${saveFile.exportedAt.replaceAll(":", "-")}.json`;
    link.click();

    queueMicrotask(() => URL.revokeObjectURL(url));
  }

  protected async onSaveFileSelected(event: Event) {
    this.saveFileImportFailed.set(false);

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    try {
      const content = await file.text();
      const saveFile = JSON.parse(content) as unknown;
      const imported = this.#persistenceService.importSaveFile(saveFile);

      if (!imported) {
        this.saveFileImportFailed.set(true);
        return;
      }

      location.reload();
    } catch {
      this.saveFileImportFailed.set(true);
    } finally {
      input.value = "";
    }
  }

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

  protected onRestartGame($event: MouseEvent) {
    $event.stopPropagation();
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

  protected handleHostClick() {
    this.isRestarting.set(false);
  }
}
