import { expect, test } from "./fixtures/index.js";

test.describe("enterprise test fixtures and lifecycle architecture", () => {
  test("worker-scoped fixture provides isolated worker namespace", async ({
    workerNamespace,
  }) => {
    expect(workerNamespace).toMatch(/^w\d+_$/);
  });

  test("test-scoped fixture automatically provisions and cleans up test data", async ({
    seededTestData,
    page,
    appClient,
  }) => {
    // 1. Verify fixture created data
    expect(seededTestData.courseId).toBeDefined();
    expect(seededTestData.courseCode).toContain("AUTO-");

    // 2. Verify course is live in backend API
    const res = await appClient.get(`/api/app/courses/${seededTestData.courseId}`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.course.code).toBe(seededTestData.courseCode);

    // 3. Verify course is visible in UI without manual creation
    await page.goto("/app/courses");
    await expect(page.getByText(seededTestData.courseTitle)).toBeVisible();
  });

  test("fixture composition isolates concurrent parallel test executions", async ({
    seededTestData,
    workerNamespace,
  }) => {
    // Proves entity code begins with worker namespace
    expect(seededTestData.courseCode.startsWith(workerNamespace)).toBeTruthy();
  });
});
