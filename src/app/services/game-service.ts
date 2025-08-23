import { inject, Injectable, signal } from "@angular/core";
import { typewriter } from "../utils/typewriter";

import gameData from "../game-data/data.json";
import {
  Choice,
  Effect,
  GameNode,
  PlayerData,
  SPECIAL_NODES,
} from "../models/game-state";
import { strip } from "../utils/strings";
import { PersistenceService } from "./persistence-service";
import { TranslateService } from "@ngx-translate/core";
import { EffectsManagerService } from "./effects-manager-service";
import { CONFIG, DEFAULT_PLAYER_DATA } from "../lib/config";
import { SettingsService } from "./settings-service";
import Fuse from "fuse.js";

@Injectable({
  providedIn: "root",
})
export class GameService {
  #persistenceService = inject(PersistenceService);
  #effectsManagerService = inject(EffectsManagerService);
  #settingsService = inject(SettingsService);
  #translateService = inject(TranslateService);

  nodes = gameData.nodes as GameNode[];

  playerState = signal<PlayerData>(DEFAULT_PLAYER_DATA);
  displayItems = signal<string[]>([]);
  visitedNodes: string[] = [];
  freeInputsHistory: string[] = [];

  isSystemWriting = signal(false);

  skipAnimation = () => {};

  currentNode = signal<GameNode>({} as GameNode);

  constructor() {
    window.addEventListener("keydown", (event) => {
      if (
        (event.key === "Enter" || event.key === " ") &&
        this.isSystemWriting()
      ) {
        this.skipAnimation();
      }
    });

    const loadPlayerData = this.#persistenceService.loadPlayerData();
    if (loadPlayerData)
      this.playerState.update((prev) => ({
        ...prev,
        name: loadPlayerData.name,
      }));

    this.freeInputsHistory =
      this.#persistenceService.loadFreeInputsHistory() ?? [];

    const savedNodeId = this.#persistenceService.loadCurrentNodeId();
    const savedVisitedNodes = this.#persistenceService.loadVisitedNodes();

    if (savedNodeId && savedVisitedNodes) {
      // restore visited nodes
      this.visitedNodes = savedVisitedNodes;

      // reconstruct player state and display by traversing nodes
      this.traverseNodes(savedVisitedNodes);

      // show the last visited node (current) using setCurrentNode with record=false
      const lastNodeId = savedVisitedNodes[savedVisitedNodes.length - 1];
      const lastNode = this.findNode(lastNodeId);
      if (lastNode) {
        this.setCurrentNode(lastNode, { record: false });
      }
    } else {
      this.setCurrentNode(this.nodes[0]);
    }
  }

  setCurrentNode(node: GameNode, { record = true } = {}) {
    // save current state
    if (record) {
      this.visitedNodes.push(node.id);
      this.#persistenceService.saveVisitedNodes(this.visitedNodes);
      this.#persistenceService.saveCurrentNodeId(node.id);
    }

    this.currentNode.set(node);

    // add empty space between nodes
    this.displayItems().length > 0 &&
      this.displayItems.update((items) => [...items, "&nbsp;"]);

    // effects
    this.#effectsManagerService.clearEffects();
    requestAnimationFrame(() => {
      this.#effectsManagerService.playNodeEffects(node);
    });

    this.writeOnScreen(this.chooseTextToDisplay(node), () => {
      // handle auto-redirect nodes
      if (node.autoRedirectTo) {
        this.isSystemWriting.set(true);
        const delay =
          node.autoRedirectDelay ?? CONFIG.DEFAULT_AUTO_REDIRECT_DELAY;
        setTimeout(() => {
          const redirectNode = this.findNode(node.autoRedirectTo!);
          if (redirectNode) {
            this.setCurrentNode(redirectNode);
          }
        }, delay);
        return; // no choice to render
      }

      const choices = this.renderChoices(node);
      this.displayItems.update((items) => [...items, ...choices]);
    });
  }

  writeOnScreen(text: string, callback?: () => void) {
    this.isSystemWriting.set(true);
    this.skipAnimation = typewriter(
      this.displayItems,
      text,
      {
        speed: this.#settingsService.typewriterSpeed(),
        lineBreakDelay: CONFIG.NARRATION_BREAK_DELAY,
        effectsSelector: CONFIG.DEFAULT_SCREEN_SELECTOR,
      },
      () => {
        this.isSystemWriting.set(false);
        if (callback) callback();
      },
    );
  }

