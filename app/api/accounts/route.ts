
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { socialAccounts } from '@/lib/db/schema';

export async function GET() {
    try {
        const accounts = await db.select().from(socialAccounts);
        return NextResponse.json(accounts);
    } catch (error) {
        console.error('Failed to fetch accounts:', error);
        // Return empty array if DB fails so UI doesn't break during dev without DB
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(request: Request) {
    // This would handle the final step of OAuth or manual token addition
    return NextResponse.json({ message: "Not implemented" }, { status: 501 })
}
