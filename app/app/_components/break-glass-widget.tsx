"use client";

import { AlertTriangle, Hammer, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

const localDate = () => new Intl.DateTimeFormat("en-CA").format(new Date());

const writeCookie = (name: string, value: string, days = 365) => {
  const exp = new Date();
  exp.setDate(exp.getDate() + days);
  document.cookie = `${name}=${value}; path=/; SameSite=Lax; Expires=${exp.toUTCString()}`;
};

const TEXT = "IN CASE OF GLITCH";

type State = "sealed" | "broken" | "reconnecting";

type Shard = {
  left: number;
  top: number;
  size: number;
  dx: number;
  dy: number;
  rot: number;
  delay: number;
};

function makeShards(count: number): Shard[] {
  return Array.from({ length: count }, () => ({
    left: 8 + Math.random() * 84,
    top: 18 + Math.random() * 64,
    size: 12 + Math.random() * 28,
    dx: (Math.random() - 0.5) * 380,
    dy: -80 - Math.random() * 220,
    rot: (Math.random() - 0.5) * 720,
    delay: Math.random() * 140,
  }));
}

// Each wire runs left→right at a fixed y. The left half ends at LEFT_END and the
// right half starts at RIGHT_START. The gap (RIGHT_START − LEFT_END) is the visible
// severing — on reconnect, each half slides half the gap toward the center.
const SVG_W = 400;
const CENTER = 200;
const GAP = 50;
const LEFT_END = CENTER - GAP / 2; // 175
const RIGHT_START = CENTER + GAP / 2; // 225

const WIRES = [
  { y: 18, color: "var(--info)" },
  { y: 36, color: "var(--warning)" },
  { y: 54, color: "var(--success)" },
];

const COPPER = "#d4a017";
const INSULATION = "var(--foreground)";

const SPARKS = [
  { dx: -34, dy: -8 },
  { dx: 34, dy: -8 },
  { dx: -18, dy: -28 },
  { dx: 18, dy: -28 },
  { dx: -30, dy: 14 },
  { dx: 30, dy: 14 },
  { dx: 0, dy: -34 },
  { dx: 0, dy: 22 },
];

export function BreakGlassWidget() {
  const [state, setState] = useState<State>("sealed");
  const shards = useMemo(() => makeShards(14), []);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const breakGlass = () => {
    if (state !== "sealed") return;
    setState("broken");
  };

  const reconnect = async () => {
    if (state !== "broken") return;
    setErrorMsg(null);
    setState("reconnecting");

    const today = localDate();
    writeCookie("pt-tz-offset", String(new Date().getTimezoneOffset()));
    writeCookie("pt-local-date", today, 2);

    try {
      const res = await fetch("/api/plan/today", { method: "POST", cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sync failed");
      toast.success("Reconnected. Pulling today.");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Reconnect failed");
      setState("broken");
      return;
    }

    // Let the wire animation play, then hard-nav with a cache bust
    setTimeout(() => {
      window.location.href = `/app?t=${Date.now()}`;
    }, 1200);
  };

  const cracked = TEXT.split("").map((ch, i) => {
    const rot = ((i % 7) - 3) * 1.8;
    const dy = ((i % 4) - 2) * 1.2;
    return (
      <span
        key={i}
        className="inline-block"
        style={{ transform: `rotate(${rot}deg) translateY(${dy}px)` }}
      >
        {ch === " " ? " " : ch}
      </span>
    );
  });

  return (
    <button
      type="button"
      onClick={state === "sealed" ? breakGlass : state === "broken" ? reconnect : undefined}
      disabled={state === "reconnecting"}
      aria-label={
        state === "sealed"
          ? "Break the glass to re-sync today's plan"
          : state === "broken"
            ? "Reconnect wires and sync today's plan"
            : "Reconnecting…"
      }
      className={cn(
        "group relative col-span-2 min-h-[180px] overflow-hidden rounded-3xl border-2 p-5 text-left transition-all sm:min-h-[200px] sm:p-6 lg:col-span-4",
        state === "sealed" &&
          "border-destructive/30 bg-gradient-to-br from-destructive/8 via-destructive/3 to-background hover:border-destructive/50 hover:shadow-[0_8px_30px_-12px_oklch(0.55_0.18_25_/_0.25)] [animation:alarm-glow_2400ms_ease-in-out_infinite]",
        state === "broken" &&
          "border-foreground/30 bg-gradient-to-br from-muted/70 via-background to-background",
        state === "reconnecting" &&
          "border-success/40 bg-gradient-to-br from-success/15 via-success/5 to-background",
      )}
    >
      {/* SEALED — etched glass with cracked text */}
      <div
        className={cn(
          "relative transition-opacity duration-300",
          state === "sealed" ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-destructive">
              Sync recovery
            </p>
          </div>
          <Hammer className="size-4 text-destructive/70 transition-transform group-hover:rotate-12" />
        </div>

        <div className="relative mt-4">
          {/* Crack overlay */}
          <svg
            aria-hidden
            viewBox="0 0 400 80"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 size-full text-destructive"
          >
            <path
              d="M0 32 L70 36 L92 20 L160 30 L200 18 L260 32 L320 22 L400 30"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.22"
              strokeWidth="0.7"
            />
            <path
              d="M120 0 L132 12 L122 24 L134 38 L126 60 L138 76"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.16"
              strokeWidth="0.6"
            />
            <path
              d="M280 0 L290 10 L282 22 L294 34 L286 52 L298 72"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.16"
              strokeWidth="0.6"
            />
          </svg>

          <p className="relative font-serif text-2xl tracking-[0.04em] text-foreground sm:text-3xl">
            {cracked}
          </p>
        </div>

        <p className="mt-3 max-w-md text-xs leading-snug text-muted-foreground sm:text-sm">
          If today feels out of sync or the plan looks stale, break the glass to force a re-sync.
        </p>

        <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-destructive transition-transform group-hover:-translate-y-0.5">
          <Hammer className="size-3" />
          Tap to break glass
        </p>
      </div>

      {/* SHARDS — animate outward when state flips to broken */}
      {state !== "sealed" ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {shards.map((s, i) => (
            <span
              key={i}
              className="absolute block bg-foreground/15 backdrop-blur-sm"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                clipPath: "polygon(22% 0, 100% 28%, 78% 100%, 0 72%)",
                animation: `glass-shard 900ms cubic-bezier(0.25, 0.55, 0.5, 1) ${s.delay}ms forwards`,
                ["--dx" as string]: `${s.dx}px`,
                ["--dy" as string]: `${s.dy}px`,
                ["--rot" as string]: `${s.rot}deg`,
              }}
            />
          ))}
        </div>
      ) : null}

      {/* BROKEN / RECONNECTING — wires exposed */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-between p-5 transition-opacity sm:p-6",
          state === "broken" || state === "reconnecting"
            ? "opacity-100 duration-500"
            : "pointer-events-none opacity-0 duration-200",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-block size-2 rounded-full",
                state === "reconnecting"
                  ? "bg-success"
                  : "animate-pulse bg-destructive",
              )}
            />
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/70">
              {state === "reconnecting" ? "Reconnecting" : "Wires exposed"}
            </p>
          </div>
          <Zap
            className={cn(
              "size-4 transition-colors",
              state === "reconnecting" ? "text-success" : "text-foreground/40",
            )}
          />
        </div>

        {/* Wires — realistic two-half severed cables that slide to meet, weld, and pulse current */}
        <div className="relative my-3 h-20">
          <svg
            viewBox={`0 0 ${SVG_W} 72`}
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
          >
            {WIRES.map((w, i) => {
              const reconnecting = state === "reconnecting";
              const slide = reconnecting ? GAP / 2 : 0;
              const wobbleStyle = !reconnecting
                ? {
                    animation: `wire-wobble 2400ms ease-in-out ${i * 220}ms infinite`,
                  }
                : {};
              return (
                <g key={i}>
                  {/* LEFT HALF — slides right on reconnect */}
                  <g
                    style={{
                      transform: `translateX(${slide}px)`,
                      transition: "transform 800ms cubic-bezier(0.5, 0, 0.18, 1)",
                    }}
                  >
                    <g style={wobbleStyle as React.CSSProperties}>
                      {/* Insulation jacket */}
                      <line
                        x1={0}
                        y1={w.y}
                        x2={LEFT_END}
                        y2={w.y}
                        stroke={INSULATION}
                        strokeOpacity="0.35"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                      {/* Conductor core */}
                      <line
                        x1={0}
                        y1={w.y}
                        x2={LEFT_END}
                        y2={w.y}
                        stroke={w.color}
                        strokeOpacity={reconnecting ? 1 : 0.85}
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        style={{
                          filter: reconnecting
                            ? `drop-shadow(0 0 6px ${w.color})`
                            : "none",
                          transition: "filter 300ms",
                        }}
                      />
                      {/* Severed copper end (fades on reconnect) */}
                      <circle
                        cx={LEFT_END}
                        cy={w.y}
                        r="3"
                        fill={COPPER}
                        opacity={reconnecting ? 0 : 1}
                        style={{
                          transition: "opacity 250ms 720ms",
                          animation: !reconnecting
                            ? `copper-pulse 1400ms ease-in-out ${i * 200}ms infinite`
                            : undefined,
                        }}
                      />
                      {/* Live-end danger dot */}
                      {!reconnecting ? (
                        <circle
                          cx={LEFT_END}
                          cy={w.y}
                          r="5.5"
                          fill="none"
                          stroke="var(--destructive)"
                          strokeOpacity="0.6"
                          strokeWidth="1"
                          style={{ animation: `copper-pulse 1100ms ease-in-out ${i * 150}ms infinite` }}
                        />
                      ) : null}
                    </g>
                  </g>

                  {/* RIGHT HALF — slides left on reconnect */}
                  <g
                    style={{
                      transform: `translateX(${-slide}px)`,
                      transition: "transform 800ms cubic-bezier(0.5, 0, 0.18, 1)",
                    }}
                  >
                    <g style={wobbleStyle as React.CSSProperties}>
                      <line
                        x1={RIGHT_START}
                        y1={w.y}
                        x2={SVG_W}
                        y2={w.y}
                        stroke={INSULATION}
                        strokeOpacity="0.35"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                      <line
                        x1={RIGHT_START}
                        y1={w.y}
                        x2={SVG_W}
                        y2={w.y}
                        stroke={w.color}
                        strokeOpacity={reconnecting ? 1 : 0.85}
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        style={{
                          filter: reconnecting
                            ? `drop-shadow(0 0 6px ${w.color})`
                            : "none",
                          transition: "filter 300ms",
                        }}
                      />
                      <circle
                        cx={RIGHT_START}
                        cy={w.y}
                        r="3"
                        fill={COPPER}
                        opacity={reconnecting ? 0 : 1}
                        style={{
                          transition: "opacity 250ms 720ms",
                          animation: !reconnecting
                            ? `copper-pulse 1400ms ease-in-out ${i * 200 + 100}ms infinite`
                            : undefined,
                        }}
                      />
                      {!reconnecting ? (
                        <circle
                          cx={RIGHT_START}
                          cy={w.y}
                          r="5.5"
                          fill="none"
                          stroke="var(--destructive)"
                          strokeOpacity="0.6"
                          strokeWidth="1"
                          style={{ animation: `copper-pulse 1100ms ease-in-out ${i * 150 + 80}ms infinite` }}
                        />
                      ) : null}
                    </g>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* HTML overlays — welding flash, sparks, current pulse */}
          {state === "reconnecting" ? (
            <div className="pointer-events-none absolute inset-0">
              {/* Three weld flashes, one at each wire's join point */}
              {WIRES.map((w, i) => {
                const topPct = ((w.y + 0) / 72) * 100;
                return (
                  <span
                    key={`flash-${i}`}
                    className="absolute block size-6 rounded-full"
                    style={{
                      left: "50%",
                      top: `${topPct}%`,
                      background:
                        "radial-gradient(circle, #ffffff 0%, #ffe9a8 35%, transparent 70%)",
                      boxShadow: "0 0 18px #ffd366",
                      animation: `weld-flash 600ms cubic-bezier(0.2, 0.6, 0.3, 1) ${720 + i * 60}ms forwards`,
                      opacity: 0,
                    }}
                  />
                );
              })}

              {/* Sparks fly out from the middle wire's join */}
              {SPARKS.map((s, i) => (
                <span
                  key={`spark-${i}`}
                  className="absolute block size-1.5 rounded-full bg-[#ffd366]"
                  style={{
                    left: "50%",
                    top: "50%",
                    boxShadow: "0 0 6px #ffd366",
                    animation: `weld-spark 700ms cubic-bezier(0.3, 0.7, 0.4, 1) ${760 + i * 20}ms forwards`,
                    ["--dx" as string]: `${s.dx}px`,
                    ["--dy" as string]: `${s.dy}px`,
                  }}
                />
              ))}

              {/* Current pulse — bright dot travels along each wire after the weld */}
              {WIRES.map((w, i) => {
                const topPct = (w.y / 72) * 100;
                return (
                  <span
                    key={`pulse-${i}`}
                    className="absolute block size-2 rounded-full"
                    style={{
                      top: `${topPct}%`,
                      transform: "translate(-50%, -50%)",
                      background: w.color,
                      boxShadow: `0 0 10px ${w.color}, 0 0 18px ${w.color}`,
                      animation: `current-flow 900ms cubic-bezier(0.4, 0.0, 0.2, 1) ${1200 + i * 90}ms forwards`,
                      opacity: 0,
                    }}
                  />
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <p className="font-serif text-xl tracking-tight text-foreground sm:text-2xl">
            {state === "reconnecting"
              ? "Reconnecting today…"
              : "Tap to reconnect wires."}
          </p>
          {errorMsg ? (
            <p className="text-xs font-medium text-destructive">
              {errorMsg}. Tap to retry.
            </p>
          ) : (
            <p className="text-xs leading-snug text-muted-foreground">
              {state === "reconnecting"
                ? "Pulling today's plan back online."
                : "Force a fresh sync of today's plan from the server."}
            </p>
          )}
          <div className="pt-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/80">
            <Zap
              className={cn(
                "size-3",
                state === "reconnecting" && "animate-pulse text-success",
              )}
            />
            {state === "reconnecting" ? "Syncing now" : "Tap anywhere"}
          </div>
        </div>
      </div>
    </button>
  );
}
