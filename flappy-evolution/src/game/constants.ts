export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 854;
export const PIPE_BODY_WIDTH = 96;
export const PIPE_BODY_HEIGHT = 520;
export const GROUND_HEIGHT = 104;
export const DEFAULT_FLAP_POWER = 430;
export const BIRD_GRAVITY = 1650;
export const STORAGE_KEY = "flappy_evolution_save_v1";
export const SKINS = ["spark", "sprout", "dune", "crystal", "nova"] as const;
export const SKIN_NAMES = ["Kıvılcım", "Filiz", "Kumul", "Kristal", "Nova"];
export const TRAILS = { none: 0, leaf: 0, sand: 0, star: 0 } as const;
export const TRAIL_NAMES = {
  none: "İz yok",
  leaf: "Yaprak",
  sand: "Kum",
  star: "Yıldız",
};
