import { Check, Copy, Terminal } from "lucide-react";
import { useState } from "react";
import type { CodeExample } from "../../data/learningPath/types";

type CodeBlockProps = {
  example: CodeExample;
};

export function CodeBlock({ example }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(example.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const lines = example.code.split("\n");

  return (
    <div className="rounded-lg border border-border bg-surface-muted/60 overflow-hidden shadow-xs my-5">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-accent" />
          <span className="text-xs font-semibold text-text">{example.caption}</span>
          <span className="rounded bg-surface-muted border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted">
            {example.language}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied to clipboard" : "Copy code snippet"}
          className="inline-flex items-center gap-1.5 rounded border border-border bg-surface px-2 py-1 text-xs font-medium text-muted hover:text-accent hover:border-accent transition-colors"
        >
          {copied ? (
            <>
              <Check size={13} className="text-success" />
              <span className="text-success text-[11px]">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <div className="p-4 overflow-x-auto font-mono text-xs leading-relaxed bg-black/40 text-stone-200">
        <pre className="grid">
          {lines.map((line, idx) => (
            <div key={idx} className="table-row">
              <span className="table-cell pr-4 text-right select-none text-stone-600 font-mono text-[11px] w-8">
                {idx + 1}
              </span>
              <span className="table-cell whitespace-pre">{line}</span>
            </div>
          ))}
        </pre>
      </div>

      {/* Line-by-Line Breakdown Annotations (if present) */}
      {example.lineExplanations && example.lineExplanations.length > 0 && (
        <div className="border-t border-border bg-surface p-3.5 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Line-by-Line Architecture Breakdown
          </p>
          <ul className="space-y-1.5 text-xs">
            {example.lineExplanations.map((item) => (
              <li key={item.line} className="flex items-start gap-2">
                <span className="shrink-0 font-mono text-[10px] bg-accent/15 text-accent px-1.5 py-0.5 rounded font-bold">
                  Line {item.line}
                </span>
                <span className="text-muted leading-tight">{item.explanation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
