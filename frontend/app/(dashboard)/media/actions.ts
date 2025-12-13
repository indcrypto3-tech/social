'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadMedia(formData: FormData) {
    const supabase = await createClient()

    // 1. Authenticate User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.error('Upload Failed: No user found in session.');
        throw new Error('Unauthorized: No user found');
    }

    console.log('Upload User Context:', {
        id: user.id,
        role: user.role,
        aud: user.aud,
        email: user.email
    });

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Missing Supabase Environment Variables');
        throw new Error('Server Configuration Error: Missing Supabase Env Vars');
    }

    // 2. Get File
    const file = formData.get('file') as File
    if (!file) {
        throw new Error('No file provided')
    }

    // 3. Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    // ATTEMPT 1: Try using Service Role Key (Bypasses RLS)
    // This is secure because we validated the 'user' above.
    let uploadClient = supabase;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log('Using Service Role Key for Storage Upload (Bypassing RLS)');
        const { createClient: createAdminClient } = await import('@supabase/supabase-js');
        uploadClient = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );
    } else {
        console.warn('SUPABASE_SERVICE_ROLE_KEY not found. Falling back to authenticated user client (RLS enforced).');
    }

    const { data: uploadData, error: uploadError } = await uploadClient
        .storage
        .from('media')
        .upload(fileName, file, {
            upsert: true,
            contentType: file.type
        })

    if (uploadError) {
        console.error('Supabase Storage Upload Error:', JSON.stringify(uploadError, null, 2));
        console.error('Attempted to upload to:', fileName);
        console.error('User ID:', user.id);
        throw new Error(`Failed to upload file: ${uploadError.message}`)
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
