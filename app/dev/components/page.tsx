import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ComponentsPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-xl tracking-tight">PlainTheory</span>
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              design system
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-16 px-6 py-16">
        <section className="space-y-3">
          <h1 className="font-serif text-5xl tracking-tight">Components</h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            Reference page for the PlainTheory design system. Every component, every state.
            Available only in development.
          </p>
        </section>

        <Section title="Typography">
          <div className="space-y-5">
            <h1 className="font-serif text-5xl tracking-tight">
              A calm companion for chronic conditions
            </h1>
            <h2 className="font-serif text-3xl tracking-tight">Section title</h2>
            <h3 className="font-serif text-2xl tracking-tight">Card title</h3>
            <p className="text-base text-foreground">
              Body — your daily plan is ready. Three gentle focus actions, one thing to watch for,
              and an evening reflection prompt.
            </p>
            <p className="text-sm text-muted-foreground">
              Caption — Not medical advice. Discuss any concerns with your doctor.
            </p>
          </div>
        </Section>

        <Section title="Buttons">
          <div className="grid gap-6">
            <Row label="Variants">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </Row>
            <Row label="Sizes">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Like">
                <Heart />
              </Button>
            </Row>
            <Row label="With icon">
              <Button>
                Start onboarding <ArrowRight />
              </Button>
              <Button variant="secondary">
                <Sparkles /> Generate plan
              </Button>
            </Row>
            <Row label="States">
              <Button disabled>Disabled</Button>
              <Button loading>Loading</Button>
              <Button loading variant="secondary">
                Saving
              </Button>
            </Row>
          </div>
        </Section>

        <Section title="Inputs">
          <div className="grid max-w-md gap-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disabled">Disabled</Label>
              <Input id="disabled" disabled placeholder="Read-only" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invalid">Invalid</Label>
              <Input id="invalid" aria-invalid placeholder="Required" />
            </div>
          </div>
        </Section>

        <Section title="Badges">
          <Row label="Variants">
            <Badge>Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Calm sleep</Badge>
            <Badge variant="warning">Energy dip</Badge>
            <Badge variant="destructive">Pause</Badge>
            <Badge variant="info">Tip</Badge>
          </Row>
        </Section>

        <Section title="Cards">
          <div className="grid gap-5 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Today&rsquo;s plan</CardTitle>
                <CardDescription>Three focus actions, one thing to watch for.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  A 60–90 word morning briefing appears here, generated from your conditions and
                  yesterday&rsquo;s check-in.
                </p>
              </CardContent>
              <CardFooter>
                <Button>
                  Open plan <ArrowRight />
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Weekly insights</CardTitle>
                <CardDescription>Patterns across the last 7 days.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Stat label="Sleep avg" value="7h 12m" />
                <Stat label="Habit completion" value="82%" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Mood trend</span>
                  <Badge variant="success">Steady</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section title="Dialog">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Before we begin</DialogTitle>
                <DialogDescription>
                  PlainTheory does not provide medical advice and does not replace consultation with
                  a qualified healthcare professional.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button>I understand</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-6 border-t border-border/40 pt-12">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[140px_1fr] sm:items-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
