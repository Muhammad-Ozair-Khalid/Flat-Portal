"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2, Search } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type P = { id: string; full_name: string | null; avatar_url: string | null; role: string };

export function NewMessage({ people }: { people: P[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = people.filter((p) => (p.full_name ?? "").toLowerCase().includes(q.toLowerCase()));

  async function start(id: string) {
    setBusy(id);
    try {
      const res = await fetch("/api/conversations/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't start the chat.");
      router.push(`/messages/${data.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't start the chat.");
      setBusy(null);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> New message
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Start a conversation">
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search flatmates" className="input pl-9" />
        </div>
        <ul className="max-h-80 space-y-1 overflow-y-auto">
          {filtered.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No one to message.</li>}
          {filtered.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => start(p.id)}
                disabled={!!busy}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted disabled:opacity-60"
              >
                <Avatar name={p.full_name} src={p.avatar_url} size={36} />
                <span className="flex-1 truncate font-medium text-foreground">{p.full_name ?? "Member"}</span>
                {p.role === "admin" && <Badge tone="primary">Admin</Badge>}
                {busy === p.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}
