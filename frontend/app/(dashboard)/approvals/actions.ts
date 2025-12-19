"use server";

import { apiClient } from "@/lib/api/client";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getPendingPosts() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Assuming backend filters by status='pending_approval' or we filter client side.
    // For now, let's fetch all and filter, or use a query param if backend supports it.
    // Let's assume backend supports ?status=pending_approval
    // If not, we might need to filter manually.
    try {
        const posts = await apiClient<any[]>('/posts', {
            headers: { Authorization: `Bearer ${session?.access_token}` }
        });
        return posts.filter((p: any) => p.status === 'pending_approval');
    } catch (e) {
        return [];
    }
}

export async function approvePost(postId: string) {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    try {
        await apiClient(`/posts/${postId}`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${session?.access_token}` },
            body: JSON.stringify({ status: 'scheduled' }) // Or 'published' if post now? Assume scheduled.
        });
        revalidatePath('/approvals');
        revalidatePath('/calendar');
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function rejectPost(postId: string) {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    try {
        await apiClient(`/posts/${postId}`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${session?.access_token}` },
            body: JSON.stringify({ status: 'draft' }) // Send back to draft
        });
        revalidatePath('/approvals');
    } catch (e: any) {
        return { error: e.message };
    }
}
