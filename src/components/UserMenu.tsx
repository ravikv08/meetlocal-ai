"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronDown, User, LogOut } from "lucide-react";
import { Button as AriaButton } from "react-aria-components";
import { Avatar } from "@/components/Avatar";
import {
  Menu,
  MenuItem,
  MenuTrigger,
  MenuSection,
  MenuHeader,
  Popover,
} from "@/components/ui";

interface UserMenuProps {
  name: string | null;
  email: string | null;
  image: string | null;
  isAdmin: boolean;
  signOutAction: () => Promise<void>;
}

// Top-right account menu, now driven by react-aria-components MenuTrigger.
// Aria handles outside-click, Esc, focus restoration, and arrow-key nav for
// free. Sign-out is preserved as a hidden <form action> so the server action
// still runs and progressive enhancement is maintained.
export function UserMenu({
  name,
  email,
  image,
  isAdmin,
  signOutAction,
}: UserMenuProps) {
  const display = name ?? email ?? "you";
  const signOutFormRef = useRef<HTMLFormElement>(null);

  return (
    <div className="relative">
      <MenuTrigger>
        <AriaButton
          className={({ isPressed, isFocused }) =>
            "flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 outline-none transition data-[pressed]:bg-surface-2 " +
            (isFocused || isPressed
              ? "border-coral/50 bg-surface-2"
              : "border-line-2 hover:bg-surface")
          }
        >
          <Avatar name={display} size={28} imageUrl={image} />
          <span className="max-w-[140px] truncate text-sm font-medium">
            {display}
          </span>
          <ChevronDown size={13} className="text-text-muted transition" />
        </AriaButton>
        <Popover placement="bottom end" className="min-w-[240px]">
          {email && <MenuHeader>Signed in as · {email}</MenuHeader>}
          <Menu
            onAction={(key) => {
              if (key === "signout") signOutFormRef.current?.requestSubmit();
            }}
          >
            <MenuItem id="profile" textValue="Profile">
              <Link
                href="/profile"
                className="flex w-full items-center gap-2.5 outline-none"
              >
                <User size={15} className="text-text-dim" />
                Profile
              </Link>
            </MenuItem>
            {isAdmin && (
              <MenuItem id="admin" textValue="Admin">
                <Link
                  href="/admin"
                  className="flex w-full items-center gap-2.5 font-mono text-[10px] uppercase tracking-wider text-coral outline-none"
                >
                  Admin
                </Link>
              </MenuItem>
            )}
          </Menu>
          <MenuSection>
            <Menu
              onAction={(key) => {
                if (key === "signout") signOutFormRef.current?.requestSubmit();
              }}
            >
              <MenuItem id="signout" textValue="Sign out" destructive>
                <LogOut size={15} />
                Sign out
              </MenuItem>
            </Menu>
          </MenuSection>
        </Popover>
      </MenuTrigger>

      {/* Hidden form preserves the server action for sign out. The MenuItem
          submits this form via requestSubmit(); progressive enhancement stays
          intact because the form would also work without JS if surfaced. */}
      <form ref={signOutFormRef} action={signOutAction} className="hidden" />
    </div>
  );
}
