import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { LocationsDashboard } from "./locations-dashboard";

export default async function AdminLocationsPage() {
  const { supabase } = await requireAdmin();

  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("account_status", "active")
    .eq("role", "member")
    .order("full_name", { ascending: true });

  const { data: locs } = await supabase
    .from("locations")
    .select("user_id, sharing_enabled, latitude, longitude, updated_at");

  const locMap = new Map((locs ?? []).map((l) => [l.user_id, l]));
  const rows = (members ?? []).map((m) => {
    const l = locMap.get(m.id);
    return {
      userId: m.id,
      name: m.full_name ?? "Member",
      avatar_url: m.avatar_url,
      sharing_enabled: l?.sharing_enabled ?? false,
      latitude: l?.latitude ?? null,
      longitude: l?.longitude ?? null,
      updated_at: l?.updated_at ?? null,
    };
  });

  return (
    <div>
      <PageHeader title="Locations" description="Live locations of members who chose to share. Members can never see each other's location." />
      <LocationsDashboard initial={rows} />
    </div>
  );
}
