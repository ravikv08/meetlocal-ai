// Next.js calls this once at server startup. Sentry's server SDK is
// initialized here on Node.js + Edge runtimes; the browser SDK is in
// instrumentation-client.ts.

import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
      environment: process.env.NODE_ENV,
      // Don't fire to Sentry in dev unless DSN is explicitly set.
      enabled: !!process.env.SENTRY_DSN,
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
      environment: process.env.NODE_ENV,
      enabled: !!process.env.SENTRY_DSN,
    });
  }
}

// Captures errors that occur during server-side rendering and route handlers.
// Required for Next 16 to forward uncaught errors to Sentry.
export const onRequestError = Sentry.captureRequestError;
