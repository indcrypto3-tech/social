
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { db } from '@/lib/db';
import { mediaLibrary } from '@/lib/db/schema';
import { deleteFile } from '@/lib/storage';
import { eq, and } from 'drizzle-orm';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const mediaId = params.id;

        // Fetch media record to verify ownership and get file path
        const media = await db.query.mediaLibrary.findFirst({
            where: and(
                eq(mediaLibrary.id, mediaId),
                eq(mediaLibrary.userId, user.id)
            )
        });

        if (!media) {
            return NextResponse.json({ error: 'Media not found' }, { status: 404 });
        }

        // Extract filename from URL for storage deletion
        // URL format: https://{project}.supabase.co/storage/v1/object/public/media/{userId}/{filename}
        const urlParts = media.url.split('/');
        const fileName = urlParts.slice(-2).join('/'); // userId/filename.ext

        try {
            // Delete from storage
            await deleteFile(fileName);
        } catch (storageError) {
            console.error('Storage deletion failed:', storageError);
            // Continue with DB deletion even if storage fails
        }

        // Delete from database
        await db.delete(mediaLibrary)
            .where(eq(mediaLibrary.id, mediaId));

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Media deletion error:', error);
        return NextResponse.json({
            error: 'Deletion failed',
            details: error.message
        }, { status: 500 });
    }
}
