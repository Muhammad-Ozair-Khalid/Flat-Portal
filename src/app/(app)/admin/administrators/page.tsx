import { requireAdmin } from "@/lib/auth";
import { AdminsManager } from "./admins-manager";

export default async function AdministratorsPage() {
  const { profile, supabase } = await requireAdmin();

  const { data: admins } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, last_login_at")
    .eq("role", "admin")
    .order("created_at", { ascending: true });

  const { data: allowlist } = await supabase.from("admin_allowlist").select("email");

  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .eq("role", "member")
    .eq("account_status", "active")
    .order("full_name", { ascending: true });

  const adminEmails = new Set((admins ?? []).map((a) => a.email.toLowerCase()));
  const reserved = (allowlist ?? [])
    .map((a) => a.email)
    .filter((e) => !adminEmails.has(e.toLowerCase()));

  return (
    <AdminsManager
      admins={admins ?? []}
      reserved={reserved}
      members={members ?? []}
      currentEmail={profile.email}
    />
  );
}
