import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="mx-auto max-w-xl">
      <p className="font-mono text-xs uppercase tracking-wider text-accent">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 text-muted">That route is not part of this lab.</p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-fg"
      >
        Back to overview
      </Link>
    </div>
  );
}
