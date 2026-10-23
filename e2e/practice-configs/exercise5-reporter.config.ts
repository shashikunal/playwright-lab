import { defineConfig } from "@playwright/test";

// Exercise 5: Add an HTML reporter and inspect the resulting report
export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\.spec\.ts/,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report-practice" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:5173",
  },
});
