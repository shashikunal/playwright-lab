import { actionsLesson } from "./lessons/actionsLesson";
import { formsLesson } from "./lessons/formsLesson";
import { browserContextsLesson } from "./lessons/browserContextsLesson";
import { apiTestingLesson } from "./lessons/apiTestingLesson";
import { networkInterceptionLesson } from "./lessons/networkInterceptionLesson";
import { fixturesLesson } from "./lessons/fixturesLesson";
import { pomArchitectureLesson } from "./lessons/pomArchitectureLesson";
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
        title: "Understanding playwright.config.ts — Beginner to Advanced",
        difficulty: "Intermediate",
        durationMinutes: 30,
        prerequisites: [
          "playwright-introduction",
          "Node.js 18+ LTS runtime installed",
          "Basic TypeScript & CLI understanding"
        ],
        summary: "Master Playwright's configuration architecture from testDir and timeout settings to multi-project browser matrices, mobile device emulation, CI/CD worker optimization, trace recording strategies, and webServer orchestration.",
        sections: [
          {
            id: "config-foundations",
            title: "Part A — Configuration Foundations",
            content: `The 'playwright.config.ts' file is the central nervous system of any professional Playwright test suite. It governs how test files are discovered, which browser binaries execute them, how worker threads are orchestrated, and how diagnostic artifacts are generated.

Why Playwright Uses playwright.config.ts:
In raw automation, configurations are often scattered across test scripts or environment variables. Playwright unifies test suite infrastructure into a single, type-safe TypeScript configuration file. Wrapping the export in 'defineConfig()' provides instant IDE autocompletion, type validation, and compile-time detection of deprecated or misspelled properties.

Configuration File Discovery:
When you execute 'npx playwright test', Playwright automatically searches for a configuration file in the following order:
1. An explicit configuration path specified via the CLI flag: 'npx playwright test --config=my-custom.config.ts' (or '-c my-custom.config.ts').
2. In the current working directory, searching for 'playwright.config.ts', 'playwright.config.js', or 'playwright.config.mjs'.
3. Ascending up parent directories until a configuration file is encountered.

Configuration vs. Test Code:
It is crucial to distinguish configuration settings from test code:
- Configuration is declarative and environment-level. It specifies global defaults: test directories, baseURL, browser viewports, default timeouts, and reporting strategies.
- Test code is imperative and scenario-specific. It exercises user workflows using locators and assertions. Tests should never hardcode environment URLs or arbitrary delays; they should rely on the configuration to provide environment context.`
          },
          {
            id: "essential-options",
            title: "Part B — Essential Configuration Options",
            content: `A resilient configuration relies on core options that control test discovery, execution parallelism, and timeout thresholds:

- testDir:
  Specifies the directory root where Playwright discovers test files (e.g. './e2e'). By default, it scans the directory where the config resides. Constraining 'testDir' avoids scanning build directories or server routes.

- testMatch and testIgnore:
  Glob patterns or regular expressions that filter files. Default: '.*(test|spec)\\.(ts|js|mjs)'. Use 'testIgnore' to exclude setup helpers, e.g. 'testIgnore: /.*\\.setup\\.ts/'.

- timeout and expect.timeout:
  Playwright operates with two distinct timeout levels:
  1. 'timeout' (Default: 30,000ms): The overall maximum duration allowed for an entire test case (including before/after hooks). If exceeded, the test fails with a Test Timeout error.
  2. 'expect.timeout' (Default: 5,000ms): The maximum duration allowed for a single Web-First assertion to poll the DOM before failing. Keeping this at 5s ensures rapid failure on missing elements without delaying the suite.

- fullyParallel:
  When true, Playwright runs tests inside individual files concurrently across worker processes. When false, files run in parallel, but tests within the same file execute sequentially. Set to true for stateless tests; disable only for files requiring strict serial order.

- forbidOnly:
  Prevents accidental commits of 'test.only()'. Recommended setting: 'forbidOnly: !!process.env.CI'. This immediately fails CI builds if developer debug filters were left in the repository.

- retries:
  Defines how many times a failed test is automatically re-run. Recommended: 'retries: process.env.CI ? 2 : 0'. Crucial rule: retries are an insurance policy for CI network blips, NOT an excuse to ignore flaky tests.

- workers:
  The maximum number of concurrent Node.js worker OS processes. Default locally: 50% of available CPU cores. On CI runners, set explicitly (e.g. 'workers: process.env.CI ? 2 : undefined') to prevent CPU throttling and memory exhaustion.

- reporter and outputDir:
  'reporter' configures console and file output formats (e.g. [['list'], ['html', { open: 'never' }]]). 'outputDir' defines where failure screenshots, videos, and trace archives are deposited (default: 'test-results/').`
          },
          {
            id: "browser-execution-config",
            title: "Part C — Browser & Context Execution Options (use Block)",
            content: `The 'use' object sets default options for all browser instances, contexts, and pages. It is vital to distinguish test-runner settings from browser-context settings:

Test-Runner Settings vs Browser-Context Settings:
- Test-runner settings (such as workers, retries, and testDir) control the Node.js execution environment.
- Browser-context settings (inside 'use') control the browser window, networking, and browser state.

Core 'use' Properties:
- baseURL:
  The fundamental anchor URL (e.g. 'http://127.0.0.1:5173'). When configured, 'await page.goto("/practice/login")' automatically prefixes the baseURL. Eliminates hardcoded localhost addresses.

- headless:
  Controls whether browser windows open visibly (headless: false) or run in the background (headless: true). By default, Playwright runs headless in CLI mode and headed in '--ui' or '--headed' mode.

- actionTimeout and navigationTimeout:
  1. 'actionTimeout' (Default: 0 = test timeout): Maximum time an action like 'click()' or 'fill()' will wait for element actionability checks (visible, stable, enabled). Recommended: 10,000ms.
  2. 'navigationTimeout' (Default: 0 = test timeout): Maximum time 'page.goto()' waits for page load. Recommended: 15,000ms.

- trace, screenshot, and video:
  Artifact recording policies:
  - 'trace: "retain-on-failure"': Preserves complete DOM, network, and timeline traces ONLY when a test fails. Recommended for CI to optimize disk space.
  - 'screenshot: "only-on-failure"': Takes a full-viewport screenshot on failure.
  - 'video: "retain-on-failure"': Records video and retains only for failing executions.

- ignoreHTTPSErrors:
  Bypasses SSL/TLS certificate warnings for self-signed certificates in local staging. SECURITY WARNING: Never enable this blindly in production suites, as it conceals legitimate HTTPS certificate expiration or configuration defects.`
          },
          {
            id: "projects-and-environments",
            title: "Part D — Projects, Emulation & Environments",
            content: `Playwright's 'projects' array enables multi-browser matrix testing and cross-device emulation from a single test codebase:

Multi-Browser Projects:
A project defines a logical execution profile:
- Chromium: 'use: { ...devices["Desktop Chrome"] }'
- Firefox: 'use: { ...devices["Desktop Firefox"] }'
- WebKit: 'use: { ...devices["Desktop Safari"] }'

Desktop vs. Mobile Emulation:
Using Playwright's built-in 'devices' registry (e.g. 'devices["Pixel 7"]' or 'devices["iPhone 14"]'), Playwright automatically configures screen viewport, device scale factor, user agent string, touch event support, and mobile browser flags without needing physical devices or emulators.

Local vs. CI Environment Branching:
Use standard Node.js environment variables to adjust settings cleanly:
const isCI = !!process.env.CI;
In CI: Enable 'forbidOnly', set retries to 1 or 2, set workers to 2, and use 'github' or 'blob' reporters. Locally: Enable interactive reporters, disable retries, and allow 50% CPU worker allocation.

webServer Orchestration:
Playwright can launch and monitor local dev servers before running tests:
webServer: {
  command: "npm run dev",
  url: "http://127.0.0.1:5173",
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
}
- 'url': Playwright polls this URL until receiving HTTP 200 before starting tests.
- 'reuseExistingServer': When true locally, Playwright detects an already-running server and avoids restarting it. On CI, setting to false guarantees a pristine server instance.`
          },
          {
            id: "advanced-configuration",
            title: "Part E — Advanced Architecture & Reliability Trade-offs",
            content: `Senior SDETs architect Playwright configurations for scalability, deterministic test data, and fast CI feedback loops:

Configuration Inheritance & Overrides:
Options defined at the root 'use' block serve as shared defaults. Any project inside 'projects' can selectively override individual properties (such as custom viewport, permissions, or geolocation) while inheriting the remaining root settings.

Authentication Setup Projects (Project Dependencies):
Instead of logging in before every test, define a setup project:
{ name: "setup", testMatch: /.*\\.setup\\.ts/ }
Subsequent browser projects declare 'dependencies: ["setup"]'. Playwright executes the setup project first, stores the authenticated session state in a JSON file, and browser projects load it via 'storageState: "playwright/.auth/user.json"'.

Reporter Configurations:
Playwright supports multiple concurrent reporters:
- 'list': Clean terminal output during local development.
- 'html': Interactive browser dashboard with search, trace viewer links, and video playback.
- 'blob': Lightweight artifact bundles designed for sharded CI runs, merged into a single report via 'npx playwright merge-reports'.

Configuration Debugging:
When tests fail unexpectedly to discover files or timeout immediately, inspect:
1. Is 'baseURL' matching the exact port where the dev server is listening?
2. Are 'actionTimeout' and 'navigationTimeout' shorter than overall 'timeout'?
3. Is 'testMatch' accidentally filtering out valid spec files?`
          }
        ],
        codeExamples: [
          {
            id: "production-config",
            caption: "Production Playwright Configuration (playwright.config.ts)",
            language: "typescript",
            code: `import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  reporter: [
    ["list"],
    ["html", { open: "never" }],
  ],
  use: {
    baseURL: process.env.BASE_URL || "http://127.0.0.1:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: "setup",
      testMatch: /.*\\.setup\\.ts/,
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
      testIgnore: /.*\\.setup\\.ts/,
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      dependencies: ["setup"],
      testIgnore: /.*\\.setup\\.ts/,
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
      dependencies: ["setup"],
      testMatch: /responsive\\.spec\\.ts|smoke\\.spec\\.ts/,
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});`,
            lineExplanations: [
              { line: 3, explanation: "Detects whether tests are running in a CI environment (GitHub Actions, GitLab CI)." },
              { line: 6, explanation: "testDir: limits test file discovery strictly to the ./e2e directory." },
              { line: 7, explanation: "fullyParallel: enables intra-file parallel test execution across worker processes." },
              { line: 8, explanation: "forbidOnly: prevents test.only() from passing in CI, ensuring full suite execution." },
              { line: 9, explanation: "retries: retries failed tests twice on CI to absorb network transient blips." },
              { line: 10, explanation: "workers: constrains CI workers to 2 to prevent runner CPU throttling." },
              { line: 18, explanation: "use.baseURL: eliminates hardcoded URLs; page.goto('/login') prepends this address." },
              { line: 19, explanation: "trace: retain-on-failure creates debug zip files only when a test fails." },
              { line: 26, explanation: "setup project: executes authentication routines first to store reusable cookies." },
              { line: 31, explanation: "dependencies: ensures chromium tests wait for the setup project to finish." },
              { line: 43, explanation: "webServer: automatically boots the local app before tests and checks the health URL." }
            ]
          }
        ],
        commonMistakes: [
          {
            title: "Masking flaky tests with excessive global retries",
            badPractice: `retries: 5`,
            goodPractice: `retries: process.env.CI ? 1 : 0`,
            explanation: "Setting high retry counts masks root causes such as race conditions and shared database state. Retries should only protect against infrastructure flakiness in CI; local development should fail immediately (retries: 0) to highlight bugs."
          },
          {
            title: "Hardcoding localhost URLs in test files instead of baseURL",
            badPractice: `await page.goto("http://localhost:5173/practice/login");`,
            goodPractice: `await page.goto("/practice/login"); // resolves against config baseURL`,
            explanation: "Hardcoding localhost breaks execution across CI pipelines, Docker containers, and staging preview URLs. Always configure baseURL in playwright.config.ts."
          },
          {
            title: "Unconditionally recording traces and videos for passing tests",
            badPractice: `use: { trace: "on", video: "on" }`,
            goodPractice: `use: { trace: "retain-on-failure", video: "retain-on-failure" }`,
            explanation: "Recording full traces and video on hundreds of passing tests increases execution time by 30-50% and consumes gigabytes of CI runner disk space. Use 'retain-on-failure' to capture artifacts only when needed."
          },
          {
            title: "Setting actionTimeout equal to or higher than overall test timeout",
            badPractice: `timeout: 10_000, use: { actionTimeout: 15_000 }`,
            goodPractice: `timeout: 30_000, use: { actionTimeout: 10_000 }`,
            explanation: "If actionTimeout exceeds overall test timeout, a stuck click action will trigger an opaque Test Timeout error rather than an actionable Action Timeout with locator diagnostics."
          }
        ],
        playground: {
          title: "Configuration Architecture Playground",
          configExample: `import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 1,
  workers: 2,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:5173",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
});`,
          properties: [
            {
              name: "testDir",
              type: "string",
              defaultValue: "'.' (current directory)",
              description: "Root directory scanned for test spec files.",
              impact: "Prevents scanning node_modules or application build output."
            },
            {
              name: "baseURL",
              type: "string",
              defaultValue: "undefined",
              description: "Base URL prepended to relative page.goto() navigation calls.",
              impact: "Enables environment portability across local, staging, and CI."
            },
            {
              name: "fullyParallel",
              type: "boolean",
              defaultValue: "false",
              description: "Controls whether tests inside the same file run concurrently.",
              impact: "Cuts execution duration by up to 60% for stateless test suites."
            },
            {
              name: "timeout",
              type: "number",
              defaultValue: "30,000 ms",
              description: "Maximum execution time for an entire test case.",
              impact: "Hard safety ceiling preventing runaway hangs on network stalls."
            },
            {
              name: "expect.timeout",
              type: "number",
              defaultValue: "5,000 ms",
              description: "Maximum duration for Web-First auto-retrying assertions.",
              impact: "Ensures responsive assertions without masking absent DOM elements."
            },
            {
              name: "actionTimeout",
              type: "number",
              defaultValue: "0 (unlimited)",
              description: "Maximum wait time for user actions (click, fill, hover).",
              impact: "Fails fast with detailed actionability logs if element is disabled."
            },
            {
              name: "retries",
              type: "number",
              defaultValue: "0",
              description: "Number of times a failing test will be re-executed.",
              impact: "Absorbs network transient spikes on CI without masking real bugs."
            },
            {
              name: "webServer",
              type: "object | object[]",
              defaultValue: "undefined",
              description: "Command and health check URL to boot local application.",
              impact: "Guarantees tests run against a live application automatically."
            }
          ],
          behaviorComparison: [
            {
              aspect: "Test Execution Parallelism",
              defaultBehavior: "Files run in parallel, but tests within each file execute sequentially one by one.",
              customizedBehavior: "fullyParallel: true runs tests in all files concurrently across multi-core worker processes."
            },
            {
              aspect: "Navigation Addressing",
              defaultBehavior: "Requires hardcoded absolute URLs: page.goto('http://localhost:5173/practice/login').",
              customizedBehavior: "baseURL config allows relative navigation: page.goto('/practice/login') across any host."
            },
            {
              aspect: "Debug Artifact Capture",
              defaultBehavior: "Traces and videos are disabled by default; failing CI tests provide only terminal error logs.",
              customizedBehavior: "trace: 'retain-on-failure' automatically captures DOM snapshots and network logs on failure."
            },
            {
              aspect: "Flaky Test Re-runs",
              defaultBehavior: "0 retries: any momentary network hiccup fails the entire CI build immediately.",
              customizedBehavior: "retries: 2 automatically re-runs failing tests, generating on-first-retry diagnostic traces."
            },
            {
              aspect: "CI Safety Controls",
              defaultBehavior: "Accidentally committed test.only() passes silently and skips 99% of your test suite.",
              customizedBehavior: "forbidOnly: !!process.env.CI halts the build immediately if test.only is committed."
            }
          ],
          practiceTask: "Execute our project's verified practice configuration to see relative path resolution and actionTimeout in action.",
          localCommand: "npx playwright test --config=e2e/practice-configs/exercise1-testdir.config.ts"
        },
        exercises: [
          {
            id: "ex1-testdir",
            title: "Exercise 1: Configure testDir and Discover Test Files",
            objective: "Configure the testDir and testMatch properties to isolate test discovery to a specific directory.",
            prerequisites: ["Playwright installed", "Test file at e2e/practice-configs.spec.ts"],
            starterConfig: `import { defineConfig } from "@playwright/test";

export default defineConfig({
  // TODO: Set testDir to target the e2e folder
  // TODO: Set testMatch to only execute practice-configs.spec.ts
});`,
            task: "Create a configuration file that sets testDir to '../' and filters specifically for practice-configs.spec.ts.",
            acceptanceCriteria: [
              "Config specifies testDir pointing to the e2e root.",
              "testMatch filters for /practice-configs\\.spec\\.ts/.",
              "Running with --config discovers exactly 2 tests."
            ],
            expectedBehavior: "Playwright discovers only practice-configs.spec.ts, ignoring all other spec files in the directory.",
            hint: "Use testDir: '../' and testMatch: /practice-configs\\.spec\\.ts/.",
            solution: `import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\\.spec\\.ts/,
  use: {
    baseURL: "http://127.0.0.1:5173",
  },
});`,
            troubleshootingNotes: "If Playwright discovers 0 tests, verify that testDir relative path correctly resolves to the folder containing your spec file.",
            command: "npx playwright test --config=e2e/practice-configs/exercise1-testdir.config.ts"
          },
          {
            id: "ex2-baseurl",
            title: "Exercise 2: Configure baseURL for Relative Navigation",
            objective: "Set up baseURL in the use block to enable clean, environment-portable navigation.",
            prerequisites: ["Local application running on port 5173"],
            starterConfig: `import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\\.spec\\.ts/,
  use: {
    // TODO: Add baseURL pointing to http://127.0.0.1:5173
  },
});`,
            task: "Define baseURL under the use block so that await page.goto('/practice/login') automatically navigates to port 5173.",
            acceptanceCriteria: [
              "use.baseURL is configured to 'http://127.0.0.1:5173'.",
              "Tests in practice-configs.spec.ts navigate using relative URL '/practice/login'.",
              "Navigation succeeds without error."
            ],
            expectedBehavior: "Playwright prepends baseURL to relative paths; tests execute against the local web application without hardcoded hostnames.",
            hint: "Add baseURL: 'http://127.0.0.1:5173' inside the use: { ... } block.",
            solution: `import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\\.spec\\.ts/,
  use: {
    baseURL: "http://127.0.0.1:5173",
    actionTimeout: 10_000,
  },
});`,
            troubleshootingNotes: "Always use '127.0.0.1' instead of 'localhost' on Windows to avoid IPv6 vs IPv4 loopback resolution latency.",
            command: "npx playwright test --config=e2e/practice-configs/exercise2-baseurl.config.ts"
          },
          {
            id: "ex3-timeout",
            title: "Exercise 3: Configure Test & Assertion Timeouts",
            objective: "Distinguish overall test timeout from expect.timeout and configure both for fast, predictable failure feedback.",
            prerequisites: ["Understanding of synchronous vs asynchronous timeouts"],
            starterConfig: `import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\\.spec\\.ts/,
  // TODO: Set overall test timeout to 15,000ms
  // TODO: Set expect assertion timeout to 4,000ms
});`,
            task: "Configure overall timeout to 15,000ms and assertion expect.timeout to 4,000ms.",
            acceptanceCriteria: [
              "timeout is set to 15_000.",
              "expect.timeout is set to 4_000.",
              "Tests pass within the specified timeout limits."
            ],
            expectedBehavior: "Playwright enforces a 4s ceiling on individual DOM assertions and a 15s ceiling on the entire test function.",
            hint: "Use timeout: 15_000 at the root and expect: { timeout: 4_000 }.",
            solution: `import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\\.spec\\.ts/,
  timeout: 15_000,
  expect: {
    timeout: 4_000,
  },
  use: {
    baseURL: "http://127.0.0.1:5173",
  },
});`,
            troubleshootingNotes: "Never set expect.timeout higher than the overall test timeout, as the test will terminate prematurely before the assertion finishes.",
            command: "npx playwright test --config=e2e/practice-configs/exercise3-timeout.config.ts"
          },
          {
            id: "ex4-retries",
            title: "Exercise 4: Configure Retries & Trace Retention",
            objective: "Configure test retry policies and attach traces on retry to diagnose intermittent failures.",
            prerequisites: ["Understanding of retry mechanisms"],
            starterConfig: `import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\\.spec\\.ts/,
  // TODO: Set retries to 2
  // TODO: Configure trace to 'on-first-retry'
});`,
            task: "Configure retries to 2 and enable trace capture with 'on-first-retry'.",
            acceptanceCriteria: [
              "retries is set to 2.",
              "use.trace is set to 'on-first-retry'.",
              "use.screenshot is set to 'only-on-failure'."
            ],
            expectedBehavior: "Passing tests do not record traces; if a test fails, Playwright re-runs it and saves a trace.zip file for debugging.",
            hint: "Set retries: 2 and use: { trace: 'on-first-retry', screenshot: 'only-on-failure' }.",
            solution: `import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\\.spec\\.ts/,
  retries: 2,
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
});`,
            troubleshootingNotes: "Do not use retries as a band-aid for flawed assertions or race conditions. All retried tests should be investigated in CI logs.",
            command: "npx playwright test --config=e2e/practice-configs/exercise4-retries.config.ts"
          },
          {
            id: "ex5-reporter",
            title: "Exercise 5: Configure HTML & Terminal Reporters",
            objective: "Set up multi-reporter output combining terminal list view with interactive HTML reports.",
            prerequisites: ["npm test execution environment"],
            starterConfig: `import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\\.spec\\.ts/,
  // TODO: Configure reporter with 'list' and 'html'
});`,
            task: "Configure an array of reporters with 'list' for terminal output and 'html' with open: 'never'.",
            acceptanceCriteria: [
              "reporter contains both ['list'] and ['html', { open: 'never' }].",
              "HTML report is generated in the output directory after test completion."
            ],
            expectedBehavior: "Playwright prints real-time test progress in the terminal and generates an interactive HTML dashboard in playwright-report/.",
            hint: "Use reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-practice' }]].",
            solution: `import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\\.spec\\.ts/,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report-practice" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:5173",
  },
});`,
            troubleshootingNotes: "Always set open: 'never' on CI or headless environments to prevent Playwright from attempting to open a graphical browser window on exit.",
            command: "npx playwright test --config=e2e/practice-configs/exercise5-reporter.config.ts"
          },
          {
            id: "ex6-projects",
            title: "Exercise 6: Configure Chromium & Firefox Projects",
            objective: "Define multi-browser projects in the configuration file to run identical test suites across different rendering engines.",
            prerequisites: ["Chromium and Firefox browser binaries installed"],
            starterConfig: `import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\\.spec\\.ts/,
  // TODO: Configure projects array with chromium and firefox
});`,
            task: "Configure projects array with 'chromium' using Desktop Chrome and 'firefox' using Desktop Firefox.",
            acceptanceCriteria: [
              "projects array defines a 'chromium' project with devices['Desktop Chrome'].",
              "projects array defines a 'firefox' project with devices['Desktop Firefox'].",
              "Tests run across both browser projects."
            ],
            expectedBehavior: "Playwright allocates workers across Chromium and Firefox, executing the spec file against both engines.",
            hint: "Use projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }, { name: 'firefox', use: { ...devices['Desktop Firefox'] } }].",
            solution: `import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\\.spec\\.ts/,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
  use: {
    baseURL: "http://127.0.0.1:5173",
  },
});`,
            troubleshootingNotes: "If Firefox is not installed locally, run 'npx playwright install firefox' to download the engine binary.",
            command: "npx playwright test --config=e2e/practice-configs/exercise6-projects.config.ts --project=chromium"
          },
          {
            id: "ex7-webserver",
            title: "Exercise 7: Configure webServer for Local Boot & Reuse",
            objective: "Configure webServer to verify that the local web application is active before starting tests.",
            prerequisites: ["Local application script defined in package.json"],
            starterConfig: `import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\\.spec\\.ts/,
  // TODO: Configure webServer to check http://127.0.0.1:5173
});`,
            task: "Define a webServer configuration with command 'npm run dev -w @pil/web', url 'http://127.0.0.1:5173', and reuseExistingServer: true.",
            acceptanceCriteria: [
              "webServer block defines command, url, and timeout.",
              "reuseExistingServer is set to true.",
              "Playwright detects running server and runs tests immediately."
            ],
            expectedBehavior: "Playwright checks the URL. If the server is already active, it reuses it without restarting; if inactive, it starts the dev command automatically.",
            hint: "Set reuseExistingServer: true so running dev servers are reused without port collisions.",
            solution: `import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\\.spec\\.ts/,
  use: {
    baseURL: "http://127.0.0.1:5173",
  },
  webServer: {
    command: "npm run dev -w @pil/web",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});`,
            troubleshootingNotes: "Always specify the 'url' property in webServer so Playwright waits for HTTP 200 rather than guessing with arbitrary sleep delays.",
            command: "npx playwright test --config=e2e/practice-configs/exercise7-webserver.config.ts"
          },
          {
            id: "ex8-ci",
            title: "Exercise 8: Compare Local & CI Configuration Safely",
            objective: "Implement safe environment branching that toggles retries, workers, and forbidOnly based on process.env.CI.",
            prerequisites: ["Node.js process.env familiarity"],
            starterConfig: `import { defineConfig } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\\.spec\\.ts/,
  // TODO: Branch forbidOnly, retries, and workers based on isCI
});`,
            task: "Construct a configuration that enables forbidOnly, 2 retries, and 2 workers on CI, while running 0 retries and full local CPU cores locally.",
            acceptanceCriteria: [
              "forbidOnly is enabled only when isCI is true.",
              "retries is set to 2 in CI and 0 locally.",
              "workers is set to 2 in CI and undefined locally.",
              "trace is set to retain-on-failure in CI."
            ],
            expectedBehavior: "Locally, tests fail fast without retries; in CI, tests retry transient errors and prevent runaway worker memory bloat.",
            hint: "Use const isCI = !!process.env.CI; and ternary expressions for retries, workers, and forbidOnly.",
            solution: `import { defineConfig } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\\.spec\\.ts/,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: process.env.BASE_URL || "http://127.0.0.1:5173",
    trace: isCI ? "retain-on-failure" : "on-first-retry",
    video: isCI ? "retain-on-failure" : "off",
  },
});`,
            troubleshootingNotes: "Do not hardcode secrets or production tokens in environment branching; read them from process.env with secure fallback defaults.",
            command: "npx playwright test --config=e2e/practice-configs/exercise8-ci.config.ts"
          }
        ],
        knowledgeCheck: [
          {
            id: "kc-discovery",
            topic: "Configuration Discovery",
            question: "How does Playwright locate the configuration file when no explicit '--config' flag is passed?",
            options: [
              "It searches only in the root directory for a file named 'config.json'.",
              "It searches the current working directory for 'playwright.config.(ts|js|mjs)' and traverses upwards to parent directories.",
              "It downloads the configuration dynamically from the remote repository.",
              "It scans all folders for files ending with '.playwright.ts'."
            ],
            correctOptionIndex: 1,
            explanation: "Playwright looks for 'playwright.config.ts', 'playwright.config.js', or 'playwright.config.mjs' in the current working directory, and ascends upwards through parent directories until it encounters the configuration file."
          },
          {
            id: "kc-timeouts",
            topic: "Timeouts Architecture",
            question: "What is the difference between root 'timeout' and 'expect.timeout' in playwright.config.ts?",
            options: [
              "'timeout' governs individual locator clicks, while 'expect.timeout' governs network latency.",
              "'timeout' (default 30s) limits the total duration of the entire test function, while 'expect.timeout' (default 5s) limits how long Web-First assertions poll the live DOM.",
              "'expect.timeout' must always be larger than the root 'timeout'.",
              "There is no difference; they are interchangeable aliases."
            ],
            correctOptionIndex: 1,
            explanation: "The root 'timeout' represents the overall test case lifecycle ceiling (including hooks), while 'expect.timeout' controls the auto-retrying polling window for individual assertions (e.g. toBeVisible)."
          },
          {
            id: "kc-workers-retries",
            topic: "Workers and Retries",
            question: "Why should retries be set to 0 in local development and restricted to 1 or 2 in CI?",
            options: [
              "Because retries consume too much electricity on laptops.",
              "Because local developers need immediate failure feedback to fix bugs, while CI retries absorb transient network infrastructure hiccups without masking flakiness.",
              "Because Playwright disables screenshots when retries are enabled.",
              "Because retries can only be executed on Linux operating systems."
            ],
            correctOptionIndex: 1,
            explanation: "In local development, retries waste time and conceal race conditions. Failing immediately allows developers to fix the root cause. In CI, a single retry absorbs external network jitter, but persistent flakiness must still be investigated."
          },
          {
            id: "kc-projects",
            topic: "Projects Matrix",
            question: "What is the primary benefit of declaring an authentication setup project under 'projects' with 'dependencies'?",
            options: [
              "It bypasses Playwright's strict mode checks.",
              "It generates a reusable authenticated storageState once, allowing subsequent browser projects to execute in parallel without repeating UI logins.",
              "It automatically installs browser binaries if they are missing.",
              "It forces all tests to run sequentially on a single thread."
            ],
            correctOptionIndex: 1,
            explanation: "Setup projects execute before dependent projects, authenticating a user and serializing cookies/localStorage to disk. Dependent browser projects simply load the storageState, saving thousands of seconds across test suites."
          },
          {
            id: "kc-context-options",
            topic: "Browser Context Options",
            question: "Which of the following is a Browser Context setting (configured inside 'use') rather than a Test Runner setting?",
            options: [
              "workers",
              "testDir",
              "viewport",
              "forbidOnly"
            ],
            correctOptionIndex: 2,
            explanation: "'viewport' configures the browser window dimensions inside the browser context. In contrast, 'workers', 'testDir', and 'forbidOnly' are test runner orchestration settings."
          },
          {
            id: "kc-reporters",
            topic: "Reporters",
            question: "Why is 'html' reporter configured with '{ open: \"never\" }' in automated CI pipelines?",
            options: [
              "Because HTML reports cannot be viewed on Linux.",
              "To prevent Playwright from trying to launch an interactive browser window on headless CI servers, which causes process hangs.",
              "Because HTML reports consume double the CPU memory.",
              "To encrypt the test results."
            ],
            correctOptionIndex: 1,
            explanation: "In headless CI environments, attempting to open a browser window on test completion hangs the runner. Setting 'open: \"never\"' writes the static report files silently to disk for CI artifact upload."
          },
          {
            id: "kc-baseurl",
            topic: "baseURL",
            question: "When 'baseURL: \"http://127.0.0.1:5173\"' is configured, what does 'await page.goto(\"/practice/login\")' do?",
            options: [
              "It throws an invalid URL error because the protocol is missing.",
              "It resolves the relative path against baseURL, navigating directly to 'http://127.0.0.1:5173/practice/login'.",
              "It searches Google for the keyword '/practice/login'.",
              "It opens a blank tab and waits for manual user input."
            ],
            correctOptionIndex: 1,
            explanation: "Playwright automatically prepends the configured baseURL to any relative path passed to 'page.goto()' or 'request' fixtures, making tests completely independent of specific hostnames or ports."
          },
          {
            id: "kc-webserver",
            topic: "webServer",
            question: "Why is 'reuseExistingServer: !process.env.CI' recommended in the webServer configuration?",
            options: [
              "It ensures developers don't have to restart their local dev server on every test run, while CI always starts a clean, isolated server instance.",
              "It stops the web server automatically when a test fails.",
              "It reuses browser tabs across different machines.",
              "It prevents Playwright from running in parallel."
            ],
            correctOptionIndex: 0,
            explanation: "Locally, developers usually have a dev server already running on port 5173; reusing it saves 10-30 seconds per test run. On CI, setting reuse to false guarantees that Playwright boots a pristine server without stale state."
          },
          {
            id: "kc-env-vars",
            topic: "Environment Variables",
            question: "What is the security risk of configuring 'ignoreHTTPSErrors: true' unconditionally in production test suites?",
            options: [
              "It crashes the Playwright test runner.",
              "It allows tests to proceed over invalid, expired, or compromised SSL certificates, blinding the team to production HTTPS misconfigurations and MITM vulnerabilities.",
              "It deletes all cookies stored in the browser.",
              "It slows down test execution by 90%."
            ],
            correctOptionIndex: 1,
            explanation: "'ignoreHTTPSErrors: true' instructs browser engines to ignore SSL certificate validation errors. In production or pre-prod suites, this masks expired certificates, hostname mismatches, or dangerous security misconfigurations."
          }
        ],
        practiceTask: {
          labRoute: "/lab/browser",
          labName: "Browser Lab",
          objective: "Inspect responsive viewports, custom timeouts, and test multi-browser configurations using isolated practice configs.",
          instructions: [
            "Open your terminal in the project root.",
            "Inspect the isolated configuration at e2e/practice-configs/exercise1-testdir.config.ts.",
            "Run the test using the custom config flag: npx playwright test --config=e2e/practice-configs/exercise1-testdir.config.ts.",
            "Verify that only practice-configs.spec.ts is executed and that both relative navigation tests pass cleanly.",
            "Inspect exercise8-ci.config.ts to see how CI environment variables conditionally branch retries and workers."
          ],
          acceptanceCriteria: [
            "Practice configuration executes cleanly via --config flag.",
            "Relative baseURL navigation passes without hardcoded hostnames.",
            "Both tests in practice-configs.spec.ts pass within the actionTimeout window."
          ],
          hint: "Pass the config file using --config=e2e/practice-configs/exercise1-testdir.config.ts. The test runner will load options from that file instead of the default playwright.config.ts.",
          solutionCode: `import { defineConfig } from "@playwright/test";

// Exercise practice configuration
export default defineConfig({
  testDir: "../",
  testMatch: /practice-configs\\.spec\\.ts/,
  fullyParallel: true,
  timeout: 15_000,
  expect: {
    timeout: 4_000,
  },
  use: {
    baseURL: "http://127.0.0.1:5173",
    actionTimeout: 10_000,
    trace: "retain-on-failure",
  },
});`,
          playwrightCommand: "npx playwright test --config=e2e/practice-configs/exercise1-testdir.config.ts",
          outputInterpretation: `=== PASSING CONFIGURATION TEST OUTPUT ===
Running 2 tests using 1 worker
  ok 1 e2e/practice-configs.spec.ts:4:7 › Practice Configurations Verification › resolves relative path navigation against configured baseURL (905ms)
  ok 2 e2e/practice-configs.spec.ts:11:7 › Practice Configurations Verification › verifies input controls are accessible within actionTimeout window (681ms)
  2 passed (2.6s)

Interpretation:
- The '--config' flag successfully instructed Playwright to use the isolated exercise configuration.
- 'testDir' and 'testMatch' accurately constrained test execution to 'practice-configs.spec.ts'.
- 'baseURL' resolved the relative path '/practice/login' to 'http://127.0.0.1:5173/practice/login' seamlessly.`
        },
        interviewQuestions: [
          {
            question: "What is the difference between a Playwright Worker, a Browser, and a BrowserContext?",
            answer: "A Worker is an independent Node.js OS process that executes test files in parallel. Each Worker launches a Browser instance (or connects to one). Inside a Worker, every single test runs in a brand new, isolated BrowserContext (an in-memory sandbox equivalent to an Incognito window). Multiple tests in the same worker never share cookies, localStorage, or cache. Creating a BrowserContext takes 2ms, allowing hundreds of sterile tests to run without browser relaunch overhead.",
            architecturalContext: "This 3-tier architecture (Node Worker Process -> Browser Binary -> Ephemeral BrowserContext) provides complete test isolation while delivering execution speeds up to 10x faster than legacy Selenium WebDriver frameworks."
          },
          {
            question: "Why is 'baseURL' considered a non-negotiable architectural standard in Playwright test suites?",
            answer: "Configuring 'baseURL' decouples test scripts from environment hostnames and ports. Tests use relative paths ('await page.goto(\"/practice/login\")'), enabling the exact same test suite to run against local development (127.0.0.1:5173), ephemeral PR preview containers, staging environments, and production canary clusters simply by overriding the BASE_URL environment variable.",
            architecturalContext: "Eliminates hardcoded hostnames, port collision errors, and brittle find-and-replace scripts when deploying across enterprise multi-environment CI/CD pipelines."
          },
          {
            question: "What are the architectural dangers of excessive test retries in enterprise CI pipelines?",
            answer: "Retries should be a safety net for genuine infrastructure instability, not a dumping ground for flaky tests. When suites allow 3-5 retries, developers stop investigating race conditions, timing issues, and database deadlocks. A suite with 10 flaky tests retried 3 times can extend CI build duration by 30-45 minutes and conceal severe production bugs that occur intermittently under heavy user load.",
            architecturalContext: "Senior SDETs enforce retries: 0 in local dev and retries: 1 in CI, coupled with automated quarantine and alerting systems that flag any test that passes on retry."
          },
          {
            question: "Why does Playwright prefer Setup Projects with dependencies over legacy globalSetup scripts?",
            answer: "Legacy 'globalSetup' runs outside the test runner in a separate Node context, lacking access to fixtures, browser context options, tracing, and reporters. In contrast, a Setup Project (e.g. { name: 'setup', testMatch: /.*\\.setup\\.ts/ }) is a first-class Playwright test. It has access to the full 'page' and 'request' fixtures, generates traces if authentication fails, and integrates into the dependency graph via 'dependencies: [\"setup\"]'.",
            architecturalContext: "Enables declarative session generation, HTML reporting on setup failures, and seamless multi-role authentication caching."
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
        id: "playwright-locators",
        moduleSlug: "locators-and-selectors",
        moduleTitle: "Modern Semantic Locators & Strict Mode",
        title: "Playwright Locators — Beginner to Advanced",
        difficulty: "Intermediate",
        durationMinutes: 35,
        prerequisites: [
          "playwright-introduction",
          "configuration-and-browsers"
        ],
        summary: "A comprehensive, progressive guide to Playwright's locator architecture: from lazy evaluation, automatic waiting, and user-facing built-in locators (role, label, placeholder, text, alt, title, test-id) to CSS/XPath trade-offs, container composition, strict-mode disambiguation, dynamic DOM handling, and senior SDET debugging.",
        sections: [
          {
            id: "locator-fundamentals",
            title: "Part A — Locator Fundamentals & Architecture",
            content: `What is a Playwright Locator?
A Locator in Playwright represents a view to an element (or elements) on the page. Unlike legacy Selenium WebElements or Puppeteer ElementHandles, a locator is not an in-memory pointer to a specific DOM node; rather, it is a declarative query recipe that describes how to locate the target element at the exact instant an action or assertion is performed.

Locators vs. ElementHandles (The Architectural Shift):
In legacy automation frameworks like Selenium (driver.findElement), querying an element immediately captures an ElementHandle. If the frontend framework (React, Vue, Angular) triggers a state update, page animation, or re-renders the component, that DOM node is detached. Any subsequent action throws the notorious 'StaleElementReferenceException'.
Playwright locators completely eliminate stale element errors. A locator stores the query logic, not the DOM pointer. Whenever you call an action like .click() or .fill(), Playwright re-evaluates the query in the fresh DOM tree.

Lazy Evaluation & Zero Overhead:
Creating a locator does not perform any browser communication, execute JavaScript in the page, or search the DOM:
const submitButton = page.getByRole("button", { name: "Submit Order" });
This statement executes synchronously in zero milliseconds. No DOM query occurs until you perform an action or run an assertion:
await submitButton.click(); // Evaluation happens here!

The Actionability Engine & Automatic Waiting:
Before performing an action on an element, Playwright automatically runs an actionability audit against the locator:
1. Attached: Element is present in the DOM tree.
2. Visible: Element is visible (non-zero bounding box, not display:none or visibility:hidden).
3. Stable: Element is not undergoing CSS animations or layout shifts.
4. Receives Events: Element's hit-target is not obstructed by modals, overlays, or floating banners.
5. Enabled: Element does not have the 'disabled' attribute or ARIA disabled state.
Playwright repeats these checks up to the configured actionTimeout (default 0ms or configured 10_000ms). You never need to write manual sleeps or arbitrary polling loops.

Why Reliable Locator Selection Dictates Test Suite Health:
Test flakiness in enterprise applications stems almost entirely from brittle selectors. Selectors tightly coupled to HTML hierarchy (div > div:nth-child(3) > span) or CSS styling (.btn-orange-500) break upon the slightest UI refactoring or CSS utility redesign. Playwright advocates for user-facing locators that reflect how humans and assistive screen readers navigate the application.`
          },
          {
            id: "builtin-locators",
            title: "Part B — Built-In User-Facing Locators",
            content: `Playwright provides 7 built-in, accessible locator methods. They reflect the W3C Accessibility Tree and user perception rather than implementation details.

1. page.getByRole(role, { name, exact, level, disabled, checked, expanded, includeHidden }):
The highest-priority locator in Playwright. It matches elements by their semantic ARIA role (e.g. button, heading, textbox, combobox, link, checkbox, row, dialog) and accessible name.
- Example: await page.getByRole("button", { name: "Run check" }).click();
- Advantages: Tests functional accessibility, survives CSS and DOM rewrites, enforces valid markup.
- Limitations: Requires accessible HTML or explicit ARIA attributes; ambiguous if multiple identical controls lack container scoping.

2. page.getByLabel(text, { exact }):
Locates input controls (<input>, <textarea>, <select>) associated with a <label> via htmlFor/id, nesting, or aria-labelledby.
- Example: await page.getByLabel("Search courses").fill("Playwright");
- Advantages: Guarantees that form fields are accessible to screen readers and keyboard users.
- Limitations: Only targets form controls; fails if labels lack correct htmlFor/id linkage (demonstrated in our Locator Gym).

3. page.getByPlaceholder(text, { exact }):
Locates inputs by their placeholder attribute.
- Example: await page.getByPlaceholder("Try Playwright").fill("locators");
- Advantages: Convenient for search bars or inputs that lack permanent visual labels.
- Limitations: Placeholders disappear once text is typed; should not replace proper labels for complex forms.

4. page.getByText(text, { exact }):
Searches the non-interactive text content of the DOM.
- Example: await expect(page.getByText("Check finished")).toBeVisible();
- Advantages: Exceptional for asserting confirmation messages, alert banners, and static typography.
- Limitations: Not recommended for interactive elements (use getByRole for buttons and links instead).

5. page.getByAltText(text, { exact }):
Locates images, area elements, or icons by their alt text attribute.
- Example: await expect(page.getByAltText("Company Logo")).toBeVisible();
- Advantages: Ensures imagery has meaningful screen-reader alternatives.

6. page.getByTitle(text, { exact }):
Locates elements with a HTML title attribute or SVG <title>.
- Example: await page.getByTitle("Locator gym shortcut").click();
- Advantages: Great for icon buttons or tooltips backed by native browser title attributes.

7. page.getByTestId(testId):
Queries elements with data-testid (or custom attribute defined in playwright.config.ts).
- Example: await page.getByTestId("stable-action").click();
- Advantages: Dedicated hook that remains constant even if UX copy or accessibility structure changes.
- Limitations: Does not test what the user sees; over-reliance can lead to shipping inaccessible UIs.

Accessible Name Computation & Exact Matching:
Browsers compute accessible names using a strict W3C hierarchy: aria-labelledby > aria-label > associated <label> / native attributes > inner text.
By default, Playwright uses substring matching and ignores case. Passing { exact: true } requires a full, case-sensitive character match:
page.getByRole("button", { name: "Save", exact: true });`
          },
          {
            id: "css-and-xpath",
            title: "Part C — CSS & XPath Selectors: When to Use & When to Avoid",
            content: `Understanding Low-Level Selectors in Modern Automation:
Playwright supports standard CSS (page.locator(".btn")) and XPath (page.locator("//button")). However, in resilient automation architectures, these are considered fallbacks rather than primary strategies.

CSS Selectors in Playwright:
Playwright extends standard CSS with powerful pseudo-classes:
- Attribute selectors: page.locator('[data-state="active"]')
- Text matching: page.locator('button:has-text("Submit")')
- Exact text matching: page.locator('button:text-is("Save")')
- Visibility filtering: page.locator('button:visible')

XPath Selectors in Playwright:
XPath allows arbitrary traversal up and down the DOM tree:
- Relative path: page.locator('//button[normalize-space()="Save"]')
- Parent traversal: page.locator('//span[text()="Locators"]/ancestor::li//button')

When CSS or XPath is Justified:
1. Custom data attributes from UI component libraries (e.g. Radix UI or Headless UI data-state="open").
2. Canvas, SVG vector paths, or charts that lack native ARIA roles.
3. Complex DOM layout testing or styling property verification.

Why Deep CSS and XPath Selectors Must Be Avoided:
- Fragile to Markup Refactoring: A selector like 'div.space-y-1\\.5 > input#course-search' breaks when classes are altered or wrappers are introduced.
- Non-Semantic: They do not verify whether an assistive screen reader can access or interpret the control.
- Performance: Deep XPath queries require traversing the entire DOM tree, degrading test execution speed.

Migrating Brittle Selectors to Resilient Semantic Locators:
- Refactor 'button.btn-primary' -> page.getByRole("button", { name: "Submit" })
- Refactor 'input#email-input' -> page.getByLabel("Email Address")
- Refactor '//div[text()="Order 101"]/..//button' -> page.getByRole("row").filter({ hasText: "Order 101" }).getByRole("button", { name: "View" })`
          },
          {
            id: "locator-composition",
            title: "Part D — Locator Composition, Scoping & Strict Mode",
            content: `Chaining Locators for Contextual Precision:
You can chain locators together to drill into specific DOM hierarchies:
const modal = page.getByRole("dialog", { name: "Edit User" });
const saveButton = modal.getByRole("button", { name: "Save Changes" });
await saveButton.click();
This guarantees that only the Save button inside the 'Edit User' dialog is targeted, ignoring other Save buttons on the background screen.

Container Filtering with .filter():
When repeated elements (cards, table rows, list items) share identical internal buttons, use .filter() to narrow the query:
1. filter({ hasText: "string" | RegExp }): Matches containers containing specific text.
   const row = page.getByRole("listitem").filter({ hasText: "Fixtures" });
2. filter({ has: locator }): Matches containers containing an element that satisfies a nested locator query.
   const activeCard = page.getByRole("article").filter({ has: page.getByRole("badge", { name: "Active" }) });
3. filter({ hasNotText: "string" }): Excludes containers containing specific text.
4. filter({ hasNot: locator }): Excludes containers matching a child locator.

Combining Locators with .and() and .or():
- locator.and(otherLocator): Matches elements that satisfy BOTH criteria simultaneously:
  const criticalBtn = page.getByRole("button").and(page.getByTitle("Urgent Action"));
- locator.or(otherLocator): Matches elements that satisfy EITHER criteria:
  const confirmation = page.getByRole("heading", { name: "Welcome" }).or(page.getByRole("heading", { name: "Sign In" }));

Understanding Playwright Strict Mode Violations:
By default, all single-element locator actions (click, fill, check, selectOption) enforce Strict Mode. If a locator resolves to more than one element, Playwright halts execution immediately with a strict-mode violation error:
Error: strict mode violation: getByRole("button", { name: "Edit" }) resolved to 2 elements.
Why is this a good thing? In Selenium, driver.findElement() silently clicks the first matching element in the DOM. If your app adds a new button or re-renders, tests silently click the wrong control, causing bizarre downstream bugs. Playwright's strict mode forces you to disambiguate.

Avoiding Blind .first() or .nth() Anti-Patterns:
Calling locator.first() or locator.nth(2) silences strict mode, but it creates extremely brittle tests. If list rows reorder, paginate, or dynamic filters apply, your test clicks the wrong item silently. Always prefer container filtering:
// Anti-Pattern:
page.getByRole("listitem").nth(1).getByRole("button").click();
// Resilient Pattern:
page.getByRole("listitem").filter({ hasText: "Fixtures" }).getByRole("button", { name: "Open" }).click();`
          },
          {
            id: "dynamic-interfaces",
            title: "Part E — Dynamic Interfaces & Async DOM Behavior",
            content: `Automating Modern Single Page Applications (SPAs):
Modern applications dynamically mount, unmount, animate, and re-order components via React, Vue, or WebSockets. Playwright is architected specifically to handle these dynamic lifecycles reliably.

Dynamic Lists & Repeated Components:
When interacting with dynamic collections, use locator-based assertions rather than manual loops:
const courses = page.getByRole("list", { name: "Courses" }).getByRole("listitem");
await expect(courses).toHaveCount(3);
await expect(courses).toContainText(["Locators", "Fixtures", "Unstable row"]);

Tables & Row-Specific Actions:
In tabular interfaces, rows are containers (<tr role="row">). Scope your queries by row identifier:
const userRow = page.getByRole("row").filter({ hasText: "Alice Chen" });
await userRow.getByRole("button", { name: "Edit user" }).click();

Hidden vs. Visible Duplicate Elements:
A key advantage of Playwright's accessible locators is that getByRole automatically ignores elements with display:none, visibility:hidden, or the hidden attribute.
In our Locator Gym, there are three <button>Save</button> elements in the HTML, but one is wrapped in <div hidden>.
- page.getByRole("button", { name: "Save" }) resolves only the 2 visible buttons.
- A raw DOM selector page.locator('button:text-is("Save")') resolves all 3 elements, causing unexpected errors.
If you explicitly need to target a hidden element, use { includeHidden: true }.

Delayed Rendering & DOM Replacement:
When a backend API responds with a delay, or a component disclosure expands, elements dynamically mount into the DOM. Playwright's web-first assertions (await expect(locator).toBeVisible()) automatically poll the DOM up to expect timeout (5000ms), eliminating the need for arbitrary sleeps.

Shadow DOM Piercing:
Playwright pierces open Shadow DOM roots automatically. You do not need to execute driver.executeScript or use shadowRoot.querySelector. Standard user-facing locators (getByRole, getByLabel, getByText) penetrate shadow trees seamlessly.`
          },
          {
            id: "debugging-and-best-practices",
            title: "Part F — Locator Debugging & Enterprise Best Practices",
            content: `Diagnosing Zero Matches ('Waiting for locator... timed out'):
When Playwright times out waiting for an element:
1. Inspect Accessible Role & Name: Open Chrome DevTools, navigate to the Elements panel, open the Accessibility tab, and inspect the 'Computed Properties'. Often an accessible name is formatted differently than inner text (e.g. includes icon labels or aria-labels).
2. Check Iframe Encapsulation: Is the element rendered inside an <iframe>? Locators must use page.frameLocator() for iframes.
3. Check Element Visibility: Did an animation fail or is the element hidden behind an obstruction?
4. Verify State: Check if the element is disabled, readonly, or detached.

Diagnosing Multiple Matches (Strict Mode Violations):
When a strict mode error occurs, Playwright's error message lists all matching elements:
1. Examine the candidates in the console trace.
2. Determine what distinguishes the target element: a parent card heading? a container role? a specific text label?
3. Apply container scoping (parent.getByRole) or filter({ hasText }).

Playwright Inspector & Debugging Tools:
1. page.pause(): Pauses test execution and opens the Playwright Inspector window. You can interact with the page, pick locators, and step through line by line.
2. Playwright Codegen: Run 'pnpm exec playwright codegen http://127.0.0.1:5173/lab/locators' to record user interactions and generate semantic locators automatically.
3. VS Code / Terminal UI Mode: Run 'pnpm run test:e2e:ui' for time-travel debugging and visual locator inspection.

The Senior SDET Locator Selection Hierarchy (Decision Tree):
Tier 1: page.getByRole() — Primary choice for all interactive controls (buttons, headings, links, dialogs, checkboxes).
Tier 2: page.getByLabel() — Primary choice for form inputs (<input>, <textarea>, <select>).
Tier 3: page.getByPlaceholder() — For inputs with obvious placeholder hints lacking labels.
Tier 4: page.getByText() — For static text assertions, banners, and toast messages.
Tier 5: page.getByAltText() / page.getByTitle() — For images and title tooltips.
Tier 6: page.getByTestId() — For dynamic custom widgets where semantic markup is impossible.
Tier 7: page.locator(css) / XPath — ONLY for custom data attributes, SVG paths, or third-party iframe fallbacks.

Eliminating Fixed Sleeps:
Never use 'await page.waitForTimeout(3000)'. Fixed sleeps make test suites slow and inevitably fail in slower CI environments. Always await web-first assertions:
await expect(page.getByRole("status")).toHaveText("Check finished");`
          }
        ],
        codeExamples: [
          {
            id: "example-fundamentals",
            caption: "Locator Creation vs Actionability Evaluation",
            language: "typescript",
            code: `// 1. Defining locators executes synchronously (0ms, no DOM queries)
const searchInput = page.getByLabel("Search courses");
const runCheckBtn = page.getByRole("button", { name: "Run check" });

// 2. Action method triggers automatic waiting and actionability audit
await searchInput.fill("Playwright Locators");

// 3. Web-first assertion polls the DOM automatically until matched
await expect(searchInput).toHaveValue("Playwright Locators");
await runCheckBtn.click();
await expect(page.getByRole("status")).toHaveText("Check finished");`,
            lineExplanations: [
              { line: 2, explanation: "Instantiates a lazy locator recipe in memory without querying the DOM." },
              { line: 6, explanation: "Actionability checks run: Attached, Visible, Stable, Enabled, Unobstructed." },
              { line: 9, explanation: "Web-first assertion polls until toHaveValue matches, eliminating sleeps." }
            ]
          },
          {
            id: "example-builtin-locators",
            caption: "All 7 Built-In Semantic Locators in Practice",
            language: "typescript",
            code: `// 1. By semantic ARIA role + computed name
await page.getByRole("button", { name: "Run check" }).click();

// 2. By associated form label
await page.getByLabel("Search courses").fill("Locators");

// 3. By placeholder text
await page.getByPlaceholder("Try Playwright").fill("Test");

// 4. By non-interactive visible text
await expect(page.getByText("Check finished")).toBeVisible();

// 5. By title attribute
await page.getByTitle("Locator gym shortcut").click();

// 6. By image accessible alt text
await expect(page.getByRole("img", { name: "Locator map" })).toBeVisible();

// 7. By test ID attribute
await page.getByTestId("stable-action").click();`,
            lineExplanations: [
              { line: 2, explanation: "Matches element with role='button' and accessible name 'Run check'." },
              { line: 5, explanation: "Finds <input> associated with <label>Search courses</label> via htmlFor/id." },
              { line: 8, explanation: "Finds input displaying placeholder='Try Playwright'." },
              { line: 11, explanation: "Asserts non-interactive text node in the document." },
              { line: 14, explanation: "Locates link or button having title='Locator gym shortcut'." },
              { line: 17, explanation: "Locates SVG/image element having aria-label='Locator map'." },
              { line: 20, explanation: "Fallback query for data-testid='stable-action'." }
            ]
          },
          {
            id: "example-refactor-brittle",
            caption: "Migrating Fragile CSS & XPath to User-Facing Locators",
            language: "typescript",
            code: `// ❌ Fragile Anti-Pattern (breaks on CSS redesign or class refactoring):
// await page.locator("div.space-y-1\\\\.5 > input#course-search").fill("data");
// await page.locator("//section[1]//button[@data-testid='stable-action']").click();

// ✅ Resilient User-Facing Pattern:
const searchField = page.getByLabel("Search courses");
await searchField.fill("Resilient Test Architecture");
await expect(searchField).toHaveValue("Resilient Test Architecture");

const submitBtn = page.getByRole("button", { name: "Run check" });
await submitBtn.click();
await expect(page.getByRole("status")).toHaveText("Check finished");`,
            lineExplanations: [
              { line: 6, explanation: "Replaces deep DOM path with user-facing label query." },
              { line: 10, explanation: "Replaces brittle XPath index with semantic button role." }
            ]
          },
          {
            id: "example-composition-filter",
            caption: "Advanced Container Scoping and .filter({ has, hasText })",
            language: "typescript",
            code: `// Disambiguate duplicate buttons using container scoping
const buttonGroup = page.getByRole("group", { name: "Visible saves" });
const firstSaveBtn = buttonGroup.getByRole("button", { name: "Save" }).first();
await firstSaveBtn.click();
await expect(page.getByRole("status")).toHaveText("Saved first copy");

// Filter list items using a child locator condition
const locatorsCard = page
  .getByRole("listitem")
  .filter({ has: page.getByText("Locators", { exact: true }) });
await locatorsCard.getByRole("button", { name: "Open" }).click();
await expect(page.getByRole("status")).toHaveText("Opened Locators");`,
            lineExplanations: [
              { line: 2, explanation: "Scopes query to group landmark 'Visible saves'." },
              { line: 8, explanation: "Filters list items containing the specific child text node 'Locators'." },
              { line: 11, explanation: "Clicks Open strictly inside the matched component container." }
            ]
          },
          {
            id: "example-dynamic-tables",
            caption: "Robust Row Scoping in Tables & Dynamic Lists",
            language: "typescript",
            code: `// Target list item in dynamic collection without using brittle numeric index (.nth)
const coursesList = page.getByRole("list", { name: "Courses" });
const fixturesRow = coursesList
  .getByRole("listitem")
  .filter({ hasText: "Fixtures" });

await expect(fixturesRow).toBeVisible();
await fixturesRow.getByRole("button", { name: "Open" }).click();
await expect(page.getByRole("status")).toHaveText("Opened Fixtures");`,
            lineExplanations: [
              { line: 2, explanation: "Locates parent list container by accessible name." },
              { line: 3, explanation: "Filters items down to the single row containing 'Fixtures'." },
              { line: 8, explanation: "Executes row-specific button action without array index coupling." }
            ]
          },
          {
            id: "example-debugging-strict-mode",
            caption: "Strict Mode Disambiguation & Hidden Element Handling",
            language: "typescript",
            code: `// Unscoped click on ambiguous button triggers strict mode violation:
// await page.getByRole("button", { name: "Edit" }).click(); // ❌ Throws error!

// Diagnose candidates & resolve via parent region scoping:
const editRegion = page.getByRole("region", { name: "Duplicate accessible names" });
await editRegion.getByRole("button", { name: "Edit" }).first().click();
await expect(page.getByRole("status")).toHaveText("Edit activated");

// Notice getByRole automatically excludes hidden elements:
await expect(page.getByRole("button", { name: "Save" })).toHaveCount(2); // Only 2 visible
await expect(page.locator('button:text-is("Save")')).toHaveCount(3); // Includes <div hidden>`,
            lineExplanations: [
              { line: 5, explanation: "Scopes search to region to isolate duplicate buttons." },
              { line: 10, explanation: "getByRole queries accessibility tree, ignoring non-rendered hidden nodes." },
              { line: 11, explanation: "Raw DOM query includes hidden node, demonstrating selector divergence." }
            ]
          }
        ],
        commonMistakes: [
          {
            title: "Using .first() or .nth() to silence strict-mode errors",
            badPractice: `page.getByRole("button", { name: "Save" }).first().click();`,
            goodPractice: `page.getByRole("group", { name: "Visible saves" }).getByRole("button", { name: "Save" }).first().click();`,
            explanation: "Calling .first() on global unscoped queries silences strict mode and masks accidental DOM duplication bugs. When page layout or sort order changes, .first() silently clicks the wrong item. Scope to the parent container instead."
          },
          {
            title: "Writing fragile CSS class or deep descendant selectors",
            badPractice: `page.locator("div.space-y-1\\\\.5 > input#course-search");`,
            goodPractice: `page.getByLabel("Search courses");`,
            explanation: "Selectors tied to markup structure or Tailwind classes break upon minor UI redesigns. User-facing locators survive styling refactorings because they bind to element semantics."
          },
          {
            title: "Using page.waitForTimeout() instead of locator web-first assertions",
            badPractice: `await page.waitForTimeout(3000);\\nawait page.getByRole("button").click();`,
            goodPractice: `await expect(page.getByRole("button")).toBeVisible();\\nawait page.getByRole("button").click();`,
            explanation: "Arbitrary sleeps slow down test suites and inevitably produce flaky failures in slower CI environments. Web-first assertions poll the DOM automatically."
          },
          {
            title: "Querying buttons or links using getByText instead of getByRole",
            badPractice: `page.getByText("Run check").click();`,
            goodPractice: `page.getByRole("button", { name: "Run check" }).click();`,
            explanation: "getByText matches any DOM node with text, including static paragraphs, tooltips, or labels. getByRole guarantees that the target element actually has the interactive role='button'."
          },
          {
            title: "Over-relying on data-testid instead of accessible HTML",
            badPractice: `page.getByTestId("course-search-field");`,
            goodPractice: `page.getByLabel("Search courses");`,
            explanation: "Test IDs should be a fallback when semantic HTML is impossible. Relying solely on test IDs masks accessibility defects such as broken <label> htmlFor/id associations."
          },
          {
            title: "Assuming hidden elements are excluded from raw DOM selectors",
            badPractice: `expect(page.locator("button:has-text('Save')")).toHaveCount(2);`,
            goodPractice: `expect(page.getByRole("button", { name: "Save" })).toHaveCount(2);`,
            explanation: "Raw DOM queries match all matching nodes, even if wrapped in <div hidden> or styled with display:none. getByRole queries the accessibility tree, correctly ignoring hidden elements."
          }
        ],
        playground: {
          title: "Playwright Locator Architecture Blueprint & Strategy Matrix",
          configExample: `import { test, expect } from "@playwright/test";

test("demonstrates resilient industrial locator architecture", async ({ page }) => {
  await page.goto("/lab/locators");

  // 1. Tier 1: Query by accessible role & name
  const mainHeading = page.getByRole("heading", {
    name: "Choose a locator that survives a redesign.",
    level: 1,
  });
  await expect(mainHeading).toBeVisible();

  // 2. Tier 2: Form control associated via label
  const searchInput = page.getByLabel("Search courses");
  await searchInput.fill("Architecture");
  await expect(searchInput).toHaveValue("Architecture");

  // 3. Container Scoping & Disambiguation
  const buttonGroup = page.getByRole("group", { name: "Visible saves" });
  await buttonGroup.getByRole("button", { name: "Save" }).first().click();
  await expect(page.getByRole("status")).toHaveText("Saved first copy");

  // 4. Container filtering without positional index
  const row = page
    .getByRole("list", { name: "Courses" })
    .getByRole("listitem")
    .filter({ hasText: "Fixtures" });
  await row.getByRole("button", { name: "Open" }).click();
  await expect(page.getByRole("status")).toHaveText("Opened Fixtures");
});`,
          properties: [
            {
              name: "getByRole(role, { name })",
              type: "Accessibility Query",
              defaultValue: "Strict Mode (1)",
              description: "Queries the W3C Accessibility Tree by ARIA role and computed accessible name.",
              impact: "Gold standard. Survives CSS refactorings, Tailwind rewrites, and structural DOM changes."
            },
            {
              name: "getByLabel(text)",
              type: "Form Control Query",
              defaultValue: "Strict Mode (1)",
              description: "Locates inputs linked to a label via htmlFor/id, nesting, or aria-labelledby.",
              impact: "Ensures form controls are accessible to assistive technologies and automated suites alike."
            },
            {
              name: "getByPlaceholder(text)",
              type: "Attribute Query",
              defaultValue: "Strict Mode (1)",
              description: "Locates text fields matching the input placeholder attribute.",
              impact: "Best for search fields lacking visual labels. Disappears once text is entered."
            },
            {
              name: "getByText(text)",
              type: "DOM Text Search",
              defaultValue: "Strict Mode (1)",
              description: "Locates non-interactive DOM text nodes using substring or exact matching.",
              impact: "Ideal for asserting banners, error alerts, and status confirmations. Avoid for buttons."
            },
            {
              name: "getByTestId(id)",
              type: "Test Hook Query",
              defaultValue: "Strict Mode (1)",
              description: "Queries data-testid attributes directly without relying on UI text or semantics.",
              impact: "Resilient fallback for complex dynamic widgets. Does not test user accessibility."
            },
            {
              name: "locator.filter({ hasText, has })",
              type: "Composition Predicate",
              defaultValue: "All Matches",
              description: "Narrows matching candidate elements based on text or child locator conditions.",
              impact: "Eliminates .nth() and .first() index fragility in tables, grids, and dynamic lists."
            },
            {
              name: "locator.and() / locator.or()",
              type: "Set Operation",
              defaultValue: "Boolean Logic",
              description: "Combines two locators with logical intersection (and) or union (or).",
              impact: "Handles polymorphic components, A/B test states, and multi-attribute constraints cleanly."
            }
          ],
          behaviorComparison: [
            {
              aspect: "User-Facing vs DOM-Coupled",
              defaultBehavior: "getByRole('button', { name: 'Save' }) queries the accessibility tree and ignores CSS classes.",
              customizedBehavior: "locator('div.actions > button.btn-primary') breaks when CSS or layout structure refactors."
            },
            {
              aspect: "Disambiguation Strategy",
              defaultBehavior: ".filter({ hasText: 'Fixtures' }) binds specifically to the content of the target row.",
              customizedBehavior: ".nth(1) or .first() silences strict mode and silently clicks the wrong item when sorted."
            },
            {
              aspect: "Hidden Elements Handling",
              defaultBehavior: "getByRole ignores hidden elements (display:none, hidden attribute) automatically.",
              customizedBehavior: "Raw DOM queries locator('button:has-text(\"Save\")') match hidden nodes and fail."
            },
            {
              aspect: "Timing & Actionability",
              defaultBehavior: "Locators auto-wait for element to be attached, visible, stable, enabled, and unobstructed.",
              customizedBehavior: "Manual page.waitForTimeout(3000) creates slow, fragile tests that fail in CI."
            }
          ],
          practiceTask: "Explore the live Locator Gym at /lab/locators. Inspect accessible names, filter nested rows with hasText, and disambiguate duplicate button groups.",
          localCommand: "pnpm exec playwright test e2e/practice-locators.spec.ts"
        },
        exercises: [
          {
            id: "ex1-heading",
            title: "Exercise 1: Locate a Heading by Role and Accessible Name",
            objective: "Identify level-1 and level-2 headings using accessible role queries without CSS classes.",
            prerequisites: ["Basic Playwright test runner knowledge", "Lab running at /lab/locators"],
            starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 1: Locate heading by role and accessible name", async ({ page }) => {
  await page.goto("/lab/locators");
  // TODO: Locate h1 heading using getByRole
  // TODO: Locate h2 section heading 'Stable locators'
});`,
            task: "Locate the primary page h1 heading and the 'Stable locators' h2 heading using page.getByRole('heading') with exact accessible names.",
            acceptanceCriteria: [
              "Uses getByRole('heading', { name: ... })",
              "Asserts visibility with toBeVisible()",
              "Zero CSS or tag-based selectors"
            ],
            expectedBehavior: "Playwright queries the accessibility tree and confirms both headings are visible.",
            hint: "Pass level: 1 and level: 2 in the getByRole options object to explicitly verify heading hierarchy.",
            solution: `import { test, expect } from "@playwright/test";

test("Exercise 1: Locate heading by role and accessible name", async ({ page }) => {
  await page.goto("/lab/locators");
  const mainHeading = page.getByRole("heading", {
    name: "Choose a locator that survives a redesign.",
    level: 1,
  });
  await expect(mainHeading).toBeVisible();

  const sectionHeading = page.getByRole("heading", {
    name: "Stable locators",
    level: 2,
  });
  await expect(sectionHeading).toBeVisible();
});`,
            troubleshootingNotes: "Ensure you pass the exact accessible name as computed by the browser, including punctuation.",
            command: "pnpm exec playwright test e2e/practice-locators.spec.ts -g 'Exercise 1'"
          },
          {
            id: "ex2-label",
            title: "Exercise 2: Find and Fill a Form Field by Label",
            objective: "Interact with an input field associated with a label element via htmlFor/id.",
            prerequisites: ["Form label semantics", "Locator Gym at /lab/locators"],
            starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 2: Find and fill form field by label", async ({ page }) => {
  await page.goto("/lab/locators");
  // TODO: Locate input via getByLabel('Search courses')
  // TODO: Fill with 'Playwright Locators' and assert value
});`,
            task: "Locate the search input via getByLabel('Search courses'), fill it with 'Playwright Locators', and verify value.",
            acceptanceCriteria: [
              "Uses getByLabel('Search courses')",
              "Asserts value using toHaveValue()",
              "Verifies placeholder match"
            ],
            expectedBehavior: "Input receives focus, text is typed, and toHaveValue verifies the current control value.",
            hint: "Use await expect(searchInput).toHaveValue('Playwright Locators').",
            solution: `import { test, expect } from "@playwright/test";

test("Exercise 2: Find and fill form field by label", async ({ page }) => {
  await page.goto("/lab/locators");
  const searchInput = page.getByLabel("Search courses");
  await searchInput.fill("Playwright Locators");
  await expect(searchInput).toHaveValue("Playwright Locators");
  await expect(page.getByPlaceholder("Try Playwright")).toHaveValue("Playwright Locators");
});`,
            troubleshootingNotes: "getByLabel only resolves controls that have a valid label association (htmlFor matching id, or nested input).",
            command: "pnpm exec playwright test e2e/practice-locators.spec.ts -g 'Exercise 2'"
          },
          {
            id: "ex3-button",
            title: "Exercise 3: Locate a Button by Role and Name",
            objective: "Trigger an action via accessible role and assert on dynamic status feedback.",
            prerequisites: ["Button role semantics", "Web-first assertions"],
            starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 3: Locate button by role and name", async ({ page }) => {
  await page.goto("/lab/locators");
  // TODO: Locate 'Run check' button by role
  // TODO: Click button and assert status 'Check finished'
});`,
            task: "Click the 'Run check' button using getByRole('button', { name: 'Run check' }) and assert on status message.",
            acceptanceCriteria: [
              "Uses getByRole('button', { name: 'Run check' })",
              "Asserts getByRole('status') displays 'Check finished'"
            ],
            expectedBehavior: "Button click triggers state update and status feedback appears in the DOM.",
            hint: "The status message renders with role='status'.",
            solution: `import { test, expect } from "@playwright/test";

