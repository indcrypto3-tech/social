'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Clock, Video, Image as ImageIcon, Calendar as CalendarIcon, MoreHorizontal, Loader2 } from "lucide-react";
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
    parseISO,
    setHours,
    setMinutes
} from 'date-fns';
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { PageHeader } from "../components/page-header";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { updatePost, reschedulePost } from '../posts/actions'; // Ensure these are exported from actions.ts

// DnD Kit
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent, DragStartEvent } from '@dnd-kit/core';

type Post = {
    id: string;
    content: string | null;
    scheduledAt: Date;
    status: 'scheduled' | 'published' | 'failed' | 'draft' | string;
    mediaUrls?: string[] | null;
    destinations: {
        id?: string;
        socialAccount: {
            id?: string;
            platform: string;
            accountName: string | null;
        }
    }[];
};

// --- Components ---

function DraggablePost({ post, onClick }: { post: Post, onClick: (p: Post) => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: post.id,
        data: post
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
        opacity: isDragging ? 0.5 : 1,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={(e) => {
                // Prevent onClick if dragging
                if (!isDragging) onClick(post);
            }}
            className={cn(
                "text-[10px] truncate px-1.5 py-1 rounded-sm border shadow-sm font-medium flex items-center gap-1 cursor-grab active:cursor-grabbing hover:opacity-80 transition-all",
                post.status === 'published' ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" :
                    post.status === 'failed' ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800" :
                        "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
            )}
        >
            <div className={cn(
                "h-1.5 w-1.5 rounded-full shrink-0",
                post.status === 'published' ? "bg-green-500" :
                    post.status === 'failed' ? "bg-red-500" :
                        "bg-blue-500"
            )} />
            <span className="truncate flex-1">{post.content || "Media Only"}</span>
            {post.mediaUrls && post.mediaUrls.length > 0 && <ImageIcon className="h-3 w-3 opacity-50" />}
        </div>
    );
}

function DroppableDay({ date, children, isCurrentMonth, isSelected, onClick, isToday }: any) {
    const { setNodeRef, isOver } = useDroppable({
        id: date.toISOString(),
        data: { date }
    });

    return (
        <div
            ref={setNodeRef}
            onClick={onClick}
            className={cn(
                "min-h-[120px] border-b border-r transition-all p-2 flex flex-col gap-1 relative group",
                !isCurrentMonth && "bg-muted/5 text-muted-foreground/50",
                isSelected && "bg-primary/5",
                isOver && "bg-primary/10 ring-2 ring-inset ring-primary/30",
                "hover:bg-muted/50"
            )}
        >
            <div className="flex items-center justify-between mb-1">
                <span className={cn(
                    "text-sm font-medium h-7 w-7 rounded-full flex items-center justify-center transition-all",
                    isToday ? "bg-primary text-primary-foreground font-bold shadow-sm" :
                        isSelected ? "text-primary font-bold" : "text-muted-foreground",
                    isOver && "scale-110"
                )}>
                    {format(date, 'd')}
                </span>
                {isOver && <Badge variant="outline" className="text-[10px] h-5 px-1 bg-background">Drop here</Badge>}
            </div>
            <div className="flex flex-col gap-1.5 flex-1 w-full">
                {children}
            </div>
        </div>
    );
}

interface RawPost extends Omit<Post, 'scheduledAt'> {
    scheduledAt: string | Date;
}

