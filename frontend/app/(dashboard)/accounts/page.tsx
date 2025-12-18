
"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter
} from "@/components/ui/card";
import { Plus, Facebook, Instagram, Linkedin, Twitter, Youtube, Video, CheckCircle, AlertCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { PageHeader } from "../components/page-header";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Provider } from "@supabase/supabase-js";

const platforms = [
    {
        id: 'facebook',
        name: 'Facebook',
        icon: Facebook,
        color: 'text-blue-600',
        bg: 'bg-blue-600/10'
    },
    {
        id: 'instagram',
        name: 'Instagram',
        icon: Instagram,
        color: 'text-pink-600',
        bg: 'bg-pink-600/10'
    },
    {
        id: 'twitter',
        name: 'X (Twitter)',
        icon: Twitter,
        color: 'text-black dark:text-white',
        bg: 'bg-black/10 dark:bg-white/10'
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: Linkedin,
        color: 'text-blue-700',
        bg: 'bg-blue-700/10'
    },
    {
        id: 'youtube',
        name: 'YouTube',
        icon: Youtube,
        color: 'text-red-600',
        bg: 'bg-red-600/10'
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        icon: Video, // TikTok icon not available in default Lucide set yet
        color: 'text-black dark:text-white',
        bg: 'bg-gray-500/10'
    }
]

export default function AccountsPage() {
    const connectedAccounts: any[] = []; // Fetch from API later

    const supabase = createClient(); // Use factory to ensure proper browser client instance

    const handleConnect = async (platformId: string) => {
        // Special handling for Twitter/X via Backend OAuth 2.0 Flow
        if (platformId === 'twitter') {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !session) {
                    alert("Please log in to connect accounts.");
                    return;
                }

                const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
                const response = await fetch(`${apiUrl}/oauth/twitter/start`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Failed to start Twitter OAuth');
                }

                const data = await response.json();
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    throw new Error("No redirect URL returned from backend");
                }
            } catch (err: any) {
                console.error("Twitter Connect Error:", err);
                alert(`Connection failed: ${err.message}`);
            }
            return;
        }

        let provider: Provider;
        let scopes: string | undefined;

        switch (platformId) {
            case 'facebook':
                provider = 'facebook'
                scopes = 'pages_show_list,pages_read_engagement,pages_manage_posts'
                break
            case 'instagram':
                provider = 'instagram' as Provider
                scopes = 'instagram_basic,instagram_content_publish'
                break
            case 'linkedin':
                provider = 'linkedin'
                scopes = 'w_member_social,r_liteprofile'
                break
            case 'youtube':
                provider = 'google'
                scopes = 'https://www.googleapis.com/auth/youtube.readonly,https://www.googleapis.com/auth/youtube.upload'
                break
            case 'tiktok':
                console.warn("TikTok connection requested but not natively supported via Supabase yet.")
                alert("TikTok integration coming soon")
                return
            default:
                console.error(`Unknown platform: ${platformId}`)
                alert(`Platform ${platformId} not supported`)
                return
        }

        console.log(`[Connect] Initiating client-side OAuth for ${platformId}`)

        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/accounts`,
                    scopes: scopes,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                    skipBrowserRedirect: true, // Force manual redirect to debug and prevent auto-redirect issues
                },
            })

            if (error) {
                console.error("OAuth Error:", error)
                alert(`Failed to initiate connection: ${error.message}`)
                return
            }

            if (data?.url) {
                console.log(`[Connect] Redirecting to: ${data.url}`)
                window.location.href = data.url
            } else {
                console.error("OAuth Error: No redirect URL returned")
                alert("Failed to generate authorization URL")
            }

        } catch (err) {
            console.error("Unexpected error:", err)
            alert("An unexpected error occurred.")
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <PageHeader heading="Connected Accounts" text="Manage your social media connections and permissions.">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Connect Account
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Connect a Social Account</DialogTitle>
                            <DialogDescription>
                                Choose a platform to connect to your scheduler.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            {platforms.map((platform) => (
                                <Button
                                    key={platform.id}
                                    variant="outline"
                                    className="h-24 flex flex-col gap-3 hover:bg-muted/50 border-muted-foreground/20 hover:border-primary/50 transition-all"
                                    onClick={() => handleConnect(platform.id)}
                                >
                                    <div className={cn("h-10 w-10 flex items-center justify-center rounded-full", platform.bg)}>
                                        <platform.icon className={cn("h-5 w-5", platform.color)} />
                                    </div>
                                    <span className="font-medium">{platform.name}</span>
                                </Button>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            </PageHeader>

            {connectedAccounts.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed bg-muted/20">
                    <div className="p-4 bg-background rounded-full mb-4 shadow-sm">
                        <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">No accounts connected</h3>
                    <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                        Connect your social media profiles to start scheduling posts across multiple platforms.
                    </p>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="lg">
                                Connect Your First Account
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Connect a Social Account</DialogTitle>
                                <DialogDescription>
                                    Choose a platform to connect to your scheduler.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                                {platforms.map((platform) => (
                                    <Button
                                        key={platform.id}
                                        variant="outline"
                                        className="h-24 flex flex-col gap-3 hover:bg-muted/50 border-muted-foreground/20 hover:border-primary/50 transition-all"
                                        onClick={() => handleConnect(platform.id)}
                                    >
                                        <div className={cn("h-10 w-10 flex items-center justify-center rounded-full", platform.bg)}>
                                            <platform.icon className={cn("h-5 w-5", platform.color)} />
                                        </div>
                                        <span className="font-medium">{platform.name}</span>
                                    </Button>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {connectedAccounts.map((account, idx) => (
                        <Card key={idx} className="overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/10 border-b">
                                <CardTitle className="text-sm font-medium">
                                    {account.platform}
                                </CardTitle>
                                {account.status === 'connected' ? (
                                    <Badge variant="default" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Active</Badge>
                                ) : (
                                    <Badge variant="destructive">Error</Badge>
                                )}
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                        {/* Dynamic Icon would go here */}
                                        <CheckCircle className="h-6 w-6 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg">{account.name}</p>
                                        <p className="text-sm text-muted-foreground">@{account.username}</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/5 border-t p-3">
                                <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-destructive">
                                    Disconnect
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
