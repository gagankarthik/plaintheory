import { getCurrentUser } from "@/lib/auth/session";
import { getLocalDate } from "@/lib/date";
import { listFinanceEntries } from "@/lib/db/finance";

import { ReportsView } from "./_components/reports-view";

export const dynamic = "force-dynamic";

export default async function FinanceReportsPage() {
  const session = await getCurrentUser();
  if (!session) return null;

  const [entries, date] = await Promise.all([
    listFinanceEntries(session.userId, { limit: 500 }),
    getLocalDate(),
  ]);
  return <ReportsView initialEntries={entries} today={date} />;
}
