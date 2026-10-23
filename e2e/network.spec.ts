import { expect, test } from "@playwright/test";

test.describe("scenario controls and network lab", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page, request }, testInfo) => {
    const ns = testInfo.project.name;
    await page.setExtraHTTPHeaders({ "x-worker-namespace": ns });
    // Reset controls to clean state before each test
    await request.post("/api/lab/network/reset", {
      headers: { "x-worker-namespace": ns },
    });
    await page.goto("/lab/network");
  });

  test.afterEach(async ({ request }, testInfo) => {
    const ns = testInfo.project.name;
    await request.post("/api/lab/network/reset", {
      headers: { "x-worker-namespace": ns },
    });
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

  test("handles HTTP 409 Conflict and 422 Unprocessable Entity status overrides", async ({
    page,
  }) => {
    // 409 Conflict
    await page.getByLabel("Status code override").selectOption("409");
    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();
    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("Status: 409");
    await expect(alert).toContainText("Conflict");

    // 422 Unprocessable Entity
    await page.getByLabel("Status code override").selectOption("422");
    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();
    await expect(alert).toContainText("Status: 422");
    await expect(alert).toContainText("Unprocessable Entity");
  });

  test("simulates network timeout and displays gateway timeout error", async ({ page }) => {
    await page.getByLabel("Simulate Network Timeout (504 Abort)").check();
    await expect(page.getByText("Fault: Timeout / 504 Active")).toBeVisible();

    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("Status: 504");
    await expect(alert).toContainText("Simulated network timeout");
  });

  test("paginates through infinite-scroll stream chunks", async ({ page }) => {
    await page.getByRole("button", { name: "Initialize Stream" }).click();

    const streamContainer = page.getByTestId("stream-container");
    await expect(streamContainer).toBeVisible();
    const initialRecords = streamContainer.getByTestId("stream-record");
    await expect(initialRecords).toHaveCount(5);

    // Load next chunk
    await page.getByRole("button", { name: "Load Next Telemetry Chunk" }).click();
    await expect(initialRecords).toHaveCount(10);
  });

  test("demonstrates out-of-order race query resolution", async ({ page }) => {
    await page.getByRole("button", { name: "Dispatch Slow Query (800ms)" }).click();
    await page.getByRole("button", { name: "Dispatch Fast Query (50ms)" }).click();

    const winnerBanner = page.getByTestId("race-winner-banner");
    await expect(winnerBanner).toBeVisible();
    await expect(winnerBanner).toContainText("Winner:");
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
    await expect(output).toHaveText(/Failed to fetch|NetworkError|Load failed/);
  });

  test("resets scenario controls back to default state", async ({ page }) => {
    // Apply latency, 500 error, and empty collection
    await page.getByLabel("Slow (2500ms)").click();
    await expect(page.getByText("Latency: 2500ms")).toBeVisible();

    await page.getByLabel("Status code override").selectOption("500");
    await expect(page.getByText("Status: HTTP 500")).toBeVisible();

    await page.locator("#simulate-empty-checkbox").check();
    await expect(page.locator("#simulate-empty-checkbox")).toBeChecked();

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
