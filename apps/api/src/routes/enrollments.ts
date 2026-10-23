import { apiError, type EnrollmentListResponse, type EnrollmentStatus } from "@pil/shared";
import { Router } from "express";
import { createEnrollment, findUserByToken, getCourseById, getEnrollments, logActivity, resetAppStore, updateEnrollmentStatus } from "../store/memory.js";

export const enrollmentsRouter = Router();

function authenticate(req: import("express").Request) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.replace("Bearer ", "").trim();
  return findUserByToken(token);
}

enrollmentsRouter.get("/", (req, res) => {
  const user = authenticate(req);
  const email = user ? user.email : typeof req.query.email === "string" ? req.query.email : undefined;
  const role = user ? user.role : undefined;

  const list = getEnrollments(email, role);
  const response: EnrollmentListResponse = {
    enrollments: list,
    total: list.length,
  };
  res.json(response);
});

enrollmentsRouter.post("/", (req, res) => {
  const user = authenticate(req);
  const { courseId, seats, userEmail } = req.body ?? {};

  if (!courseId) {
    res.status(400).json(apiError("invalid_payload", "Course ID is required"));
    return;
  }

  const course = getCourseById(String(courseId));
  if (!course) {
    res.status(404).json(apiError("not_found", "Selected course not found"));
    return;
  }

  const seatCount = typeof seats === "number" && seats > 0 ? seats : 1;
  const email = user ? user.email : typeof userEmail === "string" ? userEmail : "guest@pil.local";

  const enrollment = createEnrollment({
    courseId: course.id,
    courseTitle: course.title,
    userEmail: email,
    seats: seatCount,
    totalAmount: course.price * seatCount,
  });

  logActivity("enrollment_submitted", `${enrollment.id} (${course.title})`, email);

  res.status(201).json({ enrollment });
});

enrollmentsRouter.patch("/:id/status", (req, res) => {
  const user = authenticate(req);
  if (!user || (user.role !== "trainer" && user.role !== "admin")) {
    res.status(403).json(apiError("forbidden", "Only trainers and admins can update enrollment status"));
    return;
  }

  const status = req.body?.status as EnrollmentStatus;
  if (!status || !["Pending", "Approved", "Rejected", "Cancelled"].includes(status)) {
    res.status(400).json(apiError("invalid_status", "Invalid status value"));
    return;
  }

  const updated = updateEnrollmentStatus(req.params.id, status);
  if (!updated) {
    res.status(404).json(apiError("not_found", "Enrollment record not found"));
    return;
  }

  logActivity("enrollment_status_changed", `${updated.id} (${status})`, user.email);

  res.json({ enrollment: updated });
});

// Deterministic test data reset endpoint
enrollmentsRouter.post("/reset", (_req, res) => {
  resetAppStore();
  res.json({ status: "ok", message: "Application data reset to seed state" });
});
