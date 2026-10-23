import type { Lesson } from "../types";

export const formsLesson: Lesson = {
  id: "playwright-forms",
  moduleSlug: "actions-and-forms",
  moduleTitle: "Input Automation & Accessible Forms",
  title: "Playwright Forms and Validation — Beginner to Advanced",
  difficulty: "Intermediate",
  durationMinutes: 45,
  prerequisites: [
    "playwright-introduction",
    "configuration-and-browsers",
    "playwright-locators",
    "playwright-assertions",
    "playwright-actions"
  ],
  summary: "Master enterprise web form automation across input controls, client & server-side validation, constraint validation, multi-step wizards, duplicate-submit protection, boundary-value analysis, and resilient data-driven test architectures.",
  sections: [
    {
      id: "form-testing-fundamentals",
      title: "Part A — Form Testing Fundamentals & Deterministic Design",
      content: `Forms represent the primary interactive bridge between users and backend systems. Automated testing of web forms requires validating the entire user lifecycle: input entry, instant feedback, submission in-flight states, API responses, and post-submission state transitions.

1. The Form Lifecycle Architecture:
Every production web form operates across four distinct phases:
- Input Capture: Users enter data across varied controls (text, selects, radios, checkboxes, files).
- Client-Side Validation: Immediate client-side rules run on blur, input, or submit to catch syntax, format, and required-field defects before network transmission.
- In-Flight Submission: The submit trigger dispatches an asynchronous network request, disables the submit button, displays loading indicators, and protects against duplicate submissions.
- Server Response Handling: The frontend ingests HTTP responses: rendering success confirmations (200/201), field-level error mappings (422 Unprocessable Entity), or fallback error banners (400/409/500).

2. Designing Deterministic Form Tests:
Flaky form tests typically stem from:
- Testing internal component state instead of observable DOM text and attributes.
- Using click() on checkboxes instead of idempotent check() or setChecked().
- Submitting forms without awaiting the network response promise, creating race conditions.
- Hardcoding static sleep intervals (page.waitForTimeout) to wait for form submission.
Senior SDETs design tests that assert observable user experience: accessible names, ARIA invalid states, visible alert roles, and network response status codes.`
    },
    {
      id: "input-controls-reference",
      title: "Part B — Comprehensive Input Controls & Reliable Automation",
      content: `Modern forms utilize diverse HTML5 input controls. Playwright provides specialized, actionability-verified methods for each control type:

1. Text Inputs and Textareas (<input type="text">, <textarea>):
- Action: await locator.fill('Alice'); (clears and sets value atomically).
- Keystroke Simulation: await locator.pressSequentially('search query', { delay: 30 });
- Assertion: await expect(locator).toHaveValue('Alice'); (NEVER toHaveText!).
- Common Mistake: Using toHaveText() on <input>, which always returns empty because input values reside in the DOM 'value' property, not children text nodes.

2. Email, Password, Number, and Date Controls:
- Email: await page.getByLabel('Email').fill('user@domain.test');
- Password: await page.getByLabel('Password').fill('SecureP@ss123');
- Number: await page.getByLabel('Seats').fill('4'); (assert with toHaveValue('4')).
- Date: await page.getByLabel('Start date').fill('2026-11-15'); (ISO YYYY-MM-DD format).

3. Checkboxes and Radio Buttons:
- Checkbox: await locator.check(); / await locator.uncheck(); / await locator.setChecked(true);
- Assertion: await expect(locator).toBeChecked(); / await expect(locator).not.toBeChecked();
- Radio Group: Select specific option via await page.getByRole('radio', { name: 'Option B' }).check();
- Common Mistake: Using click() on a checkbox toggles state blindly, whereas check() is idempotent.

4. Native Dropdown Selects (<select>):
- Value: await selectLocator.selectOption('api');
- Label: await selectLocator.selectOption({ label: 'Fixtures' });
- Multi-select (<select multiple>): await selectLocator.selectOption(['chromium', 'webkit']);
- Assertion: await expect(selectLocator).toHaveValue('api');

5. File Inputs (<input type="file">):
- Action: await fileInput.setInputFiles('path/to/report.pdf');
- In-Memory Buffer (CI-resilient, no disk fixtures):
  await fileInput.setInputFiles({
    name: 'test.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('id,name\\n1,Alice')
  });

6. Read-Only and Disabled Controls:
- Assertions: await expect(locator).toBeDisabled(); / await expect(locator).toHaveAttribute('readonly', '');`
    },
    {
      id: "validation-strategies",
      title: "Part C — Validation Strategies: Client-Side vs Server-Side",
      content: `Robust form validation protects application integrity across multiple architectural layers:

1. Client-Side Instant Validation:
Runs directly in the browser via JavaScript or HTML5 constraint validation:
- Required Fields: Missing values trigger instant error states.
- Format Constraints: Regex validation for emails, phone numbers, postal codes, and URLs.
- Boundary Limits: Min/max values for numeric inputs and minLength/maxLength for text.
- Validation Timing: Triggered on input blur (focus loss), keystroke change (debounced), or submit attempt.

2. HTML5 Native Constraint Validation:
Modern browsers enforce validation rules without JavaScript through attributes: required, pattern, min, max, type.
Playwright evaluates constraint validation via:
const isValid = await inputLocator.evaluate((el: HTMLInputElement) => el.validity.valid);
expect(isValid).toBe(false);
await expect(page.locator('input:invalid')).toHaveCount(1);

3. Server-Side Validation (HTTP 422 Unprocessable Entity):
Client validation can be bypassed by malicious users or stale frontends. The backend must enforce business logic (e.g. duplicate email checks, seat quota limits, database constraints).
When server validation fails, the API responds with 422 and structured field error details:
{
  "error": {
    "message": "Validation failed",
    "details": [{ "field": "seats", "message": "Maximum allowable seats for this cohort is 8." }]
  }
}
The frontend maps these details to field-level alert elements (<p role="alert" id="seats-error">).

4. Field-Level Errors vs Error Summaries:
Accessible forms associate field errors via aria-describedby:
<input id="email" aria-invalid="true" aria-describedby="email-error" />
<p role="alert" id="email-error">Enter a valid email address</p>
Assert both field invalidity and error text:
await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
await expect(page.locator('#email-error')).toHaveText('Enter a valid email address');`
    },
    {
      id: "submission-and-async-behavior",
      title: "Part D — Submission Lifecycle & Asynchronous State Handling",
      content: `Form submission is an asynchronous state machine. Testing must cover the entire sequence from click to settlement:

1. Preventing Duplicate Submissions (Double-Click Protection):
In enterprise applications (e.g. payments, orders, reservations), clicking 'Submit' must immediately disable the submit button or set aria-busy="true" to block duplicate submissions.
Testing Double-Submit Protection:
const submitBtn = page.getByRole('button', { name: 'Submit' });
await submitBtn.click();
await expect(submitBtn).toBeDisabled();
await expect(submitBtn).toHaveAttribute('aria-busy', 'true');
// Attempt second click; verify only 1 API call occurred and success count is 1.

2. Eliminating Submission Race Conditions:
Never click submit and then sleep. Always set up the response promise BEFORE clicking:
const responsePromise = page.waitForResponse(
  res => res.url().includes('/api/lab/forms/intake') && res.status() === 200
);
await page.getByRole('button', { name: 'Submit intake' }).click();
const response = await responsePromise;
const data = await response.json();
await expect(page.getByRole('status')).toContainText(\`Accepted as \${data.id}\`);

3. Preserving User Input on API Errors:
When an API responds with 422, 500, or a network abort occurs, the form MUST NOT wipe user-entered data. Forcing users to re-type 20 fields after an error destroys user experience.
Testing input preservation:
await page.route('**/api/submit', route => route.abort());
await submitBtn.click();
await expect(page.getByRole('alert')).toBeVisible();
await expect(page.getByLabel('Full name')).toHaveValue('Ada Lovelace'); // Preserved!`
    },
    {
      id: "complex-forms-and-wizards",
      title: "Part E — Complex Forms: Multi-Step Wizards & Conditional Fields",
      content: `Enterprise workflows frequently break long forms into multi-step wizards and conditional field groups:

1. Multi-Step Form Wizards:
Wizards segment complex forms into sequential stages (e.g. Account Details -> Plan Selection -> Review & Confirmation):
- State Preservation: Data entered in Step 1 must persist when navigating to Step 2 and clicking 'Back'.
- Step Indicator: Verify current step progression: await expect(page.getByTestId('wizard-step-indicator')).toHaveText('Step 2 of 3');
- Final Confirmation: In the review step, assert that summary fields accurately reflect values entered in earlier steps.

2. Conditional & Dependent Fields:
Selecting an option triggers dynamic rendering of dependent controls:
- Selecting 'Corporate Account' radio renders 'Company Name' and 'VAT/Tax ID' fields.
- Selecting a country dynamically updates the 'State/Province' dropdown options.
Testing Pattern:
await page.getByLabel('Corporate Account').check();
const corpPanel = page.getByTestId('corporate-fields-panel');
await expect(corpPanel).toBeVisible();
await corpPanel.getByLabel('Company Name').fill('Acme Corp');

3. Custom ARIA 1.2 Comboboxes:
Modern design systems often replace native <select> with custom combobox popovers (e.g. Radix, HeadlessUI):
- Open combobox: await page.getByRole('combobox').click();
- Assert popover visible: await expect(page.getByRole('listbox')).toBeVisible();
- Select option: await page.getByRole('option', { name: 'Python' }).click();
- Assert value: await expect(page.getByRole('combobox')).toContainText('Python');`
    },
    {
      id: "test-design-and-debugging",
      title: "Part F — Test Design: Equivalence Partitioning, BVA & Data-Driven Tests",
      content: `Senior SDETs do not author dozens of copy-paste test cases. They leverage formal test design techniques to achieve maximum coverage with minimal, highly maintainable tests:

1. Equivalence Partitioning (EP):
Divide input data into valid and invalid partitions:
- Email Partitions: Valid ('user@domain.com'), Invalid syntax ('user@', 'user.domain.com', '@domain.com').
- Testing one representative value from each partition provides 100% defect coverage of that class.

2. Boundary-Value Analysis (BVA):
Defects overwhelmingly occur at the edges of allowed ranges:
- Seat Count Range: Allowed [1, 12].
- Test Boundaries: Just below min (0), Minimum (1), Nominal (5), Maximum (12), Just above max (13).

3. Data-Driven Testing with Parameterized Test Suites:
Use arrays of test specifications to test validation matrices deterministically:
const testCases = [
  { seats: "0", expectedError: "Seats must be an integer from 1 to 12" },
  { seats: "13", expectedError: "Seats must be an integer from 1 to 12" },
  { seats: "-1", expectedError: "Seats must be an integer from 1 to 12" },
  { seats: "3.5", expectedError: "Seats must be an integer from 1 to 12" }
];
for (const tc of testCases) {
  test(\`validates invalid seat boundary: \${tc.seats}\`, async ({ page }) => {
    await page.getByLabel('Seats').fill(tc.seats);
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText(tc.expectedError)).toBeVisible();
  });
}

4. When to Mock APIs (page.route) vs Real End-to-End:
- Use Real Endpoints: Happy-path smoke tests and critical business transactions.
- Use page.route() Mocking: Edge-case 422 validation matrices, 500 database outages, network aborts, and high-latency simulation. Mocking guarantees deterministic error handling without corrupting production/seed databases.`
    }
  ],
  codeExamples: [
    {
      id: "form-input-fill",
      caption: "Form Input Controls, Checkboxes, and Native Selects",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("completes comprehensive form controls", async ({ page }) => {
  await page.goto("/lab/forms");

  // 1. Fill text, email, number, and date inputs
  await page.getByLabel("Full name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@lab.test");
  await page.getByLabel("Seats").fill("3");
  await page.getByLabel("Start date").fill("2026-11-02");

  // 2. Select option in native dropdown
  const trackSelect = page.getByLabel("Track");
  await trackSelect.selectOption("api");
  await expect(trackSelect).toHaveValue("api");

  // 3. Checkbox: use idempotent check()
  const termsCheckbox = page.getByRole("checkbox", { name: "I agree to the lab terms" });
  await termsCheckbox.check();
  await expect(termsCheckbox).toBeChecked();

  // 4. Submit and verify confirmation
  const resPromise = page.waitForResponse(r => r.url().includes("/api/lab/forms/intake") && r.ok());
  await page.getByRole("button", { name: "Submit intake" }).click();
  const response = await resPromise;
  expect(response.status()).toBe(200);
});`,
      lineExplanations: [
        { line: 7, explanation: "fill() focuses, clears, and inputs text with input and change events." },
        { line: 10, explanation: "Date fields require ISO YYYY-MM-DD format for HTML5 date controls." },
        { line: 14, explanation: "selectOption matches option value attribute." },
        { line: 18, explanation: "check() verifies checkbox state and clicks only if currently unchecked." },
        { line: 22, explanation: "Pre-registering waitForResponse avoids submission network race conditions." }
      ]
    },
    {
      id: "client-validation-testing",
      caption: "Validating Client-Side Required Fields & Format Constraints",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("asserts client validation error messages on empty submission", async ({ page }) => {
  await page.goto("/lab/forms");

  // Submit without entering data
  await page.getByRole("button", { name: "Submit intake" }).click();

  // Verify field-level error messages
  await expect(page.getByText("Enter 2 to 80 characters without HTML")).toBeVisible();
  await expect(page.getByText("Enter a valid email address")).toBeVisible();
  await expect(page.getByText("Seats must be an integer from 1 to 12")).toBeVisible();
  await expect(page.getByText("Enter a real date as YYYY-MM-DD")).toBeVisible();
  await expect(page.locator("#track-error")).toHaveText("Choose a track");
  await expect(page.getByText("Agree to the lab terms", { exact: true })).toBeVisible();

  // Verify form submission was blocked
  await expect(page.getByText(/Accepted as/)).toHaveCount(0);
});`,
      lineExplanations: [
        { line: 7, explanation: "Submitting empty form triggers client validation logic." },
        { line: 10, explanation: "Field-level error banners appear under each required input." },
        { line: 14, explanation: "Scoped locator to #track-error prevents strict mode collision with <option>." },
        { line: 18, explanation: "Confirms that no success state was rendered." }
      ]
    },
    {
      id: "server-validation-mocking",
      caption: "Testing Server-Side 422 Errors with page.route()",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("handles backend 422 validation response and maps error details", async ({ page }) => {
  await page.goto("/lab/forms");

  // Intercept intake POST and fulfill with 422 Unprocessable Entity
  await page.route("**/api/lab/forms/intake", async (route) => {
    await route.fulfill({
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({
        error: {
          message: "Validation failed",
          details: [{ field: "seats", message: "Maximum allowable seats for this cohort is 8." }]
        }
      })
    });
  });

  // Fill client-valid data with 10 seats
  await page.getByLabel("Full name").fill("Grace Hopper");
  await page.getByLabel("Email").fill("grace@navy.test");
  await page.getByLabel("Seats").fill("10");
  await page.getByLabel("Start date").fill("2026-11-20");
  await page.getByLabel("Track").selectOption("fixtures");
  await page.getByRole("checkbox", { name: "I agree to the lab terms" }).check();

  await page.getByRole("button", { name: "Submit intake" }).click();

  // Verify backend-generated field error is displayed
  await expect(page.getByText("Maximum allowable seats for this cohort is 8.")).toBeVisible();
  await expect(page.getByText("Express rejected the intake")).toBeVisible();
});`,
      lineExplanations: [
        { line: 7, explanation: "page.route() intercepts API traffic before network egress." },
        { line: 9, explanation: "Fulfills structured 422 error payload matching backend schema." },
        { line: 29, explanation: "Asserts that frontend mapped the server-side detail message to the DOM." }
      ]
    },
    {
      id: "async-submission-loading",
      caption: "Managing In-Flight Submission, Disabled States & Duplicate Prevention",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("verifies button disablement and duplicate-submit protection", async ({ page }) => {
  await page.goto("/lab/forms");
  await page.getByTestId("tab-wizard").click();

  const doubleSubmitBtn = page.getByTestId("double-submit-btn");
  await expect(doubleSubmitBtn).toBeEnabled();

  // First click triggers in-flight submission
  await doubleSubmitBtn.click();

  // Button immediately enters disabled and loading state
  await expect(doubleSubmitBtn).toBeDisabled();
  await expect(doubleSubmitBtn).toHaveAttribute("aria-busy", "true");
  await expect(doubleSubmitBtn).toContainText("Processing...");

  // After 800ms settlement, button re-enables and count increments
  await expect(doubleSubmitBtn).toBeEnabled({ timeout: 5000 });
  await expect(page.getByTestId("submit-success-count")).toHaveText("Successful Submissions: 1");
});`,
      lineExplanations: [
        { line: 11, explanation: "Dispatches submission action." },
        { line: 14, explanation: "Asserts disabled state blocks additional clicks while in flight." },
        { line: 15, explanation: "aria-busy conveys accessibility state to assistive technologies." },
        { line: 19, explanation: "Auto-waits for in-flight operation to settle." }
      ]
    },
    {
      id: "multi-step-wizard-flow",
      caption: "Automating Multi-Step Form Wizards and Back Navigation",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("completes multi-step wizard and verifies state across steps", async ({ page }) => {
  await page.goto("/lab/forms");
  await page.getByTestId("tab-wizard").click();

  // Step 1: Account Setup
  await expect(page.getByTestId("wizard-step-indicator")).toHaveText("Step 1 of 3");
  await page.getByTestId("wizard-username-input").fill("lead_qa_architect");
  await page.getByTestId("wizard-next-btn").click();

  // Step 2: Plan Selection
  await expect(page.getByTestId("wizard-step-indicator")).toHaveText("Step 2 of 3");
  await page.getByTestId("wizard-tier-select").selectOption("Enterprise");
  await page.getByTestId("wizard-next-btn").click();

  // Step 3: Confirmation Summary
  await expect(page.getByTestId("wizard-step-indicator")).toHaveText("Step 3 of 3");
  await expect(page.getByTestId("review-user")).toHaveText("lead_qa_architect");
  await expect(page.getByTestId("review-tier")).toHaveText("Enterprise");

  // Step 4: Back navigation test
  await page.getByTestId("wizard-back-btn").click();
  await expect(page.getByTestId("wizard-step-indicator")).toHaveText("Step 2 of 3");
  await expect(page.getByTestId("wizard-tier-select")).toHaveValue("Enterprise");
});`,
      lineExplanations: [
        { line: 8, explanation: "Step indicator provides deterministic state milestone." },
        { line: 18, explanation: "Review step validates that data entered in step 1 was retained." },
        { line: 22, explanation: "Back navigation confirms state is not reset when traversing backwards." }
      ]
    },
    {
      id: "data-driven-bva-testing",
      caption: "Data-Driven Validation Matrix & Boundary-Value Testing",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

const boundaryScenarios = [
  { seats: "0", valid: false, desc: "below minimum (0)" },
  { seats: "1", valid: true, desc: "exact minimum (1)" },
  { seats: "6", valid: true, desc: "nominal midpoint (6)" },
  { seats: "12", valid: true, desc: "exact maximum (12)" },
  { seats: "13", valid: false, desc: "above maximum (13)" }
];

for (const scenario of boundaryScenarios) {
  test(\`evaluates seats boundary: \${scenario.desc}\`, async ({ page }) => {
    await page.goto("/lab/forms");

    await page.getByLabel("Seats").fill(scenario.seats);
    await page.getByRole("button", { name: "Submit intake" }).click();

    const seatsError = page.locator("#seats-error");
    if (scenario.valid) {
      await expect(seatsError).not.toBeVisible();
    } else {
      await expect(seatsError).toBeVisible();
      await expect(seatsError).toHaveText("Seats must be an integer from 1 to 12");
    }
  });
}`,
      lineExplanations: [
        { line: 3, explanation: "Array of test vectors covering BVA partitions." },
        { line: 11, explanation: "Iterates through scenarios generating isolated, parameterized test cases." },
        { line: 19, explanation: "Asserts presence or absence of validation error based on test vector validity." }
      ]
    }
  ],
  commonMistakes: [
    {
      title: "Submitting forms before awaiting asynchronous validation or network settlement",
      badPractice: `// Anti-pattern: Clicking submit without awaiting network response promise
await page.getByRole("button", { name: "Submit" }).click();
const response = await page.waitForResponse(res => res.url().includes("/api/submit"));`,
      goodPractice: `// Best practice: Pre-register response promise before click action
const responsePromise = page.waitForResponse(res => res.url().includes("/api/submit") && res.ok());
await page.getByRole("button", { name: "Submit" }).click();
const response = await responsePromise;`,
      explanation: "If the network response returns before the next line of JavaScript executes, page.waitForResponse() hangs indefinitely until timeout. Pre-registering the promise eliminates race conditions."
    },
    {
      title: "Asserting input field values using toHaveText() instead of toHaveValue()",
      badPractice: `// Anti-pattern: toHaveText on input or textarea
await expect(page.getByLabel("Username")).toHaveText("alice"); // Always fails!`,
      goodPractice: `// Best practice: toHaveValue checks the DOM element value property
await expect(page.getByLabel("Username")).toHaveValue("alice");`,
      explanation: "HTML <input> elements do not contain child text nodes. Their content is stored in the DOM 'value' property. toHaveText() inspects textContent and will always fail."
    },
    {
      title: "Hardcoding sleep delays (page.waitForTimeout) to wait for form submission",
      badPractice: `// Anti-pattern: Arbitrary fixed sleep
await page.getByRole("button", { name: "Submit" }).click();
await page.waitForTimeout(3000); // Hope submission finished`,
      goodPractice: `// Best practice: Web-first assertions on submission confirmation
await page.getByRole("button", { name: "Submit" }).click();
await expect(page.getByRole("status")).toHaveText(/Accepted as sub_/);`,
      explanation: "Fixed sleeps artificially slow down test runs and fail unpredictably under heavy CI server load. Web-first assertions auto-retry at 100ms intervals and resolve immediately upon state update."
    },
    {
      title: "Blindly clicking submit button repeatedly without verifying disabled/in-flight states",
      badPractice: `// Anti-pattern: Rapid double clicks bypassing UI in-flight protection
await page.getByRole("button", { name: "Pay Now" }).click();
await page.getByRole("button", { name: "Pay Now" }).click();`,
      goodPractice: `// Best practice: Verify button disables immediately and handles in-flight state
const payBtn = page.getByRole("button", { name: "Pay Now" });
await payBtn.click();
await expect(payBtn).toBeDisabled();
await expect(payBtn).toHaveAttribute("aria-busy", "true");`,
      explanation: "Testing duplicate-submit protection requires verifying that the user interface blocks subsequent clicks while the request is in flight."
    },
    {
      title: "Ignoring HTML5 constraint validation and relying solely on CSS color changes",
      badPractice: `// Anti-pattern: Checking CSS border color class for validation
await expect(page.getByLabel("Email")).toHaveClass(/border-red-500/);`,
      goodPractice: `// Best practice: Assert aria-invalid and evaluate native validity
await expect(page.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
const isValid = await page.getByLabel("Email").evaluate((el: HTMLInputElement) => el.validity.valid);
expect(isValid).toBe(false);`,
      explanation: "CSS utility classes change frequently during design system updates. Semantic ARIA attributes (aria-invalid) and DOM validity properties are standardized and accessible."
    },
    {
      title: "Failing to verify that user input is preserved when server returns 4xx or 5xx validation errors",
      badPractice: `// Anti-pattern: Only verifying error banner presence
await page.getByRole("button", { name: "Submit" }).click();
await expect(page.getByText("Validation failed")).toBeVisible();`,
      goodPractice: `// Best practice: Verify error banner AND assert input fields retain user entries
await page.getByRole("button", { name: "Submit" }).click();
await expect(page.getByText("Validation failed")).toBeVisible();
await expect(page.getByLabel("Full name")).toHaveValue("Ada Lovelace");
await expect(page.getByLabel("Email")).toHaveValue("ada@invalid.test");`,
      explanation: "If an application wipes user-entered data when validation fails, users must painfully re-type every field. Asserting value retention catches critical usability regressions."
    }
  ],
  playground: {
    title: "Playwright Forms, Validation & Submission Strategy Matrix",
    configExample: `// Production Forms & Validation Automation Blueprint
import { test, expect } from "@playwright/test";

test("forms validation matrix", async ({ page }) => {
  await page.goto("/lab/forms");

  // 1. Fill input controls with auto-waiting
  const nameInput = page.getByLabel("Full name");
  await nameInput.fill("Katherine Johnson");
  await expect(nameInput).toHaveValue("Katherine Johnson");

  // 2. Select native option by string or label object
  const trackSelect = page.getByLabel("Track");
  await trackSelect.selectOption({ label: "Fixtures" });
  await expect(trackSelect).toHaveValue("fixtures");

  // 3. Idempotent checkbox checking
  const termsCheckbox = page.getByRole("checkbox", { name: "I agree to the lab terms" });
  await termsCheckbox.check();
  await expect(termsCheckbox).toBeChecked();

  // 4. Intercept submission API call and assert response status
  const responsePromise = page.waitForResponse(
    res => res.url().includes("/api/lab/forms/intake") && res.ok()
  );
  await page.getByRole("button", { name: "Submit intake" }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(200);

  // 5. Web-first assertion on accepted status
  const body = await response.json();
  await expect(
    page.getByRole("status").filter({ hasText: "Accepted as " + body.id })
  ).toBeVisible();
});`,
    properties: [
      {
        name: "toHaveValue(expected)",
        type: "string | RegExp",
        defaultValue: "required",
        description: "Asserts that an <input>, <textarea>, or <select> element has the specified value in the DOM.",
        impact: "Mandatory for form fields; toHaveText() does not work on input value properties."
      },
      {
        name: "toBeChecked()",
        type: "boolean matcher",
        defaultValue: "checked state",
        description: "Asserts that a checkbox or radio button control is checked.",
        impact: "Guarantees form control state without inspecting synthetic click events."
      },
      {
        name: "toBeDisabled()",
        type: "boolean matcher",
        defaultValue: "disabled state",
        description: "Asserts that a button or input control has the disabled attribute or is non-interactive.",
        impact: "Verifies in-flight loading states and prevents duplicate form submissions."
      },
      {
        name: "toHaveAttribute('required', '')",
        type: "string attribute",
        defaultValue: "HTML attribute",
        description: "Verifies that an input element enforces HTML5 required field constraint validation.",
        impact: "Validates accessibility and client-side form contract enforcement."
      },
      {
        name: "toHaveAttribute('aria-invalid', 'true')",
        type: "ARIA attribute",
        defaultValue: "'false' | 'true'",
        description: "Asserts that an input field has been marked semantically invalid by client validation.",
        impact: "Ensures screen readers announce error states to assistive technology users."
      },
      {
        name: "selectOption({ label })",
        type: "string | object | index",
        defaultValue: "required option",
        description: "Selects an option in native <select> by value string, visible label, or numeric index.",
        impact: "Provides flexible, resilient dropdown automation across varying frontend implementations."
      },
      {
        name: "setInputFiles(buffer)",
        type: "string | string[] | Buffer",
        defaultValue: "file payload",
        description: "Populates an <input type='file'> control without opening native OS file dialogues.",
        impact: "Enables fast, isolated in-memory file upload testing in CI pipelines."
      },
      {
        name: "page.waitForResponse(predicate)",
        type: "Predicate function",
        defaultValue: "response matcher",
        description: "Awaits an incoming HTTP response matching a URL pattern and status condition.",
        impact: "Completely eliminates submission network race conditions."
      },
      {
        name: "pressSequentially(text, { delay })",
        type: "string with options",
        defaultValue: "keystroke typing",
        description: "Types characters one-by-one with realistic millisecond delay intervals.",
        impact: "Essential for testing debounced search inputs and masked phone/credit card fields."
      },
      {
        name: "toHaveAttribute('min' | 'max')",
        type: "HTML attribute",
        defaultValue: "numeric boundaries",
        description: "Verifies numeric boundaries on range and number inputs.",
        impact: "Ensures boundary-value constraints are configured on native form elements."
      },
      {
        name: "filter({ hasText })",
        type: "Locator filter",
        defaultValue: "text condition",
        description: "Narrows multi-match locators to a specific container containing matching text.",
        impact: "Resolves strict mode violations in complex multi-field and table rows."
      },
      {
        name: "toHaveCount(expected)",
        type: "number matcher",
        defaultValue: "integer",
        description: "Asserts the exact number of matching elements in the DOM tree.",
        impact: "Verifies error banner counts (e.g. 0 success messages on failed submission)."
      }
    ],
    behaviorComparison: [
      {
        aspect: "toHaveValue() vs toHaveText() on Form Controls",
        defaultBehavior: "toHaveValue() checks the element.value DOM property of <input>, <textarea>, and <select>. Resolves correctly with full auto-waiting.",
        customizedBehavior: "toHaveText() inspects textContent. Since inputs have no child text nodes, toHaveText() returns empty string and fails."
      },
      {
        aspect: "Client-Side Instant Validation vs Server-Side Asynchronous Validation",
        defaultBehavior: "Client validation runs instantly on blur or submit; displays field-level guidance immediately without server round-trip.",
        customizedBehavior: "Server validation enforces complex business rules via HTTP 422; frontend must ingest and map error details onto the DOM."
      },
      {
        aspect: "Single In-Flight Submission vs Unprotected Double-Click Submission",
        defaultBehavior: "Button disables immediately on click (disabled, aria-busy='true'); ignores subsequent clicks while API call is in flight.",
        customizedBehavior: "Unprotected buttons allow rapid double-clicks, creating duplicate records or race conditions on the server."
      },
      {
        aspect: "selectOption() by Value vs by Label vs by Index",
        defaultBehavior: "selectOption('api') matches the option value attribute. Most stable when option text is localized.",
        customizedBehavior: "selectOption({ label: 'Fixtures' }) matches visible text. Closer to real user behavior but vulnerable to translation changes."
      },
      {
        aspect: "End-to-End API Integration vs Mocked HTTP 422 Error Ingestion",
        defaultBehavior: "E2E integration verifies full frontend-to-backend-to-database contract. Slow and requires valid test database state.",
        customizedBehavior: "page.route() mocks 422/500 payloads. Fast, deterministic, and tests exotic validation error states without database changes."
      },
      {
        aspect: "Step-by-Step Wizard Navigation vs Direct URL Deep-Linking",
        defaultBehavior: "Navigating Step 1 -> Step 2 -> Step 3 tests form state accumulation, validation gates, and Back button persistence.",
        customizedBehavior: "Deep-linking directly to Step 3 verifies routing guards and unauthenticated state redirect protection."
      }
    ],
    practiceTask: "Automate form validation, required field errors, boundary conditions, and multi-step wizards across the live lab routes.",
    localCommand: "pnpm exec playwright test e2e/practice-forms.spec.ts"
  },
  exercises: [
    {
      id: "ex1-submit-valid-form",
      title: "Exercise 1: Submit a Valid Form and Verify Success State",
      objective: "Fill text, email, number, date, select, and checkbox controls with valid data, submit the intake form, and verify HTTP 200 response and accepted confirmation.",
      prerequisites: [
        "Playwright test runner installed",
        "Understanding of getByLabel, getByRole, and page.waitForResponse"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 1: Submit valid form", async ({ page }) => {
  await page.goto("/lab/forms");
  // TODO: Fill all required fields, intercept /api/lab/forms/intake, click Submit, assert success
});`,
      task: "Navigate to /lab/forms, fill valid inputs for Full name, Email, Seats, Start date, Track, and Agree to terms, await the response promise, click Submit intake, and assert that the accepted confirmation message appears.",
      acceptanceCriteria: [
        "All 6 intake controls filled with valid data.",
        "Response intercepted via page.waitForResponse.",
        "Response status verified to be 200.",
        "Accepted message with generated ID asserted using toBeVisible()."
      ],
      expectedBehavior: "Form submits cleanly and server returns 200 OK with confirmation ID.",
      hint: "Create the response promise before clicking: const responsePromise = page.waitForResponse(res => res.url().includes('/api/lab/forms/intake') && res.ok());",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 1: Submit a valid form and verify success state", async ({ page }) => {
  await page.goto("/lab/forms");

  await page.getByLabel("Full name").fill("Katherine Johnson");
  await page.getByLabel("Email").fill("kjohnson@nasa.test");
  await page.getByLabel("Seats").fill("4");
  await page.getByLabel("Start date").fill("2026-11-15");
  await page.getByLabel("Track").selectOption("locators");
  await page.getByRole("checkbox", { name: "I agree to the lab terms" }).check();

  const responsePromise = page.waitForResponse(
    (res) => res.url().includes("/api/lab/forms/intake") && res.ok()
  );
  await page.getByRole("button", { name: "Submit intake" }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(200);

  const body = await response.json();
  await expect(
    page.getByRole("status").filter({ hasText: "Accepted as " + body.id })
  ).toBeVisible();
});`,
      troubleshootingNotes: "Verify that the date is formatted in ISO format YYYY-MM-DD for native HTML5 date input controls.",
      command: "pnpm exec playwright test e2e/practice-forms.spec.ts -g 'Exercise 1'"
    },
    {
      id: "ex2-empty-form-required-errors",
      title: "Exercise 2: Submit an Empty Form and Verify Required-Field Errors",
      objective: "Attempt form submission without entering required data, assert client validation field-level error messages, and confirm no server success is reported.",
      prerequisites: [
        "Understanding of client validation and toBeVisible assertion"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 2: Empty form validation", async ({ page }) => {
  await page.goto("/lab/forms");
  // TODO: Click Submit without filling fields, assert all 6 required errors appear
});`,
      task: "Navigate to /lab/forms, click 'Submit intake' immediately, and verify that field-level error messages appear for Full name, Email, Seats, Start date, Track, and Agree to terms.",
      acceptanceCriteria: [
        "Submit button clicked on empty form.",
        "Error 'Enter 2 to 80 characters without HTML' asserted.",
        "Error 'Enter a valid email address' asserted.",
        "Error 'Seats must be an integer from 1 to 12' asserted.",
        "Error 'Enter a real date as YYYY-MM-DD' asserted.",
        "#track-error asserted with 'Choose a track'.",
        "Terms error 'Agree to the lab terms' asserted.",
        "No accepted status message is rendered."
      ],
      expectedBehavior: "Submission is blocked client-side; all invalid inputs display red error messages.",
      hint: "Use page.locator('#track-error') to avoid strict mode collision with the dropdown option text.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 2: Submit an empty form and verify required-field errors", async ({ page }) => {
  await page.goto("/lab/forms");

  await page.getByRole("button", { name: "Submit intake" }).click();

  await expect(page.getByText("Enter 2 to 80 characters without HTML")).toBeVisible();
  await expect(page.getByText("Enter a valid email address")).toBeVisible();
  await expect(page.getByText("Seats must be an integer from 1 to 12")).toBeVisible();
  await expect(page.getByText("Enter a real date as YYYY-MM-DD")).toBeVisible();
  await expect(page.locator("#track-error")).toHaveText("Choose a track");
  await expect(page.getByText("Agree to the lab terms", { exact: true })).toBeVisible();

  await expect(page.getByText(/Accepted as/)).toHaveCount(0);
});`,
      troubleshootingNotes: "Use { exact: true } when matching 'Agree to the lab terms' to prevent substring matching with the <label>.",
      command: "pnpm exec playwright test e2e/practice-forms.spec.ts -g 'Exercise 2'"
    },
    {
      id: "ex3-validate-malformed-email",
      title: "Exercise 3: Validate Malformed Email Input and Error Recovery",
      objective: "Enter an invalid email format, trigger validation, assert the email format error message, then correct the email and assert error clearance.",
      prerequisites: [
        "Understanding input state change and locator.not.toBeVisible"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 3: Malformed email validation", async ({ page }) => {
  await page.goto("/lab/forms");
  // TODO: Enter invalid email, click submit, assert error, fix email, assert error clears
});`,
      task: "Navigate to /lab/forms, enter valid full name but invalid email 'invalid-email-address', click submit, assert '#email-error', then fix email to 'ada@valid.test', click submit, and assert error disappears.",
      acceptanceCriteria: [
        "Email filled with malformed string.",
        "#email-error asserted to be visible with 'Enter a valid email address'.",
        "Email corrected to valid format.",
        "#email-error asserted not to be visible."
      ],
      expectedBehavior: "Error banner appears dynamically for invalid email syntax and clears upon correction.",
      hint: "Check locator('#email-error').toBeVisible() first, then re-fill and assert .not.toBeVisible().",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 3: Validate malformed email input", async ({ page }) => {
  await page.goto("/lab/forms");

  await page.getByLabel("Full name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("invalid-email-address");

  await page.getByRole("button", { name: "Submit intake" }).click();

  const emailError = page.locator("#email-error");
  await expect(emailError).toBeVisible();
  await expect(emailError).toHaveText("Enter a valid email address");

  await page.getByLabel("Email").fill("ada@valid.test");
  await page.getByRole("button", { name: "Submit intake" }).click();

  await expect(emailError).not.toBeVisible();
});`,
      troubleshootingNotes: "Re-clicking submit re-runs client validation and re-evaluates the errors object in React state.",
      command: "pnpm exec playwright test e2e/practice-forms.spec.ts -g 'Exercise 3'"
    },
    {
      id: "ex4-field-limits-bva",
      title: "Exercise 4: Test Minimum and Maximum Field Limits (BVA)",
      objective: "Test boundary-value conditions on numeric and range slider input controls using HTML5 min/max attributes.",
      prerequisites: [
        "Understanding of toHaveAttribute and toHaveValue"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 4: Boundary value analysis", async ({ page }) => {
  await page.goto("/lab/forms");
  // TODO: Switch to All Inputs tab, test min 0 and max 100 on number and range controls
});`,
      task: "Navigate to /lab/forms, switch to the 'All Inputs' tab, assert min 0 and max 100 on the number input, test fill 0 and 100, then test boundary values on range slider.",
      acceptanceCriteria: [
        "Tab switched via getByTestId('tab-inputs').",
        "Number input min and max attributes asserted.",
        "Number input tested at boundary values 0 and 100.",
        "Range slider tested at boundary values 0 and 100 with range-val verification."
      ],
      expectedBehavior: "Inputs accept boundary values accurately and update linked display state.",
      hint: "Use await page.getByTestId('input-number').fill('0'); await expect(numberInput).toHaveValue('0');",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 4: Test minimum and maximum field limits and boundary conditions", async ({ page }) => {
  await page.goto("/lab/forms");

  await page.getByTestId("tab-inputs").click();

  const numberInput = page.getByTestId("input-number");
  await expect(numberInput).toBeVisible();
  await expect(numberInput).toHaveAttribute("min", "0");
  await expect(numberInput).toHaveAttribute("max", "100");

  await numberInput.fill("0");
  await expect(numberInput).toHaveValue("0");

  await numberInput.fill("100");
  await expect(numberInput).toHaveValue("100");

  const rangeSlider = page.getByTestId("input-range");
  await rangeSlider.fill("0");
  await expect(page.getByTestId("range-val")).toHaveText("0");

  await rangeSlider.fill("100");
  await expect(page.getByTestId("range-val")).toHaveText("100");
});`,
      troubleshootingNotes: "Range sliders can be populated directly via locator.fill('50') in Playwright without manual drag gestures.",
      command: "pnpm exec playwright test e2e/practice-forms.spec.ts -g 'Exercise 4'"
    },
    {
      id: "ex5-password-controls",
      title: "Exercise 5: Validate Password Input Controls",
      objective: "Target password input controls, assert password masking attribute (type='password'), enter complex credentials, and assert value securely.",
      prerequisites: [
        "Understanding password field automation in Playwright"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 5: Password field verification", async ({ page }) => {
  await page.goto("/lab/forms");
  // TODO: Switch to All Inputs tab, verify type='password' and test filling password
});`,
      task: "Navigate to /lab/forms, open 'All Inputs' tab, verify that input-password has type='password', fill a complex password string, and verify value.",
      acceptanceCriteria: [
        "Password input located via getByTestId('input-password').",
        "type attribute asserted to be 'password'.",
        "Password value filled and verified with toHaveValue()."
      ],
      expectedBehavior: "Password field obscures plain text in the browser while accepting input value.",
      hint: "await expect(passwordInput).toHaveAttribute('type', 'password');",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 5: Validate password input controls", async ({ page }) => {
  await page.goto("/lab/forms");
  await page.getByTestId("tab-inputs").click();

  const passwordInput = page.getByTestId("input-password");
  await expect(passwordInput).toBeVisible();
  await expect(passwordInput).toHaveAttribute("type", "password");

  await passwordInput.fill("ComplexP@ssw0rd!2026");
  await expect(passwordInput).toHaveValue("ComplexP@ssw0rd!2026");
});`,
      troubleshootingNotes: "Always assert type='password' to prevent security regressions where passwords render in plaintext.",
      command: "pnpm exec playwright test e2e/practice-forms.spec.ts -g 'Exercise 5'"
    },
    {
      id: "ex6-checkbox-radio-dropdown",
      title: "Exercise 6: Test Checkboxes, Radio Buttons, and Dropdowns",
      objective: "Automate native single selects, native multiple selects, and mutually exclusive radio button groups.",
      prerequisites: [
        "Understanding check(), selectOption(), and toBeChecked()"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 6: Dropdowns and radios", async ({ page }) => {
  await page.goto("/lab/forms");
  // TODO: Select single and multi options in Combos tab, check radios in Inputs tab
});`,
      task: "Navigate to /lab/forms, in 'Selects & Comboboxes' tab select 'firefox' on single select, select ['chromium', 'webkit'] on multi-select, switch to 'All Inputs' tab and verify mutually exclusive radio button toggling.",
      acceptanceCriteria: [
        "Single select option 'firefox' selected and verified.",
        "Multiple select options ['chromium', 'webkit'] selected simultaneously.",
        "Radio button A checked -> asserts A checked and B unchecked.",
        "Radio button B checked -> asserts B checked and A unchecked."
      ],
      expectedBehavior: "Selections update live display strings and radio buttons toggle exclusively.",
      hint: "Use await multiSelect.selectOption(['chromium', 'webkit']); and await radioA.check();",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 6: Test checkboxes, radio buttons, and dropdowns", async ({ page }) => {
  await page.goto("/lab/forms");

  await page.getByTestId("tab-combos").click();

  const singleSelect = page.getByTestId("native-single-select");
  await singleSelect.selectOption("firefox");
  await expect(page.getByTestId("single-select-val")).toContainText("firefox");

  const multiSelect = page.getByTestId("native-multi-select");
  await multiSelect.selectOption(["chromium", "webkit"]);
  await expect(page.getByTestId("multi-select-val")).toContainText("chromium, webkit");

  await page.getByTestId("tab-inputs").click();
  const radioA = page.getByTestId("radio-option-a");
  const radioB = page.getByTestId("radio-option-b");

  await radioA.check();
  await expect(radioA).toBeChecked();
  await expect(radioB).not.toBeChecked();

  await radioB.check();
  await expect(radioB).toBeChecked();
  await expect(radioA).not.toBeChecked();
});`,
      troubleshootingNotes: "Multi-select requires an array of value strings passed to selectOption.",
      command: "pnpm exec playwright test e2e/practice-forms.spec.ts -g 'Exercise 6'"
    },
    {
      id: "ex7-server-validation-errors",
      title: "Exercise 7: Verify Server-Side Validation Errors (HTTP 422)",
      objective: "Simulate a backend 422 Unprocessable Entity response using page.route() and assert that the frontend correctly renders server-originated field error details.",
      prerequisites: [
        "Understanding of page.route() network interception"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 7: Server validation errors", async ({ page }) => {
  await page.goto("/lab/forms");
  // TODO: Mock 422 response with seat limit error, submit form, assert server error message
});`,
      task: "Navigate to /lab/forms, intercept /api/lab/forms/intake with a mocked 422 response containing a custom seats error message, fill valid client data with 10 seats, submit, and assert the server error text.",
      acceptanceCriteria: [
        "page.route() intercepts POST /api/lab/forms/intake.",
        "Mocked response returns 422 with structured error details.",
        "Form submitted with client-valid values.",
        "Server-originated error 'Maximum allowable seats for this cohort is 8.' asserted.",
        "Banner 'Express rejected the intake' asserted."
      ],
      expectedBehavior: "Frontend parses backend validation details and maps error onto the corresponding field.",
      hint: "Fulfill route with status 422 and JSON body { error: { message: 'Validation failed', details: [{ field: 'seats', message: '...' }] } }.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 7: Verify server-side validation errors", async ({ page }) => {
  await page.goto("/lab/forms");

  await page.route("**/api/lab/forms/intake", async (route) => {
    await route.fulfill({
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({
        error: {
          message: "Validation failed",
          details: [
            { field: "seats", message: "Maximum allowable seats for this cohort is 8." }
          ]
        }
      })
    });
  });

  await page.getByLabel("Full name").fill("Grace Hopper");
  await page.getByLabel("Email").fill("grace@navy.test");
  await page.getByLabel("Seats").fill("10");
  await page.getByLabel("Start date").fill("2026-11-20");
  await page.getByLabel("Track").selectOption("fixtures");
  await page.getByRole("checkbox", { name: "I agree to the lab terms" }).check();

  await page.getByRole("button", { name: "Submit intake" }).click();

  await expect(page.getByText("Maximum allowable seats for this cohort is 8.")).toBeVisible();
  await expect(page.getByText("Express rejected the intake")).toBeVisible();
});`,
      troubleshootingNotes: "The backend error details array maps directly into the form errors state by field key.",
      command: "pnpm exec playwright test e2e/practice-forms.spec.ts -g 'Exercise 7'"
    },
    {
      id: "ex8-preserve-input-on-api-failure",
      title: "Exercise 8: Handle an API Failure Without Losing User Input",
      objective: "Simulate an unexpected 500 server crash, trigger submission, assert the error alert banner, and verify that user-typed form inputs remain intact.",
      prerequisites: [
        "Understanding of input state retention during network outages"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 8: Input preservation on failure", async ({ page }) => {
  await page.goto("/lab/forms");
  // TODO: Mock 500 error, submit form, assert error message, assert inputs retained
});`,
      task: "Navigate to /lab/forms, mock a 500 Internal Server Error, fill the intake form, submit, verify the error alert appears, and assert that Full name, Email, and Seats retain their values.",
      acceptanceCriteria: [
        "API mocked to return HTTP 500.",
        "Error alert 'Express rejected the intake' asserted.",
        "Full name retains typed value.",
        "Email retains typed value.",
        "Seats retains typed value."
      ],
      expectedBehavior: "Form informs user of failure without clearing input fields.",
      hint: "Use await expect(page.getByLabel('Full name')).toHaveValue(typedName); after failure alert displays.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 8: Handle an API failure without losing user input", async ({ page }) => {
  await page.goto("/lab/forms");

  await page.route("**/api/lab/forms/intake", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "Internal Database Outage" })
    });
  });

  const typedName = "Alan Turing";
  const typedEmail = "turing@bletchley.test";

  await page.getByLabel("Full name").fill(typedName);
  await page.getByLabel("Email").fill(typedEmail);
  await page.getByLabel("Seats").fill("2");
  await page.getByLabel("Start date").fill("2026-12-01");
  await page.getByLabel("Track").selectOption("locators");
  await page.getByRole("checkbox", { name: "I agree to the lab terms" }).check();

  await page.getByRole("button", { name: "Submit intake" }).click();

  await expect(page.getByText("Express rejected the intake")).toBeVisible();

  await expect(page.getByLabel("Full name")).toHaveValue(typedName);
  await expect(page.getByLabel("Email")).toHaveValue(typedEmail);
  await expect(page.getByLabel("Seats")).toHaveValue("2");
});`,
      troubleshootingNotes: "Testing value retention prevents high-friction bugs where users lose their work during intermittent outages.",
      command: "pnpm exec playwright test e2e/practice-forms.spec.ts -g 'Exercise 8'"
    },
    {
      id: "ex9-multi-step-form-wizard",
      title: "Exercise 9: Test a Multi-Step Form Wizard",
      objective: "Navigate across a 3-step form wizard, enter data in sequential steps, verify summary confirmation in the final step, and validate Back button navigation.",
      prerequisites: [
        "Understanding of multi-step wizard state flow"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 9: Multi-step wizard", async ({ page }) => {
  await page.goto("/lab/forms");
  // TODO: Switch to Wizard tab, complete step 1 and 2, verify step 3 summary, test Back button
});`,
      task: "Navigate to /lab/forms, open 'Conditional & Wizard' tab, verify Step 1, fill username, click Next, in Step 2 select 'Enterprise' tier, click Next, in Step 3 verify summary texts, click Back and verify step 2 value.",
      acceptanceCriteria: [
        "Wizard tab opened via getByTestId('tab-wizard').",
        "Step 1 username filled and Next clicked.",
        "Step 2 tier selected and Next clicked.",
        "Step 3 review-user and review-tier asserted.",
        "Back button clicked -> asserts Step 2 and tier value preserved."
      ],
      expectedBehavior: "Wizard accumulates state across forward steps and preserves state during backward navigation.",
      hint: "Use getByTestId('wizard-step-indicator') to synchronize on step transitions.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 9: Test a multi-step form wizard", async ({ page }) => {
  await page.goto("/lab/forms");

  await page.getByTestId("tab-wizard").click();
  await expect(page.getByTestId("wizard-step-indicator")).toHaveText("Step 1 of 3");

  const usernameInput = page.getByTestId("wizard-username-input");
  await usernameInput.fill("senior_automation_lead");
  await page.getByTestId("wizard-next-btn").click();

  await expect(page.getByTestId("wizard-step-indicator")).toHaveText("Step 2 of 3");
  const tierSelect = page.getByTestId("wizard-tier-select");
  await tierSelect.selectOption("Enterprise");
  await page.getByTestId("wizard-next-btn").click();

  await expect(page.getByTestId("wizard-step-indicator")).toHaveText("Step 3 of 3");
  await expect(page.getByTestId("review-user")).toHaveText("senior_automation_lead");
  await expect(page.getByTestId("review-tier")).toHaveText("Enterprise");

  await page.getByTestId("wizard-back-btn").click();
  await expect(page.getByTestId("wizard-step-indicator")).toHaveText("Step 2 of 3");
  await expect(tierSelect).toHaveValue("Enterprise");
});`,
      troubleshootingNotes: "Always assert the step indicator before interacting with the next step's inputs.",
      command: "pnpm exec playwright test e2e/practice-forms.spec.ts -g 'Exercise 9'"
    },
    {
      id: "ex10-loading-duplicate-submit",
      title: "Exercise 10: Verify Loading State and Duplicate-Submit Prevention",
      objective: "Click a protected submit button, assert instantaneous disabled and loading state, wait for settlement, and verify that success count increments by exactly 1.",
      prerequisites: [
        "Understanding of in-flight states and toBeDisabled()"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 10: Duplicate submit protection", async ({ page }) => {
  await page.goto("/lab/forms");
  // TODO: Open Wizard tab, click double-submit-btn, assert disabled & aria-busy, verify count
});`,
      task: "Navigate to /lab/forms, open 'Conditional & Wizard' tab, click 'double-submit-btn', assert it disables immediately with aria-busy='true' and 'Processing...', wait for settlement, and verify submit count is 1.",
      acceptanceCriteria: [
        "Button initially asserted to be enabled.",
        "click() dispatched.",
        "Button immediately asserted to be disabled with aria-busy='true'.",
        "Button re-enables upon completion.",
        "submit-success-count asserted to be exactly 'Successful Submissions: 1'."
      ],
      expectedBehavior: "Button protects against repeated clicks while an operation is in flight.",
      hint: "await expect(doubleSubmitBtn).toHaveAttribute('aria-busy', 'true'); followed by await expect(doubleSubmitBtn).toBeEnabled({ timeout: 5000 });",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 10: Verify loading state and duplicate-submit prevention", async ({ page }) => {
  await page.goto("/lab/forms");
  await page.getByTestId("tab-wizard").click();

  const doubleSubmitBtn = page.getByTestId("double-submit-btn");
  await expect(doubleSubmitBtn).toBeEnabled();

  await doubleSubmitBtn.click();

  await expect(doubleSubmitBtn).toBeDisabled();
  await expect(doubleSubmitBtn).toHaveAttribute("aria-busy", "true");
  await expect(doubleSubmitBtn).toContainText("Processing...");

  await expect(doubleSubmitBtn).toBeEnabled({ timeout: 5000 });
  await expect(page.getByTestId("submit-success-count")).toHaveText("Successful Submissions: 1");
});`,
      troubleshootingNotes: "The in-flight state is active for 800ms; auto-waiting assertions absorb this duration cleanly.",
      command: "pnpm exec playwright test e2e/practice-forms.spec.ts -g 'Exercise 10'"
    },
    {
      id: "ex11-keyboard-only-form-completion",
      title: "Exercise 11: Test Keyboard-Only Form Completion",
      objective: "Complete and submit an authentication form without any mouse click interactions using focus(), keyboard.type(), Tab focus traversal, and Enter submission.",
      prerequisites: [
        "Familiarity with page.keyboard API"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 11: Keyboard form completion", async ({ page }) => {
  await page.goto("/practice/login");
  // TODO: Complete login form using only keyboard keystrokes
});`,
      task: "Navigate to /practice/login, focus username input, type 'student', press Tab to navigate focus to password, type 'Password123!', press Enter to submit, and assert redirection to dashboard.",
      acceptanceCriteria: [
        "Initial focus set to username input.",
        "Data entered via page.keyboard.type().",
        "Focus moved between fields via page.keyboard.press('Tab').",
        "Form submitted via page.keyboard.press('Enter').",
        "Redirection to /practice/dashboard confirmed."
      ],
      expectedBehavior: "User logs in successfully without touching the mouse, verifying keyboard accessibility.",
      hint: "Call usernameInput.focus() -> page.keyboard.type('student') -> page.keyboard.press('Tab') -> etc.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 11: Test keyboard-only form completion", async ({ page }) => {
  await page.goto("/practice/login");

  const usernameInput = page.getByLabel("Practice Username");
  await usernameInput.focus();

  await page.keyboard.type("student");
  await page.keyboard.press("Tab");
  await page.keyboard.type("Password123!");
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/.*\\/practice\\/dashboard/);
  await expect(page.getByRole("heading", { name: "Welcome, student!" })).toBeVisible();
});`,
      troubleshootingNotes: "Ensure the initial input control is focused before dispatching keyboard keystrokes.",
      command: "pnpm exec playwright test e2e/practice-forms.spec.ts -g 'Exercise 11'"
    },
    {
      id: "ex12-senior-form-challenge",
      title: "Exercise 12: Complete a Senior-Level Form Testing Challenge",
      objective: "Test dynamic conditional field rendering, custom ARIA 1.2 combobox popover selection, and debounced autocomplete search across complex form tabs.",
      prerequisites: [
        "Advanced locator chaining, ARIA attributes, and debounced search handling"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 12: Senior form challenge", async ({ page }) => {
  await page.goto("/lab/forms");
  // TODO: Test conditional corporate fields, ARIA combobox selection, and debounced autocomplete
});`,
      task: "Navigate to /lab/forms, in Wizard tab toggle Corporate Account and fill conditional company & tax ID fields; in Combos tab open custom combobox and select 'Python'; type into debounced autocomplete and verify dynamic results list.",
      acceptanceCriteria: [
        "Corporate radio checked -> conditional fields panel rendered.",
        "Company name and tax ID filled and verified.",
        "Custom combobox clicked, listbox option 'Python' selected.",
        "Combobox button text verified to display 'Python'.",
        "Debounced input typed sequentially -> autocomplete results list verified."
      ],
      expectedBehavior: "Advanced interactive controls update application state deterministically.",
      hint: "Use pressSequentially('page.get', { delay: 40 }) to trigger the debounced autocomplete search.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 12: Complete a senior-level form testing challenge", async ({ page }) => {
  await page.goto("/lab/forms");

  // Part 1: Conditional Corporate Fields
  await page.getByTestId("tab-wizard").click();
  await expect(page.getByTestId("corporate-fields-panel")).not.toBeVisible();

  await page.getByTestId("account-corporate-radio").check();
  const corpPanel = page.getByTestId("corporate-fields-panel");
  await expect(corpPanel).toBeVisible();

  await page.getByTestId("company-name-input").fill("Antigravity Systems Corp");
  await page.getByTestId("tax-id-input").fill("US-88492019-X");
  await expect(page.getByTestId("company-name-input")).toHaveValue("Antigravity Systems Corp");

  // Part 2: Custom ARIA 1.2 Combobox Selection
  await page.getByTestId("tab-combos").click();
  const combobox = page.getByTestId("custom-combobox");
  await expect(combobox).toBeVisible();

  await combobox.click();
  const optionsList = page.getByTestId("combobox-options-list");
  await expect(optionsList).toBeVisible();

  await page.getByTestId("combo-option-python").click();
  await expect(optionsList).not.toBeVisible();
  await expect(combobox).toContainText("Python");

  // Part 3: Debounced Autocomplete Input
  const autoInput = page.getByTestId("autocomplete-input");
  await autoInput.pressSequentially("page.get", { delay: 40 });
  const autoResults = page.getByTestId("auto-results");
  await expect(autoResults).toBeVisible();
  await expect(autoResults.getByText("page.getByRole")).toBeVisible();
});`,
      troubleshootingNotes: "The autocomplete search has a 250ms debounce; pressSequentially ensures the keystrokes trigger the handler.",
      command: "pnpm exec playwright test e2e/practice-forms.spec.ts -g 'Exercise 12'"
    }
  ],
  knowledgeCheck: [
    {
      id: "kc-forms-value-vs-text",
      topic: "Input Control Assertions",
      question: "Why must form input values (<input>, <textarea>, <select>) be asserted using toHaveValue() instead of toHaveText()?",
      options: [
        "Because toHaveText() only works in Firefox, not Chromium.",
        "HTML input elements store their current contents in the DOM 'value' property rather than child text nodes; toHaveText() checks textContent and will always fail on inputs.",
        "toHaveValue() is deprecated in modern Playwright.",
        "There is no difference; both matchers behave identically."
      ],
      correctOptionIndex: 1,
      explanation: "<input> and <textarea> elements do not have inner text nodes. Their current state is accessed via the DOM 'value' property, which is specifically evaluated by Playwright's toHaveValue() matcher."
    },
    {
      id: "kc-forms-required-error",
      topic: "Required Field Validation",
      question: "When a form submission is blocked by missing required fields, how should a resilient test assert the failure?",
      options: [
        "Assert that window.alert() was called.",
        "Assert that the field displays an accessible error message (e.g. role='alert' or matching text) and that no success banner is rendered in the DOM.",
        "Check that the browser navigates to /404.",
        "Call page.waitForTimeout(5000)."
      ],
      correctOptionIndex: 1,
      explanation: "Resilient tests assert observable user-facing behavior: field-level error messages associated with the control, aria-invalid attributes, and the absence of success milestones."
    },
    {
      id: "kc-forms-radio-group",
      topic: "Radio Button Automation",
      question: "What is the proper Playwright pattern for selecting a specific option in a mutually exclusive radio button group?",
      options: [
        "Call locator.check() on the desired radio button and assert toBeChecked() on it while asserting not.toBeChecked() on sibling options.",
        "Double click the radio group container.",
        "Use locator.fill('checked').",
        "Execute synthetic JavaScript document.querySelector('input[type=radio]').click()."
      ],
      correctOptionIndex: 0,
      explanation: "Using locator.check() on the target radio button selects it idempotently. Asserting toBeChecked() on the target and not.toBeChecked() on siblings validates mutual exclusivity."
    },
    {
      id: "kc-forms-prevent-double-submit",
      topic: "Duplicate Submission Protection",
      question: "How should an automated test verify that a form correctly prevents duplicate submissions when a user clicks submit in rapid succession?",
      options: [
        "Send 10 concurrent HTTP requests to the backend server.",
        "Verify that upon initial click, the submit button immediately enters a disabled state (toBeDisabled()) or has aria-busy='true', and that the backend only registers a single submission.",
        "Inspect the React component virtual DOM tree.",
        "Duplicate submissions cannot be tested in end-to-end automation."
      ],
      correctOptionIndex: 1,
      explanation: "Testing duplicate-submit protection requires verifying that the user interface disables the submit trigger while an operation is in flight, preventing duplicate POST requests."
    },
    {
      id: "kc-forms-server-422",
      topic: "Server-Side Error Mapping",
      question: "How should you test that a frontend application correctly parses and maps a server-side 422 Unprocessable Entity response to specific input fields?",
      options: [
        "Corrupt the database directly on the CI host.",
        "Use page.route() to intercept the submission endpoint and fulfill with a structured 422 error JSON payload, then assert that the mapped error messages appear in the live DOM.",
        "Wait for a real server crash in staging.",
        "Assert that document.title becomes 'Error'."
      ],
      correctOptionIndex: 1,
      explanation: "page.route() provides deterministic, fast mocking of HTTP 422 validation error payloads, allowing tests to verify frontend field error mapping without mutating server databases."
    },
    {
      id: "kc-forms-preserve-input",
      topic: "State Retention on Failure",
      question: "Why is it critical to test that user inputs remain populated when form submission fails due to an API error?",
      options: [
        "Because browsers automatically crash if input values are lost.",
        "Because if an application wipes user input upon an error, users are forced to re-type all fields, causing severe user frustration and workflow abandonment.",
        "Because Playwright requires inputs to stay populated to run afterEach hooks.",
        "It is not important; clearing all fields on error is considered a best practice."
      ],
      correctOptionIndex: 1,
      explanation: "Preserving user input when validation or server errors occur is a fundamental usability requirement. Testing toHaveValue() after error alerts catches regressions where forms clear inputs."
    },
    {
      id: "kc-forms-bva-strategy",
      topic: "Boundary-Value Analysis",
      question: "In boundary-value analysis (BVA) for a form field accepting an integer number of seats from 1 to 12, which test values provide optimal boundary coverage?",
      options: [
        "Only test 5.",
        "0 (just below min), 1 (min boundary), 6 (nominal), 12 (max boundary), and 13 (just above max).",
        "Test every integer from -1000 to +1000.",
        "Only test negative numbers."
      ],
      correctOptionIndex: 1,
      explanation: "BVA focuses on the boundaries of valid equivalence partitions: minimum (1), maximum (12), one value just below the minimum (0), and one value just above the maximum (13)."
    },
    {
      id: "kc-forms-wizard-state",
      topic: "Multi-Step Wizard Persistence",
      question: "When testing a multi-step form wizard, what critical navigation behavior must be validated?",
      options: [
        "Only test forward clicks from step 1 to the end.",
        "Verify that data entered in earlier steps persists when moving forward, displays in the final review summary, AND is retained when clicking the 'Back' button to return to previous steps.",
        "Verify that the URL never changes.",
        "Ensure all steps share the exact same DOM elements."
      ],
      correctOptionIndex: 1,
      explanation: "Multi-step wizards must accumulate user data forward and preserve state when users navigate backward to correct information before final confirmation."
    },
    {
      id: "kc-forms-combobox-accessibility",
      topic: "Custom ARIA Comboboxes",
      question: "How should an automated test interact with and validate an ARIA 1.2 compliant custom combobox component?",
      options: [
        "Execute driver.findElement(By.xpath('//div[3]')).",
        "Click the combobox element to expand it (verifying aria-expanded='true'), locate the popup listbox (role='listbox'), click the target option (role='option'), and verify the selected value updates.",
        "Inject document.body.innerHTML.",
        "Custom comboboxes cannot be automated with Playwright."
      ],
      correctOptionIndex: 1,
      explanation: "ARIA comboboxes follow standard accessibility patterns: an expand trigger (role='combobox'), a popup container (role='listbox'), and selectable child items (role='option'). Tests interact via accessible roles."
    }
  ],
  practiceTask: {
    labRoute: "/lab/forms",
    labName: "Forms & Validation Laboratory",
    objective: "Automate form fields, client validation error handling, and server response verification.",
    instructions: [
      "Navigate to /lab/forms.",
      "Submit an empty form and assert that all required field-level error messages appear.",
      "Fill valid values for Full name, Email, Seats, Start date, and Track.",
      "Check the terms agreement checkbox.",
      "Pre-register response promise for /api/lab/forms/intake and submit the form.",
      "Assert that the accepted status confirmation is visible with the returned ID."
    ],
    acceptanceCriteria: [
      "Empty submission validated with field-level alerts.",
      "All controls populated with valid data types.",
      "Response promise awaited alongside click action.",
      "Accepted status verified with web-first assertions."
    ],
    hint: "Use page.locator('#track-error') to avoid strict mode collision with the dropdown option text.",
    solutionCode: `import { test, expect } from "@playwright/test";

test("submits intake form and validates acceptance", async ({ page }) => {
  await page.goto("/lab/forms");

  // Step 1: Validate required fields on empty submit
  await page.getByRole("button", { name: "Submit intake" }).click();
  await expect(page.getByText("Enter 2 to 80 characters without HTML")).toBeVisible();
  await expect(page.locator("#track-error")).toHaveText("Choose a track");

  // Step 2: Fill valid form data
  await page.getByLabel("Full name").fill("Katherine Johnson");
  await page.getByLabel("Email").fill("kjohnson@nasa.test");
  await page.getByLabel("Seats").fill("4");
  await page.getByLabel("Start date").fill("2026-11-15");
  await page.getByLabel("Track").selectOption("locators");
  await page.getByRole("checkbox", { name: "I agree to the lab terms" }).check();

  // Step 3: Await response and submit
  const resPromise = page.waitForResponse(
    (res) => res.url().includes("/api/lab/forms/intake") && res.ok()
  );
  await page.getByRole("button", { name: "Submit intake" }).click();
  const response = await resPromise;
  expect(response.status()).toBe(200);

  const body = await response.json();
  await expect(
    page.getByRole("status").filter({ hasText: "Accepted as " + body.id })
  ).toBeVisible();
});`,
    playwrightCommand: "pnpm exec playwright test e2e/practice-forms.spec.ts -g 'Exercise 1'"
  },
  interviewQuestions: [
    {
      question: "How do you design an enterprise-grade form testing strategy that balances fast client-side validation tests with slow end-to-end server integration?",
      answer: "In an enterprise test pyramid, 80% of form validation combinations (boundary values, regex patterns, required field toggles, character limit edge cases) should be tested via fast client-side UI tests combined with page.route() network interception. This allows testing 50+ validation permutations in single-digit seconds without making database round-trips. The remaining 20% should be lean, end-to-end integration tests that submit real data through Express endpoints into the test database to verify database constraints, authentication sessions, and third-party webhook integrations.",
      architecturalContext: "Balances CI pipeline execution speed with high production confidence and zero database bloat."
    },
    {
      question: "What are the architectural trade-offs between testing HTML5 native constraint validation versus custom JavaScript error banners?",
      answer: "HTML5 native constraint validation (required, type='email', min, max, pattern) relies on the browser's built-in validation engine. In Playwright, native popup bubbles cannot be targeted via standard locators, requiring evaluation of el.validity (e.g. el.validity.valueMissing, el.validity.typeMismatch) or CSS pseudo-class :invalid. In contrast, custom JavaScript validation renders explicit DOM elements (<p role='alert' id='error'>) with aria-invalid attributes. While custom validation takes more frontend code, it provides superior testability, accessible screen-reader bindings via aria-describedby, and cross-browser consistency.",
      architecturalContext: "Understands accessibility compliance (WCAG 2.1 3.3.1) and reliable locator strategies."
    },
    {
      question: "How do you architect data-driven testing for complex forms with 50+ fields and conditional cross-field dependencies without test bloat?",
      answer: "1) Separate test data definitions from test execution using TypeScript fixtures or JSON test matrices. 2) Structure test cases around equivalence partitions and boundary-value vectors rather than testing every random input combination. 3) Implement strongly-typed Page Object Models (POM) with fluent builder patterns (e.g. formPage.fillProfile(data).selectTier(tier).submit()). 4) Use parameterization (test.describe.each) to loop through boundary matrices. 5) For multi-step forms, test step validation in isolation by mocking step state rather than repeating steps 1-4 for every single step 5 validation test.",
      architecturalContext: "Maintains scalable, DRY test suites for large enterprise ERP and fintech applications."
    },
    {
      question: "How do you test draft autosave and unsaved-changes protection (window.onbeforeunload) without introducing test flakiness?",
      answer: "Draft autosave should be tested by debouncing input, intercepting the background PATCH/PUT request via page.waitForRequest(), and verifying that the payload contains the current draft state. To test unsaved-changes protection: 1) enter data into a form input, 2) register page.once('dialog', async dialog => { expect(dialog.type()).toBe('beforeunload'); await dialog.dismiss(); }), 3) trigger navigation (e.g. page.goto('/') or click a navigation link), and 4) assert that the page remains on the form URL. Never rely on sleep delays to wait for autosave timers.",
      architecturalContext: "Automates complex browser lifecycles and beforeunload security dialogues reliably."
    }
  ]
};
