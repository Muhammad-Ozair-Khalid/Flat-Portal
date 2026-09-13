"use client";

import { useMemo, useState } from "react";
import { Search, ScrollText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { describeAudit } from "@/lib/audit-labels";
import { fromNow, fmtDateTime } from "@/lib/format";

type Log = {
  id: string;
  action: string;
  target_type: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
  actor_name: string;
  actor_email: string;
  actor_avatar: string | null;
};

function detail(m: Record<string, unknown> | null): string {
  if (!m) return "";
  if (typeof m.title === "string") return m.title;
  if (typeof m.email === "string") return m.email;
  return "";
}

export function AuditTable({ logs }: { logs: Log[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const filtered = useMemo(
    () =>
      logs.filter((l) => {
        if (cat !== "all" && !l.action.startsWith(cat)) return false;
        if (q && !`${l.actor_name} ${l.action} ${detail(l.metadata)}`.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [logs, q, cat],
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Audit logs</h1>
        <p className="mt-1 text-muted-foreground">A record of important actions in the flat.</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search actor, action or detail" className="input pl-9" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-10 rounded-xl border border-input bg-card px-3 text-sm outline-none focus:border-ring">
          <option value="all">All events</option>
          <option value="task">Tasks</option>
          <option value="user">Users</option>
          <option value="announcement">Announcements</option>
        </select>
      </div>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={ScrollText} title="No matching events" description="Actions will be recorded here as they happen." />
        ) : (
          <ul className="divide-y divide-border/60">
            {filtered.map((l) => (
              <li key={l.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={l.actor_name} email={l.actor_email} src={l.actor_avatar} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">
                    <span className="font-medium">{l.actor_name}</span>{" "}
                    <span className="text-muted-foreground">{describeAudit(l.action)}</span>
                    {detail(l.metadata) && <span className="text-muted-foreground"> · {detail(l.metadata)}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground" title={fmtDateTime(l.created_at)}>
                    {fromNow(l.created_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
