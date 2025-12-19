
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { db } from '@/lib/db';
import { teams, teamInvites } from '@/lib/db/schema';
import { checkPermission } from '@/lib/permissions';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { teamId, email, role } = body;

        if (!teamId || !email || !role) {
            return NextResponse.json({
                error: 'Missing required fields: teamId, email, role'
            }, { status: 400 });
        }

        // Validate role
        const validRoles = ['owner', 'editor', 'viewer'];
        if (!validRoles.includes(role)) {
            return NextResponse.json({
                error: 'Invalid role',
                validRoles
            }, { status: 400 });
        }

        // Check permission
        const canInvite = await checkPermission(user.id, teamId, 'canInvite');
        if (!canInvite) {
            return NextResponse.json({
                error: 'Insufficient permissions to invite members'
            }, { status: 403 });
        }

        // Verify team exists
        const team = await db.query.teams.findFirst({
            where: eq(teams.id, teamId)
        });

        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        // Generate unique token
        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        // Create invite
        const [invite] = await db.insert(teamInvites).values({
            teamId,
            email,
            role: role as any,
            token,
            expiresAt
        }).returning();

        // TODO: Send email with invite link
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/team/accept-invite?token=${token}`;

        console.log(`[TEAM_INVITE] Invite created for ${email} to team ${teamId}`);
        console.log(`[TEAM_INVITE] Link: ${inviteLink}`);

        return NextResponse.json({
            success: true,
            invite: {
                id: invite.id,
                email: invite.email,
                role: invite.role,
                expiresAt: invite.expiresAt,
                inviteLink
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Team invite error:', error);
        return NextResponse.json({
            error: 'Failed to create invite',
            details: error.message
        }, { status: 500 });
    }
}
