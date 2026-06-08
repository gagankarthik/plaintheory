import { getCurrentUser } from "@/lib/auth/session";
import { getLocalDate } from "@/lib/date";
import { listFinanceEntries } from "@/lib/db/finance";

import { DashboardView } from "./_components/dashboard-view";

export const dynamic = "force-dynamic";

export default async function FinanceDashboardPage() {
  const session = await getCurrentUser();
  if (!session) return null;

  const [entries, date] = await Promise.all([
    listFinanceEntries(session.userId, { limit: 500 }),
    getLocalDate(),
  ]);

  return <DashboardView key={date} initialEntries={entries} today={date} />;
}
