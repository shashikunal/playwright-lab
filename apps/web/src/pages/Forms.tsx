import type { FieldError, IntakeAccepted, IntakeTrack } from "@pil/shared";
import { FormEvent, useState } from "react";
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

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-accent">Forms</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Intake form</h1>
        <p className="mt-3 text-muted">
          Submit calls <span className="font-mono">POST /api/lab/forms/intake</span>. A success message appears only after Express accepts the body.
        </p>
      </div>

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
