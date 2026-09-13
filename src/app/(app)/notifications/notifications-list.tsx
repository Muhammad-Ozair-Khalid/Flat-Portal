"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BellOff, CheckCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { fromNow } from "@/lib/format";
import { notifMeta, notifHref, notifToneChip } from "@/lib/notifications";
import { cn } from "@/lib/utils";

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
};

export function NotificationsList({
  initial,
  isAdmin,
  userId,
  groupConvId,
}: {
  initial: Notif[];
  isAdmin: boolean;
  userId: string;
  groupConvId: string | null;
}) {
  const router = useRouter();
  const [items, setItems] = useState<Notif[]>(initial);
  const supabase = createClient();
  const unread = items.filter((n) => !n.is_read).length;

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let active = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      if (session?.access_token) supabase.realtime.setAuth(session.access_token);
      channel = supabase
        .channel("notif-list")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
          (payload) => {
            const n = payload.new as Notif;
            setItems((prev) => (prev.some((x) => x.id === n.id) ? prev : [n, ...prev]));
          },
        )
        .subscribe();
    })();
    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
    router.refresh();
  }

  function open(n: Notif) {
    if (!n.is_read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      void supabase.from("notifications").update({ is_read: true }).eq("id", n.id).then(() => router.refresh());
    }
    router.push(notifHref(n.type, n.data, isAdmin, groupConvId));
  }

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-muted-foreground">{unread > 0 ? `${unread} unread` : "You're all caught up."}</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <EmptyState icon={BellOff} title="No notifications" description="Task, message and announcement alerts will show up here." />
        </Card>
      ) : (
        <Card className="divide-y divide-border/60 overflow-hidden">
          {items.map((n) => {
            const meta = notifMeta(n.type);
            return (
              <button
                key={n.id}
                onClick={() => open(n)}
                className={cn(
                  "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50",
                  !n.is_read && "bg-primary/[0.04]",
                )}
              >
                <span className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", notifToneChip[meta.tone])}>
                  <meta.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm text-foreground", !n.is_read && "font-semibold")}>{n.title}</p>
                  {n.body && <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{n.body}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">{fromNow(n.created_at)}</p>
                </div>
                {!n.is_read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </button>
            );
          })}
        </Card>
      )}
    </div>
  );
}
