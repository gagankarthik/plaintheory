import Link from "next/link";

import { LogoWithWordmark } from "@/components/brand/logo";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/">
          <LogoWithWordmark />
        </Link>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-6 py-8 text-sm leading-relaxed sm:px-10 sm:py-12">
        <h1 className="font-serif text-3xl tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: May 11, 2026.</p>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">What we collect</h2>
          <p>
            Account email; the focus areas, goals, routine, and dietary notes you enter
            during onboarding; the logs you create; the messages you send our AI coach. We
            don&rsquo;t collect anything we don&rsquo;t need for the product to work.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">Where it lives</h2>
          <p>
            Your data is stored encrypted at rest with customer-managed keys (AWS KMS) in
            DynamoDB, in the us-east-2 region. Transit is TLS. We do not sell data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">AI providers</h2>
          <p>
            We send relevant context to OpenAI to generate your daily plan and chat
            responses. They receive only what&rsquo;s needed for the request. You can
            export or delete your data anytime in Settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">Your controls</h2>
          <p>
            Export your data in JSON from Settings. Delete your account from Settings —
            soft-deleted for 30 days, then permanently removed.
          </p>
        </section>

        <p className="pt-4 text-xs text-muted-foreground">
          Stub for v1. Replace with legal-reviewed text before public launch.
        </p>
      </main>
    </div>
  );
}
