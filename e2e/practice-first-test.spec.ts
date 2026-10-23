import { expect, test } from "@playwright/test";

test.describe("First Playwright Test Practice", () => {
  test("verifies Practice Login portal heading and form elements", async ({ page }) => {
    // 1. Navigate to the verified Practice Login route
    await page.goto("/practice/login");

    // 2. Locate the stable page heading using accessible role
    const portalHeading = page.getByRole("heading", { name: "Practice Login Portal" });
    await expect(portalHeading).toBeVisible();

    // 3. Locate input fields using accessible label text
    const usernameInput = page.getByLabel("Practice Username");
    await expect(usernameInput).toBeVisible();

    const passwordInput = page.getByLabel("Practice Password");
    await expect(passwordInput).toBeVisible();

    // 4. Locate the submit button using accessible role and name
    const submitButton = page.getByRole("button", { name: "Sign In to Practice Portal" });
    await expect(submitButton).toBeVisible();
  });
});
