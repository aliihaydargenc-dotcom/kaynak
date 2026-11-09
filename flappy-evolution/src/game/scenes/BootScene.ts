import Phaser from "phaser";
import { AssetFactory } from "../systems/AssetFactory";
export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }
  preload(): void {
    this.load.audio("classic-point", "/audio/point.wav");
    this.load.audio("classic-hit", "/audio/hit.wav");
  }
  create(): void {
    AssetFactory.create(this);
    this.scene.start("MenuScene");
  }
}
