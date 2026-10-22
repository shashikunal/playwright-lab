import { apiError, type NetworkItem, type NetworkListResponse } from "@pil/shared";
import { Router } from "express";
import { defaultScenario, getScenarioControls, resetNamespace, updateScenarioControls } from "../store/memory.js";

export const networkRouter = Router();

const initialItems: NetworkItem[] = [
  { id: "NET-01", title: "Cluster Snapshot Ingestion", category: "backup", latencyMs: 25, timestamp: "2026-10-22T10:00:00Z" },
  { id: "NET-02", title: "Edge Cache Invalidation", category: "cdn", latencyMs: 12, timestamp: "2026-10-22T10:05:00Z" },
  { id: "NET-03", title: "User Session Revocation Audit", category: "security", latencyMs: 40, timestamp: "2026-10-22T10:10:00Z" },
  { id: "NET-04", title: "Telemetry Stream Pipeline Flush", category: "telemetry", latencyMs: 18, timestamp: "2026-10-22T10:15:00Z" },
  { id: "NET-05", title: "TLS Certificate Auto-Renewal", category: "security", latencyMs: 85, timestamp: "2026-10-22T10:20:00Z" },
];

let itemsStore = [...initialItems];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Controls management
networkRouter.get("/controls", (_req, res) => {
  const scenario = getScenarioControls("shared");
  res.json({ scenario });
});

networkRouter.post("/controls", (req, res) => {
  const { latencyMs, empty, statusOverride } = req.body ?? {};
  const updated = updateScenarioControls("shared", {
    ...(typeof latencyMs === "number" ? { latencyMs } : {}),
    ...(typeof empty === "boolean" ? { empty } : {}),
    ...(statusOverride === null || typeof statusOverride === "number" ? { statusOverride } : {}),
  });
  res.json({ scenario: updated });
});

networkRouter.post("/reset", (_req, res) => {
  resetNamespace("shared");
  itemsStore = [...initialItems];
  res.json({ status: "ok", scenario: defaultScenario() });
});

// Items fetcher with latency and status override
networkRouter.get("/items", async (req, res) => {
  const scenario = getScenarioControls("shared");

  if (scenario.latencyMs > 0) {
    await sleep(scenario.latencyMs);
  }

  if (scenario.statusOverride) {
    const code = scenario.statusOverride;
    const msg =
      code === 400
        ? "Bad Request: simulated invalid query parameter"
        : code === 401
        ? "Unauthorized: session token expired or missing"
        : code === 403
        ? "Forbidden: insufficient permissions for telemetry access"
        : code === 404
        ? "Not Found: requested telemetry resource was not found"
        : code === 429
        ? "Too Many Requests: rate limit of 60 req/min exceeded"
        : code === 500
        ? "Internal Server Error: simulated upstream database outage"
        : `Simulated HTTP ${code} error`;
    res.status(code).json(apiError(`simulated_${code}`, msg));
    return;
  }

  if (scenario.empty) {
    const emptyResponse: NetworkListResponse = {
      items: [],
      total: 0,
      latencyApplied: scenario.latencyMs,
    };
    res.json(emptyResponse);
    return;
  }

  const q = String(req.query.q ?? "").trim().toLowerCase();
  let filtered = itemsStore;
  if (q) {
    filtered = itemsStore.filter(
      (item) => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q),
    );
  }

  const response: NetworkListResponse = {
    items: filtered,
    total: filtered.length,
    latencyApplied: scenario.latencyMs,
  };
  res.json(response);
});

// Items creation with simulated rollback/failure
networkRouter.post("/items", async (req, res) => {
  const scenario = getScenarioControls("shared");

  if (scenario.latencyMs > 0) {
    await sleep(scenario.latencyMs);
  }

  if (scenario.statusOverride) {
    res.status(scenario.statusOverride).json(apiError(`simulated_${scenario.statusOverride}`, "Item creation failed"));
    return;
  }

  const { title, category } = req.body ?? {};
  if (!title || typeof title !== "string") {
    res.status(400).json(apiError("invalid_title", "Title is required"));
    return;
  }

  const newItem: NetworkItem = {
    id: `NET-${String(itemsStore.length + 1).padStart(2, "0")}`,
    title,
    category: typeof category === "string" ? category : "custom",
    latencyMs: 15,
    timestamp: new Date().toISOString(),
  };

  itemsStore.unshift(newItem);
  res.status(201).json(newItem);
});
