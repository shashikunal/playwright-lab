import { expect, test } from "@playwright/test";

/**
 * Playwright Locators Practice Suite (10 Progressive Exercises)
 * Target Lab: /lab/locators
 */
test.describe("Playwright Locators — Hands-On Practice", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/locators");
  });

  test("Exercise 1: Locate a heading by role and accessible name", async ({ page }) => {
    // Locate the primary page heading using accessible role and exact name
    const mainHeading = page.getByRole("heading", {
      name: "Choose a locator that survives a redesign.",
      level: 1,
    });
    await expect(mainHeading).toBeVisible();

    // Locate the section subheading using level 2
    const sectionHeading = page.getByRole("heading", {
      name: "Stable locators",
      level: 2,
    });
    await expect(sectionHeading).toBeVisible();
  });

  test("Exercise 2: Find and fill a form field by label", async ({ page }) => {
    // Locate input through properly associated label element
    const searchInput = page.getByLabel("Search courses");
    await expect(searchInput).toBeVisible();

    // Fill value and assert with web-first assertion
    await searchInput.fill("Playwright Locators");
    await expect(searchInput).toHaveValue("Playwright Locators");

    // Verify input can also be identified via its placeholder attribute
    await expect(page.getByPlaceholder("Try Playwright")).toHaveValue("Playwright Locators");
  });

  test("Exercise 3: Locate a button by role and name", async ({ page }) => {
    // Locate the action button by semantic role and accessible name
    const runCheckButton = page.getByRole("button", { name: "Run check" });
    await expect(runCheckButton).toBeVisible();

    // Click the button and assert on dynamic status feedback
    await runCheckButton.click();
    const statusMessage = page.getByRole("status");
    await expect(statusMessage).toBeVisible();
    await expect(statusMessage).toHaveText("Check finished");
  });

  test("Exercise 4: Handle repeated text and duplicate elements", async ({ page }) => {
    // Locate container that groups the visible save actions
    const buttonGroup = page.getByRole("group", { name: "Visible saves" });
    const saveButtons = buttonGroup.getByRole("button", { name: "Save" });

    // Verify container scoping disambiguates exactly 2 visible buttons
    await expect(saveButtons).toHaveCount(2);

    // Click first copy and assert specific status feedback
    await saveButtons.first().click();
    await expect(page.getByRole("status")).toHaveText("Saved first copy");

    // Click second copy and assert status updates dynamically
    await saveButtons.nth(1).click();
    await expect(page.getByRole("status")).toHaveText("Saved second copy");
  });

  test("Exercise 5: Locate an action within a specific table row", async ({ page }) => {
    // Target the dynamic list container
    const coursesList = page.getByRole("list", { name: "Courses" });
    await expect(coursesList).toBeVisible();

    // Locate the specific row item for 'Fixtures' by filtering text
    const targetRow = coursesList.getByRole("listitem").filter({ hasText: "Fixtures" });
    await expect(targetRow).toBeVisible();

    // Trigger row-scoped action button
    const openButton = targetRow.getByRole("button", { name: "Open" });
    await openButton.click();

    // Verify row-specific outcome without relying on brittle numeric indexes
    await expect(page.getByRole("status")).toHaveText("Opened Fixtures");
  });

  test("Exercise 6: Use filter() to identify the correct component", async ({ page }) => {
    // Target list items using nested locator predicate in filter
    const locatorsCard = page
      .getByRole("listitem")
      .filter({ has: page.getByText("Locators", { exact: true }) });
    await expect(locatorsCard).toBeVisible();

    // Interact with the action inside the filtered component
    await locatorsCard.getByRole("button", { name: "Open" }).click();
    await expect(page.getByRole("status")).toHaveText("Opened Locators");
  });

  test("Exercise 7: Diagnose and correct a strict-mode violation", async ({ page }) => {
    // 1. Demonstrate that unscoped locator throws a strict-mode violation error
    let strictModeErrorCaught = false;
    try {
      await page.getByRole("button", { name: "Edit" }).click({ timeout: 1000 });
    } catch (err: unknown) {
      strictModeErrorCaught = true;
      const errorMsg = (err as Error).message;
      expect(errorMsg).toContain("strict mode violation");
      expect(errorMsg).toContain("resolved to 2 elements");
    }
    expect(strictModeErrorCaught).toBe(true);

    // 2. Correct by scoping to the parent region
    const defectRegion = page.getByRole("region", { name: "Duplicate accessible names" });
    await defectRegion.getByRole("button", { name: "Edit" }).first().click();

    // 3. Verify interaction succeeds
    await expect(page.getByRole("status")).toHaveText("Edit activated");
  });

  test("Exercise 8: Replace a brittle CSS or XPath selector with a more reliable locator", async ({ page }) => {
    // Refactor away from brittle CSS (div.space-y-1\\.5 > input#course-search) to semantic label
    const searchField = page.getByLabel("Search courses");
    await searchField.fill("Resilient Test Architecture");
    await expect(searchField).toHaveValue("Resilient Test Architecture");

    // Refactor away from brittle XPath (//section[1]//button[@data-testid='stable-action']) to semantic role
    const submitBtn = page.getByRole("button", { name: "Run check" });
    await submitBtn.click();
    await expect(page.getByRole("status")).toHaveText("Check finished");
  });

  test("Exercise 9: Work with a dynamically rendered element", async ({ page }) => {
    // The tradeoff explanation is initially unmounted from the DOM
    const tradeoffText = page.getByText("Prefer role, label, and placeholder over a test id.");
    await expect(tradeoffText).toHaveCount(0);

    // Click disclosure button to dynamically render the explanation into the DOM
    const disclosureButton = page.getByRole("button", { name: "Show stable locator tradeoff" });
    await disclosureButton.click();

    // Web-first assertion automatically waits for the element to mount and become visible
    await expect(tradeoffText).toBeVisible();
  });

  test("Exercise 10: Complete a senior-level locator debugging challenge", async ({ page }) => {
    // Diagnosis 1: Confirm missing label association prevents getByLabel resolution
    const missingAssocRegion = page.getByRole("region", { name: "Missing association" });
    await expect(missingAssocRegion.getByLabel("Employee name")).toHaveCount(0);
    // Resolve via scoped role query
    await expect(missingAssocRegion.getByRole("textbox")).toBeVisible();

    // Diagnosis 2: Confirm mismatched htmlFor/id prevents getByLabel lookup
    const mismatchedRegion = page.getByRole("region", { name: "Mismatched association" });
    await expect(mismatchedRegion.getByLabel("Badge number")).toHaveCount(0);
    await expect(mismatchedRegion.locator("#actual-badge")).toBeVisible();

    // Diagnosis 3: Verify getByRole filters out hidden duplicate nodes automatically
    // Whereas raw CSS/DOM queries include hidden nodes
    const accessibleSaves = page.getByRole("button", { name: "Save" });
    await expect(accessibleSaves).toHaveCount(2);

    const rawDomSaves = page.locator('button:text-is("Save")');
    await expect(rawDomSaves).toHaveCount(3);
  });
});
