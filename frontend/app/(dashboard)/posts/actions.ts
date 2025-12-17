'use server';

import { apiClient } from '@/lib/api/client';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function getAuthHeaders() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');
    return { Authorization: `Bearer ${session.access_token}` };
}

// --- READ ---

export async function getScheduledPosts() {
    const headers = await getAuthHeaders();
    return await apiClient('/posts', { headers });
}

export async function getPostById(postId: string) {
    const headers = await getAuthHeaders();
    return await apiClient(`/posts/${postId}`, { headers });
}

// --- UPDATE ---

export async function updatePost(postId: string, data: { content?: string, scheduledAt?: Date }) {
    const headers = await getAuthHeaders();
    await apiClient(`/posts/${postId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data)
    });

    revalidatePath('/dashboard');
    revalidatePath('/calendar');
}

// --- DELETE ---

export async function deletePost(postId: string) {
    const headers = await getAuthHeaders();
    await apiClient(`/posts/${postId}`, {
        method: 'DELETE',
        headers
    });

    revalidatePath('/dashboard');
    revalidatePath('/calendar');
}

export async function reschedulePost(postId: string, newDate: Date) {
    const headers = await getAuthHeaders();
    await apiClient(`/posts/${postId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ scheduledAt: newDate, status: 'scheduled' })
    });

    revalidatePath('/dashboard');
    revalidatePath('/calendar');
    return { success: true };
}
