
import { NextResponse } from 'next/server';
import { getProvider } from '@/lib/oauth/factory';
import { OAuthStateManager } from '@/lib/oauth/state';
import { OAuthAccountStorage } from '@/lib/oauth/storage';

const FRONTEND_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
            console.error('Twitter OAuth Error from Callback:', error);
            return NextResponse.redirect(`${FRONTEND_URL}/dashboard/accounts?error=${error}`);
        }

        if (!code || !state) {
            return NextResponse.redirect(`${FRONTEND_URL}/dashboard/accounts?error=missing_params`);
        }

        const providerName = 'twitter';

        // 1. Validate State & Get session data
        let oauthData;
        try {
            oauthData = OAuthStateManager.validate(providerName, state);
        } catch (e) {
            console.error("State Validation Error:", e);
            return NextResponse.redirect(`${FRONTEND_URL}/dashboard/accounts?error=invalid_session`);
        }

        const { verifier, userId } = oauthData;
        const provider = getProvider(providerName);

        // 2. Exchange Code for Tokens
        const tokens = await provider.exchangeCode(code, verifier);

        // 3. Fetch User Profile
        const profile = await provider.getUserProfile(tokens.accessToken);

        // 4. Store in Database
        await OAuthAccountStorage.storeAccount(userId, providerName, tokens, profile);

        // 5. Redirect Success
        return NextResponse.redirect(`${FRONTEND_URL}/dashboard/accounts?success=true`);

    } catch (error: any) {
        console.error('Callback Route Exception:', error);
        return NextResponse.redirect(`${FRONTEND_URL}/dashboard/accounts?error=authentication_failed`);
    }
}
