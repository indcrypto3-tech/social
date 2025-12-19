
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, error, context, level } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const errorObj = error ? new Error(error.message || error) : undefined;
        if (errorObj && error.stack) {
            errorObj.stack = error.stack;
        }

        switch (level) {
            case 'fatal':
                logger.fatal(message, errorObj, context);
                break;
            case 'warn':
                logger.warn(message, context);
                break;
            default:
                logger.error(message, errorObj, context);
        }

        return NextResponse.json({ success: true, logged: true });

    } catch (error: any) {
        console.error('Error logging endpoint failed:', error);
        return NextResponse.json({
            error: 'Failed to log error',
            details: error.message
        }, { status: 500 });
    }
}
