import { CheckCircle2, ChevronDown, ChevronRight, ExternalLink, HelpCircle, Lightbulb, Play, Terminal } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { PracticeTask } from "../../data/learningPath/types";

type PracticeTaskCardProps = {
  task: PracticeTask;
  lessonId: string;
};

export function PracticeTaskCard({ task }: PracticeTaskCardProps) {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [cmdCopied, setCmdCopied] = useState(false);

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(task.playwrightCommand);
      setCmdCopied(true);
      setTimeout(() => setCmdCopied(false), 2000);
    } catch {
      setCmdCopied(false);
    }
  };

  return (
    <div
      id="hands-on-practice"
      data-testid="practice-task-card"
      className="rounded-lg border-2 border-accent/40 bg-surface p-5 shadow-xs space-y-5 my-8"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-md bg-accent text-accent-fg">
            <Play size={16} />
          </span>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-accent font-semibold">
              Hands-On Challenge
            </span>
            <h3 className="text-base font-semibold text-text">{task.objective}</h3>
          </div>
        </div>

        {/* Live Lab Direct Link */}
        <Link
          to={task.labRoute}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="live-lab-link"
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-fg shadow-xs hover:bg-accent/90 transition-colors"
        >
          <span>Open {task.labName}</span>
          <ExternalLink size={13} />
        </Link>
      </div>

      {/* Instructions */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">Instructions</h4>
        <ol className="list-decimal list-inside space-y-1.5 text-xs text-text leading-relaxed">
          {task.instructions.map((step, idx) => (
            <li key={idx} className="pl-1">
              <span className="text-text">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Acceptance Criteria */}
      <div className="space-y-2 rounded-md border border-border bg-surface-muted/50 p-3.5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-success" />
          <span>Acceptance Criteria</span>
        </h4>
        <ul className="space-y-1 text-xs text-muted">
          {task.acceptanceCriteria.map((crit, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span>{crit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Local CLI Command */}
      <div className="rounded-md border border-border bg-black/40 p-3 flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 overflow-x-auto text-stone-300">
          <Terminal size={14} className="text-accent shrink-0" />
          <span className="text-muted select-none">$</span>
          <span className="whitespace-nowrap">{task.playwrightCommand}</span>
        </div>
        <button
          type="button"
          onClick={copyCommand}
          aria-label="Copy Playwright command"
          className="shrink-0 rounded border border-border bg-surface px-2 py-1 text-[11px] text-muted hover:text-accent transition-colors"
        >
          {cmdCopied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Progressive Hint Accordion */}
      <div className="border-t border-border pt-3">
        <button
          type="button"
          onClick={() => setShowHint((h) => !h)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-accent transition-colors cursor-pointer"
        >
          <Lightbulb size={14} className="text-warning" />
          <span>{showHint ? "Hide Hint" : "Need a Hint?"}</span>
          {showHint ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {showHint && (
          <div className="mt-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-text leading-relaxed">
            {task.hint}
          </div>
        )}
      </div>

      {/* Solution Accordion */}
      <div className="border-t border-border pt-3">
        <button
          type="button"
          onClick={() => setShowSolution((s) => !s)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-accent transition-colors cursor-pointer"
        >
          <HelpCircle size={14} className="text-muted" />
          <span>{showSolution ? "Hide Solution Code" : "Reveal Reference Solution"}</span>
          {showSolution ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {showSolution && (
          <div className="mt-2 rounded-md border border-border bg-black/50 p-4 font-mono text-xs text-stone-200 overflow-x-auto">
            <pre>{task.solutionCode}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
