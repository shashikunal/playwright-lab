import { Locator, Page, expect } from "@playwright/test";
import { test as fixtureTest } from "./fixtures/index.js";
import { CourseCataloguePage } from "./pages/CourseCataloguePage.js";
import { PracticeLoginPage } from "./pages/PracticeLoginPage.js";

// ─── REUSABLE COMPONENT OBJECT ───────────────────────────────────────
export class CourseCreateDialogComponent {
  readonly dialog: Locator;
  readonly titleInput: Locator;
  readonly codeInput: Locator;
  readonly priceInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole("dialog", { name: "Create New Course" });
    this.titleInput = this.dialog.getByLabel("Course Title");
    this.codeInput = this.dialog.getByLabel("Course Code");
    this.priceInput = this.dialog.getByLabel("Price ($)");
    this.submitButton = this.dialog.getByRole("button", { name: "Create Course" });
  }

  async isVisible(): Promise<boolean> {
    return this.dialog.isVisible();
  }

  async fillAndSubmit(data: { title: string; code: string; price: number }) {
    await expect(this.dialog).toBeVisible();
    await this.titleInput.fill(data.title);
    await this.codeInput.fill(data.code);
    await this.priceInput.fill(String(data.price));
    await this.submitButton.click();
    await expect(this.dialog).not.toBeVisible();
  }
}

// ─── REUSABLE API HELPER ─────────────────────────────────────────────
export class CourseApiHelper {
  private request: import("@playwright/test").APIRequestContext;
  private token: string;

  constructor(request: import("@playwright/test").APIRequestContext, token = "tok_admin_session") {
    this.request = request;
    this.token = token;
  }

  async createCourse(data: { code: string; title: string; category?: string; price?: number; seats?: number }) {
    const res = await this.request.post("http://127.0.0.1:3001/api/app/courses", {
      headers: { Authorization: `Bearer ${this.token}` },
      data: {
        category: "DevOps",
        difficulty: "intermediate",
        seats: 25,
        price: 299,
        ...data,
      },
    });
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    return json.course;
  }

