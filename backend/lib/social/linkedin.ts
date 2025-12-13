import { SocialProvider, PublishResult } from './index';

export class LinkedInProvider implements SocialProvider {
    name = 'linkedin';

    async validateToken(token: string): Promise<boolean> {
        try {
            const res = await fetch('https://api.linkedin.com/v2/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.ok;
        } catch {
            return false;
        }
    }

    async publish(content: string, mediaUrls: string[], accessToken: string, options?: any): Promise<PublishResult> {
        const personId = options?.urn; // e.g. urn:li:person:123
        if (!personId) throw new Error('LinkedIn URN (personId) is required');

        // Basic text share
        const body = {
            author: personId,
            lifecycleState: "PUBLISHED",
            specificContent: {
                "com.linkedin.ugc.ShareContent": {
                    shareCommentary: {
                        text: content
                    },
                    shareMediaCategory: "NONE"
                }
            },
            visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        };

        // If media, we need to register upload, upload, and then reference.
        if (mediaUrls.length > 0) {
            // LinkedIn media flow: Register -> Upload -> Complete -> Post.
            // For brevity, we are implementing text-only support here mostly.
            // But we must update shareMediaCategory if we supported it.
            throw new Error('LinkedIn Media upload flow not implemented in this batch.');
        }

        const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to post to LinkedIn');

        return { platformId: data.id };
    }
}
