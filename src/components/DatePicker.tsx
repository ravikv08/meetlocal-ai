"use client";

import {
  Calendar as AriaCalendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Heading,
  Button as AriaButton,
} from "react-aria-components";
import {
  CalendarDate,
  getLocalTimeZone,
  parseDate,
  today as todayCalendar,
} from "@internationalized/date";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  formatRelative,
  toCalendarDate,
  fromCalendarDate,
} from "@/lib/date-utils";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  /** ISO YYYY-MM-DD or null for unselected. */
  value: string | null;
  onChange: (iso: string | null) => void;
  /** Defaults to today; pass to constrain past selection. */
  minDate?: Date;
  /** Show a "Clear / anytime" button. */
  allowClear?: boolean;
  /** Visual treatment for dark popovers vs paper booking page. */
  variant?: "dark" | "paper";
}

// Aria-driven month-view calendar with full keyboard nav, screen-reader
// announcements, and locale-aware weekday labels. Public contract preserved
// from the previous hand-rolled implementation: ISO YYYY-MM-DD round-trips
// cleanly through URLs and Postgres.
export function DatePicker({
  value,
  onChange,
  minDate,
  allowClear = false,
  variant = "dark",
}: DatePickerProps) {
  const tz = getLocalTimeZone();
  const today = todayCalendar(tz);
  const min = minDate
    ? new CalendarDate(
        minDate.getFullYear(),
        minDate.getMonth() + 1,
        minDate.getDate(),
      )
    : today;
  // Cap forward navigation at 6 months out (reasonable travel-planning window)
  const max = today.add({ months: 6 });

  const calendarValue = toCalendarDate(value);

  const palette =
    variant === "paper"
      ? {
          text: "text-ink",
          textDim: "text-ink-dim",
          textMuted: "text-ink-muted",
          line: "border-hair",
          line2: "border-hair-2",
          hover: "data-[hovered]:bg-paper-bg",
          cellHover:
            "data-[hovered]:bg-paper-bg data-[focus-visible]:bg-paper-bg",
        }
      : {
          text: "text-text",
          textDim: "text-text-dim",
          textMuted: "text-text-muted",
          line: "border-line",
          line2: "border-line-2",
          hover: "data-[hovered]:bg-surface-2",
          cellHover:
            "data-[hovered]:bg-surface-2 data-[focus-visible]:bg-surface-2",
        };

  return (
    <AriaCalendar
      aria-label="Date"
      value={calendarValue}
      onChange={(d) => onChange(d ? fromCalendarDate(d) : null)}
      minValue={min}
      maxValue={max}
      className={cn("p-3 outline-none", palette.text)}
    >
      <header className="mb-2 flex items-center gap-2 px-1">
        <Heading className="flex-1 font-display text-base font-semibold" />
        <AriaButton
          slot="previous"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border outline-none transition",
            palette.line2,
            palette.hover,
            "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-30",
          )}
        >
          <ChevronLeft size={15} />
        </AriaButton>
        <AriaButton
          slot="next"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border outline-none transition",
            palette.line2,
            palette.hover,
            "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-30",
          )}
        >
          <ChevronRight size={15} />
        </AriaButton>
      </header>

      <CalendarGrid className="w-full border-separate border-spacing-0.5 px-1 pb-1">
        <CalendarGridHeader>
          {(day) => (
            <CalendarHeaderCell
              className={cn(
                "py-1.5 text-center font-mono text-[10px] uppercase tracking-wider",
                palette.textMuted,
              )}
            >
              {day.slice(0, 1)}
            </CalendarHeaderCell>
          )}
        </CalendarGridHeader>
        <CalendarGridBody>
          {(date) => (
            <CalendarCell
              date={date}
              className={cn(
                "flex aspect-square w-full items-center justify-center rounded-lg text-sm font-medium outline-none transition",
                palette.text,
                palette.cellHover,
                "data-[outside-month]:invisible",
                "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-30",
                "data-[unavailable]:cursor-not-allowed data-[unavailable]:opacity-30",
                // Today (when not selected): subtle border emphasis
                "data-[today]:border data-[today]:font-semibold",
                variant === "paper"
                  ? "data-[today]:border-hair-2"
                  : "data-[today]:border-line-2",
                // Selected: sunset gradient
                "data-[selected]:grad-sunset data-[selected]:text-white data-[selected]:shadow-[0_6px_18px_rgba(255,106,61,0.35)] data-[selected]:border-transparent",
              )}
            />
          )}
        </CalendarGridBody>
      </CalendarGrid>

      {allowClear && (
        <div
          className={cn(
            "mt-1 flex items-center justify-between border-t px-1 pt-2",
            palette.line,
          )}
        >
          <button
            type="button"
            onClick={() => onChange(null)}
            className={cn(
              "text-xs transition outline-none",
              palette.textDim,
              variant === "paper" ? "hover:text-ink" : "hover:text-text",
            )}
          >
            Anytime · clear
          </button>
          {value && (
            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-wider",
                palette.textMuted,
              )}
            >
              {formatRelative(value)}
            </span>
          )}
        </div>
      )}
    </AriaCalendar>
  );
}

// Re-export the parseDate shim so callers that previously imported via
// date-utils continue to work without churn.
export { parseDate };
