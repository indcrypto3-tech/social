import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    if (process.env.LAUNCH === 'OFF') {
        const path = request.nextUrl.pathname;
        const allowedPaths = ['/', '/waitlist', '/privacy', '/terms'];

        if (!allowedPaths.includes(path)) {
            return NextResponse.redirect(new URL('/waitlist', request.url));
        }
    }
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
