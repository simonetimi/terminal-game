export interface GameNode {
  id: string;
  text: string;
  choices: Choice[];
  freeInput?: boolean;
}

export interface Choice {
  id: string;
  text: string;
  nextNodeId: string;
  conditions?: Condition[];
  effects?: Effect[];
}

export interface Condition {
  type: 'hasItem' | 'hasKnowledge' | 'hasHealth' | 'hasMoralPoints';
  item?: string;
  knowledge?: string;
  health?: number;
  moralPoints?: number;
}

export interface Effect {
  type:
    | 'addItem'
    | 'addKnowledge'
    | 'addHealth'
    | 'addMoralPoints'
    | 'removeItem'
    | 'removeKnowledge'
    | 'removeHealth'
    | 'removeMoralPoints';
  item?: string;
  knowledge?: string;
  health?: number;
  moralPoints?: number;
}

export interface GameData {
  nodes: GameNode[];
}

export interface PlayerData {
  name: string;
  health: number;
  inventory: string[];
  knowledge: string[];
  moralPoints: number;
}
