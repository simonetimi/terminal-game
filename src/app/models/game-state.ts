export interface GameNode {
  id: string;
  text: string;
  choices: Choice[];
  altTextIfVisited?: string; // show when node has been visited
  altTextIfKnowledge?: string; // show when player has certain knowledge
  knowledgeForAltText?: string;
  isFreeInput?: boolean;
  vfx?: string; // visual effect
  sfx?: string; // sound effect
}

export interface Choice {
  text: string;
  nextNodeId: string;
  conditions?: Condition[];
  effects?: Effect[];
  matchKeyword?: string;
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
    | "removeMoralPoints";
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
