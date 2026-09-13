import { z } from "zod";

export const inviteSchema = z.object({
  email: z
    .email({ message: "Enter a valid email address." })
    .transform((e) => e.trim().toLowerCase()),
});

export const userStatusSchema = z.object({
  account_status: z.enum(["active", "inactive"]),
});

export const taskCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  assignee_id: z.string().uuid("Choose who to assign this to."),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  start_at: z.string().datetime().optional().or(z.literal("")),
  deadline: z.string().datetime().optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const taskUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(4000).nullable().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: z.enum(["pending", "in_progress", "completed", "overdue", "cancelled"]).optional(),
  deadline: z.string().datetime().nullable().optional(),
  start_at: z.string().datetime().nullable().optional(),
  assignee_id: z.string().uuid().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export const memberTaskUpdateSchema = z.object({
  status: z.enum(["in_progress", "completed"]),
  completion_note: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const messageSchema = z.object({
  conversation_id: z.string().uuid(),
  body: z.string().trim().min(1, "Message can't be empty.").max(4000),
});

export const announcementSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  body: z.string().trim().min(1, "Say something.").max(4000),
});

export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).max(100000).optional(),
});
