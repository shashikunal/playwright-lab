import { useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { Button } from "../components/ui/Button";

export function BrowserPopupContent() {
  const [closed, setClosed] = useState(false);

  function handleClose() {
    setClosed(true);
    window.close();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-6 text-foreground">
      <div className="max-w-md rounded-xl border border-border bg-background p-6 shadow-xl text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
          <ExternalLink className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-semibold tracking-tight" data-testid="popup-title">
          Popup Inspection Target
        </h1>
        <p className="mt-2 text-sm text-muted">
          This window was spawned by a Playwright <span className="font-mono">window.open()</span> call. Test it with <span className="font-mono">page.waitForEvent('popup')</span>.
        </p>
        <div className="mt-6">
          <Button
            variant="ghost"
            data-testid="popup-close-btn"
            onClick={handleClose}
            className="w-full justify-center"
          >
            <X className="mr-2 h-4 w-4" />
            Close Window
          </Button>
        </div>
        {closed && (
          <p className="mt-3 text-xs text-muted" data-testid="popup-closing-status">
            Window close triggered...
          </p>
        )}
      </div>
    </div>
  );
}
