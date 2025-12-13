'use server';

import { apiClient } from "@/lib/api/client";

// import { Tone } from "@/lib/ai/caption-generator"; 

// Actually, Tone is an enum/type. If lib/ai is not in frontend, this import fails.
// I will define Tone locally or use string for now to avoid errors.


export async function getAccounts() {
    return await apiClient<any[]>('/accounts');
}

export async function createPost(formData: FormData) {
    const content = formData.get('content') as string;
    const accountIds = formData.getAll('accounts') as string[];
    const scheduledAtStr = formData.get('scheduledAt') as string;

    const scheduledAt = scheduledAtStr ? new Date(scheduledAtStr) : new Date();

    return await apiClient('/posts', {
        method: 'POST',
        body: JSON.stringify({
            content,
            accountIds,
            scheduledAt
        })
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
