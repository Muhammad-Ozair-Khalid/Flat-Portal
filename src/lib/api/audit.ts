import "server-only";

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";

/** Write an audit-log entry via the service role (audit_logs is not client-writable). */
export async function writeAudit(params: {
  actorId: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  const admin = createSupabaseAdmin();
  await admin.from("audit_logs").insert({
    actor_id: params.actorId,
    action: params.action,
    target_type: params.targetType ?? null,
    target_id: params.targetId ?? null,
    metadata: (params.metadata ?? {}) as Json,
  });
}
