import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  HelpCircle,
  Menu,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  curriculumModules,
  getAllLessons,
  getLessonById,
  getNextAndPrevLesson,
} from "../../data/learningPath/curriculum";
import type { Lesson, LessonDifficulty } from "../../data/learningPath/types";
import { CodeBlock } from "./CodeBlock";
import { ConfigPlaygroundSection } from "./ConfigPlaygroundSection";
import { DocsBreadcrumbs } from "./DocsBreadcrumbs";
import { DocsSidebar } from "./DocsSidebar";
import { DocsTOC } from "./DocsTOC";
import { ExercisesSection } from "./ExercisesSection";
import { KnowledgeCheckSection } from "./KnowledgeCheckSection";
import { PracticeTaskCard } from "./PracticeTaskCard";
import { useDocsProgress } from "./useDocsProgress";

const difficultyStyles: Record<LessonDifficulty, string> = {
  Beginner: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  Intermediate: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  "Senior SDET": "bg-purple-500/15 text-purple-500 border-purple-500/30",
};

function FormattedSectionContent({ content }: { content: string }) {
  const blocks = content.split("\n\n");
  return (
    <div className="space-y-3.5 text-sm leading-relaxed text-text">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
          const lines = trimmed.split("\n").map((l) => l.replace(/^[-•]\s*/, ""));
          return (
            <ul key={idx} className="list-disc list-inside space-y-1.5 pl-1 text-muted">
              {lines.map((item, lIdx) => (
                <li key={lIdx}>
                  <span className="text-text">{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const lines = trimmed.split("\n").map((l) => l.replace(/^\d+\.\s*/, ""));
          return (
            <ol key={idx} className="list-decimal list-inside space-y-1.5 pl-1 text-muted">
              {lines.map((item, lIdx) => (
                <li key={lIdx}>
                  <span className="text-text">{item}</span>
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={idx} className="text-text leading-relaxed">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

export function PlaywrightDocs() {
  const { lessonId } = useParams<{ lessonId?: string }>();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedInterviewIdx, setExpandedInterviewIdx] = useState<number | null>(null);

  const {
    progress,
    isLessonCompleted,
    toggleLessonCompleted,
    setLastActiveLesson,
    resetProgress,
  } = useDocsProgress();

  const allLessons = useMemo(() => getAllLessons(), []);

  // Determine active lesson
  const currentLesson: Lesson = useMemo(() => {
    if (lessonId) {
      const match = getLessonById(lessonId);
      if (match) return match;
    }
    if (progress.lastActiveLessonId) {
      const match = getLessonById(progress.lastActiveLessonId);
      if (match) return match;
    }
    return allLessons[0];
  }, [lessonId, progress.lastActiveLessonId, allLessons]);

  // Sync route and last active
  useEffect(() => {
    if (!lessonId || lessonId !== currentLesson.id) {
      navigate(`/learn/playwright/${currentLesson.id}`, { replace: true });
    }
    setLastActiveLesson(currentLesson.id);
  }, [currentLesson.id, lessonId, navigate, setLastActiveLesson]);

  const { prevLesson, nextLesson } = useMemo(() => {
    return getNextAndPrevLesson(currentLesson.id);
  }, [currentLesson.id]);

  const completed = isLessonCompleted(currentLesson.id);

  const handleSelectLesson = (id: string) => {
    navigate(`/learn/playwright/${id}`);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-bg text-text" data-testid="playwright-docs-page">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden cursor-default"
        />
      )}

      {/* Docs Grid / Flex Layout */}
      <div className="flex w-full">
        {/* Left Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-surface transition-transform duration-200 ease-in-out lg:sticky lg:top-0 lg:z-10 lg:h-screen lg:translate-x-0 ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <DocsSidebar
            modules={curriculumModules}
            activeLessonId={currentLesson.id}
            completedLessonIds={progress.completedLessonIds}
            lastActiveLessonId={progress.lastActiveLessonId}
            onResumeLesson={handleSelectLesson}
            onResetProgress={resetProgress}
          />
        </div>

        {/* Center Main Article Content */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 md:px-10 lg:px-12 xl:max-w-4xl">
          {/* Mobile Bar to Open Sidebar */}
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text hover:bg-surface-muted"
              data-testid="open-docs-sidebar-mobile"
            >
              <Menu size={14} />
              Curriculum Menu
            </button>
            <span className="font-mono text-xs text-muted">
              {currentLesson.moduleTitle}
            </span>
          </div>

          {/* Breadcrumb Trail */}
          <DocsBreadcrumbs
            moduleTitle={currentLesson.moduleTitle}
            lessonTitle={currentLesson.title}
          />

          {/* Lesson Header */}
          <header className="mt-4 border-b border-border pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded border px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-wider ${
                  difficultyStyles[currentLesson.difficulty]
                }`}
                data-testid="lesson-difficulty-badge"
              >
                {currentLesson.difficulty}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted">
                <Clock size={13} />
                {currentLesson.durationMinutes} min read & practice
              </span>
              <span className="rounded bg-surface-muted px-2 py-0.5 font-mono text-xs text-muted">
                {currentLesson.moduleTitle}
              </span>
            </div>

            <h1
              className="mt-3 text-3xl font-extrabold tracking-tight text-text sm:text-4xl"
              data-testid="lesson-title"
            >
              {currentLesson.title}
            </h1>

            <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
              {currentLesson.summary}
            </p>

            {/* Completion Toggle Button */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => toggleLessonCompleted(currentLesson.id)}
                className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer ${
                  completed
                    ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/25"
                    : "bg-accent text-accent-fg hover:opacity-90 shadow-xs"
                }`}
                data-testid="toggle-lesson-complete-btn"
              >
                <CheckCircle2 size={16} />
                {completed ? "Completed (Click to undo)" : "Mark Lesson as Completed"}
              </button>
            </div>
          </header>

          {/* Section 1: Overview & Prerequisites */}
          <section id="overview" className="mt-8 scroll-mt-20">
            <div className="flex items-center gap-2 text-accent">
              <BookOpen size={20} />
              <h2 className="text-xl font-bold tracking-tight text-text">
                Overview & Prerequisites
              </h2>
            </div>

            <div className="mt-4 rounded-lg border border-border bg-surface p-5 text-sm leading-relaxed text-text">
              <p className="text-muted leading-relaxed">{currentLesson.summary}</p>

              {currentLesson.prerequisites.length > 0 && (
                <div className="mt-4 border-t border-border pt-4">
                  <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
                    Prerequisites:
                  </h4>
                  <ul className="mt-2 list-disc list-inside space-y-1 text-xs text-muted">
                    {currentLesson.prerequisites.map((p, idx) => (
                      <li key={idx}>
                        <span className="text-text">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* Sections: Detailed Content Sections */}
          {currentLesson.sections.map((section) => (
            <section key={section.id} id={section.id} className="mt-10 scroll-mt-20">
              <h2 className="text-xl font-bold tracking-tight text-text">{section.title}</h2>
              <div className="mt-3 rounded-lg border border-border bg-surface p-5 shadow-xs">
                <FormattedSectionContent content={section.content} />
              </div>
            </section>
          ))}

          {/* Section: Code Examples */}
          {currentLesson.codeExamples.length > 0 && (
            <section id="code-examples" className="mt-12 scroll-mt-20">
              <h2 className="text-xl font-bold tracking-tight text-text">
                TypeScript Implementation Patterns
              </h2>
              <p className="mt-1 text-sm text-muted">
                Battle-tested Playwright scripts with line-by-line annotations of locators, assertions, and timeouts.
              </p>

              <div className="mt-4 space-y-4">
                {currentLesson.codeExamples.map((ex) => (
                  <CodeBlock key={ex.id} example={ex} />
                ))}
              </div>
            </section>
          )}

          {/* Section: Pitfalls & Anti-Patterns */}
          {currentLesson.commonMistakes.length > 0 && (
            <section id="common-pitfalls" className="mt-12 scroll-mt-20">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle size={20} />
                <h2 className="text-xl font-bold tracking-tight text-text">
                  Senior Gotchas & Common Pitfalls
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted">
                Anti-patterns frequently observed in junior test suites and how to engineer them out.
              </p>

              <div className="mt-4 space-y-4">
                {currentLesson.commonMistakes.map((pitfall, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-lg border border-amber-500/20 bg-amber-500/5 p-4"
                  >
                    <h3 className="font-semibold text-text">{pitfall.title}</h3>

                    <div className="mt-3 grid gap-3 lg:grid-cols-2">
                      <div className="rounded border border-red-500/30 bg-red-500/5 p-3">
                        <span className="font-mono text-xs font-bold uppercase text-red-400">
                          Anti-Pattern (Fragile)
                        </span>
                        <pre className="mt-2 overflow-x-auto font-mono text-xs text-red-300">
                          <code>{pitfall.badPractice}</code>
                        </pre>
                      </div>

                      <div className="rounded border border-emerald-500/30 bg-emerald-500/5 p-3">
                        <span className="font-mono text-xs font-bold uppercase text-emerald-400">
                          Senior Pattern (Resilient)
                        </span>
                        <pre className="mt-2 overflow-x-auto font-mono text-xs text-emerald-300">
                          <code>{pitfall.goodPractice}</code>
                        </pre>
                      </div>
                    </div>

                    <div className="mt-3 text-xs leading-relaxed text-muted">
                      <strong className="text-text">Why it matters: </strong>
                      {pitfall.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section: Dedicated Configuration Playground (if present) */}
          {currentLesson.playground && (
            <ConfigPlaygroundSection playground={currentLesson.playground} />
          )}

          {/* Section: Practical Hands-On Exercises (if present) */}
          {currentLesson.exercises && currentLesson.exercises.length > 0 && (
            <ExercisesSection
              exercises={currentLesson.exercises}
              title={`${currentLesson.exercises.length} Practical Hands-On Exercises`}
              description="Hands-on progressive exercises connected directly to our project test suite. Each exercise provides starter code, task criteria, expected outcomes, hints, solutions, and local verification commands."
            />
          )}

          {/* Section: Interactive Knowledge Check Assessment (if present) */}
          {currentLesson.knowledgeCheck && currentLesson.knowledgeCheck.length > 0 && (
            <KnowledgeCheckSection
              questions={currentLesson.knowledgeCheck}
              title={`Knowledge Check: ${currentLesson.title}`}
              subtitle="Evaluate your understanding across beginner, intermediate, and advanced concepts with immediate rationale feedback."
            />
          )}

          {/* Section: Hands-on Practice Task */}
          <div className="mt-12">
            <PracticeTaskCard
              task={currentLesson.practiceTask}
              lessonId={currentLesson.id}
            />
          </div>

          {/* Section: Senior SDET Interview Q&A */}
          {currentLesson.interviewQuestions.length > 0 && (
            <section id="interview-qa" className="mt-12 scroll-mt-20">
              <div className="flex items-center gap-2 text-accent">
                <HelpCircle size={18} />
                <h2 className="text-xl font-bold tracking-tight text-text">
                  Senior SDET Interview Q&A
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted">
                Staff & Senior SDET questions frequently asked during architecture and automation technical rounds.
              </p>

              <div className="mt-4 space-y-3">
                {currentLesson.interviewQuestions.map((q, idx) => {
                  const isOpen = expandedInterviewIdx === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-surface transition-colors"
                      data-testid={`interview-qa-${idx}`}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedInterviewIdx(isOpen ? null : idx)}
                        className="flex w-full items-center justify-between p-4 text-left font-medium text-text hover:bg-surface-muted cursor-pointer"
                      >
                        <span className="flex items-center gap-2 text-sm sm:text-base">
                          <span className="font-mono text-xs font-bold text-accent">Q{idx + 1}.</span>
                          {q.question}
                        </span>
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>

                      {isOpen && (
                        <div className="border-t border-border px-4 py-3 text-sm text-muted space-y-3">
                          <p className="leading-relaxed">{q.answer}</p>
                          <div className="rounded border border-accent/20 bg-accent/5 p-3 text-xs">
                            <strong className="text-accent uppercase tracking-wider font-mono">
                              Architectural Deep-Dive:{" "}
                            </strong>
                            <span className="text-text">{q.architecturalContext}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Pagination Navigation Footer */}
          <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            {prevLesson ? (
              <button
                type="button"
                onClick={() => handleSelectLesson(prevLesson.id)}
                className="group flex flex-col items-start rounded-lg border border-border bg-surface p-3 text-left transition-colors hover:border-accent hover:bg-surface-muted cursor-pointer"
                data-testid="prev-lesson-btn"
              >
                <span className="inline-flex items-center gap-1 text-xs text-muted group-hover:text-accent">
                  <ArrowLeft size={12} /> Previous Lesson
                </span>
                <span className="mt-1 text-sm font-semibold text-text">{prevLesson.title}</span>
              </button>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <button
                type="button"
                onClick={() => handleSelectLesson(nextLesson.id)}
                className="group flex flex-col items-end rounded-lg border border-border bg-surface p-3 text-right transition-colors hover:border-accent hover:bg-surface-muted cursor-pointer"
                data-testid="next-lesson-btn"
              >
                <span className="inline-flex items-center gap-1 text-xs text-muted group-hover:text-accent">
                  Next Lesson <ArrowRight size={12} />
                </span>
                <span className="mt-1 text-sm font-semibold text-text">{nextLesson.title}</span>
              </button>
            ) : (
              <div />
            )}
          </footer>
        </main>

        {/* Right Sticky TOC (Desktop xl+) */}
        <div className="hidden xl:block">
          <DocsTOC lesson={currentLesson} />
        </div>
      </div>
    </div>
  );
}
