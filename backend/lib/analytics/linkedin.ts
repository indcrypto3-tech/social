
export async function fetchLinkedInAnalytics(accessToken: string, accountId: string) {
    return {
        followers: Math.floor(Math.random() * 3000) + 100,
        impressions: Math.floor(Math.random() * 5000) + 50,
        engagement: Math.floor(Math.random() * 150) + 10,
    };
}
