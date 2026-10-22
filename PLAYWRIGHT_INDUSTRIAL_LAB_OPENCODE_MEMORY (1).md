# OpenCode Memory: Playwright Industrial Practice Lab

**File purpose:** Persistent project brief for OpenCode. Read this file
before planning or changing the repository.

## 1. Mission

Build a self-contained, realistic, industrial-style web application
dedicated to learning and practising Playwright with TypeScript. The
user must be able to practise nearly all important Playwright
browser-automation patterns against this application itself, without
depending on third-party demo websites.

The application is a **testing playground**, not merely a tutorial page.
It must intentionally include both good and problematic UI patterns,
predictable test scenarios, realistic workflows, API endpoints, and
configurable failure conditions so the learner can write, run, debug,
and explain tests at a senior-engineer level.

Working title: **Playwright Industrial Lab**.

## 2. Non-negotiable OpenCode workflow

1.  Start in **Plan Mode**.
2.  Inspect the existing repository before proposing changes: structure,
    package manager, framework, scripts, docs, configuration, tests, CI,
    environment files, and current git status.
3.  Do not overwrite or delete existing work without explaining why.
4.  Do not implement, install packages, migrate data, or modify
    application files during the initial planning phase.
5.  Create or propose a detailed implementation plan, architecture,
    feature matrix, test strategy, milestones, risks, and acceptance
    criteria.
6.  Stop and report the plan for user review.
7.  **Do not switch to Build Mode or implement until the user explicitly
    approves the plan.**
8.  Preserve existing conventions and work on a feature branch if
    repository changes are later approved. Never make assumptions about
    the default branch or make destructive Git operations.
9.  If the repository already has a compatible application, extend it
    rather than replacing it.
10. Keep this file as the project source of truth; update it only when
    the user approves a change in scope.

## 3. Product goals

-   Provide realistic, reusable Playwright exercises from beginner
    through senior/architect level.
-   Cover UI, browser, API, authentication, network, accessibility,
    visual checks, test data, debugging, parallelism, and CI workflows.
-   Include a dedicated **Scenario Controls** area to configure delays,
    errors, empty states, loading states, and deterministic edge cases.
-   Keep all learning examples and test targets inside this application.
    Avoid relying on external demo sites or live third-party services.
-   Make scenarios deterministic and safe to reset so tests do not
    depend on execution order.
-   Use accessible markup for the good examples and clearly label
    intentionally broken/anti-pattern examples for practice.
-   Provide realistic business flows in addition to isolated component
    demos.
-   Support local development on a Windows laptop without requiring
    Docker. Docker may be documented as optional, never mandatory.
-   Do not add Keycloak. Do not require Cloudflare. Prefer a
    straightforward local-first setup.
-   Use TypeScript throughout where applicable.

## 4. Recommended architecture (confirm against the existing repository first)

Preferred baseline if the repository has no established stack: -
Frontend: React + TypeScript + Vite. - Styling: use the repository's
existing styling system; if none exists, choose a simple maintainable
option and explain the choice. - Backend: Node.js + TypeScript +
Express, unless an existing backend is already suitable. - Persistence:
start with a local, low-friction database or deterministic
in-memory/test repository. Select based on repository constraints and
explain trade-offs. Do not introduce Supabase or other hosted
dependencies unless explicitly approved. - API documentation:
Swagger/OpenAPI if appropriate. - Automation: Playwright Test with
TypeScript. - CI: GitHub Actions, with a reliable
install/build/test/report flow. - Testing tools and browsers must be
pinned or managed consistently through package scripts and lockfiles. -
Keep frontend, backend, and Playwright tests organized clearly. A
monorepo is acceptable if it fits the existing repository. - Provide
seed/reset utilities and stable test IDs only where semantic locators
are unsuitable.

## 5. Main application areas and feature inventory

### A. Lab home and learning dashboard

-   Feature catalogue grouped by Playwright topic.
-   Scenario cards with difficulty, prerequisites, expected skills, and
    completion state.
-   Search/filter by feature, complexity, UI/API, and challenge type.
-   A local progress tracker is optional; it must not block the core
    lab.
-   Each scenario should state the goal, relevant route, expected
    behavior, edge cases, and suggested assertions.
-   Include a "challenge mode" where the learner receives requirements
    without being shown the solution first.

### B. Semantic locators and accessible forms

