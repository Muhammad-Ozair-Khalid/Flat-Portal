import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ListChecks,
  MessageSquareText,
  MessagesSquare,
  MapPinned,
  MapPin,
  Bell,
  ScrollText,
  Megaphone,
  Home,
  User,
  DoorOpen,
  Wallet,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Administrators", href: "/admin/administrators", icon: ShieldCheck },
  { label: "Flat 408", href: "/admin/rooms", icon: DoorOpen },
  { label: "Tasks", href: "/admin/tasks", icon: ListChecks },
  { label: "Ledger", href: "/ledger", icon: Wallet },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { label: "Locations", href: "/admin/locations", icon: MapPinned },
  { label: "Group chat", href: "/chat", icon: MessagesSquare },
  { label: "Messages", href: "/messages", icon: MessageSquareText },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Audit logs", href: "/admin/audit", icon: ScrollText },
];

export const memberNav: NavItem[] = [
  { label: "Home", href: "/home", icon: Home, exact: true },
  { label: "Flat 408", href: "/rooms", icon: DoorOpen },
  { label: "My tasks", href: "/tasks", icon: ListChecks },
  { label: "Ledger", href: "/ledger", icon: Wallet },
  { label: "Group chat", href: "/chat", icon: MessagesSquare },
  { label: "Messages", href: "/messages", icon: MessageSquareText },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "My profile", href: "/profile", icon: User },
  { label: "Location", href: "/location", icon: MapPin },
];

export function navFor(role: string): NavItem[] {
  return role === "admin" ? adminNav : memberNav;
}
