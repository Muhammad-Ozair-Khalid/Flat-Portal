import type { Database } from "./supabase/types";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Insert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Update<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

export type Profile = Tables<"profiles">;
export type PublicProfile = Database["public"]["Views"]["public_profiles"]["Row"];
export type Task = Tables<"tasks">;
export type TaskAssignment = Tables<"task_assignments">;
export type Conversation = Tables<"conversations">;
export type ConversationMember = Tables<"conversation_members">;
export type Message = Tables<"messages">;
export type Notification = Tables<"notifications">;
export type Announcement = Tables<"announcements">;
export type LocationRow = Tables<"locations">;
export type AuditLog = Tables<"audit_logs">;

export type AccountStatus = Enums<"account_status">;
export type TaskStatus = Enums<"task_status">;
export type TaskPriority = Enums<"task_priority">;
export type NotificationType = Enums<"notification_type">;
export type ConversationType = Enums<"conversation_type">;

export type Role = "admin" | "member";
