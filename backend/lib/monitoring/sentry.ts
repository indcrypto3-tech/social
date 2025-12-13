
import * as Sentry from "@sentry/nextjs";

export function initSentry() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        Sentry.init({
            dsn: process.env.SENTRY_DSN || "https://examplePublicKey@o0.ingest.sentry.io/0",
            tracesSampleRate: 1.0,
            debug: false,
        });
    }

    if (process.env.NEXT_RUNTIME === "edge") {
        Sentry.init({
            dsn: process.env.SENTRY_DSN || "https://examplePublicKey@o0.ingest.sentry.io/0",
            tracesSampleRate: 1.0,
            debug: false,
        });
    }
}

export function captureError(error: any, context?: Record<string, any>) {
    console.error(error);
    Sentry.captureException(error, {
        extra: context,
    });
}
