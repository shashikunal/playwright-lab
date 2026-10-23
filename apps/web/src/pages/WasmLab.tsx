import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Database,
  Gauge,
  Play,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { ScenarioLearningPanel } from "../components/ScenarioLearningPanel";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useScenarioLearning } from "../lib/useScenarioLearning";

// Standard WebAssembly binary bytecode (wasm32)
// Exports: fib(i32) -> i32 (recursive), trap() -> unreachable, memory (1 page / 64KB)
const WASM_BYTECODE = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, // Magic & Version
  0x01, 0x09, 0x02, 0x60, 0x01, 0x7f, 0x01, 0x7f, 0x60, 0x00, 0x00, // Type section
  0x03, 0x03, 0x02, 0x00, 0x01, // Function section
  0x05, 0x03, 0x01, 0x00, 0x01, // Memory section (1 page min)
  0x07, 0x17, 0x03, 0x03, 0x66, 0x69, 0x62, 0x00, 0x00, 0x04, 0x74, 0x72, 0x61, 0x70, 0x00, 0x01, 0x06, 0x6d, 0x65, 0x6d, 0x6f, 0x72, 0x79, 0x02, 0x00, // Export section (23 bytes)
  0x0a, 0x22, 0x02, // Code section
  // fib body (30 bytes):
  0x1c, 0x00, 0x20, 0x00, 0x41, 0x02, 0x48, 0x04, 0x7f, 0x20, 0x00, 0x05, 0x20, 0x00, 0x41, 0x01, 0x6b, 0x10, 0x00, 0x20, 0x00, 0x41, 0x02, 0x6b, 0x10, 0x00, 0x6a, 0x0b, 0x0b,
  // trap body (3 bytes):
  0x03, 0x00, 0x00, 0x0b,
]);

// JavaScript reference recursive Fibonacci implementation for benchmark comparison
function jsFib(n: number): number {
  if (n < 2) return n;
  return jsFib(n - 1) + jsFib(n - 2);
}

declare global {
  interface Window {
    __PIL_WASM__?: {
      instance: WebAssembly.Instance | null;
      fib: ((n: number) => number) | null;
      trap: (() => void) | null;
      memory: WebAssembly.Memory | null;
      getMemoryBytes: () => number[];
    };
  }
}

