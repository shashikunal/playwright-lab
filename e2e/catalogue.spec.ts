import { expect, test } from "@playwright/test";

test.describe("scenario catalogue", () => {
  test("lists live labs as links and planned labs as text @smoke", async ({ page }) => {
    await page.goto("/");
    const catalogue = page.getByRole("region", { name: "Scenario catalogue" });
    await expect(page.getByRole("status").filter({ hasText: "API healthy" })).toBeVisible();
    await expect(catalogue.getByRole("link", { name: "Locator Gym" })).toHaveAttribute("href", "/lab/locators");
    await expect(catalogue.getByRole("link", { name: "Intake form" })).toHaveAttribute("href", "/lab/forms");
    await expect(catalogue.getByRole("link", { name: "Widgets" })).toHaveAttribute("href", "/lab/widgets");
    await expect(catalogue.getByRole("link", { name: "Scenario controls" })).toHaveAttribute("href", "/lab/network");
    await expect(catalogue.getByRole("link", { name: "Course catalogue" })).toHaveAttribute("href", "/app/courses");
    await expect(catalogue.getByRole("link", { name: "Enrollment" })).toHaveAttribute("href", "/app/enrollments");
    await expect(catalogue.getByRole("link", { name: "Flaky Lab" })).toHaveAttribute("href", "/lab/flaky");
    await expect(catalogue.getByRole("link", { name: "Visual Regression Lab" })).toHaveAttribute("href", "/lab/visual");
    await expect(catalogue.getByRole("link", { name: "Accessibility Audit Lab" })).toHaveAttribute("href", "/lab/a11y");
    await expect(catalogue.getByRole("link", { name: "Performance & Vitals Lab" })).toHaveAttribute("href", "/lab/perf");
    await expect(catalogue.getByRole("link", { name: "WebAssembly Sandbox" })).toHaveCount(0);
    await expect(catalogue.getByRole("heading", { name: "WebAssembly Sandbox" })).toBeVisible();
    await expect(catalogue.getByText("Not available yet").first()).toBeVisible();
  });

  test("filters through the API", async ({ page }) => {
    await page.goto("/");
    const catalogue = page.getByRole("region", { name: "Scenario catalogue" });
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/scenarios") && response.url().includes("topic=forms") && response.ok(),
    );
    await page.getByLabel("Topic").selectOption("forms");
    await responsePromise;
    await expect(catalogue.getByRole("link", { name: "Intake form" })).toBeVisible();
    await expect(catalogue.getByRole("link", { name: "Locator Gym" })).toHaveCount(0);
    await expect(catalogue.getByRole("heading", { name: "Widgets" })).toHaveCount(0);
  });

  test("search can empty the catalogue", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Search scenarios").fill("zzzz-no-match");
    await expect(page.getByRole("region", { name: "Scenario catalogue" }).getByText("No scenarios match")).toBeVisible();
  });

  test("rejects an unknown topic @api", async ({ request }) => {
    const response = await request.get("/api/scenarios?topic=nope");
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("invalid_query");
  });

  test("returns only the requested difficulty @api", async ({ request }) => {
    const response = await request.get("/api/scenarios?difficulty=beginner");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.scenarios).toHaveLength(1);
    expect(body.scenarios[0].id).toBe("locators");
    expect(body.scenarios[0].status).toBe("available");
  });

  for (const theme of ["light", "dark"] as const) {
    test(`renders in the ${theme} theme`, async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem("pil-theme", value), theme);
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.getByRole("region", { name: "Scenario catalogue" })).toBeVisible();
      await expect(page.getByRole("status").filter({ hasText: "API healthy" })).toBeVisible();
    });
  }
});
