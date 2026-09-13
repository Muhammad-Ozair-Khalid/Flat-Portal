import { requireProfile } from "@/lib/auth";
import { AppShell } from "@/components/app/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, supabase } = await requireProfile();

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .eq("is_read", false);

  return (
    <AppShell
      profile={{
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        role: profile.role,
      }}
      unreadCount={count ?? 0}
    >
      {children}
    </AppShell>
  );
}
