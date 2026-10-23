import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Day 8 Practice Suite: Automated Accessibility (Axe-Core) & Visual Regression Stabilization
 * Lab Targets: /lab/a11y, /lab/visual
 */
test.describe("Day 8: Accessibility Audits & Visual Regression Stabilization", () => {
  test("Exercise 1: Automated WCAG 2.1 AA scan on accessible component panel", async ({ page }) => {
    await page.goto("/lab/a11y");

    // SENIOR SDET PATTERN:
    // Scope accessibility scans to components rather than the full raw page to get
    // focused, actionable defect reporting during test execution.
    const results = await new AxeBuilder({ page })
      .include('[data-testid="accessible-panel"]')
      .analyze();

    // Compliant accessible components must have zero violations
    expect(results.violations).toEqual([]);
  });

  test("Exercise 2: Catching WCAG violation & asserting automated remediation", async ({ page }) => {
    await page.goto("/lab/a11y");

    // 1. Initial scan on un-remediated defect component detects missing button-name
    const beforeResults = await new AxeBuilder({ page })
      .include('[data-testid="defect-button-panel"]')
      .withRules(["button-name"])
      .analyze();

    expect(beforeResults.violations.length).toBeGreaterThan(0);
    expect(beforeResults.violations[0].id).toBe("button-name");

    // 2. Trigger component remediation toggle
    await page.locator("#toggle-remediate-btn").click();
    await expect(page.getByText("Remediation Active (Clean)")).toBeVisible();

    // 3. Re-scan confirms violation is eliminated
    const afterResults = await new AxeBuilder({ page })
      .include('[data-testid="defect-button-panel"]')
      .withRules(["button-name"])
      .analyze();

    expect(afterResults.violations).toEqual([]);
  });

  test("Exercise 3: Stabilizing visual snapshots with dynamic element masking", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/lab/visual");

    const volatileCard = page.getByTestId("volatile-card");
    await expect(volatileCard).toBeVisible();

    const timestamp = page.getByTestId("volatile-timestamp");
    const txId = page.getByTestId("volatile-txid");

    // Mask volatile elements with pink/overlay boxes to prevent false-positive visual test failures
    await expect(volatileCard).toHaveScreenshot("volatile-card-masked.png", {
      mask: [timestamp, txId],
      maxDiffPixelRatio: 0.05,
    });
  });

  test("Exercise 4: Freezing continuous CSS animations during screenshot capture", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/lab/visual");

    const motionCard = page.getByTestId("motion-card");
    await expect(motionCard).toBeVisible();

    // animations: 'disabled' pauses all CSS keyframe animations at their initial frame
    await expect(motionCard).toHaveScreenshot("motion-card-stabilized.png", {
      animations: "disabled",
      maxDiffPixelRatio: 0.05,
    });
  });
});
