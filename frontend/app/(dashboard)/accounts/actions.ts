'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import { Provider } from '@supabase/supabase-js'

export async function connectSocialAccount(provider: Provider) {
    const supabase = await createClient()
    const headersList = await headers()
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    console.log("Connect Social Account - Origin:", origin) // Debug log

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: `${origin}/auth/callback?next=/dashboard/accounts`,
            scopes: getScopesForProvider(provider),
        },
    })

    if (error) {
        console.error("OAuth Error:", error)
        throw new Error("Failed to initiate OAuth")
    }

    if (data.url) {
        console.log("Redirecting to:", data.url)
        redirect(data.url)
    }
}

function getScopesForProvider(provider: string) {
    switch (provider) {
        case 'facebook':
            return 'pages_show_list,pages_read_engagement,pages_manage_posts' // Example scopes
        case 'instagram':
            return 'instagram_basic,instagram_content_publish' // Example scopes (for IG Graph API usually requires FB login)
        case 'twitter':
            return 'tweet.read,tweet.write,users.read,offline.access'
        case 'linkedin':
            return 'w_member_social,r_liteprofile'
        default:
            return undefined
    }
}
