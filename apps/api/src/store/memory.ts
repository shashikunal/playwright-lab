import type { Course, Enrollment, EnrollmentStatus, FileUploadResult, FlakyState, UserRole } from "@pil/shared";

export type ScenarioControls = {
  latencyMs: number;
  empty: boolean;
  statusOverride: number | null;
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

export const initialEnrollments: Enrollment[] = [
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

let coursesStore = [...initialCourses];
let enrollmentsStore = [...initialEnrollments];
let nextEnrollmentId = 103;

const namespaces = new Map<string, NamespaceData>();

export function defaultScenario(): ScenarioControls {
  return { latencyMs: 0, empty: false, statusOverride: null };
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

export function resetAppStore(): void {
  coursesStore = [...initialCourses];
  enrollmentsStore = [...initialEnrollments];
  nextEnrollmentId = 103;
  resetNamespace("shared");
  resetFlakyState();
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
    id: `crs_${String(coursesStore.length + 1).padStart(2, "0")}`,
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


