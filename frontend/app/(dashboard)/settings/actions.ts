'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { apiClient } from '@/lib/api/client'

async function getAuthHeaders() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
        throw new Error('Not authenticated')
    }
    return { Authorization: `Bearer ${session.access_token}` }
}

export async function updateProfile(formData: FormData) {
    const headers = await getAuthHeaders()

    const fullName = formData.get('fullName') as string
    const timezone = formData.get('timezone') as string
    const avatarUrl = formData.get('avatarUrl') as string

    await apiClient('/settings', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
            fullName,
            timezone,
            avatarUrl
        })
    })

    revalidatePath('/settings')
    return { success: true }
}

export async function getNotificationPreferences() {
    // This is now handled in page load, but if needed:
    try {
        const headers = await getAuthHeaders()
        return await apiClient('/settings/notifications', { headers })
    } catch (e) {
        return null;
    }
}

export async function updateNotificationPreferences(formData: FormData) {
    try {
        const headers = await getAuthHeaders()

        const emailPostFailed = formData.get('emailPostFailed') === 'true'
        const emailPostPublished = formData.get('emailPostPublished') === 'true'
        const weeklyDigest = formData.get('weeklyDigest') === 'true'

        await apiClient('/settings/notifications', {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                emailPostFailed,
                emailPostPublished,
                weeklyDigest,
            })
        })

        revalidatePath('/settings')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to update preferences' }
    }
}

export async function deleteAccount() {
    // TODO: Implement DELETE /api/settings/account endpoint in backend
    // For now, return mock success or throw not implemented
    return { success: false, error: 'Not implemented yet' }
}
