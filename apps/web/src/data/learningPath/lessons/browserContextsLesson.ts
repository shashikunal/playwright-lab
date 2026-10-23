import type { Lesson } from "../types";

export const browserContextsLesson: Lesson = {
  id: "playwright-browser-contexts",
  moduleSlug: "browser-contexts-and-navigation",
  moduleTitle: "Browser Contexts, Multi-Page & Navigation",
  title: "Browser Contexts, Pages, Tabs, and Navigation — Beginner to Advanced",
  difficulty: "Intermediate",
  durationMinutes: 45,
  prerequisites: [
    "playwright-introduction",
    "configuration-and-browsers",
    "playwright-locators",
    "playwright-assertions",
    "playwright-actions",
    "playwright-forms"
  ],
  summary: "Master Playwright's browser process model, isolated BrowserContext boundaries, multi-page and tab coordination, storageState session caching, frameLocator nesting, and bulletproof navigation lifecycles.",
  sections: [
    {
      id: "browser-architecture-and-hierarchy",
      title: "Part A — Browser Architecture & Object Model",
      content: `Understanding modern web automation requires mastering Playwright's hierarchical object hierarchy: Browser, BrowserContext, Page, and Frame.
      
1. The Four-Tier Object Model:
- Browser (Process Level): A single instance of an actual browser engine process (Chromium, Firefox, or WebKit). Launching a browser process is resource-heavy (takes ~500ms to 2s and consumes considerable RAM and CPU). In @playwright/test, the browser instance is launched once per worker process and shared across multiple tests.
- BrowserContext (Incognito Profile Level): A completely isolated virtual browser profile inside the browser process. It operates with its own private cookies, localStorage, sessionStorage, cache, permissions, and network proxies. Context creation takes single-digit milliseconds (~2ms to 5ms) and consumes negligible overhead.
- Page (Tab/Window Level): A single web page or tab inside a BrowserContext. Multiple pages within the same context share cookies and storage, but maintain independent DOM trees, viewports, and navigation histories.
- Frame (Document Level): An execution context within a Page. Every page has a main frame, and can host nested iframe elements, each with its own window and document object.

2. Built-in Fixtures vs Custom Contexts:
By default, the @playwright/test test runner automatically injects two foundational fixtures into your test function:
- page: A pre-configured Page instance hosted within a freshly minted, pristine BrowserContext.
- context: The BrowserContext fixture containing that page.
When your test needs a single user session, utilizing the built-in 'page' fixture is recommended. When your scenario requires multiple independent users (such as testing an administrator approving a student's enrollment in real time), you invoke 'browser.newContext()' to spawn secondary isolated sessions.`
    },
    {
      id: "browser-contexts-and-isolation",
      title: "Part B — Browser Contexts: Complete Test Isolation",
      content: `The golden rule of enterprise test engineering is absolute test independence. No test may depend on state left behind by a previous test, and tests must be parallel-safe without cross-talk.

1. BrowserContext Isolation Mechanics:
When you call 'const context = await browser.newContext()', Playwright allocates a pristine in-memory profile:
- Zero Cookie Bleed: Cookies set in Context A are completely invisible to Context B.
- Independent Web Storage: LocalStorage and SessionStorage keys are strictly sandboxed per origin and per context.
- Isolated Cache & HTTP Pipelines: Network caches and connection pools remain distinct.
- Custom Permissions & Geolocation: You can grant geolocation or camera permissions to Context A while denying them to Context B.

2. Context Lifecycles & Resource Cleanup:
In manual multi-context scenarios, always explicitly close created contexts in your test or finally block:
\`\`\`typescript
const context = await browser.newContext();
try {
  const page = await context.newPage();
  // perform automation
} finally {
  await context.close(); // Frees memory, closes child pages, and releases file locks
}
\`\`\`
3. The Trap of browser.newPage():
Calling 'browser.newPage()' is a convenience method that creates a hidden, unmanaged BrowserContext containing one page. In test suites, avoid 'browser.newPage()'; instead, explicitly use the 'page' fixture or manage named contexts via 'browser.newContext()' to guarantee deterministic teardown.`
    },
    {
      id: "navigation-lifecycles-and-urls",
      title: "Part C — Navigation Lifecycles, Load States & baseURL",
      content: `Navigation is the foundation of web workflows. Playwright provides declarative navigation primitives that handle modern dynamic Single-Page Application (SPA) state changes.

1. baseURL and Relative Paths:
Configuring 'use: { baseURL: "http://localhost:5173" }' in playwright.config.ts enables clean, portable relative navigation:
\`\`\`typescript
await page.goto("/lab/browser"); // Automatically resolves against baseURL
\`\`\`
Relative paths protect test suites from environment hardcoding, allowing the exact same test to target localhost, pull-request preview environments, staging, or production.

2. Web-First URL Assertions:
Never use synchronous 'if (page.url() === ...)' checks because SPAs transition client-side routing asynchronously. Always use web-first, retrying URL matchers:
\`\`\`typescript
await expect(page).toHaveURL(/.*\\/practice\\/dashboard/);
\`\`\`
Playwright continuously inspects the active URL until it satisfies the string or RegExp pattern or reaches the assertion timeout.

3. Load States: 'load' vs 'domcontentloaded' vs 'networkidle':
When navigating via 'page.goto(url, { waitUntil })', Playwright supports three load states:
- 'load' (Default): Waits until the browser's native 'window.onload' event fires.
- 'domcontentloaded': Waits until the HTML document is fully parsed and DOM tree constructed.
- 'networkidle': Waits until there are no active network connections for at least 500ms.
WARNING on 'networkidle': In modern SPAs with long-polling telemetry, background WebSockets, or live streaming, 'networkidle' frequently times out or causes 500ms artificial stalls. Prefer waiting for specific DOM milestones (e.g. 'await expect(page.getByRole("heading")).toBeVisible()') over arbitrary network idle conditions.`
    },
    {
      id: "pages-tabs-and-popups",
      title: "Part D — Multi-Page Coordination: Tabs, Windows & Popups",
      content: `Applications frequently spawn new browser tabs or popup windows via '<a target="_blank">' links or JavaScript 'window.open()' calls.

1. The Event Listener Race Condition Trap:
The most common beginner mistake is clicking the popup trigger BEFORE registering the event listener:
\`\`\`typescript
// ANTI-PATTERN: Popup may open before listener attaches!
await page.getByTestId("open-popup-btn").click();
const popup = await page.waitForEvent("popup"); // Flaky / hangs!
\`\`\`
2. The Safe Promise.all or Pre-Registration Pattern:
Always register the event promise BEFORE dispatching the trigger action:
\`\`\`typescript
// PRODUCTION PATTERN: Zero race condition
const popupPromise = page.waitForEvent("popup");
await page.getByTestId("open-popup-btn").click();
const popup = await popupPromise;

// Assert inside popup
await expect(popup).toHaveURL(/.*\\/popup-content/);
await expect(popup.getByRole("heading")).toBeVisible();

// Cleanly close popup
await popup.close();
expect(popup.isClosed()).toBe(true);
\`\`\`
3. Tracking Context Pages:
You can inspect all currently open pages inside a context using 'context.pages()'. For popups spawned asynchronously without a direct click on a page, use 'context.waitForEvent("page")'.`
    },
    {
      id: "cookies-and-browser-storage",
      title: "Part E — Cookies, Storage State & Security Best Practices",
      content: `Modern web applications maintain user state across HTTP cookies, localStorage, and sessionStorage.

1. Cookies Inspection and Mutation:
Playwright gives you full direct access to the browser's cookie jar via the BrowserContext API:
\`\`\`typescript
// Inspect cookies
const cookies = await context.cookies();
const sessionCookie = cookies.find(c => c.name === "session_id");

// Inject cookies before navigation
await context.addCookies([
  { name: "auth_token", value: "secret_xyz", domain: "localhost", path: "/" }
]);

// Clear all cookies
await context.clearCookies();
\`\`\`
2. Saving and Reusing Storage State (storageState):
Instead of repeating the visual UI login form (username, password, submit, 2FA) across 500 test cases, Playwright allows extracting the complete authenticated session to a JSON snapshot:
\`\`\`typescript
// 1. In auth.setup.ts: Authenticate once and save
await context.storageState({ path: ".auth/user.json" });

// 2. In test file or config: Reuse saved session
test.use({ storageState: ".auth/user.json" });
\`\`\`
3. Security Hazard & .gitignore Rules:
Storage state files contain live authentication bearer tokens, encrypted session cookies, and user IDs. NEVER commit '.auth/' or '*.json' session dumps into Git repositories. Ensure '.auth' is explicitly added to '.gitignore'. In CI pipelines, generate authentication dynamically in setup project workers.`
    },
    {
      id: "authentication-and-session-workflows",
      title: "Part F — Multi-User Sessions & Protected Routes",
      content: `Testing enterprise workflows requires verifying authentication boundaries, role-based access control (RBAC), and session invalidation.

1. Protected Route Redirection:
When an unauthenticated user attempts to access a protected route (such as /practice/dashboard), the frontend or server must redirect to /practice/login?redirect=/practice/dashboard.
\`\`\`typescript
await page.goto("/practice/dashboard");
await page.waitForURL(url => url.pathname === "/practice/login" && url.searchParams.has("redirect"));
await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
\`\`\`
2. Session Invalidation on Logout:
Validating logout requires a two-step check:
- Ensure the user is transitioned to the unauthenticated view with confirmation.
- Attempt navigating backward or visiting the protected URL directly and asserting that access is denied.

3. Concurrent Multi-Role Testing:
When testing workflows where a student submits an assignment and a trainer grades it, create two distinct contexts in a single test:
\`\`\`typescript
const studentContext = await browser.newContext({ storageState: ".auth/student.json" });
const trainerContext = await browser.newContext({ storageState: ".auth/trainer.json" });

const studentPage = await studentContext.newPage();
const trainerPage = await trainerContext.newPage();
\`\`\`
Both users operate simultaneously in the same test without session collisions or database race conditions.`
    },
    {
      id: "frames-and-nested-browsing",
      title: "Part G — Frames & Nested Browsing with frameLocator",
      content: `Many enterprise applications embed third-party payment widgets, interactive dashboards, or document editors inside <iframe> elements.

1. The Limitation of Selenium Frame Switching:
In legacy tools like Selenium WebDriver, you had to imperatively switch execution context using 'driver.switchTo().frame(id)'. If the frame reloaded or detached, the driver threw StaleElementReferenceException.

2. Playwright's Declarative frameLocator:
Playwright's 'page.frameLocator(selector)' is declarative, lazy, and retrying. It does not switch state; instead, it defines a locator boundary that auto-waits for the frame to attach and become actionable:
\`\`\`typescript
const outerFrame = page.frameLocator('iframe[title="Embedded Widget Frame"]');
await outerFrame.getByRole("button", { name: "Increment" }).click();
\`\`\`
3. Nested Frames:
You can chain 'frameLocator' calls to pierce arbitrary depths of nested iframes cleanly:
\`\`\`typescript
const nestedFrame = outerFrame.frameLocator('iframe[title="Nested Inner Frame"]');
await nestedFrame.getByRole("button", { name: "Execute Action" }).click();
\`\`\`
Every action inside the nested frame automatically inherits Playwright's actionability engine: waiting for visibility, enablement, and stability.`
    },
    {
      id: "advanced-navigation-debugging",
      title: "Part H — Navigation Debugging, Timeouts & Diagnostics",
      content: `Navigation failures are among the most common sources of CI pipeline flakiness. Diagnosing them requires understanding browser lifecycle events and diagnostic tooling.

1. Common Navigation Failures:
- Navigation Timeout (30000ms): Occurs when a page never fires the target load state (often caused by hanging analytics or unfulfilled third-party scripts).
- Redirect Loops (HTTP 301/302): Causes infinite redirects until the browser aborts.
- Target Closed ('Target page, context or browser has been closed'): Happens when a script closes a window while Playwright is actively waiting for an action.
- Detached Frame ('Frame has been detached'): The iframe DOM node was removed by React during a re-render.

2. Diagnostic Tools:
- Playwright Trace Viewer: The single most effective diagnostic tool. Run 'pnpm exec playwright show-trace trace.zip' to inspect the exact network waterfall, console errors, DOM snapshots, and timing strips before and after navigation.
- Debugging with page.on('framenavigated'): Log URL changes during complex multi-redirect workflows.
- Handling beforeunload dialogs: If an application attaches a dirty draft guard, register 'page.on("dialog", dialog => dialog.accept())' or 'dialog.dismiss()' before triggering navigation.`
    }
  ],
  codeExamples: [
    {
      id: "multi-context-isolation",
      caption: "Creating Multiple Isolated Contexts in a Single Test",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("concurrent isolated sessions", async ({ browser }) => {
  // 1. Spawn two independent browser contexts
  const studentContext = await browser.newContext();
  const trainerContext = await browser.newContext();

  const studentPage = await studentContext.newPage();
  const trainerPage = await trainerContext.newPage();

  // 2. Student logs in
  await studentPage.goto("/practice/login");
  await studentPage.getByLabel("Practice Username").fill("student");
  await studentPage.getByLabel("Practice Password").fill("Password123!");
  await studentPage.getByRole("button", { name: "Sign in" }).click();
  await expect(studentPage).toHaveURL(/.*\\/practice\\/dashboard/);

  // 3. Trainer logs in simultaneously in second context
  await trainerPage.goto("/practice/login");
  await trainerPage.getByLabel("Practice Username").fill("practitioner");
  await trainerPage.getByLabel("Practice Password").fill("SecurePractice2026!");
  await trainerPage.getByRole("button", { name: "Sign in" }).click();
  await expect(trainerPage).toHaveURL(/.*\\/practice\\/dashboard/);

  // 4. Assert both sessions coexist without cross-contamination
  await expect(studentPage.getByTestId("welcome-message")).toContainText("Welcome, student!");
  await expect(trainerPage.getByTestId("welcome-message")).toContainText("Welcome, practitioner!");

  // 5. Cleanup contexts
  await studentContext.close();
  await trainerContext.close();
});`,
      lineExplanations: [
        { line: 5, explanation: "browser.newContext() creates an isolated virtual browser profile in single-digit ms." },
        { line: 8, explanation: "Each context operates with independent cookies, localStorage, and session caches." },
        { line: 12, explanation: "Student logs in and acquires student session credentials in Context 1." },
        { line: 20, explanation: "Practitioner logs in concurrently in Context 2 without overriding Student's session." },
        { line: 27, explanation: "Both sessions are verified active simultaneously in the same test runner worker." },
        { line: 31, explanation: "Explicit context.close() guarantees complete memory cleanup and resource teardown." }
      ]
    },
    {
      id: "popup-and-new-tab",
      caption: "Handling Popups & New Tabs with Pre-Registered Event Listeners",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("opens and validates popup window", async ({ page }) => {
  await page.goto("/lab/browser");

  // 1. Register popup listener BEFORE clicking trigger to eliminate race conditions
  const popupPromise = page.waitForEvent("popup");

  // 2. Click button that issues window.open()
  await page.getByTestId("open-popup-btn").click();

  // 3. Await popup Page handle
  const popup = await popupPromise;

  // 4. Verify popup navigation and DOM state
  await expect(popup).toHaveURL(/.*\\/lab\\/browser\\/popup-content/);
  await expect(popup.getByTestId("popup-title")).toHaveText("Popup Inspection Target");
  await expect(popup.getByTestId("popup-close-btn")).toBeVisible();

  // 5. Close popup and assert closure
  await popup.close();
  expect(popup.isClosed()).toBe(true);

  // 6. Original page remains interactive and ready
  await expect(page.getByRole("heading", { name: "Browser & Window Interactions" })).toBeVisible();
});`,
      lineExplanations: [
        { line: 7, explanation: "page.waitForEvent('popup') sets up a Promise for the impending window creation." },
        { line: 10, explanation: "Trigger action clicked only after listener is safely listening." },
        { line: 13, explanation: "popupPromise resolves to a full Playwright Page object representing the new window." },
        { line: 16, explanation: "Web-first assertions target the child popup Page directly." },
        { line: 21, explanation: "popup.close() programmatically closes the popup window." },
        { line: 25, explanation: "Parent page retains its own independent DOM state and focus." }
      ]
    },
    {
      id: "nested-iframes-framelocator",
      caption: "Piercing Nested Iframes Declaratively with frameLocator",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("piercing nested iframes with frameLocator", async ({ page }) => {
  await page.goto("/lab/browser");

  // 1. Locate outer iframe declaratively
  const outerFrame = page.frameLocator('iframe[title="Embedded Widget Frame"]');
  await expect(outerFrame.getByTestId("frame-heading")).toHaveText("Embedded Iframe Document");

  // 2. Interact with controls inside outer frame
  await outerFrame.getByTestId("frame-increment-btn").click();
  await expect(outerFrame.getByTestId("frame-counter-val")).toHaveText("Count: 1");

  // 3. Fill input inside outer frame
  const input = outerFrame.getByPlaceholder("Type inside iframe...");
  await input.fill("Testing frame locators");
  await expect(input).toHaveValue("Testing frame locators");

  // 4. Chain frameLocator to interact with deeply nested child frame
  const nestedFrame = outerFrame.frameLocator('iframe[title="Nested Inner Frame"]');
  await expect(nestedFrame.getByTestId("nested-title")).toHaveText("Inner Nested Frame");

  await nestedFrame.getByTestId("nested-action-btn").click();
  await expect(nestedFrame.getByTestId("nested-status")).toHaveText("Inner Action Triggered");
});`,
      lineExplanations: [
        { line: 7, explanation: "frameLocator defines a declarative frame boundary without switching global context." },
        { line: 11, explanation: "Actions inside the frame auto-wait for frame load and element readiness." },
        { line: 16, explanation: "Standard locators (getByPlaceholder, getByTestId) operate seamlessly inside frames." },
        { line: 20, explanation: "Chaining outerFrame.frameLocator() pierces arbitrarily deep nested iframes." }
      ]
    },
    {
      id: "reusing-storage-state",
      caption: "Extracting and Injecting Authentication Storage State",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("save and bootstrap authenticated session state", async ({ browser }) => {
  // 1. One-time login in setup context
  const authContext = await browser.newContext();
  const authPage = await authContext.newPage();
  await authPage.goto("/practice/login");
  await authPage.getByLabel("Practice Username").fill("student");
  await authPage.getByLabel("Practice Password").fill("Password123!");
  await authPage.getByRole("button", { name: "Sign in" }).click();
  await authPage.waitForURL("**/practice/dashboard");

  // 2. Extract storage state (cookies + localStorage)
  const savedState = await authContext.storageState();
  await authContext.close();

  // 3. Instantiate fresh context pre-loaded with authenticated session
  const consumerContext = await browser.newContext({ storageState: savedState });
  const consumerPage = await consumerContext.newPage();

  // 4. Navigate directly to protected dashboard with zero UI login overhead
  await consumerPage.goto("/practice/dashboard");
  await expect(consumerPage.getByTestId("welcome-message")).toContainText("Welcome, student!");
  await expect(consumerPage.getByTestId("logout-btn")).toBeVisible();

  await consumerContext.close();
});`,
      lineExplanations: [
        { line: 12, explanation: "authContext.storageState() captures all active cookies and localStorage keys." },
        { line: 16, explanation: "browser.newContext({ storageState }) initializes the context pre-authenticated." },
        { line: 20, explanation: "Protected dashboard loads immediately without navigating through the login form." }
      ]
    },
    {
      id: "protected-route-redirect-handling",
      caption: "Handling Protected Route Redirects with waitForURL",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("verifies protected route redirects to login", async ({ page }) => {
  // 1. Attempt navigating directly to protected dashboard without session
  await page.goto("/practice/dashboard");

  // 2. Await deterministic redirect to login portal with redirect query param
  await page.waitForURL(/\\/practice\\/login\\?redirect=\\/practice\\/dashboard/);

  // 3. Assert login form is ready
  await expect(page.getByTestId("practice-login-portal")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();

  // 4. Authenticate and verify post-login transition back to original target
  await page.getByLabel("Practice Username").fill("student");
  await page.getByLabel("Practice Password").fill("Password123!");
  await page.getByRole("button", { name: "Sign in" }).click();

  // 5. User lands on originally requested dashboard
  await expect(page).toHaveURL(/.*\\/practice\\/dashboard/);
  await expect(page.getByTestId("welcome-message")).toContainText("Welcome, student!");
});`,
      lineExplanations: [
        { line: 8, explanation: "waitForURL auto-waits for asynchronous client-side redirects to settle." },
        { line: 17, explanation: "Submitting credentials triggers redirection back to original destination." },
        { line: 21, explanation: "Confirms deep-linking authentication preservation works end-to-end." }
      ]
    },
    {
      id: "beforeunload-dialog-handling",
      caption: "Handling Navigation Prompts with page.on('dialog')",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("handles native beforeunload unsaved changes prompt", async ({ page }) => {
  await page.goto("/lab/browser");

  // 1. Activate dirty draft guard
  await page.getByTestId("enable-guard-checkbox").check();
  await page.getByTestId("draft-textarea").fill("Important draft data");

  // 2. Register beforeunload dialog listener BEFORE navigation attempt
  let dialogTriggered = false;
  page.on("dialog", async (dialog) => {
    dialogTriggered = true;
    expect(dialog.type()).toBe("beforeunload");
    await dialog.dismiss(); // Dismiss to stay on page
  });

  // 3. Click navigation link
  await page.getByTestId("leave-page-link").click();

  // 4. Verify prompt was triggered and page did NOT navigate away
  expect(dialogTriggered).toBe(true);
  await expect(page).toHaveURL(/.*\\/lab\\/browser/);
  await expect(page.getByTestId("draft-textarea")).toHaveValue("Important draft data");
});`,
      lineExplanations: [
        { line: 11, explanation: "beforeunload dialog listeners must be registered prior to triggering navigation." },
        { line: 15, explanation: "dialog.dismiss() cancels the navigation, retaining unsaved user work." },
        { line: 23, explanation: "Asserts that URL did not change and form inputs remain completely intact." }
      ]
    }
  ],
  commonMistakes: [
    {
      title: "Registering popup listeners AFTER clicking the trigger button",
      badPractice: `await page.getByTestId("open-popup-btn").click();
const popup = await page.waitForEvent("popup"); // RACE CONDITION!`,
      goodPractice: `const popupPromise = page.waitForEvent("popup");
await page.getByTestId("open-popup-btn").click();
const popup = await popupPromise;`,
      explanation: "If the click action triggers immediate window creation before waitForEvent attaches, the test will hang and timeout waiting for an event that already fired."
    },
    {
      title: "Using networkidle as a generic wait condition for SPAs",
      badPractice: `await page.goto("/app/dashboard", { waitUntil: "networkidle" }); // Flaky on live apps!`,
      goodPractice: `await page.goto("/app/dashboard");
await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();`,
      explanation: "Modern web applications run background telemetry, long-polling, or WebSockets that prevent 500ms network silence, causing networkidle to timeout or add unnecessary 500ms latency."
    },
    {
      title: "Imperative frame switching instead of declarative frameLocator",
      badPractice: `// Selenium-style imperative frame switching:
const frame = page.frames().find(f => f.name() === "widget");
await frame.click("#submit"); // Stale frame exception if reloaded!`,
      goodPractice: `// Playwright declarative frameLocator:
const frame = page.frameLocator('iframe[title="Widget"]');
await frame.getByRole("button", { name: "Submit" }).click();`,
      explanation: "frameLocator is lazy, declarative, and retrying. If the iframe re-renders, frameLocator automatically re-queries the DOM without stale reference exceptions."
    },
    {
      title: "Committing authenticated storage state JSON files to Git",
      badPractice: `// .auth/user.json committed to GitHub repository containing live session tokens!`,
      goodPractice: `// .gitignore:
.auth/
*.storage.json`,
      explanation: "Storage state files contain plaintext bearer tokens, session cookies, and private user identifiers. Committing them is a critical security vulnerability."
    },
    {
      title: "Calling browser.newPage() instead of using isolated context fixtures",
      badPractice: `test("leaky test", async ({ browser }) => {
  const page = await browser.newPage(); // Creates unmanaged default context!
});`,
      goodPractice: `test("clean test", async ({ page }) => {
  // Uses dedicated, isolated BrowserContext managed cleanly by test runner
});`,
      explanation: "browser.newPage() bypasses the test runner's automatic context options, tracing, and video capture hooks. Use the 'page' fixture or explicit 'browser.newContext()'."
    },
    {
      title: "Synchronous page.url() inspection instead of web-first toHaveURL()",
      badPractice: `await page.getByRole("button", { name: "Login" }).click();
expect(page.url()).toBe("http://localhost:5173/dashboard"); // FAILS: URL hasn't transitioned yet!`,
      goodPractice: `await page.getByRole("button", { name: "Login" }).click();
await expect(page).toHaveURL(/.*\\/dashboard/); // Auto-waits until URL updates`,
      explanation: "Client-side routers (React Router, Next.js) change browser history asynchronously after state updates. Synchronous page.url() reads the old URL instantly."
    }
  ],
  playground: {
    title: "Playwright Contexts, Multi-Page & Navigation Architecture Matrix",
    configExample: `// Production Multi-Context & Multi-Page Automation Blueprint
import { test, expect } from "@playwright/test";

test("multi-context and multi-page architecture", async ({ browser }) => {
  // 1. Create completely isolated BrowserContext
  const context = await browser.newContext({
    baseURL: "http://localhost:5173",
    viewport: { width: 1280, height: 720 },
    permissions: ["geolocation"],
    geolocation: { latitude: 37.7749, longitude: -122.4194 }
  });

  const page = await context.newPage();

  // 2. Relative navigation with web-first URL assertions
  await page.goto("/lab/browser");
  await expect(page).toHaveURL(/.*\\/lab\\/browser/);

  // 3. Popup handling with zero race conditions
  const popupPromise = page.waitForEvent("popup");
  await page.getByTestId("open-popup-btn").click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/.*\\/popup-content/);
  await popup.close();

  // 4. Declarative nested iframe interaction
  const outerFrame = page.frameLocator('iframe[title="Embedded Widget Frame"]');
  await outerFrame.getByPlaceholder("Type inside iframe...").fill("Nested automation");

  // 5. Extract storage state for session caching
  const storage = await context.storageState();
  expect(storage.cookies).toBeDefined();

  // 6. Explicit teardown
  await context.close();
});`,
    properties: [
      {
        name: "browser.newContext(options)",
        type: "Promise<BrowserContext>",
        defaultValue: "Pruned Context",
        description: "Creates a brand-new, isolated virtual browser context with independent cookies, cache, and storage.",
        impact: "Guarantees 100% test isolation and parallel execution safety in multi-user test suites."
      },
      {
        name: "context.newPage()",
        type: "Promise<Page>",
        defaultValue: "New Page Tab",
        description: "Opens a new page (tab) within an existing BrowserContext, sharing cookies and storage.",
        impact: "Enables multi-tab workflows belonging to the exact same user session."
      },
      {
        name: "page.waitForEvent('popup')",
        type: "Promise<Page>",
        defaultValue: "Popup Listener",
        description: "Waits for a popup page to be spawned by JavaScript window.open() or target='_blank'.",
        impact: "Eliminates race conditions when registered before triggering the window opening action."
      },
      {
        name: "context.waitForEvent('page')",
        type: "Promise<Page>",
        defaultValue: "Context Listener",
        description: "Waits for any new page to open across the entire BrowserContext.",
        impact: "Crucial for capturing background tabs or unprompted popups in complex third-party workflows."
      },
      {
        name: "page.frameLocator(selector)",
        type: "FrameLocator",
        defaultValue: "Declarative Frame",
        description: "Returns a declarative locator to pierce an <iframe> without imperative context switching.",
        impact: "Auto-waits for frame attachment and eliminates legacy StaleElementReference errors."
      },
      {
        name: "context.storageState({ path })",
        type: "Promise<StorageState>",
        defaultValue: "Session Snapshot",
        description: "Extracts or persists all current cookies and localStorage keys to an in-memory or JSON structure.",
        impact: "Speeds up test suites by eliminating repetitive visual logins across hundreds of test cases."
      },
      {
        name: "context.cookies([urls])",
        type: "Promise<Cookie[]>",
        defaultValue: "Cookie Jar",
        description: "Retrieves all HTTP and document cookies stored inside the context.",
        impact: "Enables programmatic validation of session tokens, HttpOnly flags, and expiration dates."
      },
      {
        name: "context.addCookies(cookies)",
        type: "Promise<void>",
        defaultValue: "Cookie Injector",
        description: "Injects custom cookies into the context before or during navigation.",
        impact: "Simulates specific authentication states, feature flags, or consent banners instantly."
      },
      {
        name: "page.waitForURL(pattern)",
        type: "Promise<void>",
        defaultValue: "URL Auto-Waiter",
        description: "Auto-waits until the current page URL matches a string, RegExp, or predicate function.",
        impact: "Prevents flaky assertions following client-side redirects and asynchronous deep links."
      },
      {
        name: "page.goto(url, { waitUntil })",
        type: "Promise<Response | null>",
        defaultValue: "Navigation Primitive",
        description: "Navigates to relative or absolute URL, automatically resolving against configured baseURL.",
        impact: "Core entry point for all web tests with configurable load state readiness gates."
      },
      {
        name: "popup.close()",
        type: "Promise<void>",
        defaultValue: "Tab Closer",
        description: "Closes a specific page tab and releases its associated DOM, network, and memory resources.",
        impact: "Prevents memory bloat and dangling window handles in long-running test suites."
      },
      {
        name: "page.bringToFront()",
        type: "Promise<void>",
        defaultValue: "Tab Focus",
        description: "Brings the specified page to active focus in multi-tab workflows.",
        impact: "Simulates tab switching for applications that monitor document.visibilityState."
      }
    ],
    behaviorComparison: [
      {
        aspect: "browser.newContext() vs browser.newPage()",
        defaultBehavior: "browser.newContext() gives you explicit lifecycle control over isolated virtual profiles, permissions, and storage.",
        customizedBehavior: "browser.newPage() creates an anonymous unmanaged context. Less flexible and prone to resource leaks in custom test flows."
      },
      {
        aspect: "page.waitForEvent('popup') Before Click vs After Click",
        defaultBehavior: "Registering the listener BEFORE clicking sets up the asynchronous promise trap, guaranteeing zero race conditions.",
        customizedBehavior: "Registering the listener AFTER clicking is a critical anti-pattern; if the window opens instantly, the test hangs forever."
      },
      {
        aspect: "Declarative frameLocator() vs Imperative Frame Switching",
        defaultBehavior: "frameLocator() auto-waits for frame readiness and re-queries dynamically if the DOM node reloads during test execution.",
        customizedBehavior: "Legacy imperative switching holds transient pointers. When the frame re-renders, all subsequent actions crash."
      },
      {
        aspect: "Web-First expect(page).toHaveURL() vs page.url() Synchronous Read",
        defaultBehavior: "toHaveURL() continuously inspects URL with auto-waiting until the client router finishes its transition.",
        customizedBehavior: "page.url() reads the URL at that exact microsecond; in SPAs, it reads the old URL and fails instantaneously."
      },
      {
        aspect: "storageState() Session Caching vs Per-Test UI Login",
        defaultBehavior: "storageState() logs in once in a setup project and injects session cookies directly, saving 5-10 seconds per test.",
        customizedBehavior: "UI login fills username/password on every single test, inflating CI suite runtimes from 2 minutes to 30 minutes."
      },
      {
        aspect: "Explicit UI Milestones vs networkidle Load State",
        defaultBehavior: "Waiting for visible UI elements (headings, tables) verifies actual human observability and executes with zero delay.",
        customizedBehavior: "networkidle forces a mandatory 500ms network silence pause and easily breaks on analytics pings and WebSockets."
      }
    ],
    practiceTask: "Configure isolated contexts, evaluate cookie isolation, listen for popup events before click actions, and encapsulate nested iframes with frameLocator.",
    localCommand: "pnpm exec playwright test e2e/practice-contexts.spec.ts"
  },
  exercises: [
    {
      id: "ex1-navigate-baseurl",
      title: "Exercise 1: Navigate Using baseURL and Relative Path",
      objective: "Verify that relative URL navigation automatically resolves against the configured baseURL and loads the target lab.",
      prerequisites: [
        "Playwright test runner configured with baseURL: 'http://localhost:5173'",
        "Local web server running"
      ],
      scenario: "Navigate to /lab/browser using a relative path, assert that baseURL is properly resolved, and verify the main page heading.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 1: Navigate using baseURL", async ({ page }) => {
  // TODO: Navigate using relative path '/lab/browser'
  // TODO: Assert full URL ends with /lab/browser
  // TODO: Assert main heading is visible
});`,
      task: "Call page.goto('/lab/browser'), verify the URL matches /.*\\/lab\\/browser$/, and assert that the heading 'Browser & Window Interactions' is visible.",
      acceptanceCriteria: [
        "Relative path '/lab/browser' passed to page.goto().",
        "expect(page).toHaveURL(/.*\\/lab\\/browser$/) asserted.",
        "Main heading asserted using getByRole('heading')."
      ],
      expectedBehavior: "Page resolves instantly against baseURL without needing hardcoded http://localhost:5173.",
      hint: "Use page.goto('/lab/browser') and expect(page).toHaveURL(/.*\\/lab\\/browser$/).",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 1: Navigate using baseURL and relative path", async ({ page }) => {
  await page.goto("/lab/browser");
  await expect(page).toHaveURL(/.*\\/lab\\/browser$/);
  await expect(page.getByRole("heading", { name: "Browser & Window Interactions" })).toBeVisible();
});`,
      troubleshootingNotes: "Verify baseURL is defined in playwright.config.ts; otherwise relative URLs will fail.",
      command: "pnpm exec playwright test e2e/practice-contexts.spec.ts -g 'Exercise 1'"
    },
    {
      id: "ex2-assert-url-and-title",
      title: "Exercise 2: Assert Destination URL and Page Title Across Navigation",
      objective: "Perform sequential navigation and assert both destination URLs and browser document titles using web-first matchers.",
      prerequisites: [
        "Understanding of toHaveURL() and toHaveTitle() matchers"
      ],
      scenario: "Navigate to /lab/browser, assert URL and document title, then navigate to /practice/login and assert the portal renders.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 2: Assert URL and title", async ({ page }) => {
  // TODO: Navigate to /lab/browser and assert URL and title
  // TODO: Navigate to /practice/login and assert URL and portal presence
});`,
      task: "Navigate to /lab/browser, assert toHaveTitle(/Playwright Industrial Lab/), navigate to /practice/login, and assert toHaveURL(/.*\\/practice\\/login/).",
      acceptanceCriteria: [
        "expect(page).toHaveURL(/.*\\/lab\\/browser/) passes.",
        "expect(page).toHaveTitle(/Playwright Industrial Lab/) passes.",
        "Subsequent navigation to /practice/login asserted."
      ],
      expectedBehavior: "Web-first matchers retry until document title and URL update cleanly.",
      hint: "Use expect(page).toHaveTitle(/Playwright Industrial Lab/) to match document.title.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 2: Assert destination URL and page title across navigation", async ({ page }) => {
  await page.goto("/lab/browser");
  await expect(page).toHaveURL(/.*\\/lab\\/browser/);
  await expect(page).toHaveTitle(/Playwright Industrial Lab/);

  await page.goto("/practice/login");
  await expect(page).toHaveURL(/.*\\/practice\\/login/);
  await expect(page.getByTestId("practice-login-portal")).toBeVisible();
});`,
      troubleshootingNotes: "Document titles update after DOM load; toHaveTitle auto-waits for title tag mutation.",
      command: "pnpm exec playwright test e2e/practice-contexts.spec.ts -g 'Exercise 2'"
    },
    {
      id: "ex3-create-two-contexts",
      title: "Exercise 3: Create Two Isolated Browser Contexts",
      objective: "Spawn two separate BrowserContext instances using browser.newContext() and prove local storage isolation.",
      prerequisites: [
        "browser test fixture"
      ],
      scenario: "Create Context A and Context B. In Context A, store a key in localStorage. In Context B, verify the key does not exist.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 3: Two isolated contexts", async ({ browser }) => {
  // TODO: Create contextA and pageA, set localStorage
  // TODO: Create contextB and pageB, verify localStorage is empty
  // TODO: Close both contexts
});`,
      task: "Instantiate contextA and contextB, save 'session_context_A' in contextA, verify contextB has '(null)' for that key, and close both contexts.",
      acceptanceCriteria: [
        "contextA and contextB created via browser.newContext().",
        "Storage written in Context A is confirmed missing in Context B.",
        "contextA.close() and contextB.close() executed."
      ],
      expectedBehavior: "Contexts operate as completely separate Incognito browser profiles.",
      hint: "Use pageB.getByTestId('read-local-btn').click() and assert local-storage-val is 'Value: (null)'.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 3: Create two isolated browser contexts in a single test", async ({ browser }) => {
  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  await pageA.goto("/lab/browser");
  await pageA.getByTestId("local-key-input").fill("context_tracker");
  await pageA.getByTestId("local-val-input").fill("session_context_A");
  await pageA.getByTestId("save-local-btn").click();

  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  await pageB.goto("/lab/browser");

  await pageB.getByTestId("local-key-input").fill("context_tracker");
  await pageB.getByTestId("read-local-btn").click();
  await expect(pageB.getByTestId("local-storage-val")).toHaveText("Value: (null)");

  await contextA.close();
  await contextB.close();
});`,
      troubleshootingNotes: "Always close manual contexts to prevent worker process memory leaks.",
      command: "pnpm exec playwright test e2e/practice-contexts.spec.ts -g 'Exercise 3'"
    },
    {
      id: "ex4-cookie-session-isolation",
      title: "Exercise 4: Prove Cookie and Session Isolation Between Contexts",
      objective: "Call a server cookie endpoint in Context A and verify Context B's cookie jar remains completely untouched.",
      prerequisites: [
        "context.cookies() API"
      ],
      scenario: "Context A clicks 'Call Set-Cookie Endpoint' to receive pil_server_cookie. Assert Context A has the cookie while Context B has zero cookies.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 4: Cookie isolation", async ({ browser }) => {
  // TODO: Trigger cookie in Context A
  // TODO: Verify contextA.cookies() has pil_server_cookie
  // TODO: Verify contextB.cookies() has no pil_server_cookie
});`,
      task: "Trigger server cookie in Context A, assert pil_server_cookie value is 'token_xyz_987', and verify Context B has no such cookie.",
      acceptanceCriteria: [
        "Context A fetches cookie via trigger-cookie-btn.",
        "contextA.cookies() returns pil_server_cookie.",
        "contextB.cookies() confirms cookie is undefined."
      ],
      expectedBehavior: "BrowserContext boundaries prevent cookie leakage across virtual profiles.",
      hint: "Use const cookies = await context.cookies(); and find by name 'pil_server_cookie'.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 4: Prove cookie and session isolation between contexts", async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();

  const pageA = await contextA.newPage();
  await pageA.goto("/lab/browser");
  await pageA.getByTestId("trigger-cookie-btn").click();
  await expect(pageA.getByTestId("cookie-status")).toContainText("pil_server_cookie");

  const cookiesA = await contextA.cookies();
  const serverCookieA = cookiesA.find((c) => c.name === "pil_server_cookie");
  expect(serverCookieA).toBeDefined();
  expect(serverCookieA?.value).toBe("token_xyz_987");

  const cookiesB = await contextB.cookies();
  const serverCookieB = cookiesB.find((c) => c.name === "pil_server_cookie");
  expect(serverCookieB).toBeUndefined();

  await contextA.close();
  await contextB.close();
});`,
      troubleshootingNotes: "context.cookies() returns an array of Cookie objects with name, value, domain, and path.",
      command: "pnpm exec playwright test e2e/practice-contexts.spec.ts -g 'Exercise 4'"
    },
    {
      id: "ex5-open-popup-validate",
      title: "Exercise 5: Open a Popup Window and Validate Content",
      objective: "Safely automate a window.open() popup using page.waitForEvent('popup') without race conditions.",
      prerequisites: [
        "page.waitForEvent('popup') API"
      ],
      scenario: "Register popup promise, click 'Open Popup Window', assert popup URL and heading, and close the popup cleanly.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 5: Open popup", async ({ page }) => {
  await page.goto("/lab/browser");
  // TODO: Pre-register popup listener
  // TODO: Click open-popup-btn
  // TODO: Assert popup content and close it
});`,
      task: "Register popup promise, click open-popup-btn, assert popup URL contains /lab/browser/popup-content, assert heading, close popup, and assert isClosed() is true.",
      acceptanceCriteria: [
        "popupPromise created before click action.",
        "popup Page instance awaited.",
        "popup URL and popup-title asserted.",
        "popup.close() called and verified via popup.isClosed()."
      ],
      expectedBehavior: "Popup opens in child window and is automated independently from parent page.",
      hint: "Remember to call popup.close() and expect(popup.isClosed()).toBe(true).",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 5: Open a popup window and validate content", async ({ page }) => {
  await page.goto("/lab/browser");

  const popupPromise = page.waitForEvent("popup");
  await page.getByTestId("open-popup-btn").click();
  const popup = await popupPromise;

  await expect(popup).toHaveURL(/.*\\/lab\\/browser\\/popup-content/);
  await expect(popup.getByTestId("popup-title")).toHaveText("Popup Inspection Target");
  await expect(popup.getByTestId("popup-close-btn")).toBeVisible();

  await popup.close();
  expect(popup.isClosed()).toBe(true);
});`,
      troubleshootingNotes: "Registering the listener before clicking is mandatory to avoid timing race conditions.",
      command: "pnpm exec playwright test e2e/practice-contexts.spec.ts -g 'Exercise 5'"
    },
    {
      id: "ex6-link-target-blank",
      title: "Exercise 6: Handle a Link That Opens a New Tab with target='_blank'",
      objective: "Capture and validate a new tab opened via an HTML link with target='_blank'.",
      prerequisites: [
        "page.waitForEvent('popup') with anchor tags"
      ],
      scenario: "Click an external link simulator with target='_blank', capture the new Page instance, assert its title, and close it.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 6: Link target blank", async ({ page }) => {
  await page.goto("/lab/browser");
  // TODO: Register popup listener for target='_blank' link
  // TODO: Click open-tab-link
  // TODO: Validate new tab and close it
});`,
      task: "Register popup listener, click open-tab-link, assert new tab heading 'Popup Inspection Target', close new tab, and verify parent page remains intact.",
      acceptanceCriteria: [
        "page.waitForEvent('popup') captures target='_blank' link click.",
        "New tab URL and heading verified.",
        "New tab closed and parent page verified operational."
      ],
      expectedBehavior: "Both window.open() and target='_blank' fire the 'popup' event in Playwright.",
      hint: "Playwright treats target='_blank' links as popup events on the parent page.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 6: Handle a link that opens a new page with target='_blank'", async ({ page }) => {
  await page.goto("/lab/browser");

  const newPagePromise = page.waitForEvent("popup");
  await page.getByTestId("open-tab-link").click();
  const newPage = await newPagePromise;

  await expect(newPage).toHaveURL(/.*\\/lab\\/browser\\/popup-content/);
  await expect(newPage.getByRole("heading", { name: "Popup Inspection Target" })).toBeVisible();

  await newPage.close();
  expect(newPage.isClosed()).toBe(true);

  await expect(page.getByRole("heading", { name: "Browser & Window Interactions" })).toBeVisible();
});`,
      troubleshootingNotes: "Always close child tabs to keep browser process memory tidy in large suites.",
      command: "pnpm exec playwright test e2e/practice-contexts.spec.ts -g 'Exercise 6'"
    },
    {
      id: "ex7-save-reuse-storage-state",
      title: "Exercise 7: Save and Reuse Storage State for Authenticated Workflows",
      objective: "Authenticate once, extract storageState, and bootstrap a second context with the saved credentials.",
      prerequisites: [
        "context.storageState() API",
        "Practice Login lab"
      ],
      scenario: "Login as 'student' with 'Password123!', extract storage state in-memory, spawn a new context with that state, and navigate directly to dashboard.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 7: Save and reuse storage state", async ({ browser }) => {
  // TODO: Login in context 1 and call storageState()
  // TODO: Create context 2 with { storageState }
  // TODO: Navigate directly to /practice/dashboard without logging in
});`,
      task: "Perform login in setupContext, extract storageState, pass to browser.newContext({ storageState }), and navigate directly to /practice/dashboard.",
      acceptanceCriteria: [
        "Setup context logs in and calls context.storageState().",
        "Second context initialized with { storageState }.",
        "Consumer page navigates directly to /practice/dashboard and asserts user is logged in."
      ],
      expectedBehavior: "Second context is authenticated immediately without going through the login form.",
      hint: "Use const storage = await setupContext.storageState(); and pass it to browser.newContext({ storageState: storage }).",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 7: Save and reuse storage state for authenticated workflows", async ({ browser }) => {
  const setupContext = await browser.newContext();
  const setupPage = await setupContext.newPage();
  await setupPage.goto("/practice/login");
  await setupPage.getByLabel("Practice Username").fill("student");
  await setupPage.getByLabel("Practice Password").fill("Password123!");
  await setupPage.getByRole("button", { name: "Sign in" }).click();
  await setupPage.waitForURL("**/practice/dashboard");

  const storage = await setupContext.storageState();
  await setupContext.close();

  const authedContext = await browser.newContext({ storageState: storage });
  const authedPage = await authedContext.newPage();

  await authedPage.goto("/practice/dashboard");
  await expect(authedPage.getByTestId("welcome-message")).toContainText("Welcome, student!");
  await expect(authedPage.getByTestId("logout-btn")).toBeVisible();

  await authedContext.close();
});`,
      troubleshootingNotes: "In real projects, save storageState to a path in .auth/ and reference it in playwright.config.ts projects.",
      command: "pnpm exec playwright test e2e/practice-contexts.spec.ts -g 'Exercise 7'"
    },
    {
      id: "ex8-logout-protected-route",
      title: "Exercise 8: Verify Logout and Protected Route Redirection",
      objective: "Test the complete session lifecycle: login, logout invalidation, and redirection on unauthorized access.",
      prerequisites: [
        "Understanding of session invalidation and URL query redirects"
      ],
      scenario: "Sign in as student, click 'Sign Out', verify loggedOut=true banner, then attempt navigating back to /practice/dashboard and assert login redirect.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 8: Logout and protected redirect", async ({ page }) => {
  // TODO: Login as student
  // TODO: Click logout and assert loggedOut=true
  // TODO: Try navigating to /practice/dashboard and assert redirect
});`,
      task: "Sign in as student, click logout-btn, assert /practice/login?loggedOut=true, navigate to /practice/dashboard, and assert /practice/login?redirect=/practice/dashboard.",
      acceptanceCriteria: [
        "Login succeeds to /practice/dashboard.",
        "Logout redirects to /practice/login?loggedOut=true.",
        "Subsequent visit to dashboard is blocked and redirected to login."
      ],
      expectedBehavior: "Application destroys session token on logout and blocks unauthorized deep links.",
      hint: "Assert page.getByText('You have been signed out successfully.') after logout.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 8: Verify logout and protected route redirection", async ({ page }) => {
  await page.goto("/practice/login");
  await page.getByLabel("Practice Username").fill("student");
  await page.getByLabel("Practice Password").fill("Password123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/.*\\/practice\\/dashboard/);

  await page.getByTestId("logout-btn").click();
  await expect(page).toHaveURL(/.*\\/practice\\/login\\?loggedOut=true/);
  await expect(page.getByText("You have been signed out successfully.")).toBeVisible();

  await page.goto("/practice/dashboard");
  await expect(page).toHaveURL(/.*\\/practice\\/login\\?redirect=\\/practice\\/dashboard/);
});`,
      troubleshootingNotes: "Always verify session invalidation after logout to prevent security regression bugs.",
      command: "pnpm exec playwright test e2e/practice-contexts.spec.ts -g 'Exercise 8'"
    },
    {
      id: "ex9-nested-iframes-framelocator",
      title: "Exercise 9: Interact with Controls Inside Nested Iframes Using frameLocator",
      objective: "Target and automate elements inside an outer iframe and deeply nested child iframe using chained frameLocators.",
      prerequisites: [
        "page.frameLocator() syntax"
      ],
      scenario: "Navigate to /lab/browser, fill text inside outer frame, then chain frameLocator into inner nested frame and trigger action.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 9: Nested iframes", async ({ page }) => {
  await page.goto("/lab/browser");
  // TODO: Target outer iframe and fill input
  // TODO: Target nested child iframe and click button
});`,
      task: "Define outerFrame using frameLocator('iframe[title=\"Embedded Widget Frame\"]'), fill input, define nestedFrame, and click nested-action-btn.",
      acceptanceCriteria: [
        "Outer frame targeted via page.frameLocator().",
        "Input filled and verified with toHaveValue().",
        "Nested frame targeted via outerFrame.frameLocator().",
        "Action triggered and nested-status verified."
      ],
      expectedBehavior: "Chained frameLocator traverses parent and child iframes with automatic waiting.",
      hint: "Use const nestedFrame = outerFrame.frameLocator('iframe[title=\"Nested Inner Frame\"]').",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 9: Interact with controls inside nested iframes using frameLocator", async ({ page }) => {
  await page.goto("/lab/browser");

  const outerFrame = page.frameLocator('iframe[title="Embedded Widget Frame"]');
  await expect(outerFrame.getByTestId("frame-heading")).toHaveText("Embedded Iframe Document");

  const input = outerFrame.getByPlaceholder("Type inside iframe...");
  await input.fill("Playwright Frame Testing");
  await expect(input).toHaveValue("Playwright Frame Testing");

  const nestedFrame = outerFrame.frameLocator('iframe[title="Nested Inner Frame"]');
  await expect(nestedFrame.getByTestId("nested-title")).toHaveText("Inner Nested Frame");
  await expect(nestedFrame.getByTestId("nested-status")).toHaveText("Inner Frame Ready");

  await nestedFrame.getByTestId("nested-action-btn").click();
  await expect(nestedFrame.getByTestId("nested-status")).toHaveText("Inner Action Triggered");
});`,
      troubleshootingNotes: "Use accessible title attributes on iframe elements to create stable frame locators.",
      command: "pnpm exec playwright test e2e/practice-contexts.spec.ts -g 'Exercise 9'"
    },
    {
      id: "ex10-diagnose-redirect-waitforurl",
      title: "Exercise 10: Handle Redirect Navigation Deterministically with waitForURL",
      objective: "Diagnose and handle asynchronous redirects cleanly using page.waitForURL() rather than static timeouts.",
      prerequisites: [
        "page.waitForURL() API"
      ],
      scenario: "Trigger an unauthorized visit to /practice/dashboard and assert that page.waitForURL() resolves the redirected login URL.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 10: Handle redirect with waitForURL", async ({ page }) => {
  // TODO: Navigate to /practice/dashboard
  // TODO: Use page.waitForURL to wait for redirect to login
  // TODO: Assert login portal is visible
});`,
      task: "Navigate to /practice/dashboard, call page.waitForURL(/.*\\/practice\\/login\\?redirect=\\/practice\\/dashboard/), and assert login portal.",
      acceptanceCriteria: [
        "Direct navigation to protected URL initiated.",
        "page.waitForURL() used to await the redirect.",
        "Login portal asserted visible."
      ],
      expectedBehavior: "waitForURL auto-waits until client-side routing completes the redirect.",
      hint: "Pass a RegExp pattern matching the redirected query string to page.waitForURL().",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 10: Handle redirect navigation deterministically with waitForURL", async ({ page }) => {
  await page.goto("/practice/dashboard");

  await page.waitForURL(/\\/practice\\/login\\?redirect=\\/practice\\/dashboard/);
  await expect(page.getByTestId("practice-login-portal")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});`,
      troubleshootingNotes: "waitForURL accepts string globs or Regular Expressions.",
      command: "pnpm exec playwright test e2e/practice-contexts.spec.ts -g 'Exercise 10'"
    },
    {
      id: "ex11-concurrent-multi-user",
      title: "Exercise 11: Test Two Distinct Users Concurrently Across Isolated Contexts",
      objective: "Coordinate two different user roles (Student and Practitioner) simultaneously in a single test without session collision.",
      prerequisites: [
        "Multi-context creation with browser.newContext()"
      ],
      scenario: "Login as student in context 1 and practitioner in context 2. Assert both dashboards display their respective roles concurrently.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 11: Concurrent multi-user sessions", async ({ browser }) => {
  // TODO: Create studentContext and login as student
  // TODO: Create practitionerContext and login as practitioner
  // TODO: Assert both sessions coexist independently
});`,
      task: "Create studentContext and practitionerContext, login student and practitioner, verify both display proper roles, and verify reloading studentPage keeps student logged in.",
      acceptanceCriteria: [
        "studentContext and practitionerContext operate concurrently.",
        "Student asserted as 'STUDENT' role.",
        "Practitioner asserted as 'PRACTITIONER' role.",
        "studentPage reload confirms no session contamination."
      ],
      expectedBehavior: "Both users coexist in separate virtual browser profiles without session collision.",
      hint: "Use browser.newContext() for each user and create dedicated pages.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 11: Test two distinct users concurrently across isolated contexts", async ({ browser }) => {
  const studentContext = await browser.newContext();
  const studentPage = await studentContext.newPage();
  await studentPage.goto("/practice/login");
  await studentPage.getByLabel("Practice Username").fill("student");
  await studentPage.getByLabel("Practice Password").fill("Password123!");
  await studentPage.getByRole("button", { name: "Sign in" }).click();
  await expect(studentPage).toHaveURL(/.*\\/practice\\/dashboard/);
  await expect(studentPage.getByTestId("welcome-message")).toContainText("Welcome, student!");
  await expect(studentPage.getByTestId("user-role-badge")).toContainText("STUDENT");

  const practitionerContext = await browser.newContext();
  const practitionerPage = await practitionerContext.newPage();
  await practitionerPage.goto("/practice/login");
  await practitionerPage.getByLabel("Practice Username").fill("practitioner");
  await practitionerPage.getByLabel("Practice Password").fill("SecurePractice2026!");
  await practitionerPage.getByRole("button", { name: "Sign in" }).click();
  await expect(practitionerPage).toHaveURL(/.*\\/practice\\/dashboard/);
  await expect(practitionerPage.getByTestId("welcome-message")).toContainText("Welcome, practitioner!");
  await expect(practitionerPage.getByTestId("user-role-badge")).toContainText("PRACTITIONER");

  await studentPage.reload();
  await expect(studentPage.getByTestId("welcome-message")).toContainText("Welcome, student!");

  await studentContext.close();
  await practitionerContext.close();
});`,
      troubleshootingNotes: "Multi-user testing is essential for verifying chat, real-time collaboration, and approval workflows.",
      command: "pnpm exec playwright test e2e/practice-contexts.spec.ts -g 'Exercise 11'"
    },
    {
      id: "ex12-senior-multipage-challenge",
      title: "Exercise 12: Complete a Senior-Level Multi-Page Workflow",
      objective: "Solve an industrial multi-page test challenge coordinating popups, cross-page localStorage sharing, frame locators, and teardown.",
      prerequisites: [
        "Advanced context, popup, frame, and evaluation APIs"
      ],
      scenario: "Navigate to /lab/browser, spawn a popup, write a key to localStorage in popup, verify original page shares that key, close popup, and click counter inside outer iframe.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 12: Senior multi-page workflow", async ({ browser }) => {
  // TODO: Create context and page, navigate to /lab/browser
  // TODO: Spawn popup, write localStorage via popup.evaluate()
  // TODO: Verify parent page in same context reads the value
  // TODO: Close popup and interact with iframe counter
});`,
      task: "Coordinate popup creation, write to localStorage inside popup, read it from parent page, close popup, and increment frame counter.",
      acceptanceCriteria: [
        "Popup spawned and verified.",
        "localStorage shared across tabs in same context proven via page.evaluate().",
        "Popup closed cleanly.",
        "Nested frame counter incremented and verified."
      ],
      expectedBehavior: "Pages inside the same BrowserContext share storage and cookies, while maintaining separate document trees.",
      hint: "Remember that pages within the same context share localStorage for the same origin.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 12: Complete a senior-level multi-page workflow", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("/lab/browser");

  const popupPromise = page.waitForEvent("popup");
  await page.getByTestId("open-popup-btn").click();
  const popup = await popupPromise;
  await expect(popup.getByTestId("popup-title")).toBeVisible();

  await popup.evaluate(() => localStorage.setItem("cross_page_key", "cross_page_value"));

  const sharedVal = await page.evaluate(() => localStorage.getItem("cross_page_key"));
  expect(sharedVal).toBe("cross_page_value");

  await popup.close();
  expect(popup.isClosed()).toBe(true);

  const outerFrame = page.frameLocator('iframe[title="Embedded Widget Frame"]');
  await outerFrame.getByTestId("frame-increment-btn").click();
  await expect(outerFrame.getByTestId("frame-counter-val")).toHaveText("Count: 1");

  await context.close();
});`,
      troubleshootingNotes: "This pattern demonstrates true cross-tab synchronization testing in modern web applications.",
      command: "pnpm exec playwright test e2e/practice-contexts.spec.ts -g 'Exercise 12'"
    }
  ],
  knowledgeCheck: [
    {
      id: "kc-context-vs-page",
      topic: "Browser Architecture",
      question: "What is the primary difference between creating a new Page ('context.newPage()') versus creating a new BrowserContext ('browser.newContext()')?",
      options: [
        "A Page is an independent operating system process, while a BrowserContext is a DOM node.",
        "Pages inside the same BrowserContext share cookies, cache, and web storage; separate BrowserContexts are completely isolated virtual profiles with zero shared state.",
        "There is no difference; both create new tabs with shared cookies.",
        "BrowserContext can only be used in Firefox, while Page works in Chromium."
      ],
      correctOptionIndex: 1,
      explanation: "A BrowserContext represents an isolated virtual browser profile (similar to an Incognito window). Multiple pages in the same context share cookies and storage, whereas separate contexts share nothing."
    },
    {
      id: "kc-popup-race-condition",
      topic: "Multi-Page Events",
      question: "Why must 'page.waitForEvent(\"popup\")' be registered BEFORE clicking the element that opens the popup window?",
      options: [
        "Because JavaScript syntax prohibits calling await after click.",
        "If registered after the click, the popup may spawn before the event listener attaches, causing the promise to wait indefinitely and timeout.",
        "Because Playwright closes popups automatically if no listener is registered.",
        "To bypass the browser's native popup blocker."
      ],
      correctOptionIndex: 1,
      explanation: "Asynchronous events must have active listeners attached before the triggering action is dispatched. If the window opens instantly before waitForEvent executes, the event is missed."
    },
    {
      id: "kc-baseurl-relative-paths",
      topic: "Navigation Architecture",
      question: "What is the key benefit of configuring 'baseURL' in playwright.config.ts and using relative paths in 'page.goto()'?",
      options: [
        "It speeds up network packet delivery by 50%.",
        "It eliminates hardcoded hostnames and ports, allowing test suites to target local, staging, or production environments dynamically via environment variables.",
        "It forces all network requests to use HTTP/3.",
        "It allows tests to run without an internet connection."
      ],
      correctOptionIndex: 1,
      explanation: "baseURL abstracts environment endpoints. When you call page.goto('/login'), Playwright prepends the configured baseURL, making tests fully portable across CI environments."
    },
    {
      id: "kc-networkidle-anti-pattern",
      topic: "Load States",
      question: "Why is 'page.goto(url, { waitUntil: \"networkidle\" })' discouraged as a standard wait strategy in modern single-page applications?",
      options: [
        "networkidle is deprecated and will be removed in future Playwright versions.",
        "Modern applications frequently run background analytics, streaming feeds, or WebSockets that prevent 500ms network silence, causing networkidle to timeout or add unnecessary 500ms latency.",
        "networkidle only works in WebKit.",
        "networkidle disables SSL verification."
      ],
      correctOptionIndex: 1,
      explanation: "networkidle requires 500ms with zero network connections. SPAs with background telemetry or polling frequently fail this condition. Waiting for explicit DOM milestones is faster and more reliable."
    },
    {
      id: "kc-framelocator-declarative",
      topic: "Frames Automation",
      question: "How does Playwright's 'page.frameLocator()' differ from legacy Selenium frame switching ('driver.switchTo().frame()')?",
      options: [
        "frameLocator requires Chrome DevTools Protocol to be enabled.",
        "frameLocator is declarative and lazy: it does not switch global driver state, auto-waits for frame attachment, and automatically recovers if the iframe re-renders.",
        "frameLocator can only interact with cross-origin iframes.",
        "There is no difference in execution behavior."
      ],
      correctOptionIndex: 1,
      explanation: "frameLocator creates a scoped locator that auto-waits and re-queries dynamically, completely avoiding the StaleElementReference errors common in legacy imperative frame switching."
    },
    {
      id: "kc-storagestate-security",
      topic: "Storage State & Security",
      question: "Why is it critical to ensure that authentication storage state JSON files are added to '.gitignore'?",
      options: [
        "Because Git cannot parse JSON files.",
        "Storage state files contain raw session cookies and bearer tokens; committing them exposes credentials and creates critical security vulnerabilities.",
        "Because Playwright automatically deletes any files in Git.",
        "It is not important; storage state files should always be committed."
      ],
      correctOptionIndex: 1,
      explanation: "storageState files contain active authentication tokens and cookies. Committing them to version control leaks credentials into source history, creating severe security risks."
    },
    {
      id: "kc-multi-user-concurrency",
      topic: "Test Concurrency",
      question: "When automating a workflow involving two distinct user roles (e.g. Student and Practitioner), how should test sessions be structured in Playwright?",
      options: [
        "Open two browser tabs inside the default page fixture.",
        "Create two independent BrowserContexts ('browser.newContext()') within the test, allowing both users to maintain active, non-colliding sessions simultaneously.",
        "Run the test twice in serial mode with different command line flags.",
        "Clear cookies after each user action."
      ],
      correctOptionIndex: 1,
      explanation: "Creating two separate BrowserContexts provides distinct cookie jars and localStorage stores, enabling concurrent multi-user testing in a single test without session leakage."
    },
    {
      id: "kc-beforeunload-navigation",
      topic: "Navigation Diagnostics",
      question: "When a web page triggers a browser native 'beforeunload' prompt due to unsaved changes, what must a Playwright test do to dismiss the prompt and remain on the page?",
      options: [
        "Call page.reload({ force: true }).",
        "Register 'page.on(\"dialog\", dialog => dialog.dismiss())' before triggering the navigation event.",
        "Click the back button twice.",
        "Press the Escape key 5 times."
      ],
      correctOptionIndex: 1,
      explanation: "beforeunload dialogs are native browser prompts. Registering a dialog listener and calling dialog.dismiss() cancels the navigation and keeps the browser on the current page."
    },
    {
      id: "kc-browser-newpage-trap",
      topic: "Context Architecture",
      question: "What is the architectural downside of calling 'browser.newPage()' inside a Playwright test instead of using the provided 'page' fixture or 'browser.newContext()'?",
      options: [
        "browser.newPage() always runs in headless mode even if --headed is passed.",
        "browser.newPage() creates an anonymous, unmanaged context that bypasses the test runner's configured context options, tracing, and automatic teardown hooks.",
        "browser.newPage() throws an error in Chromium.",
        "It limits the viewport to 800x600."
      ],
      correctOptionIndex: 1,
      explanation: "browser.newPage() creates an unmanaged default context that does not inherit custom project options or automatic artifact recording. Always use the page fixture or manage explicit contexts."
    }
  ],
  practiceTask: {
    labRoute: "/lab/browser",
    labName: "Browser & Window Interactions Lab",
    objective: "Automate popups, nested iframes, browser cookies, and beforeunload dialog guards.",
    instructions: [
      "Navigate to /lab/browser using baseURL.",
      "Register a popup listener and click 'Open Popup Window'.",
      "Assert popup URL and close the popup window.",
      "Pierce outer and nested iframes with frameLocator to increment counter and trigger inner action.",
      "Trigger server cookie endpoint and assert pil_server_cookie via context.cookies().",
      "Activate unsaved changes guard, type in draft textarea, handle beforeunload prompt, and verify draft preservation."
    ],
    acceptanceCriteria: [
      "Popup window validated and closed cleanly.",
      "Both outer and nested iframes manipulated without stale element exceptions.",
      "Server cookie verified via context.cookies().",
      "beforeunload dialog dismissed cleanly and draft state preserved."
    ],
    hint: "Use page.frameLocator('iframe[title=\"Embedded Widget Frame\"]').frameLocator('iframe[title=\"Nested Inner Frame\"]) for the nested frame.",
    solutionCode: `import { test, expect } from "@playwright/test";

test("complete browser and window interactions lab workflow", async ({ page, context }) => {
  await page.goto("/lab/browser");

  // 1. Popup handling
  const popupPromise = page.waitForEvent("popup");
  await page.getByTestId("open-popup-btn").click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/.*\\/lab\\/browser\\/popup-content/);
  await popup.close();

  // 2. Nested iframes
  const outer = page.frameLocator('iframe[title="Embedded Widget Frame"]');
  await outer.getByTestId("frame-increment-btn").click();
  await expect(outer.getByTestId("frame-counter-val")).toHaveText("Count: 1");

  const inner = outer.frameLocator('iframe[title="Nested Inner Frame"]');
  await inner.getByTestId("nested-action-btn").click();
  await expect(inner.getByTestId("nested-status")).toHaveText("Inner Action Triggered");

  // 3. Storage and Cookies
  await page.getByTestId("trigger-cookie-btn").click();
  const cookies = await context.cookies();
  const pilCookie = cookies.find((c) => c.name === "pil_server_cookie");
  expect(pilCookie).toBeDefined();

  // 4. Unsaved changes guard
  await page.getByTestId("enable-guard-checkbox").check();
  await page.getByTestId("draft-textarea").fill("Saved draft");
  page.on("dialog", (d) => d.dismiss());
  await page.getByTestId("leave-page-link").click();
  await expect(page).toHaveURL(/.*\\/lab\\/browser/);
});`,
    playwrightCommand: "pnpm exec playwright test e2e/practice-contexts.spec.ts"
  },
  interviewQuestions: [
    {
      question: "How does Playwright's ephemeral BrowserContext achieve sub-10ms test isolation compared to Selenium WebDriver?",
      answer: "Selenium WebDriver typically launches a brand new OS browser process (chromedriver.exe + chrome.exe) for each test to achieve isolation, which incurs a 1-3 second process startup penalty and heavy RAM usage. In contrast, Playwright keeps a single browser engine running per worker and creates virtual browser contexts using DevTools Protocol browser context targets. These contexts operate with completely isolated in-memory cookie jars, cache, and storage databases, creating in 2-5ms with zero process overhead.",
      architecturalContext: "Enables hundreds of fully isolated tests to run in seconds rather than minutes, revolutionizing CI test execution speed."
    },
    {
      question: "Why is networkidle considered an anti-pattern in modern single-page applications with analytics or WebSocket feeds?",
      answer: "networkidle requires 500ms of complete network silence (no active fetch/XHR connections). In modern SPAs with long-polling telemetry, background analytics, error reporting beacons, or persistent WebSockets, this condition is frequently violated, leading to 30-second test timeouts or mandatory 500ms dead waits per step. Best practice is to wait for observable, user-facing DOM milestones (such as headings or data tables) using web-first retrying assertions.",
      architecturalContext: "SDETs must distinguish between browser-level driver states and actual user-observable application readiness."
    },
    {
      question: "How do you design parallel CI test execution when tests require multiple distinct user roles (e.g. Student, Trainer, Admin)?",
      answer: "Use Playwright's multi-context capabilities paired with setup projects. In auth.setup.ts, authenticate once per role and save storage states to .auth/student.json, .auth/trainer.json, etc. In multi-user tests, instantiate independent contexts via browser.newContext({ storageState: '.auth/student.json' }) and browser.newContext({ storageState: '.auth/trainer.json' }). Each worker runs with its own isolated virtual contexts, allowing parallel execution without cross-worker session collisions.",
      architecturalContext: "Architects must decouple test worker concurrency from user identity to maintain deterministic, fast test suites."
    },
    {
      question: "How does page.frameLocator() eliminate stale element reference exceptions in heavily dynamic iframes?",
      answer: "In legacy tools, driver.switchTo().frame() imperatively mutates the driver's internal pointer to a specific DOM frame handle. If the parent page re-renders or the iframe reloads its source, that handle becomes invalid, throwing StaleElementReferenceException. In contrast, page.frameLocator() is a declarative locator builder. Every time an action (like click or fill) is called on a child locator, Playwright dynamically re-locates the frame in the accessibility tree and auto-waits for actionability before dispatching pointer events.",
      architecturalContext: "Declarative locators encapsulate retry loops and actionability criteria, isolating tests from micro-timing bugs in modern component lifecycles."
    }
  ]
};
