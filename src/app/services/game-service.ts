import { inject, Injectable, signal } from '@angular/core';
import { typewriter } from '../utils/typewriter';

import gameData from '../game-data/data.json';
import { GameNode, PlayerData } from '../models/game-state';
import { strip } from '../utils/strings';
import { PersistenceService } from './persistence-service';
import { TranslateService } from '@ngx-translate/core';
import { AudioService } from './audio-service';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  #translateService = inject(TranslateService);
  #persistenceService = inject(PersistenceService);
  #audioService = inject(AudioService);

  playerState = signal<PlayerData>({
    name: 'anonymous',
    health: 3,
  });
  displayItems = signal<string[]>([]);

  isSystemWriting = signal(false);
  isUserQuitting = signal(false);

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

    const savedNodeId = this.#persistenceService.loadCurrentNodeId();
    const savedDisplay = this.#persistenceService.loadDisplayState();
    const savedPlayerData = this.#persistenceService.loadPlayerData();

    if (savedNodeId && savedDisplay && savedPlayerData) {
      const savedNode = this.findNode(savedNodeId);
      this.displayItems.set(savedDisplay);
      this.playerState.set(savedPlayerData);
      this.setCurrentNode(savedNode);
    } else {
      this.setCurrentNode(gameData.nodes[0]);
    }
  }

  setCurrentNode(node: GameNode) {
    // save the current state
    this.#persistenceService.saveCurrentNodeId(node.id);
    this.#persistenceService.saveDisplayState(this.displayItems());

    this.currentNode.set(node);
    this.writeOnScreen(node.text, () => {
      const choices = this.renderChoices(node);
      this.displayItems.update((items) => [...choices, ...items]);
    });
  }

  writeOnScreen(text: string, callback?: () => void) {
    this.isSystemWriting.set(true);
    this.#audioService.playAudio('blip');
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

      this.playerState.update((playerState) => ({ ...playerState, name }));
      return this.#persistenceService.savePlayerData(this.playerState());
    }

    if (this.isUserQuitting()) {
      const confirm = this.#translateService.instant('commands.yes');
      if (confirm.keys.includes(cleanInput.toLowerCase())) {
        return this.#persistenceService.clearAllDataAndRefresh();
      } else {
        this.displayItems.update((items) => items.slice(1));
        return this.isUserQuitting.set(false);
      }
    }
    const exit = this.#translateService.instant('commands.exit');
    if (exit.keys.includes(cleanInput.toLowerCase())) {
      this.isUserQuitting.set(true);
      return this.displayItems.update((items) => [exit.text, ...items]);
    }

    // parse number for the choice
    const choice = parseInt(cleanInput);
    if (isNaN(choice)) return;

    const availableChoices = this.currentNode().choices;
    if (choice > availableChoices.length || choice < 1) return;

    this.setCurrentNode(this.findNode(availableChoices[choice - 1].nextNodeId));
  }

  findNode(nodeId: string) {
    return gameData.nodes.find((node) => node.id === nodeId)!;
  }

  renderChoices(node: GameNode) {
    return node.choices
      .map((choice, idx) =>
        node.freeInput ? '> ' + choice.text : `${idx + 1}. ${choice.text}`,
      )
      .reverse();
  }
}
