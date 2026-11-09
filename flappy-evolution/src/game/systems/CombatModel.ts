import type { CharacterPower } from "../data/characters";
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export const overlaps = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;
export interface Shot {
  active: boolean;
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  enemy: boolean;
  damage: number;
  piercing: boolean;
  hits: Set<string>;
}
export const bossDefinition = (world: number, order: number) => ({
  name:
    ["Diken Muhafızı", "Kum Golemi", "Buz Hükümdarı", "Boşluk Bekçisi"][
      world - 1
    ] ?? "Muhafız",
  maxHealth: 4 + world * 2 + order,
  startup: 1100,
  active: 180,
  recovery: 1700,
  radius: 48,
  shotSpeed: 155 + world * 12,
});
export class CombatModel {
  readonly shots: Shot[] = Array.from({ length: 48 }, () => ({
    active: false,
    id: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    enemy: false,
    damage: 0,
    piercing: false,
    hits: new Set<string>(),
  }));
  private serial = 0;
  cooldown = 0;
  invulnerable = 0;
  shields: number;
  boss: {
    hp: number;
    maxHealth: number;
    x: number;
    y: number;
    elapsed: number;
    state: "windup" | "attack" | "recover" | "defeated";
    phase: number;
    actionId: number;
    aimY: number;
    emitted: boolean;
    definition: ReturnType<typeof bossDefinition>;
  } | null = null;
  constructor(readonly power: CharacterPower) {
    this.shields = power.shield;
  }
  spawn(
    x: number,
    y: number,
    vx: number,
    vy: number,
    enemy: boolean,
    damage: number,
    piercing = false,
  ): Shot | undefined {
    const s = this.shots.find((s) => !s.active);
    if (!s) return;
    Object.assign(s, {
      active: true,
      id: ++this.serial,
      x,
      y,
      vx,
      vy,
      enemy,
      damage,
      piercing,
    });
    s.hits.clear();
    return s;
  }
  fire(x: number, y: number): boolean {
    if (
      this.cooldown > 0 ||
      (!this.power.damage && !this.boss) ||
      this.boss?.state === "defeated"
    )
      return false;
    const count = this.power.damage ? this.power.shots : 1;
    if (this.shots.filter((s) => !s.active).length < count) return false;
    for (let i = 0; i < count; i++)
      this.spawn(
        x + 28,
        y + (count === 2 ? (i ? 10 : -10) : 0),
        660,
        0,
        false,
        Math.max(1, this.power.damage),
        this.power.piercing,
      );
    this.cooldown = this.power.cooldown;
    return true;
  }
  startBoss(world: number, order: number): void {
    const definition = bossDefinition(world, order);
    this.shots.forEach((s) => (s.active = false));
    this.boss = {
      hp: definition.maxHealth,
      maxHealth: definition.maxHealth,
      x: 378,
      y: 360,
      elapsed: 0,
      state: "windup",
      phase: 1,
      actionId: 1,
      aimY: 360,
      emitted: false,
      definition,
    };
  }
  update(delta: number, playerY: number): boolean {
    this.cooldown = Math.max(0, this.cooldown - delta);
    this.invulnerable = Math.max(0, this.invulnerable - delta);
    for (const s of this.shots)
      if (s.active) {
        s.x += (s.vx * delta) / 1000;
        s.y += (s.vy * delta) / 1000;
        if (s.x < -40 || s.x > 540 || s.y < 0 || s.y > 750) s.active = false;
      }
    const b = this.boss;
    if (!b || b.state === "defeated") return false;
    b.elapsed += delta;
    // Phase changes apply at a new windup, preserving the current telegraph.
    const startup = b.definition.startup,
      active = b.definition.active,
      recovery = b.definition.recovery / (b.phase === 2 ? 1.25 : 1);
    if (b.state === "windup" && b.elapsed >= startup) {
      b.state = "attack";
      b.elapsed -= startup;
    }
    if (b.state === "attack" && !b.emitted) {
      b.emitted = true;
      const offsets = b.phase === 2 ? [-36, 36] : [0];
      for (const offset of offsets) {
        const angle = Math.atan2(b.aimY + offset - b.y, 144 - b.x);
        this.spawn(
          b.x - 42,
          b.y,
          Math.cos(angle) * b.definition.shotSpeed,
          Math.sin(angle) * b.definition.shotSpeed,
          true,
          1,
        );
      }
    }
    if (b.state === "attack" && b.elapsed >= active) {
      b.state = "recover";
      b.elapsed -= active;
    }
    if (b.state === "recover" && b.elapsed >= recovery) {
      b.phase = b.hp <= b.maxHealth / 2 ? 2 : 1;
      b.state = "windup";
      b.elapsed = 0;
      b.emitted = false;
      b.actionId++;
      b.aimY = playerY;
      b.y = Math.max(190, Math.min(580, playerY));
      return true;
    }
    return false;
  }
  contact(s: Shot, id: string, rect: Rect): boolean {
    if (
      !s.active ||
      s.hits.has(id) ||
      !overlaps({ x: s.x - 9, y: s.y - 9, width: 18, height: 18 }, rect)
    )
      return false;
    s.hits.add(id);
    if (!s.piercing) s.active = false;
    return true;
  }
  hitBoss(s: Shot): boolean {
    const b = this.boss;
    if (!b || b.state === "defeated" || s.enemy) return false;
    if (
      !this.contact(s, "boss", {
        x: b.x - 48,
        y: b.y - 48,
        width: 96,
        height: 96,
      })
    )
      return false;
    b.hp = Math.max(0, b.hp - s.damage);
    if (!b.hp) {
      b.state = "defeated";
      this.shots.forEach((p) => (p.active = false));
    }
    return true;
  }
  absorb(): boolean {
    if (this.invulnerable > 0) return true;
    if (!this.shields) return false;
    this.shields--;
    this.invulnerable = 1400;
    return true;
  }
}
