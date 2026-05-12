"use client";

import { LogOut, Settings, Target, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { signOut } from "@/lib/auth/cognito-client";
import { cn } from "@/lib/utils";

export function UserMenu({ email }: { email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function escape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const onSignOut = async () => {
    setPending(true);
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        className="rounded-full transition-transform hover:scale-105 active:scale-95"
      >
        <Avatar seed={email} size={32} />
      </button>
      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute right-0 top-full z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg",
            "animate-in fade-in-0 zoom-in-95 duration-150",
          )}
        >
          <div className="flex items-center gap-3 border-b border-border/40 px-3 py-3">
            <Avatar seed={email} size={36} className="size-9" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                Signed in as
              </p>
              <p className="truncate text-sm font-medium">{email}</p>
            </div>
          </div>
          <ul className="p-1.5">
            <MenuItem href="/app/settings" icon={<User className="size-4" />} onSelect={() => setOpen(false)}>
              Profile
            </MenuItem>
            <MenuItem
              href="/app/settings#goals"
              icon={<Target className="size-4" />}
              onSelect={() => setOpen(false)}
            >
              Goals
            </MenuItem>
            <MenuItem
              href="/app/settings"
              icon={<Settings className="size-4" />}
              onSelect={() => setOpen(false)}
            >
              Settings
            </MenuItem>
            <li className="my-1 h-px bg-border/40" />
            <li>
              <button
                type="button"
                role="menuitem"
                disabled={pending}
                onClick={onSignOut}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  "text-destructive hover:bg-destructive/10 disabled:opacity-50",
                )}
              >
                <LogOut className="size-4" />
                {pending ? "Signing out…" : "Sign out"}
              </button>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({
  href,
  icon,
  children,
  onSelect,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        role="menuitem"
        onClick={onSelect}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors",
          "hover:bg-accent/60",
        )}
      >
        <span className="text-muted-foreground">{icon}</span>
        {children}
      </Link>
    </li>
  );
}
