import { Router, Request, Response, NextFunction } from "express";
import { apiError, UserRole } from "@pil/shared";
import {
  bulkUpdateUsers,
  createManagedUser,
  deleteManagedUser,
  findUserByToken,
  getManagedUserById,
  getManagedUsers,
  MockUser,
  updateManagedUser,
} from "../store/memory.js";

export const usersRouter = Router();

export interface AuthenticatedRequest extends Request {
  user?: MockUser;
}

function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json(apiError("unauthorized", "Missing or invalid authorization token"));
    return;
  }
  const token = authHeader.slice(7);
  const user = findUserByToken(token);
  if (!user) {
    res.status(401).json(apiError("unauthorized", "Session expired or invalid"));
    return;
  }
  req.user = user;
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    res.status(403).json(apiError("forbidden", "Administrator privileges required"));
    return;
  }
  next();
}

function requireTrainerOrAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin" && req.user?.role !== "trainer") {
    res.status(403).json(apiError("forbidden", "Trainer or Administrator privileges required"));
    return;
  }
  next();
}

// GET /api/app/users - List with search, filter, pagination, sorting
usersRouter.get("/", authenticate, requireTrainerOrAdmin, (req, res) => {
  const { q, role, status, page, limit, sort, order } = req.query;
  const result = getManagedUsers({
    q: typeof q === "string" ? q : undefined,
    role: typeof role === "string" ? role : undefined,
    status: typeof status === "string" ? status : undefined,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 5,
    sort: typeof sort === "string" ? sort : "name",
    order: typeof order === "string" ? order : "asc",
  });
  res.json(result);
});

// POST /api/app/users - Create User (Admin only)
usersRouter.post("/", authenticate, requireAdmin, (req, res) => {
  const { name, email, role, department } = req.body;
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    res.status(422).json(apiError("validation_error", "Name must be at least 2 characters"));
    return;
  }
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(422).json(apiError("validation_error", "A valid email address is required"));
    return;
  }
  const allowedRoles: UserRole[] = ["learner", "trainer", "admin"];
  if (!role || !allowedRoles.includes(role)) {
    res.status(422).json(apiError("validation_error", "Role must be learner, trainer, or admin"));
    return;
  }

  const newUser = createManagedUser({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role,
    department: typeof department === "string" && department.trim() ? department.trim() : "General",
    status: "Active",
  });

  res.status(201).json({ user: newUser });
});

// POST /api/app/users/bulk - Bulk status transition (Admin only)
usersRouter.post("/bulk", authenticate, requireAdmin, (req, res) => {
  const { userIds, action } = req.body;
  if (!Array.isArray(userIds) || userIds.length === 0) {
    res.status(422).json(apiError("validation_error", "userIds array cannot be empty"));
    return;
  }
  if (action !== "activate" && action !== "deactivate") {
    res.status(422).json(apiError("validation_error", "action must be activate or deactivate"));
    return;
  }

  const updatedCount = bulkUpdateUsers(userIds, action);
  res.json({ updatedCount, status: "ok" });
});

// GET /api/app/users/:id - Individual user detail
usersRouter.get("/:id", authenticate, requireTrainerOrAdmin, (req, res) => {
  const user = getManagedUserById(req.params.id);
  if (!user) {
    res.status(404).json(apiError("not_found", "User not found"));
    return;
  }
  res.json({ user });
});

// PATCH /api/app/users/:id - Update user (Admin only)
usersRouter.patch("/:id", authenticate, requireAdmin, (req, res) => {
  const { name, role, status, department } = req.body;
  const updated = updateManagedUser(req.params.id, {
    ...(name && { name: String(name).trim() }),
    ...(role && { role }),
    ...(status && { status }),
    ...(department && { department: String(department).trim() }),
  });

  if (!updated) {
    res.status(404).json(apiError("not_found", "User not found"));
    return;
  }
  res.json({ user: updated });
});

// DELETE /api/app/users/:id - Delete user (Admin only)
usersRouter.delete("/:id", authenticate, requireAdmin, (req, res) => {
  const success = deleteManagedUser(req.params.id);
  if (!success) {
    res.status(404).json(apiError("not_found", "User not found"));
    return;
  }
  res.json({ status: "deleted", id: req.params.id });
});
