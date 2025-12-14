import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { waitlist } from '@/lib/db/schema';
import { withErrorHandler } from '@/middleware/error';
import { z } from 'zod';

const waitlistSchema = z.object({
    email: z.string().email(),
});

export const POST = withErrorHandler(async (req) => {
    const body = await req.json();
    const { email } = waitlistSchema.parse(body);

    // Check if email already exists to return a friendly message or just success
    // Using onConflictDoNothing to avoid error if exists, effectively idempotent
    await db.insert(waitlist).values({ email }).onConflictDoNothing();

    return NextResponse.json({ success: true, message: "Joined waitlist successfully" });
});