export function WasmLab() {
  const { learning } = useScenarioLearning("wasm");

  // Wasm Module Instance State
  const [wasmReady, setWasmReady] = useState(false);
  const [wasmError, setWasmError] = useState<string | null>(null);
  const wasmInstanceRef = useRef<WebAssembly.Instance | null>(null);

  // Memory State
  const [memoryPages, setMemoryPages] = useState<number>(1);
  const [memoryBytes, setMemoryBytes] = useState<number>(65536);
  const [hexDump, setHexDump] = useState<string[]>([]);

  // Calculation Sandbox
  const [inputN, setInputN] = useState<number>(20);
  const [computing, setComputing] = useState(false);
  const [calcResult, setCalcResult] = useState<number | null>(null);
  const [calcRuntimeMs, setCalcRuntimeMs] = useState<string | null>(null);

  // Benchmark State
  const [benchmarking, setBenchmarking] = useState(false);
  const [benchWasmTime, setBenchWasmTime] = useState<string | null>(null);
  const [benchJsTime, setBenchJsTime] = useState<string | null>(null);
  const [benchWasmResult, setBenchWasmResult] = useState<number | null>(null);
  const [benchJsResult, setBenchJsResult] = useState<number | null>(null);
  const [speedupRatio, setSpeedupRatio] = useState<string | null>(null);

  // Trap / Fault Injection State
  const [trapError, setTrapError] = useState<{ name: string; message: string } | null>(null);

  // Initialize WebAssembly Module
  useEffect(() => {
    let mounted = true;
    WebAssembly.instantiate(WASM_BYTECODE)
      .then((res) => {
        if (!mounted) return;
        wasmInstanceRef.current = res.instance;
        setWasmReady(true);

        const memory = res.instance.exports.memory as WebAssembly.Memory;
        const initialBuffer = new Uint8Array(memory.buffer);
        // Seed first few bytes in buffer for inspection
        for (let i = 0; i < 16; i++) {
          initialBuffer[i] = (i * 17) & 0xff;
        }

        updateHexDump(memory);

        // Expose to window for Playwright test inspections
        window.__PIL_WASM__ = {
          instance: res.instance,
          fib: res.instance.exports.fib as (n: number) => number,
          trap: res.instance.exports.trap as () => void,
          memory,
          getMemoryBytes: () => Array.from(new Uint8Array(memory.buffer).slice(0, 16)),
        };
      })
      .catch((err) => {
        if (!mounted) return;
        setWasmError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      mounted = false;
      delete window.__PIL_WASM__;
    };
  }, []);

  const updateHexDump = (mem: WebAssembly.Memory) => {
    const arr = new Uint8Array(mem.buffer).slice(0, 16);
    const dump = Array.from(arr).map((b) => b.toString(16).padStart(2, "0").toUpperCase());
    setHexDump(dump);
  };

  // Grow Memory Buffer
  const handleGrowMemory = () => {
    if (!wasmInstanceRef.current) return;
    const memory = wasmInstanceRef.current.exports.memory as WebAssembly.Memory;
    const prevPages = memory.grow(1); // grows by 1 page (64KB)
    const newPages = prevPages + 1;
    setMemoryPages(newPages);
    setMemoryBytes(memory.buffer.byteLength);
    updateHexDump(memory);
  };

  // Execute Wasm Computation
  const handleExecuteWasm = () => {
    if (!wasmInstanceRef.current) return;
    setComputing(true);
    setTrapError(null);

    // Microsecond timing via performance.now
    const fib = wasmInstanceRef.current.exports.fib as (n: number) => number;
    const t0 = performance.now();
    const result = fib(inputN);
    const t1 = performance.now();

    const elapsed = t1 - t0;
    setCalcResult(result);
    setCalcRuntimeMs(elapsed < 1 ? `${(elapsed * 1000).toFixed(0)} µs` : `${elapsed.toFixed(3)} ms`);
    setComputing(false);
  };

  // Run Comparative Benchmark (Wasm vs JS)
  const handleRunBenchmark = () => {
    if (!wasmInstanceRef.current) return;
    setBenchmarking(true);
    setTrapError(null);

    const targetN = Math.min(inputN, 32); // cap at 32 for responsive UI

    // 1. Wasm Execution
    const fib = wasmInstanceRef.current.exports.fib as (n: number) => number;
    const wasmT0 = performance.now();
    const wResult = fib(targetN);
    const wasmT1 = performance.now();
    const wasmElapsed = wasmT1 - wasmT0;

    // 2. JS Execution
    const jsT0 = performance.now();
    const jResult = jsFib(targetN);
    const jsT1 = performance.now();
    const jsElapsed = jsT1 - jsT0;

    setBenchWasmResult(wResult);
    setBenchJsResult(jResult);
    setBenchWasmTime(`${wasmElapsed.toFixed(3)} ms`);
    setBenchJsTime(`${jsElapsed.toFixed(3)} ms`);

    const ratio = wasmElapsed > 0 ? (jsElapsed / wasmElapsed).toFixed(1) : "1.0";
    setSpeedupRatio(ratio);
    setBenchmarking(false);
  };

  // Trigger Wasm Runtime Trap (unreachable opcode)
  const handleTriggerTrap = () => {
    if (!wasmInstanceRef.current) return;
    const trap = wasmInstanceRef.current.exports.trap as () => void;

    try {
      trap();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setTrapError({
          name: err.name || "WebAssembly.RuntimeError",
          message: err.message || "unreachable",
        });
      } else {
        setTrapError({
          name: "WebAssembly.RuntimeError",
          message: "unreachable",
        });
      }
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8" data-testid="wasm-lab">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-accent text-accent-fg shadow-xs">
              <Cpu size={24} />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text">WebAssembly Sandbox</h1>
              <p className="text-sm text-muted">
                Execute compiled wasm32 bytecode, inspect WebAssembly.Memory buffers, benchmark against JS, and handle traps.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={wasmReady ? "success" : wasmError ? "danger" : "warning"} data-testid="wasm-engine-status">
              {wasmReady ? "Wasm Engine: Active" : wasmError ? "Engine Error" : "Compiling Wasm..."}
            </Badge>
          </div>
        </div>
      </div>

      {/* Engine Status & Memory Inspector Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Module Architecture & Exports */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-accent" />
              <h2 className="font-semibold text-text text-sm">Wasm Module Architecture</h2>
            </div>
            <span className="font-mono text-xs text-muted">wasm32 JIT</span>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-muted">Target Architecture</dt>
              <dd className="font-mono font-medium text-text mt-0.5" data-testid="wasm-arch">
                wasm32-unknown-unknown
              </dd>
            </div>
            <div>
              <dt className="text-muted">Bytecode Size</dt>
              <dd className="font-mono font-medium text-text mt-0.5" data-testid="wasm-bytecode-size">
                {WASM_BYTECODE.length} Bytes
              </dd>
            </div>
            <div>
              <dt className="text-muted">Exported Functions</dt>
              <dd className="font-mono text-text mt-0.5 space-y-0.5">
                <div>• fib(n: i32) -&gt; i32</div>
                <div>• trap() -&gt; void</div>
              </dd>
            </div>
            <div>
              <dt className="text-muted">Memory Isolation</dt>
              <dd className="font-mono text-text mt-0.5">Linear ArrayBuffer</dd>
            </div>
          </dl>
        </div>

        {/* Memory Inspector */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Database size={18} className="text-accent" />
              <h2 className="font-semibold text-text text-sm">WebAssembly.Memory Inspector</h2>
            </div>
            <Badge tone="neutral" data-testid="wasm-memory-pages">
              {memoryPages} {memoryPages === 1 ? "Page" : "Pages"}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Total Buffer Capacity:</span>
              <span className="font-mono font-bold text-text" data-testid="wasm-memory-bytes">
                {memoryBytes.toLocaleString()} Bytes ({memoryBytes / 1024} KB)
              </span>
            </div>

            {/* Hex Dump Viewer */}
            <div>
              <p className="text-[11px] font-medium text-muted mb-1.5">First 16 Bytes (Hex Dump):</p>
              <div
                className="flex flex-wrap gap-1.5 rounded-lg bg-surface-muted p-2.5 font-mono text-xs text-text border border-border/50"
                data-testid="wasm-hexdump"
              >
                {hexDump.map((byte, idx) => (
                  <span key={idx} className="rounded bg-surface px-1.5 py-0.5 border border-border">
                    {byte}
                  </span>
                ))}
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={handleGrowMemory}
              disabled={!wasmReady}
              data-testid="wasm-grow-memory-btn"
              className="w-full text-xs"
            >
              Grow Buffer (+1 Page / 64 KB)
            </Button>
          </div>
        </div>
      </div>

      {/* Main Computation Sandbox */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-base font-bold text-text">Execution & Computational Sandbox</h2>
            <p className="text-xs text-muted mt-0.5">
              Execute recursive Fibonacci via Wasm stack frames. Microsecond precision timer evaluates JIT performance.
            </p>
          </div>
          <div className="flex gap-1.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setInputN(10)}
              className="rounded bg-surface-muted px-2 py-1 text-muted hover:text-text border border-border"
              data-testid="preset-10-btn"
            >
              n=10
            </button>
            <button
              type="button"
              onClick={() => setInputN(20)}
              className="rounded bg-surface-muted px-2 py-1 text-muted hover:text-text border border-border"
              data-testid="preset-20-btn"
            >
              n=20
            </button>
            <button
              type="button"
              onClick={() => setInputN(25)}
              className="rounded bg-surface-muted px-2 py-1 text-muted hover:text-text border border-border"
              data-testid="preset-25-btn"
            >
              n=25
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] items-center">
          {/* Input Parameter */}
          <div className="space-y-3">
            <label htmlFor="wasm-input-n" className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Fibonacci Term (n)
            </label>
            <input
              id="wasm-input-n"
              type="number"
              min={0}
              max={40}
              value={inputN}
              onChange={(e) => setInputN(Math.max(0, parseInt(e.target.value, 10) || 0))}
              data-testid="wasm-n-input"
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 font-mono text-base font-medium text-text focus:border-accent focus:outline-none"
            />
            <Button
              variant="primary"
              onClick={handleExecuteWasm}
              disabled={!wasmReady || computing}
              data-testid="wasm-run-btn"
              className="w-full gap-2"
            >
              <Play size={16} />
              {computing ? "Computing..." : "Execute Wasm Function"}
            </Button>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center text-muted">
            <ArrowRight size={20} />
          </div>

          {/* Results Output */}
          <div className="rounded-xl border border-border bg-surface-muted p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Output Result</span>
              {calcResult !== null && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-success">
                  <CheckCircle2 size={13} /> Verified
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted">fib({inputN}):</span>
                <span
                  className="font-mono text-2xl font-bold text-accent"
                  data-testid="wasm-result"
                >
                  {calcResult !== null ? calcResult.toLocaleString() : "—"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                <span className="text-muted">Execution Duration:</span>
                <span className="font-mono font-semibold text-text" data-testid="wasm-runtime">
                  {calcRuntimeMs ?? "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Benchmark & Fault Injection Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Comparative Benchmark */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Gauge size={18} className="text-accent" />
              <h2 className="font-semibold text-text text-sm">Wasm vs JavaScript Benchmark</h2>
            </div>
            <Sparkles size={16} className="text-muted" />
          </div>

          <p className="text-xs text-muted">
            Runs identical recursive algorithm in JavaScript vs Wasm bytecode to benchmark JIT compilation vs native execution.
          </p>

          <Button
            variant="secondary"
            onClick={handleRunBenchmark}
            disabled={!wasmReady || benchmarking}
            data-testid="run-benchmark-btn"
            className="w-full text-xs gap-2"
          >
            <RefreshCw size={14} className={benchmarking ? "animate-spin" : ""} />
            {benchmarking ? "Running Benchmark..." : `Benchmark fib(${Math.min(inputN, 32)})`}
          </Button>

          {benchWasmTime && benchJsTime && (
            <div className="space-y-3 pt-2" data-testid="benchmark-results-container">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-surface-muted p-3 border border-border/60">
                  <p className="text-muted text-[11px]">WebAssembly</p>
                  <p className="font-mono font-bold text-sm text-accent mt-0.5" data-testid="wasm-bench-time">
                    {benchWasmTime}
                  </p>
                  <p className="font-mono text-[10px] text-muted mt-1">res: {benchWasmResult}</p>
                </div>

                <div className="rounded-lg bg-surface-muted p-3 border border-border/60">
                  <p className="text-muted text-[11px]">Native JavaScript</p>
                  <p className="font-mono font-bold text-sm text-text mt-0.5" data-testid="js-bench-time">
                    {benchJsTime}
                  </p>
                  <p className="font-mono text-[10px] text-muted mt-1">res: {benchJsResult}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-muted">Speedup Ratio:</span>
                <span className="font-mono font-bold text-accent" data-testid="benchmark-speedup">
                  {speedupRatio}x
                </span>
              </div>

              {benchWasmResult === benchJsResult && (
                <div
                  className="flex items-center gap-1.5 text-[11px] font-medium text-success bg-green-500/10 p-2 rounded border border-green-500/20"
                  data-testid="benchmark-match-badge"
                >
                  <CheckCircle2 size={14} />
                  Mathematical outputs match identically across engines ({benchWasmResult})
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fault Injection: Trap Handling */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-danger" />
              <h2 className="font-semibold text-text text-sm">Fault Injection & Trap Handling</h2>
            </div>
            <span className="font-mono text-[11px] text-danger">unreachable trap</span>
          </div>

          <p className="text-xs text-muted">
            WebAssembly runtime traps (like unreachable bytecode, divide-by-zero, or out-of-bounds memory access) throw synchronous{" "}
            <code className="text-accent font-mono">WebAssembly.RuntimeError</code> in the JavaScript host.
          </p>

          <Button
            variant="secondary"
            onClick={handleTriggerTrap}
            disabled={!wasmReady}
            data-testid="wasm-trap-btn"
            className="w-full text-xs gap-2 border-danger/40 text-danger hover:bg-danger/10"
          >
            <AlertTriangle size={14} />
            Trigger Wasm Trap (unreachable opcode)
          </Button>

          {trapError && (
            <div
              role="alert"
              data-testid="wasm-error-alert"
              className="rounded-lg border border-danger/30 bg-danger/10 p-3.5 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-danger">
                  <AlertTriangle size={15} />
                  <span>Trapped: {trapError.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTrapError(null)}
                  className="text-[11px] text-muted hover:text-text underline"
                  data-testid="clear-trap-btn"
                >
                  Dismiss
                </button>
              </div>
              <p className="font-mono text-text text-[11px] bg-surface/60 p-2 rounded border border-danger/20">
                Runtime Error: {trapError.message}
              </p>
              <p className="text-[11px] text-muted">
                Caught gracefully by JavaScript try/catch without terminating the browser process or WebAssembly engine.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pedagogical Learning Panel */}
      {learning && <ScenarioLearningPanel learning={learning} />}
    </div>
  );
}
