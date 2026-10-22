# Playwright Industrial Lab (PIL)

A comprehensive, local-first enterprise testing workbench designed for in-depth, scenario-based Playwright test automation with TypeScript.

Built to run locally on Windows without Docker, third-party demo dependencies, or cloud services.

---

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 with custom tokens (Orange-on-white Light Theme and Orange-on-near-black Dark Theme)
- **Icons**: Lucide React (`lucide-react`)
- **Backend API**: Node.js + Express + TypeScript with structured error models
- **Test Automation**: Playwright Test v1.52 with web-first assertions, trace viewer, and video recording
- **Continuous Integration**: GitHub Actions automated pipeline

---

## Quick Start (Windows)

### 1. Prerequisites
- Node.js 20 or newer
- npm v10+

### 2. Installation
```powershell
# Clone or navigate to the repository
cd C:\Users\Qsp\Desktop\playwright-learn-website

# (Optional) Copy environment defaults
copy .env.example .env

# Install monorepo dependencies
npm install

# Install Playwright Chromium browser
npx playwright install chromium
```

### 3. Development Server
```powershell
npm run dev
```
Starts both backend (`http://127.0.0.1:3001`) and frontend (`http://127.0.0.1:5173`) concurrently.
Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

---

## Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Starts Express API and Vite web dev servers concurrently |
| `npm run build` | Compiles `@pil/shared`, `@pil/api`, and `@pil/web` production bundles |
| `npm run typecheck` | Runs strict TypeScript verification across all workspaces |
| `npm run lint` | Runs ESLint 9 flat-config across the monorepo |
| `npm run test:e2e` | Executes the complete Playwright test suite (71 tests) |
| `npx playwright test --grep @smoke` | Runs only critical smoke tests |
| `npx playwright show-report` | Opens the interactive HTML test execution report |

---

## Practice Labs & Scenarios

### 1. Locator Gym (`/lab/locators`)
- Practice modern, accessible locators: `getByRole`, `getByLabel`, `getByPlaceholder`, `getByTitle`, `getByAltText`, and `getByTestId`.
- Nested row filtering (`filter({ hasText: ... })`) without fragile index-based selectors.
- Strict-mode compliance with duplicate or visually hidden controls.
- Isolated anti-pattern training on broken label-input associations.

### 2. Intake Form Lab (`/lab/forms`)
- Form interaction with field-level validation, seat count bounds, date picker, and track selector.
- Express backend submission (`POST /api/lab/forms/intake`) returning accepted reference ID.
- Structured HTTP 422 Unprocessable Entity error feedback.
- Accessible error announcements and keyboard tab navigation.

### 3. Advanced Widgets Lab (`/lab/widgets`)
- **Modals & Dialogs**: Accessible modal dialog (`role="dialog"`), Escape key dismissal, and native browser dialogs (`window.alert`, `window.confirm`, `window.prompt`) with `page.on('dialog')`.
- **Tabs**: Tablist with active indicator and keyboard left/right arrow switching.
- **Accordion**: Expand/collapse panels with ARIA `aria-expanded` and `aria-controls`.
- **Data Grid**: Multi-row selection, ascending/descending column sorting, and pagination.
- **Toasts**: Auto-dismissing transient toast notifications.
- **Shadow DOM**: Web component with open Shadow DOM pierced cleanly with standard Playwright locators.

### 4. Scenario Controls & Network Lab (`/lab/network`)
- **Scenario Controls Panel**: Configurable simulated latency (0ms, 800ms, 2500ms), status code overrides (400, 401, 403, 404, 429, 500), and empty state flags.
- **Asynchronous Auto-Waiting**: Validates Playwright's automatic waiting for delayed backend responses.
- **Optimistic UI Updates**: List item updates immediately and rolls back cleanly on simulated HTTP 500 server failure.
- **Network Interception Sandbox**: Target endpoint specifically designed for practicing `page.route()`, `route.fulfill()`, and `route.abort()`.
- Reset endpoint: `POST /api/lab/network/reset`.

### 5. Enterprise Course Catalogue & RBAC (`/app/courses`)
- Course search by keywords and filter by category buttons (`Basics`, `Core`, `Network`, `DevOps`, `Security`).
- Role-based permissions:
  - **Learner**: Read-only view and enrollment access.
  - **Trainer**: Can create and edit courses.
  - **Admin**: Can create, edit, and delete courses with confirmation modal.
- Reset endpoint: `POST /api/app/enrollments/reset`.

### 6. Multi-Step Enrollment Wizard (`/app/enrollments`)
- **Step 1: Course & Seats**: Course selector with preselection support and dynamic seat counter (1-10) with automatic total price calculation.
- **Step 2: Participant Details**: Contact name and email validation.
- **Step 3: Review & Confirm**: Order summary breakdown, terms checkbox, and order placement.
- **Confirmation Screen**: Order reference reference ID (`enr_xxx`).
- **Order Management Table**: Status transition workflows (`Pending` $\rightarrow$ `Approved` / `Cancelled`) for trainers and administrators.

