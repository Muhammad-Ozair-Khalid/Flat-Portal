import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export function ComingSoon({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={icon}
        title="Being wired up"
        description="This section is under construction and will be connected to live data shortly."
      />
    </div>
  );
}
