import {
  ArrowRight,
  Calendar,
  Check,
  Compass,
  Droplet,
  Leaf,
  Lock,
  MessageCircle,
  Moon,
  NotebookPen,
  Quote,
  Repeat,
  Scale,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Sun,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { LogoMark, LogoWithWordmark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";

import {
  CountUp,
  FadeIn,
  HoverLift,
  StaggerChildren,
  StaggerItem,
} from "./_components/landing-motion";
import { HeroBackground, SectionDots } from "./_components/landing-bg";

export const metadata: Metadata = {
  title: "PlainTheory — A calm daily coaching companion",
  description:
    "Wake up to a gentle plan, chat with a coach who knows you, and see what's working in a quiet weekly review. Free to start.",
  openGraph: {
    title: "PlainTheory — A calm daily coaching companion",
    description: "Gentle morning plans. A coach that knows you. A quiet weekly review.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const session = await getCurrentUser();
  const signedIn = session !== null;

  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="transition-colors hover:text-primary">
            <LogoWithWordmark />
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#compare" className="hover:text-foreground">Why us</a>
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {signedIn ? (
              <Link href="/app">
                <Button size="sm">Open app <ArrowRight className="size-3.5" /></Button>
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="hidden text-sm font-medium underline-offset-4 hover:underline sm:inline-block"
                >
                  Sign in
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO with mock preview */}
        <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16 lg:pt-24">
          <HeroBackground />
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn>
              <Badge variant="primary" className="mb-5 sm:mb-6">
                <Sparkles className="size-3" /> Now in private beta
              </Badge>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h1 className="font-serif text-[2.5rem] leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
                A calm companion for the life you&rsquo;re building.
              </h1>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
                Wake to a gentle plan. Track mood, water, sleep, weight in 10 seconds. Chat
                with a coach that actually remembers what matters to you.
              </p>
            </FadeIn>
            <FadeIn delay={0.25}>
              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center">
                {signedIn ? (
                  <Link href="/app">
                    <Button size="lg" className="w-full sm:w-auto sm:min-w-[200px]">
                      Open your dashboard <ArrowRight />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/sign-up">
                      <Button size="lg" className="w-full sm:w-auto sm:min-w-[180px]">
                        Start free <ArrowRight />
                      </Button>
                    </Link>
                    <Link href="#how">
                      <Button size="lg" variant="ghost" className="w-full sm:w-auto sm:min-w-[180px]">
                        See how it works
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Free forever for the basics · No card required · 2 minutes to set up
              </p>
            </FadeIn>
          </div>

          {/* MOCK PREVIEW CARD */}
          <FadeIn delay={0.4}>
            <div className="mx-auto mt-12 max-w-3xl px-2 sm:mt-16">
              <div className="rounded-3xl border border-border/60 bg-card/80 p-3 shadow-[0_2px_4px_0_rgb(0_0_0_/_0.04),0_40px_80px_-30px_rgb(0_0_0_/_0.18)] backdrop-blur sm:p-5">
                <div className="grid gap-3 lg:grid-cols-3">
                  {/* Tasks */}
                  <Card className="border-border/60 lg:col-span-2">
                    <CardContent className="space-y-3 p-4 sm:p-5">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        <span>Tuesday — your day</span>
                        <Badge variant="primary" className="text-[10px]">2 / 3 done</Badge>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
                        <div className="h-full w-2/3 rounded-full bg-primary" />
                      </div>
                      <ul className="space-y-2">
                        {[
                          { done: true, emoji: "🥗", text: "Protein-first breakfast" },
                          { done: true, emoji: "🏃", text: "Walk 10 minutes after lunch" },
                          { done: false, emoji: "🌙", text: "Phone off by 9:30pm" },
                        ].map((t) => (
                          <li
                            key={t.text}
                            className="flex items-center gap-3 rounded-xl border border-border/40 bg-card px-3 py-2.5 text-sm"
                          >
                            <span
                              className={
                                t.done
                                  ? "flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                                  : "size-5 shrink-0 rounded-full border-2 border-border"
                              }
                            >
                              {t.done ? <Check className="size-3" strokeWidth={3} /> : null}
                            </span>
                            <span className="text-base">{t.emoji}</span>
                            <span
                              className={t.done ? "text-muted-foreground line-through" : "text-foreground"}
                            >
                              {t.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  {/* Rings + hydration */}
                  <div className="space-y-3">
                    <Card className="border-border/60">
                      <CardContent className="space-y-3 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          Today&rsquo;s rings
                        </p>
                        <div className="relative mx-auto size-24">
                          <svg viewBox="0 0 96 96" className="size-full -rotate-90">
                            <circle cx="48" cy="48" r="36" fill="none" stroke="var(--info)" strokeWidth="6" opacity="0.15" />
                            <circle cx="48" cy="48" r="36" fill="none" stroke="var(--info)" strokeWidth="6" strokeDasharray="226" strokeDashoffset="56" strokeLinecap="round" />
                            <circle cx="48" cy="48" r="26" fill="none" stroke="var(--primary)" strokeWidth="6" opacity="0.15" />
                            <circle cx="48" cy="48" r="26" fill="none" stroke="var(--primary)" strokeWidth="6" strokeDasharray="163" strokeDashoffset="40" strokeLinecap="round" />
                            <circle cx="48" cy="48" r="16" fill="none" stroke="var(--success)" strokeWidth="6" opacity="0.15" />
                            <circle cx="48" cy="48" r="16" fill="none" stroke="var(--success)" strokeWidth="6" strokeDasharray="100" strokeDashoffset="33" strokeLinecap="round" />
                          </svg>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-border/60">
                      <CardContent className="flex items-center gap-3 p-3">
                        <Droplet className="size-6 text-info" />
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            Hydration
                          </p>
                          <p className="font-serif text-xl text-foreground">
                            6 <span className="text-xs text-muted-foreground">/ 8</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* TRUST STRIP */}
        <section className="border-y border-border/40 bg-card/40 px-4 py-8 sm:px-6">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-around gap-x-6 gap-y-3 text-center text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="size-3.5" /> Encrypted
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" /> Export anytime
            </span>
            <span>No card required</span>
            <span>No ads</span>
            <span>Cancel anytime</span>
          </div>
        </section>

        {/* STATS */}
        <section className="px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <StaggerChildren className="grid gap-6 sm:grid-cols-4">
              <StaggerItem className="text-center">
                <p className="font-serif text-4xl text-foreground sm:text-5xl">
                  <CountUp to={2} />
                  <span className="text-primary">m</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">to set up</p>
              </StaggerItem>
              <StaggerItem className="text-center">
                <p className="font-serif text-4xl text-foreground sm:text-5xl">
                  <CountUp to={10} suffix="s" />
                </p>
                <p className="mt-2 text-sm text-muted-foreground">per check-in</p>
              </StaggerItem>
              <StaggerItem className="text-center">
                <p className="font-serif text-4xl text-foreground sm:text-5xl">
                  <CountUp to={8} />
                </p>
                <p className="mt-2 text-sm text-muted-foreground">things to track</p>
              </StaggerItem>
              <StaggerItem className="text-center">
                <p className="font-serif text-4xl text-foreground sm:text-5xl">
                  <CountUp to={9} />
                  <span className="text-primary">+</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">focus areas</p>
              </StaggerItem>
            </StaggerChildren>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="relative border-t border-border/40 bg-card/40 px-4 py-20 sm:px-6 sm:py-24">
          <SectionDots />
          <div className="mx-auto max-w-5xl space-y-10 sm:space-y-12">
            <FadeIn className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                How it works
              </p>
              <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">
                Three small commitments. The rest takes care of itself.
              </h2>
            </FadeIn>
            <StaggerChildren className="grid gap-5 sm:grid-cols-3">
              {STEPS.map((s) => (
                <StaggerItem key={s.n}>
                  <HoverLift>
                    <div className="space-y-3 rounded-3xl border border-border/60 bg-card p-6">
                      <p className="font-serif text-xl text-primary">{s.n}</p>
                      <h3 className="font-serif text-xl tracking-tight">{s.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {s.description}
                      </p>
                    </div>
                  </HoverLift>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* WHAT YOU CAN TRACK */}
        <section className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-5xl space-y-10">
            <FadeIn className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                What you can track
              </p>
              <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">
                Eight signals. Ten seconds each.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Tap a number, add a note, done. Patterns emerge in a week.
              </p>
            </FadeIn>
            <StaggerChildren className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TRACKABLES.map((t) => (
                <StaggerItem key={t.label}>
                  <HoverLift>
                    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card p-5 text-center">
                      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        {t.icon}
                      </span>
                      <p className="font-medium text-foreground">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.unit}</p>
                    </div>
                  </HoverLift>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="features"
          className="relative border-t border-border/40 bg-card/40 px-4 py-20 sm:px-6 sm:py-24"
        >
          <SectionDots />
          <div className="mx-auto max-w-5xl space-y-10">
            <FadeIn className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                What you&rsquo;ll get
              </p>
              <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">
                Gentle structure for unstructured days.
              </h2>
            </FadeIn>
            <StaggerChildren className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <StaggerItem key={f.title}>
                  <HoverLift className="h-full">
                    <Card className="h-full bg-card/60 transition-shadow duration-300 hover:bg-card hover:shadow-[0_2px_4px_0_rgb(0_0_0_/_0.04),0_24px_40px_-20px_rgb(0_0_0_/_0.08)]">
                      <CardContent className="space-y-3 p-6">
                        <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          {f.icon}
                        </div>
                        <h3 className="font-serif text-xl tracking-tight">{f.title}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {f.description}
                        </p>
                      </CardContent>
                    </Card>
                  </HoverLift>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* COMPARISON */}
        <section id="compare" className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-4xl space-y-10">
            <FadeIn className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Why PlainTheory
              </p>
              <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">
                Different from the rest. Quieter, smarter, yours.
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                      <th className="px-4 py-3 text-left font-medium sm:px-6"></th>
                      <th className="px-4 py-3 text-center font-medium text-primary sm:px-6">
                        PlainTheory
                      </th>
                      <th className="px-4 py-3 text-center font-medium sm:px-6">Paper journal</th>
                      <th className="px-4 py-3 text-center font-medium sm:px-6">Generic planner</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground">
                    {COMPARE.map((row) => (
                      <tr key={row.label} className="border-b border-border/30 last:border-0">
                        <td className="px-4 py-3 sm:px-6">{row.label}</td>
                        <td className="px-4 py-3 text-center sm:px-6">
                          <Check className="mx-auto size-4 text-success" />
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground sm:px-6">
                          {row.paper}
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground sm:px-6">
                          {row.planner}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="relative border-t border-border/40 bg-card/40 px-4 py-20 sm:px-6 sm:py-24">
          <SectionDots />
          <div className="mx-auto max-w-5xl space-y-10">
            <FadeIn className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                From early users
              </p>
              <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">
                Real days, gently better.
              </h2>
            </FadeIn>
            <StaggerChildren className="grid gap-5 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <StaggerItem key={t.name}>
                  <Card className="h-full border-border/60">
                    <CardContent className="space-y-4 p-6">
                      <Quote className="size-5 text-primary/40" />
                      <p className="text-sm leading-relaxed text-foreground">{t.quote}</p>
                      <div className="flex items-center gap-3 pt-2">
                        <Avatar seed={t.seed} size={36} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.role}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="size-3.5 fill-warning text-warning" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="border-t border-border/40 px-4 py-20 sm:px-6 sm:py-24"
        >
          <div className="mx-auto max-w-3xl space-y-8">
            <FadeIn className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Common questions
              </p>
              <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">
                The honest answers.
              </h2>
            </FadeIn>
            <StaggerChildren>
              <dl className="space-y-4">
                {FAQS.map((f) => (
                  <StaggerItem key={f.q}>
                    <details className="group rounded-2xl border border-border/60 bg-card px-5 py-4 transition-colors sm:px-6 sm:py-5">
                      <summary className="flex cursor-pointer items-center justify-between gap-3 text-base font-medium text-foreground [&::-webkit-details-marker]:hidden">
                        <span>{f.q}</span>
                        <span className="grid size-7 shrink-0 place-items-center rounded-full border border-border/60 text-muted-foreground transition-transform group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {f.a}
                      </p>
                    </details>
                  </StaggerItem>
                ))}
              </dl>
            </StaggerChildren>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative px-4 py-20 sm:px-6 sm:py-24">
          <SectionDots />
          <FadeIn>
            <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-card to-info/6 px-6 py-12 text-center shadow-[0_1px_3px_0_rgb(0_0_0_/_0.03),0_20px_60px_-20px_rgb(0_0_0_/_0.12)] sm:px-10 sm:py-16">
              <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl dark:bg-primary/8" />
                <div className="absolute -bottom-16 -left-16 size-56 rounded-full bg-info/8 blur-3xl dark:bg-info/6" />
              </div>
              <Calendar className="mx-auto mb-4 size-6 text-primary" />
              <h2 className="font-serif text-2xl tracking-tight sm:text-3xl">
                {signedIn
                  ? "Your dashboard is waiting."
                  : "Tomorrow morning, a plan is waiting."}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {signedIn
                  ? "Pick up where you left off — today's plan, your check-ins, and the coach are all one click away."
                  : "Two minutes to set up tonight. The rest of the week takes care of itself."}
              </p>
              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                {signedIn ? (
                  <Link href="/app">
                    <Button size="lg" className="w-full sm:w-auto sm:min-w-[200px]">
                      Open your dashboard <ArrowRight />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/sign-up">
                      <Button size="lg" className="w-full sm:w-auto sm:min-w-[180px]">
                        Start free
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button size="lg" variant="ghost" className="w-full sm:w-auto sm:min-w-[180px]">
                        See pricing
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </FadeIn>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <LogoWithWordmark />
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                A calm daily-life coaching companion. Coaching, not therapy or medical
                advice.
              </p>
            </div>
            <FooterCol
              title="Product"
              items={[
                { label: "Features", href: "#features" },
                { label: "Pricing", href: "/pricing" },
                { label: "Sign in", href: "/sign-in" },
                { label: "Create account", href: "/sign-up" },
              ]}
            />
            <FooterCol
              title="Resources"
              items={[
                { label: "How it works", href: "#how" },
                { label: "Why PlainTheory", href: "#compare" },
                { label: "FAQ", href: "#faq" },
                { label: "Terms", href: "/terms" },
                { label: "Privacy", href: "/privacy" },
              ]}
            />
            <div className="space-y-3 text-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Made with care
              </p>
              <p className="text-muted-foreground">
                Built calmly. Encrypted at rest. Yours to export anytime.
              </p>
              <p className="text-xs text-muted-foreground">18+ only.</p>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/40 pt-6 text-xs text-muted-foreground sm:flex-row">
            <p className="flex items-center gap-2">
              <LogoMark size={14} className="text-primary" />
              <span>© {new Date().getFullYear()} PlainTheory</span>
            </p>
            <p>General coaching, not therapy or medical advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Tell us what matters",
    description:
      "2 minutes — focus areas, goals, daily rhythm, body metrics, dietary notes.",
  },
  {
    n: "02",
    title: "Wake to a plan",
    description:
      "Three focus tasks, hydration and mood widgets, a gentle nudge — tailored to you.",
  },
  {
    n: "03",
    title: "Log the small stuff",
    description:
      "Mood, water, sleep, weight, focus — ten seconds each. Patterns emerge in a week.",
  },
];

const TRACKABLES = [
  { icon: <Smile className="size-6" />, label: "Mood", unit: "1–5 scale" },
  { icon: <Zap className="size-6" />, label: "Energy", unit: "1–5 scale" },
  { icon: <Sparkles className="size-6" />, label: "Focus", unit: "1–5 scale" },
  { icon: <Moon className="size-6" />, label: "Sleep", unit: "hours" },
  { icon: <Droplet className="size-6" />, label: "Water", unit: "glasses" },
  { icon: <Scale className="size-6" />, label: "Weight", unit: "kg" },
  { icon: <Leaf className="size-6" />, label: "Relax", unit: "1–5 scale" },
  { icon: <Sun className="size-6" />, label: "Ate well", unit: "1–5 scale" },
];

const FEATURES = [
  {
    icon: <Sun className="size-5" />,
    title: "A morning plan that fits",
    description:
      "Three focus tasks tied to the areas you care about, your goals, your rhythm, and your body.",
  },
  {
    icon: <MessageCircle className="size-5" />,
    title: "A coach who knows you",
    description:
      "Chat about meals, focus, sleep, mood. Grounded in what you've told us. Coaching, not therapy.",
  },
  {
    icon: <NotebookPen className="size-5" />,
    title: "Eight quick check-ins",
    description:
      "Mood, energy, focus, sleep, water, weight, relax, ate well — ten seconds each.",
  },
  {
    icon: <Repeat className="size-5" />,
    title: "Achievements and streaks",
    description:
      "Earn calm badges. See streaks. Notice when you slip — without guilt.",
  },
  {
    icon: <Compass className="size-5" />,
    title: "Weekly insights with charts",
    description:
      "KPIs, line + bar charts, and three patterns we noticed across your week.",
  },
  {
    icon: <Leaf className="size-5" />,
    title: "Your data, encrypted",
    description: "Customer-managed KMS keys. Export to JSON or delete anytime.",
  },
];

const COMPARE: { label: string; paper: string; planner: string }[] = [
  { label: "Personalized to your goals", paper: "—", planner: "Templates" },
  { label: "Tracks mood, water, sleep, weight", paper: "—", planner: "Some" },
  { label: "AI coach that remembers you", paper: "—", planner: "—" },
  { label: "Weekly review with charts", paper: "Manual", planner: "Manual" },
  { label: "Apple-style achievement badges", paper: "—", planner: "—" },
  { label: "Encrypted + export your data", paper: "—", planner: "Varies" },
  { label: "10-second check-ins", paper: "—", planner: "Slow" },
];

const TESTIMONIALS = [
  {
    name: "Sam",
    role: "Designer · 32",
    seed: "sam-testimonial",
    quote:
      "For the first time, I'm not starting the day in chaos. Three things to focus on — that's it. It's changed how I feel by 10am.",
  },
  {
    name: "Priya",
    role: "PM · 28",
    seed: "priya-testimonial",
    quote:
      "The water bottle widget is silly and it works. I drink 7 glasses now without thinking. My sleep rating is up by a full point.",
  },
  {
    name: "Marcus",
    role: "Engineer · 41",
    seed: "marcus-testimonial",
    quote:
      "The weekly review is the killer feature. Real patterns I didn't notice — like my focus crashes when I skip breakfast. Small fix.",
  },
];

const FAQS = [
  {
    q: "Is this therapy or medical advice?",
    a: "No. PlainTheory is general life coaching — daily routines, food, focus, sleep, mood patterns. For anything clinical, talk to a qualified professional.",
  },
  {
    q: "Can I use it for free?",
    a: "Yes. Free covers a daily plan, eight check-in types, water + weight tracking, and five chat messages a day. Plus and Premium unlock more.",
  },
  {
    q: "Does the AI remember me between sessions?",
    a: "Yes. Your focus areas, goals, height, weight, activity level, routine, and dietary notes shape every plan and chat reply. Update them in Settings anytime.",
  },
  {
    q: "Does it follow my dietary needs?",
    a: "Yes. Tell it you're vegan, gluten-free, or allergic to something — those rules apply to every plan and chat reply.",
  },
  {
    q: "Where does my data live?",
    a: "Encrypted in DynamoDB in us-east-2 with customer-managed KMS keys. Export to JSON or delete your account anytime from Settings.",
  },
  {
    q: "How are the badges earned?",
    a: "Hexagonal, Apple-style. First check-in, 3-day streak, 7-day streak, 30-day consistency, first complete plan, five complete days, 50 check-ins. More coming.",
  },
];

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div className="space-y-3 text-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.label}>
            <Link
              href={it.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
