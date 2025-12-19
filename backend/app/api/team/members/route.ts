
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { db } from '@/lib/db';
import { teams, teamMembers, users } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';

export async function GET(req: Request) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const teamId = searchParams.get('teamId');

        if (!teamId) {
            return NextResponse.json({ error: 'Missing teamId parameter' }, { status: 400 });
        }

        // Verify user is part of the team
        const team = await db.query.teams.findFirst({
            where: eq(teams.id, teamId)
        });

        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        const isOwner = team.ownerId === user.id;
        const isMember = await db.query.teamMembers.findFirst({
            where: eq(teamMembers.userId, user.id)
        });

        if (!isOwner && !isMember) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Get all team members
        const members = await db.query.teamMembers.findMany({
            where: eq(teamMembers.teamId, teamId),
            with: {
                user: true
            }
        });

        // Include owner
        const owner = await db.query.users.findFirst({
            where: eq(users.id, team.ownerId)
        });

        const formattedMembers = [
            {
                id: owner?.id,
                userId: owner?.id,
                email: owner?.email,
                fullName: owner?.fullName,
                role: 'owner',
                joinedAt: team.createdAt,
                isOwner: true
            },
            ...members.map(m => ({
                id: m.id,
                userId: m.user.id,
                email: m.user.email,
                fullName: m.user.fullName,
                role: m.role,
                joinedAt: m.joinedAt,
                isOwner: false
            }))
        ];

        return NextResponse.json({
            teamId,
            teamName: team.name,
            members: formattedMembers,
            total: formattedMembers.length
        });

    } catch (error: any) {
        console.error('Get team members error:', error);
        return NextResponse.json({
            error: 'Failed to fetch team members',
            details: error.message
        }, { status: 500 });
    }
}
