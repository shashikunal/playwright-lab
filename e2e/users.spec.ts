import { expect, test } from "@playwright/test";

test.describe("enterprise user management and business features", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ request }) => {
    // Reset business application store to initial seed before each test
    await request.post("/api/app/business/reset");
  });

  test("enforces role permissions: learner is forbidden from accessing user directory @smoke", async ({
    page,
  }) => {
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

    await page.goto("/app/users");
    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(page.getByRole("heading", { name: /Access Denied/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add User" })).not.toBeVisible();
  });

  test("trainer can view user directory in read-only mode", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("pil-auth-token", "tok_trainer_session");
      localStorage.setItem(
        "pil-auth-profile",
        JSON.stringify({
          id: "usr_trainer",
          email: "trainer@pil.local",
          name: "Morgan Trainer",
          role: "trainer",
          token: "tok_trainer_session",
        }),
      );
    });

    await page.goto("/app/users");
    await expect(page.getByRole("heading", { name: "User & Employee Directory" })).toBeVisible();
    await expect(page.getByRole("table", { name: "User directory" })).toBeVisible();
    await expect(page.getByText("Ada Lovelace")).toBeVisible();

    // Trainer cannot add user
    await expect(page.getByRole("button", { name: "Add User" })).not.toBeVisible();
    await expect(page.getByText("Read-only").first()).toBeVisible();
  });

  test("admin can search, filter, and sort users @smoke", async ({ page }) => {
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
    await expect(page.getByText("Ada Lovelace")).toBeVisible();
    await expect(page.getByText("Alan Turing")).toBeVisible();

    // Search for Ada
    await page.getByRole("searchbox", { name: "Search users" }).fill("Lovelace");
    await expect(page.getByText("Ada Lovelace")).toBeVisible();
    await expect(page.getByText("Alan Turing")).not.toBeVisible();

    // Clear search
    await page.getByRole("searchbox", { name: "Search users" }).fill("");
    await expect(page.getByText("Alan Turing")).toBeVisible();

    // Filter by role: trainer
    await page.getByLabel("Filter by role").selectOption("trainer");
    await expect(page.getByText("Alan Turing")).toBeVisible();
    await expect(page.getByText("Ada Lovelace")).not.toBeVisible();

    // Reset filter
    await page.getByLabel("Filter by role").selectOption("all");
    await expect(page.getByText("Ada Lovelace")).toBeVisible();
  });

  test("admin can create a new user with validation and persistence", async ({ page }) => {
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
    await page.getByRole("button", { name: "Add User" }).click();

    const dialog = page.getByRole("dialog", { name: "Add New Enterprise User" });
    await expect(dialog).toBeVisible();

    await dialog.getByLabel("Full Name").fill("Dorothy Vaughan");
    await dialog.getByLabel("Corporate Email").fill("dorothy.vaughan@pil.local");
    await dialog.getByLabel("Assigned Role").selectOption("learner");
    await dialog.getByLabel("Department").fill("West Area Computing");

    await dialog.getByRole("button", { name: "Create User" }).click();
    await expect(dialog).not.toBeVisible();

    // User is created and appears in the list
    await expect(page.getByText("Dorothy Vaughan")).toBeVisible();
    await expect(page.getByText("West Area Computing")).toBeVisible();
  });

  test("admin can edit, toggle status, and delete a user with confirmation", async ({ page }) => {
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
    await expect(page.getByText("Alan Turing")).toBeVisible();

    // Toggle status
    await page.getByRole("button", { name: "Toggle status for Alan Turing" }).click();
    await expect(page.getByRole("status")).toContainText("Status of Alan Turing changed to Inactive");

    // Edit Alan Turing
    await page.getByRole("button", { name: "Edit Alan Turing" }).click();
    const editDialog = page.getByRole("dialog", { name: /Edit User:/i });
    await expect(editDialog).toBeVisible();
    await editDialog.getByLabel("Department").fill("Advanced Theoretical Lab");
    await editDialog.getByRole("button", { name: "Save Changes" }).click();
    await expect(editDialog).not.toBeVisible();
    await expect(page.getByText("Advanced Theoretical Lab")).toBeVisible();

    // Delete Margaret Hamilton
    await page.getByRole("button", { name: "Delete user Margaret Hamilton" }).click();
    const deleteDialog = page.getByRole("dialog", { name: "Confirm Deletion" });
    await expect(deleteDialog).toBeVisible();
    await deleteDialog.getByRole("button", { name: "Delete User" }).click();
    await expect(deleteDialog).not.toBeVisible();
    await expect(page.getByRole("table").getByText("Margaret Hamilton")).not.toBeVisible();
  });

  test("admin can perform bulk status updates", async ({ page }) => {
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
    await page.getByRole("checkbox", { name: "Select all users on this page" }).click();

    const bulkToolbar = page.getByRole("region", { name: "Bulk actions toolbar" });
    await expect(bulkToolbar).toBeVisible();

    await bulkToolbar.getByRole("button", { name: "Deactivate" }).click();
    await expect(page.getByRole("status")).toContainText("Successfully set");
  });

  test("course detail page displays syllabus accordion and links to enrollment @smoke", async ({
    page,
  }) => {
    await page.goto("/app/courses/crs_01");
    await expect(page.getByRole("heading", { name: "Playwright Core Automations" })).toBeVisible();
    await expect(page.getByText("Dr. Evelyn Vance")).toBeVisible();
    await expect(page.getByText("Course Tuition")).toBeVisible();

    // Expand accordion module
    const module2Btn = page.getByRole("button", { name: /Module 2:/i });
    await expect(module2Btn).toBeVisible();
    await module2Btn.click();
    await expect(
      page.getByText("Master page.route, abort conditions, and latency simulation techniques."),
    ).toBeVisible();

    // Enroll CTA navigates to enrollment wizard with preselected course
    await page.getByRole("button", { name: "Enroll Now" }).click();
    await expect(page).toHaveURL(/\/app\/enrollments\?courseId=crs_01/);
  });

  test("user profile settings saves notification preferences and views audit log", async ({
    page,
  }) => {
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

    await page.goto("/app/profile");
    await expect(page.getByRole("heading", { name: "Account Settings & Profile" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sam Admin" })).toBeVisible();
    await expect(page.getByText("admin@pil.local").first()).toBeVisible();

    // Toggle preferences and save
    await page.getByLabel("SMS Alerts").check();
    await page.getByRole("button", { name: "Save Preferences" }).click();
    await expect(page.getByRole("status")).toContainText(
      "Notification preferences saved successfully.",
    );

    // Audit log has events
    await expect(page.getByRole("heading", { name: "Recent Activity Audit Log" })).toBeVisible();
    await expect(page.getByText("CI/CD & Parallel Sharding Pipelines")).toBeVisible();
  });
});
