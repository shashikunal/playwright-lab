import { Locator, expect as baseExpect } from "@playwright/test";

export const customMatchers = {
  async toBeAccessibleDialog(locator: Locator) {
    const role = await locator.getAttribute("role");
    const isDialogRole = role === "dialog" || role === "alertdialog";
    const ariaModal = await locator.getAttribute("aria-modal");
    const ariaLabel = await locator.getAttribute("aria-label");
    const ariaLabelledBy = await locator.getAttribute("aria-labelledby");
    const hasAccessibleName = Boolean(ariaLabel || ariaLabelledBy);

    const pass = isDialogRole && ariaModal === "true" && hasAccessibleName;

    return {
      pass,
      message: () =>
        pass
          ? `Expected locator not to be an accessible modal dialog`
          : `Expected locator to have role="dialog", aria-modal="true", and accessible name, but got: role=${role}, aria-modal=${ariaModal}, aria-label=${ariaLabel}, aria-labelledby=${ariaLabelledBy}`,
    };
  },

  async toHaveIsoTimestamp(locatorOrString: Locator | string) {
    const text =
      typeof locatorOrString === "string"
        ? locatorOrString
        : (await locatorOrString.innerText()).trim();

    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;
    const pass = isoRegex.test(text);

    return {
      pass,
      message: () =>
        pass
          ? `Expected "${text}" not to be a valid ISO 8601 timestamp`
          : `Expected "${text}" to match ISO 8601 timestamp format (e.g. YYYY-MM-DDTHH:mm:ss.sssZ)`,
    };
  },

  toHaveValidAuditAction(action: string) {
    const validActions = [
      "user_registered",
      "course_created",
      "enrollment_submitted",
      "enrollment_status_changed",
      "user_deactivated",
    ];
    const pass = validActions.includes(action);

    return {
      pass,
      message: () =>
        pass
          ? `Expected "${action}" not to be a valid enterprise audit action`
          : `Expected "${action}" to be one of: ${validActions.join(", ")}`,
    };
  },
};

// Register custom matchers with Playwright expect
baseExpect.extend(customMatchers);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PlaywrightTest {
    interface Matchers<R> {
      toBeAccessibleDialog(): Promise<R>;
      toHaveIsoTimestamp(): Promise<R>;
      toHaveValidAuditAction(): R;
    }
  }
}
