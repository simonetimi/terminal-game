export interface GameNode {
  id: string;
  text: string;
  choices: Choice[];
  altTextIfVisited?: string; // show when node has been visited
  altTextIfKnowledge?: string; // show when player has certain knowledge
  knowledgeForAltText?: string;
  isFreeInput?: boolean;
  vfx?: "shake" | "glitch" | "dark"; // visual effect
  sfx?: "blip"; // sound effect
}

export interface Choice {
  text: string;
  nextNodeId: string;
  conditions?: Condition[];
  effects?: Effect[];
  matchKeyword?: string;
  gameEffect?: string;
}

export interface Condition {
  type:
    | "hasItem"
    | "hasKnowledge"
    | "hasHealth"
    | "hasMoralPoints"
    | "hasNotItem"
    | "hasNotVisited";
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
