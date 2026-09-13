import { redirect } from "next/navigation";
import { Hourglass } from "lucide-react";
import { getAuthContext } from "@/lib/auth";
import { landingPathFor } from "@/lib/auth-routing";
import { StatusScreen } from "@/components/status-screen";

export default async function PendingPage() {
  const { user, profile } = await getAuthContext();
  if (!user || !profile) redirect("/login");
  if (profile.account_status === "inactive") redirect("/suspended");
  if (profile.account_status === "active") {
    redirect(landingPathFor(profile.role, profile.account_status));
  }

  return (
    <StatusScreen
      icon={Hourglass}
      tone="warning"
      title="Waiting for approval"
      message="Your account was created. A flat admin needs to add you to the flat before you can get in. You'll be able to sign in as soon as they do."
    />
  );
}
