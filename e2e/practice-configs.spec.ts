import { expect, test } from "@playwright/test";

test.describe("Practice Configurations Verification", () => {
  test("resolves relative path navigation against configured baseURL", async ({ page }) => {
    await page.goto("/practice/login");
    await expect(page).toHaveURL(/.*\/practice\/login/);
    const heading = page.getByRole("heading", { name: "Practice Login Portal" });
    await expect(heading).toBeVisible();
  });

  test("verifies input controls are accessible within actionTimeout window", async ({ page }) => {
    await page.goto("/practice/login");
    const usernameInput = page.getByLabel("Practice Username");
    await expect(usernameInput).toBeVisible();
    await usernameInput.fill("student");
    await expect(usernameInput).toHaveValue("student");
  });
});
