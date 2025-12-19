
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
import { Plus, Facebook, Instagram, Linkedin, Twitter, Youtube, Video, CheckCircle, AlertCircle, RefreshCw, XCircle } from "lucide-react";
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
import { useSearchParams } from "next/navigation";
import React, { useEffect, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

// Platform configurations
const platforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-600/10' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-600/10' },
    { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: 'text-black dark:text-white', bg: 'bg-black/10 dark:bg-white/10' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', bg: 'bg-blue-700/10' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-600', bg: 'bg-red-600/10' },
    { id: 'tiktok', name: 'TikTok', icon: Video, color: 'text-black dark:text-white', bg: 'bg-gray-500/10' }
];

function AccountStatusListener() {
    const searchParams = useSearchParams();
    const { toast } = useToast();

    useEffect(() => {
        const error = searchParams.get("error");
        const success = searchParams.get("success");

        if (error) {
            toast({
                variant: "destructive",
                title: "Connection Error",
                description: error,
            });
            window.history.replaceState({}, '', '/dashboard/accounts');
        }

        if (success) {
            const platform = searchParams.get("platform");
            const limited = searchParams.get("limited");

            toast({
                title: "Account Connected",
                description: platform === 'twitter' && limited === 'true'
                    ? "X (Twitter) connected successfully! (Limited functionality on Free Plan)"
                    : "Account connected successfully!",
            });
            window.history.replaceState({}, '', '/dashboard/accounts');
        }
    }, [searchParams, toast]);

    return null;
}

interface ConnectedAccount {
    id: string;
    platform: string;
    accountName: string;
    accountType: string;
    username: string | null;
    avatarUrl: string | null;
    status: 'connected' | 'expired' | 'action_required';
    tokenExpiresAt: string | null;
    createdAt: string;
}

export default function AccountsPage() {
    const [connectedAccounts, setConnectedAccounts] = React.useState<ConnectedAccount[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isConnectDialogOpen, setIsConnectDialogOpen] = React.useState(false);
    const supabase = createClient();
    const { toast } = useToast();

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/accounts');
            if (response.ok) {
                const data = await response.json();
                setConnectedAccounts(data);
            } else {
                console.error("Failed to fetch accounts");
            }
        } catch (error) {
            console.error("Failed to fetch accounts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleConnect = async (platformId: string) => {
        if (['twitter', 'facebook', 'linkedin', 'instagram'].includes(platformId)) {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !session) {
                    alert("Please log in to connect accounts.");
                    return;
                }

                const targetProvider = platformId === 'instagram' ? 'facebook' : platformId;
                const response = await fetch(`/api/oauth/${targetProvider}/start`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Failed to start ${targetProvider} OAuth`);
                }

                const data = await response.json();
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    throw new Error("No redirect URL returned");
                }
            } catch (err: any) {
                console.error(`${platformId} Connect Error:`, err);
                toast({
                    variant: "destructive",
                    title: "Connection Failed",
                    description: err.message,
                });
            }
            return;
        }
        toast({
            title: "Coming Soon",
            description: `Platform ${platformId} not supported yet.`
        });
    };

    const handleDisconnect = async (accountId: string) => {
        if (!confirm("Are you sure you want to disconnect this account?")) return;

        try {
            const response = await fetch(`/api/accounts?id=${accountId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error("Failed to disconnect");

            setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountId));
            toast({
                title: "Account Disconnected",
                description: "The account has been successfully disconnected.",
            });
        } catch (err) {
            console.error("Disconnect error:", err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to disconnect account",
            });
        }
    };

    // Group accounts by platform for better visualization
    const groupedAccounts = platforms.map(p => ({
        ...p,
        accounts: connectedAccounts.filter(a => a.platform === p.id)
    })).filter(g => g.accounts.length > 0);

    return (
        <div className="flex flex-col gap-6">
            <Suspense fallback={null}>
                <AccountStatusListener />
            </Suspense>
            <PageHeader heading="Connected Accounts" text="Manage your social media connections and permissions.">
                <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Connect Account
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Connect a Social Account</DialogTitle>
                            <DialogDescription>Choose a platform to connect.</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            {platforms.map((platform) => (
                                <Button
                                    key={platform.id}
                                    variant="outline"
                                    className="h-24 flex flex-col gap-3 hover:bg-muted/50 transition-all"
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

            {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-[200px] w-full rounded-xl" />)}
                </div>
            ) : connectedAccounts.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed bg-muted/20">
                    <div className="p-4 bg-background rounded-full mb-4 shadow-sm">
                        <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">No accounts connected</h3>
                    <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                        Connect your social media profiles to start scheduling posts.
                    </p>
                    <Button onClick={() => setIsConnectDialogOpen(true)}>
                        Connect Your First Account
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-1">
                    {groupedAccounts.map(group => (
                        <div key={group.id} className="space-y-4">
                            <div className="flex items-center gap-2">
                                <group.icon className={cn("h-5 w-5", group.color)} />
                                <h3 className="text-lg font-semibold capitalize">{group.name}</h3>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {group.accounts.map(account => (
                                    <Card key={account.id} className="overflow-hidden">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/10 border-b">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="capitalize">{account.accountType}</Badge>
                                            </div>
                                            {account.status === 'connected' && (
                                                <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 shadow-none">Connected</Badge>
                                            )}
                                            {account.status === 'expired' && (
                                                <Badge variant="destructive" className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20 shadow-none">Expired</Badge>
                                            )}
                                            {account.status === 'action_required' && (
                                                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20 shadow-none">Check Permissions</Badge>
                                            )}
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                                    {account.avatarUrl ? (
                                                        <img src={account.avatarUrl} alt={account.accountName} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <group.icon className={cn("h-6 w-6 opacity-50", group.color)} />
                                                    )}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="font-semibold text-lg truncate" title={account.accountName}>{account.accountName}</p>
                                                    {account.username && <p className="text-sm text-muted-foreground truncate">@{account.username}</p>}
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="bg-muted/5 border-t p-3 flex justify-between">
                                            {account.status === 'expired' ? (
                                                <Button variant="default" size="sm" onClick={() => handleConnect(account.platform)}>
                                                    <RefreshCw className="mr-2 h-3 w-3" /> Reconnect
                                                </Button>
                                            ) : (
                                                <div />
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDisconnect(account.id)}
                                            >
                                                Disconnect
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
