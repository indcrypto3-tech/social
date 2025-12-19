
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { db } from '@/lib/db';
import { scheduledPosts, postDestinations, analyticsSnapshots } from '@/lib/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

export async function GET(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || '30'; // days
        const periodDays = parseInt(period);

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);

        // Get post statistics
        const allPosts = await db.query.scheduledPosts.findMany({
            where: and(
                eq(scheduledPosts.userId, user.id),
                gte(scheduledPosts.createdAt, startDate)
            ),
            with: {
                destinations: true
            }
        });

        const totalPosts = allPosts.length;
        const publishedPosts = allPosts.filter(p => p.status === 'published').length;
        const scheduledPostsCount = allPosts.filter(p => p.status === 'scheduled').length;
        const failedPosts = allPosts.filter(p => p.status === 'failed').length;

        // Calculate success rate
        const successRate = totalPosts > 0
            ? Math.round((publishedPosts / totalPosts) * 100)
            : 0;

        // Get platform distribution
        const platformCounts: Record<string, number> = {};
        allPosts.forEach(post => {
            post.destinations.forEach(dest => {
                const platform = dest.socialAccountId; // We'd need to join to get actual platform
                platformCounts[platform] = (platformCounts[platform] || 0) + 1;
            });
        });

        // Get recent analytics snapshots
        const snapshots = await db.query.analyticsSnapshots.findMany({
            where: and(
                eq(analyticsSnapshots.userId, user.id),
                gte(analyticsSnapshots.date, startDate)
            ),
            orderBy: (analyticsSnapshots, { desc }) => [desc(analyticsSnapshots.date)],
            limit: 30
        });

        // Aggregate metrics
        const totalFollowers = snapshots.reduce((sum, s) => sum + s.followers, 0);
        const totalImpressions = snapshots.reduce((sum, s) => sum + s.impressions, 0);
        const totalEngagement = snapshots.reduce((sum, s) => sum + s.engagement, 0);

        // Calculate engagement rate
        const engagementRate = totalImpressions > 0
            ? Math.round((totalEngagement / totalImpressions) * 100)
            : 0;

        // Get growth metrics (compare with previous period)
        const previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - periodDays);

        const previousSnapshots = await db.query.analyticsSnapshots.findMany({
            where: and(
                eq(analyticsSnapshots.userId, user.id),
                gte(analyticsSnapshots.date, previousStartDate),
                sql`${analyticsSnapshots.date} < ${startDate}`
            )
        });

        const previousFollowers = previousSnapshots.reduce((sum, s) => sum + s.followers, 0);
        const followerGrowth = previousFollowers > 0
            ? Math.round(((totalFollowers - previousFollowers) / previousFollowers) * 100)
            : 0;

        return NextResponse.json({
            period: periodDays,
            overview: {
                totalPosts,
                publishedPosts,
                scheduledPosts: scheduledPostsCount,
                failedPosts,
                successRate
            },
            engagement: {
                totalFollowers,
                totalImpressions,
                totalEngagement,
                engagementRate,
                followerGrowth
            },
            trends: {
                daily: snapshots.slice(0, 7).reverse().map(s => ({
                    date: s.date,
                    followers: s.followers,
                    impressions: s.impressions,
                    engagement: s.engagement
                }))
            }
        });

    } catch (error: any) {
        console.error('Analytics overview error:', error);
        return NextResponse.json({
            error: 'Failed to fetch analytics',
            details: error.message
        }, { status: 500 });
    }
}
