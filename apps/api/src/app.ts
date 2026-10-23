import cors from "cors";
import express from "express";
import { apiError } from "@pil/shared";
import type { ApiEnv } from "./env.js";
import { activityRouter } from "./routes/activity.js";
import { authRouter } from "./routes/auth.js";
import { browserRouter } from "./routes/browser.js";
import { coursesRouter } from "./routes/courses.js";
import { docsRouter } from "./routes/docs.js";
import { chaosRouter } from "./routes/chaos.js";
import { enrollmentsRouter } from "./routes/enrollments.js";
import { flakyRouter } from "./routes/flaky.js";
import { formsRouter } from "./routes/forms.js";
import { healthRouter } from "./routes/health.js";
import { networkRouter } from "./routes/network.js";
import { perfRouter } from "./routes/perf.js";
import { practiceAuthRouter } from "./routes/practiceAuth.js";
import { scenariosRouter } from "./routes/scenarios.js";
import { usersRouter } from "./routes/users.js";
import { initStore } from "./store/memory.js";

export function createApp(env: ApiEnv) {
  initStore();
  const app = express();
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
  });
  app.use(
    cors({
      origin: [env.webOrigin, "http://localhost:5173", "http://127.0.0.1:5173"],
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use("/api/docs", docsRouter);
  app.use("/api", healthRouter);
  app.use("/api", scenariosRouter);
  app.use("/api/lab/forms", formsRouter);
  app.use("/api/lab/network", networkRouter);
  app.use("/api/lab/browser", browserRouter);
  app.use("/api/lab/flaky", flakyRouter);
  app.use("/api/lab/perf", perfRouter);
  app.use("/api/lab/chaos", chaosRouter);
  app.use("/api/practice/auth", practiceAuthRouter);
  app.use("/api/app/auth", authRouter);
  app.use("/api/app/courses", coursesRouter);
  app.use("/api/app/enrollments", enrollmentsRouter);
  app.use("/api/app/users", usersRouter);
  app.use("/api/app", activityRouter);
  app.use((_req, res) => {
    res.status(404).json(apiError("not_found", "Route not found"));
  });
  return app;
}
