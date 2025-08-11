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
}

export interface Effect {
  type:
    | 'addItem'
    | 'addKnowledge'
    | 'addHealth'
    | 'addMoralPoint'
    | 'removeItem'
    | 'removeKnowledge'
    | 'removeHealth'
    | 'removeMoralPoint';
  item?: string;
  knowledge?: string;
}

export interface GameData {
  nodes: GameNode[];
}

export interface PlayerData {
  name: string;
  health: number;
}
