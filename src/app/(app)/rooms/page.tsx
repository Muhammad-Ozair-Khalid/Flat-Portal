import { requireMember } from "@/lib/auth";
import { GreetingHero } from "@/components/app/greeting-hero";
import { FlatFloor } from "@/components/experience/flat-floor";
import { FLAT } from "@/lib/flat";

export default async function RoomsPage() {
  await requireMember();

  return (
    <div>
      <GreetingHero title={FLAT.name} subtitle={FLAT.tagline} />
      <FlatFloor role="member" />
    </div>
  );
}
