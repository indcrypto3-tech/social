
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, Users, Eye, MousePointerClick, Activity } from "lucide-react";

interface MetricsCardsProps {
    data: {
        totalFollowers: number;
        totalImpressions: number;
        totalEngagement: number;
        growth?: number;
    }
}

export function MetricsCards({ data }: MetricsCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalFollowers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                        <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                        +2.5% from last month
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalImpressions.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                        <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                        +12% from last month
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                    <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalEngagement.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                        <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                        -4% from last month
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Growth Score</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">8.5</div>
                    <p className="text-xs text-muted-foreground">
                        Based on overall activity
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
