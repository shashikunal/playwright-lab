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
        title: "Introduction to Playwright & Process Model",
        difficulty: "Beginner",
        durationMinutes: 15,
        prerequisites: ["Node.js 18+", "Basic TypeScript/JavaScript understanding"],
        summary: "Understand why Playwright outclasses legacy tools by running directly over browser devtools protocols with dedicated out-of-process isolation.",
        sections: [
          {
            id: "architecture-overview",
            title: "Architecture & Process Isolation",
            content: "Unlike Selenium WebDriver which communicates through an HTTP JSON Wire proxy layer, Playwright establishes a single bidirectional WebSocket connection directly to browser binaries (Chromium, Firefox, WebKit). A single Browser instance can host thousands of isolated BrowserContext instances—each with its own cookies, localStorage, cache, and session tokens—launching in mere milliseconds without browser restart overhead."
          },
          {
            id: "test-runner-anatomy",
            title: "Anatomy of a Playwright Test",
            content: "Playwright Test utilizes a declarative test runner with automatic fixture injection. Every test receives a fresh, isolated `page` fixture bound to an ephemeral `BrowserContext`. You never need to manually instantiate or teardown browser drivers."
          }
        ],
        codeExamples: [
          {
            id: "first-test",
            caption: "Basic Playwright Test Structure (e2e/smoke.spec.ts)",
            language: "typescript",
            code: `import { test, expect } from "@playwright/test";

test("authenticates user and loads workspace", async ({ page }) => {
  // 1. Navigate to target route
  await page.goto("/practice/login");

  // 2. Locate semantic inputs and perform user action
  await page.getByLabel("Username").fill("student");
  await page.getByLabel("Password").fill("Password123!");
  await page.getByRole("button", { name: "Submit" }).click();

  // 3. Web-first auto-retrying assertion
  await expect(page).toHaveURL(/.*\\/practice\\/dashboard/);
  await expect(page.getByRole("heading", { name: "Welcome to Practice Dashboard" })).toBeVisible();
});`,
            lineExplanations: [
              { line: 1, explanation: "Import test and expect from @playwright/test runner." },
              { line: 3, explanation: "Declare an asynchronous test case; page fixture is automatically provided." },
              { line: 5, explanation: "Navigate to relative route; automatically prefixes baseURL configured in playwright.config.ts." },
              { line: 8, explanation: "Semantic locator using accessible label text." },
              { line: 13, explanation: "Web-first assertion: polls until the URL matches regex, eliminating manual sleep calls." }
            ]
          }
        ],
        commonMistakes: [
          {
            title: "Hardcoding localhost URLs instead of baseURL",
            badPractice: `await page.goto("http://localhost:5173/practice/login");`,
            goodPractice: `await page.goto("/practice/login");`,
            explanation: "Hardcoding localhost breaks tests across CI environments, staging containers, and preview deploys. Configure baseURL in playwright.config.ts."
          },
          {
            title: "Using arbitrary sleeps instead of web-first assertions",
            badPractice: `await page.waitForTimeout(3000); expect(await page.title()).toBe("Dashboard");`,
            goodPractice: `await expect(page).toHaveTitle(/Dashboard/);`,
            explanation: "waitForTimeout causes slow and flaky tests. Web-first assertions automatically retry until condition is met or timeout expires."
          }
        ],
        practiceTask: {
          labRoute: "/practice/login",
          labName: "Practice Login Lab",
          objective: "Automate user authentication on the Practice Login lab and verify successful session redirection.",
          instructions: [
            "Navigate to the Practice Login page at /practice/login.",
            "Locate the username field with getByLabel('Username') and enter 'student'.",
            "Locate the password field with getByLabel('Password') and enter 'Password123!'.",
            "Click the submit button using getByRole('button', { name: 'Submit' }).",
            "Assert that the page navigates to /practice/dashboard and renders the welcome banner."
          ],
          acceptanceCriteria: [
            "Test targets semantic role and label locators exclusively.",
            "No hardcoded sleeps are present.",
            "Web-first assertion verifies dashboard heading presence."
          ],
          hint: "Use page.getByLabel('Username') instead of CSS input selectors.",
          solutionCode: `import { test, expect } from "@playwright/test";

test("submits valid credentials and verifies dashboard", async ({ page }) => {
  await page.goto("/practice/login");
  await page.getByLabel("Username").fill("student");
  await page.getByLabel("Password").fill("Password123!");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page).toHaveURL(/.*\\/practice\\/dashboard/);
  await expect(page.getByRole("heading", { name: /Practice Dashboard/i })).toBeVisible();
});`,
          playwrightCommand: "npx playwright test e2e/practice-login.spec.ts --project=chromium"
        },
        interviewQuestions: [
          {
            question: "How does Playwright's architecture differ from Selenium WebDriver?",
            answer: "Selenium uses an HTTP REST protocol (JSON Wire / W3C WebDriver) where every action is a separate round-trip HTTP request sent through a standalone driver executable (chromedriver, geckodriver). Playwright communicates directly with browser engines over a single persistent WebSocket connection, enabling atomic auto-waiting, network route interception, and multi-context emulation without driver intermediaries.",
            architecturalContext: "Enables sub-millisecond execution speeds, eliminates stale element reference exceptions, and supports multi-page/multi-tab synchronization out of the box."
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