test("Exercise 3: Locate button by role and name", async ({ page }) => {
  await page.goto("/lab/locators");
  const runCheckButton = page.getByRole("button", { name: "Run check" });
  await runCheckButton.click();
  const statusMessage = page.getByRole("status");
  await expect(statusMessage).toBeVisible();
  await expect(statusMessage).toHaveText("Check finished");
});`,
            troubleshootingNotes: "Playwright auto-waits for the button to be visible and enabled before clicking.",
            command: "pnpm exec playwright test e2e/practice-locators.spec.ts -g 'Exercise 3'"
          },
          {
            id: "ex4-duplicate",
            title: "Exercise 4: Handle Repeated Text and Duplicate Elements",
            objective: "Disambiguate duplicate buttons with identical accessible names using container scoping.",
            prerequisites: ["Container scoping", "Strict mode concepts"],
            starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 4: Handle repeated text and duplicate elements", async ({ page }) => {
  await page.goto("/lab/locators");
  // TODO: Scope to group 'Visible saves'
  // TODO: Click first and second Save buttons cleanly
});`,
            task: "Scope to the group landmark 'Visible saves', interact with each button, and verify distinct feedback.",
            acceptanceCriteria: [
              "Scopes to page.getByRole('group', { name: 'Visible saves' })",
              "Interacts with first and second buttons without unhandled strict mode errors"
            ],
            expectedBehavior: "Container scoping isolates the two visible buttons from any global duplicates.",
            hint: "Chain page.getByRole('group', { name: 'Visible saves' }).getByRole('button', { name: 'Save' }).",
            solution: `import { test, expect } from "@playwright/test";

test("Exercise 4: Handle repeated text and duplicate elements", async ({ page }) => {
  await page.goto("/lab/locators");
  const buttonGroup = page.getByRole("group", { name: "Visible saves" });
  const saveButtons = buttonGroup.getByRole("button", { name: "Save" });
  await expect(saveButtons).toHaveCount(2);

  await saveButtons.first().click();
  await expect(page.getByRole("status")).toHaveText("Saved first copy");

  await saveButtons.nth(1).click();
  await expect(page.getByRole("status")).toHaveText("Saved second copy");
});`,
            troubleshootingNotes: "Unscoped page.getByRole('button', { name: 'Save' }) would match multiple buttons across the page.",
            command: "pnpm exec playwright test e2e/practice-locators.spec.ts -g 'Exercise 4'"
          },
          {
            id: "ex5-table-row",
            title: "Exercise 5: Locate an Action Within a Specific Table Row",
            objective: "Target a row action inside a dynamic list without relying on fragile numeric indexes.",
            prerequisites: ["List item filtering", "Row scoping"],
            starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 5: Locate action within a specific list item", async ({ page }) => {
  await page.goto("/lab/locators");
  // TODO: Locate Courses list and filter listitem by 'Fixtures'
  // TODO: Click Open button inside that row
});`,
            task: "Find the 'Fixtures' row in the 'Courses' list, click its 'Open' button, and assert status confirms 'Opened Fixtures'.",
            acceptanceCriteria: [
              "Uses .filter({ hasText: 'Fixtures' }) on listitem",
              "Asserts page.getByRole('status') confirms 'Opened Fixtures'",
              "Zero .nth() usage"
            ],
            expectedBehavior: "Playwright filters the list items down to the 'Fixtures' item and clicks its scoped button.",
            hint: "Chain page.getByRole('list', { name: 'Courses' }).getByRole('listitem').filter({ hasText: 'Fixtures' }).",
            solution: `import { test, expect } from "@playwright/test";

