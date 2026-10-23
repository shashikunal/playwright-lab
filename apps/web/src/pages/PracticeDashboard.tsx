import { LogOut, ShieldCheck, User, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

interface PracticeUserSession {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
}

export function PracticeDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<PracticeUserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("pil-practice-token");
    if (!storedToken) {
      navigate("/practice/login?redirect=/practice/dashboard");
      return;
    }

    setToken(storedToken);

    // Verify session with Express backend
    fetch("/api/practice/auth/me", {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => {
        if (!res.ok) {
          localStorage.removeItem("pil-practice-token");
          localStorage.removeItem("pil-practice-user");
          navigate("/practice/login?redirect=/practice/dashboard");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = async () => {
    const currentToken = localStorage.getItem("pil-practice-token");
    if (currentToken) {
      try {
        await fetch("/api/practice/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${currentToken}` },
        });
      } catch {
        // Continue clearing local storage regardless of network error
      }
    }

    localStorage.removeItem("pil-practice-token");
    localStorage.removeItem("pil-practice-user");
    navigate("/practice/login?loggedOut=true");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center" data-testid="dashboard-loading">
        <span className="inline-block size-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="mt-2 text-xs text-muted">Verifying practice session token...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8" data-testid="practice-dashboard">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-fg">
              <ShieldCheck size={20} />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-text" data-testid="welcome-message">
              Welcome, {user.username}!
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted">
            You are authenticated in the protected practice student area.
          </p>
        </div>

        <Button
          variant="secondary"
          data-testid="logout-btn"
          onClick={handleLogout}
          className="self-start sm:self-auto"
        >
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>

      {/* Authenticated Session Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-5" data-testid="session-info">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <User size={18} className="text-accent" />
            <h2 className="text-base font-semibold text-text">Active Practice Session</h2>
          </div>
          <Badge tone="success" data-testid="user-role-badge">
            {user.role.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
          <div className="rounded-lg border border-border bg-bg/50 p-3 space-y-1">
            <span className="font-semibold text-muted uppercase tracking-wider text-[10px]">Display Name</span>
            <p className="font-medium text-text text-sm" data-testid="user-display-name">
              {user.displayName}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-bg/50 p-3 space-y-1">
            <span className="font-semibold text-muted uppercase tracking-wider text-[10px]">Registered Email</span>
            <p className="font-medium text-text text-sm font-mono" data-testid="user-email">
              {user.email}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-bg/50 p-3 space-y-1 sm:col-span-2">
            <span className="font-semibold text-muted uppercase tracking-wider text-[10px]">Bearer Session Token</span>
            <p className="font-mono text-muted text-xs break-all" data-testid="session-token-text">
              {token}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 flex items-start gap-3">
          <Zap size={18} className="text-accent shrink-0 mt-0.5" />
          <div className="text-xs text-muted space-y-1">
            <p className="font-medium text-text">Testing Senior SDET Authentication Invariants:</p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              <li>Direct unauthenticated access to this route is intercepted by client-side and server-side guards.</li>
              <li>Clicking Sign Out calls Express to purge the server session, making cached token replay invalid.</li>
              <li>Separate browser contexts (<code className="font-mono text-accent">browser.newContext()</code>) do not inherit this session.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
