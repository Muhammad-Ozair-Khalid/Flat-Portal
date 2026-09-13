"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MapPinned, MapPinOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { fromNow } from "@/lib/format";

const FlatMap = dynamic(() => import("@/components/map/flat-map"), {
  ssr: false,
  loading: () => <div className="h-[460px] animate-pulse rounded-xl bg-muted" />,
});

type Row = {
  userId: string;
  name: string;
  avatar_url: string | null;
  sharing_enabled: boolean;
  latitude: number | null;
  longitude: number | null;
  updated_at: string | null;
};

export function LocationsDashboard({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let active = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      if (session?.access_token) supabase.realtime.setAuth(session.access_token);
      channel = supabase
        .channel("admin-locations")
        .on("postgres_changes", { event: "*", schema: "public", table: "locations" }, (payload) => {
          const n = (payload.new ?? {}) as Partial<Row> & { user_id?: string };
          const uid = n.user_id ?? (payload.old as { user_id?: string })?.user_id;
          if (!uid) return;
          setRows((prev) =>
            prev.map((r) =>
              r.userId === uid
                ? {
                    ...r,
                    sharing_enabled: n.sharing_enabled ?? false,
                    latitude: n.latitude ?? null,
                    longitude: n.longitude ?? null,
                    updated_at: (n as { updated_at?: string }).updated_at ?? r.updated_at,
                  }
                : r,
            ),
          );
        })
        .subscribe();
    })();
    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const sharing = rows.filter((r) => r.sharing_enabled && r.latitude != null && r.longitude != null);
  const markers = sharing.map((r) => ({
    id: r.userId,
    name: r.name,
    lat: r.latitude!,
    lng: r.longitude!,
    updatedAt: r.updated_at,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3">
          <p className="font-display font-semibold text-foreground">Map</p>
          <Badge tone={sharing.length ? "success" : "neutral"} dot>
            {sharing.length} sharing now
          </Badge>
        </div>
        <div className="h-[460px] border-t border-border">
          {markers.length > 0 ? (
            <FlatMap markers={markers} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <EmptyState icon={MapPinOff} title="No one is sharing" description="Members who turn on location sharing will appear here." />
            </div>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="px-5 py-3">
          <p className="font-display font-semibold text-foreground">Members</p>
        </div>
        <ul className="divide-y divide-border/60 border-t border-border">
          {rows.length === 0 && (
            <li className="p-6">
              <EmptyState icon={MapPinned} title="No members" description="Add members to the flat first." />
            </li>
          )}
          {rows.map((r) => (
            <li key={r.userId} className="flex items-center gap-3 px-5 py-3">
              <Avatar name={r.name} src={r.avatar_url} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">
                  {r.sharing_enabled && r.updated_at ? `Updated ${fromNow(r.updated_at)}` : "Not sharing"}
                </p>
              </div>
              {r.sharing_enabled && r.latitude != null ? (
                <Badge tone="success" dot>Live</Badge>
              ) : (
                <Badge tone="neutral">Off</Badge>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
