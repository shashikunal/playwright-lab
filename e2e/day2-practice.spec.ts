import { expect, test } from "@playwright/test";

/**
 * Day 2 Practice Suite: Accessible Forms, Complex Comboboxes & Keyboard Navigation
 * Lab Target: /lab/forms
 */
test.describe("Day 2: Accessible Forms & Keyboard Mastery", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/forms");
  });

  test("Exercise 1: Client validation errors on empty submission", async ({ page }) => {
    // 1. Submit empty form
    const submitBtn = page.getByRole("button", { name: "Submit intake" });
    await submitBtn.click();

    // 2. Assert that ARIA alerts appear for mandatory fields (6 total: name, email, seats, date, track, terms)
    const alerts = page.getByRole("alert");
    await expect(alerts.first()).toBeVisible();
    await expect(alerts).toHaveCount(6);
    await expect(alerts.filter({ hasText: "Enter 2 to 80 characters" })).toBeVisible();
    await expect(alerts.filter({ hasText: "Enter a valid email address" })).toBeVisible();

    // 3. Confirm that no success status was rendered
    await expect(page.getByRole("status").filter({ hasText: /Accepted as/ })).toHaveCount(0);
  });

  test("Exercise 2: ARIA 1.2 Combobox selection and debounced autocomplete", async ({ page }) => {
    // Navigate to the Combobox tab
    await page.getByTestId("tab-combos").click();

    const combobox = page.getByTestId("custom-combobox");
    await expect(combobox).toBeVisible();

    // Open combobox
    await combobox.click();
    await expect(combobox).toHaveAttribute("aria-expanded", "true");

    // Select 'Python' option from listbox
    const pythonOption = page.getByTestId("combo-option-python");
    await expect(pythonOption).toBeVisible();
    await pythonOption.click();

    // Verify option was selected and combobox collapsed
    await expect(combobox).toContainText("Python");
    await expect(combobox).toHaveAttribute("aria-expanded", "false");

    // Debounced Autocomplete search
    const autoInput = page.getByTestId("autocomplete-input");
    await autoInput.fill("page.");
    await expect(page.getByTestId("auto-results")).toBeVisible();
    // Scope assertion to the autocomplete results container to avoid strict mode violations
    await expect(page.getByTestId("auto-results").getByText("page.getByRole", { exact: true })).toBeVisible();
  });

  test("Exercise 3: Complete form submission with network response waiting", async ({ page }) => {
    // Fill out valid intake
    await page.getByLabel("Full name").fill("Grace Hopper");
    await page.getByLabel("Email").fill("grace@navy.mil");
    await page.getByLabel("Seats").fill("3");
    await page.getByLabel("Start date").fill("2026-11-15");
    await page.getByLabel("Track").selectOption("api");
    await page.getByRole("checkbox", { name: "I agree to the lab terms" }).check();

    // Intercept API response to prevent race conditions
    const resPromise = page.waitForResponse(
      (res) => res.url().includes("/api/lab/forms/intake") && res.ok(),
    );

    // Submit via button click
    await page.getByRole("button", { name: "Submit intake" }).click();
    const res = await resPromise;
    const body = await res.json();

    // Verify success banner contains the returned submission ID (scoped by status filter)
    expect(body.status).toBe("accepted");
    await expect(page.getByRole("status").filter({ hasText: `Accepted as ${body.id}` })).toBeVisible();
  });

  test("Exercise 4: Multi-step wizard traversal and dialog handling", async ({ page }) => {
    // Switch to Wizard tab
    await page.getByTestId("tab-wizard").click();

    // Step 1: Username
    const usernameInput = page.getByTestId("wizard-username-input");
    await usernameInput.fill("senior_sdet");
    await page.getByTestId("wizard-next-btn").click();

    // Step 2: Subscription Tier
    await expect(page.getByTestId("wizard-step-2")).toBeVisible();
    await page.getByTestId("wizard-tier-select").selectOption("Professional");
    await page.getByTestId("wizard-next-btn").click();

    // Step 3: Review & Finalize
    await expect(page.getByTestId("wizard-step-3")).toBeVisible();
    await expect(page.getByTestId("review-user")).toHaveText("senior_sdet");
    await expect(page.getByTestId("review-tier")).toHaveText("Professional");

    // Handle the browser alert dialog on finish
    page.once("dialog", (dialog) => {
      expect(dialog.message()).toContain("Wizard completed successfully");
      dialog.accept();
    });
    await page.getByTestId("wizard-finish-btn").click();
  });

  test("Exercise 5: Double-submit protection & auto-waiting for disabled state", async ({ page }) => {
    // Switch to Wizard tab
    await page.getByTestId("tab-wizard").click();

    const doubleSubmitBtn = page.getByTestId("double-submit-btn");
    await expect(doubleSubmitBtn).toBeEnabled();

    // Click and immediately verify button enters disabled state
    await doubleSubmitBtn.click();
    await expect(doubleSubmitBtn).toBeDisabled();

    // Auto-waits for in-flight operation to finish and button to re-enable
    await expect(doubleSubmitBtn).toBeEnabled({ timeout: 5000 });
    await expect(page.getByTestId("submit-success-count")).toHaveText("Successful Submissions: 1");
  });
});
