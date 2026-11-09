import Phaser from "phaser";
import { BIRD_GRAVITY, DEFAULT_FLAP_POWER } from "../constants";

const FRAME_KEYS = ["bird-spark-0", "bird-spark-1", "bird-spark-2"];

export class Bird extends Phaser.Physics.Arcade.Sprite {
  private flightAnimation = "";
  private isAlive = true;

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, FRAME_KEYS[0]);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(25);
    this.setScale(1);
    this.setOrigin(0.5);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(38, 30);
    body.setOffset(16, 17);
    body.setAllowGravity(false);
    body.setGravityY(BIRD_GRAVITY);
    body.setCollideWorldBounds(false);
  }

  public applyAppearance(id: string): void {
    this.flightAnimation = `flight-${id}`;
    if (!this.scene.anims.exists(this.flightAnimation)) {
      this.scene.anims.create({
        key: this.flightAnimation,
        frames: [2, 1, 0, 1].map((frame) => ({ key: `bird-${id}-${frame}` })),
        frameRate: 1000 / 85,
        repeat: -1,
      });
    }
    this.play(this.flightAnimation);
  }

  public setGameplayGravity(enabled: boolean): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(enabled);

    if (!enabled) {
      body.setVelocity(0, 0);
    }
  }

  public flap(power = DEFAULT_FLAP_POWER): void {
    if (!this.isAlive) {
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-power);
    this.play(this.flightAnimation);
  }

  public updateBird(_deltaMs: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const targetAngle = Phaser.Math.Clamp(body.velocity.y * 0.06, -24, 85);
    this.angle = Phaser.Math.Linear(this.angle, targetAngle, 0.15);
  }

  public getHitbox(): Phaser.Geom.Rectangle {
    const bounds = this.getBounds();
    return new Phaser.Geom.Rectangle(
      bounds.x + 8,
      bounds.y + 7,
      bounds.width - 18,
      bounds.height - 14,
    );
  }

  public kill(): void {
    this.isAlive = false;
    this.anims.stop();
  }

  public revive(): void {
    this.isAlive = true;
  }

  public getVelocityY(): number {
    return (this.body as Phaser.Physics.Arcade.Body).velocity.y;
  }

  public pushVertical(velocityDelta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.velocity.y += velocityDelta;
  }
}
