const { chromium } = require("@playwright/test");
const fs = require("node:fs");
(async () => {
  const b = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const source = fs.readFileSync("public/icons/icon.svg", "utf8");
    for (const size of [192, 512])
      for (const mask of [false, true]) {
        const p = await b.newPage({
          viewport: { width: size, height: size },
          deviceScaleFactor: 1,
        });
        await p.setContent(
          `<style>body{margin:0;background:#102e32;display:grid;place-items:center;height:100vh}svg{width:${mask ? "80" : "100"}%;height:auto}</style>${source}`,
        );
        await p.screenshot({
          path: `public/icons/${mask ? "maskable" : "icon"}-${size}.png`,
        });
        await p.close();
      }
  } finally {
    await b.close();
  }
})();
