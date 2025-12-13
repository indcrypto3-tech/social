
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TopPosts() {
    // Mock data for top posts since we don't have per-post analytics storage
    const posts = [
        { id: 1, content: "Launching our new AI features today! 🚀", likes: 1240, comments: 56, platform: "Twitter" },
        { id: 2, content: "Behind the scenes at the office.", likes: 890, comments: 32, platform: "Instagram" },
        { id: 3, content: "5 tips for better productivity.", likes: 650, comments: 12, platform: "LinkedIn" },
        { id: 4, content: "Our monthly update video is live.", likes: 430, comments: 28, platform: "YouTube" },
    ];

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Top Performing Posts</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {posts.map((post) => (
                        <div key={post.id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback>{post.platform[0]}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none truncate max-w-[200px]">{post.content}</p>
                                <p className="text-sm text-muted-foreground">
                                    {post.platform}
                                </p>
                            </div>
                            <div className="ml-auto font-medium">
                                +{post.likes} likes
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
