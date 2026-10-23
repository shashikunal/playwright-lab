import { defineConfig } from "@playwright/test";

// Exercise 8: Safe comparison of local and CI configuration
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: process.env.BASE_URL || "http://127.0.0.1:5173",
    trace: isCI ? "retain-on-failure" : "on-first-retry",
    video: isCI ? "retain-on-failure" : "off",
  },
});
