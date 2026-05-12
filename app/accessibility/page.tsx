import Link from "next/link";

import { LogoWithWordmark } from "@/components/brand/logo";

export const metadata = { title: "Accessibility" };

export default function AccessibilityPage() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/">
          <LogoWithWordmark />
        </Link>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-6 py-8 text-sm leading-relaxed sm:px-10 sm:py-12">
        <h1 className="font-serif text-3xl tracking-tight">Accessibility</h1>
        <p className="text-muted-foreground">Last reviewed: May 11, 2026.</p>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">Our commitment</h2>
          <p>
            We build PlainTheory to be usable by everyone. Our internal target is{" "}
            <strong>WCAG 2.1 Level AA</strong>. We&rsquo;re a small team, not perfect — but
            accessibility is a release-blocking concern, not an afterthought.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">What we do</h2>
          <ul className="ml-5 list-disc space-y-1.5 text-foreground">
            <li>Semantic HTML and proper ARIA labels on interactive elements</li>
            <li>Keyboard navigation — every action reachable without a mouse</li>
            <li>Visible focus rings on all focusable elements</li>
            <li>Color contrast meets WCAG AA for body text and large text</li>
            <li>
              Reduced-motion support: when you have <code>prefers-reduced-motion</code>{" "}
              enabled, animations are minimized
            </li>
            <li>Screen-reader-friendly skip-to-content link on every page</li>
            <li>Touch targets sized at least 44×44px (Apple HIG minimum)</li>
            <li>Dark and light themes both meet contrast thresholds</li>
            <li>Form fields with proper labels, hints, and error associations</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">What we&rsquo;re still working on</h2>
          <ul className="ml-5 list-disc space-y-1.5 text-foreground">
            <li>Comprehensive screen-reader testing across NVDA, JAWS, and VoiceOver</li>
            <li>Voice control compatibility audit</li>
            <li>High-contrast theme</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">Tell us if something&rsquo;s broken</h2>
          <p>
            If any part of PlainTheory isn&rsquo;t accessible to you, please email us — we
            treat accessibility bugs as P0. We&rsquo;ll respond within two business days
            and aim to ship a fix within two weeks.
          </p>
        </section>
      </main>
    </div>
  );
}
