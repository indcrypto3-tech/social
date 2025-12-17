'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
            <div className="rounded-full bg-red-500/10 p-4 mb-4">
                <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Something went wrong!</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
                {error.message || 'An unexpected error occurred while loading this page.'}
            </p>
            <Button
                onClick={() => reset()}
                variant="outline"
            >
                Try again
            </Button>
        </div>
    );
}
