import type { NetworkItem, NetworkListResponse, ScenarioControlState, StreamRecord, StreamResponse } from "@pil/shared";
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Layers,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Sliders,
  WifiOff,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

type FetchState =
  | { status: "idle" }
  | { status: "loading"; startTime: number }
  | { status: "success"; data: NetworkListResponse; durationMs: number }
  | { status: "error"; code: number; message: string; durationMs: number };

export function NetworkLab() {
  // Scenario controls state
  const [controls, setControls] = useState<ScenarioControlState>({
    latencyMs: 0,
    empty: false,
    statusOverride: null,
    simulateTimeout: false,
  });
  const [controlsLoading, setControlsLoading] = useState(false);

  // Async data fetcher state
  const [fetchState, setFetchState] = useState<FetchState>({ status: "idle" });

  // Debounced search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NetworkItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [abortCount, setAbortCount] = useState(0);

  // Stream pagination state
  const [streamRecords, setStreamRecords] = useState<StreamRecord[]>([]);
  const [streamCursor, setStreamCursor] = useState<string | null>(null);
  const [streamHasMore, setStreamHasMore] = useState(true);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamTotal, setStreamTotal] = useState(0);

  // Out-of-order race condition state
  const [raceActiveQuery, setRaceActiveQuery] = useState<string | null>(null);
  const [raceResult, setRaceResult] = useState<string | null>(null);
  const [raceUseCancellation, setRaceUseCancellation] = useState(true);
  const raceAbortRef = useRef<AbortController | null>(null);

  // Optimistic updates state
  const [optimisticItems, setOptimisticItems] = useState<
    Array<{ id: string; title: string; category: string; pending?: boolean; error?: boolean }>
  >([
    { id: "OPT-01", title: "Automated Canary Deploy", category: "deployment" },
    { id: "OPT-02", title: "Synthetic Uptime Ping", category: "monitoring" },
  ]);
  const [newTitle, setNewTitle] = useState("");
  const [optimisticError, setOptimisticError] = useState<string | null>(null);

  // Interception target state
  const [interceptionResult, setInterceptionResult] = useState<string>("Ready for interception");

  // Load initial controls
  useEffect(() => {
    fetch("/api/lab/network/controls")
      .then((res) => res.json())
      .then((data) => {
        if (data.scenario) setControls(data.scenario);
      })
      .catch(() => {});
  }, []);

  // Update backend controls
  const updateControls = async (partial: Partial<ScenarioControlState>) => {
    setControls((prev) => ({ ...prev, ...partial }));
    setControlsLoading(true);
    try {
      const res = await fetch("/api/lab/network/controls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
      const data = await res.json();
      if (data.scenario) setControls(data.scenario);
    } finally {
      setControlsLoading(false);
    }
  };

  // Reset controls
  const handleReset = async () => {
    setControlsLoading(true);
    try {
      const res = await fetch("/api/lab/network/reset", { method: "POST" });
      const data = await res.json();
      if (data.scenario) setControls(data.scenario);
      setFetchState({ status: "idle" });
      setOptimisticError(null);
      setStreamRecords([]);
      setStreamCursor(null);
      setStreamHasMore(true);
      setRaceResult(null);
    } finally {
      setControlsLoading(false);
    }
  };

  // Fetch Items
  const handleFetchItems = async () => {
    const start = performance.now();
    setFetchState({ status: "loading", startTime: start });
    try {
      const res = await fetch("/api/lab/network/items");
      const duration = Math.round(performance.now() - start);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setFetchState({
          status: "error",
          code: res.status,
          message: err?.error?.message || `HTTP ${res.status}`,
          durationMs: duration,
        });
        return;
      }
      const data: NetworkListResponse = await res.json();
      setFetchState({ status: "success", data, durationMs: duration });
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - start);
      setFetchState({
        status: "error",
        code: 0,
        message: err instanceof Error ? err.message : "Network error / aborted",
        durationMs: duration,
      });
    }
  };

  // Debounced search with AbortController
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setAbortCount((c) => c + 1);
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(() => {
      setSearchLoading(true);
      fetch(`/api/lab/network/items?q=${encodeURIComponent(searchQuery)}`, {
        signal: controller.signal,
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
        .then((data: NetworkListResponse) => {
          setSearchResults(data.items);
          setSearchLoading(false);
        })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name === "AbortError") return;
          setSearchLoading(false);
        });
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Stream pagination fetch
  const handleLoadStream = async () => {
    setStreamLoading(true);
    try {
      const url = streamCursor
        ? `/api/lab/network/stream?cursor=${encodeURIComponent(streamCursor)}&limit=5`
        : `/api/lab/network/stream?limit=5`;
      const res = await fetch(url);
      if (res.ok) {
        const data: StreamResponse = await res.json();
        setStreamRecords((prev) => (streamCursor ? [...prev, ...data.items] : data.items));
        setStreamCursor(data.nextCursor);
        setStreamHasMore(data.hasMore);
        setStreamTotal(data.total);
      }
    } finally {
      setStreamLoading(false);
    }
  };

  // Dispatch race query
  const handleDispatchRace = async (speed: "fast" | "slow") => {
    if (raceUseCancellation && raceAbortRef.current) {
      raceAbortRef.current.abort();
    }
    const controller = new AbortController();
    raceAbortRef.current = controller;

    setRaceActiveQuery(`Query [${speed.toUpperCase()}] running...`);
    try {
      const res = await fetch(`/api/lab/network/race?speed=${speed}&q=${speed}`, {
        signal: raceUseCancellation ? controller.signal : undefined,
      });
      if (res.ok) {
        const data = await res.json();
        setRaceResult(`Winner: ${data.speed.toUpperCase()} query resolved at ${new Date(data.timestamp).toLocaleTimeString()}`);
        setRaceActiveQuery(null);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // Aborted cleanly
        return;
      }
      setRaceActiveQuery("Failed or cancelled");
    }
  };

  // Optimistic Add Item
  const handleAddOptimistic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const tempId = `temp_${Date.now()}`;
    const optimisticItem = { id: tempId, title: newTitle, category: "optimistic", pending: true };
    setOptimisticItems((prev) => [optimisticItem, ...prev]);
    setNewTitle("");
    setOptimisticError(null);

    try {
      const res = await fetch("/api/lab/network/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: optimisticItem.title, category: optimisticItem.category }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const confirmed: NetworkItem = await res.json();
      setOptimisticItems((prev) =>
        prev.map((item) => (item.id === tempId ? { ...confirmed, pending: false } : item)),
      );
    } catch (err: unknown) {
      // Rollback on failure
      setOptimisticItems((prev) => prev.filter((item) => item.id !== tempId));
      setOptimisticError(err instanceof Error ? err.message : "Optimistic creation failed");
    }
  };

  // Interception mock call
  const handleInterceptionCall = async () => {
    try {
      const res = await fetch("/api/lab/network/interception-target");
      if (!res.ok) {
        setInterceptionResult(`Error: HTTP ${res.status}`);
        return;
      }
      const data = await res.json();
      setInterceptionResult(JSON.stringify(data));
    } catch (err: unknown) {
      setInterceptionResult(err instanceof Error ? err.message : "Network failure");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      {/* Header */}
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-accent">Lab Practice</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Scenario Controls & Network</h1>
        <p className="mt-2 text-sm text-muted">
          Practise real-world asynchronous waiting, error handling, empty states, search race conditions, and Playwright network mocking with <code className="font-mono">page.route()</code>.
        </p>
      </div>

      {/* Section 1: Scenario Controls Configuration */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs" data-testid="scenario-controls-panel">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sliders className="size-5 text-accent" />
            <h2 className="text-xl font-semibold">1. Configurable Scenario Controls</h2>
          </div>
          <Button variant="ghost" onClick={handleReset} disabled={controlsLoading}>
            <RotateCcw size={16} />
            Reset All Controls
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted">
          These controls dictate the behavior of the Express backend. Use them to create deterministic test scenarios.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {/* Latency selection */}
          <div className="rounded-md border border-border bg-surface-muted p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
              <Clock size={14} />
              Latency Simulation
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {[
                { label: "Fast (0ms)", value: 0 },
                { label: "Fast (250ms)", value: 250 },
                { label: "Moderate (800ms)", value: 800 },
                { label: "Slow (2500ms)", value: 2500 },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="latency"
                    value={opt.value}
                    checked={controls.latencyMs === opt.value}
                    onChange={() => updateControls({ latencyMs: opt.value })}
                    className="accent-accent"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status code override */}
          <div className="rounded-md border border-border bg-surface-muted p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
              <AlertTriangle size={14} />
              Status Code Override
            </div>
            <div className="mt-3">
              <select
                aria-label="Status code override"
                value={controls.statusOverride ?? ""}
                onChange={(e) =>
                  updateControls({ statusOverride: e.target.value ? Number(e.target.value) : null })
                }
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
              >
                <option value="">Normal (200 OK)</option>
                <option value="400">400 Bad Request</option>
                <option value="401">401 Unauthorized</option>
                <option value="403">403 Forbidden</option>
                <option value="404">404 Not Found</option>
                <option value="409">409 Conflict</option>
                <option value="422">422 Unprocessable Entity</option>
                <option value="429">429 Too Many Requests</option>
                <option value="500">500 Internal Server Error</option>
              </select>
              <p className="mt-2 text-xs text-muted">
                Overrides Express responses with RFC-compliant error payloads.
              </p>
            </div>
          </div>

          {/* Fault Toggles */}
          <div className="rounded-md border border-border bg-surface-muted p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
              <WifiOff size={14} />
              Fault Injection
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  id="simulate-empty-checkbox"
                  type="checkbox"
                  checked={controls.empty}
                  onChange={(e) => updateControls({ empty: e.target.checked })}
                  className="size-4 rounded accent-accent"
                />
                <label htmlFor="simulate-empty-checkbox" className="text-sm cursor-pointer">
                  Simulate Empty Response
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="simulate-timeout-checkbox"
                  type="checkbox"
                  checked={Boolean(controls.simulateTimeout)}
                  onChange={(e) => updateControls({ simulateTimeout: e.target.checked })}
                  className="size-4 rounded accent-accent"
                />
                <label htmlFor="simulate-timeout-checkbox" className="text-sm cursor-pointer">
                  Simulate Network Timeout (504 Abort)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Current status display */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4 text-xs">
          <span className="font-medium text-muted">Active Configuration:</span>
          <Badge>Latency: {controls.latencyMs}ms</Badge>
          <Badge tone={controls.statusOverride ? "warning" : "neutral"}>
            Status: {controls.statusOverride ? `HTTP ${controls.statusOverride}` : "200 OK"}
          </Badge>
          <Badge tone={controls.empty ? "warning" : "neutral"}>
            Data: {controls.empty ? "Empty Collection" : "Populated"}
          </Badge>
          {controls.simulateTimeout ? (
            <Badge tone="warning">Fault: Timeout / 504 Active</Badge>
          ) : null}
        </div>
      </section>

      {/* Section 2: Live Asynchronous Data Fetcher */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <RefreshCw className="size-5 text-accent" />
          <h2 className="text-xl font-semibold">2. Live Telemetry Fetcher</h2>
        </div>
        <p className="mt-1 text-xs text-muted">
          Calls <code className="font-mono">GET /api/lab/network/items</code>. Respects the configured latency and error status overrides.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={handleFetchItems} disabled={fetchState.status === "loading"}>
            {fetchState.status === "loading" ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Fetching Telemetry...
              </>
            ) : (
              "Fetch Telemetry Records"
            )}
          </Button>

          {fetchState.status === "success" ? (
            <span className="text-xs text-muted">
              Completed in <strong className="text-text">{fetchState.durationMs}ms</strong>
            </span>
          ) : null}
        </div>

        {/* Fetcher State Display */}
        <div className="mt-4">
          {fetchState.status === "loading" ? (
            <div role="status" className="flex items-center gap-2 rounded-md border border-border bg-surface-muted p-4 text-sm text-muted">
              <Loader2 size={18} className="animate-spin text-accent" />
              <span>Waiting for Express backend response...</span>
            </div>
          ) : fetchState.status === "error" ? (
            <div role="alert" className="rounded-md border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
              <p className="font-semibold">Request Failed (Status: {fetchState.code})</p>
              <p className="mt-1 text-xs">{fetchState.message}</p>
            </div>
          ) : fetchState.status === "success" ? (
            fetchState.data.items.length === 0 ? (
              <div role="status" data-testid="empty-state" className="rounded-md border border-border bg-surface-muted p-6 text-center text-sm text-muted">
                No items matching query (Empty Response).
              </div>
            ) : (
              <div data-testid="telemetry-list" className="divide-y divide-border rounded-md border border-border">
                {fetchState.data.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 text-sm">
                    <div>
                      <span className="font-mono text-xs font-semibold text-accent">{item.id}</span>
                      <p className="font-medium text-text">{item.title}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Badge tone="neutral">{item.category}</Badge>
                      <span className="font-mono">{item.latencyMs}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : null}
        </div>
      </section>

      {/* Section 3: Infinite Stream & Cursor Pagination Sandbox */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-accent" />
            <h2 className="text-xl font-semibold">3. Telemetry Ingestion Stream (Cursor Pagination)</h2>
          </div>
          <span className="text-xs font-mono text-muted">
            {streamRecords.length} of {streamTotal || 25} Records
          </span>
        </div>
        <p className="mt-1 text-xs text-muted">
          Paginates via <code className="font-mono">GET /api/lab/network/stream?cursor=...</code>. Practice continuous stream assertion and auto-waiting on cursor updates.
        </p>

        <div className="mt-4">
          <Button onClick={handleLoadStream} disabled={streamLoading || (!streamHasMore && streamRecords.length > 0)}>
            {streamLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Loading Stream...
              </>
            ) : streamRecords.length === 0 ? (
              "Initialize Stream"
            ) : streamHasMore ? (
              "Load Next Telemetry Chunk"
            ) : (
              "All Records Loaded"
            )}
          </Button>
        </div>

        {streamRecords.length > 0 ? (
          <div data-testid="stream-container" className="mt-4 divide-y divide-border rounded-md border border-border max-h-64 overflow-y-auto">
            {streamRecords.map((rec) => (
              <div key={rec.id} data-testid="stream-record" className="p-3 text-xs flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-accent mr-2">{rec.id}</span>
                  <span className="font-medium text-text">{rec.payload}</span>
                </div>
                <Badge tone="neutral">{rec.topic}</Badge>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* Section 4: Out-of-Order Race Condition Simulator */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Zap className="size-5 text-accent" />
          <h2 className="text-xl font-semibold">4. Out-of-Order Query Simulator</h2>
        </div>
        <p className="mt-1 text-xs text-muted">
          Dispatches slow query (800ms) then fast query (50ms). When request cancellation is enabled via <code className="font-mono">AbortController</code>, older slow responses will not overwrite newer fast responses.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button variant="ghost" onClick={() => handleDispatchRace("slow")}>
            Dispatch Slow Query (800ms)
          </Button>
          <Button onClick={() => handleDispatchRace("fast")}>
            Dispatch Fast Query (50ms)
          </Button>
          <label className="flex items-center gap-2 text-xs cursor-pointer text-muted">
            <input
              type="checkbox"
              checked={raceUseCancellation}
              onChange={(e) => setRaceUseCancellation(e.target.checked)}
              className="size-4 rounded accent-accent"
            />
            <span>Enable AbortController Cancellation</span>
          </label>
        </div>

        {raceActiveQuery ? (
          <p className="mt-2 text-xs text-muted animate-pulse">{raceActiveQuery}</p>
        ) : null}

        {raceResult ? (
          <div data-testid="race-winner-banner" className="mt-3 rounded-md border border-accent/40 bg-accent/5 p-3 text-xs text-text font-mono">
            {raceResult}
          </div>
        ) : null}
      </section>

      {/* Section 5: Search with Debounce & Cancellation */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Search className="size-5 text-accent" />
          <h2 className="text-xl font-semibold">5. Debounced Search with AbortController</h2>
        </div>
        <p className="mt-1 text-xs text-muted">
          Debounced at 200ms with automatic cancellation of superseded fetch requests.
        </p>

        <div className="mt-4 max-w-md">
          <div className="relative">
            <input
              id="search-telemetry-input"
              type="search"
              aria-label="Search telemetry"
              placeholder="Search by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-hidden"
            />
            {searchLoading ? (
              <Loader2 size={16} className="absolute right-3 top-2.5 animate-spin text-muted" />
            ) : null}
          </div>
          <span className="mt-1 block text-[11px] text-muted">
            Aborted superseded requests: <strong className="font-mono text-text">{abortCount}</strong>
          </span>
        </div>

        {searchResults.length > 0 ? (
          <div className="mt-3 divide-y divide-border rounded-md border border-border">
            {searchResults.map((item) => (
              <div key={item.id} className="p-2 text-xs flex justify-between">
                <span>{item.title}</span>
                <span className="font-mono text-muted">{item.category}</span>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* Section 6: Optimistic UI Updates with Rollback */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <CheckCircle2 className="size-5 text-accent" />
          <h2 className="text-xl font-semibold">6. Optimistic Updates with Rollback</h2>
        </div>
        <p className="mt-1 text-xs text-muted">
          Adds item to the UI immediately. If backend returns an error (set status override to 500 above), the item rolls back with visual alert feedback.
        </p>

        <form onSubmit={handleAddOptimistic} className="mt-4 flex gap-2">
          <input
            id="optimistic-title-input"
            type="text"
            aria-label="New item title"
            placeholder="e.g. Distributed Trace Collector"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
          />
          <Button type="submit">Add Item Optimistically</Button>
        </form>

        {optimisticError ? (
          <div role="alert" className="mt-3 rounded-md border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
            Rollback executed: mutation failed due to server error ({optimisticError})
          </div>
        ) : null}

        <div data-testid="optimistic-list" className="mt-4 divide-y divide-border rounded-md border border-border">
          {optimisticItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 text-sm">
              <span className={item.pending ? "opacity-60 italic" : "font-medium"}>
                {item.title}
              </span>
              <div className="flex items-center gap-2 text-xs">
                {item.pending ? <Badge tone="warning">Pending Server...</Badge> : <Badge tone="neutral">Confirmed</Badge>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 7: Playwright Mock Interception Showcase */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <ArrowUpDown className="size-5 text-accent" />
          <h2 className="text-xl font-semibold">7. Playwright Mock Interception Showcase</h2>
        </div>
        <p className="mt-1 text-xs text-muted">
          Demonstrates client-side testing using <code className="font-mono">page.route()</code>. The button below calls <code className="font-mono">/api/lab/network/interception-target</code>. In tests, intercept it with custom JSON.
        </p>

        <div className="mt-4 flex items-center gap-3">
          <Button onClick={handleInterceptionCall}>Call Interception Target</Button>
          <span className="text-xs text-muted">Result:</span>
          <code data-testid="interception-output" className="rounded bg-surface-muted px-2 py-1 font-mono text-xs">
            {interceptionResult}
          </code>
        </div>
      </section>
    </div>
  );
}
