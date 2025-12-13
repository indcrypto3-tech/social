
export async function fetchYoutubeAnalytics(accessToken: string, accountId: string) {
    return {
        followers: Math.floor(Math.random() * 20000) + 5000, // Subscribers
        impressions: Math.floor(Math.random() * 50000) + 2000, // Views
        engagement: Math.floor(Math.random() * 2000) + 100, // Likes + Comments
    };
}
