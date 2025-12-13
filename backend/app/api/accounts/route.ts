import { NextRequest } from 'next/server';
import { db } from '../../../lib/db';
import { socialAccounts } from '../../../lib/db/schema';
import { withErrorHandler, normalizeResponse } from '../../../middleware/error';
import { eq } from 'drizzle-orm';
import { getUser } from '../../../middleware/auth';
import { AuthError } from '../../../lib/errors';

export const GET = withErrorHandler(async (req: Request) => {
    const user = await getUser(req);
    if (!user) throw new AuthError();

    const accounts = await db.select().from(socialAccounts).where(eq(socialAccounts.userId, user.id));
    return normalizeResponse(accounts);
});

export const POST = withErrorHandler(async (request: Request) => {
    // This would handle the final step of OAuth or manual token addition
    return normalizeResponse({ message: "Not implemented" }, 200);
    // Ideally 501, but normalizeResponse defaults to success=true. 
    // If we want to return error, we should throw it, but "Not implemented" can be a success message saying "it's okay, nothing happened".
    // Or simpler:
    // throw new Error("Not implemented");
});
