import { Router, Request, Response, NextFunction } from "express";
import { apiError } from "@pil/shared";
import {
  findUserByToken,
  getActivities,
  getUserPreferences,
  resetAppStore,
  updateUserPreferences,
} from "../store/memory.js";

export const activityRouter = Router();

function authenticate(req: Request, res: Response, next: NextFunction) {
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

// GET /api/app/activity - Recent activity items
activityRouter.get("/activity", authenticate, (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const items = getActivities(limit);
  res.json({ activities: items, total: items.length });
});

// GET /api/app/profile - User profile & notification preferences
activityRouter.get("/profile", authenticate, (req, res) => {
  if (!req.user) {
    res.status(401).json(apiError("unauthorized", "Not authenticated"));
    return;
  }
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      token: req.user.token,
    },
    preferences: getUserPreferences(),
  });
});

// PATCH /api/app/profile - Update notification preferences
activityRouter.patch("/profile", authenticate, (req, res) => {
  const { preferences } = req.body;
  if (preferences && typeof preferences === "object") {
    const updated = updateUserPreferences(preferences);
    res.json({ preferences: updated });
    return;
  }
  res.json({ preferences: getUserPreferences() });
});

// POST /api/app/business/reset - Deterministic state reset
activityRouter.post("/business/reset", (_req, res) => {
  resetAppStore();
  res.json({ status: "reset", message: "Business application data reset to initial seed" });
});
