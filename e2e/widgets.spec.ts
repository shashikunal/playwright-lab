import { expect, test } from "@playwright/test";

test.describe("widgets lab", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/widgets");
  });

  test("opens, fills, and confirms modal dialog @smoke", async ({ page }) => {
    await page.getByRole("button", { name: "Open Modal Dialog" }).click();
    const dialog = page.getByRole("dialog", { name: "Confirm Deployment Target" });
    await expect(dialog).toBeVisible();

    await page.getByPlaceholder("Type 1234 to proceed").fill("1234");
    await page.getByRole("button", { name: "Confirm Deploy" }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByTestId("modal-result")).toContainText("Modal confirmed");
  });

  test("closes modal dialog with Escape key", async ({ page }) => {
    await page.getByRole("button", { name: "Open Modal Dialog" }).click();
    const dialog = page.getByRole("dialog", { name: "Confirm Deployment Target" });
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });

  test("handles native browser alert dialog", async ({ page }) => {
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("alert");
      expect(dialog.message()).toContain("Maintenance Notice");
      await dialog.accept();
    });

    await page.getByRole("button", { name: "Trigger Alert" }).click();
    await expect(page.getByTestId("dialog-status")).toHaveText("Alert acknowledged by test runner");
  });

  test("handles native browser confirm dialog accept and dismiss", async ({ page }) => {
    // Accept confirm
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("confirm");
      await dialog.accept();
    });
    await page.getByRole("button", { name: "Trigger Confirm" }).click();
    await expect(page.getByTestId("dialog-status")).toHaveText("Confirm accepted");

    // Dismiss confirm
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("confirm");
      await dialog.dismiss();
    });
    await page.getByRole("button", { name: "Trigger Confirm" }).click();
    await expect(page.getByTestId("dialog-status")).toHaveText("Confirm rejected");
  });

  test("handles native browser prompt dialog with text input", async ({ page }) => {
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("prompt");
      expect(dialog.defaultValue()).toBe("v2.4.0-rc1");
      await dialog.accept("v3.0.0-gold");
    });

    await page.getByRole("button", { name: "Trigger Prompt" }).click();
    await expect(page.getByTestId("dialog-status")).toHaveText("Prompt submitted: v3.0.0-gold");
  });

  test("switches tabs using clicks and keyboard navigation", async ({ page }) => {
    const generalTab = page.getByRole("tab", { name: "General Settings" });
    const securityTab = page.getByRole("tab", { name: "Security & Keys" });
    const telemetryTab = page.getByRole("tab", { name: "Telemetry & Logs" });

    await expect(generalTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel", { name: "General Settings" })).toBeVisible();

    // Click tab
    await securityTab.click();
    await expect(securityTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel", { name: "Security & Keys" })).toBeVisible();

    // Arrow navigation
    await securityTab.press("ArrowRight");
    await expect(telemetryTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel", { name: "Telemetry & Logs" })).toBeVisible();
  });

  test("expands and collapses accordion items", async ({ page }) => {
    const btn1 = page.getByRole("button", { name: /What is strict locator mode/i });
    await expect(btn1).toHaveAttribute("aria-expanded", "true");

    // Collapse first
    await btn1.click();
    await expect(btn1).toHaveAttribute("aria-expanded", "false");

    // Expand second
    const btn2 = page.getByRole("button", { name: /How do auto-retrying assertions prevent flaky tests/i });
    await expect(btn2).toHaveAttribute("aria-expanded", "false");
    await btn2.click();
    await expect(btn2).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText("Web-first assertions like")).toBeVisible();
  });

  test("selects and sorts rows in data grid", async ({ page }) => {
    await expect(page.getByTestId("selected-count")).toHaveText("Selected: 0 of 5");

    // Select all
    await page.getByRole("checkbox", { name: "Select all rows" }).check();
    await expect(page.getByTestId("selected-count")).toHaveText("Selected: 5 of 5");

    // Unselect one
    await page.getByRole("checkbox", { name: "Select Auth Gateway" }).uncheck();
    await expect(page.getByTestId("selected-count")).toHaveText("Selected: 4 of 5");

    // Column sorting
    const firstRowBefore = await page.locator("tbody tr td:nth-child(3)").first().innerText();
    await page.getByRole("button", { name: "Name" }).click();
    const firstRowAfter = await page.locator("tbody tr td:nth-child(3)").first().innerText();
    // After toggling sort direction, the first row changes
    expect(firstRowAfter).not.toBe(firstRowBefore);
  });

  test("triggers and dismisses toast notifications", async ({ page }) => {
    await page.getByRole("button", { name: "Trigger Toast" }).click();
    const toast = page.getByRole("status").filter({ hasText: "Job queued successfully" });
    await expect(toast).toBeVisible();

    await page.getByRole("button", { name: "Dismiss notification" }).click();
    await expect(toast).not.toBeVisible();
  });

  test("pierces open shadow DOM root with standard locators", async ({ page }) => {
    const shadowHost = page.getByTestId("shadow-host");
    await expect(shadowHost).toBeVisible();

    const shadowInput = page.locator("input[aria-label='Shadow Input']");
    await shadowInput.fill("Automated shadow value");

    const shadowBtn = page.locator("button:has-text('Execute Shadow Action')");
    await shadowBtn.click();

    await expect(page.locator("#shadow-feedback")).toHaveText("Shadow DOM Executed: Automated shadow value");
  });

  test("traverses menubar and triggers nested submenu items", async ({ page }) => {
    // Hover over File menu
    await page.getByTestId("menu-file").hover();
    await expect(page.getByTestId("menuitem-new")).toBeVisible();

    // Hover over Open Recent to reveal nested submenu
    await page.getByTestId("menuitem-recent").hover();
    await expect(page.getByTestId("menuitem-project-alpha")).toBeVisible();

    // Click nested Project Alpha
    await page.getByTestId("menuitem-project-alpha").click();
    await expect(page.getByText("Opened Project Alpha")).toBeVisible();
  });

  test("edits and formats text inside contenteditable element", async ({ page }) => {
    const editor = page.getByTestId("rich-text-editor");
    await expect(editor).toContainText("bold industrial text");
    await expect(editor.locator("strong")).toHaveText("bold industrial text");

    // Clear and type new content
    await editor.click();
    await editor.fill("Playwright automation contenteditable verify");
    await expect(editor).toHaveText("Playwright automation contenteditable verify");
  });

  test("interacts with SVG bar chart and clears canvas pad", async ({ page }) => {
    // SVG graphics symbols
    const svgChart = page.getByTestId("telemetry-svg-chart");
    await expect(svgChart).toBeVisible();

    const q3Bar = page.getByTestId("svg-bar-q3");
    await expect(q3Bar).toHaveAttribute("aria-label", "Q3: 85 operations");

    // Canvas drawing and clear
    const canvas = page.getByTestId("drawing-canvas");
    await expect(canvas).toBeVisible();
    await page.getByTestId("clear-canvas-btn").click();
  });

  for (const theme of ["light", "dark"] as const) {
    test(`renders in the ${theme} theme`, async ({ page }) => {
      await page.addInitScript((val) => localStorage.setItem("pil-theme", val), theme);
      await page.goto("/lab/widgets");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Interactive Widgets");
    });
  }
});
