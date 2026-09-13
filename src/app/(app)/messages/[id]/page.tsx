import { redirect } from "next/navigation";
import { requireMember } from "@/lib/auth";
import { ChatRoom } from "@/components/chat/chat-room";

export default async function DirectMessagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile, supabase } = await requireMember();

  // RLS returns the row only if the caller is a member of this conversation.
  const { data: conv } = await supabase
    .from("conversations")
    .select("id, type, dm_key")
    .eq("id", id)
    .maybeSingle();
  if (!conv) redirect("/messages");

  const { data: msgs } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(300);

  const otherId = conv.dm_key?.split(":").find((x) => x !== profile.id) ?? "";
  const ids = [profile.id, otherId].filter(Boolean);
  const { data: people } = await supabase
    .from("public_profiles")
    .select("id, full_name, avatar_url")
    .in("id", ids);

  const senders = Object.fromEntries(
    (people ?? []).map((p) => [p.id, { full_name: p.full_name, avatar_url: p.avatar_url, email: "" }]),
  );
  const other = (people ?? []).find((p) => p.id === otherId);

  return (
    <ChatRoom
      conversationId={id}
      currentUserId={profile.id}
      initialMessages={msgs ?? []}
      senders={senders}
      title={other?.full_name ?? "Direct message"}
      showSenderNames={false}
      backHref="/messages"
    />
  );
}
