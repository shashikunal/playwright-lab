import { expect, test } from "@playwright/test";

test.describe("theme", () => {
  test("persists the chosen theme across reload", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /switch to (dark|light) theme/i });
    const html = page.locator("html");
    const before = await html.getAttribute("data-theme");
    await toggle.click();
    const after = before === "dark" ? "light" : "dark";
    await expect(html).toHaveAttribute("data-theme", after);
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", after);
    await expect(page.getByRole("status").filter({ hasText: "API healthy" })).toBeVisible();
  });

  for (const theme of ["light", "dark"] as const) {
    test(`renders the ${theme} theme`, async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem("pil-theme", value), theme);
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      expect(background).toBe(theme === "dark" ? "rgb(10, 10, 10)" : "rgb(255, 255, 255)");
    });
  }

  test("respects prefers-reduced-motion media feature", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const duration = await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.className = "pil-pulse";
      document.body.appendChild(probe);
      const style = window.getComputedStyle(probe).animationDuration;
      probe.remove();
      return style;
    });
    const parsedSeconds = parseFloat(duration);
    expect(parsedSeconds).toBeLessThanOrEqual(0.001);
  });
});
