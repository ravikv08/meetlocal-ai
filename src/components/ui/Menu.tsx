"use client";

import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuTrigger as AriaMenuTrigger,
  type MenuProps as AriaMenuProps,
  type MenuItemProps as AriaMenuItemProps,
} from "react-aria-components";
import { cn } from "@/lib/utils";

export const MenuTrigger = AriaMenuTrigger;

export function Menu<T extends object>({
  className,
  ...rest
}: AriaMenuProps<T>) {
  return (
    <AriaMenu
      {...rest}
      className={cn("grid gap-0.5 p-1.5 outline-none", className)}
    />
  );
}

interface MenuItemProps extends AriaMenuItemProps {
  destructive?: boolean;
}

export function MenuItem({ className, destructive, ...rest }: MenuItemProps) {
  return (
    <AriaMenuItem
      {...rest}
      className={(values) =>
        cn(
          "flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm outline-none transition",
          "data-[hovered]:bg-surface-2 data-[focused]:bg-surface-2",
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40",
          destructive
            ? "text-text-dim data-[hovered]:text-text data-[focused]:text-text"
            : "text-text",
          typeof className === "function" ? className(values) : className,
        )
      }
    />
  );
}

export function MenuSection({ children }: { children: React.ReactNode }) {
  return <div className="border-t border-line p-1.5 first:border-t-0">{children}</div>;
}

export function MenuHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-line px-4 pb-3 pt-3.5">
      <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {children}
      </div>
    </div>
  );
}
