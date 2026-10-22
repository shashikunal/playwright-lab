import { apiError, type CourseListResponse } from "@pil/shared";
import { Router } from "express";
import { createCourse, deleteCourse, findUserByToken, getCourseById, getCourseDetail, getCourses, updateCourse } from "../store/memory.js";

export const coursesRouter = Router();

function authenticate(req: import("express").Request) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.replace("Bearer ", "").trim();
  return findUserByToken(token);
}

coursesRouter.get("/", (req, res) => {
  const q = String(req.query.q ?? "").trim().toLowerCase();
  const category = String(req.query.category ?? "").trim().toLowerCase();
  const difficulty = String(req.query.difficulty ?? "").trim().toLowerCase();

  let list = getCourses();
  if (q) {
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q),
    );
  }
  if (category) {
    list = list.filter((c) => c.category.toLowerCase() === category);
  }
  if (difficulty) {
    list = list.filter((c) => c.difficulty.toLowerCase() === difficulty);
  }

  const response: CourseListResponse = {
    courses: list,
    total: list.length,
  };
  res.json(response);
});

coursesRouter.get("/:id", (req, res) => {
  const course = getCourseDetail(req.params.id) ?? getCourseById(req.params.id);
  if (!course) {
    res.status(404).json(apiError("not_found", "Course not found"));
    return;
  }
  res.json({ course });
});

coursesRouter.post("/", (req, res) => {
  const user = authenticate(req);
  if (!user || (user.role !== "trainer" && user.role !== "admin")) {
    res.status(403).json(apiError("forbidden", "Only trainers and admins can create courses"));
    return;
  }

  const { title, code, category, difficulty, seats, price } = req.body ?? {};
  if (!title || !code) {
    res.status(400).json(apiError("invalid_payload", "Title and course code are required"));
    return;
  }

  const course = createCourse({
    title: String(title),
    code: String(code),
    category: typeof category === "string" ? category : "General",
    difficulty: difficulty === "beginner" || difficulty === "advanced" ? difficulty : "intermediate",
    seats: typeof seats === "number" ? seats : 20,
    price: typeof price === "number" ? price : 299,
  });

  res.status(201).json({ course });
});

coursesRouter.put("/:id", (req, res) => {
  const user = authenticate(req);
  if (!user || (user.role !== "trainer" && user.role !== "admin")) {
    res.status(403).json(apiError("forbidden", "Only trainers and admins can edit courses"));
    return;
  }

  const updated = updateCourse(req.params.id, req.body ?? {});
  if (!updated) {
    res.status(404).json(apiError("not_found", "Course not found"));
    return;
  }
  res.json({ course: updated });
});

coursesRouter.delete("/:id", (req, res) => {
  const user = authenticate(req);
  if (!user || user.role !== "admin") {
    res.status(403).json(apiError("forbidden", "Only administrators can delete courses"));
    return;
  }

  const success = deleteCourse(req.params.id);
  if (!success) {
    res.status(404).json(apiError("not_found", "Course not found"));
    return;
  }
  res.json({ status: "deleted" });
});
