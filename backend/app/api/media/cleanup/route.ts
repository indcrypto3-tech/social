
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mediaLibrary, scheduledPosts } from '@/lib/db/schema';
import { deleteFile } from '@/lib/storage';
import { sql } from 'drizzle-orm';

const WORKER_SECRET = process.env.WORKER_SECRET || 'local-worker-secret';

function validateWorkerRequest(req: Request) {
    const authHeader = req.headers.get('Authorization');
    return authHeader === `Bearer ${WORKER_SECRET}`;
}

export async function POST(req: Request) {
    if (!validateWorkerRequest(req)) {
        return NextResponse.json({ error: 'Unauthorized Worker Access' }, { status: 401 });
    }

    try {
        // Find orphaned media (media not referenced in any post)
        // This requires checking if media URLs are referenced in scheduledPosts.mediaUrls

        const allMedia = await db.select().from(mediaLibrary);
        let deletedCount = 0;
        let failedCount = 0;

        for (const media of allMedia) {
            // Check if this media URL is referenced in any post
            const referencedPosts = await db.select()
                .from(scheduledPosts)
                .where(sql`${scheduledPosts.mediaUrls}::jsonb @> ${JSON.stringify([media.url])}::jsonb`)
                .limit(1);

            if (referencedPosts.length === 0) {
                // Orphaned media - delete it
                try {
                    // Extract filename from URL
                    const urlParts = media.url.split('/');
                    const fileName = urlParts.slice(-2).join('/');

                    // Delete from storage
                    await deleteFile(fileName);

                    // Delete from database
                    await db.delete(mediaLibrary)
                        .where(sql`${mediaLibrary.id} = ${media.id}`);

                    deletedCount++;
                    console.log(`[CLEANUP] Deleted orphaned media: ${media.id}`);
                } catch (error) {
                    console.error(`[CLEANUP] Failed to delete media ${media.id}:`, error);
                    failedCount++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            deleted: deletedCount,
            failed: failedCount
        });

    } catch (error: any) {
        console.error('[CLEANUP] Media cleanup error:', error);
        return NextResponse.json({
            error: 'Cleanup failed',
            details: error.message
        }, { status: 500 });
    }
}
