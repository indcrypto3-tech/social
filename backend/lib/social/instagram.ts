import { SocialProvider, PublishResult } from './index';

export class InstagramProvider implements SocialProvider {
    name = 'instagram';

    async validateToken(token: string): Promise<boolean> {
        // Validate by fetching basic profile info
        try {
            const res = await fetch(`https://graph.facebook.com/me/accounts?access_token=${token}`);
            const data = await res.json();
            return !!data.data;
        } catch (e) {
            return false;
        }
    }

    async publish(content: string, mediaUrls: string[], accessToken: string, options?: any): Promise<PublishResult> {
        const igUserId = options?.instagramUserId;
        if (!igUserId) throw new Error('Instagram User ID is required');

        if (mediaUrls.length === 0) {
            throw new Error('Instagram requires at least one media item');
        }

        const imageUrl = mediaUrls[0]; // Focusing on single image for now

        // 1. Create Media Container
        const containerRes = await fetch(`https://graph.facebook.com/${igUserId}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_url: imageUrl,
                caption: content,
                access_token: accessToken
            })
        });
        const containerData = await containerRes.json();
        if (!containerRes.ok || containerData.error) throw new Error(containerData.error?.message || 'Failed to create IG media container');

        const creationId = containerData.id;

        // 2. Publish Media
        const publishRes = await fetch(`https://graph.facebook.com/${igUserId}/media_publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creation_id: creationId,
                access_token: accessToken
            })
        });
        const publishData = await publishRes.json();
        if (!publishRes.ok || publishData.error) throw new Error(publishData.error?.message || 'Failed to publish to Instagram');

        return { platformId: publishData.id };
    }
}
