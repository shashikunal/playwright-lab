import { expect, test } from "@playwright/test";

test.describe("WebAssembly Sandbox and Low-Level Bytecode Lab", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/wasm");
    await expect(page.getByTestId("wasm-engine-status")).toContainText("Wasm Engine: Active");
  });

  test("compiles wasm module and verifies module architecture @smoke", async ({ page }) => {
    await expect(page.getByTestId("wasm-arch")).toHaveText("wasm32-unknown-unknown");
    await expect(page.getByTestId("wasm-bytecode-size")).toContainText("Bytes");
    await expect(page.getByTestId("wasm-memory-pages")).toHaveText("1 Page");
    await expect(page.getByTestId("wasm-memory-bytes")).toContainText("65,536 Bytes (64 KB)");
    await expect(page.getByTestId("wasm-hexdump")).toBeVisible();
  });

  test("executes recursive wasm calculation and verifies microsecond duration", async ({ page }) => {
    await page.getByTestId("wasm-n-input").fill("20");
    await page.getByTestId("wasm-run-btn").click();

    // Verify mathematical output: fib(20) = 6765
    const result = page.getByTestId("wasm-result");
    await expect(result).toBeVisible();
    await expect(result).toHaveText("6,765");

    // Verify execution timer is populated
    const runtime = page.getByTestId("wasm-runtime");
    await expect(runtime).toBeVisible();
    await expect(runtime).not.toHaveText("—");
  });

  test("supports preset terms and verifies mathematical correctness across inputs", async ({
    page,
  }) => {
    // Test n=10 -> fib(10) = 55
    await page.getByTestId("preset-10-btn").click();
    await expect(page.getByTestId("wasm-n-input")).toHaveValue("10");
    await page.getByTestId("wasm-run-btn").click();
    await expect(page.getByTestId("wasm-result")).toHaveText("55");

    // Test n=25 -> fib(25) = 75025
    await page.getByTestId("preset-25-btn").click();
    await expect(page.getByTestId("wasm-n-input")).toHaveValue("25");
    await page.getByTestId("wasm-run-btn").click();
    await expect(page.getByTestId("wasm-result")).toHaveText("75,025");
  });

  test("grows WebAssembly.Memory buffer from 1 page (64KB) to 2 pages (128KB)", async ({
    page,
  }) => {
    await expect(page.getByTestId("wasm-memory-pages")).toHaveText("1 Page");
    await expect(page.getByTestId("wasm-memory-bytes")).toContainText("65,536 Bytes (64 KB)");

    // Trigger memory growth
    await page.getByTestId("wasm-grow-memory-btn").click();

    // Verify dynamic page allocation
    await expect(page.getByTestId("wasm-memory-pages")).toHaveText("2 Pages");
    await expect(page.getByTestId("wasm-memory-bytes")).toContainText("131,072 Bytes (128 KB)");
  });

  test("executes comparative benchmark asserting identical results between JS and Wasm", async ({
    page,
  }) => {
    await page.getByTestId("wasm-n-input").fill("22");
    await page.getByTestId("run-benchmark-btn").click();

    await expect(page.getByTestId("benchmark-results-container")).toBeVisible();
    await expect(page.getByTestId("wasm-bench-time")).toBeVisible();
    await expect(page.getByTestId("js-bench-time")).toBeVisible();
    await expect(page.getByTestId("benchmark-speedup")).toBeVisible();

    // Verify equivalence assertion badge
    const matchBadge = page.getByTestId("benchmark-match-badge");
    await expect(matchBadge).toBeVisible();
    await expect(matchBadge).toContainText("Mathematical outputs match identically across engines (17711)");
  });

  test("catches WebAssembly.RuntimeError when triggering intentional unreachable trap", async ({
    page,
  }) => {
    await page.getByTestId("wasm-trap-btn").click();

    // Verify accessible error alert
    const alert = page.getByTestId("wasm-error-alert");
    await expect(alert).toBeVisible();
    await expect(alert).toHaveAttribute("role", "alert");
    await expect(alert).toContainText("unreachable");

    // Dismiss alert
    await page.getByTestId("clear-trap-btn").click();
    await expect(alert).not.toBeVisible();
  });

  test("evaluates wasm memory buffer directly through in-browser page evaluation", async ({
    page,
  }) => {
    // Read exposed WebAssembly memory buffer via page.evaluate
    const memoryBytes = await page.evaluate(() => {
      return window.__PIL_WASM__?.getMemoryBytes();
    });

    expect(Array.isArray(memoryBytes)).toBeTruthy();
    expect(memoryBytes?.length).toBe(16);
    // Verify first seeded bytes: 0, 17, 34 ...
    expect(memoryBytes?.[0]).toBe(0);
    expect(memoryBytes?.[1]).toBe(17);
  });

  for (const theme of ["light", "dark"] as const) {
    test(`renders wasm lab components with fidelity in ${theme} theme`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem("pil-theme", t), theme);
      await page.goto("/lab/wasm");

      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.getByTestId("wasm-lab")).toBeVisible();
      await expect(page.getByTestId("wasm-engine-status")).toBeVisible();
    });
  }
});
