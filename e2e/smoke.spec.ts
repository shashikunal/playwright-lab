import { expect, test } from "@playwright/test";

test.describe("foundation", () => {
  test("health endpoint returns ok @smoke @api", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("playwright-industrial-lab");
    expect(body.store).toBe("memory");
  });

  test("overview shows a healthy API @smoke", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "API healthy" })).toBeVisible();
  });

  test("unknown page offers a way home", async ({ page }) => {
    await page.goto("/missing-lab");
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await page.getByRole("link", { name: "Back to overview" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
