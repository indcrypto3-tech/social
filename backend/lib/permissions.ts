
import { db } from './db';
import { teams, teamMembers } from './db/schema';
import { eq, and } from 'drizzle-orm';

export type TeamRole = 'owner' | 'editor' | 'viewer';

export interface TeamPermissions {
    canInvite: boolean;
    canRemoveMembers: boolean;
    canChangeRoles: boolean;
    canCreatePosts: boolean;
    canEditPosts: boolean;
    canDeletePosts: boolean;
    canApprovePosts: boolean;
    canPublishPosts: boolean;
}

const ROLE_PERMISSIONS: Record<TeamRole, TeamPermissions> = {
    owner: {
        canInvite: true,
        canRemoveMembers: true,
        canChangeRoles: true,
        canCreatePosts: true,
        canEditPosts: true,
        canDeletePosts: true,
        canApprovePosts: true,
        canPublishPosts: true,
    },
    editor: {
        canInvite: false,
        canRemoveMembers: false,
        canChangeRoles: false,
        canCreatePosts: true,
        canEditPosts: true,
        canDeletePosts: false,
        canApprovePosts: true,
        canPublishPosts: true,
    },
    viewer: {
        canInvite: false,
        canRemoveMembers: false,
        canChangeRoles: false,
        canCreatePosts: false,
        canEditPosts: false,
        canDeletePosts: false,
        canApprovePosts: false,
        canPublishPosts: false,
    },
};

export function getPermissions(role: TeamRole): TeamPermissions {
    return ROLE_PERMISSIONS[role];
}

export async function getUserTeamRole(userId: string, teamId: string): Promise<TeamRole | null> {
    // Check if user is team owner
    const team = await db.query.teams.findFirst({
        where: eq(teams.id, teamId)
    });

    if (team?.ownerId === userId) {
        return 'owner';
    }

    // Check team membership
    const member = await db.query.teamMembers.findFirst({
        where: and(
            eq(teamMembers.teamId, teamId),
            eq(teamMembers.userId, userId)
        )
    });

    return member?.role as TeamRole || null;
}

export async function checkPermission(
    userId: string,
    teamId: string,
    permission: keyof TeamPermissions
): Promise<boolean> {
    const role = await getUserTeamRole(userId, teamId);
    if (!role) return false;

    const permissions = getPermissions(role);
    return permissions[permission];
}