Provide a form playground containing: - Correctly associated `<label>`
and input pairs. - Labels with missing or incorrect `for`/`id`
associations (intentional anti-pattern). - Inputs with accessible names
from labels, placeholders, `aria-label`, and `aria-labelledby`. - Text,
email, password, number, search, URL, telephone, date, time, date-time,
checkbox, radio, range, color, and hidden inputs where relevant. -
Required, optional, disabled, readonly, invalid, and conditionally
visible fields. - Native select, multi-select, custom combobox,
autocomplete, listbox, and searchable dropdown. - Validation errors,
inline help text, success messages, and server-side validation
failures. - Multi-step wizard, dependent fields, conditional sections,
unsaved-changes warning, and reset. - Submit/loading/success/failure
states, double-submit protection, and delayed responses. - Keyboard-only
form use and focus management. - Buttons with accessible names and
examples with ambiguous duplicate names. - Good examples and explicitly
marked bad examples for locator robustness.

### C. Locator challenge gallery

-   Role/name, label, placeholder, text, alt text, title, test ID, CSS,
    and XPath examples.
-   Nested locator and filter examples.
-   Duplicate text/buttons, strict-mode violations, hidden duplicates,
    dynamic IDs, and unstable class names.
-   `has`, `hasText`, `filter`, `nth`, `first`, and `last` cases with
    explanations of trade-offs.
-   Locator count and visibility challenges.
-   Dynamic lists with stable and unstable identifiers.
-   A challenge route where the learner must choose the most robust
    locator.

### D. Interactive widgets

-   Buttons, links, toggle switches, checkboxes, radio groups, menus,
    nested menus, tabs, accordions, tooltips, popovers, and toasts.
-   Modal dialogs, confirmation dialogs, alert/confirm/prompt, and focus
    trapping.
-   Drag-and-drop board, sortable list, and upload dropzone.
-   Hover menus, delayed tooltips, disabled controls, loading spinners,
    and transient messages.
-   Date picker, time picker, pagination, sorting, filtering, and table
    selection.
-   Rich text/contenteditable example.
-   SVG chart and canvas example, with accessible alternatives where
    appropriate.
-   Shadow DOM component with open shadow root.
-   Keyboard shortcuts and full keyboard navigation.

### E. Browser and navigation scenarios

-   Multiple routes, nested routes, navigation menus, breadcrumbs,
    redirects, and not-found page.
-   New tab, popup window, external-link simulation within the same app,
    and window close behavior.
-   Same-origin iframe and nested iframe examples where feasible.
-   Downloadable files and file-upload workflows.
-   Browser permission scenarios where supported.
-   Local storage, session storage, cookies, and session expiry
    demonstrations.
-   `beforeunload`/unsaved changes scenario.
-   Responsive layout at mobile, tablet, and desktop sizes.
-   Console errors and page errors available in intentionally failing
    scenarios.

### F. Realistic business workflows

Build a small but coherent mock enterprise application with sample
entities: - Authentication and role-based access: learner, trainer, and
admin. - Dashboard with summary cards and recent activity. -
User/employee management: search, filter, sort, pagination, create,
view, edit, deactivate, and delete with confirmation. - Product/catalog
or course catalogue with detail pages. - Shopping cart or enrollment
flow with totals, validation, and confirmation. - Orders/enrollments
with status transitions and history. - Admin-only screens and protected
routes. - Notifications, activity feed, and profile/settings. - A
multi-step workflow that spans UI and API, with test data
setup/cleanup. - Seeded demo users and data documented clearly; no real
personal data.

Choose a compact domain model rather than implementing every possible
business feature. The purpose is rich test coverage, not a production
commerce product.

### G. Network and asynchronous behavior lab

Provide controls and endpoints for: - Configurable response latency (for
example, fast, slow, and very slow). - Loading, success, empty, 400,
401, 403, 404, 409, 422, 429, and 500 responses. - Network timeout and
simulated connection failure. - Delayed search suggestions and
autocomplete races. - Out-of-order responses to teach race conditions
and stale data. - Retryable request failures and bounded retry
behavior. - Pagination and infinite-scroll APIs. - Optimistic updates
with rollback on failure. - Request cancellation and debounced search. -
Mockable API responses and deterministic network interception
examples. - Clear reset to default behavior. - No real calls to
third-party APIs.

### H. API testing surface

