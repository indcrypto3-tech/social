'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { mediaLibrary, users } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'

export async function uploadMedia(formData: FormData) {
    const supabase = await createClient()

    // 1. Authenticate User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Unauthorized')
    }

    // 2. Get File
    const file = formData.get('file') as File
    if (!file) {
        throw new Error('No file provided')
    }

    // 3. Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('media') // Ensure this bucket exists in Supabase
        .upload(fileName, file)

    if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error('Failed to upload file')
    }

    // 4. Get Public URL
    const { data: { publicUrl } } = supabase
        .storage
        .from('media')
        .getPublicUrl(fileName)

    // 4.5. Ensure User Exists (Lazy Sync)
    // This handles cases where user exists in Auth but not in public.users (e.g. manual creation or pre-sync signup)
    await db.insert(users).values({
        id: user.id,
        email: user.email!,
        fullName: user.user_metadata?.full_name || user.email,
    }).onConflictDoNothing(); // If they exist, do nothing

    // 5. Save to DB
    await db.insert(mediaLibrary).values({
        userId: user.id,
        url: publicUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
    })

    revalidatePath('/media')
}

export async function deleteMedia(mediaId: string, fileUrl: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Extract path from URL for storage deletion
    // URL: https://project.supabase.co/storage/v1/object/public/media/USER_ID/FILENAME
    // We need: USER_ID/FILENAME
    const storagePath = fileUrl.split('/media/')[1]

    if (storagePath) {
        await supabase.storage.from('media').remove([storagePath])
    }

    await db.delete(mediaLibrary)
        .where(eq(mediaLibrary.id, mediaId))

    revalidatePath('/media')
}
