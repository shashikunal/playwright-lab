import { expect, test } from "@playwright/test";

test.describe("scenario controls and network lab", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page, request }) => {
    // Reset controls to clean state before each test
    await request.post("/api/lab/network/reset");
    await page.goto("/lab/network");
  });

  test("fetches telemetry items normally in default configuration @smoke", async ({ page }) => {
    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();
    const list = page.getByTestId("telemetry-list");
    await expect(list).toBeVisible();
    await expect(list.getByText("Cluster Snapshot Ingestion")).toBeVisible();
    await expect(list.getByText("Edge Cache Invalidation")).toBeVisible();
  });

  test("auto-waits for delayed backend responses when latency is applied", async ({ page }) => {
    // Select Moderate (800ms) latency
    await page.getByLabel("Moderate (800ms)").click();
    await expect(page.getByText("Latency: 800ms")).toBeVisible();

    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

    // Verify loading spinner appears
    const loading = page.getByText("Waiting for Express backend response...");
    await expect(loading).toBeVisible();

    // Auto-waits for item list without hardcoded sleep
    const list = page.getByTestId("telemetry-list");
    await expect(list).toBeVisible();
    await expect(loading).not.toBeVisible();
  });

  test("displays structured error alerts on HTTP 500 status override", async ({ page }) => {
    await page.getByLabel("Status code override").selectOption("500");
    await expect(page.getByText("Status: HTTP 500")).toBeVisible();

    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("Request Failed (Status: 500)");
    await expect(alert).toContainText("simulated upstream database outage");
  });

  test("displays not-found error on HTTP 404 status override", async ({ page }) => {
    await page.getByLabel("Status code override").selectOption("404");
    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("Status: 404");
  });

  test("handles simulated empty state correctly", async ({ page }) => {
    await page.getByLabel("Simulate Empty Response").check();
    await expect(page.getByText("Data: Empty Collection")).toBeVisible();

    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

    const empty = page.getByTestId("empty-state");
    await expect(empty).toBeVisible();
    await expect(empty).toContainText("No items matching query");
  });

  test("performs optimistic UI update and rolls back on server 500 error", async ({ page }) => {
    // Configure server to return 500
    await page.getByLabel("Status code override").selectOption("500");
    await expect(page.getByText("Status: HTTP 500")).toBeVisible();

    await page.getByLabel("New item title").fill("Failing Ephemeral Container");
    await page.getByRole("button", { name: "Add Item Optimistically" }).click();

    // Rollback error should appear and item should not persist
    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("Rollback executed");
    await expect(page.getByTestId("optimistic-list")).not.toContainText("Failing Ephemeral Container");
  });

  test("mocks API responses with page.route fulfill", async ({ page }) => {
    await page.route("**/api/lab/network/interception-target", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          source: "playwright-mock",
          message: "Intercepted by route.fulfill()",
        }),
      });
    });

    await page.getByRole("button", { name: "Call Interception Target" }).click();
    const output = page.getByTestId("interception-output");
    await expect(output).toContainText("Intercepted by route.fulfill()");
  });

  test("simulates network drop with page.route abort", async ({ page }) => {
    await page.route("**/api/lab/network/interception-target", async (route) => {
      await route.abort("failed");
    });

    await page.getByRole("button", { name: "Call Interception Target" }).click();
    const output = page.getByTestId("interception-output");
    await expect(output).toContainText("Failed to fetch");
  });

  test("resets scenario controls back to default state", async ({ page }) => {
    // Apply latency and 500 error
    await page.getByLabel("Slow (2500ms)").click();
    await page.getByLabel("Status code override").selectOption("500");
    await page.getByLabel("Simulate Empty Response").check();

    // Reset
    await page.getByRole("button", { name: "Reset All Controls" }).click();

    await expect(page.getByText("Latency: 0ms")).toBeVisible();
    await expect(page.getByText("Status: 200 OK")).toBeVisible();
    await expect(page.getByText("Data: Populated")).toBeVisible();
  });

  for (const theme of ["light", "dark"] as const) {
    test(`renders in the ${theme} theme`, async ({ page }) => {
      await page.addInitScript((val) => localStorage.setItem("pil-theme", val), theme);
      await page.goto("/lab/network");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Scenario Controls & Network");
    });
  }
});
