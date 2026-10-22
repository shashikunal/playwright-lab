import type { ManagedUser, UserRole, UserStatus } from "@pil/shared";
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export function Users() {
  const { user, role } = useAuth();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<"name" | "role" | "status" | "department">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Add User Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState<UserRole>("learner");
  const [addDept, setAddDept] = useState("Quality Assurance");
  const [addError, setAddError] = useState<string | null>(null);

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("learner");
  const [editStatus, setEditStatus] = useState<UserStatus>("Active");
  const [editDept, setEditDept] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  // Delete User Confirmation Modal
  const [deletingUser, setDeletingUser] = useState<ManagedUser | null>(null);

  const isAdmin = role === "admin";
  const isTrainer = role === "trainer";
  const hasAccess = isAdmin || isTrainer;

  const fetchUsers = useCallback(() => {
    if (!hasAccess) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("pil-auth-token");
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort: sortField,
      order: sortOrder,
    });
    if (search.trim()) params.set("q", search.trim());
    if (roleFilter !== "all") params.set("role", roleFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);

    fetch(`/api/app/users?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 403) throw new Error("Forbidden: Insufficient permissions");
          if (res.status === 401) throw new Error("Unauthorized: Please log in");
          throw new Error("Failed to load user directory");
        }
        return res.json();
      })
      .then((data) => {
        setUsers(data.users || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [hasAccess, page, limit, sortField, sortOrder, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Bulk selection toggles
  const handleToggleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u) => u.id));
    }
  };

  const handleToggleSelectUser = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // Bulk activate / deactivate
  const handleBulkAction = async (action: "activate" | "deactivate") => {
    if (!isAdmin || selectedIds.length === 0) return;
    const token = localStorage.getItem("pil-auth-token");
    try {
      const res = await fetch("/api/app/users/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userIds: selectedIds, action }),
      });
      if (res.ok) {
        setNotification({
          type: "success",
          message: `Successfully set ${selectedIds.length} user(s) to ${action === "activate" ? "Active" : "Inactive"}`,
        });
        setSelectedIds([]);
        fetchUsers();
      } else {
        const err = await res.json().catch(() => ({}));
        setNotification({
          type: "error",
          message: err?.error?.message || "Failed to execute bulk action",
        });
      }
    } catch {
      setNotification({ type: "error", message: "Network error during bulk action" });
    }
  };

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    const token = localStorage.getItem("pil-auth-token");
    try {
      const res = await fetch("/api/app/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: addName,
          email: addEmail,
          role: addRole,
          department: addDept,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAddError(data?.error?.message || "Failed to create user");
        return;
      }

      setAddModalOpen(false);
      setAddName("");
      setAddEmail("");
      setNotification({ type: "success", message: `User created successfully!` });
      fetchUsers();
    } catch {
      setAddError("Network error occurred");
    }
  };

  // Open Edit Modal
  const openEditModal = (u: ManagedUser) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditRole(u.role);
    setEditStatus(u.status);
    setEditDept(u.department);
    setEditError(null);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError(null);
    const token = localStorage.getItem("pil-auth-token");
    try {
      const res = await fetch(`/api/app/users/${editingUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          role: editRole,
          status: editStatus,
          department: editDept,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setEditError(data?.error?.message || "Failed to update user");
        return;
      }

      setEditingUser(null);
      setNotification({ type: "success", message: `Updated ${editName} successfully` });
      fetchUsers();
    } catch {
      setEditError("Failed to update user");
    }
  };

  // Toggle user active status directly
  const handleToggleStatus = async (targetUser: ManagedUser) => {
    if (!isAdmin) return;
    const nextStatus: UserStatus = targetUser.status === "Active" ? "Inactive" : "Active";
    const token = localStorage.getItem("pil-auth-token");
    const res = await fetch(`/api/app/users/${targetUser.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      setNotification({ type: "success", message: `Status of ${targetUser.name} changed to ${nextStatus}` });
      fetchUsers();
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!deletingUser || !isAdmin) return;
    const token = localStorage.getItem("pil-auth-token");
    try {
      const res = await fetch(`/api/app/users/${deletingUser.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotification({ type: "success", message: `Removed user ${deletingUser.name}` });
        setDeletingUser(null);
        setSelectedIds((prev) => prev.filter((id) => id !== deletingUser.id));
        fetchUsers();
      } else {
        const data = await res.json().catch(() => ({}));
        setNotification({ type: "error", message: data?.error?.message || "Failed to delete user" });
      }
    } catch {
      setNotification({ type: "error", message: "Network error during delete" });
    }
  };

  // Access denied state for learners
  if (!user || (!isAdmin && !isTrainer)) {
    return (
      <main id="main" className="mx-auto max-w-5xl px-4 py-12 md:px-8">
        <div
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-danger/40 bg-surface p-8 text-center shadow-sm"
        >
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-danger/10 text-danger">
            <Shield size={28} />
          </div>
          <h1 className="mt-4 text-xl font-bold text-text">Access Denied (403 Forbidden)</h1>
          <p className="mt-2 text-sm text-muted">
            The User & Employee Directory requires Trainer or Administrator authorization. Learners do not have
            permission to view or modify personnel records.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-xs font-semibold text-accent-fg hover:opacity-90"
            >
              Switch Account (Sign in as Admin)
            </Link>
            <Link
              to="/app/courses"
              className="inline-flex items-center rounded-md border border-border bg-surface px-4 py-2 text-xs font-medium text-text hover:bg-surface-muted"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text">User & Employee Directory</h1>
            <Badge tone="neutral">{role.toUpperCase()}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            Manage corporate staff, role-based access controls, and training status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={fetchUsers} aria-label="Refresh user list">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </Button>
          {isAdmin ? (
            <Button
              onClick={() => setAddModalOpen(true)}
              aria-label="Add User"
            >
              <Plus size={16} />
              <span>Add User</span>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Notifications */}
      {notification ? (
        <div
          role="status"
          aria-live="polite"
          className={`mt-4 flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
            notification.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-danger/40 bg-danger/10 text-danger"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setNotification(null)}
            className="rounded p-1 hover:opacity-75"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}

      {/* Filter and Search Bar */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Box */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="user-search"
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, department..."
              className="w-full rounded-md border border-border bg-bg pl-9 pr-3 py-2 text-sm text-text focus:outline-hidden"
              aria-label="Search users"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted" />
            <select
              id="filter-role"
              aria-label="Filter by role"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text"
            >
              <option value="all">All Roles</option>
              <option value="learner">Learners</option>
              <option value="trainer">Trainers</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-muted" />
            <select
              id="filter-status"
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <ArrowUpDown size={16} className="text-muted" />
            <select
              id="sort-by"
              aria-label="Sort users"
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split("-") as [typeof sortField, typeof sortOrder];
                setSortField(f);
                setSortOrder(o);
                setPage(1);
              }}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="role-asc">Role (Ascending)</option>
              <option value="status-asc">Status (Active first)</option>
              <option value="department-asc">Department (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {isAdmin && selectedIds.length > 0 ? (
        <div
          role="region"
          aria-label="Bulk actions toolbar"
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-text"
        >
          <span className="font-semibold text-accent">
            {selectedIds.length} user{selectedIds.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => handleBulkAction("activate")}
              aria-label="Activate selected users"
              className="border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            >
              <UserCheck size={14} />
              <span>Activate</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleBulkAction("deactivate")}
              aria-label="Deactivate selected users"
              className="border border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              <UserX size={14} />
              <span>Deactivate</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setSelectedIds([])}
              aria-label="Deselect all"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      ) : null}

      {/* Users Table */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface">
        {loading ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted">
            <RefreshCw size={20} className="mr-2 animate-spin text-accent" />
            Loading user records...
          </div>
        ) : error ? (
          <div role="alert" className="p-8 text-center text-sm text-danger">
            <AlertCircle size={24} className="mx-auto mb-2" />
            <p className="font-semibold">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Shield size={36} className="mx-auto text-muted/60" />
            <h3 className="mt-3 text-sm font-semibold text-text">No users found</h3>
            <p className="mt-1 text-xs text-muted">Try adjusting your search criteria or role filters.</p>
            <Button
              variant="ghost"
              onClick={() => {
                setSearch("");
                setRoleFilter("all");
                setStatusFilter("all");
              }}
              className="mt-4"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <table className="w-full text-left text-sm" aria-label="User directory">
            <thead className="border-b border-border bg-surface-muted text-xs font-semibold text-muted">
              <tr>
                {isAdmin ? (
                  <th scope="col" className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all users on this page"
                      checked={selectedIds.length > 0 && selectedIds.length === users.length}
                      onChange={handleToggleSelectAll}
                      className="size-4 rounded border-border"
                    />
                  </th>
                ) : null}
                <th scope="col" className="px-4 py-3">Name & Email</th>
                <th scope="col" className="px-4 py-3">Role</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Department</th>
                <th scope="col" className="px-4 py-3">Courses</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => {
                const isSelected = selectedIds.includes(u.id);
                return (
                  <tr
                    key={u.id}
                    className={`transition-colors hover:bg-surface-muted/50 ${isSelected ? "bg-accent/5" : ""}`}
                  >
                    {isAdmin ? (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Select user ${u.name}`}
                          checked={isSelected}
                          onChange={() => handleToggleSelectUser(u.id)}
                          className="size-4 rounded border-border"
                        />
                      </td>
                    ) : null}
                    <td className="px-4 py-3">
                      <div className="font-medium text-text">{u.name}</div>
                      <div className="text-xs text-muted font-mono">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={u.role === "admin" ? "warning" : "neutral"}>
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-zinc-500/10 text-zinc-400"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            u.status === "Active" ? "bg-emerald-400" : "bg-zinc-400"
                          }`}
                        />
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{u.department}</td>
                    <td className="px-4 py-3 font-mono text-xs">{u.enrolledCoursesCount}</td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            aria-label={`Edit ${u.name}`}
                            onClick={() => openEditModal(u)}
                            className="rounded p-1 text-muted hover:bg-surface-muted hover:text-text cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            aria-label={`Toggle status for ${u.name}`}
                            onClick={() => handleToggleStatus(u)}
                            className="rounded p-1 text-xs text-muted hover:bg-surface-muted hover:text-text cursor-pointer"
                          >
                            {u.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete user ${u.name}`}
                            onClick={() => setDeletingUser(u)}
                            className="rounded p-1 text-muted hover:bg-danger/10 hover:text-danger cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted">Read-only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted">
          <div>
            Showing <span className="font-medium text-text">{users.length}</span> of{" "}
            <span className="font-medium text-text">{total}</span> records
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded p-1 border border-border disabled:opacity-40 hover:bg-surface-muted cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Next page"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded p-1 border border-border disabled:opacity-40 hover:bg-surface-muted cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {addModalOpen ? (
        <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-user-modal-title"
            className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 id="add-user-modal-title" className="text-lg font-bold text-text">
                Add New Enterprise User
              </h3>
              <button
                type="button"
                aria-label="Close dialog"
                onClick={() => setAddModalOpen(false)}
                className="rounded p-1 text-muted hover:text-text cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {addError ? (
              <p role="alert" className="mt-2 text-xs text-danger">
                {addError}
              </p>
            ) : null}

            <form onSubmit={handleCreateUser} className="mt-4 space-y-4">
              <div>
                <label htmlFor="user-name" className="block text-xs font-medium text-muted">
                  Full Name
                </label>
                <input
                  id="user-name"
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-hidden"
                  placeholder="e.g. Dorothy Vaughan"
                />
              </div>

              <div>
                <label htmlFor="user-email" className="block text-xs font-medium text-muted">
                  Corporate Email
                </label>
                <input
                  id="user-email"
                  type="email"
                  required
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-hidden"
                  placeholder="dorothy.vaughan@pil.local"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="user-role" className="block text-xs font-medium text-muted">
                    Assigned Role
                  </label>
                  <select
                    id="user-role"
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value as UserRole)}
                    className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text"
                  >
                    <option value="learner">Learner</option>
                    <option value="trainer">Trainer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="user-dept" className="block text-xs font-medium text-muted">
                    Department
                  </label>
                  <input
                    id="user-dept"
                    type="text"
                    value={addDept}
                    onChange={(e) => setAddDept(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-hidden"
                    placeholder="Quality Assurance"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={() => setAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Edit User Modal */}
      {editingUser ? (
        <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-modal-title"
            className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 id="edit-user-modal-title" className="text-lg font-bold text-text">
                Edit User: {editingUser.name}
              </h3>
              <button
                type="button"
                aria-label="Close edit dialog"
                onClick={() => setEditingUser(null)}
                className="rounded p-1 text-muted hover:text-text cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {editError ? (
              <p role="alert" className="mt-2 text-xs text-danger">
                {editError}
              </p>
            ) : null}

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-xs font-medium text-muted">
                  Full Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-role" className="block text-xs font-medium text-muted">
                    Role
                  </label>
                  <select
                    id="edit-role"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text"
                  >
                    <option value="learner">Learner</option>
                    <option value="trainer">Trainer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-status" className="block text-xs font-medium text-muted">
                    Status
                  </label>
                  <select
                    id="edit-status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as UserStatus)}
                    className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="edit-dept" className="block text-xs font-medium text-muted">
                  Department
                </label>
                <input
                  id="edit-dept"
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {deletingUser ? (
        <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-modal-title"
            className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-2xl"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-danger/10 text-danger mb-3">
              <Trash2 size={20} />
            </div>
            <h3 id="delete-user-modal-title" className="text-lg font-bold text-text">
              Confirm Deletion
            </h3>
            <p className="mt-2 text-xs text-muted">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-text">{deletingUser.name}</span> ({deletingUser.email})? This action
              cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeletingUser(null)}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="inline-flex items-center justify-center rounded-md bg-danger px-4 py-2 text-xs font-medium text-white hover:bg-danger/90 cursor-pointer"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
