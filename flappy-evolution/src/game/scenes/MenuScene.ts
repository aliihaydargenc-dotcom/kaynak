import Phaser from "phaser";
import { character } from "../data/characters";
import { button, panel } from "../../ui/UiBridge";
import { icon } from "../../ui/icons";
import { startRun } from "../../ui/startRun";
import { save } from "../data/SaveManager";
import { acquireRunLock, releaseRunLock } from "../data/RunLock";
import { evolution } from "../data/ProgressionService";
import { SKINS, SKIN_NAMES, TRAILS, TRAIL_NAMES } from "../constants";
export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }
  create(): void {
    this.home();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.children.removeAll(true);
    });
  }
  private notice(): string {
    return `<p class="notice" role="status">${save.forwardSchema ? "Bu kayıt daha yeni bir sürüme ait. İlerleme bu oturumda saklanıyor." : save.sessionOnly ? "İlerleme bu oturumda saklanıyor" : ""}</p>`;
  }
  public home(): void {
    const stars = Object.values(save.data.adventure.levels).reduce(
        (n, l) => n + l.bestStars,
        0,
      ),
      final = (save.data.adventure.levels["4-5"]?.bestStars ?? 0) > 0;
    panel(
      `<div class="home-top"><span class="wordmark">${icon("wing")} FLAPPY EVOLUTION</span><span class="balance">${icon("coin")}<span aria-label="Sınırsız jeton">∞</span></span></div><div class="hero-art"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><img src="/icons/skin-${save.data.inventory.selectedSkin}.svg" alt="${character(save.data.inventory.selectedSkin).label}" width="180" height="160"><span class="hero-tag">${character(save.data.inventory.selectedSkin).label} · ${save.data.xp} XP</span></div><h1 class="home-title">Uçuşa başla</h1><div class="mode-cards"><button class="mode-card primary" data-action="adventure" aria-label="Macera">${icon("map")}<span><strong>Macera</strong><small>${stars}/60 yıldız</small></span>${icon("arrow")}</button><button class="mode-card" data-action="endless" aria-label="Sonsuz Uçuş">${icon("infinity")}<span><strong>Sonsuz Uçuş</strong><small>Rekor ${save.data.endless.bestScore}</small></span>${icon("arrow")}</button></div><div class="grid menu-tools">${button("wardrobe", icon("hanger") + " Gardırop")}${button("settings", icon("settings") + " Ayarlar")}</div>${final ? '<p class="final-badge">Evrim Kapısı tamamlandı · Nova rozeti</p>' : ""}${this.notice()}<p id="offline-status" class="notice" role="status"></p><div id="update-slot"></div>`,
      (a) => {
        if (a === "adventure") this.scene.start("WorldMapScene");
        else if (a === "endless")
          void startRun(this, {
            mode: "endless",
            skinId: save.data.inventory.selectedSkin,
          });
        else if (a === "wardrobe") this.wardrobe();
        else this.settings();
      },
    );
    window.dispatchEvent(new Event("flappy-menu"));
  }
  private wardrobe(message = ""): void {
    const inv = save.data.inventory;
    panel(
      `<p class="eyebrow">${evolution(save.data.xp)} · ${save.data.xp} XP</p><h1>Gardırop</h1><p role="status">${message}</p><h2>Karakterler</h2><div class="grid">${SKINS.map(
        (id, i) => {
          const owned = inv.skins.includes(id),
            selected = inv.selectedSkin === id;
          return `<button data-action="skin:${id}" aria-pressed="${selected}" ${owned ? "" : "disabled"}><span class="skin-preview skin-${id}"><img src="/icons/skin-${id}.svg" alt="" width="72" height="64"></span><strong>${SKIN_NAMES[i]} · K${i + 1}</strong><p class="power-description">${character(id).description}</p><small>${selected ? "Seçili" : owned ? "Seç" : `Kilitli · Dünya ${i} tamamla`}</small></button>`;
        },
      ).join("")}</div><h2>Uçuş izleri</h2><div class="grid">${Object.entries(
        TRAILS,
      )
        .map(([id]) => {
          const owned = inv.trails.includes(id);
          return `<button data-action="trail:${id}" aria-pressed="${inv.selectedTrail === id}"><strong>${TRAIL_NAMES[id as keyof typeof TRAIL_NAMES]}</strong><small>${inv.selectedTrail === id ? "Seçili" : owned ? "Seç" : "Ücretsiz · Aç"}</small></button>`;
        })
        .join(
          "",
        )}</div><p class="balance">${icon("coin")} Sınırsız jeton · ∞</p>${button("back", "Menüye dön")}${this.notice()}`,
      (a) => {
        if (a === "back") {
          this.home();
          return;
        }
        void this.cosmetic(a);
      },
    );
  }
  private async cosmetic(action: string): Promise<void> {
    if (!(await acquireRunLock())) {
      this.wardrobe("Başka sekmede uçuş veya satın alma açık.");
      return;
    }
    try {
      const [kind, id] = action.split(":");
      if (kind === "skin") {
        save.select("skin", id);
        this.wardrobe();
      } else if (save.data.inventory.trails.includes(id)) {
        save.select("trail", id);
        this.wardrobe();
      } else {
        const bought = save.buy(id);
        this.wardrobe(
          bought
            ? "Yeni izin gardırobunda hazır."
            : "Bu iz zaten açık veya kullanılamıyor.",
        );
      }
    } finally {
      releaseRunLock();
    }
  }
  private settings(): void {
    panel(
      `<h1>Ayarlar</h1><div class="settings-list">${button("sound", save.data.settings.sound ? "Ses: Açık" : "Ses: Kapalı")}<label for="motion">Dekoratif hareket</label><select id="motion"><option value="system" ${save.data.settings.reducedMotion === "system" ? "selected" : ""}>Sistem tercihi</option><option value="on" ${save.data.settings.reducedMotion === "on" ? "selected" : ""}>Azaltılmış</option><option value="off" ${save.data.settings.reducedMotion === "off" ? "selected" : ""}>Tam hareket</option></select>${button("fullscreen", "Tam ekranı dene")}<p>Dokun / Space / ↑: yüksel · F: ateş · Esc: duraklat</p><h2>Yerel rekorlar</h2><p>${save.data.endless.topScores.length ? save.data.endless.topScores.join(" · ") : "İlk rekorunu yazmak için Sonsuz Uçuş’a başla."}</p></div>${button("back", "Menüye dön", true)}${this.notice()}`,
      (a) => {
        if (a === "back") this.home();
        else if (a === "sound") {
          save.setSettings(
            !save.data.settings.sound,
            save.data.settings.reducedMotion,
          );
          this.settings();
        } else void this.fullscreen();
      },
    );
    document.querySelector<HTMLSelectElement>("#motion")!.onchange = (e) => {
      save.setSettings(
        save.data.settings.sound,
        (e.target as HTMLSelectElement).value as "on" | "off" | "system",
      );
      document.documentElement.dataset.motion =
        save.data.settings.reducedMotion;
    };
  }
  private async fullscreen(): Promise<void> {
    try {
      await document.documentElement.requestFullscreen?.();
      await (
        screen.orientation as ScreenOrientation & {
          lock?: (o: string) => Promise<void>;
        }
      ).lock?.("portrait");
    } catch {
      /* Unsupported optional API never blocks the game. */
    }
  }
}
