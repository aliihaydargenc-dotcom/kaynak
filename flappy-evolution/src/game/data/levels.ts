import type { PipeVariant, SaveData } from "../types";
export interface Level {
  id: string;
  world: number;
  order: number;
  name: string;
  gates: number;
  speed: number;
  gap: number;
  interval: number;
  swayEvery: number;
  pulseEvery: number;
  seed: string;
}
export const WORLDS = [
  "Filiz Vadisi",
  "Kumul Geçidi",
  "Kristal Zirve",
  "Yıldız Yolu",
];
export const LEVELS: Level[] = [
  {
    id: "1-1",
    world: 1,
    order: 1,
    name: "İlk Kanat",
    gates: 8,
    speed: 210,
    gap: 260,
    interval: 1650,
    swayEvery: 0,
    pulseEvery: 0,
    seed: "adventure:1-1:v1",
  },
  {
    id: "1-2",
    world: 1,
    order: 2,
    name: "Yaprak Arası",
    gates: 10,
    speed: 210,
    gap: 254,
    interval: 1650,
    swayEvery: 0,
    pulseEvery: 0,
    seed: "adventure:1-2:v1",
  },
  {
    id: "1-3",
    world: 1,
    order: 3,
    name: "Dere Kıvrımı",
    gates: 12,
    speed: 220,
    gap: 248,
    interval: 1600,
    swayEvery: 0,
    pulseEvery: 0,
    seed: "adventure:1-3:v1",
  },
  {
    id: "1-4",
    world: 1,
    order: 4,
    name: "Yüksek Dallar",
    gates: 14,
    speed: 220,
    gap: 242,
    interval: 1600,
    swayEvery: 0,
    pulseEvery: 0,
    seed: "adventure:1-4:v1",
  },
  {
    id: "1-5",
    world: 1,
    order: 5,
    name: "Vadi Kapısı",
    gates: 16,
    speed: 230,
    gap: 236,
    interval: 1550,
    swayEvery: 0,
    pulseEvery: 0,
    seed: "adventure:1-5:v1",
  },
  {
    id: "2-1",
    world: 2,
    order: 1,
    name: "Kum Ritmi",
    gates: 14,
    speed: 230,
    gap: 240,
    interval: 1550,
    swayEvery: 4,
    pulseEvery: 0,
    seed: "adventure:2-1:v1",
  },
  {
    id: "2-2",
    world: 2,
    order: 2,
    name: "Eski Kemer",
    gates: 16,
    speed: 240,
    gap: 236,
    interval: 1500,
    swayEvery: 4,
    pulseEvery: 0,
    seed: "adventure:2-2:v1",
  },
  {
    id: "2-3",
    world: 2,
    order: 3,
    name: "Serap",
    gates: 18,
    speed: 240,
    gap: 232,
    interval: 1500,
    swayEvery: 3,
    pulseEvery: 0,
    seed: "adventure:2-3:v1",
  },
  {
    id: "2-4",
    world: 2,
    order: 4,
    name: "Kanyon",
    gates: 20,
    speed: 250,
    gap: 228,
    interval: 1450,
    swayEvery: 3,
    pulseEvery: 0,
    seed: "adventure:2-4:v1",
  },
  {
    id: "2-5",
    world: 2,
    order: 5,
    name: "Kumul Kapısı",
    gates: 22,
    speed: 250,
    gap: 224,
    interval: 1450,
    swayEvery: 2,
    pulseEvery: 0,
    seed: "adventure:2-5:v1",
  },
  {
    id: "3-1",
    world: 3,
    order: 1,
    name: "Kristal Eşik",
    gates: 18,
    speed: 250,
    gap: 232,
    interval: 1450,
    swayEvery: 0,
    pulseEvery: 4,
    seed: "adventure:3-1:v1",
  },
  {
    id: "3-2",
    world: 3,
    order: 2,
    name: "Buz Nefesi",
    gates: 20,
    speed: 260,
    gap: 228,
    interval: 1400,
    swayEvery: 0,
    pulseEvery: 3,
    seed: "adventure:3-2:v1",
  },
  {
    id: "3-3",
    world: 3,
    order: 3,
    name: "Yankı",
    gates: 22,
    speed: 260,
    gap: 224,
    interval: 1400,
    swayEvery: 4,
    pulseEvery: 3,
    seed: "adventure:3-3:v1",
  },
  {
    id: "3-4",
    world: 3,
    order: 4,
    name: "Zirve Yolu",
    gates: 24,
    speed: 270,
    gap: 220,
    interval: 1350,
    swayEvery: 0,
    pulseEvery: 2,
    seed: "adventure:3-4:v1",
  },
  {
    id: "3-5",
    world: 3,
    order: 5,
    name: "Kristal Taç",
    gates: 26,
    speed: 270,
    gap: 216,
    interval: 1350,
    swayEvery: 3,
    pulseEvery: 2,
    seed: "adventure:3-5:v1",
  },
  {
    id: "4-1",
    world: 4,
    order: 1,
    name: "Yörünge",
    gates: 24,
    speed: 270,
    gap: 228,
    interval: 1350,
    swayEvery: 0,
    pulseEvery: 0,
    seed: "adventure:4-1:v1",
  },
  {
    id: "4-2",
    world: 4,
    order: 2,
    name: "Meteor Yolu",
    gates: 26,
    speed: 280,
    gap: 224,
    interval: 1300,
    swayEvery: 4,
    pulseEvery: 0,
    seed: "adventure:4-2:v1",
  },
  {
    id: "4-3",
    world: 4,
    order: 3,
    name: "Yıldız Akımı",
    gates: 28,
    speed: 280,
    gap: 220,
    interval: 1300,
    swayEvery: 0,
    pulseEvery: 4,
    seed: "adventure:4-3:v1",
  },
  {
    id: "4-4",
    world: 4,
    order: 4,
    name: "Ufuk Çizgisi",
    gates: 30,
    speed: 290,
    gap: 216,
    interval: 1250,
    swayEvery: 3,
    pulseEvery: 2,
    seed: "adventure:4-4:v1",
  },
  {
    id: "4-5",
    world: 4,
    order: 5,
    name: "Evrim Kapısı",
    gates: 34,
    speed: 300,
    gap: 212,
    interval: 1250,
    swayEvery: 3,
    pulseEvery: 2,
    seed: "adventure:4-5:v1",
  },
];
export const getLevel = (id: string): Level | undefined =>
  LEVELS.find((l) => l.id === id);
