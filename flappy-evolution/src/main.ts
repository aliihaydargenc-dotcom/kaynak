import Phaser from "phaser";
import "./styles.css";
import { save } from "./game/data/SaveManager";
import { MenuScene } from "./game/scenes/MenuScene";
import { installPwa } from "./pwa";
import { gameConfig } from "./game/GameConfig";
const game = new Phaser.Game(gameConfig);
// Local diagnostics only; no network, no rewards or physics bypass.
if (import.meta.env.DEV || new URLSearchParams(location.search).has("debug"))
  Object.assign(window, { flappyGame: game });

installPwa(() => game.scene.isActive("MenuScene"));

window.addEventListener("storage", event => {
  if (event.key !== "flappy_evolution_save_v1" || game.scene.isActive("PlayScene")) return;
  save.externalChange();
  if (game.scene.isActive("MenuScene")) (game.scene.getScene("MenuScene") as MenuScene).home();
  else if (game.scene.isActive("WorldMapScene")) game.scene.getScene("WorldMapScene").scene.restart();
});
