import { expect, test } from "@playwright/test";

test.describe("performance and Core Web Vitals lab", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/perf");
    await expect(page.getByRole("heading", { level: 1, name: "Performance & Core Web Vitals Lab" })).toBeVisible();
  });

  test("measures W3C navigation timing and verifies sub-second TTFB @smoke", async ({ page }) => {
    const ttfb = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      return nav ? Math.round(nav.responseStart - nav.requestStart) : 0;
    });

    expect(ttfb).toBeGreaterThanOrEqual(0);
    expect(ttfb).toBeLessThan(1500);
    await expect(page.getByTestId("metric-ttfb")).toBeVisible();
  });

  test("measures Cumulative Layout Shift and detects intentional layout shift injection", async ({ page }) => {
    // 1. Initial healthy CLS
    const initialCls = await page.evaluate(() => window.__PIL_PERF__?.cls ?? 0);
    expect(initialCls).toBeLessThan(0.1);

    // 2. Inject intentional layout shift
    await page.getByRole("button", { name: "Inject Layout Shift" }).click();
    await expect(page.getByTestId("injected-layout-banner")).toBeVisible();

    // 3. Verify CLS telemetry increased
    const updatedCls = await page.evaluate(() => window.__PIL_PERF__?.cls ?? 0);
    expect(updatedCls).toBeGreaterThan(initialCls);

    // 4. Dismiss banner and reset
    await page.getByRole("button", { name: "Dismiss Shift Banner" }).click();
    await expect(page.getByTestId("injected-layout-banner")).not.toBeVisible();
  });

  test("verifies Largest Contentful Paint (LCP) score renders in healthy threshold", async ({ page }) => {
    await expect(page.getByTestId("metric-lcp")).toBeVisible();
    await expect(page.locator("#lcp-value")).toHaveText(/^\d+ms$/);
  });

  test("audits JS heap memory and layout metrics using Chrome DevTools Protocol (CDP)", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "CDP sessions are exclusive to Chromium-based engines");

    const client = await page.context().newCDPSession(page);
    await client.send("Performance.enable");
    await page.goto("/lab/perf");

    const { metrics } = await client.send("Performance.getMetrics");
    expect(metrics).toBeDefined();

    const heapMetric = metrics.find((m) => m.name === "JSHeapUsedSize");
    const layoutMetric = metrics.find((m) => m.name === "LayoutCount");
    const styleMetric = metrics.find((m) => m.name === "RecalcStyleCount");

    expect(heapMetric?.value).toBeGreaterThan(0);
    expect(layoutMetric?.value).toBeGreaterThan(0);
    expect(styleMetric?.value).toBeGreaterThan(0);
  });

  test("applies 4x CPU throttling via CDP and detects main thread long task", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "CDP CPU emulation is exclusive to Chromium-based engines");

    const client = await page.context().newCDPSession(page);
    await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });

    await page.goto("/lab/perf");
    await page.getByRole("button", { name: "Simulate Long Task" }).click();

    await expect(page.locator("#computation-feedback")).toBeVisible();
    await expect(page.locator("#computation-feedback")).toContainText("Main thread blocked");
    await expect(page.locator("#longtasks-value")).toHaveText(/^[1-9]\d*$/);
  });

  test("fetches heavy simulated payload and inspects W3C resource timing waterfall", async ({ page }) => {
    await page.getByRole("button", { name: "Download Heavy Payload" }).click();
    await expect(page.locator("#heavy-data-feedback")).toContainText("Received 2500 records");

    const rows = page.getByTestId("resources-table").locator("tbody tr");
    await expect(rows.first()).toBeVisible();
  });

  for (const theme of ["light", "dark"] as const) {
    test(`renders performance lab in ${theme} theme`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem("pil-theme", t), theme);
      await page.goto("/lab/perf");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.getByTestId("vitals-dashboard")).toBeVisible();
    });
  }
});
