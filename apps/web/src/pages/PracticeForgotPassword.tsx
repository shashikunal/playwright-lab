import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function PracticeForgotPassword() {
  const [identity, setIdentity] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Simulated confirmation state
  const [simulatedToken, setSimulatedToken] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);

  // Step 2: Set New Password state
  const [isResetting, setIsResetting] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetComplete, setResetComplete] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    setServerError(null);

    if (!identity.trim()) {
      setClientError("Please provide your username or registered email.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/practice/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail: identity }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error?.message || data.message || "Failed to process password reset request.");
        return;
      }

      setSimulatedToken(data.simulatedResetToken);
      setMaskedEmail(data.emailMasked);
    } catch {
      setServerError("Network error communicating with authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (!newPassword || !confirmPassword) {
      setResetError("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setResetError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/practice/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: simulatedToken,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResetError(data.error?.message || data.message || "Failed to reset password.");
        return;
      }

      setResetComplete(true);
    } catch {
      setResetError("Network error completing password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-8" data-testid="practice-forgot-portal">
      {/* Header */}
      <div className="text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-accent text-accent-fg shadow-xs">
          <KeyRound size={24} />
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-text">Practice Password Reset</h1>
        <p className="mt-1 text-sm text-muted">
          Practise automating password recovery: request validation, known vs unknown account feedback, and simulated token confirmation.
        </p>
      </div>

      {/* Main Container */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-6">
        {resetComplete ? (
          /* Reset Complete Success Banner */
          <div className="space-y-4" data-testid="password-updated-container">
            <div
              role="status"
              data-testid="password-updated-banner"
              className="flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-xs font-medium text-green-500"
            >
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Password Updated Successfully!</p>
                <p className="mt-1 text-muted text-[11px]">
                  Your practice password has been updated in server memory. You can now authenticate with your new credentials.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/practice/login" data-testid="back-to-login-link">
                <Button variant="primary" className="w-full">
                  Return to Practice Login
                </Button>
              </Link>
            </div>
          </div>
        ) : isResetting ? (
          /* Step 2: Set New Password Form */
          <form onSubmit={handleCompleteReset} className="space-y-4" data-testid="set-new-password-form">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-semibold text-text">Choose New Practice Password</h2>
              <p className="text-xs text-muted">Simulated Token: <code className="font-mono text-accent">{simulatedToken}</code></p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="new-password" className="block text-sm font-medium text-text">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                data-testid="new-password-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-text">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                data-testid="confirm-password-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {resetError ? (
              <div
                role="alert"
                data-testid="reset-error"
                className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500"
              >
                <AlertCircle size={16} />
                <span>{resetError}</span>
              </div>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              data-testid="submit-new-password-btn"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Updating..." : "Update Practice Password"}
            </Button>
          </form>
        ) : simulatedToken ? (
          /* Step 1 Confirmed: Simulated Email Banner */
          <div className="space-y-5" data-testid="simulated-confirmation-container">
            <div
              role="status"
              data-testid="reset-success-banner"
              className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-xs text-green-500 space-y-2"
            >
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 size={18} />
                <span>Simulated Reset Email Dispatched!</span>
              </div>
              <p className="text-muted text-[11px]">
                A simulated password reset token was generated for <span className="font-mono text-text">{maskedEmail}</span>.
              </p>
              <p className="font-mono text-accent text-[11px] bg-bg/50 p-2 rounded border border-border">
                Simulated Token: {simulatedToken}
              </p>
              <p className="text-[10px] text-muted italic">
                Notice: In this testing lab, no real emails are transmitted. The token is stored in local server memory.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="primary"
                data-testid="proceed-reset-btn"
                onClick={() => setIsResetting(true)}
                className="flex-1"
              >
                Proceed to Reset Password
              </Button>
              <Link to="/practice/login" data-testid="cancel-link" className="flex-1">
                <Button variant="secondary" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Step 1 Form: Request Reset Link */
          <form onSubmit={handleRequestReset} className="space-y-4" data-testid="forgot-password-form">
            <div className="space-y-1.5">
              <label htmlFor="reset-identity" className="block text-sm font-medium text-text">
                Username or Registered Email
              </label>
              <input
                id="reset-identity"
                type="text"
                data-testid="reset-identity-input"
                value={identity}
                onChange={(e) => {
                  setIdentity(e.target.value);
                  setClientError(null);
                  setServerError(null);
                }}
                placeholder="e.g. student or student@practice.local"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {/* Client Error */}
            {clientError ? (
              <div
                role="alert"
                data-testid="client-error"
                className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500"
              >
                <AlertCircle size={16} />
                <span>{clientError}</span>
              </div>
            ) : null}

            {/* Server Error */}
            {serverError ? (
              <div
                role="alert"
                data-testid="user-not-found-alert"
                className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500"
              >
                <AlertCircle size={16} />
                <span>{serverError}</span>
              </div>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              data-testid="send-reset-btn"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Simulating Dispatch..." : "Send Practice Reset Link"}
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/practice/login"
                data-testid="cancel-link"
                className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"
              >
                <ArrowLeft size={14} />
                Cancel and return to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