  sendUserInput(input: string) {
    if (this.currentNode().choices.length === 0) {
      // allow any input to restart at the end of the game
      return this.#persistenceService.clearAllDataAndRefresh();
    }

    const cleanInput = strip(input).trim();
    if (!cleanInput) return;

    // setting name - game start
    if (this.currentNode().id === SPECIAL_NODES.WELCOME) {
      const name = cleanInput.slice(0, 20);

      this.displayItems.update((items) => {
        const itemsWithoutPlaceholder = items.filter((item) => item !== ""); // remove empty placeholder
        return [...itemsWithoutPlaceholder, `> ${name}`];
      });
      this.freeInputsHistory.push(name);
      this.#persistenceService.saveFreeInputsHistory(this.freeInputsHistory);

      const nextNodeId = this.currentNode().choices[0].nextNodeId;
      this.setCurrentNode(this.findNode(nextNodeId));

      this.playerState.update((playerState) => ({ ...playerState, name }));
      return this.#persistenceService.savePlayerData({ name });
    }

    // if free input, the input will have to match the choice with the match keyword. if it doesn't, it picks the other choice
    if (this.currentNode().isFreeInput) {
      const slicedInput = cleanInput.slice(0, 30);

      this.displayItems.update((items) => {
        const itemsWithoutPlaceholder = items.filter((item) => item !== ""); // remove empty placeholder
        return [...itemsWithoutPlaceholder, `> ${slicedInput}`];
      });

      this.freeInputsHistory.push(slicedInput);
      this.#persistenceService.saveFreeInputsHistory(this.freeInputsHistory);

      const availableChoices = this.filterChoices(this.currentNode().choices);

      // set up fuzzy search
      const fuse = new Fuse(availableChoices, {
        keys: ["matchKeyword"],
        includeScore: true,
        ignoreLocation: true,
        threshold: 0.6,
        ignoreDiacritics: true,
      });

      const results = fuse.search(slicedInput.toLowerCase());
      const bestMatch = results.length > 0 ? results[0] : null;

      let matchedKeywordChoice: (typeof availableChoices)[number] | undefined;

      // use score and length to define a reasonable match
      if (bestMatch) {
        const { item, score } = bestMatch;

        // length-based completeness check
        const minLengthRatio = 0.8; // require at least 80% of keyword length
        const query = slicedInput.trim().toLowerCase();
        const keyword = item.matchKeyword?.toLowerCase() ?? "";

        const lengthRatio = query.length / keyword?.length;

        let isAcceptable;

        if (item.exactMatch) {
          isAcceptable = score === 0;
        } else {
          // only accept fuzzy matches if the query is long enough
          isAcceptable = lengthRatio >= minLengthRatio;
        }
        if (isAcceptable) {
          matchedKeywordChoice = item;
        }
      }

      if (matchedKeywordChoice) {
        return this.setCurrentNode(
          this.findNode(matchedKeywordChoice.nextNodeId),
        );
      }

      // if no exact match, find the fallback choice (one without matchKeyword)
      const fallbackChoice = availableChoices.find(
        (choice) => !choice.matchKeyword,
      );

      if (fallbackChoice) {
        return this.setCurrentNode(this.findNode(fallbackChoice.nextNodeId));
      }
    }

    // parse number for the choice
    const choiceNumber = parseInt(cleanInput);
    if (isNaN(choiceNumber)) return;

    const availableChoices = this.filterChoices(this.currentNode().choices);
    if (choiceNumber > availableChoices.length || choiceNumber < 1) return;

    const choice = availableChoices[choiceNumber - 1];

    // replace the numbered choices with the selected choice
    const choicesCount = availableChoices.length;
    this.displayItems.update((items) => {
      const itemsWithoutChoices = items.slice(0, -choicesCount);
      return [...itemsWithoutChoices, `> ${choice.text}`];
    });

    // effects run
    if (choice.effects) this.checkEffects(choice.effects);

    if (this.playerState().health <= 0) {
      return this.setCurrentNode(this.findNode(SPECIAL_NODES.GAME_OVER));
    }

    // node is set
    this.setCurrentNode(this.findNode(choice.nextNodeId));
  }

  checkEffects(effects: Effect[]) {
    effects.forEach((effect) => {
      switch (effect.type) {
        case "addHealth":
          this.playerState.update((player) => ({
            ...player,
            health: player.health + (effect.health ?? 0),
          }));
          break;
        case "removeHealth":
          this.playerState.update((player) => ({
            ...player,
            health: Math.max(0, player.health - (effect.health ?? 0)),
          }));
          break;
        case "addMoralPoints":
          this.playerState.update((player) => ({
            ...player,
            moralPoints: player.moralPoints + (effect.moralPoints ?? 0),
          }));
          break;
        case "removeMoralPoints":
          this.playerState.update((player) => ({
            ...player,
            moralPoints: player.moralPoints - (effect.moralPoints ?? 0),
          }));
          break;
        case "addItem":
          if (effect.item) {
            this.playerState.update((player) => ({
              ...player,
              inventory: player.inventory.includes(effect.item!)
                ? player.inventory
                : [...player.inventory, effect.item!],
            }));
          }
          break;
        case "removeItem":
          if (effect.item) {
            this.playerState.update((player) => ({
              ...player,
              inventory: player.inventory.filter((i) => i !== effect.item),
            }));
          }
          break;
        case "addKnowledge":
          if (effect.knowledge) {
            this.playerState.update((player) => ({
              ...player,
              knowledge: player.knowledge.includes(effect.knowledge!)
                ? player.knowledge
                : [...player.knowledge, effect.knowledge!],
            }));
          }
          break;
      }
    });
  }

