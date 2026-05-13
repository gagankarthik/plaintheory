import Link from "next/link";

import { LogoWithWordmark } from "@/components/brand/logo";
import { getHomeHref } from "@/lib/auth/session";

export const metadata = { title: "Terms" };
export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const homeHref = await getHomeHref();

  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Link href={homeHref}>
          <LogoWithWordmark />
        </Link>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-6 py-8 text-sm leading-relaxed sm:px-10 sm:py-12">
        <h1 className="font-serif text-3xl tracking-tight">Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: May 11, 2026.</p>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">What PlainTheory is</h2>
        <p>
          PlainTheory is a daily-life coaching companion. It offers general guidance and structure
          for everyday wellness, focus, and routine. It is not therapy, counseling, medical advice,
          or a substitute for any of those.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Who can use it</h2>
        <p>
          You must be at least 18 years old. PlainTheory is available in the US, UK, Canada,
          Australia, and India.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Acceptable use</h2>
        <p>
          Don&rsquo;t use PlainTheory to harass others, share illegal content, attempt to extract
          personal data on other users, or violate any law. We may suspend accounts that do.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">No professional advice</h2>
        <p>
          AI responses are general suggestions. They are not medical, legal, financial, or
          mental-health advice. For anything important, talk to a qualified professional.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Cancellation</h2>
        <p>
          Cancel anytime in account settings. Paid subscriptions continue through the current
          billing period.
        </p>
      </section>

        <p className="pt-4 text-xs text-muted-foreground">
          Stub for v1. Replace with legal-reviewed text before public launch.
        </p>
      </main>
    </div>
  );
}
