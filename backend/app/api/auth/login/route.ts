import { createClient } from '@/lib/supabase/server';
import { createSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        const supabase = await createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !data.user) {
            return NextResponse.json({ error: error?.message || 'Authentication failed' }, { status: 401 });
        }

        // Create Backend Session
        const session = await createSession(data.user.id, {
            userAgent: request.headers.get('user-agent') || undefined,
            ipAddress: request.headers.get('x-forwarded-for') || undefined,
        });

        return NextResponse.json({ success: true, user: data.user, sessionId: session.sessionId });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
