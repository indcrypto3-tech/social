import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { db } from '@/lib/db';
import { socialAccounts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// Helper for structured logging (simple implementation for now)
const logger = {
    error: (code: string, meta: any) => console.error(JSON.stringify({ level: 'error', code, ...meta })),
    info: (code: string, meta: any) => console.log(JSON.stringify({ level: 'info', code, ...meta })),
};

export async function GET(request: Request) {
    try {
        const user = await getUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
        }

        const accounts = await db.query.socialAccounts.findMany({
            where: and(
                eq(socialAccounts.userId, user.id),
                eq(socialAccounts.isActive, true)
            ),
            orderBy: (socialAccounts, { desc }) => [desc(socialAccounts.createdAt)],
        });

        const normalizedAccounts = accounts.map(acc => {
            let status = 'connected';
            const now = new Date();

            if (acc.tokenExpiresAt && new Date(acc.tokenExpiresAt) < now) {
                status = 'expired';
            }
            // Future: Add check for 'action_required' if we track permission scopes/errors

            return {
                id: acc.id,
                platform: acc.platform,
                accountName: acc.accountName,
                accountType: acc.accountType || 'profile', // Default to profile if null
                username: (acc.metadata as any)?.username || null,
                avatarUrl: (acc.metadata as any)?.avatar_url || null,
                status,
                tokenExpiresAt: acc.tokenExpiresAt,
                createdAt: acc.createdAt,
            };
        });

        return NextResponse.json(normalizedAccounts);
    } catch (error: any) {
        logger.error("ACCOUNT_FETCH_FAILED", {
            error: error.message
        });
        return NextResponse.json({ error: 'Failed to fetch connected accounts', code: 'ACCOUNTS_FETCH_ERROR' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const user = await getUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get('id');

        if (!accountId) {
            return NextResponse.json({ error: 'Missing account ID', code: 'MISSING_PARAM' }, { status: 400 });
        }

        logger.info("ACCOUNT_DISCONNECT_ATTEMPT", { userId: user.id, accountId });

        // Verify ownership and soft-delete
        const result = await db.update(socialAccounts)
            .set({ isActive: false })
            .where(and(eq(socialAccounts.id, accountId), eq(socialAccounts.userId, user.id)))
            .returning({ id: socialAccounts.id });

        if (result.length === 0) {
            return NextResponse.json({ error: 'Account not found or access denied', code: 'ACCOUNT_NOT_FOUND' }, { status: 404 });
        }

        logger.info("ACCOUNT_DISCONNECTED", { userId: user.id, accountId });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        logger.error("ACCOUNT_DISCONNECT_FAILED", {
            userId: 'unknown', // Can't reliably get user here if getUser failed (though checks above handle it)
            error: error.message
        });
        return NextResponse.json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' }, { status: 500 });
    }
}
