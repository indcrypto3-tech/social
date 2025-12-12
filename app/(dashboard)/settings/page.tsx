import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { SettingsClient } from './settings-client'
import { getNotificationPreferences } from './actions'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
        redirect('/login')
    }

    const userProfile = await db.query.users.findFirst({
        where: eq(users.id, authUser.id)
    })

    if (!userProfile) {
        // Fallback or error page
        return <div className="p-10">User profile not found. Please contact support.</div>
    }

    const prefs = await getNotificationPreferences()

    return (
        <div className="container max-w-4xl py-6 lg:py-10">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>
            <SettingsClient user={userProfile} preferences={prefs} />
        </div>
    )
}
