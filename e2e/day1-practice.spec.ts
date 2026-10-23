import { expect, test } from "@playwright/test";

/**
 * Day 1 Practice Suite: Semantic Locators, Strict Mode & Locator Architecture
 * Lab Target: /lab/locators
 */
test.describe("Day 1: Semantic Locators Hands-On Practice", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/locators");
  });

  test("Exercise 1: Strict-mode error demonstration & container resolution", async ({ page }) => {
    // 1. Confirm that multiple visible buttons named 'Save' exist
    const saveButtons = page.getByRole("button", { name: "Save" });
    await expect(saveButtons).toHaveCount(2);

    // 2. Demonstrating Playwright Strict Mode:
    // Calling .click() on an ambiguous locator throws a strict-mode violation!
    let strictModeErrorThrown = false;
    try {
      // Timeout 1s to fail quickly on strict mode error
      await page.getByRole("button", { name: "Save" }).click({ timeout: 1000 });
    } catch (err: unknown) {
      strictModeErrorThrown = true;
      const errorMsg = (err as Error).message;
      // Playwright strict mode error contains 'resolved to 2 elements'
      expect(errorMsg).toContain("strict mode violation");
      expect(errorMsg).toContain("resolved to 2 elements");
    }
    expect(strictModeErrorThrown).toBe(true);

    // 3. Resolving cleanly via semantic container scoping
    const buttonGroup = page.getByRole("group", { name: "Visible saves" });
    await buttonGroup.getByRole("button", { name: "Save" }).first().click();

    // 4. Assert dynamic status feedback
    await expect(page.getByRole("status").filter({ hasText: "Saved first copy" })).toBeVisible();
  });

  test("Exercise 2: Dynamic list row targeting without brittle indexes", async ({ page }) => {
    // Target the specific row for 'Fixtures'
    const coursesList = page.getByRole("list", { name: "Courses" });
    const fixturesRow = coursesList.getByRole("listitem").filter({ hasText: "Fixtures" });

    // Assert row exists and click its Open button
    await expect(fixturesRow).toBeVisible();
    await fixturesRow.getByRole("button", { name: "Open" }).click();

    // Verify status confirms 'Opened Fixtures'
    await expect(page.getByRole("status")).toHaveText("Opened Fixtures");
  });

  test("Exercise 3: Accessible name computation via aria-labelledby and aria-label", async ({ page }) => {
    // Input 1 has aria-label="Quick filter"
    const quickFilterInput = page.getByRole("textbox", { name: "Quick filter" });
    await expect(quickFilterInput).toBeVisible();
    await quickFilterInput.fill("playwright-core");
    await expect(quickFilterInput).toHaveValue("playwright-core");

    // Input 2 derives its accessible name from <span id="seat-label">Seat count label</span>
    const seatCountInput = page.getByRole("textbox", { name: "Seat count label" });
    await expect(seatCountInput).toBeVisible();
    await seatCountInput.fill("42");
    await expect(seatCountInput).toHaveValue("42");
  });

  test("Exercise 4: Playwright automatically ignores hidden elements in getByRole", async ({ page }) => {
    // In Locators.tsx there is a 3rd <button type="button">Save</button> enclosed inside <div hidden>
    // But getByRole('button', { name: 'Save' }) only resolves the 2 visible ones:
    await expect(page.getByRole("button", { name: "Save" })).toHaveCount(2);

    // However, a raw DOM CSS query locator('button:has-text("Save")') includes hidden nodes
    const rawDomSaveButtons = page.locator('button:text-is("Save")');
    await expect(rawDomSaveButtons).toHaveCount(3);
  });
});
