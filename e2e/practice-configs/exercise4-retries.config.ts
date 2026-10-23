import { defineConfig } from "@playwright/test";

// Exercise 4: Configure retries without masking flaky failures
export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\.spec\.ts/,
  retries: 2,
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
});
