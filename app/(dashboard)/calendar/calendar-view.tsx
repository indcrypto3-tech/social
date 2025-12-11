'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    parseISO
} from 'date-fns';
import { cn } from "@/lib/utils";
import Link from 'next/link';

type Post = {
    id: string;
    content: string | null;
    scheduledAt: Date; // Note: Date object after serialization might be string if passed from server directly without conversion, but usually Server Actions return Dates. We will handle string/Date.
    status: string;
    destinations: {
        socialAccount: {
            platform: string;
            accountName: string | null;
        }
    }[];
};

export default function CalendarView({ posts }: { posts: any[] }) {
    // Normalize dates just in case
    const safePosts = posts.map(p => ({
        ...p,
        scheduledAt: new Date(p.scheduledAt)
    }));

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const startDate = startOfWeek(startOfMonth(currentMonth));
    const endDate = endOfWeek(endOfMonth(currentMonth));

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const today = new Date();

    const getPostsForDay = (day: Date) => {
        return safePosts.filter(post => isSameDay(post.scheduledAt, day));
    };

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between shrink-0">
                <h1 className="text-2xl font-bold">Content Calendar</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
                    <Link href="/composer">
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            New Post
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
                {/* Calendar Grid */}
                <Card className="flex-1 flex flex-col h-full overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between p-4 border-b shrink-0">
                        <CardTitle className="text-lg font-semibold">
                            {format(currentMonth, 'MMMM yyyy')}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={prevMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={nextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 grid grid-cols-7 grid-rows-[auto_1fr] h-full overflow-hidden">
                        {/* Days Header */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="p-2 text-center text-xs font-semibold text-muted-foreground border-b border-r last:border-r-0">
                                {day}
                            </div>
                        ))}

                        {/* Days Grid */}
                        <div className="col-span-7 grid grid-cols-7 auto-rows-fr h-full overflow-y-auto">
                            {calendarDays.map((day, dayIdx) => {
                                const dayPosts = getPostsForDay(day);
                                const isSelected = isSameDay(day, selectedDate);
                                const isToday = isSameDay(day, today);
                                const isCurrentMonth = isSameMonth(day, currentMonth);

                                return (
                                    <div
                                        key={day.toString()}
                                        onClick={() => setSelectedDate(day)}
                                        className={cn(
                                            "min-h-[100px] border-b border-r last:border-r-0 p-2 transition-colors cursor-pointer hover:bg-muted/30 flex flex-col gap-1",
                                            !isCurrentMonth && "bg-muted/10 text-muted-foreground",
                                            isSelected && "bg-blue-50/50 dark:bg-blue-900/10 ring-1 ring-inset ring-primary",
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={cn(
                                                "text-sm font-medium h-7 w-7 rounded-full flex items-center justify-center",
                                                isToday && "bg-primary text-primary-foreground"
                                            )}>
                                                {format(day, 'd')}
                                            </span>
                                            {dayPosts.length > 0 && (
                                                <span className="text-[10px] font-bold text-muted-foreground">
                                                    {dayPosts.length}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                                            {dayPosts.slice(0, 3).map(post => (
                                                <div
                                                    key={post.id}
                                                    className="text-[10px] truncate px-1 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800"
                                                    title={post.content || "Media Post"}
                                                >
                                                    {post.destinations[0]?.socialAccount?.platform && (
                                                        <span className="font-bold mr-1">
                                                            {post.destinations[0].socialAccount.platform[0].toUpperCase()}:
                                                        </span>
                                                    )}
                                                    {post.content || "Media Only"}
                                                </div>
                                            ))}
                                            {dayPosts.length > 3 && (
                                                <div className="text-[10px] text-muted-foreground pl-1">
                                                    + {dayPosts.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar Details */}
                <Card className="w-full lg:w-80 h-full shrink-0 flex flex-col">
                    <CardHeader className="border-b shrink-0">
                        <CardTitle className="text-base">
                            {format(selectedDate, 'EEEE, MMM d')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 overflow-y-auto flex-1 space-y-4">
                        {getPostsForDay(selectedDate).length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                <p>No posts scheduled.</p>
                                <Button variant="link" asChild className="mt-2">
                                    <Link href="/composer">Schedule one?</Link>
                                </Button>
                            </div>
                        ) : (
                            getPostsForDay(selectedDate).map(post => (
                                <div key={post.id} className="p-3 border rounded-lg bg-card shadow-sm space-y-2">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{format(post.scheduledAt, 'h:mm a')}</span>
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded-full capitalize",
                                            post.status === 'published' ? "bg-green-100 text-green-700" :
                                                post.status === 'failed' ? "bg-red-100 text-red-700" :
                                                    "bg-yellow-100 text-yellow-700"
                                        )}>
                                            {post.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium line-clamp-3">
                                        {post.content || "Media Post"}
                                    </p>
                                    <div className="flex gap-1 flex-wrap">
                                        {post.destinations.map(dest => (
                                            <span
                                                key={dest.socialAccount.id}
                                                className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground"
                                            >
                                                {dest.socialAccount.platform}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
