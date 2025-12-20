
import { createClient } from '@/lib/supabase/server';
import { createSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Verify Supabase Auth (via Cookie or optional JSON body if needed later)
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            console.error('Supabase Auth verification failed:', error);
            return NextResponse.json({ error: 'Unauthorized: Invalid Supabase Session' }, { status: 401 });
        }

        // 2. Create Server-Side Session
        // Handle IP possibly being an array
        const ipHeader = request.headers.get('x-forwarded-for');
        const ipAddress = Array.isArray(ipHeader) ? ipHeader[0] : (ipHeader?.split(',')[0] || '127.0.0.1');

        const session = await createSession(user.id, {
            userAgent: request.headers.get('user-agent') || undefined,
            ipAddress,
        });

        // 3. Return Sanitized Session Info
        return NextResponse.json({
            success: true,
            session: {
                id: session.id,
                userId: session.userId,
                expiresAt: session.expiresAt
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
