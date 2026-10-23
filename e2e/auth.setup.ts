import { test as setup } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const authDir = path.resolve(process.cwd(), ".auth");

setup("prepare auth storage states", async ({ page, context }) => {
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // 1. Admin Storage State
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("pil-auth-token", "tok_admin_session");
    localStorage.setItem(
      "pil-auth-profile",
      JSON.stringify({
        id: "usr_admin",
        email: "admin@pil.local",
        name: "Sam Admin",
        role: "admin",
        token: "tok_admin_session",
      }),
    );
  });
  await context.storageState({ path: path.join(authDir, "admin.json") });

  // 2. Trainer Storage State
  await page.evaluate(() => {
    localStorage.setItem("pil-auth-token", "tok_trainer_session");
    localStorage.setItem(
      "pil-auth-profile",
      JSON.stringify({
        id: "usr_trainer",
        email: "trainer@pil.local",
        name: "Morgan Trainer",
        role: "trainer",
        token: "tok_trainer_session",
      }),
    );
  });
  await context.storageState({ path: path.join(authDir, "trainer.json") });

  // 3. Learner Storage State
  await page.evaluate(() => {
    localStorage.setItem("pil-auth-token", "tok_learner_session");
    localStorage.setItem(
      "pil-auth-profile",
      JSON.stringify({
        id: "usr_learner",
        email: "learner@pil.local",
        name: "Alex Learner",
        role: "learner",
        token: "tok_learner_session",
      }),
    );
  });
  await context.storageState({ path: path.join(authDir, "learner.json") });
});
