import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white p-6">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                404
            </h1>
            <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
            <p className="text-neutral-400 mb-8 text-center max-w-md">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link href="/dashboard">
                <Button variant="default" className="gap-2">
                    Go back home
                </Button>
            </Link>
        </div>
    );
}
