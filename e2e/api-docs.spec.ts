import { expect, test } from "@playwright/test";

test.describe("OpenAPI / Swagger interactive documentation", () => {
  test("serves valid OpenAPI 3.1.0 JSON schema via API endpoint @api", async ({ request }) => {
    const res = await request.get("/api/docs/openapi.json");
    expect(res.ok()).toBeTruthy();
    expect(res.headers()["content-type"]).toContain("application/json");

    const spec = await res.json();
    expect(spec.openapi).toBe("3.1.0");
    expect(spec.info.title).toBe("Playwright Industrial Lab API");
    expect(spec.paths).toBeDefined();

    // Verify key documented routes
    expect(spec.paths["/health"]).toBeDefined();
    expect(spec.paths["/scenarios"]).toBeDefined();
    expect(spec.paths["/practice/auth/login"]).toBeDefined();
    expect(spec.paths["/app/courses"]).toBeDefined();
    expect(spec.paths["/lab/network/settings"]).toBeDefined();
  });

  test("renders interactive HTML API explorer with endpoints and raw spec link @smoke", async ({
    page,
  }) => {
    await page.goto("/api/docs");

    await expect(page.getByTestId("api-docs-container")).toBeVisible();
    await expect(page.getByTestId("api-docs-title")).toHaveText("Playwright Industrial Lab API");

    // Verify Raw OpenAPI JSON link
    const rawLink = page.getByTestId("raw-spec-link");
    await expect(rawLink).toBeVisible();
    await expect(rawLink).toHaveAttribute("href", "/api/docs/openapi.json");

    // Verify endpoint count badge is populated
    const countBadge = page.getByTestId("endpoints-count");
    await expect(countBadge).toBeVisible();
    await expect(countBadge).toContainText("Endpoints");

    // Verify documented endpoints list
    const endpointsList = page.getByTestId("endpoints-list");
    await expect(endpointsList).toBeVisible();
    await expect(endpointsList).toContainText("/health");
    await expect(endpointsList).toContainText("/practice/auth/login");
    await expect(endpointsList).toContainText("/app/courses");
  });

  test("executes live API request in explorer and renders formatted response", async ({
    page,
  }) => {
    await page.goto("/api/docs");

    // Click "Try It Out" for GET /health (first Try It Out button)
    const firstTryBtn = page.getByRole("button", { name: "Try It Out" }).first();
    await expect(firstTryBtn).toBeVisible();
    await firstTryBtn.click();

    // Verify results panel is displayed with HTTP 200 and JSON body
    const resultsPanel = page.locator("#results-panel");
    await expect(resultsPanel).toBeVisible();
    await expect(page.locator("#results-status")).toContainText("200");
    await expect(page.locator("#results-body")).toContainText('"status": "ok"');
  });

  test("navigates to API docs from Overview catalogue link", async ({ page }) => {
    await page.goto("/");
    const docsLink = page.getByTestId("api-docs-link");
    await expect(docsLink).toBeVisible();
    await expect(docsLink).toHaveAttribute("href", "/api/docs");
  });
});
