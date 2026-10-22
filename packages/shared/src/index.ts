export type HealthResponse = {
  status: "ok";
  service: "playwright-industrial-lab";
  store: "memory";
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function apiError(code: string, message: string, details?: unknown): ApiErrorBody {
  return { error: { code, message, details } };
}

export const intakeTracks = ["locators", "api", "fixtures"] as const;

export type IntakeTrack = (typeof intakeTracks)[number];

export type FieldError = {
  field: string;
  message: string;
};

export type IntakeRequest = {
  fullName: string;
  email: string;
  seats: number;
  startDate: string;
  track: IntakeTrack;
  agree: boolean;
};

export type IntakeAccepted = {
  id: string;
  status: "accepted";
};

export const scenarioTopics = ["locators", "forms", "widgets", "network", "business", "reliability"] as const;
export const scenarioDifficulties = ["beginner", "intermediate", "advanced"] as const;

export type ScenarioTopic = (typeof scenarioTopics)[number];
export type ScenarioDifficulty = (typeof scenarioDifficulties)[number];
export type ScenarioStatus = "available" | "planned";

export type ScenarioSummary = {
  id: string;
  title: string;
  topic: ScenarioTopic;
  difficulty: ScenarioDifficulty;
  route: string;
  status: ScenarioStatus;
  concepts: string[];
};

export type ScenarioListResponse = {
  scenarios: ScenarioSummary[];
};

export type ScenarioControlState = {
  latencyMs: number;
  empty: boolean;
  statusOverride: number | null;
};

export type NetworkItem = {
  id: string;
  title: string;
  category: string;
  latencyMs: number;
  timestamp: string;
};

export type NetworkListResponse = {
  items: NetworkItem[];
  total: number;
  latencyApplied: number;
};

export type UserRole = "learner" | "trainer" | "admin";

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  token: string;
};

export type Course = {
  id: string;
  code: string;
  title: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  seats: number;
  price: number;
};

export type EnrollmentStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

export type Enrollment = {
  id: string;
  courseId: string;
  courseTitle: string;
  userEmail: string;
  seats: number;
  totalAmount: number;
  status: EnrollmentStatus;
  createdAt: string;
};

export type CourseListResponse = {
  courses: Course[];
  total: number;
};

export type EnrollmentListResponse = {
  enrollments: Enrollment[];
  total: number;
};

// Flaky Lab & File Operations
export type FileUploadResult = {
  id: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
};

export type FlakyState = {
  unstableMode: boolean;
  failureCount: number;
};
