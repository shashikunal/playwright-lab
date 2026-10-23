import { expect, test } from "@playwright/test";

/**
 * Day 7 Practice Suite: Enterprise Auth, RBAC & End-to-End Business Workflows
 * Lab Targets: /login, /app/courses, /app/users, /app/enrollments
 */
test.describe("Day 7: Enterprise Authentication & Business Workflows", () => {
  test.beforeEach(async ({ request }) => {
    await request.post("/api/app/courses/reset");
    await request.post("/api/app/enrollments/reset");
    await request.post("/api/app/business/reset");
  });

  test("Exercise 1: Storage-State injection for instant zero-overhead authentication", async ({ page }) => {
    // SENIOR SDET PRINCIPLE:
    // Instead of repeating login form typing for 500 tests, inject pre-authenticated
    // session storage state. This saves 2-3 seconds per test and prevents login endpoint bottlenecks!
    await page.addInitScript(() => {
      localStorage.setItem("pil-auth-token", "tok_learner_session");
      localStorage.setItem(
        "pil-auth-profile",
        JSON.stringify({
          id: "usr_learner",
          email: "learner@pil.local",
          name: "Alex Learner",
          role: "learner",
          token: "tok_learner_session",
        }),
      );
    });

    // Navigate directly into protected area
    await page.goto("/app/courses");

    // Immediately authenticated without visiting /login
    await expect(page.getByText("Alex Learner")).toBeVisible();
    await expect(page.getByText("Role: learner")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign Out" })).toBeVisible();
  });

  test("Exercise 2: Role-Based Access Control (RBAC) permission boundaries", async ({ page, context }) => {
    // 1. Learner context: Learner has read-only access
    await page.addInitScript(() => {
      localStorage.setItem("pil-auth-token", "tok_learner_session");
      localStorage.setItem(
        "pil-auth-profile",
        JSON.stringify({
          id: "usr_learner",
          email: "learner@pil.local",
          name: "Alex Learner",
          role: "learner",
          token: "tok_learner_session",
        }),
      );
    });
    await page.goto("/app/courses");
    await expect(page.getByRole("button", { name: "Create Course" })).not.toBeVisible();

    // 2. Admin context in a separate fresh page to avoid initScript collision
    const adminPage = await context.newPage();
    await adminPage.addInitScript(() => {
      localStorage.setItem("pil-auth-token", "tok_admin_session");
      localStorage.setItem(
        "pil-auth-profile",
        JSON.stringify({
          id: "usr_admin",
          email: "admin@pil.local",
          name: "Sam Admin",
          role: "admin",
          token: "tok_admin_session",
        }),
      );
    });
    await adminPage.goto("/app/courses");

    // As an Admin, admin controls MUST be visible
    await expect(adminPage.getByText("Sam Admin")).toBeVisible();
    await expect(adminPage.getByText("Role: admin")).toBeVisible();
    await expect(adminPage.getByRole("button", { name: "Create Course" })).toBeVisible();
    await adminPage.close();
  });

  test("Exercise 3: Complete course enrollment order flow", async ({ page }) => {
    // Authenticate as Learner
    await page.addInitScript(() => {
      localStorage.setItem("pil-auth-token", "tok_learner_session");
      localStorage.setItem(
        "pil-auth-profile",
        JSON.stringify({
          id: "usr_learner",
          email: "learner@pil.local",
          name: "Alex Learner",
          role: "learner",
          token: "tok_learner_session",
        }),
      );
    });

    await page.goto("/app/enrollments");

    // Step 1: Select seats
    await page.getByLabel("Number of Seats (1-10)").fill("3");
    await page.getByRole("button", { name: /Next Step/i }).click();

    // Step 2: Participant details
    const uniqueEmail = `qa_${Date.now()}@enterprise.com`;
    await page.getByLabel("Participant / Contact Name").fill("Jordan Quality");
    await page.getByLabel("Participant Email").fill(uniqueEmail);
    await page.getByRole("button", { name: /Review Order/i }).click();

    // Step 3: Review and submit
    await expect(page.getByText("Seats:3")).toBeVisible();
    await expect(page.getByText(`Participant:${uniqueEmail}`)).toBeVisible();

    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Confirm & Submit Enrollment" }).click();

    // Verify order completion confirmation banner
    const successBanner = page.getByTestId("enrollment-success");
    await expect(successBanner).toBeVisible();
    await expect(successBanner.getByRole("heading", { name: /Enrollment Successfully Placed/i })).toBeVisible();
  });

  test("Exercise 4: Enterprise user management data grid & debounced search", async ({ page }) => {
    // Authenticate as Admin
    await page.addInitScript(() => {
      localStorage.setItem("pil-auth-token", "tok_admin_session");
      localStorage.setItem(
        "pil-auth-profile",
        JSON.stringify({
          id: "usr_admin",
          email: "admin@pil.local",
          name: "Sam Admin",
          role: "admin",
          token: "tok_admin_session",
        }),
      );
    });

    await page.goto("/app/users");

    // User directory table renders initial users
    await expect(page.getByText("Ada Lovelace")).toBeVisible();
    await expect(page.getByText("Alan Turing")).toBeVisible();

    // Search by name with debounced query
    const searchInput = page.getByRole("searchbox", { name: "Search users" });
    await searchInput.fill("Lovelace");

    // Verify filtered table row
    await expect(page.getByText("Ada Lovelace")).toBeVisible();
    await expect(page.getByText("Alan Turing")).not.toBeVisible();
  });
});
