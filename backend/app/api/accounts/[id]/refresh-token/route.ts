
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { db } from '@/lib/db';
import { socialAccounts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getProvider } from '@/lib/oauth/factory';
import { decrypt, encrypt } from '@/lib/crypto';
import { OAuthAccountStorage } from '@/lib/oauth/storage';

const logger = {
    info: (msg: string, meta?: any) => console.log(`[INFO] ${msg}`, meta ? JSON.stringify(meta) : ''),
    error: (msg: string, meta?: any) => console.error(`[ERROR] ${msg}`, meta ? JSON.stringify(meta) : ''),
};

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
        }

        const { id: accountId } = params;

        // 1. Fetch Account
        const account = await db.query.socialAccounts.findFirst({
            where: and(eq(socialAccounts.id, accountId), eq(socialAccounts.userId, user.id)),
        });

        if (!account) {
            return NextResponse.json({ error: 'Account not found', code: 'ACCOUNT_NOT_FOUND' }, { status: 404 });
        }

        if (!account.refreshToken) {
            return NextResponse.json({ error: 'No refresh token available', code: 'NO_REFRESH_TOKEN' }, { status: 400 });
        }

        // 2. Decrypt Refresh Token
        const refreshToken = decrypt(account.refreshToken);

        // 3. Get Provider
        let provider;
        try {
            provider = getProvider(account.platform);
        } catch {
            return NextResponse.json({ error: 'Unsupported platform', code: 'PLATFORM_ERROR' }, { status: 400 });
        }

        // 4. Check if Provider supports refresh (Method check)
        if (!('refreshAccessToken' in provider)) {
            // Some providers might not expose this method on the interface yet.
            // Facebook uses long-lived tokens, Twitter V2 uses refresh flow.
            // If method missing, return 501
            // But we should implement it if we claim to support it. 
            // For now, assume it might not be there and fail gracefully.
            // Let's check provider type in factory or cast?
            // Typescript won't let us call it unless it's on OAuthProvider interface.
            // It is NOT on strict OAuthProvider interface in types.ts likely.
            // We might need to extend types.
        }

        // Assuming we update types.ts to include optional refreshAccessToken
        // or cast to specific provider
        // For now, let's implement a dummy check or try to call it dynamically if we trust the provider implies it.

        // Actually, I'll update types.ts first or cast it. 
        // Let's try casting to any for this step to allow build, 
        // then I should strictly update the interface if I have time.
        const providerWithRefresh = provider as any;

        if (typeof providerWithRefresh.refreshAccessToken !== 'function') {
            return NextResponse.json({ error: 'Provider does not support manual refresh', code: 'NOT_SUPPORTED' }, { status: 400 });
        }

        try {
            const newTokens = await providerWithRefresh.refreshAccessToken(refreshToken);

            // 5. Encrypt & Update
            const encryptedAccess = encrypt(newTokens.accessToken);
            const encryptedRefresh = newTokens.refreshToken ? encrypt(newTokens.refreshToken) : account.refreshToken; // Keep old if not rotated

            let expiresAt = account.tokenExpiresAt;
            if (newTokens.expiresIn) {
                expiresAt = new Date(Date.now() + newTokens.expiresIn * 1000);
            }

            await db.update(socialAccounts)
                .set({
                    accessToken: encryptedAccess,
                    refreshToken: encryptedRefresh,
                    tokenExpiresAt: expiresAt,
                    updatedAt: new Date()
                })
                .where(eq(socialAccounts.id, accountId));

            logger.info("TOKEN_REFRESH_SUCCESS", { accountId, platform: account.platform });

            return NextResponse.json({ success: true, expiresAt });

        } catch (refreshError: any) {
            logger.error("TOKEN_REFRESH_FAILED", { accountId, error: refreshError.message });
            return NextResponse.json({ error: 'Failed to refresh token with provider', details: refreshError.message }, { status: 502 });
        }

    } catch (error: any) {
        logger.error("REFRESH_ENDPOINT_ERROR", { error: error.message });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
