import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { socialAccounts } from '@/lib/db/schema'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.session) {
            // Capture provider tokens if this was a social login/connect
            // Note: provider_token is NOT always persisted in the session object over time,
            // but IS available in the immediate exchange response.

            // However, Supabase Auth "Connect" vs "Login" distinction:
            // If we are already logged in, Supabase might just link the identity.

            // Let's check for provider tokens in the session
            const { provider_token, provider_refresh_token, user } = data.session

            // We also need to know WHICH platform this is.
            // Usually, we pass a 'provider' query param or check the user's identities.
            // But 'exchangeCodeForSession' might not tell us the provider easily unless we check identities.

            // Strategy: inspect the latest identity? 
            // Better: The 'data.session.user.identities` array contains connected accounts.
            // We can iterate and find the one with `last_sign_in_at` close to now?
            // Or just update ALL linked identities if we have tokens?

            // Actually, 'provider_token' is at the top level of the session only for the provider used to sign in/connect right now.

            if (provider_token && user) {
                // Determine provider from the identies/metadata or context?
                // Supabase 'user.app_metadata.provider' might be 'email' if we are linking? 

                // Let's look at `user.identities`
                const identities = user.identities || [];
                // Sort by created_at desc or last_sign_in_at?
                // The most recent one should be the one we just linked.
                const latestIdentity = identities.sort((a, b) =>
                    new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
                )[0];

                if (latestIdentity && latestIdentity.provider) {
                    const platformName = latestIdentity.provider;

                    // Now upsert into our socialAccounts table
                    // mapping supabase provider names to our enum
                    // Our enum: 'facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'
                    // Supabase might return 'google', 'twitter', 'facebook', etc.

                    // Simple mapping check
                    const validPlatforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'];
                    if (validPlatforms.includes(platformName)) {
                        await db.insert(socialAccounts).values({
                            userId: user.id,
                            platform: platformName as any,
                            platformAccountId: latestIdentity.id,
                            accountName: (latestIdentity.identity_data as any).user_name || (latestIdentity.identity_data as any).name || (latestIdentity.identity_data as any).email,
                            accessToken: provider_token,
                            refreshToken: provider_refresh_token || null,
                            // tokenExpiresAt: // Calculate if 'expires_in' is available? 
                            // Supabase doesn't always expose 'expires_in' at top level session easily.
                            metadata: latestIdentity.identity_data,
                        }).onConflictDoUpdate({
                            target: [socialAccounts.platform, socialAccounts.platformAccountId], // Ideally we have a unique constraint on these
                            set: {
                                accessToken: provider_token,
                                refreshToken: provider_refresh_token || null,
                                updatedAt: new Date(),
                            }
                        })
                    }
                }
            }

            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'

            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
