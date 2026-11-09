import { test, expect } from "@playwright/test";

test("every accepted tap starts a wing sound, including after audio suspension", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/?canvas&timer");
  await page.getByRole("button", { name: "Sonsuz Uçuş", exact: true }).click();
  await page.waitForFunction(() =>
    (window as any).flappyGame.scene.isActive("PlayScene"),
  );
  const buffers = await page.evaluate(async () => {
    const s = (window as any).flappyGame.scene.getScene("PlayScene");
    s.obstacles.spawn = () => {};
    s.obstacles.collision = () => false;
    const a = s.audioSystem;
    const samples = a.buffers.get("flap")[0].getChannelData(0);
    const rms = Math.sqrt(
      samples.reduce((v: number, x: number) => v + x * x, 0) / samples.length,
    );
    const classic =
      a.buffers.get("score")[0] === s.cache.audio.get("classic-point") &&
      a.buffers.get("hit")[0] === s.cache.audio.get("classic-hit");
    (window as any).wingStarts = 0;
    const create = a.context.createBufferSource.bind(a.context);
    a.context.createBufferSource = () => {
      const node = create(),
        start = node.start.bind(node);
      node.start = (...args: any[]) => {
        if (node.buffer === a.buffers.get("flap")[0])
          (window as any).wingStarts++;
        return start(...args);
      };
      return node;
    };
    await a.context.suspend();
    return { rms, classic };
  });
  expect(buffers.rms).toBeGreaterThan(0.15);
  expect(buffers.classic).toBe(true);
  for (let i = 0; i < 5; i++)
    await page
      .locator("canvas")
      .click({ position: { x: 140, y: 330 }, delay: 20 });
  await page.waitForFunction(
    () =>
      (window as any).flappyGame.scene.getScene("PlayScene").flapCount === 5,
  );
  expect(await page.evaluate(() => (window as any).wingStarts)).toBe(5);
  expect(
    await page.evaluate(
      () =>
        (window as any).flappyGame.scene.getScene("PlayScene").audioSystem
          .context.state,
    ),
  ).toBe("running");
  const stress = await page.evaluate(() => {
    const a = (window as any).flappyGame.scene.getScene(
      "PlayScene",
    ).audioSystem;
    a.stop();
    for (let i = 0; i < 20; i++) a.warning();
    const before = (window as any).wingStarts;
    for (let i = 0; i < 3; i++) a.flap();
    const report = {
      starts: (window as any).wingStarts - before,
      voices: a.voices.size,
      wings: a.flightVoices.size,
    };
    a.enabled = false;
    a.flap();
    return {
      ...report,
      muted: a.voices.size === 0,
      startsAfterMute: (window as any).wingStarts - before,
    };
  });
  expect(stress).toEqual({
    starts: 3,
    voices: 12,
    wings: 2,
    muted: true,
    startsAfterMute: 3,
  });
  expect(errors).toEqual([]);
});
