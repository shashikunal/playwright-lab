import { AlertTriangle, BookOpen, Camera, Compass, Crosshair, FileText, Gauge, GraduationCap, KeyRound, Layers, LayoutDashboard, LogOut, Menu, ScanSearch, ShieldCheck, Sliders, User, UserCheck, Users, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";

const labs = [
  { to: "/practice/login", label: "Practice Login", icon: KeyRound },
  { to: "/lab/locators", label: "Locator Gym", icon: ScanSearch },
  { to: "/lab/forms", label: "Forms", icon: FileText },
  { to: "/lab/widgets", label: "Widgets", icon: Layers },
  { to: "/lab/network", label: "Scenario Controls", icon: Sliders },
  { to: "/lab/flaky", label: "Flaky Lab", icon: AlertTriangle },
  { to: "/lab/visual", label: "Visual Lab", icon: Camera },
  { to: "/lab/a11y", label: "Accessibility", icon: ShieldCheck },
  { to: "/lab/perf", label: "Performance Lab", icon: Gauge },
  { to: "/lab/browser", label: "Browser Lab", icon: Compass },
  { to: "/app/courses", label: "Courses", icon: BookOpen },
  { to: "/app/enrollments", label: "Enrollment", icon: GraduationCap },
  { to: "/app/users", label: "Users & Staff", icon: Users },
  { to: "/app/profile", label: "Profile", icon: UserCheck },
];

const planned = ["WebAssembly Sandbox"];

export function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-bg text-text md:grid md:grid-cols-[16rem_1fr]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-fg"
      >
        Skip to content
      </a>
      {open ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside
        id="lab-nav"
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-surface transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-4">
          <span className="grid size-9 place-items-center rounded-md bg-accent text-accent-fg">
            <Crosshair aria-hidden="true" size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight">Industrial Lab</p>
            <p className="font-mono text-xs text-muted">Foundation</p>
          </div>
        </div>
        <nav aria-label="Primary" className="px-3 py-4">
          <NavLink
            to="/"
            end
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? "bg-surface-muted text-accent" : "text-text hover:bg-surface-muted"
              }`
            }
          >
            <LayoutDashboard aria-hidden="true" size={16} />
            Overview
          </NavLink>
          <p className="mb-2 mt-6 px-3 font-mono text-[11px] uppercase tracking-wider text-muted">
            Practice labs
          </p>
          <ul className="space-y-1">
            {labs.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                      isActive ? "bg-surface-muted text-accent" : "text-text hover:bg-surface-muted"
                    }`
                  }
                >
                  <item.icon aria-hidden="true" size={16} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <ul className="mt-1 space-y-1">
            {planned.map((name) => (
              <li key={name} className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted">
                <span>{name}</span>
                <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase">
                  Planned
                </span>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-8">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm md:hidden"
            aria-expanded={open}
            aria-controls="lab-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" size={16} /> : <Menu aria-hidden="true" size={16} />}
            Menu
          </button>
          <p className="hidden font-mono text-xs text-muted md:block">Local practice target</p>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/app/profile"
                  className="hidden items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs sm:inline-flex hover:border-accent"
                >
                  <User size={12} className="text-accent" />
                  <span className="font-medium text-text">{user.name}</span>
                  <span className="font-mono text-[10px] uppercase text-muted">({user.role})</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  aria-label="Sign out"
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:border-danger hover:text-danger cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-text hover:border-accent hover:text-accent"
              >
                <User size={14} />
                <span>Sign In</span>
              </Link>
            )}
            <ThemeToggle />
          </div>
        </header>
        <main id="main" className="px-4 py-8 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
