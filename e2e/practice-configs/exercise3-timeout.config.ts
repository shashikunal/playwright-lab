import { defineConfig } from "@playwright/test";

// Exercise 3: Set reasonable test timeout and expect timeout
export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\.spec\.ts/,
  timeout: 15_000,
  expect: {
    timeout: 4_000,
  },
  use: {
    baseURL: "http://127.0.0.1:5173",
  },
});
