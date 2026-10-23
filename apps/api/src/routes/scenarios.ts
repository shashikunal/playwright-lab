import { apiError, type ScenarioDifficulty, type ScenarioTopic } from "@pil/shared";
import { Router } from "express";
import { scenarioSeed } from "../data/scenarios.js";

const topics = new Set<ScenarioTopic>(["locators", "forms", "widgets", "network", "business", "reliability"]);
const difficulties = new Set<ScenarioDifficulty>(["beginner", "intermediate", "advanced"]);

export const scenariosRouter = Router();

scenariosRouter.get("/scenarios", (req, res) => {
  const topic = single(req.query.topic);
  const difficulty = single(req.query.difficulty);
  const q = single(req.query.q);
  if (topic instanceof Error || difficulty instanceof Error || q instanceof Error) {
    res.status(400).json(apiError("invalid_query", "Query values must be single strings"));
    return;
  }
  if (topic && !topics.has(topic as ScenarioTopic)) {
    res.status(400).json(apiError("invalid_query", "Unknown topic"));
    return;
  }
  if (difficulty && !difficulties.has(difficulty as ScenarioDifficulty)) {
    res.status(400).json(apiError("invalid_query", "Unknown difficulty"));
    return;
  }

  const needle = (q ?? "").trim().toLowerCase();
  const scenarios = scenarioSeed.filter((item) => {
    if (topic && item.topic !== topic) return false;
    if (difficulty && item.difficulty !== difficulty) return false;
    if (!needle) return true;
    const haystack = [item.title, item.topic, ...item.concepts].join(" ").toLowerCase();
    return haystack.includes(needle);
  });
  res.json({ scenarios });
});

scenariosRouter.get("/scenarios/:id", (req, res) => {
  const scenario = scenarioSeed.find((s) => s.id === req.params.id);
  if (!scenario) {
    res.status(404).json(apiError("not_found", "Scenario not found"));
    return;
  }
  res.json({ scenario });
});

function single(value: unknown): string | undefined | Error {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return new Error("repeated");
  if (typeof value !== "string") return new Error("invalid");
  return value;
}
