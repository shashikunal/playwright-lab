import type { Lesson } from "../types";

export const pomArchitectureLesson: Lesson = {
  id: "playwright-page-object-models",
  moduleSlug: "enterprise-architecture",
  moduleTitle: "Page Object Models, Fixtures & Custom Matchers",
  title: "Playwright Page Object Model and Enterprise Test Architecture — Beginner to Advanced",
  difficulty: "Senior SDET",
  durationMinutes: 55,
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
    "playwright-fixtures-and-test-data",
  ],
  summary:
    "Master production-grade test automation architecture, decoupled Page Object Models (POM), reusable Component Objects, and fixture-injected page instances with Playwright and TypeScript. Compare POMs with direct locators, helper functions, and Screenplay patterns. Design scalable folder structures, maintainable abstractions, and thread-safe multi-role workflows.",
  sections: [
    {
      id: "test-architecture-fundamentals",
      title: "Part A — Test Architecture Fundamentals & Separation of Intent",
      content: `At enterprise scale, automated test suites can easily grow from 50 tests to 5,000 tests across dozens of distributed teams. Without disciplined architecture, suites collapse under the weight of selector churn, duplicated user interaction workflows, and brittle abstractions.

1. Why Test Architecture Matters:
A test suite is enterprise software. It requires the same architectural rigor as production microservices:
- Separation of Intent from Implementation: A test should express *what* business capability is being verified (e.g. 'trainer creates DevOps course and searches for code'), not the mundane DOM plumbing of *how* elements are located, filled, and scrolled into view.
- Maintenance Localization: When a UI redesign renames an input or changes a modal dialog structure, you should update a single component or page object class—not 40 separate test files.
- Readability & Living Documentation: High-level tests serve as executable acceptance criteria that product managers, SDETs, and software engineers can readily understand.

2. Organizing Tests: Feature vs. Workflow vs. Test Type:
- By Feature (e.g. 'e2e/courses/search.spec.ts', 'e2e/courses/create.spec.ts'): Maximizes team ownership and locality.
- By User Workflow (e.g. 'e2e/workflows/enrollment-flow.spec.ts'): Validates multi-page end-to-end user journeys spanning UI and backend APIs.
- By Test Type / Speed (e.g. @smoke, @regression, @visual, @api): Configured via tags in playwright.config.ts to enable tiered CI pipelines.

3. Avoiding Premature Abstraction (The Rule of Three):
Abstraction is not free; it introduces indirection and cognitive load.
- Do not create a Page Object for a one-off promotional banner or an isolated component test.
- Apply the Rule of Three: Write direct locators initially; extract a reusable Component or Page Object only when the same UI surface or workflow is exercised across three or more test files.`,
    },
    {
      id: "pom-design-principles",
      title: "Part B — The Modern Playwright Page Object Model",
      content: `The Page Object Model (POM) is an established design pattern where web pages or screens are represented as decoupled TypeScript classes.

1. Injecting the Page Dependency:
Every POM receives Playwright's Page instance in its constructor and stores it as a readonly property:
export class PracticeLoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }
}

2. Defining Locators as Readonly Properties:
Unlike Selenium (where elements are found imperatively on every invocation via driver.findElement), Playwright locators are lazy evaluators:
export class PracticeLoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByLabel("Practice Username");
    this.passwordInput = page.getByLabel("Practice Password");
    this.submitBtn = page.getByTestId("submit-btn");
  }
}
Because locators do not query the DOM until an action or assertion is performed, defining them in the constructor is instantaneous and completely immune to stale element reference errors.

3. Action Methods vs. Assertion Boundaries:
- Action Methods encapsulate user gestures: login(username, password), search(query), togglePasswordVisibility().
- Keep Assertions in the Test Where Appropriate: Tests should make expectations explicit (e.g. expect(page).toHaveURL(/dashboard/)). However, page-specific validation state (such as expectClientError(msg)) can be exposed as semantic assertion helpers on the POM.

4. Critical Anti-Patterns to Avoid:
- The Fluent Chaining Trap: In Selenium, methods returned 'this' to allow 'loginPage.enterUser().enterPass().clickSubmit()'. In async JavaScript, chaining unawaited promises obscures async boundaries and tightly couples unrelated pages. Always use standard unchained async/await.
- Exposing Raw CSS/XPath: Never export raw selector strings outside the POM class.
- The 'God Page' Antipattern: A single 2,000-line DashboardPage containing every button, table, modal, and chart across the entire application. Split pages into focused Component Objects.`,
    },
    {
      id: "component-objects-composition",
      title: "Part C — Component Objects & Composition over Inheritance",
      content: `Modern single-page applications are not flat HTML pages; they are trees of composable, reusable UI widgets. Trying to model complex UIs purely with page-level classes leads to duplicate code and brittle inheritance hierarchies.

1. Composition over Inheritance:
- Anti-Pattern (Deep Inheritance):
  BasePage -> TablePage -> FilterableTablePage -> CourseCataloguePage
  Deep inheritance creates tight coupling where changes to TablePage inadvertently break unrelated test classes.
- Enterprise Pattern (Object Composition):
  A CourseCataloguePage *has a* CourseCreateDialogComponent and *has a* PaginationComponent.

2. Scoped Component Objects:
A Component Object receives either the Page or a parent Locator, scoping all internal locators to that component's root:
export class CourseCreateDialogComponent {
  readonly dialog: Locator;
  readonly titleInput: Locator;
  readonly submitBtn: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole("dialog", { name: "Create New Course" });
    this.titleInput = this.dialog.getByLabel("Course Title");
    this.submitBtn = this.dialog.getByRole("button", { name: "Create Course" });
  }

  async fillAndSubmit(title: string) {
    await this.titleInput.fill(title);
    await this.submitBtn.click();
    await expect(this.dialog).not.toBeVisible();
  }
}

3. Reusable UI Components:
Common candidates for Component Objects include:
- Navigation Bar & Header User Menus
- Data Grids with column sorting and row selection
- Modal Confirmation Dialogs & Form Wizards
- Filter Bars & Autocomplete Dropdowns`,
    },
    {
      id: "pom-with-fixtures",
      title: "Part D — Integrating Page Objects with Custom Test Fixtures",
      content: `Instantiating new CourseCataloguePage(page) and calling await coursesPage.open() at the start of every test introduces boilerplate. Playwright's Dependency Injection system allows you to provide pre-instantiated, pre-navigated page objects directly through custom fixtures.

1. The POM Fixture Pattern:
export const test = baseTest.extend<{
  loginPage: PracticeLoginPage;
  coursesPage: CourseCataloguePage;
}>({
  loginPage: async ({ page }, use) => {
    const lp = new PracticeLoginPage(page);
    await lp.open();
    await use(lp);
  },
  coursesPage: async ({ adminPage }, use) => {
    const cp = new CourseCataloguePage(adminPage);
    await cp.open();
    await use(cp);
  }
});

2. Clean Test Function Signatures:
Tests declare the page object as a parameter, arriving immediately at the target route ready for testing:
test('verifies invalid login error', async ({ loginPage }) => {
  await loginPage.login('student', 'WrongPassword999!');
  await loginPage.expectServerError(/Invalid username or password/i);
});

3. Composing API Helpers and Page Objects:
Fixtures can combine an API client for fast data provisioning with a Page Object for UI assertions:
test('verifies course search', async ({ coursesPage, seededTestData }) => {
  await coursesPage.search(seededTestData.courseCode);
  await coursesPage.expectCourseVisible(seededTestData.courseTitle);
});`,
    },
    {
      id: "architecture-patterns-comparison",
      title: "Part E — Architectural Patterns Comparison: POM vs. Alternatives",
      content: `Page Object Model is widely adopted, but it is not the only viable test architecture. Choosing the right abstraction level depends on project size, team structure, and application lifespan.

1. Direct Locators (Zero Abstraction):
- How it works: Locators and actions written directly in test functions.
- Pros: Maximum transparency, zero indirection, fastest to author, easiest to debug with Playwright trace viewer.
- Cons: High selector churn across multi-test suites; duplicated workflows.
- Best for: Smoke tests, isolated component playgrounds, small projects (<50 tests).

2. Page Object Model (Page-Level Abstraction):
- How it works: One class per web page or route encapsulating elements and user actions.
- Pros: Centralized locators, readable business-level tests, clean maintainability.
- Cons: Can devolve into monolithic classes if not partitioned into components.
- Best for: Medium-to-large enterprise web applications with established page hierarchies.

3. Component Objects (Composable Widget Abstraction):
- How it works: Focused classes representing reusable UI widgets (tables, modals, navbars) composed into pages.
- Pros: Eliminates duplicate locators across different pages; adheres to Single Responsibility Principle.
- Cons: Requires thoughtful design and locator scoping.
- Best for: Modern component-driven frontends (React, Vue, Angular) with shared design systems.

4. Screenplay Pattern (Action & Task-Based Abstraction):
- How it works: Separates Actors, Abilities (e.g. BrowseTheWeb), Tasks (e.g. EnrollInCourse), and Questions.
- Pros: Highly composable, functional, separates data from actions completely.
- Cons: Extreme boilerplate, steep learning curve, high cognitive overhead for web automation.
- Best for: Large teams with dedicated test architecture specialists and complex cross-system BDD flows.`,
    },
    {
      id: "enterprise-folder-structure",
      title: "Part F — Enterprise Test Automation Folder Structure",
      content: `A scalable, industry-standard folder architecture for Playwright TypeScript repositories:

playwright-lab/
├── e2e/
│   ├── api/                      # Reusable API helpers and clients
│   │   └── CourseApiHelper.ts
│   ├── components/               # Reusable UI component objects
│   │   ├── CourseCreateDialog.ts
│   │   ├── NavigationBar.ts
│   │   └── TableComponent.ts
│   ├── fixtures/                 # Custom test fixtures & worker extensions
│   │   └── index.ts
│   ├── pages/                    # Decoupled Page Object Models
│   │   ├── BasePage.ts
│   │   ├── CourseCataloguePage.ts
│   │   ├── PracticeLoginPage.ts
│   │   └── UserManagementPage.ts
│   ├── specs/                    # Feature & workflow test specifications
│   │   ├── auth.spec.ts
│   │   ├── courses.spec.ts
│   │   └── users.spec.ts
│   └── utils/                    # Test data factories, matchers, seeders
│       └── dataFactories.ts
├── .auth/                        # Gitignored storageState session snapshots
│   ├── admin.json
│   └── trainer.json
└── playwright.config.ts          # Central test runner configuration

Guiding Rules:
- Never put tests inside the pages/ folder.
- Never import spec files into other spec files.
- Keep fixtures focused: page objects should be imported into fixtures/index.ts, and tests import 'test' and 'expect' from fixtures.`,
    },
    {
      id: "advanced-maintainability",
      title: "Part G — Advanced Maintainability, Strict Typing & Multi-Role Workflows",
      content: `Enterprise test suites require rigorous software engineering practices to prevent bitrot over time:

1. Strict TypeScript Interfaces & No 'any':
Always define explicit types for action parameters and data payloads:
export interface CreateCourseOptions {
  title: string;
  code: string;
  price: number;
  category?: string;
}
Avoid 'any' or unsafe casts like (page as any). Strict types catch breaking changes at compile time before tests ever run.

2. Semantic Locator Hierarchy in POMs:
Follow Playwright's locator priority inside page objects:
- Priority 1: User-facing role locators (page.getByRole('button', { name: 'Save' }))
- Priority 2: Semantic label associations (page.getByLabel('Corporate Email'))
- Priority 3: Stable test identifiers (page.getByTestId('user-table'))
- Avoid: Dynamic CSS classes (.css-1x84a9) and fragile absolute XPaths (/html/body/div[2]/form/div[3]/input).

3. Multi-Role Coordination:
When testing workflows that span multiple user roles (e.g. Admin publishes course, Learner enrolls, Trainer grades submission), instantiate separate POM instances bound to distinct BrowserContexts:
const adminCourses = new CourseCataloguePage(adminPage);
const learnerCourses = new CourseCataloguePage(learnerPage);
Both operate in parallel without session interference.`,
    },
  ],
  codeExamples: [
    {
      id: "pom-base-and-subclass",
      caption: "Decoupled TypeScript Page Object Model (e2e/pages/PracticeLoginPage.ts)",
      language: "typescript",
      code: `import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage.js";

export class PracticeLoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitBtn: Locator;
  readonly clientError: Locator;
  readonly serverError: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByLabel("Practice Username");
    this.passwordInput = page.getByLabel("Practice Password");
    this.submitBtn = page.getByTestId("submit-btn");
    this.clientError = page.getByTestId("client-error");
    this.serverError = page.getByTestId("server-error");
  }

  async open() {
    await this.goto("/practice/login");
    await expect(this.page.getByRole("heading", { level: 1, name: "Practice Login Portal" })).toBeVisible();
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitBtn.click();
  }

  async expectClientError(message: string | RegExp) {
    await expect(this.clientError).toBeVisible();
    await expect(this.clientError).toContainText(message);
  }

  async expectServerError(message: string | RegExp) {
    await expect(this.serverError).toBeVisible();
    await expect(this.serverError).toContainText(message);
  }
}`,
      lineExplanations: [
        { line: 4, explanation: "Inherits common navigation and page utilities from BasePage." },
        { line: 5, explanation: "Locators defined as readonly properties; initialized lazily in constructor." },
        { line: 13, explanation: "Uses accessible semantic queries (getByLabel, getByTestId)." },
        { line: 20, explanation: "open() method encapsulates navigation and page readiness check." },
        { line: 25, explanation: "login() encapsulates multi-step user interaction into a clean async action." },
        { line: 31, explanation: "Semantic assertion methods provide clear failure diagnostics." },
      ],
    },
    {
      id: "component-object-example",
      caption: "Composable Modal Component Object (CourseCreateDialogComponent)",
      language: "typescript",
      code: `import { Locator, Page, expect } from "@playwright/test";

export class CourseCreateDialogComponent {
  readonly dialog: Locator;
  readonly titleInput: Locator;
  readonly codeInput: Locator;
  readonly priceInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    // Scopes all child locators strictly within the modal dialog element
    this.dialog = page.getByRole("dialog", { name: "Create New Course" });
    this.titleInput = this.dialog.getByLabel("Course Title");
    this.codeInput = this.dialog.getByLabel("Course Code");
    this.priceInput = this.dialog.getByLabel("Price ($)");
    this.submitButton = this.dialog.getByRole("button", { name: "Create Course" });
  }

  async fillAndSubmit(data: { title: string; code: string; price: number }) {
    await expect(this.dialog).toBeVisible();
    await this.titleInput.fill(data.title);
    await this.codeInput.fill(data.code);
    await this.priceInput.fill(String(data.price));
    await this.submitButton.click();
    await expect(this.dialog).not.toBeVisible();
  }
}`,
      lineExplanations: [
        { line: 12, explanation: "Dialog container query scopes child elements to avoid strict mode violations." },
        { line: 13, explanation: "Child inputs resolved strictly inside this.dialog." },
        { line: 19, explanation: "Verifies dialog visibility before interaction and confirms disappearance after submission." },
      ],
    },
    {
      id: "architecture-comparison-worked-example",
      caption: "Architecture Comparison: Direct Locators vs. POM vs. Fixture-Injected POM",
      language: "typescript",
      code: `// ─── OPTION 1: DIRECT LOCATORS (Zero Abstraction) ───────────────────
test("direct locators test", async ({ page }) => {
  await page.goto("/practice/login");
  await page.getByLabel("Practice Username").fill("student");
  await page.getByLabel("Practice Password").fill("WrongPassword999!");
  await page.getByTestId("submit-btn").click();
  await expect(page.getByTestId("server-error")).toContainText("Invalid username or password");
});

// ─── OPTION 2: PAGE OBJECT MODEL (Object Abstraction) ───────────────
test("page object test", async ({ page }) => {
  const loginPage = new PracticeLoginPage(page);
  await loginPage.open();
  await loginPage.login("student", "WrongPassword999!");
  await loginPage.expectServerError(/Invalid username or password/i);
});

// ─── OPTION 3: FIXTURE-INJECTED POM (Dependency Injection) ──────────
test("fixture-injected POM test", async ({ loginPage }) => {
  // Navigation & instantiation handled automatically by the fixture
  await loginPage.login("student", "WrongPassword999!");
  await loginPage.expectServerError(/Invalid username or password/i);
});`,
      lineExplanations: [
        { line: 2, explanation: "Option 1 is transparent and simple, but duplicates selectors across multiple test files." },
        { line: 11, explanation: "Option 2 centralizes locators and interactions, making UI refactoring effortless." },
        { line: 19, explanation: "Option 3 eliminates repetitive boilerplate; ideal for enterprise suites with hundreds of tests." },
      ],
    },
  ],
  commonMistakes: [
    {
      title: "Fluent Method Chaining in Async POMs",
      badPractice: `await loginPage.enterUser("student").enterPass("pass").clickSubmit();`,
      goodPractice: `await loginPage.login("student", "pass");`,
      explanation:
        "Returning 'this' for fluent chaining in async TypeScript obscures Promise resolution, complicates error handling, and tightly couples methods.",
    },
    {
      title: "The Monolithic 'God Page' Antipattern",
      badPractice: `export class PortalPage {\n  // 150 locators covering navbar, search, table, settings, modals, profile...\n}`,
      goodPractice: `export class CourseCataloguePage {\n  readonly navbar = new NavigationComponent(page);\n  readonly createModal = new CourseCreateDialogComponent(page);\n}`,
      explanation:
        "Combining entire applications into one giant page object violates the Single Responsibility Principle and creates unmaintainable merge conflicts.",
    },
    {
      title: "Hiding Critical Assertions Inside Action Methods",
      badPractice: `async searchCourse(query: string) {\n  await this.searchInput.fill(query);\n  expect(await this.results.count()).toBeGreaterThan(0); // Hidden assertion!\n}`,
      goodPractice: `async search(query: string) {\n  await this.searchInput.fill(query);\n}\n// In test: await expect(coursesPage.results).toHaveCount(3);`,
      explanation:
        "Burying assertions inside generic action methods prevents negative testing (e.g. searching for a nonexistent item) and conceals the test's true intent.",
    },
    {
      title: "Exposing Raw CSS or XPath Selectors",
      badPractice: `export class LoginPage {\n  static usernameSelector = "#user-input-field > div.v-input__control input";\n}`,
      goodPractice: `export class LoginPage {\n  readonly usernameInput: Locator;\n  constructor(page: Page) { this.usernameInput = page.getByLabel("Practice Username"); }\n}`,
      explanation:
        "Exposing raw selector strings breaches encapsulation and forfeits Playwright's auto-waiting actionability engine.",
    },
    {
      title: "Hardcoding Test Credentials & Environments Inside POMs",
      badPractice: `async login() {\n  await this.usernameInput.fill("admin@production.com");\n  await this.passwordInput.fill("superSecretPassword!");\n}`,
      goodPractice: `async login(username: string, password: string) {\n  await this.usernameInput.fill(username);\n  await this.passwordInput.fill(password);\n}`,
      explanation:
        "Hardcoding credentials or environments inside page classes prevents test parametrization, leaks secrets, and breaks multi-environment execution.",
    },
    {
      title: "Premature Abstraction for One-Off Components",
      badPractice: `// Creating a 60-line Component Object for a static footer copyright notice tested in one place`,
      goodPractice: `// In test: await expect(page.getByText("© 2026 Playwright Industrial Lab")).toBeVisible();`,
      explanation:
        "Over-engineering trivial one-off UI elements with dedicated classes adds cognitive overhead and unnecessary maintenance without providing reuse value.",
    },
  ],
  playground: {
    title: "Page Object Models & Architecture Playground",
    configExample: `import { test as baseTest, expect, Page, Locator } from "@playwright/test";

// ─── 1. BASE PAGE ABSTRACTION ────────────────────────────────────────
export abstract class BasePage {
  readonly page: Page;
  constructor(page: Page) { this.page = page; }
  async goto(path: string) { await this.page.goto(path); }
}

// ─── 2. DECOUPLED PAGE OBJECT ────────────────────────────────────────
export class PracticeLoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByLabel("Practice Username");
    this.passwordInput = page.getByLabel("Practice Password");
    this.submitBtn = page.getByTestId("submit-btn");
  }

  async open() { await this.goto("/practice/login"); }
  async login(user: string, pass: string) {
    await this.usernameInput.fill(user);
    await this.passwordInput.fill(pass);
    await this.submitBtn.click();
  }
}

// ─── 3. FIXTURE-INJECTED EXTENSION ───────────────────────────────────
export const test = baseTest.extend<{ loginPage: PracticeLoginPage }>({
  loginPage: async ({ page }, use) => {
    const lp = new PracticeLoginPage(page);
    await lp.open();
    await use(lp);
  }
});`,
    properties: [
      {
        name: "readonly page: Page",
        type: "Page",
        defaultValue: "Injected via constructor",
        description: "The Playwright Page instance managing browser communication and events.",
        impact: "Enables all Playwright user gestures and navigation methods.",
      },
      {
        name: "readonly locator: Locator",
        type: "Locator",
        defaultValue: "Lazy Locator",
        description: "Lazily evaluated element locator defined in class constructor.",
        impact: "Eliminates stale element reference errors and guarantees auto-waiting.",
      },
      {
        name: "Composition vs Inheritance",
        type: "Design Principle",
        defaultValue: "Composition Preferred",
        description: "Assembling pages from component objects rather than deep class hierarchies.",
        impact: "Reduces coupling and allows flexible component reuse across different pages.",
      },
      {
        name: "Single Responsibility",
        type: "Architectural Rule",
        defaultValue: "Enforced",
        description: "Each page or component class represents exactly one cohesive UI boundary.",
        impact: "Prevents monolithic 'God Pages' and simplifies maintenance.",
      },
      {
        name: "Action Methods",
        type: "Async Function",
        defaultValue: "async () => Promise<void>",
        description: "Encapsulates multi-step user actions (filling, selecting, clicking).",
        impact: "Hides DOM implementation details behind clear domain workflows.",
      },
      {
        name: "Assertion Placement",
        type: "Design Principle",
        defaultValue: "Test-Level Preferred",
        description: "Keep expectations in tests; use POM helpers only for encapsulated states.",
        impact: "Preserves test intent transparency and improves failure diagnostic clarity.",
      },
      {
        name: "Component Scoping",
        type: "Locator Scoping",
        defaultValue: "rootLocator.getBy...",
        description: "Scoping child locators strictly within parent component boundaries.",
        impact: "Avoids strict mode violations when identical components appear multiple times.",
      },
      {
        name: "Fixture Dependency Injection",
        type: "test.extend()",
        defaultValue: "Optional",
        description: "Providing pre-instantiated page objects directly via test arguments.",
        impact: "Eliminates repetitive POM instantiation and navigation boilerplate in test files.",
      },
      {
        name: "API Helper Integration",
        type: "Class / Helper",
        defaultValue: "APIRequestContext",
        description: "Pairing POMs with API clients for instantaneous prerequisite setup.",
        impact: "Cuts test execution time by 80% compared to UI-driven setup.",
      },
      {
        name: "Multi-Role Contexts",
        type: "Pattern",
        defaultValue: "Separate Contexts",
        description: "Instantiating multiple POMs bound to different browser sessions.",
        impact: "Enables simultaneous testing of admin and learner interactions.",
      },
      {
        name: "Strict TypeScript Types",
        type: "TypeScript",
        defaultValue: "Enabled",
        description: "Strongly typed action parameters, options interfaces, and return types.",
        impact: "Catches breaking payload changes at compile time.",
      },
      {
        name: "Rule of Three",
        type: "Abstraction Rule",
        defaultValue: "Heuristic",
        description: "Only abstract a page or component when reused across 3+ test files.",
        impact: "Prevents premature optimization and unnecessary code bloat.",
      },
    ],
    behaviorComparison: [
      {
        aspect: "Selector Maintenance",
        defaultBehavior: "Direct locators: changing an ID or label requires editing 20 test files.",
        customizedBehavior: "Page Object Model: update the locator once in the page class constructor.",
      },
      {
        aspect: "Test Readability",
        defaultBehavior: "Direct locators: tests cluttered with 15 lines of fill, click, and wait calls.",
        customizedBehavior: "Page Object Model: high-level business actions express intent in 2 lines.",
      },
      {
        aspect: "Debugging Trace Analysis",
        defaultBehavior: "Direct locators: stack trace points directly to exact failing locator in test file.",
        customizedBehavior: "Poorly abstracted POM: failure buried 4 levels deep in generic helper method.",
      },
      {
        aspect: "Reusability",
        defaultBehavior: "Direct locators: zero reusability; workflows copy-pasted across spec files.",
        customizedBehavior: "Component Objects: complex dialogs and tables reused across dozens of tests.",
      },
      {
        aspect: "Test Execution Speed",
        defaultBehavior: "UI-driven setup: tests spend 4,000ms filling setup forms before testing.",
        customizedBehavior: "POM + API Helper: API sets up prerequisite in 25ms, POM tests feature in UI.",
      },
      {
        aspect: "Code Volume",
        defaultBehavior: "Direct locators: lowest initial code volume; no extra class files.",
        customizedBehavior: "Page Object Model: higher initial code volume; pays dividends at scale.",
      },
    ],
    practiceTask:
      "Inspect the decoupled page objects in e2e/pages/ (PracticeLoginPage.ts and CourseCataloguePage.ts). Notice how locators, actions, and component dialogs are cleanly separated.",
    localCommand: "pnpm exec playwright test e2e/practice-pom.spec.ts --project=chromium",
  },
  exercises: [
    {
      id: "ex1-direct-locators",
      title: "Exercise 1: Write a Test Using Direct Locators (Baseline)",
      objective: "Author an end-to-end test against /practice/login using direct locators without any Page Object abstraction to establish a baseline.",
      prerequisites: [
        "Playwright locator primitives",
        "Direct locator assertions",
      ],
      scenario: "Navigate to /practice/login, submit empty username and password fields, and assert client-side validation error.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 1: Direct locators baseline", async ({ page }) => {
  // TODO: Navigate to /practice/login
  // TODO: Query username and password with getByLabel
  // TODO: Click submit-btn
  // TODO: Assert client-error alert is visible with required message
});`,
      task: "Directly query form inputs, submit empty form, and assert client-error message without using page objects.",
      acceptanceCriteria: [
        "Uses direct page.getByLabel() and page.getByTestId() queries.",
        "Submits empty form.",
        "Asserts client-error contains 'Please enter both username and password.'",
      ],
      expectedBehavior: "Provides immediate understanding of raw Playwright interaction before introducing abstraction.",
      hint: "Use page.getByLabel('Practice Username') and page.getByTestId('submit-btn').",
      solution: `test("Exercise 1: Write a test using direct locators", async ({ page }) => {
  await page.goto("/practice/login");
  await expect(page.getByRole("heading", { level: 1, name: "Practice Login Portal" })).toBeVisible();

  const usernameInput = page.getByLabel("Practice Username");
  const passwordInput = page.getByLabel("Practice Password");
  const submitBtn = page.getByTestId("submit-btn");

  await usernameInput.fill("");
  await passwordInput.fill("");
  await submitBtn.click();

  const clientError = page.getByTestId("client-error");
  await expect(clientError).toBeVisible();
  await expect(clientError).toContainText(/Please enter both username and password/i);
});`,
      troubleshootingNotes: "Notice how all selector details are coupled directly to this test function.",
      command: "pnpm exec playwright test e2e/practice-pom.spec.ts -g 'Exercise 1'",
    },
    {
      id: "ex2-extract-login-pom",
      title: "Exercise 2: Extract and Consume a Simple PracticeLoginPage POM",
      objective: "Instantiate PracticeLoginPage, navigate via open(), execute login action, and assert server error.",
      prerequisites: [
        "TypeScript class instantiation",
        "Page dependency injection",
      ],
      scenario: "Refactor Exercise 1 login interactions into PracticeLoginPage POM and execute invalid credentials test.",
      starterCode: `import { test, expect } from "@playwright/test";
import { PracticeLoginPage } from "./pages/PracticeLoginPage.js";

test("Exercise 2: Simple POM extraction", async ({ page }) => {
  // TODO: Instantiate PracticeLoginPage(page)
  // TODO: Call loginPage.open()
  // TODO: Call loginPage.login('student', 'WrongPassword999!')
  // TODO: Call loginPage.expectServerError(/Invalid username or password/i)
});`,
      task: "Consume PracticeLoginPage, execute login workflow, and verify error state with encapsulated POM methods.",
      acceptanceCriteria: [
        "PracticeLoginPage instantiated with page dependency.",
        "open() navigates to /practice/login.",
        "login() executes credentials submission.",
        "expectServerError() asserts error banner.",
      ],
      expectedBehavior: "Test is clean and readable, expressing user intent without selector details.",
      hint: "Pass { page } into constructor: const loginPage = new PracticeLoginPage(page).",
      solution: `test("Exercise 2: Extract and consume a simple PracticeLoginPage POM", async ({ page }) => {
  const loginPage = new PracticeLoginPage(page);
  await loginPage.open();

  await loginPage.login("student", "WrongPassword999!");
  await loginPage.expectServerError(/Invalid username or password/i);
});`,
      troubleshootingNotes: "The test is now resilient to changes in input field IDs or labels.",
      command: "pnpm exec playwright test e2e/practice-pom.spec.ts -g 'Exercise 2'",
    },
    {
      id: "ex3-typed-methods-locators",
      title: "Exercise 3: Add Typed Methods and Verify Password Reveal",
      objective: "Utilize typed POM properties and toggle methods to verify password input type changes from password to text.",
      prerequisites: [
        "HTML attribute assertions",
        "POM method design",
      ],
      scenario: "Fill password input, verify type attribute is 'password', toggle visibility, and verify type attribute is 'text'.",
      starterCode: `import { test, expect } from "@playwright/test";
import { PracticeLoginPage } from "./pages/PracticeLoginPage.js";

test("Exercise 3: Password visibility toggle", async ({ page }) => {
  // TODO: Open loginPage
  // TODO: Fill loginPage.passwordInput
  // TODO: Assert password input type is 'password'
  // TODO: Call loginPage.togglePasswordVisibility()
  // TODO: Assert password input type is 'text'
});`,
      task: "Use loginPage methods to verify that password visibility toggle updates the input type attribute dynamically.",
      acceptanceCriteria: [
        "passwordInput initialized with value.",
        "expectPasswordInputType('password') asserts initial hidden state.",
        "togglePasswordVisibility() clicks toggle button.",
        "expectPasswordInputType('text') asserts revealed plaintext state.",
      ],
      expectedBehavior: "Demonstrates that page objects can expose granular UI inspections alongside high-level actions.",
      hint: "Use loginPage.togglePasswordVisibility() and loginPage.expectPasswordInputType().",
      solution: `test("Exercise 3: Use typed methods on page class to verify password reveal", async ({ page }) => {
  const loginPage = new PracticeLoginPage(page);
  await loginPage.open();

  await loginPage.passwordInput.fill("secretPassword456");
  await loginPage.expectPasswordInputType("password");

  await loginPage.togglePasswordVisibility();
  await loginPage.expectPasswordInputType("text");
});`,
      troubleshootingNotes: "Encapsulating attribute checks on the POM prevents repetitive toHaveAttribute calls across tests.",
      command: "pnpm exec playwright test e2e/practice-pom.spec.ts -g 'Exercise 3'",
    },
    {
      id: "ex4-reusable-component-object",
      title: "Exercise 4: Create and Use a Reusable Component Object",
      objective: "Build a CourseCreateDialogComponent to model a modal dialog and compose it with CourseCataloguePage.",
      prerequisites: [
        "Component Object Model",
        "Modal dialog scoping",
      ],
      scenario: "Open course catalogue as admin, trigger create dialog, instantiate CourseCreateDialogComponent, fill and submit.",
      starterCode: `import { test, expect } from "./fixtures/index.js";
import { CourseCataloguePage } from "./pages/CourseCataloguePage.js";

test("Exercise 4: Component Object", async ({ adminPage, workerNamespace }) => {
  // TODO: Open CourseCataloguePage
  // TODO: Click createCourseButton
  // TODO: Instantiate CourseCreateDialogComponent(adminPage)
  // TODO: Call dialog.fillAndSubmit({ title, code, price })
  // TODO: Assert course is visible and delete course
});`,
      task: "Encapsulate modal dialog interactions within a dedicated CourseCreateDialogComponent and verify course creation.",
      acceptanceCriteria: [
        "Dialog interactions isolated inside CourseCreateDialogComponent.",
        "Dialog fill and submission verifies dialog closes.",
        "Created course confirmed visible in course grid.",
        "Course deleted in teardown.",
      ],
      expectedBehavior: "Dialog component can be reused across any page that opens the course creation modal.",
      hint: "Scope dialog inputs inside this.dialog = page.getByRole('dialog', { name: 'Create New Course' }).",
      solution: `test("Exercise 4: Create and use a reusable CourseCreateDialogComponent", async ({ adminPage, workerNamespace }) => {
  const coursesPage = new CourseCataloguePage(adminPage);
  await coursesPage.open();

  await coursesPage.createCourseButton.click();

  const dialog = new CourseCreateDialogComponent(adminPage);
  const uniqueSuffix = Date.now().toString().slice(-4);
  const courseTitle = workerNamespace + " Component Dialog Course " + uniqueSuffix;
  const courseCode = workerNamespace + "COMP-" + uniqueSuffix;

  await dialog.fillAndSubmit({
    title: courseTitle,
    code: courseCode,
    price: 249,
  });

  await coursesPage.expectCourseVisible(courseTitle);
  await coursesPage.deleteCourse(courseTitle);
});`,
      troubleshootingNotes: "Components keep parent page classes focused and prevent massive 1,000-line POM files.",
      command: "pnpm exec playwright test e2e/practice-pom.spec.ts -g 'Exercise 4'",
    },
    {
      id: "ex5-pom-with-fixtures",
      title: "Exercise 5: Integrate Page Objects with Custom Fixtures",
      objective: "Consume a pre-instantiated loginPage fixture directly in the test function parameters.",
      prerequisites: [
        "test.extend() with POM",
        "Fixture dependency injection",
      ],
      scenario: "Declare { loginPage } in test parameters; verify loginPage arrives pre-opened and execute invalid login assertion.",
      starterCode: `import { test, expect } from "./fixtures/index.js";

test("Exercise 5: POM fixture", async ({ loginPage }) => {
  // TODO: loginPage is pre-instantiated and pre-opened!
  // TODO: Execute loginPage.login('student', 'WrongPassword999!')
  // TODO: Assert server error
});`,
      task: "Eliminate manual new PracticeLoginPage() boilerplate by consuming the fixture-provided loginPage instance.",
      acceptanceCriteria: [
        "No manual 'new PracticeLoginPage()' call in test.",
        "No manual 'await loginPage.open()' call in test.",
        "Test executes login and asserts server error.",
      ],
      expectedBehavior: "Fixture handles lifecycle and navigation, keeping test function completely focused on business logic.",
      hint: "Declare { loginPage } in the test signature.",
      solution: `test("Exercise 5: Integrate page objects with custom fixtures (loginPage)", async ({ loginPage }) => {
  await loginPage.login("student", "WrongPassword999!");
  await loginPage.expectServerError(/Invalid username or password/i);
});`,
      troubleshootingNotes: "Custom fixtures make test suites extraordinarily concise and maintainable.",
      command: "pnpm exec playwright test e2e/practice-pom.spec.ts -g 'Exercise 5'",
    },
    {
      id: "ex6-api-helper-hybrid",
      title: "Exercise 6: Build an API Helper for Fast Test Data Provisioning",
      objective: "Use CourseApiHelper to provision course data in 25ms before verifying it in the UI with CourseCataloguePage.",
      prerequisites: [
        "Hybrid API and UI testing",
        "API helper class design",
      ],
      scenario: "Create course via CourseApiHelper, open CourseCataloguePage as admin, search for code, assert visibility, and clean up via API.",
      starterCode: `import { test, expect } from "./fixtures/index.js";
import { CourseApiHelper } from "./practice-pom.spec.js";
import { CourseCataloguePage } from "./pages/CourseCataloguePage.js";

test("Exercise 6: API helper hybrid setup", async ({ request, adminPage, workerNamespace }) => {
  // TODO: Instantiate CourseApiHelper(request)
  // TODO: Call apiHelper.createCourse({ code, title })
  // TODO: Open CourseCataloguePage and search code
  // TODO: Assert course visible
  // TODO: Delete course via apiHelper.deleteCourse()
});`,
      task: "Bypass slow UI forms by provisioning test records via an API helper, then validating rendering with a Page Object.",
      acceptanceCriteria: [
        "Course created via CourseApiHelper.",
        "CourseCataloguePage searches and finds the course.",
        "Course deleted via API helper.",
      ],
      expectedBehavior: "Demonstrates that enterprise test architecture pairs POMs for UI testing with API helpers for prerequisite setup.",
      hint: "Call await apiHelper.createCourse(...) before navigating the browser.",
      solution: `test("Exercise 6: Build an API helper for fast test data provisioning", async ({ request, adminPage, workerNamespace }) => {
  const apiHelper = new CourseApiHelper(request);
  const uniqueSuffix = Date.now().toString().slice(-4);
  const code = workerNamespace + "API-" + uniqueSuffix;
  const title = workerNamespace + " API Helper Course " + uniqueSuffix;

  const created = await apiHelper.createCourse({ code, title });
  expect(created.id).toBeDefined();

  const coursesPage = new CourseCataloguePage(adminPage);
  await coursesPage.open();
  await coursesPage.search(code);
  await coursesPage.expectCourseVisible(title);

  await apiHelper.deleteCourse(created.id);
});`,
      troubleshootingNotes: "Fast API setup saves thousands of seconds across large regression suites.",
      command: "pnpm exec playwright test e2e/practice-pom.spec.ts -g 'Exercise 6'",
    },
    {
      id: "ex7-refactor-without-hiding-assertions",
      title: "Exercise 7: Refactor Duplicated Code Without Hiding Assertions",
      objective: "Encapsulate user actions in the POM while keeping the core domain assertion explicitly visible in the test file.",
      prerequisites: [
        "Assertion visibility guidelines",
        "Test intent clarity",
      ],
      scenario: "Search via coursesPage.search(code) and assert visibility using expect(coursesPage.courseGrid.getByText(title)).toBeVisible().",
      starterCode: `import { test, expect } from "./fixtures/index.js";

test("Exercise 7: Explicit assertions", async ({ coursesPage, request, workerNamespace }) => {
  // TODO: Provision course via API
  // TODO: Execute action: await coursesPage.search(code)
  // TODO: Explicit test assertion: await expect(coursesPage.courseGrid.getByText(title)).toBeVisible()
});`,
      task: "Refactor multi-step search actions into the page object while keeping the web-first expect() assertion explicit in the test.",
      acceptanceCriteria: [
        "Action is performed via coursesPage.search().",
        "Web-first expect assertion is written directly in the test function.",
        "Test intent is completely transparent in failure reports.",
      ],
      expectedBehavior: "Maintains optimal balance: reusable interaction logic in POM, explicit business expectations in test.",
      hint: "Access coursesPage.courseGrid in the test assertion.",
      solution: `test("Exercise 7: Refactor actions into POM while keeping assertions explicit", async ({ coursesPage, request, workerNamespace }) => {
  const apiHelper = new CourseApiHelper(request);
  const uniqueCode = workerNamespace + "REF-" + Date.now().toString().slice(-4);
  const uniqueTitle = workerNamespace + " Explicit Assertion Course";

  const course = await apiHelper.createCourse({ code: uniqueCode, title: uniqueTitle });

  await coursesPage.search(uniqueCode);

  // Domain assertion remains explicit in the test!
  await expect(coursesPage.courseGrid.getByText(uniqueTitle)).toBeVisible();

  await apiHelper.deleteCourse(course.id);
});`,
      troubleshootingNotes: "When an assertion fails, the test report highlights the exact test file line, not a generic helper.",
      command: "pnpm exec playwright test e2e/practice-pom.spec.ts -g 'Exercise 7'",
    },
    {
      id: "ex8-direct-vs-pom-comparison",
      title: "Exercise 8: Compare Direct Locators vs. POM Fidelity",
      objective: "Execute a test using PracticeLoginPage demonstrating that POM abstractions maintain 100% actionability fidelity.",
      prerequisites: [
        "Actionability and auto-waiting",
        "Locator abstraction trade-offs",
      ],
      scenario: "Use loginPage.quickFillStudentBtn.click() and verify input values match student and Password123!.",
      starterCode: `import { test, expect } from "@playwright/test";
import { PracticeLoginPage } from "./pages/PracticeLoginPage.js";

test("Exercise 8: Direct vs POM fidelity", async ({ page }) => {
  // TODO: Open loginPage
  // TODO: Click quickfill student button via POM
  // TODO: Assert username and password input values
});`,
      task: "Verify that accessing locators through a Page Object retains all Playwright auto-waiting and actionability guarantees.",
      acceptanceCriteria: [
        "loginPage opened.",
        "quickFillStudentBtn clicked.",
        "usernameInput hasValue 'student'.",
        "passwordInput hasValue 'Password123!'.",
      ],
      expectedBehavior: "Page Object abstraction provides clean encapsulation without introducing any latency or sacrificing strictness.",
      hint: "Use expect(loginPage.usernameInput).toHaveValue('student').",
      solution: `test("Exercise 8: Compare direct locators vs POM fidelity", async ({ page }) => {
  const loginPage = new PracticeLoginPage(page);
  await loginPage.open();

  await loginPage.quickFillStudentBtn.click();
  await expect(loginPage.usernameInput).toHaveValue("student");
  await expect(loginPage.passwordInput).toHaveValue("Password123!");
});`,
      troubleshootingNotes: "Playwright locators are evaluated lazily, so properties on POMs behave identically to direct locators.",
      command: "pnpm exec playwright test e2e/practice-pom.spec.ts -g 'Exercise 8'",
    },
    {
      id: "ex9-diagnose-god-page",
      title: "Exercise 9: Compose Focused Components Rather Than a Monolithic God Page",
      objective: "Demonstrate modular component composition by combining CourseCataloguePage and CourseCreateDialogComponent.",
      prerequisites: [
        "Single Responsibility Principle",
        "Component composition",
      ],
      scenario: "Trigger create course dialog from CourseCataloguePage and handle modal inputs with CourseCreateDialogComponent.",
      starterCode: `import { test, expect } from "./fixtures/index.js";

test("Exercise 9: Modular component composition", async ({ adminPage, workerNamespace }) => {
  // TODO: Open coursesPage
  // TODO: Click createCourseButton
  // TODO: Handle dialog with CourseCreateDialogComponent
  // TODO: Assert creation and clean up
});`,
      task: "Compose CourseCreateDialogComponent alongside CourseCataloguePage to prove modularity prevents monolithic classes.",
      acceptanceCriteria: [
        "CourseCataloguePage manages catalogue browsing.",
        "CourseCreateDialogComponent manages modal creation.",
        "Course created, verified, and deleted.",
      ],
      expectedBehavior: "Modular component objects decouple modal logic from page navigation logic.",
      hint: "const createDialog = new CourseCreateDialogComponent(adminPage);",
      solution: `test("Exercise 9: Compose focused components rather than a monolithic God Page", async ({ adminPage, workerNamespace }) => {
  const coursesPage = new CourseCataloguePage(adminPage);
  await coursesPage.open();

  await coursesPage.createCourseButton.click();
  const createDialog = new CourseCreateDialogComponent(adminPage);
  expect(await createDialog.isVisible()).toBe(true);

  const title = workerNamespace + " Modular Architecture " + Date.now().toString().slice(-4);
  const code = workerNamespace + "MOD-" + Date.now().toString().slice(-4);

  await createDialog.fillAndSubmit({ title, code, price: 399 });
  await coursesPage.expectCourseVisible(title);

  await coursesPage.deleteCourse(title);
});`,
      troubleshootingNotes: "If a modal or form is used on multiple pages, the component object is instantly reusable.",
      command: "pnpm exec playwright test e2e/practice-pom.spec.ts -g 'Exercise 9'",
    },
    {
      id: "ex10-multi-role-pom-workflow",
      title: "Exercise 10: Multi-Role Workflow Using POM Across Separate Browser Contexts",
      objective: "Coordinate two CourseCataloguePage instances across distinct browser contexts representing Admin and Learner roles.",
      prerequisites: [
        "Multi-context browser isolation",
        "Role-based POM orchestration",
      ],
      scenario: "Admin creates course via CourseCataloguePage; Learner searches for it in an isolated context and verifies lack of create button.",
      starterCode: `import { test, expect } from "./fixtures/index.js";

test("Exercise 10: Multi-role POM workflow", async ({ adminPage, learnerPage, workerNamespace }) => {
  // TODO: Instantiate adminCoursesPage and learnerCoursesPage
  // TODO: Admin creates course
  // TODO: Learner searches and views course
  // TODO: Learner verifies createCourseButton is not visible
  // TODO: Admin cleans up course
});`,
      task: "Instantiate two independent POMs on separate authenticated pages, executing a cross-role verification workflow.",
      acceptanceCriteria: [
        "adminCoursesPage and learnerCoursesPage run in isolated contexts.",
        "Admin creates course.",
        "Learner finds course via search.",
        "Learner cannot see createCourseButton.",
        "Course cleaned up by Admin.",
      ],
      expectedBehavior: "Demonstrates that Page Object Models can be freely instantiated across multiple concurrent user sessions.",
      hint: "Pass adminPage into one POM and learnerPage into the second POM.",
      solution: `test("Exercise 10: Multi-role workflow using POM across separate browser contexts", async ({
  adminPage,
  learnerPage,
  workerNamespace,
}) => {
  const adminCoursesPage = new CourseCataloguePage(adminPage);
  const learnerCoursesPage = new CourseCataloguePage(learnerPage);

  await adminCoursesPage.open();
  await learnerCoursesPage.open();

  const title = workerNamespace + " Multi-Role POM Course " + Date.now().toString().slice(-4);
  const code = workerNamespace + "MROLE-" + Date.now().toString().slice(-4);
  await adminCoursesPage.createCourse({ title, code, price: 199 });

  await learnerCoursesPage.search(code);
  await learnerCoursesPage.expectCourseVisible(title);
  await expect(learnerCoursesPage.createCourseButton).not.toBeVisible();

  await adminCoursesPage.deleteCourse(title);
});`,
      troubleshootingNotes: "Multi-context POM testing verifies authorization and real-time collaboration with complete isolation.",
      command: "pnpm exec playwright test e2e/practice-pom.spec.ts -g 'Exercise 10'",
    },
    {
      id: "ex11-parallel-pom-isolation",
      title: "Exercise 11: Verify Independent Execution of Tests Using Page Objects",
      objective: "Execute two independent tests that instantiate POMs and operate in parallel without state collisions.",
      prerequisites: [
        "Parallel test isolation",
        "Thread-safe entity naming",
      ],
      scenario: "Two tests (Alpha and Beta) create, search, and delete unique courses via CourseCataloguePage in parallel workers.",
      starterCode: `import { test, expect } from "./fixtures/index.js";

test("Exercise 11: Parallel POM Alpha", async ({ coursesPage, workerNamespace, request }) => {
  // TODO: Create unique course via API
  // TODO: Search and verify via coursesPage
  // TODO: Clean up
});

test("Exercise 11: Parallel POM Beta", async ({ coursesPage, workerNamespace, request }) => {
  // TODO: Create unique course via API
  // TODO: Search and verify via coursesPage
  // TODO: Clean up
});`,
      task: "Run two parallel tests exercising CourseCataloguePage with namespaced identifiers to prove zero cross-test interference.",
      acceptanceCriteria: [
        "Alpha and Beta tests run independently.",
        "Unique codes prevent database collisions.",
        "All created records are cleaned up.",
      ],
      expectedBehavior: "Stateless page objects execute flawlessly in concurrent multi-threaded test environments.",
      hint: "Use workerNamespace in entity names: workerNamespace + 'ISO_A_' + Date.now().",
      solution: `test("Exercise 11: Verify independent parallel execution (POM Test Alpha)", async ({ coursesPage, workerNamespace, request }) => {
  const apiHelper = new CourseApiHelper(request);
  const code = workerNamespace + "ISO_A_" + Date.now();
  const title = "Isolated Alpha " + code;

  const created = await apiHelper.createCourse({ code, title });
  await coursesPage.search(code);
  await coursesPage.expectCourseVisible(title);
  await apiHelper.deleteCourse(created.id);
});

test("Exercise 11: Verify independent parallel execution (POM Test Beta)", async ({ coursesPage, workerNamespace, request }) => {
  const apiHelper = new CourseApiHelper(request);
  const code = workerNamespace + "ISO_B_" + Date.now();
  const title = "Isolated Beta " + code;

  const created = await apiHelper.createCourse({ code, title });
  await coursesPage.search(code);
  await coursesPage.expectCourseVisible(title);
  await apiHelper.deleteCourse(created.id);
});`,
      troubleshootingNotes: "Page object instances must never store static or class-level mutable state.",
      command: "pnpm exec playwright test e2e/practice-pom.spec.ts -g 'Exercise 11'",
    },
    {
      id: "ex12-senior-framework-capstone",
      title: "Exercise 12: Complete a Senior-Level Framework Architecture Challenge",
      objective: "Synthesize API Helpers, Custom Fixtures, Page Object Models, and Component Objects into a complete enterprise workflow.",
      prerequisites: [
        "Full test architecture integration",
        "API helper, POM, and Component orchestration",
      ],
      scenario: "API helper provisions course; POM verifies rendering and filters category; Component object adds sub-course; guaranteed cleanup ensues.",
      starterCode: `import { test, expect } from "./fixtures/index.js";

test("Exercise 12: Senior framework challenge", async ({ coursesPage, request, workerNamespace }) => {
  // TODO: API helper creates primary course
  // TODO: coursesPage verifies search and category filter
  // TODO: CourseCreateDialogComponent adds sub-course
  // TODO: POM cleans up sub-course
  // TODO: Guaranteed API helper teardown in finally block
});`,
      task: "Build an end-to-end workflow composing an API helper, fixture-injected POM, component dialog, and resilient try/finally teardown.",
      acceptanceCriteria: [
        "Primary course seeded via CourseApiHelper in 25ms.",
        "coursesPage verifies search and DevOps category filter.",
        "CourseCreateDialogComponent creates sub-course modal.",
        "Sub-course cleaned up via POM.",
        "Primary course cleaned up via API helper in finally block.",
      ],
      expectedBehavior: "Demonstrates production-grade SDET architecture combining speed, maintainability, and teardown resilience.",
      hint: "Wrap UI operations in try/finally to guarantee API helper cleanup runs regardless of assertions.",
      solution: `test("Exercise 12: Senior framework challenge — Full POM, Fixture, Component & API integration", async ({
  coursesPage,
  request,
  workerNamespace,
}) => {
  const apiHelper = new CourseApiHelper(request);
  const code = workerNamespace + "CHALLENGE_" + Date.now().toString().slice(-4);
  const title = workerNamespace + " Enterprise Architecture Capstone";
  const created = await apiHelper.createCourse({ code, title, price: 499 });

  try {
    await coursesPage.search(code);
    await coursesPage.expectCourseVisible(title);

    await coursesPage.filterByCategory("DevOps");
    await coursesPage.expectCourseVisible(title);

    await coursesPage.createCourseButton.click();
    const dialog = new CourseCreateDialogComponent(coursesPage.page);
    const subTitle = workerNamespace + " Sub Course " + Date.now().toString().slice(-4);
    const subCode = workerNamespace + "SUB-" + Date.now().toString().slice(-4);
    await dialog.fillAndSubmit({ title: subTitle, code: subCode, price: 150 });

    await coursesPage.filterByCategory("Core");
    await coursesPage.search(subCode);
    await coursesPage.expectCourseVisible(subTitle);

    await coursesPage.deleteCourse(subTitle);
  } finally {
    await apiHelper.deleteCourse(created.id).catch(() => {});
  }
});`,
      troubleshootingNotes: "This architecture scales seamlessly across hundreds of developers and thousands of tests.",
      command: "pnpm exec playwright test e2e/practice-pom.spec.ts -g 'Exercise 12'",
    },
  ],
  knowledgeCheck: [
    {
      id: "kc-pom-purpose",
      topic: "Beginner: Page Object Model Fundamentals",
      question: "What is the primary benefit of the Page Object Model design pattern in automated testing?",
      options: [
        "It increases the speed of browser downloads",
        "It separates test intent from DOM implementation details, centralizing locators and interactions to reduce maintenance churn",
        "It replaces TypeScript with visual workflow diagrams",
        "It automatically fixes broken application CSS",
      ],
      correctOptionIndex: 1,
      explanation:
        "POM separates business logic from DOM mechanics. When UI selectors change, only the Page Object needs updating rather than dozens of individual test files.",
    },
    {
      id: "kc-locators-constructor",
      topic: "Beginner: Lazy Locators in POM Constructors",
      question: "Why is it safe and recommended to define Playwright locators inside a Page Object's constructor?",
      options: [
        "Because Playwright immediately downloads all images when the constructor runs",
        "Because Playwright locators are lazy evaluators that do not query the live DOM until an action or assertion is performed",
        "Because constructors in TypeScript execute on the server side",
        "Because defining locators in constructors disables browser auto-waiting",
      ],
      correctOptionIndex: 1,
      explanation:
        "Unlike Selenium WebDriver, Playwright locators are lazy pointers. They query the DOM only when an action (click, fill) or assertion is invoked, making them immune to stale element exceptions.",
    },
    {
      id: "kc-composition-vs-inheritance",
      topic: "Intermediate: Composition over Inheritance",
      question: "Why is Object Composition preferred over deep Class Inheritance when designing enterprise Page Objects?",
      options: [
        "JavaScript does not support the 'extends' keyword",
        "Deep inheritance tightly couples pages and causes changes in parent classes to inadvertently break unrelated pages, whereas composition allows assembling modular components flexibly",
        "Composition makes tests execute in headed mode",
        "Inheritance requires all methods to be synchronous",
      ],
      correctOptionIndex: 1,
      explanation:
        "Composition (e.g. CourseCataloguePage containing a NavigationComponent and TableComponent) adheres to the Single Responsibility Principle and avoids brittle inheritance trees.",
    },
    {
      id: "kc-fluent-chaining-antipattern",
      topic: "Intermediate: The Fluent Chaining Anti-Pattern",
      question: "Why is returning 'this' for fluent method chaining (e.g. loginPage.enterUser().enterPass().submit()) considered an anti-pattern in modern async Playwright testing?",
      options: [
        "It causes browser tabs to close immediately",
        "It obscures asynchronous Promise resolution boundaries, complicates error tracking in traces, and tightly couples unrelated page transitions",
        "TypeScript compiler errors on method chaining",
        "Chained methods execute in parallel rather than sequentially",
      ],
      correctOptionIndex: 1,
      explanation:
        "In async Playwright testing, every action returns a Promise that must be awaited. Fluent chaining obscures async boundaries and tightly couples methods.",
    },
    {
      id: "kc-pom-fixture-integration",
      topic: "Intermediate: POM with Fixtures",
      question: "What is the primary advantage of providing Page Objects through custom fixtures (test.extend()) rather than manual 'new MyPage(page)' instantiation?",
      options: [
        "Fixtures allow Page Objects to run without Chromium installed",
        "Fixtures encapsulate page instantiation and navigation, providing pre-opened, ready-to-test page objects cleanly via dependency injection",
        "Fixtures convert all page objects into global singletons shared across workers",
        "Fixtures bypass TypeScript type checking",
      ],
      correctOptionIndex: 1,
      explanation:
        "Injecting POMs via fixtures eliminates repetitive instantiation and navigation boilerplate in test files while ensuring each test receives an isolated instance.",
    },
    {
      id: "kc-assertion-placement",
      topic: "Advanced: Assertion Boundaries",
      question: "Where should business-level assertions (such as verifying successful checkout or URL redirection) ideally reside?",
      options: [
        "Deep inside the Page Object's constructor",
        "In the test file itself, leaving the test's intent and acceptance criteria transparent and diagnostic reports clear",
        "In an external JSON file",
        "Inside browser console log listeners",
      ],
      correctOptionIndex: 1,
      explanation:
        "Keeping assertions in the test file makes test intent immediately clear to readers and ensures Playwright traces highlight the exact line in the test specification upon failure.",
    },
    {
      id: "kc-rule-of-three",
      topic: "Advanced: Premature Abstraction & Rule of Three",
      question: "What does the 'Rule of Three' recommend regarding when to create a Page Object or Component Object?",
      options: [
        "Every page must have at least three child component classes",
        "Write direct locators first; only extract a reusable POM or Component when the same UI surface or workflow is needed in three or more test files",
        "Never run more than three tests per spec file",
        "Always retry every failing test three times",
      ],
      correctOptionIndex: 1,
      explanation:
        "The Rule of Three prevents premature abstraction. Creating POMs for one-off elements introduces unnecessary indirection without providing reuse value.",
    },
    {
      id: "kc-component-locator-scoping",
      topic: "Advanced: Component Locator Scoping",
      question: "How should a reusable Component Object (such as a modal dialog or table row) construct its internal locators to prevent strict mode violations?",
      options: [
        "By querying document.querySelectorAll() in page.evaluate()",
        "By scoping all internal locators to the component's root container (e.g. this.root.getByLabel('Title')) rather than searching the global page",
        "By appending ':nth-child(1)' to every CSS selector",
        "By disabling strict mode in playwright.config.ts",
      ],
      correctOptionIndex: 1,
      explanation:
        "Scoping child locators strictly within the component root locator ensures elements are found unambiguously, even if identical form fields exist elsewhere on the page.",
    },
    {
      id: "kc-hybrid-pom-api",
      topic: "Advanced: Hybrid API and POM Architecture",
      question: "In an enterprise test architecture, how do Page Objects and API Helpers complement each other?",
      options: [
        "API helpers replace all browser tests completely",
        "API helpers provision prerequisite test data and handle cleanup in milliseconds, while Page Objects validate user interaction and visual fidelity in the browser UI",
        "Page Objects make direct HTTP calls instead of using the browser",
        "API helpers can only run after the browser process closes",
      ],
      correctOptionIndex: 1,
      explanation:
        "Hybrid architecture leverages API helpers for ultra-fast setup and teardown, reserving the browser UI and Page Objects exclusively for testing the user experience under test.",
    },
  ],
  practiceTask: {
    labRoute: "/app/courses",
    labName: "Course Catalogue Page Object Lab",
    objective:
      "Execute an administrative course search and verify UI rendering using CourseCataloguePage and CourseCreateDialogComponent.",
    instructions: [
      "Navigate to the Course Catalogue using the CourseCataloguePage page object.",
      "Open the CourseCreateDialogComponent modal and submit a new course with a unique code.",
      "Filter by category and verify that the course renders in the catalogue grid.",
      "Delete the course using CourseCataloguePage.deleteCourse() to ensure clean state.",
    ],
    acceptanceCriteria: [
      "Page interactions encapsulated within CourseCataloguePage.",
      "Modal interactions encapsulated within CourseCreateDialogComponent.",
      "Course confirmed visible in course grid.",
      "Course cleanly deleted upon completion.",
    ],
    hint: "Use the CourseCataloguePage and CourseCreateDialogComponent from e2e/practice-pom.spec.ts.",
    solutionCode: `import { test, expect } from "./fixtures/index.js";
import { CourseCataloguePage } from "./pages/CourseCataloguePage.js";
import { CourseCreateDialogComponent } from "./practice-pom.spec.js";

test("admin manages course lifecycle via POM", async ({ adminPage, workerNamespace }) => {
  const coursesPage = new CourseCataloguePage(adminPage);
  await coursesPage.open();

  await coursesPage.createCourseButton.click();
  const dialog = new CourseCreateDialogComponent(adminPage);

  const title = workerNamespace + " Capstone Course " + Date.now().toString().slice(-4);
  const code = workerNamespace + "CAP-" + Date.now().toString().slice(-4);

  await dialog.fillAndSubmit({ title, code, price: 299 });
  await coursesPage.expectCourseVisible(title);

  await coursesPage.deleteCourse(title);
  await coursesPage.expectCourseNotVisible(title);
});`,
    playwrightCommand: "pnpm exec playwright test e2e/practice-pom.spec.ts -g 'Exercise 4'",
  },
  interviewQuestions: [
    {
      question: "Why does the Playwright team recommend against the traditional Selenium practice of method chaining in Page Objects?",
      answer:
        "In Selenium, returning 'this' allowed fluent chaining like 'page.fillUser().fillPass().submit()'. In modern asynchronous JavaScript/TypeScript, every user interaction returns a Promise that must be awaited. Method chaining obscures await boundaries, complicates try/catch error handling, makes failure diagnostics harder to pinpoint in Playwright traces, and couples unrelated page states together. Clean async/await calls are vastly more maintainable.",
      architecturalContext:
        "Enterprise teams with hundreds of engineers benefit from explicit, unchained async operations that produce clean stack traces and transparent step logs.",
    },
    {
      question: "How do you prevent Page Objects from turning into unmaintainable 'God Objects' as an application grows?",
      answer:
        "By adhering to the Single Responsibility Principle through Object Composition. Instead of stuffing every element on a page into one giant class, decompose the page into focused Component Objects (e.g. NavigationBarComponent, DataTableComponent, ConfirmationModalComponent). The parent Page Object then composes these components as readonly properties.",
      architecturalContext:
        "Component-driven page architecture mirrors modern frontend frameworks (React, Vue), allowing QA abstractions to evolve in lockstep with design systems.",
    },
    {
      question: "When should an automated test use direct locators instead of a Page Object Model?",
      answer:
        "Direct locators are ideal for isolated component tests, transient feature experiments, smoke tests verifying a single button, or when practicing in early test development. Following the 'Rule of Three', teams should avoid premature abstraction and only extract a Page Object or Component Object when the same UI workflow or selector set is needed across three or more separate test files.",
      architecturalContext:
        "Avoiding unnecessary abstraction on one-off pages keeps test code close to the DOM, eliminates indirection, and reduces overall framework maintenance costs.",
    },
    {
      question: "How do custom fixtures improve the Page Object Model architecture in Playwright?",
      answer:
        "Custom fixtures (via test.extend()) implement true Dependency Injection for tests. Instead of repeating 'const page = new MyPage(browserPage); await page.open();' in every test, a fixture provisions the page object, manages its lifecycle, navigates to the starting route, and yields it directly to the test parameters. Furthermore, fixtures can pair page objects with API seed data in a single declarative signature.",
      architecturalContext:
        "Fixture-injected POMs eliminate up to 70% of setup boilerplate across large enterprise test repositories while enforcing strict test isolation.",
    },
  ],
};
