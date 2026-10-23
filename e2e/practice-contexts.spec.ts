import { expect, test } from "@playwright/test";

test.describe("Playwright Browser Contexts, Pages, Tabs, and Navigation — Hands-On Practice", () => {
  // Exercise 1: Navigate using baseURL and relative URLs
  test("Exercise 1: Navigate using baseURL and relative path", async ({ page }) => {
    // Navigate with a relative path; Playwright automatically resolves baseURL (http://localhost:5173)
    await page.goto("/lab/browser");

    // Verify relative URL resolution
    await expect(page).toHaveURL(/.*\/lab\/browser$/);
    await expect(page.getByRole("heading", { name: "Browser & Window Interactions" })).toBeVisible();
  });

  // Exercise 2: Assert destination URL and page title
  test("Exercise 2: Assert destination URL and page title across navigation", async ({ page }) => {
    await page.goto("/lab/browser");

    // Title and URL assertions on initial page
    await expect(page).toHaveURL(/\/lab\/browser/);
    await expect(page).toHaveTitle(/Playwright Industrial Lab/);

    // Navigate to Practice Login
    await page.goto("/practice/login");
    await expect(page).toHaveURL(/\/practice\/login/);
    await expect(page.getByTestId("practice-login-portal")).toBeVisible();
  });

  // Exercise 3: Create two isolated browser contexts
  test("Exercise 3: Create two isolated browser contexts in a single test", async ({ browser }) => {
    // Context 1 (e.g. User A)
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await pageA.goto("/lab/browser");
    await pageA.getByTestId("local-key-input").fill("context_tracker");
    await pageA.getByTestId("local-val-input").fill("session_context_A");
    await pageA.getByTestId("save-local-btn").click();

    // Context 2 (e.g. User B)
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await pageB.goto("/lab/browser");

    // Verify Context B does not have Context A's localStorage
    await pageB.getByTestId("local-key-input").fill("context_tracker");
    await pageB.getByTestId("read-local-btn").click();
    await expect(pageB.getByTestId("local-storage-val")).toHaveText("Value: (null)");

    // Cleanup contexts
    await contextA.close();
    await contextB.close();
  });

  // Exercise 4: Prove cookie and session isolation between contexts
  test("Exercise 4: Prove cookie and session isolation between contexts", async ({ browser }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    // Context A fetches server cookie
    const pageA = await contextA.newPage();
    await pageA.goto("/lab/browser");
    await pageA.getByTestId("trigger-cookie-btn").click();
    await expect(pageA.getByTestId("cookie-status")).toContainText("pil_server_cookie");

    const cookiesA = await contextA.cookies();
    const serverCookieA = cookiesA.find((c) => c.name === "pil_server_cookie");
    expect(serverCookieA).toBeDefined();
    expect(serverCookieA?.value).toBe("token_xyz_987");

    // Context B inspects cookies; should have zero cookies
    const cookiesB = await contextB.cookies();
    const serverCookieB = cookiesB.find((c) => c.name === "pil_server_cookie");
    expect(serverCookieB).toBeUndefined();

    await contextA.close();
    await contextB.close();
  });

  // Exercise 5: Open a popup and validate its content
  test("Exercise 5: Open a popup window and validate content", async ({ page }) => {
    await page.goto("/lab/browser");

    // 1. Register popup listener BEFORE triggering action to prevent race condition
    const popupPromise = page.waitForEvent("popup");

    // 2. Click button that calls window.open()
    await page.getByTestId("open-popup-btn").click();

    // 3. Await the popup Page instance
    const popup = await popupPromise;

    // 4. Assert URL and content inside popup
    await expect(popup).toHaveURL(/.*\/lab\/browser\/popup-content/);
    await expect(popup.getByTestId("popup-title")).toHaveText("Popup Inspection Target");
    await expect(popup.getByTestId("popup-close-btn")).toBeVisible();

    // 5. Close popup and assert state
    await popup.close();
    expect(popup.isClosed()).toBe(true);
  });

  // Exercise 6: Handle a link that opens a new page/tab
  test("Exercise 6: Handle a link that opens a new page with target='_blank'", async ({ page }) => {
    await page.goto("/lab/browser");

    // Register popup event for link with target="_blank"
    const newPagePromise = page.waitForEvent("popup");
    await page.getByTestId("open-tab-link").click();
    const newPage = await newPagePromise;

    // Validate new tab
    await expect(newPage).toHaveURL(/.*\/lab\/browser\/popup-content/);
    await expect(newPage.getByRole("heading", { name: "Popup Inspection Target" })).toBeVisible();

    // Close new tab
    await newPage.close();
    expect(newPage.isClosed()).toBe(true);

    // Verify original page remains intact
    await expect(page.getByRole("heading", { name: "Browser & Window Interactions" })).toBeVisible();
  });

  // Exercise 7: Save and reuse authentication state safely
  test("Exercise 7: Save and reuse storage state for authenticated workflows", async ({ browser }) => {
    // Setup context: simulate login and save storage state
    const setupContext = await browser.newContext();
    const setupPage = await setupContext.newPage();
    await setupPage.goto("/practice/login");
    await setupPage.getByLabel("Practice Username").fill("student");
    await setupPage.getByLabel("Practice Password").fill("Password123!");
    await setupPage.getByRole("button", { name: "Sign in" }).click();
    await setupPage.waitForURL("**/practice/dashboard");

    // Extract storage state in-memory
    const storage = await setupContext.storageState();
    await setupContext.close();

    // Consumer context: bootstrap with saved storage state
    const authedContext = await browser.newContext({ storageState: storage });
    const authedPage = await authedContext.newPage();

    // Direct navigation without logging in again
    await authedPage.goto("/practice/dashboard");
    await expect(authedPage.getByTestId("welcome-message")).toContainText("Welcome, student!");
    await expect(authedPage.getByTestId("logout-btn")).toBeVisible();

    await authedContext.close();
  });

  // Exercise 8: Test logout and protected-route access
  test("Exercise 8: Verify logout and protected route redirection", async ({ page }) => {
    // Login
    await page.goto("/practice/login");
    await page.getByLabel("Practice Username").fill("student");
    await page.getByLabel("Practice Password").fill("Password123!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/practice\/dashboard/);

    // Logout
    await page.getByTestId("logout-btn").click();
    await expect(page).toHaveURL(/.*\/practice\/login\?loggedOut=true/);
    await expect(page.getByText("You have been signed out successfully.")).toBeVisible();

    // Attempt direct protected-route navigation after logout
    await page.goto("/practice/dashboard");
    await expect(page).toHaveURL(/.*\/practice\/login\?redirect=\/practice\/dashboard/);
  });

  // Exercise 9: Interact with a form inside an iframe and nested child frame
  test("Exercise 9: Interact with controls inside nested iframes using frameLocator", async ({ page }) => {
    await page.goto("/lab/browser");

    // Outer frameLocator
    const outerFrame = page.frameLocator('iframe[title="Embedded Widget Frame"]');
    await expect(outerFrame.getByTestId("frame-heading")).toHaveText("Embedded Iframe Document");

    // Fill input inside outer frame
    const input = outerFrame.getByPlaceholder("Type inside iframe...");
    await input.fill("Playwright Frame Testing");
    await expect(input).toHaveValue("Playwright Frame Testing");

    // Chained frameLocator to interact with inner nested iframe
    const nestedFrame = outerFrame.frameLocator('iframe[title="Nested Inner Frame"]');
    await expect(nestedFrame.getByTestId("nested-title")).toHaveText("Inner Nested Frame");
    await expect(nestedFrame.getByTestId("nested-status")).toHaveText("Inner Frame Ready");

    await nestedFrame.getByTestId("nested-action-btn").click();
    await expect(nestedFrame.getByTestId("nested-status")).toHaveText("Inner Action Triggered");
  });

  // Exercise 10: Diagnose an unexpected redirect or navigation timeout with waitForURL
  test("Exercise 10: Handle redirect navigation deterministically with waitForURL", async ({ page }) => {
    // Direct attempt to visit protected dashboard redirects to login
    await page.goto("/practice/dashboard");

    // Await deterministic redirect completion
    await page.waitForURL(/\/practice\/login\?redirect=\/practice\/dashboard/);
    await expect(page.getByTestId("practice-login-portal")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  // Exercise 11: Test two users concurrently without shared-session leakage
  test("Exercise 11: Test two distinct users concurrently across isolated contexts", async ({ browser }) => {
    // User 1: Student session
    const studentContext = await browser.newContext();
    const studentPage = await studentContext.newPage();
    await studentPage.goto("/practice/login");
    await studentPage.getByLabel("Practice Username").fill("student");
    await studentPage.getByLabel("Practice Password").fill("Password123!");
    await studentPage.getByRole("button", { name: "Sign in" }).click();
    await expect(studentPage).toHaveURL(/\/practice\/dashboard/);
    await expect(studentPage.getByTestId("welcome-message")).toContainText("Welcome, student!");
    await expect(studentPage.getByTestId("user-role-badge")).toContainText("STUDENT");

    // User 2: Practitioner session in separate context
    const practitionerContext = await browser.newContext();
    const practitionerPage = await practitionerContext.newPage();
    await practitionerPage.goto("/practice/login");
    await practitionerPage.getByLabel("Practice Username").fill("practitioner");
    await practitionerPage.getByLabel("Practice Password").fill("SecurePractice2026!");
    await practitionerPage.getByRole("button", { name: "Sign in" }).click();
    await expect(practitionerPage).toHaveURL(/\/practice\/dashboard/);
    await expect(practitionerPage.getByTestId("welcome-message")).toContainText("Welcome, practitioner!");
    await expect(practitionerPage.getByTestId("user-role-badge")).toContainText("PRACTITIONER");

    // Re-verify Student context is unaffected by Practitioner login
    await studentPage.reload();
    await expect(studentPage.getByTestId("welcome-message")).toContainText("Welcome, student!");

    await studentContext.close();
    await practitionerContext.close();
  });

  // Exercise 12: Complete a senior-level multi-page workflow
  test("Exercise 12: Complete a senior-level multi-page workflow", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Navigate to browser lab
    await page.goto("/lab/browser");

    // 2. Spawn and interact with popup page
    const popupPromise = page.waitForEvent("popup");
    await page.getByTestId("open-popup-btn").click();
    const popup = await popupPromise;
    await expect(popup.getByTestId("popup-title")).toBeVisible();

    // 3. Write data to localStorage in popup
    await popup.evaluate(() => localStorage.setItem("cross_page_key", "cross_page_value"));

    // 4. Verify original page in the same context shares the localStorage
    const sharedVal = await page.evaluate(() => localStorage.getItem("cross_page_key"));
    expect(sharedVal).toBe("cross_page_value");

    // 5. Close popup
    await popup.close();
    expect(popup.isClosed()).toBe(true);

    // 6. Interact with nested iframes on main page
    const outerFrame = page.frameLocator('iframe[title="Embedded Widget Frame"]');
    await outerFrame.getByTestId("frame-increment-btn").click();
    await expect(outerFrame.getByTestId("frame-counter-val")).toHaveText("Count: 1");

    await context.close();
  });
});
