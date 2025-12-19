
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const WORKER_SECRET = process.env.WORKER_SECRET || 'local-worker-secret';

function validateWorkerRequest(req: Request) {
    const authHeader = req.headers.get('Authorization');
    return authHeader === `Bearer ${WORKER_SECRET}`;
}

export async function POST(req: Request) {
    if (!validateWorkerRequest(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { jobName, status, context } = body;

        if (!jobName || !status) {
            return NextResponse.json({
                error: 'jobName and status are required'
            }, { status: 400 });
        }

        logger.logJob(jobName, status, context);

        return NextResponse.json({ success: true, logged: true });

    } catch (error: any) {
        console.error('Worker logging endpoint failed:', error);
        return NextResponse.json({
            error: 'Failed to log worker event',
            details: error.message
        }, { status: 500 });
    }
}
