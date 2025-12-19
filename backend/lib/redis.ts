import { Redis as IORedis } from 'ioredis';
import { Redis as UpstashRedis } from '@upstash/redis';

// For BullMQ (needs persistent connection)
export function getRedis() {
    if (!process.env.REDIS_URL) {
        throw new Error("REDIS_URL not configured");
    }
    return new IORedis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null // Required by BullMQ
    });
}

// Unified Redis Client Wrapper
class UnifiedRedis {
    private upstash: UpstashRedis | null = null;
    private ioredis: IORedis | null = null;

    constructor() {
        const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
        const redisUrl = process.env.REDIS_URL;

        if (upstashUrl && upstashUrl.startsWith('http')) {
            this.upstash = new UpstashRedis({
                url: upstashUrl,
                token: process.env.UPSTASH_REDIS_REST_TOKEN || 'example',
            });
        } else if (redisUrl && redisUrl.startsWith('http')) {
            // Maybe REDIS_URL is the HTTP interface?
            this.upstash = new UpstashRedis({
                url: redisUrl,
                token: process.env.UPSTASH_REDIS_REST_TOKEN || 'example',
            });
        } else if (redisUrl) {
            // Fallback to IORedis for local TCP URL
            this.ioredis = new IORedis(redisUrl);
        } else {
            console.warn("No Redis configuration found for Session Store (UnifiedRedis). Defaulting to mock or failing.");
        }
    }

    async get<T>(key: string): Promise<T | null> {
        if (this.upstash) {
            return this.upstash.get<T>(key);
        }
        if (this.ioredis) {
            const data = await this.ioredis.get(key);
            try {
                return data ? JSON.parse(data) : null;
            } catch {
                return data as unknown as T;
            }
        }
        return null;
    }

    async set(key: string, value: any, options?: { ex?: number }): Promise<any> {
        if (this.upstash) {
            return this.upstash.set(key, value, options as any); // Upstash supports { ex: number }
        }
        if (this.ioredis) {
            // IORedis expects string value. Upstash automatically handles JSON.
            const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
            if (options?.ex) {
                return this.ioredis.set(key, stringValue, 'EX', options.ex);
            }
            return this.ioredis.set(key, stringValue);
        }
        return null;
    }

    async del(key: string): Promise<number> {
        if (this.upstash) {
            return this.upstash.del(key);
        }
        if (this.ioredis) {
            return this.ioredis.del(key);
        }
        return 0;
    }

    // Scan stream is tricky to unify. The job uses getRedis() (raw ioredis) so it's fine.
    // This 'redis' export is primarily for Key-Value access (Session).
}

export const redis = new UnifiedRedis();
