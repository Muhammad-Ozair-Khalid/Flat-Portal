import { requireMember } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { LocationSharing } from "./location-sharing";

export default async function LocationPage() {
  const { profile, supabase } = await requireMember();

  const { data: loc } = await supabase
    .from("locations")
    .select("sharing_enabled, latitude, longitude, updated_at")
    .eq("user_id", profile.id)
    .maybeSingle();

  return (
    <div>
      <PageHeader title="Location" description="You decide whether to share your location — and only admins can see it." />
      <LocationSharing initial={loc} userId={profile.id} userName={profile.full_name ?? "You"} />
    </div>
  );
}
