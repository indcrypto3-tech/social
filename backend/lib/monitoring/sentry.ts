
// Sentry monitoring stub
// TODO: Install @sentry/nextjs and implement when ready to use Sentry
// npm install @sentry/nextjs

export function initSentry() {
    // Stub implementation - no-op for now
    if (process.env.SENTRY_DSN) {
        console.log('Sentry monitoring is not configured. Install @sentry/nextjs to enable.');
    }
}

export function captureError(error: any, context?: Record<string, any>) {
    // Log to console for now
    console.error('Error captured:', error);
    if (context) {
        console.error('Context:', context);
    }
    // TODO: Implement Sentry.captureException when @sentry/nextjs is installed
}
