export class PostFormatter {
    static formatForPlatform(platform: string, content: string | null): string {
        const text = content || '';

        switch (platform) {
            case 'twitter':
                // Simple truncation, ideally should handle URLs shortening etc
                return text.substring(0, 280);
            case 'linkedin':
                return text.substring(0, 3000); // LinkedIn has higher limits
            case 'instagram':
                return text.substring(0, 2200);
            default:
                return text;
        }
    }
}
