
import { NextResponse } from 'next/server';
import { getUser } from '@/middleware/auth';
import { db } from '@/lib/db';
import { teamMembers } from '@/lib/db/schema';
import { checkPermission } from '@/lib/permissions';
import { eq } from 'drizzle-orm';

export async function PUT(req: Request, { params }: { params: { memberId: string } }) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { memberId } = params;
        const body = await req.json();
        const { role } = body;

        if (!role) {
            return NextResponse.json({ error: 'Missing role' }, { status: 400 });
        }

        // Validate role
        const validRoles = ['editor', 'viewer'];
        if (!validRoles.includes(role)) {
            return NextResponse.json({
                error: 'Invalid role. Can only set editor or viewer',
                validRoles
            }, { status: 400 });
        }

        // Get member to find teamId
        const member = await db.query.teamMembers.findFirst({
            where: eq(teamMembers.id, memberId)
        });

        if (!member) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        // Check permission
        const canChangeRoles = await checkPermission(user.id, member.teamId, 'canChangeRoles');
        if (!canChangeRoles) {
            return NextResponse.json({
                error: 'Insufficient permissions to change member roles'
            }, { status: 403 });
        }

        // Update role
        await db.update(teamMembers)
            .set({ role: role as any })
            .where(eq(teamMembers.id, memberId));

        console.log(`[TEAM] Member ${memberId} role updated to ${role}`);

        return NextResponse.json({
            success: true,
            memberId,
            newRole: role
        });

    } catch (error: any) {
        console.error('Update member role error:', error);
        return NextResponse.json({
            error: 'Failed to update member role',
            details: error.message
        }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { memberId: string } }) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { memberId } = params;

        // Get member
        const member = await db.query.teamMembers.findFirst({
            where: eq(teamMembers.id, memberId)
        });

        if (!member) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        // Check permission
        const canRemove = await checkPermission(user.id, member.teamId, 'canRemoveMembers');
        if (!canRemove) {
            return NextResponse.json({
                error: 'Insufficient permissions to remove members'
            }, { status: 403 });
        }

        // Delete member
        await db.delete(teamMembers)
            .where(eq(teamMembers.id, memberId));

        console.log(`[TEAM] Member ${memberId} removed from team ${member.teamId}`);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Remove member error:', error);
        return NextResponse.json({
            error: 'Failed to remove member',
            details: error.message
        }, { status: 500 });
    }
}
