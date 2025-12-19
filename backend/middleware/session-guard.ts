
import { validateSession } from '../lib/session';
import { NextResponse } from 'next/server';

export type AuthenticatedContext = {
    user: {
        id: string;
    };
    session: {
        id: string;
        expiresAt: Date;
    };
};

/**
 * Validates the session and returns user context.
 * throws error if invalid, or returns null?
 * Implementation style:
 * 1. Helper function to be called inside route handlers.
 * 2. Returns context or throws.
 */
export async function authGuard() {
    const session = await validateSession();

    if (!session) {
        throw new Error('Unauthorized');
    }

    return {
        user: { id: session.userId },
        session: { id: session.id, expiresAt: session.expiresAt },
    };
}

/**
 * Middleware wrapper for API Routes (Higher-Order Function style)
 * Usage: export const POST = withAuth(async (req, ctx) => { ... });
 */
export function withAuth(handler: (req: Request, ctx: AuthenticatedContext) => Promise<NextResponse>) {
    return async (req: Request) => {
        try {
            const context = await authGuard();
            // We can't easily pass context as 2nd arg to Next.js handlers if they expect route params.
            // But we can attach it to the request? No, request is immutable.
            // So this HOF strategy might be friction-heavy with Next.js App Router types.
            // Simpler to just call await authGuard() inside the handler.
            return handler(req, context);
        } catch (error) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    };
}
