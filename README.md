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
- pnpm v10+ (or v9+)

### 2. Installation
```powershell
# Clone or navigate to the repository
cd C:\Users\Qsp\Desktop\playwright-learn-website

# (Optional) Copy environment defaults
copy .env.example .env

# Install monorepo dependencies
pnpm install

# Install Playwright Chromium browser
pnpm exec playwright install chromium
```

### 3. Development Server
```powershell
pnpm run dev
```
Starts both backend (`http://127.0.0.1:3001`) and frontend (`http://127.0.0.1:5173`) concurrently.
Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

---

## Available Commands

| Command | Description |
|---|---|
| `pnpm run dev` | Starts Express API and Vite web dev servers concurrently |
| `pnpm run build` | Compiles `@pil/shared`, `@pil/api`, and `@pil/web` production bundles |
| `pnpm run typecheck` | Runs strict TypeScript verification across all workspaces |
| `pnpm run lint` | Runs ESLint 9 flat-config across the monorepo |
| `pnpm run test:e2e` | Executes the complete cross-browser matrix and device test suites |
| `pnpm run test:e2e:smoke` | Runs high-priority smoke tests (`@smoke`) in under 45s |
| `pnpm run test:e2e:chrome` | Runs test suites exclusively on Chromium |
| `pnpm run test:e2e:firefox` | Runs test suites on Mozilla Firefox |
| `pnpm run test:e2e:webkit` | Runs test suites on Apple WebKit (Safari engine) |
| `pnpm run test:e2e:mobile` | Runs mobile viewport responsive tests (Pixel 7 emulation) |
| `pnpm run test:e2e:ui` | Launches Playwright's interactive visual UI runner |
| `pnpm exec playwright show-report` | Opens the interactive HTML test execution report |

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

### 13. Performance & Core Web Vitals Lab (`/lab/perf`)
- **CDP Telemetry Integration**: Access Chrome DevTools Protocol (`page.context().newCDPSession(page)`) to capture low-level heap memory usage, JS event counts, and `Performance.getMetrics`.
- **Core Web Vitals Telemetry**: Live extraction of `PerformanceNavigationTiming` metrics (TTFB, DOMContentLoaded, Load Duration) and Web Vitals (LCP, FID, CLS).
- **Controlled Synthetic Stress**: Trigger client-side CPU spin-loops and DOM-thrashing loops to simulate resource saturation under high test concurrency.
- **Automated Performance Assertions**: Real-time diagnostic threshold badges asserting memory leaks, timing violations, and UI frame drops.

### 14. Practice Login Lab (`/practice/login`)
- **Standalone Authentication Showcase**: Dedicated portal modeling enterprise login workflows independent of main app session state.
- **Field & Password Controls**: Real-time client/server validation and show/hide password toggle.
- **Cookie-Based Session Management**: Authenticated dashboard (`/practice/dashboard`) protected by `pil-session` cookie, user profile inspection, and session timeout simulation.
- **Self-Service Password Recovery**: Complete flow with `/practice/forgot-password` and `/practice/reset-password` token validation.
- **Session Invalidation**: Clean logout handling with cookie clearing and unauthenticated redirection.

### 15. WebAssembly Sandbox (`/lab/wasm`)
- **Direct Bytecode Execution**: Compiles and instantiates an embedded 81-byte `wasm32` binary module exporting `fib(n)`, `trap()`, and `WebAssembly.Memory`.
- **Linear Memory Inspection**: Visualizes low-level WebAssembly memory pages (64KB chunks), supports byte read/write, and dynamic buffer growth.
- **Comparative Benchmarking**: In-browser side-by-side performance benchmarking comparing recursive JavaScript execution vs native WebAssembly.
- **Runtime Trap Handling**: Intentional unreachable opcode execution asserting `WebAssembly.RuntimeError` capture and recovery.

