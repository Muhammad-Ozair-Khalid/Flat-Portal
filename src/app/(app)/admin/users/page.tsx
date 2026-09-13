import { requireAdmin } from "@/lib/auth";
import { UsersManager } from "./users-manager";

export default async function AdminUsersPage() {
  const { profile, supabase } = await requireAdmin();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, role, account_status, created_at, last_login_at")
    .order("role", { ascending: true })
    .order("created_at", { ascending: true });

  const { data: invites } = await supabase
    .from("member_invites")
    .select("email, created_at")
    .order("created_at", { ascending: false });

  return <UsersManager users={users ?? []} invites={invites ?? []} currentUserId={profile.id} />;
}
