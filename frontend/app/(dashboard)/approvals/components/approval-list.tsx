"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { approvePost, rejectPost } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Check, X, Loader2, Calendar } from "lucide-react";
import Image from "next/image";

interface ApprovalListProps {
    posts: any[];
}

export function ApprovalList({ posts }: ApprovalListProps) {
    const { toast } = useToast();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleApprove = async (id: string) => {
        setProcessingId(id);
        const res = await approvePost(id);
        if (res?.error) {
            toast({
                title: "Approval failed",
                description: res.error,
                variant: "destructive"
            });
        } else {
            toast({
                variant: "success", // Ensure 'success' variant exists in toast logic or use default
                title: "Post Approved",
                description: "The post has been scheduled."
            });
        }
        setProcessingId(null);
    };

    const handleReject = async (id: string) => {
        setProcessingId(id);
        const res = await rejectPost(id);
        if (res?.error) {
            toast({
                title: "Rejection failed", // Spec said "Approval failed", but logic applies
                description: res.error,
                variant: "destructive"
            });
        } else {
            toast({
                title: "Post Rejected",
                description: "Access post in drafts to edit."
            });
        }
        setProcessingId(null);
    };

    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/10">
                <p className="text-muted-foreground">No posts waiting for approval.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
                <Card key={post.id} className="flex flex-col">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-1 flex-wrap">
                                {post.destinations?.map((d: any, i: number) => (
                                    <Badge key={i} variant="outline">{d.socialAccount.platform}</Badge>
                                ))}
                            </div>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-3">
                        {post.mediaUrls && post.mediaUrls.length > 0 && (
                            <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                                <Image
                                    src={post.mediaUrls[0]}
                                    alt="Post media"
                                    fill
                                    className="object-cover"
                                />
                                {post.mediaUrls.length > 1 && (
                                    <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                                        +{post.mediaUrls.length - 1}
                                    </div>
                                )}
                            </div>
                        )}
                        <p className="text-sm dark:text-gray-300 line-clamp-4">
                            {post.content || <span className="italic text-muted-foreground">No text content</span>}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                            <Calendar className="h-3 w-3" />
                            {post.scheduledAt ? format(new Date(post.scheduledAt), "PPP p") : "Unscheduled"}
                        </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex gap-2 justify-end border-t p-4 mt-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleReject(post.id)}
                            disabled={!!processingId}
                        >
                            {processingId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
                            Reject
                        </Button>
                        <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleApprove(post.id)}
                            disabled={!!processingId}
                        >
                            {processingId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                            Approve
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
