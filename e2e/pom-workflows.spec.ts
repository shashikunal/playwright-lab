import { expect, test } from "./fixtures/index.js";
import { CourseCataloguePage } from "./pages/CourseCataloguePage.js";
import { EnrollmentWizardPage } from "./pages/EnrollmentWizardPage.js";
import { UserManagementPage } from "./pages/UserManagementPage.js";

test.describe("enterprise Page Object Model workflows", () => {
  test("manages courses using CourseCataloguePage POM @smoke", async ({ adminPage }) => {
    const coursesPage = new CourseCataloguePage(adminPage);
    await coursesPage.open();

    const uniqueId = Date.now().toString().slice(-4);
    const courseTitle = `Mastering Page Objects ${uniqueId}`;
    const courseCode = `POM-${uniqueId}`;

    // Create course via POM
    await coursesPage.createCourse({
      title: courseTitle,
      code: courseCode,
      price: 299,
    });
    await coursesPage.expectCourseVisible(courseTitle);

    // Search via POM
    await coursesPage.search(courseCode);
    await coursesPage.expectCourseVisible(courseTitle);

    // Delete via POM
    await coursesPage.deleteCourse(courseTitle);
    await coursesPage.expectCourseNotVisible(courseTitle);
  });

  test("completes enrollment workflow using EnrollmentWizardPage POM", async ({ page }) => {
    const wizard = new EnrollmentWizardPage(page);
    await wizard.open();

    const orderId = await wizard.completeFullWizard({
      seats: 3,
      name: "Taylor POM User",
      email: "taylor@pom.local",
    });
    expect(orderId).toMatch(/^enr_\d+$/);

    await wizard.expectOrderInTable(orderId, "taylor@pom.local");
  });

  test("manages user directory using UserManagementPage POM", async ({ adminPage }) => {
    const userPage = new UserManagementPage(adminPage);
    await userPage.open();

    const uniqueSuffix = Date.now().toString().slice(-4);
    const userName = `Aaron SDET ${uniqueSuffix}`;
    const userEmail = `aaron_sdet_${uniqueSuffix}@pil.local`;

    await userPage.createUser({
      name: userName,
      email: userEmail,
      department: "Quality Assurance",
      role: "trainer",
    });

    await userPage.search(userName);
    await userPage.expectUserInDirectory(userName);
  });
});
