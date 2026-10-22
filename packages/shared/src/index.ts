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

export const scenarioTopics = ["locators", "forms", "widgets", "network", "business", "reliability", "browser"] as const;
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

export type HttpErrorStatus = 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500;

export type ScenarioControlState = {
  latencyMs: number;
  empty: boolean;
  statusOverride: number | null;
  simulateTimeout?: boolean;
  failureCountdown?: number;
};

export type StreamRecord = {
  id: string;
  sequence: number;
  topic: string;
  payload: string;
  timestamp: string;
};

export type StreamResponse = {
  items: StreamRecord[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
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

// Browser Lab types
export type BrowserCookieInfo = {
  name: string;
  value: string;
  domain?: string;
  path?: string;
};

export type BrowserGeoLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export type AdvancedFormPayload = {
  username: string;
  email: string;
  password?: string;
  age?: number;
  birthdate?: string;
  category?: string;
  agreeToTerms: boolean;
  newsletter: boolean;
  notificationPreference: "email" | "sms" | "none";
  bio?: string;
};

// Phase 7: Business Application Types
export type UserStatus = "Active" | "Inactive" | "Suspended";

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department: string;
  enrolledCoursesCount: number;
  createdAt: string;
};

export type UserListResponse = {
  users: ManagedUser[];
  total: number;
  page: number;
  totalPages: number;
};

export type CourseModule = {
  id: string;
  title: string;
  durationMinutes: number;
  description: string;
};

export type CourseDetail = Course & {
  description: string;
  instructorName: string;
  prerequisites: string[];
  syllabus: CourseModule[];
  remainingSeats: number;
};

export type ActivityAction =
  | "user_registered"
  | "course_created"
  | "enrollment_submitted"
  | "enrollment_status_changed"
  | "user_deactivated";

export type ActivityItem = {
  id: string;
  actorEmail: string;
  action: ActivityAction;
  target: string;
  timestamp: string;
};

export type ActivityListResponse = {
  activities: ActivityItem[];
  total: number;
};

export type NotificationPrefs = {
  emailUpdates: boolean;
  smsAlerts: boolean;
  weeklySummary: boolean;
};

export type UserProfileResponse = {
  user: UserProfile;
  preferences: NotificationPrefs;
};
