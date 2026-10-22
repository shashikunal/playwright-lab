import type { ReactNode } from "react";

const tones = {
  warning: "border-warning bg-warning-bg text-text",
  success: "border-success bg-success-bg text-text",
  danger: "border-danger bg-danger-bg text-text",
};

export function Banner({
  tone,
  title,
  children,
}: {
  tone: keyof typeof tones;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${tones[tone]}`}>
      <p className="font-medium">{title}</p>
      {children ? <div className="mt-1 text-muted">{children}</div> : null}
    </div>
  );
}
