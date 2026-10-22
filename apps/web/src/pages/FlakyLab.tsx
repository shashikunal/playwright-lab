import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  Download,
  FileCode,
  FileText,
  Layers,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Terminal,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

type UploadItem = {
  id: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
};

export function FlakyLab() {
  // 1. File operations state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadItem | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 2. Delayed Actionability state
  const [delayedDisabled, setDelayedDisabled] = useState(true);
  const [actionExecuted, setActionExecuted] = useState(false);

  // 3. Detached element state
  const [generation, setGeneration] = useState(1);
  const [swapping, setSwapping] = useState(false);

  // 4. Floating interceptor state
  const [showOverlay, setShowOverlay] = useState(true);

  // 5. Flaky request state
  const [unstableMode, setUnstableMode] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);

  // 6. Bounded retry state
  const [retryResult, setRetryResult] = useState<string | null>(null);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [retryLoading, setRetryLoading] = useState(false);

  // 7. Arbitrary sleep vs condition waiting
  const [delayedToken, setDelayedToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  // 8. Unexpected promotional modal (for addLocatorHandler)
  const [promoOpen, setPromoOpen] = useState(false);

  // 9. Strict mode duplicate action feedback
  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);

  // 10. Console / Page error triggered state
  const [errorTriggeredMsg, setErrorTriggeredMsg] = useState<string | null>(null);

  // Initialize delayed actionability (enables after 1200ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayedDisabled(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Fetch initial flaky state
  const fetchState = useCallback(() => {
    fetch("/api/lab/flaky/state")
      .then((res) => res.json())
      .then((data) => {
        setUnstableMode(data.state?.unstableMode ?? false);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadResult(null);
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  // Upload file
  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError(null);

    try {
      const res = await fetch("/api/lab/flaky/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selectedFile.name,
          sizeBytes: selectedFile.size,
          mimeType: selectedFile.type || "application/octet-stream",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setUploadError(data?.error?.message || "Upload failed");
      } else {
        setUploadResult(data.result);
      }
    } catch {
      setUploadError("Network error occurred during upload");
    } finally {
      setUploading(false);
    }
  };

  // Trigger DOM swap
  const handleTriggerSwap = () => {
    setSwapping(true);
    setTimeout(() => {
      setGeneration((prev) => prev + 1);
      setSwapping(false);
    }, 100);
  };

  // Toggle unstable mode
  const handleToggleUnstable = async () => {
    const next = !unstableMode;
    setUnstableMode(next);
    await fetch("/api/lab/flaky/unstable-toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unstableMode: next }),
    });
  };

  // Fetch unstable resource
  const handleFetchResource = async () => {
    setRequestLoading(true);
    setRequestError(null);
    setRequestStatus(null);

    try {
      const res = await fetch("/api/lab/flaky/unstable-item");
      const data = await res.json();

      if (!res.ok) {
        setRequestError(`HTTP ${res.status}: ${data?.error?.message || "Intermittent failure"}`);
      } else {
        setRequestStatus(`${data.data} (Attempt #${data.attempts})`);
      }
    } catch {
      setRequestError("Network connection failure");
    } finally {
      setRequestLoading(false);
    }
  };

  // Bounded retry fetch
  const handleBoundedRetryCall = async () => {
    setRetryLoading(true);
    setRetryError(null);
    setRetryResult(null);

    try {
      const res = await fetch("/api/lab/flaky/retryable");
      const data = await res.json();

      if (!res.ok) {
        setRetryError(`HTTP ${res.status}: ${data?.error?.message || "Retry required"}`);
      } else {
        setRetryResult(data.message);
      }
    } catch {
      setRetryError("Connection failed");
    } finally {
      setRetryLoading(false);
    }
  };

  // Fetch delayed token
  const handleFetchDelayedToken = () => {
    setTokenLoading(true);
    setDelayedToken(null);
    const delay = Math.floor(Math.random() * 600) + 400; // 400 - 1000ms
    setTimeout(() => {
      setDelayedToken(`tok_auth_${Date.now().toString(36)}`);
      setTokenLoading(false);
    }, delay);
  };

  // Trigger error simulation
  const handleTriggerConsoleError = () => {
    console.error("Critical test diagnostic exception: simulated console error event");
    setErrorTriggeredMsg("Dispatched console.error event for Playwright listener");
  };

  const handleTriggerPageError = () => {
    setErrorTriggeredMsg("Dispatched window.onerror event for Playwright listener");
    setTimeout(() => {
      throw new Error("Uncaught simulated runtime exception: simulated pageerror");
    }, 10);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      {/* Floating Interceptor Banner (Anti-Pattern / Dismissal Challenge) */}
      {showOverlay ? (
        <div
          data-testid="floating-interceptor"
          className="fixed bottom-4 right-4 z-50 flex max-w-sm items-center justify-between gap-4 rounded-lg border border-accent bg-surface p-4 shadow-xl"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-accent" />
            <div>
              <p className="text-xs font-semibold text-text">Floating Interceptor Layer</p>
              <p className="text-[11px] text-muted">
                Simulates cookie banners or unexpected overlays that obscure interactable elements.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Dismiss Overlay"
            onClick={() => setShowOverlay(false)}
            className="rounded p-1 text-muted hover:text-text cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      ) : null}

      {/* Unexpected Promotional Modal (Target for page.addLocatorHandler) */}
      {promoOpen ? (
        <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="promo-dialog-title"
            className="w-full max-w-sm rounded-xl border border-accent bg-surface p-6 shadow-2xl"
          >
            <h3 id="promo-dialog-title" className="text-lg font-bold text-text">
              Special Enterprise Offer
            </h3>
            <p className="mt-2 text-xs text-muted">
              Unexpected modal simulating asynchronous promotional popups. Practice dismissing transparently using{" "}
              <code className="font-mono text-accent">page.addLocatorHandler()</code>.
            </p>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setPromoOpen(false)}>Dismiss Offer</Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Header */}
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-accent">Lab Practice</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Flaky Lab & Anti-Pattern Workbench
        </h1>
        <p className="mt-2 text-sm text-muted">
          Master Playwright diagnostic tools, automatic actionability auto-waiting, locator resilience, strict mode scoping, and transient failure recovery.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Panel 1: File Upload & Download Workbench */}
        <section
          data-testid="file-ops-panel"
          className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Upload className="size-5 text-accent" />
            <h2 className="text-lg font-semibold">1. File Upload & Download</h2>
          </div>

          <p className="text-xs text-muted">
            Practice <code className="font-mono">setInputFiles</code> and <code className="font-mono">waitForEvent('download')</code>.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="file-upload-input" className="block text-xs font-medium text-muted">
                Upload Test Data (.csv, .json, .txt)
              </label>
              <input
                id="file-upload-input"
                type="file"
                aria-label="Upload Test Data"
                accept=".csv,.json,.txt"
                onChange={handleFileChange}
                className="mt-1 block w-full text-xs text-text file:mr-4 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-accent-fg hover:file:opacity-90 cursor-pointer"
              />
            </div>

            {selectedFile ? (
              <div className="flex items-center gap-2 rounded-md border border-border bg-surface-muted p-2 text-xs">
                <FileText className="size-4 text-accent" />
                <span className="font-medium">{selectedFile.name}</span>
                <span className="text-muted">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            ) : null}

            {uploadError ? (
              <div role="alert" className="rounded-md border border-danger/40 bg-danger/10 p-3 text-xs text-danger flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            ) : null}

            {uploadResult ? (
              <div
                role="status"
                data-testid="upload-success"
                className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-400 flex items-center gap-2"
              >
                <CheckCircle2 className="size-4 shrink-0" />
                <span>
                  Successfully uploaded <strong>{uploadResult.filename}</strong> (Ref: {uploadResult.id})
                </span>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button disabled={!selectedFile || uploading} onClick={handleUpload}>
                {uploading ? "Uploading..." : "Submit File Upload"}
              </Button>

              <a
                href="/api/lab/flaky/export-csv"
                download="industrial-test-report.csv"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-4 py-2 text-xs font-semibold text-text hover:bg-surface-muted transition-colors"
                id="download-csv-btn"
              >
                <Download size={14} /> Download Audit Log (CSV)
              </a>
            </div>
          </div>
        </section>

        {/* Panel 2: Delayed Actionability & Auto-Waiting */}
        <section
          data-testid="actionability-panel"
          className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <RefreshCw className="size-5 text-accent" />
            <h2 className="text-lg font-semibold">2. Delayed Actionability</h2>
          </div>

          <p className="text-xs text-muted">
            The button below is disabled for 1200ms upon initial load. Playwright's actionability checks automatically wait for it to become enabled without manual sleeps.
          </p>

          <div className="rounded-md border border-border bg-surface-muted p-4 space-y-3 text-center">
            <Badge tone={delayedDisabled ? "warning" : "neutral"}>
              {delayedDisabled ? "Actionability: Disabled (Waiting 1.2s...)" : "Actionability: Ready"}
            </Badge>

            <div>
              <Button
                id="delayed-action-btn"
                disabled={delayedDisabled}
                onClick={() => setActionExecuted(true)}
              >
                Execute Delayed Action
              </Button>
            </div>

            {actionExecuted ? (
              <p id="actionability-result" className="text-xs font-medium text-emerald-400 flex items-center justify-center gap-1">
                <CheckCircle2 size={14} /> Action successfully executed after actionability wait
              </p>
            ) : null}
          </div>
        </section>

        {/* Panel 3: Detached Element / DOM Replacement */}
        <section
          data-testid="detached-panel"
          className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <FileCode className="size-5 text-accent" />
            <h2 className="text-lg font-semibold">3. Dynamic Element Replacement</h2>
          </div>

          <p className="text-xs text-muted">
            Clicking the button unmounts and mounts an entirely new DOM element. Playwright re-evaluates locators dynamically instead of throwing stale element exceptions.
          </p>

          <div className="rounded-md border border-border bg-surface-muted p-4 space-y-4">
            {swapping ? (
              <div className="text-center text-xs text-muted py-2 animate-pulse">
                Swapping DOM element reference...
              </div>
            ) : (
              <div
                key={`dom-gen-${generation}`}
                id="dynamic-target"
                data-generation={generation}
                className="rounded-md border border-accent/40 bg-accent/5 p-3 text-center text-sm font-mono font-semibold text-accent"
              >
                DOM Node Generation #{generation}
              </div>
            )}

            <div className="flex justify-center">
              <Button variant="ghost" disabled={swapping} onClick={handleTriggerSwap}>
                <RefreshCw size={14} /> Trigger DOM Replacement
              </Button>
            </div>
          </div>
        </section>

        {/* Panel 4: Simulated Intermittent Network Failure */}
        <section
          data-testid="flaky-request-panel"
          className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <AlertTriangle className="size-5 text-accent" />
            <h2 className="text-lg font-semibold">4. Intermittent Failure Simulator</h2>
          </div>

          <p className="text-xs text-muted">
            Enables periodic HTTP 503 failures on alternate requests to practice automated retries, trace analysis, and transient error recovery.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-md border border-border bg-surface-muted p-3">
              <div>
                <span className="text-xs font-semibold text-text">Unstable Mode</span>
                <p className="text-[11px] text-muted">Fails alternate API requests with 503</p>
              </div>
              <Button
                variant={unstableMode ? "primary" : "ghost"}
                onClick={handleToggleUnstable}
                aria-pressed={unstableMode}
              >
                {unstableMode ? "Mode: Active (503)" : "Mode: Inactive"}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button disabled={requestLoading} onClick={handleFetchResource}>
                {requestLoading ? "Requesting..." : "Fetch Unstable Resource"}
              </Button>
            </div>

            {requestError ? (
              <div role="alert" className="rounded-md border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
                {requestError}
              </div>
            ) : null}

            {requestStatus ? (
              <div role="status" className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                {requestStatus}
              </div>
            ) : null}
          </div>
        </section>

        {/* Panel 5: Bounded Retry Countdown Simulation */}
        <section
          data-testid="bounded-retry-panel"
          className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <RotateCcw className="size-5 text-accent" />
            <h2 className="text-lg font-semibold">5. Bounded Retries Simulation</h2>
          </div>

          <p className="text-xs text-muted">
            Calls <code className="font-mono">GET /api/lab/flaky/retryable</code>. Backend deterministically returns 503 twice before succeeding on attempt #3.
          </p>

          <div className="space-y-3">
            <Button onClick={handleBoundedRetryCall} disabled={retryLoading}>
              {retryLoading ? "Executing Call..." : "Execute Bounded Retry API"}
            </Button>

            {retryError ? (
              <div role="alert" className="rounded-md border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
                {retryError}
              </div>
            ) : null}

            {retryResult ? (
              <div role="status" className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                {retryResult}
              </div>
            ) : null}
          </div>
        </section>

        {/* Panel 6: Strict Mode & Duplicate Locator Scoping */}
        <section
          data-testid="strict-mode-panel"
          className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Layers className="size-5 text-accent" />
            <h2 className="text-lg font-semibold">6. Strict Mode Scoping Sandbox</h2>
          </div>

          <p className="text-xs text-muted">
            Contains identical button names and duplicate test IDs across two isolated card containers. Practice scoping with <code className="font-mono">filter()</code> to prevent strict mode violations.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div id="primary-action-container" className="rounded-md border border-border p-3 space-y-2">
              <span className="text-xs font-semibold text-text">Primary Scope</span>
              <Button
                data-testid="duplicate-action-btn"
                onClick={() => setDuplicateMessage("Primary scope action confirmed")}
              >
                Confirm Action
              </Button>
            </div>

            <div id="secondary-action-container" className="rounded-md border border-border p-3 space-y-2">
              <span className="text-xs font-semibold text-text">Secondary Scope</span>
              <Button
                variant="ghost"
                data-testid="duplicate-action-btn"
                onClick={() => setDuplicateMessage("Secondary scope action confirmed")}
              >
                Confirm Action
              </Button>
            </div>
          </div>

          {duplicateMessage ? (
            <p className="text-xs font-mono text-accent">{duplicateMessage}</p>
          ) : null}
        </section>

        {/* Panel 7: Unexpected Overlay & Locator Handlers */}
        <section
          data-testid="locator-handler-panel"
          className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Sparkles className="size-5 text-accent" />
            <h2 className="text-lg font-semibold">7. Unexpected Overlay Handler</h2>
          </div>

          <p className="text-xs text-muted">
            Trigger an intrusive promotional modal. In Playwright, register <code className="font-mono">page.addLocatorHandler()</code> to dismiss it automatically without interrupting standard test flow.
          </p>

          <Button variant="ghost" onClick={() => setPromoOpen(true)}>
            Simulate Unexpected Promo Dialog
          </Button>
        </section>

        {/* Panel 8: Condition Waiting vs Arbitrary Sleep */}
        <section
          data-testid="condition-waiting-panel"
          className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Clock className="size-5 text-accent" />
            <h2 className="text-lg font-semibold">8. Condition-Based Waiting</h2>
          </div>

          <p className="text-xs text-muted">
            Delivers a token after a randomized delay (400-1000ms). Teaches web-first assertions over fragile <code className="font-mono">waitForTimeout</code>.
          </p>

          <div className="space-y-3">
            <Button onClick={handleFetchDelayedToken} disabled={tokenLoading}>
              {tokenLoading ? "Generating Token..." : "Fetch Delayed Token"}
            </Button>

            {delayedToken ? (
              <div data-testid="auth-token-card" className="rounded-md border border-accent/40 bg-accent/5 p-3 text-xs font-mono text-accent">
                Token: {delayedToken}
              </div>
            ) : null}
          </div>
        </section>

        {/* Panel 9: Console & Uncaught Error Listeners */}
        <section
          data-testid="error-listener-panel"
          className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Terminal className="size-5 text-accent" />
            <h2 className="text-lg font-semibold">9. Diagnostic Error Telemetry</h2>
          </div>

          <p className="text-xs text-muted">
            Triggers intentional console or runtime errors to practice Playwright listeners: <code className="font-mono">page.on('console')</code> and <code className="font-mono">page.on('pageerror')</code>.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="ghost" onClick={handleTriggerConsoleError}>
              Dispatch Console Error
            </Button>
            <Button variant="ghost" onClick={handleTriggerPageError}>
              Dispatch Window PageError
            </Button>
          </div>

          {errorTriggeredMsg ? (
            <p className="text-xs text-muted font-mono">{errorTriggeredMsg}</p>
          ) : null}
        </section>

        {/* Panel 10: Screenshot Instability & Masking Sandbox */}
        <section
          data-testid="screenshot-mask-panel"
          className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Camera className="size-5 text-accent" />
            <h2 className="text-lg font-semibold">10. Screenshot Instability & Masking</h2>
          </div>

          <p className="text-xs text-muted">
            Card with active keyframe spinning and live dynamic timestamps. Demonstrates how to write stable visual assertions with <code className="font-mono">toHaveScreenshot({`{ animations: 'disabled', mask: [...] }`})</code>.
          </p>

          <div
            id="unstable-visual-card"
            data-testid="unstable-visual-card"
            className="rounded-md border border-border bg-surface-muted p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Zap className="size-6 text-accent animate-spin" />
              <div>
                <span className="text-xs font-semibold text-text">Live Volatile Node</span>
                <p id="volatile-timestamp" className="text-[11px] font-mono text-muted">
                  Seq: #{Math.floor(Date.now() / 1000)}
                </p>
              </div>
            </div>
            <Badge tone="neutral">Volatile Stream</Badge>
          </div>
        </section>
      </div>
    </div>
  );
}
