"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  formatISODate,
  formatRelative,
  parseISODate,
  startOfDay,
} from "@/lib/date-utils";

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

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"] as const;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

// Reusable month-view calendar. Pure UI: parent owns the `value` state and
// receives changes via onChange. ISO `YYYY-MM-DD` is the wire format so it
// round-trips cleanly through URLs and Postgres.
export function DatePicker({
  value,
  onChange,
  minDate,
  allowClear = false,
  variant = "dark",
}: DatePickerProps) {
  const today = startOfDay(new Date());
  const min = minDate ? startOfDay(minDate) : today;

  const initial = value ? parseISODate(value) : today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const cells = buildMonthGrid(viewYear, viewMonth);

  const palette = variant === "paper"
    ? {
        text: "text-ink",
        textDim: "text-ink-dim",
        textMuted: "text-ink-muted",
        line: "border-hair",
        line2: "border-hair-2",
        surface: "bg-paper",
        hover: "hover:bg-paper-bg",
      }
    : {
        text: "text-text",
        textDim: "text-text-dim",
        textMuted: "text-text-muted",
        line: "border-line",
        line2: "border-line-2",
        surface: "bg-surface",
        hover: "hover:bg-surface-2",
      };

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };
  const goNext = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Disable navigating past current month to dodge the past entirely
  const minMonthIdx = min.getFullYear() * 12 + min.getMonth();
  const viewMonthIdx = viewYear * 12 + viewMonth;
  const canGoPrev = viewMonthIdx > minMonthIdx;
  // Cap forward navigation at 6 months out (reasonable travel-planning window)
  const maxMonthIdx = minMonthIdx + 6;
  const canGoNext = viewMonthIdx < maxMonthIdx;

  return (
    <div className={`p-3 ${palette.text}`}>
      {/* Month header */}
      <div className="mb-2 flex items-center gap-2 px-1">
        <div className="flex-1 font-display text-base font-semibold">
          {MONTHS[viewMonth]} {viewYear}
        </div>
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          className={`flex h-8 w-8 items-center justify-center rounded-full border ${palette.line2} ${palette.hover} disabled:cursor-not-allowed disabled:opacity-30`}
        >
          <ChevronLeft size={15} />
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          className={`flex h-8 w-8 items-center justify-center rounded-full border ${palette.line2} ${palette.hover} disabled:cursor-not-allowed disabled:opacity-30`}
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Weekday labels */}
      <div className={`grid grid-cols-7 px-1 ${palette.textMuted}`}>
        {WEEKDAYS.map((d, i) => (
          <div
            key={`${d}-${i}`}
            className="py-1.5 text-center font-mono text-[10px] uppercase tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-0.5 p-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const iso = formatISODate(cell);
          const isSelected = value === iso;
          const isPast = cell.getTime() < min.getTime();
          const isToday = cell.getTime() === today.getTime();
          const dayNum = cell.getDate();

          let className =
            "aspect-square rounded-lg text-sm font-medium transition flex items-center justify-center ";
          if (isPast) {
            className += `${palette.textMuted} cursor-not-allowed opacity-40`;
          } else if (isSelected) {
            className += "grad-sunset text-white shadow-[0_6px_18px_rgba(255,106,61,0.35)]";
          } else if (isToday) {
            className += `${palette.text} font-semibold border ${palette.line2} ${palette.hover}`;
          } else {
            className += `${palette.text} ${palette.hover}`;
          }

          return (
            <button
              type="button"
              key={i}
              disabled={isPast}
              onClick={() => onChange(iso)}
              className={className}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      {allowClear && (
        <div className={`mt-1 flex items-center justify-between border-t ${palette.line} px-1 pt-2`}>
          <button
            type="button"
            onClick={() => onChange(null)}
            className={`text-xs ${palette.textDim} transition hover:${palette.text}`}
          >
            Anytime · clear
          </button>
          {value && (
            <span className={`font-mono text-[10px] uppercase tracking-wider ${palette.textMuted}`}>
              {formatRelative(value)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** Returns 6 weeks * 7 days = 42 cells; nulls outside the current month. */
function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const startDow = first.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length < 42) cells.push(null);
  return cells;
}
