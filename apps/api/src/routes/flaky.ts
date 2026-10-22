import { apiError } from "@pil/shared";
import { Router } from "express";
import { addUpload, getFlakyState, getUploads, resetFlakyState, updateFlakyState } from "../store/memory.js";

export const flakyRouter = Router();

// 1. File Upload endpoint
flakyRouter.post("/upload", (req, res) => {
  const { filename, sizeBytes, mimeType } = req.body ?? {};

  if (!filename || typeof filename !== "string") {
    res.status(400).json(apiError("invalid_payload", "filename is required"));
    return;
  }

  const allowedExtensions = [".csv", ".json", ".txt"];
  const hasValidExt = allowedExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
  if (!hasValidExt) {
    res.status(422).json(apiError("invalid_file_type", `Only ${allowedExtensions.join(", ")} files are supported`));
    return;
  }

  const parsedSize = typeof sizeBytes === "number" ? sizeBytes : 1024;
  const maxBytes = 2 * 1024 * 1024; // 2MB limit
  if (parsedSize > maxBytes) {
    res.status(413).json(apiError("file_too_large", "File size exceeds the 2MB limit"));
    return;
  }

  const result = addUpload(filename, parsedSize, typeof mimeType === "string" ? mimeType : "application/octet-stream");
  res.status(201).json({ result });
});

// 2. CSV File Download endpoint
flakyRouter.get("/export-csv", (_req, res) => {
  const csvContent = [
    "id,scenario,category,status,executionTimeMs",
    "tst_101,Locator Gym,Locators,Passed,142",
    "tst_102,Intake Form,Forms,Passed,218",
    "tst_103,Widgets Lab,Widgets,Passed,310",
    "tst_104,Scenario Controls,Network,Passed,185",
    "tst_105,Course Catalogue,Enterprise,Passed,260",
    "tst_106,Multi-Step Enrollment,Enterprise,Passed,412",
  ].join("\r\n");

  res.setHeader("Content-Disposition", 'attachment; filename="industrial-test-report.csv"');
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.status(200).send(csvContent);
});

// 3. Unstable Item endpoint (for testing retries and intermittency)
flakyRouter.get("/unstable-item", (_req, res) => {
  const state = getFlakyState();
  if (state.unstableMode) {
    const nextCount = state.failureCount + 1;
    updateFlakyState({ failureCount: nextCount });

    // Fail on odd attempts
    if (nextCount % 2 === 1) {
      res.status(503).json(apiError("service_unavailable", "Simulated intermittent failure: upstream microservice timeout"));
      return;
    }
  }

  res.json({
    status: "ok",
    data: "Stable payload delivered successfully",
    attempts: state.failureCount,
    timestamp: new Date().toISOString(),
  });
});

// 4. Toggle unstable mode
flakyRouter.post("/unstable-toggle", (req, res) => {
  const current = getFlakyState();
  const nextMode = typeof req.body?.unstableMode === "boolean" ? req.body.unstableMode : !current.unstableMode;
  const updated = updateFlakyState({ unstableMode: nextMode });
  res.json({ state: updated });
});

// 5. State inspection
flakyRouter.get("/state", (_req, res) => {
  res.json({
    state: getFlakyState(),
    uploads: getUploads(),
  });
});

// 6. Reset endpoint
flakyRouter.post("/reset", (_req, res) => {
  resetFlakyState();
  res.json({ status: "ok", message: "Flaky lab state reset to baseline" });
});
