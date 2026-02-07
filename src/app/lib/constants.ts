export const STORAGE_KEYS = {
  settings: "settings",
  player: "player",
  visitedNodes: "visitedNodes",
  currentNode: "currentNode",
  freeInputsHistory: "freeInputsHistory",
  choiceHistory: "choiceHistory",
} as const;

export const DOM_ATTRIBUTES = {
  theme: "data-theme",
  choiceNum: "data-choice-num",
} as const;

export const DOM_SELECTORS = {
  terminalInput: ".terminal-input",
} as const;

export const KEYBOARD_KEYS = {
  arrowUp: "ArrowUp",
  arrowDown: "ArrowDown",
  enter: "Enter",
  space: " ",
} as const;

export const ASSET_PATHS = {
  i18nPrefix: "assets/i18n/",
  i18nSuffix: ".json",
  storyJson: "/assets/data/story.json",
  soundsBase: "assets/sounds/",
} as const;

export const SFX_KEYS = {
  blip: "blip",
  win: "win",
  lose: "lose",
  hurt: "hurt",
} as const;

export const AUDIO_CONFIG = {
  sfxExtension: ".wav",
  defaultSfxVolume: 0.6,
} as const;

export const VFX_EVENTS = {
  glitchStarting: "glitch-starting",
  glitchEnded: "glitch-ended",
} as const;

export const VFX_CLASSES = {
  grainOverlay: "vfx-grain-overlay",
  glitchOverlay: "vfx-glitch-overlay",
} as const;

export const DATASET_KEYS = {
  glitching: "glitching",
} as const;

export const MEDIA_QUERIES = {
  prefersReducedMotion: "(prefers-reduced-motion: reduce)",
} as const;

export const TEXT_DELIMITERS = {
  storyLineBreak: "\\",
} as const;
