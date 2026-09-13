import { MessagesSquare } from "lucide-react";
import { requireMember } from "@/lib/auth";
import { ComingSoon } from "@/components/app/coming-soon";

export default async function GroupChatPage() {
  await requireMember();
  return <ComingSoon title="Group chat" description="The whole flat in one thread." icon={MessagesSquare} />;
}
