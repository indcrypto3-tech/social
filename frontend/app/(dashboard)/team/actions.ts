
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { randomBytes } from 'crypto';
// import { sendEmail } from '@/lib/notifications/email';

// --- Helpers ---

// Stubbed for build pass
export async function getTeamForUser() {
    return { team: { id: 'stub', name: 'Stub Team', ownerId: 'stub' }, role: 'owner', userId: 'stub' };
}

export async function getTeamData() {
    // Stubbed
    return { team: { id: 'stub' }, members: [], invites: [], role: 'owner', userId: 'stub' };
}

// --- Actions ---


export async function inviteMember(formData: FormData) {
    console.log("TODO: Move to backend API");
    return { error: 'Not implemented (Backend Migration)' };
}

export async function removeMember(memberId: string) {
    console.log("TODO: Move to backend API");
    return { error: 'Not implemented (Backend Migration)' };
}

export async function updateMemberRole(memberId: string, newRole: 'owner' | 'editor' | 'viewer') {
    console.log("TODO: Move to backend API");
    return { error: 'Not implemented (Backend Migration)' };
}

export async function transferOwnership(memberId: string) {
    console.log("TODO: Move to backend API");
    return { error: 'Not implemented (Backend Migration)' };
}

export async function revokeInvite(inviteId: string) {
    console.log("TODO: Move to backend API");
    return { error: 'Not implemented (Backend Migration)' };
}
