import { requireAdmin } from "@/lib/auth";
import { AuditTable } from "./audit-table";

type RawAudit = {
  id: string;
  action: string;
  target_type: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
  actor: { full_name: string | null; email: string; avatar_url: string | null } | null;
};

export default async function AdminAuditPage() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("audit_logs")
    .select("id, action, target_type, target_id, created_at, metadata, actor:profiles!audit_logs_actor_id_fkey(full_name, email, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(200);

  const logs = ((data ?? []) as unknown as RawAudit[]).map((l) => ({
    id: l.id,
    action: l.action,
    target_type: l.target_type,
    created_at: l.created_at,
    metadata: l.metadata,
    actor_name: l.actor?.full_name ?? "System",
    actor_email: l.actor?.email ?? "",
    actor_avatar: l.actor?.avatar_url ?? null,
  }));

  return <AuditTable logs={logs} />;
}
