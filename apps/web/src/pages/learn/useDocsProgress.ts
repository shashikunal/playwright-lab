import { useCallback, useEffect, useState } from "react";
import { getAllLessons } from "../../data/learningPath/curriculum";
import type { UserLearningProgress } from "../../data/learningPath/types";

const STORAGE_KEY = "pil-learning-progress";

export interface DocsProgressHook {
  progress: UserLearningProgress;
  isLessonCompleted: (lessonId: string) => boolean;
  toggleLessonCompleted: (lessonId: string) => void;
  recordExerciseAttempt: (lessonId: string) => void;
  setLastActiveLesson: (lessonId: string) => void;
  resetProgress: () => void;
  totalLessons: number;
  completedCount: number;
  progressPercentage: number;
}

function loadInitialProgress(): UserLearningProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        lastActiveLessonId: typeof parsed.lastActiveLessonId === "string" ? parsed.lastActiveLessonId : "playwright-introduction",
        completedLessonIds: Array.isArray(parsed.completedLessonIds) ? parsed.completedLessonIds : [],
        exerciseAttempts: typeof parsed.exerciseAttempts === "object" && parsed.exerciseAttempts !== null ? parsed.exerciseAttempts : {},
        savedNotes: typeof parsed.savedNotes === "object" && parsed.savedNotes !== null ? parsed.savedNotes : {},
      };
    }
  } catch {
    // ignore parse errors and fallback
  }

  return {
    lastActiveLessonId: "playwright-introduction",
    completedLessonIds: [],
    exerciseAttempts: {},
    savedNotes: {},
  };
}

export function useDocsProgress(): DocsProgressHook {
  const [progress, setProgress] = useState<UserLearningProgress>(loadInitialProgress);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // quota or private browsing fallback
    }
  }, [progress]);

  const isLessonCompleted = useCallback(
    (lessonId: string) => progress.completedLessonIds.includes(lessonId),
    [progress.completedLessonIds]
  );

  const toggleLessonCompleted = useCallback((lessonId: string) => {
    setProgress((prev) => {
      const exists = prev.completedLessonIds.includes(lessonId);
      const updated = exists
        ? prev.completedLessonIds.filter((id) => id !== lessonId)
        : [...prev.completedLessonIds, lessonId];
      return { ...prev, completedLessonIds: updated };
    });
  }, []);

  const recordExerciseAttempt = useCallback((lessonId: string) => {
    setProgress((prev) => ({
      ...prev,
      exerciseAttempts: {
        ...prev.exerciseAttempts,
        [lessonId]: {
          attempted: true,
          completedAt: new Date().toISOString(),
        },
      },
    }));
  }, []);

  const setLastActiveLesson = useCallback((lessonId: string) => {
    setProgress((prev) => {
      if (prev.lastActiveLessonId === lessonId) return prev;
      return { ...prev, lastActiveLessonId: lessonId };
    });
  }, []);

  const resetProgress = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setProgress({
      lastActiveLessonId: "playwright-introduction",
      completedLessonIds: [],
      exerciseAttempts: {},
      savedNotes: {},
    });
  }, []);

  const allLessons = getAllLessons();
  const totalLessons = allLessons.length;
  const completedCount = progress.completedLessonIds.length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return {
    progress,
    isLessonCompleted,
    toggleLessonCompleted,
    recordExerciseAttempt,
    setLastActiveLesson,
    resetProgress,
    totalLessons,
    completedCount,
    progressPercentage,
  };
}
