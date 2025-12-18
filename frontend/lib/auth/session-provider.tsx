'use client'

import { createClient } from '@/lib/supabase/client'
import { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface SessionContextType {
    session: Session | null
    user: User | null
    isLoading: boolean
    signOut: () => Promise<void>
}

const SessionContext = createContext<SessionContextType>({
    session: null,
    user: null,
    isLoading: true,
    signOut: async () => { },
})

export const useSession = () => useContext(SessionContext)

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const initializeSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                if (error) {
                    console.error('Error fetching session:', error)
                }
                setSession(session)
                setUser(session?.user ?? null)
            } catch (err) {
                console.error('Unexpected error fetching session:', err)
            } finally {
                setIsLoading(false)
            }

            const {
                data: { subscription },
            } = supabase.auth.onAuthStateChange(async (_event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
                setIsLoading(false)

                if (_event === 'SIGNED_OUT') {
                    // Optional: Global handling for sign out if needed
                    // router.push('/login') // Usually handled by protected routes or middleware
                    setSession(null)
                    setUser(null)
                }
            })

            return () => {
                subscription.unsubscribe()
            }
        }

        initializeSession()
    }, [supabase, router])

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
            setSession(null)
            setUser(null)
            router.push('/login')
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    const value = {
        session,
        user,
        isLoading,
        signOut,
    }

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    )
}