test("Exercise 5: Locate action within a specific list item", async ({ page }) => {
  await page.goto("/lab/locators");
  const coursesList = page.getByRole("list", { name: "Courses" });
  const targetRow = coursesList.getByRole("listitem").filter({ hasText: "Fixtures" });
  await expect(targetRow).toBeVisible();

  await targetRow.getByRole("button", { name: "Open" }).click();
  await expect(page.getByRole("status")).toHaveText("Opened Fixtures");
});`,
            troubleshootingNotes: "Filtering by text guarantees that sorting or inserting new rows does not break the test.",
            command: "pnpm exec playwright test e2e/practice-locators.spec.ts -g 'Exercise 5'"
          },
          {
            id: "ex6-filter",
            title: "Exercise 6: Use filter() to Identify the Correct Component",
            objective: "Filter a set of components using a child locator predicate.",
            prerequisites: ["Nested locator filtering", "Exact text matching"],
            starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 6: Use filter with nested locator", async ({ page }) => {
  await page.goto("/lab/locators");
  // TODO: Filter listitem using { has: page.getByText('Locators', { exact: true }) }
  // TODO: Click Open button and verify status
});`,
            task: "Filter listitems with { has: page.getByText('Locators', { exact: true }) }, click Open, and assert 'Opened Locators'.",
            acceptanceCriteria: [
              "Uses .filter({ has: ... }) predicate",
              "Asserts status confirms 'Opened Locators'"
            ],
            expectedBehavior: "Playwright checks which listitem contains the child element satisfying the predicate.",
            hint: "Pass page.getByText('Locators', { exact: true }) to filter({ has: ... }).",
            solution: `import { test, expect } from "@playwright/test";

test("Exercise 6: Use filter with nested locator", async ({ page }) => {
  await page.goto("/lab/locators");
  const locatorsCard = page
    .getByRole("listitem")
    .filter({ has: page.getByText("Locators", { exact: true }) });
  await expect(locatorsCard).toBeVisible();

  await locatorsCard.getByRole("button", { name: "Open" }).click();
  await expect(page.getByRole("status")).toHaveText("Opened Locators");
});`,
            troubleshootingNotes: "filter({ has: locator }) is ideal when matching based on child icons, badges, or specific headings.",
            command: "pnpm exec playwright test e2e/practice-locators.spec.ts -g 'Exercise 6'"
          },
          {
            id: "ex7-strict-mode",
            title: "Exercise 7: Diagnose and Correct a Strict-Mode Violation",
            objective: "Reproduce a strict-mode violation on duplicate Edit buttons and resolve it via container scoping.",
            prerequisites: ["Playwright strict mode error mechanics"],
            starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 7: Diagnose and correct strict-mode violation", async ({ page }) => {
  await page.goto("/lab/locators");
  // TODO: Verify unscoped Edit button triggers strict mode violation
  // TODO: Resolve by scoping to 'Duplicate accessible names' region
});`,
            task: "Capture the strict-mode violation on unscoped Edit buttons, then resolve by scoping to 'Duplicate accessible names'.",
            acceptanceCriteria: [
              "Demonstrates strict-mode error thrown on ambiguous click",
              "Corrects via region scoping and asserts 'Edit activated'"
            ],
            expectedBehavior: "The unscoped click throws an error; the container-scoped query succeeds cleanly.",
            hint: "Use a try/catch block with click({ timeout: 1000 }) to capture the strict mode error.",
            solution: `import { test, expect } from "@playwright/test";

