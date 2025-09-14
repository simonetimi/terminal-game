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
  altTextIfVisited?: string; // show when node has been visited
  altTextIfKnowledge?: string; // show when player has certain knowledge
  knowledgeForAltText?: string;
  isFreeInput?: boolean;
  vfx?: Vfx;
  sfx?: Sfx;
}

export interface Choice {
  text: string;
  nextNodeId: string;
  conditions?: Condition[];
  effects?: Effect[];
  matchKeyword?: string;
  exactMatch?: boolean;
  altTextIfVisited?: string; // show when node has been visited
}

export interface Condition {
  type:
    | "hasItem"
    | "hasKnowledge"
    | "hasHealth"
    | "hasMoralPoints"
    | "hasNotItem"
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
