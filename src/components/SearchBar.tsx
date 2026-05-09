"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button as AriaButton,
  DialogTrigger,
  Selection,
} from "react-aria-components";
import { Search, MapPin, Calendar, Sparkles, Check } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { formatRelative } from "@/lib/date-utils";
import {
  ListBox,
  ListBoxItem,
  Popover,
  PopoverHeading,
} from "@/components/ui";
import { cn } from "@/lib/utils";

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

type OpenStep = "city" | "when" | "vibe" | null;

// Three required filter pills: City · Date · Vibe. City and Date are single-
// select with auto-advance; Vibe is multi-select. Now built on react-aria-
// components — DialogTrigger handles outside-click / Esc / focus restoration,
// ListBox provides arrow-key navigation and screen-reader announcements.
export function SearchBar({
  cities,
  vibes,
  defaultCity,
  defaultWhen,
  defaultVibes,
}: SearchBarProps) {
  const router = useRouter();

  const [city, setCity] = useState<string | null>(defaultCity);
  const [when, setWhen] = useState<string | null>(defaultWhen);
  const [selectedVibes, setSelectedVibes] = useState<string[]>(defaultVibes);
  const [open, setOpen] = useState<OpenStep>(null);

  const isComplete = !!(city && when && selectedVibes.length > 0);

  const submit = () => {
    if (!isComplete) {
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

  const onStepChange = (step: OpenStep) => (next: boolean) => {
    setOpen(next ? step : null);
  };

  return (
    <div className="relative max-w-[820px]">
      {/* Gradient border via padded wrapper. Inner div has the surface bg;
          the 1px sliver of gradient between them is the "border". */}
      <div
        className="grad-sunset rounded-3xl p-px shadow-[0_20px_60px_rgba(0,0,0,0.45),0_0_80px_rgba(255,106,61,0.22)] sm:rounded-full"
        style={{ backgroundImage: "var(--grad-sunset)" }}
      >
        <div className="flex flex-wrap items-stretch rounded-[calc(1.5rem-1px)] bg-surface p-1.5 sm:flex-nowrap sm:rounded-full">
          <DialogTrigger
            isOpen={open === "city"}
            onOpenChange={onStepChange("city")}
          >
            <PillField
              step={1}
              icon={<MapPin size={14} className="text-coral/70" />}
              label="City"
              value={cityLabel}
              filled={!!city}
              expanded={open === "city"}
            />
            <Popover placement="bottom start" shouldFlip={false} className="sm:max-w-md">
              <PopoverHeading>1 · Pick a city</PopoverHeading>
              <ListBox
                aria-label="City"
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={city ? new Set([city]) : new Set()}
                onSelectionChange={(keys: Selection) => {
                  if (keys === "all") return;
                  const next = Array.from(keys)[0] as string | undefined;
                  if (!next) return;
                  setCity(next);
                  setOpen("when");
                }}
              >
                {cities.map((c) => (
                  <ListBoxItem key={c.slug} id={c.slug} textValue={c.name}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bg-2 text-text-dim">
                      <MapPin size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                        {c.state}
                      </div>
                    </div>
                    {c.slug === city && (
                      <Check size={15} className="text-coral" />
                    )}
                  </ListBoxItem>
                ))}
              </ListBox>
            </Popover>
          </DialogTrigger>

          <Divider />

          <DialogTrigger
            isOpen={open === "when"}
            onOpenChange={onStepChange("when")}
          >
            <PillField
              step={2}
              icon={<Calendar size={14} className="text-coral/70" />}
              label="Date"
              value={whenLabel}
              filled={!!when}
              expanded={open === "when"}
            />
            <Popover placement="bottom start" shouldFlip={false} className="sm:max-w-md">
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
          </DialogTrigger>

          <Divider />

          <DialogTrigger
            isOpen={open === "vibe"}
            onOpenChange={onStepChange("vibe")}
          >
            <PillField
              step={3}
              icon={<Sparkles size={14} className="text-coral/70" />}
              label="Vibe"
              value={vibeLabel}
              filled={selectedVibes.length > 0}
              expanded={open === "vibe"}
            />
            <Popover placement="bottom end" shouldFlip={false} className="sm:max-w-md">
              <PopoverHeading>
                3 · Pick vibes{" "}
                <span className="text-text-muted">· multi-select</span>
              </PopoverHeading>
              <ListBox
                aria-label="Vibes"
                selectionMode="multiple"
                selectedKeys={new Set(selectedVibes)}
                onSelectionChange={(keys: Selection) => {
                  if (keys === "all") {
                    setSelectedVibes(vibes.map((v) => v.id));
                  } else {
                    setSelectedVibes(Array.from(keys) as string[]);
                  }
                }}
                className="grid gap-1.5 p-2.5 sm:grid-cols-2"
              >
                {vibes.map((v) => (
                  <ListBoxItem
                    key={v.id}
                    id={v.id}
                    textValue={v.label}
                    className={({ isSelected, isFocused, isHovered }) =>
                      cn(
                        "flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-left outline-none transition",
                        isSelected
                          ? "border-coral bg-coral/10 text-text"
                          : "border-line bg-surface text-text",
                        (isHovered || isFocused) &&
                          !isSelected &&
                          "border-line-2",
                      )
                    }
                  >
                    {({ isSelected }) => (
                      <>
                        <div
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                            isSelected
                              ? "border-coral bg-coral text-white"
                              : "border-line-2",
                          )}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium leading-tight">
                            {v.label}
                          </div>
                          <div className="mt-0.5 truncate text-xs text-text-dim">
                            {v.blurb}
                          </div>
                        </div>
                      </>
                    )}
                  </ListBoxItem>
                ))}
              </ListBox>
              <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedVibes([])}
                  disabled={selectedVibes.length === 0}
                  className="text-xs text-text-dim transition outline-none hover:text-text disabled:opacity-40"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!isComplete}
                  className={
                    "rounded-full px-4 py-2 text-xs font-semibold text-white transition outline-none " +
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
          </DialogTrigger>

          <button
            onClick={submit}
            disabled={!isComplete}
            className={
              "ml-auto flex min-w-[140px] items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold outline-none transition " +
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
    </div>
  );
}

function PillField({
  step,
  icon,
  label,
  value,
  filled,
  expanded,
}: {
  step: number;
  icon: React.ReactNode;
  label: string;
  value: string;
  filled: boolean;
  expanded: boolean;
}) {
  return (
    <AriaButton
      className={cn(
        "flex flex-1 items-center gap-2.5 rounded-full px-4 py-2.5 text-left outline-none transition sm:px-5",
        expanded
          ? "bg-surface-2 ring-1 ring-coral/50 ring-inset"
          : "data-[hovered]:bg-surface-2",
      )}
    >
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-semibold transition",
          filled
            ? "grad-sunset text-white shadow-[0_4px_12px_rgba(255,106,61,0.45)]"
            : "border border-coral/50 text-coral",
        )}
      >
        {filled ? "✓" : step}
      </div>
      <div className="min-w-0">
        <div
          className={cn(
            "flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em]",
            expanded ? "text-coral" : "text-text-muted",
          )}
        >
          {icon}
          {label}
        </div>
        <div
          className={cn(
            "mt-0.5 truncate text-sm",
            filled
              ? "font-medium text-text"
              : expanded
                ? "text-amber"
                : "text-text-dim",
          )}
        >
          {value}
        </div>
      </div>
    </AriaButton>
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
