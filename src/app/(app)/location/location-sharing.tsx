"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { MapPin, ShieldCheck, Loader2, Navigation } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fromNow } from "@/lib/format";
import { cn } from "@/lib/utils";

const FlatMap = dynamic(() => import("@/components/map/flat-map"), {
  ssr: false,
  loading: () => <div className="h-[340px] animate-pulse rounded-xl bg-muted" />,
});

type Loc = { sharing_enabled: boolean; latitude: number | null; longitude: number | null; updated_at: string } | null;

export function LocationSharing({
  initial,
  userId,
  userName,
}: {
  initial: Loc;
  userId: string;
  userName: string;
}) {
  const [sharing, setSharing] = useState(initial?.sharing_enabled ?? false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initial?.latitude != null && initial?.longitude != null
      ? { lat: initial.latitude, lng: initial.longitude }
      : null,
  );
  const [updatedAt, setUpdatedAt] = useState<string | null>(initial?.updated_at ?? null);
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const watchId = useRef<number | null>(null);
  const supabase = useRef(createClient());

  const upsert = async (
    lat: number | null,
    lng: number | null,
    accuracy: number | null,
    enabled: boolean,
  ) => {
    await supabase.current
      .from("locations")
      .upsert({ user_id: userId, sharing_enabled: enabled, latitude: lat, longitude: lng, accuracy, updated_at: new Date().toISOString() });
  };

  const stopWatch = () => {
    if (watchId.current != null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  useEffect(() => {
    if (!sharing) return;
    if (!("geolocation" in navigator)) {
      toast.error("Your browser doesn't support location.");
      setSharing(false);
      return;
    }
    setStatus("Getting your location…");
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setUpdatedAt(new Date().toISOString());
        setStatus("Sharing live");
        void upsert(latitude, longitude, accuracy, true);
      },
      (err) => {
        setStatus("");
        setSharing(false);
        toast.error(err.code === err.PERMISSION_DENIED ? "Location permission was denied." : err.message);
      },
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 },
    );
    return stopWatch;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharing]);

  async function toggle() {
    setPending(true);
    try {
      if (sharing) {
        stopWatch();
        setSharing(false);
        setStatus("");
        setCoords(null);
        await upsert(null, null, null, false); // clear coordinates when off
        toast.success("Location sharing turned off.");
      } else {
        setSharing(true); // effect starts the watcher
        toast.success("Location sharing turned on.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                sharing ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-semibold text-foreground">Location sharing</h2>
                {sharing ? <Badge tone="success" dot>On</Badge> : <Badge tone="neutral">Off</Badge>}
              </div>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                When on, your <strong>flat admins</strong> can see your live location. No other member can.
                Turning it off clears your stored location.
              </p>
              {status && <p className="mt-2 text-sm font-medium text-primary">{status}</p>}
            </div>
          </div>

          <button
            type="button"
            onClick={toggle}
            disabled={pending}
            role="switch"
            aria-checked={sharing}
            className={cn(
              "relative h-7 w-12 shrink-0 rounded-full transition-colors",
              sharing ? "bg-primary" : "bg-muted-foreground/40",
            )}
          >
            <span
              className={cn(
                "absolute top-1 h-5 w-5 rounded-full bg-white transition-transform",
                sharing ? "translate-x-6" : "translate-x-1",
              )}
            />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Only administrators can view member locations. This is enforced on the server.
        </div>
      </Card>

      {sharing && coords && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Navigation className="h-4 w-4 text-primary" /> Your current location
            </p>
            {updatedAt && <span className="text-xs text-muted-foreground">Updated {fromNow(updatedAt)}</span>}
          </div>
          <div className="h-[340px]">
            <FlatMap markers={[{ id: userId, name: userName, lat: coords.lat, lng: coords.lng, updatedAt, you: true }]} center={[coords.lat, coords.lng]} zoom={15} />
          </div>
        </Card>
      )}

      {sharing && !coords && (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
          Waiting for your device&rsquo;s location…
        </Card>
      )}
    </div>
  );
}
