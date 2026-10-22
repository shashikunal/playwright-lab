import { AlertCircle, ArrowUpDown, Check, ChevronDown, GripVertical, Info, Layers, MessageSquare, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

type TableRow = {
  id: string;
  name: string;
  role: string;
  status: "Active" | "Pending" | "Suspended";
};

const initialRows: TableRow[] = [
  { id: "SRV-01", name: "Auth Gateway", role: "Security", status: "Active" },
  { id: "SRV-02", name: "Worker Fleet", role: "Compute", status: "Active" },
  { id: "SRV-03", name: "Data Pipeline", role: "Storage", status: "Pending" },
  { id: "SRV-04", name: "Notification Hub", role: "Messaging", status: "Suspended" },
  { id: "SRV-05", name: "Telemetry Node", role: "Observability", status: "Active" },
];

const initialTasks = [
  { id: "t1", title: "1. Build and compile artifacts" },
  { id: "t2", title: "2. Run unit and integration tests" },
  { id: "t3", title: "3. Publish release package" },
];

export function Widgets() {
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfirmed, setModalConfirmed] = useState(false);
  const modalCloseBtnRef = useRef<HTMLButtonElement>(null);

  // Native dialogs state
  const [dialogStatus, setDialogStatus] = useState<string>("No dialogs triggered yet");

  // Tabs state
  const tabs = [
    { id: "general", label: "General Settings", content: "General application configuration and preferences." },
    { id: "security", label: "Security & Keys", content: "API keys, authentication credentials, and session policies." },
    { id: "telemetry", label: "Telemetry & Logs", content: "Trace ingestion, log retention policies, and metrics." },
  ];
  const [activeTab, setActiveTab] = useState(0);

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<string | null>("faq-1");

  // Toast & Popover state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Data table state
  const [rows, setRows] = useState<TableRow[]>(initialRows);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<keyof TableRow>("name");
  const [sortAsc, setSortAsc] = useState(true);

  // Drag & drop state
  const [tasks, setTasks] = useState(initialTasks);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Shadow DOM host ref
  const shadowHostRef = useRef<HTMLDivElement>(null);

  // Modal Escape key handling & focus trapping
  useEffect(() => {
    if (!modalOpen) return;
    modalCloseBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);

  // Shadow DOM setup
  useEffect(() => {
    const host = shadowHostRef.current;
    if (!host || host.shadowRoot) return;

    const shadow = host.attachShadow({ mode: "open" });
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <style>
        .shadow-box {
          padding: 1rem;
          border-radius: 0.375rem;
          background: var(--pil-surface, #ffffff);
          border: 1px dashed var(--pil-accent, #ea580c);
          color: var(--pil-text, #1c1917);
          font-family: inherit;
        }
        .shadow-title {
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: var(--pil-accent, #ea580c);
        }
        .shadow-btn {
          background: var(--pil-accent, #ea580c);
          color: var(--pil-accent-fg, #ffffff);
          border: none;
          padding: 0.375rem 0.75rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          cursor: pointer;
          font-weight: 500;
        }
        .shadow-input {
          padding: 0.375rem 0.5rem;
          border: 1px solid var(--pil-border, #e7e5e4);
          border-radius: 0.25rem;
          background: transparent;
          color: inherit;
          font-size: 0.75rem;
          margin-right: 0.5rem;
        }
        .shadow-output {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          font-family: monospace;
        }
      </style>
      <div class="shadow-box">
        <p class="shadow-title">Shadow Root Component</p>
        <p style="font-size: 0.75rem; margin-bottom: 0.5rem;">This content is encapsulated in an open shadow DOM root.</p>
        <div style="display: flex; align-items: center;">
          <input class="shadow-input" aria-label="Shadow Input" placeholder="Type inside shadow..." />
          <button class="shadow-btn">Execute Shadow Action</button>
        </div>
        <div class="shadow-output" id="shadow-feedback">Ready</div>
      </div>
    `;

    shadow.appendChild(wrapper);

    const btn = shadow.querySelector(".shadow-btn");
    const input = shadow.querySelector<HTMLInputElement>(".shadow-input");
    const feedback = shadow.querySelector("#shadow-feedback");

    btn?.addEventListener("click", () => {
      const val = input?.value || "Default Action";
      if (feedback) feedback.textContent = `Shadow DOM Executed: ${val}`;
    });
  }, []);

  // Table sorting
  const handleSort = (field: keyof TableRow) => {
    const isAsc = sortField === field ? !sortAsc : true;
    setSortField(field);
    setSortAsc(isAsc);
    const sorted = [...rows].sort((a, b) => {
      const cmp = String(a[field]).localeCompare(String(b[field]));
      return isAsc ? cmp : -cmp;
    });
    setRows(sorted);
  };

  // Table selection
  const toggleSelectAll = () => {
    if (selectedIds.size === rows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((r) => r.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Drag and drop handlers
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropIdx: number) => {
    if (draggedIdx === null || draggedIdx === dropIdx) return;
    const reordered = [...tasks];
    const [moved] = reordered.splice(draggedIdx, 1);
    reordered.splice(dropIdx, 0, moved);
    setTasks(reordered);
    setDraggedIdx(null);
  };

  const moveTask = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= tasks.length) return;
    const reordered = [...tasks];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    setTasks(reordered);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      {/* Header */}
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-accent">Lab Practice</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Interactive Widgets</h1>
        <p className="mt-2 text-sm text-muted">
          Master Playwright automation across dialogs, accessibility tabs, data tables, toasts, shadow DOM roots, and drag-and-drop.
        </p>
      </div>

      {/* Section 1: Dialogs & Alerts */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <Layers className="size-5 text-accent" />
          <h2 className="text-xl font-semibold">1. Dialogs & Alerts</h2>
        </div>
        <p className="mt-1 text-xs text-muted">
          Test focus-trapped modal dialogs and browser native dialogs (<code className="font-mono">alert</code>, <code className="font-mono">confirm</code>, <code className="font-mono">prompt</code>).
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={() => { setModalOpen(true); setModalConfirmed(false); }}>
            Open Modal Dialog
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              window.alert("Maintenance Notice: Cluster restarts at 02:00 UTC.");
              setDialogStatus("Alert acknowledged by test runner");
            }}
          >
            Trigger Alert
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              const res = window.confirm("Are you sure you want to purge telemetry records?");
              setDialogStatus(res ? "Confirm accepted" : "Confirm rejected");
            }}
          >
            Trigger Confirm
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              const res = window.prompt("Enter deployment release tag:", "v2.4.0-rc1");
              setDialogStatus(res !== null ? `Prompt submitted: ${res}` : "Prompt canceled");
            }}
          >
            Trigger Prompt
          </Button>
        </div>

        <div className="mt-4 rounded-md border border-border bg-surface-muted p-3 text-sm">
          <span className="font-medium text-muted">Native Dialog Status: </span>
          <span role="status" className="font-mono font-semibold text-text" data-testid="dialog-status">
            {dialogStatus}
          </span>
        </div>

        {/* Modal markup */}
        {modalOpen ? (
          <div
            role="presentation"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setModalOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              aria-describedby="modal-desc"
              className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 id="modal-title" className="text-lg font-semibold text-text">
                  Confirm Deployment Target
                </h3>
                <button
                  ref={modalCloseBtnRef}
                  type="button"
                  aria-label="Close dialog"
                  onClick={() => setModalOpen(false)}
                  className="rounded-md p-1 text-muted hover:bg-surface-muted hover:text-text"
                >
                  <X size={18} />
                </button>
              </div>
              <p id="modal-desc" className="mt-2 text-sm text-muted">
                You are about to promote build artifacts to production. Focus is trapped inside this modal dialog.
              </p>
              <div className="mt-4">
                <label htmlFor="cluster-pin" className="block text-xs font-medium text-muted">
                  Confirmation PIN
                </label>
                <input
                  id="cluster-pin"
                  type="text"
                  placeholder="Type 1234 to proceed"
                  className="mt-1 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-text focus:outline-hidden"
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setModalConfirmed(true);
                    setModalOpen(false);
                  }}
                >
                  Confirm Deploy
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {modalConfirmed ? (
          <p className="mt-2 text-xs font-semibold text-success" role="status" data-testid="modal-result">
            Modal confirmed: Build artifact promoted successfully!
          </p>
        ) : null}
      </section>

      {/* Section 2: Tabs & Accordions */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs">
        <h2 className="text-xl font-semibold">2. Accessible Tabs & Accordion</h2>
        <p className="mt-1 text-xs text-muted">
          WAI-ARIA compliant tab navigation with keyboard support (<code className="font-mono">ArrowLeft</code> / <code className="font-mono">ArrowRight</code>) and expandable sections.
        </p>

        {/* Tablist */}
        <div className="mt-4 border-b border-border">
          <div role="tablist" aria-label="Widget configuration tabs" className="flex gap-2">
            {tabs.map((tab, idx) => {
              const selected = activeTab === idx;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveTab(idx)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight") {
                      setActiveTab((idx + 1) % tabs.length);
                    } else if (e.key === "ArrowLeft") {
                      setActiveTab((idx - 1 + tabs.length) % tabs.length);
                    }
                  }}
                  className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                    selected ? "border-accent text-accent" : "border-transparent text-muted hover:text-text"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab panels */}
        {tabs.map((tab, idx) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            hidden={activeTab !== idx}
            className="p-4"
          >
            <p className="text-sm text-text">{tab.content}</p>
          </div>
        ))}

        {/* Accordion */}
        <div className="mt-6 divide-y divide-border rounded-md border border-border">
          <div>
            <button
              type="button"
              id="acc-btn-1"
              aria-expanded={openAccordion === "faq-1"}
              aria-controls="acc-content-1"
              onClick={() => setOpenAccordion(openAccordion === "faq-1" ? null : "faq-1")}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-text hover:bg-surface-muted"
            >
              <span>What is strict locator mode in Playwright?</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${openAccordion === "faq-1" ? "rotate-180" : ""}`}
              />
            </button>
            {openAccordion === "faq-1" ? (
              <div id="acc-content-1" role="region" aria-labelledby="acc-btn-1" className="bg-surface-muted px-4 py-3 text-xs text-muted">
                Playwright enforces strict mode: when a locator matches multiple elements, actions throw an exception to prevent non-deterministic test runs.
              </div>
            ) : null}
          </div>
          <div>
            <button
              type="button"
              id="acc-btn-2"
              aria-expanded={openAccordion === "faq-2"}
              aria-controls="acc-content-2"
              onClick={() => setOpenAccordion(openAccordion === "faq-2" ? null : "faq-2")}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-text hover:bg-surface-muted"
            >
              <span>How do auto-retrying assertions prevent flaky tests?</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${openAccordion === "faq-2" ? "rotate-180" : ""}`}
              />
            </button>
            {openAccordion === "faq-2" ? (
              <div id="acc-content-2" role="region" aria-labelledby="acc-btn-2" className="bg-surface-muted px-4 py-3 text-xs text-muted">
                Web-first assertions like <code className="font-mono">await expect(locator).toBeVisible()</code> poll until condition or timeout, eliminating arbitrary sleeps.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Section 3: Toasts, Tooltips & Popovers */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs">
        <h2 className="text-xl font-semibold">3. Toasts, Popovers & Tooltips</h2>
        <p className="mt-1 text-xs text-muted">
          Transient dynamic overlays with accessible roles and auto-dismissal.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button
            onClick={() => {
              setToastMessage("Job queued successfully (Job #9842)");
              setTimeout(() => setToastMessage(null), 3500);
            }}
          >
            <MessageSquare size={16} />
            Trigger Toast
          </Button>

          {/* Tooltip trigger */}
          <div className="relative inline-block">
            <button
              type="button"
              aria-describedby={tooltipVisible ? "demo-tooltip" : undefined}
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={() => setTooltipVisible(false)}
              onFocus={() => setTooltipVisible(true)}
              onBlur={() => setTooltipVisible(false)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-muted px-3 py-2 text-xs font-medium text-muted hover:text-text"
            >
              <Info size={14} />
              Hover for Tooltip
            </button>
            {tooltipVisible ? (
              <div
                id="demo-tooltip"
                role="tooltip"
                className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-neutral-900 px-2.5 py-1 text-xs text-white shadow-md dark:bg-neutral-100 dark:text-neutral-900"
              >
                Informational tooltip for screen readers and testers
              </div>
            ) : null}
          </div>

          {/* Popover trigger */}
          <div className="relative inline-block">
            <Button variant="ghost" onClick={() => setPopoverOpen(!popoverOpen)}>
              Toggle Details Popover
            </Button>
            {popoverOpen ? (
              <div
                role="dialog"
                aria-label="Quick details"
                className="absolute left-0 top-full z-20 mt-2 w-64 rounded-md border border-border bg-surface p-4 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-text">Quick Details</p>
                  <button
                    type="button"
                    aria-label="Close popover"
                    onClick={() => setPopoverOpen(false)}
                    className="text-muted hover:text-text"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted">
                  Popover content stays visible until closed or clicked outside.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Toast Notification Container */}
        {toastMessage ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-4 flex items-center justify-between rounded-md border border-border bg-surface-muted px-4 py-3 shadow-md"
          >
            <div className="flex items-center gap-2">
              <Check className="size-4 text-success" />
              <span className="text-sm font-medium text-text">{toastMessage}</span>
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setToastMessage(null)}
              className="text-muted hover:text-text"
            >
              <X size={16} />
            </button>
          </div>
        ) : null}
      </section>

      {/* Section 4: Data Table with Sorting and Selection */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">4. Data Grid: Sorting & Selection</h2>
            <p className="mt-1 text-xs text-muted">
              Select rows, sort columns, and assert count of selected nodes.
            </p>
          </div>
          <p className="font-mono text-xs font-semibold text-accent" data-testid="selected-count">
            Selected: {selectedIds.size} of {rows.length}
          </p>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted font-mono text-xs text-muted">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={selectedIds.size === rows.length && rows.length > 0}
                    onChange={toggleSelectAll}
                    className="size-4 rounded accent-accent"
                  />
                </th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 hover:text-text cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <span>Name</span>
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 hover:text-text cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    <span>Status</span>
                    <ArrowUpDown size={12} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => {
                const isSelected = selectedIds.has(row.id);
                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${isSelected ? "bg-surface-muted" : "hover:bg-surface-muted/50"}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${row.name}`}
                        checked={isSelected}
                        onChange={() => toggleSelectRow(row.id)}
                        className="size-4 rounded accent-accent"
                      />
                    </td>
                    <td className="font-mono text-xs text-muted">{row.id}</td>
                    <td className="font-medium text-text">{row.name}</td>
                    <td className="text-muted">{row.role}</td>
                    <td>
                      <Badge tone={row.status === "Pending" ? "warning" : "neutral"}>
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 5: Drag and Drop Reordering */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs">
        <h2 className="text-xl font-semibold">5. Drag & Drop Reordering</h2>
        <p className="mt-1 text-xs text-muted">
          Reorder list items using HTML5 drag-and-drop or accessible keyboard controls.
        </p>

        <ul className="mt-4 space-y-2">
          {tasks.map((task, idx) => (
            <li
              key={task.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(idx)}
              className="flex items-center justify-between rounded-md border border-border bg-surface-muted px-4 py-2.5 text-sm text-text cursor-grab active:cursor-grabbing"
              data-testid={`task-${idx}`}
            >
              <div className="flex items-center gap-2">
                <GripVertical size={16} className="text-muted" />
                <span className="font-medium">{task.title}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={`Move ${task.title} up`}
                  disabled={idx === 0}
                  onClick={() => moveTask(idx, idx - 1)}
                  className="rounded px-2 py-1 text-xs text-muted hover:bg-surface hover:text-text disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label={`Move ${task.title} down`}
                  disabled={idx === tasks.length - 1}
                  onClick={() => moveTask(idx, idx + 1)}
                  className="rounded px-2 py-1 text-xs text-muted hover:bg-surface hover:text-text disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Section 6: Shadow DOM Practice */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <AlertCircle className="size-5 text-accent" />
          <h2 className="text-xl font-semibold">6. Open Shadow DOM Root</h2>
        </div>
        <p className="mt-1 text-xs text-muted">
          Practise Playwright locators targeting elements inside open shadow DOM roots. Standard Playwright locators pierce shadow DOM automatically.
        </p>
        <div className="mt-4" ref={shadowHostRef} data-testid="shadow-host" />
      </section>

      {/* Section 7: Menubars & Nested Submenus */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">7. Accessible Menubar & Nested Submenus</h2>
            <p className="mt-1 text-xs text-muted">
              Traverse menubars and nested popup menus using <span className="font-mono text-accent">getByRole('menuitem')</span> and keyboard arrow keys.
            </p>
          </div>
          <Badge tone="neutral">role="menubar"</Badge>
        </div>

        <nav aria-label="Editor Menu" className="rounded-md border border-border bg-surface-muted p-1">
          <div role="menubar" className="flex items-center space-x-1 text-xs font-medium">
            {/* File Menu */}
            <div className="relative group">
              <button
                type="button"
                role="menuitem"
                aria-haspopup="true"
                aria-expanded="false"
                data-testid="menu-file"
                className="px-3 py-1.5 rounded hover:bg-surface hover:text-text cursor-pointer"
              >
                File
              </button>
              {/* Dropdown menu */}
              <div
                role="menu"
                aria-label="File Options"
                className="hidden group-hover:block group-focus-within:block absolute z-20 top-full left-0 mt-1 w-44 rounded-md border border-border bg-surface p-1 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  data-testid="menuitem-new"
                  onClick={() => setToastMessage("New file created")}
                  className="w-full text-left px-3 py-1.5 rounded text-xs hover:bg-surface-muted"
                >
                  New Document
                </button>
                <div className="relative group/sub">
                  <button
                    type="button"
                    role="menuitem"
                    aria-haspopup="true"
                    data-testid="menuitem-recent"
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded text-xs hover:bg-surface-muted"
                  >
                    <span>Open Recent</span>
                    <span>&rsaquo;</span>
                  </button>
                  {/* Nested Submenu */}
                  <div
                    role="menu"
                    aria-label="Recent Files"
                    className="hidden group-hover/sub:block absolute top-0 left-full ml-1 w-40 rounded-md border border-border bg-surface p-1 shadow-lg"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      data-testid="menuitem-project-alpha"
                      onClick={() => setToastMessage("Opened Project Alpha")}
                      className="w-full text-left px-3 py-1.5 rounded text-xs hover:bg-surface-muted"
                    >
                      Project Alpha
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      data-testid="menuitem-project-beta"
                      onClick={() => setToastMessage("Opened Project Beta")}
                      className="w-full text-left px-3 py-1.5 rounded text-xs hover:bg-surface-muted"
                    >
                      Project Beta
                    </button>
                  </div>
                </div>
                <div className="my-1 border-t border-border" />
                <button
                  type="button"
                  role="menuitem"
                  data-testid="menuitem-export"
                  onClick={() => setToastMessage("Exporting document")}
                  className="w-full text-left px-3 py-1.5 rounded text-xs hover:bg-surface-muted text-accent"
                >
                  Export PDF
                </button>
              </div>
            </div>

            {/* Edit Menu */}
            <div className="relative group">
              <button
                type="button"
                role="menuitem"
                aria-haspopup="true"
                data-testid="menu-edit"
                className="px-3 py-1.5 rounded hover:bg-surface hover:text-text cursor-pointer"
              >
                Edit
              </button>
              <div
                role="menu"
                aria-label="Edit Options"
                className="hidden group-hover:block absolute z-20 top-full left-0 mt-1 w-36 rounded-md border border-border bg-surface p-1 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  data-testid="menuitem-undo"
                  onClick={() => setToastMessage("Undo action")}
                  className="w-full text-left px-3 py-1.5 rounded text-xs hover:bg-surface-muted"
                >
                  Undo
                </button>
                <button
                  type="button"
                  role="menuitem"
                  data-testid="menuitem-redo"
                  onClick={() => setToastMessage("Redo action")}
                  className="w-full text-left px-3 py-1.5 rounded text-xs hover:bg-surface-muted"
                >
                  Redo
                </button>
              </div>
            </div>
          </div>
        </nav>
      </section>

      {/* Section 8: Contenteditable Rich Text Editor */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">8. Contenteditable Element</h2>
            <p className="mt-1 text-xs text-muted">
              Assert text inside <span className="font-mono text-accent">&lt;div contenteditable="true"&gt;</span> and verify inline tags like <span className="font-mono">&lt;strong&gt;</span>.
            </p>
          </div>
          <Badge tone="neutral">contenteditable="true"</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              data-testid="format-bold-btn"
              onClick={() => document.execCommand("bold")}
              className="rounded border border-border px-2.5 py-1 text-xs font-bold hover:bg-surface-muted"
            >
              B
            </button>
            <button
              type="button"
              data-testid="format-italic-btn"
              onClick={() => document.execCommand("italic")}
              className="rounded border border-border px-2.5 py-1 text-xs italic hover:bg-surface-muted"
            >
              I
            </button>
          </div>

          <div
            contentEditable
            role="textbox"
            aria-multiline="true"
            aria-label="Rich Text Editor Content"
            data-testid="rich-text-editor"
            className="min-h-24 rounded border border-border bg-surface-muted p-3 text-sm focus:border-accent focus:outline-none"
            dangerouslySetInnerHTML={{
              __html: "This is <strong>bold industrial text</strong> ready for Playwright verification.",
            }}
          />
        </div>
      </section>

      {/* Section 9: SVG Charts & Canvas */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">9. Interactive SVG & Canvas Pad</h2>
            <p className="mt-1 text-xs text-muted">
              SVG charts with accessible role fallbacks and HTML5 canvas drawing pads.
            </p>
          </div>
          <Badge tone="neutral">SVG & Canvas</Badge>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* SVG Bar Chart */}
          <div className="rounded-md border border-border bg-surface-muted p-4 space-y-2">
            <h3 className="text-xs font-semibold text-muted">Quarterly Telemetry (SVG)</h3>
            <svg
              role="img"
              aria-label="Quarterly Telemetry Bar Chart"
              data-testid="telemetry-svg-chart"
              viewBox="0 0 300 120"
              className="w-full h-32"
            >
              {/* Q1 Bar */}
              <rect
                data-testid="svg-bar-q1"
                role="graphics-symbol"
                aria-label="Q1: 45 operations"
                x="30"
                y="55"
                width="35"
                height="45"
                className="fill-accent/70 hover:fill-accent transition-colors cursor-pointer"
              />
              <text x="47" y="115" textAnchor="middle" className="text-[10px] fill-current">Q1</text>

              {/* Q2 Bar */}
              <rect
                data-testid="svg-bar-q2"
                role="graphics-symbol"
                aria-label="Q2: 70 operations"
                x="95"
                y="30"
                width="35"
                height="70"
                className="fill-accent/70 hover:fill-accent transition-colors cursor-pointer"
              />
              <text x="112" y="115" textAnchor="middle" className="text-[10px] fill-current">Q2</text>

              {/* Q3 Bar */}
              <rect
                data-testid="svg-bar-q3"
                role="graphics-symbol"
                aria-label="Q3: 85 operations"
                x="160"
                y="15"
                width="35"
                height="85"
                className="fill-accent/70 hover:fill-accent transition-colors cursor-pointer"
              />
              <text x="177" y="115" textAnchor="middle" className="text-[10px] fill-current">Q3</text>

              {/* Q4 Bar */}
              <rect
                data-testid="svg-bar-q4"
                role="graphics-symbol"
                aria-label="Q4: 60 operations"
                x="225"
                y="40"
                width="35"
                height="60"
                className="fill-accent/70 hover:fill-accent transition-colors cursor-pointer"
              />
              <text x="242" y="115" textAnchor="middle" className="text-[10px] fill-current">Q4</text>
            </svg>
          </div>

          {/* Canvas Signature Pad */}
          <div className="rounded-md border border-border bg-surface-muted p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted">HTML5 Canvas Pad</h3>
              <button
                type="button"
                data-testid="clear-canvas-btn"
                onClick={() => {
                  const canvas = document.querySelector<HTMLCanvasElement>("[data-testid='drawing-canvas']");
                  const ctx = canvas?.getContext("2d");
                  if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
                }}
                className="text-[11px] text-accent hover:underline"
              >
                Clear Pad
              </button>
            </div>
            <canvas
              data-testid="drawing-canvas"
              width={260}
              height={100}
              aria-label="Interactive signature drawing pad"
              className="w-full h-24 rounded border border-border bg-background cursor-crosshair"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
