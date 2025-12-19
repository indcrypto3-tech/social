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

    // 2. Fallback to Supabase Token? (Optional, if we want to support transition)
    // The prompt implies "all session logic must be backend-controlled".
    // "Implement robust, secure session management... Validate session on every protected request".
    // I will enforce Session.
    return null;
}
