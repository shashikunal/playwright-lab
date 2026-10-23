import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "warning" | "accent" | "success" | "danger";
}) {
  const styles =
    tone === "warning"
      ? "border-warning bg-warning-bg text-warning"
      : tone === "accent"
      ? "border-accent bg-accent/10 text-accent"
      : tone === "success"
      ? "border-green-500/30 bg-green-500/10 text-green-500"
      : tone === "danger"
      ? "border-red-500/30 bg-red-500/10 text-red-500"
      : "border-border bg-surface text-muted";
  return (
    <span className={`inline-flex rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase ${styles}`}>
      {children}
    </span>
  );
}
