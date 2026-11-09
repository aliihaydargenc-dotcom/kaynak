import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./constants";
import { BootScene } from "./scenes/BootScene";
import { MenuScene } from "./scenes/MenuScene";
import { WorldMapScene } from "./scenes/WorldMapScene";
import { PlayScene } from "./scenes/PlayScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: new URLSearchParams(location.search).has("canvas")
    ? Phaser.CANVAS
    : Phaser.AUTO,
  parent: "app",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#0f172a",
  fps: { forceSetTimeOut: new URLSearchParams(location.search).has("timer") },
  scene: [BootScene, MenuScene, WorldMapScene, PlayScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: true,
    powerPreference: "high-performance",
  },
  audio: {
    disableWebAudio: false,
  },
};
