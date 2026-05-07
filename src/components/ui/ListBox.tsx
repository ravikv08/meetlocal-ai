"use client";

import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  type ListBoxProps as AriaListBoxProps,
  type ListBoxItemProps as AriaListBoxItemProps,
} from "react-aria-components";
import { cn } from "@/lib/utils";

export function ListBox<T extends object>({
  className,
  ...rest
}: AriaListBoxProps<T>) {
  return (
    <AriaListBox
      {...rest}
      className={cn("grid gap-1 p-1.5 outline-none", className)}
    />
  );
}

export function ListBoxItem(props: AriaListBoxItemProps) {
  const { className, ...rest } = props;
  return (
    <AriaListBoxItem
      {...rest}
      className={(values) =>
        cn(
          "flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-left outline-none transition",
          "data-[hovered]:bg-surface-2 data-[focused]:bg-surface-2",
          "data-[selected]:bg-surface-2",
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40",
          typeof className === "function" ? className(values) : className,
        )
      }
    />
  );
}