test("Exercise 7: Diagnose and correct strict-mode violation", async ({ page }) => {
  await page.goto("/lab/locators");
  let strictModeErrorCaught = false;
  try {
    await page.getByRole("button", { name: "Edit" }).click({ timeout: 1000 });
  } catch (err: unknown) {
    strictModeErrorCaught = true;
    expect((err as Error).message).toContain("strict mode violation");
  }
  expect(strictModeErrorCaught).toBe(true);

  const defectRegion = page.getByRole("region", { name: "Duplicate accessible names" });
  await defectRegion.getByRole("button", { name: "Edit" }).first().click();
  await expect(page.getByRole("status")).toHaveText("Edit activated");
});`,
            troubleshootingNotes: "Strict mode protects against silent false positives when UI layouts duplicate action buttons.",
            command: "pnpm exec playwright test e2e/practice-locators.spec.ts -g 'Exercise 7'"
          },
          {
            id: "ex8-refactor-brittle",
            title: "Exercise 8: Replace a Brittle CSS or XPath Selector",
            objective: "Migrate fragile CSS class and XPath queries to resilient user-facing locators.",
            prerequisites: ["CSS/XPath selector pitfalls", "Accessible locator alternatives"],
            starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 8: Refactor brittle selectors", async ({ page }) => {
  await page.goto("/lab/locators");
  // Brittle anti-patterns to refactor:
  // page.locator("div.space-y-1\\\\.5 > input#course-search")
  // page.locator("//section[1]//button[@data-testid='stable-action']")
});`,
            task: "Replace brittle CSS and XPath selectors with getByLabel('Search courses') and getByRole('button', { name: 'Run check' }).",
            acceptanceCriteria: [
              "Zero CSS class or XPath selectors",
              "Uses getByLabel and getByRole",
              "Asserts status confirms 'Check finished'"
            ],
            expectedBehavior: "Semantic locators execute cleanly and survive any Tailwind or CSS class refactoring.",
            hint: "Use getByLabel('Search courses') for the input and getByRole('button', { name: 'Run check' }) for the button.",
            solution: `import { test, expect } from "@playwright/test";

test("Exercise 8: Refactor brittle selectors", async ({ page }) => {
  await page.goto("/lab/locators");
  const searchField = page.getByLabel("Search courses");
  await searchField.fill("Resilient Test Architecture");
  await expect(searchField).toHaveValue("Resilient Test Architecture");

  const submitBtn = page.getByRole("button", { name: "Run check" });
  await submitBtn.click();
  await expect(page.getByRole("status")).toHaveText("Check finished");
});`,
            troubleshootingNotes: "Semantic locators bind to accessibility semantics rather than transient DOM structure.",
            command: "pnpm exec playwright test e2e/practice-locators.spec.ts -g 'Exercise 8'"
          },
          {
            id: "ex9-dynamic-dom",
            title: "Exercise 9: Work with a Dynamically Rendered Element",
            objective: "Interact with an expanding disclosure element and assert dynamic DOM mounting without manual sleeps.",
            prerequisites: ["Playwright auto-waiting", "Web-first assertions"],
            starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 9: Work with dynamically rendered element", async ({ page }) => {
  await page.goto("/lab/locators");
  // TODO: Click 'Show stable locator tradeoff' button
  // TODO: Assert explanation text becomes visible without sleep
});`,
            task: "Click 'Show stable locator tradeoff' and assert the unmounted paragraph renders into the DOM.",
            acceptanceCriteria: [
              "Asserts text count is initially 0",
              "Clicks disclosure button",
              "Uses await expect(text).toBeVisible() without sleeps"
            ],
            expectedBehavior: "Web-first assertion polls until the React component updates state and mounts the text.",
            hint: "The text starts with 'Prefer role, label, and placeholder over a test id.'",
            solution: `import { test, expect } from "@playwright/test";

