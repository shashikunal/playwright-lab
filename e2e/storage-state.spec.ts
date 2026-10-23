import { expect, test } from "./fixtures/index.js";

test.describe("authentication storage state and session reuse", () => {
  test("adminPage accesses admin views without UI login step @smoke", async ({ adminPage }) => {
    await adminPage.goto("/app/courses");
    await expect(adminPage.getByText("Sam Admin")).toBeVisible();
    await expect(adminPage.getByText("Role: admin")).toBeVisible();
    await expect(adminPage.getByRole("button", { name: "Create Course" })).toBeVisible();
  });

  test("trainerPage accesses trainer views and can create courses", async ({ trainerPage }) => {
    await trainerPage.goto("/app/courses");
    await expect(trainerPage.getByText("Morgan Trainer")).toBeVisible();
    await expect(trainerPage.getByText("Role: trainer")).toBeVisible();
    await expect(trainerPage.getByRole("button", { name: "Create Course" })).toBeVisible();
  });

  test("learnerPage is restricted from administrative actions", async ({ learnerPage }) => {
    await learnerPage.goto("/app/courses");
    await expect(learnerPage.getByText("Alex Learner")).toBeVisible();
    await expect(learnerPage.getByText("Role: learner")).toBeVisible();
    await expect(learnerPage.getByRole("button", { name: "Create Course" })).not.toBeVisible();

    // Verify access to user directory is forbidden
    await learnerPage.goto("/app/users");
    await expect(learnerPage.getByRole("alert")).toBeVisible();
    await expect(learnerPage.getByRole("heading", { name: /Access Denied/i })).toBeVisible();
  });
});
