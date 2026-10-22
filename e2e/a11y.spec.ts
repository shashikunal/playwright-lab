import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("accessibility testing and WCAG audits", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/a11y");
  });

  test("accessible reference panel passes automated WCAG 2.1 AA audit @smoke", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="accessible-panel"]')
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("detects color-contrast violation in isolated defect panel", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="defect-contrast-panel"]')
      .withRules(["color-contrast"])
      .analyze();

    const contrastViolation = results.violations.find((v) => v.id === "color-contrast");
    expect(contrastViolation).toBeDefined();
    expect(contrastViolation?.nodes.length).toBeGreaterThan(0);
  });

  test("detects missing accessible name on icon button", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="defect-button-panel"]')
      .withRules(["button-name"])
      .analyze();

    const buttonViolation = results.violations.find((v) => v.id === "button-name");
    expect(buttonViolation).toBeDefined();
    expect(buttonViolation?.nodes.length).toBeGreaterThan(0);
  });

  test("remediation toggle fixes accessibility violations", async ({ page }) => {
    // Before remediation: button-name violation exists
    const beforeResults = await new AxeBuilder({ page })
      .include('[data-testid="defect-button-panel"]')
      .withRules(["button-name"])
      .analyze();
    expect(beforeResults.violations.length).toBeGreaterThan(0);

    // Apply fixes
    await page.locator("#toggle-remediate-btn").click();
    await expect(page.getByText("Remediation Active (Clean)")).toBeVisible();

    // After remediation: 0 violations
    const afterResults = await new AxeBuilder({ page })
      .include('[data-testid="defect-button-panel"]')
      .withRules(["button-name"])
      .analyze();
    expect(afterResults.violations).toEqual([]);
  });

  test("client-side audit check displays structured feedback", async ({ page }) => {
    // Initial run shows 3 violations detected
    await page.locator("#run-scan-btn").click();
    const result = page.locator("#scan-result");
    await expect(result).toBeVisible();
    await expect(result).toContainText("3 WCAG violations detected");

    // Remediate and run again
    await page.locator("#toggle-remediate-btn").click();
    await page.locator("#run-scan-btn").click();
    await expect(result).toContainText("All WCAG 2.1 AA rules satisfied");
  });

  for (const theme of ["light", "dark"] as const) {
    test(`renders accessibility lab in ${theme} theme`, async ({ page }) => {
      await page.addInitScript((val) => localStorage.setItem("pil-theme", val), theme);
      await page.goto("/lab/a11y");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Accessibility Audit Lab",
      );
    });
  }
});
