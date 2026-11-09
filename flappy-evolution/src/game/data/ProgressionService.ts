import { SKINS, TRAILS } from "../constants";
import { getLevel } from "./levels";
import type { RunSummary, SaveData } from "../types";
export const MAX_VALUE = 2147483647;
export const bounded = (n: number): number =>
  Math.min(MAX_VALUE, Math.max(0, Math.floor(n)));
export function starsFor(s: Readonly<RunSummary>): number {
  const l =
    s.mode === "adventure" && s.levelId ? getLevel(s.levelId) : undefined;
  if (!l || s.outcome !== "won" || s.passedGates < l.gates) return 0;
  return s.pickupCoins < l.coins ? 1 : s.allPassesCentered ? 3 : 2;
}
export function evolution(xp: number): string {
  return xp >= 3000
    ? "Efsane"
    : xp >= 1500
      ? "Usta"
      : xp >= 500
        ? "Gezgin"
        : "Yavru";
}
export interface Reward {
  stars: number;
  coins: number;
  xp: number;
  duplicate?: boolean;
  skin?: string;
}
export function applyRun(data: SaveData, s: Readonly<RunSummary>): Reward {
  if (data.processedRunIds.includes(s.runId))
    return { stars: 0, coins: 0, xp: 0, duplicate: true };
  const stars = starsFor(s);
  let coins = bounded(s.pickupCoins + s.bonusCoins),
    xp = 0,
    skin: string | undefined;
  if (s.mode === "adventure" && s.levelId) {
    const l = getLevel(s.levelId);
    if (l) {
      const old = data.adventure.levels[l.id] ?? {
        bestStars: 0,
        bestScore: 0,
        firstClearClaimed: false,
      };
      xp = 25 * Math.max(0, stars - old.bestStars);
      if (stars > 0 && !old.firstClearClaimed) coins += l.reward;
      data.adventure.levels[l.id] = {
        bestStars: Math.max(old.bestStars, stars),
        bestScore: Math.max(old.bestScore, bounded(s.score)),
        firstClearClaimed: old.firstClearClaimed || stars > 0,
      };
      if (stars > 0 && l.order === 5) {
        skin = SKINS[l.world];
        if (!data.inventory.skins.includes(skin))
          data.inventory.skins.push(skin);
      }
    }
  } else if (s.mode === "endless") {
    xp = Math.min(100, 2 * bounded(s.passedGates));
    data.endless.bestScore = Math.max(data.endless.bestScore, bounded(s.score));
    data.endless.topScores = [...data.endless.topScores, bounded(s.score)]
      .sort((a, b) => b - a)
      .slice(0, 10);
  }
  data.wallet.coins = bounded(data.wallet.coins + coins);
  data.xp = bounded(data.xp + xp);
  data.processedRunIds = [...data.processedRunIds, s.runId].slice(-100);
  return { stars, coins, xp, skin };
}
export function purchase(data: SaveData, id: string): boolean {
  if (
    !Object.prototype.hasOwnProperty.call(TRAILS, id) ||
    data.inventory.trails.includes(id)
  )
    return false;
  const price = TRAILS[id as keyof typeof TRAILS];
  if (data.wallet.coins < price) return false;
  data.wallet.coins -= price;
  data.inventory.trails.push(id);
  return true;
}
