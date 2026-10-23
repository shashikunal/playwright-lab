import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage.js";

export class PracticeLoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly passwordToggleBtn: Locator;
  readonly submitBtn: Locator;
  readonly clientError: Locator;
  readonly serverError: Locator;
  readonly forgotPasswordLink: Locator;
  readonly quickFillStudentBtn: Locator;
  readonly loginPortalContainer: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByLabel("Practice Username");
    this.passwordInput = page.getByLabel("Practice Password");
    this.passwordToggleBtn = page.getByTestId("password-toggle-btn");
    this.submitBtn = page.getByTestId("submit-btn");
    this.clientError = page.getByTestId("client-error");
    this.serverError = page.getByTestId("server-error");
    this.forgotPasswordLink = page.getByTestId("forgot-password-link");
    this.quickFillStudentBtn = page.getByTestId("quickfill-student");
    this.loginPortalContainer = page.getByTestId("practice-login-portal");
  }

  async open() {
    await this.goto("/practice/login");
    await expect(this.page.getByRole("heading", { level: 1, name: "Practice Login Portal" })).toBeVisible();
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitBtn.click();
  }

  async togglePasswordVisibility() {
    await this.passwordToggleBtn.click();
  }

  async expectPasswordInputType(expectedType: "password" | "text") {
    await expect(this.passwordInput).toHaveAttribute("type", expectedType);
  }

  async expectClientError(message: string | RegExp) {
    await expect(this.clientError).toBeVisible();
    await expect(this.clientError).toContainText(message);
  }

  async expectServerError(message: string | RegExp) {
    await expect(this.serverError).toBeVisible();
    await expect(this.serverError).toContainText(message);
  }
}
