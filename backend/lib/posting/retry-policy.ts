export const MAX_RETRIES = 5;

export function isRetryableError(error: any): boolean {
    const msg = (error.message || '').toLowerCase();

    // Non-retryable
    if (msg.includes('invalid token') || msg.includes('unauthorized') || msg.includes('authentication failed')) return false;
    if (msg.includes('permission denied')) return false;
    if (msg.includes('validation failed')) return false; // usually bad payload
    if (msg.includes('media format not supported')) return false;

    // Retryable (Rate limits, server errors, network issues)
    return true;
}

export function getBackoffDelay(attempt: number): number {
    // Exponential backoff: 2^attempt * 1000ms
    // attempt 1: 2s
    // attempt 2: 4s
    // attempt 3: 8s
    // ...
    const delay = Math.pow(2, attempt) * 1000;
    // Add jitter
    return delay + Math.random() * 1000;
}
