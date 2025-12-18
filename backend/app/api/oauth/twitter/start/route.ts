import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { OAuthStateManager } from '@/lib/oauth/state';
import { getProvider } from '@/lib/oauth/factory';

export async function POST(request: Request) {
    try {
        // 1. Authenticate User
        const user = await getUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Initialize Provider
        const providerName = 'twitter';
        const provider = getProvider(providerName);

        // 3. Generate State & PKCE
        const { state, challenge } = await OAuthStateManager.create(user.id, providerName);

        // 4. Get Auth URL
        // We pass the challenge here because PKCE requires the hashed challenge in the URL
        const url = await provider.getAuthUrl(state, challenge);

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('OAuth Start Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
