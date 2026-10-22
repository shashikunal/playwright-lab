import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Eye,
  Layers,
  Palette,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export function VisualLab() {
  // Volatile dynamic state (causes snapshot diffs unless masked)
  const [timestamp, setTimestamp] = useState(new Date().toISOString());
  const [txId, setTxId] = useState(`TX-${Math.floor(100000 + Math.random() * 900000)}`);

  // Animation state
  const [animationActive, setAnimationActive] = useState(true);

  // Intentional visual drift simulator
  const [hasDrift, setHasDrift] = useState(false);

  // Update volatile clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(new Date().toISOString());
      setTxId(`TX-${Math.floor(100000 + Math.random() * 900000)}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setHasDrift(false);
    setAnimationActive(true);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-accent">Visual Testing & Accessibility</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text">Visual Regression & Snapshot Workbench</h1>
          <p className="mt-1 text-sm text-muted">
            Learn pixel-perfect screenshot comparisons, locator masking for dynamic data, animation stabilization, and diff detection.
          </p>
        </div>
        <Button variant="ghost" onClick={handleReset}>
          <RotateCcw size={16} /> Reset Visual Lab
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Panel 1: Deterministic Baseline Card */}
        <section
          data-testid="stable-card"
          className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-accent" />
              <h2 className="text-lg font-semibold">Deterministic Component</h2>
            </div>
            <Badge tone="neutral">100% Stable</Badge>
          </div>

          <p className="text-xs text-muted">
            This card contains no dynamic data, random numbers, or unconstrained fonts. It is ideal for baseline snapshot testing with <code>expect(locator).toHaveScreenshot()</code>.
          </p>

          <div className="rounded-md border border-border bg-surface-muted p-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-text">Service Tier</span>
              <span className="font-semibold text-accent">Enterprise Enterprise</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-text">Deployment Zone</span>
              <span className="font-mono text-xs text-muted">us-east-cluster-01</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-text">System Status</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
                <CheckCircle2 size={14} /> Operational
              </span>
            </div>
          </div>
        </section>

        {/* Panel 2: Volatile Dynamic Data & Masking Zone */}
        <section
          data-testid="volatile-card"
          className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Clock className="size-5 text-accent" />
              <h2 className="text-lg font-semibold">Dynamic Data & Masking</h2>
            </div>
            <Badge tone="warning">Requires Mask</Badge>
          </div>

          <p className="text-xs text-muted">
            Contains volatile real-time clocks and randomized transaction hashes. Without locator masking, visual regression tests will fail due to normal data shifts.
          </p>

          <div className="rounded-md border border-border bg-surface-muted p-4 space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted">Live Timestamp:</span>
              <span
                data-testid="volatile-timestamp"
                className="font-mono text-xs font-semibold text-accent rounded px-1.5 py-0.5 bg-accent/10"
              >
                {timestamp}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted">Transaction ID:</span>
              <span
                data-testid="volatile-txid"
                className="font-mono text-xs font-semibold text-text rounded px-1.5 py-0.5 bg-surface"
              >
                {txId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted">Static Order Type:</span>
              <span className="font-semibold text-text">Batch Pipeline Execution</span>
            </div>
          </div>
        </section>

        {/* Panel 3: CSS Animations & Motion Freezing */}
        <section
          data-testid="motion-card"
          className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-accent" />
              <h2 className="text-lg font-semibold">Animation Stabilization</h2>
            </div>
            <Badge tone="neutral">{animationActive ? "Animated" : "Frozen"}</Badge>
          </div>

          <p className="text-xs text-muted">
            Continuous animations introduce frame timing flakiness. Playwright's <code>animations: "disabled"</code> automatically freezes CSS keyframe animations.
          </p>

          <div className="rounded-md border border-border bg-surface-muted p-4 flex flex-col items-center justify-center gap-3">
            <div
              data-testid="motion-indicator"
              className={`grid size-12 place-items-center rounded-full bg-accent/10 border border-accent text-accent ${
                animationActive ? "animate-pulse" : ""
              }`}
            >
              <Palette className={animationActive ? "animate-spin" : ""} size={20} />
            </div>

            <Button
              variant="ghost"
              onClick={() => setAnimationActive((prev) => !prev)}
              aria-pressed={animationActive}
            >
              {animationActive ? "Pause Animations" : "Resume Animations"}
            </Button>
          </div>
        </section>

        {/* Panel 4: Intentional Visual Diff Simulator */}
        <section
          data-testid="diff-simulator-card"
          className={`rounded-lg border bg-surface transition-all duration-200 p-6 shadow-xs space-y-4 ${
            hasDrift ? "border-danger ring-2 ring-danger/30 p-8" : "border-border"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Layers className="size-5 text-accent" />
              <h2 className="text-lg font-semibold">Visual Diff Simulator</h2>
            </div>
            <Badge tone={hasDrift ? "warning" : "neutral"}>
              {hasDrift ? "Drift Active" : "Original Layout"}
            </Badge>
          </div>

          <p className="text-xs text-muted">
            Toggle simulated layout shift and color drift to inspect how Playwright detects visual discrepancies, produces diff images, and highlights changed pixels.
          </p>

          <div
            data-testid="drift-target"
            className={`rounded-md p-4 transition-all ${
              hasDrift ? "bg-danger/10 text-danger border border-danger/40" : "bg-surface-muted text-text border border-border"
            }`}
          >
            <p className="text-xs font-semibold">
              {hasDrift ? "Discrepancy Detected: Padding changed + border color altered" : "Baseline layout aligned to design tokens"}
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              id="toggle-drift-btn"
              variant={hasDrift ? "primary" : "ghost"}
              onClick={() => setHasDrift((prev) => !prev)}
            >
              <Eye size={14} /> {hasDrift ? "Reset Baseline" : "Simulate Visual Drift"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
