
"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function CalendarPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());

    // Mock posts
    const posts = [
        { date: new Date(), title: "Launch Post", platform: "Twitter" },
        { date: new Date(new Date().setDate(new Date().getDate() + 2)), title: "Weekly Update", platform: "LinkedIn" }
    ];

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Content Calendar</h1>
            </div>

            <div className="grid md:grid-cols-3 gap-6 h-full">
                <Card className="md:col-span-2 h-full">
                    <CardContent className="p-4 flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border shadow w-full max-w-full"
                            modifiers={{
                                booked: posts.map(p => p.date)
                            }}
                            modifiersStyles={{
                                booked: { fontWeight: 'bold', textDecoration: 'underline', color: 'var(--primary)' }
                            }}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Scheduled for {date?.toLocaleDateString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {posts.filter(p => p.date.toDateString() === date?.toDateString()).length > 0 ? (
                                posts.filter(p => p.date.toDateString() === date?.toDateString()).map((p, i) => (
                                    <div key={i} className="p-3 border rounded-lg bg-muted/50">
                                        <div className="font-semibold">{p.title}</div>
                                        <div className="text-sm text-muted-foreground">{p.platform}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted-foreground text-sm">No posts scheduled for this day.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
