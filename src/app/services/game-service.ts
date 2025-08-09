import { effect, inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { typewriter } from '../utils/typewriter';

// TODO this will be inside, not in the assets
import gameData from '../../../public/assets/i18n/it.json';
import { GameNode } from '../models/game-state';
import { strip } from '../utils/strings';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  #translateService = inject(TranslateService);

  playerName = signal('anonymous');
  displayItems = signal<string[]>([]);

  isSystemWriting = signal(false);

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
    this.setCurrentNode(gameData.nodes[0]);
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
    });
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
      return this.playerName.set(name);
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
