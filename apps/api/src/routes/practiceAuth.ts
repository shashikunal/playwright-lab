import { apiError } from "@pil/shared";
import { Router } from "express";
import {
  createPracticeSession,
  findPracticeUserByEmail,
  findPracticeUserByResetToken,
  findPracticeUserByUsername,
  invalidatePracticeSession,
  resetPracticeAuthStore,
  setPracticeUserPassword,
  setPracticeUserResetToken,
  verifyPracticeSession,
} from "../store/memory.js";

export const practiceAuthRouter = Router();

function getReqNs(req: { headers: Record<string, string | string[] | undefined> }): string {
  const hdr = req.headers["x-worker-namespace"];
  if (typeof hdr === "string" && hdr.trim()) {
    return hdr.trim();
  }
  return "shared";
}

// 1. Practice Login
practiceAuthRouter.post("/login", (req, res) => {
  const ns = getReqNs(req);
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    res.status(400).json(apiError("missing_fields", "Username and password are required"));
    return;
  }

  const user = findPracticeUserByUsername(ns, String(username));

  if (!user || user.password !== String(password)) {
    res.status(401).json(apiError("invalid_credentials", "Invalid username or password"));
    return;
  }

  if (user.isLocked) {
    res.status(423).json(apiError("account_locked", "Account is locked. Please contact system administrator."));
    return;
  }

  const { token, expiresAt } = createPracticeSession(ns, user);

  res.json({
    status: "success",
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    },
    expiresIn: Math.round((expiresAt - Date.now()) / 1000),
  });
});

// 2. Practice Current Session / Me
practiceAuthRouter.get("/me", (req, res) => {
  const ns = getReqNs(req);
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json(apiError("unauthorized", "Missing or invalid practice authorization token"));
    return;
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const user = verifyPracticeSession(ns, token);

  if (!user) {
    res.status(401).json(apiError("invalid_session", "Practice session is invalid or has expired"));
    return;
  }

  res.json({
    status: "success",
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    },
  });
});

// 3. Practice Logout
practiceAuthRouter.post("/logout", (req, res) => {
  const ns = getReqNs(req);
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    invalidatePracticeSession(ns, token);
  }

  res.json({
    status: "logged_out",
    message: "Session invalidated successfully",
  });
});

// 4. Practice Forgot Password Simulation
practiceAuthRouter.post("/forgot-password", (req, res) => {
  const ns = getReqNs(req);
  const { usernameOrEmail } = req.body ?? {};

  if (!usernameOrEmail || !String(usernameOrEmail).trim()) {
    res.status(400).json(apiError("missing_field", "Username or email is required"));
    return;
  }

  const target = String(usernameOrEmail).trim();
  const user = findPracticeUserByUsername(ns, target) || findPracticeUserByEmail(ns, target);

  if (!user) {
    res.status(404).json(
      apiError("user_not_found", "No registered practice user found with that username or email."),
    );
    return;
  }

  const simulatedResetToken = `rst_sim_${Date.now().toString(36)}`;
  setPracticeUserResetToken(ns, target, simulatedResetToken);

  const emailMasked = user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3");

  res.json({
    status: "simulated_success",
    found: true,
    emailMasked,
    simulatedResetToken,
    message: "Simulated password reset email sent. In this training lab, no real email is transmitted.",
  });
});

// 5. Practice Reset Password
practiceAuthRouter.post("/reset-password", (req, res) => {
  const ns = getReqNs(req);
  const { token, newPassword } = req.body ?? {};

  if (!token || !newPassword) {
    res.status(400).json(apiError("missing_fields", "Reset token and new password are required"));
    return;
  }

  if (String(newPassword).length < 8) {
    res.status(400).json(apiError("weak_password", "Password must be at least 8 characters long"));
    return;
  }

  const user = findPracticeUserByResetToken(ns, String(token));
  if (!user) {
    res.status(400).json(apiError("invalid_token", "Invalid or expired reset token"));
    return;
  }

  setPracticeUserPassword(ns, user.id, String(newPassword));

  res.json({
    status: "success",
    message: "Password updated successfully. You can now sign in with your new credentials.",
  });
});

// 6. Test Data Safe Reset
practiceAuthRouter.post("/reset", (req, res) => {
  resetPracticeAuthStore(getReqNs(req));
  res.json({
    status: "ok",
    message: "Practice auth store reset to defaults",
  });
});
