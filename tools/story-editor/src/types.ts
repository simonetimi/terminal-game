import type {
  Choice as BaseChoice,
  Condition,
  Effect,
  GameData,
  GameNode,
  Sfx,
  Vfx,
} from "../../../src/app/models/game-state";

export type Choice = Omit<BaseChoice, "id"> & { id?: number | string };
export type StoryNode = Omit<GameNode, "choices"> & { choices: Choice[] };
export type StoryData = Omit<GameData, "nodes"> & { nodes: StoryNode[] };

export type { Condition, Effect, Vfx, Sfx };

export interface ValidationIssue {
  message: string;
  instancePath: string;
}

const makeNodeId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `node-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const emptyNode = (): StoryNode => ({
  id: makeNodeId(),
  text: "",
  choices: [],
});
