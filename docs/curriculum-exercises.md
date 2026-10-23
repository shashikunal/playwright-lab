# 10-Day Industrial Playwright Mastery Curriculum

This curriculum provides a structured, scenario-driven learning roadmap designed for senior-level engineers and SDETs. Each day pairs practical browser-automation exercises in the **Playwright Industrial Lab** with real-world architecture trade-offs and interview questions.

---

## Day 1 — Semantic Locators & Modern Locator Architecture
- **Lab Route**: `/lab/locators`
- **Reference Spec**: `e2e/locators.spec.ts`
- **Core Concepts**:
  - `page.getByRole()`, `page.getByLabel()`, `page.getByText()`, `page.getByTestId()`.
  - Playwright **Strict Mode**: Why single-element locators throw when resolving multiple DOM matches.
  - Locator composition: `.filter({ hasText })`, `.filter({ has: locator })`, parent landmark scoping.
- **Hands-On Exercises**:
  1. Target the "Edit" button inside a specific table row without relying on brittle positional indices (`nth(0)`).
  2. Interact with duplicate controls in nested cards using container scoping.
  3. Verify that inputs with broken `<label>` associations fail `getByLabel()` lookups.
- **Senior SDET Question**:
  > *Why should test automation avoid `page.locator('button.btn-primary').first()` when resolving locator ambiguity?*
  - **Answer**: `.first()` suppresses strict mode and masks accidental DOM duplication bugs. When UI adds dynamic elements or sorts table rows, `.first()` clicks the wrong item silently. Use locator filtering with semantic context instead.

---

## Day 2 — Accessible Forms & Keyboard Navigation
- **Lab Route**: `/lab/forms`
- **Reference Spec**: `e2e/forms.spec.ts`
- **Core Concepts**:
  - Native HTML5 inputs: text, email, password, number, range, radio, checkbox, date.
  - ARIA 1.2 compliant **Combobox** with keyboard arrow traversal (`ArrowDown`, `Enter`).
  - Multi-step intake wizards, dynamic conditional sections, and validation error alerts.
- **Hands-On Exercises**:
  1. Automate the multi-step intake wizard using **keyboard-only interaction** (`Tab`, `Space`, `Enter`).
  2. Trigger client-side validation errors by submitting empty required fields and assert on `role="alert"`.
  3. Verify that the form submit button prevents double-clicks via auto-waiting for disabled state.
- **Senior SDET Question**:
  > *How do you reliably automate custom select dropdowns without native `<select>` tags?*
  - **Answer**: Treat it as an ARIA Combobox. Verify that clicking or focusing opens `aria-expanded="true"`, assert that the popup listbox renders options with `role="option"`, and traverse using `page.keyboard.press('ArrowDown')` to verify accessible focus management.

---

## Day 3 — Interactive Widgets, Dialogs & Shadow DOM
- **Lab Route**: `/lab/widgets`
- **Reference Spec**: `e2e/widgets.spec.ts`
- **Core Concepts**:
  - Native browser dialogs (`alert`, `confirm`, `prompt`) vs. accessible HTML `<dialog>` modals.
  - Open **Shadow DOM** piercing: Playwright's automatic shadow root traversal.
  - HTML5 Drag and Drop (`locator.dragTo`) and canvas drawing.
- **Hands-On Exercises**:
  1. Register `page.on('dialog')` to accept a confirm dialog and prompt input with custom text.
  2. Open an accessible modal dialog, assert focus is trapped inside, and dismiss using the `Escape` key.
  3. Target an element encapsulated inside an open Shadow DOM root using standard user-facing locators.
- **Senior SDET Question**:
  > *Why must `page.on('dialog')` event listeners be registered before the action that triggers the popup?*
  - **Answer**: Playwright automatically dismisses unhandled native browser dialogs to prevent tests from hanging. If the listener is added after the click, the dialog is already dismissed before the listener attaches.

---

## Day 4 — Browser Navigation, Nested Iframes & Storage
- **Lab Route**: `/lab/browser`
- **Reference Spec**: `e2e/browser.spec.ts`
- **Core Concepts**:
  - Multi-tab popups: `page.waitForEvent('popup')`.
  - Nested same-origin iframes: `page.frameLocator().frameLocator()`.
  - Browser storage manipulation: `context.cookies()`, `context.addCookies()`, `localStorage`.
  - Device sensors & permissions: `context.grantPermissions()`, `context.setGeolocation()`.
