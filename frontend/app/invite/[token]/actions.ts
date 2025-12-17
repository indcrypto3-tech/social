
'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function acceptInvite(formData: FormData) {
    const token = formData.get('token') as string;

    if (!token) return;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    console.log("TODO: Move acceptInvite logic to Backend API");
    // const invite = await db.query...

    redirect('/team');
}
