import Phaser from "phaser";
import { CombatModel } from "./CombatModel";
// View adapter only: poses and effects never decide damage.
export class CombatView {
  private bullets: Phaser.GameObjects.Image[];
  private rig: Phaser.GameObjects.Graphics;
  constructor(
    scene: Phaser.Scene,
    readonly model: CombatModel,
  ) {
    this.bullets = model.shots.map(() =>
      scene.add.image(0, 0, "fireball").setDepth(34).setVisible(false),
    );
    this.rig = scene.add.graphics().setDepth(30);
  }
  render(playerX: number, playerY: number, reduced: boolean): void {
    this.model.shots.forEach((s, i) =>
      this.bullets[i]
        .setVisible(s.active)
        .setPosition(s.x, s.y)
        .setTint(
          s.enemy
            ? 0xff5d84
            : this.model.power.tier === 5
              ? 0x80efff
              : 0xffbd69,
        )
        .setScale(s.enemy ? 0.85 : this.model.power.tier === 5 ? 1.4 : 1),
    );
    const g = this.rig;
    g.clear();
    if (this.model.shields > 0 || this.model.invulnerable > 0) {
      g.lineStyle(2, 0x8eeeff, this.model.invulnerable > 0 ? 0.9 : 0.4);
      g.strokeCircle(playerX, playerY, 42);
    }
    const b = this.model.boss;
    if (!b || b.state === "defeated") return;
    if (b.state === "windup") {
      g.lineStyle(2, 0xffa6aa, 0.5);
      g.lineBetween(b.x - 45, b.y, 20, b.aimY);
      g.lineStyle(2, 0xffd48a);
      g.strokeCircle(b.x, b.y, 54 + (reduced ? 0 : b.elapsed / 110));
    }
    const color = b.phase === 2 ? 0xcc456b : 0x536f87;
    // Floating sentinel: shell, articulated wings, core and antenna.
    g.fillStyle(0x102438);
    g.fillTriangle(b.x - 30, b.y, b.x - 85, b.y - 44, b.x - 62, b.y + 30);
    g.fillTriangle(b.x + 30, b.y, b.x + 85, b.y - 44, b.x + 62, b.y + 30);
    g.lineStyle(3, 0x97dadd);
    g.strokeTriangle(b.x - 30, b.y, b.x - 85, b.y - 44, b.x - 62, b.y + 30);
    g.strokeTriangle(b.x + 30, b.y, b.x + 85, b.y - 44, b.x + 62, b.y + 30);
    g.fillStyle(color);
    g.fillRoundedRect(b.x - 44, b.y - 44, 88, 88, 24);
    g.lineStyle(3, 0xb4e4ed);
    g.strokeRoundedRect(b.x - 44, b.y - 44, 88, 88, 24);
    g.fillStyle(0x0d2033);
    g.fillCircle(b.x, b.y, 28);
    g.fillStyle(b.state === "attack" ? 0xffffff : 0xffca7c);
    g.fillCircle(b.x, b.y, b.state === "windup" ? 13 : 19);
    g.lineStyle(4, 0xffd898);
    g.lineBetween(b.x - 22, b.y - 50, b.x, b.y - 66);
    g.lineBetween(b.x, b.y - 66, b.x + 22, b.y - 50);
  }
  dispose(): void {
    this.bullets.forEach((s) => s.destroy());
    this.rig.destroy();
  }
}
