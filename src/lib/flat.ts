/**
 * Flat 408 — the single source of truth for the flat's layout and people.
 *
 * Four bedrooms (each with an attached washroom), a TV lounge and a kitchen
 * with a fridge; nine members in total (2 + 2 + 2 in three rooms, 3 in the
 * fourth). Seats start with generic labels that an admin renames from the 3D
 * floor. Everything visual (landing, the 3D flat floor, the ledger) reads from
 * here so there's one place to edit.
 */
import type { CSSProperties } from "react";

export type RoomKind = "bedroom" | "lounge" | "kitchen";

export type Room = {
  id: string;
  kind: RoomKind;
  label: string;
  /** css var name (without leading --) driving the neon accent, e.g. "room-1" */
  hue: string;
  capacity?: number;
  washroom?: boolean;
  hasFridge?: boolean;
  blurb: string;
};

export type Member = {
  id: string;
  name: string;
  roomId: string;
  initials: string;
};

export const FLAT = {
  number: 408,
  name: "Flat 408",
  tagline: "Four rooms, one shared home — in sync.",
} as const;

export const ROOMS: Room[] = [
  { id: "r1", kind: "bedroom", label: "Room 1", hue: "room-1", capacity: 2, washroom: true, blurb: "Two beds, one attached washroom." },
  { id: "r2", kind: "bedroom", label: "Room 2", hue: "room-2", capacity: 2, washroom: true, blurb: "Two beds, one attached washroom." },
  { id: "r3", kind: "bedroom", label: "Room 3", hue: "room-3", capacity: 2, washroom: true, blurb: "Two beds, one attached washroom." },
  { id: "r4", kind: "bedroom", label: "Room 4", hue: "room-4", capacity: 3, washroom: true, blurb: "Three beds, one attached washroom." },
  { id: "lounge", kind: "lounge", label: "TV Lounge", hue: "room-lounge", blurb: "Where the whole flat comes together." },
  { id: "kitchen", kind: "kitchen", label: "Kitchen", hue: "room-kitchen", hasFridge: true, blurb: "Shared cooking, shared fridge." },
];

/** Rooms people actually sleep in (used for occupancy + ledger membership). */
export const BEDROOMS = ROOMS.filter((r) => r.kind === "bedroom");

/**
 * Nine occupant seats, distributed 2/2/2/3 across the bedrooms. Each starts
 * with a generic label ("Roommate 1"…) that an admin renames on the 3D floor.
 */
export const MEMBERS: Member[] = BEDROOMS.flatMap((room, roomIdx) =>
  Array.from({ length: room.capacity ?? 0 }, (_, seat) => {
    const n = BEDROOMS.slice(0, roomIdx).reduce((sum, r) => sum + (r.capacity ?? 0), 0) + seat + 1;
    return {
      id: `m${n}`,
      name: `Roommate ${n}`,
      roomId: room.id,
      initials: `R${n}`,
    };
  }),
);

export const MEMBER_COUNT = MEMBERS.length; // 9

export function membersByRoom(roomId: string): Member[] {
  return MEMBERS.filter((m) => m.roomId === roomId);
}

/** Inline style that recolours a door/room to its neon hue via the --rim var. */
export function rimStyle(hue: string): CSSProperties {
  return { ["--rim" as string]: `var(--${hue})` } as CSSProperties;
}
