import type { Lesson } from "../types";

export const actionsLesson: Lesson = {
  id: "playwright-actions",
  moduleSlug: "actions-and-forms",
  moduleTitle: "Input Automation & Accessible Forms",
  title: "Playwright Browser Actions and Interactions — Beginner to Advanced",
  difficulty: "Intermediate",
  durationMinutes: 40,
  prerequisites: [
    "playwright-introduction",
    "configuration-and-browsers",
    "playwright-locators",
    "playwright-assertions"
  ],
  summary: "Master Playwright's comprehensive interaction engine across pointer events, keyboard shortcuts, accessible form controls, file uploads, dialogs, popups, downloads, frames, shadow roots, and overlay debugging with deterministic actionability checks.",
  sections: [
    {
      id: "interaction-fundamentals",
      title: "Part A — Interaction Fundamentals & Auto-Waiting Actionability Engine",
      content: `Modern web automation must faithfully mirror real user interactions rather than executing synthetic DOM scripts. Playwright bridges this gap through a unified triad: Locators find elements, Actions simulate real user input, and Web-First Assertions verify resulting application state.

1. The Interaction Triad:
In Playwright, an action is never performed in isolation:
- Locator Resolution: Playwright locates the element in the accessibility tree and DOM.
- Actionability Checks: Before executing any action (such as click, fill, or check), Playwright's internal engine continuously verifies that the target element satisfies all necessary actionability criteria.
- Action Execution: Playwright dispatches OS-level input events at the center point of the element's bounding box.
- Web-First Assertion: After the action triggers UI or network state changes, asynchronous matchers verify the new state.

2. The 30-Second Actionability Lifecycle:
Before dispatching a pointer click or keyboard stroke, Playwright automatically checks:
- Attached: The element is present in the live DOM.
- Visible: The element is non-empty, has non-zero computed bounding box dimensions, and does not have visibility:hidden or display:none.
- Stable: The element has stopped moving and completed CSS transitions or JavaScript animations.
- Enabled: The element does not have the HTML disabled attribute or aria-disabled="true".
- Editable: For text input controls, the element is not read-only or disabled.
- Receiving Pointer Events: Hit-testing confirms that no floating overlays, modal backdrops, or sticky banners intercept pointer events at the element's center coordinates.

If any check fails, Playwright transparently pauses and retries until the timeout elapses (default: 30,000ms), eliminating arbitrary sleep hacks.`
    },
    {
      id: "mouse-and-pointer-actions",
      title: "Part B — Mouse & Pointer Actions: Clicks, Coordinates & Drag-and-Drop",
      content: `Playwright provides high-level pointer methods that simulate physical mouse, trackpad, and touch events:

1. click() and dblclick():
- locator.click({ button: 'left' | 'right' | 'middle', clickCount: 1, delay: 0 }): Scrolls the element into view, performs actionability checks, and dispatches mousedown, mouseup, and click events.
- locator.dblclick(): Dispatches two consecutive click sequences within the operating system double-click threshold.

2. hover():
- locator.hover({ position: { x, y } }): Moves the cursor over the target element. Essential for triggering CSS :hover states, dynamic flyout navigation menus, floating tooltips, and floating action buttons.

3. dragTo():
- sourceLocator.dragTo(targetLocator): Performs an atomic drag-and-drop sequence: hovers over source, presses mouse button down, moves pointer smoothly to the target locator center, and releases the mouse button.

4. Coordinate-based Interaction:
While semantic locators are preferred, complex canvas applications, interactive charts, and design tools sometimes require precise coordinate clicks:
await locator.click({ position: { x: 45, y: 120 } });

5. Synthetic dispatchEvent() vs Real Pointer Events:
- locator.dispatchEvent('click'): Fires a synthetic JavaScript Event inside the DOM without performing actionability checks, hit-testing, or scrolling.
- Why synthetic events are an anti-pattern: dispatchEvent() bypasses disabled checks, invisible styles, and blocking overlays. It reports false-positive test passes on UI that real users cannot interact with. Always prefer native locator.click() unless testing low-level custom event handlers.`
    },
    {
      id: "keyboard-interactions",
      title: "Part C — Keyboard Interactions, Modifiers & Focus Traversal",
      content: `Automating keyboard interactions is vital for testing accessible forms, multi-key shortcuts, and rich text editors:

1. fill() vs pressSequentially():
- locator.fill(value): Focuses the element, clears existing contents, and updates the input value atomically while emitting 'input' and 'change' events. This is the fastest, most reliable method for standard form completion.
- locator.pressSequentially(text, { delay: 50 }): Types characters one-by-one with realistic millisecond delays. Required when testing search autocomplete debounce timers, masked inputs (phone numbers, credit cards), or keydown event handlers.
Note: pressSequentially() was introduced in Playwright v1.38 as the official successor to the deprecated locator.type().

2. press() and Special Keys:
locator.press('Enter'), locator.press('Escape'), locator.press('ArrowDown'), locator.press('Backspace').
Playwright accepts standard key names defined by the W3C KeyboardEvent specification.

3. Keyboard Shortcuts and Modifiers:
Combine modifier keys using '+' syntax:
- await page.keyboard.press('Control+A');
- await page.keyboard.press('Control+C');
- await page.keyboard.press('Meta+Enter'); // macOS command key

4. Tab Navigation and Accessible Focus Testing:
Verifying that users can navigate forms without a mouse is a cornerstone of accessibility compliance:
await page.keyboard.press('Tab');
await expect(page.getByLabel('Password')).toBeFocused();
Use page.keyboard directly when testing sequential focus order across elements.`
    },
    {
      id: "forms-and-input-controls",
      title: "Part D — Forms, Complex Input Controls & File Uploads",
      content: `Web forms encompass a wide variety of input types, each requiring specialized Playwright automation patterns:

1. Text Inputs and Textareas:
- Fill text: await page.getByLabel('Full name').fill('Ada Lovelace');
- Clear input: await page.getByLabel('Full name').clear();

2. Number and Date Fields:
- Number: await page.getByLabel('Seats').fill('3');
- Date (ISO format YYYY-MM-DD): await page.getByLabel('Start date').fill('2026-11-02');

3. Checkboxes and Radio Buttons:
- Idempotent Checking: await locator.check(); (asserts state and clicks ONLY if currently unchecked).
- Idempotent Unchecking: await locator.uncheck(); (clicks ONLY if currently checked).
- Explicit State: await locator.setChecked(true | false);
Never use click() on checkboxes, as click() blindly toggles state.

4. Native Dropdown Selects (<select>):
- Select by option value: await page.getByLabel('Track').selectOption('api');
- Select by visible label: await page.getByLabel('Track').selectOption({ label: 'Fixtures' });
- Select by index: await page.getByLabel('Track').selectOption({ index: 2 });
- Select multiple options: await page.getByLabel('Skills').selectOption(['react', 'playwright']);

5. File Uploads via setInputFiles():
Playwright handles HTML <input type="file"> elements without opening native OS file picker dialogues:
- Single local file: await fileInput.setInputFiles('path/to/report.pdf');
- Multiple files: await fileInput.setInputFiles(['data1.csv', 'data2.csv']);
- In-Memory Buffer (ideal for isolated CI runs without disk fixtures):
  await fileInput.setInputFiles({
    name: 'test-data.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('id,name\\n1,Alice')
  });
- Reset/Remove files: await fileInput.setInputFiles([]);

6. Validation and Submission:
Playwright verifies HTML5 constraint validation states using pseudo-class locators:
await expect(page.getByLabel('Email')).toHaveAttribute('required', '');
await expect(page.locator('input:invalid')).toHaveCount(0);`
    },
    {
      id: "dialogs-and-browser-events",
      title: "Part E — Browser Dialogs, Multi-Window Popups & File Downloads",
      content: `Browser events run asynchronously outside the DOM tree. Managing them requires setting up listeners BEFORE triggering the action to prevent race conditions:

1. JavaScript Dialogs (alert, confirm, prompt):
By default, Playwright automatically dismisses all dialogs (alert, confirm, beforeunload) so tests never hang.
To handle dialogs explicitly, register a dialog listener before the triggering action:
page.once('dialog', async dialog => {
  expect(dialog.type()).toBe('confirm');
  expect(dialog.message()).toContain('purge telemetry records');
  await dialog.accept(); // or dialog.dismiss()
});
await page.getByRole('button', { name: 'Trigger Confirm' }).click();

2. Popups and Multi-Window Pages:
When a button or link opens a new tab or window (target="_blank" or window.open):
const popupPromise = page.waitForEvent('popup');
await page.getByTestId('open-popup-btn').click();
const popup = await popupPromise;
await expect(popup).toHaveURL(/.*\\/popup-content/);
await popup.close();

3. File Downloads:
Browsers download files through background network streams. Intercept and verify downloads reliably:
const downloadPromise = page.waitForEvent('download');
await page.getByRole('link', { name: /Download Audit Log/i }).click();
const download = await downloadPromise;

// Verify suggested filename
expect(download.suggestedFilename()).toBe('industrial-test-report.csv');

// Stream content directly in memory or save to disk
const stream = await download.createReadStream();
// Verify file content...
await download.saveAs('./downloads/audit-report.csv');

4. Eliminating Event Listener Race Conditions:
Always create the event Promise BEFORE initiating the user action:
const [download] = await Promise.all([
  page.waitForEvent('download'),
  button.click()
]);`
    },
    {
      id: "advanced-interaction-patterns",
      title: "Part F — Advanced Interactions: Menus, Viewports, Frames & Shadow DOM",
      content: `Enterprise applications leverage complex component architectures. Playwright handles these patterns natively without custom JavaScript injections:

1. Dynamic Menus, Accordions & Tooltips:
Hover or click to expand trigger elements, followed by web-first visibility assertions on dynamic children:
await page.getByRole('button', { name: 'Account settings' }).hover();
await expect(page.getByRole('menuitem', { name: 'Security' })).toBeVisible();
await page.getByRole('menuitem', { name: 'Security' }).click();

2. Elements Outside Viewport & Scrolling:
Playwright automatically scrolls elements into view before clicking. If manual scrolling is needed:
await locator.scrollIntoViewIfNeeded();

3. Iframes and Nested Documents:
Use page.frameLocator() to target elements inside nested iframes without switching contexts manually:
const checkoutFrame = page.frameLocator('iframe#stripe-checkout');
await checkoutFrame.getByLabel('Card number').fill('4242424242424242');
await checkoutFrame.getByRole('button', { name: 'Pay' }).click();

4. Piercing Shadow DOM:
Playwright pierces open Shadow DOM trees automatically! Both CSS selectors and semantic role locators traverse shadow roots seamlessly:
await page.getByRole('button', { name: 'Submit custom component' }).click();
// Pierces <custom-button> -> #shadow-root -> <button>

5. Responsive & Mobile-Style Interactions:
Emulate mobile touch devices and viewports in tests:
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });
await page.getByRole('button', { name: 'Hamburger Menu' }).tap();`
    },
    {
      id: "common-failures-and-best-practices",
      title: "Part G — Root-Cause Debugging, Intercepted Overlays & Flakiness Prevention",
      content: `Understanding why interactions fail and diagnosing them with Playwright's built-in telemetry separates junior automation testers from senior SDETs:

1. 'Element intercepts pointer events' (Overlays & Backdrops):
When a modal backdrop, sticky header, or floating alert covers the target locator, Playwright's hit-testing fails with:
'locator.click: Timeout 30000ms exceeded. Element <div class="backdrop">...</div> intercepts pointer events'
Senior Remediation:
- Do NOT use { force: true }! Forcing clicks on obscured buttons hides defects where real users cannot click.
- Dismiss the overlay naturally: click the modal close button, dismiss the toast, or wait for the banner animation to complete.

2. Element Detached from DOM During Action:
Occurs in React/Vue/Angular apps when a parent component re-renders during state hydration:
Playwright automatically re-locates elements from scratch before each retry, minimizing detachment errors. Ensure your locator is anchored to semantic attributes rather than ephemeral index positions.

3. Why { force: true } is an Anti-Pattern:
Passing { force: true } disables actionability checks (visibility, stability, hit-testing).
When is force legitimate? ONLY in rare edge cases where a 3rd-party library hides the actual <input type="checkbox"> with opacity:0 and renders a stylized <div> over it. In 99% of tests, force:true masks real UI bugs.

4. Unnecessary Fixed Sleeps (page.waitForTimeout):
Never use page.waitForTimeout(5000). Fixed sleeps slow down test suites and fail unpredictably under CI server load. Always rely on action auto-waiting and web-first assertions.

5. Diagnosing Failures with Playwright Traces:
When an interaction times out:
npx playwright show-trace test-results/trace.zip
Trace Viewer provides:
- Visual Action Filmstrip: Step-by-step screenshots before and after every action.
- Action Log: Exact timestamps for Actionability Checks (attached, visible, stable, enabled).
- Console & Network logs: Inspect unhandled client exceptions or API 500 errors.`
    }
  ],
  codeExamples: [
    {
      id: "pointer-actions-drag",
      caption: "Pointer Clicks, Double Clicks, Hover, and Drag-and-Drop",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("demonstrates high-level pointer actions", async ({ page }) => {
  await page.goto("/lab/locators");

  // 1. Single click with auto-waiting
  const checkBtn = page.getByRole("button", { name: "Run check" });
  await checkBtn.click();
  await expect(page.getByText("Check finished")).toBeVisible();

  // 2. Double click
  const dblBtn = page.getByRole("button", { name: "Double click trigger" });
  if (await dblBtn.isVisible()) {
    await dblBtn.dblclick();
  }

  // 3. Hover to reveal floating elements
  const avatar = page.getByTestId("user-profile-menu");
  if (await avatar.isVisible()) {
    await avatar.hover();
    await expect(page.getByRole("menuitem", { name: "Sign Out" })).toBeVisible();
  }

  // 4. Drag and Drop between locators
  const draggable = page.locator("#item-card-1");
  const dropzone = page.locator("#completed-column");
  if (await draggable.isVisible() && await dropzone.isVisible()) {
    await draggable.dragTo(dropzone);
    await expect(dropzone.locator("#item-card-1")).toBeVisible();
  }
});`,
      lineExplanations: [
        { line: 7, explanation: "Locates the button by accessible role and name." },
        { line: 8, explanation: "click() performs actionability checks (visible, stable, enabled) before clicking." },
        { line: 9, explanation: "Web-first assertion waits for resulting text to appear." },
        { line: 15, explanation: "dblclick() dispatches two consecutive clicks within the OS threshold." },
        { line: 20, explanation: "hover() moves the cursor to trigger CSS hover or JS flyout menus." },
        { line: 29, explanation: "dragTo() atomically hovers, grabs, drags across coordinates, and drops." }
      ]
    },
    {
      id: "keyboard-navigation-typing",
      caption: "Keyboard Navigation, Shortcuts, and Sequential Typing",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("keyboard traversal and shortcut interactions", async ({ page }) => {
  await page.goto("/practice/login");

  // Focus the first input control
  const usernameInput = page.getByLabel("Practice Username");
  await usernameInput.focus();

  // Type characters with realistic keyboard simulation
  await page.keyboard.type("student");

  // Tab navigation moves focus to password field
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Practice Password")).toBeFocused();

  // Enter password via sequential typing with delay
  await page.keyboard.type("Password123!");

  // Submit via Enter keypress
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/.*\\/practice\\/dashboard/);
  await expect(page.getByRole("heading", { name: "Welcome, student!" })).toBeVisible();
});`,
      lineExplanations: [
        { line: 8, explanation: "Explicitly sets keyboard focus to the target input." },
        { line: 11, explanation: "page.keyboard.type sends individual keystrokes to the focused element." },
        { line: 14, explanation: "press('Tab') simulates physical keyboard tab navigation." },
        { line: 15, explanation: "toBeFocused() verifies that the browser accessibility focus moved correctly." },
        { line: 21, explanation: "press('Enter') triggers form submission just like a physical keyboard." }
      ]
    },
    {
      id: "form-controls-upload",
      caption: "Forms Automation, Select Options & Buffer File Upload",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("completes comprehensive form with file upload", async ({ page }) => {
  await page.goto("/lab/forms");

  // Text and email fields
  await page.getByLabel("Full name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@lab.test");
  await page.getByLabel("Seats").fill("3");
  await page.getByLabel("Start date").fill("2026-11-02");

  // Select dropdown option by value or label
  const trackSelect = page.getByLabel("Track");
  await trackSelect.selectOption("api");
  expect(await trackSelect.inputValue()).toBe("api");

  // Checkbox: use check() instead of click()
  const termsCheckbox = page.getByRole("checkbox", { name: "I agree to the lab terms" });
  await termsCheckbox.check();
  await expect(termsCheckbox).toBeChecked();

  // In-Memory file upload without disk dependencies
  await page.goto("/lab/flaky");
  await page.getByLabel("Dismiss Overlay").click();
  const fileInput = page.getByLabel("Upload Test Data");

  await fileInput.setInputFiles({
    name: "automation-metrics.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("metric,score\\ncoverage,98\\nspeed,450ms\\n")
  });

  await page.getByRole("button", { name: "Submit File Upload" }).click();
  await expect(page.getByTestId("upload-success")).toContainText("automation-metrics.csv");
});`,
      lineExplanations: [
        { line: 7, explanation: "fill() clears input and sets value atomically." },
        { line: 14, explanation: "selectOption matches the option value attribute." },
        { line: 19, explanation: "check() verifies checkbox state and clicks only if unchecked." },
        { line: 26, explanation: "setInputFiles directly populates file inputs without native dialogs." },
        { line: 29, explanation: "Passes an in-memory Buffer to eliminate local disk fixtures in CI." }
      ]
    },
    {
      id: "async-events-dialogs",
      caption: "Handling Browser Dialogs, Popups & Downloads Without Race Conditions",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("handles dialogs, popups, and downloads reliably", async ({ page }) => {
  // 1. Confirm Dialog: Register listener BEFORE trigger
  await page.goto("/lab/widgets");
  page.once("dialog", async (dialog) => {
    expect(dialog.type()).toBe("confirm");
    expect(dialog.message()).toContain("purge telemetry records");
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Trigger Confirm" }).click();
  await expect(page.getByTestId("dialog-status")).toHaveText("Confirm accepted");

  // 2. Popup Window: Await event promise alongside action
  await page.goto("/lab/browser");
  const popupPromise = page.waitForEvent("popup");
  await page.getByTestId("open-popup-btn").click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/.*\\/lab\\/browser\\/popup-content/);
  await popup.close();

  // 3. File Download: Intercept download event
  await page.goto("/lab/flaky");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: /Download Audit Log/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("industrial-test-report.csv");
});`,
      lineExplanations: [
        { line: 6, explanation: "page.once('dialog') registers a one-time dialog event handler." },
        { line: 9, explanation: "dialog.accept() confirms the dialog (dialog.dismiss() cancels it)." },
        { line: 16, explanation: "page.waitForEvent('popup') sets up the listener before clicking the link." },
        { line: 24, explanation: "page.waitForEvent('download') captures the browser background file stream." }
      ]
    },
    {
      id: "frames-shadow-dom",
      caption: "Navigating Iframes and Piercing Shadow Roots",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("interacts with iframes and open shadow DOM components", async ({ page }) => {
  await page.goto("/lab/locators");

  // 1. FrameLocator: Target elements inside nested iframes
  const embeddedFrame = page.frameLocator("#sandbox-iframe");
  const frameHeading = embeddedFrame.getByRole("heading", { level: 2 });
  if (await frameHeading.isVisible()) {
    await expect(frameHeading).toContainText("Sandboxed Frame Content");
    await embeddedFrame.getByRole("button", { name: "Authorize Frame" }).click();
  }

  // 2. Shadow DOM: Playwright pierces open shadow roots automatically
  const shadowHostBtn = page.getByRole("button", { name: "Search documents" });
  await expect(shadowHostBtn).toBeVisible();
  await shadowHostBtn.click();
});`,
      lineExplanations: [
        { line: 7, explanation: "frameLocator creates a locator scope targeting the iframe document." },
        { line: 8, explanation: "Chained locators inside frameLocator auto-wait inside the frame." },
        { line: 15, explanation: "Standard getByRole queries automatically pierce open shadow DOM trees." }
      ]
    },
    {
      id: "debugging-overlay-actionability",
      caption: "Diagnosing Overlays & Handling Actionability Wait States",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("resolves overlay blocking and verifies actionability", async ({ page }) => {
  await page.goto("/lab/flaky");

  // Floating interceptor covers the viewport
  const overlay = page.getByTestId("floating-interceptor");
  await expect(overlay).toBeVisible();

  // Dismiss the overlay naturally
  await page.getByLabel("Dismiss Overlay").click();
  await expect(overlay).not.toBeVisible();

  // Delayed action button: starts disabled for 1200ms
  const delayedBtn = page.getByRole("button", { name: "Execute Delayed Action" });
  
  // Playwright's click() automatically waits for the button to become enabled!
  await delayedBtn.click();
  await expect(page.locator("#actionability-result")).toContainText("Action successfully executed");
});`,
      lineExplanations: [
        { line: 7, explanation: "Detects the blocking overlay in the viewport." },
        { line: 11, explanation: "Dismisses the overlay through accessible user controls." },
        { line: 12, explanation: "Waits for the overlay to disappear before proceeding." },
        { line: 18, explanation: "click() waits for disabled state to clear automatically without manual sleep." }
      ]
    }
  ],
  commonMistakes: [
    {
      title: "Using { force: true } to bypass intercepted clicks or disabled states",
      badPractice: `// Anti-pattern: Bypassing actionability checks with force
await page.getByRole("button", { name: "Submit" }).click({ force: true });`,
      goodPractice: `// Best practice: Dismiss the blocking element or wait for enabled state
await page.getByLabel("Dismiss modal").click();
await expect(page.getByRole("button", { name: "Submit" })).toBeEnabled();
await page.getByRole("button", { name: "Submit" }).click();`,
      explanation: "force: true disables visibility, stability, and hit-testing checks. If an overlay covers the button or the button is disabled, force: true dispatches a synthetic click anyway, masking critical user-facing bugs."
    },
    {
      title: "Inserting fixed sleeps (page.waitForTimeout) to wait for animations or network requests",
      badPractice: `// Anti-pattern: Hardcoded sleep
await page.getByRole("button", { name: "Save Changes" }).click();
await page.waitForTimeout(4000); // Hope the API call finished`,
      goodPractice: `// Best practice: Auto-waiting and web-first assertions
await page.getByRole("button", { name: "Save Changes" }).click();
await expect(page.getByRole("status")).toHaveText("Changes saved successfully");`,
      explanation: "Fixed sleeps artificially bloat test duration and cause flakiness when CI servers run under heavy CPU load. Web-first assertions poll the DOM at 100ms intervals and resolve immediately upon success."
    },
    {
      title: "Registering dialog, popup, or download event listeners AFTER dispatching the action",
      badPractice: `// Anti-pattern: Triggering the action before setting up the listener
await page.getByRole("button", { name: "Download Report" }).click();
const download = await page.waitForEvent("download"); // Race condition: download may have already started!`,
      goodPractice: `// Best practice: Set up listener promise before or concurrently with action
const downloadPromise = page.waitForEvent("download");
await page.getByRole("button", { name: "Download Report" }).click();
const download = await downloadPromise;`,
      explanation: "Registering event listeners after initiating the trigger causes race conditions. If the browser event fires before the next line executes, the test hangs indefinitely until timeout."
    },
    {
      title: "Calling click() on checkboxes or radio buttons instead of check() or setChecked()",
      badPractice: `// Anti-pattern: click() toggles state blindly
await page.getByRole("checkbox", { name: "Subscribe" }).click();`,
      goodPractice: `// Best practice: check() is idempotent
await page.getByRole("checkbox", { name: "Subscribe" }).check();
// or explicitly set state
await page.getByRole("checkbox", { name: "Subscribe" }).setChecked(true);`,
      explanation: "click() inverts the current state. If the checkbox was already checked by default, click() unchecks it. check() and setChecked() inspect the live state and click only if necessary to achieve the desired state."
    },
    {
      title: "Using deprecated locator.type() instead of fill() or pressSequentially()",
      badPractice: `// Anti-pattern: locator.type is deprecated
await page.getByLabel("Username").type("admin");`,
      goodPractice: `// Best practice: fill() for fast forms, pressSequentially() for keystroke simulation
await page.getByLabel("Username").fill("admin");
// When testing debounced search autocomplete:
await page.getByPlaceholder("Search").pressSequentially("playwright", { delay: 100 });`,
      explanation: "locator.type() was superseded in Playwright v1.38. For standard inputs, fill() clears existing text and sets value in one fast operation. When keystroke delays are needed, use pressSequentially()."
    },
    {
      title: "Invoking dispatchEvent('click') instead of real user pointer clicks",
      badPractice: `// Anti-pattern: Synthetic DOM event dispatch
await page.locator("#submit-btn").dispatchEvent("click");`,
      goodPractice: `// Best practice: User-facing click action with actionability checks
await page.getByRole("button", { name: "Submit" }).click();`,
      explanation: "dispatchEvent() directly triggers the element's event handler in JavaScript without verifying if the element is visible, enabled, in viewport, or free of obstructing overlays. It does not replicate real user behavior."
    }
  ],
  playground: {
    title: "Playwright Interaction Actionability & Dispatch Matrix",
    configExample: `// Comprehensive Playwright Action Options Blueprint
import { test, expect } from "@playwright/test";

test("action options demonstration", async ({ page }) => {
  const submitBtn = page.getByRole("button", { name: "Submit Intake" });

  // 1. Standard action with default actionability auto-waiting
  await submitBtn.click();

  // 2. Custom timeout and position click
  await submitBtn.click({
    timeout: 10000,             // Maximum wait time for actionability (default: 30s)
    position: { x: 10, y: 10 }, // Click at offset from top-left corner
    button: "left",             // "left" | "right" | "middle"
    clickCount: 1,              // Number of clicks (e.g. 2 for double click)
    delay: 50                   // Milliseconds to wait between mousedown and mouseup
  });

  // 3. Modifier keys with click
  await submitBtn.click({
    modifiers: ["Shift", "Control"] // Simulate Shift+Ctrl+Click
  });

  // 4. Trial run (performs actionability checks without actually clicking)
  await submitBtn.click({ trial: true });

  // 5. Sequential typing with keystroke delay
  const searchInput = page.getByPlaceholder("Search components...");
  await searchInput.pressSequentially("playwright", { delay: 100 });

  // 6. Idempotent form check
  const termsCheckbox = page.getByRole("checkbox", { name: "Agree to terms" });
  await termsCheckbox.setChecked(true);
});`,
    properties: [
      {
        name: "force",
        type: "boolean",
        defaultValue: "false",
        description: "Bypasses actionability checks (visible, stable, enabled, hit-testing).",
        impact: "Hazardous in 99% of cases; masks genuine user-facing accessibility and overlay bugs."
      },
      {
        name: "noWaitAfter",
        type: "boolean",
        defaultValue: "false",
        description: "Skips waiting for page navigations triggered by the action.",
        impact: "Useful only when clicking buttons known to trigger cross-origin unload events or page unmounts."
      },
      {
        name: "timeout",
        type: "number",
        defaultValue: "30000 (from config)",
        description: "Maximum duration in milliseconds to wait for element actionability.",
        impact: "Allows individual actions to fail faster or tolerate known high-latency operations."
      },
      {
        name: "button",
        type: "'left' | 'right' | 'middle'",
        defaultValue: "'left'",
        description: "Determines which mouse button is pressed during pointer actions.",
        impact: "Enables context menu testing ('right') and tab opening ('middle')."
      },
      {
        name: "clickCount",
        type: "number",
        defaultValue: "1",
        description: "Number of consecutive clicks dispatched.",
        impact: "Used for double clicks (2) or triple clicks (3) to select whole text paragraphs."
      },
      {
        name: "delay",
        type: "number",
        defaultValue: "0",
        description: "Time in milliseconds to pause between mousedown and mouseup events.",
        impact: "Simulates long-press gestures or allows dragging frameworks to register grab state."
      },
      {
        name: "position",
        type: "{ x: number; y: number }",
        defaultValue: "element center",
        description: "Relative pixel coordinates from top-left corner of the element bounding box.",
        impact: "Allows clicking specific regions of canvas widgets, charts, and image maps."
      },
      {
        name: "modifiers",
        type: "Array<'Alt' | 'Control' | 'Meta' | 'Shift'>",
        defaultValue: "[]",
        description: "Keyboard modifier keys held down while dispatching pointer actions.",
        impact: "Essential for multi-select (Shift+Click, Ctrl+Click) and shortcut workflows."
      },
      {
        name: "trial",
        type: "boolean",
        defaultValue: "false",
        description: "Executes actionability checks without actually performing the action.",
        impact: "Validates that an element is ready for interaction before orchestrating complex workflows."
      },
      {
        name: "strict",
        type: "boolean",
        defaultValue: "true",
        description: "Enforces that the locator resolves to exactly one element.",
        impact: "Prevents accidental interaction with unintended sibling elements when multiple match."
      },
      {
        name: "hasText",
        type: "string | RegExp",
        defaultValue: "undefined",
        description: "Filters parent elements by containing text before executing actions.",
        impact: "Ensures actions are targeted to the exact card, row, or container desired."
      },
      {
        name: "hasNotText",
        type: "string | RegExp",
        defaultValue: "undefined",
        description: "Filters out elements containing specific text.",
        impact: "Guarantees actions avoid deprecated, deleted, or placeholder cards."
      }
    ],
    behaviorComparison: [
      {
        aspect: "locator.click() vs locator.dispatchEvent('click')",
        defaultBehavior: "click() scrolls element into view, performs actionability checks, verifies center point is not blocked by overlays, and dispatches real OS pointer events.",
        customizedBehavior: "dispatchEvent('click') dispatches a synthetic DOM event directly, ignoring disabled state, visibility, and overlays. Masks real-world usability bugs."
      },
      {
        aspect: "locator.fill() vs locator.pressSequentially()",
        defaultBehavior: "fill() focuses input, clears existing text, and sets the value atomically with input/change events. Maximum speed and stability.",
        customizedBehavior: "pressSequentially() simulates character-by-character typing with optional delays. Required for debounced search and masked input validation."
      },
      {
        aspect: "locator.check() vs locator.click() on checkboxes",
        defaultBehavior: "check() verifies current checkbox state and clicks only if unchecked. Completely idempotent.",
        customizedBehavior: "click() blindly toggles state. If the checkbox is already checked, click() will uncheck it, introducing test state drift."
      },
      {
        aspect: "Pre-registering vs Post-registering Event Listeners",
        defaultBehavior: "page.waitForEvent('download') or page.once('dialog') is called BEFORE the triggering action. Guaranteed zero race conditions.",
        customizedBehavior: "Setting up listeners after clicking leads to dropped events if the browser fires the event before the next JavaScript tick."
      },
      {
        aspect: "locator.dragTo() vs Low-level mouse sequence",
        defaultBehavior: "dragTo() calculates source and target center points and automates hover, mouse down, move, and release atomically.",
        customizedBehavior: "page.mouse.move(), down(), and up() require manual coordinate tracking and are sensitive to viewport resolution changes."
      },
      {
        aspect: "Action Auto-Waiting vs Manual page.waitForTimeout()",
        defaultBehavior: "Playwright retries actionability checks continuously for 30s, dispatching the action the exact millisecond the element is ready.",
        customizedBehavior: "page.waitForTimeout(5000) wastes CPU time on fast machines and still fails when CI runners experience temporary latency spikes."
      }
    ],
    practiceTask: "Automate form submissions, keyboard navigation, dialog confirms, popups, and file uploads across the live industrial lab routes.",
    localCommand: "pnpm exec playwright test e2e/practice-actions.spec.ts"
  },
  exercises: [
    {
      id: "ex1-click-button-state",
      title: "Exercise 1: Click a Button and Assert the Resulting State",
      objective: "Locate an interactive button by its accessible role, perform a click action with actionability auto-waiting, and assert the resulting DOM state change.",
      prerequisites: [
        "Node.js 18+ and Playwright installed",
        "Understanding of getByRole locators and web-first assertions"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 1: Click button and assert state", async ({ page }) => {
  await page.goto("/lab/locators");
  // TODO: Locate button 'Run check', click it, and assert 'Check finished' appears
});`,
      task: "Navigate to /lab/locators, locate the button named 'Run check', execute click(), and assert that the text 'Check finished' becomes visible.",
      acceptanceCriteria: [
        "Button is located using getByRole('button', { name: 'Run check' }).",
        "click() action is executed without hardcoded sleeps.",
        "State text 'Check finished' is asserted using toBeVisible()."
      ],
      expectedBehavior: "Clicking the button updates the internal test status and renders 'Check finished' on screen.",
      hint: "Use await page.getByRole('button', { name: 'Run check' }).click(); followed by await expect(page.getByText('Check finished')).toBeVisible();",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 1: Click a button and assert the resulting state", async ({ page }) => {
  await page.goto("/lab/locators");

  const checkBtn = page.getByRole("button", { name: "Run check" });
  await expect(checkBtn).toBeVisible();

  await checkBtn.click();
  await expect(page.getByText("Check finished")).toBeVisible();
});`,
      troubleshootingNotes: "If the button is not found, verify exact case matching in the name parameter or check if strict mode found multiple buttons.",
      command: "pnpm exec playwright test e2e/practice-actions.spec.ts -g 'Exercise 1'"
    },
    {
      id: "ex2-fill-form-validate",
      title: "Exercise 2: Fill a Form and Validate Submitted Values",
      objective: "Fill text, email, number, date, and select controls, intercept the network response, submit the form, and validate submitted payload.",
      prerequisites: [
        "Basic understanding of page.getByLabel and page.waitForResponse"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 2: Fill form and validate values", async ({ page }) => {
  await page.goto("/lab/forms");
  // TODO: Fill Full name, Email, Seats, Start date, Track, Agree to terms, submit, and verify status
});`,
      task: "Navigate to /lab/forms, fill all required fields using fill(), selectOption(), and check(), await the /api/lab/forms/intake response, click 'Submit intake', and verify the accepted status.",
      acceptanceCriteria: [
        "All fields filled via getByLabel.",
        "Checkbox checked via check().",
        "Response intercepted via page.waitForResponse before clicking submit.",
        "Response status is 200 and accepted message is visible."
      ],
      expectedBehavior: "Form is submitted successfully and response confirmation with ID is rendered.",
      hint: "Set up the response promise before clicking: const resPromise = page.waitForResponse(res => res.url().includes('/api/lab/forms/intake') && res.ok());",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 2: Fill a form and validate the submitted values", async ({ page }) => {
  await page.goto("/lab/forms");

  await page.getByLabel("Full name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@lab.test");
  await page.getByLabel("Seats").fill("3");
  await page.getByLabel("Start date").fill("2026-11-02");
  await page.getByLabel("Track").selectOption("api");
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
      troubleshootingNotes: "Ensure Start date is formatted in ISO format YYYY-MM-DD for native HTML5 date input fields.",
      command: "pnpm exec playwright test e2e/practice-actions.spec.ts -g 'Exercise 2'"
    },
    {
      id: "ex3-keyboard-navigation",
      title: "Exercise 3: Use Keyboard Navigation to Complete a Form",
      objective: "Complete an authentication form purely through keyboard simulation: focus initial field, type characters, navigate via Tab, and submit via Enter.",
      prerequisites: [
        "Familiarity with page.keyboard.press and page.keyboard.type"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 3: Keyboard form navigation", async ({ page }) => {
  await page.goto("/practice/login");
  // TODO: Focus username, type 'student', press Tab, type password, press Enter
});`,
      task: "Navigate to /practice/login, focus 'Practice Username', type 'student', press Tab to navigate to password, type 'Password123!', and press Enter to submit.",
      acceptanceCriteria: [
        "Username focused via locator.focus().",
        "Navigation between fields done via page.keyboard.press('Tab').",
        "Form submitted via page.keyboard.press('Enter').",
        "User arrives on /practice/dashboard with welcome heading."
      ],
      expectedBehavior: "User logs in successfully without any mouse click actions.",
      hint: "Call await usernameInput.focus(); followed by page.keyboard.type('student'); page.keyboard.press('Tab'); etc.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 3: Use keyboard navigation to complete a form", async ({ page }) => {
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
      troubleshootingNotes: "If focus does not advance, verify that the browser window has focus and no modal or alert intercepts keyboard events.",
      command: "pnpm exec playwright test e2e/practice-actions.spec.ts -g 'Exercise 3'"
    },
    {
      id: "ex4-select-dropdown",
      title: "Exercise 4: Select a Dropdown Option",
      objective: "Target a native HTML <select> dropdown, select options by string value and by visible label object, and assert the element value.",
      prerequisites: [
        "Understanding locator.selectOption and toHaveValue assertion"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 4: Select dropdown option", async ({ page }) => {
  await page.goto("/lab/forms");
  // TODO: Select track option by value 'api' and by label 'Fixtures'
});`,
      task: "Navigate to /lab/forms, select the 'api' option using value string, assert value, then select 'Fixtures' by label object and assert value.",
      acceptanceCriteria: [
        "Dropdown located via getByLabel('Track').",
        "selectOption('api') executed and value verified.",
        "selectOption({ label: 'Fixtures' }) executed and value verified."
      ],
      expectedBehavior: "Dropdown changes value accurately based on value and label queries.",
      hint: "Use await trackSelect.selectOption('api'); and await trackSelect.selectOption({ label: 'Fixtures' });",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 4: Select a dropdown option", async ({ page }) => {
  await page.goto("/lab/forms");

  const trackSelect = page.getByLabel("Track");
  await expect(trackSelect).toBeVisible();

  // Select by value
  await trackSelect.selectOption("api");
  await expect(trackSelect).toHaveValue("api");

  // Select by label
  await trackSelect.selectOption({ label: "Fixtures" });
  await expect(trackSelect).toHaveValue("fixtures");
});`,
      troubleshootingNotes: "Remember that the value attribute for 'Fixtures' in this lab is lowercase 'fixtures'.",
      command: "pnpm exec playwright test e2e/practice-actions.spec.ts -g 'Exercise 4'"
    },
    {
      id: "ex5-check-uncheck-controls",
      title: "Exercise 5: Check and Uncheck Controls",
      objective: "Automate checkbox controls using idempotent check(), uncheck(), and setChecked() methods.",
      prerequisites: [
        "Understanding toBeChecked and not.toBeChecked assertions"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 5: Check and uncheck controls", async ({ page }) => {
  await page.goto("/lab/forms");
  // TODO: Locate terms checkbox, check it, uncheck it, setChecked(true)
});`,
      task: "Navigate to /lab/forms, locate the terms checkbox, assert initial unchecked state, check it, uncheck it, and use setChecked(true).",
      acceptanceCriteria: [
        "Checkbox asserted initially with not.toBeChecked().",
        "check() executed and asserted with toBeChecked().",
        "uncheck() executed and asserted with not.toBeChecked().",
        "setChecked(true) executed and asserted with toBeChecked()."
      ],
      expectedBehavior: "Checkbox toggles strictly to the specified state idempotently.",
      hint: "Use await checkbox.check(); await expect(checkbox).toBeChecked();",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 5: Check and uncheck controls", async ({ page }) => {
  await page.goto("/lab/forms");

  const checkbox = page.getByRole("checkbox", { name: "I agree to the lab terms" });
  await expect(checkbox).not.toBeChecked();

  await checkbox.check();
  await expect(checkbox).toBeChecked();

  await checkbox.uncheck();
  await expect(checkbox).not.toBeChecked();

  await checkbox.setChecked(true);
  await expect(checkbox).toBeChecked();
});`,
      troubleshootingNotes: "Do not use click() because calling click() on an already-checked box would uncheck it.",
      command: "pnpm exec playwright test e2e/practice-actions.spec.ts -g 'Exercise 5'"
    },
    {
      id: "ex6-handle-confirm-dialog",
      title: "Exercise 6: Handle a Confirmation Dialog",
      objective: "Intercept native JavaScript browser dialogs (confirm) by registering a page.once('dialog') listener before triggering the action.",
      prerequisites: [
        "Familiarity with page.once('dialog') and dialog.accept()"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 6: Handle confirm dialog", async ({ page }) => {
  await page.goto("/lab/widgets");
  // TODO: Register dialog handler, click 'Trigger Confirm', assert confirmation status
});`,
      task: "Navigate to /lab/widgets, register a dialog listener verifying dialog.type() is 'confirm' and calling dialog.accept(), click 'Trigger Confirm', and assert dialog status.",
      acceptanceCriteria: [
        "Dialog listener registered before click.",
        "dialog.type() and message validated.",
        "dialog.accept() awaited.",
        "dialog-status element displays 'Confirm accepted'."
      ],
      expectedBehavior: "The browser confirm dialog is accepted cleanly without hanging the test.",
      hint: "page.once('dialog', async (dialog) => { await dialog.accept(); }); must precede the click.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 6: Handle a confirmation dialog", async ({ page }) => {
  await page.goto("/lab/widgets");

  page.once("dialog", async (dialog) => {
    expect(dialog.type()).toBe("confirm");
    expect(dialog.message()).toContain("purge telemetry records");
    await dialog.accept();
  });

  await page.getByRole("button", { name: "Trigger Confirm" }).click();
  await expect(page.getByTestId("dialog-status")).toHaveText("Confirm accepted");
});`,
      troubleshootingNotes: "If page.once is called after click(), the dialog may be dismissed automatically by Playwright before the listener attaches.",
      command: "pnpm exec playwright test e2e/practice-actions.spec.ts -g 'Exercise 6'"
    },
    {
      id: "ex7-open-validate-popup",
      title: "Exercise 7: Open and Validate a Popup Window",
      objective: "Manage multi-window browser interactions by awaiting page.waitForEvent('popup') concurrently with the trigger click.",
      prerequisites: [
        "Understanding of multi-page contexts in Playwright"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 7: Open and validate popup", async ({ page }) => {
  await page.goto("/lab/browser");
  // TODO: Listen for popup, click open-popup-btn, verify popup content, close popup
});`,
      task: "Navigate to /lab/browser, wait for popup event while clicking open-popup-btn, verify popup URL and title, and close the popup window.",
      acceptanceCriteria: [
        "popupPromise created via page.waitForEvent('popup').",
        "Popup URL matches /lab/browser/popup-content.",
        "Popup title element verified.",
        "popup.close() called and isClosed() confirmed."
      ],
      expectedBehavior: "A new browser page/tab is captured, verified, and cleanly closed.",
      hint: "const popupPromise = page.waitForEvent('popup'); await page.getByTestId('open-popup-btn').click(); const popup = await popupPromise;",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 7: Open and validate a popup window", async ({ page }) => {
  await page.goto("/lab/browser");

  const popupPromise = page.waitForEvent("popup");
  await page.getByTestId("open-popup-btn").click();
  const popup = await popupPromise;

  await expect(popup).toHaveURL(/.*\\/lab\\/browser\\/popup-content/);
  await expect(popup.getByTestId("popup-title")).toHaveText("Popup Inspection Target");

  await popup.close();
  expect(popup.isClosed()).toBe(true);
});`,
      troubleshootingNotes: "Ensure the popup is closed after validation so it does not consume resources in worker contexts.",
      command: "pnpm exec playwright test e2e/practice-actions.spec.ts -g 'Exercise 7'"
    },
    {
      id: "ex8-upload-file",
      title: "Exercise 8: Upload a Valid File Using In-Memory Buffer",
      objective: "Dismiss blocking overlays and upload a CSV file using an in-memory buffer via locator.setInputFiles() without local disk dependencies.",
      prerequisites: [
        "Understanding locator.setInputFiles and Buffer API"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 8: Upload file via buffer", async ({ page }) => {
  await page.goto("/lab/flaky");
  // TODO: Dismiss overlay, setInputFiles with buffer, submit upload, assert success
});`,
      task: "Navigate to /lab/flaky, dismiss the floating overlay, upload a CSV file named automation-metrics.csv using an in-memory Buffer, click Submit, and assert success.",
      acceptanceCriteria: [
        "Overlay dismissed before interaction.",
        "setInputFiles called with name, mimeType, and Buffer.from.",
        "Filename rendered in file display.",
        "Upload submitted and success banner verified."
      ],
      expectedBehavior: "File is uploaded and recognized by the server intake without touching disk.",
      hint: "await fileInput.setInputFiles({ name: 'automation-metrics.csv', mimeType: 'text/csv', buffer: Buffer.from('metric,score\\n') });",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 8: Upload a valid and invalid file", async ({ page }) => {
  await page.goto("/lab/flaky");

  await page.getByLabel("Dismiss Overlay").click();
  await expect(page.getByTestId("floating-interceptor")).not.toBeVisible();

  const fileInput = page.getByLabel("Upload Test Data");
  await fileInput.setInputFiles({
    name: "automation-metrics.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("metric,score\\ncoverage,98\\nspeed,450ms\\n"),
  });

  await expect(page.getByText("automation-metrics.csv")).toBeVisible();
  await page.getByRole("button", { name: "Submit File Upload" }).click();
  await expect(page.getByTestId("upload-success")).toBeVisible();
  await expect(page.getByTestId("upload-success")).toContainText("automation-metrics.csv");
});`,
      troubleshootingNotes: "If the file input cannot be clicked directly because of custom styling, setInputFiles bypasses standard clickability requirements.",
      command: "pnpm exec playwright test e2e/practice-actions.spec.ts -g 'Exercise 8'"
    },
    {
      id: "ex9-trigger-verify-download",
      title: "Exercise 9: Trigger and Verify a File Download",
      objective: "Capture browser file download events, validate suggested filenames, and verify CSV content directly from the download read stream.",
      prerequisites: [
        "Familiarity with page.waitForEvent('download') and download.createReadStream"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 9: Trigger and verify file download", async ({ page }) => {
  await page.goto("/lab/flaky");
  // TODO: Set up download promise, click Download link, verify filename and stream content
});`,
      task: "Navigate to /lab/flaky, wait for download event while clicking the Download link, assert suggestedFilename is 'industrial-test-report.csv', and verify header in download stream.",
      acceptanceCriteria: [
        "downloadPromise set up before click.",
        "suggestedFilename asserted.",
        "Stream read and verified to contain 'id,scenario,category,status'.",
        "Zero reliance on fixed timeouts."
      ],
      expectedBehavior: "File download stream is captured and validated in memory.",
      hint: "const downloadPromise = page.waitForEvent('download'); await link.click(); const download = await downloadPromise;",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 9: Trigger and verify a file download", async ({ page }) => {
  await page.goto("/lab/flaky");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: /Download Audit Log/i }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("industrial-test-report.csv");

  const stream = await download.createReadStream();
  expect(stream).not.toBeNull();

  const chunks: Buffer[] = [];
  for await (const chunk of stream!) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const content = Buffer.concat(chunks).toString("utf-8");
  expect(content).toContain("id,scenario,category,status,executionTimeMs");
});`,
      troubleshootingNotes: "Reading the stream directly in memory avoids file management cleanups on CI runners.",
      command: "pnpm exec playwright test e2e/practice-actions.spec.ts -g 'Exercise 9'"
    },
    {
      id: "ex10-debug-overlay-interception",
      title: "Exercise 10: Debug an Interaction Blocked by an Overlay",
      objective: "Diagnose an element intercepted by a modal/banner overlay, dismiss the blocker naturally without { force: true }, and execute the action.",
      prerequisites: [
        "Understanding actionability hit-testing failures"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 10: Debug overlay interception", async ({ page }) => {
  await page.goto("/lab/flaky");
  // TODO: Assert overlay visible, dismiss overlay, assert overlay hidden, verify target input enabled
});`,
      task: "Navigate to /lab/flaky, detect the floating-interceptor overlay, dismiss it using the accessible close button, assert it disappeared, and verify the file input is enabled.",
      acceptanceCriteria: [
        "Overlay asserted to be visible initially.",
        "Overlay dismissed via user-facing button.",
        "Overlay asserted not to be visible.",
        "Underlying control asserted to be enabled."
      ],
      expectedBehavior: "Target control becomes interactable naturally without synthetic force flags.",
      hint: "await page.getByLabel('Dismiss Overlay').click(); followed by await expect(overlay).not.toBeVisible();",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 10: Debug an interaction blocked by an overlay", async ({ page }) => {
  await page.goto("/lab/flaky");

  const overlay = page.getByTestId("floating-interceptor");
  await expect(overlay).toBeVisible();

  await page.getByLabel("Dismiss Overlay").click();
  await expect(overlay).not.toBeVisible();

  const uploadInput = page.getByLabel("Upload Test Data");
  await expect(uploadInput).toBeEnabled();
});`,
      troubleshootingNotes: "Always assert the overlay has disappeared before interacting with the underlying element to prevent transient race conditions.",
      command: "pnpm exec playwright test e2e/practice-actions.spec.ts -g 'Exercise 10'"
    },
    {
      id: "ex11-realistic-user-workflow",
      title: "Exercise 11: Complete a Realistic Multi-Step User Workflow",
      objective: "Automate an end-to-end user journey across login, authenticated dashboard verification, logout execution, and session revocation validation.",
      prerequisites: [
        "Understanding end-to-end workflow chaining and session persistence"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 11: Multi-step user workflow", async ({ page }) => {
  // TODO: Login at /practice/login, verify /practice/dashboard, click logout, assert logged out banner
});`,
      task: "Navigate to /practice/login, sign in as 'student' with 'Password123!', verify dashboard redirect and welcome message, click logout button, and verify loggedOut=true banner.",
      acceptanceCriteria: [
        "Form completed with fill() and submitted via click().",
        "URL verified to include /practice/dashboard.",
        "Logout button clicked.",
        "URL verified to redirect to /practice/login?loggedOut=true with banner."
      ],
      expectedBehavior: "User completes the full authentication lifecycle smoothly and securely.",
      hint: "Check URL with await expect(page).toHaveURL(/.*\\/practice\\/dashboard/); and logout with page.getByTestId('logout-btn').click();",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 11: Complete a realistic multi-step user workflow", async ({ page }) => {
  await page.goto("/practice/login");

  await page.getByLabel("Practice Username").fill("student");
  await page.getByLabel("Practice Password").fill("Password123!");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL(/.*\\/practice\\/dashboard/);
  await expect(page.getByTestId("welcome-message")).toContainText("Welcome, student!");
  await expect(page.getByTestId("session-info")).toBeVisible();

  await page.getByTestId("logout-btn").click();

  await expect(page).toHaveURL(/.*\\/practice\\/login\\?loggedOut=true/);
  await expect(page.getByTestId("logged-out-banner")).toContainText("You have been signed out successfully.");
});`,
      troubleshootingNotes: "Ensure you use web-first assertions for URL transitions rather than immediate window.location checks.",
      command: "pnpm exec playwright test e2e/practice-actions.spec.ts -g 'Exercise 11'"
    },
    {
      id: "ex12-senior-interaction-reliability",
      title: "Exercise 12: Solve a Senior-Level Interaction Reliability Challenge",
      objective: "Interact with an element that initializes in a disabled state for 1200ms by leveraging Playwright's automatic actionability wait without hardcoded sleeps.",
      prerequisites: [
        "Understanding actionability checks and avoiding sleep anti-patterns"
      ],
      starterConfig: `import { test, expect } from "@playwright/test";

test("Exercise 12: Actionability reliability challenge", async ({ page }) => {
  await page.goto("/lab/flaky");
  // TODO: Dismiss overlay, click delayed button WITHOUT sleep, assert result text
});`,
      task: "Navigate to /lab/flaky, dismiss the overlay, click the button 'Execute Delayed Action' (which remains disabled for 1200ms), and assert that the action success result appears without using waitForTimeout.",
      acceptanceCriteria: [
        "Overlay dismissed first.",
        "click() called directly on delayed button.",
        "Zero arbitrary sleeps (waitForTimeout) in test code.",
        "Success confirmation text asserted."
      ],
      expectedBehavior: "Playwright automatically polls and waits for the button to become enabled before dispatching the click.",
      hint: "Do NOT use waitForTimeout(2000). Just call await delayedBtn.click(); Playwright waits for 'enabled' automatically!",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 12: Solve a senior-level interaction reliability challenge", async ({ page }) => {
  await page.goto("/lab/flaky");

  await page.getByLabel("Dismiss Overlay").click();

  const delayedBtn = page.getByRole("button", { name: "Execute Delayed Action" });
  await delayedBtn.click();

  const result = page.locator("#actionability-result");
  await expect(result).toBeVisible();
  await expect(result).toContainText("Action successfully executed after actionability wait");
});`,
      troubleshootingNotes: "Playwright's default action timeout is 30,000ms. Since the delay is only 1,200ms, click() seamlessly absorbs the latency.",
      command: "pnpm exec playwright test e2e/practice-actions.spec.ts -g 'Exercise 12'"
    }
  ],
  knowledgeCheck: [
    {
      id: "kc-actions-autowait",
      topic: "Actionability Auto-Waiting",
      question: "What specific actionability checks does Playwright perform automatically before dispatching a locator.click() action?",
      options: [
        "Only checks if the element is present in the DOM tree.",
        "Verifies the element is Attached, Visible, Stable, Enabled, and receiving pointer events (not obscured by overlays).",
        "Forces the click immediately without inspecting element state.",
        "Evaluates JavaScript document.readyState === 'complete'."
      ],
      correctOptionIndex: 1,
      explanation: "Before clicking, Playwright ensures the element is in the DOM, has non-zero geometry, has stopped animating, is not disabled, and passes hit-testing at its center coordinates."
    },
    {
      id: "kc-actions-fill-vs-type",
      topic: "fill() vs Character Typing",
      question: "Why is locator.fill() preferred over character-by-character typing for standard form inputs?",
      options: [
        "locator.fill() is required because typing is not supported in Chromium.",
        "locator.fill() focuses the control, clears existing text, and sets the value atomically with input/change events in a single fast operation.",
        "locator.fill() bypasses React and Vue state updates.",
        "locator.fill() disables server-side input validation."
      ],
      correctOptionIndex: 1,
      explanation: "fill() is up to 10x faster than typing character by character, guarantees clean replacement of existing text, and emits proper input/change events for frontend frameworks."
    },
    {
      id: "kc-actions-check-idempotent",
      topic: "Checkbox Automation",
      question: "What is the critical behavioral difference between locator.check() and locator.click() on a checkbox element?",
      options: [
        "There is no difference; both execute the exact same DOM method.",
        "locator.click() is idempotent, whereas locator.check() toggles the state.",
        "locator.check() is idempotent: it inspects the checkbox state and clicks ONLY if currently unchecked. locator.click() blindly inverts state.",
        "locator.check() only works with radio buttons."
      ],
      correctOptionIndex: 2,
      explanation: "If a checkbox is already checked (e.g. by default server state), locator.click() will uncheck it, corrupting test state. locator.check() guarantees the checkbox ends up checked regardless of initial state."
    },
    {
      id: "kc-actions-dialog-race",
      topic: "Dialog Event Race Conditions",
      question: "When automating browser confirm/alert dialogs in Playwright, how should you structure your code to avoid race conditions?",
      options: [
        "Click the triggering button, sleep for 2 seconds, and call page.dialog().",
        "Register page.once('dialog', handler) BEFORE executing the action that triggers the dialog.",
        "Call page.on('dialog') inside the test.afterEach() hook.",
        "Disable JavaScript dialogs in the browser configuration."
      ],
      correctOptionIndex: 1,
      explanation: "If you register the listener after triggering the action, the browser dialog may fire before the event listener is registered, causing the test to hang indefinitely."
    },
    {
      id: "kc-actions-select-option",
      topic: "Dropdown Selection",
      question: "Which of the following syntax options is valid when selecting an option in a native <select> element using locator.selectOption()?",
      options: [
        "await select.selectOption('option-value');",
        "await select.selectOption({ label: 'Visible Text' });",
        "await select.selectOption({ index: 2 });",
        "All of the above are valid selection strategies supported by Playwright."
      ],
      correctOptionIndex: 3,
      explanation: "Playwright's selectOption() is extremely flexible and accepts value strings, { label: '...' } objects, { index: N } objects, or arrays of options for multi-select elements."
    },
    {
      id: "kc-actions-keyboard-shortcuts",
      topic: "Keyboard Shortcuts",
      question: "How do you dispatch a multi-key keyboard shortcut such as Select All (Control+A or Meta+A) in Playwright?",
      options: [
        "await page.keyboard.press('Control+A');",
        "await page.keyboard.down('Control'); await page.keyboard.type('A');",
        "await page.keyboard.sendKeyCombination(['Control', 'A']);",
        "await page.keyboard.dispatchShortcut('SelectAll');"
      ],
      correctOptionIndex: 0,
      explanation: "Playwright supports combined modifier syntax directly via page.keyboard.press('Control+A') or locator.press('Control+A')."
    },
    {
      id: "kc-actions-force-danger",
      topic: "Force Option Hazards",
      question: "Why do senior SDETs discourage using { force: true } on pointer actions?",
      options: [
        "Because { force: true } crashes the browser process.",
        "Because { force: true } disables actionability checks (visibility, stability, and hit-testing), allowing tests to pass even when real users cannot click the element.",
        "Because { force: true } only works in Firefox.",
        "Because { force: true } slows down test execution by 30 seconds."
      ],
      correctOptionIndex: 1,
      explanation: "If a modal backdrop or sticky banner covers a button, a real user cannot click it. Passing { force: true } fires a synthetic event anyway, creating false confidence and masking genuine defects."
    },
    {
      id: "kc-actions-overlay-root-cause",
      topic: "Overlay Debugging",
      question: "A click action times out with 'Element <div class=\"modal-backdrop\"> intercepts pointer events'. What is the recommended senior remediation?",
      options: [
        "Immediately add { force: true } to the click call.",
        "Add page.waitForTimeout(5000) to wait for the animation.",
        "Properly dismiss or close the modal overlay through user-facing controls and assert it is removed before clicking the target.",
        "Delete the backdrop element from the DOM using page.evaluate()."
      ],
      correctOptionIndex: 2,
      explanation: "Tests should mirror user journeys: locate the modal close button, dismiss the overlay, assert that it is no longer visible, and then proceed with the intended interaction."
    },
    {
      id: "kc-actions-download-handling",
      topic: "File Download Verification",
      question: "How do you reliably verify a file download initiated by clicking an export button?",
      options: [
        "Inspect the browser downloads folder on the host OS using Node fs module.",
        "Await page.waitForEvent('download') alongside the click action, inspect download.suggestedFilename(), and verify the download stream.",
        "Check if document.title contains 'Downloading'.",
        "Downloads cannot be automated in Playwright."
      ],
      correctOptionIndex: 1,
      explanation: "Playwright provides first-class download interception via page.waitForEvent('download'), allowing tests to inspect filenames and read download streams in memory without host filesystem polling."
    }
  ],
  practiceTask: {
    labRoute: "/lab/forms",
    labName: "Forms & Interactions Laboratory",
    objective: "Automate form fields, dropdowns, checkboxes, and assertion of submitted values.",
    instructions: [
      "Navigate to /lab/forms.",
      "Fill in Full name, Email, Seats, and Start date using getByLabel.",
      "Select the 'api' track from the dropdown.",
      "Check the terms checkbox using locator.check().",
      "Set up response promise for /api/lab/forms/intake and submit the form.",
      "Assert that the accepted status message appears with the generated ID."
    ],
    acceptanceCriteria: [
      "All fields filled with native Playwright actions.",
      "Checkbox checked via idempotent check() method.",
      "Network response status 200 verified.",
      "Accepted status banner asserted."
    ],
    hint: "Remember to set up the response promise before clicking submit to avoid race conditions: const resPromise = page.waitForResponse(...);",
    solutionCode: `import { test, expect } from "@playwright/test";

