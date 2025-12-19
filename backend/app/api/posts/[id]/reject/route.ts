
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { db } from '@/lib/db';
import { scheduledPosts } from '@/lib/db/schema';
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
        const { teamId, reason } = body;

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

        // Check permission to reject
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
                    error: 'Insufficient permissions to reject posts'
                }, { status: 403 });
            }
        } else {
            // If no teamId, only post owner can reject (self-rejection)
            if (post.userId !== user.id) {
                return NextResponse.json({
                    error: 'Cannot reject posts from other users without team context'
                }, { status: 403 });
            }
        }

        // Reject post
        await db.update(scheduledPosts)
            .set({
                approvalStatus: 'rejected',
                reviewedBy: user.id,
                reviewedAt: new Date(),
                updatedAt: new Date(),
                // Optionally store rejection reason in metadata
                platformConfigs: {
                    ...(post.platformConfigs as any || {}),
                    rejectionReason: reason
                }
            })
            .where(eq(scheduledPosts.id, postId));

        console.log(`[APPROVAL] Post ${postId} rejected by user ${user.id}. Reason: ${reason || 'None'}`);

        return NextResponse.json({
            success: true,
            postId,
            approvalStatus: 'rejected',
            reviewedBy: user.id,
            reviewedAt: new Date(),
            reason
        });

    } catch (error: any) {
        console.error('Reject post error:', error);
        return NextResponse.json({
            error: 'Failed to reject post',
            details: error.message
        }, { status: 500 });
    }
}
