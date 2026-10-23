# Enterprise Playwright Test Engineering Playbook

A comprehensive guide to production-grade test automation, architectural patterns, and reliability engineering with Playwright and TypeScript.

---

## 1. Test Fixtures, Composition & Thread Isolation

### 1.1 Why Fixtures Outperform Traditional `beforeEach` Hooks
Traditional test runners rely heavily on mutable shared variables defined in file scope and initialized in `beforeEach` blocks. This leads to:
- Test crosstalk and ordering dependencies.
- Forgotten teardown leading to state leaks.
- Inability to selectively initialize setup only for tests that require it.

Playwright’s **Test Fixture Model** (`test.extend<CustomFixtures, WorkerFixtures>()`) solves this by:
1. **On-demand execution**: If a test does not declare `seededTestData` in its argument signature, the fixture code is never executed.
2. **Automatic lifecycle management**: Code before `await use(...)` runs during setup; code after `await use(...)` runs during teardown—even if the test fails.
3. **Fixture composition**: Fixtures can depend on other fixtures cleanly (e.g. `adminPage` depends on `adminContext`, which depends on `browser`).

### 1.2 Worker-Scoped vs. Test-Scoped Fixtures
- **Test-Scoped** (`scope: 'test'`, default): Recreated for every individual test function. Guarantees pristine state (e.g. new page, fresh auth tokens).
- **Worker-Scoped** (`scope: 'worker'`): Created once per worker OS process and shared across all tests executed by that worker thread.
  - *Primary use case*: Worker-isolated namespaces (`workerNamespace: w0_`, `w1_`) or shared database connection pools.
  - *Rule*: Never store mutable test assertion state in worker-scoped fixtures.

```typescript
// Example: Thread-safe worker prefix
export const test = baseTest.extend<CustomFixtures, WorkerFixtures>({
  workerNamespace: [
    async ({}, use, workerInfo) => {
      await use(`w${workerInfo.workerIndex}_`);
    },
    { scope: 'worker' },
  ],
});
```

---

## 2. Authentication Storage State & Session Reuse

### 2.1 The Problem with Repetitive UI Logins
Logging in via the UI before each test adds 2–4 seconds of latency per test. In a suite of 200 tests, this wastes 10–13 minutes of execution time.

### 2.2 Storage State Architecture
Playwright captures authenticated session state (`localStorage`, `sessionStorage`, and cookies) and writes it to a JSON snapshot (`.auth/*.json`).

1. **Setup Project**: Run once before tests (`auth.setup.ts`), producing:
   - `.auth/admin.json`
   - `.auth/trainer.json`
   - `.auth/learner.json`
2. **Pre-authenticated Fixtures**:
   Tests consume `adminPage` or `trainerPage` and arrive immediately at target routes already authenticated.

---

## 3. Hybrid API/UI Testing Strategy

### 3.1 Fast Setup via API, User Validation via UI
Don't use the browser UI to set up test prerequisites:
```
[Bad Pattern]: Navigate to Form -> Fill 15 Fields -> Submit -> Navigate to Target -> Assert
  -> Duration: 4,500ms. Fragility points: 12.

[Enterprise Pattern]: POST /api/courses -> Navigate directly to Target -> Assert
  -> Duration: 350ms. Fragility points: 2.
```

### 3.2 Action via UI, Audit via API
When testing complex user flows (such as order checkout), verify the user feedback in the UI, then use `APIRequestContext` to assert that backend database records, audit trails, and status machines transitioned accurately.

---

## 4. Page Object Model (POM) Design Patterns

### 4.1 When to Use POMs
- **Use POMs**: For complex, multi-page business flows (e.g. Enrollment Wizard, User Administration) where locators and workflows are shared across multiple test files.
- **Avoid POMs**: For isolated single-purpose component tests (e.g. testing an isolated button defect in `locators.spec.ts`).

### 4.2 Best Practices for Modern POMs
- **Action-Oriented Methods**: Return domain results or void, not raw locators (`await wizard.submitOrder()` instead of `wizard.getSubmitBtn().click()`).
- **Encapsulate Selectors**: Never expose CSS or raw selector strings outside the POM class.
- **Inject Page**: Pass the Playwright `Page` into the constructor; avoid global page singletons.

---

## 5. Diagnostic Triage & Flakiness Eradication

### 5.1 Root Causes of Test Flakiness
1. **Arbitrary Sleeps (`page.waitForTimeout`)**: Never use hardcoded sleeps. They are either too short (causing flaky timeouts under CI load) or too long (slowing down the suite). Use condition-based waiting (`expect(locator).toBeVisible()`, `page.waitForResponse()`).
2. **`click({ force: true })`**: Bypasses hit-testing and actionability checks, hiding overlay bugs.
3. **Shared Mutable Data**: Two parallel workers editing the same record. Always prefix entity names with unique timestamps or worker namespaces.
4. **Volatile Dynamic Data in Snapshots**: Randomized transaction IDs and live clocks causing visual snapshot mismatches. Always apply `mask: [locator1, locator2]`.
5. **CSS Animation Drift**: Freezing animations via `animations: 'disabled'` guarantees consistent pixel capture.

### 5.2 Failure Triage Playbook
When a test fails in CI:
1. Open the **Playwright Trace Viewer** from the failure artifact (`npx playwright show-trace <trace.zip>`).
2. Examine the filmstrip to observe exact DOM state at the millisecond of failure.
3. Check the **Actionability Log** (was the element detached? covered? disabled?).
4. Inspect the **Console** and **Network** tabs for unexpected 500 errors or failed API calls.

---

## 6. Execution Commands

### Local Windows PowerShell
```powershell
# Run all tests across desktop and mobile engines
pnpm run test:e2e

# Run only high-priority smoke tests
pnpm run test:e2e:smoke

# Run Chromium suite with interactive UI mode
pnpm run test:e2e:ui

# Run specific cross-browser engine
pnpm run test:e2e:firefox
pnpm run test:e2e:webkit
pnpm run test:e2e:mobile

# View detailed HTML test report
pnpm exec playwright show-report
```

### Continuous Integration (Linux)
```bash
# Clean reproducible install
pnpm install --frozen-lockfile

# Install browser binaries with Linux OS dependencies
pnpm exec playwright install --with-deps chromium firefox webkit

# Execute complete test matrix with retry diagnostics
pnpm run test:e2e
```
