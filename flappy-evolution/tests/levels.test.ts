import { describe, it, expect } from "vitest";
import {
  LEVELS,
  validateCatalog,
  AdventurePattern,
  isUnlocked,
  variantFor,
} from "../src/game/data/levels";
import { defaults } from "../src/game/data/SaveManager";
describe("adventure catalog", () => {
  it("has the documented twenty slots across four worlds", () => {
    expect(validateCatalog(LEVELS)).toEqual([]);
    for (let w = 1; w <= 4; w++)
      expect(LEVELS.filter((l) => l.world === w)).toHaveLength(5);
  });
  it("rejects duplicates, missing slots and unattainable targets", () => {
    expect(
      validateCatalog([
        ...LEVELS.slice(0, 19),
        { ...LEVELS[0], gates: 0 },
      ]).join(),
    ).toMatch(/Tekrarlanan/);
    expect(validateCatalog(LEVELS.slice(1)).join()).toMatch(/Eksik/);
    expect(
      validateCatalog([{ ...LEVELS[0], gates: 0 }, ...LEVELS.slice(1)]).join(),
    ).toMatch(/profil/);
  });
  it("keeps all movement inside safe edges, bounded center changes and seeded phases", () => {
    for (const l of LEVELS) {
      const a = new AdventurePattern(l),
        b = new AdventurePattern(l);
      let previous = 360;
      for (let n = 1; n <= l.gates; n++) {
        const p = a.next();
        expect(p).toEqual(b.next());
        expect(Math.abs(p.center - previous)).toBeLessThanOrEqual(70.00001);
        if (n === 1) expect(p.center).toBe(360);
        for (let t = 0; t < 7; t += 0.2) {
          const center =
              p.center +
              (p.variant === "sway" ? Math.sin(t * 0.9 + p.phase) * 20 : 0),
            gap =
              p.gap +
              (p.variant === "pulse" ? Math.sin(t * 0.9 + p.phase) * 24 : 0);
          expect(center - gap / 2).toBeGreaterThanOrEqual(120);
          expect(center + gap / 2).toBeLessThanOrEqual(630);
        }
        previous = p.center;
      }
    }
  });
  it("uses pulse priority and predecessor locks", () => {
    expect(variantFor(LEVELS[19], 6)).toBe("pulse");
    const s = defaults();
    expect(isUnlocked("1-1", s)).toBe(true);
    expect(isUnlocked("1-2", s)).toBe(false);
    expect(isUnlocked("bad", s)).toBe(false);
    s.adventure.levels["1-1"] = {
      bestStars: 1,
      bestScore: 8,
      firstClearClaimed: true,
    };
    expect(isUnlocked("1-2", s)).toBe(true);
  });
});
