
export async function fetchFacebookAnalytics(accessToken: string, accountId: string) {
    // https://developers.facebook.com/docs/graph-api/reference/page/insights/

    // Mocking return data
    return {
        followers: Math.floor(Math.random() * 10000) + 2000,
        impressions: Math.floor(Math.random() * 20000) + 1000,
        engagement: Math.floor(Math.random() * 800) + 100,
    };
}
