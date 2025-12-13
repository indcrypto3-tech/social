'use server';

import { apiClient } from '@/lib/api/client';
import { createClient } from '@/lib/supabase/server';

export interface OnboardingProgress {
    hasConnectedAccount: boolean;
    hasCreatedPost: boolean;
    hasScheduledPost: boolean;
    isPro: boolean;
}

export async function getOnboardingProgress() {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return null;

        const data = await apiClient<OnboardingProgress>('/dashboard/onboarding', {
            headers: { Authorization: `Bearer ${session.access_token}` }
        });
        return data;
    } catch (error) {
        console.error("Failed to fetch onboarding progress:", error);
        return null;
    }
}
