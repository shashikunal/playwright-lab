import type { Lesson } from "../types";

export const apiTestingLesson: Lesson = {
  id: "playwright-api-testing",
  moduleSlug: "network-and-api",
  moduleTitle: "REST API Testing & Network Automation",
  title: "Playwright API Testing — Beginner to Advanced",
  difficulty: "Intermediate",
  durationMinutes: 45,
  prerequisites: [
    "playwright-introduction",
    "configuration-and-browsers",
    "playwright-locators",
    "playwright-assertions",
    "playwright-actions",
    "playwright-forms",
    "playwright-browser-contexts"
  ],
  summary: "Master direct HTTP service automation using Playwright's high-performance APIRequestContext. Learn REST methods, headers, payload serialization, CRUD test patterns, Bearer authentication, schema verification, negative resilience testing, and sub-50ms hybrid API/UI test architecture.",
  sections: [
    {
      id: "api-testing-fundamentals",
      title: "Part A — API Testing Fundamentals & The Modern Test Pyramid",
      content: `Modern software architectures decouple client applications (React, mobile apps) from microservices and RESTful API backends. Testing software exclusively through the browser UI is an anti-pattern that inflates test execution runtimes and introduces unnecessary flakiness.
      
1. What API Testing Verifies:
API testing validates the core business logic, contracts, security rules, and data persistence of your backend services independently of the graphical user interface:
- Protocol Compliance: Accurate HTTP status codes (2xx, 3xx, 4xx, 5xx) and RFC-compliant response headers.
- Schema Integrity: Validating JSON contracts, mandatory properties, and strict data typing (strings, integers, booleans, timestamps).
- Business Rules: Data transformations, calculated values, and state machine transitions.
- Security Boundaries: Authentication enforcement (401), role-based permissions (403), and secret token hygiene.
- Error Handling & Resilience: Negative payloads, malformed bodies (400/422), rate limiting (429), and simulated gateway timeouts (504).

2. HTTP Methods & Idempotency:
- GET (Idempotent & Safe): Fetches resources without mutating state. Safe to retry automatically without side effects.
- POST (Non-Idempotent): Submits state to create new resources. Re-dispatching an identical POST may produce duplicate records or unique constraint errors.
- PUT (Idempotent): Replaces an entire resource at a target URI. Executing identical PUT requests multiple times yields identical server state.
- PATCH (Non-Idempotent / Conditionally Idempotent): Modifies a partial delta of fields on an existing resource.
- DELETE (Idempotent): Removes the resource. Deleting an existing resource succeeds; repeating the DELETE should return 404 or indicate the entity no longer exists.

3. The Industrial Test Pyramid: API vs. Browser UI Automation:
- Execution Speed: An API test executes in 5ms to 50ms over persistent TCP/HTTP connections. A full browser test requires 1,000ms to 5,000ms to launch contexts, render DOM trees, download assets, and wait for CSS stability.
- Diagnostic Clarity: API assertion failures pinpoint the exact contract breakdown (e.g. status 422 with validation errors) rather than vague UI symptoms like 'element not visible'.
- Strategic Positioning: Use API tests for exhaustive business logic, negative permutations, boundary testing, and data setup. Reserve full browser UI tests for critical user journeys and visual interactions.`
    },
    {
      id: "apirequestcontext-architecture",
      title: "Part B — The Playwright APIRequestContext Architecture",
      content: `Playwright is not merely a browser automation driver; it is a full-featured, enterprise-grade test automation platform with built-in, native HTTP request capabilities powered by the 'APIRequestContext' interface.

1. The Built-in 'request' Fixture:
When your test declares 'async ({ request }) => { ... }', Playwright automatically instantiates a dedicated, thread-safe 'APIRequestContext'.
Key characteristics:
- Operates entirely inside the Node.js runtime process—zero browser engine (Chromium/Firefox/WebKit) overhead.
- Automatically inherits the global 'baseURL' configured in 'playwright.config.ts' (e.g. 'http://127.0.0.1:3001').
- Disposes of connection pools and active sockets cleanly when the test boundary completes.

2. Three Context Variations:
- Built-in 'request' fixture: The default choice for pure API testing and backend service audits.
- 'playwright.request.newContext(options)': Standalone API context creation. Essential when configuring bespoke headers, authentication states, or custom base URLs independently of the test runner defaults.
- 'page.request': Bound directly to the active 'BrowserContext' of that page. Crucial for hybrid tests where you want API requests to automatically share the browser's cookies, session storage, and origin credentials.

3. Complete APIRequestContext Method Suite:
Playwright exposes direct HTTP verb methods on the context:
- 'await request.get(url, options)': Executes an HTTP GET request.
- 'await request.post(url, options)': Executes an HTTP POST request.
- 'await request.put(url, options)': Executes an HTTP PUT request.
- 'await request.patch(url, options)': Executes an HTTP PATCH request.
- 'await request.delete(url, options)': Executes an HTTP DELETE request.

4. Request Options: Payloads, Headers & Queries:
- 'headers': Dictionary of custom HTTP headers ('Authorization', 'Accept', 'x-worker-namespace').
- 'params': Object or query string serialized automatically into URL parameters ('{ page: 1, limit: 10 }').
- 'data': JSON object or string. When an object is passed, Playwright automatically serializes it to JSON and attaches 'Content-Type: application/json'.
- 'form': Key-value dictionary encoded as 'application/x-www-form-urlencoded'.
- 'multipart': File streams and form fields encoded as 'multipart/form-data'.
- 'timeout': Bounded timeout for the specific network call (default: 30,000ms).

5. Response Inspection Interface:
The returned 'APIResponse' handle provides comprehensive diagnostic methods:
- 'response.status()': Returns the numerical HTTP status code (e.g. 200, 201, 401, 404).
- 'response.ok()': Boolean shorthand returning true if status is in the 200–299 range.
- 'response.statusText()': Returns the standard HTTP status reason string (e.g. 'OK', 'Created', 'Not Found').
- 'response.headers()': Returns all received response headers as a normalized lowercase key-value map.
- 'response.json()': Asynchronously parses the response body as JSON.
- 'response.text()': Returns the raw response body as a UTF-8 string.
- 'response.body()': Returns raw binary Buffer (ideal for image or file download verification).`
    },
    {
      id: "response-assertions-and-schemas",
      title: "Part C — Response Assertions, Status Codes & Schema Validation",
      content: `Effective API testing goes beyond verifying 'response.status() === 200'. Senior SDETs enforce comprehensive contract verification covering headers, schema structures, mandatory properties, and actionable failure messages.

1. Web-First Status & Header Assertions:
Always assert both status codes and security headers:
\`\`\`typescript
const response = await request.get("/api/app/courses");
expect(response.status()).toBe(200);
expect(response.ok()).toBe(true);

const headers = response.headers();
expect(headers["content-type"]).toContain("application/json");
expect(headers["x-content-type-options"]).toBe("nosniff");
\`\`\`

2. JSON Body Validation Strategies:
Playwright's 'expect()' matchers support multiple tiers of JSON validation:
- Exact Value Matching: 'expect(data).toEqual({ status: "ok" })' verifies exact key and value symmetry.
- Partial Shape Matching: 'expect(data).toMatchObject({ role: "admin" })' asserts target keys exist without failing on unexpected extra fields.
- Array & Collection Assertions: 'expect(Array.isArray(data.courses)).toBe(true)' and 'expect(data.courses.length).toBeGreaterThan(0)'.
- Type Verifications: 'expect(typeof data.id).toBe("string")' and 'expect(data.price).toBeGreaterThan(0)'.

3. Diagnostic Logging on Assertion Failure:
When an API assertion fails in CI, vague errors like 'expected 200 but received 500' leave developers guessing. Always format diagnostic failure messages incorporating the response body:
\`\`\`typescript
const response = await request.post("/api/app/courses", { data: payload });
if (!response.ok()) {
  const errorText = await response.text();
  console.error(\`API Failure [\${response.status()}] \${response.url()}: \${errorText}\`);
}
expect(response.status(), \`Expected 201 Created but received \${response.status()}\`).toBe(201);
\`\`\`

4. Contract & Runtime Schema Validation:
In enterprise pipelines, integrate runtime schema validators like Zod or AJV:
\`\`\`typescript
import { z } from "zod";

const CourseSchema = z.object({
  id: z.string().startsWith("crs_"),
  title: z.string().min(3),
  price: z.number().positive(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
});

const body = await response.json();
const validated = CourseSchema.parse(body.course); // Throws descriptive ZodError if contract breaks
\`\`\``
    },
    {
      id: "crud-automation-and-data-lifecycles",
      title: "Part D — Complete CRUD Automation & Test Data Lifecycles",
      content: `CRUD (Create, Read, Update, Delete) workflows represent the foundation of relational and document-backed web services. Automating CRUD sequences requires strict test independence and zero database contamination.

1. The Industrial CRUD Lifecycle:
- Step 1: Create (POST): Dispatch payload with unique attributes. Capture generated identifier (e.g. 'course.id') and assert 201 Created.
- Step 2: Read (GET): Fetch entity by captured ID and verify persistence and attribute accuracy (200 OK).
- Step 3: Update (PUT / PATCH): Mutate entity state and assert updated fields (200 OK).
- Step 4: Delete (DELETE): Remove the entity and assert deletion confirmation (200 OK).
- Step 5: Verify Deletion (GET): Fetching the deleted resource must return 404 Not Found.

2. The Golden Rule of Test Data Independence:
Tests must NEVER depend on execution order or assume pre-existing database records.
- Anti-Pattern: Test B expects the user created by Test A to exist. If Test A fails or runs in a different worker thread, Test B crashes.
- Senior Pattern: Every test provisions its own unique data with randomized identifiers and guarantees cleanup in a 'finally' block or custom fixture teardown.

3. Query Parameters, Pagination & Filtering:
Testing list endpoints requires asserting query parameter resolution:
\`\`\`typescript
const response = await request.get("/api/app/users", {
  params: {
    page: "1",
    limit: "5",
    role: "learner",
    sort: "name",
    order: "asc",
  },
});
const data = await response.json();
expect(data.page).toBe(1);
expect(data.users.length).toBeLessThanOrEqual(5);
for (const user of data.users) {
  expect(user.role).toBe("learner");
}
\`\`\``
    },
    {
      id: "authentication-and-rbac",
      title: "Part E — Authentication, Bearer Tokens & Role-Based Access Control",
      content: `Securing web APIs relies on cryptographic tokens and role-based permissions. Automated API tests must verify both positive authentication flows and defensive perimeter rejections.

1. Bearer Token Authentication:
Modern REST APIs exchange credentials for a session token or JWT via an authentication endpoint. Subsequent requests pass the token in the HTTP Authorization header:
\`\`\`typescript
// 1. Authenticate via API
const loginRes = await request.post("/api/app/auth/login", {
  data: { email: "admin@industrial.lab", password: "AdminPass123!" },
});
expect(loginRes.status()).toBe(200);
const { profile } = await loginRes.json();
const token = profile.token;

// 2. Dispatch authorized request
const authRes = await request.get("/api/app/auth/me", {
  headers: {
    Authorization: \`Bearer \${token}\`,
  },
});
expect(authRes.status()).toBe(200);
\`\`\`

2. Role-Based Access Control (RBAC) Permutations:
Verify that your API enforces the Principle of Least Privilege:
- Unauthenticated (Missing/Invalid Token): Must be rejected with 401 Unauthorized.
- Unauthorized Role (Forbidden Action): A valid user with insufficient permissions (e.g. a 'learner' attempting to create a course or a 'trainer' attempting to delete) must be rejected with 403 Forbidden.
- Authorized Role: User with required privileges ('admin') executes the operation successfully.

3. Credential Security in Automation:
- Environment Variables: Never hardcode passwords or production API keys in test code. Read from 'process.env.TEST_API_KEY'.
- Report Sanitization: Mask sensitive tokens in logs to prevent leaking bearer credentials into CI artifact archives.`
    },
    {
      id: "negative-and-resilience-testing",
      title: "Part F — Negative Scenarios, HTTP Error Semantics & Resilience Testing",
      content: `A reliable test suite tests how systems behave when things go wrong just as rigorously as when they go right. Negative API testing validates defensive error handling and HTTP status accuracy.

1. HTTP Error Code Semantic Matrix:
- 400 Bad Request: Missing required top-level attributes, malformed JSON syntax, or unsupported query options.
- 401 Unauthorized: Missing, expired, or malformed authentication bearer token.
- 403 Forbidden: Authenticated user lacks the requisite role or security scope for this resource.
- 404 Not Found: Target resource ID does not exist in the database.
- 409 Conflict: State collision, such as attempting to register a course code or email that already exists.
- 422 Unprocessable Entity: Syntactically valid JSON payload that violates semantic business rules (e.g. email without '@', seats < 1 or > 12).
- 429 Too Many Requests: Rate limiting thresholds exceeded.
- 500 / 504 Gateway Outage: Simulated server crash or backend upstream timeout.

2. Asserting Structured Error Details:
Production APIs return structured error payloads. Assert on the error code, human-readable message, and specific field validation errors:
\`\`\`typescript
const res = await request.post("/api/lab/forms/intake", {
  data: { fullName: "A", email: "bad-email", seats: 50 },
});
expect(res.status()).toBe(422);
const body = await res.json();
expect(body.error.code).toBe("validation_error");
expect(body.error.details).toEqual(
  expect.arrayContaining([
    expect.objectContaining({ field: "fullName" }),
    expect.objectContaining({ field: "email" }),
    expect.objectContaining({ field: "seats" }),
  ])
);
\`\`\``
    },
    {
      id: "hybrid-api-and-ui-integration",
      title: "Part G — Hybrid API & UI Integration Workflows",
      content: `The ultimate superpower of Playwright is its unified architecture: a single test script can seamlessly combine high-speed 'request' calls with browser 'page' interactions in the same execution context.

1. Sub-50ms API Data Seeding for UI Tests:
In traditional automation, navigating to a form, typing inputs, and submitting takes 3 to 5 seconds just to prepare test preconditions. In Playwright, execute an API call in 30ms to create the entity, then navigate directly to the browser UI to assert customer presentation:
\`\`\`typescript
test("hybrid API seed and UI verification", async ({ request, page }) => {
  // 1. Instant API seed (<30ms)
  const res = await request.post("/api/app/courses", {
    headers: { Authorization: "Bearer tok_admin_session" },
    data: { code: "HYB-101", title: "Hybrid API Course", price: 299 },
  });
  const { course } = await res.json();

  try {
    // 2. Direct UI assertion in browser
    await page.goto("/app/courses");
    await expect(page.getByText("Hybrid API Course")).toBeVisible();
    await expect(page.getByText("HYB-101")).toBeVisible();
  } finally {
    // 3. Guaranteed API teardown
    await request.delete(\`/api/app/courses/\${course.id}\`, {
      headers: { Authorization: "Bearer tok_admin_session" },
    });
  }
});
\`\`\`

2. UI Action with Backend API Auditing:
Conversely, trigger a complex transaction through the browser UI (such as completing a multi-step checkout wizard), and assert the database state directly using 'request.get()' rather than waiting for multiple UI pages to update.

3. Fast Authentication State Injection:
Bypass redundant UI login forms by calling the authentication API via 'request.post()', extracting the token, and injecting it directly into the browser's 'localStorage' or 'BrowserContext' cookies before page navigation.`
    },
    {
      id: "advanced-api-automation-patterns",
      title: "Part H — Advanced API Automation: Custom Fixtures, Concurrency & CI Hygiene",
      content: `Scaling an enterprise API test suite to thousands of tests requires robust architectural patterns: custom test fixtures, parallel-safe execution namespaces, and telemetry hygiene.

1. Reusable API Fixtures with Automatic Teardown:
Encapsulate entity creation and cleanup into composable Playwright fixtures using 'test.extend()':
\`\`\`typescript
export const test = baseTest.extend<{
  authenticatedClient: APIRequestContext;
  courseFactory: (data: Partial<Course>) => Promise<Course>;
}>({
  authenticatedClient: async ({}, use) => {
    const context = await request.newContext({
      baseURL: "http://127.0.0.1:3001",
      extraHTTPHeaders: { Authorization: "Bearer tok_admin_session" },
    });
    await use(context);
    await context.dispose();
  },
  courseFactory: async ({ authenticatedClient }, use) => {
    const createdIds: string[] = [];
    const factory = async (data: Partial<Course>) => {
      const res = await authenticatedClient.post("/api/app/courses", { data });
      const { course } = await res.json();
      createdIds.push(course.id);
      return course;
    };
    await use(factory);
    // Automatic cleanup of all provisioned entities
    for (const id of createdIds) {
      await authenticatedClient.delete(\`/api/app/courses/\${id}\`).catch(() => {});
    }
  },
});
\`\`\`

2. Parallel-Safe Concurrency & Worker Namespaces:
When running 10 parallel test workers against a live Express backend, tests executing CRUD operations simultaneously can collide on static IDs.
- Use unique timestamps and worker index prefixes: \`course_\${test.info().workerIndex}_\${Date.now()}\`.
- Pass custom headers like 'x-worker-namespace' so backends can partition in-memory or database state per worker.

3. Response Latency Tracking Without Flaky Assertions:
Measuring API performance is valuable for telemetry, but asserting 'expect(duration).toBeLessThan(100)' leads to flaky CI builds due to CPU throttling. Track duration for logging or export to monitoring dashboards, but keep test correctness focused on status codes and contracts.`
    }
  ],
  codeExamples: [
    {
      id: "example-get-post-basics",
      caption: "Basic HTTP GET & POST Requests with Status and Payload Verification",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("sends GET and POST requests with APIRequestContext", async ({ request }) => {
  // 1. Dispatch GET request to service health endpoint
  const healthRes = await request.get("/api/health");
  expect(healthRes.status()).toBe(200);
  expect(healthRes.ok()).toBe(true);

  const healthBody = await healthRes.json();
  expect(healthBody).toEqual({
    status: "ok",
    service: "playwright-industrial-lab",
    store: "memory",
  });

  // 2. Dispatch POST request with JSON payload
  const intakeRes = await request.post("/api/lab/forms/intake", {
    data: {
      fullName: "Ada Lovelace",
      email: "ada.lovelace@industrial.lab",
      seats: 3,
      startDate: "2026-11-01",
      track: "api",
      agree: true,
    },
  });
  expect(intakeRes.status()).toBe(200);
  const intakeBody = await intakeRes.json();
  expect(intakeBody.status).toBe("accepted");
  expect(typeof intakeBody.id).toBe("string");
});`,
      lineExplanations: [
        { line: 5, explanation: "request.get() sends HTTP GET using global baseURL configured in playwright.config.ts." },
        { line: 6, explanation: "response.status() returns numerical HTTP status code (200)." },
        { line: 9, explanation: "response.json() asynchronously deserializes JSON body into typed JavaScript object." },
        { line: 17, explanation: "request.post() automatically serializes 'data' object and sets Content-Type: application/json." },
        { line: 29, explanation: "Validates accepted confirmation ID returned by the backend service." }
      ]
    },
    {
      id: "example-crud-lifecycle",
      caption: "Complete CRUD Workflow with Isolated Test Data and Cleanup",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("executes end-to-end CRUD workflow with cleanup", async ({ request }) => {
  const authHeaders = { Authorization: "Bearer tok_admin_session" };
  const timestamp = Date.now();
  const courseCode = \`CRUD-\${timestamp.toString().slice(-4)}\`;

  // 1. Create (POST)
  const createRes = await request.post("/api/app/courses", {
    headers: authHeaders,
    data: {
      code: courseCode,
      title: \`CRUD Masterclass \${timestamp}\`,
      category: "API Testing",
      difficulty: "intermediate",
      seats: 20,
      price: 299,
    },
  });
  expect(createRes.status()).toBe(201);
  const { course } = await createRes.json();

  try {
    // 2. Read (GET)
    const readRes = await request.get(\`/api/app/courses/\${course.id}\`);
    expect(readRes.status()).toBe(200);
    const { course: fetched } = await readRes.json();
    expect(fetched.code).toBe(courseCode);

    // 3. Update (PUT)
    const updateRes = await request.put(\`/api/app/courses/\${course.id}\`, {
      headers: authHeaders,
      data: { title: \`CRUD Masterclass (Updated) \${timestamp}\`, price: 349 },
    });
    expect(updateRes.status()).toBe(200);

    // 4. Delete (DELETE)
    const deleteRes = await request.delete(\`/api/app/courses/\${course.id}\`, {
      headers: authHeaders,
    });
    expect(deleteRes.status()).toBe(200);

    // 5. Verify Deletion (GET -> 404)
    const verifyRes = await request.get(\`/api/app/courses/\${course.id}\`);
    expect(verifyRes.status()).toBe(404);
  } finally {
    await request.delete(\`/api/app/courses/\${course.id}\`, {
      headers: authHeaders,
    }).catch(() => {});
  }
});`,
      lineExplanations: [
        { line: 8, explanation: "POST creates new entity with unique timestamped code to avoid collision." },
        { line: 20, explanation: "Captures generated course.id from 201 response for subsequent operations." },
        { line: 25, explanation: "GET retrieves the newly created course by dynamic ID." },
        { line: 31, explanation: "PUT mutates course title and price, asserting 200 OK update status." },
        { line: 39, explanation: "DELETE removes resource; subsequent GET confirms 404 Not Found." },
        { line: 47, explanation: "finally block guarantees teardown even if middle assertions fail." }
      ]
    },
    {
      id: "example-bearer-auth-me",
      caption: "Authentication Flow: Login, Bearer Token Injection & Protected Endpoint",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("authenticates and queries protected user profile", async ({ request }) => {
  // 1. Authenticate with credentials
  const loginRes = await request.post("/api/app/auth/login", {
    data: {
      email: "admin@industrial.lab",
      password: "AdminPass123!",
    },
  });
  expect(loginRes.status()).toBe(200);
  const { profile } = await loginRes.json();
  expect(profile.token).toBeDefined();

  // 2. Query protected /me endpoint with Bearer header
  const meRes = await request.get("/api/app/auth/me", {
    headers: {
      Authorization: \`Bearer \${profile.token}\`,
    },
  });
  expect(meRes.status()).toBe(200);
  const meBody = await meRes.json();
  expect(meBody.profile.email).toBe("admin@industrial.lab");
  expect(meBody.profile.role).toBe("admin");

  // 3. Verify unauthenticated access fails with 401
  const unauthRes = await request.get("/api/app/auth/me");
  expect(unauthRes.status()).toBe(401);
});`,
      lineExplanations: [
        { line: 5, explanation: "Submits credentials to /login endpoint to retrieve active session profile." },
        { line: 12, explanation: "Extracts Bearer session token from JSON response." },
        { line: 15, explanation: "Attaches Authorization: Bearer <token> to query protected endpoint." },
        { line: 24, explanation: "Omitting Authorization header results in 401 Unauthorized." }
      ]
    },
    {
      id: "example-schema-validation",
      caption: "Negative Testing and Structured Error Schema Verification",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("validates 422 Unprocessable Entity error schema", async ({ request }) => {
  const invalidPayload = {
    fullName: "X", // Violates 2-80 character constraint
    email: "invalid-email-format",
    seats: 99, // Exceeds max 12 limit
    startDate: "bad-date",
    agree: false, // Must be true
  };

  const response = await request.post("/api/lab/forms/intake", {
    data: invalidPayload,
  });

  expect(response.status()).toBe(422);
  expect(response.ok()).toBe(false);

  const body = await response.json();
  expect(body.error).toBeDefined();
  expect(body.error.code).toBe("validation_error");
  expect(body.error.message).toBe("Intake could not be accepted");

  // Assert on structured details array
  expect(Array.isArray(body.error.details)).toBe(true);
  expect(body.error.details).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ field: "fullName" }),
      expect.objectContaining({ field: "email" }),
      expect.objectContaining({ field: "seats" }),
      expect.objectContaining({ field: "startDate" }),
      expect.objectContaining({ field: "agree" }),
    ])
  );
});`,
      lineExplanations: [
        { line: 4, explanation: "Constructs intentionally invalid payload to test backend constraints." },
        { line: 16, explanation: "Asserts 422 Unprocessable Entity HTTP status code." },
        { line: 20, explanation: "Verifies standard error envelope containing code and message." },
        { line: 25, explanation: "Validates field-level error details array using expect.arrayContaining." }
      ]
    },
    {
      id: "example-hybrid-api-seed-ui",
      caption: "Hybrid API Data Seeding with Browser UI DOM Verification",
      language: "typescript",
      code: `import { test, expect } from "@playwright/test";

test("seeds course via API in 30ms and verifies in browser DOM", async ({ request, page }) => {
  const timestamp = Date.now();
  const code = \`HYB-\${timestamp.toString().slice(-4)}\`;
  const title = \`Hybrid Automation Course \${timestamp}\`;

  // 1. Fast API seed (<30ms)
  const createRes = await request.post("/api/app/courses", {
    headers: { Authorization: "Bearer tok_admin_session" },
    data: {
      code,
      title,
      category: "Integration",
      difficulty: "advanced",
      seats: 15,
      price: 399,
    },
  });
  expect(createRes.status()).toBe(201);
  const { course } = await createRes.json();

  try {
    // 2. Direct browser UI verification
    await page.goto("/app/courses");
    await expect(page.getByText(title)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(code)).toBeVisible();
  } finally {
    // 3. Guaranteed API teardown
    await request.delete(\`/api/app/courses/\${course.id}\`, {
      headers: { Authorization: "Bearer tok_admin_session" },
    }).catch(() => {});
  }
});`,
      lineExplanations: [
        { line: 9, explanation: "Provisions backend course entity via API in milliseconds without browser overhead." },
        { line: 24, explanation: "Navigates directly to customer-facing page in browser." },
        { line: 25, explanation: "Web-first assertion confirms seeded entity rendered into the React DOM." },
        { line: 29, explanation: "finally block deletes created course via API, ensuring pristine test state." }
      ]
    },
    {
      id: "example-custom-api-fixture",
      caption: "Custom Test Fixture Encapsulating API Client and Automatic Teardown",
      language: "typescript",
      code: `import { test as base, expect, APIRequestContext, request } from "@playwright/test";

type ApiFixtures = {
  adminClient: APIRequestContext;
};

const test = base.extend<ApiFixtures>({
  adminClient: async ({}, use) => {
    // 1. Create configured API context with baseURL and default Bearer headers
    const context = await request.newContext({
      baseURL: "http://127.0.0.1:3001",
      extraHTTPHeaders: {
        Authorization: "Bearer tok_admin_session",
        Accept: "application/json",
      },
    });

    // 2. Yield context to test function
    await use(context);

    // 3. Teardown and dispose of context sockets
    await context.dispose();
  },
});

test("uses reusable adminClient fixture for course listing", async ({ adminClient }) => {
  const res = await adminClient.get("/api/app/courses");
  expect(res.status()).toBe(200);
  const data = await res.json();
  expect(data.courses.length).toBeGreaterThan(0);
});`,
      lineExplanations: [
        { line: 7, explanation: "test.extend() registers reusable test-scoped fixture." },
        { line: 10, explanation: "request.newContext() configures base URL and default auth headers." },
        { line: 19, explanation: "await use(context) passes initialized client to the test function." },
        { line: 22, explanation: "context.dispose() automatically releases connections on test completion." }
      ]
    }
  ],
  commonMistakes: [
    {
      title: "Using slow browser UI forms for test prerequisite data setup",
      badPractice: `await page.goto("/app/courses/create");
await page.getByLabel("Title").fill("New Course");
await page.getByRole("button", { name: "Submit" }).click(); // Slow: 3-5 seconds per test!`,
      goodPractice: `const res = await request.post("/api/app/courses", {
  headers: { Authorization: "Bearer tok_admin_session" },
  data: { code: "CRS-1", title: "New Course", price: 299 },
}); // Fast: 30 milliseconds!`,
      explanation: "UI data setup inflates test execution time by 100x and multiplies flakiness. Use direct API calls to provision preconditions, reserving the browser strictly for the feature under test."
    },
    {
      title: "Forgetting cleanup and leaving orphaned database records",
      badPractice: `test("creates user", async ({ request }) => {
  await request.post("/api/app/courses", { data: newCourse });
  // Missing cleanup: database fills with thousands of orphan records!
});`,
      goodPractice: `test("creates user with cleanup", async ({ request }) => {
  const res = await request.post("/api/app/courses", { data: newCourse });
  const { course } = await res.json();
  try {
    // perform test assertions
  } finally {
    await request.delete(\`/api/app/courses/\${course.id}\`);
  }
});`,
      explanation: "Without cleanup in a finally block, failed assertions abort execution and leave test data behind, contaminating subsequent runs and causing unexpected unique-key collisions."
    },
    {
      title: "Hardcoding static IDs or codes causing collisions in parallel runs",
      badPractice: `const courseCode = "TEST-COURSE-101"; // Fails when 4 workers run concurrently!`,
      goodPractice: `const timestamp = Date.now();
const workerId = test.info().workerIndex;
const courseCode = \`W\${workerId}-\${timestamp}\`;`,
      explanation: "Parallel test workers executing against a shared backend collide if they use identical codes or email addresses. Always suffix test entities with worker index and timestamp."
    },
    {
      title: "Asserting on strict response time thresholds instead of correctness",
      badPractice: `const start = Date.now();
const res = await request.get("/api/app/courses");
expect(Date.now() - start).toBeLessThan(50); // Flaky: Fails in CI under CPU load!`,
      goodPractice: `const res = await request.get("/api/app/courses");
expect(res.status()).toBe(200); // Deterministic correctness assertion
const latency = Date.now() - start;
console.log(\`Telemetry: Course fetch took \${latency}ms\`); // Log for telemetry, don't assert`,
      explanation: "CI runners frequently suffer from CPU throttling and virtualization jitter. Asserting that an API responds in under 50ms produces random test flakiness without catching real bugs."
    },
    {
      title: "Committing raw bearer tokens or passwords in test files",
      badPractice: `const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiYWRtaW4iOnRydWV9"; // CRITICAL SECURITY RISK!`,
      goodPractice: `const token = process.env.TEST_ADMIN_TOKEN || await authenticateApi(request);`,
      explanation: "Hardcoding credentials or long-lived authentication tokens in test repositories exposes secrets in Git history and CI logs. Dynamically authenticate or read from secure environment variables."
    },
    {
      title: "Ignoring HTTP response headers and content-type validation",
      badPractice: `const res = await request.get("/api/health");
const data = await res.json(); // May crash if server returned HTML 500 page!`,
      goodPractice: `const res = await request.get("/api/health");
expect(res.status()).toBe(200);
expect(res.headers()["content-type"]).toContain("application/json");
const data = await res.json();`,
      explanation: "If an upstream proxy or server crashes and returns an HTML error page (e.g. 502 Bad Gateway), calling res.json() throws a confusing JSON parsing syntax error. Always verify status and content-type headers first."
    }
  ],
  playground: {
    title: "Playwright APIRequestContext & HTTP Testing Matrix",
    configExample: `// Production Playwright API Testing & Hybrid Automation Blueprint
import { test, expect, request } from "@playwright/test";

test("APIRequestContext production blueprint", async ({ request }) => {
  // 1. Health check with header and status verification
  const healthRes = await request.get("/api/health");
  expect(healthRes.status()).toBe(200);
  expect(healthRes.headers()["content-type"]).toContain("application/json");

  // 2. Authenticated request with Bearer authorization
  const authHeaders = { Authorization: "Bearer tok_admin_session" };
  const courseCode = \`PROD-\${Date.now().toString().slice(-4)}\`;

  const createRes = await request.post("/api/app/courses", {
    headers: authHeaders,
    data: {
      code: courseCode,
      title: "Production API Blueprint Course",
      category: "API Testing",
      difficulty: "advanced",
      seats: 20,
      price: 299,
    },
  });
  expect(createRes.status()).toBe(201);
  const { course } = await createRes.json();

  try {
    // 3. Filtered query assertion
    const listRes = await request.get("/api/app/courses", {
      params: { q: courseCode },
    });
    expect(listRes.status()).toBe(200);
    const listData = await listRes.json();
    expect(listData.courses.some((c: { code: string }) => c.code === courseCode)).toBe(true);
  } finally {
    // 4. Guaranteed entity teardown
    await request.delete(\`/api/app/courses/\${course.id}\`, {
      headers: authHeaders,
    }).catch(() => {});
  }
});`,
    properties: [
      {
        name: "request.get(url, options)",
        type: "Promise<APIResponse>",
        defaultValue: "HTTP GET",
        description: "Dispatches an HTTP GET request to fetch resources. Idempotent and safe.",
        impact: "Fastest query mechanism in Playwright, executing in single-digit milliseconds."
      },
      {
        name: "request.post(url, options)",
        type: "Promise<APIResponse>",
        defaultValue: "HTTP POST",
        description: "Dispatches an HTTP POST request to create new resources or submit transactions.",
        impact: "Automatically serializes 'data' object and sets Content-Type: application/json."
      },
      {
        name: "request.put(url, options)",
        type: "Promise<APIResponse>",
        defaultValue: "HTTP PUT",
        description: "Dispatches an HTTP PUT request to replace an entire resource at a target endpoint.",
        impact: "Used for idempotent full-entity updates in CRUD testing workflows."
      },
      {
        name: "request.patch(url, options)",
        type: "Promise<APIResponse>",
        defaultValue: "HTTP PATCH",
        description: "Dispatches an HTTP PATCH request to apply partial field updates to a resource.",
        impact: "Ideal for testing status transitions (e.g. activating a user, changing order status)."
      },
      {
        name: "request.delete(url, options)",
        type: "Promise<APIResponse>",
        defaultValue: "HTTP DELETE",
        description: "Dispatches an HTTP DELETE request to remove a resource by identifier.",
        impact: "Critical for test data cleanup in finally blocks and fixture teardown."
      },
      {
        name: "response.status()",
        type: "number",
        defaultValue: "numerical code",
        description: "Returns the 3-digit numerical HTTP status code (200, 201, 400, 401, 403, 404, 422).",
        impact: "Primary assertion target for REST contract validation."
      },
      {
        name: "response.ok()",
        type: "boolean",
        defaultValue: "status in 200..299",
        description: "Returns true if HTTP status code is in the success range (200 to 299).",
        impact: "Quick sanity check before attempting to parse response bodies."
      },
      {
        name: "response.json()",
        type: "Promise<any>",
        defaultValue: "parsed JSON object",
        description: "Asynchronously parses the response body text as a typed JavaScript object.",
        impact: "Throws SyntaxError if response is not valid JSON; pair with status checks."
      },
      {
        name: "response.headers()",
        type: "Record<string, string>",
        defaultValue: "lowercase map",
        description: "Returns all received response headers as a normalized lowercase key-value dictionary.",
        impact: "Used to verify content-type, cache-control, and security headers (nosniff)."
      },
      {
        name: "request.newContext(options)",
        type: "Promise<APIRequestContext>",
        defaultValue: "standalone context",
        description: "Creates an isolated APIRequestContext outside of the default test runner fixture.",
        impact: "Enables manual lifecycle management, custom base URLs, and bespoke proxy headers."
      },
      {
        name: "data (Request Option)",
        type: "any",
        defaultValue: "JSON body payload",
        description: "Payload data attached to POST, PUT, and PATCH requests.",
        impact: "Objects are serialized to JSON; strings or Buffers are sent as raw body."
      },
      {
        name: "params (Request Option)",
        type: "Record<string, string | number>",
        defaultValue: "query parameters",
        description: "Query string parameters appended to the URL (e.g. ?page=1&limit=10).",
        impact: "Essential for testing filtering, search, pagination, and sorting APIs."
      }
    ],
    behaviorComparison: [
      {
        aspect: "API Test Latency vs Browser UI Test Latency",
        defaultBehavior: "Direct APIRequestContext tests execute in 5ms to 50ms with zero DOM rendering overhead.",
        customizedBehavior: "Browser UI tests require 1,000ms to 5,000ms for browser launch, DOM layouts, and stability checks."
      },
      {
        aspect: "Built-in 'request' Fixture vs 'page.request'",
        defaultBehavior: "'request' fixture operates independently in Node.js with zero browser process overhead.",
        customizedBehavior: "'page.request' shares the active browser context's cookies, session storage, and origin credentials."
      },
      {
        aspect: "API Precondition Seeding vs UI Form Precondition Seeding",
        defaultBehavior: "API seeding creates entities directly in database/memory in 30ms before the test runs.",
        customizedBehavior: "UI form seeding fills 10 inputs via browser, wasting 4 seconds per test and multiplying flakiness."
      },
      {
        aspect: "response.json() vs response.text()",
        defaultBehavior: "response.json() parses structured objects for property, array, and type assertions.",
        customizedBehavior: "response.text() inspects raw string payloads, useful for non-JSON feeds or error debugging."
      },
      {
        aspect: "Deterministic Contract Assertions vs Arbitrary Sleep Hacks",
        defaultBehavior: "Asserting on response.status() and structured error codes evaluates instantly and deterministically.",
        customizedBehavior: "Using waitForTimeout() wastes time and creates intermittent test failures under CI CPU throttling."
      },
      {
        aspect: "Worker Namespaces vs Shared Static IDs",
        defaultBehavior: "Worker-scoped namespaces ('x-worker-namespace') allow 10 parallel test workers to run without collisions.",
        customizedBehavior: "Static hardcoded codes ('TEST-101') collide instantly when multiple tests run concurrently."
      }
    ],
    practiceTask: "Validate health, CRUD operations, authentication boundaries, and hybrid API/UI workflows using real Express endpoints.",
    localCommand: "pnpm exec playwright test e2e/practice-api.spec.ts"
  },
  exercises: [
    {
      id: "ex1-get-status-and-payload",
      title: "Exercise 1: Send a GET Request and Validate Its Status and Body",
      objective: "Send an HTTP GET request to /api/health using the request fixture, assert 200 OK, and verify the JSON response body.",
      prerequisites: [
        "Playwright test runner installed",
        "Understanding of async/await and response.json()"
      ],
      scenario: "Verify that the backend service health endpoint responds with 200 OK and confirms in-memory store status.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 1: Send GET request", async ({ request }) => {
  // TODO: Send GET request to /api/health
  // TODO: Assert status code is 200 and ok() is true
  // TODO: Assert JSON response matches expected health schema
});`,
      task: "Dispatch a GET request to /api/health, verify response.status() is 200, response.ok() is true, and body equals { status: 'ok', service: 'playwright-industrial-lab', store: 'memory' }.",
      acceptanceCriteria: [
        "request.get('http://127.0.0.1:3001/api/health') is dispatched.",
        "expect(response.status()).toBe(200) passes.",
        "expect(response.ok()).toBe(true) passes.",
        "Response body verified via toEqual()."
      ],
      expectedBehavior: "Request completes in <20ms and returns structured service health payload.",
      hint: "Use const body = await response.json(); expect(body).toEqual({ status: 'ok', service: 'playwright-industrial-lab', store: 'memory' });",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 1: Send a GET request and validate its status", async ({ request }) => {
  const response = await request.get("http://127.0.0.1:3001/api/health");
  expect(response.status()).toBe(200);
  expect(response.ok()).toBe(true);

  const body = await response.json();
  expect(body).toEqual({
    status: "ok",
    service: "playwright-industrial-lab",
    store: "memory",
  });
});`,
      troubleshootingNotes: "Ensure Express backend is running on port 3001. Playwright automatically proxies /api when targeting web server.",
      command: "pnpm exec playwright test e2e/practice-api.spec.ts -g 'Exercise 1'"
    },
    {
      id: "ex2-post-json-body",
      title: "Exercise 2: Send a POST Request with a JSON Body",
      objective: "Send an HTTP POST request to /api/lab/forms/intake with a JSON payload and validate the accepted status and generated ID.",
      prerequisites: [
        "request.post() method",
        "JSON serialization options"
      ],
      scenario: "Submit a student intake application via API and verify the backend accepts the registration and generates an ID.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 2: Send POST request", async ({ request }) => {
  // TODO: Define intake payload (fullName, email, seats, startDate, track, agree: true)
  // TODO: POST payload to /api/lab/forms/intake
  // TODO: Assert status is 200 and body.status is 'accepted'
});`,
      task: "Dispatch a POST request to /api/lab/forms/intake with valid student data, assert status 200, body.status === 'accepted', and body.id is defined.",
      acceptanceCriteria: [
        "Payload includes fullName, email, seats, startDate, track, agree: true.",
        "request.post() attaches payload via 'data' property.",
        "Status 200 asserted.",
        "Generated ID asserted to be a valid string."
      ],
      expectedBehavior: "Backend validates schema, persists intake submission, and returns accepted status with unique ID.",
      hint: "Pass data: { fullName: 'Ada Lovelace', email: 'ada@pil.local', seats: 3, startDate: '2026-11-01', track: 'api', agree: true }.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 2: Send a POST request with a JSON body", async ({ request }) => {
  const payload = {
    fullName: "Ada Lovelace",
    email: "ada.lovelace@industrial.lab",
    seats: 3,
    startDate: "2026-11-01",
    track: "api",
    agree: true,
  };

  const response = await request.post("http://127.0.0.1:3001/api/lab/forms/intake", {
    data: payload,
  });

  expect(response.status()).toBe(200);
  expect(response.ok()).toBe(true);

  const body = await response.json();
  expect(body.status).toBe("accepted");
  expect(body.id).toBeDefined();
  expect(typeof body.id).toBe("string");
});`,
      troubleshootingNotes: "The backend expects startDate in YYYY-MM-DD format and seats between 1 and 12.",
      command: "pnpm exec playwright test e2e/practice-api.spec.ts -g 'Exercise 2'"
    },
    {
      id: "ex3-headers-and-json-fields",
      title: "Exercise 3: Validate HTTP Response Headers and Strict Content Types",
      objective: "Inspect HTTP response headers for content-type and security tags, and assert structured JSON fields.",
      prerequisites: [
        "response.headers() API",
        "Array matching in expect()"
      ],
      scenario: "Verify that /api/app/courses returns proper application/json headers, nosniff security flags, and course arrays.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 3: Validate headers and JSON fields", async ({ request }) => {
  // TODO: GET /api/app/courses
  // TODO: Assert headers['content-type'] and headers['x-content-type-options']
  // TODO: Assert body has courses array and total count
});`,
      task: "GET /api/app/courses, assert status 200, verify content-type includes 'application/json', verify x-content-type-options is 'nosniff', and assert course items contain id, title, code, price.",
      acceptanceCriteria: [
        "Response headers inspected via response.headers().",
        "content-type and x-content-type-options verified.",
        "courses array validated to have length > 0.",
        "First course validated for mandatory fields."
      ],
      expectedBehavior: "Headers confirm JSON transmission and strict MIME security; JSON body confirms course collection.",
      hint: "Use const headers = response.headers(); expect(headers['content-type']).toContain('application/json');",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 3: Validate response headers and JSON fields", async ({ request }) => {
  const response = await request.get("http://127.0.0.1:3001/api/app/courses");
  expect(response.status()).toBe(200);

  const headers = response.headers();
  expect(headers["content-type"]).toContain("application/json");
  expect(headers["x-content-type-options"]).toBe("nosniff");

  const body = await response.json();
  expect(body).toHaveProperty("courses");
  expect(body).toHaveProperty("total");
  expect(Array.isArray(body.courses)).toBe(true);
  expect(body.courses.length).toBeGreaterThan(0);

  const firstCourse = body.courses[0];
  expect(firstCourse).toHaveProperty("id");
  expect(firstCourse).toHaveProperty("title");
  expect(firstCourse).toHaveProperty("code");
  expect(firstCourse).toHaveProperty("price");
});`,
      troubleshootingNotes: "Playwright normalizes all header keys to lowercase.",
      command: "pnpm exec playwright test e2e/practice-api.spec.ts -g 'Exercise 3'"
    },
    {
      id: "ex4-crud-workflow-isolation",
      title: "Exercise 4: Complete an End-to-End CRUD Workflow with Test Data Isolation",
      objective: "Execute a full CRUD sequence: Create a course, Read it, Update its attributes, Delete it, and verify 404.",
      prerequisites: [
        "REST API methods (POST, GET, PUT, DELETE)",
        "Bearer authentication headers"
      ],
      scenario: "Create a course via POST, retrieve by ID, update price via PUT, delete via DELETE, and confirm 404.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 4: Complete CRUD workflow", async ({ request }) => {
  // TODO: POST /api/app/courses with admin token
  // TODO: GET /api/app/courses/:id
  // TODO: PUT /api/app/courses/:id
  // TODO: DELETE /api/app/courses/:id
  // TODO: GET /api/app/courses/:id -> assert 404
});`,
      task: "Execute complete course CRUD cycle with Authorization: Bearer tok_admin_session, asserting appropriate status codes (201, 200, 200, 200, 404) and guaranteeing cleanup.",
      acceptanceCriteria: [
        "POST /api/app/courses returns 201 Created.",
        "GET returns 200 OK with matching title.",
        "PUT updates price and returns 200 OK.",
        "DELETE returns 200 OK with status: 'deleted'.",
        "Subsequent GET returns 404 Not Found.",
        "try/finally block ensures resource deletion."
      ],
      expectedBehavior: "Entity progresses through all lifecycle phases smoothly without leaving orphaned database state.",
      hint: "Use const { course } = await createRes.json(); and target `/api/app/courses/${course.id}`.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 4: Complete a CRUD workflow with isolated test data", async ({ request }) => {
  const authHeaders = { Authorization: "Bearer tok_admin_session" };
  const timestamp = Date.now();
  const courseCode = \`CRUD-\${timestamp.toString().slice(-4)}\`;
  const courseTitle = \`Automated CRUD Course \${timestamp}\`;

  const createRes = await request.post("http://127.0.0.1:3001/api/app/courses", {
    headers: authHeaders,
    data: {
      code: courseCode,
      title: courseTitle,
      category: "API Testing",
      difficulty: "intermediate",
      seats: 25,
      price: 349,
    },
  });
  expect(createRes.status()).toBe(201);
  const { course } = await createRes.json();

  try {
    const readRes = await request.get(\`http://127.0.0.1:3001/api/app/courses/\${course.id}\`);
    expect(readRes.status()).toBe(200);

    const updateRes = await request.put(\`http://127.0.0.1:3001/api/app/courses/\${course.id}\`, {
      headers: authHeaders,
      data: { title: \`\${courseTitle} (Updated)\`, price: 399 },
    });
    expect(updateRes.status()).toBe(200);

    const deleteRes = await request.delete(\`http://127.0.0.1:3001/api/app/courses/\${course.id}\`, {
      headers: authHeaders,
    });
    expect(deleteRes.status()).toBe(200);
    const deleteBody = await deleteRes.json();
    expect(deleteBody.status).toBe("deleted");

    const verifyRes = await request.get(\`http://127.0.0.1:3001/api/app/courses/\${course.id}\`);
    expect(verifyRes.status()).toBe(404);
  } finally {
    await request.delete(\`http://127.0.0.1:3001/api/app/courses/\${course.id}\`, {
      headers: authHeaders,
    }).catch(() => {});
  }
});`,
      troubleshootingNotes: "Always wrap subsequent operations in try/finally to prevent abandoned test records if an assertion fails.",
      command: "pnpm exec playwright test e2e/practice-api.spec.ts -g 'Exercise 4'"
    },
    {
      id: "ex5-negative-payload-testing",
      title: "Exercise 5: Test Missing and Malformed Request Payloads (400 & 422)",
      objective: "Dispatch invalid payloads to test defensive API error handling for 400 Bad Request and 422 Unprocessable Entity.",
      prerequisites: [
        "Negative testing principles",
        "HTTP 4xx status semantics"
      ],
      scenario: "Submit course creation missing title/code (assert 400) and intake form with malformed fields (assert 422).",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 5: Test invalid payloads", async ({ request }) => {
  // TODO: POST /api/app/courses missing title -> assert 400 Bad Request
  // TODO: POST /api/lab/forms/intake with invalid email/seats -> assert 422 Unprocessable Entity
});`,
      task: "Assert that POST /api/app/courses without title returns 400 with invalid_payload error code, and POST /api/lab/forms/intake with invalid values returns 422 with details array.",
      acceptanceCriteria: [
        "400 Bad Request asserted for missing course code/title.",
        "422 Unprocessable Entity asserted for invalid form intake.",
        "error.code and error.details validated on JSON responses."
      ],
      expectedBehavior: "Backend detects malformed input and returns informative 4xx errors without crashing.",
      hint: "Check body.error.code === 'invalid_payload' for 400 and body.error.code === 'validation_error' for 422.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 5: Test missing and invalid request fields", async ({ request }) => {
  const authHeaders = { Authorization: "Bearer tok_admin_session" };

  const badReqRes = await request.post("http://127.0.0.1:3001/api/app/courses", {
    headers: authHeaders,
    data: { price: 299 },
  });
  expect(badReqRes.status()).toBe(400);
  const badReqBody = await badReqRes.json();
  expect(badReqBody.error.code).toBe("invalid_payload");

  const unprocessableRes = await request.post("http://127.0.0.1:3001/api/lab/forms/intake", {
    data: {
      fullName: "A",
      email: "not-an-email",
      seats: 99,
      startDate: "invalid-date",
      agree: false,
    },
  });
  expect(unprocessableRes.status()).toBe(422);
  const unprocBody = await unprocessableRes.json();
  expect(unprocBody.error.code).toBe("validation_error");
  expect(Array.isArray(unprocBody.error.details)).toBe(true);
});`,
      troubleshootingNotes: "400 indicates missing required inputs; 422 indicates syntactically valid inputs that violate domain validation rules.",
      command: "pnpm exec playwright test e2e/practice-api.spec.ts -g 'Exercise 5'"
    },
    {
      id: "ex6-rbac-unauthorized-forbidden",
      title: "Exercise 6: Verify Unauthorized and Forbidden Access (401 & 403)",
      objective: "Verify authentication and authorization boundaries: 401 for missing tokens, and 403 for unauthorized roles.",
      prerequisites: [
        "Role-Based Access Control (RBAC)",
        "HTTP 401 vs 403 semantics"
      ],
      scenario: "Attempt protected call without token (401), attempt course creation as learner (403), and attempt course deletion as trainer (403).",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 6: Verify 401 and 403 boundaries", async ({ request }) => {
  // TODO: GET /api/app/auth/me without token -> assert 401
  // TODO: POST /api/app/courses with learner token -> assert 403
  // TODO: DELETE /api/app/courses/:id with trainer token -> assert 403
});`,
      task: "Assert that missing tokens trigger 401 Unauthorized, learner tokens cannot create courses (403), and trainer tokens cannot delete courses (403).",
      acceptanceCriteria: [
        "GET /api/app/auth/me without token returns 401.",
        "POST /api/app/courses with tok_learner_session returns 403.",
        "DELETE /api/app/courses/crs_playwright_101 with tok_trainer_session returns 403."
      ],
      expectedBehavior: "API perimeter enforces strict token validation and granular role authorization checks.",
      hint: "Use headers: { Authorization: 'Bearer tok_learner_session' } to test forbidden creation.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 6: Verify unauthorized and forbidden access", async ({ request }) => {
  const unauthRes = await request.get("http://127.0.0.1:3001/api/app/auth/me");
  expect(unauthRes.status()).toBe(401);

  const forbiddenCreateRes = await request.post("http://127.0.0.1:3001/api/app/courses", {
    headers: { Authorization: "Bearer tok_learner_session" },
    data: { code: "UNAUTH-101", title: "Unauthorized Course" },
  });
  expect(forbiddenCreateRes.status()).toBe(403);

  const forbiddenDeleteRes = await request.delete("http://127.0.0.1:3001/api/app/courses/crs_playwright_101", {
    headers: { Authorization: "Bearer tok_trainer_session" },
  });
  expect(forbiddenDeleteRes.status()).toBe(403);
});`,
      troubleshootingNotes: "401 means 'Who are you?' (Unauthenticated); 403 means 'I know who you are, but you are not allowed to do that' (Forbidden).",
      command: "pnpm exec playwright test e2e/practice-api.spec.ts -g 'Exercise 6'"
    },
    {
      id: "ex7-pagination-and-filtering",
      title: "Exercise 7: Test Query Parameters, Pagination, and Filtering",
      objective: "Query user management endpoint with pagination, limit, sorting, and role filtering parameters.",
      prerequisites: [
        "Query parameter serialization",
        "Collection assertion patterns"
      ],
      scenario: "Query /api/app/users with page=1, limit=3, role=learner, and sort=name; assert metadata and filtered items.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 7: Test pagination and filtering", async ({ request }) => {
  // TODO: GET /api/app/users with params: { page: 1, limit: 3, role: 'learner', sort: 'name', order: 'asc' }
  // TODO: Assert page, users length, and that every user has role 'learner'
});`,
      task: "GET /api/app/users with admin Bearer token and pagination params, verify page === 1, users.length <= 3, and all returned users have role === 'learner'.",
      acceptanceCriteria: [
        "Query options passed via request 'params' option.",
        "Status 200 asserted.",
        "Pagination metadata (page, total, totalPages) verified.",
        "Loop validates every returned item matches role filter."
      ],
      expectedBehavior: "Backend applies pagination slice and filter condition, returning bounded result set.",
      hint: "Use params: { page: '1', limit: '3', role: 'learner', sort: 'name', order: 'asc' }.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 7: Test pagination and filtering", async ({ request }) => {
  const authHeaders = { Authorization: "Bearer tok_admin_session" };

  const response = await request.get("http://127.0.0.1:3001/api/app/users", {
    headers: authHeaders,
    params: {
      page: "1",
      limit: "3",
      role: "learner",
      sort: "name",
      order: "asc",
    },
  });

  expect(response.status()).toBe(200);
  const data = await response.json();

  expect(data.page).toBe(1);
  expect(data.users.length).toBeLessThanOrEqual(3);
  expect(data.total).toBeGreaterThan(0);
  expect(data.totalPages).toBeGreaterThan(0);

  for (const user of data.users) {
    expect(user.role).toBe("learner");
  }
});`,
      troubleshootingNotes: "Passing params in request.get() automatically URL-encodes values and appends the query string.",
      command: "pnpm exec playwright test e2e/practice-api.spec.ts -g 'Exercise 7'"
    },
    {
      id: "ex8-hybrid-api-seed-ui-verify",
      title: "Exercise 8: Create Data Through an API and Verify It in the Browser",
      objective: "Demonstrate hybrid API/UI testing: seed a course via fast API call in <30ms, verify in browser UI, and clean up via API.",
      prerequisites: [
        "Hybrid test architecture",
        "Combining request and page fixtures"
      ],
      scenario: "Create a course via request.post(), navigate to /app/courses with page.goto(), assert DOM visibility, and delete via API.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 8: Hybrid API seed and UI verification", async ({ request, page }) => {
  // TODO: Seed course via request.post('/api/app/courses')
  // TODO: Navigate to /app/courses with page.goto()
  // TODO: Assert course title is visible in DOM
  // TODO: Clean up course via request.delete()
});`,
      task: "Provision course via API in milliseconds, verify course title and code appear on /app/courses grid, and delete course via API in finally block.",
      acceptanceCriteria: [
        "Course created via request.post() in 201 response.",
        "page.goto('/app/courses') navigates to course catalogue.",
        "expect(page.getByText(title)).toBeVisible() passes.",
        "request.delete() cleans up entity in finally block."
      ],
      expectedBehavior: "Entity created in backend renders in React frontend; teardown removes entity cleanly.",
      hint: "Wrap page navigation and assertions in try block, placing request.delete in finally block.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 8: Create data through an API and verify it in the browser", async ({
  request,
  page,
}) => {
  const timestamp = Date.now();
  const courseCode = \`E2E-\${timestamp.toString().slice(-4)}\`;
  const courseTitle = \`Hybrid Seeded Course \${timestamp}\`;

  const createRes = await request.post("http://127.0.0.1:3001/api/app/courses", {
    headers: { Authorization: "Bearer tok_admin_session" },
    data: {
      code: courseCode,
      title: courseTitle,
      category: "Integration",
      difficulty: "advanced",
      seats: 15,
      price: 499,
    },
  });
  expect(createRes.status()).toBe(201);
  const { course } = await createRes.json();

  try {
    await page.goto("/app/courses");
    await expect(page.getByText(courseTitle)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(courseCode)).toBeVisible();
  } finally {
    await request.delete(\`http://127.0.0.1:3001/api/app/courses/\${course.id}\`, {
      headers: { Authorization: "Bearer tok_admin_session" },
    }).catch(() => {});
  }
});`,
      troubleshootingNotes: "Hybrid tests cut execution time by 80% compared to filling creation forms through the browser UI.",
      command: "pnpm exec playwright test e2e/practice-api.spec.ts -g 'Exercise 8'"
    },
    {
      id: "ex9-diagnose-failing-assertion",
      title: "Exercise 9: Diagnose a Failing API Assertion",
      objective: "Inspect diagnostic properties on failing responses: status code, statusText, ok(), and error payloads.",
      prerequisites: [
        "Failure diagnosis techniques",
        "API error inspection"
      ],
      scenario: "Request a non-existent course ID, assert 404 Not Found, verify ok() is false, and validate error code.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 9: Diagnose failing assertion", async ({ request }) => {
  // TODO: GET /api/app/courses/crs_non_existent_999
  // TODO: Assert status is 404 and ok() is false
  // TODO: Assert body.error.code is 'not_found'
});`,
      task: "Query non-existent resource, assert status 404, verify response.ok() is false, and validate body error code is 'not_found'.",
      acceptanceCriteria: [
        "GET /api/app/courses/crs_non_existent_999 returns 404.",
        "expect(response.ok()).toBe(false) passes.",
        "body.error.code asserted to be 'not_found'.",
        "body.error.message asserted to contain 'Course not found'."
      ],
      expectedBehavior: "Diagnostics confirm resource absence and return structured error message.",
      hint: "Use const body = await response.json(); expect(body.error.code).toBe('not_found');",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 9: Diagnose a failing API assertion", async ({ request }) => {
  const nonExistentId = "crs_non_existent_999";
  const response = await request.get(\`http://127.0.0.1:3001/api/app/courses/\${nonExistentId}\`);

  expect(response.status()).toBe(404);
  expect(response.ok()).toBe(false);

  const body = await response.json();
  expect(body.error.code).toBe("not_found");
  expect(body.error.message).toBe("Course not found");
});`,
      troubleshootingNotes: "Always check response.ok() before attempting to parse response bodies in test assertions.",
      command: "pnpm exec playwright test e2e/practice-api.spec.ts -g 'Exercise 9'"
    },
    {
      id: "ex10-build-reusable-api-fixture",
      title: "Exercise 10: Build a Reusable API Fixture with Automatic Resource Cleanup",
      objective: "Encapsulate entity creation and teardown in a reusable factory pattern, ensuring zero data leakage.",
      prerequisites: [
        "Higher-order functions or test.extend()",
        "Resource lifecycle management"
      ],
      scenario: "Implement withCourse helper that creates a course, yields it to the test callback, and automatically deletes it.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 10: Reusable API fixture", async ({ request }) => {
  // TODO: Implement withCourse factory helper
  // TODO: Use helper to verify course existence
  // TODO: Verify automatic teardown
});`,
      task: "Build withCourse factory function that provisions an entity via API, passes it to the test function, and deletes it in finally block.",
      acceptanceCriteria: [
        "Factory helper encapsulates POST request.",
        "Test executes assertions against provisioned entity.",
        "finally block guarantees DELETE request execution.",
        "Subsequent verification confirms clean state."
      ],
      expectedBehavior: "Helper isolates boilerplate and guarantees test independence across repeated runs.",
      hint: "Implement async function withCourse(data, testFn) { ... try { await testFn(course); } finally { await request.delete(...); } }",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 10: Build a reusable API fixture", async ({ request }) => {
  async function withCourse(
    courseData: { code: string; title: string },
    testFn: (course: { id: string; code: string; title: string }) => Promise<void>
  ) {
    const authHeaders = { Authorization: "Bearer tok_admin_session" };
    const createRes = await request.post("http://127.0.0.1:3001/api/app/courses", {
      headers: authHeaders,
      data: {
        ...courseData,
        category: "Fixture",
        difficulty: "intermediate",
        seats: 10,
        price: 199,
      },
    });
    expect(createRes.status()).toBe(201);
    const { course } = await createRes.json();

    try {
      await testFn(course);
    } finally {
      await request.delete(\`http://127.0.0.1:3001/api/app/courses/\${course.id}\`, {
        headers: authHeaders,
      });
    }
  }

  const testId = Date.now().toString().slice(-4);
  await withCourse(
    { code: \`FIX-\${testId}\`, title: \`Fixture Managed Course \${testId}\` },
    async (course) => {
      const verifyRes = await request.get(\`http://127.0.0.1:3001/api/app/courses/\${course.id}\`);
      expect(verifyRes.status()).toBe(200);
      const { course: fetched } = await verifyRes.json();
      expect(fetched.code).toBe(\`FIX-\${testId}\`);
    }
  );
});`,
      troubleshootingNotes: "Custom fixtures in e2e/fixtures/index.ts use this exact pattern to provide leak-free test environments.",
      command: "pnpm exec playwright test e2e/practice-api.spec.ts -g 'Exercise 10'"
    },
    {
      id: "ex11-parallel-safe-api-tests",
      title: "Exercise 11: Run Independent API Tests Safely in Parallel",
      objective: "Demonstrate parallel-safe execution by attaching worker-specific namespaces and unique timestamps.",
      prerequisites: [
        "Playwright worker concurrency",
        "Namespace header isolation"
      ],
      scenario: "Create a course using x-worker-namespace header and worker ID prefix, ensuring concurrent workers never collide.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 11: Parallel-safe API testing", async ({ request }) => {
  // TODO: Generate unique code with workerIndex and timestamp
  // TODO: Pass x-worker-namespace header
  // TODO: Query and verify entity isolation
});`,
      task: "Dispatch POST with x-worker-namespace header and worker-scoped code, query list by code, assert existence, and clean up.",
      acceptanceCriteria: [
        "Code incorporates workerIndex and timestamp.",
        "x-worker-namespace header attached to request.",
        "List query asserts matching entity without collision.",
        "Cleanup executed via DELETE."
      ],
      expectedBehavior: "Multiple parallel workers execute without duplicate-key errors or cross-test contamination.",
      hint: "Use template literal `PAR-W${workerId}-${Date.now()}` and pass in headers: { 'x-worker-namespace': 'worker_1' }.",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 11: Run independent API tests safely in parallel", async ({ request }) => {
  const workerId = process.env.TEST_WORKER_INDEX || "0";
  const timestamp = Date.now();
  const isolatedCode = \`PAR-W\${workerId}-\${timestamp.toString().slice(-4)}\`;

  const createRes = await request.post("http://127.0.0.1:3001/api/app/courses", {
    headers: {
      Authorization: "Bearer tok_admin_session",
      "x-worker-namespace": \`worker_\${workerId}\`,
    },
    data: {
      code: isolatedCode,
      title: \`Parallel Isolated Course W\${workerId}\`,
      category: "Concurrency",
      difficulty: "advanced",
      seats: 20,
      price: 299,
    },
  });

  expect(createRes.status()).toBe(201);
  const { course } = await createRes.json();

  try {
    const listRes = await request.get("http://127.0.0.1:3001/api/app/courses", {
      params: { q: isolatedCode },
    });
    expect(listRes.status()).toBe(200);
    const data = await listRes.json();
    expect(data.courses.some((c: { code: string }) => c.code === isolatedCode)).toBe(true);
  } finally {
    await request.delete(\`http://127.0.0.1:3001/api/app/courses/\${course.id}\`, {
      headers: { Authorization: "Bearer tok_admin_session" },
    }).catch(() => {});
  }
});`,
      troubleshootingNotes: "Always avoid global list count assertions like toHaveLength(5) in parallel tests; assert presence of your specific entity.",
      command: "pnpm exec playwright test e2e/practice-api.spec.ts -g 'Exercise 11'"
    },
    {
      id: "ex12-senior-api-ui-challenge",
      title: "Exercise 12: Complete a Senior-Level API and UI Integration Challenge",
      objective: "Execute a full enterprise workflow: authenticate via API, inject token into browser localStorage, verify dashboard, and logout.",
      prerequisites: [
        "Advanced API and browser coordination",
        "Direct localStorage injection"
      ],
      scenario: "Login via /api/practice/auth/login, verify /me, inject token into localStorage, navigate to /practice/dashboard, and logout.",
      starterCode: `import { test, expect } from "@playwright/test";

test("Exercise 12: Senior API/UI challenge", async ({ request, page }) => {
  // TODO: Login via POST /api/practice/auth/login
  // TODO: Verify session via GET /api/practice/auth/me
  // TODO: Inject token into page localStorage
  // TODO: Navigate to /practice/dashboard and assert welcome message
  // TODO: Logout via API and UI
});`,
      task: "Authenticate via Practice Auth API (<30ms), verify token with /me, inject pil-practice-token into browser localStorage, open /practice/dashboard bypassing UI login, and verify session invalidation.",
      acceptanceCriteria: [
        "POST /api/practice/auth/login succeeds with status 200.",
        "GET /api/practice/auth/me confirms session user.",
        "Token injected into localStorage via page.evaluate().",
        "Dashboard renders welcome message and student role badge.",
        "UI logout transitions back to login with loggedOut query parameter."
      ],
      expectedBehavior: "Direct API authentication eliminates slow UI typing while providing 100% genuine browser session validation.",
      hint: "Use page.evaluate(({ token, user }) => { localStorage.setItem('pil-practice-token', token); localStorage.setItem('pil-practice-user', JSON.stringify(user)); }, { token, user });",
      solution: `import { test, expect } from "@playwright/test";

test("Exercise 12: Complete a senior-level API/UI integration challenge", async ({
  request,
  page,
}) => {
  const loginRes = await request.post("http://127.0.0.1:3001/api/practice/auth/login", {
    data: {
      username: "student",
      password: "Password123!",
    },
  });
  expect(loginRes.status()).toBe(200);
  const loginData = await loginRes.json();
  expect(loginData.status).toBe("success");
  expect(loginData.token).toBeDefined();

  const meRes = await request.get("http://127.0.0.1:3001/api/practice/auth/me", {
    headers: {
      Authorization: \`Bearer \${loginData.token}\`,
    },
  });
  expect(meRes.status()).toBe(200);
  const meData = await meRes.json();
  expect(meData.user.username).toBe("student");

  await page.goto("/practice/login");
  await page.evaluate(({ token, user }) => {
    localStorage.setItem("pil-practice-token", token);
    localStorage.setItem("pil-practice-user", JSON.stringify(user));
  }, { token: loginData.token, user: loginData.user });

  await page.goto("/practice/dashboard");
  await expect(page).toHaveURL(/.*\\/practice\\/dashboard/);
  await expect(page.getByTestId("welcome-message")).toContainText("Welcome, student!");
  await expect(page.getByTestId("user-role-badge")).toContainText("STUDENT");

  const logoutRes = await request.post("http://127.0.0.1:3001/api/practice/auth/logout", {
    headers: {
      Authorization: \`Bearer \${loginData.token}\`,
    },
  });
  expect(logoutRes.status()).toBe(200);

  await page.getByTestId("logout-btn").click();
  await expect(page).toHaveURL(/.*\\/practice\\/login\\?loggedOut=true/);
});`,
      troubleshootingNotes: "Injecting valid tokens into localStorage allows testing authenticated deep links directly without wasting CI time on UI login forms.",
      command: "pnpm exec playwright test e2e/practice-api.spec.ts -g 'Exercise 12'"
    }
  ],
  knowledgeCheck: [
    {
      id: "kc-api-vs-ui-speed",
      topic: "Test Pyramid & Execution Speed",
      question: "Why do senior SDETs recommend performing test prerequisite data creation through APIRequestContext rather than navigating browser UI forms?",
      options: [
        "Browser UI forms cannot communicate with databases.",
        "API calls execute in 10ms to 50ms without DOM rendering, stylesheet parsing, or animation wait times, slashing execution duration and eliminating layout flakiness.",
        "Playwright does not support form typing in headless mode.",
        "API calls bypass network security firewalls."
      ],
      correctOptionIndex: 1,
      explanation: "UI automation is resource-intensive, requiring 2 to 5 seconds per form interaction. Creating prerequisites directly via API reduces setup time to under 50ms while reserving the browser strictly for the visual feature under test."
    },
    {
      id: "kc-request-fixture-scope",
      topic: "APIRequestContext Architecture",
      question: "How does the built-in 'request' fixture in Playwright differ from 'page.request'?",
      options: [
        "The 'request' fixture runs in the browser, while 'page.request' runs in Python.",
        "The 'request' fixture operates independently in Node.js with zero browser overhead; 'page.request' is bound to the active BrowserContext and automatically shares its cookies, session storage, and origin credentials.",
        "'page.request' is deprecated and will be removed in future Playwright releases.",
        "There is no difference; they are aliases for the same underlying object."
      ],
      correctOptionIndex: 1,
      explanation: "The standalone 'request' fixture is a lightweight, pure HTTP client ideal for service-level testing. 'page.request' shares the page's exact browser context, inheriting cookies and authenticated sessions."
    },
    {
      id: "kc-http-idempotency",
      topic: "HTTP Methods & Idempotency",
      question: "Which of the following HTTP methods is considered non-idempotent, requiring defensive test design against accidental duplicate execution?",
      options: [
        "GET",
        "PUT",
        "POST",
        "DELETE"
      ],
      correctOptionIndex: 2,
      explanation: "POST is non-idempotent because repeating identical requests creates multiple distinct resources or triggers constraint violations. In contrast, GET, PUT, and DELETE produce identical server state upon repeated execution."
    },
    {
      id: "kc-status-401-vs-403",
      topic: "Security & Status Semantics",
      question: "In automated API testing, what is the precise semantic distinction between receiving HTTP 401 Unauthorized versus HTTP 403 Forbidden?",
      options: [
        "401 means the server crashed; 403 means the URL does not exist.",
        "401 means authentication is missing or invalid ('Who are you?'); 403 means the user is authenticated but lacks required role permissions ('I know who you are, but you cannot perform this action').",
        "401 is only returned by Apache; 403 is only returned by Nginx.",
        "They are interchangeable status codes with identical RFC specifications."
      ],
      correctOptionIndex: 1,
      explanation: "401 indicates authentication failure (missing or expired Bearer token). 403 indicates authorization failure (authenticated user has insufficient privileges, e.g. a learner attempting to delete a course)."
    },
    {
      id: "kc-status-422-semantics",
      topic: "Validation & Error Responses",
      question: "When should a modern REST API return HTTP 422 Unprocessable Entity instead of HTTP 400 Bad Request?",
      options: [
        "When the network cable is disconnected.",
        "When the payload syntax is valid JSON, but contained values violate domain business rules (e.g. invalid email format, negative seats, or end date before start date).",
        "When the database runs out of disk storage.",
        "Only when uploading binary image files."
      ],
      correctOptionIndex: 1,
      explanation: "HTTP 400 Bad Request indicates malformed syntax or unparseable JSON. HTTP 422 Unprocessable Entity indicates syntactically valid JSON whose data fails semantic business validation rules."
    },
    {
      id: "kc-test-data-leakage",
      topic: "Test Data Hygiene",
      question: "What is the most effective architectural strategy for preventing test data pollution when running automated CRUD tests against an active backend?",
      options: [
        "Reboot the physical server after every single test case.",
        "Generate unique identifiers (timestamps + worker indices) and guarantee entity deletion in a 'finally' block or custom fixture teardown.",
        "Run all tests in serial mode with workers: 1.",
        "Never delete data so test runs can inspect past records."
      ],
      correctOptionIndex: 1,
      explanation: "Timestamped and worker-scoped identifiers prevent collisions during concurrent runs, while wrapping cleanup in 'finally' blocks ensures resources are deleted even if assertions throw errors."
    },
    {
      id: "kc-response-time-assertions",
      topic: "Performance & Reliability",
      question: "Why do production test engineering guidelines advise AGAINST writing assertions like 'expect(duration).toBeLessThan(50)' in functional test suites?",
      options: [
        "Because JavaScript cannot measure time in milliseconds.",
        "Shared CI runners experience virtualization jitter and CPU throttling; latency assertions create intermittent flakiness unrelated to functional correctness.",
        "Playwright automatically fails tests if response times exceed 50ms.",
        "Because APIs always respond in exactly 10ms."
      ],
      correctOptionIndex: 1,
      explanation: "CI environments suffer from variable CPU load and network jitter. Rigid latency assertions fail intermittently without indicating functional defects. Log response duration for telemetry, but assert on status codes and contracts."
    },
    {
      id: "kc-json-content-type-safety",
      topic: "Response Handling Safety",
      question: "What failure occurs if a test immediately executes 'const data = await response.json()' when the upstream backend crashes with an HTML 502 Bad Gateway page?",
      options: [
        "Playwright converts the HTML into a JSON object automatically.",
        "The test crashes with a confusing SyntaxError ('Unexpected token < in JSON at position 0') rather than a clear HTTP status assertion failure.",
        "The test runner pauses execution for 30 seconds.",
        "The Node.js runtime process terminates unexpectedly."
      ],
      correctOptionIndex: 1,
      explanation: "When servers crash, proxies return HTML error pages. Calling response.json() fails with JSON parsing errors, obscuring the root cause. Always verify response.status() and content-type before parsing JSON."
    },
    {
      id: "kc-credential-hygiene",
      topic: "Security Hygiene",
      question: "Why is committing hardcoded Bearer tokens or admin passwords in test repository files considered a critical security defect?",
      options: [
        "Because git diff becomes larger in pull requests.",
        "Hardcoded credentials leak secrets into version control history and CI build logs, exposing live systems to unauthorized access and privilege escalation.",
        "Because Playwright refuses to execute tests containing the string 'Bearer'.",
        "It is not a security defect; test credentials should always be checked into git."
      ],
      correctOptionIndex: 1,
      explanation: "Hardcoded credentials in source control create severe security vulnerabilities. Attackers can extract bearer tokens from git logs and compromise environments. Always use environment variables or dynamic authentication."
    }
  ],
  practiceTask: {
    labRoute: "/app/courses",
    labName: "REST API & Course Management Service",
    objective: "Execute complete API validation against local Express service endpoints.",
    instructions: [
      "Target http://127.0.0.1:3001 using the Playwright APIRequestContext.",
      "Send GET /api/health and assert 200 OK with memory store.",
      "Execute complete CRUD operations on /api/app/courses with Bearer tok_admin_session.",
      "Assert 401 Unauthorized and 403 Forbidden on security boundary endpoints.",
      "Verify hybrid API seeding with browser DOM assertion in e2e/practice-api.spec.ts."
    ],
    acceptanceCriteria: [
      "Always verify response.status() and response.ok() before parsing response bodies.",
      "Wrap entity cleanup in try/finally blocks to prevent orphaned database records.",
      "Use worker-isolated namespaces and timestamps to guarantee parallel safety.",
      "Combine fast API seeding with browser UI verification for optimal test pyramid balance."
    ],
    hint: "Run 'pnpm exec playwright test e2e/practice-api.spec.ts' to execute all 12 exercises locally.",
    solutionCode: `import { test, expect } from "@playwright/test";

test("API service validation", async ({ request }) => {
  const healthRes = await request.get("http://127.0.0.1:3001/api/health");
  expect(healthRes.status()).toBe(200);
  expect(healthRes.ok()).toBe(true);

  const coursesRes = await request.get("http://127.0.0.1:3001/api/app/courses");
  expect(coursesRes.status()).toBe(200);
  const data = await coursesRes.json();
  expect(data.courses.length).toBeGreaterThan(0);
});`,
    playwrightCommand: "pnpm exec playwright test e2e/practice-api.spec.ts"
  },
  interviewQuestions: [
    {
      question: "How does Playwright's APIRequestContext differ from libraries like Axios, Supertest, or Fetch, and why is it preferred in Playwright test suites?",
      answer: "Playwright's APIRequestContext is natively integrated into the @playwright/test runner lifecycle. It automatically inherits global config options (baseURL, extraHTTPHeaders, timeout), shares network tracing artifacts in trace.zip, integrates with test reporter logs, and supports page.request to share browser cookies and authentication sessions. Unlike Supertest (which targets local Express apps directly), APIRequestContext makes real network calls over HTTP, allowing identical tests to run against local, staging, or containerized environments.",
      architecturalContext: "Eliminates third-party HTTP client dependencies, unifies test configuration, and enables seamless hybrid API/UI testing."
    },
    {
      question: "How do you design a hybrid API and UI test architecture to balance test execution speed with end-to-end customer confidence?",
      answer: "In a hybrid architecture, tests adhere to the principle: 'Set up with API, assert with UI, tear down with API'. For example, when testing a checkout review page, instead of automating 5 prerequisite pages (login, search, add-to-cart, shipping address, billing info) through the browser UI (which takes ~15 seconds and has multiple failure points), the test calls backend API endpoints in ~50ms to seed the shopping cart and user state, then uses page.goto() directly to the checkout review page to assert customer interactions. Cleanup is executed via API in a finally block.",
      architecturalContext: "Reduces execution runtime by up to 80% while preserving high-confidence verification of critical customer-facing UI components."
    },
    {
      question: "How do you ensure complete test data isolation and prevent collisions when running 50 parallel API test workers against a shared backend?",
      answer: "Achieving parallel safety requires three architectural pillars: 1) Deterministic Namespacing: Every test generates unique identifiers combining worker index and high-resolution timestamps (e.g. `CRS_W${test.info().workerIndex}_${Date.now()}`). 2) Dynamic Resource Scoping: Tests must never assert global list counts (e.g. expect(courses).toHaveLength(5)); instead, assert the presence or absence of the specific entity created by that test. 3) Guaranteed Teardown: Wrap all operations in try/finally blocks or test-scoped fixtures to delete created entities even if assertions fail.",
      architecturalContext: "Enables linear CI scaling across multi-core workers without database race conditions or flaky test crosstalk."
    },
    {
      question: "What are the architectural risks of treating HTTP response time assertions (e.g. expect(latency).toBeLessThan(100)) as functional test criteria in CI?",
      answer: "Response latency is subject to virtualization noise, CPU throttling on shared CI runners, garbage collection cycles, and network jitter. Setting rigid latency thresholds in functional tests introduces non-deterministic flakiness that fails builds when the application logic is 100% correct. Senior SDETs decouple functional testing from performance profiling: functional tests assert status codes and schemas; performance and SLA tracking is delegated to dedicated load testing tools (such as k6 or Locust) or recorded as OpenTelemetry metrics.",
      architecturalContext: "Maintains high signal-to-noise ratio in CI pipelines while isolating performance monitoring to appropriate tools."
    }
  ]
};
