"use client";

import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { cn } from "@/lib/utils";

type Variant = "sunset" | "outline" | "ghost" | "subtle" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends AriaButtonProps {
  variant?: Variant;
  size?: Size;
}

const VARIANT: Record<Variant, string> = {
  sunset:
    "grad-sunset text-white shadow-[0_10px_30px_rgba(255,106,61,0.35)] data-[hovered]:opacity-95 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:shadow-none",
  outline:
    "border border-line-2 bg-transparent text-text data-[hovered]:bg-surface data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed",
  ghost:
    "bg-transparent text-text-dim data-[hovered]:bg-surface-2 data-[hovered]:text-text data-[disabled]:opacity-40",
  subtle:
    "bg-surface-2 text-text data-[hovered]:bg-surface data-[disabled]:opacity-40",
  danger:
    "bg-magenta text-white data-[hovered]:opacity-90 data-[disabled]:opacity-40",
};

const SIZE: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-sm",
};

export function Button({
  className,
  variant = "outline",
  size = "md",
  ...rest
}: ButtonProps) {
  return (
    <AriaButton
      {...rest}
      className={(values) =>
        cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition outline-none",
          VARIANT[variant],
          SIZE[size],
          typeof className === "function" ? className(values) : className,
        )
      }
    />
  );
}
