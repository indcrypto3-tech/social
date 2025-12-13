import { SocialProvider, PublishResult } from './index';

export class TikTokProvider implements SocialProvider {
    name = 'tiktok';

    async validateToken(token: string): Promise<boolean> {
        // Validate open_id or user info
        try {
            const res = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.ok;
        } catch { return false; }
    }

    async publish(content: string, mediaUrls: string[], accessToken: string, options?: any): Promise<PublishResult> {
        // TikTok Direct Post API
        // 1. Init
        // 2. Upload
        // 3. Publish

        if (mediaUrls.length === 0) throw new Error('TikTok requires video');

        // Simplified:
        const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                post_info: {
                    title: content,
                    privacy_level: 'SELF_ONLY_SHOW_TO_ME'
                },
                source_info: {
                    source: "PULL_FROM_URL",
                    video_url: mediaUrls[0] // Only works if URL is public
                }
            })
        });

        const data = await initRes.json();
        if (data.error && data.error.code !== 'ok') throw new Error(data.error.message);

        return { platformId: data.data?.publish_id || 'pending' };
    }
}
