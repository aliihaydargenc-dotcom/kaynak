import Phaser from "phaser";
import { startRun } from "../../ui/startRun";
import { LEVELS, WORLDS, isUnlocked } from "../data/levels";
import { save } from "../data/SaveManager";
import { panel } from "../../ui/UiBridge";
import { icon } from "../../ui/icons";
const positions = [
  [28, 490],
  [62, 405],
  [75, 290],
  [43, 205],
  [29, 95],
];
const subtitles = [
  "Yaprakların arasından göğe",
  "Güneşin izinde, kumların ötesine",
  "Buzun içindeki ışığı bul",
  "Yıldızların arasında son yolculuk",
];
function island(world: number): string {
  const colors = [
    ["#418c70", "#215b56", "#a6d38a"],
    ["#d09364", "#86565b", "#f4cf8e"],
    ["#8dbcd5", "#456f99", "#e0f4ff"],
    ["#8a7fc2", "#48476e", "#dbbaff"],
  ][world - 1];
  return `<svg class="map-island" viewBox="0 0 360 600" aria-hidden="true"><defs><linearGradient id="island-${world}" x2="0" y2="1"><stop stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient></defs><path d="M35 390 Q-20 330 43 280 Q9 190 95 150 Q65 68 146 48 Q224 2 284 80 Q365 123 322 215 Q397 296 320 374 Q322 478 208 540 Q78 518 35 390" fill="url(#island-${world})" stroke="${colors[2]}" stroke-width="5"/><path d="M43 401 Q140 518 280 458 L210 585 130 553Z" fill="${colors[1]}"/><path d="M68 369 Q150 420 291 387" fill="none" stroke="${colors[2]}" stroke-opacity=".25" stroke-width="24"/>${Array.from(
    { length: 17 },
    (_, i) => {
      const x = 40 + ((i * 71) % 280),
        y = 80 + ((i * 67) % 390);
      return world === 1
        ? `<path d="M${x} ${y + 22}v-30" stroke="#183f46" stroke-width="5"/><ellipse cx="${x}" cy="${y - 18}" rx="16" ry="25" fill="${i % 2 ? "#70ae7c" : "#245f57"}"/><ellipse cx="${x - 4}" cy="${y - 26}" rx="10" ry="15" fill="#a8ce87" opacity=".4"/>`
        : world === 2
          ? `<path d="M${x - 12} ${y + 10}h24l-4-30h-16Z" fill="${i % 2 ? "#af7360" : "#edba80"}"/><path d="M${x - 14} ${y - 20}h28" stroke="#ffe1a0" stroke-width="5"/>`
          : `<path d="M${x - 10} ${y + 20}l-4-34 15-15 13 25-8 24Z" fill="${colors[2]}" opacity="${i % 2 ? ".7" : ".35"}"/><path d="M${x + 1} ${y - 29}v48" stroke="#fff" opacity=".5"/>`;
    },
  ).join("")}</svg>`;
}
export class WorldMapScene extends Phaser.Scene {
  constructor() {
    super("WorldMapScene");
  }
  create(): void {
    const stars = Object.values(save.data.adventure.levels).reduce(
      (n, l) => n + l.bestStars,
      0,
    );
    const current = LEVELS.find(
      (l) =>
        isUnlocked(l.id, save.data) &&
        !save.data.adventure.levels[l.id]?.bestStars,
    )?.id;
    panel(
      `<div class="atlas"><header class="atlas-header"><button data-action="menu" aria-label="Menüye dön">${icon("arrow")}</button><div><p>MACERA</p><h1>Dünya atlası</h1></div><span>★ ${stars}/60</span></header><div class="atlas-scroll" tabindex="0" aria-label="Dünya haritası">${WORLDS.map(
        (name, i) =>
          `<article class="biome biome-${i + 1}"><header><span>DÜNYA 0${i + 1}</span><h2>${name}</h2><p>${subtitles[i]}</p></header><div class="island-route">${island(i + 1)}<svg class="route-line" viewBox="0 0 360 600" preserveAspectRatio="none" aria-hidden="true"><path d="M101 490 C105 437 220 452 223 405 S310 335 270 290 S125 266 155 205 S66 153 104 95" fill="none" stroke="#092e3b55" stroke-width="13"/><path d="M101 490 C105 437 220 452 223 405 S310 335 270 290 S125 266 155 205 S66 153 104 95" fill="none" stroke="#ffe6a5" stroke-width="5" stroke-dasharray="3 12" stroke-linecap="round"/></svg>${LEVELS.filter(
            (l) => l.world === i + 1,
          )
            .map((l, j) => {
              const open = isUnlocked(l.id, save.data),
                s = save.data.adventure.levels[l.id]?.bestStars ?? 0;
              return `<div class="route-stop ${open ? "open" : "locked"} ${l.id === current ? "current" : ""}" style="--x:${positions[j][0]}%;--y:${positions[j][1]}px"><button data-action="${l.id}" ${open ? "" : "disabled"} aria-label="${l.id} ${l.name}. ${open ? s + " yıldız" : "Kilitli: önceki bölümü tamamla"}">${open ? l.order : icon("shield")}</button><span class="node-name">${l.name}</span><span class="node-stars" aria-hidden="true">${open ? "★".repeat(s) + "☆".repeat(3 - s) : "Kilitli"}</span>${l.id === current ? "<em>BURADASIN</em>" : ""}</div>`;
            })
            .join("")}</div></article>`,
      ).join(
        "",
      )}<p class="atlas-end">Her uçuş yeni bir başlangıç.</p></div></div>`,
      (a) => {
        if (a === "menu") {
          this.scene.start("MenuScene");
          return;
        }
        if (isUnlocked(a, save.data))
          void startRun(this, {
            mode: "adventure",
            levelId: a,
            skinId: save.data.inventory.selectedSkin,
          });
      },
    );
    document.querySelector("#ui")!.classList.add("map-screen");
    const scroll = document.querySelector(".atlas-scroll")!;
    const active = document.querySelector(".route-stop.current");
    if (active)
      scroll.scrollTop = Math.max(
        0,
        (active.closest("article") as HTMLElement).offsetTop - 120,
      );
  }
}