  async deleteCourse(id: string) {
    const res = await this.request.delete(`http://127.0.0.1:3001/api/app/courses/${id}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return res.ok();
  }
}

// ─── EXTENDED TEST WITH POM FIXTURE ──────────────────────────────────
export const test = fixtureTest.extend<{
  loginPage: PracticeLoginPage;
  coursesPage: CourseCataloguePage;
}>({
  loginPage: async ({ page }, use) => {
    const lp = new PracticeLoginPage(page);
    await lp.open();
    await use(lp);
  },
  coursesPage: async ({ adminPage }, use) => {
    const cp = new CourseCataloguePage(adminPage);
    await cp.open();
    await use(cp);
  },
});

// ─── HANDS-ON PRACTICE SUITE (12 EXERCISES) ──────────────────────────
test.describe("Playwright Page Object Model and Enterprise Test Architecture — Hands-On Practice", () => {
  // Exercise 1: Write a test using direct locators
  test("Exercise 1: Write a test using direct locators", async ({ page }) => {
    await page.goto("/practice/login");
    await expect(page.getByRole("heading", { level: 1, name: "Practice Login Portal" })).toBeVisible();

    const usernameInput = page.getByLabel("Practice Username");
    const passwordInput = page.getByLabel("Practice Password");
    const submitBtn = page.getByTestId("submit-btn");

    await usernameInput.fill("");
    await passwordInput.fill("");
    await submitBtn.click();

    const clientError = page.getByTestId("client-error");
    await expect(clientError).toBeVisible();
    await expect(clientError).toContainText(/Please enter both username and password/i);
  });

  // Exercise 2: Extract a simple login page object
  test("Exercise 2: Extract and consume a simple PracticeLoginPage POM", async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.open();

    await loginPage.login("student", "WrongPassword999!");
    await loginPage.expectServerError(/Invalid username or password/i);
  });

  // Exercise 3: Add typed methods and locators to a page class
  test("Exercise 3: Use typed methods on page class to verify password reveal", async ({ page }) => {
    const loginPage = new PracticeLoginPage(page);
    await loginPage.open();

    await loginPage.passwordInput.fill("secretPassword456");
    await loginPage.expectPasswordInputType("password");

    // Toggle reveal
    await loginPage.togglePasswordVisibility();
    await loginPage.expectPasswordInputType("text");
  });

  // Exercise 4: Create a reusable form component object
  test("Exercise 4: Create and use a reusable CourseCreateDialogComponent", async ({ adminPage, workerNamespace }) => {
    const coursesPage = new CourseCataloguePage(adminPage);
    await coursesPage.open();

    await coursesPage.createCourseButton.click();

    const dialog = new CourseCreateDialogComponent(adminPage);
    const uniqueSuffix = Date.now().toString().slice(-4);
    const courseTitle = `${workerNamespace} Component Dialog Course ${uniqueSuffix}`;
    const courseCode = `${workerNamespace}COMP-${uniqueSuffix}`;

    await dialog.fillAndSubmit({
      title: courseTitle,
      code: courseCode,
      price: 249,
    });

    await coursesPage.expectCourseVisible(courseTitle);

    // Teardown
    await coursesPage.deleteCourse(courseTitle);
  });

  // Exercise 5: Integrate page objects with custom fixtures
  test("Exercise 5: Integrate page objects with custom fixtures (loginPage)", async ({ loginPage }) => {
    // loginPage was instantiated and navigated automatically by the fixture
    await loginPage.login("student", "WrongPassword999!");
    await loginPage.expectServerError(/Invalid username or password/i);
  });

  // Exercise 6: Build an API helper for test setup
  test("Exercise 6: Build an API helper for fast test data provisioning", async ({ request, adminPage, workerNamespace }) => {
    const apiHelper = new CourseApiHelper(request);
    const uniqueSuffix = Date.now().toString().slice(-4);
    const code = `${workerNamespace}API-${uniqueSuffix}`;
    const title = `${workerNamespace} API Helper Course ${uniqueSuffix}`;

    // Fast API setup (25ms)
    const created = await apiHelper.createCourse({ code, title });
    expect(created.id).toBeDefined();

    // UI inspection via POM
    const coursesPage = new CourseCataloguePage(adminPage);
    await coursesPage.open();
    await coursesPage.search(code);
    await coursesPage.expectCourseVisible(title);

    // Clean teardown via API helper
    await apiHelper.deleteCourse(created.id);
  });

  // Exercise 7: Refactor duplicated test code without hiding assertions
  test("Exercise 7: Refactor actions into POM while keeping assertions explicit", async ({ coursesPage, request, workerNamespace }) => {
    const apiHelper = new CourseApiHelper(request);
    const uniqueCode = `${workerNamespace}REF-${Date.now().toString().slice(-4)}`;
    const uniqueTitle = `${workerNamespace} Explicit Assertion Course`;

    const course = await apiHelper.createCourse({ code: uniqueCode, title: uniqueTitle });

    // Action encapsulated in POM
    await coursesPage.search(uniqueCode);

    // Domain assertion remains explicit in the test!
    await expect(coursesPage.courseGrid.getByText(uniqueTitle)).toBeVisible();

    await apiHelper.deleteCourse(course.id);
  });

  // Exercise 8: Compare direct tests against a POM implementation
  test("Exercise 8: Compare direct locators vs POM fidelity", async ({ page }) => {
    // Both approaches yield identical web-first assertion guarantees
    const loginPage = new PracticeLoginPage(page);
    await loginPage.open();

    // POM method abstracts element querying without sacrificing actionability checks
    await loginPage.quickFillStudentBtn.click();
    await expect(loginPage.usernameInput).toHaveValue("student");
    await expect(loginPage.passwordInput).toHaveValue("Password123!");
  });

  // Exercise 9: Diagnose an oversized or overly coupled page object
  test("Exercise 9: Compose focused components rather than a monolithic God Page", async ({ adminPage, workerNamespace }) => {
    const coursesPage = new CourseCataloguePage(adminPage);
    await coursesPage.open();

    // Open create dialog and verify modular component handles modal interactions
    await coursesPage.createCourseButton.click();
    const createDialog = new CourseCreateDialogComponent(adminPage);
    expect(await createDialog.isVisible()).toBe(true);

    const title = `${workerNamespace} Modular Architecture ${Date.now().toString().slice(-4)}`;
    const code = `${workerNamespace}MOD-${Date.now().toString().slice(-4)}`;

    await createDialog.fillAndSubmit({ title, code, price: 399 });
    await coursesPage.expectCourseVisible(title);

    await coursesPage.deleteCourse(title);
  });

  // Exercise 10: Design a maintainable multi-role workflow
  test("Exercise 10: Multi-role workflow using POM across separate browser contexts", async ({
    adminPage,
    learnerPage,
    workerNamespace,
  }) => {
    const adminCoursesPage = new CourseCataloguePage(adminPage);
    const learnerCoursesPage = new CourseCataloguePage(learnerPage);

    await adminCoursesPage.open();
    await learnerCoursesPage.open();

    // Admin creates course
    const title = `${workerNamespace} Multi-Role POM Course ${Date.now().toString().slice(-4)}`;
    const code = `${workerNamespace}MROLE-${Date.now().toString().slice(-4)}`;
    await adminCoursesPage.createCourse({ title, code, price: 199 });

    // Learner searches and views course in isolated context
    await learnerCoursesPage.search(code);
    await learnerCoursesPage.expectCourseVisible(title);
    // Learner cannot see delete or create buttons
    await expect(learnerCoursesPage.createCourseButton).not.toBeVisible();

    // Cleanup
    await adminCoursesPage.deleteCourse(title);
  });

  // Exercise 11: Verify independent execution of tests using page objects
  test("Exercise 11: Verify independent parallel execution (POM Test Alpha)", async ({ coursesPage, workerNamespace, request }) => {
    const apiHelper = new CourseApiHelper(request);
    const code = `${workerNamespace}ISO_A_${Date.now()}`;
    const title = `Isolated Alpha ${code}`;

    const created = await apiHelper.createCourse({ code, title });
    await coursesPage.search(code);
    await coursesPage.expectCourseVisible(title);
    await apiHelper.deleteCourse(created.id);
  });

  test("Exercise 11: Verify independent parallel execution (POM Test Beta)", async ({ coursesPage, workerNamespace, request }) => {
    const apiHelper = new CourseApiHelper(request);
    const code = `${workerNamespace}ISO_B_${Date.now()}`;
    const title = `Isolated Beta ${code}`;

    const created = await apiHelper.createCourse({ code, title });
    await coursesPage.search(code);
    await coursesPage.expectCourseVisible(title);
    await apiHelper.deleteCourse(created.id);
  });

  // Exercise 12: Complete a senior-level framework architecture challenge
  test("Exercise 12: Senior framework challenge — Full POM, Fixture, Component & API integration", async ({
    coursesPage,
    request,
    workerNamespace,
  }) => {
    // 1. API Helper sets up prerequisite state
    const apiHelper = new CourseApiHelper(request);
    const code = `${workerNamespace}CHALLENGE_${Date.now().toString().slice(-4)}`;
    const title = `${workerNamespace} Enterprise Architecture Capstone`;
    const created = await apiHelper.createCourse({ code, title, price: 499 });

    try {
      // 2. Pre-authenticated POM fixture verifies rendering
      await coursesPage.search(code);
      await coursesPage.expectCourseVisible(title);

      // 3. Category filtering using POM
      await coursesPage.filterByCategory("DevOps");
      await coursesPage.expectCourseVisible(title);

      // 4. Component Object handles modal creation of a sub-course
      await coursesPage.createCourseButton.click();
      const dialog = new CourseCreateDialogComponent(coursesPage.page);
      const subTitle = `${workerNamespace} Sub Course ${Date.now().toString().slice(-4)}`;
      const subCode = `${workerNamespace}SUB-${Date.now().toString().slice(-4)}`;
      await dialog.fillAndSubmit({ title: subTitle, code: subCode, price: 150 });

      // Filter by Core category where dialog-created sub-course resides
      await coursesPage.filterByCategory("Core");
      await coursesPage.search(subCode);
      await coursesPage.expectCourseVisible(subTitle);

      // Clean up sub-course via POM
      await coursesPage.deleteCourse(subTitle);
    } finally {
      // 5. Guaranteed teardown of primary course via API helper
      await apiHelper.deleteCourse(created.id).catch(() => {});
    }
  });
});
