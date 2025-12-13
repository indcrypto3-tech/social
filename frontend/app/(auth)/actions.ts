'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
// import { apiClient } from '@/lib/api/client' // Use this if we had a sync endpoint ready
// For now, we will assume Supabase Webhooks handle user creation in DB,
// OR we should fire a fire-and-forget sync.
// Since I haven't implemented the sync endpoint yet, I'll comment it out to unblock build.

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/login?error=Could not authenticate user')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
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

    // Sync with public.users table (Removed direct DB access)
    // TODO: Implement backend webhook or API enpoint for user sync
    /* 
    if (!error && data.email) {
       await apiClient.post('/auth/sync', { email: data.email, ... })
    }
    */

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
