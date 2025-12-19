
import { NextResponse } from 'next/server';
import { getProvider } from '@/lib/oauth/factory';
import { OAuthStateManager } from '@/lib/oauth/state';
import { OAuthAccountStorage } from '@/lib/oauth/storage';
import { FacebookProvider } from '@/lib/oauth/providers/facebook';
import { socialAccounts } from '@/lib/db/schema';
import { db } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

const FRONTEND_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
            console.error('Facebook OAuth Error from Callback:', error);
            return NextResponse.redirect(`${FRONTEND_URL}/dashboard/accounts?error=${error}`);
        }

        if (!code || !state) {
            return NextResponse.redirect(`${FRONTEND_URL}/dashboard/accounts?error=missing_params`);
        }

        const providerName = 'facebook';

        let oauthData;
        try {
            oauthData = OAuthStateManager.validate(providerName, state);
        } catch (e) {
            console.error("State Validation Error:", e);
            return NextResponse.redirect(`${FRONTEND_URL}/dashboard/accounts?error=invalid_session`);
        }

        const { userId } = oauthData;
        const provider = getProvider(providerName) as FacebookProvider;

        // Exchange Code
        const tokens = await provider.exchangeCode(code); // FB flow usually just needs code, verification via state

        // Fetch User Profile (to get personal ID/Name if needed, but mainly for Pages)
        // const userProfile = await provider.getUserProfile(tokens.accessToken);

        // Fetch Pages
        const pages = await provider.getPages(tokens.accessToken);

        if (!pages || pages.length === 0) {
            // Maybe just store the user profile if no pages? 
            // But requirement says "Users can connect Facebook Pages".
            // We can warn them. But let's verify if we should fail or succeed.
            // We'll redirect with success but maybe a warning if 0 pages found? 
            // For now, just success.
        }

        let connectedCount = 0;

        for (const page of pages) {
            // Store Page
            await OAuthAccountStorage.storeAccount(
                userId,
                'facebook', // platform
                { ...tokens, accessToken: page.access_token }, // Page Token!
                {
                    id: page.id,
                    username: page.name, // Pages use Name as handle usually
                    name: page.name,
                    avatarUrl: page.picture?.data?.url,
                    email: undefined,
                    rawData: page
                }
            );
            connectedCount++;

            // Check for Instagram
            if (page.instagram_business_account) {
                const ig = page.instagram_business_account;
                await OAuthAccountStorage.storeAccount(
                    userId,
                    'instagram',
                    { ...tokens, accessToken: page.access_token }, // IG uses Page Token (or User Token with permissions)
                    {
                        id: ig.id,
                        username: ig.username,
                        name: ig.username, // IG usually just username
                        avatarUrl: ig.profile_picture_url,
                        rawData: ig
                    }
                );
                connectedCount++;
            }
        }

        return NextResponse.redirect(`${FRONTEND_URL}/dashboard/accounts?success=true&count=${connectedCount}`);

    } catch (error: any) {
        console.error('Callback Route Exception:', error);
        return NextResponse.redirect(`${FRONTEND_URL}/dashboard/accounts?error=authentication_failed`);
    }
}
