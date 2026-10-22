import { Router } from "express";
import type { HealthResponse } from "@pil/shared";
import { getStoreStatus } from "../store/memory.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  const store = getStoreStatus();
  const body: HealthResponse = {
    status: "ok",
    service: "playwright-industrial-lab",
    store: store.driver,
  };
  res.json(body);
});
