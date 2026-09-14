import { requireAdmin } from "@/lib/auth";
import { GreetingHero } from "@/components/app/greeting-hero";
import { FlatFloor } from "@/components/experience/flat-floor";
import { FLAT } from "@/lib/flat";

export default async function AdminRoomsPage() {
  await requireAdmin();

  return (
    <div>
      <GreetingHero
        title={FLAT.name}
        subtitle="Assign real people to each room — saved on this device until Supabase is connected."
      />
      <FlatFloor role="admin" />
    </div>
  );
}
