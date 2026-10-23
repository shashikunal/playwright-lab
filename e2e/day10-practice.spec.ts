import { expect, test } from "@playwright/test";

/**
 * Day 10 Practice Suite (The Grand Finale): WebAssembly Sandbox & CDP Performance Profiling
 * Lab Targets: /lab/wasm, /lab/perf
 */
test.describe("Day 10: Low-Level Wasm Execution & Chrome DevTools Protocol Profiling", () => {
  test("Exercise 1: WebAssembly bytecode compilation and microsecond execution", async ({ page }) => {
    await page.goto("/lab/wasm");
    await expect(page.getByTestId("wasm-engine-status")).toContainText("Wasm Engine: Active");

    // 1. Verify low-level WebAssembly architecture
    await expect(page.getByTestId("wasm-arch")).toHaveText("wasm32-unknown-unknown");
    await expect(page.getByTestId("wasm-memory-pages")).toHaveText("1 Page");
    await expect(page.getByTestId("wasm-memory-bytes")).toContainText("65,536 Bytes (64 KB)");

    // 2. Execute recursive Fibonacci calculation inside Wasm VM
    await page.getByTestId("wasm-n-input").fill("20");
    await page.getByTestId("wasm-run-btn").click();

    // 3. Verify mathematical correctness: fib(20) = 6765
    await expect(page.getByTestId("wasm-result")).toHaveText("6,765");

    // 4. Verify runtime execution benchmark exists
    await expect(page.getByTestId("wasm-runtime")).not.toHaveText("—");
  });

  test("Exercise 2: Dynamic WebAssembly.Memory buffer growth allocation", async ({ page }) => {
    await page.goto("/lab/wasm");

    // Initial state: 1 page = 64KB
    await expect(page.getByTestId("wasm-memory-pages")).toHaveText("1 Page");
    await expect(page.getByTestId("wasm-memory-bytes")).toContainText("65,536 Bytes (64 KB)");

    // Grow Wasm linear memory buffer by 1 page (64KB)
    await page.getByTestId("wasm-grow-memory-btn").click();

    // Verify dynamic page allocation updated to 2 pages (128KB)
    await expect(page.getByTestId("wasm-memory-pages")).toHaveText("2 Pages");
    await expect(page.getByTestId("wasm-memory-bytes")).toContainText("131,072 Bytes (128 KB)");
  });

  test("Exercise 3: Chrome DevTools Protocol (CDP) heap memory and performance profiling", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "CDP protocol inspection is exclusive to Chromium-based engines");

    // 1. Attach native Chrome DevTools Protocol session
    const cdpClient = await page.context().newCDPSession(page);
    await cdpClient.send("Performance.enable");

    await page.goto("/lab/perf");

    // 2. Extract low-level runtime engine metrics via CDP
    const { metrics } = await cdpClient.send("Performance.getMetrics");
    expect(metrics).toBeDefined();

    const heapMetric = metrics.find((m) => m.name === "JSHeapUsedSize");
    const layoutMetric = metrics.find((m) => m.name === "LayoutCount");
    const styleMetric = metrics.find((m) => m.name === "RecalcStyleCount");

    // Assert heap and layout metrics exist and are healthy
    expect(heapMetric?.value).toBeGreaterThan(0);
    expect(layoutMetric?.value).toBeGreaterThan(0);
    expect(styleMetric?.value).toBeGreaterThan(0);
  });

  test("Exercise 4: Core Web Vitals telemetry & Cumulative Layout Shift (CLS) injection", async ({ page }) => {
    await page.goto("/lab/perf");

    // 1. Measure W3C Time to First Byte (TTFB)
    const ttfb = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      return nav ? Math.round(nav.responseStart - nav.requestStart) : 0;
    });
    expect(ttfb).toBeGreaterThanOrEqual(0);
    expect(ttfb).toBeLessThan(1500);

    // 2. Measure baseline healthy Cumulative Layout Shift (CLS < 0.1)
    const initialCls = await page.evaluate(() => window.__PIL_PERF__?.cls ?? 0);
    expect(initialCls).toBeLessThan(0.1);

    // 3. Inject an uncoordinated DOM shift and assert CLS increase
    await page.getByRole("button", { name: "Inject Layout Shift" }).click();
    await expect(page.getByTestId("injected-layout-banner")).toBeVisible();

    const shiftedCls = await page.evaluate(() => window.__PIL_PERF__?.cls ?? 0);
    expect(shiftedCls).toBeGreaterThan(initialCls);

    // 4. Dismiss banner and assert clean restoration
    await page.getByRole("button", { name: "Dismiss Shift Banner" }).click();
    await expect(page.getByTestId("injected-layout-banner")).not.toBeVisible();
  });
});
