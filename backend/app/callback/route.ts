import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    // Debug logging
    console.log("Auth Callback - Processing code")

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.session) {
            const { session } = data
            const { provider_token, provider_refresh_token, user } = session

            // If we have a provider token, it means this was an OAuth login/link event
            if (provider_token && user) {
                // Find twitter identity
                const twitterIdentity = user.identities?.find(id => id.provider === 'twitter');

                if (twitterIdentity) {
                    // Send to backend for storage
                    try {
                        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
                        const response = await fetch(`${apiBase}/oauth/connect`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.access_token}`
                            },
                            body: JSON.stringify({
                                platform: 'twitter',
                                accessToken: provider_token,
                                refreshToken: provider_refresh_token,
                                expiresAt: session.expires_at,
                                providerAccountId: twitterIdentity.id,
                                username: twitterIdentity.identity_data?.user_name || twitterIdentity.identity_data?.name,
                                metadata: twitterIdentity.identity_data,
                            })
                        });

                        if (!response.ok) {
                            console.error('Failed to link Twitter account in backend', await response.text());
                        } else {
                            console.log('Successfully linked Twitter account in backend');
                        }
                    } catch (err) {
                        console.error('Error calling backend connect API', err);
                    }
                }
            }

            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        } else {
            console.error('Exchange Code Error:', error)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
