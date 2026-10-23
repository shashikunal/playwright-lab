import { expect, test } from "./fixtures/index.js";

test.describe("multi-context concurrent collaboration and session isolation", () => {
  test("learner submits enrollment in Context A and admin approves in Context B simultaneously", async ({
    browser,
  }) => {
    // 1. Context A: Learner Session
    const learnerContext = await browser.newContext();
    const learnerPage = await learnerContext.newPage();
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

    await learnerPage.goto("/app/enrollments");
    await learnerPage.getByLabel("Number of Seats (1-10)").fill("4");
    await learnerPage.getByRole("button", { name: /Next Step/i }).click();

    await learnerPage.getByLabel("Participant / Contact Name").fill("Alex Learner");
    await learnerPage.getByLabel("Participant Email").fill("learner@pil.local");
    await learnerPage.getByRole("button", { name: /Review Order/i }).click();

    await learnerPage.getByRole("checkbox").check();
    await learnerPage.getByRole("button", { name: "Confirm & Submit Enrollment" }).click();

    const orderId = (await learnerPage.locator("#enrollment-confirmation").innerText()).trim();
    expect(orderId).toMatch(/^enr_\d+$/);

    // 2. Context B: Admin Session (completely isolated cookies, storage, cache)
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
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

    await adminPage.goto("/app/enrollments");
    const orderRow = adminPage.getByTestId(`enrollment-row-${orderId}`);
    await expect(orderRow).toBeVisible();
    await expect(orderRow.getByText("Pending")).toBeVisible();

    // Admin approves the enrollment
    await orderRow.getByRole("button", { name: "Approve" }).click();
    await expect(orderRow.getByText("Approved")).toBeVisible();

    // 3. Return to Context A: Reload and verify status is Approved
    await learnerPage.reload();
    const learnerRow = learnerPage.getByTestId(`enrollment-row-${orderId}`);
    await expect(learnerRow).toBeVisible();
    await expect(learnerRow.getByText("Approved")).toBeVisible();

    // Clean up contexts
    await learnerContext.close();
    await adminContext.close();
  });
});
