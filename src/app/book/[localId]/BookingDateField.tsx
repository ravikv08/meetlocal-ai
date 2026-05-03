"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ChevronDown } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { formatRelative } from "@/lib/date-utils";

interface BookingDateFieldProps {
  /** ISO YYYY-MM-DD (always set on server because we default to today) */
  selectedDate: string;
  /** All current URL params, so we can preserve hours/slot/spot when date changes */
  preservedParams: Record<string, string>;
  localId: string;
}

// Inline date selector for the booking page. Shows the selected date as a
// readable pill ("Sat, May 15") with a "Change" toggle that reveals a full
// calendar. Updates `?when=YYYY-MM-DD` in the URL via router.push so server
// re-renders the rest of the form with the new date.
export function BookingDateField({
  selectedDate,
  preservedParams,
  localId,
}: BookingDateFieldProps) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // Close on outside click / Esc
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onChange = (iso: string | null) => {
    if (!iso) return;
    const qs = new URLSearchParams({ ...preservedParams, when: iso });
    router.push(`/book/${localId}?${qs.toString()}`);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-hair-2 bg-paper px-3 py-2.5 text-sm text-ink transition hover:bg-paper-bg"
      >
        <span className="inline-flex items-center gap-2">
          <Calendar size={14} className="text-ink-muted" />
          <span className="font-medium">{formatRelative(selectedDate)}</span>
        </span>
        <ChevronDown
          size={14}
          className={"text-ink-muted transition " + (open ? "rotate-180" : "")}
        />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-hair-2 bg-paper shadow-[0_30px_60px_rgba(0,0,0,0.15)]">
          <DatePicker
            value={selectedDate}
            onChange={onChange}
            variant="paper"
          />
        </div>
      )}
    </div>
  );
}
