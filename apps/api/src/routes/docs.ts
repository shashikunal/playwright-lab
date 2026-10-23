import { Router } from "express";

export const docsRouter = Router();

export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Playwright Industrial Lab API",
    version: "1.0.0",
    description:
      "Enterprise REST API specification for Playwright automation practice. Backed by in-memory deterministic stores with configurable latency and error injection.",
    contact: {
      name: "Playwright Industrial Lab Engineering",
      url: "http://localhost:5173",
    },
  },
  servers: [
    {
      url: "/api",
      description: "Local Development API Server",
    },
  ],
  paths: {
    "/health": {
      get: {
        summary: "System Health Check",
        description: "Returns health status of the API server and in-memory persistence layer.",
        responses: {
          "200": {
            description: "Server is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    timestamp: { type: "string", format: "date-time" },
                    service: { type: "string", example: "playwright-industrial-lab-api" },
                    store: { type: "string", example: "memory" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/scenarios": {
      get: {
        summary: "Scenario Catalogue",
        description: "Returns list of practice scenarios with optional topic and difficulty filters.",
        parameters: [
          {
            name: "topic",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["locators", "forms", "widgets", "network", "business", "reliability", "browser"] },
          },
          {
            name: "difficulty",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
          },
          {
            name: "q",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "List of matched scenarios",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    scenarios: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ScenarioSummary" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/practice/auth/login": {
      post: {
        summary: "Practice Student Login",
        description: "Authenticates practice user (e.g. 'student' / 'Password123!') and issues session token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: { type: "string", example: "student" },
                  password: { type: "string", example: "Password123!" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Authentication successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string", example: "sim_prac_12345" },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        username: { type: "string" },
                        email: { type: "string" },
                        role: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": { description: "Missing required fields" },
          "401": { description: "Invalid username or password" },
          "423": { description: "Account locked" },
        },
      },
    },
    "/practice/auth/me": {
      get: {
        summary: "Current Practice Session",
        description: "Validates bearer session token and returns active student identity.",
        security: [{ BearerAuth: [] }],
        responses: {
          "200": { description: "Active session details" },
          "401": { description: "Unauthorized or expired session" },
        },
      },
    },
    "/practice/auth/logout": {
      post: {
        summary: "Practice Session Logout",
        description: "Invalidates active practice session token in server memory.",
        security: [{ BearerAuth: [] }],
        responses: {
          "200": { description: "Logged out successfully" },
        },
      },
    },
    "/practice/auth/forgot-password": {
      post: {
        summary: "Practice Forgot Password",
        description: "Initiates simulated password reset for known student account.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["identity"],
                properties: {
                  identity: { type: "string", example: "student" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Simulated reset token dispatched" },
          "404": { description: "User not found" },
        },
      },
    },
    "/practice/auth/reset-password": {
      post: {
        summary: "Practice Password Reset",
        description: "Updates user password using simulated reset token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token", "newPassword"],
                properties: {
                  token: { type: "string" },
                  newPassword: { type: "string", example: "BrandNewPass2026!" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Password updated successfully" },
          "400": { description: "Invalid or expired reset token" },
        },
      },
    },
    "/app/courses": {
      get: {
        summary: "List Business Courses",
        description: "Retrieves paginated course catalogue with search and level filters.",
        responses: {
          "200": { description: "List of courses" },
        },
      },
      post: {
        summary: "Create Course (Trainer/Admin)",
        description: "Creates new course entry in the enterprise catalogue.",
        responses: {
          "201": { description: "Course created successfully" },
          "403": { description: "Forbidden for Learner persona" },
        },
      },
    },
    "/app/enrollments": {
      get: {
        summary: "List Enrollments",
        description: "Retrieves list of student enrollments with order totals and status.",
        responses: {
          "200": { description: "List of enrollments" },
        },
      },
      post: {
        summary: "Submit Enrollment Order",
        description: "Creates an enrollment transaction with participant validation.",
        responses: {
          "201": { description: "Enrollment confirmed" },
        },
      },
    },
    "/lab/network/settings": {
      get: {
        summary: "Get Scenario Control Settings",
        description: "Returns currently active latency, status code overrides, and empty-state flags.",
        responses: {
          "200": { description: "Current scenario settings" },
        },
      },
      post: {
        summary: "Update Scenario Control Settings",
        description: "Applies latency delays or injected HTTP failure codes.",
        responses: {
          "200": { description: "Settings updated" },
        },
      },
    },
    "/lab/network/reset": {
      post: {
        summary: "Reset Network Controls",
        description: "Restores default 0ms latency and 200 OK responses.",
        responses: {
          "200": { description: "Controls reset to defaults" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
    schemas: {
      ScenarioSummary: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          topic: { type: "string" },
          difficulty: { type: "string" },
          route: { type: "string" },
          status: { type: "string" },
          concepts: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    },
  },
};

// Return raw OpenAPI 3.1 JSON specification
docsRouter.get("/openapi.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(openApiSpec);
});

// Interactive HTML Documentation Explorer
docsRouter.get("/", (_req, res) => {
  const pathsCount = Object.keys(openApiSpec.paths).length;
  const pathsList = Object.entries(openApiSpec.paths)
    .map(([path, methods]) => {
      const methodEntries = Object.entries(methods)
        .map(([m, op]: [string, any]) => {
          const color =
            m === "get"
              ? "bg-blue-500/10 text-blue-500 border-blue-500/30"
              : m === "post"
              ? "bg-green-500/10 text-green-500 border-green-500/30"
              : m === "delete"
              ? "bg-red-500/10 text-red-500 border-red-500/30"
              : "bg-orange-500/10 text-orange-500 border-orange-500/30";

          return `
          <div class="border border-neutral-700/60 rounded-lg p-4 bg-neutral-900/40 space-y-2 mb-3">
            <div class="flex items-center gap-3">
              <span class="uppercase font-mono font-bold text-xs px-2.5 py-1 rounded border ${color}">${m}</span>
              <span class="font-mono text-sm text-neutral-200 font-semibold">${path}</span>
              <span class="text-xs text-neutral-400">— ${op.summary || ""}</span>
            </div>
            <p class="text-xs text-neutral-400">${op.description || ""}</p>
            <div class="pt-2 flex items-center gap-3">
              <button onclick="tryEndpoint('${m}', '${path}')" class="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-medium cursor-pointer transition">
                Try It Out
              </button>
              <span class="text-[11px] text-neutral-500 font-mono">Status: 200 / 400 / 401</span>
            </div>
          </div>
          `;
        })
        .join("");
      return methodEntries;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Playwright Industrial Lab — OpenAPI Documentation</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0c0d0e; color: #f4f4f5; font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body class="p-6 md:p-12 max-w-5xl mx-auto space-y-8" data-testid="api-docs-container">
  <header class="border-b border-neutral-800 pb-6 flex flex-wrap items-center justify-between gap-4">
    <div>
      <div class="flex items-center gap-2.5">
        <span class="size-3 rounded-full bg-amber-500 animate-pulse"></span>
        <h1 class="text-2xl font-bold text-white tracking-tight" data-testid="api-docs-title">Playwright Industrial Lab API</h1>
      </div>
      <p class="text-sm text-neutral-400 mt-1">Interactive OpenAPI 3.1.0 specification and testing explorer.</p>
    </div>
    <div class="flex items-center gap-3">
      <a href="/api/docs/openapi.json" target="_blank" class="px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 text-xs font-mono text-neutral-300 hover:text-white hover:border-neutral-500 transition" data-testid="raw-spec-link">
        Raw OpenAPI JSON
      </a>
      <span class="text-xs font-mono px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20" data-testid="endpoints-count">
        ${pathsCount} Endpoints
      </span>
    </div>
  </header>

  <!-- Interactive Sandbox Results Output -->
  <section id="results-panel" class="hidden rounded-xl border border-neutral-700 bg-neutral-900/90 p-5 space-y-3">
    <div class="flex items-center justify-between">
      <span class="text-xs font-bold uppercase tracking-wider text-amber-400" id="results-method">Response</span>
      <span class="text-xs font-mono text-neutral-400" id="results-status">HTTP 200</span>
    </div>
    <pre class="bg-black/60 p-4 rounded-lg text-xs font-mono text-neutral-300 overflow-x-auto border border-neutral-800" id="results-body">{}</pre>
  </section>

  <!-- Path List -->
  <main class="space-y-4">
    <h2 class="text-base font-semibold text-neutral-200">Documented REST Endpoints</h2>
    <div data-testid="endpoints-list">
      ${pathsList}
    </div>
  </main>

  <script>
    async function tryEndpoint(method, path) {
      const panel = document.getElementById('results-panel');
      const methodLabel = document.getElementById('results-method');
      const statusLabel = document.getElementById('results-status');
      const bodyPre = document.getElementById('results-body');

      panel.classList.remove('hidden');
      methodLabel.innerText = method.toUpperCase() + ' ' + '/api' + path;
      bodyPre.innerText = 'Calling /api' + path + '...';

      try {
        const url = '/api' + path.replace(/\\{[^}]+\\}/g, '1');
        const res = await fetch(url, {
          method: method.toUpperCase(),
          headers: { 'Content-Type': 'application/json' }
        });
        statusLabel.innerText = 'HTTP ' + res.status + ' ' + res.statusText;
        const data = await res.json().catch(() => ({ message: 'Non-JSON response' }));
        bodyPre.innerText = JSON.stringify(data, null, 2);
      } catch (err) {
        statusLabel.innerText = 'Network Error';
        bodyPre.innerText = String(err);
      }
    }
  </script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});
