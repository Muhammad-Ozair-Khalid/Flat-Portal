import { redirect } from "next/navigation";
import { ShieldX } from "lucide-react";
import { getAuthContext } from "@/lib/auth";
import { landingPathFor } from "@/lib/auth-routing";
import { StatusScreen } from "@/components/status-screen";

export default async function SuspendedPage() {
  const { user, profile } = await getAuthContext();
  if (!user || !profile) redirect("/login");
  if (profile.account_status === "active") {
    redirect(landingPathFor(profile.role, profile.account_status));
  }
  if (profile.account_status === "pending") redirect("/pending");

  return (
    <StatusScreen
      icon={ShieldX}
      tone="danger"
      title="Access removed"
      message="Your access to this flat has been turned off by an admin. If you think this is a mistake, reach out to one of your flat admins."
    />
  );
}
