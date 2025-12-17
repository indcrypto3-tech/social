
import { getTeamData } from './actions';
import { MembersList } from './components/members-list';
import { InviteMember } from './components/invite-member';
import { InvitesList } from './components/invites-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';

export default async function TeamPage() {
    let data;
    try {
        data = await getTeamData() as any;
    } catch (e) {
        // If not authenticated
        redirect('/login');
    }

    const { team, members, invites, role, userId } = data;
    const isOwner = role === 'owner';
    const isEditor = role === 'editor';
    const canInvite = isOwner; // Editors cannot invite in this spec ("Owner can: Invite users")

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Team Management</h2>
                {canInvite && <InviteMember />}
            </div>

            <Tabs defaultValue="members" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="members" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>
                                Manage your team members and their permissions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MembersList
                                members={members.map((m: any) => ({
                                    ...m,
                                    // Ensure joinedAt is string or Date as expected. Drizzle returns Date.
                                    joinedAt: m.joinedAt,
                                    // Fix nullable user properties if needed
                                    user: {
                                        fullName: m.user.fullName,
                                        email: m.user.email,
                                        avatarUrl: m.user.avatarUrl
                                    }
                                }))}
                                currentUserId={userId}
                                currentUserRole={role}
                            />

                            <InvitesList invites={invites} isOwner={isOwner} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Settings</CardTitle>
                            <CardDescription>
                                Manage team name and other configurations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Team Name</p>
                                <p className="text-sm text-gray-500">{team.name}</p>
                                {/* Add edit name form later if needed */}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
