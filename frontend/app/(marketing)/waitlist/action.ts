'use server'

import { apiClient } from "@/lib/api/client";

export async function joinWaitlist(email: string) {
    try {
        await apiClient("/api/waitlist", {
            method: "POST",
            body: JSON.stringify({ email }),
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to join waitlist" };
    }
}
