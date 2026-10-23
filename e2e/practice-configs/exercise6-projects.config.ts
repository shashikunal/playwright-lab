import { defineConfig, devices } from "@playwright/test";

// Exercise 6: Configure Chromium and Firefox projects
export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\.spec\.ts/,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
  use: {
    baseURL: "http://127.0.0.1:5173",
  },
});
