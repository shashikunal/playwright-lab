import { APIRequestContext, BrowserContext, Page, request, test as baseTest } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

export type CustomFixtures = {
  appClient: APIRequestContext;
  adminContext: BrowserContext;
  adminPage: Page;
  trainerContext: BrowserContext;
  trainerPage: Page;
  learnerContext: BrowserContext;
  learnerPage: Page;
  seededTestData: {
    courseId: string;
    courseCode: string;
    courseTitle: string;
    cleanUp: () => Promise<void>;
  };
};

export type WorkerFixtures = {
  workerNamespace: string;
};

const authDir = path.resolve(process.cwd(), ".auth");

export const test = baseTest.extend<CustomFixtures, WorkerFixtures>({
  // Worker-scoped fixture for thread-safe test isolation
  workerNamespace: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, workerInfo) => {
      const namespace = `w${workerInfo.workerIndex}_`;
      await use(namespace);
    },
    { scope: "worker" },
  ],

  // Test-scoped API client targeting backend Express server
  // eslint-disable-next-line no-empty-pattern
  appClient: async ({}, use) => {
    const apiContext = await request.newContext({
      baseURL: "http://127.0.0.1:3001",
      extraHTTPHeaders: {
        Accept: "application/json",
        Authorization: "Bearer tok_admin_session",
      },
    });
    await use(apiContext);
    await apiContext.dispose();
  },

  // Test-scoped Admin Page with pre-authenticated session
  adminContext: async ({ browser }, use) => {
    const storageStatePath = path.join(authDir, "admin.json");
    const context = fs.existsSync(storageStatePath)
      ? await browser.newContext({ storageState: storageStatePath })
      : await browser.newContext();
    await use(context);
    await context.close();
  },

  adminPage: async ({ adminContext }, use) => {
    const page = await adminContext.newPage();
    // Fallback if storageState file was not yet generated
    if (!fs.existsSync(path.join(authDir, "admin.json"))) {
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
    }
    await use(page);
  },

  // Test-scoped Trainer Page
  trainerContext: async ({ browser }, use) => {
    const storageStatePath = path.join(authDir, "trainer.json");
    const context = fs.existsSync(storageStatePath)
      ? await browser.newContext({ storageState: storageStatePath })
      : await browser.newContext();
    await use(context);
    await context.close();
  },

  trainerPage: async ({ trainerContext }, use) => {
    const page = await trainerContext.newPage();
    if (!fs.existsSync(path.join(authDir, "trainer.json"))) {
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
  },

  // Test-scoped Learner Page
  learnerContext: async ({ browser }, use) => {
    const storageStatePath = path.join(authDir, "learner.json");
    const context = fs.existsSync(storageStatePath)
      ? await browser.newContext({ storageState: storageStatePath })
      : await browser.newContext();
    await use(context);
    await context.close();
  },

  learnerPage: async ({ learnerContext }, use) => {
    const page = await learnerContext.newPage();
    if (!fs.existsSync(path.join(authDir, "learner.json"))) {
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
    }
    await use(page);
  },

  // Test-scoped Seeded Data with automatic lifecycle teardown
  seededTestData: async ({ appClient, workerNamespace }, use) => {
    const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const courseCode = `${workerNamespace}AUTO-${uniqueSuffix.slice(-4)}`;
    const courseTitle = `${workerNamespace} Automated Fixture Course ${uniqueSuffix}`;

    const res = await appClient.post("/api/app/courses", {
      data: {
        code: courseCode,
        title: courseTitle,
        category: "DevOps",
        difficulty: "intermediate",
        seats: 25,
        price: 349,
      },
    });
    const created = await res.json();
    const courseId = created.course.id;

    const cleanUp = async () => {
      await appClient.delete(`/api/app/courses/${courseId}`);
    };

    // Yield to the test
    await use({
      courseId,
      courseCode,
      courseTitle,
      cleanUp,
    });

    // Teardown
    await cleanUp().catch(() => {});
  },
});

export { expect } from "@playwright/test";
