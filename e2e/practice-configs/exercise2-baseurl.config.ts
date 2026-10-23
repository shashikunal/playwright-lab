import { defineConfig } from "@playwright/test";

// Exercise 2: Configure baseURL and navigate using relative path
export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\.spec\.ts/,
  use: {
    baseURL: "http://127.0.0.1:5173",
    actionTimeout: 10_000,
  },
});
