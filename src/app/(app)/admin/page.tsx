import Link from "next/link";
import {
  Users,
  UserCheck,
  UserPlus,
  ListChecks,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ArrowRight,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { StatTile } from "@/components/ui/stat-tile";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { GreetingHero } from "@/components/app/greeting-hero";
import { FlatGlance } from "@/components/experience/flat-glance";
import { Reveal } from "@/components/motion/reveal";
import { SpringStagger, StaggerItem } from "@/components/motion/spring-in";
import { describeAudit } from "@/lib/audit-labels";
import { fromNow, fmtDate } from "@/lib/format";
import type { TaskPriority, TaskStatus } from "@/lib/types";

type AuditRow = {
  id: string;
  action: string;
  target_type: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
  actor: { full_name: string | null; email: string; avatar_url: string | null } | null;
};
type TaskRow = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string | null;
  created_at: string;
};

export default async function AdminDashboard() {
  const { profile, supabase } = await requireAdmin();

  const [totalUsers, activeUsers, pendingUsers, pendingTasks, completedTasks, overdueTasks] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("account_status", "active"),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("account_status", "pending"),
      supabase.from("tasks").select("id", { count: "exact", head: true }).in("status", ["pending", "in_progress"]),
      supabase.from("tasks").select("id", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("tasks").select("id", { count: "exact", head: true }).eq("status", "overdue"),
    ]);

  const { data: auditData } = await supabase
    .from("audit_logs")
    .select("id, action, target_type, created_at, metadata, actor:profiles!audit_logs_actor_id_fkey(full_name, email, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(7);
  const audit = (auditData ?? []) as unknown as AuditRow[];

  const { data: taskData } = await supabase
    .from("tasks")
    .select("id, title, status, priority, deadline, created_at")
    .order("created_at", { ascending: false })
    .limit(5);
  const recentTasks = (taskData ?? []) as unknown as TaskRow[];

  const firstName = profile.full_name?.split(" ")[0] ?? "there";

  return (
    <div>
      <GreetingHero title={`Welcome back, ${firstName}`} subtitle="Here's how the flat is doing today." />

      <SpringStagger className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StaggerItem className="h-full"><StatTile label="Members" value={totalUsers.count ?? 0} icon={Users} tone="primary" href="/admin/users" /></StaggerItem>
        <StaggerItem className="h-full"><StatTile label="Active" value={activeUsers.count ?? 0} icon={UserCheck} tone="success" href="/admin/users" /></StaggerItem>
        <StaggerItem className="h-full"><StatTile label="Pending approval" value={pendingUsers.count ?? 0} icon={UserPlus} tone="warning" href="/admin/users" hint={pendingUsers.count ? "Needs your review" : undefined} /></StaggerItem>
        <StaggerItem className="h-full"><StatTile label="Open tasks" value={pendingTasks.count ?? 0} icon={ListChecks} tone="info" href="/admin/tasks" /></StaggerItem>
        <StaggerItem className="h-full"><StatTile label="Completed" value={completedTasks.count ?? 0} icon={CheckCircle2} tone="success" href="/admin/tasks" /></StaggerItem>
        <StaggerItem className="h-full"><StatTile label="Overdue" value={overdueTasks.count ?? 0} icon={AlertTriangle} tone="danger" href="/admin/tasks" hint={overdueTasks.count ? "Past deadline" : undefined} /></StaggerItem>
      </SpringStagger>

      <Reveal variant="up" className="mt-6 block">
        <FlatGlance href="/admin/rooms" />
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Reveal variant="left">
          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <Link href="/admin/audit" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Audit log <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardBody>
              {audit.length === 0 ? (
                <EmptyState icon={Activity} title="No activity yet" description="Admin actions will show up here." />
              ) : (
                <ul className="space-y-1">
                  {audit.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/60">
                      <Avatar name={a.actor?.full_name} email={a.actor?.email} src={a.actor?.avatar_url} size={32} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground">
                          <span className="font-medium">{a.actor?.full_name ?? "System"}</span>{" "}
                          <span className="text-muted-foreground">{describeAudit(a.action)}</span>
                          {typeof a.metadata?.title === "string" && <span className="text-muted-foreground"> · {a.metadata.title as string}</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{fromNow(a.created_at)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </Reveal>

        <Reveal variant="right">
          <Card>
            <CardHeader>
              <CardTitle>Latest tasks</CardTitle>
              <Link href="/admin/tasks" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                All tasks <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardBody>
              {recentTasks.length === 0 ? (
                <EmptyState icon={ListChecks} title="No tasks yet" description="Create a task to get the flat moving." />
              ) : (
                <ul className="space-y-2">
                  {recentTasks.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{t.deadline ? `Due ${fmtDate(t.deadline)}` : "No deadline"}</p>
                      </div>
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
