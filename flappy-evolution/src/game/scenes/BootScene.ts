import Phaser from "phaser";
import { AssetFactory } from "../systems/AssetFactory";
export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }
  create(): void {
    AssetFactory.create(this);
    this.scene.start("MenuScene");
  }
}
