
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduledPosts } from '@/lib/db/schema';

export async function GET() {
    try {
        const posts = await db.select().from(scheduledPosts);
        return NextResponse.json(posts);
    } catch (error) {
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Validate body with Zod here ideally

        // logic to insert post
        // const newPost = await db.insert(scheduledPosts).values(body).returning();

        // Then trigger Queue

        return NextResponse.json({ success: true, id: "mock-id" });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
