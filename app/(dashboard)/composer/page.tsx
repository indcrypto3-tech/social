"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Clock, Image as ImageIcon, Send, Wand2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createPost, getAccounts } from "./actions";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox";

type Account = {
    id: string;
    platform: string;
    accountName: string | null;
}

export default function ComposerPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState("12:00");
    const [content, setContent] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    // Fetch accounts on mount
    useEffect(() => {
        getAccounts().then(setAccounts);
    }, []);

    const handleSmartGenerate = async () => {
        setIsGenerating(true);
        // Simulate AI delay
        setTimeout(() => {
            setContent("Just launched our new product! 🚀 #LaunchDay #SaaS #Growth");
            setIsGenerating(false);
        }, 1500);
    }

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
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">

            {/* Compose Area */}
            <div className="md:col-span-2 space-y-4 flex flex-col h-full">
                <div className="flex items-center justify-between shrink-0">
                    <h1 className="text-2xl font-bold">New Post</h1>
                    <Button variant="outline" size="sm" onClick={handleSmartGenerate} disabled={isGenerating}>
                        <Wand2 className={cn("mr-2 h-4 w-4", isGenerating && "animate-spin")} />
                        {isGenerating ? "Generating..." : "AI Assist"}
                    </Button>
                </div>

                <Card className="flex-1 flex flex-col overflow-hidden">
                    <CardContent className="p-0 flex-1 flex flex-col h-full">

                        {/* Account Selection Bar */}
                        <div className="p-4 border-b bg-muted/40 flex gap-2 overflow-x-auto">
                            {accounts.length === 0 ? (
                                <span className="text-sm text-muted-foreground">No accounts connected. Go to Accounts page.</span>
                            ) : accounts.map(acc => (
                                <div
                                    key={acc.id}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors text-sm font-medium select-none",
                                        selectedAccounts.includes(acc.id)
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background hover:bg-muted"
                                    )}
                                    onClick={() => toggleAccount(acc.id)}
                                >
                                    <div className={cn("w-2 h-2 rounded-full", {
                                        'bg-blue-600': acc.platform === 'facebook',
                                        'bg-pink-600': acc.platform === 'instagram',
                                        'bg-black': acc.platform === 'twitter' || acc.platform === 'tiktok',
                                        'bg-blue-700': acc.platform === 'linkedin',
                                        'bg-red-600': acc.platform === 'youtube',
                                    })} />
                                    {acc.platform}
                                </div>
                            ))}
                        </div>

                        <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
                            <Textarea
                                placeholder="What's on your mind?"
                                className="flex-1 min-h-[150px] text-lg border-none focus-visible:ring-0 resize-none p-0 shadow-none"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />

                            {/* Media Preview (Mock) */}
                            {/* <div className="grid grid-cols-4 gap-2">
                                 {selectedMedia.map...}
                            </div> */}

                            <div className="border-2 border-dashed rounded-lg p-8 flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer shrink-0">
                                <div className="flex flex-col items-center gap-2">
                                    <ImageIcon className="h-6 w-6" />
                                    <span className="text-sm font-medium">Add Photos or Video</span>
                                </div>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="p-4 border-t bg-background mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}>
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

                                <Select value={time} onValueChange={setTime}>
                                    <SelectTrigger className="w-[120px]">
                                        <Clock className="mr-2 h-4 w-4" />
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
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                <Send className="mr-2 h-4 w-4" />
                                {isSubmitting ? 'Scheduling...' : 'Schedule Post'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Preview Area */}
            <div className="md:col-span-1 space-y-4">
                <h2 className="text-lg font-semibold">Preview</h2>
                <Card className="bg-muted/30 border-dashed h-full max-h-[600px] overflow-y-auto">
                    <CardContent className="p-4 space-y-6">
                        {selectedAccounts.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                                Select an account to see preview
                            </div>
                        ) : (
                            accounts.filter(a => selectedAccounts.includes(a.id)).map(acc => (
                                <div key={acc.id} className="bg-background rounded-lg shadow-sm p-4 border space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                            {acc.platform[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold">{acc.accountName || acc.platform}</div>
                                            <div className="text-xs text-muted-foreground">Just now</div>
                                        </div>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap">{content || "Your post content..."}</p>
                                    {/* Media preview would go here */}
                                    <div className="h-32 bg-muted rounded w-full flex items-center justify-center text-xs text-muted-foreground">
                                        Media Preview
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