Expose documented REST endpoints appropriate to the chosen domain: -
Health/readiness endpoint. - Authentication/session endpoints. - CRUD
endpoints for the selected entities. - Search, sorting, pagination, and
filtering. - Validation and structured error responses. -
Role/permission enforcement. - Deliberate test endpoints for known
status codes and delay simulation. - Test-data seed/reset endpoints
protected for local/test environments only. - Predictable response
schemas and unique IDs. - OpenAPI/Swagger docs if compatible with the
chosen backend. - Tests for status, headers, schema/shape, body, error
cases, and UI/API integration.

### I. Authentication and security testing

-   Login/logout, invalid credentials, locked/disabled user, and session
    expiry.
-   Role-based access and authorization failures.
-   Storage-state setup and reuse patterns.
-   Cookie/session behavior and protected routes.
-   Safe secret handling through environment variables; never commit
    real secrets.
-   CSRF/security headers or input-sanitization examples where
    appropriate to the selected stack.
-   A documented local-only test account strategy.
-   Never store plaintext real credentials or expose unsafe admin/reset
    endpoints in production builds.

### J. Tables, data-heavy screens, and dynamic content

-   Data grid with sorting, filtering, pagination, row selection, and
    bulk actions.
-   Empty, loading, error, and populated states.
-   Virtualized list/table if feasible, with documented test strategy.
-   Infinite scrolling and lazy-loaded content.
-   Dynamic status badges and timestamps with stable test data.
-   Table assertions by row name/column and accessible semantics.
-   Search debounce and asynchronous result updates.

### K. File and media scenarios

-   Upload valid/invalid file types, oversized files, multiple files,
    and upload progress.
-   Download CSV or sample report and validate its name/content.
-   Image preview and file removal.
-   File upload errors and retry.
-   Avoid large media assets and external network dependencies.

### L. Accessibility and visual testing

-   Semantic HTML and keyboard interaction.
-   Focus order, visible focus, accessible names, ARIA state, and common
    form accessibility errors.
-   Optional axe-core integration if approved and compatible.
-   Screenshot comparison / visual regression examples with stable
    viewports and controlled data.
-   Explain visual-test flakiness from fonts, animations, timestamps,
    and environment differences.
-   Include intentional accessibility defects in isolated practice
    routes, clearly marked as training-only.

### M. Test runner, debugging, and CI learning

-   Playwright config for baseURL, projects, retries, workers, reporter,
    timeouts, trace, screenshot, and video policies.
-   Chromium, Firefox, and WebKit projects if machine/time permits; make
    cross-browser coverage configurable.
-   Tags/grep for smoke, regression, API, and slow suites.
-   Fixtures, hooks, custom matchers where justified, and Page Object
    Model examples with trade-offs.
-   Test data factories, unique test data, setup/teardown, and cleanup.
-   Trace viewer workflow, HTML reports, screenshots, videos,
    console/network logging.
-   Parallelism, test sharding, worker-scoped versus test-scoped
    fixtures.
-   CI workflow with dependency caching where safe, browser
    installation, build/startup, test execution, and report artifacts.
-   Flaky-test diagnostics and prevention; do not use retries to conceal
    defects.
-   Test selection by risk/critical path and an example smoke suite.

### N. Intentionally difficult and anti-pattern scenarios

Include isolated scenarios for: - Missing label-input association. -
Duplicate accessible names and strict locator errors. - Stale UI and
race conditions. - Arbitrary sleeps versus condition-based waits. -
Tests dependent on previous test state. - Shared mutable test data
causing parallel failures. - Hidden element versus visible duplicate. -
Delayed navigation, detached DOM nodes, and rerendering. - API error
without UI feedback. - Broken keyboard accessibility. - Unstable
selectors. - Unexpected popup/dialog. - Timezone/date-boundary problems
using deterministic fixtures. - Animation and screenshot instability. -
Console errors and failed network requests. Every intentional defect
must be documented, isolated, reproducible, and resettable. Do not make
the whole app randomly unreliable.

## 6. Playwright concepts the learner must be able to demonstrate

