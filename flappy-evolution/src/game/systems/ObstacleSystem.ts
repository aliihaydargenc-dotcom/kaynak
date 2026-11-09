import Phaser from "phaser";
import { GAME_WIDTH, PIPE_BODY_HEIGHT, PIPE_BODY_WIDTH } from "../constants";
import { AdventurePattern, type Level } from "../data/levels";
import type { DifficultyState, PipeVariant } from "../types";
export interface PipePair {
  x: number;
  gapCenter: number;
  gapSize: number;
  currentCenter: number;
  currentGap: number;
  variant: PipeVariant;
  amplitude: number;
  frequency: number;
  phase: number;
  scored: boolean;
  top: Phaser.GameObjects.Image;
  bottom: Phaser.GameObjects.Image;
  topCap: Phaser.GameObjects.Image;
  bottomCap: Phaser.GameObjects.Image;
  coin?: Phaser.GameObjects.Image;
}
// Adapted from upstream PlayScene spawnPipePair/applyPairLayout/destroyPair/checkCollisions.
export class ObstacleSystem {
  public pairs: PipePair[] = [];
  public spawned = 0;
  private center = 360;
  private random: () => number;
  private pattern?: AdventurePattern;
  constructor(
    private scene: Phaser.Scene,
    private level?: Level,
  ) {
    this.random = Math.random;
    this.pattern = level ? new AdventurePattern(level) : undefined;
  }
  public spawn(d: DifficultyState, seconds: number): void {
    if (this.level && this.spawned >= this.level.gates) return;
    this.spawned++;
    const l = this.level;
    const spec = this.pattern?.next();
    const roll = this.random();
    const variant: PipeVariant = spec
      ? spec.variant
      : roll < d.pulseChance
        ? "pulse"
        : roll < d.pulseChance + d.swayChance
          ? "sway"
          : "static";
    const gap = spec
      ? spec.gap
      : Phaser.Math.Clamp(
          d.pipeGap + Math.floor(this.random() * 33) - 14,
          126,
          280,
        );
    if (spec) {
      this.center = spec.center;
    } else this.center = 120 + Math.floor(this.random() * 511);
    const x = GAME_WIDTH + 140;
    const top = this.scene.add
      .image(x, 0, `pipe-body-${l?.world ?? 1}`)
      .setOrigin(0.5, 1)
      .setDepth(26);
    const bottom = this.scene.add
      .image(x, 0, `pipe-body-${l?.world ?? 1}`)
      .setOrigin(0.5, 0)
      .setFlipY(true)
      .setDepth(26);
    const topCap = this.scene.add
      .image(x, 0, `pipe-cap-${l?.world ?? 1}`)
      .setOrigin(0.5, 1)
      .setDepth(27);
    const bottomCap = this.scene.add
      .image(x, 0, `pipe-cap-${l?.world ?? 1}`)
      .setOrigin(0.5, 0)
      .setFlipY(true)
      .setDepth(27);
    const hasCoin = l ? this.spawned % 2 === 0 : this.random() < d.coinChance;
    const pair: PipePair = {
      x,
      gapCenter: this.center,
      gapSize: gap,
      currentCenter: this.center,
      currentGap: gap,
      variant,
      amplitude: l ? 20 : 20 + Math.floor(this.random() * 25),
      frequency: l ? 0.9 : 0.7 + this.random(),
      phase: spec?.phase ?? this.random() * Math.PI * 2,
      scored: false,
      top,
      bottom,
      topCap,
      bottomCap,
      coin: hasCoin
        ? this.scene.add
            .image(x, this.center, "coin")
            .setDepth(31)
            .setScale(0.58)
        : undefined,
    };
    this.layout(pair, seconds);
    this.pairs.push(pair);
  }
  public move(seconds: number, delta: number, speed: number): void {
    for (let i = this.pairs.length - 1; i >= 0; i--) {
      const p = this.pairs[i];
      p.x -= (speed * delta) / 1000;
      this.layout(p, seconds);
      if (p.x < -180) {
        this.destroy(p);
        this.pairs.splice(i, 1);
      }
    }
  }
  public layout(p: PipePair, seconds: number): void {
    const sway =
      p.variant === "sway"
        ? Math.sin(seconds * p.frequency + p.phase) * p.amplitude
        : 0;
    const pulse =
      p.variant === "pulse"
        ? Math.sin(seconds * p.frequency + p.phase) * 24
        : 0;
    p.currentGap = Phaser.Math.Clamp(p.gapSize + pulse, 120, 300);
    p.currentCenter = p.gapCenter + sway;
    p.top.setPosition(p.x, p.currentCenter - p.currentGap * 0.5);
    p.bottom.setPosition(p.x, p.currentCenter + p.currentGap * 0.5);
    p.topCap.setPosition(p.x, p.top.y);
    p.bottomCap.setPosition(p.x, p.bottom.y);
    if (p.coin)
      p.coin.setPosition(p.x, p.currentCenter + (this.level ? 0 : sway * 0.25));
  }
  public collision(birdRect: Phaser.Geom.Rectangle): boolean {
    if (birdRect.bottom >= 742 || birdRect.top <= 4) return true;
    return this.pairs.some((p) =>
      this.rects(p).some((r) =>
        Phaser.Geom.Intersects.RectangleToRectangle(birdRect, r),
      ),
    );
  }
  public rects(p: PipePair): Phaser.Geom.Rectangle[] {
    return [
      new Phaser.Geom.Rectangle(
        p.x - PIPE_BODY_WIDTH * 0.5 + 6,
        p.top.y - PIPE_BODY_HEIGHT + 8,
        PIPE_BODY_WIDTH - 12,
        PIPE_BODY_HEIGHT - 14,
      ),
      new Phaser.Geom.Rectangle(
        p.x - PIPE_BODY_WIDTH * 0.5 + 6,
        p.bottom.y + 8,
        PIPE_BODY_WIDTH - 12,
        PIPE_BODY_HEIGHT - 14,
      ),
    ];
  }
  public clear(): void {
    this.pairs.forEach((p) => this.destroy(p));
    this.pairs = [];
  }
  private destroy(p: PipePair): void {
    p.top.destroy();
    p.bottom.destroy();
    p.topCap.destroy();
    p.bottomCap.destroy();
    p.coin?.destroy();
  }
}
