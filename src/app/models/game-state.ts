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
  type: string;
  item: string;
}

export interface Effect {
  type: string;
  item: string;
}

export interface GameData {
  nodes: GameNode[];
}
