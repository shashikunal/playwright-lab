import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

type DocsBreadcrumbsProps = {
  moduleTitle: string;
  lessonTitle: string;
};

export function DocsBreadcrumbs({ moduleTitle, lessonTitle }: DocsBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumbs" className="flex items-center space-x-2 text-xs text-muted mb-4">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-text transition-colors"
        title="Industrial Lab Overview"
      >
        <Home size={13} />
        <span>Home</span>
      </Link>
      <ChevronRight size={12} className="text-muted/60" />
      <Link
        to="/learn/playwright"
        className="hover:text-text transition-colors font-medium text-text"
      >
        Playwright Docs
      </Link>
      <ChevronRight size={12} className="text-muted/60" />
      <span className="text-muted truncate max-w-[140px] sm:max-w-none">{moduleTitle}</span>
      <ChevronRight size={12} className="text-muted/60" />
      <span className="text-accent font-medium truncate max-w-[160px] sm:max-w-none" aria-current="page">
        {lessonTitle}
      </span>
    </nav>
  );
}
