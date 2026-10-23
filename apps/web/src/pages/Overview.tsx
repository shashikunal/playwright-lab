import type { HealthResponse, ScenarioSummary } from "@pil/shared";
import { CheckCircle2, GraduationCap, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { fetchHealth, fetchScenarios } from "../lib/api";

function isAbort(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

type LoadState =
  | { status: "loading" }
  | { status: "ok"; health: HealthResponse }
  | { status: "error"; message: string };

type CatalogueState =
  | { status: "loading" }
  | { status: "ok"; scenarios: ScenarioSummary[] }
  | { status: "error"; message: string };

export function Overview() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [catalogue, setCatalogue] = useState<CatalogueState>({ status: "loading" });
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");

  // Persistent Learner Progress Tracker
  const [completedScenarios, setCompletedScenarios] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("pil-progress");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleComplete = (id: string) => {
    setCompletedScenarios((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("pil-progress", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const resetProgress = () => {
    try {
      localStorage.removeItem("pil-progress");
    } catch {
      // ignore
    }
    setCompletedScenarios([]);
  };

  const load = useCallback(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    fetchHealth(controller.signal)
      .then((health) => setState({ status: "ok", health }))
      .catch((error: unknown) => {
        if (isAbort(error)) return;
        const message = error instanceof Error ? error.message : "Request failed";
        setState({ status: "error", message });
      });
    return () => controller.abort();
  }, []);

  useEffect(() => load(), [load]);

  useEffect(() => {
    const controller = new AbortController();
    setCatalogue({ status: "loading" });
    fetchScenarios({ q, topic, difficulty }, controller.signal)
      .then((body) => setCatalogue({ status: "ok", scenarios: body.scenarios }))
      .catch((error: unknown) => {
        if (isAbort(error)) return;
        const message = error instanceof Error ? error.message : "Request failed";
        setCatalogue({ status: "error", message });
      });
    return () => controller.abort();
  }, [q, topic, difficulty]);

  const totalCount = catalogue.status === "ok" ? catalogue.scenarios.length : 15;
  const progressPercent = totalCount > 0 ? Math.round((completedScenarios.length / totalCount) * 100) : 0;

  return (
    <div className="mx-auto max-w-5xl">
      <p className="font-mono text-xs uppercase tracking-wider text-accent">Overview</p>
      <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
        A local target for senior Playwright practice.
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
        The catalogue comes from Express. Only available scenarios are links. Planned labs stay on the page so you can see what is not built yet.
      </p>

      {/* Playwright Learning Path Hero Banner */}
      <section
        aria-labelledby="learn-hero-heading"
        className="mt-6 rounded-lg border border-accent/30 bg-gradient-to-r from-accent/10 via-surface to-surface p-5 sm:p-6"
        data-testid="playwright-docs-hero-banner"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-2.5 py-0.5 font-mono text-xs font-semibold text-accent">
              <GraduationCap size={14} /> New: Full Curriculum
            </span>
            <h2 id="learn-hero-heading" className="text-lg font-bold tracking-tight text-text sm:text-xl">
              Playwright Documentation & Senior Learning Path
            </h2>
            <p className="text-sm text-muted max-w-xl">
              15+ in-depth documentation modules, line-by-line TypeScript breakdowns, common anti-patterns, real terminal test commands, and L5/L6 SDET interview preparation.
            </p>
          </div>
          <Link
            to="/learn/playwright"
            data-testid="explore-docs-hero-btn"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg shadow-sm hover:opacity-90"
          >
            Start Learning
          </Link>
        </div>
      </section>

      {/* API Health */}
      <section aria-labelledby="health-heading" className="mt-8 rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="health-heading" className="text-sm font-semibold">
            API health
          </h2>
          <button
            type="button"
            onClick={() => load()}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-fg hover:opacity-90 cursor-pointer"
          >
            <RefreshCw aria-hidden="true" size={14} />
            Retry
          </button>
        </div>
        <div className="px-5 py-5">
          {state.status === "loading" ? (
            <div role="status" aria-label="Checking API" className="space-y-3">
              <div className="h-4 w-40 animate-pulse rounded bg-surface-muted" />
              <div className="h-4 w-64 animate-pulse rounded bg-surface-muted" />
            </div>
          ) : null}
          {state.status === "ok" ? (
            <div role="status" className="flex items-start gap-3">
              <span className="pil-pulse mt-1 size-2.5 rounded-full bg-success" aria-hidden="true" />
              <div>
                <p className="font-medium text-success">API healthy</p>
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-muted">Service</dt>
                    <dd className="font-mono">{state.health.service}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Store</dt>
                    <dd className="font-mono">{state.health.store}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Endpoint</dt>
                    <dd className="font-mono">GET /api/health</dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : null}
          {state.status === "error" ? (
            <p role="alert" className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
              API unreachable. {state.message}
            </p>
          ) : null}
        </div>
      </section>

      {/* Persistent Learner Progress Tracker */}
      <section
        aria-labelledby="progress-heading"
        className="mt-6 rounded-lg border border-border bg-surface p-5"
        data-testid="learner-progress-section"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-accent/10 text-accent">
              <GraduationCap size={18} />
            </span>
            <div>
              <h2 id="progress-heading" className="text-sm font-semibold text-text">
                Learner Mastery Tracker
              </h2>
              <p className="text-xs text-muted">Persisted checklist tracking your senior Playwright mastery progress.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-accent" data-testid="progress-ratio">
              {completedScenarios.length} / {totalCount} Mastered ({progressPercent}%)
            </span>
            {completedScenarios.length > 0 && (
              <button
                type="button"
                onClick={resetProgress}
                className="text-xs text-muted hover:text-text underline cursor-pointer"
                data-testid="reset-progress-btn"
              >
                Reset Progress
              </button>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden">
            <div
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
              data-testid="learner-progress-bar"
            />
          </div>
        </div>
      </section>

      {/* Scenario Catalogue */}
      <section aria-labelledby="catalogue-heading" className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="catalogue-heading" className="text-sm font-semibold">
            Scenario catalogue
          </h2>
          <div className="flex items-center gap-3">
            <a
              href="/api/docs"
              target="_blank"
              className="text-xs text-accent underline hover:text-accent/80 font-mono"
              data-testid="api-docs-link"
            >
              OpenAPI Docs (/api/docs)
            </a>
            <p className="font-mono text-xs text-muted">GET /api/scenarios</p>
          </div>
        </div>
        <form className="mt-4 grid gap-3 sm:grid-cols-3" onSubmit={(event) => event.preventDefault()}>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Search scenarios</span>
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Topic</span>
            <select
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2"
            >
              <option value="">All topics</option>
              <option value="locators">Locators</option>
              <option value="forms">Forms</option>
              <option value="widgets">Widgets</option>
              <option value="network">Network</option>
              <option value="business">Business</option>
              <option value="reliability">Reliability</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Difficulty</span>
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2"
            >
              <option value="">All difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
        </form>

        <div className="mt-4">
          {catalogue.status === "loading" ? (
            <p role="status" className="text-sm text-muted">
              Loading scenarios
            </p>
          ) : null}
          {catalogue.status === "error" ? (
            <p role="alert" className="text-sm text-danger">
              Catalogue unavailable. {catalogue.message}
            </p>
          ) : null}
          {catalogue.status === "ok" && catalogue.scenarios.length === 0 ? (
            <p role="status" className="rounded-lg border border-border bg-surface px-4 py-6 text-sm text-muted">
              No scenarios match
            </p>
          ) : null}
          {catalogue.status === "ok" && catalogue.scenarios.length > 0 ? (
            <ul className="grid gap-3 md:grid-cols-2">
              {catalogue.scenarios.map((scenario) => (
                <li key={scenario.id}>
                  <ScenarioCard
                    scenario={scenario}
                    isCompleted={completedScenarios.includes(scenario.id)}
                    onToggleComplete={toggleComplete}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function ScenarioCard({
  scenario,
  isCompleted,
  onToggleComplete,
}: {
  scenario: ScenarioSummary;
  isCompleted?: boolean;
  onToggleComplete?: (id: string) => void;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-text">{scenario.title}</h3>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success" data-testid={`mastered-label-${scenario.id}`}>
              <CheckCircle2 size={12} /> Mastered
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onToggleComplete && scenario.status === "available" && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleComplete(scenario.id);
              }}
              data-testid={`toggle-complete-${scenario.id}`}
              className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                isCompleted
                  ? "bg-green-500/10 text-green-500 border-green-500/30 hover:bg-green-500/20"
                  : "bg-surface-muted text-muted border-border hover:text-text hover:border-accent"
              }`}
            >
              {isCompleted ? "✓ Done" : "+ Mark"}
            </button>
          )}
          <Badge tone={scenario.status === "planned" ? "warning" : "neutral"}>{scenario.status}</Badge>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">{scenario.concepts.join(", ")}</p>
      {scenario.learning ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50 text-[11px] font-mono text-muted">
          <span className="rounded bg-accent/10 px-1.5 py-0.5 text-accent font-semibold">Guided</span>
          <span className="rounded bg-surface-muted px-1.5 py-0.5 text-text">Challenge</span>
          <span className="rounded bg-surface-muted px-1.5 py-0.5 text-text">Interview Q</span>
        </div>
      ) : null}
    </>
  );

  if (scenario.status === "available") {
    return (
      <Link
        to={scenario.route}
        aria-label={scenario.title}
        className="block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent"
      >
        {body}
      </Link>
    );
  }

  return (
    <article className="rounded-lg border border-dashed border-border bg-surface p-4">
      {body}
      <p className="mt-3 text-sm text-muted">Not available yet</p>
    </article>
  );
}
