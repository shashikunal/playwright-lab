import { AlertCircle, Check, CheckCircle2, ChevronDown, ChevronRight, Code2, Copy, HelpCircle, Lightbulb, Play, Terminal } from "lucide-react";
import { useState } from "react";
import type { PracticeExercise } from "../../data/learningPath/types";

type ExercisesSectionProps = {
  exercises: PracticeExercise[];
};

export function ExercisesSection({ exercises }: ExercisesSectionProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);
  const [copiedConfigs, setCopiedConfigs] = useState<Record<string, boolean>>({});
  const [copiedCmds, setCopiedCmds] = useState<Record<string, boolean>>({});
  const [openHints, setOpenHints] = useState<Record<string, boolean>>({});
  const [openSolutions, setOpenSolutions] = useState<Record<string, boolean>>({});

  const toggleExercise = (idx: number) => {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

  const copyConfig = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedConfigs((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setCopiedConfigs((prev) => ({ ...prev, [id]: false })), 2000);
    } catch {
      // ignore
    }
  };

  const copyCmd = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCmds((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setCopiedCmds((prev) => ({ ...prev, [id]: false })), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <section id="hands-on-exercises" className="mt-12 scroll-mt-20" data-testid="hands-on-exercises-section">
      <div className="flex items-center gap-2 text-accent">
        <Play size={20} />
        <h2 className="text-xl font-bold tracking-tight text-text">
          8 Practical Configuration Exercises
        </h2>
      </div>
      <p className="mt-1 text-sm text-muted">
        Hands-on exercises isolating specific settings using our project test suite. Each exercise provides starter configurations, acceptance criteria, expected outcomes, and troubleshooting notes.
      </p>

      <div className="mt-6 space-y-4">
        {exercises.map((ex, idx) => {
          const isOpen = expandedIdx === idx;
          const hintOpen = !!openHints[ex.id];
          const solutionOpen = !!openSolutions[ex.id];
          const configCopied = !!copiedConfigs[ex.id];
          const cmdCopied = !!copiedCmds[ex.id];

          return (
            <div
              key={ex.id}
              className={`rounded-lg border transition-all ${
                isOpen ? "border-accent/40 bg-surface shadow-xs" : "border-border bg-surface hover:border-border/80"
              }`}
              data-testid={`exercise-card-${ex.id}`}
            >
              {/* Exercise Card Header */}
              <button
                type="button"
                onClick={() => toggleExercise(idx)}
                className="flex w-full items-center justify-between p-4 text-left font-semibold text-text hover:bg-surface-muted/40 cursor-pointer"
                data-testid={`toggle-exercise-btn-${idx}`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-6 place-items-center rounded bg-accent/15 font-mono text-xs font-bold text-accent">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-text">{ex.title}</h3>
                    <p className="text-xs font-normal text-muted line-clamp-1">{ex.objective}</p>
                  </div>
                </div>
                {isOpen ? <ChevronDown size={18} className="text-accent" /> : <ChevronRight size={18} className="text-muted" />}
              </button>

              {/* Collapsible Content */}
              {isOpen && (
                <div className="border-t border-border p-5 space-y-5 text-xs text-text">
                  {/* Objective & Prerequisites */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-md border border-border bg-surface-muted/30 p-3.5">
                    <div>
                      <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">Objective:</h4>
                      <p className="mt-1 leading-relaxed text-text">{ex.objective}</p>
                    </div>
                    <div>
                      <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">Prerequisites:</h4>
                      <ul className="mt-1 list-disc list-inside space-y-0.5 text-muted">
                        {ex.prerequisites.map((p, pIdx) => (
                          <li key={pIdx}><span className="text-text">{p}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Starter Configuration */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                        <Code2 size={13} className="text-accent" />
                        <span>Starter Configuration</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => copyConfig(ex.id, ex.starterConfig)}
                        data-testid={`copy-starter-config-${ex.id}`}
                        className="text-[11px] font-mono text-muted hover:text-accent cursor-pointer flex items-center gap-1"
                      >
                        {configCopied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                        <span>{configCopied ? "Copied!" : "Copy Starter Config"}</span>
                      </button>
                    </div>
                    <pre className="rounded border border-border bg-black/40 p-3 font-mono text-xs text-stone-200 overflow-x-auto">
                      {ex.starterConfig}
                    </pre>
                  </div>

                  {/* Task Instructions & Acceptance Criteria */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">Task:</h4>
                      <p className="mt-1 text-text leading-relaxed font-medium">{ex.task}</p>
                    </div>

                    <div className="rounded-md border border-border bg-surface-muted/20 p-3 space-y-2">
                      <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-success" />
                        <span>Acceptance Criteria</span>
                      </h4>
                      <ul className="space-y-1 text-muted">
                        {ex.acceptanceCriteria.map((crit, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-2">
                            <span className="text-accent font-bold">•</span>
                            <span>{crit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Expected Behavior */}
                  <div className="rounded-md border border-accent/20 bg-accent/5 p-3">
                    <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
                      Expected Behavior & Output:
                    </h4>
                    <p className="mt-1 text-text leading-relaxed font-mono text-[11px]">
                      {ex.expectedBehavior}
                    </p>
                  </div>

                  {/* Command to Run */}
                  <div className="space-y-1.5">
                    <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                      Local Execution Command:
                    </h4>
                    <div className="flex items-center justify-between gap-2 rounded border border-border bg-black/50 p-2.5 font-mono text-xs text-stone-300">
                      <div className="flex items-center gap-2 overflow-x-auto">
                        <Terminal size={13} className="text-accent shrink-0" />
                        <span className="text-muted select-none">$</span>
                        <span className="whitespace-nowrap">{ex.command}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyCmd(ex.id, ex.command)}
                        data-testid={`copy-cmd-${ex.id}`}
                        className="shrink-0 rounded border border-border bg-surface px-2 py-0.5 text-[11px] text-muted hover:text-accent cursor-pointer"
                      >
                        {cmdCopied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  {/* Troubleshooting Notes */}
                  <div className="flex items-start gap-2 rounded border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200">
                    <AlertCircle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold text-amber-300 uppercase tracking-wider font-mono text-[10px]">
                        Troubleshooting & Gotchas:{" "}
                      </strong>
                      <span className="text-xs leading-relaxed text-amber-200">{ex.troubleshootingNotes}</span>
                    </div>
                  </div>

                  {/* Hint & Solution Accordions */}
                  <div className="space-y-2 border-t border-border pt-3">
                    {/* Hint */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setOpenHints((prev) => ({ ...prev, [ex.id]: !hintOpen }))}
                        data-testid={`toggle-hint-${ex.id}`}
                        className="flex items-center gap-1.5 font-medium text-muted hover:text-accent cursor-pointer"
                      >
                        <Lightbulb size={13} className="text-warning" />
                        <span>{hintOpen ? "Hide Hint" : "Need a Hint?"}</span>
                        {hintOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </button>
                      {hintOpen && (
                        <div className="mt-2 rounded border border-warning/30 bg-warning/5 p-3 text-text leading-relaxed">
                          {ex.hint}
                        </div>
                      )}
                    </div>

                    {/* Solution */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setOpenSolutions((prev) => ({ ...prev, [ex.id]: !solutionOpen }))}
                        data-testid={`toggle-solution-${ex.id}`}
                        className="flex items-center gap-1.5 font-medium text-muted hover:text-accent cursor-pointer"
                      >
                        <HelpCircle size={13} className="text-muted" />
                        <span>{solutionOpen ? "Hide Reference Solution" : "Reveal Reference Solution"}</span>
                        {solutionOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </button>
                      {solutionOpen && (
                        <pre className="mt-2 rounded border border-border bg-black/60 p-3 font-mono text-xs text-stone-200 overflow-x-auto">
                          {ex.solution}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
