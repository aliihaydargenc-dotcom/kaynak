import { describe, it, expect } from "vitest";
import {
  defaults,
  SaveManager,
  validateSave,
  type StoragePort,
} from "../src/game/data/SaveManager";
import {
  applyRun,
  starsFor,
  evolution,
} from "../src/game/data/ProgressionService";
import { LEVELS } from "../src/game/data/levels";
import type { RunSummary } from "../src/game/types";
const run = (extra: Partial<RunSummary> = {}): RunSummary => ({
  runId: "run-1",
  mode: "adventure",
  levelId: "1-1",
  outcome: "won",
  score: 8,
  passedGates: 8,
  pickupCoins: 2,
  bonusCoins: 1,
  nearMisses: 1,
  allPassesCentered: true,
  activeDurationMs: 16000,
  ...extra,
});
class Memory implements StoragePort {
  value: string | null = null;
  failRead = false;
  failWrite = false;
  getItem() {
    if (this.failRead) throw Error();
    return this.value;
  }
  setItem(_k: string, v: string) {
    if (this.failWrite) throw Error();
    this.value = v;
  }
}
describe("rewards", () => {
  it("snapshots tier multiplier once without multiplying clear bonus or star pickups", () => {
    const s = defaults();
    const result = applyRun(s, run({ characterId: "nova" }));
    expect(result.coins).toBe(35);
    expect(result.stars).toBe(3);
    expect(applyRun(s, run({ characterId: "nova" })).coins).toBe(0);
    expect(
      applyRun(defaults(), run({ outcome: "dead", characterId: "crystal" }))
        .coins,
    ).toBe(12);
  });
  it("stars use physical coins and completed gate count, never bonus score", () => {
    expect(starsFor(run())).toBe(3);
    expect(starsFor(run({ allPassesCentered: false }))).toBe(2);
    expect(starsFor(run({ pickupCoins: 1, bonusCoins: 99 }))).toBe(1);
    expect(starsFor(run({ passedGates: 7, score: 99 }))).toBe(0);
    expect(starsFor(run({ outcome: "dead" }))).toBe(0);
  });
  it("first clear once, star differences only, lower replay cannot lose progress", () => {
    const s = defaults();
    expect(applyRun(s, run())).toMatchObject({ stars: 3, coins: 23, xp: 75 });
    expect(applyRun(s, run()).duplicate).toBe(true);
    const replay = applyRun(s, run({ runId: "run-2", pickupCoins: 0 }));
    expect(replay).toMatchObject({ stars: 1, coins: 1, xp: 0 });
    expect(s.adventure.levels["1-1"].bestStars).toBe(3);
    expect(s.xp).toBe(75);
    const t = defaults();
    applyRun(t, run({ pickupCoins: 0 }));
    expect(applyRun(t, run({ runId: "new" })).xp).toBe(50);
  });
  it("keeps loss coins and separate endless scores/XP, preserves tied runs", () => {
    const s = defaults();
    applyRun(s, run({ outcome: "dead" }));
    expect(s.wallet.coins).toBe(3);
    expect(s.xp).toBe(0);
    applyRun(
      s,
      run({ runId: "end1", mode: "endless", score: 100, passedGates: 60 }),
    );
    applyRun(
      s,
      run({ runId: "end2", mode: "endless", score: 100, passedGates: 1 }),
    );
    expect(s.xp).toBe(102);
    expect(s.endless.topScores).toEqual([100, 100]);
    applyRun(s, run({ runId: "adv", score: 1000 }));
    expect(s.endless.bestScore).toBe(100);
  });
  it("unlocks four world skins, max sixty stars and 1500 adventure XP", () => {
    const s = defaults();
    for (const l of LEVELS)
      applyRun(
        s,
        run({
          runId: l.id,
          levelId: l.id,
          passedGates: l.gates,
          pickupCoins: l.coins,
        }),
      );
    expect(s.inventory.skins).toEqual([
      "spark",
      "sprout",
      "dune",
      "crystal",
      "nova",
    ]);
    expect(s.xp).toBe(1500);
    expect(
      Object.values(s.adventure.levels).reduce((n, l) => n + l.bestStars, 0),
    ).toBe(60);
    expect([0, 500, 1500, 3000].map(evolution)).toEqual([
      "Yavru",
      "Gezgin",
      "Usta",
      "Efsane",
    ]);
  });
});
describe("save boundary and transactions", () => {
  it.each([null, [], {}, "bad", 3])(
    "validates unknown root %j with fresh defaults",
    (input) => {
      const a = validateSave(input),
        b = validateSave(input);
      expect(a.wallet.coins).toBe(0);
      a.inventory.skins.push("bad");
      expect(b.inventory.skins).toEqual(["spark"]);
    },
  );
  it.each([-1, NaN, Infinity, "12", null, 1.2])(
    "rejects invalid numeric values %j",
    (value) => {
      const s = validateSave({
        wallet: { coins: value },
        xp: value,
        endless: { bestScore: value, topScores: [value] },
      });
      expect(s.wallet.coins).toBe(0);
      expect(s.xp).toBe(0);
      expect(s.endless.topScores).toEqual([]);
    },
  );
  it("drops invalid levels and locked selected cosmetics, clamps numeric caps", () => {
    const s = validateSave({
      wallet: { coins: 1e15 },
      adventure: {
        levels: { bad: { bestStars: 3 }, "1-1": { bestStars: 100 } },
      },
      inventory: {
        skins: ["bad", "nova"],
        selectedSkin: "nova",
        trails: ["bad"],
        selectedTrail: "star",
      },
    });
    expect(s.wallet.coins).toBe(2147483647);
    expect(s.adventure.levels.bad).toBeUndefined();
    expect(s.adventure.levels["1-1"].bestStars).toBe(3);
    expect(s.inventory.selectedSkin).toBe("spark");
    expect(s.inventory.selectedTrail).toBe("none");
  });
  it.each(["{", "null", "[]", '{"schemaVersion":1}'])(
    "loads malformed/empty records safely %s",
    (value) => {
      const m = new Memory();
      m.value = value;
      expect(new SaveManager(m).data.wallet.coins).toBe(0);
    },
  );
  it("continues session on read/write exceptions, recovers latest snapshot without replay", () => {
    const m = new Memory();
    m.failRead = true;
    const s = new SaveManager(m);
    expect(s.sessionOnly).toBe(true);
    m.failRead = false;
    m.failWrite = true;
    s.commitRun(run());
    expect(s.data.wallet.coins).toBe(23);
    expect(s.sessionOnly).toBe(true);
    s.commitRun(run());
    expect(s.data.wallet.coins).toBe(23);
    m.failWrite = false;
    s.write();
    const reloaded = new SaveManager(m);
    expect(reloaded.data.wallet.coins).toBe(23);
    expect(s.sessionOnly).toBe(false);
    expect(reloaded.commitRun(run()).duplicate).toBe(true);
  });
  it("unlimited coins unlock items with zero balance, reject repeat/unknown items and persist selection", () => {
    const m = new Memory(),
      s = new SaveManager(m);
    expect(s.data.wallet.coins).toBe(0);
    expect(s.buy("leaf")).toBe(true);
    expect(s.buy("leaf")).toBe(false);
    expect(s.buy("bad")).toBe(false);
    expect(s.buy("sand")).toBe(true);
    expect(s.data.wallet.coins).toBe(0);
    expect(s.select("trail", "star")).toBe(false);
    expect(s.select("trail", "leaf")).toBe(true);
    s.setSettings(false, "on");
    const t = new SaveManager(m);
    expect(t.data.inventory.selectedTrail).toBe("leaf");
    expect(t.buy("star")).toBe(true);
    expect(t.data.wallet.coins).toBe(0);
    expect(t.data.settings).toEqual({ sound: false, reducedMotion: "on" });
  });
  it("reads latest completed record before reward and responds to external changes", () => {
    const m = new Memory(),
      a = new SaveManager(m),
      b = new SaveManager(m);
    a.commitRun(run());
    b.commitRun(run({ runId: "two", outcome: "dead" }));
    expect(b.data.wallet.coins).toBe(26);
    a.externalChange();
    expect(a.data.wallet.coins).toBe(26);
  });
  it("preserves unknown future schema bytes while allowing session play", () => {
    const m = new Memory();
    m.value = '{"schemaVersion":99,"future":"keep"}';
    const s = new SaveManager(m);
    s.commitRun(run());
    expect(s.data.wallet.coins).toBe(23);
    expect(s.sessionOnly).toBe(true);
    expect(m.value).toBe('{"schemaVersion":99,"future":"keep"}');
  });
});
