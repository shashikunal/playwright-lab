import type { NetworkItem, NetworkListResponse, ScenarioControlState } from "@pil/shared";
import { AlertTriangle, CheckCircle2, Clock, Loader2, RefreshCw, RotateCcw, Search, Sliders, WifiOff } from "lucide-react";
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
  });
  const [controlsLoading, setControlsLoading] = useState(false);

  // Async data fetcher state
  const [fetchState, setFetchState] = useState<FetchState>({ status: "idle" });

  // Debounced search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NetworkItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [abortCount, setAbortCount] = useState(0);

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
                <option value="429">429 Too Many Requests</option>
                <option value="500">500 Internal Server Error</option>
              </select>
              <p className="mt-2 text-xs text-muted">
                Overrides Express responses with RFC-compliant error payloads.
              </p>
            </div>
          </div>

          {/* Empty state flag */}
          <div className="rounded-md border border-border bg-surface-muted p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
              <WifiOff size={14} />
              Data State
            </div>
            <div className="mt-3">
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
              <p className="mt-2 text-xs text-muted">
                Forces backend to return empty collections (<code className="font-mono">[]</code>).
              </p>
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
        </div>
      </section>

      {/* Section 2: Live Asynchronous Data Fetcher */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">2. Asynchronous Data Fetcher</h2>
            <p className="mt-1 text-xs text-muted">
              Test auto-waiting assertions and loading spinners without flaky hardcoded timeouts.
            </p>
          </div>
          <Button onClick={handleFetchItems} disabled={fetchState.status === "loading"}>
            {fetchState.status === "loading" ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Fetching Data...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Fetch Telemetry Records
              </>
            )}
          </Button>
        </div>

        {/* Dynamic Fetch State Container */}
        <div className="mt-6 rounded-md border border-border bg-surface-muted p-4">
          {fetchState.status === "idle" ? (
            <p className="text-xs text-muted">Click &ldquo;Fetch Telemetry Records&rdquo; to query backend.</p>
          ) : fetchState.status === "loading" ? (
            <div className="flex items-center gap-3 py-6 text-sm text-muted" role="status" aria-label="Loading telemetry">
              <Loader2 size={20} className="animate-spin text-accent" />
              <span>Waiting for Express backend response...</span>
            </div>
          ) : fetchState.status === "error" ? (
            <div role="alert" className="rounded-md border border-danger/40 bg-danger-bg p-4 text-sm text-danger">
              <p className="font-semibold">Request Failed (Status: {fetchState.code})</p>
              <p className="mt-1 text-xs">{fetchState.message}</p>
              <p className="mt-2 font-mono text-[11px] text-muted">Round-trip duration: {fetchState.durationMs}ms</p>
            </div>
          ) : fetchState.data.items.length === 0 ? (
            <div className="py-8 text-center" data-testid="empty-state">
              <p className="text-sm font-semibold text-text">No items matching query</p>
              <p className="mt-1 text-xs text-muted">The backend returned an empty collection.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between pb-3 text-xs text-muted">
                <span>Loaded {fetchState.data.items.length} records</span>
                <span className="font-mono">Server latency: {fetchState.data.latencyApplied}ms</span>
              </div>
              <ul className="divide-y divide-border" data-testid="telemetry-list">
                {fetchState.data.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between py-2 text-sm">
                    <div>
                      <span className="font-medium text-text">{item.title}</span>
                      <span className="ml-2 font-mono text-xs text-muted">[{item.id}]</span>
                    </div>
                    <Badge>{item.category}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Section 3: Debounced Live Search with Request Cancellation */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs">
        <h2 className="text-xl font-semibold">3. Debounced Search & Race Conditions</h2>
        <p className="mt-1 text-xs text-muted">
          Practise testing debounced typing and request cancellation using <code className="font-mono">AbortController</code>.
        </p>

        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
            <input
              type="search"
              aria-label="Search telemetry"
              placeholder="Type to filter telemetry (e.g. audit, cache, pipeline)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-border bg-surface pl-9 pr-4 py-2 text-sm text-text focus:outline-hidden"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted">
            <span>
              {searchLoading ? "Searching backend..." : `Found ${searchResults.length} matching items`}
            </span>
            <span className="font-mono">Cancelled in-flight requests: {abortCount}</span>
          </div>

          {searchResults.length > 0 ? (
            <ul className="mt-3 divide-y divide-border rounded-md border border-border p-2 text-sm">
              {searchResults.map((item) => (
                <li key={item.id} className="py-1.5 flex items-center justify-between">
                  <span>{item.title}</span>
                  <Badge>{item.category}</Badge>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {/* Section 4: Optimistic Updates with Rollback */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs">
        <h2 className="text-xl font-semibold">4. Optimistic UI Updates & Rollback</h2>
        <p className="mt-1 text-xs text-muted">
          Item renders instantly. If backend returns an error (try setting Status 500 above), the UI rolls back and displays an error alert.
        </p>

        <form onSubmit={handleAddOptimistic} className="mt-4 flex gap-2">
          <input
            type="text"
            aria-label="New item title"
            placeholder="Add new operational item..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-hidden"
          />
          <Button type="submit">Add Item Optimistically</Button>
        </form>

        {optimisticError ? (
          <div role="alert" className="mt-3 rounded-md border border-danger/40 bg-danger-bg p-3 text-xs text-danger">
            Rollback executed: {optimisticError}
          </div>
        ) : null}

        <ul className="mt-4 space-y-2" data-testid="optimistic-list">
          {optimisticItems.map((item) => (
            <li
              key={item.id}
              className={`flex items-center justify-between rounded-md border px-4 py-2 text-sm ${
                item.pending ? "border-warning/50 bg-warning-bg/30 text-warning" : "border-border bg-surface text-text"
              }`}
            >
              <span>{item.title}</span>
              {item.pending ? (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase text-warning">
                  <Loader2 size={12} className="animate-spin" /> Saving...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase text-success">
                  <CheckCircle2 size={12} /> Saved
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Section 5: Playwright Interception Target */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs">
        <h2 className="text-xl font-semibold">5. Network Mocking Target (<code className="font-mono text-sm">page.route</code>)</h2>
        <p className="mt-1 text-xs text-muted">
          Target route specifically designed for <code className="font-mono">page.route(&quot;/api/lab/network/**&quot;)</code> practicing <code className="font-mono">route.fulfill()</code> and <code className="font-mono">route.abort()</code>.
        </p>

        <div className="mt-4 flex items-center gap-3">
          <Button variant="ghost" onClick={handleInterceptionCall}>
            Call Interception Target
          </Button>
          <div
            role="status"
            className="flex-1 rounded-md border border-border bg-surface-muted p-2.5 font-mono text-xs text-text"
            data-testid="interception-output"
          >
            {interceptionResult}
          </div>
        </div>
      </section>
    </div>
  );
}
