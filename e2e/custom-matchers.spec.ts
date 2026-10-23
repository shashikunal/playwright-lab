import { expect, test } from "./fixtures/index.js";
import "./matchers/customMatchers.js";

test.describe("domain-specific custom matchers", () => {
  test("validates accessible dialog using toBeAccessibleDialog matcher", async ({ page }) => {
    await page.goto("/lab/widgets");
    await page.getByRole("button", { name: "Open Modal Dialog" }).click();

    const dialog = page.getByRole("dialog", { name: "Confirm Deployment Target" });
    await expect(dialog).toBeVisible();

    // Assert using custom domain matcher
    await expect(dialog).toBeAccessibleDialog();
  });

  test("validates ISO timestamps using toHaveIsoTimestamp matcher", async ({ appClient }) => {
    const res = await appClient.get("/api/app/activity");
    expect(res.ok()).toBeTruthy();
    const { activities } = await res.json();
    expect(activities.length).toBeGreaterThan(0);

    const firstItem = activities[0];
    await expect(firstItem.timestamp).toHaveIsoTimestamp();
  });

  test("validates audit trail action types using toHaveValidAuditAction matcher", async ({
    appClient,
  }) => {
    const res = await appClient.get("/api/app/activity");
    const { activities } = await res.json();
    for (const item of activities.slice(0, 5)) {
      expect(item.action).toHaveValidAuditAction();
    }
  });
});
