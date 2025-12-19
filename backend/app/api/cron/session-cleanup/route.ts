
import { NextResponse } from 'next/server';
import { processSessionCleanup } from '@/jobs/session-cleanup.job';
import { logger } from '@/lib/logger';

const CRON_SECRET = process.env.CRON_SECRET || process.env.WORKER_SECRET || 'local-cron-secret';

function validateCronRequest(req: Request) {
    const authHeader = req.headers.get('Authorization');
    return authHeader === `Bearer ${CRON_SECRET}`;
}

export async function POST(req: Request) {
    if (!validateCronRequest(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        logger.info('[CRON] Starting session cleanup job');

        const result = await processSessionCleanup({} as any);

        logger.info(`[CRON] Session cleanup completed. Removed: ${result.removed}`);

        return NextResponse.json({
            success: true,
            removed: result.removed
        });

    } catch (error: any) {
        logger.error('[CRON] Session cleanup failed', error);
        return NextResponse.json({
            error: 'Session cleanup failed',
            details: error.message
        }, { status: 500 });
    }
}
