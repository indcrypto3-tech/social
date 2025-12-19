
/**
 * Next.js Instrumentation
 * 
 * This file runs once when the Next.js server starts.
 * We use it to validate environment variables before the app boots.
 */

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // Only run on server-side
        const { validateEnv } = await import('./lib/env');

        try {
            validateEnv();
        } catch (error) {
            console.error('\n🚨 APPLICATION STARTUP FAILED\n');
            console.error('Fix the environment variable errors above and restart the server.\n');
            process.exit(1);
        }
    }
}
