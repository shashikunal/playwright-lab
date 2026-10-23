import { expect, test } from "@playwright/test";

const validIntake = {
  fullName: "Ada Lovelace",
  email: "ada@lab.test",
  seats: 2,
  startDate: "2026-11-02",
  track: "api",
  agree: true,
};

test.describe("intake form", () => {
  test("shows client errors and does not claim success", async ({ page }) => {
    await page.goto("/lab/forms");
    await page.getByRole("button", { name: "Submit intake" }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    await expect(page.getByText(/Accepted as/)).toHaveCount(0);
  });

  test("submits through Express and shows the returned id", async ({ page }) => {
    await page.goto("/lab/forms");
    await page.getByLabel("Full name").fill(validIntake.fullName);
    await page.getByLabel("Email").fill(validIntake.email);
    await page.getByLabel("Seats").fill(String(validIntake.seats));
    await page.getByLabel("Start date").fill(validIntake.startDate);
    await page.getByLabel("Track").selectOption("api");
    await page.getByRole("checkbox", { name: "I agree to the lab terms" }).check();

    const responsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/lab/forms/intake") && response.ok(),
    );
    await page.getByLabel("Full name").press("Enter");
    const body = (await (await responsePromise).json()) as { id: string; status: string };
    expect(body.status).toBe("accepted");
    await expect(page.getByRole("status").filter({ hasText: `Accepted as ${body.id}` })).toBeVisible();
  });

  test("rejects invalid JSON bodies with 422 @api", async ({ request }) => {
    const response = await request.post("/api/lab/forms/intake", { data: { email: "not-an-email" } });
    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.error.code).toBe("validation_error");
    expect(body.error.details.length).toBeGreaterThan(0);
  });

  test("accepts a valid intake through the API @api", async ({ request }) => {
    const response = await request.post("/api/lab/forms/intake", { data: validIntake });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe("accepted");
    expect(body.id).toMatch(/^sub_\d+$/);
  });

  test("keeps planned labs off the link list", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await nav.getByRole("link", { name: "Forms" }).click();
    await expect(page).toHaveURL(/\/lab\/forms$/);
    await expect(nav.getByRole("link", { name: "Chaos Engineering" })).toHaveCount(0);
    await expect(nav.getByText("Chaos Engineering")).toBeVisible();
  });

    for (const theme of ["light", "dark"] as const) {
    test(`renders in the ${theme} theme`, async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem("pil-theme", value), theme);
      await page.goto("/lab/forms");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.getByRole("heading", { name: "Forms, Inputs & Validation" })).toBeVisible();
    });
  }

  test("fills and asserts native inputs showcase (number, range, radio, file)", async ({ page }) => {
    await page.goto("/lab/forms");
    await page.getByTestId("tab-inputs").click();

    // Text and number
    await page.getByTestId("input-text").fill("Custom Automated Input");
    await expect(page.getByTestId("input-text")).toHaveValue("Custom Automated Input");

    await page.getByTestId("input-number").fill("88");
    await expect(page.getByTestId("input-number")).toHaveValue("88");

    // Range slider value
    const slider = page.getByTestId("input-range");
    await slider.fill("90");
    await expect(page.getByTestId("range-val")).toHaveText("90");

    // Radio button check
    await page.getByTestId("radio-option-a").check();
    await expect(page.getByTestId("radio-option-a")).toBeChecked();
    await expect(page.getByTestId("radio-option-b")).not.toBeChecked();

    // File input
    await page.getByTestId("input-file").setInputFiles({
      name: "sample-form-attachment.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Industrial sample attachment content"),
    });
    await expect(page.getByTestId("uploaded-file-name")).toContainText("sample-form-attachment.txt");
  });

  test("verifies compliant labels, broken anti-patterns, and ARIA names", async ({ page }) => {
    await page.goto("/lab/forms");
    await page.getByTestId("tab-labels").click();

    // Compliant label matches successfully
    await expect(page.getByLabel("Compliant Label (Explicit htmlFor matching id)")).toHaveValue(
      "Valid label binding",
    );

    // Broken label cannot match via getByLabel
    await expect(page.getByLabel("Broken Label (Missing htmlFor attribute)")).toHaveCount(0);
    // But direct testId can find the detached input
    await expect(page.getByTestId("broken-label-input")).toBeVisible();

    // Placeholder accessible name
    await expect(page.getByPlaceholder("Search via placeholder name...")).toBeVisible();

    // Direct aria-label
    await expect(page.getByLabel("Direct Accessible Name Input")).toBeVisible();
  });

  test("interacts with native multi-select and custom ARIA combobox", async ({ page }) => {
    await page.goto("/lab/forms");
    await page.getByTestId("tab-combos").click();

    // Native single select
    await page.getByTestId("native-single-select").selectOption("webkit");
    await expect(page.getByTestId("single-select-val")).toHaveText("Selected: webkit");

    // Native multiple select
    await page.getByTestId("native-multi-select").selectOption(["firefox", "webkit"]);
    await expect(page.getByTestId("multi-select-val")).toContainText("firefox");
    await expect(page.getByTestId("multi-select-val")).toContainText("webkit");

    // Custom ARIA Combobox
    const combobox = page.getByRole("combobox", { name: "Custom ARIA 1.2 Combobox" });
    await expect(combobox).toBeVisible();
    await combobox.click();

    // Select Python option
    await page.getByTestId("combo-option-python").click();
    await expect(combobox).toContainText("Python");
  });

  test("manages conditional fields and multi-step wizard state", async ({ page }) => {
    await page.goto("/lab/forms");
    await page.getByTestId("tab-wizard").click();

    // Corporate fields hidden initially
    await expect(page.getByTestId("corporate-fields-panel")).toBeHidden();

    // Select corporate radio reveals fields
    await page.getByTestId("account-corporate-radio").check();
    await expect(page.getByTestId("corporate-fields-panel")).toBeVisible();
    await page.getByTestId("company-name-input").fill("Playwright Corp");
    await expect(page.getByTestId("company-name-input")).toHaveValue("Playwright Corp");

    // Wizard navigation (Step 1 -> Step 2 -> Step 3)
    await expect(page.getByTestId("wizard-step-indicator")).toHaveText("Step 1 of 3");
    await page.getByTestId("wizard-next-btn").click();

    await expect(page.getByTestId("wizard-step-indicator")).toHaveText("Step 2 of 3");
    await page.getByTestId("wizard-tier-select").selectOption("Professional");
    await page.getByTestId("wizard-next-btn").click();

    await expect(page.getByTestId("wizard-step-indicator")).toHaveText("Step 3 of 3");
    await expect(page.getByTestId("review-tier")).toHaveText("Professional");

    // Navigate back to verify state retention
    await page.getByTestId("wizard-back-btn").click();
    await expect(page.getByTestId("wizard-step-indicator")).toHaveText("Step 2 of 3");
    await expect(page.getByTestId("wizard-tier-select")).toHaveValue("Professional");
  });
});
