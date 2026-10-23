import { AlertCircle, CheckCircle2, HelpCircle, RotateCcw, ShieldCheck, XCircle } from "lucide-react";
import { useState } from "react";
import type { KnowledgeCheckQuestion } from "../../data/learningPath/types";

type KnowledgeCheckSectionProps = {
  questions: KnowledgeCheckQuestion[];
  title?: string;
  subtitle?: string;
};

export function KnowledgeCheckSection({ questions, title, subtitle }: KnowledgeCheckSectionProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const handleSelect = (questionId: string, optionIdx: number) => {
    if (submitted[questionId]) return; // locked once submitted
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuestion = (questionId: string) => {
    if (selectedAnswers[questionId] === undefined) return;
    setSubmitted((prev) => ({ ...prev, [questionId]: true }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted({});
  };

  const submittedCount = Object.keys(submitted).length;
  const correctCount = questions.filter(
    (q) => submitted[q.id] && selectedAnswers[q.id] === q.correctOptionIndex
  ).length;

  return (
    <section id="knowledge-check" className="mt-14 scroll-mt-20" data-testid="knowledge-check-section">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2 text-accent">
          <HelpCircle size={22} />
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text">
              {title || "Knowledge Check Assessment"}
            </h2>
            <p className="text-xs text-muted">
              {subtitle || "Test your architectural and practical understanding with immediate feedback and post-submission explanations."}
            </p>
          </div>
        </div>

        {submittedCount > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded border border-border bg-surface px-2.5 py-1 text-xs text-muted hover:text-text cursor-pointer"
            data-testid="reset-assessment-btn"
          >
            <RotateCcw size={13} />
            <span>Reset Quiz</span>
          </button>
        )}
      </div>

      {/* Score Progress Bar */}
      <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-surface p-3 text-xs">
        <span className="font-semibold text-text">
          Progress: {submittedCount} of {questions.length} completed
        </span>
        {submittedCount === questions.length ? (
          <span
            className={`font-mono font-bold px-2 py-0.5 rounded ${
              correctCount >= 8
                ? "bg-emerald-500/15 text-emerald-500"
                : correctCount >= 6
                ? "bg-amber-500/15 text-amber-500"
                : "bg-red-500/15 text-red-500"
            }`}
            data-testid="final-score-badge"
          >
            Final Score: {correctCount}/{questions.length} ({Math.round((correctCount / questions.length) * 100)}%)
          </span>
        ) : (
          <span className="text-muted">Select an option and submit to verify your answer</span>
        )}
      </div>

      {/* Questions List */}
      <div className="mt-6 space-y-6">
        {questions.map((q, idx) => {
          const isSubmitted = !!submitted[q.id];
          const selectedIdx = selectedAnswers[q.id];
          const isCorrect = isSubmitted && selectedIdx === q.correctOptionIndex;

          return (
            <div
              key={q.id}
              className={`rounded-lg border p-5 transition-all ${
                isSubmitted
                  ? isCorrect
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-red-500/40 bg-red-500/5"
                  : "border-border bg-surface"
              }`}
              data-testid={`quiz-question-${q.id}`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-accent">Q{idx + 1}.</span>
                    <span className="rounded bg-surface-muted px-2 py-0.5 font-mono text-[10px] uppercase text-muted">
                      {q.topic}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-text leading-snug">
                    {q.question}
                  </h3>
                </div>

                {isSubmitted && (
                  <span
                    className={`flex items-center gap-1 font-mono text-xs font-bold shrink-0 ${
                      isCorrect ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Correct</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        <span>Incorrect</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Options */}
              <div className="mt-4 space-y-2">
                {q.options.map((opt, oIdx) => {
                  const isSelected = selectedIdx === oIdx;
                  let optionStyle = "border-border bg-surface hover:border-accent/50 text-text";

                  if (isSubmitted) {
                    if (oIdx === q.correctOptionIndex) {
                      optionStyle = "border-emerald-500/60 bg-emerald-500/10 text-emerald-200 font-medium";
                    } else if (isSelected) {
                      optionStyle = "border-red-500/60 bg-red-500/10 text-red-200";
                    } else {
                      optionStyle = "border-border/40 bg-surface/40 text-muted opacity-60";
                    }
                  } else if (isSelected) {
                    optionStyle = "border-accent bg-accent/10 text-text font-medium";
                  }

                  return (
                    <label
                      key={oIdx}
                      className={`flex items-center gap-3 rounded-md border p-3 text-xs transition-colors cursor-pointer ${optionStyle}`}
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        checked={isSelected}
                        disabled={isSubmitted}
                        onChange={() => handleSelect(q.id, oIdx)}
                        className="accent-accent"
                        data-testid={`option-${q.id}-${oIdx}`}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>

              {/* Submit Button (if not yet submitted) */}
              {!isSubmitted && (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    disabled={selectedIdx === undefined}
                    onClick={() => handleSubmitQuestion(q.id)}
                    className="rounded-md bg-accent px-3.5 py-1.5 text-xs font-semibold text-accent-fg shadow-xs hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-opacity"
                    data-testid={`submit-answer-btn-${q.id}`}
                  >
                    Submit Answer
                  </button>
                </div>
              )}

              {/* Architectural Explanation (Shown ONLY after submission) */}
              {isSubmitted && (
                <div
                  className={`mt-4 rounded-md border p-3.5 text-xs leading-relaxed space-y-1.5 ${
                    isCorrect
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-100"
                      : "border-red-500/30 bg-red-500/5 text-red-100"
                  }`}
                  data-testid={`explanation-${q.id}`}
                >
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider font-mono text-[10px]">
                    {isCorrect ? <ShieldCheck size={14} className="text-emerald-400" /> : <AlertCircle size={14} className="text-red-400" />}
                    <span>{isCorrect ? "Correct Solution Explanation" : "Incorrect — Solution Analysis"}</span>
                  </div>
                  <p className="text-muted leading-relaxed">
                    <strong className="text-text">Key Principle: </strong>
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
