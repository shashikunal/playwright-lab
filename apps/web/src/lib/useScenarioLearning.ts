import type { LearningMetadata } from "@pil/shared";
import { useEffect, useState } from "react";
import { fetchScenarioById } from "./api";

export function useScenarioLearning(scenarioId: string) {
  const [learning, setLearning] = useState<LearningMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchScenarioById(scenarioId, controller.signal)
      .then((scenario) => {
        if (scenario.learning) {
          setLearning(scenario.learning);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
    return () => controller.abort();
  }, [scenarioId]);

  return { learning, loading };
}
