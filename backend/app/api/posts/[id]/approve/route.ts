
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { db } from '@/lib/db';
import { scheduledPosts, users } from '@/lib/db/schema';
import { getUserTeamRole, getPermissions } from '@/lib/permissions';
import { eq } from 'drizzle-orm';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const postId = params.id;
        const body = await req.json();
        const { teamId } = body;

        // Get post
        const post = await db.query.scheduledPosts.findFirst({
            where: eq(scheduledPosts.id, postId)
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Check if pending approval
        if (post.approvalStatus !== 'pending') {
            return NextResponse.json({
                error: 'Post is not pending approval'
            }, { status: 400 });
        }

        // Check permission to approve
        if (teamId) {
            const role = await getUserTeamRole(user.id, teamId);
            if (!role) {
                return NextResponse.json({
                    error: 'You are not a member of this team'
                }, { status: 403 });
            }

            const permissions = getPermissions(role);
            if (!permissions.canApprovePosts) {
                return NextResponse.json({
                    error: 'Insufficient permissions to approve posts'
                }, { status: 403 });
            }
        } else {
            // If no teamId, only post owner can approve (self-approval)
            if (post.userId !== user.id) {
                return NextResponse.json({
                    error: 'Cannot approve posts from other users without team context'
                }, { status: 403 });
            }
        }

        // Approve post
        await db.update(scheduledPosts)
            .set({
                approvalStatus: 'approved',
                reviewedBy: user.id,
                reviewedAt: new Date(),
                updatedAt: new Date()
            })
            .where(eq(scheduledPosts.id, postId));

        console.log(`[APPROVAL] Post ${postId} approved by user ${user.id}`);

        return NextResponse.json({
            success: true,
            postId,
            approvalStatus: 'approved',
            reviewedBy: user.id,
            reviewedAt: new Date()
        });

    } catch (error: any) {
        console.error('Approve post error:', error);
        return NextResponse.json({
            error: 'Failed to approve post',
            details: error.message
        }, { status: 500 });
    }
}
