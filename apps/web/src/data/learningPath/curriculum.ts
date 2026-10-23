import type { CurriculumModule, Lesson } from "./types";

export const curriculumModules: CurriculumModule[] = [
  {
    slug: "getting-started",
    title: "1. Foundation & Test Architecture",
    description: "Initialize Playwright, understand the browser process architecture, and author your first resilient web tests.",
    iconName: "Terminal",
    lessons: [
      {
        id: "playwright-introduction",
        moduleSlug: "getting-started",
        moduleTitle: "Foundation & Test Architecture",
        title: "Your First Playwright Test",
        difficulty: "Beginner",
        durationMinutes: 20,
        prerequisites: [
          "Node.js 18+ LTS runtime installed and verified",
          "Foundational TypeScript or JavaScript (async/await, ES modules, Promises)",
          "Basic understanding of web technologies (HTML DOM, CSS selectors, accessible roles)"
        ],
        summary: "Master your first resilient end-to-end test using @playwright/test. Understand the browser process model, isolated BrowserContext and Page fixtures, auto-waiting actions, web-first assertions, command-line test discovery, and failure diagnostics against the Practice Login lab.",
        sections: [
          {
            id: "architecture-overview",
            title: "Playwright Test Runner vs. Raw Browser Automation",
            content: `Modern web automation requires a fundamental distinction between raw browser automation drivers and purpose-built test runners.

Raw automation libraries (such as Puppeteer, Selenium WebDriver, or the bare 'playwright' library package) are low-level driver APIs. They provide commands to launch a browser, navigate to a URL, and click coordinates. However, raw automation provides zero test runner capabilities: you must manually manage browser lifecycles (calling browser.launch() and context.close()), implement custom worker concurrency, write custom polling wait loops, and glue together external test frameworks (such as Jest, Mocha, or Chai).

In stark contrast, @playwright/test is a full-featured, enterprise-grade test automation platform designed specifically for modern dynamic web applications:
- Direct WebSocket DevTools Protocol: Communicates directly with browser engines (Chromium, Firefox, WebKit) over a single persistent WebSocket connection, eliminating HTTP proxy latency and driver executables (such as chromedriver).
- Ephemeral BrowserContext Isolation: Launches completely isolated browser contexts (similar to private Incognito profiles) in single-digit milliseconds, guaranteeing zero cross-test cookie, localStorage, or cache pollution without the heavyweight cost of launching a new browser process for every test.
- Native Actionability Engine: Automatically inspects elements for actionable states (attached, visible, stable, enabled, and editable) before dispatching clicks or keystrokes, eliminating arbitrary sleep hacks.
- Built-in Artifact Capture: Automatically records rich execution traces (trace.zip), DOM snapshots, network HAR logs, screenshots, and videos on test failure.`
          },
          {
            id: "test-expect-page-fixtures",
            title: "The Roles of test(), expect(), and the page Fixture",
            content: `A Playwright test file is composed of three foundational building blocks provided by the '@playwright/test' package:

1. The test() Declaration Block:
The test(title, testFunction) function defines the asynchronous boundary of an individual test case. It manages test lifecycle, timeout timers (default: 30,000ms), retry policies, and worker thread assignment. Tests can be grouped into logical suites using test.describe(name, fn) and configured with test hooks such as test.beforeEach() and test.afterEach().

2. The page Fixture:
Playwright utilizes a powerful Dependency Injection system known as Fixtures. When your test function declares async ({ page }) => { ... }, Playwright automatically launches a dedicated BrowserContext and creates a fresh Page instance specifically for that test.
The 'page' object provides high-level user simulation methods:
- page.goto(url): Navigates to a relative or absolute URL, automatically resolving against the configured baseURL.
- page.getByRole(role, options): Queries the accessibility tree for semantic UI elements (such as buttons, headings, and textboxes).
- page.getByLabel(text): Locates form controls associated with semantic <label> elements.
- locator.fill(value): Clears the input field and enters text keystrokes with pre-action validation.
- locator.click(): Dispatches a real mouse click after verifying actionability criteria.

3. The expect() Web-First Assertion Engine:
Unlike traditional synchronous assertion libraries (which fail instantly if an element is not immediately present at that exact CPU tick), Playwright's expect() matchers are asynchronous and web-first:
await expect(locator).toBeVisible();
Playwright continuously re-evaluates the condition against the live DOM until the matcher passes or the assertion timeout (default: 5,000ms) elapses. This auto-waiting assertion loop is the secret to zero-flakiness in dynamic single-page applications.`
          },
          {
            id: "terminal-execution",
            title: "Executing Tests from the Terminal",
            content: `Playwright Test provides a comprehensive Command-Line Interface (CLI) to run, filter, and debug test suites efficiently:

- Run all tests across all configured browser projects:
  npx playwright test

- Run a specific test file:
  npx playwright test e2e/practice-first-test.spec.ts

- Run tests targeting a specific browser engine (e.g. Chromium, Firefox, WebKit):
  npx playwright test e2e/practice-first-test.spec.ts --project=chromium

- Run tests in Headed mode (opens a visible browser window):
  npx playwright test e2e/practice-first-test.spec.ts --headed

- Run tests with Title Pattern filtering (-g or --grep):
  npx playwright test -g "verifies Practice Login"

- Interactive UI Mode (Playwright's flagship developer experience):
  npx playwright test --ui
  UI Mode provides an interactive visual dashboard with time-travel step inspection, DOM snapshots before and after every action, live locator picker, and instant test re-execution on file save.

- Open the interactive HTML test report:
  npx playwright show-report`
          },
          {
            id: "test-discovery-rules",
            title: "How Playwright Discovers Test Files",
            content: `When you invoke 'npx playwright test', the test runner automatically discovers and executes test files based on the project configuration:

1. The testDir Root:
The test discovery root is defined in 'playwright.config.ts' via the testDir property (in this repository, configured as './e2e'). Playwright recursively traverses this directory.

2. Matching File Patterns:
By default, Playwright searches for files matching the regular expression:
.*(test|spec)\\.(ts|js|mjs)
Standard industry convention is to name test files with the '.spec.ts' extension (e.g. 'practice-login.spec.ts', 'auth.spec.ts', 'widgets.spec.ts').

3. Ignoring Non-Test Files:
Playwright automatically ignores files inside 'node_modules', build output directories (such as 'dist' or 'build'), and helper utility files that do not match the spec naming pattern.

4. Multi-Project Matrix:
In 'playwright.config.ts', the 'projects' array defines browser configurations, device viewports, and setup dependencies (such as 'auth.setup.ts'). Playwright maps discovered test files across each enabled project.`
          },
          {
            id: "assertion-diagnostics",
            title: "Interpreting Passing & Failing Assertion Diagnostics",
            content: `Understanding Playwright's terminal diagnostics is essential for rapid debugging:

Passing Output Interpretation:
When a test passes, Playwright outputs:
  ok 1 [chromium] › e2e/practice-first-test.spec.ts:4:7 › verifies Practice Login portal heading and form elements (1.2s)
  1 passed (2.1s)
- 'ok 1 [chromium]': Indicates worker 1 succeeded on the Chromium engine.
- '1.2s': Exact wall-clock time spent inside the test function.
- '1 passed (2.1s)': Total elapsed time including browser launch and context teardown.

Failing Assertion Anatomy:
When an assertion fails, Playwright prints a structured diagnostic report:
1. Expected vs. Received Difference:
   Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
   Locator: getByRole('heading', { name: 'Practice Login Portal' })
   Expected: visible
   Received: <element(s) not found>
2. Actionability Call Log:
   Playwright displays the exact sequence of attempts during the 5,000ms polling window:
   - locator._expect with timeout 5000ms
   - waiting for getByRole('heading', { name: 'Practice Login Portal' })
3. Code Snippet Frame:
   Points directly to the file, line number, and column where execution halted.
4. Generated Debug Artifacts:
   Playwright automatically saves failure screenshots and traces to 'test-results/'. You can inspect the complete execution trace using:
   npx playwright show-trace test-results/.../trace.zip`
          }
        ],
        codeExamples: [
          {
            id: "first-test",
            caption: "Complete First Playwright Test (e2e/practice-first-test.spec.ts)",
            language: "typescript",
            code: `import { test, expect } from "@playwright/test";

test("verifies Practice Login portal heading and form elements", async ({ page }) => {
  // 1. Navigate to target practice page using relative path
  await page.goto("/practice/login");

  // 2. Locate stable page heading using accessible role
  const portalHeading = page.getByRole("heading", { name: "Practice Login Portal" });
  await expect(portalHeading).toBeVisible();

  // 3. Locate inputs via accessible labels and verify visibility
  const usernameInput = page.getByLabel("Practice Username");
  await expect(usernameInput).toBeVisible();

  const passwordInput = page.getByLabel("Practice Password");
  await expect(passwordInput).toBeVisible();

  // 4. Locate submit button using accessible role and name
  const submitButton = page.getByRole("button", { name: "Sign In to Practice Portal" });
  await expect(submitButton).toBeVisible();
});`,
            lineExplanations: [
              { line: 1, explanation: "Import test and expect primitives from the official @playwright/test package." },
              { line: 3, explanation: "Declare an asynchronous test case; destructure the isolated 'page' fixture from the test runner." },
              { line: 5, explanation: "Navigate to '/practice/login'. Playwright automatically prepends the baseURL defined in playwright.config.ts." },
              { line: 8, explanation: "Query the DOM using semantic getByRole with accessible name instead of fragile CSS selectors." },
              { line: 9, explanation: "Web-first assertion: continuously polls until heading is attached, visible, and stable in the DOM." },
              { line: 12, explanation: "Locate form input by its associated <label> text; remains resilient even if input IDs or classes change." },
              { line: 13, explanation: "Assert that the username input control is rendered and visible to the learner." },
              { line: 15, explanation: "Locate password input by its accessible label text." },
              { line: 16, explanation: "Assert visibility of password input before any interaction occurs." },
              { line: 19, explanation: "Query submit button by its semantic HTML button role and visible accessible text." },
              { line: 20, explanation: "Assert that the submit button is visible and ready for user interaction." }
            ]
          }
        ],
        commonMistakes: [
          {
            title: "Forgetting 'await' on asynchronous actions or assertions",
            badPractice: `expect(page.getByRole("heading")).toBeVisible();`,
            goodPractice: `await expect(page.getByRole("heading")).toBeVisible();`,
            explanation: "In Playwright, all page interactions and web-first assertions return Promises. Omitting 'await' causes the test to proceed prematurely without waiting for the assertion to complete, leading to unhandled promise rejections and false-positive test results."
          },
          {
            title: "Using arbitrary sleeps (waitForTimeout) instead of web-first assertions",
            badPractice: `await page.waitForTimeout(3000);\nexpect(await page.title()).toBe("Dashboard");`,
            goodPractice: `await expect(page).toHaveTitle(/Dashboard/);`,
            explanation: "waitForTimeout causes slow, brittle tests. On fast machines, it wastes unnecessary seconds; on slow CI servers, 3000ms may still be too brief. Playwright's web-first assertions poll automatically with condition-based auto-waiting."
          },
          {
            title: "Using brittle CSS selectors instead of accessible user-facing locators",
            badPractice: `await page.locator("div > form > div:nth-child(2) > input.form-control").fill("student");`,
            goodPractice: `await page.getByLabel("Practice Username").fill("student");`,
            explanation: "Structural CSS selectors and class names break whenever UI components are refactored or styled. Accessible locators (getByRole, getByLabel) mimic real user perception and test the accessibility of your application."
          },
          {
            title: "Hardcoding localhost URLs instead of relative paths with baseURL",
            badPractice: `await page.goto("http://localhost:5173/practice/login");`,
            goodPractice: `await page.goto("/practice/login");`,
            explanation: "Hardcoding localhost hostnames and ports breaks tests in CI pipelines, Docker containers, and staging preview deployments. Always configure 'baseURL' in playwright.config.ts and navigate with relative paths."
          }
        ],
        practiceTask: {
          labRoute: "/practice/login",
          labName: "Practice Login Lab",
          objective: "Navigate to the Practice Login portal, verify that the main page heading is visible, locate form inputs using accessible labels, and execute the test from your terminal.",
          instructions: [
            "Open your terminal in the repository root directory.",
            "Inspect or create your practice spec file at e2e/practice-first-test.spec.ts.",
            "Import 'test' and 'expect' from '@playwright/test'.",
            "Inside the test block, navigate to the Practice Login route using await page.goto('/practice/login').",
            "Locate the main portal heading using page.getByRole('heading', { name: 'Practice Login Portal' }) and assert it is visible.",
            "Locate the username and password fields using page.getByLabel('Practice Username') and page.getByLabel('Practice Password') and assert their visibility.",
            "Locate the submit button with page.getByRole('button', { name: 'Sign In to Practice Portal' }) and assert it is visible.",
            "Run your test from the terminal using the documented command and inspect the passing result."
          ],
          acceptanceCriteria: [
            "Test imports 'test' and 'expect' from '@playwright/test'.",
            "Navigation uses relative URL '/practice/login' resolving against baseURL.",
            "Heading is located using semantic getByRole('heading', { name: 'Practice Login Portal' }).",
            "Form inputs are located using semantic getByLabel() locators.",
            "All assertions use asynchronous 'await expect(...).toBeVisible()'.",
            "Test runs cleanly and passes via 'npx playwright test e2e/practice-first-test.spec.ts --project=chromium'."
          ],
          hint: "On /practice/login, the main title is an <h1> with the exact text 'Practice Login Portal'. Use page.getByRole('heading', { name: 'Practice Login Portal' }). Form inputs have labels 'Practice Username' and 'Practice Password'.",
          starterCode: `import { test, expect } from "@playwright/test";

test("verifies Practice Login portal heading and form elements", async ({ page }) => {
  // Step 1: Navigate to the Practice Login portal
  // TODO: await page.goto("/practice/login");

  // Step 2: Locate the portal heading using accessible role
  // const portalHeading = page.getByRole("heading", { name: "Practice Login Portal" });
  // TODO: assert portalHeading is visible

  // Step 3: Locate input fields using accessible labels
  // const usernameInput = page.getByLabel("Practice Username");
  // TODO: assert usernameInput is visible

  // Step 4: Locate submit button using accessible role and name
  // const submitButton = page.getByRole("button", { name: "Sign In to Practice Portal" });
  // TODO: assert submitButton is visible
});`,
          solutionCode: `import { test, expect } from "@playwright/test";

test("verifies Practice Login portal heading and form elements", async ({ page }) => {
  // 1. Navigate to the verified Practice Login route
  await page.goto("/practice/login");

  // 2. Locate the stable page heading using accessible role
  const portalHeading = page.getByRole("heading", { name: "Practice Login Portal" });
  await expect(portalHeading).toBeVisible();

  // 3. Locate input fields using accessible label text
  const usernameInput = page.getByLabel("Practice Username");
  await expect(usernameInput).toBeVisible();

  const passwordInput = page.getByLabel("Practice Password");
  await expect(passwordInput).toBeVisible();

  // 4. Locate the submit button using accessible role and name
  const submitButton = page.getByRole("button", { name: "Sign In to Practice Portal" });
  await expect(submitButton).toBeVisible();
});`,
          playwrightCommand: "npx playwright test e2e/practice-first-test.spec.ts --project=chromium",
          outputInterpretation: `=== PASSING TEST OUTPUT ===
Running 2 tests using 1 worker
  ok 1 [setup] › e2e/auth.setup.ts:7:6 › prepare auth storage states (1.4s)
  ok 2 [chromium] › e2e/practice-first-test.spec.ts:4:7 › First Playwright Test Practice › verifies Practice Login portal heading and form elements (1.2s)
  2 passed (4.7s)

Output Interpretation:
- 'ok 2 [chromium]': The test worker launched Chromium, created a sterile BrowserContext, and executed the test asynchronously.
- Duration (1.2s): Confirms sub-millisecond protocol communication over WebSocket DevTools without HTTP wire overhead.
- All 4 visibility assertions passed: 'Practice Login Portal' heading, 'Practice Username', 'Practice Password', and 'Sign In' button were attached, visible, and stable.

=== INTENTIONAL FAILURE DIAGNOSTIC (If heading text is misspelled) ===
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
Locator: getByRole('heading', { name: 'Wrong Heading' })
Expected: visible
Received: <element(s) not found>
Call log:
  - locator._expect with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Wrong Heading' })

Diagnostic Interpretation:
- Playwright continuously retried searching the DOM for 5,000ms before timing out.
- The Call Log pinpoints the exact selector that failed and records a failure trace in 'test-results/'.`
        },
        interviewQuestions: [
          {
            question: "How does Playwright's architecture differ from Selenium WebDriver?",
            answer: "Selenium WebDriver uses an HTTP REST protocol (W3C WebDriver / JSON Wire) where each command is an individual HTTP request sent to a standalone driver binary (e.g. chromedriver). Playwright communicates directly with browser engines over a single persistent bidirectional WebSocket connection. This enables atomic auto-waiting, network route interception, and multi-context emulation without driver intermediaries.",
            architecturalContext: "Enables sub-millisecond execution speeds, eliminates stale element reference exceptions, and supports multi-page/multi-tab synchronization out of the box."
          },
          {
            question: "Why does Playwright recommend Web-First Assertions (await expect(locator)...) over synchronous matchers?",
            answer: "Synchronous assertions (such as expect(await locator.isVisible()).toBe(true)) evaluate the DOM at a single microsecond in time. If an element is rendering asynchronously or mid-animation, the assertion fails immediately. Playwright's web-first assertions (await expect(locator).toBeVisible()) poll the live DOM continuously until the condition is met or the timeout expires, automatically generating actionable call logs and trace snapshots.",
            architecturalContext: "Eliminates arbitrary sleep hacks (page.waitForTimeout) and delivers deterministic, flakiness-free test execution across varied CI environments."
          },
          {
            question: "What is a BrowserContext in Playwright, and why is it superior to launching new browser processes?",
            answer: "A BrowserContext is an isolated in-memory browser session, fully equivalent to an Incognito window. It has completely separated cookies, localStorage, session storage, and cache. Creating a BrowserContext takes 2 to 5 milliseconds and consumes negligible memory, whereas launching a new Browser process takes seconds and significant system RAM.",
            architecturalContext: "Enables Playwright to run hundreds of fully isolated tests concurrently on a single machine without test pollution or memory exhaustion."
          },
          {
            question: "Why are ElementHandle and the '$ / $$' methods discouraged in modern Playwright test suites?",
            answer: "An ElementHandle points to a specific in-memory DOM node reference. If the application re-renders or updates the DOM, the handle becomes stale and throws a 'Node is detached from document' error. In contrast, Playwright's Locator is a lazy, auto-re-querying descriptor. Every time an action or assertion is performed on a Locator, Playwright re-queries the live DOM and executes actionability checks.",
            architecturalContext: "Locators are strict by default (throwing an error if multiple elements match) and provide complete resilience against single-page application hydration and re-renders."
          }
        ]
      },
      {
        id: "configuration-and-browsers",
        moduleSlug: "getting-started",
        moduleTitle: "Foundation & Test Architecture",
        title: "Configuration Matrix, Projects & CI Reporters",
        difficulty: "Intermediate",
        durationMinutes: 20,
        prerequisites: ["playwright-introduction"],
        summary: "Configure multi-browser execution across Chromium, Firefox, WebKit, and Mobile Chrome devices with retries, workers, and trace capture.",
        sections: [
          {
            id: "configuration-deep-dive",
            title: "Multi-Project Matrix",
            content: "Playwright configuration allows defining multiple browser profiles under `projects`. Each project can configure custom viewport resolutions, device descriptors (`devices['Pixel 7']`), geolocation, permissions, and dependencies like authentication setup routines."
          },
          {
            id: "trace-recording-policies",
            title: "Trace & Video Capture Strategy",
            content: "Running tests with `trace: 'retain-on-failure'` generates comprehensive `.zip` archives containing full DOM snapshots, network payloads, console logs, and action timings only when a test fails, preventing storage bloat on CI systems."
          }
        ],
        codeExamples: [
          {
            id: "config-example",
            caption: "Industrial Playwright Configuration (playwright.config.ts)",
            language: "typescript",
            code: `import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /.*\\.setup\\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      dependencies: ["setup"],
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      dependencies: ["setup"],
    },
  ],
});`,
            lineExplanations: [
              { line: 5, explanation: "fullyParallel runs tests in all files concurrently across worker processes." },
              { line: 6, explanation: "Flaky test retry policy: automatically retries up to 2 times on CI." },
              { line: 11, explanation: "trace: retain-on-failure preserves traces only when tests fail to optimize disk space." },
              { line: 17, explanation: "Defines the global setup dependency that generates reusable auth storage states." }
            ]
          }
        ],
        commonMistakes: [
          {
            title: "Enabling trace: 'on' globally in large test suites",
            badPractice: `use: { trace: 'on', video: 'on' }`,
            goodPractice: `use: { trace: 'retain-on-failure', video: 'retain-on-failure' }`,
            explanation: "Unconditionally recording traces and videos for hundreds of passing tests slows down execution by 40% and exhausts CI runner disk space."
          }
        ],
        practiceTask: {
          labRoute: "/lab/browser",
          labName: "Browser Lab",
          objective: "Inspect responsive viewports and test device layouts dynamically using page.setViewportSize().",
          instructions: [
            "Navigate to /lab/browser.",
            "Set desktop viewport resolution to 1280x800 and assert desktop navigation elements are visible.",
            "Reconfigure viewport to mobile dimensions (375x667) and verify mobile hamburger menu appears."
          ],
          acceptanceCriteria: [
            "Viewport adapts without reloading page.",
            "Desktop and mobile navigation elements are validated respectively."
          ],
          hint: "Use page.setViewportSize({ width: 375, height: 667 }) to simulate mobile devices on the fly.",
          solutionCode: `import { test, expect } from "@playwright/test";

test("adapts layout across desktop and mobile viewports", async ({ page }) => {
  await page.goto("/lab/browser");
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.getByTestId("desktop-nav-links")).toBeVisible();

  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.getByTestId("mobile-hamburger-btn")).toBeVisible();
});`,
          playwrightCommand: "npx playwright test e2e/browser.spec.ts -g 'responsive viewport'"
        },
        interviewQuestions: [
          {
            question: "What is the difference between a Playwright Worker and a BrowserContext?",
            answer: "A Worker is a separate Node.js OS process that executes test files in parallel. Each Worker instantiates its own browser process or reuses one. Within a Worker, every test runs in a brand new, isolated BrowserContext (a lightweight in-memory incognito profile). Multiple tests in the same worker never share cookies, localStorage, or session state.",
            architecturalContext: "Ensures complete test isolation without the immense memory overhead of launching separate browser processes for every single test."
          }
        ]
      }
    ]
  },
  {
    slug: "locators-and-selectors",
    title: "2. Modern Semantic Locators & Strict Mode",
    description: "Master Playwright's accessible locator hierarchy, strict mode resolution, and resilient container filtering.",
    iconName: "ScanSearch",
    lessons: [
      {
        id: "semantic-locators-hierarchy",
        moduleSlug: "locators-and-selectors",
        moduleTitle: "Modern Semantic Locators & Strict Mode",
        title: "The Accessible Locator Hierarchy",
        difficulty: "Beginner",
        durationMinutes: 20,
        prerequisites: ["playwright-introduction"],
        summary: "Replace brittle CSS and XPath selectors with user-facing, accessible semantic queries based on W3C accessibility trees.",
        sections: [
          {
            id: "priority-tiering",
            title: "Locator Priority Tiering",
            content: "Playwright prioritizes locators that reflect how actual users and assistive technologies perceive the interface: 1. `page.getByRole()` (Role & accessible name), 2. `page.getByLabel()` (Form controls), 3. `page.getByPlaceholder()`, 4. `page.getByText()`, and 5. `page.getByTestId()` for dynamic components without semantic HTML."
          },
          {
            id: "why-avoid-xpath",
            title: "Why Production Suites Avoid Brittle CSS / XPath",
            content: "Selectors like `div > div.btn-wrapper:nth-child(2) > button` break immediately upon minor UI redesigns, Tailwind utility refactoring, or DOM restructuring. Semantic locators survive CSS rewrites because they bind to element semantics and ARIA labels."
          }
        ],
        codeExamples: [
          {
            id: "locator-examples",
            caption: "Semantic Locator Tiering in Action",
            language: "typescript",
            code: `// Priority 1: Accessible role + name
await page.getByRole("button", { name: "Submit Order" }).click();

// Priority 2: Associated label
await page.getByLabel("Work Email").fill("sdet@enterprise.com");

// Priority 3: Non-interactive text search
await expect(page.getByText("Account successfully created")).toBeVisible();

// Priority 4: Test ID when accessibility markup is insufficient
await page.getByTestId("course-card-enr-101").click();`,
            lineExplanations: [
              { line: 2, explanation: "Inspects accessibility tree for element with role='button' and accessible name matching 'Submit Order'." },
              { line: 5, explanation: "Resolves <input> linked to <label> via htmlFor/id or nested containment." },
              { line: 8, explanation: "Searches text node contents with auto-waiting for visibility." }
            ]
          }
        ],
        commonMistakes: [
          {
            title: "Using brittle CSS positional selectors",
            badPractice: `page.locator(".btn-primary").first()`,
            goodPractice: `page.getByRole("button", { name: "Save Changes" })`,
            explanation: ".first() suppresses Playwright's strict mode and masks accidental DOM duplication bugs. When UI order changes, .first() silently clicks the wrong control."
          }
        ],
        practiceTask: {
          labRoute: "/lab/locators",
          labName: "Locator Gym",
          objective: "Interact with semantic elements in the Locator Gym and assert their values without using CSS class selectors.",
          instructions: [
            "Navigate to /lab/locators.",
            "Locate the course search input using getByLabel('Search courses') and fill with 'locators'.",
            "Assert that the input with placeholder 'Try Playwright' contains 'locators'.",
            "Trigger the stable action button using getByTestId('stable-action').",
            "Assert that the status notification reports 'Check finished'."
          ],
          acceptanceCriteria: [
            "All assertions use web-first expect matchers.",
            "Zero raw CSS or XPath selectors used."
          ],
          hint: "The stable action button features data-testid='stable-action'.",
          solutionCode: `import { test, expect } from "@playwright/test";

test("exercises semantic locators in locator gym", async ({ page }) => {
  await page.goto("/lab/locators");
  await page.getByLabel("Search courses").fill("locators");
  await expect(page.getByPlaceholder("Try Playwright")).toHaveValue("locators");
  await page.getByTestId("stable-action").click();
  await expect(page.getByRole("status").filter({ hasText: "Check finished" })).toBeVisible();
});`,
          playwrightCommand: "npx playwright test e2e/locators.spec.ts -g 'uses role, label'"
        },
        interviewQuestions: [
          {
            question: "Why does Playwright enforce Strict Mode by default for locators?",
            answer: "In Selenium, driver.findElement() silently returns the first matching element if a selector matches 5 different DOM nodes. If an application introduces duplicate buttons or layout changes, the test clicks the wrong element without error. Playwright's Strict Mode throws an error immediately if a single-element locator resolves to multiple nodes, forcing the test author to disambiguate semantically.",
            architecturalContext: "Prevents subtle race conditions and test false-positives in enterprise test suites."
          }
        ]
      },
      {
        id: "strict-mode-and-filtering",
        moduleSlug: "locators-and-selectors",
        moduleTitle: "Modern Semantic Locators & Strict Mode",
        title: "Strict Mode Resolution & Container Filtering",
        difficulty: "Intermediate",
        durationMinutes: 25,
        prerequisites: ["semantic-locators-hierarchy"],
        summary: "Resolve locator ambiguity and strict-mode violations using container scoping, locator composition, and .filter() predicates.",
        sections: [
          {
            id: "filtering-concept",
            title: "Container Scoping & .filter()",
            content: "When multiple cards or table rows have identical buttons (e.g., 'Edit' or 'Delete'), you should scope the action to the specific container instead of relying on array indices. Playwright provides `locator.filter({ hasText })` and `locator.filter({ has: locator })`."
          }
        ],
        codeExamples: [
          {
            id: "filtering-example",
            caption: "Disambiguating Table Rows with Container Filtering",
            language: "typescript",
            code: `// Target the 'Edit' button specifically inside the row for 'Alice Chen'
const targetRow = page
  .getByRole("row")
  .filter({ hasText: "Alice Chen" });

await targetRow.getByRole("button", { name: "Edit" }).click();`,
            lineExplanations: [
              { line: 2, explanation: "Matches all table rows in the DOM." },
              { line: 3, explanation: "Filters the rows down to the single row containing 'Alice Chen'." },
              { line: 5, explanation: "Locates the 'Edit' button strictly within that filtered container." }
            ]
          }
        ],
        commonMistakes: [
          {
            title: "Relying on .nth(index) to click list items",
            badPractice: `page.getByRole("listitem").nth(2).getByRole("button").click();`,
            goodPractice: `page.getByRole("listitem").filter({ hasText: "Target Item" }).getByRole("button").click();`,
            explanation: "Positional indexing breaks as soon as items are sorted, paginated, or inserted asynchronously."
          }
        ],
        practiceTask: {
          labRoute: "/lab/locators",
          labName: "Locator Gym",
          objective: "Target the 'Open' button inside a dynamic list item filtered by text without using .nth().",
          instructions: [
            "Navigate to /lab/locators.",
            "Locate the list with accessible name 'Courses'.",
            "Filter listitems by text 'Locators'.",
            "Click the 'Open' button inside the filtered item.",
            "Assert that the page status displays 'Opened Locators'."
          ],
          acceptanceCriteria: [
            "Locator uses .filter({ hasText: 'Locators' }).",
            "No positional index functions used."
          ],
          hint: "Chain page.getByRole('list', { name: 'Courses' }).getByRole('listitem').filter({ hasText: 'Locators' }).",
          solutionCode: `import { test, expect } from "@playwright/test";

test("filters dynamic list without positional index", async ({ page }) => {
  await page.goto("/lab/locators");
  const row = page.getByRole("list", { name: "Courses" }).getByRole("listitem").filter({ hasText: "Locators" });
  await row.getByRole("button", { name: "Open" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Opened Locators" })).toBeVisible();
});`,
          playwrightCommand: "npx playwright test e2e/locators.spec.ts -g 'filters a nested row'"
        },
        interviewQuestions: [
          {
            question: "How do you handle a page with two identical 'Save' buttons inside different sections?",
            answer: "Use container scoping: locate the parent landmark (e.g. page.getByRole('form', { name: 'Billing' }) or page.getByRole('region', { name: 'Shipping' })) and query the 'Save' button inside that container. Alternatively, filter the button's parent group using .filter({ has: page.getByRole('heading', { name: 'Billing' }) }).",
            architecturalContext: "Maintains strict mode compliance and prevents clicking the wrong section button."
          }
        ]
      }
    ]
  },
  {
    slug: "actions-and-forms",
    title: "3. Input Automation & Accessible Forms",
    description: "Automate complex form controls, ARIA 1.2 comboboxes, multi-step wizards, and client validation error states.",
    iconName: "FileText",
    lessons: [
      {
        id: "accessible-form-controls",
        moduleSlug: "actions-and-forms",
        moduleTitle: "Input Automation & Accessible Forms",
        title: "HTML5 Inputs, Validation & Double-Submit Protection",
        difficulty: "Intermediate",
        durationMinutes: 20,
        prerequisites: ["semantic-locators-hierarchy"],
        summary: "Fill, select, check, and validate complex input types while handling auto-waiting for disabled and loading button states.",
        sections: [
          {
            id: "input-methods",
            title: "Native Playwright Input Methods",
            content: "Playwright provides dedicated high-level action methods: `fill()` (clears and types atomically), `selectOption()` (for native select dropdowns), `check()` / `uncheck()` (for checkboxes and radio buttons), and `setInputFiles()` for file inputs. All methods auto-wait for element visibility and actionability."
          }
        ],
        codeExamples: [
          {
            id: "form-submission",
            caption: "Filling and Submitting Form with API Interception",
            language: "typescript",
            code: `await page.getByLabel("Full name").fill("Ada Lovelace");
await page.getByLabel("Email").fill("ada@lab.test");
await page.getByLabel("Seats").fill("2");
await page.getByLabel("Track").selectOption("api");
await page.getByRole("checkbox", { name: "I agree to the lab terms" }).check();

// Await the API response while triggering submission
const resPromise = page.waitForResponse(r => r.url().includes("/api/lab/forms/intake") && r.ok());
await page.getByRole("button", { name: "Submit intake" }).click();
const response = await resPromise;
expect(response.status()).toBe(200);`,
            lineExplanations: [
              { line: 4, explanation: "selectOption works with option value, label, or index." },
              { line: 5, explanation: "check() verifies current checkbox state and clicks only if unchecked." },
              { line: 8, explanation: "Setting up response promise before click prevents network race conditions." }
            ]
          }
        ],
        commonMistakes: [
          {
            title: "Calling click() on a checkbox instead of check()",
            badPractice: `await page.getByRole("checkbox").click();`,
            goodPractice: `await page.getByRole("checkbox").check();`,
            explanation: "click() toggles the state blindly; if the checkbox was already checked, click() unchecks it. check() is idempotent and guarantees the desired state."
          }
        ],
        practiceTask: {
          labRoute: "/lab/forms",
          labName: "Forms Laboratory",
          objective: "Submit empty form to trigger validation errors and assert ARIA alerts.",
          instructions: [
            "Navigate to /lab/forms.",
            "Submit the intake form without filling required inputs.",
            "Assert that ARIA alert elements appear for required fields.",
            "Verify that no success confirmation is rendered."
          ],
          acceptanceCriteria: [
            "Alert elements are asserted with getByRole('alert').",
            "Non-existence of success message verified."
          ],
          hint: "Use expect(page.getByRole('alert').first()).toBeVisible().",
          solutionCode: `import { test, expect } from "@playwright/test";

test("asserts validation errors on empty submission", async ({ page }) => {
  await page.goto("/lab/forms");
  await page.getByRole("button", { name: "Submit intake" }).click();
  await expect(page.getByRole("alert").first()).toBeVisible();
  await expect(page.getByText(/Accepted as/)).toHaveCount(0);
});`,
          playwrightCommand: "npx playwright test e2e/forms.spec.ts -g 'shows client errors'"
        },
        interviewQuestions: [
          {
            question: "Why is locator.fill() preferred over locator.type() in modern Playwright?",
            answer: "locator.fill() focuses the element, clears existing text, and emits input/change events atomically in a single operation. locator.type() simulates individual keystrokes (pressing each key one by one with delays), which is significantly slower and should only be used when testing keydown/keyup event handlers or debounced autocomplete fields.",
            architecturalContext: "Reduces test execution time by up to 80% on long forms."
          }
        ]
      }
    ]
  },
  {
    slug: "network-and-api",
    title: "4. Network Interception & Route Mocking",
    description: "Intercept HTTP traffic, simulate 500 outages, test offline aborts, and combine API/UI testing.",
    iconName: "Sliders",
    lessons: [
      {
        id: "route-interception-and-mocking",
        moduleSlug: "network-and-api",
        moduleTitle: "Network Interception & Route Mocking",
        title: "Mocking Network Traffic with page.route()",
        difficulty: "Intermediate",
        durationMinutes: 25,
        prerequisites: ["playwright-introduction"],
        summary: "Intercept requests at the browser protocol level to fulfill custom JSON responses, simulate outages, and test edge cases deterministically.",
        sections: [
          {
            id: "route-methods",
            title: "Core Routing Primitives",
            content: "Playwright intercepts network traffic before it leaves the browser using `page.route(urlPattern, handler)`. Within the handler, you can call `route.fulfill()` to return mock data, `route.continue()` to forward the request with modified headers, or `route.abort('failed')` to simulate connection failure."
          }
        ],
        codeExamples: [
          {
            id: "route-mock",
            caption: "Mocking API Outage and Empty States",
            language: "typescript",
            code: `// 1. Intercept telemetry endpoint and mock 500 error
await page.route("**/api/lab/network/items*", async (route) => {
  await route.fulfill({
    status: 500,
    contentType: "application/json",
    body: JSON.stringify({ error: "Simulated Database Crash" }),
  });
});

await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

// 2. Assert application displays error banner
const alert = page.getByRole("alert");
await expect(alert).toBeVisible();
await expect(alert).toContainText("500");`,
            lineExplanations: [
              { line: 2, explanation: "Glob pattern matches any URL containing the telemetry path." },
              { line: 3, explanation: "Fulfills the request immediately without calling the live backend." },
              { line: 12, explanation: "Verifies the front-end gracefully handles server errors." }
            ]
          }
        ],
        commonMistakes: [
          {
            title: "Forgetting to register page.route() before triggering the network call",
            badPractice: `await page.click('#fetch-btn'); await page.route(...);`,
            goodPractice: `await page.route(...); await page.click('#fetch-btn');`,
            explanation: "Routes must be registered before the network request is initiated, otherwise the real request is already in flight."
          }
        ],
        practiceTask: {
          labRoute: "/lab/network",
          labName: "Scenario Control Center",
          objective: "Intercept telemetry requests and inject custom mock data using route.fulfill().",
          instructions: [
            "Navigate to /lab/network.",
            "Register page.route() for **/api/lab/network/items* and fulfill with mock item 'Mocked Telemetry Item'.",
            "Click 'Fetch Telemetry Records'.",
            "Assert that the mock item appears in the list."
          ],
          acceptanceCriteria: [
            "Mocked data is displayed in the UI.",
            "No real backend call is made."
          ],
          hint: "Use route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [...] }) }).",
          solutionCode: `import { test, expect } from "@playwright/test";

test("mocks telemetry items", async ({ page }) => {
  await page.route("**/api/lab/network/items*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ items: [{ id: "m1", title: "Mocked Telemetry Item", status: "Healthy", latency: 5 }] }),
    });
  });
  await page.goto("/lab/network");
  await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();
  await expect(page.getByText("Mocked Telemetry Item")).toBeVisible();
});`,
          playwrightCommand: "npx playwright test e2e/day5-practice.spec.ts -g 'Client-side network mocking'"
        },
        interviewQuestions: [
          {
            question: "When should tests use page.route() to mock APIs versus testing live endpoints?",
            answer: "Use live APIs for critical business happy-paths to validate database integrity and API schema contracts. Reserve page.route() for edge cases that are difficult, slow, expensive, or destructive to trigger live (e.g. 503 gateway outages, 429 rate limits, 30-second timeouts, and external payment provider webhooks).",
            architecturalContext: "Balances end-to-end confidence with deterministic edge-case testing."
          }
        ]
      }
    ]
  },
  {
    slug: "enterprise-architecture",
    title: "5. Page Object Models, Fixtures & Custom Matchers",
    description: "Scale test suites with decoupled Page Object Models, custom test fixtures, and domain-specific assertions.",
    iconName: "Layers",
    lessons: [
      {
        id: "decoupled-page-object-models",
        moduleSlug: "enterprise-architecture",
        moduleTitle: "Page Object Models, Fixtures & Custom Matchers",
        title: "Decoupled TypeScript Page Object Models",
        difficulty: "Senior SDET",
        durationMinutes: 30,
        prerequisites: ["semantic-locators-hierarchy"],
        summary: "Encapsulate UI structure and operations within clean, decoupled TypeScript classes injected via custom test fixtures.",
        sections: [
          {
            id: "pom-architecture",
            title: "Modern Playwright POM Design",
            content: "Avoid the legacy Selenium practice of returning `this` or returning the next page object on every method. In Playwright, POM methods should be explicit async actions that take advantage of auto-waiting locators stored as readonly properties."
          }
        ],
        codeExamples: [
          {
            id: "pom-class",
            caption: "Clean Page Object Model (e2e/pages/CourseCataloguePage.ts)",
            language: "typescript",
            code: `import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage.js";

export class CourseCataloguePage extends BasePage {
  readonly searchInput: Locator;
  readonly courseGrid: Locator;
  readonly createCourseBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByLabel("Search courses");
    this.courseGrid = page.getByTestId("course-grid");
    this.createCourseBtn = page.getByRole("button", { name: "Create Course" });
  }

  async open() {
    await this.goto("/app/courses");
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async expectCourseVisible(title: string) {
    await expect(this.courseGrid.getByText(title)).toBeVisible();
  }
}`,
            lineExplanations: [
              { line: 5, explanation: "Locators are defined as readonly properties in the constructor." },
              { line: 15, explanation: "Navigation encapsulated cleanly in open()." },
              { line: 23, explanation: "Assertion method encapsulates grid locators and web-first expect check." }
            ]
          }
        ],
        commonMistakes: [
          {
            title: "Fluent method chaining in async Playwright POMs",
            badPractice: `await loginPage.enterUser().enterPass().clickSubmit();`,
            goodPractice: `await loginPage.login(username, password);`,
            explanation: "Fluent chaining obscures asynchronous Promise resolution boundaries and creates tight coupling between pages."
          }
        ],
        practiceTask: {
          labRoute: "/app/courses",
          labName: "Course Catalogue",
          objective: "Create, search, and verify a course using the CourseCataloguePage POM.",
          instructions: [
            "Instantiate CourseCataloguePage using adminPage fixture.",
            "Navigate to /app/courses using page object open() method.",
            "Create a new course with unique code.",
            "Verify course appears in the course grid."
          ],
          acceptanceCriteria: [
            "All actions executed through POM methods.",
            "No direct page.locator() calls in the spec file."
          ],
          hint: "Use const coursesPage = new CourseCataloguePage(adminPage).",
          solutionCode: `import { test } from "./fixtures/index.js";
import { CourseCataloguePage } from "./pages/CourseCataloguePage.js";

test("creates and searches course via POM", async ({ adminPage }) => {
  const pageObj = new CourseCataloguePage(adminPage);
  await pageObj.open();
  await pageObj.createCourse({ title: "Custom POM Course", code: "POM-1", price: 199 });
  await pageObj.expectCourseVisible("Custom POM Course");
});`,
          playwrightCommand: "npx playwright test e2e/pom-workflows.spec.ts -g 'manages courses using CourseCataloguePage'"
        },
        interviewQuestions: [
          {
            question: "Why should Page Object Models encapsulate assertions versus leaving all assertions in the test file?",
            answer: "High-level domain assertions (like expectUserInDirectory or expectOrderInTable) belong in the POM because they encapsulate complex internal DOM hierarchy and layout details. If the table layout changes from a <table> to CSS grid divs, you only update the POM method, keeping 50 test files unchanged.",
            architecturalContext: "Minimizes test maintenance overhead and enforces the Single Responsibility Principle."
          }
        ]
      }
    ]
  },
  {
    slug: "quality-audits",
    title: "6. Accessibility, Visual Testing & Core Web Vitals",
    description: "Automate WCAG 2.1 AA audits with Axe-Core, stabilize visual screenshot regressions, and profile performance with CDP.",
    iconName: "ShieldCheck",
    lessons: [
      {
        id: "automated-accessibility-wcag",
        moduleSlug: "quality-audits",
        moduleTitle: "Accessibility, Visual Testing & Core Web Vitals",
        title: "Automated WCAG 2.1 AA Audits with Axe-Core",
        difficulty: "Senior SDET",
        durationMinutes: 20,
        prerequisites: ["playwright-introduction"],
        summary: "Integrate @axe-core/playwright to run automated accessibility audits, detect color contrast violations, and enforce compliance.",
        sections: [
          {
            id: "axe-integration",
            title: "Scoped Axe-Core Component Audits",
            content: "Full-page accessibility scans often generate noisy violations in third-party widgets. Senior SDETs scope scans to specific component landmarks using `new AxeBuilder({ page }).include('#target-panel').analyze()`."
          }
        ],
        codeExamples: [
          {
            id: "axe-example",
            caption: "Running Scoped WCAG Audit (e2e/a11y.spec.ts)",
            language: "typescript",
            code: `import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

test("accessible panel passes WCAG 2.1 AA audit", async ({ page }) => {
  await page.goto("/lab/a11y");

  const results = await new AxeBuilder({ page })
    .include('[data-testid="accessible-panel"]')
    .analyze();

  expect(results.violations).toEqual([]);
});`,
            lineExplanations: [
              { line: 6, explanation: "Instantiates AxeBuilder attached to current Playwright page." },
              { line: 7, explanation: "Scopes audit exclusively to the specified CSS selector." },
              { line: 10, explanation: "Asserts zero accessibility violations exist." }
            ]
          }
        ],
        commonMistakes: [
          {
            title: "Running un-scoped Axe scans across entire pages",
            badPractice: `const results = await new AxeBuilder({ page }).analyze();`,
            goodPractice: `const results = await new AxeBuilder({ page }).include('#main-content').analyze();`,
            explanation: "Unscoped scans fail tests on third-party tracking scripts, header badges, and unrelated legacy widgets."
          }
        ],
        practiceTask: {
          labRoute: "/lab/a11y",
          labName: "Accessibility Lab",
          objective: "Scan the accessibility lab, identify a violation, apply remediation, and assert 0 violations.",
          instructions: [
            "Navigate to /lab/a11y.",
            "Run Axe scan on [data-testid='defect-button-panel'] and assert button-name violation.",
            "Click #toggle-remediate-btn to fix the defect.",
            "Re-scan and assert zero remaining violations."
          ],
          acceptanceCriteria: [
            "Pre-remediation violation asserted.",
            "Post-remediation clean audit asserted."
          ],
          hint: "Use .withRules(['button-name']) to focus on the icon button violation.",
          solutionCode: `import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

test("remediates accessibility violations", async ({ page }) => {
  await page.goto("/lab/a11y");
  const before = await new AxeBuilder({ page }).include('[data-testid="defect-button-panel"]').withRules(["button-name"]).analyze();
  expect(before.violations.length).toBeGreaterThan(0);

  await page.locator("#toggle-remediate-btn").click();
  const after = await new AxeBuilder({ page }).include('[data-testid="defect-button-panel"]').withRules(["button-name"]).analyze();
  expect(after.violations).toEqual([]);
});`,
          playwrightCommand: "npx playwright test e2e/a11y.spec.ts -g 'remediation toggle fixes'"
        },
        interviewQuestions: [
          {
            question: "Can automated accessibility tools like Axe catch 100% of WCAG defects?",
            answer: "No. Automated tools like Axe catch roughly 30% to 50% of accessibility issues (such as color contrast ratios, missing form labels, invalid ARIA attributes, and missing alt text). They cannot evaluate subjective criteria like logical keyboard tab focus order, screen-reader reading flow clarity, or whether alt text is meaningful.",
            architecturalContext: "Combine automated Axe scans in CI with keyboard navigation tests and periodic manual screen-reader audits."
          }
        ]
      }
    ]
  }
];

export function getAllLessons(): Lesson[] {
  return curriculumModules.flatMap((m) => m.lessons);
}

export function getLessonById(id: string): Lesson | undefined {
  return getAllLessons().find((l) => l.id === id);
}

export function getNextAndPrevLesson(currentId: string): { prevLesson?: Lesson; nextLesson?: Lesson } {
  const all = getAllLessons();
  const idx = all.findIndex((l) => l.id === currentId);
  if (idx === -1) return {};
  return {
    prevLesson: idx > 0 ? all[idx - 1] : undefined,
    nextLesson: idx < all.length - 1 ? all[idx + 1] : undefined,
  };
}
