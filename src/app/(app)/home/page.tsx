import Link from "next/link";
import {
  ListTodo,
  Loader,
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
  Megaphone,
  ArrowRight,
} from "lucide-react";
import { requireMember } from "@/lib/auth";
import { StatTile } from "@/components/ui/stat-tile";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { GreetingHero } from "@/components/app/greeting-hero";
import { FlatGlance } from "@/components/experience/flat-glance";
import { Reveal } from "@/components/motion/reveal";
import { fmtDate, fromNow, isOverdue } from "@/lib/format";
import type { TaskPriority, TaskStatus } from "@/lib/types";

type MiniTask = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string | null;
  created_at: string;
};

export default async function MemberHome() {
  const { profile, supabase } = await requireMember();

  const { data: assignmentRows } = await supabase
    .from("task_assignments")
    .select("tasks(id, title, status, priority, deadline, created_at)")
    .eq("assignee_id", profile.id);

  const myTasks = ((assignmentRows ?? []) as unknown as { tasks: MiniTask | null }[])
    .map((r) => r.tasks)
    .filter((t): t is MiniTask => !!t);

  const counts = {
    open: myTasks.filter((t) => t.status === "pending").length,
    inProgress: myTasks.filter((t) => t.status === "in_progress").length,
    completed: myTasks.filter((t) => t.status === "completed").length,
    overdue: myTasks.filter((t) => t.status === "overdue").length,
  };

  const upcoming = myTasks
    .filter((t) => t.status !== "completed" && t.status !== "cancelled")
    .sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    })
    .slice(0, 5);

  const { data: annData } = await supabase
    .from("announcements")
    .select("id, title, body, created_at, created_by")
    .order("created_at", { ascending: false })
    .limit(3);
  const announcements = annData ?? [];

  const authorIds = [...new Set(announcements.map((a) => a.created_by).filter(Boolean))] as string[];
  const { data: authors } = authorIds.length
    ? await supabase.from("public_profiles").select("id, full_name").in("id", authorIds)
    : { data: [] };
  const authorName = new Map((authors ?? []).map((a) => [a.id, a.full_name]));

  const firstName = profile.full_name?.split(" ")[0] ?? "there";

  return (
    <div>
      <GreetingHero title={`Hi ${firstName} 👋`} subtitle="Here's what's on your plate today." />

      <Reveal variant="up">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="To do" value={counts.open} icon={ListTodo} tone="info" href="/tasks" />
          <StatTile label="In progress" value={counts.inProgress} icon={Loader} tone="primary" href="/tasks" />
          <StatTile label="Completed" value={counts.completed} icon={CheckCircle2} tone="success" href="/tasks" />
          <StatTile label="Overdue" value={counts.overdue} icon={AlertTriangle} tone="danger" href="/tasks" hint={counts.overdue ? "Needs attention" : undefined} />
        </div>
      </Reveal>

      <Reveal variant="up" className="mt-6 block">
        <FlatGlance href="/rooms" />
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Reveal variant="left">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming tasks</CardTitle>
              <Link href="/tasks" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                All tasks <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardBody>
              {upcoming.length === 0 ? (
                <EmptyState icon={CalendarClock} title="You're all caught up" description="No open tasks assigned to you." />
              ) : (
                <ul className="space-y-2">
                  {upcoming.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{t.title}</p>
                        <p className={`text-xs ${isOverdue(t.deadline) && t.status !== "completed" ? "text-danger" : "text-muted-foreground"}`}>
                          {t.deadline ? `Due ${fmtDate(t.deadline)}` : "No deadline"}
                        </p>
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

        <Reveal variant="right">
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
            </CardHeader>
            <CardBody>
              {announcements.length === 0 ? (
                <EmptyState icon={Megaphone} title="Nothing new" description="Flat announcements will appear here." />
              ) : (
                <ul className="space-y-3">
                  {announcements.map((a) => (
                    <li key={a.id} className="rounded-lg border border-border/60 p-3">
                      <div className="flex items-start gap-2">
                        <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">{a.title}</p>
                          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{a.body}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {authorName.get(a.created_by ?? "") ?? "Admin"} · {fromNow(a.created_at)}
                          </p>
                        </div>
                      </div>
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
