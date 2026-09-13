import { ListChecks } from "lucide-react";
import { requireMember } from "@/lib/auth";
import { ComingSoon } from "@/components/app/coming-soon";

export default async function TasksPage() {
  await requireMember();
  return <ComingSoon title="My tasks" description="Everything assigned to you." icon={ListChecks} />;
}
