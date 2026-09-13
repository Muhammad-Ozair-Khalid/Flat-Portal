import { requireAdmin } from "@/lib/auth";
import { AnnouncementsManager } from "./announcements-manager";

type RawAnn = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  author: { full_name: string | null } | null;
};

export default async function AdminAnnouncementsPage() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("announcements")
    .select("id, title, body, created_at, author:profiles!announcements_created_by_fkey(full_name)")
    .order("created_at", { ascending: false });

  const announcements = ((data ?? []) as unknown as RawAnn[]).map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    created_at: a.created_at,
    author_name: a.author?.full_name ?? "Admin",
  }));

  return <AnnouncementsManager announcements={announcements} />;
}