  filterChoices(choices: Choice[]): Choice[] {
    const player = this.playerState();

    return choices.filter((choice) => {
      if (!choice.conditions || choice.conditions.length === 0) {
        return true;
      }
      // every condition must pass
      return choice.conditions.every((condition) => {
        switch (condition.type) {
          case "hasItem":
            return condition.item
              ? player.inventory.includes(condition.item)
              : false;
          case "hasKnowledge":
            return condition.knowledge
              ? player.knowledge.includes(condition.knowledge)
              : false;
          case "hasHealth":
            return player.health >= (condition.health ?? 0);
          case "hasMoralPoints":
            return player.moralPoints >= (condition.moralPoints ?? 0);
          case "hasNotItem":
            return condition.item
              ? !player.inventory.includes(condition.item)
              : false;
          case "hasNotVisitedNextNode":
            return !this.visitedNodes.includes(choice.nextNodeId);
          default:
            return true;
        }
      });
    });
  }

  chooseTextToDisplay(node: GameNode, tempVisitedNodes?: string[]) {
    const visitedNodes = tempVisitedNodes || this.visitedNodes;

    // check if player has specific knowledge to show alt text
    if (
      node.altTextIfKnowledge &&
      this.playerState().knowledge.includes(node.knowledgeForAltText ?? "")
    )
      return node.altTextIfKnowledge;
    // check if player has already visited node to show alt text, excluding the last visited id
    if (
      node.altTextIfVisited &&
      visitedNodes.toSpliced(-1, 1).includes(node.id)
    )
      return node.altTextIfVisited;
    return node.text;
  }

  renderChoices(node: GameNode) {
    const filteredChoices = this.filterChoices(node.choices);

    if (filteredChoices.length === 0) {
      return [`> ${this.#translateService.instant("game.leave")}`];
    }

    return filteredChoices.map((choice, idx) =>
      node.isFreeInput ? "" : `${idx + 1}. ${choice.text}`,
    );
  }

  traverseNodes(nodeIds: string[]) {
    // reset player stats but the na,e
    const { name } = this.playerState();
    this.playerState.set({ ...DEFAULT_PLAYER_DATA, name });

    // rebuild all nodes but the last one, which will use the regular game flow
    const display: string[] = [];
    const tempVisitedNodes: string[] = [];
    let freeInputIndex = 0;

    for (let i = 0; i < nodeIds.length - 1; i++) {
      const node = this.findNode(nodeIds[i]);
      if (!node) continue;

      if (node.autoRedirectTo) {
        // add auto-redirect node text
        if (i > 0) {
          display.push("&nbsp;");
        }
        const text = this.chooseTextToDisplay(
          node,
          tempVisitedNodes,
        ).replaceAll("\\", "");
        display.push(text);
        continue;
      }

      // add current node to temporary visited array
      tempVisitedNodes.push(node.id);

      // only add empty space if it's not the first reconstructed node
      if (i > 0) {
        display.push("&nbsp;");
      }

      // render node text with current reconstructed state
      const text = this.chooseTextToDisplay(node, tempVisitedNodes).replaceAll(
        "\\",
        "",
      );
      display.push(text);

      // determine which choice led to the next node
      const nextId = nodeIds[i + 1];
      const selectedChoice =
        node.choices?.find((c) => c.nextNodeId === nextId) ?? undefined;

      // add the choice that was selected by the user
      if (node.isFreeInput) {
        if (freeInputIndex < this.freeInputsHistory.length) {
          display.push(`> ${this.freeInputsHistory[freeInputIndex]}`);
          freeInputIndex++;
        }
      } else if (selectedChoice) {
        display.push(`> ${selectedChoice.text}`);
      }

      // apply effects of the selected choice to reconstruct player state
      if (selectedChoice?.effects) {
        this.checkEffects(selectedChoice.effects);
      }
    }

    this.displayItems.set(display);
  }

  findNode(nodeId: string) {
    return this.nodes.find((node) => node.id === nodeId)!;
  }
}
