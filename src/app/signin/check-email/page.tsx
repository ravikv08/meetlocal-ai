import Link from "next/link";
import { Mail, Zap } from "lucide-react";
import { Logo } from "@/components/Logo";
import { isDevMagicLinkMode, readDevMagicLink } from "@/lib/dev-magic-link";

// Disable caching so the latest dev magic link is always read on refresh.
export const dynamic = "force-dynamic";

export default async function CheckEmailPage() {
  const isResendConfigured = !!process.env.RESEND_API_KEY;
  const devLink = isDevMagicLinkMode() ? readDevMagicLink() : null;

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 50% -10%, rgba(255,46,120,0.13), transparent 60%)",
        }}
      />

      <header className="relative px-14 py-6">
        <Logo />
      </header>

      <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-24 text-center">
        <div className="grad-sunset mx-auto flex h-14 w-14 items-center justify-center rounded-full">
          <Mail size={24} className="text-white" />
        </div>

        {/* Production / configured: standard "check your inbox" copy */}
        {isResendConfigured ? (
          <>
            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight">
              Check your inbox.
            </h1>
            <p className="mt-3 leading-relaxed text-text-dim">
              {devLink?.identifier ? (
                <>
                  We sent a one-tap sign-in link to{" "}
                  <strong className="text-text">{devLink.identifier}</strong>. It
                  expires in 24 hours.
                </>
              ) : (
                "We sent a one-tap sign-in link to your email. It expires in 24 hours."
              )}
            </p>
          </>
        ) : (
          /* Dev fallback: render a one-click sign-in button */
          <>
            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight">
              Sign in.
            </h1>
            <p className="mt-3 leading-relaxed text-text-dim">
              {devLink?.identifier ? (
                <>
                  Magic link ready for{" "}
                  <strong className="text-text">{devLink.identifier}</strong>.
                </>
              ) : (
                <>Magic link ready.</>
              )}
            </p>

            {devLink ? (
              <a
                href={devLink.url}
                className="grad-sunset mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(255,106,61,0.27)]"
              >
                <Zap size={15} /> Sign me in
              </a>
            ) : (
              <div className="mt-8 rounded-2xl border border-amber/40 bg-amber/5 p-5 text-left text-sm">
                <div className="font-mono text-[10px] uppercase tracking-wider text-amber">
                  Couldn&rsquo;t read the dev link
                </div>
                <p className="mt-2 text-text-dim">
                  Check the dev server console for a line like:
                </p>
                <pre className="mt-2 overflow-x-auto rounded bg-bg-2 p-3 font-mono text-xs text-text-dim">
                  🔗 Magic link for you@example.com:{"\n"}
                  http://localhost:3000/api/auth/callback/resend?...
                </pre>
                <p className="mt-2 text-text-dim">
                  Copy that URL into your browser to sign in.
                </p>
              </div>
            )}

            <p className="mt-6 font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Dev mode · no email actually sent ·{" "}
              <code className="text-text-dim">RESEND_API_KEY</code> not set
            </p>
          </>
        )}

        <Link
          href="/signin"
          className="mt-10 text-sm text-text-dim transition hover:text-text"
        >
          ← Back to sign-in
        </Link>
      </main>
    </div>
  );
}
