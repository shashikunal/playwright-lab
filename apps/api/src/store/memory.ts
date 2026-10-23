import type { ActivityAction, ActivityItem, Course, CourseDetail, CourseModule, Enrollment, EnrollmentStatus, FileUploadResult, FlakyState, ManagedUser, NotificationPrefs, StreamRecord, StreamResponse, UserRole, UserStatus } from "@pil/shared";

export type ScenarioControls = {
  latencyMs: number;
  empty: boolean;
  statusOverride: number | null;
  simulateTimeout: boolean;
};

export type IntakeRecord = {
  id: string;
  fullName: string;
  email: string;
  seats: number;
  startDate: string;
  track: string;
};

export type MockUser = {
  id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  token: string;
};

export type NamespaceData = {
  id: string;
  scenario: ScenarioControls;
  submissions: IntakeRecord[];
  nextSubmission: number;
};

export const initialUsers: MockUser[] = [
  { id: "usr_learner", email: "learner@pil.local", name: "Alex Learner", password: "Learner123!", role: "learner", token: "tok_learner_session" },
  { id: "usr_trainer", email: "trainer@pil.local", name: "Morgan Trainer", password: "Trainer123!", role: "trainer", token: "tok_trainer_session" },
  { id: "usr_admin", email: "admin@pil.local", name: "Sam Admin", password: "Admin123!", role: "admin", token: "tok_admin_session" },
];

export const initialCourses: Course[] = [
  { id: "crs_01", code: "PW-101", title: "Playwright Core Automations", category: "Basics", difficulty: "beginner", seats: 24, price: 199 },
  { id: "crs_02", code: "PW-201", title: "Advanced Locators and Frames", category: "Core", difficulty: "intermediate", seats: 18, price: 299 },
  { id: "crs_03", code: "PW-301", title: "Network Interception & API Mocks", category: "Network", difficulty: "advanced", seats: 12, price: 399 },
  { id: "crs_04", code: "PW-401", title: "CI/CD & Parallel Sharding Pipelines", category: "DevOps", difficulty: "advanced", seats: 15, price: 449 },
  { id: "crs_05", code: "PW-501", title: "Visual Regression & Accessibility Auditing", category: "Quality", difficulty: "intermediate", seats: 20, price: 349 },
  { id: "crs_06", code: "PW-601", title: "Security Testing with Auth Storage States", category: "Security", difficulty: "advanced", seats: 10, price: 499 },
];

export function createInitialEnrollments(): Enrollment[] {
  return [
    {
      id: "enr_101",
      courseId: "crs_01",
      courseTitle: "Playwright Core Automations",
      userEmail: "learner@pil.local",
      seats: 2,
      totalAmount: 398,
      status: "Approved",
      createdAt: "2026-10-20T08:30:00Z",
    },
    {
      id: "enr_102",
      courseId: "crs_02",
      courseTitle: "Advanced Locators and Frames",
      userEmail: "learner@pil.local",
      seats: 1,
      totalAmount: 299,
      status: "Pending",
      createdAt: "2026-10-21T14:15:00Z",
    },
  ];
}

export const initialEnrollments: Enrollment[] = createInitialEnrollments();

let coursesStore = initialCourses.map((c) => ({ ...c }));
let enrollmentsStore = createInitialEnrollments();
let nextEnrollmentId = 103;

const namespaces = new Map<string, NamespaceData>();

export function defaultScenario(): ScenarioControls {
  return { latencyMs: 0, empty: false, statusOverride: null, simulateTimeout: false };
}

export function initStore(): void {
  if (!namespaces.has("shared")) {
    resetNamespace("shared");
  }
}

export function resetNamespace(id = "shared"): NamespaceData {
  const next: NamespaceData = {
    id,
    scenario: defaultScenario(),
    submissions: [],
    nextSubmission: 1,
  };
  namespaces.set(id, next);
  return next;
}

let nextCourseId = 100;

export function resetCoursesStore(): void {
  coursesStore = initialCourses.map((c) => ({ ...c }));
  nextCourseId = 100;
}

export function resetEnrollmentsStore(): void {
  enrollmentsStore = createInitialEnrollments();
  nextEnrollmentId = 103;
  resetCoursesStore();
}

