'use client';

import { useEffect } from 'react';

export default function GlobalError({
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
        <html>
            <body>
                <div className="flex bg-neutral-900 text-white min-h-screen flex-col items-center justify-center p-4">
                    <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
                    <p className="text-neutral-400 mb-6">Critical application error.</p>
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
