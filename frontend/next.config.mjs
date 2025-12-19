
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
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
        const backendUrl = apiUrl.replace('/api', ''); // Extract base URL if it includes /api

        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/api/:path*`, // Proxy to Backend
            },
        ];
    },
};

export default nextConfig;
