
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // 1. Get file info from request
    // 2. Generate Presigned URL using AWS SDK S3Client
    // 3. Return presigned URL to client

    return NextResponse.json({
        uploadUrl: "https://s3.aws.com/presigned...",
        key: "unique-file-key"
    });
}

export async function GET() {
    // List media from DB
    return NextResponse.json([]);
}
