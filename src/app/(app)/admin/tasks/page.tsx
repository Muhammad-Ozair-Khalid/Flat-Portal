import { ListChecks } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { ComingSoon } from "@/components/app/coming-soon";

export default async function AdminTasksPage() {
  await requireAdmin();
  return <ComingSoon title="Tasks" description="Create, assign and track flat tasks." icon={ListChecks} />;
}
