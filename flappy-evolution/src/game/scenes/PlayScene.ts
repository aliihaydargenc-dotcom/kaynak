import Phaser from "phaser";
import { SceneAtmosphere } from "../systems/SceneAtmosphere";
import { character, type CharacterPower } from "../data/characters";
import { CombatModel } from "../systems/CombatModel";
import { CombatView } from "../systems/CombatView";
import { icon } from "../../ui/icons";
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
  public combat!: CombatModel;
  public power!: CharacterPower;
  private combatView!: CombatView;
  private bossStarted = false;
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
  private atmosphere!: SceneAtmosphere;
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
    this.power = character(this.request.skinId);
    this.combat = new CombatModel(this.power);
    this.combatView = new CombatView(this, this.combat);
    this.bossStarted = false;
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
      .text(240, 226, "Dokun ve uç", {
        fontFamily: "system-ui",
        fontSize: "22px",
        color: "#ffffff",
        stroke: "#23465c",
        strokeThickness: 5,
        fontStyle: "bold",
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
      this.combatView.dispose();
      clearPanel();
    });
    this.refreshHud();
    document.querySelector<HTMLElement>("#app")?.focus({ preventScroll: true });
  }
  private createBackground(): void {
    this.atmosphere = new SceneAtmosphere(this, this.level?.world ?? 1);
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
    if (e.code === "KeyF" && this.phase === "playing") {
      e.preventDefault();
      this.fire();
      return;
    }
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
    this.bird.flap(this.power.flap);
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
          if (this.phase === "ready") this.status.setText("Dokun ve uç");
          this.lastHud = "";
          this.refreshHud();
        }
      }
      return;
    }
    if (this.phase !== "playing") {
      if (this.phase === "ready") {
        this.bird.updateBird(delta);
        this.atmosphere.update(delta);
      }
      return;
    }
    this.activeMs += delta;
    this.difficulty = this.profile(delta);
    this.bird.updateBird(delta);
    this.badge?.setPosition(this.bird.x, this.bird.y);
    this.spawnCooldown -= delta;
    if (!this.bossStarted && this.spawnCooldown <= 0) {
      this.obstacles.spawn(this.difficulty, this.activeMs / 1000);
      this.spawnCooldown += this.difficulty.spawnDelay;
    }
    this.updateWind(delta);
    if (this.combat.update(delta, this.bird.y)) this.audioSystem.warning();
    // Resolve hostile contacts first, so a simultaneous boss kill cannot erase a player hit.
    for (const shot of this.combat.shots) {
      if (
        shot.active &&
        shot.enemy &&
        this.combat.contact(shot, "player", this.bird.getHitbox())
      ) {
        if (!this.combat.absorb()) {
          this.finishRun("dead");
          return;
        }
        this.audioSystem.hit();
        this.burst(this.bird.x, this.bird.y, 0x8eeeff, 8);
      }
    }
    for (const shot of this.combat.shots) {
      if (!shot.active || shot.enemy) continue;
      for (const pair of this.obstacles.pairs)
        if (
          pair.wall &&
          this.combat.contact(shot, pair.wallId, pair.wall.getBounds())
        ) {
          this.burst(pair.wall.x, pair.wall.y, 0xffcc8a, 10);
          this.audioSystem.break();
          pair.wall.destroy();
          pair.wall = undefined;
        }
      if (this.combat.hitBoss(shot)) {
        this.audioSystem.boss();
        this.burst(this.combat.boss!.x, this.combat.boss!.y, 0xffd18e, 6);
      }
    }
    this.combatView.render(this.bird.x, this.bird.y, this.reducedMotion());
    this.obstacles.move(this.activeMs / 1000, delta, this.difficulty.speed);
    // Collision precedes every reward, including the final adventure gate.
    if (this.obstacles.collision(this.bird.getHitbox())) {
      if (!this.combat.absorb()) {
        this.finishRun("dead");
        return;
      }
      if (this.bird.y < 80 || this.bird.y > 680) {
        this.bird.setPosition(
          this.bird.x,
          Phaser.Math.Clamp(this.bird.y, 85, 670),
        );
        (this.bird.body as Phaser.Physics.Arcade.Body).reset(
          this.bird.x,
          this.bird.y,
        );
      }
    }
    this.collectRewards();
    if (
      this.level &&
      this.passedGates >= this.level.gates &&
      !this.bossStarted
    ) {
      this.bossStarted = true;
      this.obstacles.clear();
      this.combat.startBoss(this.level.world, this.level.order);
      this.combat.boss!.aimY = this.bird.y;
      this.audioSystem.warning();
    }
    if (this.combat.boss?.state === "defeated") {
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
        if (
          this.power.magnet &&
          Phaser.Math.Distance.Between(
            this.bird.x,
            this.bird.y,
            p.coin.x,
            p.coin.y,
          ) <= this.power.magnet
        ) {
          this.pickupCoins++;
          this.audioSystem.coin();
          this.burst(p.coin.x, p.coin.y, 0xf4ca75, 8);
          p.coin.destroy();
          p.coin = undefined;
        }
      }
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
    this.atmosphere.update(delta);
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
    const ring = this.add
      .circle(this.bird.x - 12, this.bird.y + 10, 9)
      .setStrokeStyle(2, 0xf9f4df, 0.65)
      .setDepth(19);
    this.tweens.add({
      targets: ring,
      x: ring.x - 22,
      scale: 2.8,
      alpha: 0,
      duration: 240,
      ease: "Sine.Out",
      onComplete: () => ring.destroy(),
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
        alpha: 0,
        scale: 0.25,
        duration: 380,
        ease: "Cubic.Out",
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
      this.burst(
        this.bird.x,
        this.bird.y,
        outcome === "won" ? 0xf4ca75 : 0xf9f4df,
        12,
      );
      if (outcome === "dead") {
        this.cameras.main.shake(180, 0.006);
        this.cameras.main.flash(160, 255, 227, 192, false);
        this.bird.setTint(0xffc3a1);
        const ring = this.add
          .circle(this.bird.x, this.bird.y, 15)
          .setStrokeStyle(4, 0xffedca)
          .setDepth(60);
        this.tweens.add({
          targets: ring,
          scale: 5,
          alpha: 0,
          duration: 450,
          onComplete: () => ring.destroy(),
        });
      }
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
      characterId: this.power.id,
      allPassesCentered: this.allPassesCentered,
      activeDurationMs: this.activeMs,
    });
    const reward = save.commitRun(this.summary);
    releaseRunLock(this.lockToken);
    this.combatView.render(this.bird.x, this.bird.y, this.reducedMotion());
    this.phase = "results";
    panel(
      `<div class="result-emblem" aria-hidden="true">${icon(outcome === "won" ? "wing" : "infinity")}</div><p class="eyebrow">${this.level ? `${this.level.id} · ${this.level.name}` : "Sonsuz Uçuş"}</p><h1>${outcome === "won" ? "Bölüm tamamlandı" : "Uçuş bitti"}</h1><div class="stars" aria-label="${reward.stars} yıldız">${"★".repeat(reward.stars)}${"☆".repeat(3 - reward.stars)}</div><div class="result-stats"><strong>${this.score}<small>skor</small></strong><strong>+${reward.coins}<small>jeton</small></strong><strong>+${reward.xp}<small>XP</small></strong></div><p>${this.passedGates} geçiş · ${this.pickupCoins} jeton · ${this.nearMisses} yakın geçiş</p>${this.level ? (outcome === "won" && this.level.id !== "4-5" ? button("next", "Sonraki bölüm", true) : "") : ""}${button("retry", "Tekrar dene", !this.level || outcome === "dead")}${button("menu", "Menüye dön")}<p class="notice">${save.sessionOnly ? "İlerleme bu oturumda saklanıyor" : ""}</p>`,
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
    document.querySelector("#ui")!.classList.add("result-screen");
  }
  public fire(): void {
    if (this.phase !== "playing") return;
    this.audioSystem.resume();
    if (this.combat.fire(this.bird.x, this.bird.y)) this.audioSystem.fire();
    this.refreshHud();
  }
  private refreshHud(): void {
    const boss = this.combat.boss;
    const canFire = this.power.damage > 0 || !!boss;
    const ready = this.combat.cooldown <= 0;
    const cooldown = Math.round(
      100 * (1 - this.combat.cooldown / this.power.cooldown),
    );
    const coins = (this.pickupCoins + this.bonusCoins) * this.power.multiplier;
    const text = `${this.score}:${coins}:${boss?.hp}:${boss?.phase}:${boss?.state}:${this.combat.shields}:${cooldown}:${save.data.settings.sound}`;
    if (text === this.lastHud) return;
    if (text === this.lastHud) return;
    // Preserve DOM nodes while the counter and cooldown change: keyboard focus and pointer targets stay stable.
    if (document.querySelector("#flight-hud")) {
      const set = (id: string, value: string) => {
        const el = document.getElementById(id);
        if (el && el.textContent !== value) el.textContent = value;
      };
      set(
        "run-score",
        String(
          this.level ? `${this.passedGates}/${this.level.gates}` : this.score,
        ),
      );
      set("run-coins", String(coins));
      set("shield-count", String(this.combat.shields));
      set(
        "boss-name",
        boss ? `${boss.definition.name} · Faz ${boss.phase}` : "",
      );
      const bossPanel = document.getElementById("boss-panel")!;
      bossPanel.hidden = !boss;
      const hp = document.querySelector<HTMLProgressElement>("#boss-hp")!;
      hp.max = boss?.maxHealth ?? 1;
      hp.value = boss?.hp ?? 0;
      set(
        "boss-warning",
        boss?.state === "windup"
          ? "Saldırı hazırlanıyor"
          : boss?.state === "attack"
            ? "Kaçın!"
            : "Ateş et",
      );
      const fire = document.querySelector<HTMLButtonElement>(
        '[data-action="fire"]',
      )!;
      fire.disabled = !canFire || !ready;
      fire.style.setProperty("--charge", `${cooldown}%`);
      fire.setAttribute(
        "aria-label",
        !canFire
          ? "Ateş topu: Kademe 3 ile açılır"
          : ready
            ? "Ateş et"
            : `Doluyor: ${(this.combat.cooldown / 1000).toFixed(1)} saniye`,
      );
      set(
        "fire-label",
        !canFire
          ? "Kademe 3"
          : ready
            ? "Ateş et"
            : `${(this.combat.cooldown / 1000).toFixed(1)}s`,
      );
      if (coins !== Number(this.lastHud.split(":")[1]) && !this.reducedMotion())
        document
          .getElementById("run-coins")
          ?.animate([{ transform: "scale(1.3)" }, { transform: "scale(1)" }], {
            duration: 200,
          });
      this.lastHud = text;
      return;
    }
    this.lastHud = text;
    hud(
      `<div id="flight-hud"><div class="flight-top glass"><div class="flight-score"><small>${this.level ? this.level.id + " · " + this.level.name : "SONSUZ UÇUŞ"}</small><strong id="run-score">${this.level ? `${this.passedGates}/${this.level.gates}` : this.score}</strong></div><div class="coin-pill">${icon("coin")}<b id="run-coins">${coins}</b></div><button data-action="sound" class="hud-icon" aria-label="${save.data.settings.sound ? "Ses açık" : "Ses kapalı"}">${icon(save.data.settings.sound ? "sound" : "muted")}</button><button data-action="pause" class="hud-icon" aria-label="Duraklat">${icon("pause")}</button></div><div id="boss-panel" class="boss-panel glass" ${boss ? "" : "hidden"}><div><strong id="boss-name">${boss?.definition.name ?? ""}</strong><span id="boss-warning"></span></div><progress id="boss-hp" aria-label="Boss canı" max="${boss?.maxHealth ?? 1}" value="${boss?.hp ?? 0}"></progress></div><div class="flight-bottom"><div class="power-chip glass">${icon("shield")}<span><b>${this.power.label} · K${this.power.tier}</b><small>Kalkan <span id="shield-count">${this.combat.shields}</span> · ${this.power.multiplier}× jeton</small></span></div><button data-action="fire" class="fire-control" style="--charge:${cooldown}%" aria-label="Ateş et" ${!canFire || !ready ? "disabled" : ""}>${icon("fire")}<span id="fire-label">${canFire ? "Ateş et" : "Kademe 3"}</span><kbd>F</kbd></button></div></div>`,
      (a) => {
        if (a === "pause") this.pauseRun();
        else if (a === "fire") this.fire();
        else {
          save.setSettings(
            !save.data.settings.sound,
            save.data.settings.reducedMotion,
          );
          this.audioSystem.enabled = save.data.settings.sound;
          const sound = document.querySelector<HTMLButtonElement>(
            '[data-action="sound"]',
          );
          if (sound) {
            sound.setAttribute(
              "aria-label",
              save.data.settings.sound ? "Ses açık" : "Ses kapalı",
            );
            sound.innerHTML = icon(
              save.data.settings.sound ? "sound" : "muted",
            );
          }
          this.refreshHud();
        }
      },
    );
  }
}
