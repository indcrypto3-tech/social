'use server';

import { apiClient } from "@/lib/api/client";

// import { Tone } from "@/lib/ai/caption-generator"; 

// Actually, Tone is an enum/type. If lib/ai is not in frontend, this import fails.
// I will define Tone locally or use string for now to avoid errors.


import { createClient } from "@/lib/supabase/server";

export async function getAccounts() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return await apiClient<any[]>('/accounts', {
        headers: {
            Authorization: `Bearer ${session?.access_token}`
        }
    });
}

export async function createPost(formData: FormData) {
    const content = formData.get('content') as string;
    const destinations = formData.getAll('accounts') as string[];
    const scheduledAtStr = formData.get('scheduledAt') as string;
    const mediaUrls = formData.getAll('mediaUrls') as string[];
    const status = formData.get('status') as string; // 'draft' | 'scheduled'

    const scheduledAt = scheduledAtStr ? new Date(scheduledAtStr) : undefined;

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    const payload: any = {
        content,
        destinations,
        mediaUrls
    };

    if (scheduledAt) {
        payload.scheduledAt = scheduledAt;
    }

    // API logic: If scheduledAt is present, it schedules. 
    // If we want explicit draft despite date, we might need a flag.
    // For now, let's assume if 'Save Draft' is clicked, we simply don't send scheduledAt.

    return await apiClient('/posts', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(payload)
    });
}

export async function postNow(postId: string) {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    return await apiClient(`/posts/${postId}/post-now`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${session?.access_token}`
        }
    });
}

// AI Actions

export async function generateCaptionAction(prompt: string, platform: string, tone: string) {
    return await apiClient<string>('/ai/generate-caption', {
        method: 'POST',
        body: JSON.stringify({ prompt, platform, tone })
    });
}

export async function generateHashtagsAction(caption: string, platform: string, niche: string) {
    return await apiClient<string[]>('/ai/generate-hashtags', {
        method: 'POST',
        body: JSON.stringify({ caption, platform, niche })
    });
}

export async function generateContentIdeasAction(niche: string) {
    return await apiClient<string[]>('/ai/generate-ideas', {
        method: 'POST',
        body: JSON.stringify({ niche })
    });
}
