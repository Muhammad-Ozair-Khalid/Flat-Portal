import { ScrollText } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { ComingSoon } from "@/components/app/coming-soon";

export default async function AdminAuditPage() {
  await requireAdmin();
  return <ComingSoon title="Audit logs" description="A record of important admin actions." icon={ScrollText} />;
}
