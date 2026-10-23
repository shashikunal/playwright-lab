import { expect, test } from "@playwright/test";

test.describe("Playwright API Testing — Hands-On Practice", () => {
  // Exercise 1: Send a GET request and validate its status
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
  });

  // Exercise 2: Send a POST request with a JSON body
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
  });

  // Exercise 3: Validate response headers and JSON fields
  test("Exercise 3: Validate response headers and JSON fields", async ({ request }) => {
    const response = await request.get("http://127.0.0.1:3001/api/app/courses");
    expect(response.status()).toBe(200);

    // Verify critical HTTP response headers
    const headers = response.headers();
    expect(headers["content-type"]).toContain("application/json");
    expect(headers["x-content-type-options"]).toBe("nosniff");

    // Verify structured JSON fields
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
  });

  // Exercise 4: Complete a CRUD workflow with isolated test data
  test("Exercise 4: Complete a CRUD workflow with isolated test data", async ({ request }) => {
    const authHeaders = {
      Authorization: "Bearer tok_admin_session",
    };
    const timestamp = Date.now();
    const courseCode = `CRUD-${timestamp.toString().slice(-4)}`;
    const courseTitle = `Automated CRUD Course ${timestamp}`;

    // 1. Create (POST)
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
    expect(course.id).toBeDefined();
    expect(course.code).toBe(courseCode);

    try {
      // 2. Read (GET)
      const readRes = await request.get(`http://127.0.0.1:3001/api/app/courses/${course.id}`);
      expect(readRes.status()).toBe(200);
      const readBody = await readRes.json();
      expect(readBody.course.title).toBe(courseTitle);

      // 3. Update (PUT)
      const updateRes = await request.put(`http://127.0.0.1:3001/api/app/courses/${course.id}`, {
        headers: authHeaders,
        data: {
          title: `${courseTitle} (Updated)`,
          price: 399,
        },
      });
      expect(updateRes.status()).toBe(200);
      const updateBody = await updateRes.json();
      expect(updateBody.course.title).toBe(`${courseTitle} (Updated)`);
      expect(updateBody.course.price).toBe(399);

      // 4. Delete (DELETE)
      const deleteRes = await request.delete(`http://127.0.0.1:3001/api/app/courses/${course.id}`, {
        headers: authHeaders,
      });
      expect(deleteRes.status()).toBe(200);
      const deleteBody = await deleteRes.json();
      expect(deleteBody.status).toBe("deleted");

      // 5. Verify Deletion (GET -> 404)
      const verifyRes = await request.get(`http://127.0.0.1:3001/api/app/courses/${course.id}`);
      expect(verifyRes.status()).toBe(404);
    } finally {
      // Ensure cleanup in case assertions failed
      await request.delete(`http://127.0.0.1:3001/api/app/courses/${course.id}`, {
        headers: authHeaders,
      }).catch(() => {});
    }
  });

  // Exercise 5: Test missing and invalid request fields
  test("Exercise 5: Test missing and invalid request fields", async ({ request }) => {
    const authHeaders = {
      Authorization: "Bearer tok_admin_session",
    };

    // 1. Missing required fields on course creation (400 Bad Request)
    const badReqRes = await request.post("http://127.0.0.1:3001/api/app/courses", {
      headers: authHeaders,
      data: {
        price: 299,
      },
    });
    expect(badReqRes.status()).toBe(400);
    const badReqBody = await badReqRes.json();
    expect(badReqBody.error.code).toBe("invalid_payload");
    expect(badReqBody.error.message).toContain("Title and course code are required");

    // 2. Semantic validation constraints on intake form (422 Unprocessable Entity)
    const unprocessableRes = await request.post("http://127.0.0.1:3001/api/lab/forms/intake", {
      data: {
        fullName: "A", // Min 2 chars required
        email: "not-an-email",
        seats: 99, // Max 12 allowed
        startDate: "invalid-date",
        agree: false,
      },
    });
    expect(unprocessableRes.status()).toBe(422);
    const unprocBody = await unprocessableRes.json();
    expect(unprocBody.error.code).toBe("validation_error");
    expect(Array.isArray(unprocBody.error.details)).toBe(true);
    expect(unprocBody.error.details.length).toBeGreaterThan(0);
  });

  // Exercise 6: Verify unauthorized and forbidden access
  test("Exercise 6: Verify unauthorized and forbidden access", async ({ request }) => {
    // 1. Unauthenticated request to protected me endpoint (401 Unauthorized)
    const unauthRes = await request.get("http://127.0.0.1:3001/api/app/auth/me");
    expect(unauthRes.status()).toBe(401);
    const unauthBody = await unauthRes.json();
    expect(unauthBody.error.code).toBe("unauthorized");

    // 2. Insufficient role for course creation: learner cannot create courses (403 Forbidden)
    const forbiddenCreateRes = await request.post("http://127.0.0.1:3001/api/app/courses", {
      headers: {
        Authorization: "Bearer tok_learner_session",
      },
      data: {
        code: "UNAUTH-101",
        title: "Unauthorized Course",
      },
    });
    expect(forbiddenCreateRes.status()).toBe(403);
    const forbiddenBody = await forbiddenCreateRes.json();
    expect(forbiddenBody.error.code).toBe("forbidden");

    // 3. Insufficient role for course deletion: trainer cannot delete courses (403 Forbidden)
    const forbiddenDeleteRes = await request.delete("http://127.0.0.1:3001/api/app/courses/crs_playwright_101", {
      headers: {
        Authorization: "Bearer tok_trainer_session",
      },
    });
    expect(forbiddenDeleteRes.status()).toBe(403);
  });

  // Exercise 7: Test pagination and filtering
  test("Exercise 7: Test pagination and filtering", async ({ request }) => {
    const authHeaders = {
      Authorization: "Bearer tok_admin_session",
    };

    // Query page 1 with limit 3, filtered by role 'learner'
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

    // Assert that every returned user matches the requested filter
    for (const user of data.users) {
      expect(user.role).toBe("learner");
    }
  });

  // Exercise 8: Create data through an API and verify it in the browser
  test("Exercise 8: Create data through an API and verify it in the browser", async ({
    request,
    page,
  }) => {
    const timestamp = Date.now();
    const courseCode = `E2E-${timestamp.toString().slice(-4)}`;
    const courseTitle = `Hybrid Seeded Course ${timestamp}`;

    // 1. Instant API creation (<50ms)
    const createRes = await request.post("http://127.0.0.1:3001/api/app/courses", {
      headers: {
        Authorization: "Bearer tok_admin_session",
      },
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
      // 2. Navigate to browser UI and verify course appears in the catalogue grid
      await page.goto("/app/courses");
      await expect(page.getByText(courseTitle)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(courseCode)).toBeVisible();
    } finally {
      // 3. Teardown via API
      await request.delete(`http://127.0.0.1:3001/api/app/courses/${course.id}`, {
        headers: {
          Authorization: "Bearer tok_admin_session",
        },
      }).catch(() => {});
    }
  });

  // Exercise 9: Diagnose a failing API assertion
  test("Exercise 9: Diagnose a failing API assertion", async ({ request }) => {
    const nonExistentId = "crs_non_existent_999";
    const response = await request.get(`http://127.0.0.1:3001/api/app/courses/${nonExistentId}`);

    // Verify non-200 status code and diagnostic body
    expect(response.status()).toBe(404);
    expect(response.ok()).toBe(false);

    const body = await response.json();
    expect(body.error.code).toBe("not_found");
    expect(body.error.message).toBe("Course not found");
  });

  // Exercise 10: Build a reusable API fixture
  test("Exercise 10: Build a reusable API fixture", async ({ request }) => {
    // Helper simulating a reusable entity factory with auto-cleanup
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
        await request.delete(`http://127.0.0.1:3001/api/app/courses/${course.id}`, {
          headers: authHeaders,
        });
      }
    }

    const testId = Date.now().toString().slice(-4);
    await withCourse(
      { code: `FIX-${testId}`, title: `Fixture Managed Course ${testId}` },
      async (course) => {
        const verifyRes = await request.get(`http://127.0.0.1:3001/api/app/courses/${course.id}`);
        expect(verifyRes.status()).toBe(200);
        const { course: fetched } = await verifyRes.json();
        expect(fetched.code).toBe(`FIX-${testId}`);
      }
    );
  });

  // Exercise 11: Run independent API tests safely in parallel
  test("Exercise 11: Run independent API tests safely in parallel", async ({ request }) => {
    // Generate worker-isolated namespace and entity code
    const workerId = process.env.TEST_WORKER_INDEX || "0";
    const timestamp = Date.now();
    const isolatedCode = `PAR-W${workerId}-${timestamp.toString().slice(-4)}`;

    const createRes = await request.post("http://127.0.0.1:3001/api/app/courses", {
      headers: {
        Authorization: "Bearer tok_admin_session",
        "x-worker-namespace": `worker_${workerId}`,
      },
      data: {
        code: isolatedCode,
        title: `Parallel Isolated Course W${workerId}`,
        category: "Concurrency",
        difficulty: "advanced",
        seats: 20,
        price: 299,
      },
    });

    expect(createRes.status()).toBe(201);
    const { course } = await createRes.json();

    try {
      // Query course list and assert our isolated entity exists without colliding with other workers
      const listRes = await request.get("http://127.0.0.1:3001/api/app/courses", {
        params: { q: isolatedCode },
      });
      expect(listRes.status()).toBe(200);
      const data = await listRes.json();
      expect(data.courses.some((c: { code: string }) => c.code === isolatedCode)).toBe(true);
    } finally {
      await request.delete(`http://127.0.0.1:3001/api/app/courses/${course.id}`, {
        headers: { Authorization: "Bearer tok_admin_session" },
      }).catch(() => {});
    }
  });

  // Exercise 12: Complete a senior-level API/UI integration challenge
  test("Exercise 12: Complete a senior-level API/UI integration challenge", async ({
    request,
    page,
  }) => {
    // 1. Authenticate through the Practice Auth API (<30ms)
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

    // 2. Verify current session via API
    const meRes = await request.get("http://127.0.0.1:3001/api/practice/auth/me", {
      headers: {
        Authorization: `Bearer ${loginData.token}`,
      },
    });
    expect(meRes.status()).toBe(200);
    const meData = await meRes.json();
    expect(meData.user.username).toBe("student");

    // 3. Inject authenticated token into browser localStorage and deep link to dashboard
    await page.goto("/practice/login");
    await page.evaluate(({ token, user }) => {
      localStorage.setItem("pil-practice-token", token);
      localStorage.setItem("pil-practice-user", JSON.stringify(user));
    }, { token: loginData.token, user: loginData.user });

    // Navigate to protected dashboard; SPA detects active session and bypasses login form
    await page.goto("/practice/dashboard");
    await expect(page).toHaveURL(/.*\/practice\/dashboard/);
    await expect(page.getByTestId("welcome-message")).toContainText("Welcome, student!");
    await expect(page.getByTestId("user-role-badge")).toContainText("STUDENT");

    // 4. Invalidate session via API and verify UI reacts to logout
    const logoutRes = await request.post("http://127.0.0.1:3001/api/practice/auth/logout", {
      headers: {
        Authorization: `Bearer ${loginData.token}`,
      },
    });
    expect(logoutRes.status()).toBe(200);

    // Logout from UI
    await page.getByTestId("logout-btn").click();
    await expect(page).toHaveURL(/.*\/practice\/login\?loggedOut=true/);
  });
});
