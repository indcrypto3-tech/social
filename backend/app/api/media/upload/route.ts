
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { db } from '@/lib/db';
import { mediaLibrary } from '@/lib/db/schema';
import { uploadFile } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime'
];

export async function POST(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({
                error: 'File too large',
                maxSize: MAX_FILE_SIZE
            }, { status: 400 });
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({
                error: 'Invalid file type',
                allowedTypes: ALLOWED_TYPES
            }, { status: 400 });
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${uuidv4()}.${fileExt}`;

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage
        const publicUrl = await uploadFile(fileName, buffer, file.type);

        // Store metadata in DB
        const [mediaRecord] = await db.insert(mediaLibrary).values({
            userId: user.id,
            url: publicUrl,
            fileType: file.type,
            fileSize: file.size,
            fileName: file.name
        }).returning();

        return NextResponse.json({
            success: true,
            media: {
                id: mediaRecord.id,
                url: mediaRecord.url,
                fileType: mediaRecord.fileType,
                fileSize: mediaRecord.fileSize,
                fileName: mediaRecord.fileName,
                createdAt: mediaRecord.createdAt
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Media upload error:', error);
        return NextResponse.json({
            error: 'Upload failed',
            details: error.message
        }, { status: 500 });
    }
}
