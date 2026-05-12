import Link from "next/link";

import { LogoWithWordmark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/" className="transition-colors hover:text-primary">
          <LogoWithWordmark />
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="px-6 py-8 text-center text-xs text-muted-foreground sm:px-10">
        General coaching, not therapy or medical advice.
      </footer>
    </div>
  );
}
