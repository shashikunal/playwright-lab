import { apiError, type FieldError, type IntakeRequest, type IntakeTrack } from "@pil/shared";

const intakeTracks: readonly IntakeTrack[] = ["locators", "api", "fixtures"];
import { Router } from "express";
import { addSubmission } from "../store/memory.js";

export const formsRouter = Router();

formsRouter.post("/intake", (req, res) => {
  const parsed = validateIntake(req.body);
  if (!parsed.ok) {
    res.status(422).json(apiError("validation_error", "Intake could not be accepted", parsed.details));
    return;
  }
  const saved = addSubmission("shared", {
    fullName: parsed.value.fullName,
    email: parsed.value.email,
    seats: parsed.value.seats,
    startDate: parsed.value.startDate,
    track: parsed.value.track,
  });
  res.json({ id: saved.id, status: "accepted" });
});

function validateIntake(body: unknown): { ok: true; value: IntakeRequest } | { ok: false; details: FieldError[] } {
  if (!isRecord(body)) {
    return { ok: false, details: [{ field: "body", message: "Expected a JSON object" }] };
  }

  const details: FieldError[] = [];
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  if (fullName.length < 2 || fullName.length > 80 || /[<>]/.test(fullName)) {
    details.push({ field: "fullName", message: "Enter 2 to 80 characters without HTML" });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    details.push({ field: "email", message: "Enter a valid email address" });
  }

  const seats = body.seats;
  if (typeof seats !== "number" || !Number.isInteger(seats) || seats < 1 || seats > 12) {
    details.push({ field: "seats", message: "Seats must be an integer from 1 to 12" });
  }

  const startDate = typeof body.startDate === "string" ? body.startDate : "";
  if (!isIsoDate(startDate)) {
    details.push({ field: "startDate", message: "Enter a real date as YYYY-MM-DD" });
  }

  const track = body.track;
  if (!isTrack(track)) {
    details.push({ field: "track", message: "Choose a track" });
  }

  if (body.agree !== true) {
    details.push({ field: "agree", message: "Agree to the lab terms" });
  }

  if (details.length > 0 || !isTrack(track)) return { ok: false, details };
  return {
    ok: true,
    value: { fullName, email, seats: seats as number, startDate, track, agree: true },
  };
}

function isTrack(value: unknown): value is IntakeTrack {
  return typeof value === "string" && intakeTracks.includes(value as IntakeTrack);
}

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
