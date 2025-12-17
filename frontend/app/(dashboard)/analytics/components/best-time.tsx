
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BestTime() {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Best Time to Post</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="font-medium">Monday</div>
                        <div className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">09:00 AM</div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="font-medium">Wednesday</div>
                        <div className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">02:00 PM</div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="font-medium">Friday</div>
                        <div className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">11:00 AM</div>
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground text-center">
                        Based on your audience engagement history.
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
