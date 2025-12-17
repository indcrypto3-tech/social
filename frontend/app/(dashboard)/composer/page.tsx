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
    Youtube
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createPost, getAccounts } from "./actions";
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
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState("12:00");
    const [content, setContent] = useState("");
    // Removed isGenerating and handleSmartGenerate
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    // Fetch accounts on mount
    useEffect(() => {
        getAccounts().then(setAccounts);
    }, []);


    const handleSubmit = async () => {
        if (selectedAccounts.length === 0) {
            toast({ title: "Error", description: "Please select at least one account", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('content', content);
        selectedAccounts.forEach(id => formData.append('accounts', id));

        if (date) {
            // Combine date and time
            const [hours, minutes] = time.split(':').map(Number);
            const scheduledDate = new Date(date);
            scheduledDate.setHours(hours);
            scheduledDate.setMinutes(minutes);
            formData.append('scheduledAt', scheduledDate.toISOString());
        }

        try {
            await createPost(formData);
            toast({ title: "Success", description: "Post scheduled successfully!" });
            // Reset form
            setContent("");
            setSelectedAccounts([]);
            setDate(new Date());
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
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
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <LinkIcon className="h-4 w-4" />
                                </Button>
                                <Separator orientation="vertical" className="h-6 mx-1" />
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <Smile className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <Hash className="h-4 w-4" />
                                </Button>
                                <div className="ml-auto">
                                    <AIToolbar
                                        currentContent={content}
                                        onContentChange={setContent}
                                    />
                                </div>
                            </div>

                            <Textarea
                                placeholder="What's on your mind?"
                                className="flex-1 min-h-[150px] text-lg border-none focus-visible:ring-0 resize-none p-6 shadow-none leading-relaxed bg-transparent"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />

                            <div className="p-4 border-t bg-muted/5">
                                <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group">
                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <ImageIcon className="h-5 w-5 text-muted-foreground/70" />
                                    </div>
                                    <span className="text-sm font-medium">Add Photos or Video</span>
                                    <span className="text-xs opacity-70">Drag and drop or click to upload</span>
                                </div>
                            </div>
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
                            <Button
                                onClick={() => accounts.length === 0 ? (window.location.href = '/accounts') : handleSubmit()}
                                disabled={isSubmitting}
                                size="lg"
                                className="px-8 shadow-md"
                            >
                                <Send className="mr-2 h-4 w-4" />
                                {accounts.length === 0 ? 'Connect Accounts' : (isSubmitting ? 'Scheduling...' : 'Schedule Post')}
                            </Button>
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
                                            <div className="h-48 bg-muted mx-4 mb-4 rounded-lg border flex items-center justify-center text-xs text-muted-foreground">
                                                Image / Video Preview
                                            </div>
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
