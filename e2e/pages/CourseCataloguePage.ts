import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage.js";

export class CourseCataloguePage extends BasePage {
  readonly searchInput: Locator;
  readonly courseGrid: Locator;
  readonly createCourseButton: Locator;
  readonly createDialog: Locator;
  readonly courseTitleInput: Locator;
  readonly courseCodeInput: Locator;
  readonly priceInput: Locator;
  readonly submitCourseButton: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByLabel("Search courses");
    this.courseGrid = page.getByTestId("course-grid");
    this.createCourseButton = page.getByRole("button", { name: "Create Course" });
    this.createDialog = page.getByRole("dialog", { name: "Create New Course" });
    this.courseTitleInput = page.getByLabel("Course Title");
    this.courseCodeInput = page.getByLabel("Course Code");
    this.priceInput = page.getByLabel("Price ($)");
    this.submitCourseButton = this.createDialog.getByRole("button", { name: "Create Course" });
  }

  async open() {
    await this.goto("/app/courses");
    await expect(this.courseGrid).toBeVisible();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async filterByCategory(category: string) {
    const resPromise = this.page.waitForResponse(
      (res) => res.url().includes(`category=${encodeURIComponent(category)}`) && res.ok(),
    );
    await this.page.getByRole("button", { name: category }).click();
    await resPromise;
  }

  async createCourse(data: { title: string; code: string; price: number }) {
    await this.createCourseButton.click();
    await expect(this.createDialog).toBeVisible();
    await this.courseTitleInput.fill(data.title);
    await this.courseCodeInput.fill(data.code);
    await this.priceInput.fill(String(data.price));
    await this.submitCourseButton.click();
    await expect(this.createDialog).not.toBeVisible();
  }

  async deleteCourse(title: string) {
    await this.page.getByRole("button", { name: `Delete ${title}` }).click();
    const modal = this.page.getByRole("dialog", { name: "Confirm Course Deletion" });
    await expect(modal).toBeVisible();
    await modal.getByRole("button", { name: "Confirm Delete" }).click();
    await expect(modal).not.toBeVisible();
  }

  async expectCourseVisible(title: string) {
    await expect(this.page.getByText(title)).toBeVisible();
  }

  async expectCourseNotVisible(title: string) {
    await expect(this.page.getByText(title)).not.toBeVisible();
  }
}
