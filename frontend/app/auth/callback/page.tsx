'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const next = searchParams.get('next') || '/dashboard'

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Supabase client SDK automatically handles the code exchange/session recovery
                // from the URL when getSession() is called.
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('Error during auth callback:', error)
                    router.replace('/login?error=AuthFailed')
                    return
                }

                if (session) {
                    // Success: Redirect to dashboard or originally requested page
                    router.replace(next)
                } else {
                    // No session found? 
                    // It's possible the hash hasn't been processed yet or it was invalid.
                    // In some cases with PKCE/SSR, we might need exchangeCodeForSession.
                    // But usually getSession() covers it if `createBrowserClient` is used.

                    // Let's verify if we have a hash or code
                    const hasCode = new URLSearchParams(window.location.search).has('code')
                    const hasHash = window.location.hash.length > 0

                    if (!hasCode && !hasHash) {
                        console.warn('No auth code or hash found in URL')
                        router.replace('/login?error=NoAuthCode')
                        return
                    }

                    // If we had a code/hash but no session yet, maybe give it a split second or standard login failure
                    router.replace('/login?error=NoSessionCreated')
                }
            } catch (err) {
                console.error('Unexpected error in callback:', err)
                router.replace('/login?error=UnexpectedError')
            }
        }

        handleCallback()
    }, [router, next])

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <h2 className="text-lg font-semibold">Finalizing Login...</h2>
                <p className="text-sm text-gray-500">Please wait while we log you in.</p>
            </div>
        </div>
    )
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <AuthCallbackContent />
        </Suspense>
    )
}
