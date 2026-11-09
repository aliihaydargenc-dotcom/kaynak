import Phaser from "phaser";
import { startRun } from "../../ui/startRun";
import { LEVELS, WORLDS, isUnlocked } from "../data/levels";
import { save } from "../data/SaveManager";
import { button, panel, clearPanel } from "../../ui/UiBridge";
export class WorldMapScene extends Phaser.Scene {
  constructor() {
    super("WorldMapScene");
  }
  create(): void {
    const stars = Object.values(save.data.adventure.levels).reduce(
      (n, l) => n + l.bestStars,
      0,
    );
    panel(
      `<header class="map-header"><p class="eyebrow">Macera · ${stars}/60 yıldız</p><h1>Bölüm seç</h1></header><div class="worlds">${WORLDS.map(
        (name, i) =>
          `<article class="world world-${i + 1}"><p class="eyebrow">Dünya 0${i + 1}</p><h2>${name}</h2><div class="levels">${LEVELS.filter(
            (l) => l.world === i + 1,
          )
            .map((l) => {
              const open = isUnlocked(l.id, save.data),
                s = save.data.adventure.levels[l.id]?.bestStars ?? 0;
              return `<button data-action="${l.id}" ${open ? "" : "disabled"} aria-label="${l.id} ${l.name}. ${open ? s + " yıldız" : "Kilitli: önceki bölümü tamamla"}"><strong>${l.id} · ${l.name}</strong><span>${open ? `${"★".repeat(s)}${"☆".repeat(3 - s)} · ${l.gates} geçiş` : "Kilitli · Önceki bölümü bitir"}</span></button>`;
            })
            .join("")}</div></article>`,
      ).join("")}</div>${button("menu", "Menüye dön")}`,
      (a) => {
        if (a === "menu") {
          this.scene.start("MenuScene");
          return;
        }
        if (!isUnlocked(a, save.data)) return;
        void startRun(this, {
          mode: "adventure",
          levelId: a,
          skinId: save.data.inventory.selectedSkin,
        });
      },
    );
  }
}
