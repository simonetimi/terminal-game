export const CONFIG = {
  TYPEWRITER_SPEED: 30,
  NARRATION_BREAK_DELAY: 1000,
  DEFAULT_SCREEN_SELECTOR: "main",
  DEFAULT_AUTO_REDIRECT_DELAY: 500,
} as const;

export const DEFAULT_PLAYER_DATA = {
  name: "anonymous",
  health: 3,
  inventory: [],
  knowledge: [],
  moralPoints: 0,
};
