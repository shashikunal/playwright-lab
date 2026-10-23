import { expect, test } from "./fixtures/index.js";
import { EnrollmentWizardPage } from "./pages/EnrollmentWizardPage.js";

test.describe("hybrid APIRequestContext and UI integrated testing", () => {
  test("creates entity via API in milliseconds and asserts DOM rendering in UI", async ({
    appClient,
    adminPage,
    workerNamespace,
  }) => {
    const timestamp = Date.now();
    const courseCode = `${workerNamespace}FAST-${timestamp.toString().slice(-4)}`;
    const courseTitle = `${workerNamespace} Fast API Provisioned Course ${timestamp}`;

    // 1. Instant API setup (<50ms)
    const createRes = await appClient.post("/api/app/courses", {
      data: {
        code: courseCode,
        title: courseTitle,
        category: "Network",
        difficulty: "advanced",
        seats: 12,
        price: 499,
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const { course } = await createRes.json();

    // 2. Assert in browser UI
    await adminPage.goto("/app/courses");
    await expect(adminPage.getByText(courseTitle)).toBeVisible();
    await expect(adminPage.getByText(courseCode)).toBeVisible();

    // Cleanup via API
    await appClient.delete(`/api/app/courses/${course.id}`);
  });

  test("submits transaction via UI and audits backend state and activity log via API", async ({
    adminPage,
    appClient,
  }) => {
    const wizard = new EnrollmentWizardPage(adminPage);
    await wizard.open();

    const confId = await wizard.completeFullWizard({
      seats: 2,
      name: "Hybrid Test User",
      email: "hybrid@pil.local",
    });
    expect(confId).toMatch(/^enr_\d+$/);

    // Assert backend API state directly
    const enrollmentsRes = await appClient.get("/api/app/enrollments", {
      headers: {
        Authorization: "Bearer tok_admin_session",
      },
    });
    expect(enrollmentsRes.ok()).toBeTruthy();
    const { enrollments } = await enrollmentsRes.json();
    const record = enrollments.find((e: { id: string }) => e.id === confId);
    expect(record).toBeDefined();
    expect(["admin@pil.local", "hybrid@pil.local"]).toContain(record.userEmail);
    expect(record.seats).toBe(2);
    expect(record.status).toBe("Pending");

    // Assert activity log contains enrollment action
    const activityRes = await appClient.get("/api/app/activity");
    expect(activityRes.ok()).toBeTruthy();
    const { activities } = await activityRes.json();
    const auditEntry = activities.find(
      (a: { action: string; target: string }) =>
        a.action === "enrollment_submitted" && a.target.includes(confId),
    );
    expect(auditEntry).toBeDefined();
  });
});
