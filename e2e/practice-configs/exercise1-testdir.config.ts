import { defineConfig } from "@playwright/test";

// Exercise 1: Configure testDir and match specific test files
export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\.spec\.ts/,
  use: {
    baseURL: "http://127.0.0.1:5173",
  },
});
