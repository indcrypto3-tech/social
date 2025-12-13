
'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, ShieldCheck, UserX, Crown } from 'lucide-react';
import { RoleBadge } from './role-badge';
import { removeMember, updateMemberRole } from '../actions';
import { TransferOwnership } from './transfer-ownership';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { format } from 'date-fns';

type Member = {
    id: string; // member id
    userId: string;
    role: string;
    joinedAt: string | Date;
    user: {
        fullName: string | null;
        email: string;
        avatarUrl: string | null;
    };
};

export function MembersList({ members, currentUserId, currentUserRole }: { members: Member[]; currentUserId: string; currentUserRole: string }) {
    const { toast } = useToast();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [transferTarget, setTransferTarget] = useState<{ id: string; name: string } | null>(null);

    const isOwner = currentUserRole === 'owner';

    async function handleRemove(memberId: string) {
        if (!confirm('Are you sure you want to remove this member?')) return;
        setLoadingId(memberId);
        const res = await removeMember(memberId);
        setLoadingId(null);

        if (res?.error) {
            toast({
                title: 'Error',
                description: res.error,
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Success',
                description: 'Member removed successfully.',
            });
        }
    }



    async function handleRoleChange(memberId: string, newRole: 'owner' | 'editor' | 'viewer') {
        setLoadingId(memberId);
        const res = await updateMemberRole(memberId, newRole);
        setLoadingId(null);

        if (res?.error) {
            toast({
                title: 'Error',
                description: res.error,
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Success',
                description: 'Role updated successfully.',
            });
        }
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={member.user.avatarUrl || ''} />
                                        <AvatarFallback>{member.user.fullName?.charAt(0) || member.user.email?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{member.user.fullName || 'Unknown'}</span>
                                        <span className="text-xs text-muted-foreground">{member.user.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <RoleBadge role={member.role} />
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell>
                                    {isOwner && member.userId !== currentUserId && member.role !== 'owner' && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'editor')}>
                                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                                    Make Editor
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'viewer')}>
                                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                                    Make Viewer
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setTransferTarget({ id: member.id, name: member.user.fullName || member.user.email || 'Member' })}>
                                                    <Crown className="mr-2 h-4 w-4" />
                                                    Transfer Ownership
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleRemove(member.id)}>
                                                    <UserX className="mr-2 h-4 w-4" />
                                                    Remove from Team
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                    {member.role === 'owner' && <span className="text-xs text-muted-foreground">Owner</span>}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {transferTarget && (
                <TransferOwnership
                    isOpen={!!transferTarget}
                    onClose={() => setTransferTarget(null)}
                    memberId={transferTarget.id}
                    memberName={transferTarget.name}
                />
            )}
        </>
    );
}
