'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

export async function acceptInvite(formData: FormData) {
    const token = formData.get('token') as string;

    if (!token) return;

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    try {
        await apiClient(`/invites/${token}/accept`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        });
    } catch (error) {
        console.error("Failed to accept invite:", error);
        throw error; // Or handle gracefully
    }

    redirect('/team');
}
