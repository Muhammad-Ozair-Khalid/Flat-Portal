"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, SmilePlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { Linkify } from "@/lib/linkify";
import { fmtTime, fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type Msg = { id: string; sender_id: string; body: string; created_at: string };
type Sender = { full_name: string | null; avatar_url: string | null; email: string };

const EMOJIS = ["😀", "😂", "🥰", "😎", "👍", "🙏", "🎉", "🔥", "❤️", "😅", "😴", "🤝", "🧹", "🍽️", "🗑️", "🧺", "💡", "✅", "⏰", "🏠", "👋", "🤔", "😭", "🙌"];

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return fmtDate(iso);
}

export function ChatRoom({
  conversationId,
  currentUserId,
  initialMessages,
  senders,
  title,
  subtitle,
  showSenderNames = true,
  backHref,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: Msg[];
  senders: Record<string, Sender>;
  title: string;
  subtitle?: string;
  showSenderNames?: boolean;
  backHref?: string;
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const supabase = supabaseRef.current;
    const markRead = () =>
      supabase
        .from("conversation_members")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", currentUserId);
    markRead();

    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      // Authorize this realtime socket so RLS-filtered postgres_changes reach us.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      if (session?.access_token) supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel(`room:${conversationId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
          (payload) => {
            const m = payload.new as Msg;
            setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
            markRead();
          },
        )
        .subscribe();
    })();

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setText("");
    const { error } = await supabaseRef.current
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: currentUserId, body });
    setSending(false);
    if (error) setText(body);
  }

  let lastDay = "";
  return (
    <div className="flex h-[calc(100dvh-8.5rem)] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card elevate">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        {backHref && (
          <Link href={backHref} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <div className="min-w-0">
          <p className="truncate font-display font-semibold text-foreground">{title}</p>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-muted-foreground">No messages yet. Say hello 👋</p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          const sender = senders[m.sender_id];
          const day = dayLabel(m.created_at);
          const showDay = day !== lastDay;
          lastDay = day;
          return (
            <div key={m.id}>
              {showDay && (
                <div className="my-3 flex justify-center">
                  <span className="rounded-full bg-muted px-3 py-0.5 text-xs text-muted-foreground">{day}</span>
                </div>
              )}
              <div className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
                {!mine && <Avatar name={sender?.full_name} email={sender?.email} src={sender?.avatar_url} size={28} className="mb-4" />}
                <div className={cn("max-w-[78%] rounded-2xl px-3.5 py-2", mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted text-foreground")}>
                  {!mine && showSenderNames && (
                    <p className="mb-0.5 text-xs font-semibold text-primary">{sender?.full_name ?? "Member"}</p>
                  )}
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                    <Linkify text={m.body} />
                  </p>
                  <p className={cn("mt-1 text-right text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {fmtTime(m.created_at)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form onSubmit={send} className="relative flex items-end gap-2 border-t border-border p-3">
        {emojiOpen && (
          <div className="absolute bottom-16 left-3 z-10 grid grid-cols-8 gap-1 rounded-xl border border-border bg-popover p-2 elevate-lg">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  setText((t) => t + e);
                  setEmojiOpen(false);
                }}
                className="rounded-md p-1 text-lg hover:bg-muted"
              >
                {e}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => setEmojiOpen((o) => !o)}
          aria-label="Add emoji"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"
        >
          <SmilePlus className="h-5 w-5" />
        </button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="Write a message…"
          className="max-h-32 min-h-[2.5rem] flex-1 resize-none rounded-xl border border-input bg-surface px-3 py-2.5 text-sm outline-none focus:border-ring"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          aria-label="Send message"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
