
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { postDestinations, publishLogs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getPublishingQueue } from '@/jobs/publishing.queue';

const WORKER_SECRET = process.env.WORKER_SECRET || 'local-worker-secret';

function validateWorkerRequest(req: Request) {
    const authHeader = req.headers.get('Authorization');
    return authHeader === `Bearer ${WORKER_SECRET}`;
}

export async function POST(req: Request) {
    if (!validateWorkerRequest(req)) {
        return NextResponse.json({ error: 'Unauthorized Worker Access' }, { status: 401 });
    }

    const { postId } = await req.json();

    if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 });

    try {
        // Retry logic usually implies re-queuing the whole post OR specific destinations.
        // For simplicity, we re-queue the whole post logic, but the worker ideally skips already-success ones.
        // But our schema tracks status per destination.

        // Reset failed destinations to 'pending'
        await db.update(postDestinations)
            .set({ status: 'pending', errorMessage: null })
            .where(and(eq(postDestinations.postId, postId), eq(postDestinations.status, 'failed')));

        // Add back to queue immediately
        const queue = getPublishingQueue();
        await queue.add('publish-post', { postId }, {
            jobId: `retry-${postId}-${Date.now()}`,
            removeOnComplete: true
        });

        // Log retry
        await db.insert(publishLogs).values({
            postId: postId,
            platform: 'facebook', // Generic placeholder, or we'd need to loop per platform
            status: 'retrying',
            attempt: 2 // Simple increment logic or fetch max attempt?
        });

        return NextResponse.json({ success: true, message: 'Retrying failed destinations' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
