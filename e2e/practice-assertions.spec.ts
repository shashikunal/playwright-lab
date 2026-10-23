import { expect, test } from "@playwright/test";

test.describe("Playwright Assertions and Auto-Waiting — Hands-On Practice", () => {
  test("Exercise 1: Assert that a heading is visible", async ({ page }) => {
    await page.goto("/lab/locators");

    const heading = page.getByRole("heading", {
      name: "Choose a locator that survives a redesign.",
      level: 1,
    });
    // Web-first retrying assertion: retries until attached & visible
    await expect(heading).toBeVisible();

    const sectionHeading = page.getByRole("heading", {
      name: "Stable locators",
      level: 2,
    });
    await expect(sectionHeading).toBeVisible();
  });

  test("Exercise 2: Assert exact text and partial text", async ({ page }) => {
    await page.goto("/lab/locators");

    const descriptionText = page.getByText("Good examples use accessible names.");

    // Exact text match
    await expect(descriptionText).toHaveText(
      "Good examples use accessible names. Defects are isolated and labeled. This page does not call the API."
    );

    // Partial text match
    await expect(descriptionText).toContainText("accessible names");
    await expect(descriptionText).toContainText("isolated and labeled");
  });

  test("Exercise 3: Validate form values and checked states", async ({ page }) => {
    await page.goto("/lab/forms");

    const fullNameInput = page.getByLabel("Full name");
    await fullNameInput.fill("Ada Lovelace");
    await expect(fullNameInput).toHaveValue("Ada Lovelace");

    const termsCheckbox = page.getByRole("checkbox", { name: "I agree to the lab terms" });
    await expect(termsCheckbox).not.toBeChecked();

    await termsCheckbox.check();
    await expect(termsCheckbox).toBeChecked();

    await termsCheckbox.uncheck();
    await expect(termsCheckbox).not.toBeChecked();
  });

  test("Exercise 4: Verify disabled and enabled buttons", async ({ page }) => {
    await page.goto("/lab/flaky");

    // Dismiss floating overlay so controls are clickable
    await page.getByLabel("Dismiss Overlay").click();
    await expect(page.getByTestId("floating-interceptor")).not.toBeVisible();

    const delayedBtn = page.getByRole("button", { name: "Execute Delayed Action" });

    // Web-first toBeEnabled() automatically retries until 1200ms timer expires
    await expect(delayedBtn).toBeEnabled();

    // Click the now-enabled button
    await delayedBtn.click();
    await expect(page.locator("#actionability-result")).toHaveText(
      /Action successfully executed after actionability wait/
    );
  });

  test("Exercise 5: Assert a URL change after navigation", async ({ page }) => {
    await page.goto("/practice/login");

    await page.getByLabel("Practice Username").fill("student");
    await page.getByLabel("Practice Password").fill("Password123!");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Assert URL change with auto-retry
    await expect(page).toHaveURL(/.*\/practice\/dashboard/);

    // Assert authenticated page content
    await expect(
      page.getByRole("heading", { name: "Welcome, student!", level: 1 })
    ).toBeVisible();
    await expect(page.getByTestId("session-info")).toBeVisible();
  });

  test("Exercise 6: Wait for asynchronous content using a web-first assertion", async ({ page }) => {
    await page.goto("/lab/flaky");

    // Dismiss overlay
    await page.getByLabel("Dismiss Overlay").click();

    const dynamicTarget = page.locator("#dynamic-target");
    await expect(dynamicTarget).toHaveText("DOM Node Generation #1");

    // Trigger DOM replacement
    await page.getByRole("button", { name: "Trigger DOM Replacement" }).click();

    // Web-first assertion automatically retries until new DOM node renders
    await expect(dynamicTarget).toHaveText("DOM Node Generation #2");
  });

  test("Exercise 7: Diagnose assertions and use soft assertions for non-fatal checks", async ({ page }) => {
    await page.goto("/lab/locators");

    // Soft assertions allow collecting multiple checks without halting execution
    await expect.soft(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect.soft(page.getByRole("heading", { name: "Stable locators" })).toBeVisible();
    await expect.soft(page.getByLabel("Search courses")).toHaveAttribute("placeholder", "Try Playwright");

    // Verify all soft assertions succeeded
    expect(test.info().errors).toHaveLength(0);
  });

  test("Exercise 8: Compare an explicit fixed sleep with a retrying assertion", async ({ page }) => {
    await page.goto("/lab/flaky");

    // Dismiss overlay
    await page.getByLabel("Dismiss Overlay").click();

    // RECOMMENDED PATTERN:
    // Web-first assertion polls the condition and resolves as soon as it succeeds
    const delayedBtn = page.getByRole("button", { name: "Execute Delayed Action" });
    await expect(delayedBtn).toBeEnabled({ timeout: 5000 });
  });

  test("Exercise 9: Investigate a timeout with custom message and timeout parameter", async ({ page }) => {
    await page.goto("/lab/locators");

    const searchInput = page.getByLabel("Search courses");

    // Custom failure diagnostic message and explicit assertion timeout
    await expect(
      searchInput,
      "Expected course search input to be visible and ready for user typing"
    ).toBeVisible({ timeout: 3000 });
  });

  test("Exercise 10: Solve a senior-level flaky-test scenario with actionability", async ({ page }) => {
    await page.goto("/lab/flaky");

    const overlay = page.getByTestId("floating-interceptor");
    // Verify overlay intercepts actions
    await expect(overlay).toBeVisible();

    // In a flaky test, clicking controls behind the overlay fails actionability (receives events check).
    // Senior solution: Dismiss the obstructing overlay and assert it is fully detached/hidden
    await page.getByLabel("Dismiss Overlay").click();
    await expect(overlay).not.toBeVisible();

    // Now actions proceed deterministically
    const uploadInput = page.getByLabel("Upload Test Data");
    await expect(uploadInput).toBeVisible();
    await expect(uploadInput).toBeEnabled();
  });
});