export const isUnlocked = (id: string, save: SaveData): boolean => {
  const i = LEVELS.findIndex((l) => l.id === id);
  return (
    i === 0 ||
    (i > 0 && (save.adventure.levels[LEVELS[i - 1].id]?.bestStars ?? 0) > 0)
  );
};
export const variantFor = (l: Level, n: number): PipeVariant =>
  l.pulseEvery && n % l.pulseEvery === 0
    ? "pulse"
    : l.swayEvery && n % l.swayEvery === 0
      ? "sway"
      : "static";
export function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class AdventurePattern {
  private random: () => number;
  private center = 360;
  private index = 0;
  constructor(private level: Level) {
    this.random = seededRandom(level.seed);
  }
  next(): { center: number; gap: number; variant: PipeVariant; phase: number } {
    const variant = variantFor(this.level, ++this.index);
    const margin =
      this.level.gap / 2 +
      (variant === "sway" ? 20 : variant === "pulse" ? 12 : 0);
    if (this.index > 1)
      this.center = Math.min(
        630 - margin,
        Math.max(120 + margin, this.center + this.random() * 140 - 70),
      );
    return {
      center: this.center,
      gap: this.level.gap,
      variant,
      phase: this.random() * Math.PI * 2,
    };
  }
}
export function validateCatalog(levels: Level[]): string[] {
  const errors: string[] = [];
  if (levels.length !== 20) errors.push("20 bölüm gerekli");
  const ids = new Set<string>(),
    slots = new Set<string>();
  for (const l of levels) {
    const slot = `${l.world}-${l.order}`;
    if (ids.has(l.id) || slots.has(slot))
      errors.push(`Tekrarlanan bölüm: ${l.id}`);
    ids.add(l.id);
    slots.add(slot);
    if (
      l.id !== slot ||
      l.world < 1 ||
      l.world > 4 ||
      l.order < 1 ||
      l.order > 5
    )
      errors.push(`Geçersiz dünya/sıra: ${l.id}`);
    if (
      !Number.isInteger(l.gates) ||
      l.gates < 1 ||
      l.speed <= 0 ||
      l.interval <= 0 ||
      l.gap < 120 ||
      l.gap > 300 ||
      l.seed !== `adventure:${l.id}:v1`
    )
      errors.push(`Geçersiz profil: ${l.id}`);
  }
  for (let w = 1; w <= 4; w++)
    for (let n = 1; n <= 5; n++)
      if (!slots.has(`${w}-${n}`)) errors.push(`Eksik bölüm: ${w}-${n}`);
  return errors;
}
