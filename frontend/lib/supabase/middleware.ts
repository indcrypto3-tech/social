import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // 1. Define Public Routes
    const publicRoutes = [
        '/',
        '/login',
        '/register',
        '/signup',
        '/forgot-password',
        '/pricing',
        '/about',
        '/contact',
        '/privacy',
        '/terms',
        '/waitlist'
    ];

    const path = request.nextUrl.pathname;

    // Check if the current path is a public route or starts with /auth/ (for callbacks)
    const isPublicRoute = publicRoutes.includes(path) || path.startsWith('/auth/');

    // 2. Redirect logic
    if (!user && !isPublicRoute) {
        // User is NOT logged in and trying to access a protected route
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        // Optional: Add ?next= for redirect back after login
        url.searchParams.set('next', path);
        return NextResponse.redirect(url);
    }

    if (user && (path === '/login' || path === '/register' || path === '/signup')) {
        // User IS logged in but trying to access login/register
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    return response
}
