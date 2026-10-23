import { expect, test } from "@playwright/test";

test.describe("Playwright Browser Actions and Interactions — Hands-On Practice", () => {
  test("Exercise 1: Click a button and assert the resulting state", async ({ page }) => {
    await page.goto("/lab/locators");

    const checkBtn = page.getByRole("button", { name: "Run check" });
    await expect(checkBtn).toBeVisible();

    await checkBtn.click();
    await expect(page.getByText("Check finished")).toBeVisible();
  });

  test("Exercise 2: Fill a form and validate the submitted values", async ({ page }) => {
    await page.goto("/lab/forms");

    await page.getByLabel("Full name").fill("Ada Lovelace");
    await page.getByLabel("Email").fill("ada@lab.test");
    await page.getByLabel("Seats").fill("3");
    await page.getByLabel("Start date").fill("2026-11-02");
    await page.getByLabel("Track").selectOption("api");
    await page.getByRole("checkbox", { name: "I agree to the lab terms" }).check();

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes("/api/lab/forms/intake") && res.ok()
    );
    await page.getByRole("button", { name: "Submit intake" }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    const body = await response.json();
    await expect(
      page.getByRole("status").filter({ hasText: `Accepted as ${body.id}` })
    ).toBeVisible();
  });

  test("Exercise 3: Use keyboard navigation to complete a form", async ({ page }) => {
    await page.goto("/practice/login");

    const usernameInput = page.getByLabel("Practice Username");
    await usernameInput.focus();

    // Type via keyboard
    await page.keyboard.type("student");

    // Tab to password field
    await page.keyboard.press("Tab");
    await page.keyboard.type("Password123!");

    // Press Enter to submit form
    await page.keyboard.press("Enter");

    // Assert successful navigation
    await expect(page).toHaveURL(/.*\/practice\/dashboard/);
    await expect(page.getByRole("heading", { name: "Welcome, student!" })).toBeVisible();
  });

  test("Exercise 4: Select a dropdown option", async ({ page }) => {
    await page.goto("/lab/forms");

    const trackSelect = page.getByLabel("Track");
    await expect(trackSelect).toBeVisible();

    // Select by value
    await trackSelect.selectOption("api");
    await expect(trackSelect).toHaveValue("api");

    // Select by label
    await trackSelect.selectOption({ label: "Fixtures" });
    await expect(trackSelect).toHaveValue("fixtures");
  });

  test("Exercise 5: Check and uncheck controls", async ({ page }) => {
    await page.goto("/lab/forms");

    const checkbox = page.getByRole("checkbox", { name: "I agree to the lab terms" });
    await expect(checkbox).not.toBeChecked();

    // Check control
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    // Uncheck control
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();

    // setChecked utility
    await checkbox.setChecked(true);
    await expect(checkbox).toBeChecked();
  });

  test("Exercise 6: Handle a confirmation dialog", async ({ page }) => {
    await page.goto("/lab/widgets");

    // Register dialog listener BEFORE triggering the action
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("confirm");
      expect(dialog.message()).toContain("purge telemetry records");
      await dialog.accept();
    });

    await page.getByRole("button", { name: "Trigger Confirm" }).click();
    await expect(page.getByTestId("dialog-status")).toHaveText("Confirm accepted");
  });

  test("Exercise 7: Open and validate a popup window", async ({ page }) => {
    await page.goto("/lab/browser");

    // Listen for popup event before clicking
    const popupPromise = page.waitForEvent("popup");
    await page.getByTestId("open-popup-btn").click();
    const popup = await popupPromise;

    // Verify popup page content
    await expect(popup).toHaveURL(/.*\/lab\/browser\/popup-content/);
    await expect(popup.getByTestId("popup-title")).toHaveText("Popup Inspection Target");

    // Close popup
    await popup.close();
    expect(popup.isClosed()).toBe(true);
  });

  test("Exercise 8: Upload a valid and invalid file", async ({ page }) => {
    await page.goto("/lab/flaky");

    // Dismiss overlay
    await page.getByLabel("Dismiss Overlay").click();
    await expect(page.getByTestId("floating-interceptor")).not.toBeVisible();

    const fileInput = page.getByLabel("Upload Test Data");

    // Upload valid CSV buffer
    await fileInput.setInputFiles({
      name: "automation-metrics.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("metric,score\ncoverage,98\nspeed,450ms\n"),
    });

    await expect(page.getByText("automation-metrics.csv")).toBeVisible();
    await page.getByRole("button", { name: "Submit File Upload" }).click();
    await expect(page.getByTestId("upload-success")).toBeVisible();
    await expect(page.getByTestId("upload-success")).toContainText("automation-metrics.csv");
  });

  test("Exercise 9: Trigger and verify a file download", async ({ page }) => {
    await page.goto("/lab/flaky");

    // Set up download event listener before clicking
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: /Download Audit Log/i }).click();
    const download = await downloadPromise;

    // Validate suggested filename
    expect(download.suggestedFilename()).toBe("industrial-test-report.csv");

    // Read download stream and verify CSV content
    const stream = await download.createReadStream();
    expect(stream).not.toBeNull();

    const chunks: Buffer[] = [];
    for await (const chunk of stream!) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const content = Buffer.concat(chunks).toString("utf-8");
    expect(content).toContain("id,scenario,category,status,executionTimeMs");
  });

  test("Exercise 10: Debug an interaction blocked by an overlay", async ({ page }) => {
    await page.goto("/lab/flaky");

    const overlay = page.getByTestId("floating-interceptor");
    await expect(overlay).toBeVisible();

    // Attempting to click controls behind the overlay would fail actionability (hit-testing)
    // Solution: Dismiss the overlay and assert it is removed
    await page.getByLabel("Dismiss Overlay").click();
    await expect(overlay).not.toBeVisible();

    // Now pointer actionability succeeds
    const uploadInput = page.getByLabel("Upload Test Data");
    await expect(uploadInput).toBeEnabled();
  });

  test("Exercise 11: Complete a realistic multi-step user workflow", async ({ page }) => {
    // 1. Visit Login
    await page.goto("/practice/login");

    // 2. Sign in with student credentials
    await page.getByLabel("Practice Username").fill("student");
    await page.getByLabel("Practice Password").fill("Password123!");
    await page.getByRole("button", { name: "Sign In" }).click();

    // 3. Verify Dashboard navigation
    await expect(page).toHaveURL(/.*\/practice\/dashboard/);
    await expect(page.getByTestId("welcome-message")).toContainText("Welcome, student!");
    await expect(page.getByTestId("session-info")).toBeVisible();

    // 4. Sign out
    await page.getByTestId("logout-btn").click();

    // 5. Verify redirection back to login with message
    await expect(page).toHaveURL(/.*\/practice\/login\?loggedOut=true/);
    await expect(page.getByTestId("logged-out-banner")).toContainText("You have been signed out successfully.");
  });

  test("Exercise 12: Solve a senior-level interaction reliability challenge", async ({ page }) => {
    await page.goto("/lab/flaky");

    // Dismiss overlay
    await page.getByLabel("Dismiss Overlay").click();

    // The delayed button starts disabled for 1200ms
    const delayedBtn = page.getByRole("button", { name: "Execute Delayed Action" });

    // Senior SDET pattern: Rely on Playwright's actionability engine
    // click() will automatically wait for element to become enabled without manual sleep!
    await delayedBtn.click();

    const result = page.locator("#actionability-result");
    await expect(result).toBeVisible();
    await expect(result).toContainText("Action successfully executed after actionability wait");
  });
});
