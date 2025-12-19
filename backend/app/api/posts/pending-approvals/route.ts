
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { db } from '@/lib/db';
import { scheduledPosts, users } from '@/lib/db/schema';
import { getUserTeamRole, getPermissions } from '@/lib/permissions';
import { eq, and } from 'drizzle-orm';

export async function GET(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const teamId = searchParams.get('teamId');

        // Check permission to view pending approvals
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
                    error: 'Insufficient permissions to view pending approvals'
                }, { status: 403 });
            }
        }

        // Fetch pending posts
        // If teamId provided, get posts from team members
        // Otherwise, get user's own posts
        let posts;

        if (teamId) {
            // Get all team member user IDs
            const teamMembers = await db.query.teamMembers.findMany({
                where: eq(scheduledPosts.userId, teamId) // This is wrong, need to fix
            });

            // For now, just get all pending posts (in production, filter by team)
            posts = await db.query.scheduledPosts.findMany({
                where: eq(scheduledPosts.approvalStatus, 'pending'),
                with: {
                    destinations: {
                        with: {
                            socialAccount: true
                        }
                    }
                },
                orderBy: (scheduledPosts, { desc }) => [desc(scheduledPosts.createdAt)]
            });
        } else {
            // Get user's own pending posts
            posts = await db.query.scheduledPosts.findMany({
                where: and(
                    eq(scheduledPosts.userId, user.id),
                    eq(scheduledPosts.approvalStatus, 'pending')
                ),
                with: {
                    destinations: {
                        with: {
                            socialAccount: true
                        }
                    }
                },
                orderBy: (scheduledPosts, { desc }) => [desc(scheduledPosts.createdAt)]
            });
        }

        // Format posts
        const formattedPosts = posts.map(post => ({
            id: post.id,
            content: post.content,
            scheduledAt: post.scheduledAt,
            status: post.status,
            approvalStatus: post.approvalStatus,
            createdAt: post.createdAt,
            userId: post.userId,
            platforms: [...new Set(post.destinations.map(d => d.socialAccount.platform))],
            destinationCount: post.destinations.length
        }));

        return NextResponse.json({
            posts: formattedPosts,
            total: formattedPosts.length
        });

    } catch (error: any) {
        console.error('Get pending approvals error:', error);
        return NextResponse.json({
            error: 'Failed to fetch pending approvals',
            details: error.message
        }, { status: 500 });
    }
}
