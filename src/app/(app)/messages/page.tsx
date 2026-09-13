import { MessageSquareText } from "lucide-react";
import { requireMember } from "@/lib/auth";
import { ComingSoon } from "@/components/app/coming-soon";

export default async function MessagesPage() {
  await requireMember();
  return <ComingSoon title="Messages" description="Your private conversations." icon={MessageSquareText} />;
}
