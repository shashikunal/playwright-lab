import { expect, test } from "@playwright/test";

test.describe("Playwright Docs & Learning Path", () => {
  test("overview page contains hero banner linking to docs @smoke", async ({ page }) => {
    await page.goto("/");
    const heroBanner = page.getByTestId("playwright-docs-hero-banner");
    await expect(heroBanner).toBeVisible();
    await expect(heroBanner).toContainText("Playwright Documentation & Senior Learning Path");

    const startBtn = page.getByTestId("explore-docs-hero-btn");
    await startBtn.click();
    await expect(page).toHaveURL(/\/learn\/playwright/);
  });

  test("shell sidebar links directly to Playwright Docs", async ({ page }) => {
    await page.goto("/");
    const navLink = page.getByTestId("nav-playwright-docs");
    await expect(navLink).toBeVisible();
    await navLink.click();
    await expect(page).toHaveURL(/\/learn\/playwright/);
    await expect(page.getByTestId("playwright-docs-page")).toBeVisible();
  });

  test("default route redirects to first lesson with complete metadata", async ({ page }) => {
    await page.goto("/learn/playwright");
    await expect(page).toHaveURL(/.*\/learn\/playwright\/playwright-introduction/);

    // Header checks
    await expect(page.getByTestId("lesson-title")).toHaveText("Your First Playwright Test");
    await expect(page.getByTestId("lesson-difficulty-badge")).toHaveText("Beginner");
    await expect(page.getByText("20 min read & practice")).toBeVisible();

    // Section headers
    await expect(page.locator("#overview")).toBeVisible();
    await expect(page.locator("#architecture-overview")).toBeVisible();
    await expect(page.locator("#test-expect-page-fixtures")).toBeVisible();
    await expect(page.locator("#terminal-execution")).toBeVisible();
    await expect(page.locator("#test-discovery-rules")).toBeVisible();
    await expect(page.locator("#assertion-diagnostics")).toBeVisible();
    await expect(page.locator("#code-examples")).toBeVisible();
    await expect(page.locator("#common-pitfalls")).toBeVisible();
    await expect(page.locator("#hands-on-practice")).toBeVisible();
    await expect(page.locator("#interview-qa")).toBeVisible();
  });

  test("sidebar searches and filters curriculum lessons dynamically", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-introduction");
    const searchInput = page.getByTestId("docs-search-input");
    await expect(searchInput).toBeVisible();

    // Search for 'Configuration'
    await searchInput.fill("Configuration");

    // Matching lesson link should be visible
    await expect(page.getByTestId("sidebar-lesson-configuration-and-browsers")).toBeVisible();

    // Clear search
    await searchInput.fill("");
    await expect(page.getByTestId("sidebar-lesson-playwright-introduction")).toBeVisible();
  });

  test("practice task card provides hints, solutions, and lab link", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-introduction");

    const practiceCard = page.getByTestId("practice-task-card");
    await expect(practiceCard).toBeVisible();

    // Link to practice lab
    const labLink = page.getByTestId("live-lab-link");
    await expect(labLink).toBeVisible();
    await expect(labLink).toHaveAttribute("href", "/practice/login");

    // Toggle hint
    const hintBtn = page.getByTestId("toggle-hint-btn");
    await hintBtn.click();
    await expect(page.getByTestId("hint-content")).toBeVisible();

    // Toggle solution
    const solutionBtn = page.getByTestId("toggle-solution-btn");
    await solutionBtn.click();
    await expect(page.getByTestId("solution-content")).toBeVisible();
  });

  test("senior SDET interview accordion expands and collapses", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-introduction");

    const qaCard = page.getByTestId("interview-qa-0");
    await expect(qaCard).toBeVisible();

    // Click to open
    await qaCard.getByRole("button").click();
    await expect(qaCard.getByText("Architectural Deep-Dive:")).toBeVisible();

    // Click to collapse
    await qaCard.getByRole("button").click();
    await expect(qaCard.getByText("Architectural Deep-Dive:")).not.toBeVisible();
  });

  test("tracks and persists lesson completion across reloads", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-introduction");
    await page.evaluate(() => localStorage.removeItem("pil-learning-progress"));
    await page.reload();

    const completeBtn = page.getByTestId("toggle-lesson-complete-btn");
    await expect(completeBtn).toContainText("Mark Lesson as Completed");

    // Mark completed
    await completeBtn.click();
    await expect(completeBtn).toContainText("Completed (Click to undo)");

    // Reload page and verify state persisted
    await page.reload();
    await expect(page.getByTestId("toggle-lesson-complete-btn")).toContainText("Completed (Click to undo)");

    // Progress bar in sidebar should show 1 of X completed
    await expect(page.getByText(/1 of \d+ completed/)).toBeVisible();
  });

  test("navigates seamlessly between lessons using Next and Previous buttons", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-introduction");

    const nextBtn = page.getByTestId("next-lesson-btn");
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Navigates to configuration-and-browsers
    await expect(page).toHaveURL(/.*\/learn\/playwright\/configuration-and-browsers/);
    await expect(page.getByTestId("lesson-title")).toContainText("Configuration Matrix");

    // Click previous
    const prevBtn = page.getByTestId("prev-lesson-btn");
    await expect(prevBtn).toBeVisible();
    await prevBtn.click();

    await expect(page).toHaveURL(/.*\/learn\/playwright\/playwright-introduction/);
  });
});
