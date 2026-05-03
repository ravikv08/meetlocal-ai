"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Sparkles, Check } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { formatRelative } from "@/lib/date-utils";

export interface SearchBarCity {
  slug: string;
  name: string;
  state: string;
}

export interface SearchBarVibe {
  id: string;
  label: string;
  blurb: string;
}

interface SearchBarProps {
  cities: SearchBarCity[];
  vibes: SearchBarVibe[];
  defaultCity: string | null;
  /** ISO YYYY-MM-DD or null. */
  defaultWhen: string | null;
  /** Multi-select vibes — empty array = nothing picked yet. */
  defaultVibes: string[];
}

// Three required filter pills: City · Date · Vibe. City and Date are single-
// select with auto-advance; Vibe is multi-select (pick one or more). The
// gradient "Find locals" button stays disabled until all three have at least
// one value.
export function SearchBar({
  cities,
  vibes,
  defaultCity,
  defaultWhen,
  defaultVibes,
}: SearchBarProps) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [city, setCity] = useState<string | null>(defaultCity);
  const [when, setWhen] = useState<string | null>(defaultWhen);
  const [selectedVibes, setSelectedVibes] = useState<string[]>(defaultVibes);
  const [open, setOpen] = useState<"city" | "when" | "vibe" | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isComplete = !!(city && when && selectedVibes.length > 0);

  const submit = () => {
    if (!isComplete) {
      // Open the first incomplete field instead of blocking silently
      if (!city) setOpen("city");
      else if (!when) setOpen("when");
      else setOpen("vibe");
      return;
    }
    const params = new URLSearchParams();
    params.set("city", city!);
    params.set("when", when!);
    params.set("vibes", selectedVibes.join(","));
    router.push(`/?${params.toString()}`);
    setOpen(null);
  };

  const cityLabel = city
    ? cities.find((c) => c.slug === city)?.name ?? "Pick a city"
    : "Pick a city";
  const whenLabel = when ? formatRelative(when) : "Pick a date";
  const vibeLabel = (() => {
    if (selectedVibes.length === 0) return "Pick vibes";
    if (selectedVibes.length === 1) {
      return vibes.find((v) => v.id === selectedVibes[0])?.label ?? "1 vibe";
    }
    if (selectedVibes.length === 2) {
      return selectedVibes
        .map((id) => vibes.find((v) => v.id === id)?.label ?? id)
        .join(" + ");
    }
    return `${selectedVibes.length} vibes`;
  })();
  const toggleVibe = (id: string) => {
    setSelectedVibes((curr) =>
      curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id],
    );
  };

  return (
    <div ref={wrapperRef} className="relative mt-12 max-w-[820px]">
      {/* Gradient border via padded wrapper. Inner div has the surface bg;
          the 1px sliver of gradient between them is the "border". */}
      <div
        className="grad-sunset rounded-3xl p-px shadow-[0_20px_60px_rgba(0,0,0,0.45),0_0_80px_rgba(255,106,61,0.22)] sm:rounded-full"
        style={{ backgroundImage: "var(--grad-sunset)" }}
      >
        <div className="flex flex-wrap items-stretch rounded-[calc(1.5rem-1px)] bg-surface p-1.5 sm:rounded-full sm:flex-nowrap">
          <PillField
            step={1}
            icon={<MapPin size={14} className="text-coral/70" />}
            label="City"
            value={cityLabel}
            filled={!!city}
            active={open === "city"}
            onClick={() => setOpen(open === "city" ? null : "city")}
          />
          <Divider />
          <PillField
            step={2}
            icon={<Calendar size={14} className="text-coral/70" />}
            label="Date"
            value={whenLabel}
            filled={!!when}
            active={open === "when"}
            onClick={() => setOpen(open === "when" ? null : "when")}
          />
          <Divider />
          <PillField
            step={3}
            icon={<Sparkles size={14} className="text-coral/70" />}
            label="Vibe"
            value={vibeLabel}
            filled={selectedVibes.length > 0}
            active={open === "vibe"}
            onClick={() => setOpen(open === "vibe" ? null : "vibe")}
          />
          <button
            onClick={submit}
            disabled={!isComplete}
            className={
              "ml-auto flex min-w-[140px] items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition " +
              (isComplete
                ? "grad-sunset text-white shadow-[0_10px_30px_rgba(255,106,61,0.35)] hover:opacity-95"
                : "cursor-not-allowed border border-coral/30 bg-surface-2 text-coral/60")
            }
            title={
              isComplete
                ? "Find locals"
                : "Pick a city, date, and vibe to enable search"
            }
          >
            <Search size={16} /> Find locals
          </button>
        </div>
      </div>

      {/* Helper line */}
      {!isComplete && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 px-2 font-mono text-[11px] uppercase tracking-[0.14em]">
          <span className="font-semibold text-coral">Required</span>
          <span className="text-text-muted">·</span>
          <Pip filled={!!city}>City</Pip>
          <span className="text-text-muted">·</span>
          <Pip filled={!!when}>Date</Pip>
          <span className="text-text-muted">·</span>
          <Pip filled={selectedVibes.length > 0}>
            Vibe{selectedVibes.length > 1 ? `s · ${selectedVibes.length}` : ""}
          </Pip>
        </div>
      )}

      {/* CITY popover */}
      {open === "city" && (
        <Popover>
          <PopoverHeading>1 · Pick a city</PopoverHeading>
          <div className="grid gap-1 p-1.5">
            {cities.map((c) => {
              const on = c.slug === city;
              return (
                <button
                  key={c.slug}
                  onClick={() => {
                    setCity(c.slug);
                    setOpen("when");
                  }}
                  className={
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition " +
                    (on ? "bg-surface-2" : "hover:bg-surface-2")
                  }
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bg-2 text-text-dim">
                    <MapPin size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {c.state}
                    </div>
                  </div>
                  {on && <Check size={15} className="text-coral" />}
                </button>
              );
            })}
          </div>
        </Popover>
      )}

      {/* DATE popover */}
      {open === "when" && (
        <Popover wide>
          <PopoverHeading>2 · Pick a date</PopoverHeading>
          <DatePicker
            value={when}
            onChange={(iso) => {
              setWhen(iso);
              if (iso) setOpen("vibe");
            }}
            variant="dark"
          />
        </Popover>
      )}

      {/* VIBE popover — multi-select, pick one or more */}
      {open === "vibe" && (
        <Popover wide>
          <PopoverHeading>
            3 · Pick vibes <span className="text-text-muted">· multi-select</span>
          </PopoverHeading>
          <div className="grid gap-1.5 p-2.5 sm:grid-cols-2">
            {vibes.map((v) => {
              const on = selectedVibes.includes(v.id);
              return (
                <button
                  key={v.id}
                  onClick={() => toggleVibe(v.id)}
                  className={
                    "flex items-start gap-2.5 rounded-xl border p-3 text-left transition " +
                    (on
                      ? "border-coral bg-coral/10 text-text"
                      : "border-line bg-surface text-text hover:border-line-2")
                  }
                >
                  <div
                    className={
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border " +
                      (on ? "border-coral bg-coral text-white" : "border-line-2")
                    }
                  >
                    {on && <Check size={12} strokeWidth={3} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium leading-tight">
                      {v.label}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-text-dim">
                      {v.blurb}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-2.5">
            <button
              onClick={() => setSelectedVibes([])}
              disabled={selectedVibes.length === 0}
              className="text-xs text-text-dim transition hover:text-text disabled:opacity-40"
            >
              Clear
            </button>
            <button
              onClick={submit}
              disabled={!isComplete}
              className={
                "rounded-full px-4 py-2 text-xs font-semibold text-white transition " +
                (isComplete
                  ? "grad-sunset"
                  : "cursor-not-allowed bg-surface-2 text-text-muted")
              }
            >
              {selectedVibes.length > 1
                ? `Find locals · ${selectedVibes.length} vibes →`
                : "Find locals →"}
            </button>
          </div>
        </Popover>
      )}
    </div>
  );
}

function PillField({
  step,
  icon,
  label,
  value,
  filled,
  active,
  onClick,
}: {
  step: number;
  icon: React.ReactNode;
  label: string;
  value: string;
  filled: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex flex-1 items-center gap-2.5 rounded-full px-4 py-2.5 text-left transition sm:px-5 " +
        (active
          ? "bg-surface-2 ring-1 ring-coral/50 ring-inset"
          : "hover:bg-surface-2")
      }
    >
      <div
        className={
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-semibold transition " +
          (filled
            ? "grad-sunset text-white shadow-[0_4px_12px_rgba(255,106,61,0.45)]"
            : "border border-coral/50 text-coral")
        }
      >
        {filled ? "✓" : step}
      </div>
      <div className="min-w-0">
        <div
          className={
            "flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] " +
            (active ? "text-coral" : "text-text-muted")
          }
        >
          {icon}
          {label}
        </div>
        <div
          className={
            "mt-0.5 truncate text-sm " +
            (filled
              ? "font-medium text-text"
              : active
              ? "text-amber"
              : "text-text-dim")
          }
        >
          {value}
        </div>
      </div>
    </button>
  );
}

function Divider() {
  return <div className="my-2 hidden w-px bg-coral/15 sm:block" />;
}

function Pip({
  filled,
  children,
}: {
  filled: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 " +
        (filled ? "font-semibold text-coral" : "text-coral/60")
      }
    >
      <span
        className={
          "h-1.5 w-1.5 rounded-full " +
          (filled
            ? "bg-coral shadow-[0_0_8px_rgba(255,106,61,0.7)]"
            : "bg-coral/30")
        }
      />
      {children}
    </span>
  );
}

function Popover({
  children,
  wide,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={
        "absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-line-2 shadow-[0_30px_60px_rgba(0,0,0,0.5)] " +
        (wide ? "sm:max-w-md" : "sm:max-w-md")
      }
      style={{ background: "rgba(28,23,19,0.96)", backdropFilter: "blur(20px)" }}
    >
      {children}
    </div>
  );
}

function PopoverHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-text-dim">
      {children}
    </div>
  );
}
