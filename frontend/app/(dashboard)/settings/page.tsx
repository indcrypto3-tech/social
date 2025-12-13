import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClient } from './settings-client'
import { PageHeader } from '../components/page-header'
import { apiClient } from '@/lib/api/client'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        redirect('/login')
    }

    const headers = {
        Authorization: `Bearer ${session.access_token}`
    }

    try {
        const [userProfile, preferences] = await Promise.all([
            apiClient<any>('/settings', { headers }),
            apiClient<any>('/settings/notifications', { headers })
        ]);

        return (
            <div className="flex flex-col gap-6 max-w-5xl mx-auto p-6 md:p-10 pb-16">
                <PageHeader heading="Settings" text="Manage your account, preferences, and subscription." />
                <SettingsClient user={userProfile} preferences={preferences} />
            </div>
        )
    } catch (error) {
        console.error("Failed to load settings:", error);
        return <div>Failed to load settings. Please try again later.</div>
    }
}
