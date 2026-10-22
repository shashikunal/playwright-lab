import type { FieldError, IntakeAccepted, IntakeTrack } from "@pil/shared";
import { FormEvent, useState } from "react";
import { Check, ChevronRight, Layers, Loader2 } from "lucide-react";
import { Banner } from "../components/ui/Banner";
import { Button } from "../components/ui/Button";
import { Field, controlClass } from "../components/ui/Field";

type ClientErrors = Partial<Record<keyof FormState | "form", string>>;

type FormState = {
  fullName: string;
  email: string;
  seats: string;
  startDate: string;
  track: "" | IntakeTrack;
  agree: boolean;
};

const emptyForm: FormState = {
  fullName: "",
  email: "",
  seats: "",
  startDate: "",
  track: "",
  agree: false,
};

export function Forms() {
  const [activeTab, setActiveTab] = useState<"intake" | "inputs" | "labels" | "combos" | "wizard">("intake");

  // --- TAB 1: INTAKE FORM STATE (preserves existing e2e test compatibility) ---
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<ClientErrors>({});
  const [pending, setPending] = useState(false);
  const [accepted, setAccepted] = useState<IntakeAccepted | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [catalog, setCatalog] = useState("keyboard");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAccepted(null);
    setServerMessage(null);
    const nextErrors = validateClient(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const seats = Number(form.seats);
    setPending(true);
    try {
      const response = await fetch("/api/lab/forms/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          seats,
          startDate: form.startDate,
          track: form.track,
          agree: form.agree,
        }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const details = readDetails(body);
        if (details.length > 0) {
          const mapped: ClientErrors = {};
          for (const detail of details) mapped[detail.field as keyof FormState] = detail.message;
          setErrors(mapped);
        }
        setServerMessage("Express rejected the intake");
        return;
      }
      setAccepted(body as IntakeAccepted);
    } catch {
      setServerMessage("The API could not be reached");
    } finally {
      setPending(false);
    }
  }

  // --- TAB 2: ALL INPUTS STATE ---
  const [inputShowcase, setInputShowcase] = useState({
    text: "Default Text",
    password: "SecretPassword123!",
    email: "user@industrial.local",
    number: 42,
    date: "2026-10-22",
    search: "Playwright locators",
    range: 75,
    color: "#ea580c",
    checkboxA: true,
    checkboxB: false,
    radioVal: "option-b",
    fileUploadedName: "",
  });

  // --- TAB 3: ACCESSIBLE LABELS & ANTI-PATTERNS STATE ---
  const [compliantVal, setCompliantVal] = useState("Valid label binding");
  const [brokenVal, setBrokenVal] = useState("Broken label binding");
  const [placeholderVal, setPlaceholderVal] = useState("");
  const [ariaLabelVal, setAriaLabelVal] = useState("");

  // --- TAB 4: SELECTS & COMBOBOX STATE ---
  const [singleSelect, setSingleSelect] = useState("firefox");
  const [multiSelect, setMultiSelect] = useState<string[]>(["chromium", "webkit"]);
  const [comboOpen, setComboOpen] = useState(false);
  const [selectedComboOption, setSelectedComboOption] = useState("TypeScript");
  const comboOptions = ["TypeScript", "Python", "Java", "C# (.NET)", "JavaScript"];

  // Autocomplete debounced
  const [autoQuery, setAutoQuery] = useState("");
  const [autoResults, setAutoResults] = useState<string[]>([]);
  const [autoLoading, setAutoLoading] = useState(false);

  function handleAutoChange(val: string) {
    setAutoQuery(val);
    if (!val.trim()) {
      setAutoResults([]);
      return;
    }
    setAutoLoading(true);
    setTimeout(() => {
      const filtered = ["page.getByRole", "page.getByLabel", "page.getByTestId", "page.waitForEvent", "page.route"]
        .filter((item) => item.toLowerCase().includes(val.toLowerCase()));
      setAutoResults(filtered);
      setAutoLoading(false);
    }, 250);
  }

  // --- TAB 5: CONDITIONAL & WIZARD STATE ---
  const [accountType, setAccountType] = useState<"individual" | "corporate">("individual");
  const [companyName, setCompanyName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    username: "qsp_tester",
    tier: "Enterprise",
    newsletter: true,
  });
  const [doubleSubmitPending, setDoubleSubmitPending] = useState(false);
  const [submitSuccessCount, setSubmitSuccessCount] = useState(0);

  function handleDoubleSubmit() {
    if (doubleSubmitPending) return;
    setDoubleSubmitPending(true);
    setTimeout(() => {
      setSubmitSuccessCount((c) => c + 1);
      setDoubleSubmitPending(false);
    }, 800);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Layers className="h-5 w-5 text-accent" />
          <p className="font-mono text-xs uppercase tracking-wider text-accent">Forms Laboratory</p>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Forms, Inputs & Validation</h1>
        <p className="mt-2 text-muted">
          Comprehensive form test arena covering native inputs, accessible labels, custom comboboxes, multi-step wizards, and duplicate-submit prevention.
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "intake"}
          data-testid="tab-intake"
          onClick={() => setActiveTab("intake")}
          className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
            activeTab === "intake" ? "bg-accent text-white" : "border border-border bg-surface hover:bg-surface-elevated"
          }`}
        >
          1. Intake Form
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "inputs"}
          data-testid="tab-inputs"
          onClick={() => setActiveTab("inputs")}
          className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
            activeTab === "inputs" ? "bg-accent text-white" : "border border-border bg-surface hover:bg-surface-elevated"
          }`}
        >
          2. All Inputs & Controls
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "labels"}
          data-testid="tab-labels"
          onClick={() => setActiveTab("labels")}
          className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
            activeTab === "labels" ? "bg-accent text-white" : "border border-border bg-surface hover:bg-surface-elevated"
          }`}
        >
          3. Labels & Accessible Names
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "combos"}
          data-testid="tab-combos"
          onClick={() => setActiveTab("combos")}
          className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
            activeTab === "combos" ? "bg-accent text-white" : "border border-border bg-surface hover:bg-surface-elevated"
          }`}
        >
          4. Selects & Comboboxes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "wizard"}
          data-testid="tab-wizard"
          onClick={() => setActiveTab("wizard")}
          className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
            activeTab === "wizard" ? "bg-accent text-white" : "border border-border bg-surface hover:bg-surface-elevated"
          }`}
        >
          5. Conditional & Wizard
        </button>
      </div>

      {/* TAB 1: INTAKE FORM (Matches e2e/forms.spec.ts requirements) */}
      {activeTab === "intake" && (
        <div className="space-y-6">
          <form onSubmit={onSubmit} noValidate aria-busy={pending} className="space-y-4 rounded-lg border border-border bg-surface p-5">
            <Field id="full-name" label="Full name" error={errors.fullName} hint="2 to 80 characters">
              <input
                id="full-name"
                value={form.fullName}
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? "full-name-error" : "full-name-hint"}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                className={controlClass}
              />
            </Field>
            <Field id="email" label="Email" error={errors.email}>
              <input
                id="email"
                type="email"
                value={form.email}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className={controlClass}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="seats" label="Seats" error={errors.seats} hint="1 to 12">
                <input
                  id="seats"
                  type="number"
                  min={1}
                  max={12}
                  value={form.seats}
                  aria-invalid={Boolean(errors.seats)}
                  aria-describedby={errors.seats ? "seats-error" : "seats-hint"}
                  onChange={(event) => setForm({ ...form, seats: event.target.value })}
                  className={controlClass}
                />
              </Field>
              <Field id="start-date" label="Start date" error={errors.startDate}>
                <input
                  id="start-date"
                  type="date"
                  value={form.startDate}
                  aria-invalid={Boolean(errors.startDate)}
                  aria-describedby={errors.startDate ? "start-date-error" : undefined}
                  onChange={(event) => setForm({ ...form, startDate: event.target.value })}
                  className={controlClass}
                />
              </Field>
            </div>
            <Field id="track" label="Track" error={errors.track}>
              <select
                id="track"
                value={form.track}
                aria-invalid={Boolean(errors.track)}
                aria-describedby={errors.track ? "track-error" : undefined}
                onChange={(event) => setForm({ ...form, track: event.target.value as FormState["track"] })}
                className={controlClass}
              >
                <option value="">Choose a track</option>
                <option value="locators">Locators</option>
                <option value="api">API</option>
                <option value="fixtures">Fixtures</option>
              </select>
            </Field>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.agree}
                  onChange={(event) => setForm({ ...form, agree: event.target.checked })}
                />
                I agree to the lab terms
              </label>
              {errors.agree ? (
                <p role="alert" className="text-sm text-danger">
                  {errors.agree}
                </p>
              ) : null}
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "Submitting" : "Submit intake"}
            </Button>
            {serverMessage ? (
              <p role="alert" className="text-sm text-danger">
                {serverMessage}
              </p>
            ) : null}
            {accepted ? (
              <p role="status" className="text-sm text-success">
                Accepted as {accepted.id}
              </p>
            ) : null}
          </form>

          <section aria-labelledby="catalogue-heading" className="space-y-4 rounded-lg border border-border bg-surface p-5">
            <h2 id="catalogue-heading" className="text-sm font-semibold">
              Client-only catalogue
            </h2>
            <Banner tone="warning" title="These controls do not call Express">
              Use them to practise input roles. They cannot report a server success.
            </Banner>
            <Field id="readonly-note" label="Readonly note">
              <input id="readonly-note" readOnly value="Seeded note" className={controlClass} />
            </Field>
            <Field id="disabled-code" label="Disabled code">
              <input id="disabled-code" disabled value="LAB-LOCKED" className={controlClass} />
            </Field>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Practice focus</legend>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="focus" value="keyboard" checked={catalog === "keyboard"} onChange={() => setCatalog("keyboard")} />
                Keyboard
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="focus" value="api" checked={catalog === "api"} onChange={() => setCatalog("api")} />
                API
              </label>
            </fieldset>
            <p role="status" className="text-sm text-muted">
              Focus set to {catalog}
            </p>
          </section>
        </div>
      )}

      {/* TAB 2: ALL INPUTS SHOWCASE */}
      {activeTab === "inputs" && (
        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-surface p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold">Native Input Types Showcase</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="input-text" className="block text-xs font-medium text-muted">Text Input</label>
                <input
                  id="input-text"
                  type="text"
                  data-testid="input-text"
                  value={inputShowcase.text}
                  onChange={(e) => setInputShowcase({ ...inputShowcase, text: e.target.value })}
                  className={controlClass}
                />
              </div>

              <div>
                <label htmlFor="input-password" className="block text-xs font-medium text-muted">Password Input</label>
                <input
                  id="input-password"
                  type="password"
                  data-testid="input-password"
                  value={inputShowcase.password}
                  onChange={(e) => setInputShowcase({ ...inputShowcase, password: e.target.value })}
                  className={controlClass}
                />
              </div>

              <div>
                <label htmlFor="input-number" className="block text-xs font-medium text-muted">Number Input (min: 0, max: 100)</label>
                <input
                  id="input-number"
                  type="number"
                  min={0}
                  max={100}
                  data-testid="input-number"
                  value={inputShowcase.number}
                  onChange={(e) => setInputShowcase({ ...inputShowcase, number: Number(e.target.value) })}
                  className={controlClass}
                />
              </div>

              <div>
                <label htmlFor="input-date" className="block text-xs font-medium text-muted">Date Input</label>
                <input
                  id="input-date"
                  type="date"
                  data-testid="input-date"
                  value={inputShowcase.date}
                  onChange={(e) => setInputShowcase({ ...inputShowcase, date: e.target.value })}
                  className={controlClass}
                />
              </div>

              <div>
                <label htmlFor="input-search" className="block text-xs font-medium text-muted">Search Input</label>
                <input
                  id="input-search"
                  type="search"
                  data-testid="input-search"
                  value={inputShowcase.search}
                  onChange={(e) => setInputShowcase({ ...inputShowcase, search: e.target.value })}
                  className={controlClass}
                />
              </div>

              <div>
                <label htmlFor="input-range" className="block text-xs font-medium text-muted">
                  Range Slider: <span className="font-mono text-accent" data-testid="range-val">{inputShowcase.range}</span>
                </label>
                <input
                  id="input-range"
                  type="range"
                  min={0}
                  max={100}
                  data-testid="input-range"
                  value={inputShowcase.range}
                  onChange={(e) => setInputShowcase({ ...inputShowcase, range: Number(e.target.value) })}
                  className="w-full accent-accent cursor-pointer mt-2"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <fieldset className="space-y-2">
                <legend className="text-xs font-medium text-muted">Radio Group</legend>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 text-xs">
                    <input
                      type="radio"
                      name="showcase-radio"
                      value="option-a"
                      data-testid="radio-option-a"
                      checked={inputShowcase.radioVal === "option-a"}
                      onChange={() => setInputShowcase({ ...inputShowcase, radioVal: "option-a" })}
                    />
                    <span>Option A</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs">
                    <input
                      type="radio"
                      name="showcase-radio"
                      value="option-b"
                      data-testid="radio-option-b"
                      checked={inputShowcase.radioVal === "option-b"}
                      onChange={() => setInputShowcase({ ...inputShowcase, radioVal: "option-b" })}
                    />
                    <span>Option B</span>
                  </label>
                </div>
              </fieldset>

              <div>
                <label htmlFor="input-file" className="block text-xs font-medium text-muted">File Input</label>
                <input
                  id="input-file"
                  type="file"
                  data-testid="input-file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setInputShowcase({ ...inputShowcase, fileUploadedName: f.name });
                  }}
                  className="mt-1 text-xs text-muted file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-accent file:text-white hover:file:bg-accent/90"
                />
                {inputShowcase.fileUploadedName && (
                  <p className="mt-1 text-xs text-accent font-mono" data-testid="uploaded-file-name">
                    Loaded: {inputShowcase.fileUploadedName}
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: ACCESSIBLE LABELS & ANTI-PATTERNS */}
      {activeTab === "labels" && (
        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-surface p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold">Accessible Names vs. Anti-Patterns</h2>

            {/* Compliant label-for */}
            <div className="p-3 border border-success/30 bg-success/5 rounded-md space-y-1">
              <label htmlFor="compliant-input-id" className="block text-xs font-medium text-success">
                Compliant Label (Explicit htmlFor matching id)
              </label>
              <input
                id="compliant-input-id"
                data-testid="compliant-input"
                value={compliantVal}
                onChange={(e) => setCompliantVal(e.target.value)}
                className={controlClass}
              />
            </div>

            {/* Broken label-for (missing htmlFor) */}
            <div className="p-3 border border-danger/30 bg-danger/5 rounded-md space-y-1">
              <label className="block text-xs font-medium text-danger">
                Broken Label (Missing htmlFor attribute)
              </label>
              <input
                id="detached-input-id"
                data-testid="broken-label-input"
                value={brokenVal}
                onChange={(e) => setBrokenVal(e.target.value)}
                className={controlClass}
              />
            </div>

            {/* Placeholder only accessible name */}
            <div className="p-3 border border-border rounded-md space-y-1">
              <span className="block text-xs font-medium text-muted">Input with Only Placeholder (No Label)</span>
              <input
                placeholder="Search via placeholder name..."
                data-testid="placeholder-only-input"
                value={placeholderVal}
                onChange={(e) => setPlaceholderVal(e.target.value)}
                className={controlClass}
              />
            </div>

            {/* aria-label accessible name */}
            <div className="p-3 border border-border rounded-md space-y-1">
              <span className="block text-xs font-medium text-muted">Input with Direct aria-label</span>
              <input
                aria-label="Direct Accessible Name Input"
                data-testid="aria-label-input"
                value={ariaLabelVal}
                onChange={(e) => setAriaLabelVal(e.target.value)}
                className={controlClass}
              />
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: SELECTS & COMBOBOXES */}
      {activeTab === "combos" && (
        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-surface p-6 shadow-sm space-y-5">
            <h2 className="text-base font-semibold">Native & Custom ARIA Selectors</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Native single select */}
              <div>
                <label htmlFor="native-browser-select" className="block text-xs font-medium text-muted">
                  Native Single Select
                </label>
                <select
                  id="native-browser-select"
                  data-testid="native-single-select"
                  value={singleSelect}
                  onChange={(e) => setSingleSelect(e.target.value)}
                  className={controlClass}
                >
                  <option value="chromium">Chromium</option>
                  <option value="firefox">Firefox</option>
                  <option value="webkit">WebKit</option>
                </select>
                <p className="mt-1 text-xs text-muted" data-testid="single-select-val">
                  Selected: {singleSelect}
                </p>
              </div>

              {/* Native multi select */}
              <div>
                <label htmlFor="native-multi-select" className="block text-xs font-medium text-muted">
                  Native Multiple Select (select multiple)
                </label>
                <select
                  id="native-multi-select"
                  multiple
                  data-testid="native-multi-select"
                  value={multiSelect}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
                    setMultiSelect(selected);
                  }}
                  className={`${controlClass} h-24`}
                >
                  <option value="chromium">Chromium</option>
                  <option value="firefox">Firefox</option>
                  <option value="webkit">WebKit</option>
                </select>
                <p className="mt-1 text-xs text-muted" data-testid="multi-select-val">
                  Selected: {multiSelect.join(", ")}
                </p>
              </div>
            </div>

            {/* Custom ARIA Combobox */}
            <div className="border-t border-border pt-4">
              <label id="combo-label" className="block text-xs font-medium text-muted mb-1">
                Custom ARIA 1.2 Combobox (Language Selection)
              </label>
              <div className="relative">
                <div
                  role="combobox"
                  aria-expanded={comboOpen}
                  aria-haspopup="listbox"
                  aria-labelledby="combo-label"
                  data-testid="custom-combobox"
                  onClick={() => setComboOpen((o) => !o)}
                  className={`${controlClass} cursor-pointer flex justify-between items-center`}
                >
                  <span>{selectedComboOption}</span>
                  <ChevronRight className={`h-4 w-4 transition-transform ${comboOpen ? "rotate-90" : ""}`} />
                </div>

                {comboOpen && (
                  <ul
                    role="listbox"
                    aria-labelledby="combo-label"
                    data-testid="combobox-options-list"
                    className="absolute z-10 mt-1 w-full rounded border border-border bg-surface p-1 shadow-lg"
                  >
                    {comboOptions.map((opt) => (
                      <li
                        key={opt}
                        role="option"
                        aria-selected={selectedComboOption === opt}
                        data-testid={`combo-option-${opt.toLowerCase().replace(/[^a-z]/g, "")}`}
                        onClick={() => {
                          setSelectedComboOption(opt);
                          setComboOpen(false);
                        }}
                        className="flex items-center justify-between px-3 py-1.5 text-xs rounded hover:bg-surface-elevated cursor-pointer"
                      >
                        <span>{opt}</span>
                        {selectedComboOption === opt && <Check className="h-3.5 w-3.5 text-accent" />}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Debounced Autocomplete */}
            <div className="border-t border-border pt-4">
              <label htmlFor="autocomplete-input" className="block text-xs font-medium text-muted mb-1">
                Debounced Autocomplete Search (Playwright APIs)
              </label>
              <input
                id="autocomplete-input"
                data-testid="autocomplete-input"
                value={autoQuery}
                onChange={(e) => handleAutoChange(e.target.value)}
                placeholder="Type 'page.' or 'get'..."
                className={controlClass}
              />
              {autoLoading && <p className="mt-1 text-xs text-muted" data-testid="auto-loading">Searching...</p>}
              {autoResults.length > 0 && (
                <ul className="mt-1 rounded border border-border bg-background p-2 text-xs space-y-1 font-mono" data-testid="auto-results">
                  {autoResults.map((res) => (
                    <li key={res} className="p-1 hover:bg-accent/10 rounded cursor-pointer" onClick={() => setAutoQuery(res)}>
                      {res}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      )}

      {/* TAB 5: CONDITIONAL & WIZARD */}
      {activeTab === "wizard" && (
        <div className="space-y-6">
          {/* Conditional Fields Section */}
          <section className="rounded-lg border border-border bg-surface p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold">Conditional Field Section</h2>
            <div className="space-y-3">
              <span className="text-xs font-medium text-muted">Select Account Type:</span>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2 text-xs">
                  <input
                    type="radio"
                    name="account-type"
                    value="individual"
                    data-testid="account-individual-radio"
                    checked={accountType === "individual"}
                    onChange={() => setAccountType("individual")}
                  />
                  <span>Individual</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input
                    type="radio"
                    name="account-type"
                    value="corporate"
                    data-testid="account-corporate-radio"
                    checked={accountType === "corporate"}
                    onChange={() => setAccountType("corporate")}
                  />
                  <span>Corporate Account</span>
                </label>
              </div>

              {/* Conditional corporate fields */}
              {accountType === "corporate" && (
                <div data-testid="corporate-fields-panel" className="mt-3 p-3 rounded border border-accent/30 bg-accent/5 space-y-3 animate-fadeIn">
                  <div>
                    <label htmlFor="company-name-input" className="block text-xs font-medium text-accent">Company Name</label>
                    <input
                      id="company-name-input"
                      data-testid="company-name-input"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className={controlClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="tax-id-input" className="block text-xs font-medium text-accent">VAT / Tax ID</label>
                    <input
                      id="tax-id-input"
                      data-testid="tax-id-input"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className={controlClass}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Multi-step wizard */}
          <section className="rounded-lg border border-border bg-surface p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Multi-Step Form Wizard</h2>
              <span className="font-mono text-xs text-accent" data-testid="wizard-step-indicator">
                Step {wizardStep} of 3
              </span>
            </div>

            {wizardStep === 1 && (
              <div className="space-y-3" data-testid="wizard-step-1">
                <label htmlFor="wizard-username" className="block text-xs font-medium text-muted">Username</label>
                <input
                  id="wizard-username"
                  data-testid="wizard-username-input"
                  value={wizardData.username}
                  onChange={(e) => setWizardData({ ...wizardData, username: e.target.value })}
                  className={controlClass}
                />
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-3" data-testid="wizard-step-2">
                <label htmlFor="wizard-tier" className="block text-xs font-medium text-muted">Subscription Tier</label>
                <select
                  id="wizard-tier"
                  data-testid="wizard-tier-select"
                  value={wizardData.tier}
                  onChange={(e) => setWizardData({ ...wizardData, tier: e.target.value })}
                  className={controlClass}
                >
                  <option value="Community">Community</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-3" data-testid="wizard-step-3">
                <div className="rounded bg-background p-3 font-mono text-xs space-y-1">
                  <div>User: <span data-testid="review-user">{wizardData.username}</span></div>
                  <div>Tier: <span data-testid="review-tier">{wizardData.tier}</span></div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                data-testid="wizard-back-btn"
                disabled={wizardStep === 1}
                onClick={() => setWizardStep((s) => s - 1)}
              >
                Back
              </Button>
              {wizardStep < 3 ? (
                <Button
                  data-testid="wizard-next-btn"
                  onClick={() => setWizardStep((s) => s + 1)}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  data-testid="wizard-finish-btn"
                  onClick={() => alert("Wizard completed successfully!")}
                >
                  Finish Wizard
                </Button>
              )}
            </div>
          </section>

          {/* Double-Submit Prevention */}
          <section className="rounded-lg border border-border bg-surface p-6 shadow-sm space-y-3">
            <h2 className="text-base font-semibold">Duplicate-Submit Protection</h2>
            <p className="text-xs text-muted">
              Button disables immediately on click and stays disabled while in flight, ignoring duplicate clicks.
            </p>
            <div className="flex items-center space-x-4">
              <Button
                data-testid="double-submit-btn"
                disabled={doubleSubmitPending}
                aria-busy={doubleSubmitPending}
                onClick={handleDoubleSubmit}
              >
                {doubleSubmitPending ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Submit With Protection"
                )}
              </Button>
              <span className="font-mono text-xs text-muted" data-testid="submit-success-count">
                Successful Submissions: {submitSuccessCount}
              </span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function validateClient(form: FormState): ClientErrors {
  const errors: ClientErrors = {};
  const fullName = form.fullName.trim();
  if (fullName.length < 2 || fullName.length > 80 || /[<>]/.test(fullName)) {
    errors.fullName = "Enter 2 to 80 characters without HTML";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address";
  }
  const seats = Number(form.seats);
  if (!Number.isInteger(seats) || seats < 1 || seats > 12) {
    errors.seats = "Seats must be an integer from 1 to 12";
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.startDate)) {
    errors.startDate = "Enter a real date as YYYY-MM-DD";
  }
  if (!form.track) errors.track = "Choose a track";
  if (!form.agree) errors.agree = "Agree to the lab terms";
  return errors;
}

function readDetails(body: unknown): FieldError[] {
  if (!body || typeof body !== "object" || !("error" in body)) return [];
  const error = (body as { error?: { details?: unknown } }).error;
  if (!error || !Array.isArray(error.details)) return [];
  return error.details.filter(
    (item): item is FieldError =>
      Boolean(item) && typeof item === "object" && "field" in item && "message" in item,
  );
}
