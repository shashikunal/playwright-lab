import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

export type ApiEnv = {
  port: number;
  webOrigin: string;
  nodeEnv: string;
};

export function readEnv(): ApiEnv {
  const port = Number(process.env.PORT ?? 3001);
  return {
    port: Number.isFinite(port) ? port : 3001,
    webOrigin: process.env.WEB_ORIGIN ?? "http://127.0.0.1:5173",
    nodeEnv: process.env.NODE_ENV ?? "development",
  };
}
