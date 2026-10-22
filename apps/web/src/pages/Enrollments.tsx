import type { Course, Enrollment, EnrollmentStatus } from "@pil/shared";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ClipboardCheck, GraduationCap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export function Enrollments() {
  const { user, role } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedCourseId = searchParams.get("courseId");

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCourseId, setSelectedCourseId] = useState(preselectedCourseId || "");
  const [seats, setSeats] = useState(1);
  const [participantName, setParticipantName] = useState(user?.name || "");
  const [participantEmail, setParticipantEmail] = useState(user?.email || "");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const fetchCourses = useCallback(() => {
    fetch("/api/app/courses")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses || []);
        if (data.courses && data.courses.length > 0) {
          setSelectedCourseId((prev) => prev || preselectedCourseId || data.courses[0].id);
        }
      })
      .catch(() => {});
  }, [preselectedCourseId]);

  const fetchEnrollments = useCallback(() => {
    setLoading(true);
    const token = localStorage.getItem("pil-auth-token");
    fetch("/api/app/enrollments", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        setEnrollments(data.enrollments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
  }, [fetchCourses, fetchEnrollments]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const activeCourse = selectedCourse || courses[0];
  const totalPrice = activeCourse ? activeCourse.price * seats : 0;

  const handleSubmitEnrollment = async () => {
    if (!activeCourse) return;
    setSubmitting(true);

    const token = localStorage.getItem("pil-auth-token");
    try {
      const res = await fetch("/api/app/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          courseId: activeCourse.id,
          seats,
          userEmail: participantEmail || user?.email || "learner@pil.local",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setConfirmedId(data.enrollment.id);
        fetchEnrollments();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: EnrollmentStatus) => {
    const token = localStorage.getItem("pil-auth-token");
    const res = await fetch(`/api/app/enrollments/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      fetchEnrollments();
    }
  };

  const canManageStatus = role === "trainer" || role === "admin";

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      {/* Header */}
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-accent">Enterprise Academy</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text">Course Enrollments & Orders</h1>
        <p className="mt-1 text-sm text-muted">
          Multi-step enrollment flow with seat calculation, terms confirmation, and status transition workflows.
        </p>
      </div>

      {/* Multi-step Enrollment Wizard */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs" data-testid="enrollment-wizard">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <GraduationCap className="size-5 text-accent" />
          <h2 className="text-xl font-semibold">Enrollment Checkout Wizard</h2>
        </div>

        {/* Step Indicators */}
        <div className="mt-6 flex items-center justify-between border-b border-border pb-6">
          {[
            { num: 1, label: "Select Course & Seats" },
            { num: 2, label: "Participant Details" },
            { num: 3, label: "Review & Confirm" },
          ].map((item) => (
            <div key={item.num} className="flex items-center gap-2">
              <span
                className={`grid size-7 place-items-center rounded-full text-xs font-semibold ${
                  step === item.num
                    ? "bg-accent text-accent-fg"
                    : step > item.num
                    ? "bg-success text-white"
                    : "bg-surface-muted text-muted border border-border"
                }`}
              >
                {step > item.num ? <Check size={14} /> : item.num}
              </span>
              <span className={`text-xs font-medium ${step === item.num ? "text-text" : "text-muted"}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {confirmedId ? (
          <div className="py-8 text-center space-y-3" data-testid="enrollment-success">
            <CheckCircle2 className="mx-auto size-12 text-success" />
            <h3 className="text-xl font-semibold text-text">Enrollment Successfully Placed!</h3>
            <p className="text-sm text-muted">
              Confirmation Reference: <span id="enrollment-confirmation" className="font-mono font-bold text-accent">{confirmedId}</span>
            </p>
            <p className="text-xs text-muted">Your enrollment is now in Pending status awaiting administrative approval.</p>
            <Button
              onClick={() => {
                setConfirmedId(null);
                setStep(1);
              }}
            >
              Start Another Enrollment
            </Button>
          </div>
        ) : (
          <div className="mt-6">
            {/* Step 1: Select Course & Seats */}
            {step === 1 ? (
              <div className="space-y-4 max-w-md">
                <div>
                  <label htmlFor="course-select" className="block text-xs font-medium text-muted">
                    Choose Course
                  </label>
                  <select
                    id="course-select"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.title} (${c.price})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="seats" className="block text-xs font-medium text-muted">
                    Number of Seats (1-10)
                  </label>
                  <input
                    id="seats"
                    type="number"
                    min="1"
                    max="10"
                    value={seats}
                    onChange={(e) => setSeats(Math.max(1, Number(e.target.value)))}
                    className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <Button onClick={() => setStep(2)}>
                    Next Step <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Step 2: Participant Info */}
            {step === 2 ? (
              <div className="space-y-4 max-w-md">
                <div>
                  <label htmlFor="participant-name" className="block text-xs font-medium text-muted">
                    Participant / Contact Name
                  </label>
                  <input
                    id="participant-name"
                    type="text"
                    required
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="Full Name"
                    className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
                  />
                </div>
                <div>
                  <label htmlFor="participant-email" className="block text-xs font-medium text-muted">
                    Participant Email
                  </label>
                  <input
                    id="participant-email"
                    type="email"
                    required
                    value={participantEmail}
                    onChange={(e) => setParticipantEmail(e.target.value)}
                    placeholder="learner@company.com"
                    className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
                  />
                </div>
                <div className="pt-4 flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    <ArrowLeft size={16} /> Back
                  </Button>
                  <Button onClick={() => setStep(3)}>
                    Review Order <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Step 3: Review & Submit */}
            {step === 3 ? (
              <div className="space-y-6 max-w-lg">
                <div className="rounded-md border border-border bg-surface-muted p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Selected Course:</span>
                    <span className="font-semibold text-text">{activeCourse?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Seats:</span>
                    <span className="text-text">{seats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Participant:</span>
                    <span className="text-text">{participantEmail}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span className="font-mono text-base text-accent">${totalPrice}</span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="size-4 rounded accent-accent"
                    />
                    <span>I agree to the enterprise enrollment terms and attendance policies</span>
                  </label>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(2)}>
                    <ArrowLeft size={16} /> Back
                  </Button>
                  <Button disabled={!agreeTerms || submitting} onClick={handleSubmitEnrollment}>
                    <ClipboardCheck size={16} />
                    {submitting ? "Submitting Order..." : "Confirm & Submit Enrollment"}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>

      {/* Enrollments History Table */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-xs">
        <h2 className="text-xl font-semibold">Enrollment Records & Status History</h2>
        <p className="mt-1 text-xs text-muted">
          Track enrolled courses and execute administrative workflow transitions (<code className="font-mono">Approved</code>, <code className="font-mono">Rejected</code>, <code className="font-mono">Cancelled</code>).
        </p>

        <div className="mt-6 overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-sm" data-testid="enrollments-table">
            <thead className="bg-surface-muted font-mono text-xs text-muted">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Seats</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                {canManageStatus ? <th className="px-4 py-3 text-right">Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-xs text-muted">
                    Loading records...
                  </td>
                </tr>
              ) : enrollments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-xs text-muted">
                    No enrollment records found.
                  </td>
                </tr>
              ) : (
                enrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-surface-muted/50 transition-colors" data-testid={`enrollment-row-${enr.id}`}>
                    <td className="px-4 py-3 font-mono text-xs font-medium text-accent">{enr.id}</td>
                    <td className="px-4 py-3 font-medium text-text">{enr.courseTitle}</td>
                    <td className="px-4 py-3 text-xs text-muted">{enr.userEmail}</td>
                    <td className="px-4 py-3 text-xs">{enr.seats}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-text">${enr.totalAmount}</td>
                    <td className="px-4 py-3">
                      <Badge tone={enr.status === "Approved" ? "neutral" : enr.status === "Pending" ? "warning" : "neutral"}>
                        {enr.status}
                      </Badge>
                    </td>
                    {canManageStatus ? (
                      <td className="px-4 py-3 text-right">
                        {enr.status === "Pending" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(enr.id, "Approved")}
                              className="rounded px-2 py-1 text-xs font-medium bg-success text-white hover:opacity-90"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(enr.id, "Rejected")}
                              className="rounded px-2 py-1 text-xs font-medium border border-border text-muted hover:text-danger"
                            >
                              Reject
                            </button>
                          </div>
                        ) : null}
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