export function resetBusinessStore(): void {
  managedUsersStore = initialManagedUsers.map((u) => ({ ...u }));
  activitiesStore = initialActivities.map((a) => ({ ...a }));
  resetCoursesStore();
}

export function resetAppStore(): void {
  resetCoursesStore();
  enrollmentsStore = createInitialEnrollments();
  nextEnrollmentId = 103;
  managedUsersStore = initialManagedUsers.map((u) => ({ ...u }));
  activitiesStore = initialActivities.map((a) => ({ ...a }));
  resetPracticeAuthStore();
  resetNamespace("shared");
}

export function addSubmission(namespaceId: string, input: Omit<IntakeRecord, "id">): IntakeRecord {
  const namespace = getNamespace(namespaceId);
  const record: IntakeRecord = { ...input, id: `sub_${namespace.nextSubmission}` };
  namespace.nextSubmission += 1;
  namespace.submissions.push(record);
  return record;
}

export function getNamespace(id = "shared"): NamespaceData {
  return namespaces.get(id) ?? resetNamespace(id);
}

export function getStoreStatus(): { driver: "memory"; namespaces: number } {
  initStore();
  return { driver: "memory", namespaces: namespaces.size };
}

export function updateScenarioControls(
  id = "shared",
  partial: Partial<ScenarioControls>,
): ScenarioControls {
  const ns = getNamespace(id);
  ns.scenario = { ...ns.scenario, ...partial };
  return ns.scenario;
}

export function getScenarioControls(id = "shared"): ScenarioControls {
  return getNamespace(id).scenario;
}