### 7. Authentication & Role Sessions (`/login`)
- Role-based authentication using seeded demo credentials:
  - **Learner**: `learner@pil.local` / `Learner123!`
  - **Trainer**: `trainer@pil.local` / `Trainer123!`
  - **Admin**: `admin@pil.local` / `Admin123!`
- Quick-fill demo persona buttons for immediate testing.
- Session persistence in `localStorage` (`pil-auth-token`, `pil-auth-profile`) for practicing Playwright `storageState`.

### 8. Flaky Lab & File Operations (`/lab/flaky`)
- **File Upload**: File input supporting `.csv`, `.json`, and `.txt` with size/type validation and `setInputFiles` practice.
- **File Download**: Dynamic CSV report export via `page.waitForEvent('download')`.
- **Delayed Actionability**: Execution button disabled for 1.2s to verify Playwright's automatic actionability auto-waiting without manual timeouts.
- **Dynamic Element Replacement**: DOM node unmounting and remounting to demonstrate locator resilience over stale element references.
- **Floating Interceptor Banner**: Non-modal overlay testing resilient handling of unexpected obstruction layers.
- **Intermittent Failure Simulator**: Unstable mode toggle with simulated 503 errors and retry recovery.

### 9. Visual Regression & Snapshot Testing (`/lab/visual`)
- **Deterministic Component Snapshots**: Practice pixel-perfect assertions using `expect(locator).toHaveScreenshot('stable-card.png')`.
- **Dynamic Data Masking**: Dynamic timestamps and randomized transaction IDs masked with `mask: [locator1, locator2]` to prevent diff flakiness.
- **CSS Animation Freezing**: Freezes keyframe spins and pulses using Playwright's `animations: "disabled"` option.
- **Visual Drift & Diff Detection**: Interactive simulator toggling layout shifts and border color modifications to observe diff highlights and pixel mismatch counts.

### 10. Accessibility Audit Lab (`/lab/a11y`)
- **Automated WCAG 2.1 AA Audits**: Powered by `@axe-core/playwright` (`new AxeBuilder({ page })`).
- **Accessible Reference Panel**: Guaranteed zero-violation control panel validating full WCAG 2.1 AA compliance.
- **Isolated Defect Analysis**: Sandbox containing intentional accessibility defects for training:
  - Color contrast violations (< 4.5:1 ratio).
  - Missing accessible names on icon buttons.
  - Broken `label`-to-`input` associations (`htmlFor` / `id` mismatch).
- **Remediation Toggle**: In-place fix demonstration turning failing states into compliant controls.

---

## Design System & Theme Engine

- **Light Mode**: Orange (`#ea580c` / `#f97316`) primary accent on crisp white and light-neutral surfaces.
- **Dark Mode**: Orange primary accent on near-black (`#0a0a0a` / `#171717`) surfaces.
- **Persistence**: Persisted across browser sessions in `localStorage` key `pil-theme`. Respects `prefers-color-scheme` on first visit.
- **Reduced Motion**: Respects `prefers-reduced-motion: reduce` by collapsing transitions and animations.

---

## Automated Test Coverage & Cross-Browser Matrix

The repository features comprehensive end-to-end testing running in parallel across **Chromium**, **Firefox**, and **WebKit**:

- **Total Test Cases**: **81 tests** across 12 distinct test suites (**243 cross-browser executions**).
- **Smoke Suite**: 10 high-priority tests tagged `@smoke` verified across all 3 browser engines (30 passing executions).
- **Accessibility Suite**: Full WCAG 2.1 AA scanning with `@axe-core/playwright`.
- **Visual Snapshot Suite**: Golden baseline screenshots generated and validated across Chromium, Firefox, and WebKit on Windows.

```text
Test Suites:
  ✓ e2e/a11y.spec.ts (4 tests)
  ✓ e2e/auth.spec.ts (5 tests)
  ✓ e2e/catalogue.spec.ts (7 tests)
  ✓ e2e/flaky.spec.ts (8 tests)
  ✓ e2e/forms.spec.ts (7 tests)
  ✓ e2e/locators.spec.ts (6 tests)
  ✓ e2e/network.spec.ts (11 tests)
  ✓ e2e/smoke.spec.ts (3 tests)
  ✓ e2e/theme.spec.ts (4 tests)
  ✓ e2e/visual.spec.ts (6 tests)
  ✓ e2e/widgets.spec.ts (14 tests)
  ✓ e2e/workflows.spec.ts (8 tests)
```

Refer to [`docs/traceability.md`](file:///c:/Users/Qsp/Desktop/playwright-learn-website/docs/traceability.md) for the complete feature-to-test traceability matrix.
