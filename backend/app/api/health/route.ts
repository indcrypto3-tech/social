
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRedis } from '@/lib/redis';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const startTime = Date.now();
    const checks: Record<string, any> = {};

    // 1. Database health check
    try {
        await db.execute(sql`SELECT 1`);
        checks.database = {
            status: 'healthy',
            responseTime: Date.now() - startTime
        };
    } catch (error: any) {
        checks.database = {
            status: 'unhealthy',
            error: error.message
        };
    }

    // 2. Redis health check
    try {
        const redisStart = Date.now();
        const redis = getRedis();
        if (redis) {
            await redis.ping();
            checks.redis = {
                status: 'healthy',
                responseTime: Date.now() - redisStart
            };
        } else {
            checks.redis = {
                status: 'unavailable',
                message: 'Redis not configured'
            };
        }
    } catch (error: any) {
        checks.redis = {
            status: 'unhealthy',
            error: error.message
        };
    }

    // 3. Environment variables check
    const requiredEnvVars = [
        'DATABASE_URL',
        'REDIS_URL',
        'NEXT_PUBLIC_SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
    checks.environment = {
        status: missingEnvVars.length === 0 ? 'healthy' : 'unhealthy',
        missing: missingEnvVars
    };

    // 4. Overall status
    const allHealthy = Object.values(checks).every(
        check => check.status === 'healthy'
    );

    const response = {
        status: allHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        checks
    };

    const statusCode = allHealthy ? 200 : 503;

    return NextResponse.json(response, { status: statusCode });
}
