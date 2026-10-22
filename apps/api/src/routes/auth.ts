import { apiError, type UserProfile } from "@pil/shared";
import { Router } from "express";
import { findUserByEmail, findUserByToken } from "../store/memory.js";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json(apiError("missing_credentials", "Email and password are required"));
    return;
  }

  const user = findUserByEmail(String(email));
  if (!user || user.password !== String(password)) {
    res.status(401).json(apiError("invalid_credentials", "Invalid email or password"));
    return;
  }

  const profile: UserProfile = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    token: user.token,
  };

  res.json({ profile });
});

authRouter.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json(apiError("unauthorized", "Missing or invalid authorization token"));
    return;
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const user = findUserByToken(token);
  if (!user) {
    res.status(401).json(apiError("invalid_token", "Session token is invalid or expired"));
    return;
  }

  const profile: UserProfile = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    token: user.token,
  };

  res.json({ profile });
});

authRouter.post("/logout", (_req, res) => {
  res.json({ status: "ok" });
});
