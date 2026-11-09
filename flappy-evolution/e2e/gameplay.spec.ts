import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const baseline = JSON.parse(
  readFileSync("docs/evidence/A-baseline.json", "utf8"),
);
test("fixed input matches upstream Bird position/velocity in the actual Arcade engine", async ({
  page,
}) => {
  await page.goto("/?canvas&debug&timer");
  await page.getByRole("button", { name: "Sonsuz Uçuş", exact: true }).click();
  await page.waitForFunction(
    () =>
      (window as any).flappyGame.scene.getScene("PlayScene").bird?.active &&
      (window as any).flappyGame.scene.isActive("PlayScene"),
  );
  const samples = await page.evaluate(() => {
    const g = (window as any).flappyGame;
    g.loop.sleep();
    const s = g.scene.getScene("PlayScene");
    s.bird.setPosition(144, 392.84);
    s.bird.body.reset(144, 392.84);
    s.physics.world._elapsed = 0;
    s.obstacles.spawn = () => {};
    s.updateWind = () => {};
    const samples = [];
    for (let frame = 0; frame < 120; frame++) {
      if (frame % 30 === 0) s.flap();
      s.fire();
      g.headlessStep(((frame + 1) * 1000) / 60, 1000 / 60);
      if (frame % 6 === 0)
        samples.push({ y: s.bird.y, vy: s.bird.getVelocityY() });
    }
    return samples;
  });
  for (let i = 0; i < samples.length; i++) {
    expect(samples[i].y).toBeCloseTo(baseline.samples[i].y, 4);
    expect(samples[i].vy).toBeCloseTo(baseline.samples[i].vy, 4);
  }
});
test("adventure win, physical coins, next level and loss/retry use one core", async ({
  page,
}) => {
  await page.goto("/?canvas&debug&timer");
  await page.getByRole("button", { name: "Macera", exact: true }).click();
  await page.getByRole("button", { name: /1-1 İlk Kanat/ }).click();
  await page.waitForFunction(
    () =>
      (window as any).flappyGame.scene.getScene("PlayScene").bird?.active &&
      (window as any).flappyGame.scene.isActive("PlayScene"),
  );
  const result = await page.evaluate(() => {
    const g = (window as any).flappyGame;
    g.loop.sleep();
    const s = g.scene.getScene("PlayScene");
    s.bird.body.reset(144, 392.84);
    s.physics.world._elapsed = 0;
    s.flap();
    for (let frame = 0; frame < 2400 && s.phase === "playing"; frame++) {
      const p = s.obstacles.pairs.find((p: any) => p.x > s.bird.x - 85),
        boss = s.combat.boss;
      let target = p?.currentCenter ?? 360;
      if (boss) {
        const threat = s.combat.shots.find(
          (p: any) => p.active && p.enemy && p.x > 110 && p.x < 340,
        );
        target = threat ? Math.min(580, threat.y + 130) : boss.y;
        if (boss.state === "windup" && boss.elapsed > 600)
          target = Math.min(580, boss.aimY + 130);
      }
      if (s.bird.y > target + 20 && s.bird.getVelocityY() > 0) s.flap();
      s.fire();
      g.headlessStep(((frame + 1) * 1000) / 60, 1000 / 60);
    }
    return { summary: s.summary, spawned: s.obstacles.spawned };
  });
  expect(result.summary.outcome).toBe("won");
  expect(result.summary.passedGates).toBe(8);
  expect(result.spawned).toBe(8);
  await expect(
    page.getByRole("button", { name: "Sonraki bölüm", exact: true }),
  ).toBeVisible();
  await page.evaluate(() => (window as any).flappyGame.loop.wake());
  await page
    .getByRole("button", { name: "Sonraki bölüm", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      (window as any).flappyGame.scene.getScene("PlayScene").request.levelId ===
      "1-2",
  );
  await page.evaluate(() => {
    const g = (window as any).flappyGame;
    g.loop.sleep();
    const s = g.scene.getScene("PlayScene");
    s.flap();
    for (let i = 0; i < 150; i++) g.headlessStep((i * 1000) / 60, 1000 / 60);
  });
  await expect(
    page.getByRole("button", { name: "Tekrar dene", exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Macera", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /1-2 Yaprak Arası/ }),
  ).toBeEnabled();
});
test("collision wins over same-frame final gate and no coins awarded on death frame", async ({
  page,
}) => {
  await page.goto("/?canvas&debug&timer");
  await page.getByRole("button", { name: "Macera", exact: true }).click();
  await page.getByRole("button", { name: /1-1 İlk Kanat/ }).click();
  await page.waitForFunction(
    () =>
      (window as any).flappyGame.scene.getScene("PlayScene").bird?.active &&
      (window as any).flappyGame.scene.isActive("PlayScene"),
  );
  const r = await page.evaluate(() => {
    const g = (window as any).flappyGame;
    g.loop.sleep();
    const s = g.scene.getScene("PlayScene");
    s.flap();
    s.passedGates = 7;
    s.score = 7;
    s.obstacles.spawn(s.difficulty, 0);
    const p = s.obstacles.pairs[0];
    p.x = 119;
    p.gapCenter = 60;
    s.obstacles.layout(p, 0);
    s.update(0, 1);
    return s.summary;
  });
  expect(r.outcome).toBe("dead");
  expect(r.passedGates).toBe(7);
  expect(r.score).toBe(7);
});
