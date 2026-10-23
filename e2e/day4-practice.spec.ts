import { expect, test } from "@playwright/test";

/**
 * Day 4 Practice Suite: Browser Navigation, Nested Iframes, Geolocation & Storage
 * Lab Target: /lab/browser
 */
test.describe("Day 4: Browser Navigation & Multi-Context Mastery", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab/browser");
  });

  test("Exercise 1: Multi-tab popup window interception and graceful closure", async ({ page }) => {
    // 1. In Playwright, popup handling uses a Promise before triggering the click action
    const popupPromise = page.waitForEvent("popup");

    // Click the button that opens window.open()
    await page.getByTestId("open-popup-btn").click();

    // Await the new Page handle
    const popup = await popupPromise;
    await popup.waitForLoadState("domcontentloaded");

    // 2. Interact with and assert elements on the popup Page
    await expect(popup).toHaveURL(/.*\/lab\/browser\/popup-content/);
    await expect(popup.getByTestId("popup-title")).toHaveText("Popup Inspection Target");

    // 3. Gracefully close the popup and assert closed state
    await popup.close();
    expect(popup.isClosed()).toBe(true);

    // 4. Original page context remains active and interactive
    await expect(page.getByTestId("open-popup-btn")).toBeVisible();
  });

  test("Exercise 2: Nested iframe traversal using declarative frameLocator", async ({ page }) => {
    // 1. Declarative outer frame locator
    const outerFrame = page.frameLocator('iframe[title="Embedded Widget Frame"]');
    await expect(outerFrame.getByTestId("frame-heading")).toHaveText("Embedded Iframe Document");

    // Click inside outer iframe
    await outerFrame.getByTestId("frame-increment-btn").click();
    await expect(outerFrame.getByTestId("frame-counter-val")).toHaveText("Count: 1");

    // 2. Chaining frameLocator for nested child iframe
    // (Playwright auto-waits for each frame in the chain to attach and load)
    const nestedFrame = outerFrame.frameLocator('iframe[title="Nested Inner Frame"]');
    await expect(nestedFrame.getByTestId("nested-title")).toHaveText("Inner Nested Frame");

    await nestedFrame.getByTestId("nested-action-btn").click();
    await expect(nestedFrame.getByTestId("nested-status")).toHaveText("Inner Action Triggered");
  });

  test("Exercise 3: Device permissions and geolocation coordinate emulation", async ({ page, context }) => {
    // Emulate London, UK coordinates: 51.5074° N, 0.1278° W
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 51.5074, longitude: -0.1278 });

    // Request location in the application
    await page.getByTestId("request-location-btn").click();

    // Verify application reports success and displays emulated coordinates
    await expect(page.getByTestId("geo-status")).toHaveText("success", { timeout: 10000 });
    await expect(page.getByTestId("geo-lat")).toHaveText("51.5074");
    await expect(page.getByTestId("geo-lng")).toHaveText("-0.1278");
  });

  test("Exercise 4: Cross-layer storage inspection (localStorage & HTTP cookies)", async ({ page, context }) => {
    // Set localStorage via UI
    await page.getByTestId("local-key-input").fill("auth_session_token");
    await page.getByTestId("local-val-input").fill("jwt_mock_token_sdet_day4");
    await page.getByTestId("save-local-btn").click();

    // Verify localStorage value in the browser page runtime
    const storedVal = await page.evaluate(() => localStorage.getItem("auth_session_token"));
    expect(storedVal).toBe("jwt_mock_token_sdet_day4");

    // Trigger server cookie endpoint
    await page.getByTestId("trigger-cookie-btn").click();
    await expect(page.getByTestId("cookie-status")).toContainText("pil_server_cookie");

    // Inspect cookies at the BrowserContext level
    const cookies = await context.cookies();
    const serverCookie = cookies.find((c) => c.name === "pil_server_cookie");
    expect(serverCookie).toBeDefined();
    expect(serverCookie?.value).toBe("token_xyz_987");
  });
});
