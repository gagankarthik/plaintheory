"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  /** When true, the confetti animates once then unmounts. */
  active: boolean;
  /** Total animation duration in ms. Default 2500. */
  durationMs?: number;
  /** Number of particles. Default 60. */
  count?: number;
};

const COLORS = [
  "var(--primary)",
  "var(--info)",
  "var(--warning)",
  "var(--success)",
  "var(--destructive)",
];

type Particle = {
  left: number;
  delay: number;
  duration: number;
  drift: number;
  color: string;
  size: number;
  rotateEnd: number;
};

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    delay: Math.random() * 250,
    duration: 1800 + Math.random() * 1400,
    drift: (Math.random() - 0.5) * 200,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    size: 6 + Math.random() * 6,
    rotateEnd: (Math.random() - 0.5) * 720,
  }));
}

export function Confetti({ active, durationMs = 2500, count = 60 }: Props) {
  const [show, setShow] = useState(active);
  const particles = useMemo(() => (show ? makeParticles(count) : []), [show, count]);

  useEffect(() => {
    if (!active) return;
    setShow(true);
    const id = setTimeout(() => setShow(false), durationMs);
    return () => clearTimeout(id);
  }, [active, durationMs]);

  if (!show) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 block rounded-sm"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.6}px`,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}ms cubic-bezier(0.25, 0.55, 0.5, 1) ${p.delay}ms forwards`,
            // Custom CSS vars consumed by the keyframes below
            ["--drift" as string]: `${p.drift}px`,
            ["--rotate-end" as string]: `${p.rotateEnd}deg`,
          }}
        />
      ))}
    </div>
  );
}
