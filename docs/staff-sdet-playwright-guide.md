# Writing Industrial Playwright Tests: The 10-Year SDET Architectural Guide

This guide details how a **Principal / Staff SDET with 10+ years of test automation experience** designs, architects, and writes Playwright test suites. It codifies enterprise standards that differentiate high-velocity, deterministic suites from fragile, legacy test scripts.

---

## 1. The Mindset Shift: Junior vs. Senior vs. Staff SDET

| Dimension | Junior / Novice SDET | Senior SDET (5–7 yrs) | Staff / Principal SDET (10+ yrs) |
|---|---|---|---|
| **Locator Strategy** | XPath, CSS classes (`.btn-primary`), arbitrary IDs (`#submit-btn`) | Semantic locators (`getByRole`), data-test-id attributes | **User-facing accessibility tree semantics** (`getByRole`, `getByLabel`), container scoping, zero index hacks |
| **Wait Strategy** | `page.waitForTimeout(3000)` (arbitrary sleeps) | Explicit waits for elements (`waitForSelector`) | **Playwright Actionability Engine + Web-First auto-retrying assertions**; network condition waits |
| **Test Setup** | Navigates UI to click through 10 setup steps before every test | DB seeds or setup scripts in `beforeEach` | **Hybrid API/UI Seeding + Storage State Session Warming**: 50ms API provisioning + zero UI login overhead |
| **Page Objects** | Exposes raw locators and getters (`getSubmitBtn().click()`) | Encapsulates methods into classes | **Lean action-oriented POMs + Functional Fixture composition**; returns domain transactions, not elements |
| **Test Independence** | Tests depend on execution order (Test B relies on Test A) | Runs independently in a single thread | **Worker-scoped namespaces (`w0_`, `w1_`)**: 100% parallel execution across multiple workers with zero crosstalk |
| **Assertions** | `expect(await page.locator().isVisible()).toBe(true)` (Instant fail) | `await expect(page.locator()).toBeVisible()` | **Web-First auto-retrying assertions + Domain Custom Matchers** (`toBeAccessibleDialog()`, `toHaveIsoTimestamp()`) |
| **Failure Triage** | Looks at screenshot and re-runs test | Reads console logs and stacks | **Trace Viewer deep dive**: Filmstrip analysis, network request timelines, actionability hit-test logs |

---

## 2. The 5 Immutable Laws of Industrial Playwright Testing

### Law 1: User-Facing Semantic Locators & Strict Mode
Always query the DOM the way a human user or assistive screen reader experiences it:
1. `page.getByRole('button', { name: 'Confirm Order' })`
2. `page.getByLabel('Work Email')`
3. `page.getByPlaceholder('Search courses...')`
4. `page.getByText('Payment Received')`

#### Why Strict Mode is Non-Negotiable
By default, Playwright enforces **Strict Mode**. If your locator resolves to 2 or more elements, Playwright immediately throws a `strict mode violation` error.
- **Junior Mistake**: Suppressing the error using `.first()` or `.nth(0)`. This masks DOM duplication bugs.
- **10-Year SDET Approach**: Narrow the scope using parent landmarks or semantic filtering:
```typescript
// BAD: Brittle, masks bugs
await page.getByRole('button', { name: 'Edit' }).first().click();

// GOOD: Scoped semantically to the target business entity
const courseRow = page.getByRole('row').filter({ hasText: 'PW-101' });
await courseRow.getByRole('button', { name: 'Edit' }).click();
```

---

### Law 2: Web-First Asynchronous Assertions
Never evaluate a boolean state in JavaScript before asserting. Doing so strips Playwright of its auto-retry capability:

```typescript
// CRITICAL DEFECT: Fails immediately if DOM is rendering asynchronously
const isShown = await page.getByRole('alert').isVisible();
expect(isShown).toBe(true);

// 10-YEAR SDET PATTERN: Automatically polls and retries until timeout
await expect(page.getByRole('alert')).toBeVisible();
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
await expect(page.locator('#order-status')).toHaveText('Approved');
```

---

### Law 3: Zero Arbitrary Sleeps
`await page.waitForTimeout(milliseconds)` is strictly forbidden in production test code.
- If the machine is fast, the sleep wastes precious build minutes.
- If the CI runner is under heavy CPU load, the sleep expires prematurely, causing flaky false negatives.
- **Solution**: Rely on Playwright's **Actionability Engine** (which automatically verifies that an element is attached, visible, stable, enabled, and unobstructed before clicking) or wait for a specific backend network response:

```typescript
// Wait for the specific API response that populates the table
const responsePromise = page.waitForResponse(
  (res) => res.url().includes('/api/app/courses') && res.ok()
);
await page.getByRole('button', { name: 'Apply Filter' }).click();
await responsePromise;
```

