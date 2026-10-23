import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage.js";

export class EnrollmentWizardPage extends BasePage {
  readonly courseSelect: Locator;
  readonly seatsInput: Locator;
  readonly step1NextButton: Locator;
  readonly participantNameInput: Locator;
  readonly participantEmailInput: Locator;
  readonly step2NextButton: Locator;
  readonly termsCheckbox: Locator;
  readonly submitButton: Locator;
  readonly successContainer: Locator;
  readonly confirmationIdText: Locator;
  readonly enrollmentsTable: Locator;

  constructor(page: Page) {
    super(page);
    this.courseSelect = page.getByLabel("Choose Course");
    this.seatsInput = page.getByLabel("Number of Seats (1-10)");
    this.step1NextButton = page.getByRole("button", { name: /Next Step/i });
    this.participantNameInput = page.getByLabel("Participant / Contact Name");
    this.participantEmailInput = page.getByLabel("Participant Email");
    this.step2NextButton = page.getByRole("button", { name: /Review Order/i });
    this.termsCheckbox = page.getByRole("checkbox");
    this.submitButton = page.getByRole("button", { name: "Confirm & Submit Enrollment" });
    this.successContainer = page.getByTestId("enrollment-success");
    this.confirmationIdText = page.locator("#enrollment-confirmation");
    this.enrollmentsTable = page.getByTestId("enrollments-table");
  }

  async open() {
    await this.goto("/app/enrollments");
  }

  async setSeats(seats: number) {
    await this.seatsInput.fill(String(seats));
  }

  async proceedToStep2() {
    await this.step1NextButton.click();
    await expect(this.participantNameInput).toBeVisible();
  }

  async fillParticipantDetails(details: { name: string; email: string }) {
    await this.participantNameInput.fill(details.name);
    await this.participantEmailInput.fill(details.email);
  }

  async proceedToStep3() {
    await this.step2NextButton.click();
    await expect(this.termsCheckbox).toBeVisible();
  }

  async submitEnrollment(): Promise<string> {
    await this.termsCheckbox.check();
    await this.submitButton.click();
    await expect(this.successContainer).toBeVisible();
    const confId = (await this.confirmationIdText.innerText()).trim();
    return confId;
  }

  async completeFullWizard(data: { seats: number; name: string; email: string; courseId?: string }): Promise<string> {
    if (data.courseId) {
      await this.courseSelect.selectOption(data.courseId);
    } else {
      await this.courseSelect.selectOption("crs_01");
    }
    await this.setSeats(data.seats);
    await this.proceedToStep2();
    await this.fillParticipantDetails({ name: data.name, email: data.email });
    await this.proceedToStep3();
    return await this.submitEnrollment();
  }

  async expectOrderInTable(orderId: string, email: string) {
    const row = this.page.getByTestId(`enrollment-row-${orderId}`);
    await expect(row).toBeVisible();
    await expect(row.getByText(email)).toBeVisible();
  }

  async approveOrder(orderId: string) {
    const row = this.page.getByTestId(`enrollment-row-${orderId}`);
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: "Approve" }).click();
    await expect(row.getByText("Approved")).toBeVisible();
  }
}
