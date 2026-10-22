import type { ReactNode } from "react";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "warning" }) {
  const styles =
    tone === "warning"
      ? "border-warning bg-warning-bg text-warning"
      : "border-border bg-surface text-muted";
  return (
    <span className={`inline-flex rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase ${styles}`}>
      {children}
    </span>
  );
}
