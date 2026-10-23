import { expect, test } from "@playwright/test";

/**
 * Day 6 Practice Suite: Flaky Test Debugging, File Operations & Actionability Engine
 * Lab Target: /lab/flaky
 */
test.describe("Day 6: Actionability Engine & File Operations Mastery", () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post("/api/lab/flaky/reset");
    await page.goto("/lab/flaky");
  });

  test("Exercise 1: Safe floating banner dismissal via page.addLocatorHandler()", async ({ page }) => {
    // 1. In production, marketing banners or promotional overlays pop up intermittently.
    // page.addLocatorHandler() automatically detects and dismisses them whenever an action is blocked!
    const overlay = page.getByTestId("floating-interceptor");
    const dismissBtn = page.getByLabel("Dismiss Overlay");

    await page.addLocatorHandler(overlay, async () => {
      await dismissBtn.click();
    });

    // 2. Perform regular actions on the page without manual overlay checks
    const targetActionBtn = page.getByRole("button", { name: "Trigger DOM Replacement" });
    await targetActionBtn.click();

    // Verify overlay was dismissed and action executed cleanly
    await expect(overlay).toBeHidden();
    await expect(page.locator("#dynamic-target")).toHaveText("DOM Node Generation #2");
  });

  test("Exercise 2: Native in-memory file upload using setInputFiles()", async ({ page }) => {
    // Dismiss overlay first
    const overlay = page.getByTestId("floating-interceptor");
    if (await overlay.isVisible()) {
      await page.getByLabel("Dismiss Overlay").click();
    }

    const fileInput = page.getByLabel("Upload Test Data");

    // Upload CSV using an in-memory buffer (no physical fixture files needed on disk)
    await fileInput.setInputFiles({
      name: "load-test-telemetry.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("timestamp,active_connections,error_rate\n1700000000,1420,0.01\n"),
    });

    // Verify preview card rendered filename
    await expect(page.getByText("load-test-telemetry.csv")).toBeVisible();

    // Submit upload to Express backend
    await page.getByRole("button", { name: "Submit File Upload" }).click();

    // Assert backend confirmation banner
    const successBanner = page.getByTestId("upload-success");
    await expect(successBanner).toBeVisible();
    await expect(successBanner).toContainText("load-test-telemetry.csv");
  });

  test("Exercise 3: Asynchronous file download stream interception", async ({ page }) => {
    // Set up download event listener promise
    const downloadPromise = page.waitForEvent("download");

    // Trigger download anchor
    await page.getByRole("link", { name: /Download Audit Log/i }).click();

    const download = await downloadPromise;

    // 1. Verify suggested filename
    expect(download.suggestedFilename()).toBe("industrial-test-report.csv");

    // 2. Stream content directly into memory without cluttering local downloads directory
    const stream = await download.createReadStream();
    expect(stream).not.toBeNull();

    const chunks: Buffer[] = [];
    for await (const chunk of stream!) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const csvContent = Buffer.concat(chunks).toString("utf-8");

    // 3. Assert CSV headers and row data
    expect(csvContent).toContain("id,scenario,category,status,executionTimeMs");
    expect(csvContent).toContain("Locator Gym,Locators,Passed");
  });

  test("Exercise 4: Playwright actionability engine vs. anti-pattern arbitrary sleep", async ({ page }) => {
    // The button starts in a disabled state for 1200ms
    const delayedBtn = page.getByRole("button", { name: "Execute Delayed Action" });
    await expect(delayedBtn).toBeVisible();

    // SENIOR SDET PRINCIPLE:
    // Do NOT write: await page.waitForTimeout(1500);
    // Playwright's locator.click() automatically checks:
    // Attached -> Visible -> Stable -> Enabled -> Unobstructed.
    // It will wait up to the configured timeout for the button to become enabled!
    await delayedBtn.click();

    // Assert completion
    await expect(page.locator("#actionability-result")).toHaveText(
      /Action successfully executed after actionability wait/,
    );
  });
});
