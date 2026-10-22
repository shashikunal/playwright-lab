import type { MockUser } from "./store/memory.js";

declare global {
  namespace Express {
    interface Request {
      user?: MockUser;
    }
  }
}
