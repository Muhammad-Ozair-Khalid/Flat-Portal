"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck, ShieldPlus, Loader2, UserMinus, Clock } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { fromNow } from "@/lib/format";

type Admin = { id: string; full_name: string | null; email: string; avatar_url: string | null; last_login_at: string | null };
type Member = { id: string; full_name: string | null; email: string; avatar_url: string | null };

export function AdminsManager({
  admins,
  reserved,
  members,
  currentEmail,
}: {
  admins: Admin[];
  reserved: string[];
  members: Member[];
  currentEmail: string;
}) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [pick, setPick] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [remove, setRemove] = useState<{ label: string; body: Record<string, string> } | null>(null);

  const usedSlots = admins.length + reserved.length;
  const freeSlots = Math.max(0, 2 - usedSlots);

  async function call(method: string, body: Record<string, string>, okFallback: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/administrators", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      toast.success(data.message ?? okFallback);
      router.refresh();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!pick && !email.trim()) {
      toast.error("Choose a member or enter an email.");
      return;
    }
    const body: Record<string, string> = pick ? { user_id: pick } : { email: email.trim() };
    const ok = await call("POST", body, "Administrator added.");
    if (ok) {
      setAddOpen(false);
      setPick("");
      setEmail("");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Administrators</h1>
          <p className="mt-1 text-muted-foreground">Your flat has exactly two admin slots. {freeSlots} free.</p>
        </div>
        <Button onClick={() => setAddOpen(true)} disabled={freeSlots === 0}>
          <ShieldPlus className="h-4 w-4" /> Add administrator
        </Button>
      </div>

      <Card className="mb-4 flex items-start gap-3 border-primary/30 bg-primary/[0.06] p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">
          Admins have full access. There can be at most two. You can hand over access by adding a new admin into a free
          slot and removing an old one — you can&rsquo;t remove your own access (ask the other admin).
        </p>
      </Card>

      <div className="space-y-3">
        {admins.map((a) => {
          const isSelf = a.email.toLowerCase() === currentEmail.toLowerCase();
          return (
            <Card key={a.id} className="flex items-center gap-3 p-4">
              <Avatar name={a.full_name} email={a.email} src={a.avatar_url} size={44} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">
                  {a.full_name ?? a.email} {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}
                </p>
                <p className="truncate text-xs text-muted-foreground">{a.email}</p>
              </div>
              <Badge tone="primary" dot>Admin</Badge>
              <span className="hidden text-xs text-muted-foreground sm:block">
                {a.last_login_at ? `Active ${fromNow(a.last_login_at)}` : "never signed in"}
              </span>
              {isSelf ? (
                <span className="text-xs text-muted-foreground">—</span>
              ) : (
                <button
                  onClick={() => setRemove({ label: a.full_name ?? a.email, body: { user_id: a.id } })}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-danger hover:bg-danger/10"
                >
                  <UserMinus className="h-3.5 w-3.5" /> Remove
                </button>
              )}
            </Card>
          );
        })}

        {reserved.map((em) => (
          <Card key={em} className="flex items-center gap-3 border-dashed p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Clock className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{em}</p>
              <p className="text-xs text-muted-foreground">Reserved — becomes admin on first sign-in</p>
            </div>
            <Badge tone="warning">Reserved</Badge>
            <button
              onClick={() => setRemove({ label: em, body: { email: em } })}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-danger hover:bg-danger/10"
            >
              <UserMinus className="h-3.5 w-3.5" /> Free slot
            </button>
          </Card>
        ))}
      </div>

      {/* Add admin modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add an administrator"
        description="Promote an active member, or reserve a slot for a Gmail address."
      >
        <form onSubmit={add} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-foreground">Promote a member</span>
            <select value={pick} onChange={(e) => { setPick(e.target.value); if (e.target.value) setEmail(""); }} className="input">
              <option value="">Choose a member…</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.full_name ?? m.email}</option>
              ))}
            </select>
          </label>
          <div className="text-center text-xs text-muted-foreground">or</div>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-foreground">Reserve by email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (e.target.value) setPick(""); }}
              placeholder="name@gmail.com"
              className="input"
            />
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)} disabled={busy}>Cancel</Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Add administrator
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!remove}
        onClose={() => setRemove(null)}
        onConfirm={() => remove && call("DELETE", remove.body, "Administrator removed.").then((ok) => ok && setRemove(null))}
        title={`Remove ${remove?.label} as admin?`}
        description="They keep their member account but lose all administrator access."
        confirmLabel="Remove admin"
        loading={busy}
      />
    </div>
  );
}
