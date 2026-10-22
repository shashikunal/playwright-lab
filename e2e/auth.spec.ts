import { expect, test } from "@playwright/test";

test.describe("enterprise authentication and RBAC", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("authenticates learner with valid credentials @smoke", async ({ page }) => {
    await page.getByLabel("Email address").fill("learner@pil.local");
    await page.getByLabel("Password").fill("Learner123!");
    await page.getByRole("button", { name: "Sign In to Workspace" }).click();

    await expect(page).toHaveURL(/\/app\/courses$/);
    await expect(page.getByRole("button", { name: "Sign Out" })).toBeVisible();
    await expect(page.getByText("Alex Learner")).toBeVisible();
  });

  test("quick-fill buttons populate demo role credentials", async ({ page }) => {
    await page.getByRole("button", { name: "Trainer" }).click();
    await expect(page.getByLabel("Email address")).toHaveValue("trainer@pil.local");
    await expect(page.getByLabel("Password")).toHaveValue("Trainer123!");

    await page.getByRole("button", { name: "Admin" }).click();
    await expect(page.getByLabel("Email address")).toHaveValue("admin@pil.local");
    await expect(page.getByLabel("Password")).toHaveValue("Admin123!");
  });

  test("rejects invalid credentials with accessible error alert", async ({ page }) => {
    await page.getByLabel("Email address").fill("unknown@pil.local");
    await page.getByLabel("Password").fill("WrongPass123!");
    await page.getByRole("button", { name: "Sign In to Workspace" }).click();

    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("Invalid email or password");
    await expect(page).toHaveURL(/\/login/);
  });

  test("signs out and clears user session", async ({ page }) => {
    await page.getByRole("button", { name: "Learner" }).click();
    await page.getByRole("button", { name: "Sign In to Workspace" }).click();
    await expect(page.getByRole("button", { name: "Sign Out" })).toBeVisible();

    await page.getByRole("button", { name: "Sign Out" }).click();
    await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign Out" })).not.toBeVisible();
  });

  test("preserves session with storage state", async ({ page }) => {
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
    await expect(page.getByText("Sam Admin")).toBeVisible();
    await expect(page.getByText("Role: admin")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Course" })).toBeVisible();
  });
});