- **Hands-On Exercises**:
  1. Click an external link simulator, wait for the popup `Page` handle, assert its title, and close it cleanly.
  2. Read and write input values inside a child iframe embedded inside an outer iframe.
  3. Emulate geolocation coordinates (San Francisco: 37.7749, -122.4194) and verify dynamic map rendering.
- **Senior SDET Question**:
  > *How does Playwright's `frameLocator` architecture prevent stale frame exceptions common in Selenium?*
  - **Answer**: Unlike Selenium's imperative `driver.switchTo().frame()` which holds transient DOM pointers, Playwright's `frameLocator` is declarative and lazy. Every action auto-waits for the frame to be ready and attached.

---

## Day 5 — Scenario Controls & Network Interception
- **Lab Route**: `/lab/network`
- **Reference Spec**: `e2e/network.spec.ts`
- **Core Concepts**:
  - `page.route()`, `route.fulfill()`, `route.continue()`, `route.abort()`.
  - Simulating HTTP status overrides (400, 401, 403, 404, 409, 422, 429, 500, 504).
  - Optimistic UI updates with automatic rollback on network failure.
  - Debounced search queries and race condition prevention.
- **Hands-On Exercises**:
  1. Intercept `GET /api/lab/network/items` and mock a `500 Internal Server Error` payload to assert UI error banners.
  2. Inject 2000ms latency and verify that loading skeletons appear and detach cleanly without arbitrary sleeps.
  3. Simulate an offline network failure using `route.abort('failed')` and assert friendly offline feedback.
- **Senior SDET Question**:
  > *When should end-to-end tests mock network responses with `page.route()`, and when should they hit real APIs?*
  - **Answer**: Use real APIs for core business journeys to validate schema contracts and database integrity. Reserve `page.route()` for edge cases that are difficult, slow, or destructive to trigger live (e.g. 503 gateway outages, 429 rate limits, and third-party payment webhooks).

---

## Day 6 — Flaky Test Debugging & File Operations
- **Lab Route**: `/lab/flaky`
- **Reference Spec**: `e2e/flaky.spec.ts`
- **Core Concepts**:
  - Playwright **Actionability Engine**: Attached, Visible, Stable, Enabled, Unobstructed.
  - Native file uploads: `locator.setInputFiles()` without OS window pickers.
  - Safe file downloads: `page.waitForEvent('download')` streaming verification.
  - Floating overlays and `page.addLocatorHandler()` for transient interruption handling.
- **Hands-On Exercises**:
  1. Upload a CSV file and verify validation rejection on oversized or unsupported `.exe` files.
  2. Trigger a CSV export and assert the downloaded filename and streaming content headers.
  3. Handle a floating promotional banner that intercepts clicks using `page.addLocatorHandler()`.
- **Senior SDET Question**:
  > *Why is `click({ force: true })` considered an anti-pattern in production test suites?*
  - **Answer**: `force: true` bypasses hit-testing and pointer-event checks. It clicks elements that are covered by modals, hidden off-screen, or disabled, passing tests while actual human users are blocked by bugs.

---

## Day 7 — Enterprise Authentication & Business Workflows
- **Lab Route**: `/login`, `/app/courses`, `/app/enrollments`, `/app/users`
- **Reference Spec**: `e2e/auth.spec.ts`, `e2e/workflows.spec.ts`, `e2e/users.spec.ts`
- **Core Concepts**:
  - Role-Based Access Control (RBAC): `learner` (read-only), `trainer` (create/edit), `admin` (full CRUD).
  - Multi-step commerce checkout: seat calculation, validation, summary review, order submission.
  - User management data grid: sorting, search debouncing, pagination, bulk updates, audit logs.
- **Hands-On Exercises**:
  1. Log in as `learner` and assert that administrative buttons ("Create Course", "Delete") are absent from the DOM.
  2. Complete an enrollment order as a Learner and approve it from the Admin view.
  3. Create, edit, and perform bulk deactivations in the User Management directory.
