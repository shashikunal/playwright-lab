export type LessonDifficulty = "Beginner" | "Intermediate" | "Senior SDET";

export type CodeLineExplanation = {
  line: number;
  explanation: string;
};

export type CodeExample = {
  id: string;
  caption: string;
  language: "typescript" | "bash" | "json";
  code: string;
  lineExplanations?: CodeLineExplanation[];
};

export type CommonPitfall = {
  title: string;
  badPractice: string;
  goodPractice: string;
  explanation: string;
};

export type PracticeTask = {
  labRoute: string;
  labName: string;
  objective: string;
  instructions: string[];
  acceptanceCriteria: string[];
  hint: string;
  solutionCode: string;
  playwrightCommand: string;
  starterCode?: string;
  outputInterpretation?: string;
};

export type InterviewQuestion = {
  question: string;
  answer: string;
  architecturalContext: string;
};

export type LessonSection = {
  id: string;
  title: string;
  content: string;
};

export type Lesson = {
  id: string;
  moduleSlug: string;
  moduleTitle: string;
  title: string;
  difficulty: LessonDifficulty;
  durationMinutes: number;
  prerequisites: string[];
  summary: string;
  sections: LessonSection[];
  codeExamples: CodeExample[];
  commonMistakes: CommonPitfall[];
  practiceTask: PracticeTask;
  interviewQuestions: InterviewQuestion[];
};

export type CurriculumModule = {
  slug: string;
  title: string;
  description: string;
  iconName: string;
  lessons: Lesson[];
};

export type UserLearningProgress = {
  lastActiveLessonId: string;
  completedLessonIds: string[];
  exerciseAttempts: Record<string, { attempted: boolean; completedAt?: string }>;
  savedNotes: Record<string, string>;
};
