import { defineConfig } from "@playwright/test";

// Exercise 7: Configure webServer to start or reuse local application
export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\.spec\.ts/,
  use: {
    baseURL: "http://127.0.0.1:5173",
  },
  webServer: {
    command: "npm run dev -w @pil/web",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
