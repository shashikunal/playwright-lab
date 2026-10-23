import { expect, test } from "@playwright/test";

test.describe("Playwright Network Interception and API Mocking — Hands-On Practice", () => {
  test.beforeEach(async ({ page, request }, testInfo) => {
    const ns = testInfo.project.name;
    await page.setExtraHTTPHeaders({ "x-worker-namespace": ns });
    // Reset server scenario controls before test
    await request.post("/api/lab/network/reset", {
      headers: { "x-worker-namespace": ns },
    });
    await page.goto("/lab/network");
  });

  test("Exercise 1: Inspect a request and response", async ({ page }) => {
    let interceptedMethod = "";
    let interceptedUrl = "";
    let interceptedHeader = "";

    await page.route("**/api/lab/network/items*", async (route) => {
      const req = route.request();
      interceptedMethod = req.method();
      interceptedUrl = req.url();
      interceptedHeader = req.headers()["accept"] || "";
      await route.continue();
    });

    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

    await expect(page.getByTestId("telemetry-list")).toBeVisible();
    expect(interceptedMethod).toBe("GET");
    expect(interceptedUrl).toContain("/api/lab/network/items");
    expect(interceptedHeader).toBeTruthy();
  });

  test("Exercise 2: Mock a successful JSON response", async ({ page }) => {
    await page.route("**/api/lab/network/items*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: {
          "x-mock-source": "playwright-test-runner",
        },
        body: JSON.stringify({
          items: [
            {
              id: "MOCK-001",
              title: "Quantum Cryptography Audit",
              category: "security",
              latencyMs: 10,
              timestamp: new Date().toISOString(),
            },
          ],
          total: 1,
          latencyApplied: 10,
        }),
      });
    });

    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

    const list = page.getByTestId("telemetry-list");
    await expect(list).toBeVisible();
    await expect(list.getByText("Quantum Cryptography Audit")).toBeVisible();
    await expect(list.getByText("MOCK-001")).toBeVisible();
  });

  test("Exercise 3: Simulate an empty collection", async ({ page }) => {
    await page.route("**/api/lab/network/items*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [],
          total: 0,
          latencyApplied: 0,
        }),
      });
    });

    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

    // Assert empty state feedback
    await expect(page.getByTestId("empty-state")).toBeVisible();
    await expect(page.getByText("No items matching query (Empty Response).")).toBeVisible();
    await expect(page.getByTestId("telemetry-list")).not.toBeVisible();
  });

  test("Exercise 4: Return a 500 response and verify the error UI", async ({ page }) => {
    await page.route("**/api/lab/network/items*", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "upstream_database_down",
            message: "Simulated Primary Database Connection Loss",
          },
        }),
      });
    });

    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

    // Assert error alert displays HTTP 500 code and message
    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("500");
  });

  test("Exercise 5: Simulate a delayed API response and assert the loading state", async ({ page }) => {
    await page.route("**/api/lab/network/items*", async (route) => {
      // Artificially delay response by 600ms
      await new Promise((res) => setTimeout(res, 600));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: "LAT-01",
              title: "Delayed Synthetic Item",
              category: "telemetry",
              latencyMs: 600,
              timestamp: new Date().toISOString(),
            },
          ],
          total: 1,
          latencyApplied: 600,
        }),
      });
    });

    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

    // 1. Loading indicator is visible
    const loading = page.getByText("Waiting for Express backend response...");
    await expect(loading).toBeVisible();

    // 2. Loading state detaches and list appears
    const list = page.getByTestId("telemetry-list");
    await expect(list).toBeVisible();
    await expect(loading).not.toBeVisible();
    await expect(list.getByText("Delayed Synthetic Item")).toBeVisible();
  });

  test("Exercise 6: Abort a request and verify recovery behavior", async ({ page }) => {
    await page.route("**/api/lab/network/items*", async (route) => {
      await route.abort("failed");
    });

    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

    // UI handles aborted network call without crashing
    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
  });

  test("Exercise 7: Modify a request header", async ({ page }) => {
    let headerSent = "";

    await page.route("**/api/lab/network/items*", async (route) => {
      const headers = {
        ...route.request().headers(),
        "x-custom-tenant": "enterprise-alpha-99",
      };
      headerSent = headers["x-custom-tenant"];
      await route.continue({ headers });
    });

    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

    await expect(page.getByTestId("telemetry-list")).toBeVisible();
    expect(headerSent).toBe("enterprise-alpha-99");
  });

  test("Exercise 8: Use route.fetch() to preserve real backend behavior while modifying a response", async ({ page }) => {
    await page.route("**/api/lab/network/items*", async (route) => {
      // 1. Fetch live response from Express backend
      const response = await route.fetch();
      const json = await response.json();

      // 2. Augment real data by injecting an extra item
      json.items.unshift({
        id: "AUG-001",
        title: "Augmented Real Backend Item",
        category: "live-mod",
        latencyMs: 5,
        timestamp: new Date().toISOString(),
      });
      json.total = json.items.length;

      // 3. Fulfill with modified payload while keeping real status and original headers
      await route.fulfill({
        response,
        json,
      });
    });

    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

    const list = page.getByTestId("telemetry-list");
    await expect(list).toBeVisible();
    // Injected item is visible
    await expect(list.getByText("Augmented Real Backend Item")).toBeVisible();
    // Real item from backend is also visible!
    await expect(list.getByText("Cluster Snapshot Ingestion")).toBeVisible();
  });

  test("Exercise 9: Reproduce an autocomplete race condition", async ({ page }) => {
    // Navigate to Race Condition panel in /lab/network
    const fastBtn = page.getByRole("button", { name: "Dispatch Fast Query (50ms)" });
    const slowBtn = page.getByRole("button", { name: "Dispatch Slow Query (800ms)" });

    await expect(fastBtn).toBeVisible();
    await expect(slowBtn).toBeVisible();

    // Intercept /api/lab/network/race to control arrival timing deterministically
    await page.route("**/api/lab/network/race*", async (route) => {
      const url = new URL(route.request().url());
      const speed = url.searchParams.get("speed");

      if (speed === "slow") {
        await new Promise((r) => setTimeout(r, 400));
      } else {
        await new Promise((r) => setTimeout(r, 50));
      }
      await route.continue();
    });

    // 1. Dispatch slow query first, followed immediately by fast query
    await slowBtn.click();
    await fastBtn.click();

    // 2. The cancellation logic in NetworkLab should abort the slow query and fast query wins
    const resultBox = page.getByText(/Winner:/);
    await expect(resultBox).toBeVisible();
    await expect(resultBox).toContainText("FAST");
  });

  test("Exercise 10: Test optimistic-update rollback", async ({ page }) => {
    // Intercept POST /api/lab/network/items and simulate server 500 error
    await page.route("**/api/lab/network/items", async (route) => {
      if (route.request().method() === "POST") {
        await new Promise((r) => setTimeout(r, 100));
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Failed to persist item" }),
        });
      } else {
        await route.continue();
      }
    });

    const input = page.getByPlaceholder("e.g. Distributed Trace Collector");
    const addBtn = page.getByRole("button", { name: "Add Item Optimistically" });

    await input.fill("Optimistic Rollback Candidate");
    await addBtn.click();

    // 1. Item appears immediately with pending badge
    await expect(page.getByText("Optimistic Rollback Candidate")).toBeVisible();
    await expect(page.getByText("Pending Server...")).toBeVisible();

    // 2. After server rejects with 500, rollback removes item and displays error
    await expect(page.getByText("Optimistic Rollback Candidate")).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Rollback executed: mutation failed/)).toBeVisible();
  });

  test("Exercise 11: Diagnose overlapping route handlers", async ({ page }) => {
    const executionOrder: string[] = [];

    // First registered handler (runs second in Playwright LIFO routing)
    await page.route("**/api/lab/network/items*", async (route) => {
      if (route.request().url().includes("?q=")) {
        await route.continue();
        return;
      }
      executionOrder.push("first-handler");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [{ id: "H1", title: "Handler 1 Response", category: "routing", latencyMs: 1, timestamp: new Date().toISOString() }],
          total: 1,
          latencyApplied: 1,
        }),
      });
    });

    // Second registered handler (runs FIRST due to LIFO ordering!)
    await page.route("**/api/lab/network/items*", async (route) => {
      if (route.request().url().includes("?q=")) {
        await route.continue();
        return;
      }
      executionOrder.push("second-handler");
      // Fallback passes control to previous handlers
      await route.fallback();
    });

    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

    await expect(page.getByText("Handler 1 Response")).toBeVisible();
    expect(executionOrder).toEqual(["second-handler", "first-handler"]);
  });

  test("Exercise 12: Complete a senior-level network-debugging challenge", async ({ page }) => {
    // Complex challenge:
    // 1. Intercept items call with custom dynamic mock
    // 2. Assert mock data rendered in UI
    // 3. Dynamically unroute the handler
    // 4. Trigger re-fetch and assert that live backend data is restored
    const mockTelemetry = async (route: Parameters<Parameters<typeof page.route>[1]>[0]) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: "SENIOR-01",
              title: "Senior Orchestration Telemetry",
              category: "architecture",
              latencyMs: 5,
              timestamp: new Date().toISOString(),
            },
          ],
          total: 1,
          latencyApplied: 5,
        }),
      });
    };

    // Attach route
    await page.route("**/api/lab/network/items*", mockTelemetry);
    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

    // Verify mock data
    await expect(page.getByTestId("telemetry-list").getByText("Senior Orchestration Telemetry")).toBeVisible();

    // Unroute to restore live backend
    await page.unroute("**/api/lab/network/items*", mockTelemetry);

    // Re-fetch
    await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

    // Confirm live backend data
    await expect(page.getByTestId("telemetry-list").getByText("Cluster Snapshot Ingestion")).toBeVisible();
  });
});
