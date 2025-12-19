import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import { redis } from './redis';

const SESSION_TTL_HOURS = parseInt(process.env.SESSION_TTL_HOURS || '12', 10);
const SESSION_TTL_SECONDS = SESSION_TTL_HOURS * 60 * 60;
const SESSION_COOKIE_NAME = 'session_id';

export interface Session {
    sessionId: string;
    userId: string;
    createdAt: string;
    expiresAt: string;
    userAgent?: string;
    ipAddress?: string;
    // Add other metadata if needed
}

export async function createSession(userId: string, metadata: { userAgent?: string, ipAddress?: string } = {}) {
    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);

    const session: Session = {
        sessionId,
        userId,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
    };

    // Store in Redis with TTL
    await redis.set(`session:${sessionId}`, session, { ex: SESSION_TTL_SECONDS });

    // Set Cookie
    cookies().set(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_TTL_SECONDS,
        path: '/',
    });

    return session;
}

export async function validateSession(): Promise<Session | null> {
    const sessionId = cookies().get(SESSION_COOKIE_NAME)?.value;
    if (!sessionId) return null;

    const session = await redis.get<Session>(`session:${sessionId}`);
    if (!session) return null;

    // Check expiry explicitly just in case (though Redis TTL handles it)
    if (new Date(session.expiresAt) < new Date()) {
        await destroySession();
        return null;
    }

    return session;
}

export async function destroySession() {
    const sessionId = cookies().get(SESSION_COOKIE_NAME)?.value;
    if (sessionId) {
        await redis.del(`session:${sessionId}`);
    }

    cookies().delete(SESSION_COOKIE_NAME);
}

export async function getSessionId() {
    return cookies().get(SESSION_COOKIE_NAME)?.value;
}
