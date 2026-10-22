import { expect, test } from "@playwright/test";

test.describe("locator gym", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/locators");
  });

  test("uses role, label, placeholder, title, image, and test id", async ({ page }) => {
    await page.getByLabel("Search courses").fill("locators");
    await expect(page.getByPlaceholder("Try Playwright")).toHaveValue("locators");
    await expect(page.getByRole("textbox", { name: "Quick filter" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Seat count label" })).toBeVisible();
    await expect(page.getByRole("img", { name: "Locator map" })).toBeVisible();
    await expect(page.getByTitle("Locator gym shortcut")).toBeVisible();
    await page.getByTestId("stable-action").click();
    await expect(page.getByRole("status").filter({ hasText: "Check finished" })).toBeVisible();
  });

  test("filters a nested row instead of using a bare nth click", async ({ page }) => {
    const row = page.getByRole("list", { name: "Courses" }).getByRole("listitem").filter({ hasText: "Locators" });
    await row.getByRole("button", { name: "Open" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Opened Locators" })).toBeVisible();
    await page.getByRole("button", { name: "Show nested locator tradeoff" }).click();
    await expect(page.getByText("nth, first, and last break when the list order changes.")).toBeVisible();
  });

  test("keeps duplicate and hidden controls from breaking scoped queries", async ({ page }) => {
    const saves = page.getByRole("group", { name: "Visible saves" }).getByRole("button", { name: "Save" });
    await expect(saves).toHaveCount(2);
    await expect(page.getByRole("button", { name: "Save" })).toHaveCount(2);
    await saves.first().click();
    await expect(page.getByRole("status").filter({ hasText: "Saved first copy" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Duplicate accessible names" }).getByRole("button", { name: "Edit" })).toHaveCount(2);
  });

  test("does not expose broken label associations through getByLabel", async ({ page }) => {
    const missing = page.getByRole("region", { name: "Missing association" });
    await expect(missing.getByRole("heading", { name: "Training defect" })).toBeVisible();
    await expect(missing.getByLabel("Employee name")).toHaveCount(0);
    await expect(missing.getByRole("textbox")).toBeVisible();

    const mismatched = page.getByRole("region", { name: "Mismatched association" });
    await expect(mismatched.getByLabel("Badge number")).toHaveCount(0);
    await expect(mismatched.locator("#actual-badge")).toBeVisible();
  });

  for (const theme of ["light", "dark"] as const) {
    test(`renders in the ${theme} theme`, async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem("pil-theme", value), theme);
      await page.goto("/lab/locators");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.getByRole("heading", { name: "Choose a locator that survives a redesign." })).toBeVisible();
    });
  }
});
