import { test, expect } from "@playwright/test";
test("legacy saves retain progress while coins, coin audio and rewards are absent", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "flappy_evolution_save_v1",
      JSON.stringify({
        schemaVersion: 1,
        wallet: { coins: 123 },
        xp: 99,
        adventure: {
          levels: {
            "1-1": { bestStars: 2, bestScore: 10, firstClearClaimed: true },
          },
        },
        inventory: {
          selectedSkin: "sprout",
          skins: ["spark", "sprout"],
          trails: ["none"],
          selectedTrail: "none",
        },
      }),
    ),
  );
  await page.goto("/?canvas&debug&timer");
  await expect(
    page.getByRole("button", { name: "Macera", exact: true }),
  ).toBeVisible();
  expect(await page.locator("body").innerText()).not.toMatch(/jeton/i);
  await page.getByRole("button", { name: "Gardırop", exact: true }).click();
  expect(await page.locator("body").innerText()).not.toMatch(/jeton|mıknatıs/i);
  await page.getByRole("button", { name: "Menüye dön", exact: true }).click();
  await page.getByRole("button", { name: "Sonsuz Uçuş", exact: true }).click();
  await page.waitForFunction(
    () => (window as any).flappyGame.scene.getScene("PlayScene").bird?.active,
  );
  const r = await page.evaluate(() => {
    const g = (window as any).flappyGame,
      s = g.scene.getScene("PlayScene");
    g.loop.sleep();
    s.obstacles.spawn(s.difficulty, 0);
    const result = {
      coinAudio: s.audioSystem.buffers.has("coin"),
      coinTexture: g.textures.exists("coin"),
      coinObject: s.obstacles.pairs.some((p: any) => p.coin),
      character: s.power.id,
    };
    s.flap();
    s.finishRun("dead");
    return result;
  });
  expect(r).toEqual({
    coinAudio: false,
    coinTexture: false,
    coinObject: false,
    character: "sprout",
  });
  expect(await page.locator("body").innerText()).not.toMatch(/jeton/i);
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("flappy_evolution_save_v1")!),
  );
  expect(saved.wallet.coins).toBe(123);
  expect(saved.xp).toBe(99);
  expect(saved.adventure.levels["1-1"].bestStars).toBe(2);
  expect(saved.inventory.selectedSkin).toBe("sprout");
});
