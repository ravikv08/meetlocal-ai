"use client";

import {
  Button as AriaButton,
  Header as AriaHeader,
  MenuItem,
  MenuSection,
  Menu,
  MenuTrigger,
  Popover,
} from "react-aria-components";
import { LogIn, UserPlus, Heart, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

// Single auth entry-point in the top nav. Replaces the old "Sign in" +
// "Get started" pair with one dropdown that surfaces:
//   • Sign in        → /signin
//   • Sign up        → /signin?intent=signup
//   • ── divider ──
//   • Become a local → /become-a-local
// Same pattern as Airbnb's collapsed account menu pre-auth.

export function AuthMenu() {
  const router = useRouter();

  return (
    <div className="relative">
      <MenuTrigger>
        <AriaButton
          className={({ isPressed, isFocused, isHovered }) =>
            "grad-sunset flex items-center gap-2 whitespace-nowrap rounded-full py-2.5 pl-5 pr-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,106,61,0.30)] outline-none transition " +
            (isPressed || isFocused
              ? "shadow-[0_10px_28px_rgba(255,106,61,0.45)]"
              : isHovered
                ? "opacity-95"
                : "")
          }
          aria-label="Account"
        >
          Sign in
          <span className="text-white/55">·</span>
          <span className="font-medium">Sign up</span>
          <ChevronDown size={14} className="text-white/80" />
        </AriaButton>

        <Popover
          placement="bottom end"
          offset={8}
          className={({ isEntering }) =>
            "vibrancy-dark min-w-[260px] overflow-hidden rounded-2xl border border-line-2 shadow-[0_30px_60px_rgba(0,0,0,0.5)] outline-none " +
            (isEntering ? "animate-ml-fadeup" : "")
          }
        >
          <Menu
            className="p-1.5 outline-none"
            onAction={(key) => {
              if (key === "signin") router.push("/signin");
              else if (key === "signup") router.push("/signin?intent=signup");
              else if (key === "become-local") router.push("/become-a-local");
            }}
          >
            <MenuSection>
              <AriaHeader className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Account
              </AriaHeader>
              <MenuItem
                id="signin"
                className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm outline-none transition data-[focused]:bg-surface-2"
              >
                <LogIn size={15} className="text-text-dim group-data-[focused]:text-coral" />
                <div>
                  <div className="font-medium text-text">Sign in</div>
                  <div className="text-xs text-text-muted">Already have an account</div>
                </div>
              </MenuItem>
              <MenuItem
                id="signup"
                className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm outline-none transition data-[focused]:bg-surface-2"
              >
                <UserPlus size={15} className="text-text-dim group-data-[focused]:text-coral" />
                <div>
                  <div className="font-medium text-text">Sign up</div>
                  <div className="text-xs text-text-muted">It only takes a few seconds</div>
                </div>
              </MenuItem>
            </MenuSection>

            <MenuSection>
              <div className="my-1 border-t border-line" />
              <MenuItem
                id="become-local"
                className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm outline-none transition data-[focused]:bg-surface-2"
              >
                <div className="grad-sunset flex h-7 w-7 items-center justify-center rounded-lg shadow-[0_4px_12px_rgba(255,106,61,0.45)]">
                  <Heart size={14} className="text-white" />
                </div>
                <div>
                  <div className="font-medium text-text">Become a local</div>
                  <div className="text-xs text-text-muted">Earn from your city · vetted hosts</div>
                </div>
              </MenuItem>
            </MenuSection>
          </Menu>
        </Popover>
      </MenuTrigger>
    </div>
  );
}
