import { AlignLeft, ArrowUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Lesson } from "../../data/learningPath/types";

type DocsTOCProps = {
  lesson: Lesson;
};

type TOCItem = {
  id: string;
  label: string;
};

export function DocsTOC({ lesson }: DocsTOCProps) {
  const [activeId, setActiveId] = useState<string>("");

  // Build items from lesson structure
  const tocItems = useMemo<TOCItem[]>(() => [
    { id: "overview", label: "Overview & Objectives" },
    ...lesson.sections.map((sec) => ({ id: sec.id, label: sec.title })),
    ...(lesson.codeExamples.length > 0 ? [{ id: "code-examples", label: "TypeScript Implementation" }] : []),
    ...(lesson.commonMistakes.length > 0 ? [{ id: "common-pitfalls", label: "Pitfalls & Anti-Patterns" }] : []),
    { id: "hands-on-practice", label: "Hands-On Practice Task" },
    ...(lesson.interviewQuestions.length > 0 ? [{ id: "interview-qa", label: "Senior SDET Interview Q&A" }] : []),
  ], [lesson]);

  // Observe active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0% -60% 0%", threshold: 0.1 }
    );

    for (const item of tocItems) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [lesson.id, tocItems]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <aside
      aria-label="Table of contents"
      data-testid="docs-toc"
      className="hidden xl:block w-64 shrink-0 text-sm"
    >
      <div className="sticky top-20 pl-4 border-l border-border space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
          <AlignLeft size={14} className="text-accent" />
          <span>On this page</span>
        </div>

        <ul className="space-y-2 text-xs">
          {tocItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`block py-1 transition-colors leading-relaxed ${
                    isActive
                      ? "text-accent font-semibold pl-2 border-l-2 border-accent -ml-[17px]"
                      : "text-muted hover:text-text"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(item.id);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                      window.history.pushState(null, "", `#${item.id}`);
                      setActiveId(item.id);
                    }
                  }}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="pt-4 border-t border-border">
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors"
          >
            <ArrowUp size={13} />
            <span>Back to top</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
