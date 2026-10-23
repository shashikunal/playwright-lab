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

  test("Lesson 3 renders complete locators curriculum, Part A through Part F sections, and TOC items", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-locators");

    // Header checks
    await expect(page.getByTestId("lesson-title")).toHaveText("Playwright Locators — Beginner to Advanced");
    await expect(page.getByTestId("lesson-difficulty-badge")).toHaveText("Intermediate");
    await expect(page.getByText("35 min read & practice")).toBeVisible();

    // 6 Comprehensive Parts
    await expect(page.locator("#locator-fundamentals")).toBeVisible();
    await expect(page.locator("#builtin-locators")).toBeVisible();
    await expect(page.locator("#css-and-xpath")).toBeVisible();
    await expect(page.locator("#locator-composition")).toBeVisible();
    await expect(page.locator("#dynamic-interfaces")).toBeVisible();
    await expect(page.locator("#debugging-and-best-practices")).toBeVisible();

    // Dedicated Interactive Locator Strategy Matrix
    await expect(page.getByTestId("config-playground-section")).toBeVisible();

    // 10 Hands-on Exercises Section
    await expect(page.getByTestId("hands-on-exercises-section")).toBeVisible();
    await expect(page.getByRole("heading", { name: "10 Practical Hands-On Exercises" })).toBeVisible();

    // Knowledge Check Section (9 Questions across 3 tiers)
    await expect(page.getByTestId("knowledge-check-section")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Knowledge Check: Playwright Locators — Beginner to Advanced" })).toBeVisible();

    // Practice Task Card links to live Locator Gym
    const gymLink = page.getByTestId("live-lab-link");
    await expect(gymLink).toBeVisible();
    await expect(gymLink).toHaveAttribute("href", "/lab/locators");
  });

  test("Lesson 3 locator strategy matrix toggles between Blueprint, Built-in API Matrix, and Brittle vs Reliable", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-locators");

    // Initial tab is Locator Tiering Blueprint
    await expect(page.getByTestId("playground-tab-code")).toContainText("Locator Tiering Blueprint");
    await expect(page.getByTestId("playground-code-content")).toBeVisible();
    await expect(page.getByText("W3C Accessibility Tree")).toBeVisible();

    // Switch to Locator Strategy Reference tab
    await page.getByTestId("playground-tab-properties").click();
    await expect(page.getByTestId("playground-tab-properties")).toContainText("Locator Strategy Reference");
    const propsTable = page.getByTestId("playground-properties-content");
    await expect(propsTable).toBeVisible();
    await expect(propsTable.getByRole("cell", { name: "getByRole(role, { name })" })).toBeVisible();
    await expect(propsTable.getByRole("cell", { name: "getByTestId(id)" })).toBeVisible();

    // Switch to Brittle vs Reliable tab
    await page.getByTestId("playground-tab-comparison").click();
    await expect(page.getByTestId("playground-tab-comparison")).toContainText("Semantic vs Brittle Comparison");
    const compSection = page.getByTestId("playground-comparison-content");
    await expect(compSection).toBeVisible();
    await expect(compSection.getByText("User-Facing vs DOM-Coupled", { exact: true })).toBeVisible();
    await expect(compSection.getByText("Disambiguation Strategy", { exact: true })).toBeVisible();
  });

  test("Lesson 3 exercises section displays all 10 exercises and toggles hints and solutions", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-locators");

    // Exercise 1 is expanded by default
    await expect(page.getByTestId("exercise-card-ex1-heading")).toBeVisible();
    await expect(page.getByTestId("copy-starter-config-ex1-heading")).toBeVisible();

    // Toggle Exercise 2
    await page.getByTestId("toggle-exercise-btn-1").click();
    const ex2Card = page.getByTestId("exercise-card-ex2-label");
    await expect(ex2Card).toBeVisible();

    // Exercise 2 hint and solution
    await page.getByTestId("toggle-hint-ex2-label").click();
    await expect(ex2Card.getByText("Use await expect(searchInput).toHaveValue('Playwright Locators').")).toBeVisible();

    await page.getByTestId("toggle-solution-ex2-label").click();
    await expect(ex2Card.getByText("await searchInput.fill(\"Playwright Locators\");")).toBeVisible();

    // Exercise 10 is available in the list
    await page.getByTestId("toggle-exercise-btn-9").click();
    const ex10Card = page.getByTestId("exercise-card-ex10-senior-debug");
    await expect(ex10Card).toBeVisible();
    await expect(ex10Card).toContainText("Exercise 10: Complete a Senior-Level Locator Debugging Challenge");
  });

  test("Lesson 3 knowledge check assesses questions across tiers and reveals comprehensive explanations", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-locators");

    // Beginner Question (kc-locator-lazy: option 2)
    const q1Card = page.getByTestId("quiz-question-kc-locator-lazy");
    await expect(q1Card).toBeVisible();
    await page.getByTestId("option-kc-locator-lazy-2").click();
    await page.getByTestId("submit-answer-btn-kc-locator-lazy").click();
    await expect(page.getByTestId("explanation-kc-locator-lazy")).toBeVisible();
    await expect(q1Card.getByText("Correct", { exact: true })).toBeVisible();

    // Intermediate Question (kc-strict-mode: option 1)
    const q4Card = page.getByTestId("quiz-question-kc-strict-mode");
    await expect(q4Card).toBeVisible();
    await page.getByTestId("option-kc-strict-mode-1").click();
    await page.getByTestId("submit-answer-btn-kc-strict-mode").click();
    await expect(page.getByTestId("explanation-kc-strict-mode")).toBeVisible();
    await expect(q4Card.getByText("Correct", { exact: true })).toBeVisible();

    // Advanced Question (kc-hidden-elements: option 1)
    const q7Card = page.getByTestId("quiz-question-kc-hidden-elements");
    await expect(q7Card).toBeVisible();
    await page.getByTestId("option-kc-hidden-elements-1").click();
    await page.getByTestId("submit-answer-btn-kc-hidden-elements").click();
    await expect(page.getByTestId("explanation-kc-hidden-elements")).toBeVisible();
    await expect(q7Card.getByText("Correct", { exact: true })).toBeVisible();
  });

  test("Lesson 4 renders complete assertions curriculum, Part A through Part F sections, and TOC items", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-assertions");

    // Header checks
    await expect(page.getByTestId("lesson-title")).toHaveText("Playwright Assertions and Auto-Waiting — Beginner to Advanced");
    await expect(page.getByTestId("lesson-difficulty-badge")).toHaveText("Intermediate");
    await expect(page.getByText("35 min read & practice")).toBeVisible();

    // 6 Comprehensive Parts
    await expect(page.locator("#assertion-fundamentals")).toBeVisible();
    await expect(page.locator("#web-first-assertions")).toBeVisible();
    await expect(page.locator("#autowaiting-actionability")).toBeVisible();
    await expect(page.locator("#timeout-architecture")).toBeVisible();
    await expect(page.locator("#advanced-assertion-strategies")).toBeVisible();
    await expect(page.locator("#debugging-unreliable-assertions")).toBeVisible();

    // Dedicated Interactive Assertions & Auto-Waiting Matrix
    await expect(page.getByTestId("config-playground-section")).toBeVisible();

    // 10 Hands-on Exercises Section
    await expect(page.getByTestId("hands-on-exercises-section")).toBeVisible();
    await expect(page.getByRole("heading", { name: "10 Practical Hands-On Exercises" })).toBeVisible();

    // Knowledge Check Section (9 Questions across 3 tiers)
    await expect(page.getByTestId("knowledge-check-section")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Knowledge Check: Playwright Assertions and Auto-Waiting — Beginner to Advanced" })).toBeVisible();

    // Practice Task Card links to live Flaky Lab
    const labLink = page.getByTestId("live-lab-link");
    await expect(labLink).toBeVisible();
    await expect(labLink).toHaveAttribute("href", "/lab/flaky");
  });

  test("Lesson 4 interactive assertions matrix toggles between Blueprint, Matrix, and Retrying Patterns", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-assertions");

    // Initial tab is Assertions Pipeline Blueprint
    await expect(page.getByTestId("playground-tab-code")).toContainText("Assertions Pipeline Blueprint");
    await expect(page.getByTestId("playground-code-content")).toBeVisible();

    // Switch to Web-First Assertions Matrix tab
    await page.getByTestId("playground-tab-properties").click();
    await expect(page.getByTestId("playground-tab-properties")).toContainText("Web-First Assertions Matrix");
    const propsTable = page.getByTestId("playground-properties-content");
    await expect(propsTable).toBeVisible();
    await expect(propsTable.getByRole("cell", { name: "toBeVisible()" })).toBeVisible();
    await expect(propsTable.getByRole("cell", { name: "expect.poll()" })).toBeVisible();

    // Switch to Retrying vs Non-Retrying Patterns tab
    await page.getByTestId("playground-tab-comparison").click();
    await expect(page.getByTestId("playground-tab-comparison")).toContainText("Retrying vs Non-Retrying Patterns");
    const compSection = page.getByTestId("playground-comparison-content");
    await expect(compSection).toBeVisible();
    await expect(compSection.getByText("toBeVisible() vs isVisible()", { exact: true })).toBeVisible();
    await expect(compSection.getByText("Observable Polling vs Fixed Sleep", { exact: true })).toBeVisible();
  });

  test("Lesson 4 exercises section displays all 10 exercises and toggles hints and solutions", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-assertions");

    // Exercise 1 is expanded by default
    await expect(page.getByTestId("exercise-card-ex1-heading-visible")).toBeVisible();
    await expect(page.getByTestId("copy-starter-config-ex1-heading-visible")).toBeVisible();

    // Toggle Exercise 2
    await page.getByTestId("toggle-exercise-btn-1").click();
    const ex2Card = page.getByTestId("exercise-card-ex2-exact-partial-text");
    await expect(ex2Card).toBeVisible();

    // Exercise 2 hint and solution
    await page.getByTestId("toggle-hint-ex2-exact-partial-text").click();
    await expect(ex2Card.getByText("toContainText('accessible names')")).toBeVisible();

    await page.getByTestId("toggle-solution-ex2-exact-partial-text").click();
    await expect(ex2Card.getByText("await expect(descriptionText).toHaveText(")).toBeVisible();

    // Exercise 10 is available in the list
    await page.getByTestId("toggle-exercise-btn-9").click();
    const ex10Card = page.getByTestId("exercise-card-ex10-senior-flaky-actionability");
    await expect(ex10Card).toBeVisible();
    await expect(ex10Card).toContainText("Exercise 10: Solve a Senior-Level Flaky-Test Scenario with Actionability");
  });

  test("Lesson 4 knowledge check assesses questions across tiers and reveals comprehensive explanations", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-assertions");

    // Beginner Question (kc-assert-purpose: option 1)
    const q1Card = page.getByTestId("quiz-question-kc-assert-purpose");
    await expect(q1Card).toBeVisible();
    await page.getByTestId("option-kc-assert-purpose-1").click();
    await page.getByTestId("submit-answer-btn-kc-assert-purpose").click();
    await expect(page.getByTestId("explanation-kc-assert-purpose")).toBeVisible();
    await expect(q1Card.getByText("Correct", { exact: true })).toBeVisible();

    // Intermediate Question (kc-assert-timeout-hierarchy: option 2)
    const q5Card = page.getByTestId("quiz-question-kc-assert-timeout-hierarchy");
    await expect(q5Card).toBeVisible();
    await page.getByTestId("option-kc-assert-timeout-hierarchy-2").click();
    await page.getByTestId("submit-answer-btn-kc-assert-timeout-hierarchy").click();
    await expect(page.getByTestId("explanation-kc-assert-timeout-hierarchy")).toBeVisible();
    await expect(q5Card.getByText("Correct", { exact: true })).toBeVisible();

    // Advanced Question (kc-assert-ci-flakiness-root: option 1)
    const q8Card = page.getByTestId("quiz-question-kc-assert-ci-flakiness-root");
    await expect(q8Card).toBeVisible();
    await page.getByTestId("option-kc-assert-ci-flakiness-root-1").click();
    await page.getByTestId("submit-answer-btn-kc-assert-ci-flakiness-root").click();
    await expect(page.getByTestId("explanation-kc-assert-ci-flakiness-root")).toBeVisible();
    await expect(q8Card.getByText("Correct", { exact: true })).toBeVisible();
  });

  test("navigates seamlessly between Lesson 3 and Lesson 4 using Next and Previous buttons", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-locators");

    const nextBtn = page.getByTestId("next-lesson-btn");
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Navigates to playwright-assertions
    await expect(page).toHaveURL(/.*\/learn\/playwright\/playwright-assertions/);
    await expect(page.getByTestId("lesson-title")).toHaveText("Playwright Assertions and Auto-Waiting — Beginner to Advanced");

    // Click previous
    const prevBtn = page.getByTestId("prev-lesson-btn");
    await expect(prevBtn).toBeVisible();
    await prevBtn.click();

    await expect(page).toHaveURL(/.*\/learn\/playwright\/playwright-locators/);
  });

  test("Lesson 5 renders complete actions curriculum, Part A through Part G sections, and TOC items", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-actions");

    // Header & metadata checks
    await expect(page.getByTestId("lesson-title")).toHaveText("Playwright Browser Actions and Interactions — Beginner to Advanced");
    await expect(page.getByTestId("lesson-difficulty-badge")).toHaveText("Intermediate");
    await expect(page.getByText("40 min read & practice")).toBeVisible();

    // Verify all 7 Progressive Sections (Parts A through G)
    await expect(page.locator("#overview")).toBeVisible();
    await expect(page.locator("#interaction-fundamentals")).toBeVisible();
    await expect(page.locator("#mouse-and-pointer-actions")).toBeVisible();
    await expect(page.locator("#keyboard-interactions")).toBeVisible();
    await expect(page.locator("#forms-and-input-controls")).toBeVisible();
    await expect(page.locator("#dialogs-and-browser-events")).toBeVisible();
    await expect(page.locator("#advanced-interaction-patterns")).toBeVisible();
    await expect(page.locator("#common-failures-and-best-practices")).toBeVisible();
    await expect(page.locator("#code-examples")).toBeVisible();
    await expect(page.locator("#common-pitfalls")).toBeVisible();
    await expect(page.locator("#config-playground")).toBeVisible();
    await expect(page.locator("#hands-on-exercises")).toBeVisible();
    await expect(page.locator("#knowledge-check")).toBeVisible();
    await expect(page.locator("#hands-on-practice")).toBeVisible();
    await expect(page.locator("#interview-qa")).toBeVisible();

    // Verify TOC contains accurate items
    const toc = page.getByTestId("docs-toc");
    await expect(toc).toBeVisible();
    await expect(toc.getByRole("link", { name: "Overview & Objectives" })).toBeVisible();
    await expect(toc.getByRole("link", { name: "Part A — Interaction Fundamentals & Auto-Waiting Actionability Engine" })).toBeVisible();
    await expect(toc.getByRole("link", { name: "Part B — Mouse & Pointer Actions: Clicks, Coordinates & Drag-and-Drop" })).toBeVisible();
    await expect(toc.getByRole("link", { name: "Part C — Keyboard Interactions, Modifiers & Focus Traversal" })).toBeVisible();
    await expect(toc.getByRole("link", { name: "Part D — Forms, Complex Input Controls & File Uploads" })).toBeVisible();
    await expect(toc.getByRole("link", { name: "Part E — Browser Dialogs, Multi-Window Popups & File Downloads" })).toBeVisible();
    await expect(toc.getByRole("link", { name: "Part F — Advanced Interactions: Menus, Viewports, Frames & Shadow DOM" })).toBeVisible();
    await expect(toc.getByRole("link", { name: "Part G — Root-Cause Debugging, Intercepted Overlays & Flakiness Prevention" })).toBeVisible();
    await expect(toc.getByRole("link", { name: "Interaction & Actionability Matrix" })).toBeVisible();
    await expect(toc.getByRole("link", { name: "12 Hands-On Exercises" })).toBeVisible();
    await expect(toc.getByRole("link", { name: "Knowledge Check Assessment" })).toBeVisible();
    await expect(toc.getByRole("link", { name: "Hands-On Practice Task" })).toBeVisible();
    await expect(toc.getByRole("link", { name: "Senior SDET Interview Q&A" })).toBeVisible();
  });

  test("Lesson 5 interactive actions playground toggles between Blueprint, Action Options Matrix, and User-Facing vs Synthetic Interaction", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-actions");

    // Playground Section
    const playground = page.getByTestId("config-playground-section");
    await expect(playground).toBeVisible();
    await expect(playground.getByRole("heading", { level: 2 })).toHaveText("Playwright Interaction Actionability & Dispatch Matrix");

    // Default Code Tab
    await expect(page.getByTestId("playground-tab-code")).toHaveText("Browser Actions Blueprint");
    await expect(page.getByText("production-actions.spec.ts")).toBeVisible();
    await expect(playground.getByTestId("playground-code-content")).toContainText("clickCount: 1");

    // Switch to Action Options & Parameters Matrix Tab
    await page.getByTestId("playground-tab-properties").click();
    await expect(page.getByTestId("playground-tab-properties")).toContainText("Action Options & Parameters Matrix (12)");
    const propsTable = page.getByTestId("playground-properties-content");
    await expect(propsTable).toBeVisible();
    await expect(propsTable.getByRole("cell", { name: "force", exact: true })).toBeVisible();
    await expect(propsTable.getByRole("cell", { name: "noWaitAfter", exact: true })).toBeVisible();
    await expect(propsTable.getByRole("cell", { name: "trial", exact: true })).toBeVisible();

    // Switch to User-Facing vs Synthetic Interaction Tab
    await page.getByTestId("playground-tab-comparison").click();
    await expect(page.getByTestId("playground-tab-comparison")).toContainText("User-Facing vs Synthetic Interaction");
    const compSection = page.getByTestId("playground-comparison-content");
    await expect(compSection).toBeVisible();
    await expect(compSection.getByText("locator.click() vs locator.dispatchEvent('click')", { exact: true })).toBeVisible();
    await expect(compSection.getByText("locator.fill() vs locator.pressSequentially()", { exact: true })).toBeVisible();
    await expect(compSection.getByText("Pre-registering vs Post-registering Event Listeners", { exact: true })).toBeVisible();
  });

  test("Lesson 5 exercises section displays all 12 exercises and toggles hints and solutions", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-actions");

    // Exercise 1 is expanded by default
    await expect(page.getByTestId("exercise-card-ex1-click-button-state")).toBeVisible();
    await expect(page.getByTestId("copy-starter-config-ex1-click-button-state")).toBeVisible();

    // Toggle Exercise 2
    await page.getByTestId("toggle-exercise-btn-1").click();
    const ex2Card = page.getByTestId("exercise-card-ex2-fill-form-validate");
    await expect(ex2Card).toBeVisible();

    // Exercise 2 hint and solution
    await page.getByTestId("toggle-hint-ex2-fill-form-validate").click();
    await expect(ex2Card.getByText("page.waitForResponse(res => res.url().includes('/api/lab/forms/intake')")).toBeVisible();

    await page.getByTestId("toggle-solution-ex2-fill-form-validate").click();
    await expect(ex2Card.getByText("await page.getByLabel(\"Full name\").fill(\"Ada Lovelace\");")).toBeVisible();

    // Exercise 12 is available in the list
    await page.getByTestId("toggle-exercise-btn-11").click();
    const ex12Card = page.getByTestId("exercise-card-ex12-senior-interaction-reliability");
    await expect(ex12Card).toBeVisible();
    await expect(ex12Card).toContainText("Exercise 12: Solve a Senior-Level Interaction Reliability Challenge");
  });

  test("Lesson 5 knowledge check assesses questions across tiers and reveals comprehensive explanations", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-actions");

    // Beginner Question (kc-actions-autowait: option 1)
    const q1Card = page.getByTestId("quiz-question-kc-actions-autowait");
    await expect(q1Card).toBeVisible();
    await page.getByTestId("option-kc-actions-autowait-1").click();
    await page.getByTestId("submit-answer-btn-kc-actions-autowait").click();
    await expect(page.getByTestId("explanation-kc-actions-autowait")).toBeVisible();
    await expect(q1Card.getByText("Correct", { exact: true })).toBeVisible();

    // Intermediate Question (kc-actions-dialog-race: option 1)
    const q4Card = page.getByTestId("quiz-question-kc-actions-dialog-race");
    await expect(q4Card).toBeVisible();
    await page.getByTestId("option-kc-actions-dialog-race-1").click();
    await page.getByTestId("submit-answer-btn-kc-actions-dialog-race").click();
    await expect(page.getByTestId("explanation-kc-actions-dialog-race")).toBeVisible();
    await expect(q4Card.getByText("Correct", { exact: true })).toBeVisible();

    // Advanced Question (kc-actions-force-danger: option 1)
    const q7Card = page.getByTestId("quiz-question-kc-actions-force-danger");
    await expect(q7Card).toBeVisible();
    await page.getByTestId("option-kc-actions-force-danger-1").click();
    await page.getByTestId("submit-answer-btn-kc-actions-force-danger").click();
    await expect(page.getByTestId("explanation-kc-actions-force-danger")).toBeVisible();
    await expect(q7Card.getByText("Correct", { exact: true })).toBeVisible();
  });

  test("navigates seamlessly between Lesson 4 and Lesson 5 using Next and Previous buttons", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-assertions");

    const nextBtn = page.getByTestId("next-lesson-btn");
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Navigates to playwright-actions
    await expect(page).toHaveURL(/.*\/learn\/playwright\/playwright-actions/);
    await expect(page.getByTestId("lesson-title")).toHaveText("Playwright Browser Actions and Interactions — Beginner to Advanced");

    // Click previous
    const prevBtn = page.getByTestId("prev-lesson-btn");
    await expect(prevBtn).toBeVisible();
    await prevBtn.click();

    await expect(page).toHaveURL(/.*\/learn\/playwright\/playwright-assertions/);
  });

  test("renders Lesson 6: Playwright Forms and Validation with all Parts A-F sections and TOC links", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-forms");

    // Verify Title & Metadata
    await expect(page.getByTestId("lesson-title")).toHaveText("Playwright Forms and Validation — Beginner to Advanced");
    await expect(page.getByTestId("lesson-difficulty-badge")).toHaveText("Intermediate");
    await expect(page.getByText("45 min read & practice")).toBeVisible();

    // Verify all 6 progressive sections (Parts A-F)
    await expect(page.locator("#form-testing-fundamentals")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Part A — Form Testing Fundamentals & Deterministic Design" })).toBeVisible();

    await expect(page.locator("#input-controls-reference")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Part B — Comprehensive Input Controls & Reliable Automation" })).toBeVisible();

    await expect(page.locator("#validation-strategies")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Part C — Validation Strategies: Client-Side vs Server-Side" })).toBeVisible();

    await expect(page.locator("#submission-and-async-behavior")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Part D — Submission Lifecycle & Asynchronous State Handling" })).toBeVisible();

    await expect(page.locator("#complex-forms-and-wizards")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Part E — Complex Forms: Multi-Step Wizards & Conditional Fields" })).toBeVisible();

    await expect(page.locator("#test-design-and-debugging")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Part F — Test Design: Equivalence Partitioning, BVA & Data-Driven Tests" })).toBeVisible();

    // Verify supplementary pedagogical components
    await expect(page.locator("#code-examples")).toBeVisible();
    await expect(page.locator("#common-pitfalls")).toBeVisible();
    await expect(page.getByTestId("config-playground-section")).toBeVisible();
    await expect(page.getByTestId("hands-on-exercises-section")).toBeVisible();
    await expect(page.getByTestId("knowledge-check-section")).toBeVisible();
    await expect(page.locator("#hands-on-practice")).toBeVisible();
    await expect(page.locator("#interview-qa")).toBeVisible();

    // Verify Table of Contents has Forms & Validation Matrix
    const toc = page.getByTestId("docs-toc");
    await expect(toc.getByText("Forms & Validation Matrix")).toBeVisible();
    await expect(toc.getByText("12 Hands-On Exercises")).toBeVisible();
  });

  test("Lesson 6 config playground toggles code, form control properties, and robust vs brittle comparisons", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-forms");

    const playground = page.getByTestId("config-playground-section");
    await expect(playground.getByText("Playwright Forms, Validation & Submission Strategy Matrix")).toBeVisible();

    // Blueprint Tab
    await expect(page.getByTestId("playground-tab-code")).toHaveText("Forms & Validation Blueprint");
    await expect(playground.getByText("// Production Forms & Validation Automation Blueprint")).toBeVisible();

    // Form Controls & Validation Strategies Properties Tab
    const propTab = page.getByTestId("playground-tab-properties");
    await expect(propTab).toContainText("Form Controls & Validation Strategies");
    await propTab.click();
    await expect(playground.getByText("toHaveValue(expected)", { exact: true })).toBeVisible();
    await expect(playground.getByText("toBeChecked()", { exact: true })).toBeVisible();
    await expect(playground.getByText("toBeDisabled()", { exact: true })).toBeVisible();
    await expect(playground.getByText("page.waitForResponse(predicate)", { exact: true })).toBeVisible();
    await expect(playground.getByText("pressSequentially(text, { delay })", { exact: true })).toBeVisible();

    // Robust vs Brittle Comparison Tab
    const compTab = page.getByTestId("playground-tab-comparison");
    await expect(compTab).toHaveText("Robust Form Testing vs Brittle Anti-Patterns");
    await compTab.click();
    await expect(playground.getByText("toHaveValue() vs toHaveText() on Form Controls", { exact: true })).toBeVisible();
    await expect(playground.getByText("Client-Side Instant Validation vs Server-Side Asynchronous Validation", { exact: true })).toBeVisible();
    await expect(playground.getByText("End-to-End API Integration vs Mocked HTTP 422 Error Ingestion", { exact: true })).toBeVisible();
  });

  test("Lesson 6 exercises section displays all 12 hands-on exercises and toggles hints/solutions", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-forms");

    const exercisesSection = page.getByTestId("hands-on-exercises-section");
    await expect(exercisesSection).toBeVisible();
    await expect(exercisesSection.getByText("12 Practical Hands-On Exercises")).toBeVisible();

    // Exercise 1 is open by default
    const ex1Card = page.getByTestId("exercise-card-ex1-submit-valid-form");
    await expect(ex1Card).toBeVisible();
    await expect(ex1Card).toContainText("Exercise 1: Submit a Valid Form and Verify Success State");

    // Exercise 2 toggle
    await page.getByTestId("toggle-exercise-btn-1").click();
    const ex2Card = page.getByTestId("exercise-card-ex2-empty-form-required-errors");
    await expect(ex2Card).toBeVisible();

    // Exercise 2 hint and solution
    await page.getByTestId("toggle-hint-ex2-empty-form-required-errors").click();
    await expect(ex2Card.getByText("Use page.locator('#track-error') to avoid strict mode collision")).toBeVisible();

    await page.getByTestId("toggle-solution-ex2-empty-form-required-errors").click();
    await expect(ex2Card.getByText("await page.getByRole(\"button\", { name: \"Submit intake\" }).click();")).toBeVisible();

    // Exercise 12 is available in the list
    await page.getByTestId("toggle-exercise-btn-11").click();
    const ex12Card = page.getByTestId("exercise-card-ex12-senior-form-challenge");
    await expect(ex12Card).toBeVisible();
    await expect(ex12Card).toContainText("Exercise 12: Complete a Senior-Level Form Testing Challenge");
  });

  test("Lesson 6 knowledge check assesses questions across tiers and reveals comprehensive explanations", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-forms");

    // Beginner Question (kc-forms-value-vs-text: option 1)
    const q1Card = page.getByTestId("quiz-question-kc-forms-value-vs-text");
    await expect(q1Card).toBeVisible();
    await page.getByTestId("option-kc-forms-value-vs-text-1").click();
    await page.getByTestId("submit-answer-btn-kc-forms-value-vs-text").click();
    await expect(page.getByTestId("explanation-kc-forms-value-vs-text")).toBeVisible();
    await expect(q1Card.getByText("Correct", { exact: true })).toBeVisible();

    // Intermediate Question (kc-forms-server-422: option 1)
    const q5Card = page.getByTestId("quiz-question-kc-forms-server-422");
    await expect(q5Card).toBeVisible();
    await page.getByTestId("option-kc-forms-server-422-1").click();
    await page.getByTestId("submit-answer-btn-kc-forms-server-422").click();
    await expect(page.getByTestId("explanation-kc-forms-server-422")).toBeVisible();
    await expect(q5Card.getByText("Correct", { exact: true })).toBeVisible();

    // Advanced Question (kc-forms-bva-strategy: option 1)
    const q7Card = page.getByTestId("quiz-question-kc-forms-bva-strategy");
    await expect(q7Card).toBeVisible();
    await page.getByTestId("option-kc-forms-bva-strategy-1").click();
    await page.getByTestId("submit-answer-btn-kc-forms-bva-strategy").click();
    await expect(page.getByTestId("explanation-kc-forms-bva-strategy")).toBeVisible();
    await expect(q7Card.getByText("Correct", { exact: true })).toBeVisible();
  });

  test("navigates seamlessly between Lesson 5 and Lesson 6 using Next and Previous buttons", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-actions");

    const nextBtn = page.getByTestId("next-lesson-btn");
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Navigates to playwright-forms
    await expect(page).toHaveURL(/.*\/learn\/playwright\/playwright-forms/);
    await expect(page.getByTestId("lesson-title")).toHaveText("Playwright Forms and Validation — Beginner to Advanced");

    // Click previous
    const prevBtn = page.getByTestId("prev-lesson-btn");
    await expect(prevBtn).toBeVisible();
    await prevBtn.click();

    await expect(page).toHaveURL(/.*\/learn\/playwright\/playwright-actions/);
  });

  test("renders Lesson 7: Browser Contexts, Pages, Tabs, and Navigation with all Parts A-H sections and TOC links", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-browser-contexts");

    // Verify Title & Metadata
    await expect(page.getByTestId("lesson-title")).toHaveText("Browser Contexts, Pages, Tabs, and Navigation — Beginner to Advanced");
    await expect(page.getByTestId("lesson-difficulty-badge")).toHaveText("Intermediate");
    await expect(page.getByText("45 min read & practice")).toBeVisible();

    // Verify all 8 progressive sections (Parts A-H)
    await expect(page.locator("#browser-architecture-and-hierarchy")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Part A — Browser Architecture & Object Model" })).toBeVisible();

    await expect(page.locator("#browser-contexts-and-isolation")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Part B — Browser Contexts: Complete Test Isolation" })).toBeVisible();

    await expect(page.locator("#navigation-lifecycles-and-urls")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Part C — Navigation Lifecycles, Load States & baseURL" })).toBeVisible();

    await expect(page.locator("#pages-tabs-and-popups")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Part D — Multi-Page Coordination: Tabs, Windows & Popups" })).toBeVisible();

    await expect(page.locator("#cookies-and-browser-storage")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Part E — Cookies, Storage State & Security Best Practices" })).toBeVisible();

    await expect(page.locator("#authentication-and-session-workflows")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Part F — Multi-User Sessions & Protected Routes" })).toBeVisible();

    await expect(page.locator("#frames-and-nested-browsing")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Part G — Frames & Nested Browsing with frameLocator" })).toBeVisible();

    await expect(page.locator("#advanced-navigation-debugging")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Part H — Navigation Debugging, Timeouts & Diagnostics" })).toBeVisible();

    // Verify supplementary pedagogical components
    await expect(page.locator("#code-examples")).toBeVisible();
    await expect(page.locator("#common-pitfalls")).toBeVisible();
    await expect(page.getByTestId("config-playground-section")).toBeVisible();
    await expect(page.getByTestId("hands-on-exercises-section")).toBeVisible();
    await expect(page.getByTestId("knowledge-check-section")).toBeVisible();
    await expect(page.locator("#hands-on-practice")).toBeVisible();
    await expect(page.locator("#interview-qa")).toBeVisible();

    // Verify Table of Contents has Contexts & Navigation Matrix
    const toc = page.getByTestId("docs-toc");
    await expect(toc.getByText("Contexts & Navigation Matrix")).toBeVisible();
    await expect(toc.getByText("12 Hands-On Exercises")).toBeVisible();
  });

  test("Lesson 7 config playground toggles blueprint, context properties matrix, and multi-context comparison", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-browser-contexts");

    const playground = page.getByTestId("config-playground-section");
    await expect(playground.getByText("Playwright Contexts, Multi-Page & Navigation Architecture Matrix")).toBeVisible();

    // Blueprint Tab
    await expect(page.getByTestId("playground-tab-code")).toHaveText("Contexts & Navigation Blueprint");
    await expect(playground.getByText("// Production Multi-Context & Multi-Page Automation Blueprint")).toBeVisible();

    // Properties Tab
    const propTab = page.getByTestId("playground-tab-properties");
    await expect(propTab).toContainText("Contexts & Navigation Architecture");
    await propTab.click();
    await expect(playground.getByText("browser.newContext(options)", { exact: true })).toBeVisible();
    await expect(playground.getByText("context.newPage()", { exact: true })).toBeVisible();
    await expect(playground.getByText("page.waitForEvent('popup')", { exact: true })).toBeVisible();
    await expect(playground.getByText("page.frameLocator(selector)", { exact: true })).toBeVisible();
    await expect(playground.getByText("context.storageState({ path })", { exact: true })).toBeVisible();

    // Comparison Tab
    const compTab = page.getByTestId("playground-tab-comparison");
    await expect(compTab).toHaveText("Multi-Context & Navigation vs Brittle Anti-Patterns");
    await compTab.click();
    await expect(playground.getByText("browser.newContext() vs browser.newPage()").first()).toBeVisible();
    await expect(playground.getByText("page.waitForEvent('popup') Before Click vs After Click").first()).toBeVisible();
    await expect(playground.getByText("Declarative frameLocator() vs Imperative Frame Switching").first()).toBeVisible();
  });

  test("Lesson 7 exercises section displays all 12 hands-on exercises and toggles hints/solutions", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-browser-contexts");

    const exercisesSection = page.getByTestId("hands-on-exercises-section");
    await expect(exercisesSection).toBeVisible();
    await expect(exercisesSection.getByText("12 Practical Hands-On Exercises")).toBeVisible();

    // Exercise 1 is open by default
    const ex1Card = page.getByTestId("exercise-card-ex1-navigate-baseurl");
    await expect(ex1Card).toBeVisible();
    await expect(ex1Card).toContainText("Exercise 1: Navigate Using baseURL and Relative Path");

    // Exercise 2 toggle
    await page.getByTestId("toggle-exercise-btn-1").click();
    const ex2Card = page.getByTestId("exercise-card-ex2-assert-url-and-title");
    await expect(ex2Card).toBeVisible();

    // Exercise 2 hint and solution
    await page.getByTestId("toggle-hint-ex2-assert-url-and-title").click();
    await expect(ex2Card.getByText("Use expect(page).toHaveTitle(/Playwright Industrial Lab/)")).toBeVisible();

    await page.getByTestId("toggle-solution-ex2-assert-url-and-title").click();
    await expect(ex2Card.getByText("await page.goto(\"/practice/login\");")).toBeVisible();

    // Exercise 12 is available in the list
    await page.getByTestId("toggle-exercise-btn-11").click();
    const ex12Card = page.getByTestId("exercise-card-ex12-senior-multipage-challenge");
    await expect(ex12Card).toBeVisible();
    await expect(ex12Card).toContainText("Exercise 12: Complete a Senior-Level Multi-Page Workflow");
  });

  test("Lesson 7 knowledge check assesses questions across tiers and reveals comprehensive explanations", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-browser-contexts");

    // Beginner Question (kc-context-vs-page: option 1)
    const q1Card = page.getByTestId("quiz-question-kc-context-vs-page");
    await expect(q1Card).toBeVisible();
    await page.getByTestId("option-kc-context-vs-page-1").click();
    await page.getByTestId("submit-answer-btn-kc-context-vs-page").click();
    await expect(page.getByTestId("explanation-kc-context-vs-page")).toBeVisible();
    await expect(q1Card.getByText("Correct", { exact: true })).toBeVisible();

    // Intermediate Question (kc-popup-race-condition: option 1)
    const q2Card = page.getByTestId("quiz-question-kc-popup-race-condition");
    await expect(q2Card).toBeVisible();
    await page.getByTestId("option-kc-popup-race-condition-1").click();
    await page.getByTestId("submit-answer-btn-kc-popup-race-condition").click();
    await expect(page.getByTestId("explanation-kc-popup-race-condition")).toBeVisible();
    await expect(q2Card.getByText("Correct", { exact: true })).toBeVisible();

    // Advanced Question (kc-storagestate-security: option 1)
    const q6Card = page.getByTestId("quiz-question-kc-storagestate-security");
    await expect(q6Card).toBeVisible();
    await page.getByTestId("option-kc-storagestate-security-1").click();
    await page.getByTestId("submit-answer-btn-kc-storagestate-security").click();
    await expect(page.getByTestId("explanation-kc-storagestate-security")).toBeVisible();
    await expect(q6Card.getByText("Correct", { exact: true })).toBeVisible();
  });

  test("navigates seamlessly between Lesson 6 and Lesson 7 using Next and Previous buttons", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-forms");

    const nextBtn = page.getByTestId("next-lesson-btn");
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Navigates to playwright-browser-contexts
    await expect(page).toHaveURL(/.*\/learn\/playwright\/playwright-browser-contexts/);
    await expect(page.getByTestId("lesson-title")).toHaveText("Browser Contexts, Pages, Tabs, and Navigation — Beginner to Advanced");

    // Click previous
    const prevBtn = page.getByTestId("prev-lesson-btn");
    await expect(prevBtn).toBeVisible();
    await prevBtn.click();

    await expect(page).toHaveURL(/.*\/learn\/playwright\/playwright-forms/);
  });

  test("Lesson 8 renders complete API testing documentation with all 8 progressive parts", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-api-testing");

    // Header checks
    await expect(page.getByTestId("lesson-title")).toHaveText("Playwright API Testing — Beginner to Advanced");
    await expect(page.getByTestId("lesson-difficulty-badge")).toHaveText("Intermediate");
    await expect(page.getByText("45 min read & practice")).toBeVisible();

    // Section headers for Parts A-H
    await expect(page.locator("#overview")).toBeVisible();
    await expect(page.locator("#api-testing-fundamentals")).toBeVisible();
    await expect(page.locator("#apirequestcontext-architecture")).toBeVisible();
    await expect(page.locator("#response-assertions-and-schemas")).toBeVisible();
    await expect(page.locator("#crud-automation-and-data-lifecycles")).toBeVisible();
    await expect(page.locator("#authentication-and-rbac")).toBeVisible();
    await expect(page.locator("#negative-and-resilience-testing")).toBeVisible();
    await expect(page.locator("#hybrid-api-and-ui-integration")).toBeVisible();
    await expect(page.locator("#advanced-api-automation-patterns")).toBeVisible();
    await expect(page.locator("#code-examples")).toBeVisible();
    await expect(page.locator("#common-pitfalls")).toBeVisible();
    await expect(page.getByTestId("config-playground-section")).toBeVisible();
    await expect(page.getByTestId("hands-on-exercises-section")).toBeVisible();
    await expect(page.getByTestId("knowledge-check-section")).toBeVisible();
    await expect(page.locator("#hands-on-practice")).toBeVisible();
    await expect(page.locator("#interview-qa")).toBeVisible();

    // Verify Table of Contents has API Testing Matrix
    const toc = page.getByTestId("docs-toc");
    await expect(toc.getByText("API Testing Matrix")).toBeVisible();
    await expect(toc.getByText("12 Hands-On Exercises")).toBeVisible();
  });

  test("Lesson 8 config playground toggles blueprint, APIRequestContext methods matrix, and API testing comparison", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-api-testing");

    const playground = page.getByTestId("config-playground-section");
    await expect(playground.getByText("Playwright APIRequestContext & HTTP Testing Matrix")).toBeVisible();

    // Blueprint Tab
    await expect(page.getByTestId("playground-tab-code")).toHaveText("API Automation Blueprint");
    await expect(playground.getByText("// Production Playwright API Testing & Hybrid Automation Blueprint")).toBeVisible();

    // Properties Tab
    const propTab = page.getByTestId("playground-tab-properties");
    await expect(propTab).toContainText("APIRequestContext Methods & Options");
    await propTab.click();
    await expect(playground.getByText("request.get(url, options)", { exact: true })).toBeVisible();
    await expect(playground.getByText("request.post(url, options)", { exact: true })).toBeVisible();
    await expect(playground.getByText("request.put(url, options)", { exact: true })).toBeVisible();
    await expect(playground.getByText("request.delete(url, options)", { exact: true })).toBeVisible();
    await expect(playground.getByText("response.status()", { exact: true })).toBeVisible();
    await expect(playground.getByText("response.json()", { exact: true })).toBeVisible();

    // Comparison Tab
    const compTab = page.getByTestId("playground-tab-comparison");
    await expect(compTab).toHaveText("API Testing vs Brittle Anti-Patterns");
    await compTab.click();
    await expect(playground.getByText("API Test Latency vs Browser UI Test Latency").first()).toBeVisible();
    await expect(playground.getByText("Built-in 'request' Fixture vs 'page.request'").first()).toBeVisible();
    await expect(playground.getByText("API Precondition Seeding vs UI Form Precondition Seeding").first()).toBeVisible();
  });

  test("Lesson 8 exercises section displays all 12 hands-on exercises and toggles hints/solutions", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-api-testing");

    const exercisesSection = page.getByTestId("hands-on-exercises-section");
    await expect(exercisesSection).toBeVisible();
    await expect(exercisesSection.getByText("12 Practical Hands-On Exercises")).toBeVisible();

    // Exercise 1 is open by default
    const ex1Card = page.getByTestId("exercise-card-ex1-get-status-and-payload");
    await expect(ex1Card).toBeVisible();
    await expect(ex1Card).toContainText("Exercise 1: Send a GET Request and Validate Its Status and Body");

    // Exercise 2 toggle
    await page.getByTestId("toggle-exercise-btn-1").click();
    const ex2Card = page.getByTestId("exercise-card-ex2-post-json-body");
    await expect(ex2Card).toBeVisible();

    // Exercise 2 hint and solution
    await page.getByTestId("toggle-hint-ex2-post-json-body").click();
    await expect(ex2Card.getByText("Pass data: { fullName: 'Ada Lovelace'")).toBeVisible();

    await page.getByTestId("toggle-solution-ex2-post-json-body").click();
    await expect(ex2Card.getByText("await request.post(\"http://127.0.0.1:3001/api/lab/forms/intake\"")).toBeVisible();

    // Exercise 12 is available in the list
    await page.getByTestId("toggle-exercise-btn-11").click();
    const ex12Card = page.getByTestId("exercise-card-ex12-senior-api-ui-challenge");
    await expect(ex12Card).toBeVisible();
    await expect(ex12Card).toContainText("Exercise 12: Complete a Senior-Level API and UI Integration Challenge");
  });

  test("Lesson 8 knowledge check assesses questions across tiers and reveals comprehensive explanations", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-api-testing");

    // Beginner Question (kc-api-vs-ui-speed: option 1)
    const q1Card = page.getByTestId("quiz-question-kc-api-vs-ui-speed");
    await expect(q1Card).toBeVisible();
    await page.getByTestId("option-kc-api-vs-ui-speed-1").click();
    await page.getByTestId("submit-answer-btn-kc-api-vs-ui-speed").click();
    await expect(page.getByTestId("explanation-kc-api-vs-ui-speed")).toBeVisible();
    await expect(q1Card.getByText("Correct", { exact: true })).toBeVisible();

    // Intermediate Question (kc-status-401-vs-403: option 1)
    const q2Card = page.getByTestId("quiz-question-kc-status-401-vs-403");
    await expect(q2Card).toBeVisible();
    await page.getByTestId("option-kc-status-401-vs-403-1").click();
    await page.getByTestId("submit-answer-btn-kc-status-401-vs-403").click();
    await expect(page.getByTestId("explanation-kc-status-401-vs-403")).toBeVisible();
    await expect(q2Card.getByText("Correct", { exact: true })).toBeVisible();

    // Advanced Question (kc-test-data-leakage: option 1)
    const q6Card = page.getByTestId("quiz-question-kc-test-data-leakage");
    await expect(q6Card).toBeVisible();
    await page.getByTestId("option-kc-test-data-leakage-1").click();
    await page.getByTestId("submit-answer-btn-kc-test-data-leakage").click();
    await expect(page.getByTestId("explanation-kc-test-data-leakage")).toBeVisible();
    await expect(q6Card.getByText("Correct", { exact: true })).toBeVisible();
  });

  test("navigates seamlessly between Lesson 7 and Lesson 8 using Next and Previous buttons", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-browser-contexts");

    const nextBtn = page.getByTestId("next-lesson-btn");
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Navigates to playwright-api-testing
    await expect(page).toHaveURL(/.*\/learn\/playwright\/playwright-api-testing/);
    await expect(page.getByTestId("lesson-title")).toHaveText("Playwright API Testing — Beginner to Advanced");

    // Click previous
    const prevBtn = page.getByTestId("prev-lesson-btn");
    await expect(prevBtn).toBeVisible();
    await prevBtn.click();

    await expect(page).toHaveURL(/.*\/learn\/playwright\/playwright-browser-contexts/);
  });

  test("Lesson 9 renders complete network interception documentation with all Parts A-G sections and TOC links", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-network-interception");

    // Header checks
    await expect(page.getByTestId("lesson-title")).toHaveText("Playwright Network Interception and API Mocking — Beginner to Advanced");
    await expect(page.getByTestId("lesson-difficulty-badge")).toHaveText("Intermediate");
    await expect(page.getByText("45 min read & practice")).toBeVisible();

    // Section headers for Parts A-G
    await expect(page.locator("#overview")).toBeVisible();
    await expect(page.locator("#network-fundamentals")).toBeVisible();
    await expect(page.locator("#playwright-routing-apis")).toBeVisible();
    await expect(page.locator("#mocking-responses")).toBeVisible();
    await expect(page.locator("#request-inspection-modification")).toBeVisible();
    await expect(page.locator("#delays-races-failures")).toBeVisible();
    await expect(page.locator("#advanced-network-scenarios")).toBeVisible();
    await expect(page.locator("#network-debugging")).toBeVisible();
    await expect(page.locator("#code-examples")).toBeVisible();
    await expect(page.locator("#common-pitfalls")).toBeVisible();
    await expect(page.getByTestId("config-playground-section")).toBeVisible();
    await expect(page.getByTestId("hands-on-exercises-section")).toBeVisible();
    await expect(page.getByTestId("knowledge-check-section")).toBeVisible();
    await expect(page.locator("#hands-on-practice")).toBeVisible();
    await expect(page.locator("#interview-qa")).toBeVisible();

    // Verify Table of Contents has Network Mocking Matrix
    const toc = page.getByTestId("docs-toc");
    await expect(toc.getByText("Network Mocking Matrix")).toBeVisible();
    await expect(toc.getByText("12 Hands-On Exercises")).toBeVisible();
  });

  test("Lesson 9 config playground toggles blueprint, routing primitives matrix, and network mocking comparison", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-network-interception");

    const playground = page.getByTestId("config-playground-section");
    await expect(playground.getByText("Playwright Network Interception & API Mocking Matrix")).toBeVisible();

    // Blueprint Tab
    await expect(page.getByTestId("playground-tab-code")).toHaveText("Network Mocking Blueprint");
    await expect(playground.getByText("// Production Playwright Network Interception & Mocking Blueprint")).toBeVisible();

    // Properties Tab
    const propTab = page.getByTestId("playground-tab-properties");
    await expect(propTab).toContainText("Routing Primitives & Options");
    await propTab.click();
    await expect(playground.getByText("page.route(url, handler)", { exact: true })).toBeVisible();
    await expect(playground.getByText("browserContext.route(url, handler)", { exact: true })).toBeVisible();
    await expect(playground.getByText("route.fulfill(options)", { exact: true })).toBeVisible();
    await expect(playground.getByText("route.continue(options)", { exact: true })).toBeVisible();
    await expect(playground.getByText("route.abort(errorCode)", { exact: true })).toBeVisible();
    await expect(playground.getByText("route.fetch(options)", { exact: true })).toBeVisible();
    await expect(playground.getByText("page.unroute(url, [handler])", { exact: true })).toBeVisible();

    // Comparison Tab
    const compTab = page.getByTestId("playground-tab-comparison");
    await expect(compTab).toHaveText("Network Mocking vs Real Backend");
    await compTab.click();
    await expect(playground.getByText("Deterministic Mocking vs Live Backend Testing").first()).toBeVisible();
    await expect(playground.getByText("route.continue() vs route.fallback()").first()).toBeVisible();
    await expect(playground.getByText("route.fetch() vs Manual Mock Fixtures").first()).toBeVisible();
  });

  test("Lesson 9 exercises section displays all 12 hands-on exercises and toggles hints/solutions", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-network-interception");

    const exercisesSection = page.getByTestId("hands-on-exercises-section");
    await expect(exercisesSection).toBeVisible();
    await expect(exercisesSection.getByText("12 Practical Hands-On Exercises")).toBeVisible();

    // Exercise 1 is open by default
    const ex1Card = page.getByTestId("exercise-card-ex1-inspect-request-and-response");
    await expect(ex1Card).toBeVisible();
    await expect(ex1Card).toContainText("Exercise 1: Inspect an Outbound HTTP Request and Response");

    // Exercise 2 toggle
    await page.getByTestId("toggle-exercise-btn-1").click();
    const ex2Card = page.getByTestId("exercise-card-ex2-mock-json-response");
    await expect(ex2Card).toBeVisible();

    // Exercise 2 hint and solution
    await page.getByTestId("toggle-hint-ex2-mock-json-response").click();
    await expect(ex2Card.getByText("Pass body: JSON.stringify({ items: [{ id: 'MOCK-001'")).toBeVisible();

    await page.getByTestId("toggle-solution-ex2-mock-json-response").click();
    await expect(ex2Card.getByText("await page.route(\"**/api/lab/network/items*\", async (route) => {")).toBeVisible();

    // Exercise 12 is available in the list
    await page.getByTestId("toggle-exercise-btn-11").click();
    const ex12Card = page.getByTestId("exercise-card-ex12-senior-network-challenge");
    await expect(ex12Card).toBeVisible();
    await expect(ex12Card).toContainText("Exercise 12: Complete a Senior-Level Network Debugging and Restoration Challenge");
  });

  test("Lesson 9 knowledge check assesses questions across tiers and reveals comprehensive explanations", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-network-interception");

    // Beginner Question (kc-route-registration-timing: option 1)
    const q1Card = page.getByTestId("quiz-question-kc-route-registration-timing");
    await expect(q1Card).toBeVisible();
    await page.getByTestId("option-kc-route-registration-timing-1").click();
    await page.getByTestId("submit-answer-btn-kc-route-registration-timing").click();
    await expect(page.getByTestId("explanation-kc-route-registration-timing")).toBeVisible();
    await expect(q1Card.getByText("Correct", { exact: true })).toBeVisible();

    // Intermediate Question (kc-route-continue-vs-fallback: option 1)
    const q2Card = page.getByTestId("quiz-question-kc-route-continue-vs-fallback");
    await expect(q2Card).toBeVisible();
    await page.getByTestId("option-kc-route-continue-vs-fallback-1").click();
    await page.getByTestId("submit-answer-btn-kc-route-continue-vs-fallback").click();
    await expect(page.getByTestId("explanation-kc-route-continue-vs-fallback")).toBeVisible();
    await expect(q2Card.getByText("Correct", { exact: true })).toBeVisible();

    // Advanced Question (kc-over-mocking-risk: option 1)
    const q3Card = page.getByTestId("quiz-question-kc-over-mocking-risk");
    await expect(q3Card).toBeVisible();
    await page.getByTestId("option-kc-over-mocking-risk-1").click();
    await page.getByTestId("submit-answer-btn-kc-over-mocking-risk").click();
    await expect(page.getByTestId("explanation-kc-over-mocking-risk")).toBeVisible();
    await expect(q3Card.getByText("Correct", { exact: true })).toBeVisible();
  });

  test("navigates seamlessly between Lesson 8 and Lesson 9 using Next and Previous buttons", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-api-testing");

    const nextBtn = page.getByTestId("next-lesson-btn");
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Navigates to playwright-network-interception
    await expect(page).toHaveURL(/.*\/learn\/playwright\/playwright-network-interception/);
    await expect(page.getByTestId("lesson-title")).toHaveText("Playwright Network Interception and API Mocking — Beginner to Advanced");

    // Click previous
    const prevBtn = page.getByTestId("prev-lesson-btn");
    await expect(prevBtn).toBeVisible();
    await prevBtn.click();

    await expect(page).toHaveURL(/.*\/learn\/playwright\/playwright-api-testing/);
  });

  test("Lesson 10 renders complete fixtures and test data documentation with all Parts A-H sections and TOC links", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-fixtures-and-test-data");

    // Title and Metadata Badges
    await expect(page.getByTestId("lesson-title")).toHaveText("Playwright Fixtures, Hooks, and Test Data Management — Beginner to Advanced");
    await expect(page.getByTestId("lesson-difficulty-badge")).toHaveText("Senior SDET");
    await expect(page.getByText("50 min read & practice")).toBeVisible();

    // Verify all 8 Sections (Parts A-H)
    await expect(page.locator("#why-fixtures-matter")).toBeVisible();
    await expect(page.locator("#builtin-fixtures")).toBeVisible();
    await expect(page.locator("#hooks-deep-dive")).toBeVisible();
    await expect(page.locator("#custom-fixtures-architecture")).toBeVisible();
    await expect(page.locator("#test-data-management")).toBeVisible();
    await expect(page.locator("#auth-session-reuse")).toBeVisible();
    await expect(page.locator("#parallel-isolation")).toBeVisible();
    await expect(page.locator("#architecture-best-practices")).toBeVisible();

    // Verify Table of Contents has Fixtures & Test Data Matrix
    const toc = page.getByTestId("docs-toc");
    await expect(toc.getByText("Fixtures & Test Data Matrix")).toBeVisible();
    await expect(toc.getByText("12 Hands-On Exercises")).toBeVisible();
  });

  test("Lesson 10 config playground toggles blueprint, fixtures architecture matrix, and fixtures vs hooks comparison", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-fixtures-and-test-data");

    const section = page.getByTestId("config-playground-section");
    await expect(section).toBeVisible();

    // 1. Code Tab (default)
    const codeTab = page.getByTestId("playground-tab-code");
    await expect(codeTab).toHaveText(/Fixtures & Architecture Blueprint/);
    await expect(page.getByTestId("playground-code-content")).toContainText("workerNamespace:");
    await expect(page.getByTestId("playground-code-content")).toContainText("seededTestCourse:");

    // 2. Properties Matrix Tab
    const propsTab = page.getByTestId("playground-tab-properties");
    await expect(propsTab).toHaveText(/Fixtures & Hooks Architecture \(12\)/);
    await propsTab.click();
    await expect(page.getByTestId("playground-properties-content")).toBeVisible();
    await expect(page.getByText("test.extend()", { exact: true })).toBeVisible();
    await expect(page.getByText("await use(value)", { exact: true })).toBeVisible();
    await expect(page.getByText("scope: 'worker'", { exact: true })).toBeVisible();

    // 3. Comparison Tab
    const compTab = page.getByTestId("playground-tab-comparison");
    await expect(compTab).toHaveText(/Fixtures vs Hooks & Global State/);
    await compTab.click();
    await expect(page.getByTestId("playground-comparison-content")).toBeVisible();
    await expect(page.getByText("Lifecycle Encapsulation", { exact: true })).toBeVisible();
    await expect(page.getByText("Parallel Safety", { exact: true })).toBeVisible();
  });

  test("Lesson 10 exercises section displays all 12 hands-on exercises and toggles hints/solutions", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-fixtures-and-test-data");

    const exSection = page.getByTestId("hands-on-exercises-section");
    await expect(exSection).toBeVisible();
    await expect(exSection.getByText("12 Practical Hands-On Exercises")).toBeVisible();

    // Exercise 1 is open by default
    const ex1Card = page.getByTestId("exercise-card-ex1-builtin-fixtures");
    await expect(ex1Card).toBeVisible();
    await expect(ex1Card).toContainText("Exercise 1: Use Built-In Playwright Fixtures in an E2E Test");

    // Toggle Exercise 4 (index 3)
    await page.getByTestId("toggle-exercise-btn-3").click();
    const ex4Card = page.getByTestId("exercise-card-ex4-fixture-test-data-cleanup");
    await expect(ex4Card).toBeVisible();

    // Hint toggle
    const hintBtn = page.getByTestId("toggle-hint-ex4-fixture-test-data-cleanup");
    await expect(hintBtn).toBeVisible();
    await hintBtn.click();
    await expect(ex4Card.getByText("The fixture's teardown code runs automatically")).toBeVisible();

    // Solution toggle
    const solBtn = page.getByTestId("toggle-solution-ex4-fixture-test-data-cleanup");
    await expect(solBtn).toBeVisible();
    await solBtn.click();
    await expect(ex4Card.getByText("Exercise 4: Implement a fixture that provisions")).toBeVisible();
  });

  test("Lesson 10 knowledge check assesses questions across tiers and reveals comprehensive explanations", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-fixtures-and-test-data");

    // Beginner Question (kc-fixtures-purpose: option 1)
    const q1Card = page.getByTestId("quiz-question-kc-fixtures-purpose");
    await expect(q1Card).toBeVisible();
    await page.getByTestId("option-kc-fixtures-purpose-1").click();
    await page.getByTestId("submit-answer-btn-kc-fixtures-purpose").click();
    await expect(page.getByTestId("explanation-kc-fixtures-purpose")).toBeVisible();
    await expect(q1Card.getByText("Correct", { exact: true })).toBeVisible();

    // Intermediate Question (kc-worker-scoped-rules: option 1)
    const q2Card = page.getByTestId("quiz-question-kc-worker-scoped-rules");
    await expect(q2Card).toBeVisible();
    await page.getByTestId("option-kc-worker-scoped-rules-1").click();
    await page.getByTestId("submit-answer-btn-kc-worker-scoped-rules").click();
    await expect(page.getByTestId("explanation-kc-worker-scoped-rules")).toBeVisible();
    await expect(q2Card.getByText("Correct", { exact: true })).toBeVisible();

    // Advanced Question (kc-destructive-cleanup-antipattern: option 1)
    const q3Card = page.getByTestId("quiz-question-kc-destructive-cleanup-antipattern");
    await expect(q3Card).toBeVisible();
    await page.getByTestId("option-kc-destructive-cleanup-antipattern-1").click();
    await page.getByTestId("submit-answer-btn-kc-destructive-cleanup-antipattern").click();
    await expect(page.getByTestId("explanation-kc-destructive-cleanup-antipattern")).toBeVisible();
    await expect(q3Card.getByText("Correct", { exact: true })).toBeVisible();
  });

  test("navigates seamlessly between Lesson 9 and Lesson 10 using Next and Previous buttons", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-network-interception");

    const nextBtn = page.getByTestId("next-lesson-btn");
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Navigates to playwright-fixtures-and-test-data
    await expect(page).toHaveURL(/.*\/learn\/playwright\/playwright-fixtures-and-test-data/);
    await expect(page.getByTestId("lesson-title")).toHaveText("Playwright Fixtures, Hooks, and Test Data Management — Beginner to Advanced");

    // Click previous
    const prevBtn = page.getByTestId("prev-lesson-btn");
    await expect(prevBtn).toBeVisible();
    await prevBtn.click();

    await expect(page).toHaveURL(/.*\/learn\/playwright\/playwright-network-interception/);
  });

  test("renders Lesson 11: Playwright Page Object Model and Enterprise Test Architecture with all Parts A-G sections and TOC links", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-page-object-models");

    // Verify Title & Metadata
    await expect(page.getByTestId("lesson-title")).toHaveText("Playwright Page Object Model and Enterprise Test Architecture — Beginner to Advanced");
    await expect(page.getByTestId("lesson-difficulty-badge")).toHaveText("Senior SDET");
    await expect(page.getByText("55 min read & practice")).toBeVisible();

    // Verify all 7 progressive sections (Parts A-G)
    await expect(page.locator("#test-architecture-fundamentals")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Part A — Test Architecture Fundamentals & Separation of Intent" })).toBeVisible();

    await expect(page.locator("#pom-design-principles")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Part B — The Modern Playwright Page Object Model" })).toBeVisible();

    await expect(page.locator("#component-objects-composition")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Part C — Component Objects & Composition over Inheritance" })).toBeVisible();

    await expect(page.locator("#pom-with-fixtures")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Part D — Integrating Page Objects with Custom Test Fixtures" })).toBeVisible();

    await expect(page.locator("#architecture-patterns-comparison")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Part E — Architectural Patterns Comparison: POM vs. Alternatives" })).toBeVisible();

    await expect(page.locator("#enterprise-folder-structure")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Part F — Enterprise Test Automation Folder Structure" })).toBeVisible();

    await expect(page.locator("#advanced-maintainability")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Part G — Advanced Maintainability, Strict Typing & Multi-Role Workflows" })).toBeVisible();

    // Verify supplementary pedagogical components
    await expect(page.locator("#code-examples")).toBeVisible();
    await expect(page.locator("#common-pitfalls")).toBeVisible();
    await expect(page.getByTestId("config-playground-section")).toBeVisible();
    await expect(page.getByTestId("hands-on-exercises-section")).toBeVisible();
    await expect(page.getByTestId("knowledge-check-section")).toBeVisible();
    await expect(page.locator("#hands-on-practice")).toBeVisible();
    await expect(page.locator("#interview-qa")).toBeVisible();

    // Verify Table of Contents has POM & Architecture Matrix
    const toc = page.getByTestId("docs-toc");
    await expect(toc.getByText("POM & Architecture Matrix")).toBeVisible();
    await expect(toc.getByText("12 Hands-On Exercises")).toBeVisible();
  });

  test("Lesson 11 config playground toggles blueprint, 12 architecture options, and comparative matrices", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-page-object-models");

    const playground = page.getByTestId("config-playground-section");
    await expect(playground.getByText("Page Object Models & Architecture Playground")).toBeVisible();

    // Blueprint Tab
    await expect(page.getByTestId("playground-tab-code")).toHaveText("POM & Component Architecture Blueprint");
    await expect(page.getByTestId("playground-code-content")).toContainText("export abstract class BasePage");
    await expect(page.getByTestId("playground-code-content")).toContainText("export class PracticeLoginPage extends BasePage");

    // Architecture Options Tab (12 properties)
    const propTab = page.getByTestId("playground-tab-properties");
    await expect(propTab).toHaveText("POM Architecture & Design Options (12)");
    await propTab.click();
    await expect(page.getByTestId("playground-properties-content")).toBeVisible();
    await expect(playground.getByText("readonly page: Page", { exact: true })).toBeVisible();
    await expect(playground.getByText("readonly locator: Locator", { exact: true })).toBeVisible();
    await expect(playground.getByText("Composition vs Inheritance", { exact: true })).toBeVisible();
    await expect(playground.getByText("Single Responsibility", { exact: true })).toBeVisible();
    await expect(playground.getByText("Action Methods", { exact: true })).toBeVisible();
    await expect(playground.getByText("Assertion Placement", { exact: true })).toBeVisible();
    await expect(playground.getByText("Component Scoping", { exact: true })).toBeVisible();
    await expect(playground.getByText("Fixture Dependency Injection", { exact: true })).toBeVisible();
    await expect(playground.getByText("API Helper Integration", { exact: true })).toBeVisible();
    await expect(playground.getByText("Multi-Role Contexts", { exact: true })).toBeVisible();
    await expect(playground.getByText("Strict TypeScript Types", { exact: true })).toBeVisible();
    await expect(playground.getByText("Rule of Three", { exact: true })).toBeVisible();

    // Comparative Matrix Tab
    const compTab = page.getByTestId("playground-tab-comparison");
    await expect(compTab).toHaveText("POM vs Direct Locators vs Screenplay");
    await compTab.click();
    await expect(page.getByTestId("playground-comparison-content")).toBeVisible();
    await expect(playground.getByText("Selector Maintenance", { exact: true })).toBeVisible();
    await expect(playground.getByText("Test Readability", { exact: true })).toBeVisible();
    await expect(playground.getByText("Debugging Trace Analysis", { exact: true })).toBeVisible();
    await expect(playground.getByText("Reusability", { exact: true })).toBeVisible();
    await expect(playground.getByText("Test Execution Speed", { exact: true })).toBeVisible();
    await expect(playground.getByText("Code Volume", { exact: true })).toBeVisible();
  });

  test("Lesson 11 exercises section displays all 12 hands-on exercises and toggles hints/solutions", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-page-object-models");

    const exSection = page.getByTestId("hands-on-exercises-section");
    await expect(exSection).toBeVisible();
    await expect(exSection.getByText("12 Practical Hands-On Exercises")).toBeVisible();

    // Exercise 1 is open by default
    const ex1Card = page.getByTestId("exercise-card-ex1-direct-locators");
    await expect(ex1Card).toBeVisible();
    await expect(ex1Card).toContainText("Exercise 1: Write a Test Using Direct Locators (Baseline)");

    // Toggle Exercise 4 (index 3)
    await page.getByTestId("toggle-exercise-btn-3").click();
    const ex4Card = page.getByTestId("exercise-card-ex4-reusable-component-object");
    await expect(ex4Card).toBeVisible();

    // Hint toggle
    const hintBtn = page.getByTestId("toggle-hint-ex4-reusable-component-object");
    await expect(hintBtn).toBeVisible();
    await hintBtn.click();
    await expect(ex4Card.getByText("Scope dialog inputs inside")).toBeVisible();

    // Solution toggle
    const solBtn = page.getByTestId("toggle-solution-ex4-reusable-component-object");
    await expect(solBtn).toBeVisible();
    await solBtn.click();
    await expect(ex4Card.getByText("Exercise 4: Create and use a reusable CourseCreateDialogComponent")).toBeVisible();
  });

  test("Lesson 11 knowledge check assesses questions across tiers and reveals comprehensive explanations", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-page-object-models");

    // Beginner Question (kc-pom-purpose: option 1)
    const q1Card = page.getByTestId("quiz-question-kc-pom-purpose");
    await expect(q1Card).toBeVisible();
    await page.getByTestId("option-kc-pom-purpose-1").click();
    await page.getByTestId("submit-answer-btn-kc-pom-purpose").click();
    await expect(page.getByTestId("explanation-kc-pom-purpose")).toBeVisible();
    await expect(q1Card.getByText("Correct", { exact: true })).toBeVisible();

    // Intermediate Question (kc-composition-vs-inheritance: option 1)
    const q2Card = page.getByTestId("quiz-question-kc-composition-vs-inheritance");
    await expect(q2Card).toBeVisible();
    await page.getByTestId("option-kc-composition-vs-inheritance-1").click();
    await page.getByTestId("submit-answer-btn-kc-composition-vs-inheritance").click();
    await expect(page.getByTestId("explanation-kc-composition-vs-inheritance")).toBeVisible();
    await expect(q2Card.getByText("Correct", { exact: true })).toBeVisible();

    // Advanced Question (kc-assertion-placement: option 1)
    const q3Card = page.getByTestId("quiz-question-kc-assertion-placement");
    await expect(q3Card).toBeVisible();
    await page.getByTestId("option-kc-assertion-placement-1").click();
    await page.getByTestId("submit-answer-btn-kc-assertion-placement").click();
    await expect(page.getByTestId("explanation-kc-assertion-placement")).toBeVisible();
    await expect(q3Card.getByText("Correct", { exact: true })).toBeVisible();
  });

  test("navigates seamlessly between Lesson 10 and Lesson 11 using Next and Previous buttons", async ({ page }) => {
    await page.goto("/learn/playwright/playwright-fixtures-and-test-data");

    const nextBtn = page.getByTestId("next-lesson-btn");
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Navigates to playwright-page-object-models
    await expect(page).toHaveURL(/.*\/learn\/playwright\/playwright-page-object-models/);
    await expect(page.getByTestId("lesson-title")).toHaveText("Playwright Page Object Model and Enterprise Test Architecture — Beginner to Advanced");

    // Click previous
    const prevBtn = page.getByTestId("prev-lesson-btn");
    await expect(prevBtn).toBeVisible();
    await prevBtn.click();

    await expect(page).toHaveURL(/.*\/learn\/playwright\/playwright-fixtures-and-test-data/);
  });
});



