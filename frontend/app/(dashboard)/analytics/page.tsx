
import { createClient } from "@/lib/supabase/server";
import { apiClient } from "@/lib/api/client";
import { MetricsCards } from "./components/metrics-cards";
import { EngagementChart } from "./components/engagement-chart";
import { TopPosts } from "./components/top-posts";
import { BestTime } from "./components/best-time";
import { PageHeader } from "../components/page-header";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch snapshots via API
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) redirect('/login');

    const snapshots = await apiClient<any[]>('/analytics', {
        headers: { Authorization: `Bearer ${session.access_token}` }
    });

    // Process data for charts
    // We want to aggregate by date for the chart (sum of all platforms per day)
    const aggregatedByDate: Record<string, { date: string, followers: number, impressions: number, engagement: number }> = {};

    // Sort chronological
    const sortedSnapshots = [...snapshots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedSnapshots.forEach(s => {
        const d = new Date(s.date).toISOString().split('T')[0];
        if (!aggregatedByDate[d]) {
            aggregatedByDate[d] = { date: d, followers: 0, impressions: 0, engagement: 0 };
        }
        aggregatedByDate[d].followers += s.followers;
        aggregatedByDate[d].impressions += s.impressions;
        aggregatedByDate[d].engagement += s.engagement;
    });

    const chartData = Object.values(aggregatedByDate);

    // Calculate totals (Metrics Cards) - based on most recent day's aggregated data
    const latestData = chartData[chartData.length - 1] || { followers: 0, impressions: 0, engagement: 0 };

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto">
            <PageHeader heading="Analytics" text="Track your social media performance." />

            <MetricsCards data={{
                totalFollowers: latestData.followers,
                totalImpressions: latestData.impressions,
                totalEngagement: latestData.engagement
            }} />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <EngagementChart data={chartData} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                <TopPosts />
                <BestTime />
            </div>
        </div>
    );
}
