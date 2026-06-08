import {
  ArrowRight,
  BarChart3,
  Calendar,
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
  Wallet,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { LogoMark, LogoWithWordmark } from "@/components/brand/logo";
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
import { CinematicHero } from "./_components/cinematic-hero";
import { SectionDots } from "./_components/landing-bg";
import { LandingHeader } from "./_components/landing-header";

export const metadata: Metadata = {
  title: "PlainTheory — A calm daily companion for life & money",
  description:
    "Wake to a gentle plan, track mood and money in seconds, and see what's working in a quiet review. Free to start.",
  openGraph: {
    title: "PlainTheory — A calm daily companion for life & money",
    description: "Gentle morning plans. Mood & money tracking. A coach that knows you.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const session = await getCurrentUser();
  const signedIn = session !== null;

  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* ── HEADER ───────────────────────────────────────────── */}
      <LandingHeader signedIn={signedIn} />

      <main className="flex-1">
        {/* ── CINEMATIC VIDEO HERO ───────────────────────────── */}
        <CinematicHero signedIn={signedIn} />

        {/* ── TRUST STRIP ────────────────────────────────────── */}
        <section className="border-y border-border/40 bg-card/40 px-4 py-7 sm:px-6">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-around gap-x-6 gap-y-3 text-center text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" /> Free to start, no card
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="size-3.5" /> Export or delete anytime
            </span>
            <span>Coaching, not medical advice</span>
          </div>
        </section>

        {/* ── BENTO FEATURES ─────────────────────────────────── */}
        <section id="features" className="relative scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl space-y-10 sm:space-y-14">
            <FadeIn className="mx-auto max-w-2xl text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Everything in one place
              </p>
              <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-5xl">
                Gentle structure for unstructured days.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Plans, check-ins, a coach, and money — designed to be calm, not noisy.
              </p>
            </FadeIn>

            {/* Bento grid */}
            <StaggerChildren className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Large: morning plan */}
              <StaggerItem className="sm:col-span-2 lg:row-span-2">
                <HoverLift className="h-full">
                  <div className="group relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-primary/4 to-transparent p-6 sm:p-8">
                    <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                      <Sun className="size-5" />
                    </div>
                    <h3 className="mt-5 font-serif text-2xl tracking-tight sm:text-3xl">
                      A morning plan that fits.
                    </h3>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                      Three focus tasks tied to the areas you care about, your goals, your
                      rhythm, and your body — generated fresh each day.
                    </p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-6">
                      {["Focus tasks", "Hydration", "Mood", "Routines"].map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-primary/20 bg-background/60 px-3 py-1 text-xs text-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </HoverLift>
              </StaggerItem>

              {/* Finance — the new feature */}
              <StaggerItem className="sm:col-span-2 lg:col-span-1">
                <HoverLift className="h-full">
                  <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-info/20 bg-gradient-to-br from-info/12 via-info/4 to-transparent p-6">
                    <div className="inline-flex size-10 items-center justify-center rounded-xl bg-info/15 text-info">
                      <Wallet className="size-5" />
                    </div>
                    <h3 className="mt-4 font-serif text-xl tracking-tight">Money, made calm</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Log earnings, expenses, and savings. See daily, monthly, and yearly
                      reports with clean infographics.
                    </p>
                    <Badge variant="info" className="mt-4 w-fit">New</Badge>
                  </div>
                </HoverLift>
              </StaggerItem>

              {FEATURES.map((f) => (
                <StaggerItem key={f.title}>
                  <HoverLift className="h-full">
                    <Card className="h-full bg-card/60 transition-shadow duration-300 hover:bg-card hover:shadow-[0_2px_4px_0_rgb(0_0_0_/_0.04),0_24px_40px_-20px_rgb(0_0_0_/_0.08)]">
                      <CardContent className="flex h-full flex-col gap-3 p-6">
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

        {/* ── WHAT YOU CAN TRACK ─────────────────────────────── */}
        <section className="relative border-y border-border/40 bg-card/40 px-4 py-20 sm:px-6 sm:py-24">
          <SectionDots />
          <div className="mx-auto max-w-5xl space-y-10">
            <FadeIn className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                What you can track
              </p>
              <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">
                Nine signals. Ten seconds each.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Tap a number, add a note, done. Patterns emerge in a week.
              </p>
            </FadeIn>
            <StaggerChildren className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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

        {/* ── HOW IT WORKS ───────────────────────────────────── */}
        <section id="how" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-5xl space-y-12">
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
                  <HoverLift className="h-full">
                    <div className="relative h-full space-y-3 rounded-3xl border border-border/60 bg-card p-6">
                      <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-primary/10 font-serif text-lg text-primary">
                        {s.n}
                      </span>
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

        {/* ── STAT BAND ──────────────────────────────────────── */}
        <section className="relative overflow-hidden border-y border-border/40 px-4 py-16 sm:px-6 sm:py-20">
          <SectionDots />
          <div className="mx-auto grid max-w-4xl gap-8 text-center sm:grid-cols-3">
            {STATS.map((s) => (
              <FadeIn key={s.label}>
                <p className="font-serif text-5xl tracking-tight text-foreground sm:text-6xl">
                  <CountUp to={s.to} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ───────────────────────────────────── */}
        <section className="px-4 py-20 sm:px-6 sm:py-28">
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
                <StaggerItem key={t.name} className="h-full">
                  <Card className="h-full border-border/60">
                    <CardContent className="flex h-full flex-col gap-4 p-6">
                      <Quote className="size-5 text-primary/40" />
                      <p className="flex-1 text-sm leading-relaxed text-foreground">{t.quote}</p>
                      <div className="flex items-center gap-3 pt-2">
                        <Avatar seed={t.seed} size={36} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.role}</p>
                        </div>
                        <div className="ml-auto flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="size-3.5 fill-warning text-warning" />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────── */}
        <section id="faq" className="scroll-mt-20 border-t border-border/40 bg-card/40 px-4 py-20 sm:px-6 sm:py-28">
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
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                    </details>
                  </StaggerItem>
                ))}
              </dl>
            </StaggerChildren>
          </div>
        </section>

        {/* ── FINAL CTA ──────────────────────────────────────── */}
        <section className="relative px-4 py-20 sm:px-6 sm:py-28">
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
                  ? "Pick up where you left off — today's plan, your check-ins, your money, and the coach are all one click away."
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

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-border/40 bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <LogoWithWordmark />
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                A calm daily companion for life and money. Coaching, not therapy or medical
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
    n: "1",
    title: "Tell us what matters",
    description:
      "2 minutes — focus areas, goals, daily rhythm, body metrics, dietary notes.",
  },
  {
    n: "2",
    title: "Wake to a plan",
    description:
      "Three focus tasks, hydration and mood widgets, a gentle nudge — tailored to you.",
  },
  {
    n: "3",
    title: "Log the small stuff",
    description:
      "Mood, water, sleep, money — ten seconds each. Patterns emerge in a week.",
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
  { icon: <Wallet className="size-6" />, label: "Money", unit: "in / out" },
];

const FEATURES = [
  {
    icon: <MessageCircle className="size-5" />,
    title: "A coach who knows you",
    description:
      "Chat about meals, focus, sleep, mood. Grounded in what you've told us. Coaching, not therapy.",
  },
  {
    icon: <NotebookPen className="size-5" />,
    title: "Quick daily check-ins",
    description:
      "Mood, energy, focus, sleep, water, weight, relax, ate well — ten seconds each.",
  },
  {
    icon: <BarChart3 className="size-5" />,
    title: "Weekly insights with charts",
    description:
      "KPIs, line + bar charts, and three patterns we noticed across your week.",
  },
  {
    icon: <Repeat className="size-5" />,
    title: "Habits & streaks",
    description:
      "Build small repeatable actions. Earn calm badges. Notice slips without guilt.",
  },
  {
    icon: <Compass className="size-5" />,
    title: "Goals that stay in view",
    description:
      "Keep what you're working toward front and center — every plan ties back to it.",
  },
  {
    icon: <Leaf className="size-5" />,
    title: "Your data, encrypted",
    description: "Customer-managed KMS keys. Export to JSON or delete anytime.",
  },
];

const STATS = [
  { to: 10, suffix: "s", label: "to log a daily check-in" },
  { to: 9, suffix: "", label: "signals you can track" },
  { to: 3, suffix: "", label: "focus tasks each morning" },
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
      "Logging spending next to my mood was the unlock. I can finally see how money stress and bad sleep feed each other.",
  },
];

const FAQS = [
  {
    q: "Is this therapy or medical advice?",
    a: "No. PlainTheory is general life coaching — daily routines, food, focus, sleep, mood patterns, and money tracking. For anything clinical, talk to a qualified professional.",
  },
  {
    q: "Can I use it for free?",
    a: "Yes. Free covers a daily plan, eight check-in types, water + weight tracking, money tracking, and five chat messages a day. Plus and Premium unlock more.",
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
