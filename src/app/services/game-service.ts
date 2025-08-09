import { inject, Injectable, signal } from '@angular/core';
import { typewriter } from '../utils/typewriter';

// TODO this will be inside, not in the assets
import gameData from '../game-data/data.json';
import { GameNode } from '../models/game-state';
import { strip } from '../utils/strings';
import { PersistenceService } from './persistence-service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  #translateService = inject(TranslateService);
  #persistenceService = inject(PersistenceService);

  playerName = signal('anonymous');
  displayItems = signal<string[]>([]);

  isSystemWriting = signal(false);
  isExiting = signal(false);

  skipAnimation = () => {};

  currentNode = signal<GameNode>({} as GameNode);

  constructor() {
    window.addEventListener('keydown', (event) => {
      if (
        (event.key === 'Enter' || event.key === ' ') &&
        this.isSystemWriting()
      ) {
        this.skipAnimation();
      }
    });

    const savedNode = this.#persistenceService.loadCurrentNode();
    const savedDisplay = this.#persistenceService.loadDisplayState();
    const savedPlayerData = this.#persistenceService.loadPlayerData();

    if (savedNode) {
      this.currentNode.set(savedNode);
      this.displayItems.set(savedDisplay);
      this.playerName.set(savedPlayerData.name);
    } else {
      this.setCurrentNode(gameData.nodes[0]);
    }
  }

  setCurrentNode(node: GameNode) {
    this.currentNode.set(node);
    this.writeOnScreen(node.text, () => {
      const choices = node.choices
        .map((choice, idx) =>
          node.freeInput ? '> ' + choice.text : `${idx + 1}. ${choice.text}`,
        )
        .reverse();
      this.displayItems.update((items) => [...choices, ...items]);
      this.#persistenceService.saveDisplayState(this.displayItems());
    });
    this.#persistenceService.saveCurrentNode(node);
  }

  writeOnScreen(text: string, callback?: () => void) {
    this.isSystemWriting.set(true);
    this.skipAnimation = typewriter(
      this.displayItems,
      text,
      { speed: 60 },
      () => {
        this.isSystemWriting.set(false);
        if (callback) callback();
      },
    );
  }

  sendUserInput(input: string) {
    const cleanInput = strip(input).trim();
    if (!cleanInput) return;

    // setting name - game start
    if (this.currentNode().id === 'welcome') {
      const name = cleanInput.slice(0, 20);
      const nextNodeId = this.currentNode().choices[0].nextNodeId;
      this.setCurrentNode(this.findNode(nextNodeId));
      this.#persistenceService.savePlayerData({ name });
      return this.playerName.set(name);
    }

    if (this.isExiting()) {
      const confirm = this.#translateService.instant('commands.yes');
      if (confirm.keys.includes(cleanInput.toLowerCase())) {
        return this.#persistenceService.clearAllDataAndRefresh();
      } else {
        this.displayItems.update((items) => items.slice(1));
        return this.isExiting.set(false);
      }
    }

    const exit = this.#translateService.instant('commands.exit');
    if (exit.keys.includes(cleanInput.toLowerCase())) {
      this.isExiting.set(true);
      return this.displayItems.update((items) => [exit.text, ...items]);
    }

    // parse number for the choice. if input is not a number, return
    const choice = parseInt(cleanInput);
    if (isNaN(choice)) return;

    const availableChoices = this.currentNode().choices;
    if (choice > availableChoices.length || choice < 1) return;

    this.setCurrentNode(this.findNode(availableChoices[choice - 1].nextNodeId));
  }

  findNode(nodeId: string) {
    return gameData.nodes.find((node) => node.id === nodeId)!;
  }
}
