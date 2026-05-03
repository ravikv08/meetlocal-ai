import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Logo } from "@/components/Logo";
import { Mail, ArrowRight } from "lucide-react";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; intent?: string; error?: string; sent?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const callbackUrl = sp.from ?? "/";

  if (session?.user) redirect(callbackUrl);

  const isSignup = sp.intent === "signup";

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 50% -10%, rgba(255,46,120,0.13), transparent 60%), radial-gradient(700px 400px at 90% 80%, rgba(255,106,61,0.10), transparent 60%)",
        }}
      />

      <header className="relative px-14 py-6">
        <Logo />
      </header>

      <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-24">
        <div className="font-mono text-xs uppercase tracking-[0.12em] text-text-muted">
          {isSignup ? "● New here" : "● Welcome back"}
        </div>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight">
          {isSignup ? "Create your meetlocal account." : "Sign in to meetlocal."}
        </h1>
        <p className="mt-3 text-text-dim">
          One account works as a traveler and as a local. We never post on your behalf.
        </p>

        {sp.error && (
          <div className="mt-6 rounded-xl border border-magenta/40 bg-magenta/5 p-4 text-sm text-magenta">
            {sp.error === "OAuthAccountNotLinked"
              ? "An account with that email already exists with a different sign-in method. Try the other method."
              : "Couldn't sign in. Try again, or use a different method."}
          </div>
        )}

        {/* Google */}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: callbackUrl });
          }}
          className="mt-10"
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-full border border-line-2 bg-surface px-5 py-3.5 text-sm font-medium transition hover:bg-surface-2"
          >
            <GoogleGlyph /> Continue with Google
          </button>
        </form>

        <div className="my-7 flex items-center gap-3 text-xs uppercase tracking-wider text-text-muted">
          <div className="h-px flex-1 bg-line" />
          or
          <div className="h-px flex-1 bg-line" />
        </div>

        {/* Email magic link */}
        <form
          action={async (formData: FormData) => {
            "use server";
            const email = String(formData.get("email") ?? "").trim();
            if (!email) return;
            await signIn("resend", { email, redirectTo: callbackUrl });
          }}
          className="space-y-3"
        >
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Email
            </span>
            <div className="mt-1.5 flex items-center gap-2 rounded-full border border-line-2 bg-surface px-4 py-1.5 focus-within:border-text-dim">
              <Mail size={15} className="text-text-muted" />
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                className="flex-1 bg-transparent py-1.5 text-sm outline-none"
              />
            </div>
          </label>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-text px-5 py-3.5 text-sm font-semibold text-bg transition hover:opacity-90"
          >
            Send me a sign-in link <ArrowRight size={14} />
          </button>
          <p className="text-xs text-text-muted">
            We&rsquo;ll email you a one-tap sign-in link. No password needed. New
            accounts are created automatically — works for travelers and hosts.
          </p>
        </form>

        <p className="mt-8 text-xs leading-relaxed text-text-muted">
          By continuing you agree to meetlocal&rsquo;s{" "}
          <Link href="/safety" className="underline">
            Trust &amp; Safety
          </Link>{" "}
          standards. First meetings always happen at a public, vetted spot &mdash;
          that&rsquo;s the Starbucks Rule.
        </p>
      </main>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.13 4.13 0 0 1-1.79 2.71v2.26h2.9c1.7-1.56 2.69-3.86 2.69-6.61z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.46-.8 5.95-2.18l-2.9-2.26c-.8.54-1.83.86-3.05.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.33z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
