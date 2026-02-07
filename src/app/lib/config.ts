export const CONFIG = {
  defaultTypewriterSpeed: 50,
  narrationBreakDelay: 1000,
  defaultScreenSelector: "main",
  defaultAutoRedirectDelay: 1000,
  defaultSfxSetting: true,
  defaultTerminalBeepSetting: true,
  defaultScrollbarSetting: false,
} as const;

export const DEFAULT_PLAYER_DATA = {
  name: "anonymous",
  health: 3,
  inventory: [],
  knowledge: [],
  moralPoints: 0,
};

export const THEME_OPTIONS: string[] = [
  "terminalGreen",
  "terminalAmber",
  "terminalGrey",
  "pastelDark",
  "pastelLight",
] as const;

export const DEFAULT_THEME = THEME_OPTIONS[0];

export const DEFAULT_SETTINGS = {
  typewriterSpeed: CONFIG.defaultTypewriterSpeed,
  sfxEnabled: CONFIG.defaultSfxSetting,
  terminalBeepEnabled: CONFIG.defaultTerminalBeepSetting,
  scrollbarEnabled: CONFIG.defaultScrollbarSetting,
  theme: DEFAULT_THEME,
};
