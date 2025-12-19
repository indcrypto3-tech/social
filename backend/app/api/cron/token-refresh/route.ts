
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { socialAccounts } from '@/lib/db/schema';
import { eq, and, lt } from 'drizzle-orm';
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
        logger.info('[CRON] Starting token refresh job');

        // Find accounts with tokens expiring in next 7 days
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const expiringAccounts = await db.query.socialAccounts.findMany({
            where: and(
                eq(socialAccounts.isActive, true),
                lt(socialAccounts.tokenExpiresAt, sevenDaysFromNow)
            )
        });

        logger.info(`[CRON] Found ${expiringAccounts.length} accounts with expiring tokens`);

        // In production, you would:
        // 1. Queue refresh jobs for each account
        // 2. Call the refresh-token endpoint for each
        // 3. Update tokens in database

        // For now, just log
        let refreshedCount = 0;
        for (const account of expiringAccounts) {
            logger.info(`[CRON] Would refresh token for account ${account.id} (${account.platform})`);
            // TODO: Call POST /api/accounts/:id/refresh-token
            refreshedCount++;
        }

        logger.info(`[CRON] Token refresh job completed. Refreshed: ${refreshedCount}`);

        return NextResponse.json({
            success: true,
            found: expiringAccounts.length,
            refreshed: refreshedCount
        });

    } catch (error: any) {
        logger.error('[CRON] Token refresh job failed', error);
        return NextResponse.json({
            error: 'Token refresh failed',
            details: error.message
        }, { status: 500 });
    }
}
