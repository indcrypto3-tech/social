import { getSupabaseAdmin } from '../supabase/admin';

export const BUCKET_NAME = 'media';

export async function uploadFile(
    fileName: string,
    fileBody: Buffer | ArrayBuffer,
    contentType: string
): Promise<string> {
    const supabase = getSupabaseAdmin();
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
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
        .storage
        .from(BUCKET_NAME)
        .remove([fileName]);

    if (error) {
        throw new Error(`Storage Delete Failed: ${error.message}`);
    }
}
