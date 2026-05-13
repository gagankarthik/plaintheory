"use client";

import { Scale } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WaterBottle } from "@/components/widgets/water-bottle";
import { cn } from "@/lib/utils";

type LogType =
  | "mood"
  | "energy"
  | "focus"
  | "eat"
  | "relax"
  | "water"
  | "sleep"
  | "weight";

type Log = {
  logId: string;
  timestamp: string;
  symptomType: string;
  severity?: number;
  notes?: string;
};

type LogMeta = {
  type: LogType;
  label: string;
  emoji: string;
  hint: string;
  input: "rating" | "mood" | "water" | "sleep" | "weight";
};

const TYPES: LogMeta[] = [
  { type: "mood", label: "Mood", emoji: "🌤", hint: "How you feel", input: "mood" },
  { type: "energy", label: "Energy", emoji: "⚡", hint: "How much you've got", input: "rating" },
  { type: "focus", label: "Focus", emoji: "🎯", hint: "How sharp", input: "rating" },
  { type: "eat", label: "Ate well", emoji: "🥗", hint: "Satisfied with meals", input: "rating" },
  { type: "relax", label: "Relaxed", emoji: "🧘", hint: "Calm vs wound up", input: "rating" },
  { type: "water", label: "Water", emoji: "💧", hint: "Glasses logged", input: "water" },
  { type: "sleep", label: "Sleep", emoji: "🌙", hint: "Hours last night", input: "sleep" },
  { type: "weight", label: "Weight", emoji: "⚖️", hint: "Today (kg)", input: "weight" },
];

const MOOD_FACES = [
  { value: 1, emoji: "😔", label: "Low" },
  { value: 2, emoji: "😕", label: "Off" },
  { value: 3, emoji: "😐", label: "Steady" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😄", label: "Bright" },
];

export function LogView({
  initialLogs,
  waterToday,
  hydrationTarget,
}: {
  initialLogs: Log[];
  waterToday: number;
  hydrationTarget: number;
}) {
  const [logs, setLogs] = useState<Log[]>(initialLogs);
  const [type, setType] = useState<LogType>("mood");
  const [rating, setRating] = useState<number>(3);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [weightKg, setWeightKg] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const meta = TYPES.find((t) => t.type === type) ?? TYPES[0]!;
  const isWater = meta.input === "water";

  const submit = async () => {
    let severity: number | undefined;
    if (meta.input === "sleep") severity = sleepHours;
    else if (meta.input === "weight") {
      const n = Number(weightKg);
      if (!n || n < 20 || n > 500) {
        toast.error("Enter a weight in kg between 20 and 500.");
        return;
      }
      severity = n;
    } else severity = rating;

    setSaving(true);
    try {
      const res = await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, severity, notes: notes.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setLogs((l) => [data.log, ...l]);
      setNotes("");
      toast.success(`${meta.label} logged.`, { icon: meta.emoji });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="border-border/60">
        <CardContent className="space-y-5 p-4 sm:p-5">
          {/* Type picker */}
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {TYPES.map((t) => (
              <button
                key={t.type}
                type="button"
                onClick={() => setType(t.type)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl border px-1.5 py-3 text-[11px] transition-all duration-200",
                  type === t.type
                    ? "border-primary/40 bg-primary/10 text-foreground scale-[1.03]"
                    : "border-border/60 bg-card text-muted-foreground hover:bg-accent/40",
                )}
              >
                <span className="text-xl sm:text-2xl">{t.emoji}</span>
                <span className="font-medium">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Input panel */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {meta.hint}
            </p>
            {meta.input === "mood" ? (
              <MoodPicker value={rating} onChange={setRating} />
            ) : meta.input === "rating" ? (
              <RatingPicker value={rating} onChange={setRating} />
            ) : meta.input === "water" ? (
              <WaterBottle initialGlasses={waterToday} target={hydrationTarget} />
            ) : meta.input === "sleep" ? (
              <SleepInput value={sleepHours} onChange={setSleepHours} />
            ) : (
              <WeightInput value={weightKg} onChange={setWeightKg} />
            )}
          </div>

          {!isWater ? (
            <>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything that preceded it? (optional)"
                rows={2}
              />
              <Button onClick={submit} loading={saving} className="w-full" size="lg">
                Log it
              </Button>
            </>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              Tap + or − to log a glass — it saves automatically.
            </p>
          )}
        </CardContent>
      </Card>

      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Recent</p>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing yet. Log your first one above.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <LogRow key={log.logId} log={log} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MoodPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
      {MOOD_FACES.map((m) => {
        const active = value === m.value;
        return (
          <button
            key={m.value}
            type="button"
            onClick={() => onChange(m.value)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-xl border py-3 transition-all duration-300",
              active
                ? "border-primary bg-primary/10 scale-110 shadow-[0_2px_8px_-2px_rgb(0_0_0_/_0.08)]"
                : "border-border/60 bg-card opacity-60 hover:opacity-100 hover:scale-105",
            )}
            aria-label={m.label}
          >
            <span
              className={cn(
                "text-2xl transition-transform duration-300 sm:text-3xl",
                active ? "scale-110" : "",
              )}
            >
              {m.emoji}
            </span>
            <span
              className={cn(
                "text-[10px] font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function RatingPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={cn(
            "h-12 flex-1 rounded-lg border text-base font-medium transition-colors",
            value === n
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border/60 bg-card text-foreground hover:bg-accent/40",
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}


function SleepInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = Math.min(100, (value / 12) * 100);
  return (
    <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-baseline justify-between">
        <span className="font-serif text-3xl text-foreground">
          {value.toFixed(1)}
        </span>
        <span className="text-sm text-muted-foreground">hours</span>
      </div>
      <input
        type="range"
        min={0}
        max={12}
        step={0.5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-border/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-info/70 to-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        <span>0h</span>
        <span>6h</span>
        <span>12h</span>
      </div>
    </div>
  );
}

function WeightInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4">
      <Scale className="size-8 shrink-0 text-primary" />
      <div className="flex flex-1 items-baseline gap-2">
        <Input
          type="number"
          inputMode="decimal"
          min={20}
          max={500}
          placeholder="70"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-0 bg-transparent px-0 font-serif text-3xl shadow-none focus-visible:ring-0"
        />
        <span className="text-sm text-muted-foreground">kg</span>
      </div>
    </div>
  );
}

function LogRow({ log }: { log: Log }) {
  const meta = TYPES.find((t) => t.type === log.symptomType);
  const isWeight = log.symptomType === "weight";
  const isSleep = log.symptomType === "sleep";
  const isWater = log.symptomType === "water";
  const display =
    log.severity == null
      ? "—"
      : isWeight
        ? `${log.severity}kg`
        : isSleep
          ? `${log.severity}h`
          : isWater
            ? `${log.severity} glass${log.severity === 1 ? "" : "es"}`
            : `${log.severity}/5`;
  return (
    <Card className="border-border/60">
      <CardContent className="flex items-center gap-3 p-3 sm:p-4">
        <span className="text-2xl">{meta?.emoji ?? "✨"}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{meta?.label ?? log.symptomType}</span>
            <span className="text-sm text-muted-foreground">{display}</span>
          </div>
          {log.notes ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{log.notes}</p>
          ) : null}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {new Date(log.timestamp).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      </CardContent>
    </Card>
  );
}
