
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { acceptInvite } from '@/app/invite/actions';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';

// Define the shape of invite response
interface InviteData {
    email: string;
    role: string;
    teamName: string;
    expiresAt: string;
}

export default async function InvitePage({ params }: { params: { token: string } }) {
    const token = params.token;

    let invite: InviteData | null = null;
    try {
        // Fetch invite details from backend (Public API)
        invite = await apiClient<InviteData>(`/invites/${token}`);
    } catch (error) {
        // If 404 or other error, invite is null
        console.error("Failed to fetch invite:", error);
    }

    if (!invite) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Card className="w-[400px]">
                    <CardHeader>
                        <CardTitle className="text-red-600">Invalid Invite</CardTitle>
                        <CardDescription>
                            This invite link is invalid or has expired.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/">Go Home</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        const loginUrl = `/login?next=/invite/${token}`;
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Card className="w-[400px]">
                    <CardHeader>
                        <CardTitle>Join {invite.teamName}</CardTitle>
                        <CardDescription>
                            You've been invited to join <strong>{invite.teamName}</strong> as a <strong>{invite.role}</strong>.
                            Please login to accept.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href={loginUrl}>Login to Accept</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Check if email matches (optional safety)
    if (user.email && invite.email && user.email !== invite.email) {
        // You might want to allow this or warn. 
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Join Team</CardTitle>
                    <CardDescription>
                        You are accepting an invitation to join <strong>{invite.teamName}</strong>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={acceptInvite}>
                        <input type="hidden" name="token" value={token} />
                        <Button type="submit" className="w-full">
                            Accept Invitation
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm text-gray-500">
                        Logged in as {user.email || 'User'}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
