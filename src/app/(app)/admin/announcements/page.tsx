import { Megaphone } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { ComingSoon } from "@/components/app/coming-soon";

export default async function AdminAnnouncementsPage() {
  await requireAdmin();
  return <ComingSoon title="Announcements" description="Post updates to the whole flat." icon={Megaphone} />;
}
