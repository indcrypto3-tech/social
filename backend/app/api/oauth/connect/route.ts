
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { socialAccounts } from '@/lib/db/schema';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// We use the anon key here because we are verifying the user's token passed in headers
// or we can use the Service Role Key if we need admin privileges, but for verification regular client works
// if we use getUser(token).

const ConnectSchema = z.object({
    platform: z.enum(['twitter']),
    accessToken: z.string(),
    refreshToken: z.string().optional().nullable(),
    expiresAt: z.number().optional().nullable(),
    providerAccountId: z.string(),
    username: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
});

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Verify user
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.error("Auth verification failed:", authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const result = ConnectSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid payload', details: result.error }, { status: 400 });
        }

        const { platform, accessToken, refreshToken, expiresAt, providerAccountId, username, metadata } = result.data;

        // Convert expiry to Date
        // Twitter often returns 'expires_in' (seconds duration) in some contexts, but Supabase session usually gives 'expires_at' (timestamp in seconds)
        // We assume the frontend passes the correct timestamp.
        const tokenExpiresAt = expiresAt ? new Date(expiresAt * 1000) : null;

        console.log(`Linking ${platform} account ${providerAccountId} for user ${user.id}`);

        // Upsert into social_accounts
        await db.insert(socialAccounts).values({
            userId: user.id,
            platform: platform,
            platformAccountId: providerAccountId,
            accountName: username || 'Unknown',
            accessToken: accessToken,
            refreshToken: refreshToken || null,
            tokenExpiresAt: tokenExpiresAt,
            metadata: metadata || {},
        }).onConflictDoUpdate({
            target: [socialAccounts.platform, socialAccounts.platformAccountId],
            set: {
                userId: user.id, // Re-link to current user
                accessToken: accessToken,
                refreshToken: refreshToken || null,
                tokenExpiresAt: tokenExpiresAt,
                accountName: username || 'Unknown',
                metadata: metadata || {},
                updatedAt: new Date(),
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Connect API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
