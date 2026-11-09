import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants";
import { startRun } from "../../ui/startRun";
import { currentRunLock, releaseRunLock } from "../data/RunLock";
import { save } from "../data/SaveManager";
import { getLevel, isUnlocked, type Level } from "../data/levels";
import { Bird } from "../entities/Bird";
import { AudioSystem } from "../systems/AudioSystem";
import { DifficultyDirector } from "../systems/DifficultyDirector";
import { ObstacleSystem } from "../systems/ObstacleSystem";
import { panel, button, hud, clearPanel } from "../../ui/UiBridge";
import type {
  GamePhase,
  RunRequest,
  RunSummary,
  DifficultyState,
} from "../types";
export class PlayScene extends Phaser.Scene {
  public bird!: Bird;
  public obstacles!: ObstacleSystem;
  public phase: GamePhase = "ready";
  public activeMs = 0;
  public score = 0;
  public passedGates = 0;
  public pickupCoins = 0;
  public bonusCoins = 0;
  public nearMisses = 0;
  public allPassesCentered = true;
  public request!: RunRequest;
  public summary: Readonly<RunSummary> | null = null;
  private lockToken = 0;
  private level?: Level;
  private runId = "";
  private director = new DifficultyDirector();
  private difficulty!: DifficultyState;
  private spawnCooldown = 450;
  private audioSystem!: AudioSystem;
  private resumedPhase: "ready" | "playing" = "playing";
  private countdown = 0;
  private windTick = 6000;
  private windRemaining = 0;
  private windForce = 0;
  private status!: Phaser.GameObjects.Text;
  private windLabel!: Phaser.GameObjects.Text;
  private debug!: Phaser.GameObjects.Graphics;
  private badge?: Phaser.GameObjects.Arc;
  private scenery?: Phaser.GameObjects.TileSprite;
  private trailMs = 0;
  private lastHud = "";
  public flapCount = 0;
  constructor() {
    super("PlayScene");
  }
  create(data: RunRequest): void {
    this.request = {
      ...data,
      skinId: save.data.inventory.skins.includes(data.skinId)
        ? data.skinId
        : "spark",
    };
    this.level = data.mode === "adventure" ? getLevel(data.levelId) : undefined;
    if (
      data.mode === "adventure" &&
      (!this.level || !isUnlocked(data.levelId, save.data))
    ) {
      releaseRunLock();
      this.scene.start("MenuScene");
      return;
    }
    this.lockToken = currentRunLock();
    this.physics.world.resume();
    this.runId = crypto.randomUUID();
    this.phase = "ready";
    this.activeMs = 0;
    this.score = 0;
    this.passedGates = 0;
    this.pickupCoins = 0;
    this.bonusCoins = 0;
    this.nearMisses = 0;
    this.allPassesCentered = true;
    this.summary = null;
    this.flapCount = 0;
    this.countdown = 0;
    this.spawnCooldown = 450;
    this.windTick = 6000;
    this.windRemaining = 0;
    this.lastHud = "";
    this.trailMs = 0;
    this.badge = undefined;
    this.director.reset();
    this.difficulty = this.profile(0);
    this.obstacles = new ObstacleSystem(this, this.level);
    this.audioSystem = new AudioSystem(this);
    this.audioSystem.enabled = save.data.settings.sound;
    this.createBackground();
    this.bird = new Bird(this, GAME_WIDTH * 0.3, GAME_HEIGHT * 0.46);
    this.bird.applyAppearance(this.request.skinId);
    this.bird.setGameplayGravity(false);
    if (save.data.xp >= 500) {
      this.badge = this.add
        .circle(this.bird.x, this.bird.y, 39)
        .setStrokeStyle(
          save.data.xp >= 3000 ? 3 : 2,
          save.data.xp >= 1500 ? 0xe3c5ff : 0xffd779,
          0.7,
        )
        .setDepth(24);
    }
    this.status = this.add
      .text(240, 172, "Dokun ve uç", {
        fontFamily: "system-ui",
        fontSize: "25px",
        color: "#ffffff",
        backgroundColor: "#102e32",
        padding: { x: 16, y: 10 },
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(70);
    this.windLabel = this.add
      .text(240, 240, "", {
        fontFamily: "system-ui",
        fontSize: "22px",
        color: "#ffffff",
        backgroundColor: "#102e32",
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(70)
      .setVisible(false);
    this.debug = this.add.graphics().setDepth(90);
    this.input.on("pointerdown", this.pointer, this);
    window.addEventListener("keydown", this.key);
    window.addEventListener("blur", this.blur);
    document.addEventListener("visibilitychange", this.visibility);
    window.addEventListener("storage", this.storage);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off("pointerdown", this.pointer, this);
      window.removeEventListener("keydown", this.key);
      window.removeEventListener("blur", this.blur);
      document.removeEventListener("visibilitychange", this.visibility);
      window.removeEventListener("storage", this.storage);
      releaseRunLock(this.lockToken);
      this.audioSystem.dispose();
      this.time.removeAllEvents();
      this.tweens.killAll();
      this.obstacles.clear();
      clearPanel();
    });
    this.refreshHud();
    document.querySelector<HTMLElement>("#app")?.focus({ preventScroll: true });
  }
  private createBackground(): void {
    const world = this.level?.world ?? 1;
    this.add.image(240, 427, `world-${world}`).setDepth(0);
    this.scenery = this.add
      .tileSprite(240, 625, 480, 250, `landscape-${world}`)
      .setDepth(2);
  }
  private profile(delta: number): DifficultyState {
    return this.level
      ? {
          intensity: 0,
          speed: this.level.speed,
          pipeGap: this.level.gap,
          spawnDelay: this.level.interval,
          swayChance: 0,
          pulseChance: 0,
          coinChance: 0,
          windChance: 0,
        }
      : this.director.update(delta, this.score);
  }
  private pointer(): void {
    this.flap();
  }
  private key = (e: KeyboardEvent): void => {
    if (e.repeat) return;
    if (
      e.code === "Escape" &&
      (this.phase === "ready" || this.phase === "playing")
    ) {
      e.preventDefault();
      this.pauseRun();
      return;
    }
    if (
      (e.code === "Space" || e.code === "ArrowUp") &&
      document.activeElement?.tagName !== "BUTTON" &&
      document.activeElement?.tagName !== "SELECT"
    ) {
      e.preventDefault();
      this.flap();
    }
  };
  private blur = (): void => {
    this.pauseRun();
  };
  private visibility = (): void => {
    if (document.hidden) this.pauseRun();
  };
  private storage = (e: StorageEvent): void => {
    if (e.key === "flappy_evolution_save_v1") {
      this.pauseRun();
      panel(
        `<p class="eyebrow">Kayıt değişti</p><h1>Başka sekme açık</h1><p>İlerleme başka sekmede değişti. Devam etmek için bu sayfayı yenile.</p>${button("reload", "Yeniden yükle", true)}`,
        () => location.reload(),
        true,
      );
    }
  };
  public flap(): void {
    if (this.phase === "ready") {
      this.phase = "playing";
      this.status.setVisible(false);
      this.bird.setGameplayGravity(true);
    } else if (this.phase !== "playing") return;
    this.bird.flap();
    this.flapRipple();
    this.flapCount++;
    this.audioSystem.resume();
    this.audioSystem.flap();
  }
  public update(_time: number, rawDelta: number): void {
    // Large suspended deltas never advance obstacles or active clocks.
    const delta = Math.min(rawDelta, 50);
    if (this.phase === "paused") {
      if (this.countdown > 0) {
        this.countdown -= delta;
        this.status.setText(
          String(Math.max(1, Math.ceil(this.countdown / 1000))),
        );
        if (this.countdown <= 0) {
          this.phase = this.resumedPhase;
          this.physics.world.resume();
          this.tweens.resumeAll();
          this.bird.anims.resume();
          this.status.setVisible(this.phase === "ready");
          if (this.phase === "ready")
            this.status.setText("Dokun ve uç");
          this.lastHud = "";
          this.refreshHud();
        }
      }
      return;
    }
    if (this.phase !== "playing") {
      if (this.phase === "ready") this.bird.updateBird(delta);
      return;
    }
    this.activeMs += delta;
    this.difficulty = this.profile(delta);
    this.bird.updateBird(delta);
    this.badge?.setPosition(this.bird.x, this.bird.y);
    this.spawnCooldown -= delta;
    if (this.spawnCooldown <= 0) {
      this.obstacles.spawn(this.difficulty, this.activeMs / 1000);
      this.spawnCooldown += this.difficulty.spawnDelay;
    }
    this.updateWind(delta);
    this.obstacles.move(this.activeMs / 1000, delta, this.difficulty.speed);
    // Collision precedes every reward, including the final adventure gate.
    if (this.obstacles.collision(this.bird.getHitbox())) {
      this.finishRun("dead");
      return;
    }
    this.collectRewards();
    if (this.level && this.passedGates >= this.level.gates) {
      this.finishRun("won");
      return;
    }
    this.updateDecoration(delta);
    this.refreshHud();
    this.drawDebug();
  }
  private collectRewards(): void {
    for (const p of this.obstacles.pairs) {
      if (p.coin) {
        const b = p.coin.getBounds();
        const r = new Phaser.Geom.Rectangle(
          b.x + 12,
          b.y + 12,
          b.width - 24,
          b.height - 24,
        );
        if (
          Phaser.Geom.Intersects.RectangleToRectangle(this.bird.getHitbox(), r)
        ) {
          this.pickupCoins++;
          this.audioSystem.coin();
          this.burst(p.coin.x, p.coin.y, 0xf4ca75, 8);
          p.coin.destroy();
          p.coin = undefined;
        }
      }
      if (!p.scored && p.x < this.bird.x - 24) {
        p.scored = true;
        this.passedGates++;
        this.score++;
        this.audioSystem.score();
        this.burst(this.bird.x + 32, this.bird.y, 0xb9e6cf, 4);
        const distance = Math.abs(this.bird.y - p.currentCenter);
        if (distance > 40) this.allPassesCentered = false;
        if (p.currentGap * 0.5 - distance < 18) {
          this.nearMisses++;
          this.score++;
          this.bonusCoins++;
        }
      }
    }
  }
  private updateWind(delta: number): void {
    if (this.level) {
      if (this.level.world !== 4) return;
      const event = Math.floor(Math.max(0, this.activeMs - 9000) / 12000);
      const start = 10000 + event * 12000;
      const remaining = start - this.activeMs;
      const force = event % 2 === 0 ? -120 : 120;
      const active = remaining <= 0 && remaining > -1800;
      this.windLabel.setVisible((remaining <= 1000 && remaining > 0) || active);
      this.windLabel.setText(
        `${force < 0 ? "↑" : "↓"} ${active ? "Rüzgâr" : "Rüzgâr yaklaşıyor"}`,
      );
      if (active) this.bird.pushVertical((force * delta) / 1000);
      return;
    }
    if (this.windRemaining > 0) {
      this.windRemaining -= delta;
      this.bird.pushVertical((this.windForce * delta) / 1000);
      this.windLabel
        .setVisible(true)
        .setText(this.windForce < 0 ? "↑ Yükselen akım" : "↓ Alçalan akım");
      return;
    }
    this.windLabel.setVisible(false);
    this.windTick -= delta;
    if (this.windTick <= 0) {
      this.windTick = Phaser.Math.Between(4200, 8400);
      if (Math.random() < this.difficulty.windChance) {
        this.windForce = Phaser.Math.Between(-390, 390);
        this.windRemaining = Phaser.Math.Between(1800, 3200);
      }
    }
  }
  private reducedMotion(): boolean {
    return (
      save.data.settings.reducedMotion === "on" ||
      (save.data.settings.reducedMotion === "system" &&
        matchMedia("(prefers-reduced-motion: reduce)").matches)
    );
  }
  private updateDecoration(delta: number): void {
    if (this.reducedMotion()) return;
    if (this.scenery) this.scenery.tilePositionX += delta * 0.025;
    this.trailMs -= delta;
    const trail = save.data.inventory.selectedTrail;
    if (trail === "none" || this.trailMs > 0) return;
    this.trailMs = 65;
    const color =
      trail === "leaf" ? 0x7bc896 : trail === "sand" ? 0xe8b36c : 0xe6d4ff;
    const p = this.add
      .circle(this.bird.x - 20, this.bird.y, 4, color)
      .setDepth(18);
    this.tweens.add({
      targets: p,
      x: p.x - 45,
      alpha: 0,
      scale: 0,
      duration: 350,
      onComplete: () => p.destroy(),
    });
  }
  // Effects use separate objects: Bird scale, origin and hitbox stay unchanged.
  private flapRipple(): void {
    if (this.reducedMotion()) return;
    const ring = this.add.circle(this.bird.x - 12, this.bird.y + 10, 9)
      .setStrokeStyle(2, 0xf9f4df, 0.65).setDepth(19);
    this.tweens.add({
      targets: ring, x: ring.x - 22, scale: 2.8, alpha: 0,
      duration: 240, ease: "Sine.Out", onComplete: () => ring.destroy(),
    });
  }
  private burst(x: number, y: number, color: number, count: number): void {
    if (this.reducedMotion()) return;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 22 + (i % 3) * 9;
      const mote = this.add.circle(x, y, i % 2 ? 2 : 3, color).setDepth(35);
      this.tweens.add({
        targets: mote,
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        alpha: 0, scale: 0.25, duration: 380, ease: "Cubic.Out",
        onComplete: () => mote.destroy(),
      });
    }
  }
  private drawDebug(): void {
    this.debug.clear();
    if (!new URLSearchParams(location.search).has("debug")) return;
    this.debug.lineStyle(2, 0xff0044);
    this.debug.strokeRectShape(this.bird.getHitbox());
    for (const p of this.obstacles.pairs)
      for (const r of this.obstacles.rects(p)) this.debug.strokeRectShape(r);
  }
  public pauseRun(): void {
    if (this.phase !== "playing" && this.phase !== "ready") {
      if (this.phase === "paused" && this.countdown > 0) {
        this.countdown = 0;
        this.showPause();
      }
      return;
    }
    this.resumedPhase = this.phase;
    this.phase = "paused";
    this.physics.world.pause();
    this.tweens.pauseAll();
    this.bird.anims.pause();
    this.audioSystem.stop();
    this.showPause();
  }
  private showPause(): void {
    panel(
      `<h1>Duraklatıldı</h1>${button("resume", "Devam et", true)}${button("menu", "Menüye dön")}`,
      (a) => {
        if (a === "resume") {
          this.countdown = 3000;
          hud("", () => {});
          this.status.setVisible(true).setText("3");
          document.querySelector<HTMLElement>("#app")?.focus();
        } else this.scene.start("MenuScene");
      },
      true,
    );
  }
  public finishRun(outcome: "won" | "dead"): void {
    if (this.phase !== "playing" || this.summary) return;
    this.phase = outcome;
    this.physics.world.pause();
    this.bird.kill();
    if (!this.reducedMotion()) {
      this.burst(this.bird.x, this.bird.y, outcome === "won" ? 0xf4ca75 : 0xf9f4df, 12);
      if (outcome === "dead") this.cameras.main.shake(140, 0.004);
    }
    this.windLabel.setVisible(false);
    this.audioSystem.stop();
    outcome === "won" ? this.audioSystem.unlock() : this.audioSystem.hit();
    this.summary = Object.freeze({
      runId: this.runId,
      mode: this.request.mode,
      levelId: this.level?.id,
      outcome,
      score: this.score,
      passedGates: this.passedGates,
      pickupCoins: this.pickupCoins,
      bonusCoins: this.bonusCoins,
      nearMisses: this.nearMisses,
      allPassesCentered: this.allPassesCentered,
      activeDurationMs: this.activeMs,
    });
    const reward = save.commitRun(this.summary);
    releaseRunLock(this.lockToken);
    this.phase = "results";
    panel(
      `<p class="eyebrow">${this.level ? `${this.level.id} · ${this.level.name}` : "Sonsuz Uçuş"}</p><h1>${outcome === "won" ? "Bölüm tamamlandı" : "Uçuş bitti"}</h1><div class="stars" aria-label="${reward.stars} yıldız">${"★".repeat(reward.stars)}${"☆".repeat(3 - reward.stars)}</div><div class="result-stats"><strong>${this.score}<small>skor</small></strong><strong>+${reward.coins}<small>jeton</small></strong><strong>+${reward.xp}<small>XP</small></strong></div><p>${this.passedGates} geçiş · ${this.pickupCoins} jeton · ${this.nearMisses} yakın geçiş</p>${this.level ? (outcome === "won" && this.level.id !== "4-5" ? button("next", "Sonraki bölüm", true) : "") : ""}${button("retry", "Tekrar dene", !this.level || outcome === "dead")}${button("menu", "Menüye dön")}<p class="notice">${save.sessionOnly ? "İlerleme bu oturumda saklanıyor" : ""}</p>`,
      (a) => {
        if (a === "retry") void startRun(this, this.request);
        else if (a === "next" && this.level) {
          const n =
            this.level.order === 5
              ? `${this.level.world + 1}-1`
              : `${this.level.world}-${this.level.order + 1}`;
          void startRun(this, {
            ...this.request,
            mode: "adventure",
            levelId: n,
          });
        } else this.scene.start("MenuScene");
      },
      true,
    );
  }
  private refreshHud(): void {
    const text = `${this.score}:${this.pickupCoins}:${this.bonusCoins}:${this.allPassesCentered}:${save.data.settings.sound}`;
    if (text === this.lastHud) return;
    this.lastHud = text;
    hud(
      `<div class="hud-top"><div class="hud-score"><strong>${this.level ? `${this.passedGates}/${this.level.gates}` : this.score}</strong><span>${this.level ? this.level.id + " · " + this.level.name : "Sonsuz Uçuş"}</span></div>${button("sound", save.data.settings.sound ? "Ses açık" : "Ses kapalı")}${button("pause", "Duraklat")}</div><div class="hud-bottom"><span>Jeton ${this.pickupCoins + this.bonusCoins}</span><span>${this.level ? (this.allPassesCentered ? "Kusursuz rota" : "Serbest rota") : "Rekor " + save.data.endless.bestScore}</span></div>`,
      (a) => {
        if (a === "pause") this.pauseRun();
        else {
          save.setSettings(
            !save.data.settings.sound,
            save.data.settings.reducedMotion,
          );
          this.audioSystem.enabled = save.data.settings.sound;
          this.refreshHud();
        }
      },
    );
  }
}
