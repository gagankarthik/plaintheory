import { getCurrentUser } from "@/lib/auth/session";

import { FinanceTopbar } from "./_components/finance-topbar";

export default async function FinanceLayout({ children }: { children: React.ReactNode }) {
  // Auth is enforced by the parent /app layout; this only needs the email for
  // the avatar / account menu in the finance top bar.
  const session = await getCurrentUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <FinanceTopbar email={session?.email ?? ""} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
