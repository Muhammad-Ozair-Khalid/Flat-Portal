"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BedDouble,
  Tv,
  UtensilsCrossed,
  Bath,
  Refrigerator,
  Users,
  Pencil,
  Check,
  X,
  Info,
} from "lucide-react";
import {
  ROOMS,
  MEMBER_COUNT,
  membersByRoom,
  rimStyle,
  type Member,
  type Room,
  type RoomKind,
} from "@/lib/flat";
import { RoomScene, type RoomVariant } from "@/components/experience/room-scene";
import { Tilt3D } from "@/components/ui/tilt";
import { Reveal } from "@/components/motion/reveal";

const STORAGE_KEY = "flat408-room-names";

const KIND_ICON: Record<RoomKind, LucideIcon> = {
  bedroom: BedDouble,
  lounge: Tv,
  kitchen: UtensilsCrossed,
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (!first) return "?";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const last = parts[parts.length - 1] ?? first;
  return ((first[0] ?? "") + (last[0] ?? "")).toUpperCase();
}

/**
 * The interactive 3D floor of Flat 408, shared by the member and admin
 * sections. Each of the six rooms is a neon "night" tile whose door swings open
 * on hover/keyboard-focus to reveal the room behind it. Bedrooms list their
 * occupant seats (2/2/2/3) with an attached-washroom badge; the kitchen shows
 * its fridge. Admins can type a real person into any seat — saved to this
 * device now, ready to sync once Supabase is wired up.
 */
