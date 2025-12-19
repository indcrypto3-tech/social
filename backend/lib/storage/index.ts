
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin client for Storage operations (server-side only)
// using Service Role Key to bypass RLS for uploads if needed, or ensuring correct RLS policies.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase credentials missing for Storage");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const BUCKET_NAME = 'media';

export async function uploadFile(
    fileName: string,
    fileBody: Buffer | ArrayBuffer,
    contentType: string
): Promise<string> {
    const { data, error } = await supabase
        .storage
        .from(BUCKET_NAME)
        .upload(fileName, fileBody, {
            contentType: contentType,
            upsert: false
        });

    if (error) {
        throw new Error(`Storage Upload Failed: ${error.message}`);
    }

    // Get Public URL
    const { data: publicData } = supabase
        .storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

    return publicData.publicUrl;
}

export async function deleteFile(fileName: string) {
    const { error } = await supabase
        .storage
        .from(BUCKET_NAME)
        .remove([fileName]);

    if (error) {
        throw new Error(`Storage Delete Failed: ${error.message}`);
    }
}
