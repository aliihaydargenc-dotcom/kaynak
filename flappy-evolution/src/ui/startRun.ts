import type Phaser from "phaser";
import type { RunRequest } from "../game/types";
import { acquireRunLock } from "../game/data/RunLock";
import { panel, button, clearPanel } from "./UiBridge";
export async function startRun(
  scene: Phaser.Scene,
  request: RunRequest,
): Promise<void> {
  if (!(await acquireRunLock())) {
    panel(
      `<h1>Diğer uçuş açık</h1><p>Başka sekmedeki uçuşu kapatıp yeniden dene.</p>${button("menu", "Menüye dön", true)}`,
      () => scene.scene.start("MenuScene"),
    );
    return;
  }
  clearPanel();
  scene.scene.start("PlayScene", request);
}
