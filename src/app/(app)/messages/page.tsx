import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { requireMember } from "@/lib/auth";
import { NewMessage } from "@/components/chat/new-message";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { fromNow } from "@/lib/format";

type Person = { id: string; full_name: string | null; avatar_url: string | null; role: string };
type Msg = { conversation_id: string; sender_id: string; body: string; created_at: string };

export default async function MessagesPage() {
  const { profile, supabase } = await requireMember();

  const { data: convs } = await supabase.from("conversations").select("id, dm_key, created_at").eq("type", "direct");
  const convIds = (convs ?? []).map((c) => c.id);

  const { data: mems } = await supabase
    .from("conversation_members")
    .select("conversation_id, last_read_at")
    .eq("user_id", profile.id);
  const lastRead = new Map((mems ?? []).map((m) => [m.conversation_id, m.last_read_at]));

  let messages: Msg[] = [];
  if (convIds.length) {
    const { data } = await supabase
      .from("messages")
      .select("conversation_id, sender_id, body, created_at")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: false })
      .limit(500);
    messages = (data ?? []) as Msg[];
  }

  const { data: people } = await supabase.from("public_profiles").select("id, full_name, avatar_url, role");
  const peopleMap = new Map((people ?? []).map((p) => [p.id, p as Person]));

  const list = (convs ?? [])
    .map((c) => {
      const otherId = c.dm_key?.split(":").find((x) => x !== profile.id) ?? "";
      const msgs = messages.filter((m) => m.conversation_id === c.id);
      const last = msgs[0];
      const lr = lastRead.get(c.id);
      const unread = msgs.filter(
        (m) => m.sender_id !== profile.id && (!lr || new Date(m.created_at) > new Date(lr)),
      ).length;
      return { id: c.id, other: peopleMap.get(otherId) ?? null, last, unread };
    })
    .filter((x) => x.last)
    .sort((a, b) => new Date(b.last!.created_at).getTime() - new Date(a.last!.created_at).getTime());

  const startable = (people ?? []).filter((p) => p.id !== profile.id) as Person[];

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Messages</h1>
          <p className="mt-1 text-muted-foreground">Your private conversations.</p>
        </div>
        <NewMessage people={startable} />
      </div>

      {list.length === 0 ? (
        <Card>
          <EmptyState icon={MessagesSquare} title="No conversations yet" description="Start a private chat with a flatmate.">
            <NewMessage people={startable} />
          </EmptyState>
        </Card>
      ) : (
        <Card className="divide-y divide-border/60 overflow-hidden">
          {list.map((row) => (
            <Link key={row.id} href={`/messages/${row.id}`} className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/50">
              <Avatar name={row.other?.full_name} src={row.other?.avatar_url} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium text-foreground">{row.other?.full_name ?? "Member"}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{fromNow(row.last!.created_at)}</span>
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {row.last!.sender_id === profile.id ? "You: " : ""}
                  {row.last!.body}
                </p>
              </div>
              {row.unread > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                  {row.unread}
                </span>
              )}
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