// Enterprise App: Users & Auth
export function findUserByEmail(email: string): MockUser | undefined {
  return initialUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserByToken(token: string): MockUser | undefined {
  return initialUsers.find((u) => u.token === token);
}

// Enterprise App: Courses CRUD
export function getCourses(): Course[] {
  return coursesStore;
}

export function getCourseById(id: string): Course | undefined {
  return coursesStore.find((c) => c.id === id);
}

export function createCourse(data: Omit<Course, "id">): Course {
  const newCourse: Course = {
    id: `crs_${nextCourseId++}`,
    ...data,
  };
  coursesStore.unshift(newCourse);
  return newCourse;
}

export function updateCourse(id: string, partial: Partial<Omit<Course, "id">>): Course | undefined {
  const idx = coursesStore.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  coursesStore[idx] = { ...coursesStore[idx], ...partial };
  return coursesStore[idx];
}

export function deleteCourse(id: string): boolean {
  const initialLen = coursesStore.length;
  coursesStore = coursesStore.filter((c) => c.id !== id);
  return coursesStore.length < initialLen;
}

// Enterprise App: Enrollments
export function getEnrollments(userEmail?: string, role?: UserRole): Enrollment[] {
  if (role === "admin" || role === "trainer") {
    return enrollmentsStore;
  }
  if (userEmail) {
    return enrollmentsStore.filter((e) => e.userEmail.toLowerCase() === userEmail.toLowerCase());
  }
  return enrollmentsStore;
}

export function createEnrollment(input: Omit<Enrollment, "id" | "status" | "createdAt">): Enrollment {
  const newEnrollment: Enrollment = {
    id: `enr_${nextEnrollmentId++}`,
    ...input,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };
  enrollmentsStore.unshift(newEnrollment);
  return newEnrollment;
}

export function updateEnrollmentStatus(id: string, status: EnrollmentStatus): Enrollment | undefined {
  const enrollment = enrollmentsStore.find((e) => e.id === id);
  if (!enrollment) return undefined;
  enrollment.status = status;
  return enrollment;
}

// Flaky Lab & File Operations
let flakyState: FlakyState = {
  unstableMode: false,
  failureCount: 0,
};

let uploadsStore: FileUploadResult[] = [];
let nextUploadId = 1;

export function getFlakyState(): FlakyState {
  return flakyState;
}

export function updateFlakyState(partial: Partial<FlakyState>): FlakyState {
  flakyState = { ...flakyState, ...partial };
  return flakyState;
}

export function resetFlakyState(): void {
  flakyState = { unstableMode: false, failureCount: 0 };
  uploadsStore = [];
  nextUploadId = 1;
  resetBoundedRetry(2);
}

export function addUpload(filename: string, sizeBytes: number, mimeType: string): FileUploadResult {
  const record: FileUploadResult = {
    id: `upl_${nextUploadId++}`,
    filename,
    sizeBytes,
    mimeType,
    uploadedAt: new Date().toISOString(),
  };
  uploadsStore.unshift(record);
  return record;
}

export function getUploads(): FileUploadResult[] {
  return uploadsStore;
}

// Bounded Retry Simulation
let boundedRetryRemaining = 2; // Fails 2 times before success

export function getBoundedRetryRemaining(): number {
  return boundedRetryRemaining;
}

export function decrementBoundedRetry(): number {
  if (boundedRetryRemaining > 0) {
    boundedRetryRemaining--;
  }
  return boundedRetryRemaining;
}

export function resetBoundedRetry(count = 2): void {
  boundedRetryRemaining = count;
}

// Infinite Stream Telemetry Records
export const initialStreamRecords: StreamRecord[] = Array.from({ length: 25 }, (_, i) => ({
  id: `str_${String(i + 1).padStart(3, "0")}`,
  sequence: i + 1,
  topic: ["telemetry", "security", "pipeline", "auth", "audit"][i % 5],
  payload: `Telemetry ingestion event chunk #${i + 1} synchronized via high-assurance message bus`,
  timestamp: new Date(Date.now() - (25 - i) * 60000).toISOString(),
}));

let streamStore: StreamRecord[] = [...initialStreamRecords];

export function getStreamRecords(cursor?: string, limit = 5): StreamResponse {
  const startIndex = cursor ? streamStore.findIndex((r) => r.id === cursor) + 1 : 0;
  const safeStart = startIndex >= 0 ? startIndex : 0;
  const items = streamStore.slice(safeStart, safeStart + limit);
  const nextItem = streamStore[safeStart + limit];
  return {
    items,
    nextCursor: nextItem ? nextItem.id : null,
    hasMore: Boolean(nextItem),
    total: streamStore.length,
  };
}

export function resetStreamRecords(): void {
  streamStore = [...initialStreamRecords];
}

// Phase 7: Managed Users Store
export const initialManagedUsers: ManagedUser[] = [
  {
    id: "usr_101",
    name: "Ada Lovelace",
    email: "ada.lovelace@pil.local",
    role: "learner",
    status: "Active",
    department: "Algorithms & Automation",
    enrolledCoursesCount: 2,
    createdAt: "2026-10-15T09:00:00Z",
  },
  {
    id: "usr_102",
    name: "Alan Turing",
    email: "alan.turing@pil.local",
    role: "trainer",
    status: "Active",
    department: "Security & Cryptography",
    enrolledCoursesCount: 0,
    createdAt: "2026-10-16T10:30:00Z",
  },
  {
    id: "usr_103",
    name: "Grace Hopper",
    email: "grace.hopper@pil.local",
    role: "admin",
    status: "Active",
    department: "Infrastructure Operations",
    enrolledCoursesCount: 1,
    createdAt: "2026-10-17T11:15:00Z",
  },
  {
    id: "usr_104",
    name: "Katherine Johnson",
    email: "katherine.johnson@pil.local",
    role: "learner",
    status: "Active",
    department: "Orbital Data Science",
    enrolledCoursesCount: 3,
    createdAt: "2026-10-18T14:45:00Z",
  },
  {
    id: "usr_105",
    name: "Margaret Hamilton",
    email: "margaret.hamilton@pil.local",
    role: "trainer",
    status: "Inactive",
    department: "Flight Software Systems",
    enrolledCoursesCount: 0,
    createdAt: "2026-10-19T16:20:00Z",
  },
];

let managedUsersStore: ManagedUser[] = [...initialManagedUsers];
let nextManagedUserId = 106;

export function getManagedUsers(options?: {
  q?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
}): { users: ManagedUser[]; total: number; page: number; totalPages: number } {
  let list = [...managedUsersStore];

  if (options?.q) {
    const q = options.q.toLowerCase().trim();
    list = list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q),
    );
  }

  if (options?.role && options.role !== "all") {
    list = list.filter((u) => u.role.toLowerCase() === options.role?.toLowerCase());
  }

  if (options?.status && options.status !== "all") {
    list = list.filter((u) => u.status.toLowerCase() === options.status?.toLowerCase());
  }

  // Sorting
  const sortKey = (options?.sort as keyof ManagedUser) || "name";
  const asc = options?.order !== "desc";
  list.sort((a, b) => {
    const valA = String(a[sortKey] ?? "").toLowerCase();
    const valB = String(b[sortKey] ?? "").toLowerCase();
    return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const total = list.length;
  const page = Math.max(1, options?.page || 1);
  const limit = Math.max(1, options?.limit || 10);
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const paginated = list.slice(start, start + limit);

  return { users: paginated, total, page, totalPages };
}

export function getManagedUserById(id: string): ManagedUser | undefined {
  return managedUsersStore.find((u) => u.id === id);
}

export function createManagedUser(input: Omit<ManagedUser, "id" | "createdAt" | "enrolledCoursesCount">): ManagedUser {
  const newUser: ManagedUser = {
    id: `usr_${nextManagedUserId++}`,
    ...input,
    enrolledCoursesCount: 0,
    createdAt: new Date().toISOString(),
  };
  managedUsersStore.unshift(newUser);
  logActivity("user_registered", newUser.email, "admin@pil.local");
  return newUser;
}

export function updateManagedUser(id: string, partial: Partial<ManagedUser>): ManagedUser | undefined {
  const idx = managedUsersStore.findIndex((u) => u.id === id);
  if (idx === -1) return undefined;
  managedUsersStore[idx] = { ...managedUsersStore[idx], ...partial };
  return managedUsersStore[idx];
}

export function deleteManagedUser(id: string): boolean {
  const initial = managedUsersStore.length;
  managedUsersStore = managedUsersStore.filter((u) => u.id !== id);
  return managedUsersStore.length < initial;
}

export function bulkUpdateUsers(userIds: string[], action: "activate" | "deactivate"): number {
  const targetStatus: UserStatus = action === "activate" ? "Active" : "Inactive";
  let count = 0;
  for (const user of managedUsersStore) {
    if (userIds.includes(user.id)) {
      user.status = targetStatus;
      count++;
    }
  }
  return count;
}

// Activity Audit Log
export const initialActivities: ActivityItem[] = [
  {
    id: "act_1",
    actorEmail: "admin@pil.local",
    action: "course_created",
    target: "CI/CD & Parallel Sharding Pipelines",
    timestamp: "2026-10-21T10:00:00Z",
  },
  {
    id: "act_2",
    actorEmail: "learner@pil.local",
    action: "enrollment_submitted",
    target: "Playwright Core Automations",
    timestamp: "2026-10-21T11:30:00Z",
  },
  {
    id: "act_3",
    actorEmail: "admin@pil.local",
    action: "enrollment_status_changed",
    target: "enr_101 (Approved)",
    timestamp: "2026-10-21T12:00:00Z",
  },
];

let activitiesStore: ActivityItem[] = [...initialActivities];
let nextActivityId = 4;

export function getActivities(limit = 10): ActivityItem[] {
  return activitiesStore.slice(0, limit);
}

export function logActivity(action: ActivityAction, target: string, actorEmail = "system@pil.local"): ActivityItem {
  const item: ActivityItem = {
    id: `act_${nextActivityId++}`,
    actorEmail,
    action,
    target,
    timestamp: new Date().toISOString(),
  };
  activitiesStore.unshift(item);
  return item;
}

// Notification Preferences
let userPreferences: NotificationPrefs = {
  emailUpdates: true,
  smsAlerts: false,
  weeklySummary: true,
};

export function getUserPreferences(): NotificationPrefs {
  return userPreferences;
}

export function updateUserPreferences(partial: Partial<NotificationPrefs>): NotificationPrefs {
  userPreferences = { ...userPreferences, ...partial };
  return userPreferences;
}

// Course Detail helper with syllabus
export function getCourseDetail(id: string): CourseDetail | undefined {
  const course = getCourseById(id);
  if (!course) return undefined;

  const syllabus: CourseModule[] = [
    {
      id: "mod_1",
      title: "Module 1: Architecture, Locators, and Strict Mode",
      durationMinutes: 45,
      description: "Deep dive into web-first assertions, role resolution, and accessibility locators.",
    },
    {
      id: "mod_2",
      title: "Module 2: Network Interception & Route Mocking",
      durationMinutes: 60,
      description: "Master page.route, abort conditions, and latency simulation techniques.",
    },
    {
      id: "mod_3",
      title: "Module 3: Visual Regression & Snapshot Resilience",
      durationMinutes: 45,
      description: "Pixel-diff assertions with toHaveScreenshot, dynamic masking, and animation freezing.",
    },
    {
      id: "mod_4",
      title: "Module 4: Enterprise CI/CD & Sharded Execution",
      durationMinutes: 60,
      description: "GitHub Actions sharded runs, HTML trace uploads, and zero-flake pipelines.",
    },
  ];

  return {
    ...course,
    description: `Comprehensive industrial training module focusing on ${course.title} in production enterprise test pipelines.`,
    instructorName: "Dr. Evelyn Vance, Principal Test Architect",
    prerequisites: ["TypeScript 5.x", "Basic DOM & CSS understanding", "Node.js v20+"],
    syllabus,
    remainingSeats: Math.max(2, course.seats - 4),
  };
}

// ==========================================
// Phase 14: Dedicated Practice Login Module
// ==========================================
export interface PracticeUser {
  id: string;
  username: string;
  email: string;
  password: string;
  displayName: string;
  role: "student" | "practitioner" | "locked";
  isLocked?: boolean;
  simulatedResetToken?: string;
}

export const initialPracticeUsers: PracticeUser[] = [
  {
    id: "prac_01",
    username: "student",
    email: "student@practice.local",
    password: "Password123!",
    displayName: "Alex Student",
    role: "student",
  },
  {
    id: "prac_02",
    username: "practitioner",
    email: "practitioner@practice.local",
    password: "SecurePractice2026!",
    displayName: "Morgan Practitioner",
    role: "practitioner",
  },
  {
    id: "prac_03",
    username: "locked_user",
    email: "locked@practice.local",
    password: "Locked123!",
    displayName: "Jordan Locked",
    role: "locked",
    isLocked: true,
  },
];

let practiceUsersStore: PracticeUser[] = initialPracticeUsers.map((u) => ({ ...u }));
const practiceSessions = new Map<string, { userId: string; username: string; expiresAt: number }>();
let sessionTokenCounter = 1000;

export function findPracticeUserByUsername(username: string): PracticeUser | undefined {
  return practiceUsersStore.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
}

export function findPracticeUserByEmail(email: string): PracticeUser | undefined {
  return practiceUsersStore.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function findPracticeUserByResetToken(token: string): PracticeUser | undefined {
  return practiceUsersStore.find((u) => u.simulatedResetToken === token.trim());
}

export function createPracticeSession(user: PracticeUser): { token: string; expiresAt: number } {
  sessionTokenCounter += 1;
  const token = `tok_practice_${user.username}_${sessionTokenCounter}_${Date.now()}`;
  const expiresAt = Date.now() + 3600 * 1000; // 1 hour
  practiceSessions.set(token, { userId: user.id, username: user.username, expiresAt });
  return { token, expiresAt };
}

export function verifyPracticeSession(token: string): PracticeUser | undefined {
  const session = practiceSessions.get(token);
  if (!session) return undefined;
  if (Date.now() > session.expiresAt) {
    practiceSessions.delete(token);
    return undefined;
  }
  return practiceUsersStore.find((u) => u.id === session.userId);
}

export function invalidatePracticeSession(token: string): boolean {
  return practiceSessions.delete(token);
}

export function setPracticeUserPassword(userId: string, newPass: string): boolean {
  const user = practiceUsersStore.find((u) => u.id === userId);
  if (!user) return false;
  user.password = newPass;
  user.simulatedResetToken = undefined;
  return true;
}

export function setPracticeUserResetToken(usernameOrEmail: string, token: string): PracticeUser | undefined {
  const user =
    findPracticeUserByUsername(usernameOrEmail) ||
    findPracticeUserByEmail(usernameOrEmail);
  if (!user) return undefined;
  user.simulatedResetToken = token;
  return user;
}

export function resetPracticeAuthStore(): void {
  practiceUsersStore = initialPracticeUsers.map((u) => ({ ...u }));
  practiceSessions.clear();
  sessionTokenCounter = 1000;
}


