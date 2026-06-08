"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4";

const FADE = 0.5; // seconds of fade in / out

/**
 * Cinematic hero: a video that lives in the lower portion of a light section,
 * fading into the page background top and bottom. The clip fades in over 0.5s,
 * fades out 0.5s before the end, then seamlessly restarts — a calm, premium
 * loop rather than a hard cut.
 */
export function CinematicHero({ signedIn }: { signedIn: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // Respect reduced-motion: hold the first frame, no playback.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      v.style.opacity = "1";
      return;
    }

    let raf = 0;
    const tick = () => {
      const d = v.duration;
      if (d && !Number.isNaN(d)) {
        const t = v.currentTime;
        let o = 1;
        if (t < FADE) o = t / FADE;
        else if (t > d - FADE) o = Math.max(0, (d - t) / FADE);
        v.style.opacity = String(o);
      }
      raf = requestAnimationFrame(tick);
    };

    const onEnded = () => {
      v.style.opacity = "0";
      window.setTimeout(() => {
        v.currentTime = 0;
        void v.play().catch(() => {});
      }, 100);
    };

    v.addEventListener("ended", onEnded);
    void v.play().catch(() => {});
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      v.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <section className="relative min-h-[92vh] w-full overflow-hidden bg-background">
      {/* Video layer — lower portion, fading into the page */}
      <div className="absolute inset-x-0 bottom-0 top-[300px] z-0">
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          preload="metadata"
          poster="/og-image.png"
          className="h-full w-full object-cover opacity-0 transition-opacity duration-300"
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pb-40 pt-32 text-center sm:pt-36">
        <h1
          className="animate-fade-rise font-instrument text-5xl font-normal leading-[0.97] tracking-[-0.02em] text-foreground sm:text-7xl md:text-[5.5rem]"
        >
          Master your day,
          <br />
          find <span className="italic text-muted-foreground">calm</span> in the{" "}
          <span className="italic text-muted-foreground">everyday.</span>
        </h1>

        <p className="animate-fade-rise-delay mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          A gentle daily plan, quiet check-ins for mood and money, and a coach who remembers
          what matters — all in one unhurried place.
        </p>

        <div className="animate-fade-rise-delay-2 mt-11 flex flex-col items-center gap-4 sm:flex-row">
          {signedIn ? (
            <Link href="/app" className="w-full sm:w-auto">
              <Button size="lg" className="w-full rounded-full px-10 sm:w-auto">
                Open your dashboard <ArrowRight />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button size="lg" className="w-full rounded-full px-10 sm:w-auto">
                  Start free <ArrowRight />
                </Button>
              </Link>
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Explore what&rsquo;s inside
              </Link>
            </>
          )}
        </div>

        <p className="animate-fade-rise-delay-2 mt-6 text-xs text-muted-foreground/80">
          Free to start · No credit card · Ready in two minutes
        </p>
      </div>

      {/* Scroll cue */}
      <a
        href="#features"
        aria-label="Scroll to explore"
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronDown className="size-6 animate-bounce" />
      </a>
    </section>
  );
}
