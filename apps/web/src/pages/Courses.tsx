import type { Course } from "@pil/shared";
import { BookOpen, Plus, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export function Courses() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  // Create course modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newCategory, setNewCategory] = useState("Core");
  const [newPrice, setNewPrice] = useState(299);
  const [createError, setCreateError] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  const fetchCourses = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category) params.set("category", category);

    fetch(`/api/app/courses?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load"))))
      .then((data: { courses: Course[] }) => {
        setCourses(data.courses);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, category]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    const token = localStorage.getItem("pil-auth-token");
    const res = await fetch("/api/app/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: newTitle,
        code: newCode,
        category: newCategory,
        price: Number(newPrice),
        difficulty: "intermediate",
        seats: 20,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setCreateError(err?.error?.message || "Failed to create course");
      return;
    }

    setCreateOpen(false);
    setNewTitle("");
    setNewCode("");
    fetchCourses();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const token = localStorage.getItem("pil-auth-token");

    const res = await fetch(`/api/app/courses/${deleteTarget.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setDeleteTarget(null);
      fetchCourses();
    }
  };

  const canCreate = role === "trainer" || role === "admin";
  const canDelete = role === "admin";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-accent">Enterprise Academy</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text">Course Catalogue</h1>
          <p className="mt-1 text-sm text-muted">
            Search, filter, and enroll in industrial testing courses. Manage catalogue records with role-based permissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Badge tone="warning">Role: {user.role}</Badge>
          ) : (
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Sign In to Enroll
            </Button>
          )}
          {canCreate ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={16} />
              Create Course
            </Button>
          ) : null}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
          <input
            type="search"
            aria-label="Search courses"
            placeholder="Search by title, code, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-surface pl-9 pr-3 py-2 text-sm text-text focus:outline-hidden"
          />
        </div>
        <div className="flex gap-2">
          {["", "Basics", "Core", "Network", "DevOps", "Security"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                category === cat ? "bg-accent text-accent-fg" : "border border-border bg-surface text-muted hover:text-text"
              }`}
            >
              {cat || "All Categories"}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="py-12 text-center text-sm text-muted">Loading course catalogue...</div>
      ) : courses.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface-muted py-12 text-center">
          <BookOpen className="mx-auto size-8 text-muted" />
          <p className="mt-2 text-sm font-semibold text-text">No matching courses found</p>
          <p className="mt-1 text-xs text-muted">Try adjusting your search criteria or category filter.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="course-grid">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col justify-between rounded-lg border border-border bg-surface p-5 shadow-xs"
              data-testid={`course-card-${course.id}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-accent">{course.code}</span>
                  <Badge>{course.category}</Badge>
                </div>
                <h3 className="mt-2 font-semibold text-text">{course.title}</h3>
                <div className="mt-4 flex items-center justify-between text-xs text-muted">
                  <span>Available Seats: {course.seats}</span>
                  <span className="font-mono text-sm font-semibold text-text">${course.price}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-2 border-t border-border pt-4">
                <Link
                  to={`/app/enrollments?courseId=${course.id}`}
                  className="inline-flex items-center justify-center rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg hover:opacity-90"
                >
                  Enroll Now
                </Link>
                {canDelete ? (
                  <button
                    type="button"
                    aria-label={`Delete ${course.title}`}
                    onClick={() => setDeleteTarget(course)}
                    className="rounded p-1.5 text-muted hover:bg-danger-bg hover:text-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Creation Modal */}
      {createOpen ? (
        <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="create-course-title" className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 id="create-course-title" className="text-lg font-semibold text-text">Create New Course</h3>
              <button type="button" aria-label="Close dialog" onClick={() => setCreateOpen(false)} className="rounded p-1 text-muted hover:text-text">
                <X size={18} />
              </button>
            </div>
            {createError ? (
              <p role="alert" className="mt-2 text-xs text-danger">{createError}</p>
            ) : null}
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label htmlFor="course-title" className="block text-xs font-medium text-muted">Course Title</label>
                <input
                  id="course-title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-hidden"
                  placeholder="e.g. Playwright Microfrontends"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="course-code" className="block text-xs font-medium text-muted">Course Code</label>
                  <input
                    id="course-code"
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-hidden"
                    placeholder="PW-701"
                  />
                </div>
                <div>
                  <label htmlFor="course-category" className="block text-xs font-medium text-muted">Category</label>
                  <select
                    id="course-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-surface px-2 py-2 text-sm text-text"
                  >
                    <option value="Basics">Basics</option>
                    <option value="Core">Core</option>
                    <option value="Network">Network</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Security">Security</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="course-price" className="block text-xs font-medium text-muted">Price ($)</label>
                  <input
                    id="course-price"
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-hidden"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button type="submit">Create Course</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {deleteTarget ? (
        <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title" className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-xl">
            <h3 id="delete-dialog-title" className="text-lg font-semibold text-text">Confirm Course Deletion</h3>
            <p className="mt-2 text-xs text-muted">
              Are you sure you want to remove <span className="font-semibold text-text">{deleteTarget.title}</span>? This action is restricted to administrators.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button onClick={handleDelete} className="bg-danger text-white hover:bg-danger/90">
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
