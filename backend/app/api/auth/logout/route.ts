import { destroySession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    await destroySession();
    return NextResponse.json({ success: true });
}
