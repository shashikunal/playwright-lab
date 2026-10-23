import { expect, test } from "@playwright/test";

test.describe("flaky lab, anti-patterns, and file operations", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ request }) => {
    await request.post("/api/lab/flaky/reset");
  });

  test("handles single file upload with setInputFiles @smoke", async ({ page }) => {
    await page.goto("/lab/flaky");

    // Dismiss floating overlay so all inputs are unobstructed
    await page.getByLabel("Dismiss Overlay").click();
    await expect(page.getByTestId("floating-interceptor")).not.toBeVisible();

    const fileInput = page.getByLabel("Upload Test Data");
    await expect(fileInput).toBeVisible();

    // Upload CSV file via buffer
    await fileInput.setInputFiles({
      name: "telemetry-export.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("metric,value,unit\ncpu_load,42,percent\nmemory_usage,68,percent\n"),
    });

    // File preview card appears
    await expect(page.getByText("telemetry-export.csv")).toBeVisible();

    // Submit upload
    await page.getByRole("button", { name: "Submit File Upload" }).click();

    // Success alert with upload reference appears
    const successBanner = page.getByTestId("upload-success");
    await expect(successBanner).toBeVisible();
    await expect(successBanner).toContainText("telemetry-export.csv");
  });

  test("handles file download event and validates content", async ({ page }) => {
    await page.goto("/lab/flaky");

    // Listen for download event
    const downloadPromise = page.waitForEvent("download");

    // Click download anchor
    await page.getByRole("link", { name: /Download Audit Log/i }).click();

    const download = await downloadPromise;

    // Validate suggested filename
    expect(download.suggestedFilename()).toBe("industrial-test-report.csv");

    // Read download stream and verify CSV headers and rows
    const stream = await download.createReadStream();
    expect(stream).not.toBeNull();

    const chunks: Buffer[] = [];
    for await (const chunk of stream!) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const content = Buffer.concat(chunks).toString("utf-8");

    expect(content).toContain("id,scenario,category,status,executionTimeMs");
    expect(content).toContain("Locator Gym,Locators,Passed");
    expect(content).toContain("Multi-Step Enrollment,Enterprise,Passed");
  });

  test("auto-waits for delayed button actionability without arbitrary sleeps", async ({ page }) => {
    await page.goto("/lab/flaky");

    // Button starts disabled for 1.2 seconds
    const delayedBtn = page.getByRole("button", { name: "Execute Delayed Action" });
    await expect(delayedBtn).toBeVisible();

    // Playwright actionability: click() will automatically wait until the element is enabled!
    await delayedBtn.click();

    // Verify actionability result
    const result = page.locator("#actionability-result");
    await expect(result).toBeVisible();
    await expect(result).toHaveText(/Action successfully executed after actionability wait/);
  });

  test("handles dynamic DOM element replacement without stale element errors", async ({ page }) => {
    await page.goto("/lab/flaky");

    const dynamicTarget = page.locator("#dynamic-target");
    await expect(dynamicTarget).toHaveText("DOM Node Generation #1");

    // Trigger replacement (unmounts and remounts with new key/reference)
    await page.getByRole("button", { name: "Trigger DOM Replacement" }).click();

    // Playwright re-evaluates selector automatically
    await expect(dynamicTarget).toHaveText("DOM Node Generation #2");
  });

  test("dismisses blocking overlay before interacting with controls", async ({ page }) => {
    await page.goto("/lab/flaky");

    const overlay = page.getByTestId("floating-interceptor");
    await expect(overlay).toBeVisible();

    // Dismiss overlay
    await page.getByLabel("Dismiss Overlay").click();
    await expect(overlay).not.toBeVisible();
  });

  test("intermittent failure simulation with retry recovery", async ({ page }) => {
    await page.goto("/lab/flaky");

    // Enable unstable mode
    await page.getByRole("button", { name: /Mode: Inactive/i }).click();
    await expect(page.getByRole("button", { name: /Mode: Active/i })).toBeVisible();

    // First attempt fails with 503
    await page.getByRole("button", { name: "Fetch Unstable Resource" }).click();
    await expect(page.getByRole("alert")).toContainText("503");

    // Second attempt (retry) succeeds with stable payload
    await page.getByRole("button", { name: "Fetch Unstable Resource" }).click();
    await expect(page.getByRole("status")).toContainText("Stable payload delivered successfully");
  });

  test("handles bounded retries simulation recovery", async ({ page }) => {
    await page.goto("/lab/flaky");

    const retryBtn = page.getByRole("button", { name: "Execute Bounded Retry API" });

    // Attempt 1 -> 503
    await retryBtn.click();
    await expect(page.getByRole("alert")).toContainText("503");

    // Attempt 2 -> 503
    await retryBtn.click();
    await expect(page.getByRole("alert")).toContainText("503");

    // Attempt 3 -> Success!
    await retryBtn.click();
    await expect(page.getByRole("status")).toContainText(
      "Resource successfully resolved after bounded retries",
    );
  });

  test("resolves strict mode duplicate locator conflicts via scoping", async ({ page }) => {
    await page.goto("/lab/flaky");

    // Attempting page.getByRole("button", { name: "Confirm Action" }) would violate strict mode
    // Scoped locator cleanly isolates the target element:
    const primaryBtn = page
      .locator("#primary-action-container")
      .getByRole("button", { name: "Confirm Action" });
    await primaryBtn.click();
    await expect(page.getByText("Primary scope action confirmed")).toBeVisible();

    const secondaryBtn = page
      .locator("#secondary-action-container")
      .getByRole("button", { name: "Confirm Action" });
    await secondaryBtn.click();
    await expect(page.getByText("Secondary scope action confirmed")).toBeVisible();
  });

  test("handles unexpected promo overlay with page.addLocatorHandler", async ({ page }) => {
    await page.goto("/lab/flaky");

    // Register locator handler to automatically dismiss unexpected promo dialog
    const promoDialog = page.getByRole("dialog", { name: "Special Enterprise Offer" });
    await page.addLocatorHandler(promoDialog, async (overlay) => {
      await overlay.getByRole("button", { name: "Dismiss Offer" }).click();
    });

    // Trigger unexpected dialog which would normally block subsequent clicks
    await page.getByRole("button", { name: "Simulate Unexpected Promo Dialog" }).click();

    // Trigger any subsequent interaction; Playwright's locator handler automatically intercepts and clears it!
    const delayedBtn = page.getByRole("button", { name: "Execute Delayed Action" });
    await delayedBtn.click();
    await expect(promoDialog).not.toBeVisible();
  });

  test("demonstrates condition-based waiting over arbitrary sleeps @smoke", async ({ page }) => {
    await page.goto("/lab/flaky");

    await page.getByRole("button", { name: "Fetch Delayed Token" }).click();

    // Web-first assertion auto-waits for randomized async completion without manual sleep
    const tokenCard = page.getByTestId("auth-token-card");
    await expect(tokenCard).toBeVisible({ timeout: 10000 });
    await expect(tokenCard).toContainText("Token: tok_auth_");
  });

  test("captures console.error and pageerror diagnostic events", async ({ page }) => {
    const consoleMessages: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleMessages.push(msg.text());
      }
    });

    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
    });

    await page.goto("/lab/flaky");

    // Dispatch console error
    await page.getByRole("button", { name: "Dispatch Console Error" }).click();
    await expect(
      page.getByText("Dispatched console.error event for Playwright listener"),
    ).toBeVisible();
    expect(consoleMessages.some((m) => m.includes("simulated console error event"))).toBe(true);

    // Dispatch window pageerror
    await page.getByRole("button", { name: "Dispatch Window PageError" }).click();
    await expect(
      page.getByText("Dispatched window.onerror event for Playwright listener"),
    ).toBeVisible();
    await expect
      .poll(() => pageErrors.some((m) => m.includes("simulated pageerror")), { timeout: 3000 })
      .toBe(true);
  });

  for (const theme of ["light", "dark"] as const) {
    test(`renders flaky lab in ${theme} theme`, async ({ page }) => {
      await page.addInitScript((val) => localStorage.setItem("pil-theme", val), theme);
      await page.goto("/lab/flaky");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Flaky Lab & Anti-Pattern Workbench",
      );
    });
  }
});