test("Exercise 9: Work with dynamically rendered element", async ({ page }) => {
  await page.goto("/lab/locators");
  const tradeoffText = page.getByText("Prefer role, label, and placeholder over a test id.");
  await expect(tradeoffText).toHaveCount(0);

  const disclosureButton = page.getByRole("button", { name: "Show stable locator tradeoff" });
  await disclosureButton.click();
  await expect(tradeoffText).toBeVisible();
});`,
            troubleshootingNotes: "Never insert page.waitForTimeout() when waiting for state updates. Web-first assertions auto-wait.",
            command: "pnpm exec playwright test e2e/practice-locators.spec.ts -g 'Exercise 9'"
          },
          {
            id: "ex10-senior-debug",
            title: "Exercise 10: Complete a Senior-Level Locator Debugging Challenge",
            objective: "Diagnose intentional accessibility defects and inspect hidden element behavior.",
            prerequisites: ["Accessibility tree inspection", "Hidden element mechanics"],
            starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 10: Senior locator debugging challenge", async ({ page }) => {
  await page.goto("/lab/locators");
  // TODO: Diagnose missing label association in 'Missing association' region
  // TODO: Diagnose mismatched htmlFor/id in 'Mismatched association' region
  // TODO: Compare getByRole count vs raw DOM query count for 'Save' buttons
});`,
            task: "Verify that broken label associations return 0 elements with getByLabel, and that getByRole excludes hidden elements unlike raw DOM queries.",
            acceptanceCriteria: [
              "Verifies missing label produces 0 count in getByLabel",
              "Verifies mismatched htmlFor produces 0 count",
              "Verifies getByRole finds 2 visible Saves while raw DOM finds 3"
            ],
            expectedBehavior: "All three architectural defect assertions confirm the behavior of the accessibility tree.",
            hint: "Inspect regions 'Missing association' and 'Mismatched association', and compare page.getByRole('button', { name: 'Save' }) with page.locator('button:text-is(\"Save\")').",
            solution: `import { test, expect } from "@playwright/test";

test("Exercise 10: Senior locator debugging challenge", async ({ page }) => {
  await page.goto("/lab/locators");
  const missingAssocRegion = page.getByRole("region", { name: "Missing association" });
  await expect(missingAssocRegion.getByLabel("Employee name")).toHaveCount(0);
  await expect(missingAssocRegion.getByRole("textbox")).toBeVisible();

  const mismatchedRegion = page.getByRole("region", { name: "Mismatched association" });
  await expect(mismatchedRegion.getByLabel("Badge number")).toHaveCount(0);
  await expect(mismatchedRegion.locator("#actual-badge")).toBeVisible();

  const accessibleSaves = page.getByRole("button", { name: "Save" });
  await expect(accessibleSaves).toHaveCount(2);

  const rawDomSaves = page.locator('button:text-is("Save")');
  await expect(rawDomSaves).toHaveCount(3);
});`,
            troubleshootingNotes: "This exercise demonstrates why Playwright's semantic locators reflect genuine accessibility defects that raw DOM queries miss.",
            command: "pnpm exec playwright test e2e/practice-locators.spec.ts -g 'Exercise 10'"
          }
        ],
        knowledgeCheck: [
          {
            id: "kc-locator-lazy",
            topic: "Locator Architecture & Evaluation",
            question: "When does Playwright execute DOM queries and communicate with the browser for a locator created via const btn = page.getByRole('button', { name: 'Submit' })?",
            options: [
              "Immediately when page.getByRole() is called.",
              "Synchronously during script compilation before test execution starts.",
              "Lazily at the exact moment an action (e.g. .click()) or web-first assertion (e.g. expect(btn).toBeVisible()) is called.",
              "Only when the page finishes the 'load' lifecycle event."
            ],
            correctOptionIndex: 2,
            explanation: "Playwright locators are evaluated lazily. Creating a locator merely defines a query recipe in Node.js memory. The browser DOM is queried only when an action or assertion executes."
          },
          {
            id: "kc-locator-priority",
            topic: "Semantic Locator Hierarchy",
            question: "According to Playwright's recommended locator hierarchy, which locator strategy should be prioritized when testing a primary call-to-action button?",
            options: [
              "page.locator('button.btn-primary.submit-btn')",
              "page.getByRole('button', { name: 'Submit Order' })",
              "page.getByTestId('submit-order-button')",
              "page.locator('//button[text()=\"Submit Order\"]')"
            ],
            correctOptionIndex: 1,
            explanation: "page.getByRole() is the gold standard because it queries the W3C Accessibility Tree. It guarantees that the button is semantically accessible to screen readers and survives CSS rewrites."
          },
          {
            id: "kc-accessible-name",
            topic: "Accessible Name Computation",
            question: "How does Playwright determine whether page.getByRole('button', { name: 'Save' }) matches an element with <button aria-label='Save Record'>Save</button>?",
            options: [
              "It checks innerText first, so it matches 'Save'.",
              "It checks aria-label first, which computes the accessible name as 'Save Record'. By default, substring matching succeeds since 'Save' is contained in 'Save Record'.",
              "It throws a syntax error because aria-label and innerText cannot coexist.",
              "It fails because exact matching is always enforced for aria-label."
            ],
            correctOptionIndex: 1,
            explanation: "Under W3C accessible name computation, aria-label takes precedence over innerText. By default, Playwright uses substring matching, so { name: 'Save' } matches 'Save Record'. If { exact: true } was set, it would require 'Save Record'."
          },
          {
            id: "kc-strict-mode",
            topic: "Strict Mode Violations",
            question: "Why does calling await page.getByRole('button', { name: 'Edit' }).click() throw an error when two visible Edit buttons exist on the page?",
            options: [
              "Playwright has an internal bug when dealing with duplicate text.",
              "Playwright enforces Strict Mode by default on single-element actions, failing immediately to prevent clicking the wrong element.",
              "Buttons named 'Edit' are reserved keywords in Playwright.",
              "The browser requires a 500ms delay between finding duplicate buttons."
            ],
            correctOptionIndex: 1,
            explanation: "Playwright Strict Mode throws an error when a single-element action resolves to multiple elements. Unlike Selenium which silently clicks the first match, Playwright forces test authors to disambiguate semantically."
          },
          {
            id: "kc-container-scoping",
            topic: "Container Scoping & Disambiguation",
            question: "What is the recommended architectural pattern to click the 'Delete' button for a specific table row containing user 'Alice Chen'?",
            options: [
              "page.getByRole('button', { name: 'Delete' }).first().click()",
              "page.locator('table tr:nth-child(3) button.btn-danger').click()",
              "page.getByRole('row').filter({ hasText: 'Alice Chen' }).getByRole('button', { name: 'Delete' }).click()",
              "page.keyboard.press('Tab') until the Delete button is reached"
            ],
            correctOptionIndex: 2,
            explanation: "Container filtering (.filter({ hasText: 'Alice Chen' })) scopes the query to the specific row. Positional indexing (.first() or nth-child) breaks whenever table rows sort or paginate."
          },
          {
            id: "kc-hidden-elements",
            topic: "Hidden Elements in Accessibility Tree",
            question: "How does page.getByRole('button', { name: 'Save' }) behave when the page contains 2 visible Save buttons and 1 Save button inside <div hidden>?",
            options: [
              "It throws a strict mode violation error for 3 elements.",
              "It resolves only the 2 visible Save buttons because getByRole automatically excludes elements with display:none or the hidden attribute.",
              "It fails to execute because hidden elements corrupt the accessibility tree.",
              "It clicks the hidden button automatically."
            ],
            correctOptionIndex: 1,
            explanation: "By default, getByRole filters out non-rendered/hidden elements. To include hidden elements, you must pass { includeHidden: true }."
          },
          {
            id: "kc-shadow-dom",
            topic: "Shadow DOM Locator Behavior",
            question: "How does Playwright handle elements rendered inside an open Shadow DOM root (<my-component> -> #shadow-root (open) -> <button>Submit</button>)?",
            options: [
              "You must call page.evaluate() with shadowRoot.querySelector.",
              "Playwright pierces open Shadow DOM roots automatically for user-facing locators without special configuration.",
              "You must install the @playwright/shadow-dom plugin.",
              "Shadow DOM elements cannot be tested with Playwright."
            ],
            correctOptionIndex: 1,
            explanation: "Playwright's selector engine automatically pierces open Shadow DOM boundaries by default. Standard locators like page.getByRole('button', { name: 'Submit' }) find elements inside shadow trees seamlessly."
          },
          {
            id: "kc-locator-and-or",
            topic: "Locator Composition (.and / .or)",
            question: "When is locator.or() particularly valuable in enterprise test automation?",
            options: [
              "To speed up locator evaluation by running queries in separate threads.",
              "To handle non-deterministic branching, such as an A/B test or accepting either a 'Welcome' banner or a 'Dashboard' heading.",
              "To bypass Playwright strict mode errors without fixing them.",
              "To force CSS selectors to take priority over role locators."
            ],
            correctOptionIndex: 1,
            explanation: "locator.or() combines two locators into a logical union. It is invaluable for handling legitimate UI variations, such as A/B testing variants or pages that display either an empty-state banner or a data table."
          },
          {
            id: "kc-anti-pattern-refactor",
            topic: "Refactoring & Diagnostic Anti-Patterns",
            question: "A test fails with 'waiting for getByLabel(\"Employee Name\") to be visible' even though the user visibly sees '<label>Employee Name</label><input id=\"emp-name\">'. What is the root cause?",
            options: [
              "The label is missing the 'htmlFor' attribute linking it to the input's 'id', so the browser does not associate them in the accessibility tree.",
              "getByLabel only supports email inputs.",
              "The input must have a placeholder attribute to be found by getByLabel.",
              "Playwright requires all label text to be lowercase."
            ],
            correctOptionIndex: 0,
            explanation: "This is a real accessibility bug. Without htmlFor='emp-name' (or wrapping the input inside the <label>), the browser cannot establish an accessible association. getByLabel correctly fails, flagging a defect."
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
          playwrightCommand: "pnpm exec playwright test e2e/locators.spec.ts -g 'uses role, label'"
        },
        interviewQuestions: [
          {
            question: "Why did the Playwright team introduce the Locator abstraction instead of sticking with ElementHandle?",
            answer: "ElementHandles in Puppeteer and Selenium hold direct in-memory references to DOM nodes. If a modern reactive framework (React, Vue, Svelte) re-renders or updates state, that node is detached from the DOM, throwing 'StaleElementReferenceException'. A Playwright Locator is a query recipe that is evaluated lazily at the moment of action, automatically re-querying the fresh DOM without ever throwing stale element errors.",
            architecturalContext: "Eliminates an entire class of asynchronous timing bugs in modern single-page applications."
          },
          {
            question: "Why does Playwright enforce Strict Mode by default for locators?",
            answer: "In Selenium, driver.findElement() silently returns the first matching element if a selector matches 5 different DOM nodes. If an application introduces duplicate buttons or layout changes, the test clicks the wrong element without error. Playwright's Strict Mode throws an error immediately if a single-element locator resolves to multiple nodes, forcing the test author to disambiguate semantically.",
            architecturalContext: "Prevents subtle race conditions and test false-positives in enterprise test suites."
          },
          {
            question: "What are the architectural risks of using locator.first() to silence strict mode errors?",
            answer: "Calling .first() suppresses Playwright's strict mode and masks accidental DOM duplication bugs. When UI components reorder, table rows sort, or responsive variants mount, .first() silently clicks the wrong control. In enterprise test suites, disambiguate using container scoping (e.g. scoping to a dialog, card, or form) or content filtering (.filter({ hasText })).",
            architecturalContext: "Ensures that tests fail loudly when the UI changes unexpectedly rather than silently corrupting test data."
          },
          {
            question: "How does Playwright's locator engine pierce open Shadow DOM roots, and when does it fail?",
            answer: "Playwright's selector engine automatically traverses open shadow roots by default for both CSS and user-facing semantic locators (getByRole, getByLabel, etc.). You do not need driver.executeScript or manual shadowRoot handles. However, Playwright cannot pierce closed shadow roots (mode: 'closed') where the browser prohibits external JavaScript from accessing the shadow root.",
            architecturalContext: "Allows seamless testing of web components and micro-frontends without convoluted workaround code."
          }
        ]
      },
      {
        id: "playwright-assertions",
        moduleSlug: "locators-and-selectors",
        moduleTitle: "Modern Semantic Locators & Strict Mode",
        title: "Playwright Assertions and Auto-Waiting — Beginner to Advanced",
        difficulty: "Intermediate",
        durationMinutes: 35,
        prerequisites: [
          "playwright-introduction",
          "configuration-and-browsers",
          "playwright-locators"
        ],
        summary: "A comprehensive, progressive masterclass in Playwright's web-first retrying assertions, the actionability auto-waiting engine, timeout hierarchy, soft assertions, eventual consistency, and root-cause debugging of flaky tests.",
        sections: [
          {
            id: "assertion-fundamentals",
            title: "Part A — Assertion Fundamentals & Diagnostic Architecture",
            content: `What is an Assertion in Automated Testing?
An assertion is a verifiable contract and test invariant. It states: 'At this precise point in the user journey, the application state must satisfy this exact condition.' If the condition evaluates to true, the test proceeds uninterrupted. If it evaluates to false, the assertion throws an AssertionError that immediately flags a defect.

The Purpose of expect():
Playwright exposes a unified, fluent 'expect()' utility imported directly from '@playwright/test'. It wraps either an actual value in Node.js memory (e.g. string, number, object) or a live Playwright Locator that points into the browser DOM.

Actual Values vs. Expected Values:
In any test assertion:
- Actual (Received) Value: The real state extracted from the browser or runtime (e.g., current URL, button text, visibility).
- Expected Value: The anticipated specification defined by requirements (e.g., '/practice/dashboard', 'Welcome, student!').
When an assertion fails, Playwright generates a clear, colored diagnostic diff contrasting the Received and Expected values alongside the DOM snippet and actionability call log.

Diagnosing Application Defects Through Assertion Errors:
In legacy frameworks, assertion failures were opaque: 'expected true but found false'. Playwright assertions produce rich, contextual diagnostic reports that pinpoint exactly why an expectation was not met:
- Did the text match case-insensitively but fail on exact case?
- Did the locator resolve to 0 elements (timed out)?
- Did the element exist in the DOM but remain hidden by CSS (display: none)?
- Was the control disabled when an enabled state was required?

Hard Assertions vs. Soft Assertions:
1. Hard Assertions (Default): Calling await expect(locator).toBeVisible() halts test execution immediately upon failure. Any remaining lines of the test are skipped. This is critical for foundational prerequisite steps (e.g., if login fails, proceeding to create a user is meaningless).
2. Soft Assertions (expect.soft()): Calling await expect.soft(locator).toHaveText(...) records the failure but allows test execution to continue. At the end of the test execution, Playwright marks the test as failed and prints all collected errors. Soft assertions are ideal for exhaustive UI auditing (e.g., verifying 10 distinct profile fields or dashboard metrics in a single pass).`
          },
          {
            id: "web-first-assertions",
            title: "Part B — Web-First Retrying Assertions: Complete Reference",
            content: `What Makes an Assertion 'Web-First'?
In web applications, the DOM is asynchronous, dynamic, and non-deterministic. Elements take milliseconds to animate, fetch API responses, or render into the accessibility tree.
Traditional assertions (such as Chai or Jest) evaluate synchronously once. If the element hasn't finished rendering at that exact microsecond, the assertion fails prematurely.
Playwright's web-first assertions poll the target locator continuously in a retry loop until the assertion passes or the expect timeout (default: 5,000ms) expires.

Complete Web-First Assertion Reference (16 Core Matchers):

1. await expect(locator).toBeVisible({ timeout }):
Asserts that the element is attached to the DOM and visible (non-zero bounding box, visibility != hidden, display != none).
Example: await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

2. await expect(locator).toBeHidden({ timeout }):
Asserts that the element is either detached from the DOM or hidden (e.g. display: none or opacity: 0).
Example: await expect(page.getByTestId("loading-spinner")).toBeHidden();

3. await expect(locator).toBeAttached({ timeout }):
Asserts that the element is present in the DOM tree, regardless of whether it is visually visible.
Example: await expect(page.locator("input[type=file]")).toBeAttached();

4. await expect(locator).toBeEnabled({ timeout }):
Asserts that the element is not disabled (does not have the 'disabled' attribute or ARIA disabled state).
Example: await expect(page.getByRole("button", { name: "Submit" })).toBeEnabled();

5. await expect(locator).toBeDisabled({ timeout }):
Asserts that the element has the 'disabled' attribute or aria-disabled="true".
Example: await expect(page.getByRole("button", { name: "Submit" })).toBeDisabled();

6. await expect(locator).toBeEditable({ timeout }):
Asserts that the element is a form input or contenteditable element that is enabled and not read-only.
Example: await expect(page.getByLabel("Username")).toBeEditable();

7. await expect(locator).toBeChecked({ timeout }):
Asserts that a checkbox or radio button is checked.
Example: await expect(page.getByRole("checkbox", { name: "Agree" })).toBeChecked();

8. await expect(locator).toHaveText(expected, { ignoreCase, useInnerText, timeout }):
Asserts that the element's text content matches the expected string or RegExp. Strips whitespace by default.
Example: await expect(page.locator("#status")).toHaveText("Completed");

9. await expect(locator).toContainText(expected, { ignoreCase, useInnerText, timeout }):
Asserts that the element's text contains the substring or matches the RegExp.
Example: await expect(page.locator("#status")).toContainText("Compl");

10. await expect(locator).toHaveValue(value, { timeout }):
Asserts that the form control (<input>, <textarea>, <select>) has the specified value.
Example: await expect(page.getByLabel("Email")).toHaveValue("ada@lab.test");

11. await expect(locator).toHaveAttribute(name, valueOrRegExp, { timeout }):
Asserts that the element has the DOM attribute with the expected value.
Example: await expect(page.getByLabel("Search")).toHaveAttribute("placeholder", "Try Playwright");

12. await expect(locator).toHaveClass(classNameOrRegExp, { timeout }):
Asserts that the element's class attribute contains or matches the specified classes.
Example: await expect(page.getByTestId("badge")).toHaveClass(/bg-emerald/);

13. await expect(locator).toHaveCount(count, { timeout }):
Asserts that the locator resolves to exactly the expected number of matching DOM elements.
Example: await expect(page.getByRole("listitem")).toHaveCount(5);

14. await expect(page).toHaveURL(urlOrRegExp, { timeout }):
Asserts that the current page URL matches the string, glob, or RegExp. Retries as navigation completes.
Example: await expect(page).toHaveURL(/.*\\/practice\\/dashboard/);

15. await expect(page).toHaveTitle(titleOrRegExp, { timeout }):
Asserts that the document title matches the expected string or RegExp.
Example: await expect(page).toHaveTitle("Industrial Test Lab");

16. await expect(locator).toHaveScreenshot(name, { maxDiffPixels, threshold }):
Performs pixel-by-pixel visual comparison against a golden snapshot image.
Example: await expect(page.getByTestId("chart")).toHaveScreenshot("chart-baseline.png");

Negated Assertions and Auto-Retry:
Every web-first assertion can be inverted with '.not'. The polling loop retries until the negation succeeds or times out:
await expect(page.getByTestId("loading-overlay")).not.toBeVisible();`
          },
          {
            id: "autowaiting-actionability",
            title: "Part C — Auto-Waiting Engine & Actionability Checks",
            content: `The Playwright Actionability Engine:
Before executing user actions (such as .click(), .fill(), .check(), .selectOption(), .hover(), .dragTo()), Playwright performs a rigorous actionability audit against the target element. It repeats these checks continuously until they all pass:

1. Attached: Element is connected to the active DOM tree (Document or ShadowRoot).
2. Visible: Element has a non-empty bounding box and is not styled with display: none, visibility: hidden, or opacity: 0.
3. Stable: Element is not undergoing CSS transitions, layout shifts, or animations (bounding box is constant over two animation frames).
4. Receives Events: Point hit-testing (elementFromPoint) confirms that the target element's center coordinate is not obstructed by floating banners, modals, overlays, or popups.
5. Enabled: Element does not possess the 'disabled' attribute or aria-disabled="true".

Actionability Checks vs. Assertions (The Conceptual Difference):
Engineers frequently confuse actionability checks with assertions:
- Actionability Checks: Defensive prerequisites performed automatically before an ACTION. For example, button.click() verifies that the button is enabled and unobstructed before sending the pointer event.
- Assertions: Verifications of test specifications. For example, expect(button).toBeVisible() explicitly asserts the visual presence of the button as part of test criteria.

Why click() and toBeVisible() Solve Different Problems:
- An element can be 100% visible, but disabled: expect(btn).toBeVisible() passes, but btn.click() auto-waits until the disabled attribute is removed!
- An element can be visible, but obstructed by a transparent modal overlay: expect(btn).toBeVisible() passes, but btn.click() auto-waits or fails with 'element intercepts pointer events'!

What Happens When an Element is Detached or Constantly Moving:
If a React component re-renders and replaces the DOM node while Playwright is waiting, Playwright automatically re-queries the locator against the new DOM node.
If an element is animating continuously (e.g. an infinite CSS rotation or marquee), stability checks may time out. Playwright provides { force: true } as an emergency escape hatch, but in senior automation suites, you should disable CSS animations via config ({ animations: 'disabled' }) rather than forcing clicks.

Why page.waitForTimeout() is an Anti-Pattern:
Calling page.waitForTimeout(3000) pauses execution unconditionally.
- On fast local machines, it wastes 3 seconds on every test, ballooning suite execution time.
- On slow, constrained CI runners, 3 seconds is often not enough, resulting in intermittent test flakiness.
Always wait for observable application conditions: await expect(locator).toBeVisible() or await page.waitForResponse().`
          },
          {
            id: "timeout-architecture",
            title: "Part D — Timeout Hierarchy & Diagnostic Analysis",
            content: `The 5-Tier Timeout Hierarchy in Playwright:
Playwright configures timeouts with surgical precision across 5 distinct operational boundaries:

1. Global Timeout (globalTimeout):
- Scope: The entire test suite run across all workers and projects.
- Default: 0 (No global timeout).
- Configuration: Set in playwright.config.ts for CI pipelines to prevent stuck runs from consuming billing minutes.

2. Test Timeout (timeout):
- Scope: The total duration allowed for an individual test function (including before/after hooks).
- Default: 30,000ms (30 seconds).
- Configuration: Configured in playwright.config.ts or overridden per-test via test.setTimeout(60_000).

3. Expect Timeout (expect.timeout):
- Scope: The maximum duration a web-first assertion (e.g. expect(locator).toBeVisible()) will retry.
- Default: 5,000ms (5 seconds).
- Configuration: Configured in playwright.config.ts under expect: { timeout: 5000 }, or per-assertion: await expect(locator).toBeVisible({ timeout: 10_000 }).

4. Action Timeout (actionTimeout):
- Scope: The maximum duration an action method (.click(), .fill(), .press()) will wait for actionability checks to pass.
- Default: 0ms (Unbounded, capped only by the Test Timeout).
- Recommendation: Set to 10,000ms in production playwright.config.ts to fail fast when controls are unresponsive.

5. Navigation Timeout (navigationTimeout):
- Scope: The maximum duration allowed for page.goto(), page.reload(), or navigation-triggering clicks.
- Default: 0ms (Unbounded, capped by Test Timeout).
- Recommendation: Set to 15,000ms for enterprise web applications with complex initial bundles.

Timeout Precedence & Interaction Matrix:
- If a test has a 30s test timeout, and actionTimeout is 10s: a blocked button click fails after 10s, providing a clear actionability error instead of consuming the full 30s test timeout.
- If expect.timeout is 5s: an assertion polls for up to 5s before throwing an AssertionError with a received vs expected diff.

Diagnosing Timeouts from Error Traces:
When a timeout occurs, look at the Playwright Error Log:
- 'Timeout 5000ms exceeded while waiting for expect(locator).toBeVisible()' -> The element never appeared in the DOM or remained hidden.
- 'Timeout 10000ms exceeded while waiting for locator.click()' -> Check the Call Log sub-steps:
  * Element is not attached
  * Element is not visible
  * Element is not stable
  * Element intercepts pointer events (e.g. <div class="modal-backdrop"> intercepts pointer events)
  * Element is disabled`
          },
          {
            id: "advanced-assertion-strategies",
            title: "Part E — Advanced Assertion Strategies & Eventual Consistency",
            content: `Mastering Eventual Consistency and Transient UI States:
Modern web applications interact with microservices, message queues, and WebSockets where data updates with variable latency.

1. expect.poll() for Arbitrary Asynchronous State:
When verifying state that is not directly exposed as a DOM locator (such as an API response status, database row count, or localStorage key), use expect.poll():
await expect.poll(async () => {
  const token = await page.evaluate(() => localStorage.getItem("auth-token"));
  return token !== null;
}, {
  message: "Auth token was never stored in localStorage",
  timeout: 10_000,
  intervals: [200, 500, 1000] // Backoff polling intervals
}).toBe(true);

2. expect.toPass() for Complex Multi-Step Assertions:
When an entire block of code or multi-step verification must be retried together until all conditions pass:
await expect(async () => {
  const response = await page.request.get("/api/orders/latest");
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.status).toBe("PROCESSED");
}).toPass({
  timeout: 15_000,
  intervals: [1000, 2000]
});

3. Custom Failure Messages:
Provide clear educational or architectural failure messages when an assertion fails:
await expect(
  page.getByRole("alert"),
  "Critical: Expected form submission error banner to be displayed for invalid input"
).toBeVisible();

4. Avoiding Premature Assertions:
A common source of test flakiness is asserting on an element that momentarily appears during a loading cycle:
// Anti-Pattern: Checking row count while initial skeleton loaders are rendering
await expect(page.getByRole("row")).toHaveCount(5); // May count skeleton placeholder rows!
// Resilient Pattern: Wait for loading spinner to detach first
await expect(page.getByTestId("loading-skeleton")).toBeHidden();
await expect(page.getByRole("row")).toHaveCount(5);`
          },
          {
            id: "debugging-unreliable-assertions",
            title: "Part F — Debugging Flaky Assertions & Root Cause Analysis",
            content: `The Senior SDET Diagnostic Playbook for Unreliable Assertions:

Why Does an Assertion Pass Locally But Fail in CI?
1. CPU Throttling: CI runners typically have fewer CPU cores (2 vCPUs). Animations and JavaScript execution take 2x to 3x longer. Web-first retrying assertions survive this; synchronous boolean checks fail.
2. Headless Font Metrics: System fonts render with slightly different bounding boxes in Linux headless environments, occasionally causing text wrapping or unexpected layout shifts.
3. Network Latency: Local APIs respond in 5ms; remote or containerized test environments experience latency jitter.

Diagnostic Methodology:
Step 1: Inspect the Playwright HTML Report & Trace:
Run 'pnpm exec playwright show-trace test-results/.../trace.zip'.
- Navigate to the exact step where the assertion failed.
- Inspect the Actionability Call Log.
- Check the DOM Snapshot 'Before', 'Action', and 'After'.

Step 2: Check for Race Conditions:
Did the test trigger an action that initiated an asynchronous request, but asserted before the response arrived?
Always anchor assertions to deterministic UI states:
await page.getByRole("button", { name: "Save" }).click();
await expect(page.getByRole("status")).toHaveText("Saved successfully");

Step 3: Check for Strict Mode Ambiguity:
If the assertion locator resolves to multiple elements, Playwright halts execution. Use container scoping (.filter({ hasText })) to ensure 1-to-1 matching.`
          }
        ],
        codeExamples: [
          {
            id: "example-web-first-basics",
            caption: "Web-First Assertions: Visibility, Text, Attributes & URL",
            language: "typescript",
            code: `import { test, expect } from "@playwright/test";

test("Web-first assertions on dynamic elements", async ({ page }) => {
  await page.goto("/lab/locators");

  // 1. Heading visibility with accessible role
  const heading = page.getByRole("heading", { name: "Stable locators", level: 2 });
  await expect(heading).toBeVisible();

  // 2. Exact text and substring text matching
  const lead = page.getByText("Good examples use accessible names.");
  await expect(lead).toHaveText("Good examples use accessible names. Defects are isolated and labeled. This page does not call the API.");
  await expect(lead).toContainText("accessible names");

  // 3. Attribute verification (placeholder, type, href)
  const searchInput = page.getByLabel("Search courses");
  await expect(searchInput).toHaveAttribute("placeholder", "Try Playwright");

  // 4. URL change assertion
  await page.getByTitle("Locator gym shortcut").click();
  await expect(page).toHaveURL(/.*\\/lab\\/locators/);
});`,
            lineExplanations: [
              { line: 9, explanation: "toBeVisible() auto-retries over expect timeout until element mounts and becomes visible." },
              { line: 13, explanation: "toHaveText() compares normalized inner text; toContainText() verifies substring presence." },
              { line: 18, explanation: "toHaveAttribute() checks DOM properties without evaluating raw JavaScript." },
              { line: 22, explanation: "toHaveURL() automatically retries until client-side routing finishes." }
            ]
          },
          {
            id: "example-form-validations",
            caption: "Form State Assertions: Values, Checked, Disabled & Enabled",
            language: "typescript",
            code: `import { test, expect } from "@playwright/test";

test("Form controls value and checked state verification", async ({ page }) => {
  await page.goto("/lab/forms");

  const nameInput = page.getByLabel("Full name");
  await nameInput.fill("Ada Lovelace");
  // Assert input value
  await expect(nameInput).toHaveValue("Ada Lovelace");

  const termsCheckbox = page.getByRole("checkbox", { name: "I agree to the lab terms" });
  // Verify initial unchecked state
  await expect(termsCheckbox).not.toBeChecked();

  // Check and verify
  await termsCheckbox.check();
  await expect(termsCheckbox).toBeChecked();

  // Assert submit button is enabled
  const submitBtn = page.getByRole("button", { name: "Submit intake" });
  await expect(submitBtn).toBeEnabled();
});`,
            lineExplanations: [
              { line: 9, explanation: "toHaveValue() asserts input control values (not DOM attributes)." },
              { line: 13, explanation: "not.toBeChecked() negates the matcher and polls until unchecked." },
              { line: 17, explanation: "toBeChecked() confirms both native checked property and aria-checked attribute." },
              { line: 21, explanation: "toBeEnabled() validates element is clickable and not disabled." }
            ]
          },
          {
            id: "example-actionability-autowait",
            caption: "Actionability Auto-Waiting on Delayed Controls",
            language: "typescript",
            code: `import { test, expect } from "@playwright/test";

test("Actionability engine waits for button to become enabled", async ({ page }) => {
  await page.goto("/lab/flaky");

  // Dismiss blocking overlay
  await page.getByLabel("Dismiss Overlay").click();
  await expect(page.getByTestId("floating-interceptor")).not.toBeVisible();

  const delayedBtn = page.getByRole("button", { name: "Execute Delayed Action" });

  // Playwright action auto-waits for actionability checks:
  // 1. Attached, 2. Visible, 3. Stable, 4. Receives Events, 5. Enabled!
  // The button starts disabled for 1200ms; click() automatically waits!
  await delayedBtn.click();

  // Verify resulting feedback
  const result = page.locator("#actionability-result");
  await expect(result).toBeVisible();
  await expect(result).toContainText("Action successfully executed after actionability wait");
});`,
            lineExplanations: [
              { line: 8, explanation: "Dismiss blocking overlay so hit-testing succeeds." },
              { line: 16, explanation: "delayedBtn.click() automatically polls actionability checks up to actionTimeout." },
              { line: 20, explanation: "Web-first assertion confirms resulting feedback banner is visible." }
            ]
          },
          {
            id: "example-advanced-poll-topass",
            caption: "Eventual Consistency: expect.poll() and expect.toPass()",
            language: "typescript",
            code: `import { test, expect } from "@playwright/test";

test("Poll asynchronous storage and retry complex multi-step validations", async ({ page }) => {
  await page.goto("/practice/login");

  // Login
  await page.getByLabel("Practice Username").fill("student");
  await page.getByLabel("Practice Password").fill("Password123!");
  await page.getByRole("button", { name: "Sign In" }).click();

  // 1. expect.poll(): Poll client localStorage until token exists
  await expect.poll(async () => {
    return await page.evaluate(() => localStorage.getItem("pil-practice-token"));
  }, {
    message: "Expected auth token to be stored in localStorage after successful sign-in",
    timeout: 5000,
    intervals: [200, 500]
  }).not.toBeNull();

  // 2. expect.toPass(): Retrying multi-step verification block
  await expect(async () => {
    await expect(page.getByRole("heading", { name: "Welcome, student!" })).toBeVisible();
    await expect(page.getByTestId("session-info")).toBeVisible();
  }).toPass({ timeout: 5000 });
});`,
            lineExplanations: [
              { line: 13, explanation: "expect.poll() polls non-DOM async return values with custom intervals." },
              { line: 22, explanation: "expect.toPass() executes multi-step assertion blocks until all pass without error." }
            ]
          },
          {
            id: "example-soft-assertions",
            caption: "Soft Assertions: Full Audit Without Early Termination",
            language: "typescript",
            code: `import { test, expect } from "@playwright/test";

test("Exhaustive UI audit using soft assertions", async ({ page }) => {
  await page.goto("/lab/locators");

  // Hard assertion: Page must load and render main header first
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // Soft assertions: Collect all UI validation errors without stopping early
  await expect.soft(page.getByRole("heading", { name: "Stable locators" })).toBeVisible();
  await expect.soft(page.getByLabel("Search courses")).toHaveAttribute("placeholder", "Try Playwright");
  await expect.soft(page.getByRole("button", { name: "Run check" })).toBeEnabled();
  await expect.soft(page.getByTitle("Locator gym shortcut")).toHaveAttribute("href", "/lab/locators");

  // If any soft assertion failed, test will fail at conclusion with complete report
  expect(test.info().errors).toHaveLength(0);
});`,
            lineExplanations: [
              { line: 7, explanation: "Hard assertion ensures primary DOM container is rendered before auditing." },
              { line: 10, explanation: "expect.soft() logs failures but continues evaluating subsequent checks." },
              { line: 16, explanation: "test.info().errors contains all accumulated soft assertion failure records." }
            ]
          },
          {
            id: "example-custom-timeout-messages",
            caption: "Custom Diagnostic Messages and Timeout Overrides",
            language: "typescript",
            code: `import { test, expect } from "@playwright/test";

test("Custom diagnostic messages and explicit timeout overrides", async ({ page }) => {
  await page.goto("/lab/locators");

  const searchInput = page.getByLabel("Search courses");

  // Custom failure message displays in CI logs if assertion times out
  await expect(
    searchInput,
    "CRITICAL: Course search input was not found or failed to render within 3000ms"
  ).toBeVisible({ timeout: 3000 });

  // Custom timeout override for slow asynchronous network operations
  await expect(
    page.getByRole("button", { name: "Run check" }),
    "Action check button must be enabled for interaction"
  ).toBeEnabled({ timeout: 4000 });
});`,
            lineExplanations: [
              { line: 9, explanation: "Passing a custom string as second argument replaces generic error with clear domain diagnostics." },
              { line: 12, explanation: "{ timeout: 3000 } overrides the default 5000ms expect timeout for this specific check." }
            ]
          }
        ],
        commonMistakes: [
          {
            title: "Synchronous Boolean Check vs Web-First Assertion",
            badPractice: "const isVisible = await page.getByRole('button').isVisible();\nexpect(isVisible).toBe(true);",
            goodPractice: "await expect(page.getByRole('button')).toBeVisible();",
            explanation: "Calling isVisible() evaluates the DOM once at that instant and returns a boolean. If the element is still animating or fetching data, it returns false immediately. Web-first toBeVisible() retries over 5000ms until the element renders."
          },
          {
            title: "Evaluating Raw innerText vs Retrying toHaveText",
            badPractice: "const text = await page.locator('#status').innerText();\nexpect(text).toBe('Completed');",
            goodPractice: "await expect(page.locator('#status')).toHaveText('Completed');",
            explanation: "Reading innerText() once captures an instantaneous snapshot. If the backend API updates the status text 200ms later, the test fails. toHaveText() auto-retries until the text matches."
          },
          {
            title: "Unconditional Fixed Sleep (waitForTimeout) Anti-Pattern",
            badPractice: "await page.waitForTimeout(3000);\nawait page.getByRole('button', { name: 'Save' }).click();",
            goodPractice: "const saveBtn = page.getByRole('button', { name: 'Save' });\nawait expect(saveBtn).toBeEnabled();\nawait saveBtn.click();",
            explanation: "Fixed sleeps slow down test suites unnecessarily and fail on slow CI machines. Waiting for an observable condition (toBeEnabled) proceeds immediately when ready."
          },
          {
            title: "Missing 'await' Keyword in Front of Expect",
            badPractice: "// DANGEROUS BUG: Missing await\nexpect(page.getByRole('button')).toBeVisible();",
            goodPractice: "await expect(page.getByRole('button')).toBeVisible();",
            explanation: "Web-first assertions return a Promise. Omitting 'await' causes the assertion to run asynchronously in the background. The test passes prematurely and uncaught promise rejections crash the test runner."
          },
          {
            title: "Premature Negative Assertion Before Animation Begins",
            badPractice: "// Close modal and immediately assert hidden\nawait page.getByLabel('Close').click();\nawait expect(page.getByRole('dialog')).toBeHidden();",
            goodPractice: "await page.getByLabel('Close').click();\n// Explicitly verify modal is removed from accessibility tree\nawait expect(page.getByRole('dialog')).not.toBeVisible();",
            explanation: "If modal fade-out animation takes 300ms, asserting immediately can fail if not properly retrying or if testing detached vs hidden state incorrectly."
          },
          {
            title: "Overusing Soft Assertions on Critical Prerequisite Steps",
            badPractice: "await expect.soft(page).toHaveURL('/login'); // If login fails, test still tries to click dashboard!\nawait page.getByRole('button', { name: 'Create Project' }).click();",
            goodPractice: "await expect(page).toHaveURL('/login'); // Hard assertion on prerequisite\nawait page.getByRole('button', { name: 'Sign In' }).click();\n// Soft assertions on resulting dashboard widgets\nawait expect.soft(page.getByTestId('stat-users')).toBeVisible();",
            explanation: "Soft assertions should only be used on non-critical validations. If an authentication step fails, subsequent steps will fail with cascading, unhelpful errors."
          }
        ],
        playground: {
          title: "Interactive Assertions & Auto-Waiting Matrix",
          configExample: `// Playwright Web-First Assertions & Actionability Pipeline
// 1. Actionability Engine (Automatic Waiting before Actions):
//    Attached -> Visible -> Stable -> Receives Events -> Enabled
await page.getByRole("button", { name: "Submit" }).click();

// 2. Web-First Retrying Assertions (Polls until condition passes or timeout):
await expect(page.getByRole("status")).toHaveText("Success", { timeout: 5000 });
await expect(page.getByTestId("loading")).toBeHidden();

// 3. Advanced Eventual Consistency:
await expect.poll(() => fetchStatus(), { timeout: 10000 }).toBe(200);
await expect.soft(page.getByRole("heading")).toBeVisible();`,
          properties: [
            {
              name: "toBeVisible()",
              type: "DOM Visibility",
              defaultValue: "5,000ms expect timeout",
              description: "Retries until element is attached to DOM and has non-zero bounding box without display:none or visibility:hidden.",
              impact: "Gold standard for asserting visual presence. Eliminates flaky rendering races."
            },
            {
              name: "toBeHidden()",
              type: "DOM Invisibility",
              defaultValue: "5,000ms expect timeout",
              description: "Retries until element is detached from DOM or styled with display:none or visibility:hidden.",
              impact: "Verifies modals dismiss, loading spinners disappear, and alerts close."
            },
            {
              name: "toBeEnabled() / toBeDisabled()",
              type: "Control State",
              defaultValue: "5,000ms expect timeout",
              description: "Retries until form controls or buttons toggle disabled attribute or ARIA disabled property.",
              impact: "Prevents double-click bugs and verifies form validation rules."
            },
            {
              name: "toHaveText() / toContainText()",
              type: "Text Verification",
              defaultValue: "5,000ms expect timeout",
              description: "Retries until element text matches exact string/RegExp or contains specified substring.",
              impact: "Handles asynchronous WebSocket and REST API updates smoothly."
            },
            {
              name: "toHaveValue()",
              type: "Form State",
              defaultValue: "5,000ms expect timeout",
              description: "Retries until input, textarea, or select control has the specified value.",
              impact: "Validates typing, mask formatting, and autocomplete population."
            },
            {
              name: "toBeChecked()",
              type: "Checkbox/Radio State",
              defaultValue: "5,000ms expect timeout",
              description: "Retries until checkbox or radio button satisfies checked state or aria-checked.",
              impact: "Ensures agreement terms, toggles, and filters reflect user actions."
            },
            {
              name: "toHaveURL()",
              type: "Navigation State",
              defaultValue: "5,000ms expect timeout",
              description: "Retries until browser location URL matches expected string, glob, or RegExp.",
              impact: "Confirms client-side SPA routing and authentication redirects complete."
            },
            {
              name: "expect.poll()",
              type: "Async Poller",
              defaultValue: "Customizable intervals",
              description: "Polls arbitrary asynchronous function (localStorage, API, database) until matcher succeeds.",
              impact: "Enables testing eventual consistency outside of DOM locator queries."
            },
            {
              name: "expect.soft()",
              type: "Non-Fatal Assertion",
              defaultValue: "Continues on failure",
              description: "Records assertion failure without terminating test execution early.",
              impact: "Enables comprehensive multi-point audits and screenshot verifications in a single test run."
            }
          ],
          behaviorComparison: [
            {
              aspect: "toBeVisible() vs isVisible()",
              defaultBehavior: "await expect(locator).toBeVisible() retries over 5000ms until element animates into view or loads.",
              customizedBehavior: "expect(await locator.isVisible()).toBe(true) runs once immediately, failing if element takes 50ms to mount."
            },
            {
              aspect: "toHaveText() vs innerText()",
              defaultBehavior: "await expect(locator).toHaveText('Active') automatically polls and retries against fresh DOM nodes.",
              customizedBehavior: "expect(await locator.innerText()).toBe('Active') captures snapshot at single millisecond; fails on delayed API."
            },
            {
              aspect: "Action Auto-Wait vs Manual Wait",
              defaultBehavior: "locator.click() automatically audits: Attached, Visible, Stable, Receives Events, and Enabled.",
              customizedBehavior: "Manual waitForSelector() before clicks adds redundant code and fails to verify hit-target obstruction."
            },
            {
              aspect: "Observable Polling vs Fixed Sleep",
              defaultBehavior: "await expect(btn).toBeEnabled() proceeds the exact millisecond state transitions (e.g. in 240ms).",
              customizedBehavior: "page.waitForTimeout(3000) wastes 3 seconds on fast machines and still fails when CI takes 3100ms."
            }
          ],
          practiceTask: "Explore /lab/flaky and /lab/forms. Test delayed button actionability, inspect DOM replacement, verify form values, and eliminate arbitrary sleeps.",
          localCommand: "pnpm exec playwright test e2e/practice-assertions.spec.ts"
        },
        exercises: [
          {
            id: "ex1-heading-visible",
            title: "Exercise 1: Assert that a Heading is Visible",
            objective: "Assert the visibility of primary and section headings using web-first retrying assertions.",
            prerequisites: ["Playwright test runner knowledge", "Lab running at /lab/locators"],
            starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 1: Assert heading is visible", async ({ page }) => {
  await page.goto("/lab/locators");
  // TODO: Assert level-1 heading is visible
  // TODO: Assert level-2 heading 'Stable locators' is visible
});`,
            task: "Verify that the main level-1 heading and the 'Stable locators' level-2 heading are visible using await expect(locator).toBeVisible().",
            acceptanceCriteria: [
              "Uses page.getByRole('heading')",
              "Applies web-first await expect(heading).toBeVisible()",
              "Verifies both h1 and h2 headings"
            ],
            expectedBehavior: "Playwright queries the accessibility tree and confirms both headings are visible, retrying automatically if rendering is delayed.",
            hint: "Use getByRole('heading', { name: 'Stable locators', level: 2 }).",
            solution: `import { test, expect } from "@playwright/test";

test("Exercise 1: Assert heading is visible", async ({ page }) => {
  await page.goto("/lab/locators");
  const heading = page.getByRole("heading", {
    name: "Choose a locator that survives a redesign.",
    level: 1,
  });
  await expect(heading).toBeVisible();

  const sectionHeading = page.getByRole("heading", {
    name: "Stable locators",
    level: 2,
  });
  await expect(sectionHeading).toBeVisible();
});`,
            troubleshootingNotes: "Ensure you include 'await' in front of expect(); omitting await causes uncaught promise rejections.",
            command: "pnpm exec playwright test e2e/practice-assertions.spec.ts -g 'Exercise 1'"
          },
          {
            id: "ex2-exact-partial-text",
            title: "Exercise 2: Assert Exact Text and Partial Text",
            objective: "Differentiate between exact normalized text comparison and substring text matching.",
            prerequisites: ["Understanding of toHaveText vs toContainText", "Locator Gym at /lab/locators"],
            starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 2: Assert exact and partial text", async ({ page }) => {
  await page.goto("/lab/locators");
  const description = page.getByText("Good examples use accessible names.");
  // TODO: Assert exact text match using toHaveText
  // TODO: Assert partial text match using toContainText
});`,
            task: "Assert the exact text of the lead paragraph using toHaveText() and verify key substrings using toContainText().",
            acceptanceCriteria: [
              "Uses toHaveText() for complete paragraph comparison",
              "Uses toContainText() for substring assertions ('accessible names')",
              "Zero manual string trimming or innerText calls"
            ],
            expectedBehavior: "Playwright normalizes whitespace and verifies that the text matches both the exact requirement and substring constraints.",
            hint: "toContainText('accessible names') will pass as long as the substring exists inside the element.",
            solution: `import { test, expect } from "@playwright/test";

test("Exercise 2: Assert exact and partial text", async ({ page }) => {
  await page.goto("/lab/locators");
  const descriptionText = page.getByText("Good examples use accessible names.");
  await expect(descriptionText).toHaveText(
    "Good examples use accessible names. Defects are isolated and labeled. This page does not call the API."
  );
  await expect(descriptionText).toContainText("accessible names");
  await expect(descriptionText).toContainText("isolated and labeled");
});`,
            troubleshootingNotes: "toHaveText matches the entire text content; use toContainText if you only care about dynamic snippets.",
            command: "pnpm exec playwright test e2e/practice-assertions.spec.ts -g 'Exercise 2'"
          },
          {
            id: "ex3-form-values-checked",
            title: "Exercise 3: Validate Form Values and Checked States",
            objective: "Assert form control values using toHaveValue() and toggle states using toBeChecked().",
            prerequisites: ["Form validation semantics", "Forms Lab at /lab/forms"],
            starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 3: Validate form values and checked states", async ({ page }) => {
  await page.goto("/lab/forms");
  // TODO: Fill 'Full name' input and assert value using toHaveValue()
  // TODO: Verify 'I agree to the lab terms' checkbox state toggling using toBeChecked()
});`,
            task: "Fill the 'Full name' input, assert its value using toHaveValue(), and verify that the terms checkbox transitions between unchecked and checked states.",
            acceptanceCriteria: [
              "Uses toHaveValue('Ada Lovelace')",
              "Asserts initial state with not.toBeChecked()",
              "Checks box and asserts toBeChecked()",
              "Unchecks box and asserts not.toBeChecked()"
            ],
            expectedBehavior: "Input value is verified via the control property, and checkbox checked states are affirmed without checking raw attributes.",
            hint: "Use await expect(termsCheckbox).not.toBeChecked() for the initial state.",
            solution: `import { test, expect } from "@playwright/test";

