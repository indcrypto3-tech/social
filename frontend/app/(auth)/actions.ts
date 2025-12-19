'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
// import { apiClient } from '@/lib/api/client' // Use this if we had a sync endpoint ready
// For now, we will assume Supabase Webhooks handle user creation in DB,
// OR we should fire a fire-and-forget sync.
// Since I haven't implemented the sync endpoint yet, I'll comment it out to unblock build.

import { cookies } from 'next/headers'

// Helper to get Backend URL
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const SESSION_COOKIE_NAME = 'session_id';

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/login?error=Could not authenticate user')
    }

    if (authData.session?.access_token) {
        await finalizeLogin(authData.session.access_token);
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function finalizeLogin(accessToken: string) {
    try {
        const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookies().toString(), // Pass existing cookies just in case
            },
            body: JSON.stringify({ accessToken }), // Match docs: camelCase
        });

        if (!res.ok) {
            console.error('Failed to create backend session', await res.text());
            // Don't throw for now to allow partial login (Supabase only) if backend is down? 
            // OR strict: throw new Error('Backend sync failed');
            // Strict is better for "UI Architect" reliability.
            throw new Error('Failed to synchronize session');
        }

        const body = await res.json();
        const serverSession = body.session; // Docs say response has { session: { id, ... } }

        // If backend sets its own cookies via Set-Cookie header, Next.js Middleware/Server Action *should* handle it 
        // if we are proxying. But here we are making a side-channel request.
        // We need to manually set the cookie if the backend returned an ID or we rely on the header.
        // The previous code manually set it. Let's stick to that if backend returns ID.

        if (serverSession?.id) {
            cookies().set(SESSION_COOKIE_NAME, serverSession.id, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60, // 7 days (matching typical session)
                path: '/',
            });
        }
    } catch (e) {
        console.error("Error finalizing login:", e);
        // If backend sync fails, logout from supabase to avoid inconsistent state?
        // await supabase.auth.signOut();
        // throw e;
    }

    return { success: true };
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            data: {
                full_name: formData.get('fullName') as string,
            }
        }
    }

    const { data: authData, error } = await supabase.auth.signUp(data)

    if (error) {
        console.error("Signup Error:", error)
        redirect('/register?error=' + encodeURIComponent(error.message))
    }

    if (!authData.session) {
        redirect('/register?message=Account created! Please check your email to verify your account.')
    }

    // Auto-login after signup
    if (authData.session.access_token) {
        await finalizeLogin(authData.session.access_token);
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()

    // Call backend to destroy session
    try {
        await fetch(`${BACKEND_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Cookie': cookies().toString() // Important: Pass session cookie to backend
            }
        });
    } catch (e) {
        console.error("Failed to call backend logout", e);
    }

    cookies().delete(SESSION_COOKIE_NAME);

    revalidatePath('/', 'layout')
    redirect('/login')
}

export async function resetPassword(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    if (!email) {
        redirect('/forgot-password?error=Email is required')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`,
    })

    if (error) {
        redirect('/forgot-password?error=' + encodeURIComponent(error.message))
    }

    redirect('/forgot-password?message=Check your email for the password reset link')
}
