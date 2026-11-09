export interface CharacterPower {
  id: string;
  tier: number;
  multiplier: number;
  magnet: number;
  flap: number;
  damage: number;
  shots: number;
  piercing: boolean;
  shield: number;
  cooldown: number;
  label: string;
  description: string;
}
export const CHARACTERS: readonly CharacterPower[] = [
  {
    id: "spark",
    tier: 1,
    multiplier: 1,
    magnet: 0,
    flap: 430,
    damage: 0,
    shots: 1,
    piercing: false,
    shield: 0,
    cooldown: 700,
    label: "Kıvılcım",
    description: "Temel uçuş · 1× jeton",
  },
  {
    id: "sprout",
    tier: 2,
    multiplier: 2,
    magnet: 100,
    flap: 450,
    damage: 0,
    shots: 1,
    piercing: false,
    shield: 0,
    cooldown: 650,
    label: "Filiz",
    description: "Mıknatıs · Hızlı kanat · 2× jeton",
  },
  {
    id: "dune",
    tier: 3,
    multiplier: 3,
    magnet: 120,
    flap: 450,
    damage: 2,
    shots: 1,
    piercing: false,
    shield: 0,
    cooldown: 550,
    label: "Kumul",
    description: "Ateş topu · Mıknatıs · 3× jeton",
  },
  {
    id: "crystal",
    tier: 4,
    multiplier: 4,
    magnet: 140,
    flap: 450,
    damage: 3,
    shots: 2,
    piercing: true,
    shield: 1,
    cooldown: 500,
    label: "Kristal",
    description: "Çift delici ateş · Kalkan · 4× jeton",
  },
  {
    id: "nova",
    tier: 5,
    multiplier: 5,
    magnet: 160,
    flap: 450,
    damage: 6,
    shots: 2,
    piercing: true,
    shield: 2,
    cooldown: 350,
    label: "Nova",
    description: "Plazma · Çift kalkan · 5× jeton",
  },
];
export const character = (id: string): CharacterPower =>
  CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
