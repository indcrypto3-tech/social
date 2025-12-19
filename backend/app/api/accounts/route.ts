
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { db } from '@/lib/db';
import { socialAccounts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        const user = await getUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const accounts = await db.query.socialAccounts.findMany({
            where: eq(socialAccounts.userId, user.id),
            orderBy: (socialAccounts, { desc }) => [desc(socialAccounts.createdAt)],
        });

        return NextResponse.json(accounts);
    } catch (error: any) {
        console.error('Get Accounts Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const user = await getUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get('id');

        if (!accountId) {
            return NextResponse.json({ error: 'Missing account ID' }, { status: 400 });
        }

        // Verify ownership before deleting
        await db.delete(socialAccounts)
            .where(and(eq(socialAccounts.id, accountId), eq(socialAccounts.userId, user.id)));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete Account Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
