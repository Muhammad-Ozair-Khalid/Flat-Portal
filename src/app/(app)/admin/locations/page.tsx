import { MapPinned } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { ComingSoon } from "@/components/app/coming-soon";

export default async function AdminLocationsPage() {
  await requireAdmin();
  return <ComingSoon title="Locations" description="Live locations of members who opted in." icon={MapPinned} />;
}
