import type { HealthResponse, ScenarioListResponse } from "@pil/shared";

export async function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const response = await fetch("/api/health", { signal });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json() as Promise<HealthResponse>;
}

export async function fetchScenarios(
  query: { q?: string; topic?: string; difficulty?: string },
  signal?: AbortSignal,
): Promise<ScenarioListResponse> {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.topic) params.set("topic", query.topic);
  if (query.difficulty) params.set("difficulty", query.difficulty);
  const suffix = params.size > 0 ? `?${params.toString()}` : "";
  const response = await fetch(`/api/scenarios${suffix}`, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<ScenarioListResponse>;
}
