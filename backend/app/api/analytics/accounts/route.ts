
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { db } from '@/lib/db';
import { socialAccounts, postDestinations, analyticsSnapshots } from '@/lib/db/schema';
import { eq, and, desc, gte } from 'drizzle-orm';

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

        // Get all connected accounts
        const accounts = await db.query.socialAccounts.findMany({
            where: and(
                eq(socialAccounts.userId, user.id),
                eq(socialAccounts.isActive, true)
            )
        });

        // Get analytics for each account
        const accountAnalytics = await Promise.all(
            accounts.map(async (account) => {
                // Get posts published to this account
                const destinations = await db.query.postDestinations.findMany({
                    where: and(
                        eq(postDestinations.socialAccountId, account.id),
                        eq(postDestinations.status, 'success')
                    ),
                    with: {
                        post: true
                    }
                });

                const postsPublished = destinations.filter(d =>
                    new Date(d.post.scheduledAt) >= startDate
                ).length;

                // Get analytics snapshots for this platform
                const snapshots = await db.query.analyticsSnapshots.findMany({
                    where: and(
                        eq(analyticsSnapshots.userId, user.id),
                        eq(analyticsSnapshots.platform, account.platform),
                        gte(analyticsSnapshots.date, startDate)
                    ),
                    orderBy: desc(analyticsSnapshots.date)
                });

                // Calculate metrics
                const latestSnapshot = snapshots[0];
                const oldestSnapshot = snapshots[snapshots.length - 1];

                const currentFollowers = latestSnapshot?.followers || 0;
                const previousFollowers = oldestSnapshot?.followers || 0;
                const followerGrowth = previousFollowers > 0
                    ? Math.round(((currentFollowers - previousFollowers) / previousFollowers) * 100)
                    : 0;

                const totalImpressions = snapshots.reduce((sum, s) => sum + s.impressions, 0);
                const totalEngagement = snapshots.reduce((sum, s) => sum + s.engagement, 0);
                const engagementRate = totalImpressions > 0
                    ? ((totalEngagement / totalImpressions) * 100).toFixed(2)
                    : '0.00';

                // Get performance trend
                const trend = snapshots.slice(0, 7).reverse().map(s => ({
                    date: s.date,
                    followers: s.followers,
                    impressions: s.impressions,
                    engagement: s.engagement
                }));

                return {
                    accountId: account.id,
                    platform: account.platform,
                    accountName: account.accountName,
                    accountType: account.accountType,
                    isActive: account.isActive,
                    metrics: {
                        followers: currentFollowers,
                        followerGrowth,
                        postsPublished,
                        totalImpressions,
                        totalEngagement,
                        engagementRate: parseFloat(engagementRate)
                    },
                    trend
                };
            })
        );

        // Sort by followers (most to least)
        accountAnalytics.sort((a, b) => b.metrics.followers - a.metrics.followers);

        return NextResponse.json({
            period: periodDays,
            accounts: accountAnalytics,
            total: accountAnalytics.length
        });

    } catch (error: any) {
        console.error('Account analytics error:', error);
        return NextResponse.json({
            error: 'Failed to fetch account analytics',
            details: error.message
        }, { status: 500 });
    }
}
