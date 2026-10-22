import { useState } from "react";
import { Layers, Plus } from "lucide-react";
import { Button } from "../components/ui/Button";

export function BrowserFrameContent() {
  const [count, setCount] = useState(0);
  const [note, setNote] = useState("");

  return (
    <div className="min-h-screen bg-surface p-4 text-foreground font-sans text-sm">
      <div className="flex items-center space-x-2 border-b border-border pb-3">
        <Layers className="h-4 w-4 text-accent" />
        <h2 className="font-semibold text-base" data-testid="frame-heading">
          Embedded Iframe Document
        </h2>
      </div>

      <div className="mt-4 space-y-4">
        <div className="flex items-center space-x-3">
          <Button
            data-testid="frame-increment-btn"
            onClick={() => setCount((c) => c + 1)}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Increment Frame Counter
          </Button>
          <span className="font-mono text-xs" data-testid="frame-counter-val">
            Count: {count}
          </span>
        </div>

        <div>
          <label htmlFor="frame-note-input" className="block text-xs font-medium text-muted">
            Frame Note Input
          </label>
          <input
            id="frame-note-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type inside iframe..."
            className="mt-1 w-full rounded border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
          />
        </div>

        {/* Nested iframe embedded inside outer iframe */}
        <div className="pt-2">
          <p className="mb-2 text-xs font-semibold text-muted">Nested Child Frame:</p>
          <iframe
            src="/lab/browser/nested-frame"
            title="Nested Inner Frame"
            className="w-full rounded border border-border bg-background"
            style={{ height: "140px" }}
          />
        </div>
      </div>
    </div>
  );
}
