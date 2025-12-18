
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { OAuthStateManager } from "@/lib/oauth/state";
import { getProvider } from "@/lib/oauth/factory";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const provider = getProvider('twitter');
        const { state, verifier, challenge } = await OAuthStateManager.create(user.id, 'twitter');

        // Dynamically compute redirect URI
        const origin = request.headers.get('origin') ||
            `https://${request.headers.get('host')}` ||
            'http://localhost:3000'; // Final fallback if headers missing (unlikely in Vercel)

        // Clean up origin if needed (remove trailing slash)
        const cleanOrigin = origin.replace(/\/$/, '');
        const redirectUri = `${cleanOrigin}/api/oauth/twitter/callback`;

        // Pass challenge as second argument as updated in provider
        const url = await provider.getAuthUrl(state, challenge, redirectUri);

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error("OAuth Start Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
