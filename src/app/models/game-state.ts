export interface GameData {
  $schema: string;
  nodes: GameNode[];
}

export interface GameNode {
  id: string;
  text: string;
  choices: Choice[];
  autoRedirectTo?: string;
  autoRedirectDelay?: number;
  altTextIfVisited?: string; // text when node has been visited
  altTextIfKnowledge?: string; // text when player has certain knowledge (has predence over alt text)
  knowledgeForAltText?: string;
  isFreeInput?: boolean;
  vfx?: Vfx;
  sfx?: Sfx;
}

export interface Choice {
  id: string;
  text: string;
  nextNodeId: string;
  conditions?: Condition[];
  effects?: Effect[];
  matchKeyword?: string;
  exactMatch?: boolean;
  altTextOnChoiceRepeat?: string; // alt text when this choice is picked again, starting from the first revisit
  altNextNodeId?: string; // alt node id to jump to after threshold
  altRedirectThreshold?: number; // treshold for altNextNodeId (number of visits)
}

export interface Condition {
  type:
    | "hasItem"
    | "hasKnowledge"
    | "hasHealth"
    | "hasMoralPoints"
    | "hasNotItem"
    | "hasNotKnowledge"
    | "hasNotVisitedNextNode";
  item?: string;
  knowledge?: string;
  health?: number;
  moralPoints?: number;
}

export interface Effect {
  type:
    | "addItem"
    | "addKnowledge"
    | "addHealth"
    | "addMoralPoints"
    | "removeItem"
    | "removeKnowledge"
    | "removeHealth"
    | "removeMoralPoints"
    | "restart"
    | "close";
  item?: string;
  knowledge?: string;
  health?: number;
  moralPoints?: number;
  gameOverNodeId?: string; // id of the game over node - mandatory if we're removing health
}

export type Vfx = "shake" | "glitch" | "dark";
export type Sfx = "blip" | "win" | "lose";

export interface PlayerData {
  name: string;
  health: number;
  inventory: string[];
  knowledge: string[];
  moralPoints: number;
}

export interface SavedPlayerData {
  name: string;
}

export const SPECIAL_NODES = {
  WELCOME: "welcome",
  GAME_OVER: "gameOver",
} as const;

export const GAME_CHOICE_CLASS = "game-choice";
