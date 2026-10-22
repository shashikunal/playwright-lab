import type { HealthResponse, ScenarioSummary } from "@pil/shared";
import { RefreshCw } from "lucide-react";
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

  return (
    <div className="mx-auto max-w-5xl">
      <p className="font-mono text-xs uppercase tracking-wider text-accent">Overview</p>
      <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
        A local target for senior Playwright practice.
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
        The catalogue comes from Express. Only available scenarios are links. Planned labs stay on the page so you can see what is not built yet.
      </p>

      <section aria-labelledby="health-heading" className="mt-8 rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="health-heading" className="text-sm font-semibold">
            API health
          </h2>
          <button
            type="button"
            onClick={() => load()}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-fg hover:opacity-90"
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

      <section aria-labelledby="catalogue-heading" className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="catalogue-heading" className="text-sm font-semibold">
            Scenario catalogue
          </h2>
          <p className="font-mono text-xs text-muted">GET /api/scenarios</p>
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
                  <ScenarioCard scenario={scenario} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function ScenarioCard({ scenario }: { scenario: ScenarioSummary }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold">{scenario.title}</h3>
        <Badge tone={scenario.status === "planned" ? "warning" : "neutral"}>{scenario.status}</Badge>
      </div>
      <p className="mt-2 font-mono text-xs text-muted">
        {scenario.difficulty} · {scenario.topic}
      </p>
      <p className="mt-2 text-sm text-muted">{scenario.concepts.join(", ")}</p>
    </>
  );

  if (scenario.status === "available") {
    return (
      <Link
        to={scenario.route}
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
