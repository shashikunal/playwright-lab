import type { LearningMetadata } from "@pil/shared";
import { AlertCircle, Award, BookOpen, Check, CheckSquare, ChevronDown, ChevronUp, Clock, Code2, Copy, HelpCircle, Layers, Lightbulb, ShieldAlert, Sparkles } from "lucide-react";
import { useState } from "react";

type Mode = "guided" | "challenge" | "interview";

export function ScenarioLearningPanel({
  learning,
  scenarioTitle,
}: {
  learning: LearningMetadata;
  scenarioTitle?: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeMode, setActiveMode] = useState<Mode>("guided");
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleCheck = (idx: number) => {
    setCompletedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(learning.guided.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      data-testid="learning-console-panel"
      className="mt-8 overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all"
    >
      {/* Header bar with toggle */}
      <div className="flex flex-wrap items-center justify-between border-b border-border bg-surface-muted/50 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-accent text-accent-fg">
            <Sparkles size={16} />
          </span>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-text">
              Engineering Learning Console {scenarioTitle ? `· ${scenarioTitle}` : ""}
            </h3>
            <p className="font-mono text-[11px] text-muted">Guided · Challenge · Staff Interview Modes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Mode Selector Tabs */}
          <div role="tablist" aria-label="Learning modes" className="flex items-center rounded-lg border border-border bg-surface p-1">
            <button
              type="button"
              role="tab"
              id="tab-guided-mode"
              aria-selected={activeMode === "guided"}
              aria-controls="panel-guided-mode"
              onClick={() => {
                setActiveMode("guided");
                setIsOpen(true);
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                activeMode === "guided"
                  ? "bg-accent text-accent-fg shadow-xs"
                  : "text-muted hover:text-text"
              }`}
            >
              <BookOpen size={13} />
              <span>Guided</span>
            </button>
            <button
              type="button"
              role="tab"
              id="tab-challenge-mode"
              aria-selected={activeMode === "challenge"}
              aria-controls="panel-challenge-mode"
              onClick={() => {
                setActiveMode("challenge");
                setIsOpen(true);
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                activeMode === "challenge"
                  ? "bg-accent text-accent-fg shadow-xs"
                  : "text-muted hover:text-text"
              }`}
            >
              <Award size={13} />
              <span>Challenge</span>
            </button>
            <button
              type="button"
              role="tab"
              id="tab-interview-mode"
              aria-selected={activeMode === "interview"}
              aria-controls="panel-interview-mode"
              onClick={() => {
                setActiveMode("interview");
                setIsOpen(true);
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                activeMode === "interview"
                  ? "bg-accent text-accent-fg shadow-xs"
                  : "text-muted hover:text-text"
              }`}
            >
              <HelpCircle size={13} />
              <span>Interview</span>
            </button>
          </div>

          <button
            type="button"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Collapse learning panel" : "Expand learning panel"}
            onClick={() => setIsOpen(!isOpen)}
            className="flex size-7 items-center justify-center rounded-md border border-border text-muted hover:border-accent hover:text-text"
          >
            {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Collapsible Content Body */}
      {isOpen ? (
        <div className="p-5">
          {/* GUIDED MODE PANEL */}
          {activeMode === "guided" ? (
            <div
              id="panel-guided-mode"
              role="tabpanel"
              aria-labelledby="tab-guided-mode"
              className="space-y-5"
            >
              <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="mt-0.5 text-accent" size={18} />
                  <div>
                    <h4 className="text-sm font-semibold text-text">Concept & Strategy</h4>
                    <p className="mt-1 text-sm leading-relaxed text-text/80">
                      {learning.guided.conceptOverview}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-surface-muted/30 p-4">
                  <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    <Layers size={14} className="text-accent" />
                    Architecture & Behavior
                  </h4>
                  <ul className="mt-2.5 space-y-2 text-sm text-text/90">
                    {learning.guided.architectureDetails.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1.5 size-1.5 rounded-full bg-accent" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-border bg-surface-muted/30 p-4">
                  <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    <CheckSquare size={14} className="text-accent" />
                    Recommended Locators
                  </h4>
                  <ul className="mt-2.5 space-y-1.5 text-xs font-mono text-text">
                    {learning.guided.recommendedLocators.map((loc, idx) => (
                      <li key={idx} className="rounded bg-surface px-2.5 py-1.5 border border-border">
                        {loc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div>
                <div className="flex items-center justify-between pb-2">
                  <span className="flex items-center gap-1.5 font-mono text-xs text-muted">
                    <Code2 size={14} /> Playwright Implementation Pattern
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 rounded border border-border bg-surface px-2 py-1 text-xs text-muted hover:border-accent hover:text-text cursor-pointer"
                  >
                    {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-lg border border-border bg-surface-muted/70 p-4 font-mono text-xs leading-relaxed text-text">
                  <code>{learning.guided.codeSnippet}</code>
                </pre>
              </div>
            </div>
          ) : null}

          {/* CHALLENGE MODE PANEL */}
          {activeMode === "challenge" ? (
            <div
              id="panel-challenge-mode"
              role="tabpanel"
              aria-labelledby="tab-challenge-mode"
              className="space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4">
                <div className="flex items-start gap-3">
                  <Award className="mt-0.5 text-accent" size={18} />
                  <div>
                    <h4 className="text-sm font-semibold text-text">Automated Challenge Objective</h4>
                    <p className="mt-1 text-sm leading-relaxed text-text/80">
                      {learning.challenge.objective}
                    </p>
                  </div>
                </div>
                {learning.challenge.targetRuntimeMs ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs text-muted">
                    <Clock size={12} className="text-accent" />
                    Target: &lt; {learning.challenge.targetRuntimeMs}ms
                  </span>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-surface-muted/30 p-4">
                  <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    <ShieldAlert size={14} className="text-danger" />
                    Strict Engineering Constraints
                  </h4>
                  <ul className="mt-2.5 space-y-2 text-sm text-text/90">
                    {learning.challenge.constraints.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1.5 size-1.5 rounded-full bg-danger" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-border bg-surface-muted/30 p-4">
                  <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    <CheckSquare size={14} className="text-success" />
                    Self-Evaluation Acceptance Checklist
                  </h4>
                  <ul className="mt-2.5 space-y-2 text-sm">
                    {learning.challenge.acceptanceChecklist.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          id={`chk-${idx}`}
                          checked={!!completedItems[idx]}
                          onChange={() => toggleCheck(idx)}
                          className="size-4 rounded border-border accent-accent"
                        />
                        <label
                          htmlFor={`chk-${idx}`}
                          className={`cursor-pointer ${
                            completedItems[idx] ? "line-through text-muted" : "text-text"
                          }`}
                        >
                          {item}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          {/* INTERVIEW MODE PANEL */}
          {activeMode === "interview" ? (
            <div
              id="panel-interview-mode"
              role="tabpanel"
              aria-labelledby="tab-interview-mode"
              className="space-y-5"
            >
              <div className="rounded-lg border border-accent/30 bg-surface-muted/40 p-4">
                <span className="font-mono text-xs uppercase tracking-wider text-accent font-semibold">
                  Staff / Principal SDET Interview Question
                </span>
                <p className="mt-2 text-base font-medium text-text">
                  "{learning.interview.question}"
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface-muted/20 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Senior Engineering Trade-Off Analysis
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-text/90">
                  {learning.interview.tradeOffAnalysis}
                </p>
              </div>

              <div className="rounded-lg border border-danger/30 bg-danger/5 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 text-danger" size={18} />
                  <div>
                    <h4 className="text-sm font-semibold text-danger">Common Candidate Trap to Avoid</h4>
                    <p className="mt-1 text-sm leading-relaxed text-text/80">
                      {learning.interview.trapToAvoid}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
