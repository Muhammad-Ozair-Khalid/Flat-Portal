import { requireMember } from "@/lib/auth";
import { LedgerBook } from "@/components/ledger/ledger-book";

export default async function LedgerPage() {
  await requireMember();
  return <LedgerBook />;
}
