import { inject, Injectable, signal } from "@angular/core";
import { typewriter } from "../utils/typewriter";

import gameData from "../game-data/data.json";
import { Choice, Effect, GameNode, PlayerData } from "../models/game-state";
import { strip } from "../utils/strings";
import { PersistenceService } from "./persistence-service";
import { TranslateService } from "@ngx-translate/core";
import { AudioService } from "./audio-service";

@Injectable({
  providedIn: "root",
})
export class GameService {
  #translateService = inject(TranslateService);
  #persistenceService = inject(PersistenceService);
  #audioService = inject(AudioService);

  nodes = gameData.nodes as GameNode[];

  playerState = signal<PlayerData>({
    name: "anonymous",
    health: 3,
    inventory: [],
    knowledge: [],
    moralPoints: 0,
  });
  displayItems = signal<string[]>([]);
  visitedNodes: string[] = [];

  isSystemWriting = signal(false);
  isUserQuitting = signal(false);

  skipAnimation = () => {};

  currentNode = signal<GameNode>({} as GameNode);

  #typewriterSpeed = 60;
  #lineBreakDelay = 1000;

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
      this.displayItems.update((items) => ["&nbsp;", ...items]);

    this.writeOnScreen(this.chooseTextToDisplay(node), () => {
      const choices = this.renderChoices(node);
      this.displayItems.update((items) => [...choices, ...items]);
    });
  }

  writeOnScreen(text: string, callback?: () => void) {
    this.isSystemWriting.set(true);
    this.#audioService.playAudio("blip");
    this.skipAnimation = typewriter(
      this.displayItems,
      text,
      { speed: this.#typewriterSpeed, lineBreakDelay: this.#lineBreakDelay },
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
    if (this.currentNode().id === "welcome") {
      const name = cleanInput.slice(0, 20);
      const nextNodeId = this.currentNode().choices[0].nextNodeId;
      this.setCurrentNode(this.findNode(nextNodeId));

      this.playerState.update((playerState) => ({ ...playerState, name }));
      return this.#persistenceService.savePlayerData({ name });
    }

    if (this.isUserQuitting()) {
      const confirm = this.#translateService.instant("commands.yes");
      if (confirm.keys.includes(cleanInput.toLowerCase())) {
        return this.#persistenceService.clearAllDataAndRefresh();
      } else {
        this.displayItems.update((items) => items.slice(1));
        return this.isUserQuitting.set(false);
      }
    }
    const exit = this.#translateService.instant("commands.exit");
    if (exit.keys.includes(cleanInput.toLowerCase())) {
      this.isUserQuitting.set(true);
      return this.displayItems.update((items) => [exit.text, ...items]);
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
      // remove the numbered choices (they are at the beginning of the array due to reverse order)
      const itemsWithoutChoices = items.slice(choicesCount);
      // add the selected choice in the "> text" format
      return [`> ${choice.text}`, ...itemsWithoutChoices];
    });

    // effects run
    if (choice.effects) this.checkEffects(choice.effects);

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
        case "removeKnowledge":
          if (effect.knowledge) {
            this.playerState.update((player) => ({
              ...player,
              knowledge: player.knowledge.filter((k) => k !== effect.knowledge),
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
    return this.filterChoices(node.choices)
      .map((choice, idx) =>
        node.freeInput ? "> " + choice.text : `${idx + 1}. ${choice.text}`,
      )
      .reverse();
  }

  traverseNodes(nodeIds: string[]) {
    // rebuild all nodes but the last one, which will use the regular game flow
    const display: string[] = [];
    const tempVisitedNodes: string[] = [];

    for (let i = 0; i < nodeIds.length - 1; i++) {
      const node = this.findNode(nodeIds[i]);
      if (!node) continue;

      // add current node to temporary visited array
      tempVisitedNodes.push(node.id);

      // only add empty space if it's not the first reconstructed node
      if (i > 0) {
        display.push("&nbsp;");
      }

      // use chooseTextToDisplay with temporary visited nodes array
      const text = this.chooseTextToDisplay(node, tempVisitedNodes).replaceAll(
        "\\",
        "",
      );
      display.push(text);

      // add the choice that was selected by the user
      const nextId = nodeIds[i + 1];
      const choice = node.choices?.find((c) => c.nextNodeId === nextId);
      if (choice) display.push(`> ${choice.text}`);
    }
    this.displayItems.set([...display].reverse());
  }

  findNode(nodeId: string) {
    return this.nodes.find((node) => node.id === nodeId)!;
  }
}
