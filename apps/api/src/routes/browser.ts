import { Router } from "express";

export const browserRouter = Router();

// 302 Redirect demonstration
browserRouter.get("/redirect", (_req, res) => {
  res.redirect(302, "/api/lab/browser/redirect-target");
});

browserRouter.get("/redirect-target", (_req, res) => {
  res.json({
    status: "ok",
    message: "Redirect chain completed successfully",
    finalUrl: "/api/lab/browser/redirect-target",
  });
});

// Cookie demonstration
browserRouter.get("/set-cookie", (_req, res) => {
  res.cookie("pil_server_cookie", "token_xyz_987", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  res.json({
    status: "ok",
    cookieName: "pil_server_cookie",
    message: "Cookie set via Set-Cookie header",
  });
});

// File download demonstration
browserRouter.get("/download-sample", (_req, res) => {
  const telemetry = {
    generator: "Playwright Industrial Lab",
    timestamp: new Date().toISOString(),
    metrics: {
      domInteractiveMs: 142,
      loadEventMs: 310,
      renderScore: 98,
    },
  };

  res.setHeader("Content-Disposition", 'attachment; filename="browser-telemetry.json"');
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(telemetry, null, 2));
});
