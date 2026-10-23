import { expect, test } from "@playwright/test";

test.describe("Playwright Forms and Validation — Hands-On Practice", () => {
  test("Exercise 1: Submit a valid form and verify success state", async ({ page }) => {
    await page.goto("/lab/forms");

    await page.getByLabel("Full name").fill("Katherine Johnson");
    await page.getByLabel("Email").fill("kjohnson@nasa.test");
    await page.getByLabel("Seats").fill("4");
    await page.getByLabel("Start date").fill("2026-11-15");
    await page.getByLabel("Track").selectOption("locators");
    await page.getByRole("checkbox", { name: "I agree to the lab terms" }).check();

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes("/api/lab/forms/intake") && res.ok()
    );
    await page.getByRole("button", { name: "Submit intake" }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    const body = await response.json();
    await expect(
      page.getByRole("status").filter({ hasText: `Accepted as ${body.id}` })
    ).toBeVisible();
  });

  test("Exercise 2: Submit an empty form and verify required-field errors", async ({ page }) => {
    await page.goto("/lab/forms");

    // Click submit without filling required fields
    await page.getByRole("button", { name: "Submit intake" }).click();

    // Verify field-level error messages
    await expect(page.getByText("Enter 2 to 80 characters without HTML")).toBeVisible();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await expect(page.getByText("Seats must be an integer from 1 to 12")).toBeVisible();
    await expect(page.getByText("Enter a real date as YYYY-MM-DD")).toBeVisible();
    await expect(page.locator("#track-error")).toHaveText("Choose a track");
    await expect(page.getByText("Agree to the lab terms", { exact: true })).toBeVisible();

    // Verify form was not submitted
    await expect(page.getByText(/Accepted as/)).toHaveCount(0);
  });

  test("Exercise 3: Validate malformed email input", async ({ page }) => {
    await page.goto("/lab/forms");

    // Valid name, but invalid email format
    await page.getByLabel("Full name").fill("Ada Lovelace");
    await page.getByLabel("Email").fill("invalid-email-address");

    await page.getByRole("button", { name: "Submit intake" }).click();

    // Error for email is displayed
    const emailError = page.locator("#email-error");
    await expect(emailError).toBeVisible();
    await expect(emailError).toHaveText("Enter a valid email address");

    // Fix email to valid format
    await page.getByLabel("Email").fill("ada@valid.test");
    await page.getByRole("button", { name: "Submit intake" }).click();

    // Email error should clear
    await expect(emailError).not.toBeVisible();
  });

  test("Exercise 4: Test minimum and maximum field limits and boundary conditions", async ({ page }) => {
    await page.goto("/lab/forms");

    // Switch to All Inputs tab
    await page.getByTestId("tab-inputs").click();

    const numberInput = page.getByTestId("input-number");
    await expect(numberInput).toBeVisible();
    await expect(numberInput).toHaveAttribute("min", "0");
    await expect(numberInput).toHaveAttribute("max", "100");

    // Set boundary values
    await numberInput.fill("0");
    await expect(numberInput).toHaveValue("0");

    await numberInput.fill("100");
    await expect(numberInput).toHaveValue("100");

    // Test range slider boundary
    const rangeSlider = page.getByTestId("input-range");
    await rangeSlider.fill("0");
    await expect(page.getByTestId("range-val")).toHaveText("0");

    await rangeSlider.fill("100");
    await expect(page.getByTestId("range-val")).toHaveText("100");
  });

  test("Exercise 5: Validate password input controls", async ({ page }) => {
    await page.goto("/lab/forms");
    await page.getByTestId("tab-inputs").click();

    const passwordInput = page.getByTestId("input-password");
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute("type", "password");

    await passwordInput.fill("ComplexP@ssw0rd!2026");
    await expect(passwordInput).toHaveValue("ComplexP@ssw0rd!2026");
  });

  test("Exercise 6: Test checkboxes, radio buttons, and dropdowns", async ({ page }) => {
    await page.goto("/lab/forms");

    // Switch to Combos tab
    await page.getByTestId("tab-combos").click();

    // Native single select
    const singleSelect = page.getByTestId("native-single-select");
    await singleSelect.selectOption("firefox");
    await expect(page.getByTestId("single-select-val")).toContainText("firefox");

    // Native multi-select
    const multiSelect = page.getByTestId("native-multi-select");
    await multiSelect.selectOption(["chromium", "webkit"]);
    await expect(page.getByTestId("multi-select-val")).toContainText("chromium, webkit");

    // Switch to All Inputs tab for radio testing
    await page.getByTestId("tab-inputs").click();
    const radioA = page.getByTestId("radio-option-a");
    const radioB = page.getByTestId("radio-option-b");

    await radioA.check();
    await expect(radioA).toBeChecked();
    await expect(radioB).not.toBeChecked();

    await radioB.check();
    await expect(radioB).toBeChecked();
    await expect(radioA).not.toBeChecked();
  });

  test("Exercise 7: Verify server-side validation errors", async ({ page }) => {
    await page.goto("/lab/forms");

    // Fill valid client values, but use route mocking to simulate a server 422 Unprocessable Entity
    await page.route("**/api/lab/forms/intake", async (route) => {
      await route.fulfill({
        status: 422,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            message: "Validation failed",
            details: [
              { field: "seats", message: "Maximum allowable seats for this cohort is 8." }
            ]
          }
        })
      });
    });

    await page.getByLabel("Full name").fill("Grace Hopper");
    await page.getByLabel("Email").fill("grace@navy.test");
    await page.getByLabel("Seats").fill("10");
    await page.getByLabel("Start date").fill("2026-11-20");
    await page.getByLabel("Track").selectOption("fixtures");
    await page.getByRole("checkbox", { name: "I agree to the lab terms" }).check();

    await page.getByRole("button", { name: "Submit intake" }).click();

    // Assert server-originated field error and error banner
    await expect(page.getByText("Maximum allowable seats for this cohort is 8.")).toBeVisible();
    await expect(page.getByText("Express rejected the intake")).toBeVisible();
  });

  test("Exercise 8: Handle an API failure without losing user input", async ({ page }) => {
    await page.goto("/lab/forms");

    // Mock an unexpected 500 server crash
    await page.route("**/api/lab/forms/intake", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Database Outage" })
      });
    });

    const typedName = "Alan Turing";
    const typedEmail = "turing@bletchley.test";

    await page.getByLabel("Full name").fill(typedName);
    await page.getByLabel("Email").fill(typedEmail);
    await page.getByLabel("Seats").fill("2");
    await page.getByLabel("Start date").fill("2026-12-01");
    await page.getByLabel("Track").selectOption("locators");
    await page.getByRole("checkbox", { name: "I agree to the lab terms" }).check();

    await page.getByRole("button", { name: "Submit intake" }).click();

    // Error alert is shown
    await expect(page.getByText("Express rejected the intake")).toBeVisible();

    // Crucial requirement: verify that user inputs are preserved on failure!
    await expect(page.getByLabel("Full name")).toHaveValue(typedName);
    await expect(page.getByLabel("Email")).toHaveValue(typedEmail);
    await expect(page.getByLabel("Seats")).toHaveValue("2");
  });

  test("Exercise 9: Test a multi-step form wizard", async ({ page }) => {
    await page.goto("/lab/forms");

    // Switch to Wizard tab
    await page.getByTestId("tab-wizard").click();
    await expect(page.getByTestId("wizard-step-indicator")).toHaveText("Step 1 of 3");

    // Step 1: Username
    const usernameInput = page.getByTestId("wizard-username-input");
    await usernameInput.fill("senior_automation_lead");
    await page.getByTestId("wizard-next-btn").click();

    // Step 2: Subscription Tier
    await expect(page.getByTestId("wizard-step-indicator")).toHaveText("Step 2 of 3");
    const tierSelect = page.getByTestId("wizard-tier-select");
    await tierSelect.selectOption("Enterprise");
    await page.getByTestId("wizard-next-btn").click();

    // Step 3: Review Confirmation
    await expect(page.getByTestId("wizard-step-indicator")).toHaveText("Step 3 of 3");
    await expect(page.getByTestId("review-user")).toHaveText("senior_automation_lead");
    await expect(page.getByTestId("review-tier")).toHaveText("Enterprise");

    // Test Back button functionality
    await page.getByTestId("wizard-back-btn").click();
    await expect(page.getByTestId("wizard-step-indicator")).toHaveText("Step 2 of 3");
    await expect(tierSelect).toHaveValue("Enterprise");
  });

  test("Exercise 10: Verify loading state and duplicate-submit prevention", async ({ page }) => {
    await page.goto("/lab/forms");
    await page.getByTestId("tab-wizard").click();

    const doubleSubmitBtn = page.getByTestId("double-submit-btn");
    await expect(doubleSubmitBtn).toBeEnabled();

    // Click submit with protection
    await doubleSubmitBtn.click();

    // Button immediately becomes disabled and displays loading indicator
    await expect(doubleSubmitBtn).toBeDisabled();
    await expect(doubleSubmitBtn).toHaveAttribute("aria-busy", "true");
    await expect(doubleSubmitBtn).toContainText("Processing...");

    // Wait for submission to complete (800ms)
    await expect(doubleSubmitBtn).toBeEnabled({ timeout: 5000 });
    await expect(page.getByTestId("submit-success-count")).toHaveText("Successful Submissions: 1");
  });

  test("Exercise 11: Test keyboard-only form completion", async ({ page }) => {
    await page.goto("/practice/login");

    const usernameInput = page.getByLabel("Practice Username");
    await usernameInput.focus();

    // Complete form using only keyboard keystrokes
    await page.keyboard.type("student");
    await page.keyboard.press("Tab");
    await page.keyboard.type("Password123!");
    await page.keyboard.press("Enter");

    // Verify successful login
    await expect(page).toHaveURL(/.*\/practice\/dashboard/);
    await expect(page.getByRole("heading", { name: "Welcome, student!" })).toBeVisible();
  });

  test("Exercise 12: Complete a senior-level form testing challenge", async ({ page }) => {
    await page.goto("/lab/forms");

    // Challenge Part 1: Conditional Corporate Fields in Wizard Tab
    await page.getByTestId("tab-wizard").click();
    await expect(page.getByTestId("corporate-fields-panel")).not.toBeVisible();

    // Select corporate radio to reveal conditional fields
    await page.getByTestId("account-corporate-radio").check();
    const corpPanel = page.getByTestId("corporate-fields-panel");
    await expect(corpPanel).toBeVisible();

    await page.getByTestId("company-name-input").fill("Antigravity Systems Corp");
    await page.getByTestId("tax-id-input").fill("US-88492019-X");
    await expect(page.getByTestId("company-name-input")).toHaveValue("Antigravity Systems Corp");

    // Challenge Part 2: Custom ARIA 1.2 Combobox Selection in Combos Tab
    await page.getByTestId("tab-combos").click();
    const combobox = page.getByTestId("custom-combobox");
    await expect(combobox).toBeVisible();

    // Open combobox popup
    await combobox.click();
    const optionsList = page.getByTestId("combobox-options-list");
    await expect(optionsList).toBeVisible();

    // Select Python option
    await page.getByTestId("combo-option-python").click();
    await expect(optionsList).not.toBeVisible();
    await expect(combobox).toContainText("Python");

    // Challenge Part 3: Debounced Autocomplete Input
    const autoInput = page.getByTestId("autocomplete-input");
    await autoInput.pressSequentially("page.get", { delay: 40 });
    const autoResults = page.getByTestId("auto-results");
    await expect(autoResults).toBeVisible();
    await expect(autoResults.getByText("page.getByRole")).toBeVisible();
  });
});
