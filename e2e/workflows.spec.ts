import { expect, test } from "@playwright/test";

test.describe("enterprise business workflows", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ request }) => {
    await request.post("/api/app/courses/reset");
  });

  test("searches and filters courses in the catalogue @smoke", async ({ page }) => {
    await page.goto("/app/courses");
    await expect(page.getByTestId("course-grid")).toBeVisible();

    // Search query
    await page.getByLabel("Search courses").fill("Locators");
    await expect(page.getByText("Advanced Locators and Frames")).toBeVisible();
    await expect(page.getByText("Playwright Core Automations")).not.toBeVisible();

    // Clear search and category filter
    await page.getByLabel("Search courses").fill("");
    const secResponse = page.waitForResponse(
      (res) => res.url().includes("category=Security") && res.ok(),
    );
    await page.getByRole("button", { name: "Security" }).click();
    await secResponse;
    await expect(page.getByText("Security Testing with Auth Storage States")).toBeVisible();
    await expect(page.getByText("Advanced Locators and Frames")).not.toBeVisible();
  });

  test("enforces role permissions: learner has read-only access", async ({ page }) => {
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
    await expect(page.getByText("Role: learner")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Course" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: /Delete/i })).not.toBeVisible();
  });

  test("trainer can create a new course", async ({ page }) => {
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

    await page.goto("/app/courses");
    await page.getByRole("button", { name: "Create Course" }).click();

    const dialog = page.getByRole("dialog", { name: "Create New Course" });
    await expect(dialog).toBeVisible();

    await page.getByLabel("Course Title").fill("Playwright AI Testing Masterclass");
    await page.getByLabel("Course Code").fill("PW-888");
    await page.getByLabel("Price ($)").fill("599");

    await dialog.getByRole("button", { name: "Create Course" }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByText("Playwright AI Testing Masterclass")).toBeVisible();
    await expect(page.getByText("PW-888")).toBeVisible();
  });

  test("admin can delete a course with confirmation", async ({ page }) => {
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

    await page.goto("/app/courses");
    await expect(page.getByText("Playwright Core Automations")).toBeVisible();

    // Click delete on first course
    await page.getByRole("button", { name: "Delete Playwright Core Automations" }).click();

    const confirmModal = page.getByRole("dialog", { name: "Confirm Course Deletion" });
    await expect(confirmModal).toBeVisible();

    await confirmModal.getByRole("button", { name: "Confirm Delete" }).click();
    await expect(confirmModal).not.toBeVisible();
    await expect(page.getByText("Playwright Core Automations")).not.toBeVisible();
  });

  test("completes multi-step enrollment wizard and submits order", async ({ page }) => {
    await page.goto("/app/enrollments");

    // Step 1: Select course & seats
    await page.getByLabel("Number of Seats (1-10)").fill("3");
    await page.getByRole("button", { name: /Next Step/i }).click();

    // Step 2: Participant details
    await page.getByLabel("Participant / Contact Name").fill("Jordan Quality");
    await page.getByLabel("Participant Email").fill("jordan@enterprise.com");
    await page.getByRole("button", { name: /Review Order/i }).click();

    // Step 3: Review and submit
    await expect(page.getByText("Seats:3")).toBeVisible();
    await expect(page.getByText("Participant:jordan@enterprise.com")).toBeVisible();

    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Confirm & Submit Enrollment" }).click();

    // Confirmation screen
    await expect(page.getByTestId("enrollment-success")).toBeVisible();
    const confId = await page.locator("#enrollment-confirmation").innerText();
    expect(confId).toMatch(/^enr_\d+$/);

    // Order table shows new order
    const table = page.getByTestId("enrollments-table");
    await expect(table.getByText(confId)).toBeVisible();
    await expect(table.getByText("jordan@enterprise.com")).toBeVisible();
  });

  test("admin can approve pending enrollment", async ({ page }) => {
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

    await page.goto("/app/enrollments");

    // enr_102 starts in Pending status
    const pendingRow = page.getByTestId("enrollment-row-enr_102");
    await expect(pendingRow).toBeVisible();
    await expect(pendingRow.getByText("Pending")).toBeVisible();

    // Admin clicks Approve
    await pendingRow.getByRole("button", { name: "Approve" }).click();
    await expect(pendingRow.getByText("Approved")).toBeVisible();
    await expect(pendingRow.getByRole("button", { name: "Approve" })).not.toBeVisible();
  });

  for (const theme of ["light", "dark"] as const) {
    test(`renders courses and enrollments in ${theme} theme`, async ({ page }) => {
      await page.addInitScript((val) => localStorage.setItem("pil-theme", val), theme);
      await page.goto("/app/courses");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Course Catalogue");
    });
  }
});
