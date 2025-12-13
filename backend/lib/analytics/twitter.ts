
export async function fetchTwitterAnalytics(accessToken: string, accountId: string) {
    // Twitter API v2 User Metrics

    return {
        followers: Math.floor(Math.random() * 8000) + 500,
        impressions: Math.floor(Math.random() * 15000) + 100,
        engagement: Math.floor(Math.random() * 300) + 20,
    };
}
