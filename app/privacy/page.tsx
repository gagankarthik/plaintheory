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
            Your email; the focus areas, goals, body metrics, daily rhythm, and dietary
            notes you enter; the logs you create; the messages you send our AI coach. We
            don&rsquo;t collect anything we don&rsquo;t need to make the product work.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">Where it lives</h2>
          <p>
            Stored encrypted at rest with customer-managed keys (AWS KMS) in DynamoDB,{" "}
            <strong>us-east-2</strong>. Transit is TLS 1.3. We do not sell or share your
            data with advertisers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">Sub-processors</h2>
          <p>
            We use a small set of vendors who process data on our behalf:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-foreground">
            <li>
              <strong>AWS</strong> (US) — hosting, encryption, identity (Cognito).
            </li>
            <li>
              <strong>OpenAI</strong> (US) — generates your daily plan and chat replies.
              We send only the context required for each request.
            </li>
            <li>
              <strong>Stripe</strong> (US) — payment processing if you upgrade.
            </li>
            <li>
              <strong>Vercel</strong> (US) — hosts the web app.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">Your rights (GDPR / CCPA)</h2>
          <p>
            You have the right to access, correct, export, and delete your data. We make
            these one-click:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-foreground">
            <li>
              <strong>Access &amp; export:</strong> Settings → Download my data. Returns a
              JSON file with every record we hold on you.
            </li>
            <li>
              <strong>Correct:</strong> change anything in Profile, Goals, or Settings.
            </li>
            <li>
              <strong>Delete:</strong> Settings → Delete my account. Soft-deleted for 30
              days (so you can recover), then permanently removed.
            </li>
            <li>
              <strong>Object to processing:</strong> email us — we&rsquo;ll honor it.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">Cookies</h2>
          <p>
            We use only <strong>essential cookies</strong>: a signed httpOnly session
            cookie for sign-in, and your theme preference. No analytics or advertising
            cookies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">Security posture</h2>
          <p>
            Customer-managed KMS keys, point-in-time recovery on the database, TLS
            everywhere, audit logging, MFA available, signed-cookie sessions with rotation.
            We&rsquo;re a small team building toward SOC 2 — we follow the practices, but
            we don&rsquo;t hold the certificate yet.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">A note on health framing</h2>
          <p>
            PlainTheory is <strong>not a medical product</strong>. We do not knowingly
            collect Protected Health Information (PHI). We follow HIPAA-aware practices
            for security and access control, but the product is general-purpose coaching
            and is not a covered entity under HIPAA.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">Children</h2>
          <p>
            PlainTheory is for adults 18+. We do not knowingly collect data from people
            under 18. If you believe we have, please contact us and we&rsquo;ll delete it.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">Contact</h2>
          <p>For privacy questions or to exercise any of the rights above, email us.</p>
        </section>

        <p className="pt-4 text-xs text-muted-foreground">
          Stub for v1. Replace with legal-reviewed text before public launch.
        </p>
      </main>
    </div>
  );
}
