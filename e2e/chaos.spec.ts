import { expect, test } from "@playwright/test";

test.describe("Chaos Engineering & System Resilience Lab", () => {
  test.beforeEach(async ({ page }) => {
    // Reset chaos configuration to clean baseline before each test
    await page.request.post("/api/lab/chaos/reset");
  });

  test("loads Chaos Engineering lab from navigation drawer @smoke", async ({ page }) => {
    await page.goto("/");
    const navLink = page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Chaos Engineering" });
    await navLink.scrollIntoViewIfNeeded();
    await expect(navLink).toBeVisible();
    await navLink.click();

    await expect(page).toHaveURL(/.*\/lab\/chaos/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Chaos Engineering & System Resilience");
    await expect(page.getByTestId("chaos-control-deck")).toBeVisible();
    await expect(page.getByTestId("network-playground")).toBeVisible();
    await expect(page.getByTestId("dom-playground")).toBeVisible();
    await expect(page.getByTestId("cpu-playground")).toBeVisible();
  });

  test("applies presets and restores baseline with master reset", async ({ page }) => {
    await page.goto("/lab/chaos");

    // Click 'Network Jitter' preset
    const jitterPreset = page.getByTestId("preset-jitter-btn");
    await jitterPreset.click();
    await expect(page.getByTestId("toggle-jitter-switch")).toBeChecked();

    // Click 'DOM Mutations' preset
    const domPreset = page.getByTestId("preset-dom-btn");
    await domPreset.click();
    await expect(page.getByTestId("toggle-dom-switch")).toBeChecked();

    // Click 'Reset to Stable'
    const resetBtn = page.getByTestId("chaos-reset-btn");
    await resetBtn.click();
    await expect(page.getByTestId("toggle-jitter-switch")).not.toBeChecked();
    await expect(page.getByTestId("toggle-dom-switch")).not.toBeChecked();
    await expect(page.getByText("STABLE BASELINE")).toBeVisible();
  });

  test("tests circuit breaker fast-fail and resilient recovery", async ({ page }) => {
    await page.goto("/lab/chaos");

    // 1. Initial state: Breaker is CLOSED
    const breakerBadge = page.getByTestId("circuit-breaker-badge");
    await expect(breakerBadge).toHaveText("Breaker: CLOSED");

    // 2. Fetch normal telemetry
    const fetchBtn = page.getByTestId("fetch-telemetry-btn");
    await fetchBtn.click();
    const resultCard = page.getByTestId("telemetry-result-card");
    await expect(resultCard).toContainText("200 OK Response");

    // 3. Force Trip breaker to OPEN
    const tripBtn = page.getByTestId("trip-breaker-btn");
    await tripBtn.click();
    await expect(breakerBadge).toHaveText("Breaker: OPEN");

    // 4. Fetch telemetry while OPEN: fast-fails with 503
    await fetchBtn.click();
    await expect(resultCard).toContainText("HTTP 503 Error");
    await expect(resultCard).toContainText("Circuit breaker is OPEN");

    // 5. Reset breaker to CLOSED
    const resetBreakerBtn = page.getByTestId("reset-breaker-btn");
    await resetBreakerBtn.click();
    await expect(breakerBadge).toHaveText("Breaker: CLOSED");

    // 6. Resilient verification with expect.toPass
    await expect(async () => {
      await fetchBtn.click();
      await expect(resultCard).toContainText("200 OK Response");
    }).toPass({ timeout: 5000, intervals: [500] });
  });

  test("survives aggressive DOM remounting without stale element exceptions", async ({ page }) => {
    await page.goto("/lab/chaos");

    // Enable DOM mutation chaos
    await page.getByTestId("preset-dom-btn").click();
    await expect(page.getByText("Remounting Active")).toBeVisible();

    const remountingBtn = page.getByTestId("remounting-action-btn");
    const counter = page.getByTestId("click-counter");

    // Click 4 times despite DOM keys changing every 850ms
    for (let i = 1; i <= 4; i++) {
      await remountingBtn.click();
      await expect(counter).toContainText(`Success Clicks: ${i}`);
    }
  });

  test("asserts ephemeral banner and handles modal intercept trap", async ({ page }) => {
    await page.goto("/lab/chaos");

    // 1. Trigger ephemeral banner and assert visibility before auto-dismiss
    const fleetingBtn = page.getByTestId("trigger-fleeting-btn");
    await fleetingBtn.click();

    const banner = page.getByTestId("fleeting-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("Ephemeral Notice");

    // 2. Spawn obstructing modal overlay trap
    const spawnOverlayBtn = page.getByTestId("spawn-overlay-btn");
    await spawnOverlayBtn.click();

    const overlay = page.getByTestId("chaos-overlay");
    await expect(overlay).toBeVisible();

    // 3. Dismiss modal trap
    const dismissBtn = page.getByTestId("dismiss-overlay-btn");
    await dismissBtn.click();
    await expect(overlay).not.toBeVisible();
  });

  test("verifies atomic fill vs sluggish typing lag", async ({ page }) => {
    await page.goto("/lab/chaos");

    // Enable CPU lag simulation
    await page.getByTestId("toggle-cpu-switch").check();

    const sluggishInput = page.getByTestId("sluggish-input");
    await expect(sluggishInput).toBeVisible();

    // Atomic fill writes full string reliably
    await sluggishInput.fill("Resilient Senior SDET Input");
    await expect(sluggishInput).toHaveValue("Resilient Senior SDET Input");
    await expect(page.getByText("Length: 27 characters")).toBeVisible();
  });
});
