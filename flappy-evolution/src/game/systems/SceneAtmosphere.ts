import Phaser from "phaser";
import { save } from "../data/SaveManager";

export function reducedMotion(): boolean {
  return (
    save.data.settings.reducedMotion === "on" ||
    (save.data.settings.reducedMotion === "system" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches)
  );
}
/** Decorative layers only. No physics objects, collision shapes or game clocks. */
export class SceneAtmosphere {
  private layers: { sprite: Phaser.GameObjects.TileSprite; speed: number }[] =
    [];
  private motes: Phaser.GameObjects.Image[] = [];
  private elapsed = 0;
  constructor(scene: Phaser.Scene, world = 1) {
    scene.add.image(240, 427, `world-${world}`).setDepth(0);
    for (const [key, y, height, speed, depth] of [
      [`clouds-${world}`, 260, 380, 0.007, 1],
      [`ridges-${world}`, 540, 420, 0.013, 2],
      [`landscape-${world}`, 649, 250, 0.027, 3],
      [`foreground-${world}`, 800, 108, 0.055, 40],
    ] as [string, number, number, number, number][]) {
      this.layers.push({
        sprite: scene.add.tileSprite(240, y, 480, height, key).setDepth(depth),
        speed,
      });
    }
    for (let i = 0; i < 14; i++)
      this.motes.push(
        scene.add
          .image((i * 139 + 51) % 480, 180 + ((i * 79) % 540), "fireball")
          .setTint(world === 3 ? 0xd5f8ff : world === 4 ? 0xe4c5ff : 0xffe7a6)
          .setScale(i % 3 === 0 ? 0.22 : 0.1)
          .setAlpha(0.55)
          .setDepth(4),
      );
  }
  update(delta: number): void {
    if (reducedMotion()) return;
    this.elapsed += delta;
    for (const l of this.layers) l.sprite.tilePositionX += delta * l.speed;
    this.motes.forEach((m, i) => {
      m.x -= delta * (0.008 + (i % 3) * 0.005);
      if (m.x < -10) m.x = 490;
      m.y += Math.sin(this.elapsed / 1300 + i) * delta * 0.006;
    });
  }
}
