import { Page, expect } from "@playwright/test";

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string) {
    await this.page.goto(path);
  }

  async waitForUrl(pattern: string | RegExp) {
    await this.page.waitForURL(pattern);
  }

  async expectHeading(text: string | RegExp, level = 1) {
    await expect(this.page.getByRole("heading", { level, name: text })).toBeVisible();
  }
}