Map at least one local scenario and one test example to each topic: -
`test`, `expect`, hooks, fixtures, annotations, tags, retries,
timeouts. - `Browser`, `BrowserContext`, `Page`, and locator model. -
Role/label/placeholder/text/test-id locators and locator composition. -
Auto-waiting, actionability, web-first assertions, and strictness. -
Navigation, popups, tabs, frames, dialogs, downloads, uploads,
permissions. - Authentication state, cookies, local/session storage. -
APIRequestContext and API/UI combined testing. - `page.route`,
`route.fulfill`, `route.continue`, and network waiting. - Test
isolation, deterministic data, cleanup, parallel workers, sharding. -
Traces, screenshots, video, HTML report, debugging. - Projects,
cross-browser configuration, CI, and environment configuration. -
Accessibility and visual testing where included. - Reliable waiting for
a specific response or UI state without arbitrary sleeps.

## 7. Non-functional requirements

-   Consistent TypeScript types and lint/format/build scripts.
-   Clear error messages and predictable API error shapes.
-   Responsive and keyboard-usable UI.
-   No hardcoded fake success where the scenario claims to test backend
    behavior.
-   Avoid flaky randomness; use explicit scenario configuration and
    seeded data.
-   No production credentials, personal data, or exposed destructive
    test controls.
-   Add unit/integration tests for critical backend behavior where
    proportionate.
-   Keep setup simple, with clear Windows-friendly instructions.
-   Provide `.env.example` without secrets.
-   Document exact install, run, seed, reset, test, report, and CI
    commands.
-   Use maintained dependencies and explain significant new
    dependencies.
-   Keep scope achievable: prioritize a coherent, high-quality lab over
    a huge unfinished feature set.

## 8. Suggested milestones

1.  **Repository assessment and plan:** inspect and report; no
    implementation.
2.  **Core shell:** app navigation, scenario catalogue, stable local
    server, health endpoint.
3.  **Core Playwright practice:** locators, forms, widgets, navigation,
    assertions.
4.  **Enterprise workflows:** auth, roles, CRUD, tables, test data,
    APIs.
5.  **Network and async lab:** delays, status codes, race conditions,
    error handling.
6.  **Advanced browser coverage:** popup, iframe, file operations,
    shadow DOM, keyboard.
7.  **Reliability tooling:** traces, reports, parallel execution, CI.
8.  **Final validation:** run build/lint/tests, inspect flaky tests,
    update docs, provide feature-to-test coverage matrix.

The planning agent should adapt milestone order and scope after
inspecting the actual repository.

## 9. Definition of done

The project is considered ready for the first learning release when: -
The user can run the app locally without Docker. - All included
scenarios are accessible through the app's own navigation. - Each
scenario explains its purpose and has deterministic setup/reset
instructions. - There is no required dependency on third-party demo
websites. - Core UI workflows and API endpoints are implemented and
documented. - A Playwright TypeScript suite covers critical happy paths,
validation, errors, auth, and async behavior. - The suite can run
locally with documented commands and produce a useful HTML report and
trace on failure. - Tests can run independently and in parallel for the
supported suite. - CI configuration is documented and usable. - A
feature-to-test matrix identifies covered features and deferred items. -
Any intentionally broken examples are isolated and clearly marked. - The
repository passes its applicable lint, type-check, build, and test
commands.

## 10. First OpenCode prompt

Use **Plan Mode only** with this prompt:

> Read `PLAYWRIGHT_INDUSTRIAL_LAB_OPENCODE_MEMORY.md` completely before
> doing anything. You must remain in Plan Mode. Inspect the existing
> repository structure, package manager, source files, documentation,
> scripts, tests, configuration, environment handling, and git status.
> Do not install dependencies, edit code, create files, run migrations,
> or implement features in this phase. Compare the current repository
> against the goals and feature inventory in the memory file. Produce a
> prioritized, repository-aware plan with: (1) current-state assessment,
> (2) proposed architecture and justified stack decisions, (3) feature
> matrix split into MVP/next phase/later, (4) route and API design, (5)
> Playwright test architecture, (6) implementation milestones and
> acceptance criteria, (7) local Windows setup and commands, (8)
> risks/dependencies/security considerations, (9) files expected to
> change, and (10) validation strategy. Identify scope that cannot
> reasonably fit into the first release and recommend a practical MVP.
> Preserve existing work and conventions. Stop after presenting the plan
> and wait for explicit user approval. Do not switch to Build Mode
> unless the user approves.

## 11. User preferences and constraints

-   The user wants in-depth, scenario-based learning at a
    senior/10-year-experience level.
-   The immediate learning window is a 10-day Playwright challenge, with
    roughly 7--9 hours available daily.
-   The user wants a dedicated website they own and control, containing
    the practice scenarios, instead of relying on other websites.
