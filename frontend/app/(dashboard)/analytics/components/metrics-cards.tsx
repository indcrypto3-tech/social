import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Eye, MousePointerClick, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricsCardsProps {
    data?: {
        totalFollowers: number;
        totalImpressions: number;
        totalEngagement: number;
    } | null;
    loading?: boolean;
}

export function MetricsCards({ data, loading }: MetricsCardsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium"><Skeleton className="h-4 w-20" /></CardTitle>
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold"><Skeleton className="h-8 w-16" /></div>
                            <p className="text-xs text-muted-foreground"><Skeleton className="h-3 w-32 mt-1" /></p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    // Graceful empty state
    if (!data) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card><CardContent className="pt-6 text-muted-foreground">No data available</CardContent></Card>
                <Card><CardContent className="pt-6 text-muted-foreground">No data available</CardContent></Card>
                <Card><CardContent className="pt-6 text-muted-foreground">No data available</CardContent></Card>
            </div>
        )
    }

    const cards = [
        {
            title: "Total Followers",
            value: data.totalFollowers.toLocaleString(),
            icon: Users,
            // Mock change for demo
            change: "+2.1%",
            trend: "up"
        },
        {
            title: "Impressions",
            value: data.totalImpressions.toLocaleString(),
            icon: Eye,
            change: "+12.5%",
            trend: "up"
        },
        {
            title: "Engagement",
            value: data.totalEngagement.toLocaleString(),
            icon: MousePointerClick,
            change: "-0.4%",
            trend: "down"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card) => (
                <Card key={card.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                        <card.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            {card.trend === "up" ? (
                                <ArrowUpRight className="h-3 w-3 text-green-500" />
                            ) : card.trend === "down" ? (
                                <ArrowDownRight className="h-3 w-3 text-red-500" />
                            ) : (
                                <Minus className="h-3 w-3" />
                            )}
                            <span className={card.trend === "up" ? "text-green-500" : card.trend === "down" ? "text-red-500" : ""}>
                                {card.change}
                            </span>
                            from last month
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
