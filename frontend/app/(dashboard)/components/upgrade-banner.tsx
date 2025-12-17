
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function UpgradeBanner({ className }: { className?: string }) {
    // In a real app, this would verify subscription status via prop or context
    // to avoid showing if already pro.
    // For now, we assume this is conditionally rendered by parent or shows always for free users.

    return (
        <Card className={cn("bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 overflow-hidden relative", className)}>
            <div className="absolute top-0 right-0 p-12 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <CardContent className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                        <Sparkles className="h-6 w-6 text-yellow-300" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Unlock Unlimited Power</h3>
                        <p className="text-purple-100 text-sm max-w-md">
                            Get unlimited posts, AI captions, team collaboration, and priority support with Pro.
                        </p>
                    </div>
                </div>
                <Button asChild variant="secondary" className="whitespace-nowrap font-semibold shadow-lg hover:shadow-xl transition-all">
                    <Link href="/billing?plan=pro">Upgrade to Pro</Link>
                </Button>
            </CardContent>
        </Card>
    );
}
