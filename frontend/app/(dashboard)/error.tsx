'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log to reporting service here
        console.error(error);
    }, [error]);

    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm p-8 border-2 border-dashed border-red-500/20 rounded-xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                We couldn't load this section. This might be a temporary issue.
            </p>
            <div className="flex flex-col items-center gap-4">
                <Button
                    onClick={() => reset()}
                    size="sm"
                    variant="default"
                    className="gap-2"
                >
                    <RotateCcw className="h-4 w-4" />
                    Try Again
                </Button>
                <p className="text-xs text-muted-foreground">
                    If the problem persists, please contact support.
                </p>
            </div>
        </div>
    );
}
