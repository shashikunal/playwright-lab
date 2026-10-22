import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Info,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Volume2,
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export function A11yLab() {
  const [remediated, setRemediated] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleRunScan = () => {
    if (remediated) {
      setScanResult("All WCAG 2.1 AA rules satisfied (0 violations detected).");
    } else {
      setScanResult("3 WCAG violations detected: color-contrast, button-name, label.");
    }
  };

  const handleReset = () => {
    setRemediated(false);
    setScanResult(null);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-accent">Accessibility & Inclusive Design</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text">Accessibility Audit Lab</h1>
          <p className="mt-1 text-sm text-muted">
            Automated WCAG 2.1 AA audits with Axe-Core, color contrast verification, accessible naming, and remediation testing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            id="toggle-remediate-btn"
            variant={remediated ? "primary" : "ghost"}
            onClick={() => setRemediated((prev) => !prev)}
          >
            <Sparkles size={16} /> {remediated ? "Remediation Active (Clean)" : "Apply Accessibility Fixes"}
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw size={16} /> Reset
          </Button>
        </div>
      </div>

      {/* Live Auditor Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-5 text-accent" />
          <div>
            <p className="text-sm font-semibold text-text">Axe-Core Audit Practice Surface</p>
            <p className="text-xs text-muted">
              Use <code>new AxeBuilder({`{ page }`}).include('#target').analyze()</code> to assert WCAG compliance.
            </p>
          </div>
        </div>
        <Button onClick={handleRunScan} id="run-scan-btn">
          Run Client Audit Check
        </Button>
      </div>

      {scanResult ? (
        <div
          role="status"
          id="scan-result"
          className={`rounded-md p-4 text-xs font-semibold flex items-center gap-2 ${
            remediated ? "border border-success/40 bg-success/10 text-success" : "border border-warning/40 bg-warning/10 text-warning"
          }`}
        >
          {remediated ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
          <span>{scanResult}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Panel 1: Accessible Reference Component (Clean Baseline) */}
        <section
          data-testid="accessible-panel"
          className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-success" />
              <h2 className="text-lg font-semibold">Accessible Form Standards</h2>
            </div>
            <Badge tone="neutral">100% WCAG AA Compliant</Badge>
          </div>

          <p className="text-xs text-muted">
            Satisfies contrast ratios (&gt; 4.5:1), visible focus rings, explicit label associations, and semantic landmarks.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label htmlFor="user-fullname" className="block text-xs font-medium text-text">
                Full Legal Name <span className="text-accent">*</span>
              </label>
              <input
                id="user-fullname"
                type="text"
                required
                defaultValue="Jordan Learner"
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label htmlFor="user-role-select" className="block text-xs font-medium text-text">
                Primary Automation Role
              </label>
              <select
                id="user-role-select"
                defaultValue="qa"
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
              >
                <option value="qa">Quality Engineer</option>
                <option value="dev">Software Developer</option>
                <option value="lead">Test Automation Architect</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90"
              >
                Save Compliant Profile
              </button>
            </div>
          </form>
        </section>

        {/* Panel 2: Isolated Defect 1 - Poor Color Contrast */}
        <section
          data-testid="defect-contrast-panel"
          className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Eye className="size-5 text-accent" />
              <h2 className="text-lg font-semibold">Color Contrast Test</h2>
            </div>
            <Badge tone={remediated ? "neutral" : "warning"}>
              {remediated ? "Contrast Fixed" : "Defect: Low Contrast"}
            </Badge>
          </div>

          <p className="text-xs text-muted">
            Axe rule: <code>color-contrast</code>. Elements must have sufficient color contrast between text and background.
          </p>

          <div className="rounded-md border border-border bg-surface-muted p-4 space-y-3">
            <p
              id="contrast-sample-text"
              className={remediated ? "text-sm font-semibold text-text" : "text-sm font-normal text-zinc-300 dark:text-zinc-700"}
            >
              {remediated
                ? "High-contrast text meeting WCAG AA ratio (ratio > 7:1)"
                : "Faint low-contrast text violating WCAG AA ratio (ratio < 2.1:1)"}
            </p>
            <p className="text-[11px] text-muted">
              Threshold: WCAG 2.1 Level AA requires a contrast ratio of at least 4.5:1 for normal text.
            </p>
          </div>
        </section>

        {/* Panel 3: Isolated Defect 2 - Button Without Accessible Name */}
        <section
          data-testid="defect-button-panel"
          className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Volume2 className="size-5 text-accent" />
              <h2 className="text-lg font-semibold">Accessible Name Test</h2>
            </div>
            <Badge tone={remediated ? "neutral" : "warning"}>
              {remediated ? "Name Provided" : "Defect: Missing Name"}
            </Badge>
          </div>

          <p className="text-xs text-muted">
            Axe rule: <code>button-name</code>. Screen readers require an accessible name via text content, <code>aria-label</code>, or <code>aria-labelledby</code>.
          </p>

          <div className="flex items-center gap-4 rounded-md border border-border bg-surface-muted p-4">
            <button
              id="icon-audio-button"
              type="button"
              aria-label={remediated ? "Listen to Audio Walkthrough" : undefined}
              className="grid size-10 place-items-center rounded-md bg-accent text-accent-fg hover:opacity-90"
            >
              <Volume2 size={18} />
            </button>
            <span className="text-xs text-muted">
              {remediated ? "Button has explicit aria-label='Listen to Audio Walkthrough'" : "Icon button lacks text and aria-label"}
            </span>
          </div>
        </section>

        {/* Panel 4: Isolated Defect 3 - Form Input Lacking Associated Label */}
        <section
          data-testid="defect-label-panel"
          className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Info className="size-5 text-accent" />
              <h2 className="text-lg font-semibold">Form Label Association</h2>
            </div>
            <Badge tone={remediated ? "neutral" : "warning"}>
              {remediated ? "Label Bound" : "Defect: Orphan Input"}
            </Badge>
          </div>

          <p className="text-xs text-muted">
            Axe rule: <code>label</code>. Form elements must have labels to be identified by assistive technology.
          </p>

          <div className="rounded-md border border-border bg-surface-muted p-4 space-y-3">
            {remediated ? (
              <div>
                <label htmlFor="remediated-token-input" className="block text-xs font-medium text-text">
                  Security Authentication Token
                </label>
                <input
                  id="remediated-token-input"
                  type="text"
                  placeholder="sec_tok_99182"
                  className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
                />
              </div>
            ) : (
              <div>
                <span className="block text-xs font-medium text-muted">Visual description with no label association:</span>
                <input
                  id="orphan-token-input"
                  type="text"
                  placeholder="Missing label-for binding"
                  className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
