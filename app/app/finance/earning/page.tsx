import { getCurrentUser } from "@/lib/auth/session";
import { getLocalDate } from "@/lib/date";
import { listFinanceEntries } from "@/lib/db/finance";

import { LedgerView } from "../_components/ledger-view";

export const dynamic = "force-dynamic";

export default async function FinanceEarningPage() {
  const session = await getCurrentUser();
  if (!session) return null;

  const [entries, date] = await Promise.all([
    listFinanceEntries(session.userId, { limit: 500 }),
    getLocalDate(),
  ]);

  return <LedgerView key={date} kind="earning" initialEntries={entries} today={date} />;
}
