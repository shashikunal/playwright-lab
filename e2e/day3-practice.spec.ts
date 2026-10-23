import { expect, test } from "@playwright/test";

/**
 * Day 3 Practice Suite: Interactive Widgets, Dialogs & Shadow DOM
 * Lab Target: /lab/widgets
 */
test.describe("Day 3: Interactive Widgets, Dialogs & Shadow DOM", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/widgets");
  });

  test("Exercise 1: Native browser dialogs (alert, confirm, prompt)", async ({ page }) => {
    // 1. Alert handling: listener MUST be registered BEFORE triggering the action
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("alert");
      expect(dialog.message()).toContain("Maintenance Notice: Cluster restarts at 02:00 UTC.");
      await dialog.accept();
    });
    await page.getByRole("button", { name: "Trigger Alert" }).click();
    await expect(page.getByTestId("dialog-status")).toHaveText("Alert acknowledged by test runner");

    // 2. Confirm handling - Accept
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("confirm");
      await dialog.accept();
    });
    await page.getByRole("button", { name: "Trigger Confirm" }).click();
    await expect(page.getByTestId("dialog-status")).toHaveText("Confirm accepted");

    // 3. Confirm handling - Dismiss / Reject
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("confirm");
      await dialog.dismiss();
    });
    await page.getByRole("button", { name: "Trigger Confirm" }).click();
    await expect(page.getByTestId("dialog-status")).toHaveText("Confirm rejected");

    // 4. Prompt handling - Provide custom input
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("prompt");
      expect(dialog.defaultValue()).toBe("v2.4.0-rc1");
      await dialog.accept("v3.0.0-release");
    });
    await page.getByRole("button", { name: "Trigger Prompt" }).click();
    await expect(page.getByTestId("dialog-status")).toHaveText("Prompt submitted: v3.0.0-release");
  });

  test("Exercise 2: Accessible HTML modal dialog & keyboard Escape dismissal", async ({ page }) => {
    const openModalBtn = page.getByRole("button", { name: "Open Modal Dialog" });
    await openModalBtn.click();

    // Verify modal dialog is presented with aria-modal="true"
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(modal.getByRole("heading", { name: "Confirm Deployment Target" })).toBeVisible();

    // Fill PIN and submit
    await modal.getByPlaceholder("Type 1234 to proceed").fill("1234");
    await modal.getByRole("button", { name: "Confirm Deploy" }).click();

    // Modal closes and displays confirmation
    await expect(modal).toBeHidden();
    await expect(page.getByTestId("modal-result")).toContainText("Build artifact promoted successfully!");

    // Test Escape key dismissal
    await openModalBtn.click();
    await expect(modal).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(modal).toBeHidden();
  });

  test("Exercise 3: Open Shadow DOM piercing without special locators", async ({ page }) => {
    // In Selenium, piercing Shadow DOM requires driver.executeScript or expand_shadow_root.
    // In Playwright, standard user-facing locators pierce open shadow roots automatically!
    const shadowInput = page.getByPlaceholder("Type inside shadow...");
    await expect(shadowInput).toBeVisible();
    await shadowInput.fill("Automated SDET Action");

    const shadowBtn = page.getByRole("button", { name: "Execute Shadow Action" });
    await shadowBtn.click();

    // Assert shadow feedback text updated
    await expect(page.locator("#shadow-feedback")).toHaveText("Shadow DOM Executed: Automated SDET Action");
  });

  test("Exercise 4: WAI-ARIA accessible tabs traversal", async ({ page }) => {
    const tabList = page.getByRole("tablist", { name: "Widget configuration tabs" });
    await expect(tabList).toBeVisible();

    // Click Security tab
    const securityTab = tabList.getByRole("tab", { name: "Security & Keys" });
    await securityTab.click();
    await expect(securityTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("API keys, authentication credentials")).toBeVisible();

    // Click Telemetry tab
    const telemetryTab = tabList.getByRole("tab", { name: "Telemetry & Logs" });
    await telemetryTab.click();
    await expect(telemetryTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Trace ingestion, log retention policies")).toBeVisible();
  });
});