export function FlatFloor({ role }: { role: "member" | "admin" }) {
  const isAdmin = role === "admin";
  const [names, setNames] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setNames(JSON.parse(raw) as Record<string, string>);
    } catch {
      /* ignore malformed storage */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
    } catch {
      /* storage may be unavailable */
    }
  }, [names, loaded]);

  const filledCount = useMemo(
    () => Object.values(names).filter((v) => v.trim()).length,
    [names],
  );

  function setName(id: string, value: string) {
    setNames((prev) => {
      const next = { ...prev };
      const v = value.trim();
      if (v) next[id] = v;
      else delete next[id];
      return next;
    });
  }

  return (
    <div>
      {/* Summary + local-demo banner */}
      <Reveal variant="up">
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <BedDouble className="h-4 w-4 text-primary" /> 4 bedrooms
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Tv className="h-4 w-4 text-accent" /> TV lounge
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UtensilsCrossed className="h-4 w-4 text-accent" /> Kitchen + fridge
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4 text-accent" /> {MEMBER_COUNT} members
            </span>
          </div>
          <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            {isAdmin
              ? `Local demo — ${filledCount}/${MEMBER_COUNT} named on this device. Connect Supabase to sync.`
              : "Names are placeholders until an admin adds real people."}
          </p>
        </div>
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {ROOMS.map((room, i) => (
          <Reveal key={room.id} variant="up" delay={i * 60}>
            <RoomTile
              room={room}
              isAdmin={isAdmin}
              names={names}
              onSetName={setName}
            />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function RoomTile({
  room,
  isAdmin,
  names,
  onSetName,
}: {
  room: Room;
  isAdmin: boolean;
  names: Record<string, string>;
  onSetName: (id: string, value: string) => void;
}) {
  const Icon = KIND_ICON[room.kind];
  const occupants = room.kind === "bedroom" ? membersByRoom(room.id) : [];

  return (
    <Tilt3D max={5} className="h-full">
      <div
        style={rimStyle(room.hue)}
        className="glass-panel neon-edge group relative flex h-full flex-col overflow-hidden rounded-3xl"
      >
        {/* 3D doorway — swings open on hover / keyboard focus */}
        <div className="scene-3d relative h-44 overflow-hidden">
          <div className="absolute inset-0">
            <RoomScene
              variant={room.kind as RoomVariant}
              accent={`var(--${room.hue})`}
              className="h-full w-full"
            />
            <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_42%,transparent,rgba(6,4,24,0.5))]" />
          </div>

          <div className="absolute inset-0 [perspective:1200px]">
            <div className="door-slab backface-hidden absolute inset-0 origin-left p-4 transition-transform duration-[650ms] ease-[cubic-bezier(0.34,1,0.42,1)] group-hover:[transform:rotateY(-80deg)] group-focus-within:[transform:rotateY(-80deg)]">
              <div className="flex h-full flex-col">
                <div className="nameplate flex h-8 w-fit items-center gap-2 rounded-md px-3">
                  <Icon className="h-4 w-4 text-[#eae8ff]" />
                  <span className="font-display text-sm font-bold tracking-wide text-[#eae8ff]">
                    {room.label}
                  </span>
                </div>
                <div className="door-panel mt-3 grow" />
                <div
                  className="brass absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          <span className="pointer-events-none absolute bottom-2 right-3 text-[10px] font-medium uppercase tracking-[0.2em] text-white/80 opacity-100 transition-opacity duration-300 group-hover:opacity-0">
            Hover to open
          </span>
        </div>

        {/* Body */}
        <div className="flex grow flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-lg font-bold text-[#eae8ff]">{room.label}</h3>
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: `var(--${room.hue})`, boxShadow: `0 0 10px var(--${room.hue})` }}
              aria-hidden="true"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {room.washroom && <Badge icon={Bath}>Attached washroom</Badge>}
            {room.hasFridge && <Badge icon={Refrigerator}>Fridge</Badge>}
            {room.kind === "bedroom" ? (
              <Badge icon={Users}>{room.capacity} beds</Badge>
            ) : (
              <Badge icon={Users}>Shared by all {MEMBER_COUNT}</Badge>
            )}
          </div>

          {room.kind === "bedroom" ? (
            <ul className="mt-1 flex flex-col gap-2">
              {occupants.map((m) => (
                <Seat
                  key={m.id}
                  member={m}
                  value={names[m.id] ?? ""}
                  isAdmin={isAdmin}
                  onSetName={onSetName}
                />
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm leading-relaxed text-[#b9b3e8]">{room.blurb}</p>
          )}
        </div>
      </div>
    </Tilt3D>
  );
}

function Badge({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-[#c9c2ff]">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

function Seat({
  member,
  value,
  isAdmin,
  onSetName,
}: {
  member: Member;
  value: string;
  isAdmin: boolean;
  onSetName: (id: string, value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const filled = value.trim().length > 0;

  function open() {
    setDraft(value);
    setEditing(true);
  }
  function save() {
    onSetName(member.id, draft);
    setEditing(false);
  }
  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  return (
    <li className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
        style={{
          backgroundColor: "color-mix(in oklab, var(--rim) 26%, transparent)",
          color: "#fff",
          boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--rim) 55%, transparent)",
        }}
      >
        {filled ? initialsOf(value) : member.initials}
      </span>

      {editing ? (
        <form
          className="flex min-w-0 flex-1 items-center gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && cancel()}
            placeholder="Real name"
            aria-label={`Name for a seat in ${member.roomId}`}
            className="min-w-0 flex-1 rounded-md border border-white/15 bg-[#0d0a2c] px-2 py-1 text-sm text-[#eae8ff] outline-none placeholder:text-[#7d76a8] focus:border-[color:var(--rim)]"
          />
          <button
            type="submit"
            className="press rounded-md p-1.5 text-[#a3e635] hover:bg-white/10"
            aria-label="Save name"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={cancel}
            className="press rounded-md p-1.5 text-[#c9c2ff] hover:bg-white/10"
            aria-label="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <>
          <span className="min-w-0 flex-1">
            {filled ? (
              <span className="block truncate text-sm font-semibold text-[#eae8ff]">{value}</span>
            ) : (
              <span className="block truncate text-sm italic text-[#9a93c9]">
                {member.name} · seat open
              </span>
            )}
          </span>
          {isAdmin && (
            <button
              type="button"
              onClick={open}
              className="press rounded-md p-1.5 text-[#c9c2ff] hover:bg-white/10"
              aria-label={filled ? `Edit ${value}` : "Add a person to this seat"}
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </>
      )}
    </li>
  );
}
