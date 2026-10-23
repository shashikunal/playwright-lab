import { Router } from "express";
import type { ChaosConfigPayload, ChaosEvent, ChaosState } from "@pil/shared";

export const chaosRouter = Router();

const DEFAULT_STATE: ChaosState = {
  active: false,
  intensity: "mild",
  latencyJitter: false,
  jitterRangeMs: [200, 1200],
  packetLossRate: 0,
  circuitBreakerThreshold: 3,
  consecutiveFailures: 0,
  circuitBreakerStatus: "CLOSED",
  domMutationChaos: false,
  cpuLagSimulation: false,
  injectedFaultCount: 0,
};

let currentState: ChaosState = { ...DEFAULT_STATE };
let eventHistory: ChaosEvent[] = [];

function recordEvent(type: ChaosEvent["type"], message: string) {
  const event: ChaosEvent = {
    id: `chaos-evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    message,
    timestamp: new Date().toISOString(),
  };
  eventHistory = [event, ...eventHistory].slice(0, 50);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// GET /api/lab/chaos/state
chaosRouter.get("/state", (_req, res) => {
  // Check half-open recovery condition
  if (currentState.circuitBreakerStatus === "OPEN" && currentState.circuitBreakerTripTime) {
    const elapsed = Date.now() - currentState.circuitBreakerTripTime;
    if (elapsed > 4000) {
      currentState.circuitBreakerStatus = "HALF-OPEN";
      recordEvent("circuit_breaker_recover", "Circuit breaker entering HALF-OPEN state (canary probe)");
    }
  }

  res.json({
    state: currentState,
    events: eventHistory.slice(0, 15),
  });
});

// POST /api/lab/chaos/configure
chaosRouter.post("/configure", (req, res) => {
  const payload = req.body as ChaosConfigPayload;

  currentState = {
    ...currentState,
    ...payload,
  };

  recordEvent("latency", `Chaos configuration updated: active=${currentState.active}, intensity=${currentState.intensity}`);
  res.json({ state: currentState });
});

// POST /api/lab/chaos/reset
chaosRouter.post("/reset", (_req, res) => {
  currentState = { ...DEFAULT_STATE };
  eventHistory = [];
  recordEvent("circuit_breaker_recover", "All chaos parameters restored to stable baseline");
  res.json({ state: currentState, message: "Chaos baseline restored" });
});

// GET /api/lab/chaos/events
chaosRouter.get("/events", (_req, res) => {
  res.json({ events: eventHistory });
});

// POST /api/lab/chaos/circuit-breaker/trip
chaosRouter.post("/circuit-breaker/trip", (_req, res) => {
  currentState.active = true;
  currentState.circuitBreakerStatus = "OPEN";
  currentState.circuitBreakerTripTime = Date.now();
  currentState.consecutiveFailures = currentState.circuitBreakerThreshold;
  currentState.injectedFaultCount += 1;
  recordEvent("circuit_breaker_trip", "Circuit breaker forcefully TRIPPED to OPEN");
  res.json({ state: currentState });
});

// POST /api/lab/chaos/circuit-breaker/reset
chaosRouter.post("/circuit-breaker/reset", (_req, res) => {
  currentState.circuitBreakerStatus = "CLOSED";
  currentState.consecutiveFailures = 0;
  currentState.circuitBreakerTripTime = undefined;
  recordEvent("circuit_breaker_recover", "Circuit breaker manually reset to CLOSED");
  res.json({ state: currentState });
});

// GET /api/lab/chaos/flaky-telemetry
chaosRouter.get("/flaky-telemetry", async (_req, res) => {
  // Check half-open transition
  if (currentState.circuitBreakerStatus === "OPEN" && currentState.circuitBreakerTripTime) {
    const elapsed = Date.now() - currentState.circuitBreakerTripTime;
    if (elapsed > 4000) {
      currentState.circuitBreakerStatus = "HALF-OPEN";
      recordEvent("circuit_breaker_recover", "Circuit breaker transitioning to HALF-OPEN canary");
    }
  }

  // Fast-fail if breaker is OPEN
  if (currentState.circuitBreakerStatus === "OPEN") {
    currentState.injectedFaultCount += 1;
    recordEvent("503_error", "HTTP 503: Fast-fail rejected by OPEN circuit breaker");
    return res.status(503).json({
      error: {
        code: "circuit_breaker_open",
        message: "Circuit breaker is OPEN. Upstream dependency isolated to protect downstream systems.",
        consecutiveFailures: currentState.consecutiveFailures,
        threshold: currentState.circuitBreakerThreshold,
      },
    });
  }

  // Latency Jitter simulation
  if (currentState.active && currentState.latencyJitter) {
    const [min, max] = currentState.jitterRangeMs;
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    recordEvent("latency", `Injected latency jitter: ${delay}ms delay`);
    await sleep(delay);
  }

  // Packet loss / intermittent failure simulation
  if (currentState.active && currentState.packetLossRate > 0 && Math.random() < currentState.packetLossRate) {
    currentState.consecutiveFailures += 1;
    currentState.injectedFaultCount += 1;
    recordEvent("packet_loss", `Synthetic packet loss / 503 error (${currentState.consecutiveFailures}/${currentState.circuitBreakerThreshold})`);

    // Check if threshold exceeded to trip breaker
    if (currentState.consecutiveFailures >= currentState.circuitBreakerThreshold) {
      currentState.circuitBreakerStatus = "OPEN";
      currentState.circuitBreakerTripTime = Date.now();
      recordEvent("circuit_breaker_trip", `Circuit breaker TRIPPED to OPEN after ${currentState.consecutiveFailures} consecutive failures`);
    }

    return res.status(503).json({
      error: {
        code: "chaos_synthetic_failure",
        message: "Chaos fault injected: 503 Service Unavailable",
        consecutiveFailures: currentState.consecutiveFailures,
        breakerStatus: currentState.circuitBreakerStatus,
      },
    });
  }

  // Successful probe heals circuit breaker if in HALF-OPEN
  if (currentState.circuitBreakerStatus === "HALF-OPEN") {
    currentState.circuitBreakerStatus = "CLOSED";
    currentState.consecutiveFailures = 0;
    currentState.circuitBreakerTripTime = undefined;
    recordEvent("circuit_breaker_recover", "Canary probe succeeded: Circuit breaker reset to CLOSED");
  } else {
    currentState.consecutiveFailures = 0;
  }

  return res.json({
    status: "ok",
    data: {
      uptimeSeconds: Math.floor(process.uptime()),
      healthyNodes: 12,
      activeConnections: 450,
      timestamp: new Date().toISOString(),
      circuitBreaker: currentState.circuitBreakerStatus,
    },
  });
});
