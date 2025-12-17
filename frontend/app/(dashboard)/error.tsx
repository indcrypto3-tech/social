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
            <h3 className="text-lg font-semibold text-red-500 mb-2">Dashboard Error</h3>
            <p className="text-sm text-muted-foreground mb-6">
                {error.message || "We couldn't load this section of your dashboard."}
            </p>
            <Button
                onClick={() => reset()}
                size="sm"
                variant="secondary"
                className="gap-2"
            >
                <RotateCcw className="h-4 w-4" />
                Reload Section
            </Button>
        </div>
    );
}
