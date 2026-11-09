export type RunRequest =
  | { mode: "adventure"; levelId: string; skinId: string }
  | { mode: "endless"; skinId: string };
export type GamePhase =
  | "ready"
  | "playing"
  | "paused"
  | "won"
  | "dead"
  | "results";
export type PipeVariant = "static" | "sway" | "pulse";
export interface RunSummary {
  runId: string;
  mode: "adventure" | "endless";
  levelId?: string;
  outcome: "won" | "dead";
  score: number;
  passedGates: number;
  pickupCoins: number;
  bonusCoins: number;
  nearMisses: number;
  allPassesCentered: boolean;
  activeDurationMs: number;
}
export interface DifficultyState {
  intensity: number;
  speed: number;
  pipeGap: number;
  spawnDelay: number;
  swayChance: number;
  pulseChance: number;
  coinChance: number;
  windChance: number;
}
export interface LevelProgress {
  bestStars: number;
  bestScore: number;
  firstClearClaimed: boolean;
}
export interface SaveData {
  schemaVersion: 1;
  revision: number;
  updatedAt: string;
  wallet: { coins: number };
  xp: number;
  adventure: { levels: Record<string, LevelProgress> };
  endless: { bestScore: number; topScores: number[] };
  inventory: {
    skins: string[];
    trails: string[];
    selectedSkin: string;
    selectedTrail: string;
  };
  settings: { sound: boolean; reducedMotion: "system" | "on" | "off" };
  processedRunIds: string[];
}
