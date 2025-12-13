
'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { revokeInvite } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { RoleBadge } from './role-badge';
import { useState } from 'react';

type Invite = {
    id: string;
    email: string;
    role: string;
    expiresAt: string | Date;
    token: string;
};

export function InvitesList({ invites, isOwner }: { invites: Invite[]; isOwner: boolean }) {
    const { toast } = useToast();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    async function handleRevoke(id: string) {
        setLoadingId(id);
        const res = await revokeInvite(id);
        setLoadingId(null);

        if (res?.error) {
            toast({
                title: 'Error',
                description: res.error,
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Invite Revoked',
                description: 'The invitation has been cancelled.',
            });
        }
    }

    if (invites.length === 0) return null;

    return (
        <div className="space-y-4 mt-8">
            <h3 className="text-lg font-medium">Pending Invites</h3>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invites.map((invite) => (
                            <TableRow key={invite.id}>
                                <TableCell>{invite.email}</TableCell>
                                <TableCell>
                                    <RoleBadge role={invite.role} />
                                </TableCell>
                                <TableCell>{format(new Date(invite.expiresAt), 'MMM d, yyyy')}</TableCell>
                                <TableCell>
                                    {isOwner && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRevoke(invite.id)}
                                            disabled={loadingId === invite.id}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            {loadingId === invite.id ? '...' : <X className="h-4 w-4" />}
                                            <span className="sr-only">Revoke</span>
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
