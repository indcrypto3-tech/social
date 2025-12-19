
import { NextResponse } from 'next/server';
import { getProvider } from '@/lib/oauth/factory';
import { OAuthStateManager } from '@/lib/oauth/state';
import { OAuthAccountStorage } from '@/lib/oauth/storage';
import { LinkedInProvider } from '@/lib/oauth/providers/linkedin';

const FRONTEND_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
            console.error('LinkedIn OAuth Error from Callback:', error);
            return NextResponse.redirect(`${FRONTEND_URL}/dashboard/accounts?error=${error}`);
        }

        if (!code || !state) {
            return NextResponse.redirect(`${FRONTEND_URL}/dashboard/accounts?error=missing_params`);
        }

        const providerName = 'linkedin';

        let oauthData;
        try {
            oauthData = OAuthStateManager.validate(providerName, state);
        } catch (e) {
            console.error("State Validation Error:", e);
            return NextResponse.redirect(`${FRONTEND_URL}/dashboard/accounts?error=invalid_session`);
        }

        const { userId } = oauthData;
        const provider = getProvider(providerName) as LinkedInProvider;

        // Exchange Code
        const tokens = await provider.exchangeCode(code);

        // 1. Store Personal Profile
        const profile = await provider.getUserProfile(tokens.accessToken);
        await OAuthAccountStorage.storeAccount(userId, providerName, tokens, profile);

        // 2. Fetch & Store Organizations
        const orgs = await provider.getOrganizations(tokens.accessToken);

        for (const orgObj of orgs) {
            const org = orgObj.organizationalTarget;
            if (!org) continue;

            // Extract logo
            let logoUrl = undefined;
            if (org.logoV2 && org.logoV2['original~'] && org.logoV2['original~'].elements && org.logoV2['original~'].elements.length > 0) {
                logoUrl = org.logoV2['original~'].elements[0].identifiers[0].identifier;
            }

            // LinkedIn Orgs usually use a URN like "urn:li:organization:12345" as ID
            // The API returns just the ID part typically or the URN.
            // checking docs: organizationalTarget contains "urn:li:organization:2414183"
            const orgId = org.id; // "urn:li:organization:..."

            await OAuthAccountStorage.storeAccount(
                userId,
                providerName, // platform is still linkedin
                tokens, // Access token is same (user delegated)
                {
                    id: orgId,
                    username: org.localizedName, // Orgs don't have username handles same way, use Name
                    name: org.localizedName,
                    avatarUrl: logoUrl,
                    rawData: orgObj
                }
            );
        }

        return NextResponse.redirect(`${FRONTEND_URL}/dashboard/accounts?success=true`);

    } catch (error: any) {
        console.error('Callback Route Exception:', error);
        return NextResponse.redirect(`${FRONTEND_URL}/dashboard/accounts?error=authentication_failed`);
    }
}
