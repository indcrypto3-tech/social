'use client'

import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export function OAuthSignIn() {
    const handleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'twitter',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (error) {
                console.error('Twitter Login Error:', error)
                alert('Failed to login with Twitter. Please try again.')
            }
        } catch (err) {
            console.error('Unexpected error:', err)
            alert('An unexpected error occurred.')
        }
    }

    return (
        <Button onClick={handleLogin} variant="outline" type="button" className="w-full">
            Login with Twitter
        </Button>
    )
}
