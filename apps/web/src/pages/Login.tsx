import { AlertCircle, KeyRound, Lock, LogIn, Mail, ShieldCheck, User } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectUrl = searchParams.get("redirect") || "/app/courses";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(redirectUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-md space-y-6 pt-6">
      <div className="text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-accent/10 text-accent">
          <KeyRound size={24} />
        </span>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text">Enterprise Portal Sign In</h1>
        <p className="mt-1 text-xs text-muted">
          Practise authentication flows, session preservation with storageState, and role-based permissions.
        </p>
      </div>

      {/* Demo Credentials Quick-Select */}
      <div className="rounded-lg border border-border bg-surface-muted p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Quick-Fill Demo Roles</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => quickFill("learner@pil.local", "Learner123!")}
            className="flex flex-col items-center rounded-md border border-border bg-surface p-2 text-xs font-medium text-text hover:border-accent"
          >
            <User size={16} className="text-muted" />
            <span className="mt-1">Learner</span>
          </button>
          <button
            type="button"
            onClick={() => quickFill("trainer@pil.local", "Trainer123!")}
            className="flex flex-col items-center rounded-md border border-border bg-surface p-2 text-xs font-medium text-text hover:border-accent"
          >
            <Lock size={16} className="text-accent" />
            <span className="mt-1">Trainer</span>
          </button>
          <button
            type="button"
            onClick={() => quickFill("admin@pil.local", "Admin123!")}
            className="flex flex-col items-center rounded-md border border-border bg-surface p-2 text-xs font-medium text-text hover:border-accent"
          >
            <ShieldCheck size={16} className="text-warning" />
            <span className="mt-1">Admin</span>
          </button>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4 rounded-lg border border-border bg-surface p-6 shadow-xs">
        {error ? (
          <div role="alert" className="flex items-center gap-2 rounded-md border border-danger/40 bg-danger-bg p-3 text-xs text-danger">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        ) : null}

        <div>
          <label htmlFor="email" className="block text-xs font-medium text-muted">
            Email address
          </label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@pil.local"
              className="w-full rounded-md border border-border bg-surface pl-9 pr-3 py-2 text-sm text-text focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-medium text-muted">
            Password
          </label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-border bg-surface pl-9 pr-3 py-2 text-sm text-text focus:outline-hidden"
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          <LogIn size={16} />
          {loading ? "Authenticating..." : "Sign In to Workspace"}
        </Button>
      </form>
    </div>
  );
}