export default function CalendarView({ posts }: { posts: RawPost[] }) {
    const { toast } = useToast();
    // Normalize dates
    const safePosts = useMemo(() => posts.map(p => ({
        ...p,
        scheduledAt: new Date(p.scheduledAt)
    })), [posts]);

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [activeId, setActiveId] = useState<string | null>(null);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Filter state
    const [filterPlatform, setFilterPlatform] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const startDate = startOfWeek(startOfMonth(currentMonth));
    const endDate = endOfWeek(endOfMonth(currentMonth));
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const today = new Date();

    const filteredPosts = useMemo(() => {
        return safePosts.filter(post => {
            if (filterStatus !== 'all' && post.status !== filterStatus) return false;
            if (filterPlatform !== 'all' && !post.destinations.some((d: any) => d.socialAccount.platform === filterPlatform)) return false;
            return true;
        });
    }, [safePosts, filterStatus, filterPlatform]);

    const getPostsForDay = (day: Date) => {
        return filteredPosts.filter(post => isSameDay(post.scheduledAt, day));
    };

    // DnD Handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const postId = active.id as string;
        const newDateIso = over.id as string;
        const newDate = new Date(newDateIso);

        // Use the original time, but new date
        const post = safePosts.find(p => p.id === postId);
        if (!post) return;

        if (isSameDay(post.scheduledAt, newDate)) return; // No change

        const updatedDate = setMinutes(setHours(newDate, post.scheduledAt.getHours()), post.scheduledAt.getMinutes());

        // Optimistic UI could be handled here if we had local state for posts, 
        // but for now we rely on server revalidation which is fast enough usually.

        try {
            await reschedulePost(postId, updatedDate);
            toast({ title: "Rescheduled", description: `Post moved to ${format(updatedDate, 'MMM d, yyyy')}` });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    // Edit Handlers
    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPost) return;
        setIsSaving(true);
        try {
            // We only support content & time edit in this simple modal
            await updatePost(editingPost.id, {
                content: editingPost.content || '',
                scheduledAt: editingPost.scheduledAt
            });
            setEditingPost(null);
            toast({ title: "Updated", description: "Post updated successfully" });
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const activePost = activeId ? safePosts.find(p => p.id === activeId) : null;

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
                <PageHeader heading="Content Calendar" text="View and manage user scheduled posts.">
                    <div className="flex items-center gap-2">
                        {/* Filters could go here */}
                        <select
                            className="h-8 rounded-md border text-xs bg-background px-2"
                            value={filterPlatform}
                            onChange={e => setFilterPlatform(e.target.value)}
                        >
                            <option value="all">All Platforms</option>
                            <option value="facebook">Facebook</option>
                            <option value="instagram">Instagram</option>
                            <option value="twitter">Twitter</option>
                            <option value="linkedin">LinkedIn</option>
                        </select>

                        <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
                        <div className="flex items-center rounded-md border bg-background shadow-sm">
                            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-none rounded-l-md border-r">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="px-4 font-semibold text-sm w-[140px] text-center">
                                {format(currentMonth, 'MMMM yyyy')}
                            </div>
                            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-none rounded-r-md border-l">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <Link href="/composer">
                            <Button size="sm" className="ml-2">
                                <Plus className="h-4 w-4 mr-2" />
                                New Post
                            </Button>
                        </Link>
                    </div>
                </PageHeader>

                <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
                    {/* Calendar Grid */}
                    <Card className="flex-1 flex flex-col h-full overflow-hidden shadow-sm border-muted">
                        <CardHeader className="p-0 shrink-0">
                            <div className="grid grid-cols-7 border-b bg-muted/30">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground">
                                        {day}
                                    </div>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-y-auto">
                            <div className="grid grid-cols-7 auto-rows-fr min-h-full">
                                {calendarDays.map((day) => {
                                    const dayPosts = getPostsForDay(day);
                                    const isSelected = isSameDay(day, selectedDate);
                                    const isCurrentMonth = isSameMonth(day, currentMonth);

                                    return (
                                        <DroppableDay
                                            key={day.toISOString()}
                                            date={day}
                                            isCurrentMonth={isCurrentMonth}
                                            isSelected={isSelected}
                                            isToday={isSameDay(day, today)}
                                            onClick={() => setSelectedDate(day)}
                                        >
                                            {dayPosts.map(post => (
                                                <DraggablePost
                                                    key={post.id}
                                                    post={post}
                                                    onClick={(p) => setEditingPost(p)}
                                                />
                                            ))}
                                            {/* Preview/More could stay similar */}
                                        </DroppableDay>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sidebar Details - can reuse logic or simplify */}
                    <Card className="hidden lg:flex w-80 h-full shrink-0 flex-col shadow-sm border-muted">
                        <CardHeader className="border-b shrink-0 py-4 px-6 bg-muted/10">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {format(selectedDate, 'EEEE, MMM d')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 overflow-y-auto flex-1 space-y-4">
                            {getPostsForDay(selectedDate).length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                        <Clock className="h-6 w-6 opacity-20" />
                                    </div>
                                    <p className="text-sm font-medium">No posts scheduled</p>
                                    <Button variant="link" size="sm" asChild className="mt-1 h-auto p-0 text-primary">
                                        <Link href="/composer">Schedule a post</Link>
                                    </Button>
                                </div>
                            ) : (
                                getPostsForDay(selectedDate).map(post => (
                                    <div key={post.id} onClick={() => setEditingPost(post)} className="group flex flex-col gap-3 p-3 rounded-lg border bg-card hover:bg-accent/40 hover:border-accent transition-all shadow-sm cursor-pointer">
                                        <div className="flex items-center justify-between">
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "px-2 py-0.5 h-6 text-[10px] uppercase tracking-wider font-semibold border",
                                                    post.status === 'published' ? "bg-green-100 text-green-700 border-green-200" :
                                                        post.status === 'failed' ? "bg-red-100 text-red-700 border-red-200" :
                                                            "bg-blue-50 text-blue-700 border-blue-100"
                                                )}
                                            >
                                                {post.status}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {format(post.scheduledAt, 'h:mm a')}
                                            </span>
                                        </div>
                                        <p className="text-sm line-clamp-3 leading-relaxed">
                                            {post.content || <span className="italic text-muted-foreground">No text content</span>}
                                        </p>
                                        <div className="flex flex-wrap gap-2 pt-2 border-t mt-1">
                                            {post.destinations.map((dest: any, i: number) => (
                                                <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50 border text-[10px] font-medium">
                                                    {dest.socialAccount?.platform}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <DragOverlay>
                    {activePost ? (
                        <div className="w-[150px] bg-background border rounded-md shadow-xl p-2 opacity-90 scale-105 pointer-events-none">
                            <span className="text-xs font-medium">{activePost.content || "Media"}</span>
                        </div>
                    ) : null}
                </DragOverlay>

                {/* Edit Modal */}
                <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Edit Post</DialogTitle>
                            <DialogDescription>
                                Make changes to your scheduled post.
                            </DialogDescription>
                        </DialogHeader>
                        {editingPost && (
                            <form onSubmit={handleSaveEdit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Content</Label>
                                    <Textarea
                                        defaultValue={editingPost.content || ''}
                                        onChange={e => setEditingPost({ ...editingPost, content: e.target.value })}
                                        className="h-32"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Schedule Time</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="datetime-local"
                                            value={format(editingPost.scheduledAt, "yyyy-MM-dd'T'HH:mm")}
                                            onChange={e => {
                                                const date = new Date(e.target.value);
                                                if (!isNaN(date.getTime())) {
                                                    setEditingPost({ ...editingPost, scheduledAt: date });
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setEditingPost(null)}>Cancel</Button>
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DndContext>
    );
}
