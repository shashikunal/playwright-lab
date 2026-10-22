import { expect, test } from "@playwright/test";

test.describe("visual regression and snapshot testing", () => {
  test.beforeEach(async ({ page }) => {
    // Set deterministic viewport for pixel-perfect comparisons
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/lab/visual");
  });

  test("captures deterministic component screenshot with toHaveScreenshot @smoke", async ({ page }) => {
    const stableCard = page.getByTestId("stable-card");
    await expect(stableCard).toBeVisible();

    // Verify stable component screenshot comparison
    await expect(stableCard).toHaveScreenshot("stable-card.png", {
      maxDiffPixelRatio: 0.05,
    });
  });

  test("masks volatile dynamic data (timestamps, randomized IDs) to prevent snapshot flakiness", async ({
    page,
  }) => {
    const volatileCard = page.getByTestId("volatile-card");
    await expect(volatileCard).toBeVisible();

    const timestamp = page.getByTestId("volatile-timestamp");
    const txId = page.getByTestId("volatile-txid");

    await expect(timestamp).toBeVisible();
    await expect(txId).toBeVisible();

    // Comparing volatile card with locator masks applied to dynamic elements
    await expect(volatileCard).toHaveScreenshot("volatile-card-masked.png", {
      mask: [timestamp, txId],
      maxDiffPixelRatio: 0.05,
    });
  });

  test("freezes CSS animations using animations: disabled option", async ({ page }) => {
    const motionCard = page.getByTestId("motion-card");
    await expect(motionCard).toBeVisible();

    // Freezes continuous CSS spin and pulse keyframes
    await expect(motionCard).toHaveScreenshot("motion-card-stabilized.png", {
      animations: "disabled",
      maxDiffPixelRatio: 0.05,
    });
  });

  test("detects intentional layout shift and visual drift", async ({ page }) => {
    const diffCard = page.getByTestId("diff-simulator-card");
    await expect(diffCard).toBeVisible();
    await expect(page.getByText("Baseline layout aligned to design tokens")).toBeVisible();

    // Trigger visual drift
    await page.locator("#toggle-drift-btn").click();

    // Discrepancy styling updates with warning tone
    await expect(page.getByText("Discrepancy Detected: Padding changed + border color altered")).toBeVisible();
    await expect(diffCard).toHaveClass(/border-danger/);
  });

  for (const theme of ["light", "dark"] as const) {
    test(`renders visual regression lab in ${theme} theme`, async ({ page }) => {
      await page.addInitScript((val) => localStorage.setItem("pil-theme", val), theme);
      await page.goto("/lab/visual");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Visual Regression & Snapshot Workbench",
      );
    });
  }
});
