import { Check, Copy, Sliders, Table, Terminal, ToggleLeft } from "lucide-react";
import { useState } from "react";
import type { ConfigPlayground } from "../../data/learningPath/types";

type ConfigPlaygroundSectionProps = {
  playground: ConfigPlayground;
};

export function ConfigPlaygroundSection({ playground }: ConfigPlaygroundSectionProps) {
  const [activeTab, setActiveTab] = useState<"code" | "properties" | "comparison">("code");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(playground.configExample);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setCopiedCode(false);
    }
  };

  const handleCopyCmd = async () => {
    try {
      await navigator.clipboard.writeText(playground.localCommand);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    } catch {
      setCopiedCmd(false);
    }
  };

  const isLocatorLesson = playground.title.includes("Locator");
  const isAssertionLesson = playground.title.includes("Assertion") || playground.title.includes("Waiting");
  const isActionLesson = playground.title.includes("Action") || playground.title.includes("Interaction");
  const isFormLesson = playground.title.includes("Form") || playground.title.includes("Validation");
  const isContextLesson = playground.title.includes("Context") || playground.title.includes("Navigation") || playground.title.includes("Multi-Page");
  const isNetworkLesson = playground.title.includes("Network") || playground.title.includes("Interception") || playground.title.includes("Mocking");
  const isApiLesson = !isNetworkLesson && (playground.title.includes("API") || playground.title.includes("HTTP"));
  const isFixturesLesson = playground.title.includes("Fixture") || playground.title.includes("Hook");
  const isPomLesson = playground.title.includes("Page Object") || playground.title.includes("POM");

  return (
    <section id="config-playground" className="mt-12 scroll-mt-20" data-testid="config-playground-section">
      <div className="flex items-center gap-2 text-accent">
        <Sliders size={20} />
        <h2 className="text-xl font-bold tracking-tight text-text">
          {playground.title}
        </h2>
      </div>
      <p className="mt-1 text-sm text-muted">
        Inspect production-grade configuration architecture, property impact matrices, and default vs customized runtime behaviors.
      </p>

      {/* Interactive Tabs */}
      <div className="mt-5 rounded-lg border border-border bg-surface overflow-hidden shadow-xs">
        <div className="flex border-b border-border bg-surface-muted/50 p-1.5 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            data-testid="playground-tab-code"
            className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${activeTab === "code"
                ? "bg-surface text-accent shadow-xs border border-border"
                : "text-muted hover:text-text hover:bg-surface/50"
              }`}
          >
            <Terminal size={14} />
            <span>
              {isPomLesson
                ? "POM & Component Architecture Blueprint"
                : isFixturesLesson
                  ? "Fixtures & Architecture Blueprint"
                  : isNetworkLesson
                    ? "Network Mocking Blueprint"
                    : isApiLesson
                      ? "API Automation Blueprint"
                      : isContextLesson
                        ? "Contexts & Navigation Blueprint"
                        : isFormLesson
                          ? "Forms & Validation Blueprint"
                          : isActionLesson
                            ? "Browser Actions Blueprint"
                            : isAssertionLesson
                              ? "Assertions Pipeline Blueprint"
                              : isLocatorLesson
                                ? "Locator Tiering Blueprint"
                                : "Complete playwright.config.ts Blueprint"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("properties")}
            data-testid="playground-tab-properties"
            className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${activeTab === "properties"
                ? "bg-surface text-accent shadow-xs border border-border"
                : "text-muted hover:text-text hover:bg-surface/50"
              }`}
          >
            <Table size={14} />
            <span>
              {isPomLesson
                ? `POM Architecture & Design Options (${playground.properties.length})`
                : isFixturesLesson
                  ? `Fixtures & Hooks Architecture (${playground.properties.length})`
                  : isNetworkLesson
                    ? `Routing Primitives & Options (${playground.properties.length})`
                    : isApiLesson
                      ? `APIRequestContext Methods & Options (${playground.properties.length})`
                      : isContextLesson
                        ? `Contexts & Navigation Architecture (${playground.properties.length})`
                        : isFormLesson
                          ? `Form Controls & Validation Strategies (${playground.properties.length})`
                          : isActionLesson
                            ? `Action Options & Parameters Matrix (${playground.properties.length})`
                            : isAssertionLesson
                              ? `Web-First Assertions Matrix (${playground.properties.length})`
                              : isLocatorLesson
                                ? `Locator Strategy Reference (${playground.properties.length})`
                                : `Property Architecture (${playground.properties.length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("comparison")}
            data-testid="playground-tab-comparison"
            className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${activeTab === "comparison"
                ? "bg-surface text-accent shadow-xs border border-border"
                : "text-muted hover:text-text hover:bg-surface/50"
              }`}
          >
            <ToggleLeft size={14} />
            <span>
              {isPomLesson
                ? "POM vs Direct Locators vs Screenplay"
                : isFixturesLesson
                  ? "Fixtures vs Hooks & Global State"
                  : isNetworkLesson
                    ? "Network Mocking vs Real Backend"
                    : isApiLesson
                      ? "API Testing vs Brittle Anti-Patterns"
                      : isContextLesson
                        ? "Multi-Context & Navigation vs Brittle Anti-Patterns"
                        : isFormLesson
                          ? "Robust Form Testing vs Brittle Anti-Patterns"
                          : isActionLesson
                            ? "User-Facing vs Synthetic Interaction"
                            : isAssertionLesson
                              ? "Retrying vs Non-Retrying Patterns"
                              : isLocatorLesson
                                ? "Semantic vs Brittle Comparison"
                                : "Default vs Custom Behavior"}
            </span>
          </button>
        </div>

        {/* Tab 1: Configuration Code */}
        {activeTab === "code" && (
          <div className="p-4 bg-black/40">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/50">
              <span className="font-mono text-xs text-muted">
                {isActionLesson
                  ? "production-actions.spec.ts"
                  : isAssertionLesson
                    ? "production-assertions.spec.ts"
                    : isLocatorLesson
                      ? "production-locators.spec.ts"
                      : "Production playwright.config.ts"}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                data-testid="copy-playground-config-btn"
                className="inline-flex items-center gap-1.5 rounded border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted hover:text-accent cursor-pointer"
              >
                {copiedCode ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                <span>{copiedCode ? "Copied!" : "Copy Configuration"}</span>
              </button>
            </div>
            <pre
              className="overflow-x-auto font-mono text-xs text-stone-200 leading-relaxed p-2"
              data-testid="playground-code-content"
            >
              {playground.configExample}
            </pre>
          </div>
        )}

        {/* Tab 2: Property Architecture Table */}
        {activeTab === "properties" && (
          <div className="overflow-x-auto p-4" data-testid="playground-properties-content">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted uppercase font-mono tracking-wider">
                  <th className="pb-3 font-semibold">Property</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Default</th>
                  <th className="pb-3 font-semibold">Purpose</th>
                  <th className="pb-3 font-semibold">Architectural Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {playground.properties.map((prop, idx) => (
                  <tr key={idx} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="py-2.5 pr-3 font-mono font-bold text-accent">{prop.name}</td>
                    <td className="py-2.5 pr-3 font-mono text-muted">{prop.type}</td>
                    <td className="py-2.5 pr-3 font-mono text-stone-400">{prop.defaultValue}</td>
                    <td className="py-2.5 pr-3 text-text">{prop.description}</td>
                    <td className="py-2.5 text-muted leading-relaxed">{prop.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Behavior Comparison */}
        {activeTab === "comparison" && (
          <div className="p-4 space-y-3" data-testid="playground-comparison-content">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="text-xs font-bold uppercase tracking-wider text-muted px-3">
                Default Playwright Behavior
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-accent px-3">
                Customized Industrial Setting
              </div>
            </div>

            {playground.behaviorComparison.map((comp, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-lg border border-border bg-surface-muted/30 p-3.5 text-xs"
              >
                <div className="space-y-1">
                  <span className="font-semibold text-text">{comp.aspect}</span>
                  <p className="text-muted leading-relaxed">{comp.defaultBehavior}</p>
                </div>
                <div className="space-y-1 border-t border-border pt-2 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-3">
                  <span className="font-semibold text-accent">{comp.aspect} (Optimized)</span>
                  <p className="text-text leading-relaxed">{comp.customizedBehavior}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Practice Task & CLI Command */}
      <div className="mt-5 rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-accent" />
          <h4 className="text-sm font-semibold text-text">Playground Practice Challenge</h4>
        </div>
        <p className="text-xs text-muted leading-relaxed">{playground.practiceTask}</p>

        <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-black/60 p-2.5 text-xs font-mono text-stone-300">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-accent select-none">$</span>
            <span className="whitespace-nowrap">{playground.localCommand}</span>
          </div>
          <button
            type="button"
            onClick={handleCopyCmd}
            data-testid="copy-playground-cmd-btn"
            className="shrink-0 rounded border border-border bg-surface px-2 py-1 text-[11px] text-muted hover:text-accent cursor-pointer"
          >
            {copiedCmd ? "Copied!" : "Copy Command"}
          </button>
        </div>
        <p className="text-[11px] text-muted italic">
          Run this command in your local terminal. Local execution ensures authentic Node.js process and browser execution without simulated approximations.
        </p>
      </div>
    </section>
  );
}
