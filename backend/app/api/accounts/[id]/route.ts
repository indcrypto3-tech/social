
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { db } from '@/lib/db';
import { socialAccounts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { destroySession } from '@/lib/session';

// logger helper
const logger = {
    info: (msg: string, meta?: any) => console.log(`[INFO] ${msg}`, meta ? JSON.stringify(meta) : ''),
    error: (msg: string, meta?: any) => console.error(`[ERROR] ${msg}`, meta ? JSON.stringify(meta) : ''),
};

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
        }

        const accountId = params.id;

        if (!accountId) {
            return NextResponse.json({ error: 'Missing account ID', code: 'MISSING_PARAM' }, { status: 400 });
        }

        logger.info("ACCOUNT_DISCONNECT_ATTEMPT", { userId: user.id, accountId });

        // Verify ownership and soft-delete/deactivate
        // 'result' will confirm if it existed
        const result = await db.update(socialAccounts)
            .set({ isActive: false })
            .where(and(eq(socialAccounts.id, accountId), eq(socialAccounts.userId, user.id)))
            .returning({ id: socialAccounts.id });

        if (result.length === 0) {
            return NextResponse.json({ error: 'Account not found or access denied', code: 'ACCOUNT_NOT_FOUND' }, { status: 404 });
        }

        logger.info("ACCOUNT_DISCONNECTED", { userId: user.id, accountId });

        return NextResponse.json({ success: true, id: accountId });
    } catch (error: any) {
        logger.error("ACCOUNT_DISCONNECT_FAILED", {
            error: error.message
        });
        return NextResponse.json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' }, { status: 500 });
    }
}
