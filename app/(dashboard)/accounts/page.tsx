
"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const platforms = [
    {
        id: 'facebook',
        name: 'Facebook',
        color: 'bg-blue-600'
    },
    {
        id: 'instagram',
        name: 'Instagram',
        color: 'bg-pink-600'
    },
    {
        id: 'twitter',
        name: 'X (Twitter)',
        color: 'bg-black'
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        color: 'bg-blue-700'
    },
    {
        id: 'youtube',
        name: 'YouTube',
        color: 'bg-red-600'
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        color: 'bg-black'
    }
]

export default function AccountsPage() {
    const connectedAccounts: any[] = []; // Fetch from API later

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Connected Accounts</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Connect Account
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Connect a Social Account</DialogTitle>
                            <DialogDescription>
                                Choose a platform to connect to your scheduler.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            {platforms.map((platform) => (
                                <Button key={platform.id} variant="outline" className="h-24 flex flex-col gap-2 hover:bg-muted/50">
                                    <div className={`h-8 w-8 rounded-full ${platform.color}`} />
                                    {platform.name}
                                </Button>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {connectedAccounts.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
                    <div className="p-4 bg-muted rounded-full mb-4">
                        <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No accounts connected</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mt-2">
                        Connect your social media profiles to start scheduling posts across multiple platforms.
                    </p>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Map accounts */}
                </div>
            )}
        </div>
    );
}
