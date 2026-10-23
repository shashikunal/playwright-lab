import { expect, test } from "./fixtures/index.js";

test.describe("educational architecture: Guided, Challenge, and Interview learning modes", () => {
  test("overview displays learning mode indicators on scenario cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const formsCard = page.locator("#main a[href='/lab/forms']");
    await expect(formsCard).toBeVisible();
    await expect(formsCard.getByText("Guided")).toBeVisible();
    await expect(formsCard.getByText("Challenge")).toBeVisible();
    await expect(formsCard.getByText("Interview Q")).toBeVisible();
  });

  test("interactive learning console allows mode switching and self-evaluation checklist", async ({
    page,
  }) => {
    await page.goto("/app/enrollments");

    const consolePanel = page.getByTestId("learning-console-panel");
    await expect(consolePanel).toBeVisible();

    // 1. Guided Mode (default)
    const guidedTab = page.getByRole("tab", { name: "Guided" });
    await expect(guidedTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Concept & Strategy")).toBeVisible();
    await expect(page.getByText("Architecture & Behavior")).toBeVisible();
    await expect(page.getByText("Playwright Implementation Pattern")).toBeVisible();

    // 2. Switch to Challenge Mode
    const challengeTab = page.getByRole("tab", { name: "Challenge" });
    await challengeTab.click();
    await expect(challengeTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Automated Challenge Objective")).toBeVisible();
    await expect(page.getByText("Strict Engineering Constraints")).toBeVisible();

    // Check off an acceptance checklist item
    const firstCheckbox = page.locator("#chk-0");
    await expect(firstCheckbox).not.toBeChecked();
    await firstCheckbox.check();
    await expect(firstCheckbox).toBeChecked();

    // 3. Switch to Interview Mode
    const interviewTab = page.getByRole("tab", { name: "Interview" });
    await interviewTab.click();
    await expect(interviewTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Staff / Principal SDET Interview Question")).toBeVisible();
    await expect(page.getByText("Senior Engineering Trade-Off Analysis")).toBeVisible();
    await expect(page.getByText("Common Candidate Trap to Avoid")).toBeVisible();
  });

  test("forms lab features learning console with copyable code snippet", async ({ page }) => {
    await page.goto("/lab/forms");

    const consolePanel = page.getByTestId("learning-console-panel");
    await expect(consolePanel).toBeVisible();

    // Copy code button exists
    const copyButton = consolePanel.getByRole("button", { name: "Copy" });
    await expect(copyButton).toBeVisible();
  });

  test("persists learner mastery progress to localStorage and updates progress bar", async ({ page }) => {
    await page.goto("/");
    // Clear any pre-existing progress
    await page.evaluate(() => localStorage.removeItem("pil-progress"));
    await page.reload();

    const progressSection = page.getByTestId("learner-progress-section");
    await expect(progressSection).toBeVisible();

    // Verify initial state: 0 Mastered (0%)
    await expect(page.getByTestId("progress-ratio")).toContainText("0 / ");
    await expect(page.getByTestId("learner-progress-bar")).toHaveAttribute("aria-valuenow", "0");

    // Toggle mastery on 'locators' scenario
    const locatorsToggle = page.getByTestId("toggle-complete-locators");
    await expect(locatorsToggle).toBeVisible();
    await locatorsToggle.click();

    // Verify mastery badge appeared and progress ratio incremented
    await expect(page.getByTestId("mastered-label-locators")).toBeVisible();
    await expect(page.getByTestId("progress-ratio")).toContainText("1 / ");

    // Verify progress persisted in localStorage
    const saved = await page.evaluate(() => localStorage.getItem("pil-progress"));
    expect(saved).toContain("locators");

    // Reload page and assert persistence
    await page.reload();
    await expect(page.getByTestId("mastered-label-locators")).toBeVisible();
    await expect(page.getByTestId("progress-ratio")).toContainText("1 / ");

    // Reset progress
    await page.getByTestId("reset-progress-btn").click();
    await expect(page.getByTestId("progress-ratio")).toContainText("0 / ");
  });
});
