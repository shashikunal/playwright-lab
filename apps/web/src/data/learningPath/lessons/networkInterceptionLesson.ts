import type { Lesson } from "../types";

export const networkInterceptionLesson: Lesson = {
  id: "playwright-network-interception",
  moduleSlug: "network-and-api",
  moduleTitle: "REST API Testing & Network Automation",
  title: "Playwright Network Interception and API Mocking — Beginner to Advanced",
  difficulty: "Intermediate",
  durationMinutes: 45,
  prerequisites: [
    "playwright-introduction",
    "configuration-and-browsers",
    "playwright-locators",
    "playwright-assertions",
    "playwright-actions",
    "playwright-forms",
    "playwright-browser-contexts",
    "playwright-api-testing"
  ],
  summary: "Master protocol-level HTTP interception and deterministic mock fulfillment using Playwright's page.route() and browserContext.route(). Learn route.fulfill(), route.continue(), route.abort(), route.fetch(), response augmentation, race condition mitigation, synthetic latency, and senior network debugging techniques.",
  sections: [
    {
      id: "network-fundamentals",
      title: "Part A — Network Fundamentals & The Modern Request Lifecycle",
      content: `Modern single-page applications (SPAs) are distributed systems operating directly inside the browser. Elements rendered on the screen depend on an unbroken stream of background HTTP/HTTPS requests exchanging JSON over REST or GraphQL endpoints.

1. Browser Request and Response Lifecycle:
When a client application initiates an asynchronous data operation (via window.fetch() or XMLHttpRequest), the request transitions through a strict protocol lifecycle:
- DNS Resolution & Socket Negotiation: The browser resolves the remote host IP address and establishes a TCP/TLS connection.
- Request Dispatch: The browser serializes HTTP headers (Accept, Authorization, Content-Type) and payload data, sending the packet across the wire.
- Time to First Byte (TTFB): The server processes the request, queries persistent stores, and transmits the initial byte of the HTTP response header.
- Body Streaming & JSON Parsing: The browser downloads the response body buffer and parses the JSON payload into JavaScript heap memory.
- State Transition & DOM Re-render: The UI framework updates internal reactive state, triggering layout computation and DOM node mutation.

2. Network Requests vs. Document Navigation:
A critical distinction in web automation is the difference between Document Navigation and Asynchronous Network Requests:
- Document Navigation: Triggered by page.goto(), clicking <a> links, or 302 redirects. It discards the current JavaScript execution context, unloads DOM trees, and rebuilds the entire window environment.
- Asynchronous Network Requests: Dispatched by client-side JavaScript (fetch/XHR) without page reloads. The page remains interactive while background promises resolve or reject.

3. The Strategic Balance: Network Mocking vs. Live Backend Automation:
Testing every user journey exclusively against live backend databases creates bloated execution runtimes and intermittent flakiness caused by shared environments. Conversely, mocking every API request risks false confidence if mock contracts drift from production backends.
- When to Mock APIs:
  - Simulating catastrophic server outages (500 Internal Server Error, 503 Service Unavailable, 504 Gateway Timeout).
  - Reproducing edge cases that are difficult or destructive to trigger live (e.g. billing card declines, rate limits, empty account states).
  - Isolating front-end UI regressions from backend service downtime.
  - Testing client-side resilience against network aborts and slow 3G cellular connections.
- When to Use Real Backends:
  - Core authentication workflows and database persistence integrity.
  - Cross-service transactions and end-to-end smoke verifications.
  - Validating true API contract fidelity without mock approximation.`
    },
    {
      id: "playwright-routing-apis",
      title: "Part B — Playwright Routing Primitives & API Suite",
      content: `Playwright intercepts network traffic directly at the browser protocol level (Chrome DevTools Protocol, Firefox Remote Agent, WebKit Inspector Protocol). Requests are intercepted before they leave the browser process, allowing instant, zero-latency modification without configuring external proxy servers or modifying client bundle code.

1. The Routing Registration Primitives:
- 'page.route(url, handler)': Intercepts requests originating exclusively within that specific Page tab or iframe.
- 'browserContext.route(url, handler)': Intercepts requests across ALL pages, tabs, popups, and workers created within that BrowserContext.
- 'page.unroute(url, [handler])': Removes route handlers from a page, allowing subsequent network traffic to reach the live backend unimpeded.
- 'browserContext.unroute(url, [handler])': Removes route handlers registered at the context level.

2. The Route Controller Handle:
When a request matches a registered route pattern, Playwright suspends the request and passes a 'Route' object to your callback:
- 'await route.fulfill(options)': Fulfills the request immediately with mock data, status codes, and headers. The real backend never receives the request.
- 'await route.continue(options)': Forwards the request to the upstream server, optionally overriding headers, HTTP method, or payload body.
- 'await route.abort(errorCode)': Immediately terminates the connection with a network failure code ('failed', 'timedout', 'connectionreset', 'blockedbyclient').
- 'await route.fetch(options)': Performs an out-of-band HTTP request to the live server from inside the handler, allowing tests to inspect or mutate real backend responses before fulfilling them to the browser.
- 'await route.fallback(options)': Cascades the request to the next matching route handler in Playwright's handler chain.

3. URL Pattern Matching Rules:
Playwright supports three distinct matching strategies for the first argument of route():
- Glob Patterns (Recommended): Strings containing wildcards (e.g. '**/api/lab/network/items*'). Fast, readable, and resilient against protocol and port differences.
- Regular Expressions: RegExp instances (e.g. /\\/api\\/lab\\/network\\/items\\/\\d+$/) for complex boundary matching.
- Predicate Functions: Async callbacks '(url: URL) => boolean' for dynamic matching based on query parameters, origin, or path segments.`
    },
    {
      id: "mocking-responses",
      title: "Part C — Deterministic Mock Responses & Status Code Simulation",
      content: `The primary use case of 'route.fulfill()' is returning controlled, deterministic responses to verify UI state transitions without depending on backend state.

1. Mocking Structured JSON Payloads:
Modern web applications expect JSON payloads accompanied by correct MIME headers. Playwright provides convenience properties to serialize JSON automatically:
\`\`\`typescript
await page.route("**/api/lab/network/items*", async (route) => {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    headers: { "x-mock-source": "playwright" },
    body: JSON.stringify({
      items: [
        { id: "MOCK-1", title: "Synthetic Security Item", category: "security", latencyMs: 5 }
      ],
      total: 1
    })
  });
});
\`\`\`

2. Simulating Zero-State & Empty Collections:
Testing how interfaces handle empty data states is critical for UX verification. Instead of wiping a shared database, mock an empty response in 1 millisecond:
\`\`\`typescript
await page.route("**/api/lab/network/items*", async (route) => {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ items: [], total: 0 })
  });
});
await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();
await expect(page.getByText("No items matching query (Empty Response).")).toBeVisible();
\`\`\`

3. Simulating HTTP Error Permutations (404, 409, 422, 500):
Verify that client error boundaries, banners, and toast notifications handle server errors gracefully:
- 400 Bad Request: Malformed request parameters.
- 401 Unauthorized: Session token expired.
- 403 Forbidden: Insufficient role permissions.
- 404 Not Found: Resource deleted or missing.
- 409 Conflict: Concurrent modification conflict.
- 422 Unprocessable Entity: Business validation errors.
- 500 Internal Server Error: Database crash or unexpected server exception.`
    },
    {
      id: "request-inspection-modification",
      title: "Part D — Request Inspection, Header Injection & Payload Modification",
      content: `Network interception is not limited to static mocking. Senior engineers inspect outbound traffic to verify telemetry compliance and modify requests in-flight.

1. Inspecting Outbound Request Properties:
The 'route.request()' method provides access to the pending 'Request' object:
- 'req.method()': Numerical or string verb ('GET', 'POST', 'PUT', 'DELETE').
- 'req.url()': Fully-qualified URL including query string parameters.
- 'req.headers()': Dictionary of lowercase HTTP request headers.
- 'req.postData()': Raw string payload sent in the request body.
- 'req.postDataJSON()': Deserialized JSON payload object.

2. Modifying Request Headers and Payloads In-Flight:
Using 'route.continue()', you can modify the outbound request before it reaches the real backend:
\`\`\`typescript
await page.route("**/api/lab/network/items*", async (route) => {
  const headers = {
    ...route.request().headers(),
    "x-tenant-override": "enterprise-staging-corp",
    "x-worker-namespace": "worker_2"
  };
  await route.continue({ headers });
});
\`\`\`

3. Augmenting Real Backend Responses with 'route.fetch()':
A major architectural breakthrough in Playwright is 'route.fetch()'. It executes the real request against the upstream backend, allowing your test to capture genuine live data, modify a single field, and return it to the client:
\`\`\`typescript
await page.route("**/api/lab/network/items*", async (route) => {
  // 1. Fetch genuine live data from backend
  const response = await route.fetch();
  const json = await response.json();

  // 2. Inject an extra test item into live data
  json.items.unshift({
    id: "AUG-01",
    title: "Injected Canary Item",
    category: "telemetry",
    latencyMs: 1
  });

  // 3. Fulfill to browser with real headers and status
  await route.fulfill({ response, json });
});
\`\`\``
    },
    {
      id: "delays-races-failures",
      title: "Part E — Synthetic Delays, Autocomplete Race Conditions & Connection Aborts",
      content: `Real-world network environments are unstable. Modern web applications must handle high latency, dropped connections, and asynchronous race conditions without freezing or displaying corrupted state.

1. Synthetic Latency & Loading Indicator Verification:
Instead of relying on slow internet or configuring router throttling, simulate latency deterministically inside your route handler:
\`\`\`typescript
await page.route("**/api/lab/network/items*", async (route) => {
  // Add deterministic 600ms latency
  await new Promise((resolve) => setTimeout(resolve, 600));
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ items: [...] })
  });
});
await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();
// Verify loading spinner is visible during transit
await expect(page.getByText("Waiting for Express backend response...")).toBeVisible();
// Web-first assertion auto-waits for loading spinner to detach
await expect(page.getByTestId("telemetry-list")).toBeVisible();
\`\`\`

2. Simulating Network Drops and Aborts:
Use 'route.abort()' to simulate dropped Wi-Fi, DNS lookup failures, or closed connections:
\`\`\`typescript
await page.route("**/api/lab/network/items*", async (route) => {
  await route.abort("failed"); // Simulates net::ERR_FAILED
});
await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();
await expect(page.getByRole("alert")).toBeVisible();
\`\`\`
Available error codes: 'failed', 'aborted', 'timedout', 'accessdenied', 'connectionclosed', 'connectionreset', 'connectionrefused', 'internetdisconnected'.

3. Reproducing Autocomplete Race Conditions:
A classic frontend bug occurs when a user types "slow" followed immediately by "fast". The "slow" query takes 800ms while the "fast" query takes 50ms. If the application lacks an AbortController, the "slow" query resolves second, overwriting the newer "fast" query results.
Playwright can reproduce this race condition deterministically by delaying the earlier query and verifying that client-side cancellation logic prevents stale results from winning.`
    },
    {
      id: "advanced-network-scenarios",
      title: "Part F — Advanced Routing Architecture: LIFO Priority, Context Routes & Service Workers",
      content: `Scaling test automation to enterprise levels requires an understanding of Playwright's internal routing engine, priority cascades, and worker-scoped namespaces.

1. LIFO (Last-In, First-Out) Route Precedence:
When multiple route handlers match the same URL pattern, Playwright executes them in reverse order of registration (LIFO). The most recently registered handler runs first!
\`\`\`typescript
// Handler 1: Registered first -> Runs SECOND
await page.route("**/api/**", async (route) => {
  console.log("Global fallback handler");
  await route.continue();
});

// Handler 2: Registered second -> Runs FIRST
await page.route("**/api/lab/network/items*", async (route) => {
  console.log("Specific items handler");
  // Calling fallback() cascades to Handler 1!
  await route.fallback();
});
\`\`\`

2. Page-Level vs. Context-Level Routing:
- 'browserContext.route()': Applies to all tabs and workers in the context. Ideal for mocking third-party tracking scripts, CDNs, or global configuration endpoints.
- 'page.route()': Scoped exclusively to an individual page. Takes precedence over context routes for that page.

3. Service Worker Routing Interactions:
By default, requests initiated by Service Workers do not pass through 'page.route()'. To intercept traffic through service workers, configure 'serviceWorkers: "allow"' in your Playwright configuration and attach routes at the 'browserContext' level.

4. Real-Time Network Telemetry Monitoring:
Attach event listeners to diagnose silent network failures:
\`\`\`typescript
page.on("request", (req) => console.log("--> " + req.method() + " " + req.url()));
page.on("response", (res) => console.log("<-- " + res.status() + " " + res.url()));
page.on("requestfailed", (req) => console.error("XXX " + req.url() + ": " + req.failure()?.errorText));
\`\`\``
    },
    {
      id: "network-debugging",
      title: "Part G — Network Debugging Diagnostics, Trace Analysis & Pitfall Elimination",
      content: `Debugging failing network mocks requires a systematic root-cause methodology.

1. The "Route Did Not Match" Triage Checklist:
- Registration Timing: Was 'page.route()' awaited BEFORE the user action (click/fill) dispatched the request? If the request was already in flight, the route handler cannot intercept it.
- URL Glob Pattern: Does the pattern account for query strings? '**/items' will NOT match '**/items?q=telemetry'. Use '**/items*' to match query strings safely.
- Protocol and Origin: Does the pattern assume 'http://' when the environment runs on 'https://'? Use wildcard globs like '**/api/**' to avoid protocol mismatches.

2. Using Trace Viewer for Network Audits:
Playwright Trace Viewer records every network transaction with microsecond timestamps:
- Open the Network tab in Trace Viewer to see whether an intercepted request shows '(fulfilled)', '(aborted)', or reached the live remote server.
- Inspect the exact headers and JSON payload passed to 'route.fulfill()' vs what the application received.

3. Avoiding Over-Mocking Anti-Patterns:
Mocking provides incredible speed, but testing against static mocks forever creates dangerous false confidence. If the backend team renames a field from 'course_id' to 'courseId', a mocked test suite continues passing 100% while production is completely broken.
Senior Strategy: Pair fast mocked UI tests with contract validation tests (Phase 9) and daily end-to-end regression tests against real local backend APIs.`
    }
  ],
  codeExamples: [
    {
      id: "example-deterministic-json-mocking",
      caption: "Basic JSON Mocking with page.route() and route.fulfill()",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("mocks telemetry items response deterministically", async ({ page }) => {
  // 1. Register route handler BEFORE triggering network action
  await page.route("**/api/lab/network/items*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "x-mock-source": "playwright" },
      body: JSON.stringify({
        items: [
          {
            id: "MOCK-001",
            title: "Deterministic Quantum Telemetry",
            category: "security",
            latencyMs: 5,
            timestamp: new Date().toISOString(),
          },
        ],
        total: 1,
        latencyApplied: 5,
      }),
    });
  });

  // 2. Navigate and trigger client fetch
  await page.goto("/lab/network");
  await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

  // 3. Web-first assertion validates mock data in the DOM
  const list = page.getByTestId("telemetry-list");
  await expect(list).toBeVisible();
  await expect(list.getByText("Deterministic Quantum Telemetry")).toBeVisible();
});`,
      lineExplanations: [
        { line: 5, explanation: "page.route() registers an interception handler matching all items requests with query parameters." },
        { line: 6, explanation: "route.fulfill() resolves the request inside the browser with mock JSON without calling the server." },
        { line: 24, explanation: "User interaction triggers the client-side window.fetch() call." },
        { line: 28, explanation: "Web-first assertion confirms mock data successfully rendered into the React DOM." }
      ]
    },
    {
      id: "example-network-outage-abort",
      caption: "Network Outage & Connection Abort Simulation with route.abort()",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("simulates client offline connection drop", async ({ page }) => {
  await page.goto("/lab/network");

  // Intercept and drop the connection immediately
  await page.route("**/api/lab/network/items*", async (route) => {
    await route.abort("failed");
  });

  await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

  // Assert client UI renders structured error alert rather than crashing
  const alert = page.getByRole("alert");
  await expect(alert).toBeVisible();
  await expect(page.getByTestId("telemetry-list")).not.toBeVisible();
});`,
      lineExplanations: [
        { line: 7, explanation: "route.abort('failed') simulates an immediate network failure (net::ERR_FAILED)." },
        { line: 11, explanation: "Triggers client-side fetch which rejects with a TypeError: Failed to fetch." },
        { line: 14, explanation: "Verifies the application catch block displays user-facing error feedback." }
      ]
    },
    {
      id: "example-augment-with-route-fetch",
      caption: "Intercepting & Augmenting Real Responses with route.fetch()",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("fetches real data and injects extra item into response", async ({ page }) => {
  await page.goto("/lab/network");

  await page.route("**/api/lab/network/items*", async (route) => {
    // 1. Dispatch genuine request to live Express backend
    const response = await route.fetch();
    const json = await response.json();

    // 2. Augment live data with synthetic item
    json.items.unshift({
      id: "AUG-001",
      title: "Augmented Real Backend Item",
      category: "live-mod",
      latencyMs: 5,
      timestamp: new Date().toISOString(),
    });
    json.total = json.items.length;

    // 3. Fulfill with modified payload while preserving real headers
    await route.fulfill({
      response,
      json,
    });
  });

  await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

  const list = page.getByTestId("telemetry-list");
  await expect(list).toBeVisible();
  await expect(list.getByText("Augmented Real Backend Item")).toBeVisible();
  await expect(list.getByText("Cluster Snapshot Ingestion")).toBeVisible();
});`,
      lineExplanations: [
        { line: 8, explanation: "route.fetch() executes real HTTP request to the live backend." },
        { line: 12, explanation: "Mutates real backend response payload by inserting an augmented item." },
        { line: 22, explanation: "Fulfills with modified json while preserving real status and headers from response." }
      ]
    },
    {
      id: "example-request-header-injection",
      caption: "Request Header Injection and Modification with route.continue()",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("injects enterprise tenant header in-flight", async ({ page }) => {
  await page.goto("/lab/network");

  let injectedHeader = "";

  await page.route("**/api/lab/network/items*", async (route) => {
    const headers = {
      ...route.request().headers(),
      "x-custom-tenant": "enterprise-alpha-99",
    };
    injectedHeader = headers["x-custom-tenant"];
    // Continue outbound request with injected headers
    await route.continue({ headers });
  });

  await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

  await expect(page.getByTestId("telemetry-list")).toBeVisible();
  expect(injectedHeader).toBe("enterprise-alpha-99");
});`,
      lineExplanations: [
        { line: 9, explanation: "Copies existing request headers and appends custom enterprise header." },
        { line: 15, explanation: "route.continue({ headers }) forwards modified request to the real server." },
        { line: 21, explanation: "Asserts header was successfully attached before request dispatch." }
      ]
    },
    {
      id: "example-race-condition-mitigation",
      caption: "Autocomplete Race Condition Simulation with AbortControllers",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("verifies out-of-order race condition cancellation", async ({ page }) => {
  await page.goto("/lab/network");

  const fastBtn = page.getByRole("button", { name: "Dispatch Fast Query (50ms)" });
  const slowBtn = page.getByRole("button", { name: "Dispatch Slow Query (800ms)" });

  // Delay slow query artificially to test client cancellation
  await page.route("**/api/lab/network/race*", async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get("speed") === "slow") {
      await new Promise((r) => setTimeout(r, 400));
    } else {
      await new Promise((r) => setTimeout(r, 50));
    }
    await route.continue();
  });

  // Dispatch slow query followed immediately by fast query
  await slowBtn.click();
  await fastBtn.click();

  // The fast query must win and not be overwritten by stale slow query
  const resultBox = page.getByText(/Winner:/);
  await expect(resultBox).toBeVisible();
  await expect(resultBox).toContainText("FAST");
});`,
      lineExplanations: [
        { line: 10, explanation: "Inspects query params to apply synthetic delay to slow requests." },
        { line: 20, explanation: "Triggers rapid back-to-back user queries." },
        { line: 24, explanation: "Asserts client-side AbortController cancelled slow query so fast query won." }
      ]
    },
    {
      id: "example-context-routing-teardown",
      caption: "Dynamic Route Registration and Teardown with page.unroute()",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("attaches mock and subsequently unroutes to restore live backend", async ({ page }) => {
  await page.goto("/lab/network");

  const mockHandler = async (route: Parameters<Parameters<typeof page.route>[1]>[0]) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [{ id: "TEMP-1", title: "Temporary Mock Item", category: "temp", latencyMs: 1 }],
        total: 1,
      }),
    });
  };

  // 1. Attach mock handler
  await page.route("**/api/lab/network/items*", mockHandler);
  await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();
  await expect(page.getByTestId("telemetry-list").getByText("Temporary Mock Item")).toBeVisible();

  // 2. Remove handler using page.unroute()
  await page.unroute("**/api/lab/network/items*", mockHandler);

  // 3. Fetch again -> Real live Express backend responds!
  await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();
  await expect(page.getByTestId("telemetry-list").getByText("Cluster Snapshot Ingestion")).toBeVisible();
});`,
      lineExplanations: [
        { line: 6, explanation: "Declares named handler reference for exact removal." },
        { line: 18, explanation: "page.route() registers mock for the initial query." },
        { line: 22, explanation: "page.unroute() removes the mock handler, restoring live traffic." },
        { line: 26, explanation: "Asserts subsequent fetch receives genuine live database records." }
      ]
    }
  ],
  commonMistakes: [
    {
      title: "Registering page.route() after triggering the user action",
      badPractice: `await page.getByRole("button", { name: "Fetch" }).click();
await page.route("**/api/items*", async (route) => {
  await route.fulfill({ json: { items: [] } });
});`,
      goodPractice: `await page.route("**/api/items*", async (route) => {
  await route.fulfill({ json: { items: [] } });
});
await page.getByRole("button", { name: "Fetch" }).click();`,
      explanation: "Routes must be established before the network request is initiated. If you click before registering the route, the real request is already in-flight over the wire."
    },
    {
      title: "Using overly broad wildcard globs that hijack assets and scripts",
      badPractice: `// Dangerous: Intercepts CSS, JS bundles, images, and fonts!
await page.route("**/*", async (route) => {
  await route.fulfill({ json: { data: "mock" } });
});`,
      goodPractice: `// Scoped: Targets only specific API microservices
await page.route("**/api/lab/network/items*", async (route) => {
  await route.fulfill({ json: { data: "mock" } });
});`,
      explanation: "Overly broad patterns intercept stylesheet downloads and React bundle chunks, breaking rendering and producing blank white screens."
    },
    {
      title: "Forgetting to unroute or leaking mock handlers across tests",
      badPractice: `test.beforeEach(async ({ page }) => {
  // Attached globally but never cleaned up, poisoning subsequent tests!
  await page.route("**/api/**", mockAll);
});`,
      goodPractice: `test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: "ignoreErrors" });
});`,
      explanation: "Leaked route handlers cause bizarre failures in downstream tests that expect to communicate with live endpoints or different mock states."
    },
    {
      title: "Over-mocking to the point where tests pass while production is broken",
      badPractice: `// Mocking everything forever, blind to backend schema changes
await page.route("**/api/**", async (route) => {
  await route.fulfill({ json: hardcodedStaticData });
});`,
      goodPractice: `// Balance mocks for edge cases with unmocked integration tests for core flows
await page.route("**/api/telemetry/outage*", mockOutage);
// Core CRUD tests run against live Express backend without mocks`,
      explanation: "If you mock every endpoint, tests pass when backend developers rename fields or deprecate endpoints, hiding production regressions until deployment."
    },
    {
      title: "Returning incomplete mock payloads missing mandatory schema properties",
      badPractice: `// Crashes UI when component evaluates item.timestamp.toLowerCase()
await route.fulfill({ json: { items: [{ id: "1" }] } });`,
      goodPractice: `// Preserves complete realistic contract expected by the client UI
await route.fulfill({
  json: {
    items: [{ id: "1", title: "Valid Title", category: "audit", latencyMs: 5, timestamp: new Date().toISOString() }],
    total: 1
  }
});`,
      explanation: "Components frequently destructure properties or call string methods on incoming objects. Incomplete mock responses trigger undefined reference TypeError crashes."
    },
    {
      title: "Calling route.abort() without testing how the UI handles network failure",
      badPractice: `await page.route("**/api/**", (r) => r.abort());
await page.click("#save-btn");
// No assertion: test passes while UI freezes in infinite loading spinner!`,
      goodPractice: `await page.route("**/api/**", (r) => r.abort());
await page.click("#save-btn");
await expect(page.getByRole("alert")).toContainText("Network failure");
await expect(page.getByRole("button", { name: "Retry" })).toBeEnabled();`,
      explanation: "The purpose of aborting requests is to verify that client error boundaries and retry mechanisms protect users from silent failures."
    }
  ],
  playground: {
    title: "Playwright Network Interception & API Mocking Matrix",
    configExample: `// Production Playwright Network Interception & Mocking Blueprint
import { test, expect } from "@playwright/test";

test("network routing and response augmentation blueprint", async ({ page }) => {
  // 1. Precise route matching with glob pattern
  await page.route("**/api/lab/network/items*", async (route) => {
    const req = route.request();

    // 2. Conditional branching based on request method
    if (req.method() === "POST") {
      // Inspect payload and fulfill with synthetic record
      const postData = req.postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "SYN-99", ...postData, latencyMs: 1 }),
      });
      return;
    }

    // 3. Augment live GET response via route.fetch()
    const response = await route.fetch();
    const json = await response.json();
    json.items.unshift({
      id: "PROD-MOCK-1",
      title: "Augmented Production Telemetry",
      category: "blueprint",
      latencyMs: 5,
      timestamp: new Date().toISOString(),
    });

    await route.fulfill({ response, json });
  });

  await page.goto("/lab/network");
  await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();
  await expect(page.getByText("Augmented Production Telemetry")).toBeVisible();
});`,
    properties: [
      {
        name: "page.route(url, handler)",
        type: "Promise<void>",
        defaultValue: "undefined",
        description: "Registers an HTTP interception handler scoped exclusively to the active Page tab or frame.",
        impact: "Essential for deterministic mocking, network drops, and simulated backend outages."
      },
      {
        name: "browserContext.route(url, handler)",
        type: "Promise<void>",
        defaultValue: "undefined",
        description: "Registers an interception handler across all pages, popups, and workers in the context.",
        impact: "Ideal for blocking analytics tracking scripts or mocking global CDN assets across multi-tab tests."
      },
      {
        name: "route.fulfill(options)",
        type: "Promise<void>",
        defaultValue: "undefined",
        description: "Fulfills the request immediately with mock status, headers, and JSON or string body.",
        impact: "Prevents the request from hitting the live server, resolving client promises in <2ms."
      },
      {
        name: "route.continue(options)",
        type: "Promise<void>",
        defaultValue: "undefined",
        description: "Forwards the request to the upstream server, optionally modifying headers, method, or postData.",
        impact: "Enables in-flight authentication header injection, tenant partitioning, and payload mutations."
      },
      {
        name: "route.abort(errorCode)",
        type: "Promise<void>",
        defaultValue: "failed",
        description: "Terminates the request immediately with a simulated network connection failure code.",
        impact: "Crucial for testing client-side error handling, offline modes, and connection drop resilience."
      },
      {
        name: "route.fetch(options)",
        type: "Promise<APIResponse>",
        defaultValue: "undefined",
        description: "Dispatches the request to the live backend out-of-band and returns the real APIResponse.",
        impact: "Allows tests to capture genuine live responses, mutate specific fields, and fulfill to the browser."
      },
      {
        name: "route.fallback(options)",
        type: "Promise<void>",
        defaultValue: "undefined",
        description: "Passes control to the next matching route handler in Playwright's LIFO execution queue.",
        impact: "Enables composable, multi-layer routing architectures where specialized handlers cascade to defaults."
      },
      {
        name: "page.unroute(url, [handler])",
        type: "Promise<void>",
        defaultValue: "undefined",
        description: "Removes specific or all registered route handlers matching the URL pattern on the page.",
        impact: "Restores live backend connectivity after testing a temporary mock scenario."
      },
      {
        name: "route.request().postDataJSON()",
        type: "any",
        defaultValue: "undefined",
        description: "Deserializes the outgoing HTTP POST or PUT request body into a typed JavaScript object.",
        impact: "Simplifies inspecting payload parameters without manual JSON.parse() calls."
      },
      {
        name: "route.request().headers()",
        type: "Record<string, string>",
        defaultValue: "{}",
        description: "Returns a normalized lowercase dictionary of all HTTP request headers sent by the client.",
        impact: "Used for asserting security tokens, tenant identifiers, and worker namespaces."
      },
      {
        name: "page.waitForResponse(urlOrPredicate)",
        type: "Promise<Response>",
        defaultValue: "undefined",
        description: "Waits until a specific network response completes before advancing execution.",
        impact: "Eliminates race conditions when user actions trigger asynchronous background synchronizations."
      },
      {
        name: "serviceWorkers",
        type: "'allow' | 'block'",
        defaultValue: "'allow'",
        description: "Controls whether service workers are allowed to handle network traffic before Playwright routing.",
        impact: "Setting to 'block' bypasses offline service worker caches to ensure page.route() receives traffic."
      }
    ],
    behaviorComparison: [
      {
        aspect: "Deterministic Mocking vs Live Backend Testing",
        defaultBehavior: "Mocking with route.fulfill() executes in <2ms, allows simulating 500 errors, and never pollutes databases.",
        customizedBehavior: "Live backend testing executes real SQL queries and authentication, verifying contract fidelity."
      },
      {
        aspect: "route.continue() vs route.fallback()",
        defaultBehavior: "route.continue() forwards the request across the network to the live upstream server.",
        customizedBehavior: "route.fallback() passes the request to the next matching Playwright route handler in the local queue."
      },
      {
        aspect: "route.fetch() vs Manual Mock Fixtures",
        defaultBehavior: "route.fetch() captures genuine server responses, allowing selective augmentation of live data.",
        customizedBehavior: "Manual mock fixtures return static data, requiring constant updates as backend schemas evolve."
      },
      {
        aspect: "LIFO Route Ordering vs First-Registered Priority",
        defaultBehavior: "Playwright executes routes in Last-In, First-Out (LIFO) order; handlers registered later take precedence.",
        customizedBehavior: "Assuming first-registered priority causes unexpected behavior when adding test-specific overrides."
      },
      {
        aspect: "page.route() vs browserContext.route()",
        defaultBehavior: "page.route() is strictly isolated to a single page tab, preventing cross-test crosstalk.",
        customizedBehavior: "browserContext.route() applies across all tabs and popups, ideal for global tracking blockers."
      },
      {
        aspect: "route.abort('failed') vs route.fulfill({ status: 500 })",
        defaultBehavior: "route.abort() drops TCP connection, causing fetch() promises to reject with network errors.",
        customizedBehavior: "route.fulfill({ status: 500 }) completes HTTP handshake, returning structured error JSON to client."
      }
    ],
    practiceTask: "Test network inspection, mock responses, aborts, response augmentation with route.fetch(), race conditions, and optimistic rollback against /lab/network.",
    localCommand: "pnpm exec playwright test e2e/practice-network.spec.ts"
  },
  exercises: [
    {
      id: "ex1-inspect-request-and-response",
      title: "Exercise 1: Inspect an Outbound HTTP Request and Response",
      objective: "Intercept an outbound network request, inspect its method, URL, and headers, and allow it to continue.",
      prerequisites: [
        "page.route() registration",
        "route.request() inspection methods"
      ],
      scenario: "Navigate to /lab/network, intercept /api/lab/network/items, inspect method and Accept headers, and continue.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 1: Inspect request", async ({ page }) => {
  // TODO: page.goto('/lab/network')
  // TODO: page.route('**/api/lab/network/items*', (route) => { inspect method/url/headers; route.continue(); })
  // TODO: Click 'Fetch Telemetry Records'
  // TODO: Assert telemetry list visible and inspected values valid
});`,
      task: "Register a route handler for **/api/lab/network/items*, capture method, URL, and headers, call route.continue(), click 'Fetch Telemetry Records', and assert captured values.",
      acceptanceCriteria: [
        "page.route() registered before click.",
        "request.method() asserted to equal 'GET'.",
        "request.url() contains '/api/lab/network/items'.",
        "route.continue() forwards request to live backend."
      ],
      expectedBehavior: "Request completes normally while test verifies outbound HTTP metadata in memory.",
      hint: "Use const req = route.request(); const method = req.method(); await route.continue();",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 1: Inspect a request and response", async ({ page }) => {
  let interceptedMethod = "";
  let interceptedUrl = "";

  await page.route("**/api/lab/network/items*", async (route) => {
    const req = route.request();
    interceptedMethod = req.method();
    interceptedUrl = req.url();
    await route.continue();
  });

  await page.goto("/lab/network");
  await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

  await expect(page.getByTestId("telemetry-list")).toBeVisible();
  expect(interceptedMethod).toBe("GET");
  expect(interceptedUrl).toContain("/api/lab/network/items");
});`,
      troubleshootingNotes: "Always register routes before triggering the user action that initiates the network request.",
      command: "pnpm exec playwright test e2e/practice-network.spec.ts -g 'Exercise 1'"
    },
    {
      id: "ex2-mock-json-response",
      title: "Exercise 2: Mock a Successful JSON Response with route.fulfill()",
      objective: "Intercept an API endpoint and fulfill it with custom mock data and custom headers in single-digit milliseconds.",
      prerequisites: [
        "route.fulfill() options",
        "JSON serialization"
      ],
      scenario: "Fulfill /api/lab/network/items with custom telemetry item 'Quantum Cryptography Audit' and assert UI rendering.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 2: Mock JSON response", async ({ page }) => {
  // TODO: page.route('**/api/lab/network/items*', fulfill with mock data)
  // TODO: Click 'Fetch Telemetry Records'
  // TODO: Assert mock item appears in telemetry-list
});`,
      task: "Intercept /api/lab/network/items*, return status 200 with items containing 'Quantum Cryptography Audit', and assert DOM rendering.",
      acceptanceCriteria: [
        "route.fulfill() returns status 200 and contentType 'application/json'.",
        "Custom item rendered in [data-testid='telemetry-list'].",
        "Live backend is not queried for items."
      ],
      expectedBehavior: "Mock item resolves instantly and renders without hitting server database.",
      hint: "Pass body: JSON.stringify({ items: [{ id: 'MOCK-001', title: 'Quantum Cryptography Audit', category: 'security', latencyMs: 10 }] }) in fulfill().",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 2: Mock a successful JSON response", async ({ page }) => {
  await page.route("**/api/lab/network/items*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [
          {
            id: "MOCK-001",
            title: "Quantum Cryptography Audit",
            category: "security",
            latencyMs: 10,
            timestamp: new Date().toISOString(),
          },
        ],
        total: 1,
        latencyApplied: 10,
      }),
    });
  });

  await page.goto("/lab/network");
  await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

  const list = page.getByTestId("telemetry-list");
  await expect(list).toBeVisible();
  await expect(list.getByText("Quantum Cryptography Audit")).toBeVisible();
});`,
      troubleshootingNotes: "Remember to include contentType: 'application/json' so the browser parses response body as JSON.",
      command: "pnpm exec playwright test e2e/practice-network.spec.ts -g 'Exercise 2'"
    },
    {
      id: "ex3-simulate-empty-collection",
      title: "Exercise 3: Simulate an Empty Collection and Assert Zero-State UX",
      objective: "Fulfill an API request with an empty items array and verify the application renders proper empty-state feedback.",
      prerequisites: [
        "Zero-state UX design",
        "Web-first assertions"
      ],
      scenario: "Fulfill /api/lab/network/items with total: 0 and items: [] to verify 'No items matching query' zero-state banner.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 3: Simulate empty collection", async ({ page }) => {
  // TODO: Mock empty items array
  // TODO: Trigger fetch
  // TODO: Assert empty-state feedback is visible and telemetry-list is hidden
});`,
      task: "Fulfill **/api/lab/network/items* with empty items array, assert [data-testid='empty-state'] is visible, and assert telemetry-list is not visible.",
      acceptanceCriteria: [
        "Fulfill returns { items: [], total: 0 }.",
        "Empty state banner visible.",
        "Telemetry list hidden."
      ],
      expectedBehavior: "Application gracefully displays empty state feedback rather than crashing or freezing.",
      hint: "Use await expect(page.getByTestId('empty-state')).toBeVisible(); and assert text 'No items matching query'.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 3: Simulate an empty collection", async ({ page }) => {
  await page.route("**/api/lab/network/items*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [],
        total: 0,
        latencyApplied: 0,
      }),
    });
  });

  await page.goto("/lab/network");
  await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

  await expect(page.getByTestId("empty-state")).toBeVisible();
  await expect(page.getByText("No items matching query (Empty Response).")).toBeVisible();
  await expect(page.getByTestId("telemetry-list")).not.toBeVisible();
});`,
      troubleshootingNotes: "Empty collection testing ensures UI doesn't crash on null pointer when array length is 0.",
      command: "pnpm exec playwright test e2e/practice-network.spec.ts -g 'Exercise 3'"
    },
    {
      id: "ex4-return-500-error",
      title: "Exercise 4: Return a 500 Outage and Verify Error Alert UI",
      objective: "Simulate a severe server-side outage by returning HTTP 500 and assert the client error boundary catches it.",
      prerequisites: [
        "HTTP error simulation",
        "Alert role locators"
      ],
      scenario: "Simulate a primary database connection loss and assert the application displays an error alert with 500 status.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 4: Return 500 response", async ({ page }) => {
  // TODO: Mock 500 Internal Server Error
  // TODO: Click fetch button
  // TODO: Assert alert is visible and contains '500'
});`,
      task: "Fulfill **/api/lab/network/items* with status 500 and structured error envelope, trigger fetch, and assert alert rendering.",
      acceptanceCriteria: [
        "route.fulfill() returns status: 500.",
        "Alert element appears with role='alert'.",
        "Alert contains '500' error code."
      ],
      expectedBehavior: "Application displays structured error message rather than unhandled promise rejection.",
      hint: "Use await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { message: 'Database Down' } }) });",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 4: Return a 500 response and verify the error UI", async ({ page }) => {
  await page.route("**/api/lab/network/items*", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({
        error: {
          code: "upstream_database_down",
          message: "Simulated Primary Database Connection Loss",
        },
      }),
    });
  });

  await page.goto("/lab/network");
  await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

  const alert = page.getByRole("alert");
  await expect(alert).toBeVisible();
  await expect(alert).toContainText("500");
});`,
      troubleshootingNotes: "Simulating 500 errors via route.fulfill() tests client error boundaries without touching physical servers.",
      command: "pnpm exec playwright test e2e/practice-network.spec.ts -g 'Exercise 4'"
    },
    {
      id: "ex5-delayed-api-response",
      title: "Exercise 5: Simulate a Delayed API Response and Assert Loading State",
      objective: "Inject synthetic latency into a route handler and assert that loading spinners appear and subsequently detach.",
      prerequisites: [
        "Synthetic latency via setTimeout",
        "Web-first auto-waiting"
      ],
      scenario: "Delay /api/lab/network/items by 600ms, assert loading message is visible, and assert list appears once resolved.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 5: Simulate delayed response", async ({ page }) => {
  // TODO: Delay route handler by 600ms before fulfill
  // TODO: Click fetch button
  // TODO: Assert 'Waiting for Express backend response...' is visible
  // TODO: Assert telemetry-list appears and loading message detaches
});`,
      task: "Introduce a 600ms delay inside the route handler, click fetch, assert loading message appears, and assert list replaces loading indicator.",
      acceptanceCriteria: [
        "Synthetic delay introduced via Promise/setTimeout.",
        "Loading message verified while request is in flight.",
        "Loading message detaches once response is fulfilled."
      ],
      expectedBehavior: "Loading state is confirmed during in-flight transit, followed by seamless list rendering.",
      hint: "Use await new Promise(r => setTimeout(r, 600)); before route.fulfill().",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 5: Simulate a delayed API response and assert the loading state", async ({ page }) => {
  await page.route("**/api/lab/network/items*", async (route) => {
    await new Promise((res) => setTimeout(res, 600));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [
          {
            id: "LAT-01",
            title: "Delayed Synthetic Item",
            category: "telemetry",
            latencyMs: 600,
            timestamp: new Date().toISOString(),
          },
        ],
        total: 1,
        latencyApplied: 600,
      }),
    });
  });

  await page.goto("/lab/network");
  await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

  const loading = page.getByText("Waiting for Express backend response...");
  await expect(loading).toBeVisible();

  const list = page.getByTestId("telemetry-list");
  await expect(list).toBeVisible();
  await expect(loading).not.toBeVisible();
  await expect(list.getByText("Delayed Synthetic Item")).toBeVisible();
});`,
      troubleshootingNotes: "Do not use arbitrary sleep in tests; use Playwright web-first assertions that auto-wait for detachment.",
      command: "pnpm exec playwright test e2e/practice-network.spec.ts -g 'Exercise 5'"
    },
    {
      id: "ex6-abort-request-recovery",
      title: "Exercise 6: Abort a Request and Verify Client Recovery Behavior",
      objective: "Terminate a network request using route.abort('failed') and assert the client recovers without unhandled crashes.",
      prerequisites: [
        "route.abort() error codes",
        "Client recovery validation"
      ],
      scenario: "Simulate an immediate client connection drop via route.abort('failed') and assert the application handles the failure.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 6: Abort request", async ({ page }) => {
  // TODO: route.abort('failed') on items endpoint
  // TODO: Click fetch button
  // TODO: Assert alert is visible and page does not crash
});`,
      task: "Intercept /api/lab/network/items*, abort with 'failed', trigger fetch, and assert error alert renders.",
      acceptanceCriteria: [
        "route.abort('failed') called.",
        "Error alert renders in UI.",
        "Application remains responsive."
      ],
      expectedBehavior: "Connection abort triggers client catch block and displays user error notice.",
      hint: "Use await route.abort('failed'); inside the route handler.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 6: Abort a request and verify recovery behavior", async ({ page }) => {
  await page.route("**/api/lab/network/items*", async (route) => {
    await route.abort("failed");
  });

  await page.goto("/lab/network");
  await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

  const alert = page.getByRole("alert");
  await expect(alert).toBeVisible();
});`,
      troubleshootingNotes: "route.abort() simulates genuine network socket drops rather than server HTTP responses.",
      command: "pnpm exec playwright test e2e/practice-network.spec.ts -g 'Exercise 6'"
    },
    {
      id: "ex7-modify-request-header",
      title: "Exercise 7: Modify an Outbound Request Header in Transit",
      objective: "Intercept an outbound HTTP request, inject a custom tenant header, and forward with route.continue().",
      prerequisites: [
        "route.continue({ headers })",
        "Header propagation"
      ],
      scenario: "Inject header 'x-custom-tenant': 'enterprise-alpha-99' into outgoing items request and verify propagation.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 7: Modify request header", async ({ page }) => {
  // TODO: Intercept items request
  // TODO: Inject 'x-custom-tenant' header
  // TODO: route.continue({ headers })
  // TODO: Verify request succeeded
});`,
      task: "Attach custom tenant header using route.continue({ headers }) and assert request completes successfully.",
      acceptanceCriteria: [
        "Headers dictionary cloned and mutated.",
        "route.continue({ headers }) called.",
        "Response completes successfully with telemetry list visible."
      ],
      expectedBehavior: "Modified headers are transmitted to backend while maintaining live data flow.",
      hint: "const headers = { ...route.request().headers(), 'x-custom-tenant': 'enterprise-alpha-99' }; await route.continue({ headers });",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 7: Modify a request header", async ({ page }) => {
  let headerSent = "";

  await page.route("**/api/lab/network/items*", async (route) => {
    const headers = {
      ...route.request().headers(),
      "x-custom-tenant": "enterprise-alpha-99",
    };
    headerSent = headers["x-custom-tenant"];
    await route.continue({ headers });
  });

  await page.goto("/lab/network");
  await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

  await expect(page.getByTestId("telemetry-list")).toBeVisible();
  expect(headerSent).toBe("enterprise-alpha-99");
});`,
      troubleshootingNotes: "Always spread existing headers when using route.continue() to avoid stripping cookies or auth headers.",
      command: "pnpm exec playwright test e2e/practice-network.spec.ts -g 'Exercise 7'"
    },
    {
      id: "ex8-augment-with-route-fetch",
      title: "Exercise 8: Use route.fetch() to Augment a Live Backend Response",
      objective: "Fetch live data from the Express server using route.fetch(), modify the payload in-flight, and fulfill to the browser.",
      prerequisites: [
        "route.fetch() method",
        "Response mutation and fulfill"
      ],
      scenario: "Fetch genuine items from backend, unshift synthetic item 'Augmented Real Backend Item', and fulfill to UI.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 8: route.fetch() response augmentation", async ({ page }) => {
  // TODO: const response = await route.fetch()
  // TODO: const json = await response.json()
  // TODO: json.items.unshift(syntheticItem)
  // TODO: route.fulfill({ response, json })
  // TODO: Assert both synthetic item and real backend item render
});`,
      task: "Call route.fetch(), parse JSON, inject augmented item, fulfill with { response, json }, and assert both synthetic and real records appear.",
      acceptanceCriteria: [
        "route.fetch() calls live backend.",
        "json payload modified before fulfillment.",
        "Synthetic item and live item both visible in the UI."
      ],
      expectedBehavior: "UI renders augmented dataset combining synthetic records with authentic server records.",
      hint: "Use const response = await route.fetch(); const json = await response.json(); json.items.unshift({...}); await route.fulfill({ response, json });",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 8: Use route.fetch() to preserve real backend behavior while modifying a response", async ({ page }) => {
  await page.route("**/api/lab/network/items*", async (route) => {
    const response = await route.fetch();
    const json = await response.json();

    json.items.unshift({
      id: "AUG-001",
      title: "Augmented Real Backend Item",
      category: "live-mod",
      latencyMs: 5,
      timestamp: new Date().toISOString(),
    });
    json.total = json.items.length;

    await route.fulfill({
      response,
      json,
    });
  });

  await page.goto("/lab/network");
  await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

  const list = page.getByTestId("telemetry-list");
  await expect(list).toBeVisible();
  await expect(list.getByText("Augmented Real Backend Item")).toBeVisible();
  await expect(list.getByText("Cluster Snapshot Ingestion")).toBeVisible();
});`,
      troubleshootingNotes: "route.fetch() enables hybrid testing: real backend connectivity with surgical mock injections.",
      command: "pnpm exec playwright test e2e/practice-network.spec.ts -g 'Exercise 8'"
    },
    {
      id: "ex9-autocomplete-race-condition",
      title: "Exercise 9: Reproduce and Mitigate Autocomplete Race Conditions",
      objective: "Simulate out-of-order API arrival times and verify that client AbortController logic prevents stale overwrites.",
      prerequisites: [
        "Asynchronous race conditions",
        "Query parameter routing"
      ],
      scenario: "Dispatch slow query (800ms) followed immediately by fast query (50ms); verify fast query results win and are not overwritten.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 9: Race condition simulation", async ({ page }) => {
  // TODO: Intercept /api/lab/network/race*
  // TODO: Delay slow query by 400ms and fast query by 50ms
  // TODO: Click slow button then fast button
  // TODO: Assert winner banner indicates FAST query won
});`,
      task: "Control response timing for /api/lab/network/race*, trigger slow then fast query, and assert fast query wins.",
      acceptanceCriteria: [
        "Slow query artificially delayed.",
        "Fast query resolves ahead of slow query.",
        "Result box displays 'Winner: FAST'."
      ],
      expectedBehavior: "Client cancellation logic aborts superseded slow query, ensuring fresh query results persist.",
      hint: "Inspect url.searchParams.get('speed') to delay slow requests before calling route.continue().",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 9: Reproduce an autocomplete race condition", async ({ page }) => {
  await page.goto("/lab/network");

  const fastBtn = page.getByRole("button", { name: "Dispatch Fast Query (50ms)" });
  const slowBtn = page.getByRole("button", { name: "Dispatch Slow Query (800ms)" });

  await page.route("**/api/lab/network/race*", async (route) => {
    const url = new URL(route.request().url());
    const speed = url.searchParams.get("speed");

    if (speed === "slow") {
      await new Promise((r) => setTimeout(r, 400));
    } else {
      await new Promise((r) => setTimeout(r, 50));
    }
    await route.continue();
  });

  await slowBtn.click();
  await fastBtn.click();

  const resultBox = page.getByText(/Winner:/);
  await expect(resultBox).toBeVisible();
  await expect(resultBox).toContainText("FAST");
});`,
      troubleshootingNotes: "Race conditions in SPAs are easily caught when controlling network arrival order with page.route().",
      command: "pnpm exec playwright test e2e/practice-network.spec.ts -g 'Exercise 9'"
    },
    {
      id: "ex10-optimistic-update-rollback",
      title: "Exercise 10: Test Optimistic UI Updates and Automatic Rollback",
      objective: "Verify that an optimistic UI mutation appears immediately and then rolls back when the backend returns a 500 error.",
      prerequisites: [
        "Optimistic UI state testing",
        "HTTP POST interception"
      ],
      scenario: "Submit an optimistic item in /lab/network, intercept POST /api/lab/network/items with 500 failure, and verify rollback.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 10: Optimistic rollback", async ({ page }) => {
  // TODO: Intercept POST /api/lab/network/items and return 500
  // TODO: Enter title and click 'Add Item Optimistically'
  // TODO: Assert item appears with 'Pending Server...' badge
  // TODO: Assert item disappears and rollback error alert appears
});`,
      task: "Intercept POST /api/lab/network/items with status 500, add item, assert instant appearance, and assert subsequent rollback.",
      acceptanceCriteria: [
        "POST route returns 500 status.",
        "Item initially rendered with pending indicator.",
        "Item detaches and error alert renders upon server rejection."
      ],
      expectedBehavior: "UI displays optimistic item immediately, then cleanly rolls back when server rejects mutation.",
      hint: "Check route.request().method() === 'POST' and fulfill with status 500.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 10: Test optimistic-update rollback", async ({ page }) => {
  await page.goto("/lab/network");

  await page.route("**/api/lab/network/items", async (route) => {
    if (route.request().method() === "POST") {
      await new Promise((r) => setTimeout(r, 100));
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Failed to persist item" }),
      });
    } else {
      await route.continue();
    }
  });

  const input = page.getByPlaceholder("e.g. Distributed Trace Collector");
  const addBtn = page.getByRole("button", { name: "Add Item Optimistically" });

  await input.fill("Optimistic Rollback Candidate");
  await addBtn.click();

  await expect(page.getByText("Optimistic Rollback Candidate")).toBeVisible();
  await expect(page.getByText("Pending Server...")).toBeVisible();

  await expect(page.getByText("Optimistic Rollback Candidate")).not.toBeVisible({ timeout: 5000 });
  await expect(page.getByText(/Rollback executed: mutation failed/)).toBeVisible();
});`,
      troubleshootingNotes: "Always check route.request().method() so you do not accidentally intercept initial GET requests.",
      command: "pnpm exec playwright test e2e/practice-network.spec.ts -g 'Exercise 10'"
    },
    {
      id: "ex11-diagnose-overlapping-handlers",
      title: "Exercise 11: Diagnose Overlapping Route Handlers and LIFO Precedence",
      objective: "Register multiple route handlers for the same URL pattern, demonstrate LIFO execution order, and use route.fallback().",
      prerequisites: [
        "LIFO routing execution order",
        "route.fallback() cascading"
      ],
      scenario: "Register Handler 1 then Handler 2; show that Handler 2 executes first and falls back to Handler 1.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 11: Overlapping handlers", async ({ page }) => {
  // TODO: Register first handler (Handler 1)
  // TODO: Register second handler (Handler 2) with route.fallback()
  // TODO: Verify Handler 2 runs first and Handler 1 fulfills response
});`,
      task: "Register two handlers for **/api/lab/network/items*, use route.fallback() in second handler, and assert LIFO execution order.",
      acceptanceCriteria: [
        "Handler 2 executes before Handler 1.",
        "route.fallback() passes control to Handler 1.",
        "Execution order array matches ['second-handler', 'first-handler']."
      ],
      expectedBehavior: "Playwright executes most recently registered handler first, cascading down via fallback().",
      hint: "Call await route.fallback() inside the second registered handler to trigger the first handler.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 11: Diagnose overlapping route handlers", async ({ page }) => {
  const executionOrder: string[] = [];

  await page.route("**/api/lab/network/items*", async (route) => {
    if (route.request().url().includes("?q=")) {
      await route.continue();
      return;
    }
    executionOrder.push("first-handler");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [{ id: "H1", title: "Handler 1 Response", category: "routing", latencyMs: 1, timestamp: new Date().toISOString() }],
        total: 1,
        latencyApplied: 1,
      }),
    });
  });

  await page.route("**/api/lab/network/items*", async (route) => {
    if (route.request().url().includes("?q=")) {
      await route.continue();
      return;
    }
    executionOrder.push("second-handler");
    await route.fallback();
  });

  await page.goto("/lab/network");
  await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

  await expect(page.getByText("Handler 1 Response")).toBeVisible();
  expect(executionOrder).toEqual(["second-handler", "first-handler"]);
});`,
      troubleshootingNotes: "Remember that Playwright routes run in reverse registration order (LIFO).",
      command: "pnpm exec playwright test e2e/practice-network.spec.ts -g 'Exercise 11'"
    },
    {
      id: "ex12-senior-network-challenge",
      title: "Exercise 12: Complete a Senior-Level Network Debugging and Restoration Challenge",
      objective: "Execute a full multi-step workflow: attach mock, verify UI rendering, dynamically unroute, and verify live backend restoration.",
      prerequisites: [
        "Dynamic page.unroute()",
        "Live backend verification"
      ],
      scenario: "Mock telemetry items, assert UI renders mock, unroute handler, and assert live backend data is restored upon re-fetch.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 12: Senior network challenge", async ({ page }) => {
  // TODO: Define named mock handler
  // TODO: Attach via page.route()
  // TODO: Fetch and verify mock telemetry item renders
  // TODO: Remove route via page.unroute()
  // TODO: Fetch again and verify live database records appear
});`,
      task: "Attach named route handler, verify mock rendering, call page.unroute(), re-fetch, and assert live backend data appears.",
      acceptanceCriteria: [
        "Initial fetch displays mock item 'Senior Orchestration Telemetry'.",
        "page.unroute() cleanly detaches route handler.",
        "Subsequent fetch displays live backend item 'Cluster Snapshot Ingestion'."
      ],
      expectedBehavior: "Demonstrates complete lifecycle: mock interception for isolated tests followed by unrouting to restore live backend.",
      hint: "Pass the identical handler function reference to page.unroute('**/api/lab/network/items*', mockHandler).",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 12: Complete a senior-level network-debugging challenge", async ({ page }) => {
  await page.goto("/lab/network");

  const mockTelemetry = async (route: Parameters<Parameters<typeof page.route>[1]>[0]) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [
          {
            id: "SENIOR-01",
            title: "Senior Orchestration Telemetry",
            category: "architecture",
            latencyMs: 5,
            timestamp: new Date().toISOString(),
          },
        ],
        total: 1,
        latencyApplied: 5,
      }),
    });
  };

  await page.route("**/api/lab/network/items*", mockTelemetry);
  await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

  await expect(page.getByTestId("telemetry-list").getByText("Senior Orchestration Telemetry")).toBeVisible();

  await page.unroute("**/api/lab/network/items*", mockTelemetry);

  await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();
  await expect(page.getByTestId("telemetry-list").getByText("Cluster Snapshot Ingestion")).toBeVisible();
});`,
      troubleshootingNotes: "Passing the specific handler function to unroute ensures you do not accidentally remove unrelated route handlers.",
      command: "pnpm exec playwright test e2e/practice-network.spec.ts -g 'Exercise 12'"
    }
  ],
  knowledgeCheck: [
    {
      id: "kc-route-registration-timing",
      topic: "Registration Lifecycle",
      question: "Why must 'page.route()' be registered and awaited BEFORE triggering the user action that initiates an HTTP request?",
      options: [
        "Playwright crashes if routes are defined before user actions.",
        "Network requests are asynchronous; if the user action executes first, the request packet is already in-flight over the wire before the interception handler can register.",
        "page.route() automatically reloads the browser page when called.",
        "There is no difference; Playwright can travel back in time to intercept past requests."
      ],
      correctOptionIndex: 1,
      explanation: "Network handlers must be established before the network request is initiated. If you click before registering the route, the real request is already in-flight over the wire."
    },
    {
      id: "kc-route-lifo-order",
      topic: "Routing Priority & Precedence",
      question: "When two route handlers match the same URL pattern, in what order does Playwright evaluate them?",
      options: [
        "Alphabetical order based on handler function names.",
        "Last-In, First-Out (LIFO) order: the most recently registered handler executes first.",
        "First-In, First-Out (FIFO) order: the earliest registered handler always wins.",
        "Random non-deterministic order depending on CPU thread scheduling."
      ],
      correctOptionIndex: 1,
      explanation: "Playwright evaluates route handlers in reverse registration order (LIFO). The latest registered handler runs first, allowing specific test cases to override global handlers."
    },
    {
      id: "kc-route-continue-vs-fallback",
      topic: "Routing Control Flow",
      question: "What is the key architectural difference between calling 'route.continue()' versus 'route.fallback()' inside an interception handler?",
      options: [
        "'route.continue()' is for GET requests; 'route.fallback()' is for POST requests.",
        "'route.continue()' forwards the request across the network to the live server; 'route.fallback()' delegates the request to the next matching Playwright route handler in the queue.",
        "'route.fallback()' aborts the request immediately with an error.",
        "They are exact aliases with identical behavior."
      ],
      correctOptionIndex: 1,
      explanation: "route.continue() sends the request out across the network to the remote server. route.fallback() cascades control to the next registered route handler in Playwright's local LIFO handler stack."
    },
    {
      id: "kc-route-fetch-benefits",
      topic: "Hybrid Response Augmentation",
      question: "Why is 'route.fetch()' considered superior to static mock files when testing realistic data transformations?",
      options: [
        "Because route.fetch() disables CORS security checks.",
        "route.fetch() calls the genuine live backend, allowing tests to inspect authentic server data, mutate specific fields, and return realistic payloads without mock drift.",
        "Because route.fetch() does not require async/await.",
        "Static mock files are deprecated in Playwright."
      ],
      correctOptionIndex: 1,
      explanation: "route.fetch() enables hybrid testing: you execute the real backend endpoint, obtain genuine response structures and headers, and modify only the specific attributes needed for the test case."
    },
    {
      id: "kc-route-abort-semantics",
      topic: "Connection Failure Simulation",
      question: "How does calling 'route.abort('failed')' differ from calling 'route.fulfill({ status: 500 })'?",
      options: [
        "They both produce identical HTTP 500 status codes in the browser.",
        "route.abort() drops the network socket, causing window.fetch() to reject with a network TypeError; route.fulfill(500) completes the HTTP transaction with a server error response.",
        "route.abort() only works in Chromium.",
        "route.fulfill(500) causes the Node.js test process to terminate."
      ],
      correctOptionIndex: 1,
      explanation: "route.abort() simulates transport-level connection failures (offline, dropped Wi-Fi, DNS crash), causing fetch promises to reject. route.fulfill({ status: 500 }) is an HTTP-level server error response."
    },
    {
      id: "kc-glob-pattern-query-strings",
      topic: "Pattern Matching Architecture",
      question: "Why will the glob pattern '**/api/lab/network/items' fail to intercept requests like '/api/lab/network/items?q=telemetry&page=1'?",
      options: [
        "Because Playwright does not support query parameters.",
        "The glob without a trailing wildcard strictly terminates at the path end; query parameters append characters after 'items', requiring '**/api/lab/network/items*' to match.",
        "Because globs are case-sensitive on Linux only.",
        "Because query parameters are stripped by the browser before dispatch."
      ],
      correctOptionIndex: 1,
      explanation: "Glob patterns match the entire URL string including query strings. Without a trailing wildcard asterisk (*), characters following 'items' cause the pattern matching to fail."
    },
    {
      id: "kc-page-vs-context-routing",
      topic: "Scope & Isolation",
      question: "When should an SDET register routes using 'browserContext.route()' instead of 'page.route()'?",
      options: [
        "Never; browserContext.route() is an anti-pattern.",
        "When routing rules must apply universally across all tabs, popups, and workers (e.g. blocking third-party tracking scripts or setting global CDN mocks).",
        "Only when testing WebSockets.",
        "When running tests on Safari WebKit only."
      ],
      correctOptionIndex: 1,
      explanation: "browserContext.route() applies across all pages, popups, and worker threads created in that context. page.route() is strictly isolated to that specific page tab."
    },
    {
      id: "kc-race-condition-mitigation",
      topic: "Race Conditions & State",
      question: "How do modern client applications prevent slow, superseded API requests from overwriting newer search results?",
      options: [
        "By disabling all HTTP requests after the first keystroke.",
        "By passing an AbortController signal to window.fetch() and calling controller.abort() when a subsequent search query is initiated.",
        "By setting artificial sleep timers in React components.",
        "By storing search results in cookies."
      ],
      correctOptionIndex: 1,
      explanation: "Client applications use AbortController to cancel previous in-flight requests when new queries are dispatched, ensuring stale responses never overwrite current search state."
    },
    {
      id: "kc-over-mocking-risk",
      topic: "Architecture & Test Strategy",
      question: "What is the primary risk of relying exclusively on mocked network responses across an entire test suite?",
      options: [
        "Mocked tests run too fast for CI servers to track.",
        "Mock Drift: tests continue passing against static mocks while real backend APIs evolve, break contracts, or fail database constraints, concealing critical production bugs.",
        "Playwright imposes a limit of 10 mock handlers per test suite.",
        "Browsers consume twice as much RAM when network routes are intercepted."
      ],
      correctOptionIndex: 1,
      explanation: "Over-mocking creates false confidence. When real backend endpoints change schemas or validation constraints, mocked tests remain green while real production users experience broken applications."
    }
  ],
  practiceTask: {
    labRoute: "/lab/network",
    labName: "Scenario Controls & Network Lab",
    objective: "Intercept telemetry records, inject synthetic latency, and assert client loading and error boundaries.",
    instructions: [
      "Navigate to /lab/network.",
      "Register page.route() for **/api/lab/network/items* and inject 600ms latency.",
      "Click 'Fetch Telemetry Records'.",
      "Assert loading message appears, followed by successful list rendering."
    ],
    acceptanceCriteria: [
      "Route handler intercepts requests before fetch.",
      "Loading message verified while request is in flight.",
      "Telemetry list asserted with mock item."
    ],
    hint: "Use await new Promise(r => setTimeout(r, 600)); inside page.route() handler before route.fulfill().",
    solutionCode: `import { test, expect } from "@playwright/test";

test("simulates delayed telemetry and validates loading state", async ({ page }) => {
  await page.route("**/api/lab/network/items*", async (route) => {
    await new Promise((res) => setTimeout(res, 600));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [{ id: "LAT-01", title: "Delayed Synthetic Item", category: "telemetry", latencyMs: 600, timestamp: new Date().toISOString() }],
        total: 1,
        latencyApplied: 600,
      }),
    });
  });

  await page.goto("/lab/network");
  await page.getByRole("button", { name: "Fetch Telemetry Records" }).click();

  const loading = page.getByText("Waiting for Express backend response...");
  await expect(loading).toBeVisible();

  const list = page.getByTestId("telemetry-list");
  await expect(list).toBeVisible();
  await expect(loading).not.toBeVisible();
  await expect(list.getByText("Delayed Synthetic Item")).toBeVisible();
});`,
    playwrightCommand: "pnpm exec playwright test e2e/practice-network.spec.ts -g 'Exercise 5'"
  },
  interviewQuestions: [
    {
      question: "How do you decide between network mocking with page.route() versus end-to-end testing with a real backend database?",
      answer: "Senior SDETs implement a hybrid test strategy based on risk and execution economics. We use network mocking with page.route() for: 1) Negative edge cases and catastrophic outages (500, 503, 504) that cannot be reliably triggered on live backends; 2) Third-party dependency isolation (payment gateways, SMS providers) to prevent flaky external outages; 3) Front-end component state permutations (empty states, massive collections, pagination boundaries). Conversely, we reserve un-mocked live backend testing for critical customer checkout paths, authentication persistence, and database schema validation to ensure true end-to-end confidence.",
      architecturalContext: "Balances fast feedback in PR pipelines (sub-second mocked UI tests) with high-confidence nightly regression tests against live databases."
    },
    {
      question: "Explain Playwright's route matching order (LIFO) and how you design layered routing architecture in complex test frameworks.",
      answer: "Playwright evaluates route handlers in reverse registration order: Last-In, First-Out (LIFO). The handler registered most recently executes first. In enterprise test frameworks, we leverage this architecture by establishing global default handlers at the browserContext level (e.g. blocking third-party telemetry or mocking standard user profiles), and allowing individual test cases to register specific page.route() handlers that take precedence. If a test handler determines it should not handle a specific request, it invokes 'await route.fallback()' to cascade control down to earlier handlers.",
      architecturalContext: "Enables composable, DRY test architecture where suites share baseline network rules while individual tests override specific endpoints."
    },
    {
      question: "How do you mitigate autocomplete search race conditions in single-page applications, and how do you test this deterministically in Playwright?",
      answer: "Race conditions occur when asynchronous requests return out of order. If a user types 'slow' then 'fast', and 'slow' takes 800ms while 'fast' takes 50ms, 'slow' resolves last and overwrites the newer search results. In client code, this is mitigated by attaching an AbortController to window.fetch() and calling controller.abort() when subsequent queries are initiated. In Playwright, we test this deterministically by registering a route handler that artificially delays the 'slow' query by 400ms while allowing the 'fast' query to resolve in 50ms. We then assert that the search UI displays the fast query results and is not overwritten by stale slow data.",
      architecturalContext: "Eliminates subtle customer-facing data corruption in search, filtering, and tabbed dashboards."
    },
    {
      question: "What is the function of route.fetch() and how does it prevent mock drift compared to static JSON fixtures?",
      answer: "Mock drift occurs when test suites pass against static JSON fixtures while real backend APIs have evolved their response schemas. Playwright's route.fetch() solves this by executing the real HTTP request against the live backend out-of-band. The test captures authentic, live server headers and JSON structures, selectively mutates or augments the required test attributes (e.g. injecting a specific flag), and fulfills the modified response to the browser. If the backend breaks or deprecates a core contract, route.fetch() immediately exposes the issue rather than masking it with stale mock data.",
      architecturalContext: "Provides the determinism of mock fulfillment while maintaining active verification of upstream backend service contracts."
    }
  ]
};
