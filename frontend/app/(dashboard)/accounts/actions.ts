'use server'

import { createClient } from '@/lib/supabase/server'

import { headers } from 'next/headers'

import { Provider } from '@supabase/supabase-js'

export async function connectSocialAccount(platformId: string) {
    const supabase = await createClient()
    const headersList = await headers()
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    console.log(`[Connect] Requesting connection for platform: ${platformId}`)

    let provider: Provider;
    let scopes: string | undefined;

    switch (platformId) {
        case 'facebook':
            provider = 'facebook'
            scopes = 'pages_show_list,pages_read_engagement,pages_manage_posts'
            break
        case 'instagram':
            provider = 'instagram' as Provider // Note: Often requires 'facebook' provider for Graph API, but keeping 'instagram' if Basic Display is used.
            scopes = 'instagram_basic,instagram_content_publish'
            break
        case 'twitter':
            provider = 'twitter'
            scopes = 'tweet.read,tweet.write,users.read,offline.access'
            break
        case 'linkedin':
            provider = 'linkedin'
            scopes = 'w_member_social,r_liteprofile'
            break
        case 'youtube':
            provider = 'google'
            // Add YouTube specific scopes
            scopes = 'https://www.googleapis.com/auth/youtube.readonly,https://www.googleapis.com/auth/youtube.upload'
            break
        case 'tiktok':
            console.warn("TikTok connection requested but not natively supported via Supabase yet.")
            return { error: "TikTok integration coming soon" }
        default:
            console.error(`Unknown platform: ${platformId}`)
            return { error: `Platform ${platformId} not supported` }
    }

    console.log(`[Connect] Mapped ${platformId} to provider: ${provider} with scopes: ${scopes}`)

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: `${origin}/auth/callback?next=/dashboard/accounts`,
            scopes: scopes,
            queryParams: {
                // Force consent prompt to ensure we get a refresh token if needed (especially for Google)
                access_type: 'offline',
                prompt: 'consent',
            }
        },
    })

    if (error) {
        console.error("OAuth Error:", error)
        throw new Error("Failed to initiate OAuth")
    }

    if (data.url) {
        console.log("Redirecting to:", data.url)
        return { url: data.url }
    }

    return { error: 'Failed to initiate OAuth' }
}
