import { SKINS, STORAGE_KEY, TRAILS } from "../constants";
import { LEVELS } from "./levels";
import { applyRun, purchase, bounded, type Reward } from "./ProgressionService";
import type { SaveData, RunSummary } from "../types";
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export function defaults(): SaveData {
  return {
    schemaVersion: 1,
    revision: 0,
    updatedAt: new Date().toISOString(),
    wallet: { coins: 0 },
    xp: 0,
    adventure: { levels: {} },
    endless: { bestScore: 0, topScores: [] },
    inventory: {
      skins: [...SKINS],
      trails: ["none"],
      selectedSkin: "spark",
      selectedTrail: "none",
    },
    settings: { sound: true, reducedMotion: "system" },
    processedRunIds: [],
  };
}
const record = (v: unknown): Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
const number = (v: unknown): number =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 && Number.isInteger(v)
    ? bounded(v)
    : 0;
const ids = (v: unknown, allowed: readonly string[]): string[] =>
  Array.isArray(v)
    ? [
        ...new Set(
          v.filter(
            (x): x is string => typeof x === "string" && allowed.includes(x),
          ),
        ),
      ]
    : [];
export function validateSave(input: unknown): SaveData {
  const x = record(input),
    s = defaults(),
    wallet = record(x.wallet),
    adventure = record(x.adventure),
    levels = record(adventure.levels),
    endless = record(x.endless),
    inv = record(x.inventory),
    settings = record(x.settings);
  s.revision = number(x.revision);
  s.updatedAt =
    typeof x.updatedAt === "string" && Number.isFinite(Date.parse(x.updatedAt))
      ? x.updatedAt
      : s.updatedAt;
  s.wallet.coins = number(wallet.coins);
  s.xp = number(x.xp);
  for (const l of LEVELS) {
    const v = record(levels[l.id]);
    if (Object.keys(v).length)
      s.adventure.levels[l.id] = {
        bestStars: Math.min(3, number(v.bestStars)),
        bestScore: number(v.bestScore),
        firstClearClaimed: v.firstClearClaimed === true,
      };
  }
  s.endless.bestScore = number(endless.bestScore);
  s.endless.topScores = Array.isArray(endless.topScores)
    ? endless.topScores
        .filter(
          (v): v is number =>
            typeof v === "number" &&
            Number.isFinite(v) &&
            v >= 0 &&
            Number.isInteger(v),
        )
        .map(bounded)
        .sort((a, b) => b - a)
        .slice(0, 10)
    : [];
  // All characters are available, including when loading older progress saves.
  s.inventory.skins = [...SKINS];
  s.inventory.trails = [
    ...new Set(["none", ...ids(inv.trails, Object.keys(TRAILS))]),
  ];
  s.inventory.selectedSkin =
    typeof inv.selectedSkin === "string" &&
    s.inventory.skins.includes(inv.selectedSkin)
      ? inv.selectedSkin
      : "spark";
  s.inventory.selectedTrail =
    typeof inv.selectedTrail === "string" &&
    s.inventory.trails.includes(inv.selectedTrail)
      ? inv.selectedTrail
      : "none";
  s.settings.sound =
    typeof settings.sound === "boolean" ? settings.sound : true;
  s.settings.reducedMotion =
    settings.reducedMotion === "on" || settings.reducedMotion === "off"
      ? settings.reducedMotion
      : "system";
  s.processedRunIds = Array.isArray(x.processedRunIds)
    ? [
        ...new Set(
          x.processedRunIds.filter(
            (v): v is string =>
              typeof v === "string" && v.length > 0 && v.length <= 100,
          ),
        ),
      ].slice(-100)
    : [];
  return s;
}
export class SaveManager {
  public data = defaults();
  public sessionOnly = false;
  public forwardSchema = false;
  private dirty = false;
  private seen = new Set<string>();
  constructor(private storage?: StoragePort) {
    if (!storage) {
      try {
        this.storage = globalThis.localStorage;
      } catch {
        this.sessionOnly = true;
      }
    }
    this.refresh();
  }
  private refresh(): void {
    if (this.dirty) return;
    try {
      const raw = this.storage?.getItem(STORAGE_KEY);
      if (!this.storage) {
        this.sessionOnly = true;
        return;
      }
      if (!raw) return;
      let input: unknown;
      try {
        input = JSON.parse(raw);
      } catch {
        return;
      }
      const version = record(input).schemaVersion;
      if (typeof version === "number" && version > 1) {
        this.forwardSchema = true;
        this.sessionOnly = true;
        return;
      }
      if (version !== 1) return;
      const next = validateSave(input);
      if (next.revision >= this.data.revision) this.data = next;
    } catch {
      this.sessionOnly = true;
    }
  }
  public write(): void {
    this.data.revision = bounded(this.data.revision + 1);
    this.data.updatedAt = new Date().toISOString();
    this.dirty = true;
    if (this.forwardSchema) {
      this.sessionOnly = true;
      return;
    }
    try {
      if (!this.storage) throw new Error("storage unavailable");
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this.dirty = false;
      this.sessionOnly = false;
    } catch {
      this.sessionOnly = true;
    }
  }
  public commitRun(s: Readonly<RunSummary>): Reward {
    if (this.seen.has(s.runId))
      return { stars: 0, coins: 0, xp: 0, duplicate: true };
    this.refresh();
    const report = applyRun(this.data, s);
    this.seen.add(s.runId);
    if (!report.duplicate) this.write();
    return report;
  }
  public buy(id: string): boolean {
    this.refresh();
    const ok = purchase(this.data, id);
    if (ok) this.write();
    return ok;
  }
  public select(kind: "skin" | "trail", id: string): boolean {
    this.refresh();
    const i = this.data.inventory;
    if (!(kind === "skin" ? i.skins : i.trails).includes(id)) return false;
    if (kind === "skin") i.selectedSkin = id;
    else i.selectedTrail = id;
    this.write();
    return true;
  }
  public setSettings(
    sound: boolean,
    reducedMotion: SaveData["settings"]["reducedMotion"],
  ): void {
    this.refresh();
    this.data.settings = { sound, reducedMotion };
    this.write();
  }
  public externalChange(): void {
    this.dirty = false;
    this.refresh();
  }
}
export const save = new SaveManager();
