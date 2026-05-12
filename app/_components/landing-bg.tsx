"use client";

import { useEffect, useRef } from "react";

export function HeroBackground() {
  const spotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!spotRef.current) return;
      const el = spotRef.current.parentElement;
      if (!el) return;
      const { left, top } = el.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      spotRef.current.style.setProperty("--x", `${x}px`);
      spotRef.current.style.setProperty("--y", `${y}px`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle, oklch(0.5 0.075 145 / 0.5) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Cursor spotlight */}
      <div
        ref={spotRef}
        className="absolute size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl transition-[left,top] duration-300 ease-out dark:bg-primary/8"
        style={{ left: "var(--x, 50%)", top: "var(--y, 40%)" }}
      />

      {/* Floating orbs */}
      <div className="landing-orb-1 absolute -left-20 top-0 size-[500px] rounded-full bg-primary/10 blur-[80px] dark:bg-primary/8" />
      <div className="landing-orb-2 absolute -right-10 top-1/4 size-[400px] rounded-full bg-info/8 blur-[80px] dark:bg-info/6" />
      <div className="landing-orb-3 absolute bottom-0 left-1/3 size-[450px] rounded-full bg-primary/6 blur-[100px] dark:bg-primary/5" />
    </div>
  );
}

export function SectionDots({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 opacity-[0.22] dark:opacity-[0.12] ${className ?? ""}`}
      style={{
        backgroundImage:
          "radial-gradient(circle, oklch(0.5 0.075 145 / 0.45) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    />
  );
}
