
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { db } from '@/lib/db';
import { scheduledPosts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const postId = params.id;

        // Get post
        const post = await db.query.scheduledPosts.findFirst({
            where: and(
                eq(scheduledPosts.id, postId),
                eq(scheduledPosts.userId, user.id)
            )
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Check if already submitted or approved
        if (post.approvalStatus === 'pending') {
            return NextResponse.json({
                error: 'Post is already pending approval'
            }, { status: 400 });
        }

        if (post.approvalStatus === 'approved') {
            return NextResponse.json({
                error: 'Post is already approved'
            }, { status: 400 });
        }

        // Update approval status
        await db.update(scheduledPosts)
            .set({
                approvalStatus: 'pending',
                updatedAt: new Date()
            })
            .where(eq(scheduledPosts.id, postId));

        console.log(`[APPROVAL] Post ${postId} submitted for approval by user ${user.id}`);

        return NextResponse.json({
            success: true,
            postId,
            approvalStatus: 'pending'
        });

    } catch (error: any) {
        console.error('Submit for approval error:', error);
        return NextResponse.json({
            error: 'Failed to submit for approval',
            details: error.message
        }, { status: 500 });
    }
}
