import { test, expect } from "@playwright/test";
test("single input, pause clocks, countdown, ten restarts and sealed results", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/?canvas&debug&timer");
  await page.getByRole("button", { name: "Sonsuz Uçuş", exact: true }).click();
  await page.waitForFunction(
    () =>
      (window as any).flappyGame.scene.getScene("PlayScene").bird?.active &&
      (window as any).flappyGame.scene.isActive("PlayScene"),
  );
  await page.locator("canvas").click({ position: { x: 140, y: 330 } });
  await page.keyboard.down("Space");
  await page.keyboard.down("Space");
  await page.keyboard.up("Space");
  expect(
    await page.evaluate(
      () => (window as any).flappyGame.scene.getScene("PlayScene").flapCount,
    ),
  ).toBe(2);
  await page.getByRole("button", { name: "Duraklat", exact: true }).click();
  const active = await page.evaluate(
    () => (window as any).flappyGame.scene.getScene("PlayScene").activeMs,
  );
  await page.waitForTimeout(150);
  expect(
    await page.evaluate(
      () => (window as any).flappyGame.scene.getScene("PlayScene").activeMs,
    ),
  ).toBe(active);
  expect(
    await page.evaluate(
      () => (window as any).flappyGame.scene.getScene("PlayScene").flapCount,
    ),
  ).toBe(2);
  await page.getByRole("button", { name: "Devam et", exact: true }).click();
  await page.evaluate(() => {
    const g = (window as any).flappyGame,
      s = g.scene.getScene("PlayScene");
    g.loop.sleep();
    for (let i = 0; i < 181; i++) s.update((i * 1000) / 60, 1000 / 60);
  });
  await expect(
    page.getByRole("button", { name: "Duraklat", exact: true }),
  ).toBeVisible();
  const report = await page.evaluate(() => {
    const g = (window as any).flappyGame;
    let s = g.scene.getScene("PlayScene");
    for (let i = 0; i < 10; i++) {
      s.scene.restart(s.request);
      g.headlessStep(i * 20, 1000 / 60);
      s = g.scene.getScene("PlayScene");
    }
    const listeners = s.input.listenerCount("pointerdown");
    s.flap();
    for (let i = 0; i < 150; i++)
      g.headlessStep(500 + (i * 1000) / 60, 1000 / 60);
    const before = [s.score, s.pickupCoins, s.bonusCoins, s.activeMs],
      summary = s.summary;
    s.finishRun("dead");
    for (let i = 0; i < 60; i++)
      g.headlessStep(4000 + (i * 1000) / 60, 1000 / 60);
    return {
      listeners,
      phase: s.phase,
      before,
      after: [s.score, s.pickupCoins, s.bonusCoins, s.activeMs],
      sameSummary: s.summary === summary,
    };
  });
  expect(report.listeners).toBe(1);
  expect(report.phase).toBe("results");
  expect(report.after).toEqual(report.before);
  expect(report.sameSummary).toBe(true);
  expect(errors).toEqual([]);
});
