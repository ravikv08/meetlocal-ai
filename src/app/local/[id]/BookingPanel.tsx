"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  Clock,
  Hourglass,
  MapPin,
  ShieldCheck,
  Star,
  X,
  Plus,
} from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { formatRelative, formatISODate, startOfDay } from "@/lib/date-utils";
import { formatPrice } from "@/lib/utils";
import { createBooking } from "@/app/book/[localId]/actions";

// Hourly start slots from 7 AM to 7 PM. Locals work daytime hours; the meet
// itself can run up to 6 hours so a 7 PM start is still a 1 AM finish at
// max duration. To extend a successful meet, traveler books another session
// after this one completes.
const TIME_SLOTS = Array.from({ length: 13 }, (_, i) =>
  `${String(7 + i).padStart(2, "0")}:00`,
);
const HOURS_OPTIONS = [1, 2, 3, 4, 5, 6] as const;

// Adds N hours to an HH:mm string, returns HH:mm (wrapping past midnight).
function addHoursToSlot(slot: string, hours: number): string {
  const [h, m] = slot.split(":").map(Number);
  const total = (h + hours) % 24;
  return `${String(total).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

interface Spot {
  id: string;
  name: string;
  area: string;
  kind: string;
  hours: string;
  popular: boolean;
  safety: string[];
}

interface BookingPanelProps {
  localId: string;
  localName: string;
  ratePerHour: number;
  rating: number | null;
  /** ISO YYYY-MM-DD that came from /?when= or null. */
  initialDate: string | null;
  spots: Spot[];
}

// Inline booking widget rendered in the local profile sidebar. Owns all UI
// state client-side; submits to the server action used to live on /book/[id].
// All variants of the meeting-spot picker, date calendar, time/hours pills
// expand inline — no navigation.
export function BookingPanel({
  localId,
  localName,
  ratePerHour,
  rating,
  initialDate,
  spots,
}: BookingPanelProps) {
  const todayISO = formatISODate(startOfDay(new Date()));
  const [date, setDate] = useState<string>(initialDate ?? todayISO);
  const [slot, setSlot] = useState<string>("10:00");
  const [hours, setHours] = useState<number>(3);
  const endTime = addHoursToSlot(slot, hours);
  const defaultSpot = spots.find((s) => s.popular) ?? spots[0] ?? null;
  const [spotId, setSpotId] = useState<string | null>(defaultSpot?.id ?? null);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [openPicker, setOpenPicker] = useState<"date" | "spot" | null>(null);
  const [isPending, startTransition] = useTransition();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Outside-click to close any open inline picker
  useEffect(() => {
    if (!openPicker) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpenPicker(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPicker(null);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openPicker]);

  const localFirstName = localName.split(" ")[0];
  const subtotal = ratePerHour * hours;
  const serviceFee = Math.round(subtotal * 0.08);
  const taxes = Math.round(subtotal * 0.03);
  const total = subtotal + serviceFee + taxes;
  const pickedSpot = spots.find((s) => s.id === spotId) ?? null;

  const submit = () => {
    const fd = new FormData();
    fd.set("localId", localId);
    fd.set("hours", String(hours));
    fd.set("when", date);
    fd.set("slot", slot);
    if (spotId) fd.set("spotId", spotId);
    if (note.trim()) fd.set("travelerNote", note.trim());
    startTransition(async () => {
      // Server action redirects (Stripe Checkout or /booking/[id]/confirmed)
      await createBooking(fd);
    });
  };

  return (
    <div
      ref={wrapperRef}
      className="overflow-hidden rounded-3xl border border-line-2 bg-surface shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
    >
      {/* Header — rate + rating */}
      <div className="border-b border-line p-6">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-3xl font-bold">
            {formatPrice(ratePerHour)}
          </span>
          <span className="text-text-dim">/ hour</span>
          {typeof rating === "number" && (
            <span className="ml-auto inline-flex items-center gap-1 text-sm">
              <Star size={13} className="fill-amber text-amber" />
              <span className="font-medium">{rating.toFixed(2)}</span>
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-text-dim">
          Pay only after {localFirstName} accepts. Funds held in escrow.
        </p>
      </div>

      {/* Date */}
      <div className="border-b border-line p-4">
        <Label icon={<Calendar size={13} />}>Date</Label>
        <button
          type="button"
          onClick={() => setOpenPicker(openPicker === "date" ? null : "date")}
          className="mt-2 flex w-full items-center justify-between rounded-xl border border-line-2 bg-bg-2 px-3 py-2.5 text-left text-sm transition hover:border-coral/40"
        >
          <span className="font-medium text-text">{formatRelative(date)}</span>
          <ChevronDown
            size={14}
            className={
              "text-text-dim transition " +
              (openPicker === "date" ? "rotate-180" : "")
            }
          />
        </button>
        {openPicker === "date" && (
          <div className="mt-2 overflow-hidden rounded-2xl border border-line-2 bg-surface-2">
            <DatePicker
              value={date}
              onChange={(iso) => {
                if (!iso) return;
                setDate(iso);
                setOpenPicker(null);
              }}
              variant="dark"
            />
          </div>
        )}
      </div>

      {/* Time + hours */}
      <div className="border-b border-line p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label icon={<Clock size={13} />}>Start time</Label>
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line-2 bg-bg-2 px-3 py-2.5 text-sm font-medium outline-none transition hover:border-coral/40"
            >
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label icon={<Hourglass size={13} />}>Hours</Label>
            <select
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-line-2 bg-bg-2 px-3 py-2.5 text-sm font-medium outline-none transition hover:border-coral/40"
            >
              {HOURS_OPTIONS.map((h) => (
                <option key={h} value={h}>
                  {h}h
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Computed end time — updates live as start/hours change. Useful so
            the traveler doesn't have to math the end of their meet, and so
            the local can plan their day around the wrap time. */}
        <div className="mt-3 flex items-center justify-between rounded-xl border border-dashed border-line-2 bg-bg-2/40 px-3.5 py-2.5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Meet runs
          </span>
          <span className="font-mono text-sm text-text">
            {slot}
            <span className="mx-1.5 text-text-muted">→</span>
            {endTime}
          </span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-text-muted">
          Want to extend? After this meet completes, you can book {localFirstName} again as a new session.
        </p>
      </div>

      {/* Meeting spot — Starbucks Rule */}
      <div className="border-b border-line p-4">
        <Label icon={<MapPin size={13} />}>Where you&apos;ll meet</Label>
        <button
          type="button"
          onClick={() => setOpenPicker(openPicker === "spot" ? null : "spot")}
          className="mt-2 flex w-full items-start gap-3 rounded-xl border border-line-2 bg-bg-2 p-3 text-left transition hover:border-coral/40"
        >
          <div className="grad-sunset flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white">
            <MapPin size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">
              {pickedSpot?.name ?? "Pick a meeting spot"}
            </div>
            <div className="truncate text-xs text-text-dim">
              {pickedSpot
                ? `${pickedSpot.area} · ${pickedSpot.hours}`
                : "Public, well-lit, vetted"}
            </div>
          </div>
          <ChevronDown
            size={14}
            className={
              "shrink-0 text-text-dim transition " +
              (openPicker === "spot" ? "rotate-180" : "")
            }
          />
        </button>
        <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
          <ShieldCheck size={11} className="text-coral/70" />
          Starbucks Rule applies for first meetings
        </p>

        {openPicker === "spot" && (
          <div className="mt-2 max-h-72 overflow-y-auto rounded-2xl border border-line-2 bg-surface-2 p-1.5">
            {spots.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-text-dim">
                No vetted spots in this city yet.
              </div>
            )}
            {spots.map((s) => {
              const on = s.id === spotId;
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => {
                    setSpotId(s.id);
                    setOpenPicker(null);
                  }}
                  className={
                    "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition " +
                    (on ? "bg-coral/10" : "hover:bg-bg-2")
                  }
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-2 text-text-dim">
                    <MapPin size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {s.name}
                      {s.popular && (
                        <span className="rounded-full bg-amber/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-amber">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-text-dim">
                      {s.area} · {s.hours}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Note (collapsible) */}
      <div className="border-b border-line p-4">
        {showNote ? (
          <>
            <div className="flex items-baseline justify-between">
              <Label>Note to {localFirstName}</Label>
              <button
                type="button"
                onClick={() => {
                  setNote("");
                  setShowNote(false);
                }}
                className="font-mono text-[10px] uppercase tracking-wider text-text-muted transition hover:text-text"
              >
                Remove
              </button>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder={`Hi ${localFirstName} — quick note about what I'm hoping to do…`}
              className="mt-2 w-full resize-y rounded-xl border border-line-2 bg-bg-2 p-3 text-sm outline-none transition focus:border-coral/40"
            />
          </>
        ) : (
          <button
            type="button"
            onClick={() => setShowNote(true)}
            className="flex w-full items-center gap-2 rounded-xl border border-dashed border-line-2 bg-bg-2 px-3 py-2.5 text-sm text-text-dim transition hover:border-coral/40 hover:text-text"
          >
            <Plus size={14} />
            Add a note (optional)
          </button>
        )}
      </div>

      {/* Trip summary */}
      <div className="grid gap-2 border-b border-line p-4 text-sm">
        <SumRow
          k={`${formatPrice(ratePerHour)} × ${hours} hours`}
          v={formatPrice(subtotal)}
        />
        <SumRow k="Service fee" v={formatPrice(serviceFee)} />
        <SumRow k="Taxes" v={formatPrice(taxes)} />
        <div className="mt-2 border-t border-line pt-3">
          <SumRow k="Total" v={formatPrice(total)} bold />
        </div>
      </div>

      {/* CTA + trust */}
      <div className="space-y-3 p-4">
        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="grad-sunset flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(255,106,61,0.3)] transition hover:opacity-95 disabled:opacity-70"
        >
          {isPending ? "Sending…" : `Send request · ${formatPrice(total)}`}
          {!isPending && <ArrowRight size={15} />}
        </button>
        <p className="text-center font-mono text-[10px] uppercase tracking-wider text-text-muted">
          You won&rsquo;t be charged until {localFirstName} accepts
        </p>

        <ul className="grid gap-1.5 text-xs text-text-dim">
          <Trust>First meet at a public, vetted spot</Trust>
          <Trust>Two-way reviews after every session</Trust>
          <Trust>Free cancellation up to 12 hours before</Trust>
        </ul>

        <p className="text-[11px] leading-relaxed text-text-muted">
          By sending this request, you agree to meetlocal&rsquo;s{" "}
          <a href="/terms" target="_blank" rel="noopener" className="underline hover:text-text-dim">
            Terms
          </a>
          ,{" "}
          <a href="/refund" target="_blank" rel="noopener" className="underline hover:text-text-dim">
            Refund Policy
          </a>
          , and acknowledge our{" "}
          <a href="/privacy" target="_blank" rel="noopener" className="underline hover:text-text-dim">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function Label({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
      {icon}
      {children}
    </div>
  );
}

function SumRow({
  k,
  v,
  bold,
}: {
  k: string;
  v: string;
  bold?: boolean;
}) {
  return (
    <div
      className={
        "flex justify-between " +
        (bold
          ? "text-base font-semibold"
          : "text-sm text-text-dim")
      }
    >
      <span>{k}</span>
      <span className={bold ? "font-display tracking-tight text-text" : "text-text"}>
        {v}
      </span>
    </div>
  );
}

function Trust({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 leading-snug">
      <X size={0} aria-hidden />
      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
      {children}
    </li>
  );
}
