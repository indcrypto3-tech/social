
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co', // Matches any project ref
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
            }
        ]
    },
    async rewrites() {
        // SINGLE SERVER SETUP CONFIGURATION
        // The Frontend (Next.js) acts as a gateway.
        // All requests to /api/* are proxied to the Backend running locally on port 4000.

        // 1. BACKEND_INTERNAL_URL: Use if defined (e.g., http://backend:4000 for Docker)
        // 2. Fallback: http://localhost:4000 (Standard Local/VPS setup)
        // NOTE: We deliberately do NOT use NEXT_PUBLIC_API_BASE_URL here to avoid infinite loops 
        // if that variable points to this very frontend domain.
        const internalUrl = process.env.BACKEND_INTERNAL_URL || 'http://localhost:4000';

        // Strip trailing slash if present
        const backendBase = internalUrl.replace(/\/$/, "");

        return [
            {
                source: '/api/:path*',
                destination: `${backendBase}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;
