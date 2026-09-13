"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Megaphone, Plus, Trash2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { fromNow } from "@/lib/format";

type Ann = { id: string; title: string; body: string; created_at: string; author_name: string };

export function AnnouncementsManager({ announcements }: { announcements: Ann[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState<Ann | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed to post.");
      toast.success("Announcement posted to the flat.");
      setOpen(false);
      setTitle("");
      setBody("");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to post.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(a: Ann) {
    setBusy(true);
    try {
      const res = await fetch(`/api/announcements/${a.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to delete.");
      toast.success("Announcement deleted.");
      setDel(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Announcements</h1>
          <p className="mt-1 text-muted-foreground">Post an update — everyone gets notified.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New announcement
        </Button>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <EmptyState icon={Megaphone} title="No announcements yet" description="Post the first update for your flat.">
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> New announcement
            </Button>
          </EmptyState>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{a.title}</h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{a.body}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {a.author_name} · {fromNow(a.created_at)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDel(a)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-danger hover:bg-danger/10"
                  aria-label="Delete announcement"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New announcement">
        <form onSubmit={create} className="space-y-3">
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="input" />
          <textarea required value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="What do you want to tell the flat?" className="input" />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Post announcement
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={() => del && remove(del)}
        title="Delete announcement?"
        description="It will be removed for everyone. Notifications already sent stay."
        confirmLabel="Delete"
        loading={busy}
      />
    </div>
  );
}