test("Exercise 3: Validate form values and checked states", async ({ page }) => {
  await page.goto("/lab/forms");
  const fullNameInput = page.getByLabel("Full name");
  await fullNameInput.fill("Ada Lovelace");
  await expect(fullNameInput).toHaveValue("Ada Lovelace");

  const termsCheckbox = page.getByRole("checkbox", { name: "I agree to the lab terms" });
  await expect(termsCheckbox).not.toBeChecked();

  await termsCheckbox.check();
  await expect(termsCheckbox).toBeChecked();

  await termsCheckbox.uncheck();
  await expect(termsCheckbox).not.toBeChecked();
});`,
            troubleshootingNotes: "Do not use toHaveAttribute('value', ...) for dynamic input values; the HTML value attribute only reflects initial defaultValue.",
            command: "pnpm exec playwright test e2e/practice-assertions.spec.ts -g 'Exercise 3'"
          },
          {
            id: "ex4-disabled-enabled-buttons",
            title: "Exercise 4: Verify Disabled and Enabled Buttons",
            objective: "Verify that a button begins disabled and transitions to enabled without manual sleeps.",
            prerequisites: ["Actionability engine understanding", "Flaky Lab at /lab/flaky"],
            starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 4: Verify disabled and enabled buttons", async ({ page }) => {
  await page.goto("/lab/flaky");
  await page.getByLabel("Dismiss Overlay").click();
  // TODO: Assert button is initially disabled or wait for it to become enabled
  // TODO: Click button once enabled and verify feedback
});`,
            task: "Verify that 'Execute Delayed Action' button auto-waits for its enabled state, click it, and assert the resulting confirmation message.",
            acceptanceCriteria: [
              "Dismisses floating interceptor overlay",
              "Asserts toBeEnabled() on the delayed button",
              "Clicks button and asserts feedback text with toHaveText()"
            ],
            expectedBehavior: "Playwright retries toBeEnabled() until the 1200ms timer expires, then clicks and confirms feedback.",
            hint: "await expect(delayedBtn).toBeEnabled() automatically retries until the timer finishes.",
            solution: `import { test, expect } from "@playwright/test";

test("Exercise 4: Verify disabled and enabled buttons", async ({ page }) => {
  await page.goto("/lab/flaky");
  await page.getByLabel("Dismiss Overlay").click();
  await expect(page.getByTestId("floating-interceptor")).not.toBeVisible();

  const delayedBtn = page.getByRole("button", { name: "Execute Delayed Action" });
  await expect(delayedBtn).toBeEnabled();

  await delayedBtn.click();
  await expect(page.locator("#actionability-result")).toHaveText(
    /Action successfully executed after actionability wait/
  );
});`,
            troubleshootingNotes: "Make sure to dismiss the blocking overlay first; otherwise actionability hit-testing fails.",
            command: "pnpm exec playwright test e2e/practice-assertions.spec.ts -g 'Exercise 4'"
          },
          {
            id: "ex5-url-change-navigation",
            title: "Exercise 5: Assert a URL Change After Navigation",
            objective: "Assert client-side URL redirects and destination page authentication states.",
            prerequisites: ["Practice Login at /practice/login"],
            starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 5: Assert URL change after navigation", async ({ page }) => {
  await page.goto("/practice/login");
  // TODO: Fill credentials (student / Password123!) and submit
  // TODO: Assert URL changes to /practice/dashboard
  // TODO: Assert welcome message is visible
});`,
            task: "Log in through /practice/login, assert that page URL updates to /practice/dashboard via toHaveURL(), and verify authenticated dashboard content.",
            acceptanceCriteria: [
              "Fills Practice Username and Practice Password",
              "Submits login form",
              "Uses await expect(page).toHaveURL(/.*\\/practice\\/dashboard/)",
              "Asserts welcome message heading is visible"
            ],
            expectedBehavior: "Playwright retries toHaveURL() as SPA navigation finishes and asserts dashboard components.",
            hint: "Pass a RegExp like /.*\\/practice\\/dashboard/ to toHaveURL() to be resilient to hostnames and query params.",
            solution: `import { test, expect } from "@playwright/test";

