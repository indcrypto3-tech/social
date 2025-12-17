
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Hash, Lightbulb, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { generateCaptionAction, generateHashtagsAction, generateContentIdeasAction } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
// import { Tone } from "@/lib/ai/caption-generator";
export type Tone = "Professional" | "Casual" | "Viral" | "Storytelling" | "Minimal";

interface AIToolbarProps {
    onContentChange: (content: string) => void;
    currentContent: string;
    className?: string;
}

export function AIToolbar({ onContentChange, currentContent, className }: AIToolbarProps) {
    const { toast } = useToast();

    // States for features
    const [isCaptionOpen, setIsCaptionOpen] = useState(false);
    const [isHashtagOpen, setIsHashtagOpen] = useState(false);
    const [isIdeasOpen, setIsIdeasOpen] = useState(false);

    // Loaders
    const [loading, setLoading] = useState(false);

    // Caption Gen State
    const [captionPrompt, setCaptionPrompt] = useState("");
    const [captionPlatform, setCaptionPlatform] = useState("Twitter");
    const [captionTone, setCaptionTone] = useState<Tone>("Professional");
    const [generatedCaption, setGeneratedCaption] = useState("");

    // Hashtag Gen State
    const [hashtagNiche, setHashtagNiche] = useState("");
    const [hashtagPlatform, setHashtagPlatform] = useState("Instagram");
    const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);

    // Ideas Gen State
    const [ideaNiche, setIdeaNiche] = useState("");
    const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);

    const handleGenerateCaption = async () => {
        if (!captionPrompt) return;
        setLoading(true);
        try {
            const result = await generateCaptionAction(captionPrompt, captionPlatform, captionTone);
            setGeneratedCaption(result);
        } catch (error) {
            toast({ title: "Error", description: "Failed to generate caption", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleUseCaption = () => {
        onContentChange(generatedCaption);
        setIsCaptionOpen(false);
        setGeneratedCaption("");
        setCaptionPrompt("");
    };

    const handleGenerateHashtags = async () => {
        // If we have content, use it as part of context, but mainly we need niche
        const context = currentContent || captionPrompt; // Fallback
        if (!hashtagNiche && !context) {
            toast({ title: "Input required", description: "Please enter a niche or have some content written.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const result = await generateHashtagsAction(context, hashtagPlatform, hashtagNiche || "General");
            setGeneratedHashtags(result);
        } catch (error) {
            toast({ title: "Error", description: "Failed to generate hashtags", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleAddHashtags = () => {
        const tagsString = generatedHashtags.join(" ");
        const newContent = currentContent ? `${currentContent}\n\n${tagsString}` : tagsString;
        onContentChange(newContent);
        setIsHashtagOpen(false);
        setGeneratedHashtags([]);
    };

    const handleGenerateIdeas = async () => {
        if (!ideaNiche) return;
        setLoading(true);
        try {
            const result = await generateContentIdeasAction(ideaNiche);
            setGeneratedIdeas(result);
        } catch (error) {
            toast({ title: "Error", description: "Failed to generate ideas", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleUseIdea = (idea: string) => {
        // Determine if we should replace or append. Usually ideas are starting points.
        setCaptionPrompt(idea); // Pre-fill caption prompt?
        // Or just set content
        onContentChange(idea);
        setIsIdeasOpen(false);
        // Also maybe open caption generator with this idea?
        // For now simple use
    };

    return (
        <div className={cn("flex items-center gap-2 p-2", className)}>
            {/* Caption Generator */}
            <Dialog open={isCaptionOpen} onOpenChange={setIsCaptionOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 text-violet-600 border-violet-200 hover:bg-violet-50">
                        <Sparkles className="w-4 h-4" />
                        AI Caption
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>AI Caption Generator</DialogTitle>
                        <DialogDescription>Create engaging captions in seconds.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>What is this post about?</Label>
                            <Textarea
                                placeholder="Ex: Launching our new SaaS analytics dashboard..."
                                value={captionPrompt}
                                onChange={(e) => setCaptionPrompt(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Platform</Label>
                                <Select value={captionPlatform} onValueChange={setCaptionPlatform}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Twitter">Twitter</SelectItem>
                                        <SelectItem value="Instagram">Instagram</SelectItem>
                                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                        <SelectItem value="Facebook">Facebook</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Tone</Label>
                                <Select value={captionTone} onValueChange={(v: any) => setCaptionTone(v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Professional">Professional</SelectItem>
                                        <SelectItem value="Casual">Casual</SelectItem>
                                        <SelectItem value="Viral">Viral</SelectItem>
                                        <SelectItem value="Storytelling">Storytelling</SelectItem>
                                        <SelectItem value="Minimal">Minimal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {generatedCaption && (
                            <div className="mt-2 p-3 bg-muted rounded-md text-sm border relative group">
                                {generatedCaption}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                        navigator.clipboard.writeText(generatedCaption);
                                        toast({ title: "Copied!" });
                                    }}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        {generatedCaption ? (
                            <div className="flex w-full justify-between">
                                <Button variant="ghost" onClick={() => setGeneratedCaption("")}>Back</Button>
                                <Button onClick={handleUseCaption}>Use Caption</Button>
                            </div>
                        ) : (
                            <Button onClick={handleGenerateCaption} disabled={loading || !captionPrompt}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Generate
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Hashtag Generator */}
            <Dialog open={isHashtagOpen} onOpenChange={setIsHashtagOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 text-pink-600 border-pink-200 hover:bg-pink-50">
                        <Hash className="w-4 h-4" />
                        Hashtags
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>AI Hashtag Generator</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Niche / Topic</Label>
                            <Input
                                placeholder="Ex: SaaS, Marketing, AI"
                                value={hashtagNiche}
                                onChange={(e) => setHashtagNiche(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Platform</Label>
                            <Select value={hashtagPlatform} onValueChange={setHashtagPlatform}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Instagram">Instagram</SelectItem>
                                    <SelectItem value="Twitter">Twitter</SelectItem>
                                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {generatedHashtags.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-md border min-h-[60px]">
                                {generatedHashtags.map(tag => (
                                    <span key={tag} className="text-xs bg-background border px-2 py-1 rounded-full text-blue-600">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        {generatedHashtags.length > 0 ? (
                            <div className="flex w-full justify-between">
                                <Button variant="ghost" onClick={() => setGeneratedHashtags([])}>Reset</Button>
                                <Button onClick={handleAddHashtags}>Append to Post</Button>
                            </div>
                        ) : (
                            <Button onClick={handleGenerateHashtags} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Generate Tags
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Ideas Generator */}
            <Dialog open={isIdeasOpen} onOpenChange={setIsIdeasOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50">
                        <Lightbulb className="w-4 h-4" />
                        Ideas
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Content Ideas</DialogTitle>
                        <DialogDescription>Get inspired with viral-worthy post concepts.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter your industry or niche..."
                                value={ideaNiche}
                                onChange={(e) => setIdeaNiche(e.target.value)}
                            />
                            <Button onClick={handleGenerateIdeas} disabled={loading || !ideaNiche}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get Ideas"}
                            </Button>
                        </div>

                        <div className="space-y-2 mt-2 max-h-[300px] overflow-y-auto">
                            {generatedIdeas.map((idea, i) => (
                                <div key={i} className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors flex items-start gap-3 group" onClick={() => handleUseIdea(idea)}>
                                    <div className="bg-primary/10 text-primary h-6 w-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">
                                        {i + 1}
                                    </div>
                                    <p className="text-sm flex-1">{idea}</p>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                        <Check className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {generatedIdeas.length === 0 && !loading && (
                                <div className="text-center text-muted-foreground py-8">
                                    Enter a niche to start generating ideas.
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
