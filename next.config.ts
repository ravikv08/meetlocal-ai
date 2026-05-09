import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

// Sentry wraps the build to upload source maps + create releases. The wrapper
// is a no-op when SENTRY_AUTH_TOKEN is unset, so dev builds without Sentry
// configured proceed normally.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Suppress source map upload logs unless we're debugging
  silent: !process.env.CI,

  // Hide the Sentry tunnel route from client bundles for privacy.
  tunnelRoute: "/monitoring",

  // Don't expose source maps publicly; Sentry will still ingest them.
  sourcemaps: { disable: false, deleteSourcemapsAfterUpload: true },
  disableLogger: true,
});
