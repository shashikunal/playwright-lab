# Playwright Industrial Lab - Windows Launcher
# Runs locally without Docker or hosted cloud services

Write-Host "==========================================================" -ForegroundColor DarkYellow
Write-Host "          PLAYWRIGHT INDUSTRIAL PRACTICE LAB              " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor DarkYellow

# 1. Verify Node.js version
try {
    $nodeVersionRaw = node -v
    $nodeMajor = [int]($nodeVersionRaw -replace '^v' -split '\.')[0]
    if ($nodeMajor -lt 20) {
        Write-Warning "Detected Node.js $nodeVersionRaw. Node.js >= 20 is recommended for optimal performance."
    } else {
        Write-Host "[OK] Node.js runtime: $nodeVersionRaw" -ForegroundColor Green
    }
} catch {
    Write-Error "Node.js is not found in PATH. Please install Node.js >= 20 from https://nodejs.org/"
    exit 1
}

# 2. Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "[SETUP] node_modules not found. Installing dependencies via pnpm install..." -ForegroundColor Cyan
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Dependency installation failed."
        exit $LASTEXITCODE
    }
}

# 3. Build shared types
Write-Host "[BUILD] Compiling @pil/shared contracts..." -ForegroundColor Cyan
pnpm --filter @pil/shared build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to build shared packages."
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Starting Industrial Lab Services:" -ForegroundColor Yellow
Write-Host "  -> Express API Backend:   http://127.0.0.1:3001" -ForegroundColor Cyan
Write-Host "  -> React Vite Frontend:   http://127.0.0.1:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C at any time to shut down the servers." -ForegroundColor Gray
Write-Host ""

# 4. Start concurrent processes
pnpm run dev
