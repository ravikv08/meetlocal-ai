"use client";

import {
  Dialog as AriaDialog,
  Popover as AriaPopover,
  type PopoverProps as AriaPopoverProps,
} from "react-aria-components";
import { cn } from "@/lib/utils";

export interface PopoverProps extends Omit<AriaPopoverProps, "children"> {
  children: React.ReactNode;
  /** Match the trigger's width. Useful for select-style popovers. */
  matchTriggerWidth?: boolean;
}

// Branded wrapper around Aria Popover. The visual is the same dark glass card
// used by SearchBar and UserMenu before the migration. Animates in/out via the
// data-entering/data-exiting attributes Aria sets during enter/exit transitions.
export function Popover({
  children,
  className,
  matchTriggerWidth,
  offset = 8,
  ...rest
}: PopoverProps) {
  return (
    <AriaPopover
      {...rest}
      offset={offset}
      className={(values) =>
        cn(
          "vibrancy-dark overflow-hidden rounded-2xl border border-line-2 shadow-[0_30px_60px_rgba(0,0,0,0.5)] outline-none",
          "data-[entering]:animate-ml-fadeup",
          "data-[exiting]:opacity-0 data-[exiting]:transition-opacity data-[exiting]:duration-150",
          matchTriggerWidth && "min-w-[--trigger-width]",
          typeof className === "function" ? className(values) : className,
        )
      }
      style={
        matchTriggerWidth
          ? ({ "--trigger-width": "var(--trigger-width)" } as React.CSSProperties)
          : undefined
      }
    >
      <AriaDialog className="outline-none">{children}</AriaDialog>
    </AriaPopover>
  );
}

export function PopoverHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-text-dim">
      {children}
    </div>
  );
}
