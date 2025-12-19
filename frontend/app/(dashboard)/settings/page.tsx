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

    let userProfile = null;
    let preferences = null;

    try {
        userProfile = await apiClient<any>('/settings', { headers });
    } catch (error) {
        console.error("Failed to load user profile:", error);
    }

    try {
        preferences = await apiClient<any>('/settings/notifications', { headers });
    } catch (error) {
        console.warn("Failed to load preferences:", error);
        // Fallback to defaults or null
        preferences = {};
    }

    if (!userProfile) {
        return (
            <div className="flex flex-col gap-6 max-w-5xl mx-auto p-6 md:p-10 pb-16">
                <div className="p-4 border border-red-200 bg-red-50 text-red-900 rounded-md">
                    Failed to load settings. Please try again later.
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto p-6 md:p-10 pb-16">
            <PageHeader heading="Settings" text="Manage your account, preferences, and subscription." />
            <SettingsClient user={userProfile} preferences={preferences} />
        </div>
    )
}

