import { Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { ComingSoon } from "@/components/app/coming-soon";

export default async function AdminUsersPage() {
  await requireAdmin();
  return <ComingSoon title="Users" description="Add, activate and manage flat members." icon={Users} />;
}
