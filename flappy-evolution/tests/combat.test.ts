import { describe, it, expect } from "vitest";
import { CombatModel } from "../src/game/systems/CombatModel";
import { CHARACTERS, character } from "../src/game/data/characters";
describe("character and combat contracts", () => {
  it("inherits progressively stronger powers and defaults unknown characters", () => {
    expect(character("unknown").tier).toBe(1);
    CHARACTERS.slice(1).forEach((c, i) => {
      const prev = CHARACTERS[i];
      expect(c.multiplier).toBeGreaterThan(prev.multiplier);
      expect(c.damage).toBeGreaterThanOrEqual(prev.damage);
      expect(c.magnet).toBeGreaterThanOrEqual(prev.magnet);
      expect(c.shield).toBeGreaterThanOrEqual(prev.shield);
      expect(c.cooldown).toBeLessThan(prev.cooldown);
    });
  });
  it("requires boss loan for the first two characters and respects cooldown boundary", () => {
    const c = new CombatModel(character("spark"));
    expect(c.fire(144, 360)).toBe(false);
    c.startBoss(1, 1);
    expect(c.fire(144, 360)).toBe(true);
    c.update(699, 360);
    expect(c.fire(144, 360)).toBe(false);
    c.update(1, 360);
    expect(c.fire(144, 360)).toBe(true);
  });
  it("caps and reuses the projectile pool atomically for twin shots", () => {
    const c = new CombatModel(character("nova"));
    for (let i = 0; i < 47; i++) c.spawn(10, 10, 0, 0, false, 1);
    expect(c.fire(10, 10)).toBe(false);
    expect(c.shots.filter((s) => s.active)).toHaveLength(47);
    c.shots[0].active = false;
    expect(c.fire(10, 10)).toBe(true);
    expect(c.shots).toHaveLength(48);
    expect(c.spawn(0, 0, 0, 0, false, 1)).toBeUndefined();
  });
  it("piercing resolves once per target, supports multiple targets and rejects out-of-range", () => {
    const c = new CombatModel(character("nova")),
      s = c.spawn(100, 100, 0, 0, false, 6, true)!;
    const r = { x: 90, y: 90, width: 20, height: 20 };
    expect(c.contact(s, "wall", r)).toBe(true);
    expect(c.contact(s, "wall", r)).toBe(false);
    expect(c.contact(s, "boss", r)).toBe(true);
    expect(c.contact(s, "far", { ...r, x: 400 })).toBe(false);
  });
  it("telegraphs before contact, fires once, recovers and renews action ids", () => {
    const c = new CombatModel(character("spark"));
    c.startBoss(1, 1);
    c.update(1099, 300);
    expect(c.shots.some((s) => s.active)).toBe(false);
    c.update(1, 300);
    expect(c.boss?.state).toBe("attack");
    expect(c.shots.filter((s) => s.active)).toHaveLength(1);
    c.update(1, 300);
    expect(c.shots.filter((s) => s.active)).toHaveLength(1);
    c.update(179, 300);
    expect(c.boss?.state).toBe("recover");
    c.update(1700, 300);
    expect(c.boss?.actionId).toBe(2);
    expect(c.boss?.state).toBe("windup");
    expect(c.boss?.aimY).toBe(300);
  });
  it("changes phase at the next telegraph; defeat disables attacks", () => {
    const c = new CombatModel(character("nova"));
    c.startBoss(4, 5);
    c.boss!.hp = 2;
    c.update(1100, 350);
    c.update(180, 350);
    c.update(1700, 350);
    expect(c.boss?.phase).toBe(2);
    const b = c.boss!,
      s = c.spawn(b.x, b.y, 0, 0, false, 6, true)!;
    expect(c.hitBoss(s)).toBe(true);
    expect(b.state).toBe("defeated");
    expect(c.shots.some((s) => s.active)).toBe(false);
    c.update(10000, 350);
    expect(c.shots.some((s) => s.active)).toBe(false);
    expect(c.hitBoss(s)).toBe(false);
  });
  it("shield charges grant timed invulnerability and reset for a new run", () => {
    const c = new CombatModel(character("crystal"));
    expect(c.absorb()).toBe(true);
    expect(c.shields).toBe(0);
    expect(c.absorb()).toBe(true);
    c.update(1400, 360);
    expect(c.absorb()).toBe(false);
    expect(new CombatModel(character("crystal")).shields).toBe(1);
  });
});
