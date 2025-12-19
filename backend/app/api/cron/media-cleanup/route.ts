
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const CRON_SECRET = process.env.CRON_SECRET || process.env.WORKER_SECRET || 'local-cron-secret';
const WORKER_SECRET = process.env.WORKER_SECRET || 'local-worker-secret';
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000';

function validateCronRequest(req: Request) {
    const authHeader = req.headers.get('Authorization');
    return authHeader === `Bearer ${CRON_SECRET}`;
}

export async function POST(req: Request) {
    if (!validateCronRequest(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        logger.info('[CRON] Starting media cleanup job');

        // Call the media cleanup API endpoint
        const response = await fetch(`${API_BASE_URL}/api/media/cleanup`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WORKER_SECRET}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Media cleanup API failed: ${response.statusText}`);
        }

        const result = await response.json();

        logger.info(`[CRON] Media cleanup completed. Deleted: ${result.deleted}, Failed: ${result.failed}`);

        return NextResponse.json({
            success: true,
            deleted: result.deleted,
            failed: result.failed
        });

    } catch (error: any) {
        logger.error('[CRON] Media cleanup failed', error);
        return NextResponse.json({
            error: 'Media cleanup failed',
            details: error.message
        }, { status: 500 });
    }
}
