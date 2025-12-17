'use client'

import { useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    // Default to dashboard, preventing any open redirect vulnerability by ensuring it's a relative path if needed, 
    // but Next.js router handles relative paths well.
    const next = searchParams.get('next') || '/dashboard'
    const processedRef = useRef(false)

    useEffect(() => {
        if (processedRef.current) return
        processedRef.current = true

        const handleCallback = async () => {
            try {
                // Determine if we have a hash or code which indicates an auth flow
                const hasCode = new URLSearchParams(window.location.search).has('code')
                const hasHash = window.location.hash.length > 0

                if (!hasCode && !hasHash) {
                    // No auth parameters found, likely direct access
                    console.warn('[Auth] No code or hash found in URL')
                    router.replace('/login')
                    return
                }

                // Exchange code for session
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('[Auth] Error during auth callback:', error)
                    router.replace('/login?error=AuthFailed')
                    return
                }

                if (session) {
                    console.log('[Auth] Session established, redirecting to:', next)
                    router.replace(next)
                } else {
                    console.warn('[Auth] No session found after getSession')
                    router.replace('/login?error=NoSessionCreated')
                }
            } catch (err) {
                console.error('[Auth] Unexpected error in callback:', err)
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
