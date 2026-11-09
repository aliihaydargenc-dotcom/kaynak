import Phaser from "phaser";
import { unlockAudio } from "./game/systems/AudioSystem";
import "./styles.css";
import { save } from "./game/data/SaveManager";
import { MenuScene } from "./game/scenes/MenuScene";
import { installPwa } from "./pwa";
import { gameConfig } from "./game/GameConfig";
const game = new Phaser.Game(gameConfig);
// Native gestures unlock Web Audio before Phaser queues the flap for a frame.
const unlock = (): void => {
  if (save.data.settings.sound)
    unlockAudio(
      (game.sound as Phaser.Sound.WebAudioSoundManager)?.context ?? null,
    );
};
window.addEventListener("pointerdown", unlock, {
  capture: true,
  passive: true,
});
window.addEventListener(
  "keydown",
  (event) => {
    if (!event.repeat) unlock();
  },
  { capture: true },
);
// Local diagnostics only; no network, no rewards or physics bypass.
if (import.meta.env.DEV || new URLSearchParams(location.search).has("debug"))
  Object.assign(window, { flappyGame: game });

installPwa(() => game.scene.isActive("MenuScene"));

window.addEventListener("storage", (event) => {
  if (
    event.key !== "flappy_evolution_save_v1" ||
    game.scene.isActive("PlayScene")
  )
    return;
  save.externalChange();
  if (game.scene.isActive("MenuScene"))
    (game.scene.getScene("MenuScene") as MenuScene).home();
  else if (game.scene.isActive("WorldMapScene"))
    game.scene.getScene("WorldMapScene").scene.restart();
});
