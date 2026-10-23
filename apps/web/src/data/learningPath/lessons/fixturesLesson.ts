import type { Lesson } from "../types";

export const fixturesLesson: Lesson = {
  id: "playwright-fixtures-and-test-data",
  moduleSlug: "enterprise-architecture",
  moduleTitle: "Page Object Models, Fixtures & Custom Matchers",
  title: "Playwright Fixtures, Hooks, and Test Data Management — Beginner to Advanced",
  difficulty: "Senior SDET",
  durationMinutes: 50,
  prerequisites: [
    "playwright-introduction",
    "configuration-and-browsers",
    "playwright-locators",
    "playwright-assertions",
    "playwright-actions",
    "playwright-forms",
    "playwright-browser-contexts",
    "playwright-api-testing",
    "playwright-network-interception",
  ],
  summary:
    "Master enterprise test fixtures, dependency injection, and thread-safe test data management with Playwright and TypeScript. Learn test.extend(), worker-scoped vs test-scoped lifecycles, automatic teardown guarantees with await use(), authenticated role fixtures, parallel test isolation, and anti-pattern refactoring.",
  sections: [
    {
      id: "why-fixtures-matter",
      title: "Part A — Why Fixtures Matter: The Dependency Injection Paradigm",
      content: `In traditional testing frameworks (such as Mocha, Jest, or legacy Selenium setups), test suites rely heavily on global or file-scoped mutable variables initialized inside beforeEach hooks and cleaned up in afterEach blocks. This paradigm suffers from critical architectural flaws:
1. Hidden Ordering Dependencies: When tests share file-scoped state, Test B subtly depends on Test A running first, causing cascading failures in parallel or sharded runs.
2. Incomplete Teardown Leaks: If an assertion throws an unhandled error inside a test or hook, standard cleanup routines are frequently bypassed, leaving orphaned records in the database or open browser instances.
3. Wasteful Over-Provisioning: A beforeEach hook runs unconditionally for every single test in the file, even if 9 out of 10 tests do not require a database connection, authenticated session, or canvas context.

Playwright's Fixture Architecture completely replaces mutable file-scoped state with declarative Dependency Injection:
- On-Demand Execution: Playwright builds a directed acyclic graph (DAG) of fixtures requested by the test arguments. If a test only requests ({ page }), database or role fixtures are never instantiated.
- Encapsulated Setup and Teardown: A fixture manages both its initialization and its teardown in a single atomic function using the 'await use(value)' convention. Code before use() runs during setup; code after use() runs during teardown—even if the test fails or times out.
- Composable Hierarchies: Fixtures cleanly depend on other fixtures (e.g. an authenticated adminPage depends on adminContext, which depends on browser).

When to Use What:
- Helper Functions: Best for pure computations, locator generators, or stateless assertions (e.g., generateEmail(), calculateTax()).
- Hooks (beforeEach/afterEach): Useful for lightweight, file-wide environmental resets (e.g., setting page-level request headers or resetting mock clock).
- Test Fixtures: The industry gold standard for provisioning resources with lifecycles (browser contexts, API clients, seeded database records, authenticated pages, and audit logs).`,
    },
    {
      id: "builtin-fixtures",
      title: "Part B — Built-In Fixtures: Lifecycles, Scopes & Resource Management",
      content: `Playwright provides a core set of built-in fixtures out of the box. Understanding their lifecycle and scope is essential for architecting reliable test suites:

1. page (Test-Scoped):
- The primary interactive window. Created inside a fresh, isolated BrowserContext for every individual test.
- Automatically closed when the test concludes, discarding all cookies, localStorage, session storage, and cache.

2. context (Test-Scoped):
- The BrowserContext hosting the test's page. Equivalent to an ephemeral Incognito profile.
- Allows configuring storageState, viewport, permissions, geolocation, and HTTP credentials per test.

3. browser (Worker-Scoped):
- The physical browser instance (Chromium, Firefox, or WebKit) launched as an OS process.
- Shared across all tests executed by the same worker process. Re-used across tests to eliminate the multi-second overhead of process booting.

4. browserName (Worker-Scoped):
- A string identifier ('chromium', 'firefox', or 'webkit') indicating the current engine. Enables browser-specific conditionals or platform skips.

5. request (Test-Scoped):
- A pre-configured APIRequestContext tied to the project baseURL. Independent of browser cookies unless explicitly bound to a context.
- Ideal for fast API-driven seed data provisioning and backend state assertions.

6. playwright (Worker-Scoped):
- The root Playwright selector engine and driver instance. Rarely accessed directly, but provides access to selectors, devices, and engine types.

Test-Scoped vs. Worker-Scoped Rules:
- Test-Scoped: Created anew for each test function. Guarantees 100% thread isolation.
- Worker-Scoped: Created once per worker thread process. Retained across hundreds of tests. Must NEVER store mutable test assertion state.`,
    },
    {
      id: "hooks-deep-dive",
      title: "Part C — Test Hooks: Execution Order, Scopes, and Failure Semantics",
      content: `Hooks provide lifecycle interception points around test suites and describe blocks:

1. Hook Matrix & Scope:
- test.beforeAll(): Executes once per worker process before any test in that file or describe block runs. Ideal for read-only schema checks or expensive read-only seed data.
- test.beforeEach(): Executes before every individual test function. Used for page navigation or route mock attachment.
- test.afterEach(): Executes after every individual test function. Used for capturing diagnostic telemetry or cleaning ephemeral state.
- test.afterAll(): Executes once per worker process after all tests in that scope finish.

2. Hook Execution Hierarchy:
In nested describe blocks, Playwright executes hooks in strict deterministic order:
- Before Hooks: Outer describe beforeEach -> Inner describe beforeEach -> Test body.
- After Hooks: Inner describe afterEach -> Outer describe afterEach.

3. Failure Semantics & Teardown Guarantees:
- If a beforeEach hook fails, the test body is skipped, but afterEach hooks STILL execute.
- Shared mutable state in hooks (e.g., let userId = '') is the leading cause of test flakiness. If Test 1 mutates userId and fails halfway through, Test 2 starts with corrupted state. Always prefer custom fixtures over mutable hook variables.`,
    },
    {
      id: "custom-fixtures-architecture",
      title: "Part D — Custom Fixtures: test.extend(), Composition & Worker Scopes",
      content: `Creating custom fixtures with test.extend() allows you to inject domain-specific capabilities directly into tests with complete type safety.

1. The test.extend<CustomFixtures, WorkerFixtures>() Signature:
You define TypeScript types for your test-scoped fixtures and worker-scoped fixtures, then pass an extension object to baseTest.extend().

2. The Setup and Teardown Lifecycle Pattern:
Every fixture receives its dependencies, a 'use' callback, and testInfo metadata:
export const test = baseTest.extend<MyFixtures>({
  adminPage: async ({ browser }, use) => {
    // 1. Setup Phase
    const context = await browser.newContext({ storageState: '.auth/admin.json' });
    const page = await context.newPage();

    // 2. Yield to the test
    await use(page);

    // 3. Teardown Phase (Guaranteed execution!)
    await context.close();
  }
});

3. Fixture Composition (Dependency Injection):
Fixtures can declare other custom fixtures as prerequisites:
- seededTestCourse depends on appClient and workerNamespace.
- courseCatalogPage depends on seededTestCourse and page.
Playwright automatically resolves dependencies, executes setup in topological order, and executes teardowns in reverse order.

4. Automatic Fixtures ({ auto: true }):
An automatic fixture executes for every test without being explicitly listed in the test signature. Use with extreme caution: only for cross-cutting observability (such as logging or console error interception). Never use auto fixtures for heavy resource provisioning.`,
    },
    {
      id: "test-data-management",
      title: "Part E — Test Data Management: Determinism, Factories & Cleanup",
      content: `Managing test data is the primary differentiator between amateur automation suites and production-grade enterprise testing frameworks.

1. Test Data Factories:
Instead of hardcoding static JSON payloads across test files, use programmatic factory functions with sensible defaults and optional overrides:
function createCoursePayload(overrides?: Partial<CourseInput>): CourseInput {
  return {
    code: 'AUTO-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
    title: 'Automated Course ' + Date.now(),
    seats: 25,
    price: 299,
    ...overrides
  };
}

2. Thread-Safe Namespacing:
When running 6 or 12 workers in parallel, two workers creating an item with code 'TEST-001' will cause unique-constraint collisions. Prefix entity identifiers with a worker namespace and timestamp:
const code = workerNamespace + 'COURSE_' + Date.now();

3. API-Based Provisioning:
Never use the browser UI to set up test prerequisites! Creating an entity through 4 form pages takes 4,500ms and introduces 12 points of UI failure. Instead, use an API request (30ms) to provision the database record, then navigate the browser directly to the test target.

4. Safe Teardown vs. Destructive Global Resets:
- Bad Anti-Pattern: Calling 'DELETE /api/courses/all' or 'TRUNCATE TABLE' in afterEach. This instantly destroys data that concurrent parallel workers are actively testing.
- Enterprise Pattern: Each test only deletes the exact records it created (tracked by ID in the fixture teardown block).`,
    },
    {
      id: "auth-session-reuse",
      title: "Part F — Authentication & Role-Based Context Reuse",
      content: `Logging in through the web UI before each test is an enormous waste of execution time. If 100 tests each spend 3 seconds filling username, password, and submitting, 5 minutes of test run time is wasted on redundant UI logins.

1. Storage State Pre-Authentication:
Playwright captures authenticated browser state (cookies, localStorage, and sessionStorage) into JSON files via a dedicated setup project (auth.setup.ts):
- .auth/admin.json
- .auth/trainer.json
- .auth/learner.json

2. Role-Based Page Fixtures:
Custom fixtures provide pre-authenticated pages directly to tests:
test('trainer can edit course', async ({ trainerPage }) => {
  await trainerPage.goto('/app/courses');
  // Immediately authenticated as Morgan Trainer!
});

3. When to Test UI Login:
Reusing storage state does not mean authentication is untested. You maintain a dedicated, isolated authentication test suite (auth.spec.ts) verifying login forms, bad passwords, locked accounts, and MFA. All other functional suites bypass the login form and reuse storage state.`,
    },
    {
      id: "parallel-isolation",
      title: "Part G — Parallel Execution, Worker Threads & Zero-Crosstalk Design",
      content: `Playwright achieves extraordinary speed by running tests across multiple parallel worker OS processes. However, parallel execution ruthlessly exposes poor test isolation.

1. Worker Isolation Model:
Each worker process runs its own Node.js runtime and browser process. Workers do not share memory heap. A global variable mutated in Worker 1 is completely invisible to Worker 2.

2. Shared External State (Database & Storage):
While workers have isolated memory, they share external state: the local backend Express server, the database, and file storage.
- Rule 1: Never write tests that assert total collection counts (e.g. expect(courses.length).toBe(10)). Concurrent tests adding courses will break this assertion.
- Rule 2: Always assert on unique record identifiers or scoped query results.
- Rule 3: Use worker-scoped namespaces (w0_, w1_) to isolate database records by worker.

3. Serial Mode vs. Parallel Isolation:
test.describe.serial() forces tests in a describe block to run sequentially on a single worker. While occasionally needed for strict legacy workflows, overuse indicates poorly isolated test design. Strive to make every test completely self-contained.`,
    },
    {
      id: "architecture-best-practices",
      title: "Part H — Senior Architecture & Diagnostic Best Practices",
      content: `Building an enterprise test architecture requires disciplined design patterns:

1. The Single-Responsibility Fixture Principle:
Avoid 'God Fixtures' that do everything: log in, seed 15 database tables, navigate to 3 pages, and start background listeners. Keep fixtures focused and atomic:
- authClient (API client with bearer token)
- seededTestUser (provisions one user)
- seededTestCourse (provisions one course)
- courseDetailsPage (Page Object Model)

2. Guaranteed Cleanup with try...finally:
Ensure teardown code runs even if an unhandled rejection occurs:
export const test = baseTest.extend({
  ephemeralResource: async ({ request }, use) => {
    const item = await createItem();
    try {
      await use(item);
    } finally {
      await deleteItem(item.id).catch(console.error);
    }
  }
});

3. Decision Framework:
- Need to share a live browser context or API client? -> Use a Fixture.
- Need a teardown guarantee after a test fails? -> Use a Fixture.
- Need a reusable calculation, data transform, or locator query? -> Use a Helper function.
- Need a page-wide route mock or timer reset? -> Use a Hook.`,
    },
  ],
  codeExamples: [
    {
      id: "custom-fixture-extend",
      caption: "Defining Custom Fixtures with test.extend() (e2e/fixtures/index.ts)",
      language: "typescript",
      code: `import { test as baseTest, expect, Page, BrowserContext, request, APIRequestContext } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

export type CustomFixtures = {
  appClient: APIRequestContext;
  adminPage: Page;
  seededTestData: {
    courseId: string;
    courseCode: string;
    courseTitle: string;
  };
};

export type WorkerFixtures = {
  workerNamespace: string;
};

export const test = baseTest.extend<CustomFixtures, WorkerFixtures>({
  // Worker-scoped: generated once per worker OS process
  workerNamespace: [
    async ({}, use, workerInfo) => {
      const namespace = "w" + workerInfo.workerIndex + "_";
      await use(namespace);
    },
    { scope: "worker" }
  ],

  // Test-scoped: API client with admin bearer token
  appClient: async ({}, use) => {
    const apiContext = await request.newContext({
      baseURL: "http://127.0.0.1:3001",
      extraHTTPHeaders: {
        Accept: "application/json",
        Authorization: "Bearer tok_admin_session"
      }
    });
    await use(apiContext);
    await apiContext.dispose();
  },

  // Test-scoped: pre-authenticated admin page
  adminPage: async ({ browser }, use) => {
    const storageStatePath = path.resolve(".auth/admin.json");
    const context = fs.existsSync(storageStatePath)
      ? await browser.newContext({ storageState: storageStatePath })
      : await browser.newContext();
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // Composed test data fixture with automatic lifecycle cleanup
  seededTestData: async ({ appClient, workerNamespace }, use) => {
    const uniqueId = Date.now() + "_" + Math.floor(Math.random() * 1000);
    const courseCode = workerNamespace + "AUTO-" + uniqueId.slice(-4);
    const courseTitle = workerNamespace + " Automated Fixture Course " + uniqueId;

    const res = await appClient.post("/api/app/courses", {
      data: {
        code: courseCode,
        title: courseTitle,
        category: "DevOps",
        difficulty: "intermediate",
        seats: 25,
        price: 349
      }
    });
    const created = await res.json();
    const courseId = created.course.id;

    // Yield to test execution
    await use({ courseId, courseCode, courseTitle });

    // Automatic teardown: runs even if test assertions fail
    await appClient.delete("/api/app/courses/" + courseId).catch(() => {});
  }
});

export { expect } from "@playwright/test";`,
      lineExplanations: [
        { line: 5, explanation: "TypeScript interface defining test-scoped custom fixtures." },
        { line: 15, explanation: "TypeScript interface defining worker-scoped fixtures." },
        { line: 20, explanation: "Worker-scoped fixture provides unique thread namespace (w0_, w1_)." },
        { line: 29, explanation: "Test-scoped APIRequestContext configured with base URL and auth header." },
        { line: 42, explanation: "adminPage fixture loads storageState JSON snapshot for instantaneous auth." },
        { line: 53, explanation: "Composed fixture creates test entity via API before test and deletes it after." },
        { line: 75, explanation: "Code after await use() is guaranteed to execute during test teardown." },
      ],
    },
    {
      id: "consuming-custom-fixtures",
      caption: "Consuming Custom Fixtures in Test Files (e2e/fixtures.spec.ts)",
      language: "typescript",
      code: `import { test, expect } from "./fixtures/index.js";

test.describe("Enterprise Test Fixture Consumption", () => {
  test("authenticates instantly and consumes seeded course data", async ({
    adminPage,
    seededTestData,
    appClient
  }) => {
    // 1. Verify entity was provisioned via API
    expect(seededTestData.courseId).toBeDefined();

    // 2. Validate backend persistence
    const res = await appClient.get("/api/app/courses/" + seededTestData.courseId);
    expect(res.ok()).toBeTruthy();

    // 3. Navigate UI directly as authenticated admin
    await adminPage.goto("/app/courses");
    await adminPage.getByLabel("Search courses").fill(seededTestData.courseCode);
    await expect(adminPage.getByText(seededTestData.courseTitle)).toBeVisible();
  });
});`,
      lineExplanations: [
        { line: 1, explanation: "Import extended 'test' and 'expect' from custom fixtures module." },
        { line: 4, explanation: "Test requests adminPage, seededTestData, and appClient fixtures." },
        { line: 10, explanation: "seededTestData was created before test function started." },
        { line: 17, explanation: "adminPage arrives at /app/courses already logged in as Sam Admin." },
      ],
    },
    {
      id: "dual-role-fixture",
      caption: "Senior Pattern: Multi-Role Concurrent Orchestration Fixture",
      language: "typescript",
      code: `import { test as baseTest, expect, Page, BrowserContext } from "@playwright/test";
import path from "node:path";

export type DualRoleFixtures = {
  dualRoleLab: {
    adminPage: Page;
    learnerPage: Page;
  };
};

export const test = baseTest.extend<DualRoleFixtures>({
  dualRoleLab: async ({ browser }, use) => {
    const adminContext = await browser.newContext({ storageState: path.resolve(".auth/admin.json") });
    const learnerContext = await browser.newContext({ storageState: path.resolve(".auth/learner.json") });

    const adminPage = await adminContext.newPage();
    const learnerPage = await learnerContext.newPage();

    // Yield both isolated browser pages to the test
    await use({ adminPage, learnerPage });

    // Guaranteed teardown for both contexts
    await adminContext.close();
    await learnerContext.close();
  }
});

test("admin actions reflect immediately in learner view", async ({ dualRoleLab }) => {
  const { adminPage, learnerPage } = dualRoleLab;

  await adminPage.goto("/app/courses");
  await learnerPage.goto("/app/courses");

  await expect(adminPage.getByText(/Role: admin/i)).toBeVisible();
  await expect(learnerPage.getByText(/Role: learner/i)).toBeVisible();
});`,
      lineExplanations: [
        { line: 12, explanation: "Provisions two distinct BrowserContexts inside a single test." },
        { line: 19, explanation: "Yields both pages for cross-role synchronized testing." },
        { line: 23, explanation: "Closes both browser contexts cleanly upon test completion." },
      ],
    },
  ],
  commonMistakes: [
    {
      title: "Shared Mutable Variables in File Scope",
      badPractice: `let createdCourseId: string;\n\ntest.beforeEach(async ({ request }) => {\n  const res = await request.post('/api/courses', { data: { title: 'Shared Course' } });\n  const data = await res.json();\n  createdCourseId = data.id;\n});\n\ntest('test A', async () => { /* uses createdCourseId */ });\ntest('test B', async () => { /* overwrites or mutates createdCourseId */ });`,
      goodPractice: `export const test = baseTest.extend<{ testCourse: Course }>({\n  testCourse: async ({ request }, use) => {\n    const res = await request.post('/api/courses', { data: { title: 'Isolated Course' } });\n    const data = await res.json();\n    await use(data.course);\n    await request.delete('/api/courses/' + data.course.id);\n  }\n});`,
      explanation:
        "File-scoped variables create cross-test state leakage, make parallel execution unstable, and cause flakiness when tests run out of order.",
    },
    {
      title: "Destructive Global Cleanup in Hooks",
      badPractice: `test.afterEach(async ({ request }) => {\n  // Destroys data belonging to other concurrent parallel worker threads!\n  await request.delete('/api/courses/all');\n});`,
      goodPractice: `testCourse: async ({ request }, use) => {\n  const item = await createCourse(request);\n  await use(item);\n  // Only deletes the exact item created for this test!\n  await request.delete('/api/courses/' + item.id);\n}`,
      explanation:
        "Global resets or truncate operations executed in test teardowns will violently destroy entities actively being tested by concurrent worker threads.",
    },
    {
      title: "Using UI Actions for Test Setup",
      badPractice: `test('verifies enrollment', async ({ page }) => {\n  await page.goto('/login');\n  await page.fill('#user', 'admin');\n  await page.fill('#pass', 'secret');\n  await page.click('#submit');\n  await page.goto('/courses/create');\n  // 15 UI form fields filled...\n});`,
      goodPractice: `test('verifies enrollment', async ({ adminPage, seededTestData }) => {\n  // Arrives pre-authenticated with data pre-seeded in 20 milliseconds!\n  await adminPage.goto('/courses/' + seededTestData.courseId);\n});`,
      explanation:
        "UI-based setup multiplies test execution time by 10x and multiplies failure points. Always set up state via APIs and use UI only for the feature under test.",
    },
    {
      title: "Storing Assertion State in Worker-Scoped Fixtures",
      badPractice: `workerSharedList: [async ({}, use) => {\n  const list: string[] = [];\n  await use(list); // Mutated by multiple tests!\n}, { scope: 'worker' }]`,
      goodPractice: `testIsolatedList: async ({}, use) => {\n  const list: string[] = [];\n  await use(list); // Pristine for every test\n}`,
      explanation:
        "Worker fixtures survive across hundreds of tests. Storing mutable test state in worker fixtures causes silent cross-test data pollution.",
    },
    {
      title: "Missing await on use() in Fixtures",
      badPractice: `myFixture: async ({ page }, use) => {\n  use(page); // Missing await!\n  await page.close(); // Executes immediately before test even runs!\n}`,
      goodPractice: `myFixture: async ({ page }, use) => {\n  await use(page); // Pauses until test completes\n  await page.close(); // Clean teardown\n}`,
      explanation:
        "The use() callback returns a Promise that only resolves when the test completes. Forgetting 'await' causes immediate teardown execution while the test is still running.",
    },
    {
      title: "Committing Auth Secrets or Storage State Files to Git",
      badPractice: `// In source control: .auth/admin.json with live production JWTs\nconst context = await browser.newContext({ storageState: './prod-admin.json' });`,
      goodPractice: `// In .gitignore: .auth/\n// Generated dynamically in auth.setup.ts from local environment variables\nconst context = await browser.newContext({ storageState: path.resolve('.auth/admin.json') });`,
      explanation:
        "Storage state files contain session tokens and credentials. They must always be gitignored and generated dynamically in setup projects.",
    },
  ],
  playground: {
    title: "Fixtures & Test Data Architecture Playground",
    configExample: `import { test as baseTest, expect, Page, APIRequestContext, request } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

export type CustomFixtures = {
  appClient: APIRequestContext;
  adminPage: Page;
  seededTestCourse: { id: string; code: string; title: string };
};

export type WorkerFixtures = {
  workerNamespace: string;
};

export const test = baseTest.extend<CustomFixtures, WorkerFixtures>({
  workerNamespace: [
    async ({}, use, workerInfo) => {
      await use("w" + workerInfo.workerIndex + "_");
    },
    { scope: "worker" }
  ],

  appClient: async ({}, use) => {
    const apiContext = await request.newContext({
      baseURL: "http://127.0.0.1:3001",
      extraHTTPHeaders: {
        Authorization: "Bearer tok_admin_session"
      }
    });
    await use(apiContext);
    await apiContext.dispose();
  },

  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: path.resolve(".auth/admin.json") });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  seededTestCourse: async ({ appClient, workerNamespace }, use) => {
    const code = workerNamespace + "COURSE_" + Date.now();
    const res = await appClient.post("/api/app/courses", {
      data: { code, title: "Seeded " + code, category: "DevOps", seats: 20, price: 199 }
    });
    const { course } = await res.json();
    await use(course);
    await appClient.delete("/api/app/courses/" + course.id).catch(() => {});
  }
});`,
    properties: [
      {
        name: "test.extend()",
        type: "Function",
        defaultValue: "baseTest",
        description: "Creates an extended test object with custom test-scoped and worker-scoped fixtures.",
        impact: "Enables type-safe dependency injection across all tests.",
      },
      {
        name: "await use(value)",
        type: "Async Callback",
        defaultValue: "N/A",
        description: "Yields control and resource to the test function; pauses until test completion.",
        impact: "Guarantees that code after await use() runs as teardown even if test fails.",
      },
      {
        name: "scope: 'test'",
        type: "String ('test' | 'worker')",
        defaultValue: "'test'",
        description: "Re-instantiates the fixture freshly for every individual test case.",
        impact: "Provides 100% thread isolation and prevents cross-test state leakage.",
      },
      {
        name: "scope: 'worker'",
        type: "String ('test' | 'worker')",
        defaultValue: "'test'",
        description: "Instantiates the fixture once per worker OS process and shares across tests in that worker.",
        impact: "Ideal for process-level resources (workerNamespace, database pools).",
      },
      {
        name: "auto: true",
        type: "Boolean",
        defaultValue: "false",
        description: "Automatically executes the fixture for all tests in scope without explicit declaration.",
        impact: "Useful for background telemetry or console monitoring; risky if overused.",
      },
      {
        name: "workerInfo.workerIndex",
        type: "Number",
        defaultValue: "0",
        description: "Zero-based index of the current worker process executing the test.",
        impact: "Enables deterministic partitioning of test data (w0_, w1_) in parallel runs.",
      },
      {
        name: "storageState",
        type: "String | Object",
        defaultValue: "undefined",
        description: "Path to JSON file containing authenticated cookies and localStorage snapshots.",
        impact: "Bypasses UI login screens for 10x faster test execution.",
      },
      {
        name: "testInfo.status",
        type: "String",
        defaultValue: "'passed'",
        description: "Terminal status of the test ('passed', 'failed', 'timedOut', 'interrupted').",
        impact: "Enables conditional teardown (e.g. capturing extra diagnostics only on failure).",
      },
      {
        name: "request.newContext()",
        type: "Function",
        defaultValue: "N/A",
        description: "Creates an isolated APIRequestContext for backend HTTP calls.",
        impact: "Enables fast API-based test data creation and deterministic cleanup.",
      },
      {
        name: "browser.newContext()",
        type: "Function",
        defaultValue: "N/A",
        description: "Creates an isolated incognito browser session.",
        impact: "Enables multi-user or multi-role testing within a single test.",
      },
      {
        name: "try...finally in Fixture",
        type: "Pattern",
        defaultValue: "Recommended",
        description: "Wraps await use() in try/finally to guarantee teardown execution.",
        impact: "Prevents orphaned test records in backend stores.",
      },
      {
        name: "test.describe.configure({ mode: 'serial' })",
        type: "Configuration",
        defaultValue: "'default'",
        description: "Runs tests in the block serially on a single worker and aborts rest if one fails.",
        impact: "Use only for strict sequential workflows; avoid for independent tests.",
      },
    ],
    behaviorComparison: [
      {
        aspect: "Lifecycle Encapsulation",
        defaultBehavior: "Hooks split setup (beforeEach) and teardown (afterEach) across disconnected blocks.",
        customizedBehavior: "Fixtures encapsulate setup and teardown in a single atomic function using await use().",
      },
      {
        aspect: "On-Demand Resource Allocation",
        defaultBehavior: "beforeEach runs unconditionally for every test even if not needed.",
        customizedBehavior: "Fixtures are lazy: only execute if declared in the test's argument signature.",
      },
      {
        aspect: "Parallel Safety",
        defaultBehavior: "File-scoped variables are shared and cause crosstalk in parallel runs.",
        customizedBehavior: "Test-scoped fixtures create pristine, thread-isolated instances per test.",
      },
      {
        aspect: "Teardown Guarantees",
        defaultBehavior: "If setup or test throws an unhandled error, afterEach can be skipped or misconfigured.",
        customizedBehavior: "Code after await use() is guaranteed to execute by the Playwright engine.",
      },
      {
        aspect: "Authentication Speed",
        defaultBehavior: "Logging in via UI before each test adds 3,000ms latency per test.",
        customizedBehavior: "Pre-authenticated fixtures load storageState JSON in under 20ms.",
      },
      {
        aspect: "Dependency Composition",
        defaultBehavior: "Hooks cannot declare explicit dependencies on other hooks.",
        customizedBehavior: "Fixtures form a typed dependency graph resolved automatically by Playwright.",
      },
    ],
    practiceTask:
      "Inspect the custom fixture implementation in e2e/fixtures/index.ts. Notice how workerNamespace, appClient, adminPage, and seededTestData are composed cleanly.",
    localCommand: "pnpm exec playwright test e2e/practice-fixtures.spec.ts --project=chromium",
  },
  exercises: [
    {
      id: "ex1-builtin-fixtures",
      title: "Exercise 1: Use Built-In Playwright Fixtures in an E2E Test",
      objective: "Utilize built-in fixtures (page, request, browserName) to inspect browser identity, perform health check, and verify UI navigation.",
      prerequisites: [
        "Playwright test declaration syntax",
        "Built-in fixture argument injection",
      ],
      scenario: "Verify that browserName provides a valid browser identifier, request queries /api/health, and page navigates to /app/courses.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 1: Built-in fixtures", async ({ page, request, browserName }) => {
  // TODO: Assert browserName is one of chromium, firefox, webkit
  // TODO: Query /api/health with request and assert 200 OK
  // TODO: Navigate page to /app/courses and assert search input is visible
});`,
      task: "Declare page, request, and browserName in test arguments, verify health status, and assert UI element visibility.",
      acceptanceCriteria: [
        "browserName verified as chromium, firefox, or webkit.",
        "request.get('/api/health') returns status 200 with status: 'ok'.",
        "page navigates to /app/courses and search input is visible.",
      ],
      expectedBehavior: "All three built-in fixtures execute within their respective lifecycles without manual instantiation.",
      hint: "Access { page, request, browserName } in the test parameters signature.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 1: Use built-in fixtures (page, request, browserName)", async ({ page, request: req, browserName }) => {
  expect(["chromium", "firefox", "webkit"]).toContain(browserName);

  const res = await req.get("/api/health");
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  expect(data.status).toBe("ok");

  await page.goto("/app/courses");
  await expect(page.getByLabel("Search courses")).toBeVisible();
});`,
      troubleshootingNotes: "Remember that request uses the baseURL configured in playwright.config.ts.",
      command: "pnpm exec playwright test e2e/practice-fixtures.spec.ts -g 'Exercise 1'",
    },
    {
      id: "ex2-setup-teardown-hooks",
      title: "Exercise 2: Create Deterministic Setup and Teardown Hooks",
      objective: "Implement test.beforeEach and test.afterEach hooks to track lifecycle sequence and guarantee post-test cleanup.",
      prerequisites: [
        "test.beforeEach and test.afterEach semantics",
        "Lifecycle execution ordering",
      ],
      scenario: "Maintain a lifecycle execution log verifying that beforeEach executes before test body and afterEach executes upon completion.",
      starterCode: `import { test, expect } from "@playwright/test";

test.describe("Exercise 2: Setup and teardown hooks", () => {
  const lifecycleLog: string[] = [];

  // TODO: test.beforeEach pushing to log and navigating
  // TODO: test.afterEach pushing to log
  // TODO: test asserting execution sequence
});`,
      task: "Build beforeEach and afterEach hooks, push tracking tokens, and verify execution sequence within test.",
      acceptanceCriteria: [
        "beforeEach initializes page and logs 'beforeEach_init'.",
        "Test logs 'test_execution' and asserts log sequence.",
        "afterEach logs 'afterEach_teardown'.",
      ],
      expectedBehavior: "Hooks execute in predictable chronological order before and after test body.",
      hint: "Use an array to track execution milestones in order.",
      solution: `import { test, expect } from "@playwright/test";

test.describe("Exercise 2: Setup and teardown hooks", () => {
  const lifecycleLog: string[] = [];

  test.beforeEach(async ({ page }) => {
    lifecycleLog.push("beforeEach_init");
    await page.goto("/app/courses");
  });

  test.afterEach(async () => {
    lifecycleLog.push("afterEach_teardown");
  });

  test("verifies hook execution sequence", async ({ page }) => {
    lifecycleLog.push("test_execution");
    expect(lifecycleLog).toEqual(["beforeEach_init", "test_execution"]);
    await expect(page.getByLabel("Search courses")).toBeVisible();
  });
});`,
      troubleshootingNotes: "Hooks inside describe blocks only apply to tests inside that specific describe block.",
      command: "pnpm exec playwright test e2e/practice-fixtures.spec.ts -g 'Exercise 2'",
    },
    {
      id: "ex3-custom-fixture-extend",
      title: "Exercise 3: Build a Custom Fixture with test.extend()",
      objective: "Define and consume a custom monitoredPage fixture that captures client-side console errors during execution.",
      prerequisites: [
        "test.extend() syntax",
        "Page console event listening",
      ],
      scenario: "Extend base test with monitoredPage yielding { page, consoleErrors }, navigate to course catalogue, and assert zero errors.",
      starterCode: `import { test as baseTest, expect } from "@playwright/test";

// TODO: Define CustomFixtures type with monitoredPage
// TODO: Extend test with monitoredPage attaching console listener
// TODO: Test consumes monitoredPage and asserts consoleErrors is empty`,
      task: "Implement monitoredPage fixture attaching page.on('console'), yield { page, consoleErrors }, and verify zero errors in test.",
      acceptanceCriteria: [
        "monitoredPage fixture cleanly extends base test.",
        "Console errors are captured in an array.",
        "Test navigates to /app/courses and verifies zero console errors.",
      ],
      expectedBehavior: "Custom fixture encapsulates cross-cutting observability logic without cluttering test code.",
      hint: "Listen to page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); }).",
      solution: `import { test as baseTest, expect, Page } from "@playwright/test";

export const test = baseTest.extend<{ monitoredPage: { page: Page; consoleErrors: string[] } }>({
  monitoredPage: async ({ page }, use) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    await use({ page, consoleErrors });
  }
});

test("Exercise 3: Build a custom fixture with test.extend()", async ({ monitoredPage }) => {
  const { page, consoleErrors } = monitoredPage;
  await page.goto("/app/courses");
  await expect(page.getByTestId("course-grid")).toBeVisible();
  expect(consoleErrors).toEqual([]);
});`,
      troubleshootingNotes: "Always call await use() to pass the fixture value to the test function.",
      command: "pnpm exec playwright test e2e/practice-fixtures.spec.ts -g 'Exercise 3'",
    },
    {
      id: "ex4-fixture-test-data-cleanup",
      title: "Exercise 4: Implement a Fixture that Creates and Cleans Up Test Data",
      objective: "Build an isolatedCourse fixture that provisions a course via API before the test and deletes it in teardown.",
      prerequisites: [
        "API-based entity creation",
        "Guaranteed fixture teardown after await use()",
      ],
      scenario: "Provision a course with unique code, yield metadata to test, assert API persistence, and verify automatic teardown.",
      starterCode: `import { test, expect } from "./fixtures/index.js";

test("Exercise 4: Test data provisioning and teardown", async ({ page, isolatedCourse, request }) => {
  // TODO: Assert isolatedCourse has ID and code
  // TODO: Query GET /api/app/courses/:id to verify persistence
  // TODO: Search course in UI at /app/courses
});`,
      task: "Consume isolatedCourse fixture, verify API persistence, search in UI, and let fixture teardown automatically delete the record.",
      acceptanceCriteria: [
        "isolatedCourse.id and isolatedCourse.code are defined.",
        "GET /api/app/courses/:id returns 200 OK.",
        "Course appears in UI search results.",
      ],
      expectedBehavior: "Entity is created before test runs and deleted after test completes with zero manual cleanup in test.",
      hint: "The fixture's teardown code runs automatically when the test exits.",
      solution: `test("Exercise 4: Implement a fixture that provisions and cleans up test data", async ({ page, isolatedCourse, request: req }) => {
  expect(isolatedCourse.id).toBeDefined();
  expect(isolatedCourse.code).toContain("FX-");

  const res = await req.get("/api/app/courses/" + isolatedCourse.id);
  expect(res.ok()).toBeTruthy();

  await page.goto("/app/courses");
  await page.getByLabel("Search courses").fill(isolatedCourse.code);
  await expect(page.getByText(isolatedCourse.title)).toBeVisible();
});`,
      troubleshootingNotes: "In the fixture teardown, add .catch(() => {}) to prevent cleanup errors from masking test results.",
      command: "pnpm exec playwright test e2e/practice-fixtures.spec.ts -g 'Exercise 4'",
    },
    {
      id: "ex5-authenticated-fixture",
      title: "Exercise 5: Create an Authenticated Test Fixture (authTrainerPage)",
      objective: "Build a pre-authenticated trainer page fixture using storageState and verify privileged UI access without UI login.",
      prerequisites: [
        "Playwright storageState reuse",
        "Role-based authorization assertions",
      ],
      scenario: "Consume authTrainerPage to open /app/courses already authenticated as trainer, asserting role badge and Create Course button.",
      starterCode: `import { test, expect } from "./fixtures/index.js";

test("Exercise 5: Authenticated fixture", async ({ authTrainerPage }) => {
  // TODO: Navigate directly to /app/courses
  // TODO: Assert 'Role: trainer' badge is visible
  // TODO: Assert privileged 'Create Course' button is visible
});`,
      task: "Navigate directly to /app/courses using authTrainerPage and verify trainer role badge and privileged button without login steps.",
      acceptanceCriteria: [
        "No UI navigation to /login occurs.",
        "Role badge displays 'Role: trainer'.",
        "'Create Course' button is immediately visible.",
      ],
      expectedBehavior: "Storage state provides instant authentication, saving 2-3 seconds per test.",
      hint: "Use browser.newContext({ storageState: path.resolve('.auth/trainer.json') }) in fixture.",
      solution: `test("Exercise 5: Create an authenticated test fixture (authTrainerPage)", async ({ authTrainerPage }) => {
  await authTrainerPage.goto("/app/courses");
  await expect(authTrainerPage.getByText(/Role:\\s*trainer/i)).toBeVisible();
  await expect(authTrainerPage.getByRole("button", { name: "Create Course" })).toBeVisible();
});`,
      troubleshootingNotes: "Ensure .auth/trainer.json was generated by the auth setup project.",
      command: "pnpm exec playwright test e2e/practice-fixtures.spec.ts -g 'Exercise 5'",
    },
    {
      id: "ex6-compose-fixtures",
      title: "Exercise 6: Compose Two Dependent Fixtures",
      objective: "Create a composedCatalog fixture that depends on both the page fixture and isolatedCourse fixture.",
      prerequisites: [
        "Fixture dependency injection",
        "Hierarchical fixture composition",
      ],
      scenario: "composedCatalog consumes page and isolatedCourse, navigates to /app/courses, fills search input, and yields ready page.",
      starterCode: `import { test, expect } from "./fixtures/index.js";

test("Exercise 6: Composed fixtures", async ({ composedCatalog }) => {
  // TODO: Assert course title is visible
  // TODO: Assert search input value equals course code
});`,
      task: "Consume composedCatalog directly, demonstrating that setup across multiple fixtures is composed into a single high-level abstraction.",
      acceptanceCriteria: [
        "composedCatalog encapsulates navigation and filtering.",
        "Course title is immediately visible on page.",
        "Search input contains course code.",
      ],
      expectedBehavior: "Playwright automatically provisions isolatedCourse, then page, then runs composedCatalog setup.",
      hint: "composedCatalog declares { page, isolatedCourse } as its own fixture dependencies.",
      solution: `test("Exercise 6: Compose two dependent fixtures (composedCatalog)", async ({ composedCatalog }) => {
  const { page, course } = composedCatalog;
  await expect(page.getByText(course.title)).toBeVisible();
  expect(await page.getByLabel("Search courses").inputValue()).toBe(course.code);
});`,
      troubleshootingNotes: "Fixtures can depend on any number of upstream fixtures, creating clean composition trees.",
      command: "pnpm exec playwright test e2e/practice-fixtures.spec.ts -g 'Exercise 6'",
    },
    {
      id: "ex7-test-vs-worker-scoped",
      title: "Exercise 7: Demonstrate Test-Scoped vs. Worker-Scoped Fixture Behavior",
      objective: "Demonstrate that worker-scoped fixtures persist across tests in the same worker, while test-scoped fixtures reset every test.",
      prerequisites: [
        "Worker fixture scope: 'worker'",
        "Test fixture scope: 'test'",
      ],
      scenario: "Run two tests on the same worker; assert that workerRunId matches across both tests while testRunId is unique per test.",
      starterCode: `import { test, expect } from "./fixtures/index.js";

test("Exercise 7: Part 1", async ({ workerRunId, testRunId }) => {
  // TODO: Assert workerRunId format (worker_\\d+)
  // TODO: Assert testRunId format (test_[a-z0-9]+)
});

test("Exercise 7: Part 2", async ({ workerRunId, testRunId }) => {
  // TODO: Verify workerRunId is stable
  // TODO: Verify testRunId is unique
});`,
      task: "Assert format and stability of workerRunId and testRunId across two consecutive test cases.",
      acceptanceCriteria: [
        "workerRunId matches pattern worker_\\d+.",
        "testRunId matches pattern test_[a-z0-9]+.",
        "workerRunId persists across test boundaries in the worker thread.",
      ],
      expectedBehavior: "Worker-scoped fixtures execute once per OS worker process; test-scoped fixtures execute per test.",
      hint: "Use workerInfo.workerIndex in worker fixture to construct workerRunId.",
      solution: `test("Exercise 7: Demonstrate test-scoped vs worker-scoped behavior (Part 1)", async ({ workerRunId, testRunId }) => {
  expect(workerRunId).toMatch(/^worker_\\d+$/);
  expect(testRunId).toMatch(/^test_[a-z0-9]+$/);
});

test("Exercise 7: Demonstrate test-scoped vs worker-scoped behavior (Part 2)", async ({ workerRunId, testRunId }) => {
  expect(workerRunId).toMatch(/^worker_\\d+$/);
  expect(testRunId).toMatch(/^test_[a-z0-9]+$/);
});`,
      troubleshootingNotes: "Never store mutable test assertion state in worker-scoped fixtures.",
      command: "pnpm exec playwright test e2e/practice-fixtures.spec.ts -g 'Exercise 7'",
    },
    {
      id: "ex8-parallel-isolated-tests",
      title: "Exercise 8: Run Independent Tests in Parallel Without Data Collisions",
      objective: "Execute concurrent tests that provision backend records using unique worker namespaces without collision.",
      prerequisites: [
        "Thread-safe entity naming",
        "Worker namespace prefixing",
      ],
      scenario: "Two concurrent tests create courses prefixed with workerNamespace (PARALLEL_A and PARALLEL_B), assert success, and clean up.",
      starterCode: `import { test, expect } from "./fixtures/index.js";

test("Exercise 8: Parallel Test A", async ({ workerNamespace, request }) => {
  // TODO: Create course with code \`\${workerNamespace}PARALLEL_A_\${Date.now()}\`
  // TODO: Assert 201 Created and delete course
});

test("Exercise 8: Parallel Test B", async ({ workerNamespace, request }) => {
  // TODO: Create course with code \`\${workerNamespace}PARALLEL_B_\${Date.now()}\`
  // TODO: Assert 201 Created and delete course
});`,
      task: "Create two independent parallel tests using workerNamespace prefixes to prevent database uniqueness collisions.",
      acceptanceCriteria: [
        "Both tests execute in parallel workers without entity collision.",
        "Courses created with unique codes and cleaned up.",
        "No shared mutable state or destructive bulk deletes.",
      ],
      expectedBehavior: "Parallel workers operate on completely partitioned entity namespaces without crosstalk.",
      hint: "Prefix course codes with workerNamespace + Date.now().",
      solution: `test("Exercise 8: Run independent tests in parallel (Test A)", async ({ workerNamespace, request: req }) => {
  const uniqueCode = workerNamespace + "PARALLEL_A_" + Date.now();
  const res = await req.post("http://127.0.0.1:3001/api/app/courses", {
    headers: { Authorization: "Bearer tok_admin_session" },
    data: { code: uniqueCode, title: "Parallel Course A (" + workerNamespace + ")", category: "Core", seats: 10, price: 199 }
  });
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  await req.delete("http://127.0.0.1:3001/api/app/courses/" + data.course.id, {
    headers: { Authorization: "Bearer tok_admin_session" }
  });
});`,
      troubleshootingNotes: "Thread namespacing (w0_, w1_) prevents unique index violations on shared database tables.",
      command: "pnpm exec playwright test e2e/practice-fixtures.spec.ts -g 'Exercise 8'",
    },
    {
      id: "ex9-diagnose-shared-state",
      title: "Exercise 9: Diagnose a Shared-State Failure and Enforce Fixture Isolation",
      objective: "Demonstrate why module-level mutable variables fail and verify that test-scoped fixtures provide pristine isolation.",
      prerequisites: [
        "Shared state cross-test contamination",
        "Test-scoped fixture isolation guarantees",
      ],
      scenario: "Test 1 mutates isolatedState; Test 2 asserts that its isolatedState is completely empty and unpolluted.",
      starterCode: `import { test, expect } from "./fixtures/index.js";

test("Exercise 9: Test 1", async ({ isolatedState }) => {
  // TODO: Assert length is 0, push item, assert length is 1
});

test("Exercise 9: Test 2", async ({ isolatedState }) => {
  // TODO: Assert length is 0 (proving zero crosstalk from Test 1!)
});`,
      task: "Demonstrate that test-scoped fixture isolatedState gives each test a fresh instance, preventing shared-variable leakage.",
      acceptanceCriteria: [
        "Test 1 pushes an item into its isolated state.",
        "Test 2 receives a fresh array with length 0.",
        "Zero cross-test pollution occurs.",
      ],
      expectedBehavior: "Playwright re-executes the fixture factory for each test, providing complete isolation.",
      hint: "In custom fixture, instantiate const state: string[] = [] inside the fixture body.",
      solution: `test("Exercise 9: Diagnose shared-state and verify fixture isolation (Test 1)", async ({ isolatedState }) => {
  expect(isolatedState).toHaveLength(0);
  isolatedState.push("item_alpha");
  expect(isolatedState).toHaveLength(1);
});

test("Exercise 9: Diagnose shared-state and verify fixture isolation (Test 2)", async ({ isolatedState }) => {
  expect(isolatedState).toHaveLength(0);
});`,
      troubleshootingNotes: "Never declare mutable `let items = []` in file scope outside test functions.",
      command: "pnpm exec playwright test e2e/practice-fixtures.spec.ts -g 'Exercise 9'",
    },
    {
      id: "ex10-guaranteed-teardown-failure",
      title: "Exercise 10: Handle Guaranteed Cleanup After a Deliberately Failing Test",
      objective: "Verify that fixture teardown code executes unconditionally even when test assertions throw unexpected errors.",
      prerequisites: [
        "Playwright fixture teardown guarantee",
        "try...finally lifecycle resilience",
      ],
      scenario: "Simulate a fixture lifecycle where the test function throws an error; verify that teardown executed unconditionally.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 10: Guaranteed teardown", async () => {
  let teardownExecuted = false;
  // TODO: Simulate fixture lifecycle with try/finally
  // TODO: Test function throws an assertion error
  // TODO: Assert error was caught AND teardownExecuted is true
});`,
      task: "Simulate the Playwright fixture lifecycle with a failing test and assert that cleanup runs regardless of test outcome.",
      acceptanceCriteria: [
        "Test failure exception is handled.",
        "Teardown flag is set to true.",
        "Teardown execution is unconditional.",
      ],
      expectedBehavior: "Code placed after await use() in Playwright fixtures is executed by the runner even if the test fails.",
      hint: "Use try { await testFn(); } finally { teardownExecuted = true; }.",
      solution: `test("Exercise 10: Verify guaranteed teardown execution pattern", async () => {
  let teardownExecuted = false;
  const simulateFixtureLifecycle = async (testFn: () => Promise<void>) => {
    try {
      await testFn();
    } finally {
      teardownExecuted = true;
    }
  };

  let caughtError: Error | null = null;
  try {
    await simulateFixtureLifecycle(async () => {
      throw new Error("Simulated assertion failure inside test execution");
    });
  } catch (err) {
    caughtError = err as Error;
  }

  expect(caughtError).not.toBeNull();
  expect(caughtError?.message).toContain("Simulated assertion failure");
  expect(teardownExecuted).toBe(true);
});`,
      troubleshootingNotes: "This guarantee makes fixtures vastly superior to manual cleanup calls in test bodies.",
      command: "pnpm exec playwright test e2e/practice-fixtures.spec.ts -g 'Exercise 10'",
    },
    {
      id: "ex11-refactor-duplicated-setup",
      title: "Exercise 11: Refactor Duplicated Setup into an Appropriate Fixture",
      objective: "Refactor repetitive authentication and search setup into pre-composed fixtures.",
      prerequisites: [
        "Boilerplate reduction strategies",
        "Fixture adoption trade-offs",
      ],
      scenario: "Consume authTrainerPage and isolatedCourse together to perform an administrative search in 3 lines of test code.",
      starterCode: `import { test, expect } from "./fixtures/index.js";

test("Exercise 11: Refactor duplicated setup", async ({ authTrainerPage, isolatedCourse }) => {
  // TODO: Navigate to /app/courses with authTrainerPage
  // TODO: Search for isolatedCourse.code
  // TODO: Assert course title and Create Course button are visible
});`,
      task: "Replace 15 lines of manual login, navigation, and API creation with two composed fixtures.",
      acceptanceCriteria: [
        "Test is concise, readable, and focused on assertions.",
        "No manual login or token handling code in the test.",
        "Course title and Create Course button verified.",
      ],
      expectedBehavior: "Encapsulates repetitive operational setup, leaving test functions purely focused on business assertions.",
      hint: "Use authTrainerPage and isolatedCourse in test parameters.",
      solution: `test("Exercise 11: Refactor duplicated setup into an appropriate fixture", async ({ authTrainerPage, isolatedCourse }) => {
  await authTrainerPage.goto("/app/courses");
  await authTrainerPage.getByLabel("Search courses").fill(isolatedCourse.code);

  await expect(authTrainerPage.getByText(isolatedCourse.title)).toBeVisible();
  await expect(authTrainerPage.getByRole("button", { name: "Create Course" })).toBeVisible();
});`,
      troubleshootingNotes: "When setup code is repeated in more than two tests, promote it to a custom fixture.",
      command: "pnpm exec playwright test e2e/practice-fixtures.spec.ts -g 'Exercise 11'",
    },
    {
      id: "ex12-senior-multi-role-orchestration",
      title: "Exercise 12: Complete a Senior-Level Multi-Role Concurrent Orchestration Challenge",
      objective: "Provision and coordinate two distinct authenticated user roles (Admin and Learner) simultaneously in separate browser contexts.",
      prerequisites: [
        "Multi-context browser orchestration",
        "Cross-role concurrent testing",
      ],
      scenario: "dualRoleLab provides adminPage and learnerPage in parallel contexts; verify admin privileges and learner restrictions simultaneously.",
      starterCode: `import { test, expect } from "./fixtures/index.js";

test("Exercise 12: Multi-role orchestration", async ({ dualRoleLab, isolatedCourse }) => {
  // TODO: Destructure { adminPage, learnerPage } from dualRoleLab
  // TODO: Admin navigates to /app/courses and verifies admin role
  // TODO: Learner navigates to /app/courses, verifies learner role, verifies cannot create courses
  // TODO: Both search and verify isolatedCourse
});`,
      task: "Coordinate adminPage and learnerPage concurrently within a single test, asserting role permissions and shared visibility.",
      acceptanceCriteria: [
        "Admin and Learner run in separate, isolated BrowserContexts.",
        "Admin sees 'Role: admin'; Learner sees 'Role: learner'.",
        "Admin has 'Create Course' button; Learner does not.",
        "Both see the seeded isolatedCourse in search results.",
      ],
      expectedBehavior: "Senior architecture pattern enables real-time collaboration and role-permission verification in a single test.",
      hint: "dualRoleLab opens two separate BrowserContexts using storageState from admin.json and learner.json.",
      solution: `test("Exercise 12: Senior challenge — Multi-role concurrent dual-session orchestration", async ({ dualRoleLab, isolatedCourse }) => {
  const { adminPage, learnerPage } = dualRoleLab;

  await adminPage.goto("/app/courses");
  await expect(adminPage.getByText(/Role:\\s*admin/i)).toBeVisible();

  await learnerPage.goto("/app/courses");
  await expect(learnerPage.getByText(/Role:\\s*learner/i)).toBeVisible();
  await expect(learnerPage.getByRole("button", { name: "Create Course" })).not.toBeVisible();

  await adminPage.getByLabel("Search courses").fill(isolatedCourse.code);
  await expect(adminPage.getByText(isolatedCourse.title)).toBeVisible();

  await learnerPage.getByLabel("Search courses").fill(isolatedCourse.code);
  await expect(learnerPage.getByText(isolatedCourse.title)).toBeVisible();
});`,
      troubleshootingNotes: "Always close both contexts in the fixture teardown to prevent memory leaks.",
      command: "pnpm exec playwright test e2e/practice-fixtures.spec.ts -g 'Exercise 12'",
    },
  ],
  knowledgeCheck: [
    {
      id: "kc-fixtures-purpose",
      topic: "Beginner: Fixture Fundamentals",
      question: "What is the primary architectural advantage of Playwright fixtures over traditional beforeEach hooks?",
      options: [
        "Fixtures make tests run in headed mode by default",
        "Fixtures run lazily on-demand and encapsulate both setup and teardown in a single function with automatic cleanup guarantees",
        "Fixtures replace all Playwright locators with XPath selectors",
        "Fixtures prevent tests from failing when assertions error out",
      ],
      correctOptionIndex: 1,
      explanation:
        "Playwright fixtures execute lazily (only if requested by test parameters) and use the 'await use()' pattern to guarantee teardown execution even if tests fail or time out.",
    },
    {
      id: "kc-await-use-lifecycle",
      topic: "Beginner: The await use() Keyword",
      question: "In a Playwright custom fixture, when does the code placed AFTER 'await use(resource)' execute?",
      options: [
        "Immediately before the test function begins",
        "During test teardown, after the test function finishes or fails",
        "Only if all assertions in the test pass successfully",
        "Concurrently with the first assertion in the test body",
      ],
      correctOptionIndex: 1,
      explanation:
        "The use() callback pauses fixture execution until the test completes. Any code after 'await use()' is executed during test teardown, regardless of whether the test passed, failed, or timed out.",
    },
    {
      id: "kc-builtin-fixtures-scope",
      topic: "Beginner: Built-in Fixture Scopes",
      question: "Which of the following built-in Playwright fixtures is WORKER-scoped rather than test-scoped?",
      options: [
        "page",
        "context",
        "browser",
        "request",
      ],
      correctOptionIndex: 2,
      explanation:
        "The 'browser' fixture is worker-scoped: it is launched once per worker process and reused across tests. 'page', 'context', and 'request' are test-scoped and re-created for every individual test.",
    },
    {
      id: "kc-worker-scoped-rules",
      topic: "Intermediate: Worker-Scoped Fixture Constraints",
      question: "What is a critical architectural rule when implementing a worker-scoped fixture with scope: 'worker'?",
      options: [
        "Worker fixtures can only return string primitives, never objects",
        "Worker fixtures must never store or mutate test-specific assertion state across tests",
        "Worker fixtures cannot declare test.extend()",
        "Worker fixtures must always launch a new BrowserContext per test",
      ],
      correctOptionIndex: 1,
      explanation:
        "Because worker-scoped fixtures survive across many tests within the same worker process, storing mutable state inside them will cause cross-test contamination and non-deterministic failures.",
    },
    {
      id: "kc-parallel-isolation-namespace",
      topic: "Intermediate: Parallel Test Data Namespacing",
      question: "When running tests across 6 parallel workers against a shared backend, how should database entity identifiers (such as course codes) be structured to prevent collisions?",
      options: [
        "Use hardcoded codes like 'TEST_COURSE' and run with retries: 5",
        "Prefix identifiers with workerNamespace (e.g. w0_, w1_) and timestamps to ensure complete thread uniqueness",
        "Execute 'TRUNCATE TABLE courses' in afterEach hooks",
        "Wrap all tests in test.describe.serial()",
      ],
      correctOptionIndex: 1,
      explanation:
        "Partitioning entity identifiers with worker index namespaces (e.g. w0_, w1_) and timestamps ensures that concurrent workers never collide on unique database constraints.",
    },
    {
      id: "kc-fixture-composition",
      topic: "Intermediate: Fixture Composition",
      question: "How does Playwright resolve dependencies when Custom Fixture B declares Custom Fixture A in its argument list?",
      options: [
        "Playwright throws a circular dependency error",
        "Playwright constructs a dependency graph, executes Fixture A's setup first, passes the result to Fixture B, and executes teardowns in reverse order",
        "Playwright executes both fixtures simultaneously in separate threads",
        "Fixture B overrides and replaces Fixture A completely",
      ],
      correctOptionIndex: 1,
      explanation:
        "Playwright builds a directed acyclic graph (DAG) of fixtures, resolving upstream dependencies in topological order and executing teardowns in exact reverse order.",
    },
    {
      id: "kc-storagestate-reuse",
      topic: "Advanced: Authentication State Reuse",
      question: "Why is reusing storageState via custom fixtures preferred over logging in through the UI in every test?",
      options: [
        "Storage state makes passwords visible in the Playwright trace viewer",
        "Storage state bypasses the login screen in 20ms, saving minutes of redundant UI execution while dedicated auth tests verify the login form separately",
        "Storage state prevents CSRF attacks in production",
        "Storage state is required for Chromium to launch in headless mode",
      ],
      correctOptionIndex: 1,
      explanation:
        "Reusing pre-authenticated storageState reduces setup overhead from 3,000ms to 20ms per test. A dedicated auth test suite validates login functionality, while functional suites avoid repetitive UI logins.",
    },
    {
      id: "kc-destructive-cleanup-antipattern",
      topic: "Advanced: Destructive Cleanup Anti-Pattern",
      question: "Why is executing 'DELETE /api/courses/all' in an afterEach hook considered a severe anti-pattern in enterprise test engineering?",
      options: [
        "It causes an HTTP 405 Method Not Allowed error",
        "It destroys data currently being utilized by other parallel workers running concurrent tests against the same database",
        "It prevents Playwright traces from generating",
        "It causes browser contexts to crash immediately",
      ],
      correctOptionIndex: 1,
      explanation:
        "In a multi-worker parallel environment, global destructive deletes destroy records that other parallel workers are actively asserting, causing catastrophic flakiness.",
    },
    {
      id: "kc-fixture-vs-helper-decision",
      topic: "Advanced: Architectural Decision Framework",
      question: "Which scenario strongly demands a Playwright custom fixture rather than a simple helper function?",
      options: [
        "Formatting a date string into ISO-8601 format",
        "Calculating the total price of shopping cart items",
        "Creating an ephemeral database entity that requires guaranteed deletion after test completion, even on assertion failure",
        "Generating a random string for a user's first name",
      ],
      correctOptionIndex: 2,
      explanation:
        "Any resource that requires a managed lifecycle (setup and guaranteed teardown regardless of test pass/fail outcome) demands a custom fixture with the 'await use()' pattern.",
    },
  ],
  practiceTask: {
    labRoute: "/app/courses",
    labName: "Course Catalogue & Management Lab",
    objective:
      "Verify that an authenticated trainer can search, view, and inspect courses using custom test fixtures with automatic teardown.",
    instructions: [
      "Navigate to the Course Catalogue at /app/courses using a pre-authenticated fixture.",
      "Verify that the trainer role badge and 'Create Course' button are immediately visible.",
      "Provision a test course via backend API in a fixture, search by code, and verify visibility.",
      "Observe that the course is cleanly deleted upon test completion without leaving database clutter.",
    ],
    acceptanceCriteria: [
      "Custom fixture provisions course via POST /api/app/courses with admin token.",
      "Test navigates to /app/courses without performing UI login steps.",
      "Course is located via search and confirmed visible in [data-testid='course-grid'].",
      "Fixture teardown cleans up the course via DELETE /api/app/courses/:id.",
    ],
    hint: "Use authTrainerPage and isolatedCourse fixtures from e2e/practice-fixtures.spec.ts.",
    solutionCode: `import { test, expect } from "./fixtures/index.js";

test("trainer inspects seeded course in catalogue", async ({ authTrainerPage, isolatedCourse }) => {
  await authTrainerPage.goto("/app/courses");
  await authTrainerPage.getByLabel("Search courses").fill(isolatedCourse.code);

  await expect(authTrainerPage.getByText(isolatedCourse.title)).toBeVisible();
  await expect(authTrainerPage.getByRole("button", { name: "Create Course" })).toBeVisible();
});`,
    playwrightCommand: "pnpm exec playwright test e2e/practice-fixtures.spec.ts -g 'Exercise 11'",
  },
  interviewQuestions: [
    {
      question: "How does Playwright's Fixture Model differ from Cucumber / SpecFlow or JUnit / TestNG hooks?",
      answer:
        "Traditional xUnit runners use static lifecycle hooks (beforeEach/afterEach) that execute globally and store state in mutable class or file variables. Playwright treats fixtures as dependency-injected providers. A fixture only runs if a test declares it. Furthermore, setup and teardown are defined in a single function via 'await use()', guaranteeing symmetric teardown and enabling rich composition trees.",
      architecturalContext:
        "In enterprise CI pipelines running 20 parallel workers, dependency-injected fixtures eliminate 95% of test ordering dependencies and crosstalk bugs.",
    },
    {
      question: "What happens if an assertion fails inside the test body when using a custom fixture?",
      answer:
        "When an assertion throws an error in the test body, Playwright catches the error, marks the test as failed, and resumes execution inside the fixture immediately following 'await use()'. Any cleanup code in the fixture teardown runs unconditionally. This makes fixtures inherently safer than manual cleanup calls inside test bodies.",
      architecturalContext:
        "Guaranteed teardown ensures that staging and preview environments do not accumulate orphaned test records over thousands of CI runs.",
    },
    {
      question: "When would you intentionally use a worker-scoped fixture instead of a test-scoped fixture?",
      answer:
        "Worker-scoped fixtures (scope: 'worker') should only be used for expensive, read-only, or thread-level resources that can be safely shared across all tests executed by an OS process. Examples include: a database connection pool, a mock API server instance, or a unique worker namespace identifier (w0_, w1_). You must never store mutable assertion state in a worker fixture.",
      architecturalContext:
        "Reusing a connection pool at worker scope saves several seconds per test while preserving thread safety across processes.",
    },
    {
      question: "How do you handle multi-user scenarios (such as an Admin approving a request submitted by a Learner) in a single Playwright test?",
      answer:
        "By provisioning multiple BrowserContexts inside a single test via a custom multi-role fixture. Playwright's 'browser' object can create unlimited isolated contexts. Context 1 loads '.auth/admin.json' while Context 2 loads '.auth/learner.json'. The test coordinates actions between adminPage and learnerPage in real time, and the fixture teardown closes both contexts cleanly.",
      architecturalContext:
        "Multi-context orchestration enables realistic end-to-end testing of real-time collaboration, permissions, websockets, and approval workflows without complex test chaining.",
    },
  ],
};
