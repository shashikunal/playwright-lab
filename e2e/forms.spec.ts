import { expect, test } from "@playwright/test";

const validIntake = {
  fullName: "Ada Lovelace",
  email: "ada@lab.test",
  seats: 2,
  startDate: "2026-11-02",
  track: "api",
  agree: true,
};

test.describe("intake form", () => {
  test("shows client errors and does not claim success", async ({ page }) => {
    await page.goto("/lab/forms");
    await page.getByRole("button", { name: "Submit intake" }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    await expect(page.getByText(/Accepted as/)).toHaveCount(0);
  });

  test("submits through Express and shows the returned id", async ({ page }) => {
    await page.goto("/lab/forms");
    await page.getByLabel("Full name").fill(validIntake.fullName);
    await page.getByLabel("Email").fill(validIntake.email);
    await page.getByLabel("Seats").fill(String(validIntake.seats));
    await page.getByLabel("Start date").fill(validIntake.startDate);
    await page.getByLabel("Track").selectOption("api");
    await page.getByRole("checkbox", { name: "I agree to the lab terms" }).check();

    const responsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/lab/forms/intake") && response.ok(),
    );
    await page.getByLabel("Full name").press("Enter");
    const body = (await (await responsePromise).json()) as { id: string; status: string };
    expect(body.status).toBe("accepted");
    await expect(page.getByRole("status").filter({ hasText: `Accepted as ${body.id}` })).toBeVisible();
  });

  test("rejects invalid JSON bodies with 422 @api", async ({ request }) => {
    const response = await request.post("/api/lab/forms/intake", { data: { email: "not-an-email" } });
    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.error.code).toBe("validation_error");
    expect(body.error.details.length).toBeGreaterThan(0);
  });

  test("accepts a valid intake through the API @api", async ({ request }) => {
    const response = await request.post("/api/lab/forms/intake", { data: validIntake });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe("accepted");
    expect(body.id).toMatch(/^sub_\d+$/);
  });

  test("keeps planned labs off the link list", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await nav.getByRole("link", { name: "Forms" }).click();
    await expect(page).toHaveURL(/\/lab\/forms$/);
    await expect(nav.getByRole("link", { name: "Performance Lab" })).toHaveCount(0);
    await expect(nav.getByText("Performance Lab")).toBeVisible();
  });

  for (const theme of ["light", "dark"] as const) {
    test(`renders in the ${theme} theme`, async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem("pil-theme", value), theme);
      await page.goto("/lab/forms");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.getByRole("heading", { name: "Intake form" })).toBeVisible();
    });
  }
});
