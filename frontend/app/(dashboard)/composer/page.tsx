"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Calendar as CalendarIcon,
    Clock,
    Image as ImageIcon,
    Send,
    Wand2,
    X,
    Bold,
    Italic,
    Link as LinkIcon,
    Smile,
    Hash,
    Facebook,
    Instagram,
    Linkedin,
    Twitter,
    Youtube,
    FileText,
    Zap,
    Trash2
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createPost, getAccounts, postNow } from "./actions";
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "../components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MediaPicker, MediaItem } from "@/components/media/media-picker-dialog";
import Image from "next/image";

type Account = {
    id: string;
    platform: string;
    accountName: string | null;
}

const platformIcons: Record<string, any> = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
    tiktok: () => <span className="text-[10px] font-bold">TT</span> // Fallback
};

const platformColors: Record<string, string> = {
    facebook: 'text-blue-600',
    instagram: 'text-pink-600',
    twitter: 'text-black dark:text-white',
    linkedin: 'text-blue-700',
    youtube: 'text-red-600',
    tiktok: 'text-black dark:text-white'
};

import { AIToolbar } from "./components/ai-toolbar";

export default function ComposerPage() {
    const [date, setDate] = useState<Date | undefined>();
    const [time, setTime] = useState("12:00");
    const [content, setContent] = useState("");
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
    const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    // Fetch accounts on mount
    useEffect(() => {
        getAccounts().then(setAccounts);
    }, []);

    const handleMediaSelect = (items: MediaItem[]) => {
        setSelectedMedia(prev => {
            // Combine and dedup
            const combined = [...prev, ...items];
            const unique = combined.filter((item, index, self) =>
                index === self.findIndex((t) => t.id === item.id)
            );
            return unique;
        });
    };

    const removeMedia = (id: string) => {
        setSelectedMedia(prev => prev.filter(m => m.id !== id));
    };

    const handleSubmit = async (action: 'schedule' | 'draft' | 'now') => {
        if (selectedAccounts.length === 0) {
            toast({ title: "Validation Error", description: "Please select at least one account", variant: "destructive" });
            return;
        }

        if (!content.trim() && selectedMedia.length === 0) {
            toast({ title: "Validation Error", description: "Post content or media is required.", variant: "destructive" });
            return;
        }

        if (action === 'schedule' && !date) {
            toast({ title: "Date required", description: "Please select a date for scheduling.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('content', content);
        selectedAccounts.forEach(id => formData.append('accounts', id));
        selectedMedia.forEach(m => formData.append('mediaUrls', m.url));

        if (action === 'schedule' && date) {
            const [hours, minutes] = time.split(':').map(Number);
            const scheduledDate = new Date(date);
            scheduledDate.setHours(hours);
            scheduledDate.setMinutes(minutes);
            formData.append('scheduledAt', scheduledDate.toISOString());
        }

        try {
            const post = await createPost(formData) as { id: string };

            if (action === 'now') {
                // Trigger post now
                await postNow(post.id);
                toast({ variant: 'success', title: "Post Created", description: "Your post is being published now." });
            } else if (action === 'draft') {
                toast({ variant: 'success', title: "Draft Saved", description: "Your post has been saved as a draft." });
            } else {
                toast({ variant: 'success', title: "Post Scheduled", description: "Your post has been scheduled successfully." });
            }

            // Reset form
            setContent("");
            setSelectedAccounts([]);
            setSelectedMedia([]);
            setDate(undefined);
        } catch (error: any) {
            toast({ title: "Failed to create post", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }

    const toggleAccount = (id: string) => {
        setSelectedAccounts(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    }

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-6">
            <PageHeader heading="Create Post" text="Compose and schedule content across multiple platforms." />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full min-h-0">
                {/* Compose Area */}
                <div className="lg:col-span-2 flex flex-col gap-4 h-full min-h-0">
                    <Card className="flex-1 flex flex-col overflow-hidden shadow-md border-muted">
                        <CardHeader className="p-4 border-b bg-muted/20 pb-2">
                            <div className="flex items-center justify-between mb-4">
                                <Label className="font-semibold text-base">Select Accounts</Label>
                                <span className="text-xs text-muted-foreground">{selectedAccounts.length} selected</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {accounts.length === 0 ? (
                                    <div className="text-sm text-muted-foreground p-2 border border-dashed rounded w-full text-center">
                                        No accounts connected. <Button variant="link" className="p-0 h-auto" onClick={() => window.location.href = '/accounts'}>Connect one</Button>
                                    </div>
                                ) : accounts.map(acc => {
                                    const Icon = platformIcons[acc.platform.toLowerCase()] || Smile;
                                    const isSelected = selectedAccounts.includes(acc.id);
                                    return (
                                        <div
                                            key={acc.id}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all min-w-[140px] select-none shadow-sm hover:shadow-md",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground border-primary ring-1 ring-primary ring-offset-1"
                                                    : "bg-background hover:bg-muted text-muted-foreground"
                                            )}
                                            onClick={() => toggleAccount(acc.id)}
                                        >
                                            <Icon className={cn("h-4 w-4", isSelected ? "text-primary-foreground" : platformColors[acc.platform.toLowerCase()])} />
                                            <span className="text-sm font-medium truncate">{acc.accountName || acc.platform}</span>
                                            {isSelected && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                        </div>
                                    )
                                })}
                            </div>
                        </CardHeader>

                        <CardContent className="p-0 flex-1 flex flex-col relative bg-card">
                            {/* Editor Toolbar */}
                            <div className="flex items-center gap-1 p-2 border-b bg-muted/10">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <Bold className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <Italic className="h-4 w-4" />
                                </Button>
                                <Separator orientation="vertical" className="h-6 mx-1" />
                                <div className="ml-auto">
                                    <AIToolbar
                                        currentContent={content}
                                        onContentChange={setContent}
                                    />
                                </div>
                            </div>

                            <Textarea
                                placeholder="What's on your mind? (Use A.I. to help you write!)"
                                className="flex-1 min-h-[150px] text-lg border-none focus-visible:ring-0 resize-none p-6 shadow-none leading-relaxed bg-transparent"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />

                            {/* Media Preview Grid */}
                            {selectedMedia.length > 0 && (
                                <div className="px-6 pb-4">
                                    <div className="grid grid-cols-4 gap-2">
                                        {selectedMedia.map(item => (
                                            <div key={item.id} className="relative aspect-square rounded-md overflow-hidden bg-muted group">
                                                {item.fileType?.startsWith('video') ? (
                                                    <video src={item.url} className="object-cover w-full h-full" />
                                                ) : (
                                                    <Image src={item.url} alt="media" fill className="object-cover" />
                                                )}
                                                <Button
                                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    size="icon"
                                                    variant="destructive"
                                                    onClick={() => removeMedia(item.id)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                        <MediaPicker onSelect={handleMediaSelect} trigger={
                                            <div className="aspect-square rounded-md border border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                                                <span className="text-xs text-muted-foreground">+ Add</span>
                                            </div>
                                        } />
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center px-4 pb-2">
                                <span className={cn("text-xs", content.length > 280 ? "text-red-500 font-bold" : "text-muted-foreground")}>
                                    {content.length} characters
                                </span>
                            </div>

                            {selectedMedia.length === 0 && (
                                <div className="p-4 border-t bg-muted/5">
                                    <MediaPicker
                                        onSelect={handleMediaSelect}
                                        trigger={
                                            <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group w-full">
                                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                    <ImageIcon className="h-5 w-5 text-muted-foreground/70" />
                                                </div>
                                                <span className="text-sm font-medium">Add Photos or Video</span>
                                                <span className="text-xs opacity-70">Browse Library or Upload</span>
                                            </div>
                                        }
                                    />
                                </div>
                            )}
                        </CardContent>

                        {/* Scheduling Toolbar */}
                        <div className="p-4 border-t bg-background flex items-center justify-between shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.05)] z-10">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-md border">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="sm" className={cn("h-auto p-0 hover:bg-transparent justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {date ? format(date, "MMM d, yyyy") : <span>Pick a date</span>}
                                                {date && <X className="ml-2 h-3 w-3 hover:text-destructive cursor-pointer" onClick={(e) => { e.stopPropagation(); setDate(undefined); }} />}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Separator orientation="vertical" className="h-4" />
                                    <Select value={time} onValueChange={setTime}>
                                        <SelectTrigger className="w-[80px] h-auto border-none shadow-none bg-transparent p-0 focus:ring-0 text-sm">
                                            <SelectValue placeholder="Time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 24 * 2 }).map((_, i) => {
                                                const hour = Math.floor(i / 2);
                                                const minute = (i % 2) * 30;
                                                const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                                                return <SelectItem key={timeStr} value={timeStr}>{timeStr}</SelectItem>
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    disabled={isSubmitting}
                                    onClick={() => handleSubmit('draft')}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Save Draft
                                </Button>

                                {date ? (
                                    <Button
                                        onClick={() => handleSubmit('schedule')}
                                        disabled={isSubmitting || accounts.length === 0}
                                        className="shadow-md"
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        {isSubmitting ? 'Scheduling...' : 'Schedule'}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handleSubmit('now')}
                                        disabled={isSubmitting || accounts.length === 0}
                                        className="bg-green-600 hover:bg-green-700 text-white shadow-md"
                                    >
                                        <Zap className="mr-2 h-4 w-4" />
                                        {isSubmitting ? 'Posting...' : 'Post Now'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Preview Area */}
                <div className="lg:col-span-1 flex flex-col gap-4 h-full min-h-0 overflow-hidden">
                    <Card className="h-full flex flex-col overflow-hidden bg-muted/10 border-none shadow-inner">
                        <CardHeader className="pb-3 bg-transparent">
                            <CardTitle className="text-base flex items-center gap-2">
                                <span className="bg-primary/10 p-1.5 rounded-md text-primary"><ImageIcon className="h-4 w-4" /></span>
                                Live Preview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-thin scrollbar-thumb-muted">
                            {selectedAccounts.length === 0 ? (
                                <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg bg-background/50 m-2">
                                    <p>Select an account to preview</p>
                                </div>
                            ) : (
                                accounts.filter(a => selectedAccounts.includes(a.id)).map(acc => {
                                    const Icon = platformIcons[acc.platform.toLowerCase()] || Smile;
                                    const pColor = platformColors[acc.platform.toLowerCase()];
                                    return (
                                        <div key={acc.id} className="bg-background rounded-xl shadow-sm border overflow-hidden">
                                            <div className="p-3 flex items-start gap-3 border-b bg-muted/5">
                                                <Avatar className="h-9 w-9 border">
                                                    <AvatarImage src="/placeholder-avatar.jpg" />
                                                    <AvatarFallback>{acc.accountName?.[0] || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm font-semibold truncate">{acc.accountName || acc.platform}</span>
                                                        <Icon className={cn("h-3 w-3", pColor)} />
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground">Just now • Public</p>
                                                </div>
                                            </div>
                                            <div className="p-4 text-sm whitespace-pre-wrap leading-relaxed">
                                                {content || <span className="text-muted-foreground italic">Your caption here...</span>}
                                            </div>
                                            {selectedMedia.length > 0 && (
                                                <div className="bg-muted border-t">
                                                    {selectedMedia[0].fileType?.startsWith('video') ? (
                                                        <video src={selectedMedia[0].url} className="w-full h-auto" controls />
                                                    ) : (
                                                        <div className="relative aspect-video">
                                                            <Image src={selectedMedia[0].url} alt="media" fill className="object-cover" />
                                                            {selectedMedia.length > 1 && (
                                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
                                                                    +{selectedMedia.length - 1}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
