
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
        // Pass challenge as second argument as updated in provider
        const url = await provider.getAuthUrl(state, challenge);

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error("OAuth Start Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
