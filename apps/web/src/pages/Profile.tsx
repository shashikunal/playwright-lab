import type { ActivityItem, NotificationPrefs } from "@pil/shared";
import {
  Activity,
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  RefreshCw,
  Save,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export function Profile() {
  const { user } = useAuth();

  const [prefs, setPrefs] = useState<NotificationPrefs>({
    emailUpdates: true,
    smsAlerts: false,
    weeklySummary: true,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProfileAndActivity = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("pil-auth-token");
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      fetch("/api/app/profile", { headers })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch("/api/app/activity?limit=10", { headers })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ])
      .then(([profData, actData]) => {
        if (profData?.preferences) {
          setPrefs(profData.preferences);
        }
        if (actData?.activities) {
          setActivities(actData.activities);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    fetchProfileAndActivity();
  }, [fetchProfileAndActivity]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    setStatusMsg(null);
    const token = localStorage.getItem("pil-auth-token");

    try {
      const res = await fetch("/api/app/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ preferences: prefs }),
      });

      if (res.ok) {
        setStatusMsg({ type: "success", text: "Notification preferences saved successfully." });
      } else {
        setStatusMsg({ type: "error", text: "Failed to update preferences." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Network error occurred." });
    } finally {
      setSavingPrefs(false);
    }
  };

  if (!user) {
    return (
      <main id="main" className="mx-auto max-w-4xl px-4 py-12 md:px-8">
        <div role="alert" className="rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
          <User size={32} className="mx-auto text-muted mb-3" />
          <h1 className="text-xl font-bold text-text">Authentication Required</h1>
          <p className="mt-2 text-sm text-muted">
            Please log in to view your profile settings and activity history.
          </p>
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-xs font-semibold text-accent-fg hover:opacity-90"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Account Settings & Profile</h1>
          <p className="text-sm text-muted">
            Manage your corporate identity, notification subscriptions, and audit events.
          </p>
        </div>
        <Button variant="ghost" onClick={fetchProfileAndActivity} aria-label="Refresh profile data">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </Button>
      </div>

      {statusMsg ? (
        <div
          role="status"
          aria-live="polite"
          className={`mt-4 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
            statusMsg.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-danger/40 bg-danger/10 text-danger"
          }`}
        >
          {statusMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{statusMsg.text}</span>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* User Card */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-full bg-accent/10 text-accent font-bold text-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-semibold text-text">{user.name}</h2>
              <p className="text-xs text-muted font-mono">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 border-t border-border pt-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted">Assigned Role</span>
              <Badge tone={user.role === "admin" ? "warning" : "neutral"}>
                {user.role.toUpperCase()}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted">User ID</span>
              <span className="font-mono text-muted">{user.id}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted">Active Session</span>
              <span className="inline-flex items-center gap-1 font-mono text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Authenticated
              </span>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-accent" />
            <h2 className="font-semibold text-text">Notification Preferences</h2>
          </div>
          <p className="mt-1 text-xs text-muted">
            Configure how and when you receive automated platform notices.
          </p>

          <form onSubmit={handleSavePreferences} className="mt-6 space-y-4">
            <div className="space-y-3">
              <label className="flex items-center justify-between rounded-lg border border-border p-3 cursor-pointer hover:bg-surface-muted/40">
                <div>
                  <span className="block text-sm font-medium text-text">Email Updates</span>
                  <span className="block text-xs text-muted">
                    Receive course registration confirmations and system alerts via email
                  </span>
                </div>
                <input
                  type="checkbox"
                  aria-label="Email Updates"
                  checked={prefs.emailUpdates}
                  onChange={(e) => setPrefs({ ...prefs, emailUpdates: e.target.checked })}
                  className="size-4 rounded border-border"
                />
              </label>

              <label className="flex items-center justify-between rounded-lg border border-border p-3 cursor-pointer hover:bg-surface-muted/40">
                <div>
                  <span className="block text-sm font-medium text-text">SMS Alerts</span>
                  <span className="block text-xs text-muted">
                    Critical real-time alerts and login security notices
                  </span>
                </div>
                <input
                  type="checkbox"
                  aria-label="SMS Alerts"
                  checked={prefs.smsAlerts}
                  onChange={(e) => setPrefs({ ...prefs, smsAlerts: e.target.checked })}
                  className="size-4 rounded border-border"
                />
              </label>

              <label className="flex items-center justify-between rounded-lg border border-border p-3 cursor-pointer hover:bg-surface-muted/40">
                <div>
                  <span className="block text-sm font-medium text-text">Weekly Digest</span>
                  <span className="block text-xs text-muted">
                    Summary of platform activity and completed certifications every Monday
                  </span>
                </div>
                <input
                  type="checkbox"
                  aria-label="Weekly Digest"
                  checked={prefs.weeklySummary}
                  onChange={(e) => setPrefs({ ...prefs, weeklySummary: e.target.checked })}
                  className="size-4 rounded border-border"
                />
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={savingPrefs}>
                <Save size={14} />
                <span>{savingPrefs ? "Saving..." : "Save Preferences"}</span>
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Activity History Audit Log */}
      <div className="mt-8 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-accent" />
            <h2 className="font-semibold text-text">Recent Activity Audit Log</h2>
          </div>
          <span className="font-mono text-xs text-muted">{activities.length} Events Logged</span>
        </div>
        <p className="mt-1 text-xs text-muted">
          Chronological record of corporate training events, enrollment changes, and administrative actions.
        </p>

        {activities.length === 0 ? (
          <div className="mt-4 p-8 text-center text-xs text-muted">
            No activity events recorded yet.
          </div>
        ) : (
          <div className="mt-4 divide-y divide-border overflow-hidden rounded-lg border border-border">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between p-4 transition-colors hover:bg-surface-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-8 place-items-center rounded-full bg-accent/10 text-accent">
                    <Activity size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{act.target}</p>
                    <p className="text-xs text-muted">
                      Initiated by <span className="font-semibold text-text">{act.actorEmail}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <span className="rounded bg-surface-muted px-2 py-0.5 font-mono text-[10px] uppercase text-muted">
                    {act.action}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 font-mono text-xs text-muted">
                    <Clock size={12} />
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
