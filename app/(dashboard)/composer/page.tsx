
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Clock, Image as ImageIcon, Send, Wand2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ComposerPage() {
    const [date, setDate] = useState<Date>();
    const [content, setContent] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleSmartGenerate = async () => {
        setIsGenerating(true);
        // Simulate AI delay
        setTimeout(() => {
            setContent("Just launched our new product! 🚀 #LaunchDay #SaaS #Growth");
            setIsGenerating(false);
        }, 1500);
    }

    return (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">

            {/* Compose Area */}
            <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">New Post</h1>
                    <Button variant="outline" size="sm" onClick={handleSmartGenerate} disabled={isGenerating}>
                        <Wand2 className={cn("mr-2 h-4 w-4", isGenerating && "animate-spin")} />
                        {isGenerating ? "Generating..." : "AI Assist"}
                    </Button>
                </div>

                <Card className="h-full flex flex-col">
                    <CardContent className="p-4 flex-1 flex flex-col gap-4">
                        <div className="space-y-2 flex-1">
                            <Label className="sr-only">Post Content</Label>
                            <Textarea
                                placeholder="What's on your mind?"
                                className="min-h-[200px] text-lg border-none focus-visible:ring-0 resize-none p-0"
                                value={content}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                            />
                        </div>

                        {/* Media Placeholder */}
                        <div className="border-2 border-dashed rounded-lg h-32 flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer">
                            <div className="flex flex-col items-center gap-2">
                                <ImageIcon className="h-6 w-6" />
                                <span className="text-sm">Add Photos or Video</span>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="flex items-center justify-between pt-4 border-t mt-auto">
                            <div className="flex items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Button variant="ghost" size="icon">
                                    <Clock className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button>
                                <Send className="mr-2 h-4 w-4" />
                                Schedule
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Preview Area */}
            <div className="md:col-span-1 space-y-4">
                <h2 className="text-lg font-semibold">Preview</h2>
                <Card className="bg-muted/30">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200" />
                            <div>
                                <div className="h-3 w-24 bg-gray-200 rounded mb-1" />
                                <div className="h-2 w-16 bg-gray-200 rounded" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            {content ? (
                                <p className="text-sm whitespace-pre-wrap">{content}</p>
                            ) : (
                                <>
                                    <div className="h-3 w-full bg-gray-200 rounded" />
                                    <div className="h-3 w-3/4 bg-gray-200 rounded" />
                                </>
                            )}
                        </div>
                        <div className="h-40 bg-gray-200 rounded w-full" />
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
