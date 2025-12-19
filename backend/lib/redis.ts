import { Redis } from 'ioredis';

export function getRedis() {
    if (!process.env.REDIS_URL) {
        throw new Error("REDIS_URL not configured");
    }
    return new Redis(process.env.REDIS_URL);
}
