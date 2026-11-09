import { test, expect } from "@playwright/test";
test("boss cooldown and projectile clocks pause; pooled fire breaks a wall; mute clears voices", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/?canvas&timer");
  await page.getByRole("button", { name: "Sonsuz Uçuş", exact: true }).click();
  await page.waitForFunction(() =>
    (window as any).flappyGame.scene.isActive("PlayScene"),
  );
  const result = await page.evaluate(() => {
    const g = (window as any).flappyGame;
    g.loop.sleep();
    const s = g.scene.getScene("PlayScene");
    s.flap();
    s.combat.startBoss(1, 1);
    s.fire();
    s.refreshHud();
    const before = [
      s.combat.cooldown,
      s.combat.boss.elapsed,
      s.combat.shots.find((p: any) => p.active).x,
    ];
    s.pauseRun();
    for (let i = 0; i < 50; i++) s.update(i * 20, 20);
    const after = [
      s.combat.cooldown,
      s.combat.boss.elapsed,
      s.combat.shots.find((p: any) => p.active).x,
    ];
    const voicesBefore = s.audioSystem.voices.size;
    s.audioSystem.enabled = false;
    s.audioSystem.fire();
    const muted = s.audioSystem.voices.size === 0;
    // Controlled wall/contact fixture, using real spawn/layout and update paths.
    s.phase = "playing";
    s.physics.world.resume();
    s.obstacles.level = { world: 2, gates: 20 };
    s.obstacles.spawned = 3;
    s.obstacles.spawn(s.difficulty, 0);
    const pair = s.obstacles.pairs[0];
    pair.x = 320;
    pair.gapCenter = 360;
    s.obstacles.layout(pair, 0);
    s.combat.spawn(pair.wall.x, pair.wall.y, 0, 0, false, 2, false);
    s.update(0, 1);
    return {
      before,
      after,
      muted,
      voicesBefore,
      wallBroken: !pair.wall,
      pool: s.combat.shots.length,
      errors: [],
    };
  });
  expect(result.after).toEqual(result.before);
  expect(result.muted).toBe(true);
  expect(result.wallBroken).toBe(true);
  expect(result.pool).toBe(48);
  expect(errors).toEqual([]);
});