-   Planning must happen first. The user reviews and explicitly approves
    the plan before implementation.
-   Docker is not available/desired as a prerequisite on the user's
    current laptop.
-   Do not use Keycloak.
-   Do not add Cloudflare initially.
-   Prefer local-first development and avoid unnecessary hosted-service
    dependencies.
-   Explain architecture decisions and trade-offs, not just code.


## 12. User-approved technology stack and design requirements

These are explicit user requirements and take precedence over optional stack suggestions elsewhere in this file. During Plan Mode, inspect the repository and propose the best compatible implementation using this stack. Do not implement until the user approves the plan.

### Required technology stack
- **Frontend:** React.js with TypeScript.
- **Build tooling:** Vite unless the existing repository has a compelling compatible setup.
- **Styling:** Tailwind CSS.
- **Backend/API:** Node.js with Express.js and TypeScript where practical.
- **Icons:** Lucide icons (prefer `lucide-react` for React).
- **Automation:** Playwright Test with TypeScript.
- **Theme support:** Fully working light and dark modes with a persistent user preference.
- **API integration:** The React UI must use the Express API for features that claim to be backend-backed. Do not simulate successful server operations solely in frontend state.
- **Local-first:** Must run locally on Windows without Docker and without mandatory hosted services.

### Required visual direction
Build a modern, polished, responsive developer/QA product—not a generic starter template.

- **Light theme:** Orange as the primary accent, white/light backgrounds, clear neutral surfaces, readable dark text.
- **Dark theme:** Orange as the primary accent, near-black/dark backgrounds and surfaces, readable light text.
- Define consistent design tokens for backgrounds, surfaces, text, borders, focus rings, success/warning/error states, and orange accents.
- Theme switching must update the entire application consistently, including navigation, forms, tables, modals, charts/widgets, and scenario controls.
- Persist the chosen theme across reloads using an appropriate client-side preference mechanism; respect system preference on first visit if feasible.
- Use Lucide icons consistently, with accessible labels for icon-only controls.
- Include tasteful, purposeful animations and transitions for navigation, dialogs, menus, toasts, loading states, theme changes, and interactive widgets.
- Respect `prefers-reduced-motion`; animation must not make tests flaky or obstruct accessibility.
- Provide polished responsive layouts for desktop, tablet, and mobile.
- Use consistent spacing, typography, component states, hover/focus/disabled behavior, empty states, skeleton/loading states, and error feedback.
- Avoid excessive gradients, unnecessary decoration, or animation that reduces clarity.
- Ensure semantic HTML, keyboard usability, visible focus, contrast, and accessible names. The lab should teach accessible patterns as well as intentionally isolated anti-patterns.

### Full functionality and quality expectations
- Treat the feature inventory as an application specification, not a static visual mockup.
- Every visible control must have a real, meaningful action or be clearly marked as intentionally disabled/not yet available.
- Forms must validate input and display success/error states.
- CRUD operations must work through Express endpoints for the selected entities.
- Search, filters, sorting, pagination, authentication/role flows, network scenario controls, and test-data reset should work as documented.
- Implement safe, deterministic seed/reset mechanisms for local/test use; never expose destructive test endpoints in production mode.
- Provide consistent loading, empty, error, and success states.
- Provide an `.env.example`, clear Windows-friendly setup instructions, and documented frontend/backend/test commands.
- Add Playwright tests that verify core workflows, theme switching and persistence, form/locator scenarios, API behavior, authentication, and critical error states.
- Run and report the available type-check, lint, build, API test, and Playwright test commands before calling an implementation milestone complete.
- If the entire feature inventory cannot be delivered in one release, propose a phased MVP that is genuinely functional and clearly identify deferred work. Do not pretend unfinished features are implemented.

### Plan Mode instruction update
When using the First OpenCode prompt in Section 10, also explicitly require:
- React + TypeScript + Vite, Tailwind CSS, Node.js + Express, `lucide-react`, and Playwright Test with TypeScript.
- A shared theme-token strategy and implementation plan for the orange/light and orange/near-black themes.
- Theme preference persistence and reduced-motion support.
- API contracts and which screens use real Express endpoints.
- A polished design system and reusable components.
- A feature-by-feature functional acceptance matrix, including which parts are MVP versus later phases.
- A test plan for light/dark mode, responsive layouts, accessibility, and animations that could otherwise introduce flakiness.