---

### Law 4: Test Isolation & Worker-Scoped Namespaces
Tests must never share mutable data in memory or across databases. In a parallel execution environment with 4 workers:
- Worker 0 running `Test A` must not edit a user that Worker 1 running `Test B` is asserting on.
- Prefix all generated test entities with a worker namespace and timestamp:

```typescript
const uniqueId = `${workerNamespace}${Date.now()}`;
const courseCode = `DEV-${uniqueId.slice(-4)}`;
```

---

### Law 5: The Hybrid Testing Pyramid (API Setup -> UI Action -> API Audit)
Do not use the UI to set up test prerequisites.
- Setting up a user, permissions, and 5 courses via UI clicks takes 8–15 seconds and has 30 potential failure points.
- Provisioning that data via `APIRequestContext` takes 40 milliseconds and has 1 failure point.

```
┌──────────────────────────────────────────────────────────┐
│ Step 1: POST /api/app/courses (API - 40ms)               │ -> Provision preconditions
├──────────────────────────────────────────────────────────┤
│ Step 2: Navigate to /app/enrollments & complete flow     │ -> Test the real user journey
├──────────────────────────────────────────────────────────┤
│ Step 3: GET /api/app/activity & verify audit log (API)   │ -> Assert backend transaction
└──────────────────────────────────────────────────────────┘
```

---

## 3. Dissecting a Test: Junior Script vs. 10-Year SDET Case

### The Problematic Junior Script
```typescript
// ❌ ANTI-PATTERN SCRIPT
test('test enrollment', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.locator('#email').fill('admin@pil.local');
  await page.locator('#password').fill('Admin123!');
  await page.locator('.btn-primary').click();
  await page.waitForTimeout(3000); // Sleep 1

  await page.goto('http://localhost:5173/app/courses');
  await page.locator('text=Create Course').click();
  await page.locator('input[name="title"]').fill('My Course');
  await page.locator('input[name="code"]').fill('CR-01');
  await page.locator('button:has-text("Save")').click();
  await page.waitForTimeout(2000); // Sleep 2

  await page.goto('http://localhost:5173/app/enrollments');
  await page.locator('select').selectOption('CR-01');
  await page.locator('button.submit').click();
  
  const text = await page.locator('.status').innerText();
  expect(text == 'Pending').toBeTruthy();
});
```

### The 10-Year SDET Production Implementation
```typescript
// ✅ 10-YEAR ARCHITECTURAL PATTERN
import { expect, test } from './fixtures/index.js';
import { EnrollmentWizardPage } from './pages/EnrollmentWizardPage.js';

test.describe('enterprise course enrollment journey', () => {
  test('learner submits enrollment and verifies pending status @smoke', async ({
    learnerPage,       // 1. Session pre-warmed via storageState (0ms login)
    seededTestData,    // 2. Course provisioned via API + auto-cleanup teardown
  }) => {
    // 3. Encapsulated inside an Action-Oriented Page Object Model
    const wizard = new EnrollmentWizardPage(learnerPage);
    await wizard.open();

    // 4. Executes complete business action and returns structured confirmation ID
    const orderId = await wizard.completeFullWizard({
      courseId: seededTestData.courseId,
      seats: 3,
      name: 'Jordan SDET',
      email: 'jordan@pil.local',
    });

    // 5. Semantic assertion with regular expression contract
    expect(orderId).toMatch(/^enr_\d+$/);

    // 6. Web-first auto-retrying table verification
    await wizard.expectOrderInTable(orderId, 'jordan@pil.local');
  });
});
```

---

## 4. Architectural Patterns & Implementation Code

### Pattern 1: Test Fixtures with Dependency Injection (`test.extend`)
Fixtures provide clean on-demand dependency injection. Code before `use()` is setup; code after `use()` is automatic teardown, even if tests throw unexpected exceptions:

```typescript
// e2e/fixtures/index.ts
export const test = baseTest.extend<CustomFixtures, WorkerFixtures>({
  // Worker-scoped parallel isolation namespace
  workerNamespace: [
    async ({}, use, workerInfo) => {
      await use(`w${workerInfo.workerIndex}_`);
    },
    { scope: 'worker' },
  ],

  // Test-scoped data auto-cleanup
  seededTestData: async ({ appClient, workerNamespace }, use) => {
    const courseCode = `${workerNamespace}AUTO-${Date.now().toString().slice(-4)}`;
    const res = await appClient.post('/api/app/courses', {
      data: { code: courseCode, title: `Test Course ${courseCode}`, price: 299 },
    });
    const { course } = await res.json();

    // Pass data to test
    await use({ courseId: course.id, courseCode });

    // Automatic teardown
    await appClient.delete(`/api/app/courses/${course.id}`).catch(() => {});
  },
});
```

