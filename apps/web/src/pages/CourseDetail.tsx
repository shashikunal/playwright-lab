import type { CourseDetail as CourseDetailType, CourseModule } from "@pil/shared";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  GraduationCap,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/app/courses/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("Course not found");
          throw new Error("Failed to load course details");
        }
        return res.json();
      })
      .then((data: { course: CourseDetailType }) => {
        setCourse(data.course);
        // Expand first module by default
        if (data.course?.syllabus && data.course.syllabus.length > 0) {
          setExpandedModules([data.course.syllabus[0].id]);
        }
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) =>
      prev.includes(modId) ? prev.filter((item) => item !== modId) : [...prev, modId],
    );
  };

  if (loading) {
    return (
      <main id="main" className="mx-auto max-w-5xl px-4 py-12 md:px-8">
        <div className="flex h-64 items-center justify-center text-sm text-muted">
          <BookOpen size={24} className="mr-2 animate-bounce text-accent" />
          Loading course specifications...
        </div>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main id="main" className="mx-auto max-w-5xl px-4 py-12 md:px-8">
        <div role="alert" className="rounded-xl border border-border bg-surface p-8 text-center">
          <h1 className="text-xl font-bold text-text">Course Not Found</h1>
          <p className="mt-2 text-sm text-muted">
            The course identifier "{id}" does not exist in our corporate catalogue.
          </p>
          <div className="mt-6">
            <Link
              to="/app/courses"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-xs font-semibold text-accent-fg hover:opacity-90"
            >
              <ArrowLeft size={14} />
              Return to Course Catalogue
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const syllabus = course.syllabus || [];
  const prerequisites = course.prerequisites || [
    "Modern JavaScript / TypeScript proficiency",
    "Familiarity with DOM elements and asynchronous operations",
    "Node.js runtime environment installed locally",
  ];

  return (
    <main id="main" className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/app/courses"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-text"
        >
          <ArrowLeft size={14} />
          Back to Catalogue
        </Link>
      </div>

      {/* Hero / Header Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold text-accent">{course.code}</span>
          <Badge tone="neutral">{course.category}</Badge>
          <span className="rounded-full bg-surface-muted px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wide text-muted">
            {course.difficulty}
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-text md:text-3xl">
          {course.title}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted">
          {course.description ||
            "Comprehensive curriculum focused on enterprise reliability, automated regression pipelines, and robust UI validation patterns."}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <div className="flex items-center gap-6">
            <div>
              <span className="block text-xs text-muted">Course Tuition</span>
              <span className="font-mono text-2xl font-bold text-text">${course.price}</span>
            </div>
            <div className="border-l border-border pl-6">
              <span className="block text-xs text-muted">Capacity Status</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                <Users size={16} />
                {course.remainingSeats ?? course.seats} Seats Remaining
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate(`/app/enrollments?courseId=${course.id}`)}
              aria-label="Enroll Now"
            >
              <GraduationCap size={16} />
              <span>Enroll Now</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Syllabus / Modules Accordion */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text">Curriculum & Syllabus</h2>
            <span className="text-xs text-muted font-mono">{syllabus.length} Modules</span>
          </div>

          {syllabus.length === 0 ? (
            <div className="rounded-lg border border-border bg-surface p-6 text-center text-sm text-muted">
              Syllabus modules are currently being synchronized with course faculty.
            </div>
          ) : (
            <div className="space-y-3">
              {syllabus.map((mod: CourseModule, idx: number) => {
                const isExpanded = expandedModules.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    className="overflow-hidden rounded-lg border border-border bg-surface"
                  >
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => toggleModule(mod.id)}
                      className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-surface-muted/50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-6 place-items-center rounded-full bg-accent/10 font-mono text-xs font-semibold text-accent">
                          {idx + 1}
                        </span>
                        <div>
                          <h3 className="text-sm font-semibold text-text">{mod.title}</h3>
                          <span className="flex items-center gap-1 text-xs text-muted">
                            <Clock size={12} />
                            {mod.durationMinutes} min
                          </span>
                        </div>
                      </div>
                      <span className="text-muted">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </button>

                    {isExpanded ? (
                      <div className="border-t border-border bg-surface-muted/30 px-5 py-4">
                        <p className="text-xs text-text leading-relaxed">
                          {mod.description}
                        </p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {/* Prerequisites */}
          <div className="mt-8 rounded-lg border border-border bg-surface p-6">
            <h3 className="text-sm font-bold text-text">Course Prerequisites</h3>
            <ul className="mt-3 space-y-2 text-xs text-muted">
              {prerequisites.map((req: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="mt-0.5 text-accent shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Instructor Card */}
          <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-full bg-accent/10 text-accent">
                <User size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-text">
                  {course.instructorName || "Dr. Evelyn Vance"}
                </h3>
                <p className="text-xs text-muted">Principal Test Architect</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Specialist in continuous integration testing, hermetic test fixtures, and large-scale automated QA verification.
            </p>
          </div>

          {/* Accreditation Box */}
          <div className="rounded-lg border border-border bg-surface p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-text">
              <Award size={18} className="text-accent" />
              <span>Verified Certification</span>
            </div>
            <p className="mt-2 text-xs text-muted leading-relaxed">
              Upon successful completion of all scenario labs and the final assessment, graduates receive an
              industry-recognized digital credential.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
