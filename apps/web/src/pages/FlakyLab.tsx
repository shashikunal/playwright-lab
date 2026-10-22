import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileCode,
  FileText,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Upload,
  X,
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
  // File operations state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadItem | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Delayed Actionability state
  const [delayedDisabled, setDelayedDisabled] = useState(true);
  const [actionExecuted, setActionExecuted] = useState(false);

  // Detached element state
  const [generation, setGeneration] = useState(1);
  const [swapping, setSwapping] = useState(false);

  // Floating interceptor state
  const [showOverlay, setShowOverlay] = useState(true);

  // Flaky request state
  const [unstableMode, setUnstableMode] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);

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
      setUploadError("Network connection error during upload");
    } finally {
      setUploading(false);
    }
  };

  // Trigger DOM node detachment / swap
  const handleTriggerSwap = () => {
    setSwapping(true);
    setTimeout(() => {
      setGeneration((prev) => prev + 1);
      setSwapping(false);
    }, 400);
  };

  // Toggle unstable mode
  const handleToggleUnstable = async () => {
    const res = await fetch("/api/lab/flaky/unstable-toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unstableMode: !unstableMode }),
    });
    if (res.ok) {
      const data = await res.json();
      setUnstableMode(data.state.unstableMode);
    }
  };

  // Fetch flaky resource
  const handleFetchResource = async () => {
    setRequestLoading(true);
    setRequestError(null);
    setRequestStatus(null);

    try {
      const res = await fetch("/api/lab/flaky/unstable-item");
      const data = await res.json();
      if (!res.ok) {
        setRequestError(`${res.status} ${data?.error?.message || "Upstream failure"}`);
      } else {
        setRequestStatus(data.data);
      }
    } catch {
      setRequestError("Network error fetching unstable resource");
    } finally {
      setRequestLoading(false);
    }
  };

  // Reset all flaky lab state
  const handleReset = async () => {
    await fetch("/api/lab/flaky/reset", { method: "POST" });
    setDelayedDisabled(true);
    setActionExecuted(false);
    setGeneration(1);
    setSelectedFile(null);
    setUploadResult(null);
    setUploadError(null);
    setShowOverlay(true);
    setRequestStatus(null);
    setRequestError(null);
    setUnstableMode(false);
    setTimeout(() => setDelayedDisabled(false), 1200);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      {/* Floating Interceptor Banner (Demonstrates unexpected overlays) */}
      {showOverlay ? (
        <aside
          role="region"
          aria-label="Important Announcement Overlay"
          data-testid="floating-interceptor"
          className="fixed bottom-6 right-6 z-50 flex max-w-md items-center justify-between gap-4 rounded-xl border border-accent bg-surface p-4 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="size-5 shrink-0 text-accent" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">Active Practice Overlay</p>
              <p className="text-sm font-medium text-text">Dismiss this overlay to interact freely with underlying tools.</p>
            </div>
          </div>
          <button
            onClick={() => setShowOverlay(false)}
            aria-label="Dismiss Overlay"
            className="rounded-md p-1.5 text-muted hover:bg-surface-muted hover:text-text focus:outline-hidden"
          >
            <X size={18} />
          </button>
        </aside>
      ) : null}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-accent">Reliability & Defect Practice</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text">Flaky Lab & Anti-Pattern Workbench</h1>
          <p className="mt-1 text-sm text-muted">
            Simulated asynchronous race conditions, file uploads, stream downloads, delayed actionability, and DOM replacement.
          </p>
        </div>
        <Button variant="ghost" onClick={handleReset}>
          <RotateCcw size={16} /> Reset Lab State
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Panel 1: File Operations */}
        <section
          data-testid="file-ops-panel"
          className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Upload className="size-5 text-accent" />
            <h2 className="text-lg font-semibold">File Upload & Download</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="file-upload" className="block text-xs font-medium text-muted">
                Upload Test Data (.csv, .json, .txt)
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".csv,.json,.txt"
                aria-label="Upload Test Data"
                onChange={handleFileChange}
                className="mt-2 block w-full text-xs text-muted file:mr-4 file:rounded-md file:border-0 file:bg-accent file:px-4 file:py-2 file:text-xs file:font-semibold file:text-accent-fg hover:file:opacity-90"
              />
            </div>

            {selectedFile ? (
              <div className="rounded-md border border-border bg-surface-muted p-3 text-xs space-y-1">
                <div className="flex items-center gap-2 font-medium text-text">
                  <FileText className="size-4 text-accent" />
                  <span>{selectedFile.name}</span>
                </div>
                <p className="text-muted">
                  Size: {(selectedFile.size / 1024).toFixed(1)} KB | Type: {selectedFile.type || "unknown"}
                </p>
              </div>
            ) : null}

            {uploadError ? (
              <div role="alert" className="rounded-md border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
                {uploadError}
              </div>
            ) : null}

            {uploadResult ? (
              <div
                role="status"
                data-testid="upload-success"
                className="rounded-md border border-success/40 bg-success/10 p-3 text-xs text-success flex items-center gap-2"
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
            <h2 className="text-lg font-semibold">Delayed Actionability</h2>
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
              <p id="actionability-result" className="text-xs font-medium text-success flex items-center justify-center gap-1">
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
            <h2 className="text-lg font-semibold">Dynamic Element Replacement</h2>
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
            <h2 className="text-lg font-semibold">Intermittent Failure Simulator</h2>
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
              <div role="status" className="rounded-md border border-success/40 bg-success/10 p-3 text-xs text-success">
                {requestStatus}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
