import { MapPin } from "lucide-react";
import { requireMember } from "@/lib/auth";
import { ComingSoon } from "@/components/app/coming-soon";

export default async function LocationPage() {
  await requireMember();
  return <ComingSoon title="Location" description="Choose whether to share your location." icon={MapPin} />;
}
