
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { db } from '@/lib/db';
import { scheduledPosts } from '@/lib/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

export async function GET(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status'); // draft, scheduled, published, failed
        const sortBy = searchParams.get('sortBy') || 'scheduledAt'; // scheduledAt, createdAt
        const sortOrder = searchParams.get('sortOrder') || 'desc'; // asc, desc
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build where clause
        let whereClause = eq(scheduledPosts.userId, user.id);

        if (status) {
            whereClause = and(
                whereClause,
                eq(scheduledPosts.status, status as any)
            ) as any;
        }

        // Determine sort order
        const orderByFn = sortOrder === 'asc' ? asc : desc;
        const sortField = sortBy === 'createdAt'
            ? scheduledPosts.createdAt
            : scheduledPosts.scheduledAt;

        // Fetch posts
        const posts = await db.query.scheduledPosts.findMany({
            where: whereClause,
            with: {
                destinations: {
                    with: {
                        socialAccount: true
                    }
                }
            },
            orderBy: orderByFn(sortField),
            limit: limit,
            offset: offset
        });

        // Get total count for pagination
        const totalResult = await db.select({ count: scheduledPosts.id })
            .from(scheduledPosts)
            .where(whereClause);

        const total = totalResult.length;

        // Format posts for list view
        const formattedPosts = posts.map(post => {
            const platforms = post.destinations.map(d => d.socialAccount.platform);
            const uniquePlatforms = [...new Set(platforms)];

            // Calculate overall destination status
            const successCount = post.destinations.filter(d => d.status === 'success').length;
            const failedCount = post.destinations.filter(d => d.status === 'failed').length;
            const pendingCount = post.destinations.filter(d => d.status === 'pending').length;

            return {
                id: post.id,
                content: post.content,
                scheduledAt: post.scheduledAt,
                status: post.status,
                platforms: uniquePlatforms,
                mediaUrls: post.mediaUrls,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                destinationStats: {
                    total: post.destinations.length,
                    success: successCount,
                    failed: failedCount,
                    pending: pendingCount
                },
                destinations: post.destinations.map(d => ({
                    id: d.id,
                    platform: d.socialAccount.platform,
                    accountName: d.socialAccount.accountName,
                    status: d.status,
                    platformPostId: d.platformPostId,
                    errorMessage: d.errorMessage
                }))
            };
        });

        return NextResponse.json({
            posts: formattedPosts,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total
            }
        });

    } catch (error: any) {
        console.error('List view fetch error:', error);
        return NextResponse.json({
            error: 'Failed to fetch posts',
            details: error.message
        }, { status: 500 });
    }
}
