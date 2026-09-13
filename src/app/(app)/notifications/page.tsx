import { Bell } from "lucide-react";
import { requireMember } from "@/lib/auth";
import { ComingSoon } from "@/components/app/coming-soon";

export default async function NotificationsPage() {
  await requireMember();
  return <ComingSoon title="Notifications" description="Tasks, messages and announcements." icon={Bell} />;
}