test("Exercise 5: Assert URL change after navigation", async ({ page }) => {
  await page.goto("/practice/login");
  await page.getByLabel("Practice Username").fill("student");
  await page.getByLabel("Practice Password").fill("Password123!");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL(/.*\\/practice\\/dashboard/);
  await expect(
    page.getByRole("heading", { name: "Welcome, student!", level: 1 })
  ).toBeVisible();
  await expect(page.getByTestId("session-info")).toBeVisible();
});`,
            troubleshootingNotes: "Do not use page.url() === '...'; page.url() is synchronous and does not wait for asynchronous client navigation.",
            command: "pnpm exec playwright test e2e/practice-assertions.spec.ts -g 'Exercise 5'"
          },
          {
            id: "ex6-wait-async-content",
            title: "Exercise 6: Wait for Asynchronous Content Using a Web-First Assertion",
            objective: "Handle dynamic DOM replacement and state updates using auto-retrying assertions.",
            prerequisites: ["DOM replacement lifecycle", "Flaky Lab at /lab/flaky"],
            starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 6: Wait for asynchronous content", async ({ page }) => {
  await page.goto("/lab/flaky");
  await page.getByLabel("Dismiss Overlay").click();
  // TODO: Assert initial text of #dynamic-target
  // TODO: Click 'Trigger DOM Replacement'
  // TODO: Assert text updates to 'DOM Node Generation #2'
});`,
            task: "Assert initial DOM target text, trigger DOM unmounting/replacement, and assert updated text using web-first toHaveText().",
            acceptanceCriteria: [
              "Asserts initial text 'DOM Node Generation #1'",
              "Triggers DOM replacement button",
              "Asserts new generation text without stale element exceptions"
            ],
            expectedBehavior: "Playwright re-evaluates the query in the fresh DOM tree and asserts the updated text seamlessly.",
            hint: "await expect(page.locator('#dynamic-target')).toHaveText('DOM Node Generation #2');",
            solution: `import { test, expect } from "@playwright/test";

test("Exercise 6: Wait for asynchronous content", async ({ page }) => {
  await page.goto("/lab/flaky");
  await page.getByLabel("Dismiss Overlay").click();

  const dynamicTarget = page.locator("#dynamic-target");
  await expect(dynamicTarget).toHaveText("DOM Node Generation #1");

  await page.getByRole("button", { name: "Trigger DOM Replacement" }).click();
  await expect(dynamicTarget).toHaveText("DOM Node Generation #2");
});`,
            troubleshootingNotes: "Playwright locators are evaluated lazily; remounting the component does not break the locator handle.",
            command: "pnpm exec playwright test e2e/practice-assertions.spec.ts -g 'Exercise 6'"
          },
          {
            id: "ex7-diagnose-soft-assertions",
            title: "Exercise 7: Diagnose Assertions and Use Soft Assertions",
            objective: "Perform exhaustive UI auditing without prematurely halting test execution on minor failures.",
            prerequisites: ["Soft assertion concepts", "Locator Gym at /lab/locators"],
            starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 7: Soft assertions for non-fatal checks", async ({ page }) => {
  await page.goto("/lab/locators");
  // TODO: Perform multiple UI verifications using expect.soft()
  // TODO: Check that test.info().errors contains zero unexpected errors
});`,
            task: "Audit multiple UI properties on /lab/locators using expect.soft() and assert that no failures occurred.",
            acceptanceCriteria: [
              "Uses expect.soft() for 3 or more UI elements",
              "Verifies heading, input attribute, and button state",
              "Asserts test.info().errors length is 0"
            ],
            expectedBehavior: "All assertions evaluate sequentially, recording results without early termination.",
            hint: "await expect.soft(locator).toBeVisible();",
            solution: `import { test, expect } from "@playwright/test";

test("Exercise 7: Soft assertions for non-fatal checks", async ({ page }) => {
  await page.goto("/lab/locators");
  await expect.soft(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect.soft(page.getByRole("heading", { name: "Stable locators" })).toBeVisible();
  await expect.soft(page.getByLabel("Search courses")).toHaveAttribute("placeholder", "Try Playwright");
  expect(test.info().errors).toHaveLength(0);
});`,
            troubleshootingNotes: "If an expect.soft() check fails, the test continues executing but will fail at completion.",
            command: "pnpm exec playwright test e2e/practice-assertions.spec.ts -g 'Exercise 7'"
          },
          {
            id: "ex8-compare-sleep-retrying",
            title: "Exercise 8: Compare an Explicit Fixed Sleep with a Retrying Assertion",
            objective: "Refactor an arbitrary sleep into an instant, deterministic web-first assertion.",
            prerequisites: ["Anti-pattern identification", "Flaky Lab at /lab/flaky"],
            starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 8: Compare sleep with retrying assertion", async ({ page }) => {
  await page.goto("/lab/flaky");
  await page.getByLabel("Dismiss Overlay").click();
  // ANTI-PATTERN: await page.waitForTimeout(2000);
  // TODO: Replace with retrying web-first assertion
});`,
            task: "Eliminate page.waitForTimeout() by replacing it with a retrying assertion that polls until the delayed button is enabled.",
            acceptanceCriteria: [
              "Zero occurrences of page.waitForTimeout()",
              "Uses await expect(button).toBeEnabled({ timeout: 5000 })",
              "Test completes as soon as element becomes enabled"
            ],
            expectedBehavior: "Test resolves in ~1200ms instead of waiting for a rigid sleep, saving execution time and increasing determinism.",
            hint: "await expect(page.getByRole('button', { name: 'Execute Delayed Action' })).toBeEnabled({ timeout: 5000 });",
            solution: `import { test, expect } from "@playwright/test";

test("Exercise 8: Compare sleep with retrying assertion", async ({ page }) => {
  await page.goto("/lab/flaky");
  await page.getByLabel("Dismiss Overlay").click();
  const delayedBtn = page.getByRole("button", { name: "Execute Delayed Action" });
  await expect(delayedBtn).toBeEnabled({ timeout: 5000 });
});`,
            troubleshootingNotes: "Fixed sleeps create sluggish tests locally and flaky tests in CI. Web-first assertions resolve as soon as state changes.",
            command: "pnpm exec playwright test e2e/practice-assertions.spec.ts -g 'Exercise 8'"
          },
          {
            id: "ex9-timeout-custom-message",
            title: "Exercise 9: Investigate a Timeout with Custom Message and Timeout Parameter",
            objective: "Configure explicit timeouts and attach contextual diagnostic failure messages.",
            prerequisites: ["Timeout configuration", "Locator Gym at /lab/locators"],
            starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 9: Custom message and explicit timeout", async ({ page }) => {
  await page.goto("/lab/locators");
  // TODO: Assert search input visibility with custom error message and explicit 3000ms timeout
});`,
            task: "Assert visibility of the course search input using a custom diagnostic message and an explicit timeout override parameter.",
            acceptanceCriteria: [
              "Provides descriptive custom failure message string",
              "Passes { timeout: 3000 } option to assertion",
              "Asserts search input is visible"
            ],
            expectedBehavior: "Playwright evaluates the assertion using the custom 3000ms ceiling and embeds the custom explanation if it fails.",
            hint: "await expect(locator, 'Custom error message').toBeVisible({ timeout: 3000 });",
            solution: `import { test, expect } from "@playwright/test";

