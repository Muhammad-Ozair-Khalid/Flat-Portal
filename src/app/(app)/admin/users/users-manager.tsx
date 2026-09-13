"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, UserPlus, Trash2, UserCheck, UserX, Loader2, MailX, Users as UsersIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge, type Tone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { fmtDate, fromNow } from "@/lib/format";

type U = {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  role: string;
  account_status: string;
  created_at: string;
  last_login_at: string | null;
};
type Invite = { email: string; created_at: string };

const statusTone: Record<string, Tone> = { active: "success", pending: "warning", inactive: "neutral" };

export function UsersManager({
  users,
  invites,
  currentUserId,
}: {
  users: U[];
  invites: Invite[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<{ user: U } | null>(null);

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        const text = `${u.full_name ?? ""} ${u.email}`.toLowerCase();
        if (q && !text.includes(q.toLowerCase())) return false;
        if (status !== "all" && u.account_status !== status) return false;
        if (role !== "all" && u.role !== role) return false;
        return true;
      }),
    [users, q, status, role],
  );

  async function call(url: string, options: RequestInit, okMsg?: string) {
    setBusy(true);
    try {
      const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      toast.success(okMsg ?? data.message ?? "Done.");
      router.refresh();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    const ok = await call("/api/admin/users", { method: "POST", body: JSON.stringify({ email }) });
    if (ok) {
      setAddOpen(false);
      setEmail("");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Users</h1>
          <p className="mt-1 text-muted-foreground">{users.length} in the flat · manage who has access.</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <UserPlus className="h-4 w-4" /> Add member
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or email"
            className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-ring"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-xl border border-input bg-card px-3 text-sm outline-none focus:border-ring"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="h-10 rounded-xl border border-input bg-card px-3 text-sm outline-none focus:border-ring"
        >
          <option value="all">All roles</option>
          <option value="admin">Admins</option>
          <option value="member">Members</option>
        </select>
      </div>

      {/* Pending invites */}
      {invites.length > 0 && (
        <Card className="mb-4 p-4">
          <p className="mb-2 text-sm font-semibold text-foreground">Invited — not joined yet</p>
          <ul className="flex flex-wrap gap-2">
            {invites.map((inv) => (
              <li key={inv.email} className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm">
                <span className="text-foreground">{inv.email}</span>
                <button
                  onClick={() => call("/api/admin/invites", { method: "DELETE", body: JSON.stringify({ email: inv.email }) })}
                  disabled={busy}
                  className="text-muted-foreground hover:text-danger"
                  aria-label={`Revoke invite for ${inv.email}`}
                >
                  <MailX className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Users table */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No matching users" description="Try a different search or filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Joined</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Last login</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isSelf = u.id === currentUserId;
                  const isAdmin = u.role === "admin";
                  return (
                    <tr key={u.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.full_name} email={u.email} src={u.avatar_url} size={36} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {u.full_name ?? "—"} {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={isAdmin ? "primary" : "neutral"}>{isAdmin ? "Admin" : "Member"}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone[u.account_status] ?? "neutral"} dot>
                          {u.account_status}
                        </Badge>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{fmtDate(u.created_at)}</td>
                      <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                        {u.last_login_at ? fromNow(u.last_login_at) : "never"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {isAdmin || isSelf ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            <>
                              {u.account_status === "active" ? (
                                <button
                                  onClick={() => call(`/api/admin/users/${u.id}`, { method: "PATCH", body: JSON.stringify({ account_status: "inactive" }) })}
                                  disabled={busy}
                                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                                >
                                  <UserX className="h-3.5 w-3.5" /> Deactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => call(`/api/admin/users/${u.id}`, { method: "PATCH", body: JSON.stringify({ account_status: "active" }) })}
                                  disabled={busy}
                                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-success hover:bg-success/10"
                                >
                                  <UserCheck className="h-3.5 w-3.5" /> Activate
                                </button>
                              )}
                              <button
                                onClick={() => setConfirm({ user: u })}
                                disabled={busy}
                                className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-danger hover:bg-danger/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Remove
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add member modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add a flat member"
        description="Enter the Gmail address of the person you want to add. They'll get access the moment they sign in with Google."
      >
        <form onSubmit={addMember} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@gmail.com"
            className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus:border-ring"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Add member
            </Button>
          </div>
        </form>
      </Modal>

      {/* Remove confirmation */}
      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm && call(`/api/admin/users/${confirm.user.id}`, { method: "DELETE" }).then((ok) => ok && setConfirm(null))}
        title={`Remove ${confirm?.user.full_name ?? confirm?.user.email}?`}
        description="This deletes their account and all their data from the flat. This can't be undone."
        confirmLabel="Remove member"
        loading={busy}
      />
    </div>
  );
}
