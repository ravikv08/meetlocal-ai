"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PhotoUpload } from "@/components/PhotoUpload";
import { LiveSelfieCapture } from "@/components/LiveSelfieCapture";
import { submitApplication } from "./actions";

interface ApplyFormProps {
  cities: { slug: string; name: string }[];
  categories: { id: string; label: string }[];
  currentName: string;
  /** When true, hide the selfie + ID upload UI — those will be captured
   *  post-submit via Stripe Identity instead. */
  useStripeIdentity?: boolean;
}

const RESIDENCY_OPTIONS = [
  { value: "native", label: "Born & raised here" },
  { value: "rooted", label: "10+ years here" },
  { value: "seasoned", label: "3–10 years here" },
  { value: "newlocal", label: "Recently moved" },
];

const LANG_OPTIONS = ["EN", "ES", "PT", "FR", "DE", "IT", "JA", "ZH", "HI", "AR"];

const inputClass =
  "w-full rounded-xl border border-line-2 bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted outline-none focus:border-coral";

// Latest DOB allowed for an 18-year-old today; client-side hint, the action
// re-validates server-side.
function maxDobToday(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
}

export function ApplyForm({
  cities,
  categories,
  currentName,
  useStripeIdentity = false,
}: ApplyFormProps) {
  const [pickedTags, setPickedTags] = useState<string[]>([]);
  const [pickedLangs, setPickedLangs] = useState<string[]>(["EN"]);
  const [agreedIC, setAgreedIC] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pickedTags.length === 0) {
      setError("Pick at least one thing you'd show a traveler.");
      return;
    }
    if (!agreedIC) {
      setError(
        "Please review and accept the Local Independent Contractor Agreement to continue.",
      );
      return;
    }
    setError(null);
    const fd = new FormData(e.currentTarget);
    pickedTags.forEach((t) => fd.append("tags", t));
    pickedLangs.forEach((l) => fd.append("languages", l));
    fd.set("agreedIC", "1");
    startTransition(async () => {
      const res = await submitApplication(fd);
      if (res?.error) setError(res.error);
    });
  };

  return (
    <form onSubmit={onSubmit} className="relative mx-auto max-w-2xl space-y-8 px-5 py-8 sm:space-y-10 sm:px-10 sm:py-14">
      <header>
        <div className="font-mono text-xs uppercase tracking-[0.12em] text-text-muted">
          ● Application
        </div>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight">
          Tell us about you, {currentName ? currentName.split(" ")[0] : "there"}.
        </h1>
        <p className="mt-3 text-text-dim">
          Founder reviews every application personally. We&rsquo;ll get back to
          you within 24 hours.
        </p>
      </header>

      {/* 01. Photo */}
      <Section num="01" title="Profile photo">
        <PhotoUpload name="photoUrl" variant="dark" />
      </Section>

      {/* 02. Where */}
      <Section num="02" title="Where you live">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City">
            <select name="city" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Pick your city…
              </option>
              {cities.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Neighborhood">
            <input
              name="neighborhood"
              required
              placeholder="e.g. Wynwood, Roma Norte"
              className={inputClass}
            />
          </Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Residency">
            <select
              name="residency"
              required
              defaultValue="native"
              className={inputClass}
            >
              {RESIDENCY_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Years in city">
            <input
              name="yearsInCity"
              type="number"
              min={0}
              max={99}
              required
              placeholder="e.g. 14"
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      {/* 03. About */}
      <Section num="03" title="What you'd show a traveler">
        <Field label="Tagline">
          <input
            name="tagline"
            required
            maxLength={80}
            placeholder="e.g. Cuban food crawls & domino-park afternoons"
            className={inputClass}
          />
        </Field>
        <div className="mt-4">
          <Field label="Bio">
            <textarea
              name="bio"
              required
              rows={5}
              maxLength={600}
              placeholder="A few sentences about you and what a meetup with you actually looks like."
              className={`${inputClass} resize-y`}
            />
          </Field>
        </div>
        <div className="mt-4">
          <Label>What you can show (pick all that fit)</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((c) => {
              const on = pickedTags.includes(c.id);
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() =>
                    setPickedTags((t) =>
                      on ? t.filter((x) => x !== c.id) : [...t, c.id],
                    )
                  }
                  className={
                    "rounded-full border px-4 py-2 text-sm font-medium transition " +
                    (on
                      ? "grad-sunset border-transparent text-white shadow-[0_10px_30px_rgba(255,106,61,0.25)]"
                      : "border-line-2 bg-surface text-text hover:bg-surface-2")
                  }
                >
                  {on ? "✓ " : ""}
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-4">
          <Label>Languages you speak</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {LANG_OPTIONS.map((l) => {
              const on = pickedLangs.includes(l);
              return (
                <button
                  type="button"
                  key={l}
                  onClick={() =>
                    setPickedLangs((langs) =>
                      on ? langs.filter((x) => x !== l) : [...langs, l],
                    )
                  }
                  className={
                    "rounded-full border px-3 py-1.5 font-mono text-xs font-medium transition " +
                    (on
                      ? "grad-sunset border-transparent text-white"
                      : "border-line-2 bg-surface text-text hover:bg-surface-2")
                  }
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      {/* 04. Identity & age verification */}
      <Section num="04" title="Verify your identity">
        <p className="-mt-2 mb-4 text-sm text-text-dim">
          {useStripeIdentity
            ? "We use Stripe Identity (the same service Coinbase and DoorDash use) to confirm your ID. You'll do this after submitting the form — takes about 2 minutes, all on stripe.com, your photos never touch our servers."
            : "Two-step verification, like Uber. We compare your live selfie against the ID you upload to confirm you're a real person. Both photos are reviewed privately and never appear on your public profile — travelers only see a green “ID verified” badge once we've checked."}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date of birth">
            <input
              name="dateOfBirth"
              type="date"
              required
              max={maxDobToday()}
              className={inputClass}
            />
          </Field>
          <Field label="Legal full name">
            <input
              name="legalName"
              required
              placeholder="As shown on your ID"
              className={inputClass}
            />
          </Field>
        </div>
        {!useStripeIdentity && (
          <>
            <div className="mt-6">
              <LiveSelfieCapture name="selfieUrl" />
            </div>
            <div className="mt-6">
              <PhotoUpload
                name="governmentIdUrl"
                label="Government-issued ID (passport, driver's license)"
                variant="dark"
              />
              <p className="mt-2 text-xs text-text-muted">
                Take a clear photo of the front of your ID. Cover any
                sensitive numbers if you&rsquo;d like — we only need name,
                photo, and date of birth visible.
              </p>
            </div>
          </>
        )}
      </Section>

      {/* 05. Pricing */}
      <Section num="05" title="Your hourly rate">
        <Field label="USD per hour">
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl text-text">$</span>
            <input
              name="ratePerHour"
              type="number"
              min={15}
              max={200}
              step={5}
              required
              defaultValue={45}
              className="w-32 rounded-xl border border-line-2 bg-surface px-4 py-3 text-lg font-semibold text-text outline-none focus:border-coral"
            />
            <span className="text-sm text-text-dim">/ hour · we keep 22%</span>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            Most of our locals charge $25–$80. You can change this any time.
          </p>
        </Field>
      </Section>

      {/* 06. Social links — public, shown on profile so travelers can verify */}
      <Section num="06" title="Verify yourself on the open web">
        <p className="-mt-2 mb-4 text-sm text-text-dim">
          Optional but strongly recommended. Travelers see these as clickable
          links on your profile so they can confirm you&rsquo;re a real person
          before booking.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram handle">
            <input
              name="instagramHandle"
              placeholder="@yourhandle"
              className={inputClass}
            />
          </Field>
          <Field label="Facebook URL">
            <input
              name="facebookUrl"
              type="url"
              placeholder="https://facebook.com/you"
              className={inputClass}
            />
          </Field>
          <Field label="X / Twitter handle">
            <input
              name="twitterHandle"
              placeholder="@yourhandle"
              className={inputClass}
            />
          </Field>
          <Field label="LinkedIn URL">
            <input
              name="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/you"
              className={inputClass}
            />
          </Field>
          <Field label="Snapchat handle">
            <input
              name="snapchatHandle"
              placeholder="@yourhandle"
              className={inputClass}
            />
          </Field>
          <Field label="Luma URL">
            <input
              name="lumaUrl"
              type="url"
              placeholder="https://lu.ma/you"
              className={inputClass}
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Personal website">
            <input
              name="websiteUrl"
              type="url"
              placeholder="https://yourcity.tours"
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      {/* Legal acceptance — required before submit. The Independent Contractor
          Agreement is what protects worker classification, so we surface it
          explicitly with its own checkbox (Airbnb host-flow pattern). Terms
          and Privacy are accepted implicitly via the prose below. */}
      <Section num="11" title="Agreements">
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line-2 bg-surface p-4 transition hover:border-coral/40">
          <input
            type="checkbox"
            checked={agreedIC}
            onChange={(e) => setAgreedIC(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-coral"
            aria-required
          />
          <span className="text-sm leading-relaxed text-text-dim">
            I have read and agree to the{" "}
            <Link
              href="/ic-agreement"
              target="_blank"
              rel="noopener"
              className="font-semibold text-coral underline underline-offset-2 hover:opacity-90"
            >
              Local Independent Contractor Agreement
            </Link>
            . I understand I am applying as an{" "}
            <strong className="text-text">independent contractor</strong>, not
            an employee, and that I set my own rates, schedule, and meet
            conduct.
          </span>
        </label>
        <p className="mt-3 text-xs leading-relaxed text-text-muted">
          By submitting this application, you also agree to meetlocal&rsquo;s{" "}
          <Link href="/terms" target="_blank" rel="noopener" className="underline hover:text-text-dim">
            Terms of Service
          </Link>
          ,{" "}
          <Link href="/refund" target="_blank" rel="noopener" className="underline hover:text-text-dim">
            Refund Policy
          </Link>
          , and{" "}
          <Link href="/acceptable-use" target="_blank" rel="noopener" className="underline hover:text-text-dim">
            Acceptable Use Policy
          </Link>
          , and acknowledge our{" "}
          <Link href="/privacy" target="_blank" rel="noopener" className="underline hover:text-text-dim">
            Privacy Policy
          </Link>
          . You also consent to a background check via our verification partner
          under the Fair Credit Reporting Act.
        </p>
      </Section>

      {error && (
        <div className="rounded-xl border border-magenta/40 bg-magenta/10 p-4 text-sm text-magenta">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !agreedIC}
        className="grad-sunset flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold text-white shadow-[0_20px_60px_rgba(255,106,61,0.27)] transition hover:opacity-95 disabled:opacity-60"
      >
        {isPending ? "Submitting…" : "Submit application"}
        <ArrowRight size={16} />
      </button>
      <p className="text-center text-xs text-text-muted">
        Founder typically responds within 24 hours.
      </p>
    </form>
  );
}

function Section({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-baseline gap-3">
        <span className="font-mono text-xs tracking-[0.1em] text-text-muted">{num}</span>
        <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
      {children}
    </span>
  );
}