- **Senior SDET Question**:
  > *How do you test role-based permissions without writing redundant login UI steps for every single test?*
  - **Answer**: Use Playwright authentication storage state (`storageState`). Log in once during a global setup project, save session tokens to `.auth/*.json`, and inject pre-authenticated contexts into test workers.

---

## Day 8 — Automated Accessibility Audits & Visual Regression
- **Lab Route**: `/lab/a11y`, `/lab/visual`
- **Reference Spec**: `e2e/a11y.spec.ts`, `e2e/visual.spec.ts`
- **Core Concepts**:
  - Automated WCAG 2.1 AA audits using `@axe-core/playwright`.
  - Component-level visual regression with `toHaveScreenshot()`.
  - Dynamic content masking: `mask: [locators]` for timestamps and randomized IDs.
  - Freezing CSS animations: `animations: 'disabled'`.
- **Hands-On Exercises**:
  1. Run an Axe scan against `/lab/a11y`, identify intentional color contrast violations, trigger the remediation toggle, and assert 0 remaining violations.
  2. Capture a component screenshot with `toHaveScreenshot()`, mask a dynamic clock timestamp, and verify 0 pixel drift.
- **Senior SDET Question**:
  > *Does a passing axe-core accessibility audit guarantee that a website is fully accessible?*
  - **Answer**: No. Automated scanners catch only 30–50% of WCAG defects (contrast, missing labels, duplicate IDs). They cannot evaluate logical focus order, whether alt text is contextually meaningful, or keyboard focus traps. Automated scans must be paired with keyboard tab tests.

---

## Day 9 — Enterprise Playwright Architecture
- **Reference Spec**: `e2e/fixtures.spec.ts`, `e2e/storage-state.spec.ts`, `e2e/pom-workflows.spec.ts`
- **Core Concepts**:
  - Custom test fixtures: `test.extend()`, worker-scoped vs. test-scoped fixtures.
  - Test data provisioning with automatic teardown lifecycles.
  - Page Object Model (POM) best practices: action methods vs. locator encapsulation.
  - Domain-specific custom matchers: `toBeAccessibleDialog()`, `toHaveIsoTimestamp()`.
- **Hands-On Exercises**:
  1. Build a test-scoped fixture that provisions a course via API and automatically deletes it after the test.
  2. Refactor an end-to-end user journey into a Page Object Model (`EnrollmentWizardPage`).
  3. Create a custom matcher that asserts structured audit log entries meet domain schema rules.
- **Senior SDET Question**:
  > *When should you prefer functional test fixtures over Page Object Models in Playwright?*
  - **Answer**: Page Object Models excel at long, multi-step customer journeys spanning multiple screens. For atomic component tests or API-driven checks, fixture composition (`test.extend({ adminPage, seedUser })`) reduces boilerplate, improves readability, and encapsulates setup/cleanup cleanly.

---

## Day 10 — CI/CD Pipelines, Multi-Context Concurrency & Senior Interview Prep
- **Reference Spec**: `e2e/multi-context.spec.ts`, `e2e/hybrid-api-ui.spec.ts`, `.github/workflows/ci.yml`
- **Core Concepts**:
  - Multi-user concurrent testing: `browser.newContext()` for real-time collaboration.
  - Parallel test sharding: `--shard=1/4`, worker-scoped namespaces.
  - CI optimizations: browser binary caching, artifact retention (`playwright-report/`, `test-results/`).
  - Production readiness & root-cause failure triage.
- **Hands-On Exercises**:
  1. Open two isolated browser contexts simultaneously: Learner submits an enrollment in Context A; Admin verifies and approves the order in Context B in real time.
  2. Run the complete 136-test Chromium suite under full parallelism and verify zero cross-worker crosstalk.
  3. Practice explaining the architecture, trade-offs, and failure triage strategies in mock Senior/Staff SDET interviews.
- **Senior SDET Question**:
  > *How do you prevent parallel test workers from colliding when executing CRUD operations against a shared backend?*
  - **Answer**: 1) Generate worker-scoped namespaces (`workerNamespace`) and prefix all created entity codes/names. 2) Avoid hardcoded static IDs. 3) Avoid global list count assertions (`toHaveCount(5)`); instead assert presence of the worker-specific entity. 4) Use isolated reset endpoints that only restore seed records without deleting records created by other workers.
