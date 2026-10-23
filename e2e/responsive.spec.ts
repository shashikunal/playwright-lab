import { expect, test } from "./fixtures/index.js";

test.describe("cross-device responsive testing and viewport breakpoints", () => {
  test("toggles mobile hamburger navigation drawer on narrow viewports @smoke", async ({
    page,
  }) => {
    // Set mobile viewport (iPhone / Pixel size)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Hamburger button should be visible
    const menuBtn = page.getByRole("button", { name: "Menu" });
    await expect(menuBtn).toBeVisible();

    // Drawer opens upon click
    await menuBtn.click();
    const nav = page.locator("#lab-nav");
    await expect(nav).toBeVisible();

    // Navigate to a lab from mobile drawer
    await nav.getByRole("link", { name: "Forms" }).click();
    await expect(page).toHaveURL(/\/lab\/forms$/);
  });

  test("renders responsive course grid correctly on tablet viewport", async ({ page }) => {
    // iPad portrait breakpoint (768px)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/app/courses");

    const courseGrid = page.getByTestId("course-grid");
    await expect(courseGrid).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Course Catalogue");
  });

  test("desktop layout expands sidebar without hamburger button", async ({ page }) => {
    // Standard desktop (1280px)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    // Hamburger menu hidden on desktop
    const menuBtn = page.getByRole("button", { name: "Menu" });
    await expect(menuBtn).not.toBeVisible();

    // Sidebar navigation visible by default
    const nav = page.locator("#lab-nav");
    await expect(nav).toBeVisible();
  });
});
