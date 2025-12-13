'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
        .from('media')
        .upload(fileName, file)

    if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error('Failed to upload file')
    }

    console.log("TODO: Call Backend API to sync media library DB");
    // await db.insert...

    revalidatePath('/media')
}

export async function deleteMedia(mediaId: string, fileUrl: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const storagePath = fileUrl.split('/media/')[1]
    if (storagePath) {
        await supabase.storage.from('media').remove([storagePath])
    }

    console.log("TODO: Call Backend API to delete media from DB");
    // await db.delete...

    revalidatePath('/media')
}
