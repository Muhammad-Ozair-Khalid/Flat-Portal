export const AUDIT_LABELS: Record<string, string> = {
  "task.created": "created a task",
  "task.updated": "updated a task",
  "task.completed": "completed a task",
  "task.deleted": "deleted a task",
  "task.assigned": "assigned a task",
  "user.added": "added a member",
  "user.invited": "invited a member",
  "user.removed": "removed a member",
  "user.activated": "activated a member",
  "user.deactivated": "deactivated a member",
  "user.role_changed": "changed a member's role",
  "announcement.created": "posted an announcement",
};

export function describeAudit(action: string): string {
  return AUDIT_LABELS[action] ?? action.replace(/[._]/g, " ");
}
