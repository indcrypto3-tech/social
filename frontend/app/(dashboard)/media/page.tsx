import { createClient } from '@/lib/supabase/server';
import { apiClient } from '@/lib/api/client';
import MediaList from './media-list';
import { redirect } from 'next/navigation';

export default async function MediaPage() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) redirect('/login');

    let mediaItems = [];
    try {
        mediaItems = await apiClient<any[]>('/media', {
            headers: { Authorization: `Bearer ${session.access_token}` },
            cache: 'no-store'
        });
        console.log('Media Page Fetched Items:', mediaItems?.length);
    } catch (error) {
        console.error("MEDIA_PAGE_CRASH", {
            userId: session.user.id,
            error
        });
    }

    return (
        <div className="flex flex-col gap-6">
            <MediaList initialData={mediaItems || []} />
        </div>
    );
}
