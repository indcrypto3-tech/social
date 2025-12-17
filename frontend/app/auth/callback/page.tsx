'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
    const router = useRouter()

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('Error during auth callback:', error)
                    router.push('/login?error=AuthFailed')
                    return
                }

                if (session) {
                    router.push('/dashboard')
                } else {
                    router.push('/login?error=NoSession')
                }
            } catch (err) {
                console.error('Unexpected error in callback:', err)
                router.push('/login?error=UnexpectedError')
            }
        }

        handleCallback()
    }, [router])

    return (
        <div className="flex h-screen items-center justify-center">
            <p>Authenticating...</p>
        </div>
    )
}
