
import { validateSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const session = await validateSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ session });
    } catch (error) {
        console.error('Session validation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
