
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduledPosts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const WORKER_SECRET = process.env.WORKER_SECRET || 'local-worker-secret';

function validateWorkerRequest(req: Request) {
    const authHeader = req.headers.get('Authorization');
    return authHeader === `Bearer ${WORKER_SECRET}`;
}

export async function POST(req: Request) {
    if (!validateWorkerRequest(req)) {
        return NextResponse.json({ error: 'Unauthorized Worker Access' }, { status: 401 });
    }

    const { postId, reason } = await req.json();

    if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 });

    try {
        await db.update(scheduledPosts)
            .set({ status: 'failed' })
            .where(eq(scheduledPosts.id, postId));

        // Log generic failure if needed, but usually detailed logs are in publishLogs

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
