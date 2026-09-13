import { requireMember } from "@/lib/auth";
import { NotificationsList } from "./notifications-list";

export default async function NotificationsPage() {
  const { profile, supabase } = await requireMember();

  const { data } = await supabase
    .from("notifications")
    .select("id, type, title, body, data, is_read, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: group } = await supabase
    .from("conversations")
    .select("id")
    .eq("is_primary", true)
    .maybeSingle();

  return (
    <NotificationsList
      initial={(data ?? []) as never}
      isAdmin={profile.role === "admin"}
      userId={profile.id}
      groupConvId={group?.id ?? null}
    />
  );
}
