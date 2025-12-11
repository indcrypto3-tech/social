import { db } from '@/lib/db';
import { mediaLibrary } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';
import { desc, eq } from 'drizzle-orm';
import MediaList from './media-list';

export default async function MediaPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const mediaItems = await db.query.mediaLibrary.findMany({
        where: eq(mediaLibrary.userId, user.id),
        orderBy: [desc(mediaLibrary.createdAt)],
    });

    return (
        <div className="flex flex-col gap-6">
            <MediaList initialData={mediaItems} />
        </div>
    );
}
