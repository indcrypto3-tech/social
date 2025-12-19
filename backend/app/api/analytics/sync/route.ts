
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { Queue } from 'bullmq';
import { getRedis } from '@/lib/redis';

const QUEUE_NAME = 'analytics-sync';

export async function POST(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { accountId } = body; // Optional: sync specific account

        // Create queue instance
        const connection = getRedis();
        const queue = new Queue(QUEUE_NAME, { connection });

        // Add sync job
        const job = await queue.add('manual-sync', {
            userId: user.id,
            accountId: accountId || undefined
        }, {
            removeOnComplete: true,
            removeOnFail: false
        });

        console.log(`[AnalyticsSync] Manual sync triggered by user ${user.id}, job ${job.id}`);

        return NextResponse.json({
            success: true,
            message: 'Analytics sync started',
            jobId: job.id
        });

    } catch (error: any) {
        console.error('Analytics sync trigger error:', error);
        return NextResponse.json({
            error: 'Failed to trigger analytics sync',
            details: error.message
        }, { status: 500 });
    }
}
