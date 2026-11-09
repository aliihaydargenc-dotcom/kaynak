import { test, expect } from "@playwright/test";

test("flight animation freezes on pause; reduced motion suppresses effects without changing flap", async ({ page }) => {
  await page.goto("/?canvas&timer");
  await page.getByRole("button", { name: "Sonsuz Uçuş", exact: true }).click();
  await page.waitForFunction(() => (window as any).flappyGame.scene.isActive("PlayScene"));
  const report = await page.evaluate(() => {
    const g = (window as any).flappyGame;
    g.loop.sleep();
    const s = g.scene.getScene("PlayScene");
    const step = (n: number) => {
      for (let i = 0; i < n; i++) g.headlessStep(i * 1000 / 60, 1000 / 60);
    };
    const texture = s.bird.texture.key;
    step(6);
    const animated = texture !== s.bird.texture.key;
    s.pauseRun();
    const frozenTexture = s.bird.texture.key;
    step(20);
    const frozen = frozenTexture === s.bird.texture.key;
    // Resume the ready state through its normal countdown.
    (document.querySelector('[data-action="resume"]') as HTMLButtonElement).click();
    step(181);
    const resumed = !s.bird.anims.isPaused;
    const bounds = s.bird.getHitbox();
    const count = s.tweens.getTweens().length;
    s.reducedMotion = () => true;
    s.flap();
    return {
      animated, frozen, resumed,
      velocity: s.bird.getVelocityY(),
      noEffects: s.tweens.getTweens().length === count,
      sameBounds: s.bird.getHitbox().width === bounds.width && s.bird.getHitbox().height === bounds.height,
    };
  });
  expect(report).toEqual({ animated: true, frozen: true, resumed: true, velocity: -430, noEffects: true, sameBounds: true });
});
