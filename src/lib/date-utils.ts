// Pure date helpers — usable from both server components and the client
// DatePicker. Keep this file free of "use client" so server pages can import.

import {
  CalendarDate,
  parseDate,
  today as todayCalendar,
  getLocalTimeZone,
} from "@internationalized/date";

export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** ISO `YYYY-MM-DD` → CalendarDate (or null when input is null). */
export function toCalendarDate(iso: string | null): CalendarDate | null {
  if (!iso) return null;
  try {
    return parseDate(iso);
  } catch {
    return null;
  }
}

/** CalendarDate → ISO `YYYY-MM-DD`. CalendarDate.toString already emits ISO. */
export function fromCalendarDate(d: CalendarDate): string {
  return d.toString();
}

/** Today as a CalendarDate in the user's local timezone. */
export function todayLocal(): CalendarDate {
  return todayCalendar(getLocalTimeZone());
}

export function formatISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string): Date {
  // Force local-tz parsing to avoid the off-by-one bug from `new Date('YYYY-MM-DD')` (UTC)
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** "Today" / "Tomorrow" / "Sat, May 15" */
export function formatRelative(iso: string): string {
  const date = parseISODate(iso);
  const today = startOfDay(new Date());
  const diff = Math.round((date.getTime() - today.getTime()) / 86400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
