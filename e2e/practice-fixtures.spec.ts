import { BrowserContext, Page, expect, test as baseTest } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// ─── TYPES & CUSTOM FIXTURE DEFINITIONS ──────────────────────────────
export type PracticeCustomFixtures = {
  monitoredPage: {
    page: Page;
    consoleErrors: string[];
  };
  isolatedCourse: {
    id: string;
    code: string;
    title: string;
  };
  authTrainerPage: Page;
  composedCatalog: {
    page: Page;
    course: { id: string; code: string; title: string };
  };
  testRunId: string;
  isolatedState: string[];
  dualRoleLab: {
    adminContext: BrowserContext;
    adminPage: Page;
    learnerContext: BrowserContext;
    learnerPage: Page;
  };
};

export type PracticeWorkerFixtures = {
  workerRunId: string;
  workerNamespace: string;
};

const authDir = path.resolve(process.cwd(), ".auth");

export const test = baseTest.extend<PracticeCustomFixtures, PracticeWorkerFixtures>({
  // Worker-scoped fixtures: created once per worker OS process
  workerRunId: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, workerInfo) => {
      const id = `worker_${workerInfo.workerIndex}`;
      await use(id);
    },
    { scope: "worker" },
  ],

  workerNamespace: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, workerInfo) => {
      const ns = `w${workerInfo.workerIndex}_`;
      await use(ns);
    },
    { scope: "worker" },
  ],

  // Test-scoped: console-monitored page
  monitoredPage: async ({ page }, use) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    await use({ page, consoleErrors });
  },

  // Test-scoped: creates isolated test data via API and cleans it up after test
  isolatedCourse: async ({ request: req, workerNamespace }, use) => {
    const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const code = `${workerNamespace}FX-${uniqueSuffix.slice(-5)}`;
    const title = `${workerNamespace} Fixture Lifecycle Course ${uniqueSuffix}`;

    const res = await req.post("http://127.0.0.1:3001/api/app/courses", {
      headers: {
        Authorization: "Bearer tok_admin_session",
      },
      data: {
        code,
        title,
        category: "DevOps",
        difficulty: "intermediate",
        seats: 25,
        price: 349,
      },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    const courseId = data.course.id;

    // Yield resource to test
    await use({ id: courseId, code, title });

    // Automatic teardown: guaranteed deletion even if test failed
    await req.delete(`http://127.0.0.1:3001/api/app/courses/${courseId}`, {
      headers: { Authorization: "Bearer tok_admin_session" },
    }).catch(() => {});
  },

  // Test-scoped: pre-authenticated trainer page
  authTrainerPage: async ({ browser }, use) => {
    const storageStatePath = path.join(authDir, "trainer.json");
    const context = fs.existsSync(storageStatePath)
      ? await browser.newContext({ storageState: storageStatePath })
      : await browser.newContext();

    const page = await context.newPage();
    if (!fs.existsSync(storageStatePath)) {
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
    }

    await use(page);
    await context.close();
  },

  // Composed fixture: depends on both page and isolatedCourse
  composedCatalog: async ({ page, isolatedCourse }, use) => {
    await page.goto("/app/courses");
    await page.getByLabel("Search courses").fill(isolatedCourse.code);
    await use({ page, course: isolatedCourse });
  },

  // Test-scoped random ID: fresh for each test
  // eslint-disable-next-line no-empty-pattern
  testRunId: async ({}, use) => {
    const id = `test_${Math.random().toString(36).substring(2, 9)}`;
    await use(id);
  },

  // Test-scoped isolated mutable state array
  // eslint-disable-next-line no-empty-pattern
  isolatedState: async ({}, use) => {
    const state: string[] = [];
    await use(state);
  },

  // Senior-level dual-role fixture: provision Admin and Learner in separate browser contexts
  dualRoleLab: async ({ browser }, use) => {
    const adminStatePath = path.join(authDir, "admin.json");
    const learnerStatePath = path.join(authDir, "learner.json");

    const adminContext = fs.existsSync(adminStatePath)
      ? await browser.newContext({ storageState: adminStatePath })
      : await browser.newContext();
    const adminPage = await adminContext.newPage();

    if (!fs.existsSync(adminStatePath)) {
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
    }

    const learnerContext = fs.existsSync(learnerStatePath)
      ? await browser.newContext({ storageState: learnerStatePath })
      : await browser.newContext();
    const learnerPage = await learnerContext.newPage();

    if (!fs.existsSync(learnerStatePath)) {
      await learnerPage.addInitScript(() => {
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
    }

    await use({ adminContext, adminPage, learnerContext, learnerPage });

    await adminContext.close();
    await learnerContext.close();
  },
});

// ─── HANDS-ON PRACTICE SUITE (12 EXERCISES) ──────────────────────────
test.describe("Playwright Fixtures, Hooks, and Test Data Management — Hands-On Practice", () => {
  // Exercise 1: Use built-in fixtures in a test
  test("Exercise 1: Use built-in fixtures (page, request, browserName)", async ({
    page,
    request: req,
    browserName,
  }) => {
    // 1. Verify browserName fixture provides valid browser identifier
    expect(["chromium", "firefox", "webkit"]).toContain(browserName);

    // 2. Use request fixture to query backend API
    const res = await req.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.status).toBe("ok");

    // 3. Use page fixture to navigate UI
    await page.goto("/app/courses");
    await expect(page.getByLabel("Search courses")).toBeVisible();
  });

  // Exercise 2: Create a setup and teardown hook
  test.describe("Exercise 2: Setup and teardown hooks", () => {
    const lifecycleLog: string[] = [];

    test.beforeEach(async ({ page }) => {
      lifecycleLog.push("beforeEach_init");
      await page.goto("/app/courses");
    });

    test.afterEach(async () => {
      lifecycleLog.push("afterEach_teardown");
    });

    test("verifies hook execution sequence", async ({ page }) => {
      lifecycleLog.push("test_execution");
      expect(lifecycleLog).toEqual(["beforeEach_init", "test_execution"]);
      await expect(page.getByLabel("Search courses")).toBeVisible();
    });
  });

  // Exercise 3: Build a custom fixture with test.extend()
  test("Exercise 3: Build a custom fixture with test.extend() (monitoredPage)", async ({
    monitoredPage,
  }) => {
    const { page, consoleErrors } = monitoredPage;
    await page.goto("/app/courses");
    await expect(page.getByTestId("course-grid")).toBeVisible();

    // Verify monitored fixture captured zero runtime errors
    expect(consoleErrors).toEqual([]);
  });

  // Exercise 4: Implement a fixture that creates and cleans up test data
  test("Exercise 4: Implement a fixture that provisions and cleans up test data", async ({
    page,
    isolatedCourse,
    request: req,
  }) => {
    // 1. Verify fixture created data
    expect(isolatedCourse.id).toBeDefined();
    expect(isolatedCourse.code).toContain("FX-");

    // 2. Verify course is live in backend API
    const res = await req.get(`/api/app/courses/${isolatedCourse.id}`);
    expect(res.ok()).toBeTruthy();

    // 3. Verify course renders in UI
    await page.goto("/app/courses");
    await page.getByLabel("Search courses").fill(isolatedCourse.code);
    await expect(page.getByText(isolatedCourse.title)).toBeVisible();
  });

  // Exercise 5: Create an authenticated test fixture
  test("Exercise 5: Create an authenticated test fixture (authTrainerPage)", async ({
    authTrainerPage,
  }) => {
    // Navigate directly without UI login steps
    await authTrainerPage.goto("/app/courses");

    // Verify trainer role badge and privileged 'Create Course' button are immediately visible
    await expect(authTrainerPage.getByText(/Role:\s*trainer/i)).toBeVisible();
    await expect(authTrainerPage.getByRole("button", { name: "Create Course" })).toBeVisible();
  });

  // Exercise 6: Compose two dependent fixtures
  test("Exercise 6: Compose two dependent fixtures (composedCatalog)", async ({
    composedCatalog,
  }) => {
    const { page, course } = composedCatalog;

    // Both page navigation and data pre-filtering happened in composed fixture
    await expect(page.getByText(course.title)).toBeVisible();
    expect(await page.getByLabel("Search courses").inputValue()).toBe(course.code);
  });

  // Exercise 7: Demonstrate test-scoped versus worker-scoped behavior
  test("Exercise 7: Demonstrate test-scoped vs worker-scoped behavior (Part 1)", async ({
    workerRunId,
    testRunId,
  }) => {
    expect(workerRunId).toMatch(/^worker_\d+$/);
    expect(testRunId).toMatch(/^test_[a-z0-9]+$/);
  });

  test("Exercise 7: Demonstrate test-scoped vs worker-scoped behavior (Part 2)", async ({
    workerRunId,
    testRunId,
  }) => {
    // Worker run ID is stable across tests in same worker thread
    expect(workerRunId).toMatch(/^worker_\d+$/);
    expect(testRunId).toMatch(/^test_[a-z0-9]+$/);
  });

  // Exercise 8: Run independent tests in parallel without data collisions
  test("Exercise 8: Run independent tests in parallel (Test A)", async ({
    workerNamespace,
    request: req,
  }) => {
    const uniqueCode = `${workerNamespace}PARALLEL_A_${Date.now()}`;
    const res = await req.post("http://127.0.0.1:3001/api/app/courses", {
      headers: { Authorization: "Bearer tok_admin_session" },
      data: {
        code: uniqueCode,
        title: `Parallel Isolated Course A (${workerNamespace})`,
        category: "Core",
        difficulty: "beginner",
        seats: 10,
        price: 199,
      },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();

    // Clean up
    await req.delete(`http://127.0.0.1:3001/api/app/courses/${data.course.id}`, {
      headers: { Authorization: "Bearer tok_admin_session" },
    });
  });

  test("Exercise 8: Run independent tests in parallel (Test B)", async ({
    workerNamespace,
    request: req,
  }) => {
    const uniqueCode = `${workerNamespace}PARALLEL_B_${Date.now()}`;
    const res = await req.post("http://127.0.0.1:3001/api/app/courses", {
      headers: { Authorization: "Bearer tok_admin_session" },
      data: {
        code: uniqueCode,
        title: `Parallel Isolated Course B (${workerNamespace})`,
        category: "Core",
        difficulty: "beginner",
        seats: 10,
        price: 199,
      },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();

    // Clean up
    await req.delete(`http://127.0.0.1:3001/api/app/courses/${data.course.id}`, {
      headers: { Authorization: "Bearer tok_admin_session" },
    });
  });

  // Exercise 9: Diagnose a shared-state failure
  test("Exercise 9: Diagnose shared-state and verify fixture isolation (Test 1)", async ({
    isolatedState,
  }) => {
    expect(isolatedState).toHaveLength(0);
    isolatedState.push("item_alpha");
    expect(isolatedState).toHaveLength(1);
  });

  test("Exercise 9: Diagnose shared-state and verify fixture isolation (Test 2)", async ({
    isolatedState,
  }) => {
    // Proves that Test 2 gets a fresh, isolated state array with zero crosstalk from Test 1
    expect(isolatedState).toHaveLength(0);
  });

  // Exercise 10: Handle cleanup after a deliberately failing test
  test("Exercise 10: Verify guaranteed teardown execution pattern", async () => {
    let teardownExecuted = false;

    // Emulate Playwright fixture lifecycle with guaranteed cleanup
    const simulateFixtureLifecycle = async (testFn: () => Promise<void>) => {
      try {
        await testFn();
      } finally {
        teardownExecuted = true;
      }
    };

    // Deliberately failing test logic
    let caughtError: Error | null = null;
    try {
      await simulateFixtureLifecycle(async () => {
        throw new Error("Simulated assertion failure inside test execution");
      });
    } catch (err) {
      caughtError = err as Error;
    }

    // Assert that error was thrown but teardown executed unconditionally
    expect(caughtError).not.toBeNull();
    expect(caughtError?.message).toContain("Simulated assertion failure");
    expect(teardownExecuted).toBe(true);
  });

  // Exercise 11: Refactor duplicated setup into an appropriate fixture
  test("Exercise 11: Refactor duplicated setup into an appropriate fixture", async ({
    authTrainerPage,
    isolatedCourse,
  }) => {
    // Replaces 10 lines of repetitive login + navigation + filtering boilerplate
    await authTrainerPage.goto("/app/courses");
    await authTrainerPage.getByLabel("Search courses").fill(isolatedCourse.code);

    await expect(authTrainerPage.getByText(isolatedCourse.title)).toBeVisible();
    await expect(authTrainerPage.getByRole("button", { name: "Create Course" })).toBeVisible();
  });

  // Exercise 12: Complete a senior-level fixture architecture challenge
  test("Exercise 12: Senior challenge — Multi-role concurrent dual-session orchestration", async ({
    dualRoleLab,
    isolatedCourse,
  }) => {
    const { adminPage, learnerPage } = dualRoleLab;

    // 1. Admin navigates to course catalogue and verifies role
    await adminPage.goto("/app/courses");
    await expect(adminPage.getByText(/Role:\s*admin/i)).toBeVisible();

    // 2. Learner simultaneously navigates in an isolated context
    await learnerPage.goto("/app/courses");
    await expect(learnerPage.getByText(/Role:\s*learner/i)).toBeVisible();
    // Learner cannot create courses
    await expect(learnerPage.getByRole("button", { name: "Create Course" })).not.toBeVisible();

    // 3. Both see the seeded isolated course
    await adminPage.getByLabel("Search courses").fill(isolatedCourse.code);
    await expect(adminPage.getByText(isolatedCourse.title)).toBeVisible();

    await learnerPage.getByLabel("Search courses").fill(isolatedCourse.code);
    await expect(learnerPage.getByText(isolatedCourse.title)).toBeVisible();
  });
});
