import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, Lock, LogIn, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ScenarioLearningPanel } from "../components/ScenarioLearningPanel";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useScenarioLearning } from "../lib/useScenarioLearning";

export function PracticeLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { learning } = useScenarioLearning("practice-login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const redirectUrl = searchParams.get("redirect") || "/practice/dashboard";
  const loggedOutMessage = searchParams.get("loggedOut");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    setServerError(null);

    // Client-side validation
    if (!username.trim() && !password.trim()) {
      setClientError("Please enter both username and password.");
      return;
    }
    if (!username.trim()) {
      setClientError("Username is required.");
      return;
    }
    if (!password.trim()) {
      setClientError("Password is required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/practice/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error?.message || data.message || "Authentication failed.");
        return;
      }

      // Store practice session token
      localStorage.setItem("pil-practice-token", data.token);
      localStorage.setItem("pil-practice-user", JSON.stringify(data.user));

      navigate(redirectUrl);
    } catch {
      setServerError("Network error connecting to practice authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setClientError(null);
    setServerError(null);
  };

  return (
    <div className="mx-auto max-w-xl space-y-8" data-testid="practice-login-portal">
      {/* Header */}
      <div className="text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-accent text-accent-fg shadow-xs">
          <KeyRound size={24} />
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-text">Practice Login Portal</h1>
        <p className="mt-1 text-sm text-muted">
          Master real-world authentication testing: stable <code className="font-mono text-accent">data-testid</code> selectors, accessible labels, password toggles, validation errors, and server session invalidation.
        </p>
      </div>

      {loggedOutMessage ? (
        <div
          role="status"
          data-testid="logged-out-banner"
          className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3.5 text-xs font-medium text-green-500"
        >
          <CheckCircle2 size={16} />
          <span>You have been signed out successfully. Practice session token has been purged.</span>
        </div>
      ) : null}

      {/* Demo Credentials Helper */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Documented Practice Accounts</span>
          <Badge tone="accent">Seeded Credentials</Badge>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => quickFill("student", "Password123!")}
            data-testid="quickfill-student"
            className="flex flex-col rounded-lg border border-border bg-bg/50 p-2.5 text-left text-xs transition-colors hover:border-accent"
          >
            <span className="font-semibold text-text">student</span>
            <span className="text-[11px] font-mono text-muted">Password123!</span>
            <span className="mt-1 text-[10px] text-accent">Standard Student</span>
          </button>

          <button
            type="button"
            onClick={() => quickFill("practitioner", "SecurePractice2026!")}
            data-testid="quickfill-practitioner"
            className="flex flex-col rounded-lg border border-border bg-bg/50 p-2.5 text-left text-xs transition-colors hover:border-accent"
          >
            <span className="font-semibold text-text">practitioner</span>
            <span className="text-[11px] font-mono text-muted">SecurePractice2026!</span>
            <span className="mt-1 text-[10px] text-accent">Advanced Role</span>
          </button>

          <button
            type="button"
            onClick={() => quickFill("locked_user", "Locked123!")}
            data-testid="quickfill-locked"
            className="flex flex-col rounded-lg border border-border bg-bg/50 p-2.5 text-left text-xs transition-colors hover:border-accent"
          >
            <span className="font-semibold text-text">locked_user</span>
            <span className="text-[11px] font-mono text-muted">Locked123!</span>
            <span className="mt-1 text-[10px] text-red-500">Locked Account</span>
          </button>
        </div>
      </div>

      {/* Login Form Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-xs" data-testid="login-card">
        <form onSubmit={handleLogin} noValidate className="space-y-5" data-testid="practice-login-form">
          {/* Username Field */}
          <div className="space-y-1.5">
            <label htmlFor="practice-username" className="block text-sm font-medium text-text">
              Practice Username
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                <User size={16} />
              </span>
              <input
                id="practice-username"
                name="username"
                type="text"
                autoComplete="username"
                data-testid="username-input"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setClientError(null);
                  setServerError(null);
                }}
                placeholder="Enter practice username (e.g. student)"
                className="w-full rounded-lg border border-border bg-bg pl-9 pr-3 py-2 text-sm text-text placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {/* Password Field with Show/Hide Toggle */}
          <div className="space-y-1.5">
            <label htmlFor="practice-password" className="block text-sm font-medium text-text">
              Practice Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                <Lock size={16} />
              </span>
              <input
                id="practice-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                data-testid="password-input"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setClientError(null);
                  setServerError(null);
                }}
                placeholder="Enter password"
                className="w-full rounded-lg border border-border bg-bg pl-9 pr-10 py-2 text-sm text-text placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                type="button"
                data-testid="password-toggle-btn"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-text transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              to="/practice/forgot-password"
              data-testid="forgot-password-link"
              className="text-xs text-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Client Error Alert */}
          {clientError ? (
            <div
              role="alert"
              data-testid="client-error"
              className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500"
            >
              <AlertCircle size={16} />
              <span>{clientError}</span>
            </div>
          ) : null}

          {/* Server Error Alert */}
          {serverError ? (
            <div
              role="alert"
              data-testid="server-error"
              className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500"
            >
              <AlertCircle size={16} />
              <span>{serverError}</span>
            </div>
          ) : null}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            data-testid="submit-btn"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-accent-fg border-t-transparent" />
                Signing In...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <LogIn size={16} />
                Sign In to Practice Portal
              </span>
            )}
          </Button>
        </form>
      </div>

      {/* Embedded 3-Mode Learning Panel */}
      {learning ? (
        <ScenarioLearningPanel learning={learning} scenarioTitle="Practice Login & Session Management" />
      ) : null}
    </div>
  );
}
