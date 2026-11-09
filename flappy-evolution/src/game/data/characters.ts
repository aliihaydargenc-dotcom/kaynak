export interface CharacterPower {
  id: string;
  tier: number;
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
    flap: 430,
    damage: 0,
    shots: 1,
    piercing: false,
    shield: 0,
    cooldown: 700,
    label: "Kıvılcım",
    description: "Temel uçuş",
  },
  {
    id: "sprout",
    tier: 2,
    flap: 450,
    damage: 0,
    shots: 1,
    piercing: false,
    shield: 0,
    cooldown: 650,
    label: "Filiz",
    description: "Hızlı kanat",
  },
  {
    id: "dune",
    tier: 3,
    flap: 450,
    damage: 2,
    shots: 1,
    piercing: false,
    shield: 0,
    cooldown: 550,
    label: "Kumul",
    description: "Ateş topu",
  },
  {
    id: "crystal",
    tier: 4,
    flap: 450,
    damage: 3,
    shots: 2,
    piercing: true,
    shield: 1,
    cooldown: 500,
    label: "Kristal",
    description: "Çift delici ateş · Kalkan",
  },
  {
    id: "nova",
    tier: 5,
    flap: 450,
    damage: 6,
    shots: 2,
    piercing: true,
    shield: 2,
    cooldown: 350,
    label: "Nova",
    description: "Plazma · Çift kalkan",
  },
];
export const character = (id: string): CharacterPower =>
  CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
