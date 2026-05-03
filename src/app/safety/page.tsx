import { ShieldCheck, MapPin, Zap, Wallet, MessageCircle, User, Check, X } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const PILLARS = [
  {
    icon: ShieldCheck,
    t: "Every local verified",
    d: "Government ID + liveness selfie matched via Persona. Background check via Checkr (US) or Sterling (intl) — same databases Uber & Airbnb use. Re-run annually.",
  },
  {
    icon: MapPin,
    t: "Live trip tracking",
    d: "Your location is shared with up to 3 trusted contacts during every meetup. Auto-off at trip end. Your local never sees who's tracking.",
  },
  {
    icon: Zap,
    t: "One-tap SOS",
    d: "Press & hold the SOS button → we call local emergency services, share your live location, and alert your contacts. 24/7 human dispatcher on standby.",
  },
  {
    icon: Wallet,
    t: "Payment protection",
    d: "Your card is never shared. Pay through meetlocal.ai; locals are paid 24h after the meetup ends, so disputes can be resolved. Full refund if your local no-shows.",
  },
  {
    icon: MessageCircle,
    t: "Private chat, no DMs off-platform",
    d: "Messages stay on the platform — detected phone / WhatsApp handoffs are flagged. AI monitors for grooming & scam patterns in real-time.",
  },
  {
    icon: User,
    t: "Two-way reviews, no retaliation",
    d: "Reviews publish only after both sides submit (or 14 days elapse). Neither side can hold a rating hostage.",
  },
];

const WE_CHECK = [
  "Global & national sex offender registry",
  "Violent felony convictions (past 7 years)",
  "Terrorism watchlists (OFAC, SDN)",
  "Driver record: DUI & reckless driving",
  "Identity document authenticity",
  "Photo liveness match",
];

const WE_DONT = [
  "Credit history or debt",
  "Arrests without a conviction",
  "Non-violent juvenile records",
  "Minor traffic violations",
  "Medical history",
  "Immigration status",
];

export default function SafetyPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 80% -10%, rgba(255,46,120,0.13), transparent 60%), radial-gradient(700px 400px at -10% 30%, rgba(255,184,77,0.10), transparent 60%)",
        }}
      />

      <SiteHeader />

      <section className="relative mx-auto max-w-6xl px-14 pb-10 pt-20">
        <div className="font-mono text-xs uppercase tracking-[0.1em] text-coral">
          ● Trust &amp; safety
        </div>
        <h1 className="mt-5 font-display text-7xl font-bold leading-[0.94] tracking-tight">
          You meet a stranger.
          <br />
          We make sure
          <br />
          they&rsquo;re <span className="grad-text">not one</span>.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-text-dim">
          Every local is ID-verified, background-checked, and rated by travelers
          before you ever see their profile. Here&rsquo;s every system standing
          between you and a bad night.
        </p>
      </section>

      {/* Pillars grid */}
      <section className="relative mx-auto max-w-6xl px-14 pb-16 pt-6">
        <div className="grid gap-4 md:grid-cols-2">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.t}
                className="rounded-2xl border border-line-2 bg-surface p-7"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-2 text-coral">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">
                  {p.t}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-text-dim">{p.d}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* What we check vs don't */}
      <section className="relative border-t border-line bg-bg-2 px-14 py-18">
        <div className="mx-auto max-w-5xl">
          <div className="font-mono text-xs uppercase tracking-[0.1em] text-text-dim">
            What our checks cover
          </div>
          <div className="mt-7 grid gap-10 md:grid-cols-2">
            <div>
              <h4 className="font-display text-xl font-semibold tracking-tight text-good">
                We check
              </h4>
              <ul className="mt-4 grid gap-3">
                {WE_CHECK.map((x) => (
                  <li key={x} className="flex items-start gap-2.5 text-sm">
                    <Check
                      size={16}
                      className="mt-0.5 shrink-0 text-good"
                      strokeWidth={2}
                    />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-display text-xl font-semibold tracking-tight text-text-dim">
                We don&rsquo;t look at
              </h4>
              <ul className="mt-4 grid gap-3">
                {WE_DONT.map((x) => (
                  <li
                    key={x}
                    className="flex items-start gap-2.5 text-sm text-text-dim"
                  >
                    <X
                      size={16}
                      className="mt-0.5 shrink-0 text-text-muted"
                      strokeWidth={2}
                    />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SOS callout */}
      <section className="relative mx-auto max-w-5xl px-14 py-16">
        <div
          className="flex items-center gap-7 rounded-3xl border p-10"
          style={{
            background: "linear-gradient(135deg, rgba(255,106,61,0.13), transparent)",
            borderColor: "rgba(255,106,61,0.35)",
          }}
        >
          <div className="grad-sunset flex h-18 w-18 shrink-0 items-center justify-center rounded-full">
            <Zap size={32} className="text-white" />
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.1em] text-coral">
              24/7 · Human · &lt; 2 min response
            </div>
            <h3 className="mt-1.5 font-display text-3xl font-semibold tracking-tight">
              Something feels off? We&rsquo;re one tap away.
            </h3>
            <p className="mt-2 text-text-dim">
              Real humans &mdash; not bots &mdash; answer every safety alert.
              Trained dispatchers, in-region. You&rsquo;ll hear from us before your
              next breath.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
