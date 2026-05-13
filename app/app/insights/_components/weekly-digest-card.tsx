"use client";

import { Lock, Mail, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";

type Digest = {
  weekStart: string;
  generatedAt: string;
  summary: string;
  workingWell: string;
  tryThis: string;
};

type Props = {
  isPlus: boolean;
};

export function WeeklyDigestCard({ isPlus }: Props) {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPlus) return;
    setLoading(true);
    fetch("/api/digest/weekly", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { digest?: Digest; error?: string }) => {
        if (data.digest) setDigest(data.digest);
        else if (data.error) setError(data.error);
      })
      .catch(() => setError("Couldn't load this week's digest."))
      .finally(() => setLoading(false));
  }, [isPlus]);

  const regenerate = async () => {
    setRegenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/digest/weekly", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't regenerate.");
      setDigest(data.digest);
      toast.success("Digest refreshed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed.");
    } finally {
      setRegenerating(false);
    }
  };

  if (!isPlus) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/8 via-primary/3 to-transparent">
        <CardContent className="space-y-3 px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Mail className="size-3.5" />
            </span>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Weekly digest
            </p>
          </div>
          <p className="font-serif text-xl tracking-tight text-foreground">
            Sunday morning, your week summarized.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Three short paragraphs every week — how the week felt, what was working, one thing to
            try Monday. Anchored to your actual logs and plans.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button size="sm" variant="outline" className="gap-1.5" disabled>
              <Lock className="size-3.5" />
              Plus only
            </Button>
            <Link href="/pricing">
              <Button size="sm" className="gap-1.5">
                <Sparkles className="size-3.5" />
                Unlock with Plus
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-border/60">
        <CardContent className="space-y-3 px-5 py-6 sm:px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Weekly digest
          </p>
          <MultiStepLoader
            steps={[
              "Reading your week…",
              "Spotting patterns…",
              "Writing your digest…",
            ]}
          />
        </CardContent>
      </Card>
    );
  }

  if (!digest) {
    return (
      <Card className="border-border/60">
        <CardContent className="space-y-3 px-5 py-6 sm:px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Weekly digest
          </p>
          <p className="text-sm text-muted-foreground">
            {error ?? "No digest yet for this week."}
          </p>
          <Button onClick={regenerate} size="sm" loading={regenerating} className="gap-1.5">
            <Sparkles className="size-3.5" />
            Generate
          </Button>
        </CardContent>
      </Card>
    );
  }

  const weekLabel = (() => {
    try {
      return new Date(digest.weekStart + "T00:00:00").toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
      });
    } catch {
      return digest.weekStart;
    }
  })();

  return (
    <Card className="border-primary/15 bg-gradient-to-br from-primary/6 via-background to-background">
      <CardContent className="space-y-4 px-5 py-6 sm:px-6 sm:py-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Mail className="size-3.5" />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Weekly digest
              </p>
              <p className="text-xs text-muted-foreground">Week of {weekLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={regenerate}
            disabled={regenerating}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`size-3 ${regenerating ? "animate-spin" : ""}`} />
            {regenerating ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              The week
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{digest.summary}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-success">
              What was working
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{digest.workingWell}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Try this week</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{digest.tryThis}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
