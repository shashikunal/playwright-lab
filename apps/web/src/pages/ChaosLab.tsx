import type { ChaosConfigPayload, ChaosEvent, ChaosIntensity, ChaosState } from "@pil/shared";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Flame,
  Layers,
  Loader2,
  Network,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Terminal,
  Wifi,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

type TelemetryResult =
  | { status: "idle" }
  | { status: "loading"; timestamp: number }
  | { status: "success"; data: Record<string, unknown>; durationMs: number }
  | { status: "error"; code: number; message: string; durationMs: number };

export function ChaosLab() {
  // Chaos configuration state
  const [chaosState, setChaosState] = useState<ChaosState>({
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
  });

  const [events, setEvents] = useState<ChaosEvent[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(false);

  // Network playground state
  const [telemetryResult, setTelemetryResult] = useState<TelemetryResult>({ status: "idle" });

  // DOM mutation flakiness state
  const [remountCounter, setRemountCounter] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [fleetingBannerVisible, setFleetingBannerVisible] = useState(false);
  const fleetingTimerRef = useRef<number | null>(null);

  // Overlay state
  const [overlayActive, setOverlayActive] = useState(false);

  // Sluggish input state
  const [sluggishText, setSluggishText] = useState("");
  const [typingLagMs, setTypingLagMs] = useState(0);

  // Fetch current state from API
  const refreshChaosState = useCallback(async () => {
    try {
      const res = await fetch("/api/lab/chaos/state");
      if (res.ok) {
        const body = await res.json();
        setChaosState(body.state);
        if (Array.isArray(body.events)) {
          setEvents(body.events);
        }
      }
    } catch {
      // offline or server down fallback
    }
  }, []);

  useEffect(() => {
    refreshChaosState();
    const interval = setInterval(refreshChaosState, 3000);
    return () => clearInterval(interval);
  }, [refreshChaosState]);

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

  // Update configuration helper
  const updateConfig = async (payload: ChaosConfigPayload) => {
    setChaosState((prev) => ({ ...prev, ...payload }));
    setLoadingConfig(true);
    try {
      const res = await fetch("/api/lab/chaos/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const body = await res.json();
        setChaosState(body.state);
      }
    } finally {
      setLoadingConfig(false);
    }
  };

  // Reset helper
  const handleReset = async () => {
    setChaosState({ ...DEFAULT_STATE });
    setEvents([]);
    setOverlayActive(false);
    setFleetingBannerVisible(false);
    setClickCount(0);
    setSluggishText("");
    setTelemetryResult({ status: "idle" });
    setLoadingConfig(true);
    try {
      const res = await fetch("/api/lab/chaos/reset", { method: "POST" });
      if (res.ok) {
        const body = await res.json();
        setChaosState(body.state);
      }
    } finally {
      setLoadingConfig(false);
    }
  };

  // Preset profiles
  const applyPreset = (preset: "jitter" | "dom" | "breaker" | "storm") => {
    switch (preset) {
      case "jitter":
        updateConfig({
          active: true,
          intensity: "moderate",
          latencyJitter: true,
          jitterRangeMs: [300, 1500],
          packetLossRate: 0.2,
          circuitBreakerThreshold: 3,
          domMutationChaos: false,
          cpuLagSimulation: false,
        });
        break;
      case "dom":
        updateConfig({
          active: true,
          intensity: "moderate",
          latencyJitter: false,
          packetLossRate: 0,
          domMutationChaos: true,
          cpuLagSimulation: false,
        });
        break;
      case "breaker":
        updateConfig({
          active: true,
          intensity: "extreme",
          latencyJitter: false,
          packetLossRate: 0.8,
          circuitBreakerThreshold: 2,
          domMutationChaos: false,
          cpuLagSimulation: false,
        });
        break;
      case "storm":
        updateConfig({
          active: true,
          intensity: "extreme",
          latencyJitter: true,
          jitterRangeMs: [500, 2000],
          packetLossRate: 0.5,
          circuitBreakerThreshold: 3,
          domMutationChaos: true,
          cpuLagSimulation: true,
        });
        break;
    }
  };

  // Fetch telemetry from chaos endpoint
  const fetchTelemetry = async () => {
    const start = performance.now();
    setTelemetryResult({ status: "loading", timestamp: start });

    try {
      const res = await fetch("/api/lab/chaos/flaky-telemetry");
      const durationMs = Math.round(performance.now() - start);

      if (res.ok) {
        const body = await res.json();
        setTelemetryResult({ status: "success", data: body.data, durationMs });
      } else {
        const errorBody = await res.json().catch(() => ({}));
        setTelemetryResult({
          status: "error",
          code: res.status,
          message: errorBody.error?.message || `HTTP ${res.status}`,
          durationMs,
        });
      }
      refreshChaosState();
    } catch (err: unknown) {
      const durationMs = Math.round(performance.now() - start);
      const msg = err instanceof Error ? err.message : "Network error";
      setTelemetryResult({ status: "error", code: 0, message: msg, durationMs });
    }
  };

  // Manual breaker controls
  const tripBreaker = async () => {
    await fetch("/api/lab/chaos/circuit-breaker/trip", { method: "POST" });
    refreshChaosState();
  };

  const resetBreaker = async () => {
    await fetch("/api/lab/chaos/circuit-breaker/reset", { method: "POST" });
    refreshChaosState();
  };

  // Remount ticker for DOM chaos
  useEffect(() => {
    if (!chaosState.active || !chaosState.domMutationChaos) return;
    const interval = setInterval(() => {
      setRemountCounter((prev) => prev + 1);
    }, 850);
    return () => clearInterval(interval);
  }, [chaosState.active, chaosState.domMutationChaos]);

  // Fleeting banner trigger
  const triggerFleetingBanner = () => {
    if (fleetingTimerRef.current) {
      window.clearTimeout(fleetingTimerRef.current);
    }
    setFleetingBannerVisible(true);
    fleetingTimerRef.current = window.setTimeout(() => {
      setFleetingBannerVisible(false);
    }, 1600);
  };

  // Sluggish input simulation
  const handleSluggishInput = (val: string) => {
    if (chaosState.active && chaosState.cpuLagSimulation) {
      const start = performance.now();
      // Synthetic main-thread CPU spin to create sluggish input handling
      while (performance.now() - start < 45) {
        // intentional delay
      }
      setTypingLagMs(Math.round(performance.now() - start));
    } else {
      setTypingLagMs(0);
    }
    setSluggishText(val);
  };

  // Freeze thread button
  const freezeThread = () => {
    const start = performance.now();
    while (performance.now() - start < 400) {
      // synchronous main thread spin
    }
  };

  const breakerColors: Record<string, string> = {
    CLOSED: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    OPEN: "bg-red-500/15 text-red-500 border-red-500/30",
    "HALF-OPEN": "bg-amber-500/15 text-amber-500 border-amber-500/30",
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8" data-testid="chaos-lab-page">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-accent">Laboratory 12</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-text sm:text-3xl">
              Chaos Engineering & System Resilience
            </h1>
          </div>
          <Badge tone={chaosState.active ? "warning" : "neutral"}>
            {chaosState.active ? "CHAOS INJECTION ACTIVE" : "STABLE BASELINE"}
          </Badge>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Battle-test Playwright test suites against real-world chaos: latency jitter, packet loss, 503 circuit breakers, DOM remounting, ephemeral elements, and sluggish main-thread performance.
        </p>
      </div>

      {/* Chaos Control Deck */}
      <section
        aria-labelledby="chaos-control-heading"
        className="rounded-xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-6"
        data-testid="chaos-control-deck"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <span
              className={`grid size-9 place-items-center rounded-lg ${
                chaosState.active ? "bg-amber-500 text-white animate-pulse" : "bg-surface-muted text-muted"
              }`}
            >
              <Flame size={20} />
            </span>
            <div>
              <h2 id="chaos-control-heading" className="text-base font-bold text-text">
                Chaos Injection Control Deck
              </h2>
              <p className="text-xs text-muted">
                Injected Faults: <strong className="text-accent font-mono">{chaosState.injectedFaultCount}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              className="text-xs px-2.5 py-1.5"
              onClick={handleReset}
              disabled={loadingConfig}
              data-testid="chaos-reset-btn"
            >
              <RotateCcw size={14} className="mr-1.5" />
              Reset to Stable
            </Button>

            <button
              type="button"
              onClick={() => updateConfig({ active: !chaosState.active })}
              data-testid="chaos-master-toggle"
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                chaosState.active
                  ? "bg-danger text-white hover:bg-danger/90 shadow-xs"
                  : "bg-surface-muted text-muted hover:text-text border border-border"
              }`}
            >
              <Zap size={14} />
              {chaosState.active ? "Chaos Active (Disable)" : "Enable Chaos"}
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Fault Scenarios</h3>
          <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => applyPreset("jitter")}
              data-testid="preset-jitter-btn"
              className="rounded-lg border border-border bg-surface-muted/50 p-3 text-left hover:border-accent hover:bg-surface-muted transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-text">
                <Wifi size={14} className="text-accent" />
                Network Jitter
              </div>
              <p className="mt-1 text-[11px] text-muted leading-snug">Spikes latency & packet drops</p>
            </button>

            <button
              type="button"
              onClick={() => applyPreset("dom")}
              data-testid="preset-dom-btn"
              className="rounded-lg border border-border bg-surface-muted/50 p-3 text-left hover:border-accent hover:bg-surface-muted transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-text">
                <Layers size={14} className="text-accent" />
                DOM Mutations
              </div>
              <p className="mt-1 text-[11px] text-muted leading-snug">Rapid unmounts & fleeting tags</p>
            </button>

            <button
              type="button"
              onClick={() => applyPreset("breaker")}
              data-testid="preset-breaker-btn"
              className="rounded-lg border border-border bg-surface-muted/50 p-3 text-left hover:border-accent hover:bg-surface-muted transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-text">
                <ShieldAlert size={14} className="text-amber-500" />
                Circuit Breaker
              </div>
              <p className="mt-1 text-[11px] text-muted leading-snug">Trip 503 & test canary recovery</p>
            </button>

            <button
              type="button"
              onClick={() => applyPreset("storm")}
              data-testid="preset-storm-btn"
              className="rounded-lg border border-danger/40 bg-danger/5 p-3 text-left hover:border-danger hover:bg-danger/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-danger">
                <AlertOctagon size={14} />
                Chaos Storm
              </div>
              <p className="mt-1 text-[11px] text-muted leading-snug">All failure vectors active</p>
            </button>
          </div>
        </div>

        {/* Feature Switches & Intensity */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted/30 p-3">
            <label htmlFor="toggle-jitter-switch" className="text-xs font-medium text-text cursor-pointer">
              Latency Jitter
            </label>
            <input
              id="toggle-jitter-switch"
              type="checkbox"
              checked={chaosState.latencyJitter}
              onChange={(e) => updateConfig({ latencyJitter: e.target.checked })}
              data-testid="toggle-jitter-switch"
              className="size-4 rounded accent-accent cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted/30 p-3">
            <label htmlFor="toggle-dom-switch" className="text-xs font-medium text-text cursor-pointer">
              DOM Remounting
            </label>
            <input
              id="toggle-dom-switch"
              type="checkbox"
              checked={chaosState.domMutationChaos}
              onChange={(e) => updateConfig({ domMutationChaos: e.target.checked })}
              data-testid="toggle-dom-switch"
              className="size-4 rounded accent-accent cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted/30 p-3">
            <label htmlFor="toggle-cpu-switch" className="text-xs font-medium text-text cursor-pointer">
              CPU Typing Lag
            </label>
            <input
              id="toggle-cpu-switch"
              type="checkbox"
              checked={chaosState.cpuLagSimulation}
              onChange={(e) => updateConfig({ cpuLagSimulation: e.target.checked })}
              data-testid="toggle-cpu-switch"
              className="size-4 rounded accent-accent cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted/30 p-3">
            <span className="text-xs font-medium text-text">Intensity</span>
            <select
              value={chaosState.intensity}
              onChange={(e) => updateConfig({ intensity: e.target.value as ChaosIntensity })}
              data-testid="chaos-intensity-select"
              className="rounded border border-border bg-surface px-2 py-1 text-xs text-text"
            >
              <option value="mild">Mild (10%)</option>
              <option value="moderate">Moderate (35%)</option>
              <option value="extreme">Extreme (70%)</option>
            </select>
          </div>
        </div>

        {/* Live Fault Telemetry Stream */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono text-muted mb-1.5">
            <span className="flex items-center gap-1.5">
              <Terminal size={13} className="text-accent" />
              Live Fault Event Stream (Latest 10)
            </span>
            <span>{events.length} logged events</span>
          </div>
          <div
            className="h-28 overflow-y-auto rounded-lg border border-border bg-black/60 p-3 font-mono text-xs text-stone-300 space-y-1"
            data-testid="chaos-event-stream"
          >
            {events.length === 0 ? (
              <p className="text-stone-500 italic">No chaos events recorded yet. Run a fault scenario above.</p>
            ) : (
              events.map((evt) => (
                <div key={evt.id} className="flex items-start gap-2">
                  <span className="text-stone-500 select-none">
                    [{new Date(evt.timestamp).toLocaleTimeString()}]
                  </span>
                  <span
                    className={
                      evt.type.includes("trip") || evt.type.includes("503")
                        ? "text-red-400 font-semibold"
                        : evt.type.includes("recover")
                        ? "text-emerald-400 font-semibold"
                        : "text-amber-300"
                    }
                  >
                    {evt.type.toUpperCase()}:
                  </span>
                  <span className="text-stone-300">{evt.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Playground Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Playground 1: Network & Circuit Breaker */}
        <section
          aria-labelledby="network-playground-heading"
          className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4"
          data-testid="network-playground"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Network size={18} className="text-accent" />
              <h2 id="network-playground-heading" className="text-sm font-bold text-text">
                Resilient Network & Circuit Breaker
              </h2>
            </div>
            <span
              className={`rounded border px-2 py-0.5 font-mono text-xs font-bold uppercase ${
                breakerColors[chaosState.circuitBreakerStatus]
              }`}
              data-testid="circuit-breaker-badge"
            >
              Breaker: {chaosState.circuitBreakerStatus}
            </span>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            Target endpoint: <code className="font-mono text-accent">/api/lab/chaos/flaky-telemetry</code>. Under high failure rates, the circuit breaker trips to <code className="font-mono">OPEN</code> to fast-fail traffic, and recovers after canary tests in <code className="font-mono">HALF-OPEN</code>.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              className="text-xs px-2.5 py-1.5"
              onClick={fetchTelemetry}
              disabled={telemetryResult.status === "loading"}
              data-testid="fetch-telemetry-btn"
            >
              {telemetryResult.status === "loading" ? (
                <>
                  <Loader2 size={13} className="mr-1.5 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <RefreshCw size={13} className="mr-1.5" />
                  Fetch Telemetry
                </>
              )}
            </Button>

            <Button
              variant="secondary"
              className="text-xs px-2.5 py-1.5"
              onClick={tripBreaker}
              data-testid="trip-breaker-btn"
            >
              Force Trip
            </Button>

            <Button
              variant="secondary"
              className="text-xs px-2.5 py-1.5"
              onClick={resetBreaker}
              data-testid="reset-breaker-btn"
            >
              Reset Breaker
            </Button>
          </div>

          {/* Telemetry Result Card */}
          <div
            className="rounded-lg border border-border bg-surface-muted/40 p-3.5"
            data-testid="telemetry-result-card"
          >
            {telemetryResult.status === "idle" && (
              <p className="text-xs text-muted italic">Click 'Fetch Telemetry' to test upstream network resilience.</p>
            )}

            {telemetryResult.status === "loading" && (
              <div className="flex items-center gap-2 text-xs text-accent">
                <Loader2 size={14} className="animate-spin" />
                <span>Request in flight... awaiting auto-waiting response</span>
              </div>
            )}

            {telemetryResult.status === "success" && (
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-emerald-500 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> 200 OK Response
                  </span>
                  <span className="font-mono text-muted">{telemetryResult.durationMs}ms</span>
                </div>
                <pre className="font-mono text-[11px] text-stone-300 overflow-x-auto mt-1">
                  {JSON.stringify(telemetryResult.data, null, 2)}
                </pre>
              </div>
            )}

            {telemetryResult.status === "error" && (
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-danger font-semibold">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle size={14} /> HTTP {telemetryResult.code} Error
                  </span>
                  <span className="font-mono text-muted">{telemetryResult.durationMs}ms</span>
                </div>
                <p className="text-danger leading-relaxed mt-1 font-mono text-[11px]">
                  {telemetryResult.message}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Playground 2: DOM Flakiness & Ephemeral UI */}
        <section
          aria-labelledby="dom-playground-heading"
          className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4"
          data-testid="dom-playground"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-accent" />
              <h2 id="dom-playground-heading" className="text-sm font-bold text-text">
                DOM Mutations & Fleeting Elements
              </h2>
            </div>
            {chaosState.domMutationChaos && (
              <span className="font-mono text-xs text-amber-500 animate-pulse">
                Remounting Active
              </span>
            )}
          </div>

          <p className="text-xs text-muted leading-relaxed">
            Teaches Playwright's smart auto-waiting vs fragile WebDriver locators. The button below changes DOM keys every 850ms when DOM chaos is enabled.
          </p>

          {/* Rapidly Remounting Button */}
          <div className="rounded-lg border border-border bg-surface-muted/40 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                key={remountCounter}
                type="button"
                id="remounting-action-btn"
                data-testid="remounting-action-btn"
                onClick={() => setClickCount((c) => c + 1)}
                className="rounded-md bg-accent px-3.5 py-2 text-xs font-bold text-accent-fg hover:opacity-90 transition-transform active:scale-95 cursor-pointer"
              >
                Resilient Target Button (Click Me)
              </button>

              <span className="font-mono text-xs text-text" data-testid="click-counter">
                Success Clicks: <strong className="text-accent text-sm">{clickCount}</strong>
              </span>
            </div>

            <p className="text-[11px] text-muted">
              Current DOM Instance Key: <span className="font-mono text-text">#btn-node-{remountCounter}</span>
            </p>
          </div>

          {/* Fleeting Banner Test */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text">Ephemeral Alert Banner</span>
              <Button
                variant="secondary"
                className="text-xs px-2.5 py-1.5"
                onClick={triggerFleetingBanner}
                data-testid="trigger-fleeting-btn"
              >
                Spawn 1.5s Banner
              </Button>
            </div>

            {fleetingBannerVisible && (
              <div
                id="fleeting-banner"
                data-testid="fleeting-banner"
                className="flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/15 p-3 text-xs text-text animate-fade-in"
              >
                <AlertTriangle size={15} className="text-amber-500 shrink-0" />
                <span>Ephemeral Notice: Will auto-dismiss in 1.5 seconds!</span>
              </div>
            )}
          </div>

          {/* Modal Overlay Intercept */}
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted">Obstructing Overlay Trap:</span>
            <Button
              variant="secondary"
              className="text-xs px-2.5 py-1.5"
              onClick={() => setOverlayActive(true)}
              data-testid="spawn-overlay-btn"
            >
              Spawn Modal Intercept
            </Button>
          </div>
        </section>

        {/* Playground 3: CPU Lag & Input Delays */}
        <section
          aria-labelledby="cpu-playground-heading"
          className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4"
          data-testid="cpu-playground"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Cpu size={18} className="text-accent" />
              <h2 id="cpu-playground-heading" className="text-sm font-bold text-text">
                Main-Thread Lag & Input Debounce
              </h2>
            </div>
            {typingLagMs > 0 && (
              <span className="font-mono text-xs text-amber-500">
                Lag: {typingLagMs}ms
              </span>
            )}
          </div>

          <p className="text-xs text-muted leading-relaxed">
            Simulates low-end devices and slow event handlers. Tests atomic <code className="font-mono text-accent">locator.fill()</code> against sequential <code className="font-mono text-accent">pressSequentially()</code>.
          </p>

          <div className="space-y-2">
            <label htmlFor="sluggish-input" className="block text-xs font-semibold text-text">
              Sluggish Typing Input Field
            </label>
            <input
              id="sluggish-input"
              data-testid="sluggish-input"
              type="text"
              value={sluggishText}
              onChange={(e) => handleSluggishInput(e.target.value)}
              placeholder="Type fast to see sequential vs fill behavior..."
              className="w-full rounded-md border border-border bg-surface-muted px-3 py-2 text-xs text-text placeholder:text-muted focus:outline-hidden focus:border-accent"
            />
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span>Length: {sluggishText.length} characters</span>
              <button
                type="button"
                onClick={freezeThread}
                data-testid="freeze-thread-btn"
                className="text-accent hover:underline text-[11px] cursor-pointer"
              >
                Burn CPU (400ms freeze)
              </button>
            </div>
          </div>
        </section>

        {/* Playground 4: Senior SDET Resilience Strategy */}
        <section
          aria-labelledby="strategy-heading"
          className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-3"
        >
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <ShieldAlert size={18} className="text-accent" />
            <h2 id="strategy-heading" className="text-sm font-bold text-text">
              Senior SDET Automation Strategies
            </h2>
          </div>

          <ul className="space-y-2 text-xs text-muted leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span>
                <strong className="text-text">Auto-Waiting Locators:</strong> Playwright's locator actions automatically retry until an element is attached, visible, stable, and enabled, eliminating stale element reference exceptions.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span>
                <strong className="text-text">Condition Polling:</strong> Use <code className="font-mono text-accent">await expect(async () =&gt; ...).toPass()</code> with custom intervals to gracefully handle circuit breaker recoveries.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span>
                <strong className="text-text">Deterministic Mocking:</strong> Use <code className="font-mono text-accent">page.route()</code> to bypass third-party drops or inject deliberate 503 scenarios in isolated CI suites.
              </span>
            </li>
          </ul>
        </section>
      </div>

      {/* Obstructing Overlay Modal Trap */}
      {overlayActive && (
        <div
          id="chaos-overlay"
          data-testid="chaos-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 text-accent">
              <AlertOctagon size={22} />
              <h3 className="text-base font-bold text-text">Obstructing Modal Trap</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              This modal intercepts all pointer events on the page, simulating unexpected cookie banners, promotional popups, or surveys.
            </p>
            <Button
              variant="primary"
              id="dismiss-overlay-btn"
              data-testid="dismiss-overlay-btn"
              onClick={() => setOverlayActive(false)}
              className="w-full"
            >
              Dismiss Modal Trap
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
