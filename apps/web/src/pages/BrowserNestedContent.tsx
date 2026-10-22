import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function BrowserNestedContent() {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="rounded border border-dashed border-accent/50 bg-accent/5 p-4 text-xs font-mono">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-accent" data-testid="nested-title">
          Inner Nested Frame
        </span>
        <span
          className="rounded bg-accent/20 px-2 py-0.5 text-accent"
          data-testid="nested-status"
        >
          {clicked ? "Inner Action Triggered" : "Inner Frame Ready"}
        </span>
      </div>
      <p className="mt-2 text-muted">
        Located inside: outer frame &rarr; inner frame. Pierce using chained <span className="font-semibold text-foreground">frameLocator()</span>.
      </p>
      <button
        type="button"
        data-testid="nested-action-btn"
        onClick={() => setClicked(true)}
        className="mt-3 flex items-center rounded bg-accent px-3 py-1 text-white hover:bg-accent/90"
      >
        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
        Trigger Nested Action
      </button>
    </div>
  );
}
