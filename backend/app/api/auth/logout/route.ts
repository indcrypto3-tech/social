
import { destroySession } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        // Destroy local session
        await destroySession();

        // Sign out from Supabase
        const supabase = await createClient();
        await supabase.auth.signOut();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        // Return success to be idempotent
        return NextResponse.json({ success: true });
    }
}