test("Exercise 9: Custom message and explicit timeout", async ({ page }) => {
  await page.goto("/lab/locators");
  const searchInput = page.getByLabel("Search courses");
  await expect(
    searchInput,
    "Expected course search input to be visible and ready for user typing"
  ).toBeVisible({ timeout: 3000 });
});`,
            troubleshootingNotes: "Custom error messages appear at the top of the failure trace, drastically speeding up CI root-cause analysis.",
            command: "pnpm exec playwright test e2e/practice-assertions.spec.ts -g 'Exercise 9'"
          },
          {
            id: "ex10-senior-flaky-actionability",
            title: "Exercise 10: Solve a Senior-Level Flaky-Test Scenario with Actionability",
            objective: "Diagnose and resolve an actionability hit-testing interception defect caused by an overlay.",
            prerequisites: ["Actionability hit-testing", "Flaky Lab at /lab/flaky"],
            starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 10: Solve flaky actionability interception", async ({ page }) => {
  await page.goto("/lab/flaky");
  // SCENARIO: A floating modal overlay intercepts pointer events for background elements
  // TODO: Assert overlay is visible
  // TODO: Dismiss overlay and assert it is hidden
  // TODO: Assert background upload controls are enabled
});`,
            task: "Identify the blocking interceptor overlay, assert its presence, dismiss it, assert its removal via not.toBeVisible(), and verify background controls are enabled.",
            acceptanceCriteria: [
              "Asserts floating overlay is visible",
              "Dismisses overlay via 'Dismiss Overlay' button",
              "Asserts overlay is not.toBeVisible()",
              "Asserts background 'Upload Test Data' input is visible and enabled"
            ],
            expectedBehavior: "Background controls become actionable only after the blocking overlay is fully dismissed, preventing flaky pointer-event interception.",
            hint: "await expect(overlay).not.toBeVisible();",
            solution: `import { test, expect } from "@playwright/test";

test("Exercise 10: Solve flaky actionability interception", async ({ page }) => {
  await page.goto("/lab/flaky");
  const overlay = page.getByTestId("floating-interceptor");
  await expect(overlay).toBeVisible();

  await page.getByLabel("Dismiss Overlay").click();
  await expect(overlay).not.toBeVisible();

  const uploadInput = page.getByLabel("Upload Test Data");
  await expect(uploadInput).toBeVisible();
  await expect(uploadInput).toBeEnabled();
});`,
            troubleshootingNotes: "Actionability 'receives events' check fails if any element covers the center coordinate of your target.",
            command: "pnpm exec playwright test e2e/practice-assertions.spec.ts -g 'Exercise 10'"
          }
        ],
        knowledgeCheck: [
          {
            id: "kc-assert-purpose",
            topic: "Web-First Assertion Architecture",
            question: "Why does Playwright recommend using web-first retrying assertions (e.g. await expect(btn).toBeVisible()) over synchronous boolean checks (e.g. expect(await btn.isVisible()).toBe(true))?",
            options: [
              "Synchronous boolean checks take up more memory in the Node.js process.",
              "Web-first assertions automatically retry until the condition succeeds or times out, eliminating race conditions during asynchronous rendering.",
              "The expect() method only supports locators, not boolean values.",
              "Browser drivers in Playwright cannot execute JavaScript synchronously."
            ],
            correctOptionIndex: 1,
            explanation: "Web-first assertions poll the target element continuously over the expect timeout (default: 5000ms). A synchronous check evaluates the DOM once at that microsecond; if the component takes 50ms to mount, it fails immediately."
          },
          {
            id: "kc-assert-text-diff",
            topic: "Text Assertion Semantics",
            question: "What is the key difference between await expect(locator).toHaveText('Active') and await expect(locator).toContainText('Active')?",
            options: [
              "toHaveText() only works on input fields, while toContainText() works on buttons.",
              "toHaveText() requires an exact full-text match (normalizing whitespace), while toContainText() passes if 'Active' is a substring inside the element.",
              "toContainText() is deprecated in modern versions of Playwright.",
              "toHaveText() ignores HTML comments, while toContainText() searches HTML comments."
            ],
            correctOptionIndex: 1,
            explanation: "toHaveText() checks the entire text content against the expected string. toContainText() performs a substring search, making it ideal for elements that contain dynamic timestamps or changing child badges alongside stable text."
          },
          {
            id: "kc-assert-missing-await",
            topic: "Async Execution Mechanics",
            question: "What happens if you accidentally omit the 'await' keyword in front of a web-first assertion: expect(locator).toBeVisible();?",
            options: [
              "TypeScript compilation fails immediately with a syntax error.",
              "The assertion executes synchronously in zero milliseconds.",
              "The assertion returns a pending Promise that is never awaited; the test may pass prematurely while the assertion fails silently in the background.",
              "Playwright automatically injects await during runtime execution."
            ],
            correctOptionIndex: 2,
            explanation: "Because web-first assertions return a Promise, omitting 'await' causes the test to continue immediately without waiting for the retry loop to resolve. This creates unhandled promise rejections and false-positive test passes."
          },
          {
            id: "kc-assert-actionability-diff",
            topic: "Actionability vs Assertions",
            question: "How do Playwright's automatic actionability checks differ from web-first assertions?",
            options: [
              "Actionability checks only run in headed mode, while assertions run in headless mode.",
              "Actionability checks are internal prerequisites run automatically before user actions (verifying attached, visible, stable, receives events, enabled); assertions verify test criteria against expected results.",
              "Actionability checks can only be called manually by writing page.waitForActionability().",
              "There is no difference; they are aliases for the same underlying function."
            ],
            correctOptionIndex: 1,
            explanation: "Actionability checks ensure that a user interaction (.click(), .fill()) can realistically happen on a real browser (element is visible, not disabled, and not covered by modals). Assertions verify that your test requirements and state invariants hold true."
          },
          {
            id: "kc-assert-timeout-hierarchy",
            topic: "Timeout Hierarchy",
            question: "If playwright.config.ts configures timeout: 30000, expect: { timeout: 5000 }, and use: { actionTimeout: 10000 }, how long will await expect(btn).toBeEnabled() poll before throwing an error?",
            options: [
              "30,000ms (governed by the test timeout)",
              "10,000ms (governed by the action timeout)",
              "5,000ms (governed by the expect timeout)",
              "0ms (fails immediately without polling)"
            ],
            correctOptionIndex: 2,
            explanation: "Assertions are governed by the expect timeout (5,000ms). The actionTimeout (10,000ms) only applies to action methods like .click() or .fill(). The test timeout (30,000ms) is the maximum duration for the entire test function."
          },
          {
            id: "kc-assert-soft-usage",
            topic: "Soft Assertions",
            question: "In which scenario is using expect.soft() considered an architectural BEST practice?",
            options: [
              "During authentication: continuing if the login button is missing.",
              "During an extensive UI audit: verifying that 10 distinct profile fields, badges, and labels render correctly without failing on the first field.",
              "When clicking the primary payment checkout button.",
              "On page.goto() navigation to ignore 404 and 500 server errors."
            ],
            correctOptionIndex: 1,
            explanation: "Soft assertions shine when performing comprehensive inspections across multiple independent UI components. If field #1 has a typo, you still want to know whether fields #2 through #10 are correct. Soft assertions should never be used on critical prerequisites."
          },
          {
            id: "kc-assert-poll-pattern",
            topic: "Eventual Consistency & expect.poll",
            question: "Why is expect.poll() preferred over an arbitrary sleep when validating asynchronous backend state changes (e.g. checking if an order status changed in an API)?",
            options: [
              "expect.poll() runs inside the browser context, while sleeps run in Node.js.",
              "expect.poll() polls at configured intervals and resolves as soon as the condition is satisfied, preventing unnecessary delays while providing a bounded timeout.",
              "expect.poll() bypasses network security firewalls.",
              "Arbitrary sleeps are forbidden by the TypeScript compiler."
            ],
            correctOptionIndex: 1,
            explanation: "expect.poll() implements an adaptive polling loop. If the order status updates in 200ms, the test proceeds in 200ms. If you used a 5000ms sleep, the test would waste 4800ms unnecessarily, and still fail if the API took 5100ms."
          },
          {
            id: "kc-assert-ci-flakiness-root",
            topic: "CI Root Cause Analysis",
            question: "A test with expect(await locator.innerText()).toBe('Ready') passes on a developer's M3 MacBook but intermittently fails in GitHub Actions CI. What is the most likely root cause?",
            options: [
              "GitHub Actions does not support Chrome browsers.",
              "The CI runner has fewer CPU resources, causing the asynchronous UI to take 150ms longer to update text; the non-retrying innerText() snapshot executes before the update completes.",
              "Playwright disables network traffic in CI environments.",
              "The developer has a cached browser binary that ignores failed assertions."
            ],
            correctOptionIndex: 1,
            explanation: "Non-retrying assertions like expect(await locator.innerText()) capture state at a single microsecond timestamp. On fast local hardware, the state update happened before the check; on constrained CI workers, it hadn't finished yet. Replacing it with await expect(locator).toHaveText('Ready') solves the problem permanently."
          },
          {
            id: "kc-assert-receives-events",
            topic: "Actionability Interception",
            question: "What causes Playwright's actionability engine to log: 'Error: locator.click: Timeout 10000ms exceeded. ... <div class=\"backdrop\"> intercepts pointer events'?",
            options: [
              "The button was deleted from the DOM tree.",
              "A transparent or semi-opaque overlay (e.g. modal backdrop, cookie banner, loading shield) is positioned on top of the button, blocking pointer events from reaching it.",
              "The user's mouse was unplugged during execution.",
              "The button does not have a test ID."
            ],
            correctOptionIndex: 1,
            explanation: "Playwright performs point hit-testing (elementFromPoint) at the center of the target element. If an overlay or modal backdrop intercepts the hit-test, Playwright waits for the overlay to disappear. If the overlay never detaches, it times out with an informative interception error."
          }
        ],
        practiceTask: {
          labRoute: "/lab/flaky",
          labName: "Flaky Actionability & Assertions Lab",
          objective: "Verify Web-First Assertions & Actionability in Flaky Lab",
          instructions: [
            "Interact with /lab/flaky and /lab/forms.",
            "Dismiss blocking overlays, wait for delayed buttons, handle dynamic DOM replacement, and verify form states.",
            "Execute all 10 hands-on practice exercises in e2e/practice-assertions.spec.ts."
          ],
          acceptanceCriteria: [
            "Always prefer web-first retrying assertions over synchronous boolean checks",
            "Understand the 5 actionability checks: attached, visible, stable, receives events, enabled",
            "Never use arbitrary fixed sleeps; wait for observable application conditions",
            "Use expect.soft() for multi-field form audits and expect.poll() for eventual consistency"
          ],
          hint: "Run 'pnpm exec playwright test e2e/practice-assertions.spec.ts' to execute all exercises locally.",
          solutionCode: `import { test, expect } from "@playwright/test";

test("assertions lab validation", async ({ page }) => {
  await page.goto("/lab/flaky");
  await page.getByLabel("Dismiss Overlay").click();
  await expect(page.getByRole("button", { name: "Execute Delayed Action" })).toBeEnabled();
});`,
          playwrightCommand: "pnpm exec playwright test e2e/practice-assertions.spec.ts"
        },
        interviewQuestions: [
          {
            question: "Why should senior SDETs prohibit expect(await locator.isVisible()).toBe(true) in production code reviews?",
            answer: "isVisible() evaluates the DOM state at an instantaneous snapshot in time and returns a boolean. If a React component takes 50 milliseconds to mount or animate, isVisible() immediately returns false, and toBe(true) fails permanently. In contrast, await expect(locator).toBeVisible() is a web-first retrying assertion that polls the DOM continuously over the expect timeout (default: 5000ms), eliminating race conditions caused by network latency or CPU throttling.",
            architecturalContext: "Enforces deterministic, non-flaky test execution across diverse local and CI hardware environments."
          },
          {
            question: "Explain the difference between Playwright actionability checks and web-first assertions, and why click() and toBeVisible() solve different problems.",
            answer: "Actionability checks are internal prerequisites that Playwright runs before executing an action (such as .click() or .fill()). It verifies that the element is attached, visible, stable, receives pointer events, and is enabled. Assertions are explicit verifications of system requirements. An element can be 100% visible, but disabled (expect(btn).toBeVisible() passes, but btn.click() waits for enabled state). Conversely, an element can be visible, but obstructed by a transparent modal backdrop (expect(btn).toBeVisible() passes, but btn.click() waits for the overlay to clear).",
            architecturalContext: "Prevents false-positive tests where clicks were secretly swallowed by inactive controls or floating banners."
          },
          {
            question: "How do you design a robust test strategy for eventually consistent distributed microservices in Playwright?",
            answer: "In eventually consistent systems (e.g., event-driven architectures where an action publishes a Kafka message and an asynchronous worker updates a database or WebSocket), immediate assertions fail. Senior SDETs use expect.poll() to poll backend status endpoints or database views with exponential backoff intervals, and expect.toPass() for multi-step retry blocks. Furthermore, UI tests should anchor to observable visual states (such as a 'Processing' banner transitioning to 'Completed') rather than assuming immediate completion.",
            architecturalContext: "Eliminates hard-coded sleeps and allows test suites to run at the maximum possible speed while tolerating asynchronous jitter."
          },
          {
            question: "When should you use expect.soft() and what are the architectural trade-offs?",
            answer: "expect.soft() records assertion failures without terminating the test function early. It is appropriate for exhaustive UI surface audits (e.g. verifying all fields in a settings page, all columns in a data grid, or visual style regressions) where learning about all 5 defects in a single test run is more valuable than stopping at the first failure. The trade-off is that soft assertions must never be used on critical prerequisites (such as logging in or creating an entity), because subsequent test steps will fail with unhelpful cascading errors.",
            architecturalContext: "Maximizes test feedback efficiency while preserving test isolation and clear failure diagnosis."
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
      actionsLesson,
      formsLesson
    ]
  },
  {
    slug: "browser-contexts-and-navigation",
    title: "4. Browser Contexts, Multi-Page & Navigation",
    description: "Master isolated browser contexts, multi-tab coordination, storage state persistence, frame locators, and resilient navigation.",
    iconName: "Globe",
    lessons: [
      browserContextsLesson
    ]
  },
  {
    slug: "network-and-api",
    title: "5. REST API Testing & Network Automation",
    description: "Master Playwright's APIRequestContext, test REST endpoints, validate schemas, simulate outages with page.route(), and build hybrid API/UI workflows.",
    iconName: "Sliders",
    lessons: [
      apiTestingLesson,
      networkInterceptionLesson
    ]
  },
  {
    slug: "enterprise-architecture",
    title: "6. Page Object Models, Fixtures & Custom Matchers",
    description: "Scale test suites with decoupled Page Object Models, custom test fixtures, and domain-specific assertions.",
    iconName: "Layers",
    lessons: [
      fixturesLesson,
      pomArchitectureLesson
    ]
  },
  {
    slug: "quality-audits",
    title: "7. Accessibility, Visual Testing & Core Web Vitals",
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
  if (id === "semantic-locators-hierarchy" || id === "strict-mode-and-filtering") {
    const locatorsLesson = getAllLessons().find((l) => l.id === "playwright-locators");
    if (locatorsLesson) return locatorsLesson;
  }
  if (id === "assertions-and-autowaiting" || id === "playwright-assertions-and-autowaiting") {
    const assertionsLesson = getAllLessons().find((l) => l.id === "playwright-assertions");
    if (assertionsLesson) return assertionsLesson;
  }
  if (
    id === "browser-actions-and-interactions" ||
    id === "playwright-actions-and-interactions" ||
    id === "playwright-browser-actions"
  ) {
    const actionsLessonFound = getAllLessons().find((l) => l.id === "playwright-actions");
    if (actionsLessonFound) return actionsLessonFound;
  }
  if (
    id === "accessible-form-controls" ||
    id === "forms-and-validation" ||
    id === "playwright-forms-and-validation" ||
    id === "playwright-forms"
  ) {
    const formsLessonFound = getAllLessons().find((l) => l.id === "playwright-forms");
    if (formsLessonFound) return formsLessonFound;
  }
  if (
    id === "browser-contexts-and-navigation" ||
    id === "browser-contexts-pages-navigation" ||
    id === "playwright-browser-contexts-pages-navigation" ||
    id === "browser-contexts" ||
    id === "playwright-browser-contexts"
  ) {
    const contextsLessonFound = getAllLessons().find((l) => l.id === "playwright-browser-contexts");
    if (contextsLessonFound) return contextsLessonFound;
  }
  if (
    id === "playwright-api-testing" ||
    id === "api-testing" ||
    id === "playwright-api" ||
    id === "rest-api-testing"
  ) {
    const apiLessonFound = getAllLessons().find((l) => l.id === "playwright-api-testing");
    if (apiLessonFound) return apiLessonFound;
  }
  if (
    id === "playwright-network-interception" ||
    id === "route-interception-and-mocking" ||
    id === "network-interception-and-mocking" ||
    id === "playwright-network-mocking" ||
    id === "network-mocking"
  ) {
    const networkLessonFound = getAllLessons().find((l) => l.id === "playwright-network-interception");
    if (networkLessonFound) return networkLessonFound;
  }
  if (
    id === "playwright-fixtures-and-test-data" ||
    id === "playwright-fixtures" ||
    id === "fixtures-and-test-data" ||
    id === "test-fixtures" ||
    id === "fixtures-and-hooks"
  ) {
    const fixturesLessonFound = getAllLessons().find((l) => l.id === "playwright-fixtures-and-test-data");
    if (fixturesLessonFound) return fixturesLessonFound;
  }
  if (
    id === "playwright-page-object-models" ||
    id === "playwright-page-object-model" ||
    id === "decoupled-page-object-models" ||
    id === "page-object-model" ||
    id === "page-object-models" ||
    id === "pom-architecture"
  ) {
    const pomLessonFound = getAllLessons().find((l) => l.id === "playwright-page-object-models");
    if (pomLessonFound) return pomLessonFound;
  }
  return getAllLessons().find((l) => l.id === id);
}

export function getNextAndPrevLesson(currentId: string): { prevLesson?: Lesson; nextLesson?: Lesson } {
  const resolvedLesson = getLessonById(currentId);
  const effectiveId = resolvedLesson ? resolvedLesson.id : currentId;
  const all = getAllLessons();
  const idx = all.findIndex((l) => l.id === effectiveId);
  if (idx === -1) return {};
  return {
    prevLesson: idx > 0 ? all[idx - 1] : undefined,
    nextLesson: idx < all.length - 1 ? all[idx + 1] : undefined,
  };
}
