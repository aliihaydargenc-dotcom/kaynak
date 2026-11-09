import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "e2e",
  timeout: 45000,
  workers: 1,
  use: {
    baseURL: "http://localhost:4175",
    viewport: { width: 390, height: 844 },
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH || (process.env.CI ? undefined : "/usr/bin/chromium"),
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    },
  },
  reporter: [["list"], ["html", { open: "never" }]],
  webServer: {
    command: "yarn dev --port 4175",
    url: "http://localhost:4175",
    reuseExistingServer: !process.env.CI,
  },
});
