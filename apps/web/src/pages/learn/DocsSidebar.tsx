import { BookOpen, Check, ChevronDown, ChevronRight, Play, RotateCcw, Search, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import type { CurriculumModule } from "../../data/learningPath/types";

type DocsSidebarProps = {
  modules: CurriculumModule[];
  activeLessonId: string;
  completedLessonIds: string[];
  lastActiveLessonId: string;
  onResumeLesson: (lessonId: string) => void;
  onResetProgress: () => void;
};

export function DocsSidebar({
  modules,
  activeLessonId,
  completedLessonIds,
  lastActiveLessonId,
  onResumeLesson,
  onResetProgress,
}: DocsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  const toggleModule = (slug: string) => {
    setCollapsedModules((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  // Calculate overall progress
  const allLessons = modules.flatMap((m) => m.lessons);
  const totalLessons = allLessons.length;
  const completedCount = completedLessonIds.length;
  const percentComplete = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Filter modules/lessons based on search query
  const filteredModules = modules
    .map((mod) => {
      const matchingLessons = mod.lessons.filter(
        (lesson) =>
          lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lesson.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mod.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...mod, lessons: matchingLessons };
    })
    .filter((mod) => mod.lessons.length > 0);

  return (
    <aside
      aria-label="Documentation navigation"
      data-testid="docs-sidebar"
      className="w-full lg:w-72 shrink-0 border-r border-border bg-surface lg:min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between"
    >
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-muted" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lessons & topics..."
            aria-label="Search curriculum"
            data-testid="docs-search-input"
            className="w-full rounded-md border border-border bg-surface-muted pl-8 pr-8 py-1.5 text-xs text-text placeholder:text-muted focus:outline-hidden focus:border-accent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-2.5 text-muted hover:text-text"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Learning Progress Widget */}
        <div className="rounded-md border border-border bg-surface-muted/60 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-text">Course Progress</span>
            <span className="font-mono text-accent font-semibold">{percentComplete}%</span>
          </div>
          <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-accent h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted pt-1">
            <span>{completedCount} of {totalLessons} completed</span>
            {lastActiveLessonId && lastActiveLessonId !== activeLessonId && (
              <button
                type="button"
                onClick={() => onResumeLesson(lastActiveLessonId)}
                data-testid="resume-lesson-btn"
                className="text-accent hover:underline flex items-center gap-1 font-medium"
              >
                <Play size={10} />
                <span>Resume</span>
              </button>
            )}
          </div>
        </div>

        {/* Modules Tree */}
        <nav aria-label="Curriculum Modules" className="space-y-4">
          {filteredModules.length === 0 ? (
            <p className="text-xs text-muted py-4 text-center">No matching lessons found.</p>
          ) : (
            filteredModules.map((mod) => {
              const isCollapsed = Boolean(collapsedModules[mod.slug]);
              const modCompleted = mod.lessons.every((l) => completedLessonIds.includes(l.id));

              return (
                <div key={mod.slug} className="space-y-1">
                  {/* Module Header */}
                  <button
                    type="button"
                    onClick={() => toggleModule(mod.slug)}
                    aria-expanded={!isCollapsed}
                    className="w-full flex items-center justify-between py-1 text-left text-xs font-semibold text-text hover:text-accent transition-colors"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <BookOpen size={13} className="text-accent shrink-0" />
                      <span className="truncate">{mod.title}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-muted">
                      {modCompleted && <Check size={12} className="text-success" />}
                      {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                    </div>
                  </button>

                  {/* Lessons List */}
                  {!isCollapsed && (
                    <ul className="pl-4 border-l border-border space-y-0.5 mt-1">
                      {mod.lessons.map((lesson) => {
                        const isCompleted = completedLessonIds.includes(lesson.id);
                        const isActive = activeLessonId === lesson.id;

                        return (
                          <li key={lesson.id}>
                            <NavLink
                              to={`/learn/playwright/${lesson.id}`}
                              data-testid={`sidebar-lesson-${lesson.id}`}
                              className={({ isActive: navActive }) =>
                                `flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                                  navActive || isActive
                                    ? "bg-accent/10 text-accent font-medium border-l-2 border-accent"
                                    : "text-muted hover:text-text hover:bg-surface-muted"
                                }`
                              }
                            >
                              <span className="truncate">{lesson.title}</span>
                              {isCompleted && (
                                <Check size={12} className="text-success shrink-0" />
                              )}
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })
          )}
        </nav>
      </div>

      {/* Footer Reset Action */}
      <div className="pt-4 border-t border-border mt-6">
        <button
          type="button"
          onClick={onResetProgress}
          className="flex items-center gap-1.5 text-[11px] text-muted hover:text-danger transition-colors cursor-pointer"
        >
          <RotateCcw size={12} />
          <span>Reset Learning Progress</span>
        </button>
      </div>
    </aside>
  );
}
