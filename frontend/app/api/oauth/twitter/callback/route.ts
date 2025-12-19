
import { NextResponse } from "next/server";
import { OAuthStateManager } from "@/lib/oauth/state";
import { getProvider } from "@/lib/oauth/factory";
import { OAuthAccountStorage } from "@/lib/oauth/storage";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const state = requestUrl.searchParams.get("state");
    const error = requestUrl.searchParams.get("error");

    if (error) {
        return NextResponse.redirect(`${requestUrl.origin}/accounts?error=${error}`);
    }

    if (!code || !state) {
        return NextResponse.redirect(`${requestUrl.origin}/accounts?error=missing_params`);
    }

    try {
        // 1. Validate State
        const stateData = OAuthStateManager.validate('twitter', state);

        // 2. Exchange Code
        const provider = getProvider('twitter');
        if (!stateData.verifier) {
            throw new Error("Missing PKCE verifier in state");
        }

        const redirectUri = `${requestUrl.origin}/api/oauth/twitter/callback`;

        const tokens = await provider.exchangeCode(code, stateData.verifier, redirectUri);

        // 3. Get User Profile
        const profile = await provider.getUserProfile(tokens.accessToken);

        // 4. Store Account
        await OAuthAccountStorage.storeAccount(
            stateData.userId,
            'twitter',
            tokens,
            profile
        );

        return NextResponse.redirect(`${requestUrl.origin}/accounts?success=true&platform=twitter&limited=true`);
    } catch (err: any) {
        console.error("OAuth Callback Error:", err);
        return NextResponse.redirect(`${requestUrl.origin}/accounts?error=${encodeURIComponent(err.message)}`);
    }
}
