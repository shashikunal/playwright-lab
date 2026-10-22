import { expect, test } from "@playwright/test";

test.describe("browser and window interactions lab", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/browser");
  });

  test("handles popup window creation, verification, and closure @smoke", async ({ page }) => {
    const popupPromise = page.waitForEvent("popup");
    await page.getByTestId("open-popup-btn").click();
    const popup = await popupPromise;

    // Verify popup opened and loaded the target page
    await expect(popup).toHaveURL(/.*\/lab\/browser\/popup-content/);
    await expect(popup.getByTestId("popup-title")).toHaveText("Popup Inspection Target");

    // Close popup window via Playwright page.close()
    await popup.close();
    expect(popup.isClosed()).toBe(true);
  });

  test("interacts with same-origin outer iframe and nested child iframe", async ({ page }) => {
    const outerFrame = page.frameLocator('iframe[title="Embedded Widget Frame"]');
    await expect(outerFrame.getByTestId("frame-heading")).toHaveText("Embedded Iframe Document");

    // Click increment inside outer frame
    await outerFrame.getByTestId("frame-increment-btn").click();
    await expect(outerFrame.getByTestId("frame-counter-val")).toHaveText("Count: 1");

    // Fill input inside outer frame
    await outerFrame.getByPlaceholder("Type inside iframe...").fill("Hello Iframe");
    await expect(outerFrame.getByPlaceholder("Type inside iframe...")).toHaveValue("Hello Iframe");

    // Chained frameLocator to interact with nested child frame
    const nestedFrame = outerFrame.frameLocator('iframe[title="Nested Inner Frame"]');
    await expect(nestedFrame.getByTestId("nested-title")).toHaveText("Inner Nested Frame");
    await expect(nestedFrame.getByTestId("nested-status")).toHaveText("Inner Frame Ready");

    await nestedFrame.getByTestId("nested-action-btn").click();
    await expect(nestedFrame.getByTestId("nested-status")).toHaveText("Inner Action Triggered");
  });

  test("modifies and asserts browser localStorage and cookies", async ({ page, context }) => {
    // Set and read custom localStorage key
    await page.getByTestId("local-key-input").fill("lab_session_key");
    await page.getByTestId("local-val-input").fill("session_token_abc");
    await page.getByTestId("save-local-btn").click();

    // Verify localStorage value via UI
    await page.getByTestId("read-local-btn").click();
    await expect(page.getByTestId("local-storage-val")).toHaveText("Value: session_token_abc");

    // Direct Playwright page.evaluate() verification
    const evaluatedVal = await page.evaluate(() => localStorage.getItem("lab_session_key"));
    expect(evaluatedVal).toBe("session_token_abc");

    // Trigger server cookie endpoint
    await page.getByTestId("trigger-cookie-btn").click();
    await expect(page.getByTestId("cookie-status")).toContainText("pil_server_cookie");

    // Verify cookie using Playwright context.cookies()
    const cookies = await context.cookies();
    const serverCookie = cookies.find((c) => c.name === "pil_server_cookie");
    expect(serverCookie).toBeDefined();
    expect(serverCookie?.value).toBe("token_xyz_987");
  });

  test("emulates geolocation coordinates and permissions", async ({ page, context }) => {
    // Grant geolocation permission and mock coordinates
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 37.7749, longitude: -122.4194 });

    await page.getByTestId("request-location-btn").click();
    await expect(page.getByTestId("geo-status")).toHaveText("success", { timeout: 10000 });
    await expect(page.getByTestId("geo-lat")).toHaveText("37.7749");
    await expect(page.getByTestId("geo-lng")).toHaveText("-122.4194");
  });

  test("adapts layout dynamically across responsive viewport breakpoints", async ({ page }) => {
    // Desktop viewport (1280px): desktop nav links visible, hamburger hidden
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.getByTestId("desktop-nav-links")).toBeVisible();
    await expect(page.getByTestId("mobile-hamburger-btn")).toBeHidden();

    // Mobile viewport (375px): hamburger visible, desktop nav hidden
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByTestId("mobile-hamburger-btn")).toBeVisible();
    await expect(page.getByTestId("desktop-nav-links")).toBeHidden();

    // Click hamburger to reveal mobile drawer
    await page.getByTestId("mobile-hamburger-btn").click();
    await expect(page.getByTestId("mobile-drawer-panel")).toBeVisible();
    await page.getByTestId("close-drawer-btn").click();
    await expect(page.getByTestId("mobile-drawer-panel")).toBeHidden();
  });

  test("toggles global command palette using Ctrl+K keyboard shortcut", async ({ page }) => {
    // Dialog starts hidden
    await expect(page.getByTestId("command-palette-dialog")).toBeHidden();

    // Press Ctrl+K
    await page.keyboard.press("Control+K");
    await expect(page.getByTestId("command-palette-dialog")).toBeVisible();
    await expect(page.getByTestId("palette-search-input")).toBeFocused();

    // Close with Escape key
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("command-palette-dialog")).toBeHidden();
  });
});
