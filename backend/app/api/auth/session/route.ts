import { createClient } from '@/lib/supabase/server';
import { createSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        // Authenticate with Supabase using the ID Token or Access Token passed in header or body
        // The client should send the access_token after OAuth
        const body = await request.json();
        const { access_token } = body;

        if (!access_token) {
            return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data, error } = await supabase.auth.getUser(access_token);

        if (error || !data.user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
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
