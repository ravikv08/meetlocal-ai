// Browser-side Sentry init. Loaded by Next.js automatically (no import needed).

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  // Replay is sampled aggressively for errors, lightly for normal sessions.
  // Adjust once you have a feel for ingest volume in prod.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

// Required for Next 16 router transitions to be tied to Sentry traces.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
