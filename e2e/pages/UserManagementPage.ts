import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage.js";

export class UserManagementPage extends BasePage {
  readonly searchInput: Locator;
  readonly roleFilterSelect: Locator;
  readonly addUserButton: Locator;
  readonly addModal: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly departmentInput: Locator;
  readonly roleSelect: Locator;
  readonly saveUserButton: Locator;
  readonly usersTable: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByRole("searchbox", { name: "Search users" });
    this.roleFilterSelect = page.getByLabel("Filter by role");
    this.addUserButton = page.getByRole("button", { name: "Add User" });
    this.addModal = page.getByRole("dialog", { name: "Add New Enterprise User" });
    this.nameInput = page.getByLabel("Full Name");
    this.emailInput = page.getByLabel("Corporate Email");
    this.departmentInput = page.getByLabel("Department");
    this.roleSelect = page.getByLabel("Assigned Role");
    this.saveUserButton = this.addModal.getByRole("button", { name: "Create User" });
    this.usersTable = page.getByRole("table", { name: "User directory" });
  }

  async open() {
    await this.goto("/app/users");
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async filterByRole(role: string) {
    await this.roleFilterSelect.selectOption(role);
  }

  async createUser(data: { name: string; email: string; department: string; role: "learner" | "trainer" | "admin" }) {
    await this.addUserButton.click();
    await expect(this.addModal).toBeVisible();
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.departmentInput.fill(data.department);
    await this.roleSelect.selectOption(data.role);
    await this.saveUserButton.click();
    await expect(this.addModal).not.toBeVisible();
  }

  async expectUserInDirectory(name: string) {
    await expect(this.usersTable.getByText(name)).toBeVisible();
  }

  async expectUserNotInDirectory(name: string) {
    await expect(this.usersTable.getByText(name)).not.toBeVisible();
  }
}
