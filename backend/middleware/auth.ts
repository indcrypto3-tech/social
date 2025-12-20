import { validateSession } from '../lib/session';

export async function getUser(request: Request) {
    // 1. Check Redis Session (Preferred)
    const session = await validateSession();
    if (session) {
        return {
            id: session.userId,
            // Add other fields if consumers expect them (e.g. email) - but session usually only has ID.
            // If consumers need more profile data, they should fetch from DB using userId.
            // Existing 'getUser' returned Supabase user which has email/metadata.
            // 'accounts/route.ts' only uses 'user.id'.
            // If other routes need email, we might need to fetch user from DB here or update session to store it.
            // For now, minimal { id } is safest for 'session' object.
        };
    }

    // 2. Fallback to Supabase Token (Bearer)
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token) {
            try {
                // We use a direct supabase-js client here to verify the token without cookie dependency
                const { createClient } = await import('@supabase/supabase-js');
                const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
                const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

                if (!supabaseUrl || !supabaseKey) {
                    console.error('Supabase URL/Key missing in auth middleware');
                    return null;
                }

                const supabase = createClient(supabaseUrl, supabaseKey);

                const { data: { user }, error } = await supabase.auth.getUser(token);

                if (user && !error) {
                    return { id: user.id };
                }
            } catch (error) {
                console.warn('Token verification failed:', error);
            }
        }
    }

    return null;
}
