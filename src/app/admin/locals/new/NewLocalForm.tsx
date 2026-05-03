"use client";

import { useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";
import { PhotoUpload } from "@/components/PhotoUpload";
import { createLocalAsAdmin } from "./actions";

const RESIDENCY_OPTIONS = [
  { value: "native", label: "Born & raised here" },
  { value: "rooted", label: "10+ years here" },
  { value: "seasoned", label: "3–10 years here" },
  { value: "newlocal", label: "Recently moved" },
];

const LANG_OPTIONS = ["EN", "ES", "PT", "FR", "DE", "IT", "JA", "ZH", "HI", "AR"];

interface NewLocalFormProps {
  cities: { slug: string; name: string }[];
  categories: { id: string; label: string }[];
  candidateUsers: { id: string; name: string | null; email: string }[];
}

export function NewLocalForm({
  cities,
  categories,
  candidateUsers,
}: NewLocalFormProps) {
  const [mode, setMode] = useState<"existing" | "new">(
    candidateUsers.length > 0 ? "existing" : "new",
  );
  const [pickedTags, setPickedTags] = useState<string[]>([]);
  const [pickedLangs, setPickedLangs] = useState<string[]>(["EN"]);
  const [activate, setActivate] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pickedTags.length === 0) {
      setError("Pick at least one category.");
      return;
    }
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("mode", mode);
    fd.set("activate", activate ? "1" : "");
    pickedTags.forEach((t) => fd.append("tags", t));
    pickedLangs.forEach((l) => fd.append("languages", l));
    startTransition(async () => {
      const res = await createLocalAsAdmin(fd);
      if (res?.error) setError(res.error);
    });
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-10 px-10 py-14">
      <header>
        <div className="font-mono text-xs uppercase tracking-[0.12em] text-ink-muted">
          ● Founder · Add a local
        </div>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight">
          Add a real local to the platform.
        </h1>
        <p className="mt-3 text-ink-dim">
          Use this to swap a placeholder seed for someone in your network. They
          can either already be a signed-up user, or a new placeholder you&rsquo;ll
          link to a real account later.
        </p>
      </header>

      {/* Who */}
      <Section num="01" title="Who is this local?">
        <div className="inline-flex rounded-full border border-hair-2 bg-paper p-1">
          {(["existing", "new"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              disabled={m === "existing" && candidateUsers.length === 0}
              className={
                m === mode
                  ? "rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper"
                  : "rounded-full px-4 py-2 text-sm font-medium text-ink-dim transition hover:text-ink disabled:opacity-50"
              }
            >
              {m === "existing"
                ? `Existing user (${candidateUsers.length})`
                : "New placeholder"}
            </button>
          ))}
        </div>

        {mode === "existing" ? (
          <div className="mt-4">
            <Field label="Pick a user">
              <select
                name="userId"
                required={mode === "existing"}
                defaultValue=""
                className="w-full rounded-xl border border-hair-2 bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
              >
                <option value="" disabled>
                  Pick a signed-up user…
                </option>
                {candidateUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name ? `${u.name} · ${u.email}` : u.email}
                  </option>
                ))}
              </select>
            </Field>
            <p className="mt-2 text-xs text-ink-muted">
              Only users without an existing local profile are listed.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Display name">
              <input
                name="newName"
                required={mode === "new"}
                placeholder="e.g. Carla M."
                className="w-full rounded-xl border border-hair-2 bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </Field>
            <Field label="Email (placeholder OK)">
              <input
                name="newEmail"
                type="email"
                required={mode === "new"}
                placeholder="carla@meetlocal.ai"
                className="w-full rounded-xl border border-hair-2 bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </Field>
            <p className="text-xs text-ink-muted sm:col-span-2">
              When the real person signs up with this exact email later, the
              account auto-links to this profile.
            </p>
          </div>
        )}
      </Section>

      {/* Photo */}
      <Section num="02" title="Profile photo">
        <PhotoUpload name="photoUrl" />
      </Section>

      {/* Where */}
      <Section num="03" title="Where they live">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City">
            <select
              name="city"
              required
              defaultValue=""
              className="w-full rounded-xl border border-hair-2 bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
            >
              <option value="" disabled>
                Pick a city…
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
              className="w-full rounded-xl border border-hair-2 bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </Field>
          <Field label="Residency">
            <select
              name="residency"
              required
              defaultValue="native"
              className="w-full rounded-xl border border-hair-2 bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
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
              defaultValue={5}
              className="w-full rounded-xl border border-hair-2 bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </Field>
        </div>
      </Section>

      {/* About */}
      <Section num="04" title="About them">
        <Field label="Tagline">
          <input
            name="tagline"
            required
            maxLength={80}
            placeholder="e.g. Cuban food crawls & domino-park afternoons"
            className="w-full rounded-xl border border-hair-2 bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
          />
        </Field>
        <div className="mt-4">
          <Field label="Bio">
            <textarea
              name="bio"
              required
              rows={5}
              maxLength={600}
              placeholder="What a meetup with them looks like."
              className="w-full resize-y rounded-xl border border-hair-2 bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </Field>
        </div>
        <div className="mt-4">
          <Label>Categories</Label>
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
                      ? "border-ink bg-ink text-paper"
                      : "border-hair-2 bg-paper text-ink hover:bg-paper-bg")
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
          <Label>Languages</Label>
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
                      ? "border-ink bg-ink text-paper"
                      : "border-hair-2 bg-paper text-ink hover:bg-paper-bg")
                  }
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Pricing + activation */}
      <Section num="05" title="Rate &amp; status">
        <Field label="USD per hour">
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl">$</span>
            <input
              name="ratePerHour"
              type="number"
              min={15}
              max={500}
              step={5}
              required
              defaultValue={45}
              className="w-32 rounded-xl border border-hair-2 bg-paper px-4 py-3 text-lg font-semibold outline-none focus:border-ink"
            />
            <span className="text-sm text-ink-dim">/ hour</span>
          </div>
        </Field>
        <label className="mt-5 flex items-start gap-3 rounded-xl border border-hair-2 bg-paper p-4 text-sm">
          <input
            type="checkbox"
            checked={activate}
            onChange={(e) => setActivate(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-ink"
          />
          <span>
            <strong>Activate immediately</strong>
            <span className="ml-1 text-ink-dim">
              — go live on the discover page right after submit. Uncheck to keep
              as &ldquo;pending&rdquo; for review.
            </span>
          </span>
        </label>
      </Section>

      {error && (
        <div className="rounded-xl border border-magenta/40 bg-magenta/5 p-4 text-sm text-magenta">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-4 text-base font-semibold text-paper transition hover:opacity-95 disabled:opacity-60"
      >
        {isPending ? "Adding…" : "Add this local"}
        <ArrowRight size={16} />
      </button>
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
        <span className="font-mono text-xs tracking-[0.1em] text-ink-muted">{num}</span>
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
    <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
      {children}
    </span>
  );
}
