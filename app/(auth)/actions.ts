'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '../../lib/supabase/server'
import { db } from '@/lib/db' // Adjust import path if needed
import { users } from '@/lib/db/schema' // Adjust import path if needed


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

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        console.error(error)
        redirect('/register?error=Could not create user')
    }

    // Sync with public.users table
    if (!error && data.email) { // signUp returns session/user if auto-confirm is on
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            try {
                await db.insert(users).values({
                    id: user.id, // Use the SAME ID
                    email: data.email,
                    fullName: data.options.data.full_name,
                });
            } catch (dbError) {
                console.error("Failed to sync user to DB:", dbError);
                // Don't crash auth flow, but log critical error
            }
        }
    }


    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
