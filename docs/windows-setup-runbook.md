# Windows Local Setup & Operations Runbook

This guide provides end-to-end instructions for running and testing the **Playwright Industrial Lab** on a local Windows 10/11 laptop without Docker, third-party cloud services, or container orchestration.

---

## 1. System Requirements

- **Operating System**: Windows 10 / Windows 11 (64-bit).
- **Node.js**: `v20.x` or later (LTS recommended). Check with `node -v`.
- **Package Manager**: `pnpm` v10+ (or v9+).
- **Shell**: PowerShell 5.1+ or PowerShell 7 (Core).
- **Hardware**: Minimum 8GB RAM (16GB recommended for parallel browser workers).
- **Containerization**: **None**. Docker is completely optional and not required.

---

## 2. Port Allocation & Network

The application binds to standard loopback IP `127.0.0.1`:
- **Frontend SPA**: `http://127.0.0.1:5173` (Vite dev server)
- **Backend API**: `http://127.0.0.1:3001` (Express REST server)

Ensure ports `5173` and `3001` are not in use by other local development tools.

### Freeing Occupied Ports in PowerShell
If a previous Node process is holding port 3001 or 5173:
```powershell
# Find process using port 3001
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force

# Find process using port 5173
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force
```

---

## 3. Installation & Preparation

### Step 1: Install Node Dependencies
From the repository root:
```powershell
pnpm install
```

### Step 2: Install Playwright Browsers
Install the browser binaries (Chromium, Firefox, WebKit):
```powershell
npx playwright install
```
*(Optional: If system libraries are needed on fresh Windows setups, run `npx playwright install --with-deps`)*

### Step 3: Compile Shared Contracts
```powershell
pnpm --filter @pil/shared build
```

---

## 4. Running the Industrial Lab

### Option A: Standard pnpm Command (Recommended)
```powershell
pnpm run start:lab
# Or equivalently:
pnpm run dev
```

### Option B: PowerShell Automated Launcher
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-lab.ps1
```

Once running, verify availability:
- **Web Interface**: Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.
- **API Health**: Open [http://127.0.0.1:3001/api/health](http://127.0.0.1:3001/api/health) (returns `{"status":"ok"}`).

---

## 5. Running the Playwright Test Suite

The Playwright configuration automatically starts background servers during test runs if they are not already active.

### Fast Smoke Suite (Cross-Browser Matrix)
Runs the critical happy-path tests across Chromium, Firefox, WebKit, and Mobile Chrome:
```powershell
pnpm run test:e2e:smoke
```

### Project-Specific Test Runs
```powershell
# Desktop Chromium (136 tests)
pnpm run test:e2e:chrome

# Desktop Firefox
pnpm run test:e2e:firefox

# Desktop WebKit (Safari engine)
pnpm run test:e2e:webkit

# Mobile Device Viewport (Google Pixel 7 emulation)
pnpm run test:e2e:mobile
```

### Interactive UI Mode (Visual Debugging)
Launches the Playwright interactive GUI to step through locators, time-travel, and inspect DOM snapshots:
```powershell
pnpm run test:e2e:ui
```

### Targeted Spec Execution
```powershell
# Run only Locator Gym tests
npx playwright test e2e/locators.spec.ts

# Run only Enterprise Workflows
npx playwright test e2e/workflows.spec.ts

# Run with single-threaded debugging
npx playwright test e2e/forms.spec.ts --headed --workers=1
```

---

## 6. Inspecting Artifacts & Reports

### HTML Test Report
```powershell
npx playwright show-report
```

### Trace Viewer
If a test fails, Playwright automatically generates a detailed `.zip` trace in `test-results/`:
```powershell
npx playwright show-trace test-results/<test-folder>/trace.zip
```
The trace captures:
- Exact DOM snapshots before and after every action.
- Network console requests, response payloads, and timings.
- Actionability checks, hit-target coordinates, and locator resolution logs.

---

## 7. Windows-Specific Troubleshooting

| Symptom | Cause | Solution |
|---|---|---|
| `PSSecurityException: File cannot be loaded because running scripts is disabled` | PowerShell execution policy restriction | Run using `powershell -ExecutionPolicy Bypass -File .\scripts\start-lab.ps1` or use `pnpm run dev`. |
| `EADDRINUSE: address already in use :::3001` | Zombie Node.js background process holding port | Run the port-killing PowerShell command from Section 2. |
| `Browser closed unexpectedly` during WebKit runs | Missing Windows graphics media pack | Run `npx playwright install webkit` to re-download binaries. |
| Visual regression pixel diffs on Windows vs Linux | Font rendering antialiasing differences | `toHaveScreenshot` in `e2e/visual.spec.ts` uses `maxDiffPixelRatio: 0.05` to tolerate subpixel font rendering. Run `npx playwright test e2e/visual.spec.ts -u` if updating local baselines. |
