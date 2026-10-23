import { expect, test } from "@playwright/test";
import { PracticeLoginPage } from "./pages/PracticeLoginPage.js";

test.describe("Practice Login and Session Management Lab", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ request }) => {
    // Deterministic reset of practice users and session tokens
    await request.post("/api/practice/auth/reset");
  });

  test.afterEach(async ({ request }) => {
    await request.post("/api/practice/auth/reset");
  });

  test("authenticates successfully with valid student credentials and lands on protected dashboard @smoke", async ({
    page,
  }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.open();

    await loginPage.login("student", "Password123!");

    // Verify navigation to protected dashboard
    await expect(page).toHaveURL(/\/practice\/dashboard/);
    await expect(page.getByTestId("welcome-message")).toContainText("Welcome, student!");
    await expect(page.getByTestId("user-role-badge")).toContainText("STUDENT");
    await expect(page.getByTestId("user-email")).toHaveText("student@practice.local");
  });

  test("displays accessible error alert when username is invalid", async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.open();

    await loginPage.login("non_existent_student", "Password123!");

    await loginPage.expectServerError("Invalid username or password");
    await expect(page).toHaveURL(/\/practice\/login/);
  });

  test("displays accessible error alert when password is incorrect", async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.open();

    await loginPage.login("student", "WrongPassword999!");

    await loginPage.expectServerError("Invalid username or password");
    await expect(page).toHaveURL(/\/practice\/login/);
  });

  test("enforces client-side validation when submitting empty fields", async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.open();

    // Click sign in with completely empty fields
    await loginPage.submitBtn.click();
    await loginPage.expectClientError("Please enter both username and password.");

    // Fill username only
    await loginPage.usernameInput.fill("student");
    await loginPage.submitBtn.click();
    await loginPage.expectClientError("Password is required.");

    // Clear username, fill password only
    await loginPage.usernameInput.fill("");
    await loginPage.passwordInput.fill("Password123!");
    await loginPage.submitBtn.click();
    await loginPage.expectClientError("Username is required.");
  });

  test("toggles password field input type between password and text", async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.open();

    await loginPage.passwordInput.fill("SecretPassword123!");
    await loginPage.expectPasswordInputType("password");
    await expect(loginPage.passwordToggleBtn).toHaveAttribute("aria-label", "Show password");

    // Toggle to visible text
    await loginPage.togglePasswordVisibility();
    await loginPage.expectPasswordInputType("text");
    await expect(loginPage.passwordToggleBtn).toHaveAttribute("aria-label", "Hide password");

    // Toggle back to masked password
    await loginPage.togglePasswordVisibility();
    await loginPage.expectPasswordInputType("password");
    await expect(loginPage.passwordToggleBtn).toHaveAttribute("aria-label", "Show password");
  });

  test("disables submit button and shows loading indicator during authentication request", async ({
    page,
  }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.open();

    // Mock an artificial 800ms delay on login endpoint to inspect in-flight state
    await page.route("**/api/practice/auth/login", async (route) => {
      await new Promise((r) => setTimeout(r, 600));
      await route.continue();
    });

    await loginPage.usernameInput.fill("student");
    await loginPage.passwordInput.fill("Password123!");

    // Submit and immediately assert button is disabled to prevent duplicate submissions
    await loginPage.submitBtn.click();
    await expect(loginPage.submitBtn).toBeDisabled();
    await expect(loginPage.submitBtn).toContainText("Signing In...");

    // Wait for successful navigation to complete
    await expect(page).toHaveURL(/\/practice\/dashboard/);
  });

  test("blocks unauthenticated users from directly accessing protected dashboard", async ({ page }) => {
    // Attempt direct navigation without session token in localStorage
    await page.goto("/practice/dashboard");

    // Assert immediate redirection back to login with query param
    await expect(page).toHaveURL(/\/practice\/login\?redirect=/);
    await expect(page.getByRole("heading", { level: 1, name: "Practice Login Portal" })).toBeVisible();
  });

  test("invalidates server session and redirects on sign out", async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.open();
    await loginPage.login("student", "Password123!");

    await expect(page).toHaveURL(/\/practice\/dashboard/);

    // Click Sign Out
    await page.getByTestId("logout-btn").click();

    // Assert redirected back to login with confirmation banner
    await expect(page).toHaveURL(/\/practice\/login\?loggedOut=true/);
    await expect(page.getByTestId("logged-out-banner")).toBeVisible();

    // Try navigating back to /practice/dashboard and verify access is rejected
    await page.goto("/practice/dashboard");
    await expect(page).toHaveURL(/\/practice\/login\?redirect=/);
  });

  test("rejects locked practice accounts with HTTP 423 error notice", async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.open();

    await loginPage.login("locked_user", "Locked123!");

    await loginPage.expectServerError("Account is locked. Please contact system administrator.");
    await expect(page).toHaveURL(/\/practice\/login/);
  });

  test("navigates to forgot-password flow and cancels back to login without submitting", async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.open();

    await loginPage.forgotPasswordLink.click();
    await expect(page).toHaveURL(/\/practice\/forgot-password/);
    await expect(page.getByRole("heading", { level: 1, name: "Practice Password Reset" })).toBeVisible();

    // Click cancel link
    await page.getByTestId("cancel-link").click();
    await expect(page).toHaveURL(/\/practice\/login/);
  });

  test("submits reset request for unknown username and displays user-not-found alert", async ({ page }) => {
    await page.goto("/practice/forgot-password");

    await page.getByTestId("reset-identity-input").fill("unknown_practitioner_user");
    await page.getByTestId("send-reset-btn").click();

    const alert = page.getByTestId("user-not-found-alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("No registered practice user found");
  });

  test("completes end-to-end simulated password reset and signs in with new credentials", async ({
    page,
  }) => {
    // 1. Initiate reset for known user 'student'
    await page.goto("/practice/forgot-password");
    await page.getByTestId("reset-identity-input").fill("student");
    await page.getByTestId("send-reset-btn").click();

    // 2. Verify simulated email confirmation banner
    const banner = page.getByTestId("reset-success-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("Simulated Reset Email Dispatched!");
    await expect(banner).toContainText("st***@practice.local");

    // 3. Proceed to set new password
    await page.getByTestId("proceed-reset-btn").click();
    await expect(page.getByTestId("set-new-password-form")).toBeVisible();

    // 4. Fill matching new password
    await page.getByTestId("new-password-input").fill("BrandNewPass2026!");
    await page.getByTestId("confirm-password-input").fill("BrandNewPass2026!");
    await page.getByTestId("submit-new-password-btn").click();

    // 5. Verify password updated confirmation banner
    await expect(page.getByTestId("password-updated-banner")).toBeVisible();

    // 6. Navigate to login and verify new password authenticates
    await page.getByTestId("back-to-login-link").click();
    await expect(page).toHaveURL(/\/practice\/login/);

    const loginPage = new PracticeLoginPage(page);
    await loginPage.login("student", "BrandNewPass2026!");
    await expect(page).toHaveURL(/\/practice\/dashboard/);
    await expect(page.getByTestId("welcome-message")).toContainText("student");
  });

  test("isolates authentication sessions between concurrent browser contexts", async ({
    browser,
  }) => {
    // Context A: Sign in as student
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    const loginA = new PracticeLoginPage(pageA);
    await loginA.open();
    await loginA.login("student", "Password123!");
    await expect(pageA).toHaveURL(/\/practice\/dashboard/);

    // Context B: Fresh context without credentials
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await pageB.goto("/practice/dashboard");

    // Context B must be redirected to login because storage is completely isolated
    await expect(pageB).toHaveURL(/\/practice\/login\?redirect=/);

    await contextA.close();
    await contextB.close();
  });

  test("supports keyboard navigation across form controls and submit", async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.open();

    // Focus username input via tab navigation
    await loginPage.usernameInput.focus();
    await page.keyboard.type("student");

    // Tab to password
    await page.keyboard.press("Tab");
    await expect(loginPage.passwordInput).toBeFocused();
    await page.keyboard.type("Password123!");

    // Tab to password toggle button and trigger via Enter
    await page.keyboard.press("Tab");
    await expect(loginPage.passwordToggleBtn).toBeFocused();
    await page.keyboard.press("Enter");
    await loginPage.expectPasswordInputType("text");

    // Tab to forgot password link then to submit button
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(loginPage.submitBtn).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/\/practice\/dashboard/);
  });

  for (const theme of ["light", "dark"] as const) {
    test(`renders practice login and dashboard with fidelity in ${theme} theme`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem("pil-theme", t), theme);
      const loginPage = new PracticeLoginPage(page);
      await loginPage.open();

      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.getByTestId("login-card")).toBeVisible();

      // Log in and verify dashboard in same theme
      await loginPage.login("student", "Password123!");
      await expect(page).toHaveURL(/\/practice\/dashboard/);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.getByTestId("session-info")).toBeVisible();
    });
  }
});
