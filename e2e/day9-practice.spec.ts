import { expect, test } from "./fixtures/index.js";
import "./matchers/customMatchers.js";
import { CourseCataloguePage } from "./pages/CourseCataloguePage.js";
import { EnrollmentWizardPage } from "./pages/EnrollmentWizardPage.js";
import { UserManagementPage } from "./pages/UserManagementPage.js";

/**
 * Day 9 Practice Suite: Advanced Architecture, Custom Matchers & Page Object Models (POM)
 * Lab Targets: /app/courses, /app/enrollments, /app/users, /lab/widgets
 */
test.describe("Day 9: Enterprise POM Architecture & Custom Matchers", () => {
  test("Exercise 1: Domain-specific custom matcher toBeAccessibleDialog", async ({ page }) => {
    await page.goto("/lab/widgets");
    await page.getByRole("button", { name: "Open Modal Dialog" }).click();

    const dialog = page.getByRole("dialog", { name: "Confirm Deployment Target" });
    await expect(dialog).toBeVisible();

    // SENIOR SDET PATTERN:
    // Custom matchers encapsulate composite assertions into readable domain expressions.
    // toBeAccessibleDialog checks: aria-modal="true", role="dialog", accessible title, and close control!
    await expect(dialog).toBeAccessibleDialog();
  });

  test("Exercise 2: Course catalogue lifecycle via CourseCataloguePage POM", async ({ adminPage }) => {
    // 1. Instantiate POM with pre-authenticated adminPage fixture
    const coursesPage = new CourseCataloguePage(adminPage);
    await coursesPage.open();

    const suffix = Date.now().toString().slice(-4);
    const courseTitle = `Industrial Playwright Architecture ${suffix}`;
    const courseCode = `ARCH-${suffix}`;

    // 2. Create course through clean POM abstraction
    await coursesPage.createCourse({
      title: courseTitle,
      code: courseCode,
      price: 499,
    });
    await coursesPage.expectCourseVisible(courseTitle);

    // 3. Search and filter through POM
    await coursesPage.search(courseCode);
    await coursesPage.expectCourseVisible(courseTitle);

    // 4. Delete course through POM
    await coursesPage.deleteCourse(courseTitle);
    await coursesPage.expectCourseNotVisible(courseTitle);
  });

  test("Exercise 3: Complete commerce enrollment workflow via EnrollmentWizardPage POM", async ({ page }) => {
    const wizardPage = new EnrollmentWizardPage(page);
    await wizardPage.open();

    const uniqueEmail = `sdet_architect_${Date.now()}@industrial.local`;

    // Complete all 3 steps of the wizard through POM method
    const orderId = await wizardPage.completeFullWizard({
      seats: 4,
      name: "Marcus Aurelius",
      email: uniqueEmail,
    });

    // Verify orderId matches format and appears in the records table
    expect(orderId).toMatch(/^enr_\d+$/);
    await wizardPage.expectOrderInTable(orderId, uniqueEmail);
  });

  test("Exercise 4: Enterprise user management directory via UserManagementPage POM", async ({ adminPage }) => {
    const userPage = new UserManagementPage(adminPage);
    await userPage.open();

    const suffix = Date.now().toString().slice(-4);
    const userName = `Staff QA Engineer ${suffix}`;
    const userEmail = `staff_qa_${suffix}@enterprise.local`;

    // Create user via POM
    await userPage.createUser({
      name: userName,
      email: userEmail,
      department: "Core Platform",
      role: "trainer",
    });

    // Search and verify via POM
    await userPage.search(userName);
    await userPage.expectUserInDirectory(userName);
  });
});
