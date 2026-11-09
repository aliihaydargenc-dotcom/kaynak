import { test, expect } from "@playwright/test";
for (const [width, height] of [
  [360, 640],
  [390, 844],
  [430, 932],
  [768, 1024],
  [844, 390],
])
  test(`menus and controls fit ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/?canvas&debug&timer");
    await page.getByRole("button", { name: "Macera", exact: true }).waitFor();
    const measure = async () =>
      page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        small: [...document.querySelectorAll("button,select")]
          .filter((e) => {
            const r = e.getBoundingClientRect();
            return r.width < 47.9 || r.height < 47.9;
          })
          .map((e) => e.textContent),
      }));
    expect(await measure()).toEqual({ overflow: false, small: [] });
    if (width === 390)
      await page.screenshot({ path: "docs/evidence/H-menu.png" });
    await page.getByRole("button", { name: "Macera", exact: true }).click();
    expect(await measure()).toEqual({ overflow: false, small: [] });
    await page.getByRole("button", { name: /1-1 İlk Kanat/ }).click();
    await page.waitForFunction(
      () =>
        (window as any).flappyGame.scene.getScene("PlayScene").bird?.active &&
        (window as any).flappyGame.scene.isActive("PlayScene"),
    );
    expect(await measure()).toEqual({ overflow: false, small: [] });
    const top = await page.locator('.flight-top').boundingBox();
    expect(top!.y).toBeGreaterThanOrEqual(0);
    expect(top!.x + top!.width).toBeLessThanOrEqual(width);
    if (width === 390) {
      await page.evaluate(() => {
        const g = (window as any).flappyGame;
        g.loop.sleep();
        const s = g.scene.getScene("PlayScene");
        s.obstacles.spawn(s.difficulty, 0);
        s.obstacles.pairs[0].x = 320;
        s.obstacles.layout(s.obstacles.pairs[0], 0);
        g.step(1000, 1000 / 60);
      });
      await page.screenshot({ path: "docs/evidence/H-flight.png" });
    }
  });
