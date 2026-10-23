import { expect, test } from "@playwright/test";

/**
 * Day 5 Practice Suite: Scenario Controls, Network Interception & Route Mocking
 * Lab Target: /lab/network
 */
test.describe("Day 5: Scenario Controls & Network Interception Mastery", () => {
  test.beforeEach(async ({ page, request }, testInfo) => {
    const ns = testInfo.project.name;
    await page.setExtraHTTPHeaders({ "x-worker-namespace": ns });
    // Reset server scenario controls before test
    await request.post("/api/lab/network/reset", {
      headers: { "x-worker-namespace": ns },
    });
    await page.goto("/lab/network");
  });

  test("Exercise 1: Client-side network mocking with page.route()", async ({ page }) => {
    // 1. Intercept telemetry items request and return custom mock data
    await page.route("**/api/lab/network/items*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: "mock-007",
              title: "Autonomous Fleet Orchestration",
              status: "Healthy",
              latency: 12,
            },
          ],
        }),
      });
    });

    // 2. Click button to fetch
    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

    // 3. Verify mock data rendered in the DOM
    const list = page.getByTestId("telemetry-list");
    await expect(list).toBeVisible();
    await expect(list.getByText("Autonomous Fleet Orchestration")).toBeVisible();
  });

  test("Exercise 2: Injecting HTTP 500 Outage via route.fulfill()", async ({ page }) => {
    // Intercept and simulate a 500 Internal Server Error
    await page.route("**/api/lab/network/items*", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            message: "Simulated Upstream Gateway Crash",
            code: "upstream_failure",
          },
        }),
      });
    });

    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

    // Assert structured error banner appears
    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("500");
  });

  test("Exercise 3: Simulating client offline / network abort with route.abort()", async ({ page }) => {
    // Intercept and immediately abort the request (simulating connection dropped/offline)
    await page.route("**/api/lab/network/items*", async (route) => {
      await route.abort("failed");
    });

    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

    // Verify application reports connection failure gracefully without unhandled exceptions
    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
  });

  test("Exercise 4: Auto-waiting on artificial latency without hardcoded sleeps", async ({ page }) => {
    // Intercept and delay response by 1200ms
    await page.route("**/api/lab/network/items*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            { id: "lat-1", title: "Delayed Query Result", status: "Active", latency: 1200 },
          ],
        }),
      });
    });

    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

    // 1. Loading state must be visible initially
    const loading = page.getByText("Waiting for Express backend response...");
    await expect(loading).toBeVisible();

    // 2. Playwright web-first assertions auto-wait for loading state to detach and list to appear
    const list = page.getByTestId("telemetry-list");
    await expect(list).toBeVisible();
    await expect(loading).not.toBeVisible();
    await expect(list.getByText("Delayed Query Result")).toBeVisible();
  });

  test("Exercise 5: Restoring live backend calls via page.unroute()", async ({ page }) => {
    // Handler that mocks response
    const mockHandler = async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [{ id: "temp-mock", title: "Temporary Mock Data", status: "Active", latency: 5 }],
        }),
      });
    };

    // Attach mock
    await page.route("**/api/lab/network/items*", mockHandler);
    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();
    await expect(page.getByTestId("telemetry-list").getByText("Temporary Mock Data").first()).toBeVisible();

    // Unroute to remove interception
    await page.unroute("**/api/lab/network/items*", mockHandler);

    // Fetch again -> now calls real live Express backend!
    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();
    await expect(page.getByTestId("telemetry-list").getByText("Cluster Snapshot Ingestion").first()).toBeVisible();
  });
});