---

### Pattern 2: Multi-Role Session Warming via `storageState`
Bypass the login screen completely by authenticating once in a `setup` project:

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

// e2e/auth.setup.ts
test('prepare auth storage states', async ({ request }) => {
  // Store authenticated cookies / tokens to disk
  await page.context().storageState({ path: '.auth/admin.json' });
});
```

---

### Pattern 3: Modern Action-Oriented Page Object Models (POMs)
A Page Object Model must model **user intentions**, not HTML markup.
- ❌ Do NOT write: `getUsernameInput()`, `getSubmitButton()`
- ✅ DO write: `loginAs(user)`, `completeStep1(data)`

```typescript
export class EnrollmentWizardPage extends BasePage {
  private readonly courseSelect: Locator;
  private readonly seatsInput: Locator;
  private readonly nextButton: Locator;

  constructor(page: Page) {
    super(page);
    this.courseSelect = page.getByLabel('Choose Course');
    this.seatsInput = page.getByLabel('Number of Seats (1-10)');
    this.nextButton = page.getByRole('button', { name: /Next Step/i });
  }

  async selectCourseAndSeats(courseId: string, seats: number): Promise<void> {
    await this.courseSelect.selectOption(courseId);
    await this.seatsInput.fill(String(seats));
    await this.nextButton.click();
  }
}
```

---

### Pattern 4: Transient Overlays & `page.addLocatorHandler()`
When testing enterprise applications, random promotional banners, cookie consents, or survey popups can appear unpredictably and block clicks.
- **10-Year SDET Pattern**: Register an automatic handler that dismisses the overlay the moment it appears without cluttering test code:

```typescript
test.beforeEach(async ({ page }) => {
  const promoOverlay = page.getByRole('dialog', { name: 'Special Promotion' });
  await page.addLocatorHandler(promoOverlay, async () => {
    await promoOverlay.getByRole('button', { name: 'Close' }).click();
  });
});
```

---

### Pattern 5: Multi-Context Concurrent Collaboration
Test real-time collaboration or role segregation without running two separate test instances:

```typescript
test('learner places order in Context A and admin approves in Context B', async ({ browser }) => {
  // Context A: Pre-warmed Learner Session
  const learnerContext = await browser.newContext({ storageState: '.auth/learner.json' });
  const learnerPage = await learnerContext.newPage();
  await learnerPage.goto('/app/enrollments');
  const orderId = await placeOrder(learnerPage);

  // Context B: Pre-warmed Admin Session (Completely isolated storage & cookies)
  const adminContext = await browser.newContext({ storageState: '.auth/admin.json' });
  const adminPage = await adminContext.newPage();
  await adminPage.goto('/app/enrollments');

  // Verify and approve in real-time
  const row = adminPage.getByTestId(`enrollment-row-${orderId}`);
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: 'Approve' }).click();
  await expect(row.getByText('Approved')).toBeVisible();

  await learnerContext.close();
  await adminContext.close();
});
```

---

## 5. Anti-Patterns That Fail Staff SDET Code Reviews

1. **The Sleep Anti-Pattern**:
   `await page.waitForTimeout(5000);`  
   *Review Comment*: Blocked. Replace with web-first assertion or `page.waitForResponse()`.
2. **The Force Click Anti-Pattern**:
   `await button.click({ force: true });`  
   *Review Comment*: Blocked. `force: true` bypasses hit-testing and pointer checks. Fix the underlying layout overlap.
3. **The Index Selector Anti-Pattern**:
   `page.locator('tr').nth(2).locator('button').click();`  
   *Review Comment*: Fragile to sorting and pagination. Refactor using `row.filter({ hasText: 'PW-101' })`.
4. **The Over-Mocking Anti-Pattern**:
   Mocking every endpoint in an end-to-end test with `page.route()`.  
   *Review Comment*: If every API call is mocked, you are verifying frontend assumptions rather than end-to-end system integration. Use real APIs for critical happy paths.

---

## 6. Failure Triage: The 3-Minute CI Root Cause Method

When a test fails in CI, do not guess or randomly re-run. Follow this triage sequence:

```
1. Download Artifacts
   └── Download `test-results/` and `playwright-report/` from the GitHub Actions run.

2. Open the Trace Viewer
   └── Run `npx playwright show-trace test-results/<failed-test>/trace.zip`.

3. Inspect the Filmstrip
   └── Scrub across the top timeline to see the visual screen progression.

4. Inspect the Action Log
   └── Look at the failed action: Was the element detached? Was an unexpected overlay covering it?

5. Review Network Requests
   └── Inspect the Network tab in Trace Viewer: Did a backend 500 error or 401 unauthenticated response cause the UI to stall?
```
