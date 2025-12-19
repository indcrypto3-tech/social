
import { getRedis } from './redis';

const RATE_LIMIT_WINDOW = 60; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute per user

export async function checkRateLimit(userId: string, endpoint: string): Promise<boolean> {
    try {
        const redis = getRedis();
        const key = `ratelimit:${endpoint}:${userId}`;

        const current = await redis.get(key);

        if (!current) {
            // First request in window
            await redis.set(key, '1', 'EX', RATE_LIMIT_WINDOW);
            return true;
        }

        const count = parseInt(current);

        if (count >= MAX_REQUESTS_PER_WINDOW) {
            return false; // Rate limit exceeded
        }

        // Increment counter
        await redis.incr(key);
        return true;

    } catch (error) {
        console.error('Rate limit check error:', error);
        // On error, allow the request (fail open)
        return true;
    }
}

export async function getRateLimitStatus(userId: string, endpoint: string) {
    try {
        const redis = getRedis();
        const key = `ratelimit:${endpoint}:${userId}`;

        const current = await redis.get(key);
        const count = current ? parseInt(current) : 0;
        const ttl = await redis.ttl(key);

        return {
            remaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - count),
            limit: MAX_REQUESTS_PER_WINDOW,
            resetIn: ttl > 0 ? ttl : RATE_LIMIT_WINDOW
        };
    } catch (error) {
        console.error('Rate limit status error:', error);
        return {
            remaining: MAX_REQUESTS_PER_WINDOW,
            limit: MAX_REQUESTS_PER_WINDOW,
            resetIn: RATE_LIMIT_WINDOW
        };
    }
}
