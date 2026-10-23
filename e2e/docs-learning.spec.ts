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
    await expect(page.getByTestId("lesson-title")).toHaveText("Understanding playwright.config.ts — Beginner to Advanced");

    // Click previous
    const prevBtn = page.getByTestId("prev-lesson-btn");
    await expect(prevBtn).toBeVisible();
    await prevBtn.click();

    await expect(page).toHaveURL(/.*\/learn\/playwright\/playwright-introduction/);
  });

  test("Lesson 2 renders complete configuration curriculum, sections, and TOC items", async ({ page }) => {
    await page.goto("/learn/playwright/configuration-and-browsers");

    // Header checks
    await expect(page.getByTestId("lesson-title")).toHaveText("Understanding playwright.config.ts — Beginner to Advanced");
    await expect(page.getByTestId("lesson-difficulty-badge")).toHaveText("Intermediate");
    await expect(page.getByText("30 min read & practice")).toBeVisible();

    // 5 Comprehensive Parts
    await expect(page.locator("#config-foundations")).toBeVisible();
    await expect(page.locator("#essential-options")).toBeVisible();
    await expect(page.locator("#browser-execution-config")).toBeVisible();
    await expect(page.locator("#projects-and-environments")).toBeVisible();
    await expect(page.locator("#advanced-configuration")).toBeVisible();

    // Dedicated Configuration Playground
    await expect(page.getByTestId("config-playground-section")).toBeVisible();

    // 8 Practical Configuration Exercises
    await expect(page.getByTestId("hands-on-exercises-section")).toBeVisible();

    // Knowledge Check Assessment
    await expect(page.getByTestId("knowledge-check-section")).toBeVisible();
  });

  test("Lesson 2 configuration playground toggles tabs and copies commands", async ({ page }) => {
    await page.goto("/learn/playwright/configuration-and-browsers");

    // Initial tab is code
    await expect(page.getByTestId("playground-code-content")).toBeVisible();

    // Switch to properties tab
    await page.getByTestId("playground-tab-properties").click();
    const propsTable = page.getByTestId("playground-properties-content");
    await expect(propsTable).toBeVisible();
    await expect(propsTable.getByRole("cell", { name: "actionTimeout" })).toBeVisible();

    // Switch to comparison tab
    await page.getByTestId("playground-tab-comparison").click();
    const compSection = page.getByTestId("playground-comparison-content");
    await expect(compSection).toBeVisible();
    await expect(compSection.getByText("Test Execution Parallelism", { exact: true })).toBeVisible();
  });

  test("Lesson 2 exercises section expands and collapses all 8 configuration exercises", async ({ page }) => {
    await page.goto("/learn/playwright/configuration-and-browsers");

    // Exercise 1 is expanded initially
    await expect(page.getByTestId("exercise-card-ex1-testdir")).toBeVisible();
    await expect(page.getByTestId("copy-starter-config-ex1-testdir")).toBeVisible();

    // Toggle Exercise 2
    await page.getByTestId("toggle-exercise-btn-1").click();
    const ex2Card = page.getByTestId("exercise-card-ex2-baseurl");
    await expect(ex2Card).toBeVisible();
    await expect(page.getByTestId("copy-starter-config-ex2-baseurl")).toBeVisible();

    // Toggle Hint for Exercise 2
    await page.getByTestId("toggle-hint-ex2-baseurl").click();
    await expect(ex2Card.getByText("Add baseURL: 'http://127.0.0.1:5173'")).toBeVisible();

    // Toggle Solution for Exercise 2
    await page.getByTestId("toggle-solution-ex2-baseurl").click();
    await expect(ex2Card.getByText(/baseURL: "http:\/\/127\.0\.0\.1:5173"/)).toBeVisible();
  });

  test("Lesson 2 knowledge check grades answers and reveals post-submission explanations", async ({ page }) => {
    await page.goto("/learn/playwright/configuration-and-browsers");

    const questionCard = page.getByTestId("quiz-question-kc-discovery");
    await expect(questionCard).toBeVisible();

    // Initially no explanation visible
    await expect(page.getByTestId("explanation-kc-discovery")).not.toBeVisible();

    // Select correct option (index 1: "It searches the current working directory...")
    await page.getByTestId("option-kc-discovery-1").click();

    // Submit answer
    await page.getByTestId("submit-answer-btn-kc-discovery").click();

    // Now explanation is revealed and shows Correct badge
    await expect(page.getByTestId("explanation-kc-discovery")).toBeVisible();
    await expect(questionCard.getByText("Correct", { exact: true })).toBeVisible();
    await expect(questionCard).toContainText("Key Principle:");
  });
});
