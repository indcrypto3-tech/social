import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { OAuthStateManager } from '@/lib/oauth/state';
import { getProvider } from '@/lib/oauth/factory';

export async function POST(request: Request) {
    try {
        const user = await getUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const providerName = 'facebook';
        const provider = getProvider(providerName);
        const { state, challenge } = await OAuthStateManager.create(user.id, providerName); // FB doesn't strictly need PKCE S256 in all versions but we can pass state

        // Note: Facebook Provider getAuthUrl might ignore challenge if not using PKCE, but state is critical
        const url = await provider.getAuthUrl(state, challenge);

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('Facebook OAuth Start Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
