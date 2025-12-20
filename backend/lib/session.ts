
import { cookies } from 'next/headers';
import { db } from './db';
import { sessions } from './db/schema';
import { eq } from 'drizzle-orm';

const SESSION_TTL_HOURS = parseInt(process.env.SESSION_TTL_HOURS || '168', 10); // 7 days by default
const SESSION_TTL_SECONDS = SESSION_TTL_HOURS * 60 * 60;
const SESSION_COOKIE_NAME = 'session_id';

export interface Session {
    id: string;
    userId: string;
    expiresAt: Date;
    userAgent?: string | null;
    ipAddress?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function createSession(userId: string, metadata: { userAgent?: string, ipAddress?: string } = {}) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);

    const [session] = await db.insert(sessions).values({
        userId,
        expiresAt,
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
    }).returning();

    // Set Cookie
    cookies().set(SESSION_COOKIE_NAME, session.id, {
        httpOnly: true,
        secure: true, // Always secure for cross-site
        sameSite: 'none', // Required for cross-site
        maxAge: SESSION_TTL_SECONDS,
        path: '/',
    });

    return session;
}

export async function validateSession(): Promise<Session | null> {
    const sessionId = cookies().get(SESSION_COOKIE_NAME)?.value;
    if (!sessionId) return null;

    try {
        const session = await db.query.sessions.findFirst({
            where: eq(sessions.id, sessionId),
        });

        if (!session) {
            // cleanup cookie if invalid
            cookies().delete(SESSION_COOKIE_NAME);
            return null;
        }

        if (new Date(session.expiresAt) < new Date()) {
            await destroySession();
            return null;
        }

        return session;
    } catch (error) {
        console.error('Session validation error:', error);
        return null;
    }
}

export async function destroySession() {
    const sessionId = cookies().get(SESSION_COOKIE_NAME)?.value;
    if (sessionId) {
        await db.delete(sessions).where(eq(sessions.id, sessionId));
    }
    cookies().delete(SESSION_COOKIE_NAME);
}

export async function refreshSession() {
    const sessionId = cookies().get(SESSION_COOKIE_NAME)?.value;
    if (!sessionId) return null;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);

    // Verify existence first or just update
    const [updated] = await db.update(sessions)
        .set({ expiresAt })
        .where(eq(sessions.id, sessionId))
        .returning();

    if (updated) {
        cookies().set(SESSION_COOKIE_NAME, updated.id, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: SESSION_TTL_SECONDS,
            path: '/',
        });
        return updated;
    }

    return null;
}

export async function getSessionId() {
    return cookies().get(SESSION_COOKIE_NAME)?.value;
}
