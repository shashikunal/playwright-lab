import type { ScenarioSummary } from "@pil/shared";

export const scenarioSeed: ScenarioSummary[] = [
  {
    id: "locators",
    title: "Locator Gym",
    topic: "locators",
    difficulty: "beginner",
    route: "/lab/locators",
    status: "available",
    concepts: ["getByRole", "getByLabel", "strict mode"],
    learning: {
      guided: {
        conceptOverview: "Playwright recommends user-facing semantic locators (role, label, text) that mimic how assistive tech and humans interact with pages.",
        architectureDetails: [
          "getByRole ensures proper ARIA role and accessible name matching.",
          "Strict mode throws immediately if a selector resolves to multiple DOM elements.",
          "Chained filters (`locator.filter({ hasText })`) avoid fragile index-based selectors."
        ],
        recommendedLocators: [
          "page.getByRole('button', { name: 'Submit Application' })",
          "page.getByLabel('Work Email')",
          "page.getByRole('row').filter({ hasText: 'Active' })"
        ],
        suggestedAssertions: [
          "await expect(page.getByRole('heading', { level: 1 })).toBeVisible();",
          "await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();"
        ],
        codeSnippet: `test('locators practice', async ({ page }) => {
  await page.goto('/lab/locators');
  const row = page.getByRole('row').filter({ hasText: 'Target Row' });
  await row.getByRole('button', { name: 'Edit' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});`
      },
      challenge: {
        objective: "Target the secondary duplicate action button inside the nested card container without triggering a strict-mode violation and without using nth() or XPath.",
        constraints: [
          "Zero use of CSS class selectors or arbitrary test IDs",
          "Strict mode compliance: exact single-element match",
          "Must use semantic getByRole with locator chaining or filters"
        ],
        acceptanceChecklist: [
          "Locates element semantically via parent scope filter",
          "Survives dynamic DOM index reordering",
          "Passes Playwright strict mode check"
        ],
        targetRuntimeMs: 800
      },
      interview: {
        question: "Why does Playwright enforce strict mode by default on single-element locators, and how do you resolve duplicate accessible names without brittle nth(0) hacks?",
        tradeOffAnalysis: "Strict mode prevents accidental false-positives when UI adds matching elements. The optimal solution is locator composition (`locator.filter({ has: ... })` or scoping to a parent landmark) rather than positional nth() selectors which break on sort/filter.",
        trapToAvoid: "Never suppress strict mode using `.first()` unless the business requirement truly dictates taking any match; `.first()` masks DOM duplication defects."
      }
    }
  },
  {
    id: "forms",
    title: "Intake form",
    topic: "forms",
    difficulty: "intermediate",
    route: "/lab/forms",
    status: "available",
    concepts: ["validation", "keyboard", "API"],
    learning: {
      guided: {
        conceptOverview: "Modern forms combine native HTML5 inputs with ARIA 1.2 compliant comboboxes, multi-step wizards, and client/server validation.",
        architectureDetails: [
          "Associated <label htmlFor='id'> allows getByLabel filling.",
          "Custom Combobox requires arrow key traversal and aria-selected state tracking.",
          "Double-submit protection requires auto-waiting for button disability and loading state."
        ],
        recommendedLocators: [
          "page.getByLabel('Participant Email')",
          "page.getByRole('combobox', { name: 'Course Track' })",
          "page.getByRole('option', { name: 'Locators Mastery' })"
        ],
        suggestedAssertions: [
          "await expect(page.getByRole('alert')).toContainText('Invalid email');",
          "await expect(page.getByRole('button', { name: 'Submitting...' })).toBeDisabled();"
        ],
        codeSnippet: `test('submits intake wizard', async ({ page }) => {
  await page.goto('/lab/forms');
  await page.getByLabel('Full Name').fill('Alex QA');
  await page.getByRole('combobox').click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('Intake Accepted')).toBeVisible();
});`
      },
      challenge: {
        objective: "Complete the 3-step intake wizard using keyboard-only navigation (Tab, Arrow keys, Enter) and assert validation error states on invalid formats.",
        constraints: [
          "Must not use mouse clicks inside the form inputs",
          "Assert inline error messages appear when required fields are skipped",
          "Verify submission payload is received by the backend"
        ],
        acceptanceChecklist: [
          "Focus management verified with toHaveFocus()",
          "Combobox navigated with keyboard arrows",
          "Submission confirmation contains server-generated ID"
        ],
        targetRuntimeMs: 1200
      },
      interview: {
        question: "How do you automate testing of a custom ARIA Combobox that does not use native <select> elements, ensuring full accessibility and zero flakiness?",
        tradeOffAnalysis: "Custom comboboxes require testing: (1) aria-expanded toggle, (2) keyboard arrow traversal updating aria-activedescendant, (3) option selection updating input value. Testing with keyboard presses mirrors real user and screen reader behavior.",
        trapToAvoid: "Clicking the dropdown and immediately clicking an option without waiting for the listbox popup to become visible, leading to race conditions."
      }
    }
  },
  {
    id: "widgets",
    title: "Interactive Widgets",
    topic: "widgets",
    difficulty: "intermediate",
    route: "/lab/widgets",
    status: "available",
    concepts: ["dialogs", "tabs", "tables", "shadow DOM", "drag and drop"],
    learning: {
      guided: {
        conceptOverview: "Covers complex UI widgets: accessible modals, native browser dialogs (alert/confirm/prompt), HTML5 drag-and-drop, and open Shadow DOM.",
        architectureDetails: [
          "Native dialogs must register `page.on('dialog', ...)` BEFORE triggering the dialog event.",
          "Playwright automatically pierces open Shadow DOM roots without custom JS selectors.",
          "Drag-and-drop uses `locator.dragTo(target)` with auto-waiting for coordinates."
        ],
        recommendedLocators: [
          "page.getByRole('dialog', { name: 'Confirm Action' })",
          "page.getByRole('tab', { name: 'Syllabus' })",
          "page.locator('custom-card-widget').getByRole('button', { name: 'Inside Shadow' })"
        ],
        suggestedAssertions: [
          "await expect(page.getByRole('dialog')).toBeVisible();",
          "await expect(page.getByRole('tab', { selected: true })).toHaveText('Syllabus');"
        ],
        codeSnippet: `test('handles native confirm dialog', async ({ page }) => {
  page.on('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Are you sure');
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Delete Item' }).click();
});`
      },
      challenge: {
        objective: "Perform a drag-and-drop task reordering operation in the Kanban widget, then verify the persistent position shift in the DOM.",
        constraints: [
          "Verify source item moves to target container",
          "Verify order index updates in the list",
          "No arbitrary sleeps during drag animation"
        ],
        acceptanceChecklist: [
          "Source element dragged cleanly via dragTo",
          "Drop target receives drop event and updates state",
          "DOM reflects new ordering"
        ],
        targetRuntimeMs: 1000
      },
      interview: {
        question: "What is the difference between HTML5 Drag and Drop and mouse-event dragging (mousedown -> mousemove -> mouseup) in Playwright?",
        tradeOffAnalysis: "HTML5 drag-and-drop triggers DragEvent APIs (dragstart, dragover, drop) handled by `locator.dragTo()`. Canvas or custom slider components rely on MouseEvent coordinates, requiring `page.mouse.move()` or touch actions.",
        trapToAvoid: "Registering `page.on('dialog')` after the click that opened the dialog; Playwright will auto-dismiss unhandled dialogs, failing your assertions."
      }
    }
  },
  {
    id: "network",
    title: "Scenario controls",
    topic: "network",
    difficulty: "advanced",
    route: "/lab/network",
    status: "available",
    concepts: ["latency", "status codes", "page.route", "abort", "optimistic"],
    learning: {
      guided: {
        conceptOverview: "Simulate edge cases: high latency, server errors (429, 500), empty states, and mock network requests using page.route().",
        architectureDetails: [
          "page.route() intercepts HTTP requests matching glob/regex at network level.",
          "route.fulfill({ status, json }) provides deterministic test responses.",
          "Optimistic UI verification requires asserting immediate DOM change then rollback on HTTP 500."
        ],
        recommendedLocators: [
          "page.getByTestId('network-item-card')",
          "page.getByRole('alert').filter({ hasText: 'Rate limited' })"
        ],
        suggestedAssertions: [
          "await expect(page.getByText('Server error 500')).toBeVisible();",
          "await expect(page.getByTestId('optimistic-item')).not.toBeVisible(); // Rolled back"
        ],
        codeSnippet: `test('mocks backend failure', async ({ page }) => {
  await page.route('**/api/lab/network/items', (route) => {
    route.fulfill({ status: 500, json: { error: 'Injected DB Failure' } });
  });
  await page.goto('/lab/network');
  await expect(page.getByRole('alert')).toContainText('Injected DB Failure');
});`
      },
      challenge: {
        objective: "Simulate a 2500ms network delay and assert that the loading skeleton appears and seamlessly transitions to populated cards without triggering timeout errors.",
        constraints: [
          "Must use Playwright web-first assertions with condition-based timeout",
          "Zero arbitrary page.waitForTimeout() calls",
          "Assert loading indicator is visible then detached"
        ],
        acceptanceChecklist: [
          "Loading skeleton verified via toBeVisible()",
          "Data successfully renders after delay completes",
          "API response intercepted or verified via waitForResponse"
        ],
        targetRuntimeMs: 3000
      },
      interview: {
        question: "When should you mock an API via page.route() versus testing against real Express endpoints in an end-to-end suite?",
        tradeOffAnalysis: "Real endpoints validate true integration contracts, DB transactions, and auth cookies. page.route() is ideal for edge cases that are difficult or destructive to trigger live (e.g. 503 gateway outages, 429 rate limits, slow 3G latencies).",
        trapToAvoid: "Over-mocking in end-to-end suites: if 90% of requests are mocked with route.fulfill(), you are testing frontend assumptions, not true system integration."
      }
    }
  },
  {
    id: "courses",
    title: "Course catalogue",
    topic: "business",
    difficulty: "intermediate",
    route: "/app/courses",
    status: "available",
    concepts: ["CRUD", "pagination", "search", "RBAC"],
    learning: {
      guided: {
        conceptOverview: "Enterprise course management demonstrating Role-Based Access Control: Learner (read-only), Trainer (create/edit), Admin (full CRUD).",
        architectureDetails: [
          "Storage state pre-injection bypasses redundant login UI navigation.",
          "Search inputs should verify debounce behavior via response monitoring.",
          "Role permission suppression must assert action buttons are not in DOM."
        ],
        recommendedLocators: [
          "page.getByLabel('Search courses')",
          "page.getByRole('button', { name: 'Create Course' })",
          "page.getByTestId('course-card')"
        ],
        suggestedAssertions: [
          "await expect(page.getByRole('button', { name: 'Create Course' })).not.toBeVisible();",
          "await expect(page.getByText('Role: trainer')).toBeVisible();"
        ],
        codeSnippet: `test('learner cannot delete courses', async ({ learnerPage }) => {
  await learnerPage.goto('/app/courses');
  await expect(learnerPage.getByRole('button', { name: /Delete/i })).not.toBeVisible();
});`
      },
      challenge: {
        objective: "Create a new course as Trainer, then verify that an Admin can see and delete that course, while a Learner can only view and enroll in it.",
        constraints: [
          "Use storage state session reuse for role switching",
          "Ensure unique course code to avoid parallel test collisions",
          "Validate modal dialog confirmation flow"
        ],
        acceptanceChecklist: [
          "Course created via modal and verified in directory",
          "Learner view confirms read-only restriction",
          "Admin deletes course with confirmation dialog"
        ],
        targetRuntimeMs: 2500
      },
      interview: {
        question: "How do you architecture parallel tests that create and delete shared data entities without causing crosstalk failures across workers?",
        tradeOffAnalysis: "1) Append workerIndex or UUIDs to entity codes (`w0_course_123`). 2) Use worker-scoped namespaces. 3) Never assert exact list length (`toHaveCount(5)`); instead assert presence/absence of worker-specific entities.",
        trapToAvoid: "Hardcoding static IDs like `TEST_COURSE_1` across tests running in parallel workers, resulting in intermittent 409 Conflict errors."
      }
    }
  },
  {
    id: "enrollment",
    title: "Enrollment",
    topic: "business",
    difficulty: "advanced",
    route: "/app/enrollments",
    status: "available",
    concepts: ["roles", "workflow", "state transitions"],
    learning: {
      guided: {
        conceptOverview: "End-to-end business transaction: seat calculation, participant validation, review summary, and admin status approval.",
        architectureDetails: [
          "Multi-step wizard preserves intermediate state across Step 1 -> Step 2 -> Step 3.",
          "State transitions (Pending -> Approved) trigger audit log events.",
          "Best encapsulated inside an EnrollmentWizardPage Page Object Model."
        ],
        recommendedLocators: [
          "page.getByLabel('Number of Seats (1-10)')",
          "page.getByRole('button', { name: 'Next Step' })",
          "page.getByTestId('enrollment-row-enr_101')"
        ],
        suggestedAssertions: [
          "await expect(page.locator('#enrollment-confirmation')).toHaveText(/^enr_\\d+$/);",
          "await expect(pendingRow.getByText('Approved')).toBeVisible();"
        ],
        codeSnippet: `test('enrollment workflow via POM', async ({ page }) => {
  const wizard = new EnrollmentWizardPage(page);
  await wizard.goto();
  await wizard.completeStep1({ seats: 3 });
  await wizard.completeStep2({ name: 'Jordan QA', email: 'jordan@pil.local' });
  const confId = await wizard.submitOrder();
  expect(confId).toMatch(/^enr_/);
});`
      },
      challenge: {
        objective: "Automate a 5-seat corporate enrollment order, extract the confirmation ID, and verify the record is in Pending status in the management table.",
        constraints: [
          "Encapsulate workflow in a Page Object Model",
          "Extract dynamic confirmation ID with regex match",
          "Validate seat counter math ($ total calculation)"
        ],
        acceptanceChecklist: [
          "Total price dynamically asserts base price * 5 seats",
          "Order successfully recorded in backend",
          "Confirmation screen displays unique reference"
        ],
        targetRuntimeMs: 2000
      },
      interview: {
        question: "What are the trade-offs of the Page Object Model in modern Playwright suites, and when should you favor lightweight functional fixtures instead?",
        tradeOffAnalysis: "POMs provide maintainability for complex, multi-page business journeys by isolating UI locator changes. However, over-engineered POMs (getters for every button) create boilerplate; fixture-based helpers with direct user-facing locators are often cleaner for atomic component tests.",
        trapToAvoid: "Returning locators from POM methods (`page.getSubmitButton()`) rather than action methods (`page.submitForm()`), which defeats abstraction."
      }
    }
  },
  {
    id: "flaky",
    title: "Flaky Lab & File Operations",
    topic: "reliability",
    difficulty: "advanced",
    route: "/lab/flaky",
    status: "available",
    concepts: ["file upload", "downloads", "actionability", "races"],
    learning: {
      guided: {
        conceptOverview: "Tackle real-world test flakiness: element actionability delays, detached DOM replacements, overlay interception, and file up/download.",
        architectureDetails: [
          "Actionability auto-waiting verifies element is attached, visible, stable, enabled, and not covered.",
          "page.waitForEvent('download') captures streaming CSV exports safely.",
          "setInputFiles handles native file selection without OS file picker dialogs."
        ],
        recommendedLocators: [
          "page.getByLabel('Upload Report File')",
          "page.getByRole('button', { name: 'Export CSV Report' })",
          "page.getByTestId('stale-action-btn')"
        ],
        suggestedAssertions: [
          "await expect(page.getByText('File uploaded: report.csv')).toBeVisible();",
          "const download = await downloadPromise; expect(download.suggestedFilename()).toBe('report.csv');"
        ],
        codeSnippet: `test('handles file download', async ({ page }) => {
  await page.goto('/lab/flaky');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download CSV' }).click(),
  ]);
  expect(download.suggestedFilename()).toContain('.csv');
});`
      },
      challenge: {
        objective: "Handle an action button that is covered by a transient floating banner, dismissing the obstruction cleanly before asserting the action succeeds.",
        constraints: [
          "Do not use force: true on the click action",
          "Detect and dismiss the intercepting overlay element",
          "Assert actionability passes naturally"
        ],
        acceptanceChecklist: [
          "Banner dismissal detected and executed",
          "Target action button clicked without actionability timeout",
          "Success notification displayed"
        ],
        targetRuntimeMs: 1500
      },
      interview: {
        question: "Why is `click({ force: true })` considered an anti-pattern in end-to-end testing, and how does Playwright's actionability engine protect against false positives?",
        tradeOffAnalysis: "`force: true` bypasses pointer-events and hit-testing checks, triggering click handlers on covered or disabled elements that a real user could never click. This masks critical UI bugs (e.g. modal overlay blocking interaction).",
        trapToAvoid: "Using arbitrary sleeps (`await page.waitForTimeout(2000)`) to wait for animations to finish instead of letting Playwright's auto-wait verify stability."
      }
    }
  },
  {
    id: "visual",
    title: "Visual Regression Lab",
    topic: "reliability",
    difficulty: "advanced",
    route: "/lab/visual",
    status: "available",
    concepts: ["snapshots", "masks", "animations"],
    learning: {
      guided: {
        conceptOverview: "Pixel-perfect visual regression testing with toHaveScreenshot, locator masking, animation freezing, and layout shift detection.",
        architectureDetails: [
          "Dynamic timestamps and randomized IDs must be masked using mask: [locators].",
          "animations: 'disabled' freezes CSS keyframes and transitions.",
          "maxDiffPixelRatio allows tolerable variance for OS-level font antialiasing."
        ],
        recommendedLocators: [
          "page.getByTestId('stable-card')",
          "page.getByTestId('volatile-timestamp')"
        ],
        suggestedAssertions: [
          "await expect(card).toHaveScreenshot('card.png', { animations: 'disabled' });",
          "await expect(card).toHaveScreenshot('card-masked.png', { mask: [timestamp] });"
        ],
        codeSnippet: `test('stable visual snapshot', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/lab/visual');
  const card = page.getByTestId('stable-card');
  await expect(card).toHaveScreenshot('stable-card.png', {
    maxDiffPixelRatio: 0.05,
    animations: 'disabled',
  });
});`
      },
      challenge: {
        objective: "Capture a component screenshot containing dynamic transaction numbers and pulsing badge animations with 0% diff flakiness across runs.",
        constraints: [
          "Set deterministic viewport dimensions",
          "Mask all dynamic text nodes",
          "Disable CSS animations via snapshot options"
        ],
        acceptanceChecklist: [
          "Baseline screenshot generated in snapshots folder",
          "Subsequent runs match baseline with 0 pixel mismatch",
          "Dynamic tokens masked cleanly with solid overlays"
        ],
        targetRuntimeMs: 1200
      },
      interview: {
        question: "What are the root causes of visual test flakiness in CI pipelines, and how do you achieve deterministic cross-platform screenshot comparisons?",
        tradeOffAnalysis: "Causes: 1) subpixel font antialiasing between Linux CI and Windows local, 2) asynchronous font loading (`document.fonts.ready`), 3) dynamic dates/data, 4) blinking cursors / CSS animations. Solutions: Docker/OS-pinned runners, locator masking, and `animations: 'disabled'`.",
        trapToAvoid: "Capturing full-page screenshots for tiny component changes: full-page snapshots are fragile to minor footer shifts; capture scoped component locators instead."
      }
    }
  },
  {
    id: "a11y",
    title: "Accessibility Audit Lab",
    topic: "reliability",
    difficulty: "advanced",
    route: "/lab/a11y",
    status: "available",
    concepts: ["axe-core", "contrast", "screen-readers"],
    learning: {
      guided: {
        conceptOverview: "Automated WCAG 2.1 AA audits using @axe-core/playwright, isolated defect training, and instant remediation verification.",
        architectureDetails: [
          "new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze() runs automated scans.",
          ".include() and .exclude() allow targeting specific containers or excluding known defect sandboxes.",
          "Tests verify that remediated state resolves all axe violations."
        ],
        recommendedLocators: [
          "page.getByTestId('accessible-panel')",
          "page.getByTestId('defect-contrast-panel')"
        ],
        suggestedAssertions: [
          "const results = await new AxeBuilder({ page }).analyze(); expect(results.violations).toEqual([]);",
          "expect(results.violations.some(v => v.id === 'color-contrast')).toBeTruthy();"
        ],
        codeSnippet: `test('audits page for WCAG compliance', async ({ page }) => {
  await page.goto('/lab/a11y');
  const results = await new AxeBuilder({ page })
    .include('[data-testid="accessible-panel"]')
    .analyze();
  expect(results.violations).toEqual([]);
});`
      },
      challenge: {
        objective: "Scan the accessibility lab, identify the intentional button-name violation, trigger the remediation toggle, and assert 0 remaining violations.",
        constraints: [
          "Use AxeBuilder with targeted rule scanning",
          "Assert violation count before and after remediation",
          "Verify accessible name attribute exists on the button element"
        ],
        acceptanceChecklist: [
          "Initial scan detects missing accessible name",
          "Remediation toggle clicked",
          "Secondary scan reports 0 violations"
        ],
        targetRuntimeMs: 1200
      },
      interview: {
        question: "Can automated accessibility scanning with axe-core catch 100% of WCAG defects, and what manual/automated keyboard checks must supplement it?",
        tradeOffAnalysis: "Axe-core catches roughly 30–50% of WCAG issues (contrast, missing labels, duplicate IDs, aria attributes). It cannot verify logical reading order, keyboard focus trapping, or whether alt text is contextually meaningful.",
        trapToAvoid: "Assuming a zero-violation axe report means your app is fully accessible without testing keyboard tab traversal and screen reader announcements."
      }
    }
  },
  {
    id: "browser",
    title: "Browser & Window Lab",
    topic: "browser",
    difficulty: "advanced",
    route: "/lab/browser",
    status: "available",
    concepts: ["popups", "iframes", "cookies", "geolocation", "responsive"],
    learning: {
      guided: {
        conceptOverview: "Advanced browser capabilities: multi-tab popups, same-origin nested iframes, storage & cookies, geolocation emulation, and responsive breakpoints.",
        architectureDetails: [
          "page.waitForEvent('popup') captures window.open tabs.",
          "page.frameLocator('iframe').frameLocator('iframe') chains nested iframes effortlessly.",
          "context.grantPermissions() and context.setGeolocation() emulate real-world sensor data."
        ],
        recommendedLocators: [
          "page.frameLocator('#outer-iframe').getByRole('button', { name: 'Inside Frame' })",
          "page.getByRole('button', { name: 'Launch New Tab' })"
        ],
        suggestedAssertions: [
          "const popup = await popupPromise; await expect(popup).toHaveTitle('Popup Lab');",
          "await expect(page.getByText('Coordinates: 37.7749, -122.4194')).toBeVisible();"
        ],
        codeSnippet: `test('handles new tab popup', async ({ page }) => {
  await page.goto('/lab/browser');
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('button', { name: 'Open New Tab' }).click(),
  ]);
  await expect(popup.getByRole('heading')).toHaveText('Popup Window Content');
  await popup.close();
});`
      },
      challenge: {
        objective: "Interact with an input inside a nested iframe, read its updated state, and verify the outer parent document receives the change event.",
        constraints: [
          "Use chained frameLocator syntax",
          "Zero index-based frame selection",
          "Assert parent state updates dynamically"
        ],
        acceptanceChecklist: [
          "Outer frame located by title/id",
          "Nested frame located and written to via fill()",
          "Parent document reflects value change"
        ],
        targetRuntimeMs: 1500
      },
      interview: {
        question: "How does Playwright's `frameLocator` API differ from traditional Selenium frame switching, and why is it impervious to iframe reload races?",
        tradeOffAnalysis: "Selenium required imperative `driver.switchTo().frame()` state changes that break if the iframe reloads or redirects. Playwright's `frameLocator` is lazy and declarative: it auto-waits for the frame to attach and ready on every action, eliminating frame-switching races.",
        trapToAvoid: "Holding references to `page.frames()` array indices; if an iframe navigates or reloads, that handle becomes stale."
      }
    }
  },
  {
    id: "perf",
    title: "Performance & Vitals Lab",
    topic: "reliability",
    difficulty: "advanced",
    route: "/lab/perf",
    status: "available",
    concepts: ["web-vitals", "cdp-session", "trace", "metrics"],
    learning: {
      guided: {
        conceptOverview: "Measure Core Web Vitals (LCP, CLS, INP/FID, TTFB) using W3C PerformanceObserver and Chrome DevTools Protocol (CDP) sessions.",
        architectureDetails: [
          "Navigation timing via performance.getEntriesByType('navigation') gives sub-millisecond TTFB and DOM load metrics.",
          "PerformanceObserver dynamically monitors layout-shift (CLS) and largest-contentful-paint (LCP) events.",
          "page.context().newCDPSession(page) communicates directly with Chromium V8 via CDP commands (Performance.getMetrics, Emulation.setCPUThrottlingRate)."
        ],
        recommendedLocators: [
          "page.getByTestId('metric-lcp')",
          "page.getByTestId('metric-cls')",
          "page.getByRole('button', { name: 'Inject Layout Shift' })"
        ],
        suggestedAssertions: [
          "expect(vitals.lcp).toBeLessThan(2500);",
          "expect(vitals.cls).toBeLessThan(0.1);"
        ],
        codeSnippet: `test('audits Web Vitals and CDP metrics', async ({ page }) => {
  const client = await page.context().newCDPSession(page);
  await client.send('Performance.enable');
  await page.goto('/lab/perf');
  const { metrics } = await client.send('Performance.getMetrics');
  const heap = metrics.find((m) => m.name === 'JSHeapUsedSize');
  expect(heap?.value).toBeGreaterThan(0);
});`
      },
      challenge: {
        objective: "Measure baseline CLS, trigger the dynamic layout shift experiment, assert that CLS score elevates, then capture CDP heap memory usage.",
        constraints: [
          "Assert LCP renders below 2500ms threshold",
          "Detect CLS change via W3C observer",
          "Verify CDP session metrics without test flakiness"
        ],
        acceptanceChecklist: [
          "LCP healthy metric verified",
          "CLS layout shift detected",
          "CDP heap metrics captured"
        ],
        targetRuntimeMs: 2000
      },
      interview: {
        question: "What are the limitations of testing Core Web Vitals in a headless synthetic CI environment compared to Real User Monitoring (RUM)?",
        tradeOffAnalysis: "Synthetic tests run on unthrottled, pristine cloud instances with mock users, giving consistent regression baselines but masking real-world mobile device latencies, memory pressure, and 3G/4G network jitter. Modern suites pair synthetic thresholds with RUM field data.",
        trapToAvoid: "Relying on full-page visual tests or arbitrary sleeps to evaluate performance instead of reading deterministic W3C PerformanceObserver events."
      }
    }
  },
  {
    id: "practice-login",
    title: "Practice Login & Session Management",
    topic: "business",
    difficulty: "beginner",
    route: "/practice/login",
    status: "available",
    concepts: ["forms", "password-toggle", "validation", "session-tokens", "protected-routes", "forgot-password"],
    learning: {
      guided: {
        conceptOverview: "Master core login mechanics: stable test IDs, accessible labels, input validation, password toggle, server session verification, and simulated password reset flows.",
        architectureDetails: [
          "page.getByRole('button', { name: ... }) and page.getByLabel(...) provide resilient semantic targeting.",
          "Show/hide password toggles dynamically swap input type between 'password' and 'text'.",
          "Protected dashboards inspect server-side session validity and block direct unauthenticated navigation."
        ],
        recommendedLocators: [
          "page.getByLabel('Practice Username')",
          "page.getByLabel('Practice Password')",
          "page.getByTestId('password-toggle-btn')",
          "page.getByTestId('submit-btn')"
        ],
        suggestedAssertions: [
          "await expect(page.getByTestId('password-input')).toHaveAttribute('type', 'text');",
          "await expect(page.getByTestId('welcome-message')).toContainText('student');",
          "await expect(page).toHaveURL(/\\/practice\\/dashboard/);"
        ],
        codeSnippet: `test('practice login and password toggle', async ({ page }) => {
  await page.goto('/practice/login');
  await page.getByLabel('Practice Username').fill('student');
  await page.getByLabel('Practice Password').fill('Password123!');
  await page.getByTestId('password-toggle-btn').click();
  await expect(page.getByTestId('password-input')).toHaveAttribute('type', 'text');
  await page.getByTestId('submit-btn').click();
  await expect(page).toHaveURL('/practice/dashboard');
  await expect(page.getByTestId('welcome-message')).toBeVisible();
});`
      },
      challenge: {
        objective: "Submit empty credentials, verify accessible error alerts, toggle password visibility, authenticate as 'student', verify protected dashboard, logout, and verify unauthenticated direct navigation is blocked.",
        constraints: [
          "Do not use hardcoded page.waitForTimeout",
          "Assert server session token is cleared upon logout",
          "Verify unauthenticated direct access redirects to /practice/login"
        ],
        acceptanceChecklist: [
          "Empty field validation error asserted",
          "Password visibility toggled and verified",
          "Successful login redirects to dashboard",
          "Logout invalidates session and redirects"
        ],
        targetRuntimeMs: 2500
      },
      interview: {
        question: "How do you test authentication flows without making the entire end-to-end test suite slow from repeated UI logins on every test?",
        tradeOffAnalysis: "UI login tests are essential to validate the login form mechanics, validation errors, and password toggles. However, the rest of the test suite should bypass UI login by pre-populating browser storageState (cookies/tokens) or using an API login fixture, keeping execution speed fast while preserving authentic session boundaries.",
        trapToAvoid: "Writing tests where test B depends on test A leaving the browser logged in, which causes parallel test failures and cascading flakes."
      }
    }
  },
  {
    id: "wasm",
    title: "WebAssembly Sandbox",
    topic: "reliability",
    difficulty: "advanced",
    route: "/lab/wasm",
    status: "available",
    concepts: ["wasm", "shared-memory", "bytecode", "traps", "benchmarking"],
    learning: {
      guided: {
        conceptOverview: "Automate testing of WebAssembly (Wasm) modules: bytecode compilation, calling exported functions, buffer memory inspection, benchmarking against native JS, and trapping runtime errors.",
        architectureDetails: [
          "WebAssembly.instantiate() compiles binary bytecode into callable exports.",
          "Wasm memory is exposed as an ArrayBuffer, inspectable via Uint8Array views.",
          "Wasm traps (e.g. unreachable instruction) throw WebAssembly.RuntimeError in JavaScript.",
          "Playwright can evaluate Wasm instance states directly or assert UI outputs."
        ],
        recommendedLocators: [
          "page.getByTestId('wasm-run-btn')",
          "page.getByTestId('wasm-result')",
          "page.getByTestId('wasm-trap-btn')",
          "page.getByTestId('wasm-error-alert')"
        ],
        suggestedAssertions: [
          "await expect(page.getByTestId('wasm-result')).toHaveText('6,765');",
          "await expect(page.getByTestId('wasm-error-alert')).toContainText('unreachable');"
        ],
        codeSnippet: `test('verifies wasm computation and trap handling', async ({ page }) => {
  await page.goto('/lab/wasm');
  await page.getByTestId('wasm-n-input').fill('20');
  await page.getByTestId('wasm-run-btn').click();
  await expect(page.getByTestId('wasm-result')).toHaveText('6,765');

  await page.getByTestId('wasm-trap-btn').click();
  await expect(page.getByRole('alert')).toContainText('unreachable');
});`
      },
      challenge: {
        objective: "Execute a recursive Fibonacci computation in WebAssembly with n=25, assert execution speed is recorded in microseconds/milliseconds, verify memory buffer growth by +1 page, and handle deliberate runtime trap.",
        constraints: [
          "Assert Wasm computation completes with exact mathematical value 75,025",
          "Verify memory buffer expands from 64KB (1 page) to 128KB (2 pages)",
          "Catch WebAssembly.RuntimeError without crashing the browser runner"
        ],
        acceptanceChecklist: [
          "Wasm calculation asserted via toHaveText",
          "Comparative benchmark confirms JS and Wasm produce identical values",
          "Memory page growth verified",
          "Runtime error captured and rendered in accessible alert"
        ],
        targetRuntimeMs: 1500
      },
      interview: {
        question: "How do you architect automated end-to-end tests for WebAssembly-heavy web applications (e.g., in-browser video editors, crypto wallets, 3D graphics) without creating flaky tests?",
        tradeOffAnalysis: "1) UI/DOM assertions for state changes driven by Wasm events. 2) In-browser evaluation (page.evaluate()) to inspect Wasm instance memory buffers directly. 3) Avoid asserting brittle microsecond timings which vary wildly between local laptops and CI runners; assert mathematical correctness, status codes, and non-zero performance metrics instead.",
        trapToAvoid: "Writing hardcoded timing assertions like expect(runtime).toBeLessThan(10) which intermittently fail in headless CI runners under load."
      }
    }
  },
];
