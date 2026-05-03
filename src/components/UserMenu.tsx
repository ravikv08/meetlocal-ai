"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, LogOut } from "lucide-react";
import { Avatar } from "@/components/Avatar";

interface UserMenuProps {
  name: string | null;
  email: string | null;
  image: string | null;
  isAdmin: boolean;
  signOutAction: () => Promise<void>;
}

// Top-right account menu. Pill shows avatar + display name; opening reveals the
// email, a Profile link, and Sign out. Outside-click / Esc closes.
export function UserMenu({
  name,
  email,
  image,
  isAdmin,
  signOutAction,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const display = name ?? email ?? "you";

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          "flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 transition " +
          (open
            ? "border-coral/50 bg-surface-2"
            : "border-line-2 hover:bg-surface")
        }
      >
        <Avatar name={display} size={28} imageUrl={image} />
        <span className="max-w-[140px] truncate text-sm font-medium">
          {display}
        </span>
        <ChevronDown
          size={13}
          className={"text-text-muted transition " + (open ? "rotate-180" : "")}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-30 mt-2 min-w-[240px] overflow-hidden rounded-2xl border border-line-2 shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
          style={{
            background: "rgba(28,23,19,0.96)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Email row */}
          {email && (
            <div className="border-b border-line px-4 pb-3 pt-3.5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Signed in as
              </div>
              <div className="mt-0.5 truncate text-sm font-medium text-text">
                {email}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="grid p-1.5">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition hover:bg-surface-2"
            >
              <User size={15} className="text-text-dim" />
              Profile
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-coral transition hover:bg-surface-2"
              >
                <span className="font-mono text-[10px] uppercase tracking-wider">
                  Admin
                </span>
              </Link>
            )}
          </div>

          {/* Sign out */}
          <form
            action={signOutAction}
            className="border-t border-line p-1.5"
          >
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-text-dim transition hover:bg-surface-2 hover:text-text"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
