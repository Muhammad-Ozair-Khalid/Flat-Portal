import { User } from "lucide-react";
import { requireMember } from "@/lib/auth";
import { ComingSoon } from "@/components/app/coming-soon";

export default async function ProfilePage() {
  await requireMember();
  return <ComingSoon title="My profile" description="Your account details." icon={User} />;
}
