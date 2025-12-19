'use client'

import { useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { finalizeLogin } from '../../(auth)/actions'

function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const supabase = createClient()
    const processedRef = useRef(false)
    // Default to dashboard, preventing any open redirect vulnerability
    const next = searchParams.get('next') || '/dashboard'

    useEffect(() => {
        if (processedRef.current) return
        processedRef.current = true

        const handleCallback = async () => {
            try {
                // Determine if we have a hash or code which indicates an auth flow
                const hasCode = new URLSearchParams(window.location.search).has('code')
                const hasHash = window.location.hash.length > 0

                if (!hasCode && !hasHash) {
                    console.warn('[Auth] No code or hash found in URL')
                    router.replace('/login')
                    return
                }

                // Exchange code for session
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    throw error
                }

                if (!session) {
                    throw new Error('No session established')
                }

                // Finalize Login with Backend Session
                if (session.access_token) {
                    await finalizeLogin(session.access_token);
                }

                router.replace(next)

            } catch (err: any) {
                console.error('[Auth] Error in callback:', err)
                toast({
                    title: "Authentication Failed",
                    description: err.message || "Could not complete login",
                    variant: "destructive"
                })
                router.replace('/login?error=AuthFailed')
            }
        }

        handleCallback()
    }, [router, next, toast])

    return (
        <div className="flex h-screen items-center justify-center flex-col gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
                <h2 className="text-lg font-semibold">Finalizing Connection...</h2>
                <p className="text-sm text-gray-500">Please wait while we secure your session.</p>
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
