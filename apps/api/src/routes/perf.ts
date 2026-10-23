import { Router } from "express";

export const perfRouter = Router();

// 1. Simulated Heavy Resource Endpoint
perfRouter.get("/heavy-resource", async (req, res) => {
  const delayMs = typeof req.query.delay === "string" ? Math.min(Number(req.query.delay) || 500, 3000) : 500;
  
  // Simulated delay
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  // Generate deterministic simulated chunked payload (~500KB)
  const items = Array.from({ length: 2500 }, (_, i) => ({
    id: `item_${i + 1}`,
    metricKey: `VITAL_METRIC_TELEMETRY_RECORD_${i + 1}`,
    value: Math.sin(i) * 100,
    timestamp: new Date(Date.now() - i * 1000).toISOString(),
    status: i % 2 === 0 ? "healthy" : "warning",
    payloadBlob: "ABCDEF1234567890".repeat(10),
  }));

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("X-Simulated-Payload-Size", "500KB");
  res.json({
    generatedAt: new Date().toISOString(),
    totalItems: items.length,
    items,
  });
});

// 2. Client Telemetry Ingestion Endpoint
perfRouter.post("/telemetry", (req, res) => {
  const { lcp, cls, fid, ttfb, userAgent } = req.body ?? {};

  res.status(201).json({
    status: "recorded",
    ingestedAt: new Date().toISOString(),
    metrics: {
      lcp: typeof lcp === "number" ? lcp : null,
      cls: typeof cls === "number" ? cls : null,
      fid: typeof fid === "number" ? fid : null,
      ttfb: typeof ttfb === "number" ? ttfb : null,
    },
    clientInfo: typeof userAgent === "string" ? userAgent : "unknown",
  });
});
