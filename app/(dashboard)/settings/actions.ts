'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { users, notificationPreferences } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const fullName = formData.get('fullName') as string
    const timezone = formData.get('timezone') as string

    const updates: Record<string, any> = {
        fullName,
        timezone,
        updatedAt: new Date()
    }

    const avatarFile = formData.get('avatar') as File
    if (avatarFile && avatarFile.size > 0) {
        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(`${user.id}/${Date.now()}-${avatarFile.name}`, avatarFile, {
                upsert: true
            })

        if (!error && data) {
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(data.path)
            updates.avatarUrl = publicUrl
        }
    }

    await db.update(users)
        .set(updates)
        .where(eq(users.id, user.id))

    revalidatePath('/settings')
    return { success: true }
}

export async function getNotificationPreferences() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const prefs = await db.query.notificationPreferences.findFirst({
        where: eq(notificationPreferences.userId, user.id)
    })

    if (!prefs) {
        // Return defaults without saving implies UI handles "no prefs" state or we lazy create
        return {
            emailPostFailed: true,
            emailPostPublished: true,
            weeklyDigest: false
        }
    }

    return prefs
}

export async function updateNotificationPreferences(data: Partial<typeof notificationPreferences.$inferSelect>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const existing = await db.query.notificationPreferences.findFirst({
        where: eq(notificationPreferences.userId, user.id)
    })

    if (existing) {
        await db.update(notificationPreferences)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(notificationPreferences.userId, user.id))
    } else {
        await db.insert(notificationPreferences)
            .values({
                userId: user.id,
                ...data
            } as any)
    }

    revalidatePath('/settings')
    return { success: true }
}

export async function deleteAccount() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    await db.delete(users).where(eq(users.id, user.id))

    await supabase.auth.signOut()
    redirect('/')
}