test("submits intake form and validates acceptance", async ({ page }) => {
  await page.goto("/lab/forms");

  await page.getByLabel("Full name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@lab.test");
  await page.getByLabel("Seats").fill("3");
  await page.getByLabel("Start date").fill("2026-11-02");
  await page.getByLabel("Track").selectOption("api");
  await page.getByRole("checkbox", { name: "I agree to the lab terms" }).check();

  const resPromise = page.waitForResponse(
    (r) => r.url().includes("/api/lab/forms/intake") && r.ok()
  );
  await page.getByRole("button", { name: "Submit intake" }).click();
  const response = await resPromise;
  expect(response.status()).toBe(200);

  const body = await response.json();
  await expect(
    page.getByRole("status").filter({ hasText: "Accepted as " + body.id })
  ).toBeVisible();
});`,
    playwrightCommand: "pnpm exec playwright test e2e/practice-actions.spec.ts -g 'Exercise 2'"
  },
  interviewQuestions: [
    {
      question: "How does Playwright's actionability check engine work under the hood, and how does it prevent race conditions?",
      answer: "Before executing any user-facing action (click, fill, check, etc.), Playwright performs a strict actionability check cycle. It verifies: 1) Attached (node is in live DOM), 2) Visible (computed styles have non-zero geometry and not display:none or visibility:hidden), 3) Stable (element has stopped animating/moving across frames), 4) Enabled (not disabled or aria-disabled), 5) Editable (for inputs, not readonly), and 6) Receiving Pointer Events (hit-testing at element center confirms no overlapping backdrops/overlays intercept the click). If any check fails, Playwright transparently pauses and retries until the timeout. This eliminates arbitrary sleep hacks and flaky race conditions entirely.",
      architecturalContext: "Understands why Playwright tests are inherently more resilient than Selenium or Cypress without manual retry loops."
    },
    {
      question: "In an enterprise design system with complex custom components (such as headless comboboxes, custom selects, and virtualized lists), how should tests interact with them?",
      answer: "Custom UI components that do not use native HTML elements (<select>, <input type='checkbox'>) should still follow WAI-ARIA authoring practices. Tests should interact with them through user-facing actions: 1) click the combobox trigger button, 2) assert the listbox popover becomes visible, 3) type into the input or use arrow keys to navigate options, and 4) click the target getByRole('option', { name: '...' }). If the list is virtualized, scrolling or typing filters into the combobox input ensures the target node is rendered into the active DOM before clicking.",
      architecturalContext: "Architects robust interaction patterns for modern component libraries (Radix, HeadlessUI, AntD, MUI)."
    },
    {
      question: "Why is locator.dispatchEvent() considered an anti-pattern in end-to-end testing, and what subtle bugs can it mask?",
      answer: "dispatchEvent() directly invokes a synthetic Event in the browser's DOM dispatch pipeline. It completely bypasses actionability checks: it does not verify visibility, hit-testing, stability, or enabled status. If a button is hidden behind a modal backdrop, covered by a cookie banner, offscreen, or disabled in CSS/HTML, dispatchEvent('click') will still trigger the JavaScript onClick handler. This produces false-positive test runs on software that real users cannot interact with. It should only be used when testing synthetic custom event listeners that have no standard user input equivalent.",
      architecturalContext: "Maintains high-confidence test suites that faithfully represent user experience."
    },
    {
      question: "How do you design end-to-end interaction tests that are resilient across high-latency CI environments without inflating overall suite execution time?",
      answer: "1) Eliminate all fixed sleeps (page.waitForTimeout) and rely on action auto-waiting and web-first assertions. 2) Set realistic action and assertion timeouts (e.g. 5,000ms assertion, 10,000ms action) while letting global timeouts handle catastrophic failures. 3) Pre-register all asynchronous event listeners (dialogs, popups, downloads, API responses) before triggering actions to avoid race conditions. 4) Use in-memory Buffers for file uploads to eliminate filesystem I/O latency. 5) Use BrowserContext storage state reuse to bypass repeated login flows across tests.",
      architecturalContext: "Optimizes test suite runtime and determinism at enterprise scale in CI/CD pipelines."
    }
  ]
};
