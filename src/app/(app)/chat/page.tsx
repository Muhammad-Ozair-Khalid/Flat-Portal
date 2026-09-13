import { MessagesSquare } from "lucide-react";
import { requireMember } from "@/lib/auth";
import { ChatRoom } from "@/components/chat/chat-room";
import { EmptyState } from "@/components/ui/empty-state";

export default async function GroupChatPage() {
  const { profile, supabase } = await requireMember();

  const { data: group } = await supabase
    .from("conversations")
    .select("id, title")
    .eq("is_primary", true)
    .maybeSingle();

  if (!group) {
    return <EmptyState icon={MessagesSquare} title="No group chat yet" description="The flat group hasn't been set up." />;
  }

  const { data: msgs } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", group.id)
    .order("created_at", { ascending: true })
    .limit(300);

  const { data: people } = await supabase.from("public_profiles").select("id, full_name, avatar_url");
  const senders = Object.fromEntries(
    (people ?? []).map((p) => [p.id, { full_name: p.full_name, avatar_url: p.avatar_url, email: "" }]),
  );

  return (
    <ChatRoom
      conversationId={group.id}
      currentUserId={profile.id}
      initialMessages={msgs ?? []}
      senders={senders}
      title={group.title ?? "Flat Group"}
      subtitle={`${people?.length ?? 0} flatmates`}
      showSenderNames
    />
  );
}
