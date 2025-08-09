export interface Choice {
  id: string;
  text: string;
  nextNodeId: string;
  conditions?: Condition[];
  effects?: Effect[];
}

export interface Node {
  id: string;
  text: string;
  choices: Choice[];
  conditions?: Condition[];
}

export interface Condition {
  type: 'hasItem' | 'healthAbove' | 'flagSet' | 'custom';
  key: string;
  value?: any;
}

export interface Effect {
  type: 'addItem' | 'removeItem' | 'changeHealth' | 'setFlag';
  key: string;
  value?: any;
}

export interface PlayerState {
  health: number;
  inventory: string[];
  flags: Record<string, boolean>;
}

export interface GameHistoryEntry {
  nodeId: string;
  choiceId: string | null;
}
