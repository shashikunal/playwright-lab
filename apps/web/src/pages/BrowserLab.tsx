import { Cookie, Database, ExternalLink, Globe, Layers, MapPin, Menu, Monitor, Search, ShieldAlert, Smartphone, Tablet, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export function BrowserLab() {
  // Section 1: Popups
  const [popupTriggered, setPopupTriggered] = useState(false);

  // Section 3: Storage & Cookies
  const [localKey, setLocalKey] = useState("user_pref");
  const [localVal, setLocalVal] = useState("dark_theme");
  const [currentLocal, setCurrentLocal] = useState<string>("");
  const [cookieStatus, setCookieStatus] = useState<string>("No cookie fetched");

  // Section 4: Unsaved changes guard
  const [guardActive, setGuardActive] = useState(false);
  const [draftContent, setDraftContent] = useState("");

  // Section 5: Geolocation
  const [geoState, setGeoState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    lat?: number;
    lng?: number;
    error?: string;
  }>({ status: "idle" });

  // Section 6: Responsive drawer
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Section 7: Command palette
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Manage beforeunload guard
  useEffect(() => {
    if (!guardActive || !draftContent) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You have unsaved changes!";
      return "You have unsaved changes!";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [guardActive, draftContent]);

  // Manage Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape" && paletteOpen) {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paletteOpen]);

  // Open popup helper
  function openPopup() {
    setPopupTriggered(true);
    window.open(
      "/lab/browser/popup-content",
      "test_popup_window",
      "width=520,height=600,menubar=no,toolbar=no,location=no,status=no",
    );
  }

  // LocalStorage handler
  function saveToLocal() {
    localStorage.setItem(localKey, localVal);
    setCurrentLocal(localStorage.getItem(localKey) || "");
  }

  function readFromLocal() {
    setCurrentLocal(localStorage.getItem(localKey) || "(null)");
  }

  // Cookie API trigger
  async function triggerCookieApi() {
    try {
      const res = await fetch("/api/lab/browser/set-cookie");
      const data = await res.json();
      setCookieStatus(`Cookie response: ${JSON.stringify(data)}`);
    } catch {
      setCookieStatus("Failed to call cookie endpoint");
    }
  }

  // Geolocation trigger
  function requestLocation() {
    if (!navigator.geolocation) {
      setGeoState({ status: "error", error: "Geolocation not supported" });
      return;
    }
    setGeoState({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoState({
          status: "success",
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
        });
      },
      (err) => {
        setGeoState({ status: "error", error: err.message });
      },
      { timeout: 5000 },
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5 text-accent" />
          <p className="font-mono text-xs uppercase tracking-wider text-accent">Phase 6 Lab</p>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Browser & Window Interactions</h1>
        <p className="mt-2 text-muted">
          Master popups, multi-tab coordination, nested iframes, browser storage, geolocation permissions, and responsive viewport adaptations.
        </p>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Section 1: Popups & New Windows */}
        <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center">
              <ExternalLink className="mr-2 h-4 w-4 text-accent" />
              1. Popups & Multi-Page
            </h2>
            <Badge tone="neutral">page.waitForEvent('popup')</Badge>
          </div>
          <p className="mt-2 text-xs text-muted">
            Test window spawning, target verification, and programmatic closure.
          </p>

          <div className="mt-4 space-y-3">
            <Button
              onClick={openPopup}
              data-testid="open-popup-btn"
              className="w-full justify-center"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Popup Window (window.open)
            </Button>

            <a
              href="/lab/browser/popup-content"
              target="_blank"
              rel="noreferrer"
              data-testid="open-tab-link"
              className="flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface-elevated transition-colors"
            >
              Open New Tab (target="_blank")
            </a>

            {popupTriggered && (
              <p className="text-xs text-accent font-mono" data-testid="popup-triggered-note">
                Popup trigger issued.
              </p>
            )}
          </div>
        </section>

        {/* Section 2: Storage & Cookies */}
        <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center">
              <Database className="mr-2 h-4 w-4 text-accent" />
              2. Storage & Cookies
            </h2>
            <Badge tone="neutral">context.cookies()</Badge>
          </div>
          <p className="mt-2 text-xs text-muted">
            Assert and modify localStorage entries and inspect server cookies.
          </p>

          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                data-testid="local-key-input"
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder="Key"
                className="rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
              />
              <input
                data-testid="local-val-input"
                value={localVal}
                onChange={(e) => setLocalVal(e.target.value)}
                placeholder="Value"
                className="rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={saveToLocal} data-testid="save-local-btn">
                Save to localStorage
              </Button>
              <Button variant="ghost" onClick={readFromLocal} data-testid="read-local-btn">
                Read localStorage
              </Button>
            </div>
            {currentLocal && (
              <div className="rounded bg-background p-2 font-mono text-xs" data-testid="local-storage-val">
                Value: {currentLocal}
              </div>
            )}

            <div className="border-t border-border pt-3">
              <Button variant="ghost" onClick={triggerCookieApi} data-testid="trigger-cookie-btn">
                <Cookie className="mr-1 h-3.5 w-3.5" />
                Call Set-Cookie Endpoint
              </Button>
              <p className="mt-1 font-mono text-xs text-muted" data-testid="cookie-status">
                {cookieStatus}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Section 3: Iframes & Nested Frames */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center">
              <Layers className="mr-2 h-4 w-4 text-accent" />
              3. Same-Origin & Nested Iframes
            </h2>
            <p className="mt-1 text-xs text-muted">
              Use <span className="font-mono text-accent">page.frameLocator('iframe[title="..."]')</span> to target elements inside isolated browsing contexts.
            </p>
          </div>
          <Badge tone="neutral">page.frameLocator()</Badge>
        </div>

        <div className="mt-4 rounded-lg border border-border overflow-hidden">
          <iframe
            src="/lab/browser/frame-content"
            title="Embedded Widget Frame"
            data-testid="outer-iframe"
            className="w-full bg-background"
            style={{ height: "320px" }}
          />
        </div>
      </section>

      {/* Grid: Unsaved changes + Geolocation */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Section 4: Unsaved Changes Guard */}
        <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center">
              <ShieldAlert className="mr-2 h-4 w-4 text-accent" />
              4. Navigation Guard (beforeunload)
            </h2>
            <Badge tone="neutral">page.on('dialog')</Badge>
          </div>
          <p className="mt-2 text-xs text-muted">
            A dirty draft with guard active triggers the browser's native leave prompt.
          </p>

          <div className="mt-4 space-y-3">
            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                id="enable-guard-checkbox"
                data-testid="enable-guard-checkbox"
                checked={guardActive}
                onChange={(e) => setGuardActive(e.target.checked)}
                className="rounded border-border text-accent focus:ring-accent"
              />
              <span>Activate Unsaved Changes Guard</span>
            </label>

            <textarea
              data-testid="draft-textarea"
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              placeholder="Type unsaved draft content here..."
              rows={3}
              className="w-full rounded border border-border bg-background p-2 text-xs text-foreground focus:border-accent focus:outline-none"
            />

            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted">
                Status: {guardActive && draftContent ? "Guard Active (Dirty)" : "Clean"}
              </span>
              <a
                href="/"
                data-testid="leave-page-link"
                className="text-xs text-accent underline hover:text-accent/80"
              >
                Attempt to Navigate Home
              </a>
            </div>
          </div>
        </section>

        {/* Section 5: Permissions & Geolocation */}
        <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-accent" />
              5. Geolocation Permissions
            </h2>
            <Badge tone="neutral">context.grantPermissions()</Badge>
          </div>
          <p className="mt-2 text-xs text-muted">
            Grant geolocation permission and set coordinates via Playwright context options.
          </p>

          <div className="mt-4 space-y-4">
            <Button
              onClick={requestLocation}
              data-testid="request-location-btn"
              className="w-full justify-center"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Request Current Location
            </Button>

            <div className="rounded border border-border bg-background p-3 text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-muted">Status:</span>
                <span data-testid="geo-status">{geoState.status}</span>
              </div>
              {geoState.status === "success" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted">Latitude:</span>
                    <span data-testid="geo-lat" className="text-accent font-semibold">{geoState.lat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Longitude:</span>
                    <span data-testid="geo-lng" className="text-accent font-semibold">{geoState.lng}</span>
                  </div>
                </>
              )}
              {geoState.status === "error" && (
                <div className="text-red-500" data-testid="geo-error">
                  {geoState.error}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Section 6: Responsive Viewports & Mobile Breakpoint Simulation */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center">
              <Smartphone className="mr-2 h-4 w-4 text-accent" />
              6. Responsive Layouts & Breakpoints
            </h2>
            <p className="mt-1 text-xs text-muted">
              Resize viewport with <span className="font-mono text-accent">page.setViewportSize(&#123; width: 375, height: 667 &#125;)</span> to verify responsive mobile drawer behavior.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted">
            <Smartphone className="h-4 w-4" />
            <Tablet className="h-4 w-4" />
            <Monitor className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-border bg-background p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Simulated Navigation Bar:</span>
            {/* Mobile hamburger button: visible only on small screens */}
            <button
              type="button"
              data-testid="mobile-hamburger-btn"
              onClick={() => setMobileDrawerOpen((o) => !o)}
              className="flex md:hidden items-center justify-center rounded p-1.5 border border-border hover:bg-surface"
              aria-label="Toggle Mobile Navigation Menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            {/* Desktop nav links: hidden on mobile */}
            <div className="hidden md:flex space-x-4 text-xs font-medium" data-testid="desktop-nav-links">
              <span>Overview</span>
              <span>Workflows</span>
              <span>Telemetry</span>
              <span>Settings</span>
            </div>
          </div>

          {/* Mobile drawer: toggled by hamburger */}
          {mobileDrawerOpen && (
            <div
              data-testid="mobile-drawer-panel"
              className="mt-3 rounded border border-accent/30 bg-accent/5 p-3 text-xs space-y-2 animate-fadeIn"
            >
              <div className="flex justify-between font-semibold text-accent">
                <span>Mobile Navigation Drawer</span>
                <button
                  type="button"
                  data-testid="close-drawer-btn"
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ul className="space-y-1 font-mono">
                <li className="p-1 hover:bg-accent/10 rounded cursor-pointer">/app/overview</li>
                <li className="p-1 hover:bg-accent/10 rounded cursor-pointer">/app/courses</li>
                <li className="p-1 hover:bg-accent/10 rounded cursor-pointer">/lab/browser</li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Section 7: Global Keyboard Shortcuts & Command Palette */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center">
              <Search className="mr-2 h-4 w-4 text-accent" />
              7. Keyboard Shortcuts (Ctrl+K Command Palette)
            </h2>
            <p className="mt-1 text-xs text-muted">
              Press <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-xs">Ctrl+K</kbd> or <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-xs">Cmd+K</kbd> to toggle the global command search dialog.
            </p>
          </div>
          <Button
            variant="ghost"
            data-testid="open-palette-btn"
            onClick={() => setPaletteOpen(true)}
          >
            Open Palette
          </Button>
        </div>

        {/* Modal Command Palette */}
        {paletteOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Command Palette"
            data-testid="command-palette-dialog"
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm p-4"
          >
            <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-4 shadow-2xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-border pb-2">
                <Search className="h-4 w-4 text-muted" />
                <input
                  autoFocus
                  data-testid="palette-search-input"
                  placeholder="Type a command or search labs..."
                  className="w-full bg-transparent text-sm focus:outline-none"
                />
                <button
                  type="button"
                  data-testid="close-palette-btn"
                  onClick={() => setPaletteOpen(false)}
                  className="rounded p-1 text-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <div
                  data-testid="palette-item-1"
                  className="flex items-center justify-between rounded p-2 hover:bg-surface-elevated cursor-pointer"
                >
                  <span>Go to Locator Gym</span>
                  <span className="font-mono text-muted text-[10px]">/lab/locators</span>
                </div>
                <div
                  data-testid="palette-item-2"
                  className="flex items-center justify-between rounded p-2 hover:bg-surface-elevated cursor-pointer"
                >
                  <span>Open Scenario Network Controls</span>
                  <span className="font-mono text-muted text-[10px]">/lab/network</span>
                </div>
                <div
                  data-testid="palette-item-3"
                  className="flex items-center justify-between rounded p-2 hover:bg-surface-elevated cursor-pointer"
                >
                  <span>Reset All Telemetry</span>
                  <span className="font-mono text-muted text-[10px]">Action</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
