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
| `npm run test:e2e` | Executes the complete cross-browser matrix and device test suites |
| `npm run test:e2e:smoke` | Runs high-priority smoke tests (`@smoke`) in under 45s |
| `npm run test:e2e:chrome` | Runs test suites exclusively on Chromium |
| `npm run test:e2e:firefox` | Runs test suites on Mozilla Firefox |
| `npm run test:e2e:webkit` | Runs test suites on Apple WebKit (Safari engine) |
| `npm run test:e2e:mobile` | Runs mobile viewport responsive tests (Pixel 7 emulation) |
| `npm run test:e2e:ui` | Launches Playwright's interactive visual UI runner |
| `npx playwright show-report` | Opens the interactive HTML test execution report |

---

## Practice Labs & Scenarios

### 1. Locator Gym (`/lab/locators`)
- Practice modern, accessible locators: `getByRole`, `getByLabel`, `getByPlaceholder`, `getByTitle`, `getByAltText`, and `getByTestId`.
- Nested row filtering (`filter({ hasText: ... })`) without fragile index-based selectors.
- Strict-mode compliance with duplicate or visually hidden controls.
- Isolated anti-pattern training on broken label-input associations.

### 2. Forms Laboratory (`/lab/forms`)
- **Native Input Showcase**: Text, password, number, date, search, checkbox, radio group, range slider, and file input with boundary checks.
- **Accessible Names vs. Anti-patterns**: Compliant `htmlFor`/`id` matching, intentionally unassociated inputs, placeholders, and direct `aria-label` / `aria-labelledby`.
- **Selectors & Comboboxes**: Native `<select>`, multiple select, custom ARIA 1.2 Combobox with keyboard navigation, and debounced autocomplete search.
- **Conditional & Multi-step Wizard**: Account type branching (Individual vs Corporate), 3-step wizard with state retention, and duplicate-submit protection with spinner.

### 3. Advanced Widgets Lab (`/lab/widgets`)
- **Modals & Dialogs**: Accessible modal dialog (`role="dialog"`), Escape key dismissal, and native browser dialogs (`window.alert`, `window.confirm`, `window.prompt`) with `page.on('dialog')`.
- **Menubars & Nested Menus**: Accessible `role="menubar"` with keyboard arrow traversal and nested submenus.
- **Contenteditable Element**: Rich-text editing container with bold/italic formatting and DOM node assertions.
- **SVG & Canvas Graphics**: Interactive SVG bar charts with accessible table alternatives and HTML5 Canvas drawing pad.
- **Tabs & Accordions**: Tablist with active indicator, keyboard navigation, and expand/collapse FAQ panels.
- **Data Grid & Reordering**: Multi-row selection, column sorting, pagination, and HTML5 drag-and-drop task reordering.
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

### 11. Browser & Window Interactions Lab (`/lab/browser`)
- **Multi-Tab & Popups**: Spawning windows via `window.open` and testing with `page.waitForEvent('popup')`.
- **Same-Origin & Nested Iframes**: Chained `page.frameLocator('iframe[title="..."]')` targeting isolated outer and inner frame scopes.
- **Storage & Cookies**: Inspecting and evaluating `localStorage`, `sessionStorage`, and `context.cookies()`.
- **Navigation Guard**: `beforeunload` native leave prompts handled with `page.on('dialog')`.
- **Browser Permissions & Geolocation**: Emulating coordinates with `context.grantPermissions(['geolocation'])` and `context.setGeolocation()`.
- **Responsive Viewport Breakpoints**: Mobile hamburger navigation drawer simulation verified via `page.setViewportSize()`.
- **Keyboard Shortcuts**: Global `Ctrl+K` command search palette modal.

### 12. Enterprise User & Business Management (`/app/users`, `/app/courses/:id`, `/app/profile`)
- **Personnel Directory (`/app/users`)**: Search, role filtering (Learner, Trainer, Admin), status filtering (Active, Inactive), sorting by name/role/department, and server-driven pagination.
- **Role-Based Protection**: 403 Forbidden alert and action suppression for learners; read-only directory inspection for trainers; full administrative CRUD for admins.
- **Modals & Confirmation Workflows**: Accessible "Add User" modal with structured validation, "Edit User" modal, direct status toggling, and non-destructive "Delete Confirmation" dialog.
- **Bulk Action Toolbar**: Floating context bar with multi-row selection to batch activate or deactivate users in one atomic operation.
- **Deep-Linked Course Syllabus (`/app/courses/:id`)**: Detailed curriculum view featuring collapsible syllabus module accordions, instructor profile credentials, prerequisites checkmarks, and "Enroll Now" CTA.
- **Account Settings & Audit Log (`/app/profile`)**: Notification preferences checkboxes (Email updates, SMS alerts, weekly digest) with feedback alerts, and chronological activity audit history.

---

## Design System & Theme Engine

- **Light Mode**: Orange (`#ea580c` / `#f97316`) primary accent on crisp white and light-neutral surfaces.
- **Dark Mode**: Orange primary accent on near-black (`#0a0a0a` / `#171717`) surfaces.
- **Persistence**: Persisted across browser sessions in `localStorage` key `pil-theme`. Respects `prefers-color-scheme` on first visit.
- **Reduced Motion**: Respects `prefers-reduced-motion: reduce` by collapsing transitions and animations.

---

## Automated Test Coverage & Cross-Browser Matrix

The repository features comprehensive end-to-end testing running in parallel across **Chromium**, **Firefox**, and **WebKit**:

- **Total Test Cases**: **99 tests** across 14 distinct test suites (**297 cross-browser executions**).
- **Smoke Suite**: 14 high-priority tests tagged `@smoke` verified across all 3 browser engines (42 passing executions, 100% pass rate).
- **Accessibility Suite**: Full WCAG 2.1 AA scanning with `@axe-core/playwright`.
- **Visual Snapshot Suite**: Golden baseline screenshots generated and validated across Chromium, Firefox, and WebKit on Windows.

```text
Test Suites:
  ✓ e2e/a11y.spec.ts (4 tests)
  ✓ e2e/auth.spec.ts (5 tests)
  ✓ e2e/browser.spec.ts (6 tests)
  ✓ e2e/catalogue.spec.ts (7 tests)
  ✓ e2e/flaky.spec.ts (8 tests)
  ✓ e2e/forms.spec.ts (11 tests)
  ✓ e2e/locators.spec.ts (6 tests)
  ✓ e2e/network.spec.ts (11 tests)
  ✓ e2e/smoke.spec.ts (3 tests)
  ✓ e2e/theme.spec.ts (4 tests)
  ✓ e2e/users.spec.ts (8 tests)
  ✓ e2e/visual.spec.ts (6 tests)
  ✓ e2e/widgets.spec.ts (17 tests)
  ✓ e2e/workflows.spec.ts (8 tests)
```

Refer to [`docs/traceability.md`](file:///c:/Users/Qsp/Desktop/playwright-learn-website/docs/traceability.md) for the complete feature-to-test traceability matrix.
