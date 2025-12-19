
import { refreshSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const session = await refreshSession();
        if (!session) {
            return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
        }
        return NextResponse.json({ success: true, session });
    } catch (error) {
        console.error('Session refresh error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
