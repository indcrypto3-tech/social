
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { db } from '@/lib/db';
import { scheduledPosts, users } from '@/lib/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export async function GET(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('start');
        const endDate = searchParams.get('end');

        if (!startDate || !endDate) {
            return NextResponse.json({
                error: 'Missing required parameters: start and end dates'
            }, { status: 400 });
        }

        // Fetch user timezone
        const userRecord = await db.query.users.findFirst({
            where: eq(users.id, user.id)
        });

        const timezone = userRecord?.timezone || 'UTC';

        // Parse dates
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Fetch posts within date range
        const posts = await db.query.scheduledPosts.findMany({
            where: and(
                eq(scheduledPosts.userId, user.id),
                gte(scheduledPosts.scheduledAt, start),
                lte(scheduledPosts.scheduledAt, end)
            ),
            with: {
                destinations: {
                    with: {
                        socialAccount: true
                    }
                }
            },
            orderBy: (scheduledPosts, { asc }) => [asc(scheduledPosts.scheduledAt)]
        });

        // Format posts for calendar view
        const calendarEvents = posts.map(post => {
            // Calculate platform summary
            const platforms = post.destinations.map(d => d.socialAccount.platform);
            const uniquePlatforms = [...new Set(platforms)];

            return {
                id: post.id,
                title: post.content?.substring(0, 50) || 'Untitled Post',
                start: post.scheduledAt,
                status: post.status,
                platforms: uniquePlatforms,
                destinationCount: post.destinations.length,
                content: post.content,
                mediaUrls: post.mediaUrls,
                destinations: post.destinations.map(d => ({
                    id: d.id,
                    platform: d.socialAccount.platform,
                    accountName: d.socialAccount.accountName,
                    status: d.status
                }))
            };
        });

        return NextResponse.json({
            timezone,
            events: calendarEvents,
            total: calendarEvents.length
        });

    } catch (error: any) {
        console.error('Calendar fetch error:', error);
        return NextResponse.json({
            error: 'Failed to fetch calendar',
            details: error.message
        }, { status: 500 });
    }
}