### 16. OpenAPI 3.1 Explorer (`/api/docs`) & Learner Mastery Tracker (`/`)
- **Interactive Documentation Explorer**: Zero-dependency Swagger-style API explorer serving complete OpenAPI 3.1.0 specifications (`/api/docs/openapi.json`).
- **Live "Try It Out" Testing**: Execute live requests against all backend routes directly in browser or with Playwright `request.get()`.
- **Persistent Learner Mastery Tracker**: Comprehensive curriculum progress bar and scenario checklist persisted in `localStorage` (`pil-progress`) with atomic completion toggles and one-click reset.

---

## Design System & Theme Engine

- **Light Mode**: Orange (`#ea580c` / `#f97316`) primary accent on crisp white and light-neutral surfaces.
- **Dark Mode**: Orange primary accent on near-black (`#0a0a0a` / `#171717`) surfaces.
- **Persistence**: Persisted across browser sessions in `localStorage` key `pil-theme`. Respects `prefers-color-scheme` on first visit.
- **Reduced Motion**: Respects `prefers-reduced-motion: reduce` by collapsing transitions and animations.

---

## Documentation & Playbooks

- **[Interactive OpenAPI 3.1.0 Explorer](http://127.0.0.1:3001/api/docs)**: Live API documentation and interactive test runner.
- **[Writing Industrial Playwright Tests (10-Year SDET Guide)](docs/staff-sdet-playwright-guide.md)**: Staff SDET mindset, the 5 immutable laws, architectural patterns, and anti-pattern code review checklists.
- **[Windows Setup & Operations Runbook](docs/windows-setup-runbook.md)**: Local Windows installation, port allocation, and troubleshooting without Docker.
- **[10-Day Industrial Curriculum Guide](docs/curriculum-exercises.md)**: Structured learning challenge mapping routes, exercises, and Senior/Staff SDET interview trade-offs.
- **[Enterprise Test Engineering Playbook](docs/enterprise-test-playbook.md)**: Senior SDET guidelines on fixtures, storage state, POM architecture, and CI sharding.
- **[Feature Traceability Matrix](docs/traceability.md)**: Complete feature-to-test verification audit.

---

## Automated Test Coverage & Cross-Browser Matrix

The repository features comprehensive end-to-end testing running in parallel across **Chromium**, **Firefox**, **WebKit**, and **Mobile Chrome**:

- **Total Test Cases**: **174 distinct tests** across 27 spec files (**529 cross-browser executions**).
- **Smoke Suite**: **67 critical smoke tests** (`@smoke`) passing across Desktop Chromium, Desktop Firefox, Desktop WebKit, and Mobile Chrome (`Pixel 7`).
- **Parallel Regression**: 100% tests passing in under 3 minutes with zero cross-worker crosstalk.
- **Accessibility Suite**: Full WCAG 2.1 AA automated auditing with `@axe-core/playwright`.
- **Visual Snapshot Suite**: Golden baseline screenshots generated and validated with dynamic timestamp masking and frozen CSS animations.

```text
Active Test Suites (27 Spec Files):
  ✓ e2e/a11y.spec.ts
  ✓ e2e/api-docs.spec.ts
  ✓ e2e/auth.setup.ts
  ✓ e2e/auth.spec.ts
  ✓ e2e/browser.spec.ts
  ✓ e2e/catalogue.spec.ts
  ✓ e2e/custom-matchers.spec.ts
  ✓ e2e/fixtures.spec.ts
  ✓ e2e/flaky.spec.ts
  ✓ e2e/forms.spec.ts
  ✓ e2e/hybrid-api-ui.spec.ts
  ✓ e2e/learning-modes.spec.ts
  ✓ e2e/locators.spec.ts
  ✓ e2e/multi-context.spec.ts
  ✓ e2e/network.spec.ts
  ✓ e2e/perf.spec.ts
  ✓ e2e/pom-workflows.spec.ts
  ✓ e2e/practice-login.spec.ts
  ✓ e2e/responsive.spec.ts
  ✓ e2e/smoke.spec.ts
  ✓ e2e/storage-state.spec.ts
  ✓ e2e/theme.spec.ts
  ✓ e2e/users.spec.ts
  ✓ e2e/visual.spec.ts
  ✓ e2e/wasm.spec.ts
  ✓ e2e/widgets.spec.ts
  ✓ e2e/workflows.spec.ts
```
