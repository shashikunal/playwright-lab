import { useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Banner } from "../components/ui/Banner";
import { Button } from "../components/ui/Button";

const courses = [
  { name: "Locators", stable: true },
  { name: "Fixtures", stable: true },
  { name: "Unstable row", stable: false },
];

export function Locators() {
  const [opened, setOpened] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [edited, setEdited] = useState(false);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-accent">Locator Gym</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Choose a locator that survives a redesign.</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Good examples use accessible names. Defects are isolated and labeled. This page does not call the API.
        </p>
      </div>

      <section aria-labelledby="stable-heading" className="rounded-lg border border-border bg-surface p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 id="stable-heading" className="text-sm font-semibold">
            Stable locators
          </h2>
          <Badge>Good</Badge>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <label htmlFor="course-search" className="block text-sm font-medium">
              Search courses
            </label>
            <input id="course-search" placeholder="Try Playwright" className="rounded-md border border-border bg-bg px-3 py-2 text-sm" />
          </div>
          <Button onClick={() => setChecked(true)} data-testid="stable-action">
            Run check
          </Button>
          <a href="/lab/locators" title="Locator gym shortcut" className="text-sm text-accent">
            Shortcut
          </a>
          <svg role="img" aria-label="Locator map" width="36" height="36" viewBox="0 0 36 36">
            <rect width="36" height="36" rx="6" fill="currentColor" className="text-accent" />
          </svg>
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <input aria-label="Quick filter" className="rounded-md border border-border bg-bg px-3 py-2 text-sm" />
          <div>
            <span id="seat-label" className="block text-sm font-medium">
              Seat count label
            </span>
            <input aria-labelledby="seat-label" className="mt-1.5 rounded-md border border-border bg-bg px-3 py-2 text-sm" />
          </div>
        </div>
        {checked ? (
          <p role="status" className="mt-3 text-sm text-success">
            Check finished
          </p>
        ) : null}
        <Tradeoff id="stable-tradeoff" label="Show stable locator tradeoff">
          Prefer role, label, and placeholder over a test id. Use a test id only when the accessible name is not unique.
        </Tradeoff>
      </section>

      <section aria-labelledby="list-heading" className="rounded-lg border border-border bg-surface p-5">
        <h2 id="list-heading" className="text-sm font-semibold">
          Dynamic list
        </h2>
        <ul aria-label="Courses" className="mt-4 divide-y divide-border rounded-md border border-border">
          {courses.map((course) => (
            <li key={course.name} className={course.stable ? "flex items-center justify-between px-3 py-2" : "css-generated-row flex items-center justify-between px-3 py-2"}>
              <span>{course.name}</span>
              <Button variant="ghost" onClick={() => setOpened(course.name)}>
                Open
              </Button>
            </li>
          ))}
        </ul>
        {opened ? (
          <p role="status" className="mt-3 text-sm">
            Opened {opened}
          </p>
        ) : null}
        <Tradeoff id="nested-tradeoff" label="Show nested locator tradeoff">
          Filter the row with hasText, then click Open. nth, first, and last break when the list order changes.
        </Tradeoff>
      </section>

      <section aria-labelledby="duplicate-heading" className="rounded-lg border border-border bg-surface p-5">
        <h2 id="duplicate-heading" className="text-sm font-semibold">
          Duplicate names
        </h2>
        <div role="group" aria-label="Visible saves" className="mt-4 flex gap-2">
          <Button variant="ghost" onClick={() => setSaved("first")}>
            Save
          </Button>
          <Button variant="ghost" onClick={() => setSaved("second")}>
            Save
          </Button>
        </div>
        <div hidden>
          <button type="button">Save</button>
        </div>
        {saved ? (
          <p role="status" className="mt-3 text-sm">
            Saved {saved} copy
          </p>
        ) : null}
        <Tradeoff id="duplicate-tradeoff" label="Show duplicate name tradeoff">
          Two visible Save buttons violate strict mode if you click the unscoped locator. A hidden duplicate is ignored by getByRole. Scope to the group, or give each control a unique name.
        </Tradeoff>
      </section>

      <section aria-label="Missing association" className="rounded-lg border border-warning bg-warning-bg p-5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Training defect</h2>
          <Badge tone="warning">Isolated</Badge>
        </div>
        <Banner tone="warning" title="Missing label association">
          The label has no htmlFor, and the input has no matching id. getByLabel cannot see it.
        </Banner>
        <div className="mt-4 space-y-1.5">
          <label className="block text-sm font-medium">Employee name</label>
          <input id="orphan-name" className="w-full max-w-sm rounded-md border border-border bg-bg px-3 py-2 text-sm" />
        </div>
      </section>

      <section aria-label="Mismatched association" className="rounded-lg border border-warning bg-warning-bg p-5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Training defect</h2>
          <Badge tone="warning">Isolated</Badge>
        </div>
        <Banner tone="warning" title="Mismatched for and id">
          htmlFor points at an id that does not exist.
        </Banner>
        <div className="mt-4 space-y-1.5">
          <label htmlFor="missing-target" className="block text-sm font-medium">
            Badge number
          </label>
          <input id="actual-badge" className="w-full max-w-sm rounded-md border border-border bg-bg px-3 py-2 text-sm" />
        </div>
      </section>

      <section aria-label="Duplicate accessible names" className="rounded-lg border border-warning bg-warning-bg p-5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Training defect</h2>
          <Badge tone="warning">Isolated</Badge>
        </div>
        <Banner tone="warning" title="Duplicate accessible names">
          Both buttons are named Edit. An unscoped click is a strict-mode violation.
        </Banner>
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" onClick={() => setEdited(true)}>
            Edit
          </Button>
          <Button variant="ghost" onClick={() => setEdited(true)}>
            Edit
          </Button>
        </div>
        {edited ? (
          <p role="status" className="mt-3 text-sm">
            Edit activated
          </p>
        ) : null}
      </section>
    </div>
  );
}

function Tradeoff({ id, label, children }: { id: string; label: string; children: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      <Button variant="ghost" aria-expanded={open} aria-controls={id} onClick={() => setOpen((value) => !value)}>
        {label}
      </Button>
      {open ? (
        <p id={id} className="mt-2 max-w-2xl text-sm text-muted">
          {children}
        </p>
      ) : null}
    </div>
  );
}
