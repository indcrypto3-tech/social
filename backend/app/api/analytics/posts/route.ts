
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { db } from '@/lib/db';
import { scheduledPosts, postDestinations, socialAccounts } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');
        const status = searchParams.get('status'); // published, failed

        // Build where clause
        let whereClause = eq(scheduledPosts.userId, user.id);

        if (status) {
            whereClause = and(
                whereClause,
                eq(scheduledPosts.status, status as any)
            ) as any;
        }

        // Fetch posts with destinations
        const posts = await db.query.scheduledPosts.findMany({
            where: whereClause,
            with: {
                destinations: {
                    with: {
                        socialAccount: true
                    }
                }
            },
            orderBy: desc(scheduledPosts.scheduledAt),
            limit,
            offset
        });

        // Format posts with analytics
        const formattedPosts = posts.map(post => {
            const destinations = post.destinations;
            const successCount = destinations.filter(d => d.status === 'success').length;
            const failedCount = destinations.filter(d => d.status === 'failed').length;

            // In a real implementation, you'd fetch actual engagement metrics from platform APIs
            // For now, we'll use placeholder data
            const mockEngagement = {
                likes: Math.floor(Math.random() * 100),
                comments: Math.floor(Math.random() * 20),
                shares: Math.floor(Math.random() * 10),
                impressions: Math.floor(Math.random() * 1000),
                reach: Math.floor(Math.random() * 800)
            };

            return {
                id: post.id,
                content: post.content?.substring(0, 100) || '',
                scheduledAt: post.scheduledAt,
                publishedAt: post.status === 'published' ? post.updatedAt : null,
                status: post.status,
                platforms: destinations.map(d => d.socialAccount.platform),
                destinationStats: {
                    total: destinations.length,
                    success: successCount,
                    failed: failedCount
                },
                engagement: post.status === 'published' ? mockEngagement : null,
                destinations: destinations.map(d => ({
                    platform: d.socialAccount.platform,
                    accountName: d.socialAccount.accountName,
                    status: d.status,
                    platformPostId: d.platformPostId
                }))
            };
        });

        return NextResponse.json({
            posts: formattedPosts,
            pagination: {
                limit,
                offset,
                total: formattedPosts.length
            }
        });

    } catch (error: any) {
        console.error('Post analytics error:', error);
        return NextResponse.json({
            error: 'Failed to fetch post analytics',
            details: error.message
        }, { status: 500 });
    }
}
